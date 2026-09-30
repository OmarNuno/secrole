/**
 * SecRole — check-role-drift.js (v2)
 *
 * Keeps src/data/roles.js aligned with Microsoft's official Entra and Purview
 * role lists. New entries are drafted from current Microsoft documentation,
 * validated structurally, reviewed against deterministic risk guardrails, and
 * proposed through a human-reviewed pull request.
 *
 * Local modes:
 *   node scripts/check-role-drift.js --validate-only
 *   node scripts/check-role-drift.js --dry-run
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { formatValidationReport, validateRolesFile } from "./role-data-validation.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROLES_PATH = join(__dirname, "..", "src", "data", "roles.js");
const IGNORE_PATH = join(__dirname, "role-drift-ignore.json");
const PR_BODY_PATH = process.env.DRIFT_PR_BODY || "/tmp/drift-pr-body.md";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = "claude-haiku-4-5-20251001";
const DRAFT_CAP = Number(process.env.DRIFT_DRAFT_CAP || 15);
const CLI_ARGS = new Set(process.argv.slice(2));
const VALIDATE_ONLY = CLI_ARGS.has("--validate-only");
const DRY_RUN = CLI_ARGS.has("--dry-run");

const ENTRA_ROLES_RAW =
  "https://raw.githubusercontent.com/MicrosoftDocs/entra-docs/main/docs/identity/role-based-access-control/permissions-reference.md";
const ENTRA_ROLE_INCLUDE = (slug) =>
  `https://raw.githubusercontent.com/MicrosoftDocs/entra-docs/main/docs/identity/role-based-access-control/includes/${slug}.md`;
const ENTRA_ROLES_PAGE =
  "https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference";
const PURVIEW_ROLES_RAW_URLS = [
  "https://raw.githubusercontent.com/MicrosoftDocs/defender-docs/main/defender-office-365/scc-permissions.md",
  "https://raw.githubusercontent.com/MicrosoftDocs/defender-docs/public/defender-office-365/scc-permissions.md",
];
const PURVIEW_ROLES_PAGE =
  "https://learn.microsoft.com/en-us/defender-office-365/scc-permissions";

const FETCH_HEADERS = {
  "User-Agent": "SecRole-RoleDriftBot/2.0 (+https://www.secrole.com)",
  Accept: "text/markdown, text/plain, */*",
};

const RISK_RANK = { Low: 0, Medium: 1, High: 2, Critical: 3 };

async function fetchWithTimeout(url, ms = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const response = await fetch(url, {
      headers: FETCH_HEADERS,
      signal: controller.signal,
      redirect: "follow",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response;
  } finally {
    clearTimeout(timer);
  }
}

function normName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/gi, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      if (["administrators", "administrator", "admins", "admin"].includes(token)) return "admin";
      return token.length > 3 && token.endsWith("s") ? token.slice(0, -1) : token;
    })
    .join("");
}

function parseRolesJs(source) {
  const entries = [...source.matchAll(
    /\{\s*id:\s*"([ep][\w]*)",\s*name:\s*"((?:[^"\\]|\\.)*)",\s*product:\s*"(Entra|Purview)",\s*category:\s*"([^"]+)",\s*risk:\s*"([^"]+)"/g,
  )].map((match) => ({
    id: match[1],
    name: match[2].replace(/\\"/g, '"'),
    product: match[3],
    category: match[4],
    risk: match[5],
  }));

  const nextId = (prefix) => {
    const numbers = entries
      .filter((entry) => entry.id.startsWith(prefix))
      .map((entry) => Number.parseInt(entry.id.slice(1), 10))
      .filter(Number.isFinite);
    return Math.max(0, ...numbers) + 1;
  };

  const categories = (product) =>
    [...new Set(entries.filter((entry) => entry.product === product).map((entry) => entry.category))].sort();

  return {
    entries,
    nextEntraId: nextId("e"),
    nextPurviewId: nextId("p"),
    categories,
  };
}

function parseEntraDoc(markdown) {
  return [...markdown.matchAll(
    /^> \| \[([^\]]+)\]\(#([^)]+)\)\s*\|\s*([\s\S]*?)\s*\|\s*([0-9a-f-]{36})\s*\|$/gm,
  )].map((match) => ({
    name: match[1].trim(),
    slug: match[2].trim(),
    description: match[3].replace(/<br\/?>[\s\S]*$/, "").trim(),
    templateId: match[4],
    privileged: match[3].includes("privileged-label"),
  }));
}

function parsePurviewDoc(markdown) {
  const parseTable = (section, kind) =>
    [...section.matchAll(/^\|\*\*([^*]+)\*\*[^|]*\|([^|]+)\|([^|]*)\|$/gm)].map((match) => ({
      name: match[1].trim(),
      description: match[2].trim(),
      defaultRoles: match[3].replace(/<br\s*\/?><br\s*\/?>/g, ", ").trim(),
      kind,
    }));

  const groupsSection = (markdown.split(/^## Role groups in Microsoft Defender/m)[1] || "")
    .split(/^## Roles in Microsoft Defender/m)[0];
  const rolesSection = markdown.split(/^## Roles in Microsoft Defender/m)[1] || "";

  return {
    roleGroups: parseTable(groupsSection, "role group"),
    roles: parseTable(rolesSection, "role"),
  };
}

function loadIgnoreList() {
  if (!existsSync(IGNORE_PATH)) return { entra: [], purview: [] };
  try {
    const parsed = JSON.parse(readFileSync(IGNORE_PATH, "utf8"));
    return { entra: parsed.entra || [], purview: parsed.purview || [] };
  } catch {
    console.error(`⚠️  ${IGNORE_PATH} is not valid JSON — treating it as empty.`);
    return { entra: [], purview: [] };
  }
}

function computeDrift({ myRoles, entraOfficial, purview, entraDocText, purviewDocText, ignore }) {
  const mineEntra = new Set(myRoles.filter((role) => role.product === "Entra").map((role) => normName(role.name)));
  const minePurview = new Set(myRoles.filter((role) => role.product === "Purview").map((role) => normName(role.name)));
  const ignoreEntra = new Set(ignore.entra.map(normName));
  const ignorePurview = new Set(ignore.purview.map(normName));
  const isDeprecated = (description) => /^don'?t use/i.test(description || "");

  const missingEntra = entraOfficial.filter(
    (role) => !mineEntra.has(normName(role.name)) && !ignoreEntra.has(normName(role.name)),
  );
  const purviewCandidates = purview.roleGroups.filter(
    (role) => !minePurview.has(normName(role.name)) && !ignorePurview.has(normName(role.name)),
  );
  const missingPurview = purviewCandidates.filter((role) => !isDeprecated(role.description));
  const skippedDeprecated = purviewCandidates.filter((role) => isDeprecated(role.description));

  const officialEntraSet = new Set(entraOfficial.map((role) => normName(role.name)));
  const officialPurviewSet = new Set([...purview.roleGroups, ...purview.roles].map((role) => normName(role.name)));
  const retired = myRoles.filter((role) => {
    const inList = role.product === "Entra"
      ? officialEntraSet.has(normName(role.name))
      : officialPurviewSet.has(normName(role.name));
    if (inList) return false;
    const document = role.product === "Entra" ? entraDocText : purviewDocText;
    return !document.toLowerCase().includes(role.name.toLowerCase());
  });

  return { missingEntra, missingPurview, skippedDeprecated, retired };
}

function riskBelow(actual, minimum) {
  return (RISK_RANK[actual] ?? -1) < (RISK_RANK[minimum] ?? 99);
}

export function evaluateRiskGuardrails(draft) {
  const capabilityText = [
    draft.name,
    draft.description,
    draft.permissions,
    draft.officialDocumentation,
  ].filter(Boolean).join(" ").toLowerCase();
  const flags = [];

  const add = (code, minimum, message) => {
    if (!flags.some((flag) => flag.code === code)) {
      flags.push({ code, suggestedMinimumRisk: minimum, message });
    }
  };

  if (draft.privileged && riskBelow(draft.risk, "High")) {
    add("privileged-role-understated", "High", "Microsoft marks this role privileged, but the proposed risk is below High.");
  }

  if (
    /(assign|grant|remove|manage|elevat)[^.]{0,45}(directory |entra |privileged )?roles?|role assignments?|global administrator|privileged identity management/.test(capabilityText)
    && riskBelow(draft.risk, "High")
  ) {
    add("privilege-management-understated", "High", "The official capability appears to manage or escalate privileged role access.");
  }

  if (
    /(conditional access|authentication methods?|password reset|credentials?|client secrets?|certificates?|federation|domains?|oauth consent|admin consent|identity protection|security policies?|security configuration)/.test(capabilityText)
    && /(manage|create|update|modify|delete|reset|configure|approve|grant|write)/.test(capabilityText)
    && riskBelow(draft.risk, "High")
  ) {
    add("identity-security-write-understated", "High", "The role appears to modify identity, authentication, credential, consent, or security-critical configuration.");
  }

  const broadScope = /(tenant-wide|organization-wide|all users|all mailboxes|all sites|all microsoft 365|sharepoint|onedrive|exchange|teams)/.test(capabilityText);
  const sensitiveContent = /(email|mailbox|messages?|chats?|documents?|files?|content|communications?|evidence|investigation data|personal data|user activity)/.test(capabilityText);
  const readCapability = /(read|view|access|search|export|discover|inspect)/.test(capabilityText);
  if (broadScope && sensitiveContent && readCapability && riskBelow(draft.risk, "High")) {
    add("sensitive-content-access-understated", "High", "Broad read access to tenant content, communications, evidence, or personal data can have High confidentiality impact.");
  }

  if (
    /(sensitive metadata|identity data|audit logs?|sign-in logs?|security alerts?|risk detections?|configuration visibility)/.test(capabilityText)
    && riskBelow(draft.risk, "Medium")
  ) {
    add("sensitive-metadata-understated", "Medium", "Broad sensitive metadata or security evidence should not be treated as narrow low-impact visibility.");
  }

  if (
    draft.risk === "Low"
    && /(create|update|modify|delete|manage|configure|approve|release|restore|purge|write|assign|reset)/.test(capabilityText)
  ) {
    add("write-capability-rated-low", "Medium", "The draft contains a meaningful write or approval capability but is rated Low.");
  }

  if (String(draft.riskRationale || "").trim().length < 30) {
    add("weak-risk-rationale", draft.risk || "Medium", "Risk rationale is too short to support efficient human review.");
  }

  return flags;
}

function sampleEntries(rolesSource, product, count = 3) {
  const prefix = product === "Entra" ? "e" : "p";
  const lines = rolesSource
    .split("\n")
    .filter((line) => new RegExp(`^\\s*\\{ id:\"${prefix}[\\w]*\",`).test(line));
  const picks = [lines[0], lines[Math.floor(lines.length / 2)], lines[lines.length - 1]].filter(Boolean);
  return picks.slice(0, count).join("\n");
}

async function draftWithClaude({ toDraft, myRoles, rolesSource, categories }) {
  const roleOptions = [
    ...myRoles.map((role) => `${role.id}=${role.name}`),
    ...toDraft.map((role) => `${role.proposedId}=${role.name} [new in this same batch]`),
  ].join("; ");

  const prompt = `You are the content author for SecRole (secrole.com), a Microsoft Entra ID and Microsoft Purview RBAC role reference for IT administrators, security engineers, and compliance officers.

Below are NEW official Microsoft roles missing from SecRole. Every draft must be grounded only in the official Microsoft text supplied for that role.

HOUSE STYLE — match these existing entries in tone, length, and field usage:
${sampleEntries(rolesSource, "Entra")}
${sampleEntries(rolesSource, "Purview")}

RULES:
1. "name" must EXACTLY match the official name. Never rename it.
2. "description": 1-2 plain-English sentences based only on the supplied official text.
3. "permissions": one specific sentence describing what the role can actually do, based only on the supplied official text.
4. "leastPrivilege": practical assignment guidance. State plainly when Microsoft marks a role privileged, deprecated, restricted, or not intended for general use.
5. "risk" rubric:
   - Critical: tenant takeover, role escalation, control of privileged authentication/credentials, or equivalent persistent control.
   - High: broad write access to identity, security, compliance, or data-protection controls; OR tenant-wide access to sensitive content, communications, investigation evidence, or identity data even when read-only.
   - Medium: meaningful scoped write access, broad configuration visibility, or access to sensitive metadata.
   - Low: narrow operational visibility, aggregate reporting, or low-impact metadata with limited blast radius.
6. "riskRationale": one concise sentence explaining the chosen risk from the official capability and data sensitivity. This is required for human review.
7. "category" must be one existing category for the product. Entra: [${categories("Entra").join(", ")}]. Purview: [${categories("Purview").join(", ")}].
8. "tags": 3-4 lowercase kebab-case search keywords.
9. "relatedRoles": 1-3 IDs chosen only from this list: ${roleOptions}
   Same-batch IDs are allowed. Do not reference the role's own proposed ID. Prefer roles from the same product and real functional families.
10. Respond with ONLY a valid JSON array, one object per input role and in the same order:
{"officialName":"...","product":"Entra|Purview","name":"...","category":"...","risk":"Critical|High|Medium|Low","riskRationale":"...","description":"...","permissions":"...","leastPrivilege":"...","tags":[...],"relatedRoles":[...]}

NEW ROLES TO DRAFT:
${JSON.stringify(toDraft, null, 1)}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 10000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Anthropic API ${response.status}: ${body.slice(0, 300)}`);
  }

  const data = await response.json();
  const text = (data.content || [])
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .replace(/```json|```/g, "")
    .trim();
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error("Claude did not return a JSON array.");
  return parsed;
}

function validateDrafts(drafts, toDraft, myRoles, categories) {
  const existingById = new Map(myRoles.map((role) => [role.id, role]));
  const plannedById = new Map(toDraft.map((role) => [role.proposedId, role]));
  const expectedByName = new Map(toDraft.map((role) => [normName(role.name), role]));
  const validRisk = new Set(["Critical", "High", "Medium", "Low"]);
  const seenNames = new Set();
  const output = [];

  for (const draft of drafts) {
    const source = expectedByName.get(normName(draft.name || ""));
    if (!source) {
      console.error(`   ⚠️  Dropping draft with unexpected name: "${draft.name}"`);
      continue;
    }
    if (seenNames.has(normName(source.name))) {
      console.error(`   ⚠️  Dropping duplicate draft for "${source.name}".`);
      continue;
    }
    seenNames.add(normName(source.name));

    if (!validRisk.has(draft.risk)) {
      console.error(`   ⚠️  Dropping "${source.name}" — invalid risk "${draft.risk}".`);
      continue;
    }
    if (!categories(source.product).includes(draft.category)) {
      console.error(`   ⚠️  Dropping "${source.name}" — invalid category "${draft.category}".`);
      continue;
    }
    if (!draft.description || !draft.permissions || !draft.leastPrivilege || !draft.riskRationale) {
      console.error(`   ⚠️  Dropping "${source.name}" — missing description, permissions, leastPrivilege, or riskRationale.`);
      continue;
    }

    const productPrefix = source.product === "Entra" ? "e" : "p";
    const relatedRoles = [...new Set(draft.relatedRoles || [])]
      .filter((id) => {
        if (id === source.proposedId) return false;
        const related = existingById.get(id) || plannedById.get(id);
        return related && related.product === source.product && String(id).startsWith(productPrefix);
      })
      .slice(0, 3);

    const normalizedTags = [...new Set((draft.tags || [])
      .map((tag) => String(tag).trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-"))
      .filter(Boolean))]
      .slice(0, 4);

    const validated = {
      ...draft,
      id: source.proposedId,
      name: source.name,
      product: source.product,
      tags: normalizedTags,
      relatedRoles,
      sourceUrl: source.url,
      privileged: source.privileged || false,
      officialDocumentation: source.officialDocumentation,
    };
    validated.reviewFlags = evaluateRiskGuardrails(validated);
    output.push(validated);
  }

  const survivingIds = new Set([...existingById.keys(), ...output.map((draft) => draft.id)]);
  for (const draft of output) {
    draft.relatedRoles = draft.relatedRoles.filter((id) => survivingIds.has(id));
    for (const flag of draft.reviewFlags) {
      console.error(`   ⚠️  ${draft.id} ${draft.name}: ${flag.message}`);
    }
  }

  return output;
}

function formatEntry(id, draft) {
  const quote = (value) => JSON.stringify(String(value));
  const array = (values) => `[${values.map((value) => JSON.stringify(String(value))).join(",")}]`;
  return `  { id:${quote(id)}, name:${quote(draft.name)}, product:${quote(draft.product)}, category:${quote(draft.category)}, risk:${quote(draft.risk)}, description:${quote(draft.description)}, permissions:${quote(draft.permissions)}, leastPrivilege:${quote(draft.leastPrivilege)}, tags:${array(draft.tags)}, relatedRoles:${array(draft.relatedRoles)} },`;
}

function insertIntoArray(source, arrayName, lines) {
  if (!lines.length) return source;
  const start = source.indexOf(`export const ${arrayName}`);
  if (start === -1) throw new Error(`Could not find ${arrayName} in roles.js.`);
  const close = source.indexOf("\n];", start);
  if (close === -1) throw new Error(`Could not find the end of ${arrayName} in roles.js.`);
  return source.slice(0, close) + "\n" + lines.join("\n") + source.slice(close);
}

async function validateRolesJs(path) {
  const result = await validateRolesFile(path);
  console.log(formatValidationReport(result));
  if (result.errors.length) {
    throw new Error(`roles.js failed validation with ${result.errors.length} error(s).`);
  }
  return result.counts;
}

function markdownCell(value) {
  return String(value ?? "—")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, "<br>");
}

function buildPrBody({ added, deferred, skippedDeprecated, retired, counts }) {
  const riskIcon = { Critical: "🔴", High: "🟠", Medium: "🟡", Low: "🟢" };
  const lines = [];
  lines.push("## 🤖 Role drift detected — official Microsoft roles drafted for human review");
  lines.push("");
  lines.push("Drafts were produced from Microsoft documentation fetched during this run. The automation validates structure and highlights suspicious risk combinations, but a human reviewer must still confirm every role before merge.");
  lines.push("");
  lines.push(`**Sources:** [Entra built-in roles](${ENTRA_ROLES_PAGE}) · [Purview roles and role groups](${PURVIEW_ROLES_PAGE})`);

  if (added.length) {
    lines.push("");
    lines.push("### Added in this PR");
    lines.push("");
    lines.push("| ID | Role | Product | Proposed risk | Risk rationale | Automated review flags | Privileged | Category | Source |");
    lines.push("|---|---|---|---|---|---|---|---|---|");
    for (const role of added) {
      const flags = role.reviewFlags.length
        ? role.reviewFlags.map((flag) => `⚠️ ${flag.message} Suggested minimum: **${flag.suggestedMinimumRisk}**.`).join("<br>")
        : "—";
      lines.push(`| \`${role.id}\` | ${markdownCell(role.name)} | ${role.product} | ${riskIcon[role.risk] || ""} ${role.risk} | ${markdownCell(role.riskRationale)} | ${markdownCell(flags)} | ${role.privileged ? "Yes 🔒" : "No"} | ${markdownCell(role.category)} | [Microsoft](${role.sourceUrl}) |`);
    }
  } else {
    lines.push("");
    lines.push("No role additions were drafted in this run.");
  }

  lines.push("");
  lines.push("### Reviewer checklist");
  lines.push("");
  lines.push("- [ ] Official role name and product match the cited Microsoft source.");
  lines.push("- [ ] Description and permissions are specific and supported by the source text.");
  lines.push("- [ ] Risk reflects both administrative capability **and data sensitivity**; read-only does not automatically mean Low.");
  lines.push("- [ ] Privileged status was verified against Microsoft documentation.");
  lines.push("- [ ] Least-privilege guidance is practical and calls out PIM, scope, or restrictions where relevant.");
  lines.push("- [ ] Related roles are accurate, including any newly drafted roles in this same batch.");
  lines.push("- [ ] Deprecated, reserved, or not-for-general-use roles are identified clearly.");

  if (deferred.length) {
    lines.push("");
    lines.push(`### Deferred to later runs (draft cap: ${DRAFT_CAP})`);
    lines.push("");
    for (const role of deferred) lines.push(`- ${role.name} (${role.product})`);
  }
  if (skippedDeprecated.length) {
    lines.push("");
    lines.push("### Skipped — Microsoft marks these roles \"Don't use\"");
    lines.push("");
    for (const role of skippedDeprecated) lines.push(`- ${role.name} (Purview)`);
    lines.push("");
    lines.push("Add an intentionally excluded name to `scripts/role-drift-ignore.json` to stop future alerts.");
  }
  if (retired.length) {
    lines.push("");
    lines.push("### ⚠️ Possibly retired or renamed");
    lines.push("");
    for (const role of retired) lines.push(`- \`${role.id}\` ${role.name} (${role.product}) — verify manually; the automation never deletes roles.`);
  }

  lines.push("");
  lines.push(`_Catalog after this draft: **${counts.entra}** Entra + **${counts.purview}** Purview roles._`);
  lines.push("");
  lines.push("---");
  lines.push("_Nothing is published until a human merges this pull request._");
  return lines.join("\n");
}

function buildDryRunReport({ missingEntra, missingPurview, skippedDeprecated, retired }) {
  const lines = [];
  lines.push("# SecRole role-drift dry run");
  lines.push("");
  lines.push(`Missing Entra roles: ${missingEntra.length}`);
  lines.push(`Missing Purview role groups: ${missingPurview.length}`);
  lines.push(`Deprecated Purview groups skipped: ${skippedDeprecated.length}`);
  lines.push(`Possibly retired or renamed SecRole entries: ${retired.length}`);

  if (missingEntra.length || missingPurview.length) {
    lines.push("");
    lines.push("## Missing official roles");
    lines.push("");
    lines.push("| Role | Product | Privileged | Source |");
    lines.push("|---|---|---|---|");
    for (const role of missingEntra) {
      lines.push(`| ${markdownCell(role.name)} | Entra | ${role.privileged ? "Yes" : "No"} | [Microsoft](${ENTRA_ROLES_PAGE}#${role.slug}) |`);
    }
    for (const role of missingPurview) {
      lines.push(`| ${markdownCell(role.name)} | Purview | Not indicated | [Microsoft](${PURVIEW_ROLES_PAGE}) |`);
    }
  }

  if (retired.length) {
    lines.push("");
    lines.push("## Possibly retired or renamed");
    lines.push("");
    for (const role of retired) lines.push(`- ${role.id} ${role.name} (${role.product})`);
  }

  lines.push("");
  lines.push("Dry run only: roles.js was not modified and no AI drafting call was made.");
  return lines.join("\n");
}

async function fetchOfficialDocuments() {
  console.log("📡 Fetching official Microsoft role lists…");
  const entraDocText = await (await fetchWithTimeout(ENTRA_ROLES_RAW)).text();
  let purviewDocText = "";
  for (const url of PURVIEW_ROLES_RAW_URLS) {
    try {
      purviewDocText = await (await fetchWithTimeout(url)).text();
      break;
    } catch (error) {
      console.error(`⚠️  Purview doc failed at ${url}: ${error.message} — trying the next URL.`);
    }
  }
  if (!purviewDocText) throw new Error("Could not fetch the Purview roles document from any configured URL.");
  return { entraDocText, purviewDocText };
}

async function main() {
  if (VALIDATE_ONLY) {
    const result = await validateRolesFile(ROLES_PATH);
    console.log(formatValidationReport(result));
    if (result.errors.length) process.exitCode = 1;
    return;
  }

  const { entraDocText, purviewDocText } = await fetchOfficialDocuments();
  const entraOfficial = parseEntraDoc(entraDocText);
  const purview = parsePurviewDoc(purviewDocText);
  if (entraOfficial.length < 50 || purview.roleGroups.length < 20) {
    throw new Error(`Parsed suspiciously few official roles (Entra: ${entraOfficial.length}, Purview groups: ${purview.roleGroups.length}). The Microsoft document format may have changed.`);
  }

  const rolesSource = readFileSync(ROLES_PATH, "utf8");
  const { entries: myRoles, nextEntraId, nextPurviewId, categories } = parseRolesJs(rolesSource);
  const ignore = loadIgnoreList();
  const drift = computeDrift({
    myRoles,
    entraOfficial,
    purview,
    entraDocText,
    purviewDocText,
    ignore,
  });

  console.log(`   Official: ${entraOfficial.length} Entra roles | ${purview.roleGroups.length} Purview role groups (+${purview.roles.length} individual roles)`);
  console.log(`   SecRole:  ${myRoles.filter((role) => role.product === "Entra").length} Entra | ${myRoles.filter((role) => role.product === "Purview").length} Purview`);
  console.log(`🔍 Drift: +${drift.missingEntra.length} Entra, +${drift.missingPurview.length} Purview${drift.retired.length ? ` | ${drift.retired.length} possibly retired` : ""}`);

  if (DRY_RUN) {
    const report = buildDryRunReport(drift);
    console.log(report);
    if (process.env.DRIFT_PR_BODY) writeFileSync(PR_BODY_PATH, report);
    return;
  }

  if (!drift.missingEntra.length && !drift.missingPurview.length && !drift.retired.length) {
    console.log("✓ roles.js is in sync with the official Microsoft role lists.");
    return;
  }

  const allMissing = [
    ...drift.missingEntra.map((role) => ({ ...role, product: "Entra" })),
    ...drift.missingPurview.map((role) => ({ ...role, product: "Purview" })),
  ];
  const rawBatch = allMissing.slice(0, DRAFT_CAP);
  const deferred = allMissing.slice(DRAFT_CAP);
  let nextE = nextEntraId;
  let nextP = nextPurviewId;
  const batch = rawBatch.map((role) => ({
    ...role,
    proposedId: role.product === "Entra" ? `e${nextE++}` : `p${nextP++}`,
  }));

  let added = [];
  if (batch.length) {
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is required to draft new roles. Use --dry-run for discovery without AI.");
    }

    console.log(`📄 Fetching official permission details for ${batch.length} role(s)…`);
    const toDraft = [];
    for (const role of batch) {
      if (role.product === "Entra") {
        let officialDocumentation = role.description;
        try {
          const includeText = await (await fetchWithTimeout(ENTRA_ROLE_INCLUDE(role.slug))).text();
          officialDocumentation = includeText.replace(/^---[\s\S]*?---/, "").trim().slice(0, 4500);
        } catch (error) {
          console.error(`   ⚠️  Include for "${role.name}" unavailable (${error.message}); using the official table description.`);
        }
        toDraft.push({
          proposedId: role.proposedId,
          product: "Entra",
          name: role.name,
          privileged: role.privileged,
          url: `${ENTRA_ROLES_PAGE}#${role.slug}`,
          officialDocumentation,
        });
      } else {
        toDraft.push({
          proposedId: role.proposedId,
          product: "Purview",
          name: role.name,
          privileged: false,
          url: PURVIEW_ROLES_PAGE,
          officialDocumentation: `${role.description}\n\nDefault roles assigned to this role group: ${role.defaultRoles}`.slice(0, 4500),
        });
      }
    }

    console.log(`🤖 Drafting ${toDraft.length} entries with ${MODEL}…`);
    const rawDrafts = await draftWithClaude({ toDraft, myRoles, rolesSource, categories });
    const drafts = validateDrafts(rawDrafts, toDraft, myRoles, categories);
    if (!drafts.length) throw new Error("No drafts survived validation; roles.js was not modified.");

    const entraLines = [];
    const purviewLines = [];
    for (const draft of drafts) {
      const line = formatEntry(draft.id, draft);
      (draft.product === "Entra" ? entraLines : purviewLines).push(line);
      added.push(draft);
    }

    let patched = insertIntoArray(rolesSource, "ENTRA_ROLES", entraLines);
    patched = insertIntoArray(patched, "PURVIEW_ROLES", purviewLines);
    writeFileSync(ROLES_PATH, patched);
  }

  const counts = await validateRolesJs(ROLES_PATH);
  writeFileSync(PR_BODY_PATH, buildPrBody({
    added,
    deferred,
    skippedDeprecated: drift.skippedDeprecated,
    retired: drift.retired,
    counts,
  }));
  console.log(`📝 Review report written to ${PR_BODY_PATH}`);
  console.log(`   Added: ${added.map((role) => `${role.id} ${role.name}`).join(", ") || "none"}`);
}

const invokedDirectly = process.argv[1]
  && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (invokedDirectly) {
  main().catch((error) => {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  });
}
