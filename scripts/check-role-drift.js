/**
 * SecRole — check-role-drift.js  (v1)
 * Runs weekly via GitHub Actions. Zero npm dependencies (Node 20+ native fetch).
 *
 * Purpose: keep src/data/roles.js in sync with Microsoft's official role lists.
 *
 * Pipeline:
 *   1. Fetch the canonical role lists from public MicrosoftDocs repos:
 *      - Entra built-in roles: permissions-reference.md (entra-docs repo, raw markdown)
 *      - Purview role groups: scc-permissions.md (defender-docs repo, raw markdown)
 *   2. Diff official role names against roles.js (fuzzy: plural/Admin-variant tolerant),
 *      minus anything listed in scripts/role-drift-ignore.json.
 *   3. If drift is found, fetch each new role's official permission details and have
 *      Claude (Haiku) draft complete roles.js entries in SecRole's house style.
 *   4. Patch src/data/roles.js (validated by re-importing it) and write a PR body to
 *      $DRIFT_PR_BODY — the workflow turns the working-tree change into a pull request.
 *
 * Claude NEVER invents role facts — drafts are grounded in the fetched Microsoft docs,
 * names must match the official list exactly, and relatedRoles are validated against
 * IDs that actually exist in roles.js. Nothing ships without a human merging the PR.
 *
 * Exit codes: 0 = in sync OR drift drafted successfully; 1 = hard failure.
 */

import { writeFileSync, readFileSync, existsSync } from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROLES_PATH = join(__dirname, "..", "src", "data", "roles.js");
const IGNORE_PATH = join(__dirname, "role-drift-ignore.json");
const PR_BODY_PATH = process.env.DRIFT_PR_BODY || "/tmp/drift-pr-body.md";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = "claude-haiku-4-5-20251001";
const DRAFT_CAP = Number(process.env.DRIFT_DRAFT_CAP || 15); // max entries drafted per run — keeps PRs reviewable

// ---------------------------------------------------------------------------
// Sources — public raw markdown, same fetch pattern as fetch-updates.js
// ---------------------------------------------------------------------------

const ENTRA_ROLES_RAW =
  "https://raw.githubusercontent.com/MicrosoftDocs/entra-docs/main/docs/identity/role-based-access-control/permissions-reference.md";
const ENTRA_ROLE_INCLUDE = (slug) =>
  `https://raw.githubusercontent.com/MicrosoftDocs/entra-docs/main/docs/identity/role-based-access-control/includes/${slug}.md`;
const ENTRA_ROLES_PAGE =
  "https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference";

// defender-docs is public (unlike the Purview docs repo) and hosts the canonical
// "Roles and role groups in … Microsoft Purview" doc. main + public branch fallback.
const PURVIEW_ROLES_RAW_URLS = [
  "https://raw.githubusercontent.com/MicrosoftDocs/defender-docs/main/defender-office-365/scc-permissions.md",
  "https://raw.githubusercontent.com/MicrosoftDocs/defender-docs/public/defender-office-365/scc-permissions.md",
];
const PURVIEW_ROLES_PAGE =
  "https://learn.microsoft.com/en-us/defender-office-365/scc-permissions";

const FETCH_HEADERS = {
  "User-Agent": "SecRole-RoleDriftBot/1.0 (+https://secrole.com)",
  "Accept": "text/markdown, text/plain, */*",
};

async function fetchWithTimeout(url, ms = 30000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { headers: FETCH_HEADERS, signal: controller.signal, redirect: "follow" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } finally {
    clearTimeout(t);
  }
}

// ---------------------------------------------------------------------------
// Name matching — tolerant of Microsoft's plural / "Admin(s)" naming drift
// ---------------------------------------------------------------------------

function normName(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/gi, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => {
      if (["administrators", "administrator", "admins", "admin"].includes(t)) return "admin";
      return t.length > 3 && t.endsWith("s") ? t.slice(0, -1) : t;
    })
    .join("");
}

// ---------------------------------------------------------------------------
// Parse roles.js — entries, ids, categories (regex on the known house format)
// ---------------------------------------------------------------------------

function parseRolesJs(src) {
  const entries = [...src.matchAll(
    /\{\s*id:\s*"([ep][\w]*)",\s*name:\s*"((?:[^"\\]|\\.)*)",\s*product:\s*"(Entra|Purview)",\s*category:\s*"([^"]+)",\s*risk:\s*"([^"]+)"/g
  )].map((m) => ({ id: m[1], name: m[2].replace(/\\"/g, '"'), product: m[3], category: m[4], risk: m[5] }));

  const nextId = (prefix) => {
    const nums = entries
      .filter((e) => e.id.startsWith(prefix))
      .map((e) => parseInt(e.id.slice(1), 10))
      .filter((n) => !isNaN(n));
    return Math.max(...nums) + 1;
  };

  const categories = (product) =>
    [...new Set(entries.filter((e) => e.product === product).map((e) => e.category))].sort();

  return { entries, nextEntraId: nextId("e"), nextPurviewId: nextId("p"), categories };
}

// ---------------------------------------------------------------------------
// Parse Microsoft docs
// ---------------------------------------------------------------------------

function parseEntraDoc(md) {
  // "All roles" table rows: > | [Name](#anchor) | Description | Template ID |
  return [...md.matchAll(
    /^> \| \[([^\]]+)\]\(#([^)]+)\)\s*\|\s*([\s\S]*?)\s*\|\s*([0-9a-f-]{36})\s*\|$/gm
  )].map((m) => ({
    name: m[1].trim(),
    slug: m[2].trim(),
    description: m[3].replace(/<br\/?>[\s\S]*$/, "").trim(),
    templateId: m[4],
    privileged: m[3].includes("privileged-label"),
  }));
}

function parsePurviewDoc(md) {
  const parseTable = (section, kind) =>
    [...section.matchAll(/^\|\*\*([^*]+)\*\*[^|]*\|([^|]+)\|([^|]*)\|$/gm)].map((m) => ({
      name: m[1].trim(),
      description: m[2].trim(),
      defaultRoles: m[3].replace(/<br\s*\/?><br\s*\/?>/g, ", ").trim(),
      kind,
    }));

  const groupsSection = (md.split(/^## Role groups in Microsoft Defender/m)[1] || "")
    .split(/^## Roles in Microsoft Defender/m)[0];
  const rolesSection = md.split(/^## Roles in Microsoft Defender/m)[1] || "";

  return {
    roleGroups: parseTable(groupsSection, "role group"),
    roles: parseTable(rolesSection, "role"),
  };
}

// ---------------------------------------------------------------------------
// Diff
// ---------------------------------------------------------------------------

function loadIgnoreList() {
  if (!existsSync(IGNORE_PATH)) return { entra: [], purview: [] };
  try {
    const parsed = JSON.parse(readFileSync(IGNORE_PATH, "utf8"));
    return { entra: parsed.entra || [], purview: parsed.purview || [] };
  } catch {
    console.error(`⚠️  ${IGNORE_PATH} is not valid JSON — treating as empty.`);
    return { entra: [], purview: [] };
  }
}

function computeDrift({ myRoles, entraOfficial, purview, entraDocText, purviewDocText, ignore }) {
  const mineEntra = new Set(myRoles.filter((r) => r.product === "Entra").map((r) => normName(r.name)));
  const minePurview = new Set(myRoles.filter((r) => r.product === "Purview").map((r) => normName(r.name)));
  const ignoreEntra = new Set(ignore.entra.map(normName));
  const ignorePurview = new Set(ignore.purview.map(normName));

  const isDeprecated = (desc) => /^don'?t use/i.test(desc || "");

  const missingEntra = entraOfficial.filter(
    (r) => !mineEntra.has(normName(r.name)) && !ignoreEntra.has(normName(r.name))
  );
  // Purview: only role GROUPS drive additions (SecRole's Purview catalog is role groups
  // plus a few curated individual roles); the roles table + full doc text guard retirement.
  const purviewCandidates = purview.roleGroups.filter(
    (r) => !minePurview.has(normName(r.name)) && !ignorePurview.has(normName(r.name))
  );
  const missingPurview = purviewCandidates.filter((r) => !isDeprecated(r.description));
  const skippedDeprecated = purviewCandidates.filter((r) => isDeprecated(r.description));

  // Retired: not in the official lists (fuzzy) AND the literal name appears nowhere in
  // the fetched docs (Microsoft nests many role names inside descriptions/columns).
  const officialEntraSet = new Set(entraOfficial.map((r) => normName(r.name)));
  const officialPurviewSet = new Set([...purview.roleGroups, ...purview.roles].map((r) => normName(r.name)));
  const retired = myRoles.filter((r) => {
    const inList = r.product === "Entra" ? officialEntraSet.has(normName(r.name)) : officialPurviewSet.has(normName(r.name));
    if (inList) return false;
    const doc = r.product === "Entra" ? entraDocText : purviewDocText;
    return !doc.toLowerCase().includes(r.name.toLowerCase());
  });

  return { missingEntra, missingPurview, skippedDeprecated, retired };
}

// ---------------------------------------------------------------------------
// Claude — draft roles.js entries grounded in the fetched Microsoft docs
// ---------------------------------------------------------------------------

function sampleEntries(rolesSrc, product, n = 3) {
  // Pull a few full entry lines verbatim so Haiku matches the house style exactly.
  const prefix = product === "Entra" ? "e" : "p";
  const lines = rolesSrc.split("\n").filter((l) => new RegExp(`^\\s*\\{ id:"${prefix}[\\w]*",`).test(l));
  const picks = [lines[0], lines[Math.floor(lines.length / 2)], lines[lines.length - 1]].filter(Boolean);
  return picks.slice(0, n).join("\n");
}

async function draftWithClaude({ toDraft, myRoles, rolesSrc, categories }) {
  const validIds = myRoles.map((r) => `${r.id}=${r.name}`).join("; ");

  const prompt = `You are the content author for SecRole (secrole.com), a Microsoft Entra ID and Microsoft Purview RBAC role reference for IT admins, security engineers, and compliance officers.

Below are NEW official Microsoft roles that are missing from SecRole's database, each with its OFFICIAL Microsoft documentation text (fetched today — this is your only source of truth). Draft one SecRole entry per role.

HOUSE STYLE — match these real entries from the database exactly in tone, length, and field usage:
${sampleEntries(rolesSrc, "Entra")}
${sampleEntries(rolesSrc, "Purview")}

RULES:
1. "name" must EXACTLY match the official name given for each role. Never rename.
2. "description": 1-2 plain-English sentences of what the role is, written in your own words FROM the provided official text. "permissions": one sentence summarizing what it can actually do, derived ONLY from the provided official text — never from memory.
3. "leastPrivilege": practical assignment guidance in SecRole's opinionated voice (who should get it, PIM/scoping advice, warnings). If the official text says the role is privileged, deprecated, or "not intended for general use", say so plainly here.
4. "risk" rubric: "Critical" = can take over the tenant or grant/escalate roles; "High" = broad write access to security-, identity-, or data-protection-critical config, or marked PRIVILEGED with write powers; "Medium" = meaningful but scoped write access; "Low" = read-only or narrow low-impact scope.
5. "category" must be one of the existing categories for that product: Entra: [${categories("Entra").join(", ")}]. Purview: [${categories("Purview").join(", ")}]. Pick the best fit — do not invent new categories.
6. "tags": 3-4 lowercase kebab-case search keywords.
7. "relatedRoles": 1-3 ids chosen ONLY from this list of existing ids (format id=name): ${validIds}
8. Respond with ONLY a valid JSON array (no markdown fences, no preamble), one object per input role, in the same order, each: {"officialName": "...", "product": "Entra|Purview", "name": "...", "category": "...", "risk": "...", "description": "...", "permissions": "...", "leastPrivilege": "...", "tags": [...], "relatedRoles": [...]}

NEW ROLES TO DRAFT:
${JSON.stringify(toDraft, null, 1)}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .replace(/```json|```/g, "")
    .trim();

  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error("Claude did not return a JSON array.");
  return parsed;
}

function validateDrafts(drafts, toDraft, myRoles, categories) {
  const validIds = new Set(myRoles.map((r) => r.id));
  const validRisk = new Set(["Critical", "High", "Medium", "Low"]);
  const expectedNames = new Map(toDraft.map((r) => [normName(r.name), r]));
  const out = [];

  for (const d of drafts) {
    const source = expectedNames.get(normName(d.name || ""));
    if (!source) { console.error(`   ⚠️  Dropping draft with unexpected name: "${d.name}"`); continue; }
    if (!validRisk.has(d.risk)) { console.error(`   ⚠️  Dropping "${d.name}" — invalid risk "${d.risk}"`); continue; }
    if (!categories(source.product).includes(d.category)) {
      console.error(`   ⚠️  Dropping "${d.name}" — invalid category "${d.category}"`); continue;
    }
    if (!d.description || !d.permissions || !d.leastPrivilege) {
      console.error(`   ⚠️  Dropping "${d.name}" — missing required text field`); continue;
    }
    const productPrefix = source.product === "Entra" ? "e" : "p";
    out.push({
      ...d,
      name: source.name, // enforce the exact official name
      product: source.product,
      tags: (d.tags || []).slice(0, 4).map((t) => String(t).toLowerCase()),
      relatedRoles: (d.relatedRoles || [])
        .filter((id) => validIds.has(id) && String(id).startsWith(productPrefix))
        .slice(0, 3),
      sourceUrl: source.url,
      privileged: source.privileged || false,
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Patch roles.js — append drafted entries in the house single-line format
// ---------------------------------------------------------------------------

function formatEntry(id, d) {
  const q = (s) => JSON.stringify(String(s));
  const arr = (a) => `[${a.map((x) => JSON.stringify(String(x))).join(",")}]`;
  return `  { id:${q(id)}, name:${q(d.name)}, product:${q(d.product)}, category:${q(d.category)}, risk:${q(d.risk)}, description:${q(d.description)}, permissions:${q(d.permissions)}, leastPrivilege:${q(d.leastPrivilege)}, tags:${arr(d.tags)}, relatedRoles:${arr(d.relatedRoles)} },`;
}

function insertIntoArray(src, arrayName, lines) {
  if (lines.length === 0) return src;
  // Find the closing "];" of `export const <arrayName> = [ … ];`
  const start = src.indexOf(`export const ${arrayName}`);
  if (start === -1) throw new Error(`Could not find ${arrayName} in roles.js`);
  const close = src.indexOf("\n];", start);
  if (close === -1) throw new Error(`Could not find the end of ${arrayName} in roles.js`);
  return src.slice(0, close) + "\n" + lines.join("\n") + src.slice(close);
}

async function validateRolesJs(path) {
  const mod = await import(pathToFileURL(path).href + `?t=${Date.now()}`);
  if (!Array.isArray(mod.ENTRA_ROLES) || !Array.isArray(mod.PURVIEW_ROLES)) {
    throw new Error("roles.js no longer exports ENTRA_ROLES / PURVIEW_ROLES arrays");
  }
  return { entra: mod.ENTRA_ROLES.length, purview: mod.PURVIEW_ROLES.length };
}

// ---------------------------------------------------------------------------
// PR body
// ---------------------------------------------------------------------------

function buildPrBody({ added, deferred, skippedDeprecated, retired, counts }) {
  const riskIcon = { Critical: "🔴", High: "🟠", Medium: "🟡", Low: "🟢" };
  const lines = [];
  lines.push("## 🤖 Role drift detected — new official Microsoft roles drafted for review");
  lines.push("");
  lines.push("Drafts below were written by Claude Haiku **from the official Microsoft docs fetched today** — please review each risk rating and least-privilege guidance before merging. Merging updates the Role Library, nav counts, and Critical count automatically.");
  lines.push("");
  lines.push(`**Sources:** [Entra built-in roles](${ENTRA_ROLES_PAGE}) · [Purview roles & role groups](${PURVIEW_ROLES_PAGE})`);
  lines.push("");
  lines.push("### Added in this PR");
  lines.push("");
  lines.push("| ID | Role | Product | Proposed risk | Category |");
  lines.push("|---|---|---|---|---|");
  for (const a of added) {
    lines.push(`| \`${a.id}\` | ${a.name}${a.privileged ? " 🔒" : ""} | ${a.product} | ${riskIcon[a.risk] || ""} ${a.risk} | ${a.category} |`);
  }
  lines.push("");
  lines.push("🔒 = marked PRIVILEGED by Microsoft");
  if (deferred.length > 0) {
    lines.push("");
    lines.push(`### Deferred to next runs (draft cap is ${DRAFT_CAP}/run)`);
    lines.push("");
    for (const d of deferred) lines.push(`- ${d.name} (${d.product})`);
  }
  if (skippedDeprecated.length > 0) {
    lines.push("");
    lines.push("### Skipped — Microsoft marks these \"Don't use\"");
    lines.push("");
    for (const s of skippedDeprecated) lines.push(`- ${s.name} (Purview)`);
    lines.push("");
    lines.push(`_To silence these permanently, add them to \`scripts/role-drift-ignore.json\`._`);
  }
  if (retired.length > 0) {
    lines.push("");
    lines.push("### ⚠️ Possibly retired/renamed — in SecRole but no longer found in the Microsoft docs");
    lines.push("");
    for (const r of retired) lines.push(`- \`${r.id}\` ${r.name} (${r.product}) — verify manually; nothing was deleted`);
  }
  lines.push("");
  lines.push(`_After merge: **${counts.entra}** Entra + **${counts.purview}** Purview roles._`);
  lines.push("");
  lines.push("---");
  lines.push("_Don't want a role in the library? Close this PR and add its name to `scripts/role-drift-ignore.json` — it will never be flagged again._");
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (!ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY is not set. Add it in GitHub → Settings → Secrets → Actions.");
    process.exit(1);
  }

  console.log("📡 Fetching official Microsoft role lists…");
  const entraDocText = await (await fetchWithTimeout(ENTRA_ROLES_RAW)).text();

  let purviewDocText = "";
  for (const url of PURVIEW_ROLES_RAW_URLS) {
    try {
      purviewDocText = await (await fetchWithTimeout(url)).text();
      break;
    } catch (e) {
      console.error(`⚠️  Purview doc failed at ${url}: ${e.message} — trying next URL.`);
    }
  }
  if (!purviewDocText) {
    console.error("❌ Could not fetch the Purview roles doc from any URL.");
    process.exit(1);
  }

  const entraOfficial = parseEntraDoc(entraDocText);
  const purview = parsePurviewDoc(purviewDocText);
  if (entraOfficial.length < 50 || purview.roleGroups.length < 20) {
    // Doc format changed under us — fail loudly instead of "detecting" mass retirement.
    console.error(`❌ Parsed suspiciously few official roles (Entra: ${entraOfficial.length}, Purview groups: ${purview.roleGroups.length}). The doc format may have changed — aborting without touching anything.`);
    process.exit(1);
  }

  const rolesSrc = readFileSync(ROLES_PATH, "utf8");
  const { entries: myRoles, nextEntraId, nextPurviewId, categories } = parseRolesJs(rolesSrc);
  const ignore = loadIgnoreList();

  console.log(`   Official: ${entraOfficial.length} Entra roles | ${purview.roleGroups.length} Purview role groups (+${purview.roles.length} roles)`);
  console.log(`   SecRole:  ${myRoles.filter((r) => r.product === "Entra").length} Entra | ${myRoles.filter((r) => r.product === "Purview").length} Purview | ignore list: ${ignore.entra.length + ignore.purview.length}`);

  const { missingEntra, missingPurview, skippedDeprecated, retired } = computeDrift({
    myRoles, entraOfficial, purview, entraDocText, purviewDocText, ignore,
  });

  console.log(`🔍 Drift: +${missingEntra.length} Entra, +${missingPurview.length} Purview` +
    (skippedDeprecated.length ? ` (${skippedDeprecated.length} deprecated skipped)` : "") +
    (retired.length ? ` | ${retired.length} possibly retired` : ""));

  if (missingEntra.length === 0 && missingPurview.length === 0 && retired.length === 0) {
    console.log("✓ roles.js is in sync with the official Microsoft role lists.");
    return;
  }

  // Build the draft batch (Entra first — completeness there is the core promise),
  // enriched with official permission details so Haiku has real source text.
  const allMissing = [
    ...missingEntra.map((r) => ({ ...r, product: "Entra" })),
    ...missingPurview.map((r) => ({ ...r, product: "Purview" })),
  ];
  const batch = allMissing.slice(0, DRAFT_CAP);
  const deferred = allMissing.slice(DRAFT_CAP);

  let added = [];
  if (batch.length > 0) {
    console.log(`📄 Fetching official permission details for ${batch.length} role(s)…`);
    const toDraft = [];
    for (const r of batch) {
      if (r.product === "Entra") {
        let officialText = r.description;
        try {
          const inc = await (await fetchWithTimeout(ENTRA_ROLE_INCLUDE(r.slug))).text();
          officialText = inc.replace(/^---[\s\S]*?---/, "").trim().slice(0, 3500);
        } catch (e) {
          console.error(`   ⚠️  Include for "${r.name}" unavailable (${e.message}) — using table description only.`);
        }
        toDraft.push({
          product: "Entra", name: r.name, privileged: r.privileged,
          url: `${ENTRA_ROLES_PAGE}#${r.slug}`,
          officialDocumentation: officialText,
        });
      } else {
        toDraft.push({
          product: "Purview", name: r.name, privileged: false,
          url: PURVIEW_ROLES_PAGE,
          officialDocumentation: `${r.description}\n\nDefault roles assigned to this role group: ${r.defaultRoles}`.slice(0, 3500),
        });
      }
    }

    console.log(`🤖 Drafting ${toDraft.length} entries with ${MODEL}…`);
    const drafts = validateDrafts(await draftWithClaude({ toDraft, myRoles, rolesSrc, categories }), toDraft, myRoles, categories);
    if (drafts.length === 0) {
      console.error("❌ No drafts survived validation — nothing to patch.");
      process.exit(1);
    }

    // Assign sequential ids and patch roles.js
    let eId = nextEntraId, pId = nextPurviewId;
    const entraLines = [], purviewLines = [];
    for (const d of drafts) {
      const id = d.product === "Entra" ? `e${eId++}` : `p${pId++}`;
      (d.product === "Entra" ? entraLines : purviewLines).push(formatEntry(id, d));
      added.push({ id, ...d });
    }
    let patched = insertIntoArray(rolesSrc, "ENTRA_ROLES", entraLines);
    patched = insertIntoArray(patched, "PURVIEW_ROLES", purviewLines);
    writeFileSync(ROLES_PATH, patched);
  }

  // Safety gate: the patched file must still be valid ESM with the expected exports.
  const counts = await validateRolesJs(ROLES_PATH);
  console.log(`✅ roles.js patched and validated: ${counts.entra} Entra + ${counts.purview} Purview roles.`);

  writeFileSync(PR_BODY_PATH, buildPrBody({ added, deferred, skippedDeprecated, retired, counts }));
  console.log(`📝 PR body written to ${PR_BODY_PATH}`);
  console.log(`   Added: ${added.map((a) => `${a.id} ${a.name}`).join(", ") || "none"}`);
}

main().catch((e) => {
  console.error(`❌ ${e.message}`);
  process.exit(1);
});
