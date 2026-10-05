import process from "node:process";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { draftWithOpenAI } from "./check-role-drift.js";
import { categorizeWithOpenAI } from "./fetch-updates.js";

const root = resolve(import.meta.dirname, "..");
const item = { id: "example", title: "New role", summary: "Source-backed summary.", category: "New Role", source: "Microsoft", date: "October 2026", importance: "high", url: "https://learn.microsoft.com/example" };

test("role drafting requests OpenAI structured output grounded in supplied source text", async () => {
  const roles = [{ name: "Example Reader" }];
  const result = await draftWithOpenAI({
    toDraft: [{ name: "Example Reader", proposedId: "e999", officialDocumentation: "Read aggregate reports only." }],
    myRoles: [], rolesSource: "", categories: () => ["General"],
  }, async (request) => {
    assert.match(request.input, /Read aggregate reports only/);
    assert.match(request.instructions, /never as instructions/);
    assert.equal(request.maxOutputTokens, 10000);
    assert.equal(request.jsonSchema.name, "role_drafts");
    assert.ok(request.jsonSchema.schema.properties.roles);
    return { text: JSON.stringify({ roles }) };
  });
  assert.deepEqual(result, roles);
});

test("drafting refuses malformed structured output", async () => {
  await assert.rejects(draftWithOpenAI({ toDraft: [], myRoles: [], rolesSource: "", categories: () => [] }, async () => ({ text: "[]" })), /roles array/);
});

test("update generation keeps only original source/URL pairs and valid categories", async () => {
  const invalid = [
    { ...item, id: "invented", url: "https://example.com/invented" },
    { ...item, id: "source", source: "Different source" },
    { ...item, id: "category", category: "Made up" },
    { ...item, id: "empty", summary: "" },
    { ...item, id: "severity", importance: "urgent" },
  ];
  const result = await categorizeWithOpenAI([item], async (request) => {
    assert.equal(request.maxOutputTokens, 8000);
    assert.equal(request.jsonSchema.name, "microsoft_updates");
    return { text: JSON.stringify({ updates: [...invalid, item, item] }) };
  });
  assert.deepEqual(result, [item]);
});

test("updates reject empty, malformed and wholly unsupported output to preserve cache", async () => {
  for (const text of ["[]", '{"updates":[]}', JSON.stringify({ updates: [{ ...item, url: "https://example.com/invented" }] }), "broken JSON"]) {
    await assert.rejects(categorizeWithOpenAI([item], async () => ({ text })));
  }
});

function filesUnder(path) {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? filesUnder(join(path, entry.name)) : [join(path, entry.name)]);
}

test("production source, workflows, dependencies, and active docs contain no retired-provider runtime or config", () => {
  const files = ["api", "lib", "src", ".github/workflows", "scripts"].flatMap((path) => filesUnder(join(root, path)))
    .filter((path) => !path.endsWith(".test.js"));
  files.push(...["package.json", "package-lock.json", "README.md", "PROJECT_CONTEXT.md", "docs/ROLE_DRIFT_AUTOMATION.md"].map((path) => join(root, path)));
  for (const file of files) {
    assert.doesNotMatch(readFileSync(file, "utf8"), /api\.anthropic\.com|ANTHROPIC_API_KEY|claude-haiku|@anthropic-ai|Powered by Claude/i, file);
  }
});

test("automation defaults to discovery, explicitly gates paid work, and creates draft role PRs", () => {
  const weekly = readFileSync(join(root, ".github/workflows/check-role-drift.yml"), "utf8");
  const daily = readFileSync(join(root, ".github/workflows/fetch-updates.yml"), "utf8");
  for (const workflow of [weekly, daily]) {
    assert.match(workflow, /default: false/);
    assert.match(workflow, /vars\.OPENAI_AUTOMATION_ENABLED == 'true'/);
    assert.match(workflow, /--dry-run/);
    assert.match(workflow, /contents: read/);
    assert.match(workflow, /secrets\.OPENAI_API_KEY/);
    assert.doesNotMatch(workflow, /gh pr merge|--auto/);
  }
  assert.match(weekly, /gh pr create --draft/);
  assert.match(weekly, /check-role-drift\.js --draft/);
  assert.match(daily, /fetch-updates\.js --generate/);
});

test("default CLI discovery cannot contact any AI endpoint or modify published catalogs", () => {
  const dir = mkdtempSync(join(tmpdir(), "secrole-discovery-test-"));
  const preload = join(dir, "source-only-fetch.mjs");
  const tracked = ["src/data/roles.js", "public/updates-cache.json"].map((path) => join(root, path));
  const before = tracked.map((path) => readFileSync(path, "utf8"));
  // Synthetic Microsoft documents keep tests deterministic and the network fully mocked.
  writeFileSync(preload, `
    const entra = Array.from({length: 50}, (_, i) => '> | [Test Role ' + i + '](#test-role-' + i + ') | Reads aggregate reports. | 00000000-0000-0000-0000-' + String(i).padStart(12, '0') + ' |').join('\\n');
    const purview = '## Role groups in Microsoft Defender\\n' + Array.from({length: 20}, (_, i) => '| **Test Group ' + i + '** | Read reports. | Reader |').join('\\n') + '\\n## Roles in Microsoft Defender\\n';
    globalThis.fetch = async (url) => {
      const value = String(url);
      if (!/^https:\\/\\/(raw\\.githubusercontent\\.com\\/MicrosoftDocs\\/|learn\\.microsoft\\.com\\/|www\\.microsoft\\.com\\/|techcommunity\\.microsoft\\.com\\/|api\\.msrc\\.microsoft\\.com\\/|msrc\\.microsoft\\.com\\/)/.test(value)) throw new Error('Unexpected network target: ' + value);
      if (value.includes('permissions-reference.md')) return new Response(entra);
      if (value.includes('scc-permissions')) return new Response(purview);
      if (value.includes('/m365')) return new Response('[]', {headers:{'Content-Type':'application/json'}});
      return new Response('');
    };
  `);
  try {
    const env = { ...process.env, OPENAI_API_KEY: "test-only-not-a-key", OPENAI_AUTOMATION_ENABLED: "true" };
    delete env.DRIFT_PR_BODY;
    const role = spawnSync(process.execPath, ["--import", preload, "scripts/check-role-drift.js"], { cwd: root, env, encoding: "utf8" });
    assert.equal(role.status, 0, role.stderr + role.stdout);
    assert.match(role.stdout, /role-drift dry run/);
    // Empty upstream news is a visible failure, and must still preserve the cache without AI.
    const updates = spawnSync(process.execPath, ["--import", preload, "scripts/fetch-updates.js"], { cwd: root, env, encoding: "utf8" });
    assert.equal(updates.status, 1, updates.stderr + updates.stdout);
    assert.match(updates.stderr, /Every source returned zero items/);
    assert.doesNotMatch(role.stderr + updates.stderr, /Unexpected network target/);
    assert.deepEqual(tracked.map((path) => readFileSync(path, "utf8")), before);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
