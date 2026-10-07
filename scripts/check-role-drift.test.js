import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildDraftPrompt, buildPurviewEvidence, evaluateRiskGuardrails, parsePurviewDoc } from "./check-role-drift.js";

test("parses the legacy raw Purview tables", () => {
  const result = parsePurviewDoc([
    "## Role groups in Microsoft Defender for Office 365 and Microsoft Purview",
    "|Role group|Description|Default roles|",
    "|---|---|---|",
    "|**Audit Reader**|Search, view, and export audit logs.|View-Only Audit Logs<br/><br/>Audit Logs|",
    "## Roles in Microsoft Defender for Office 365 and Microsoft Purview",
    "|Role|Description|Default role groups|",
    "|---|---|---|",
    "|**View-Only Audit Logs**|View audit logs.|Audit Reader|",
  ].join("\n"));
  assert.deepEqual(result, {
    roleGroups: [{ name: "Audit Reader", description: "Search, view, and export audit logs.", defaultRoles: "View-Only Audit Logs, Audit Logs", kind: "role group", footnotes: [] }],
    roles: [{ name: "View-Only Audit Logs", description: "View audit logs.", defaultRoles: "Audit Reader", kind: "role", footnotes: [] }],
  });
});

test("parses Microsoft Learn Markdown spacing, footnotes, and CRLF lines", () => {
  const result = parsePurviewDoc([
    "## Role groups in Microsoft Defender for Office 365 and Microsoft Purview",
    "| Role group | Description | Default roles |",
    "| --- | --- | --- |",
    "| **Compliance Administrator**¹ | Manage compliance settings. | DLP Compliance Management  Information Protection Admin |",
    "",
    "¹ Report access requires separately assigned permissions.",
    "",
    "## Roles in Microsoft Defender for Office 365 and Microsoft Purview",
    "| Role | Description | Default role groups |",
    "| --- | --- | --- |",
    "| ^\\*^**Information Protection Admin** | Manage labels and DLP policies. | Compliance Administrator  Compliance Data Administrator |",
    "| **View-Only Audit Logs** | View audit logs. | Audit Reader |",
  ].join("\r\n"));
  assert.deepEqual(result, {
    roleGroups: [{ name: "Compliance Administrator", description: "Manage compliance settings.", defaultRoles: "DLP Compliance Management, Information Protection Admin", kind: "role group", footnotes: [{ marker: "1", text: "Report access requires separately assigned permissions." }] }],
    roles: [
      { name: "Information Protection Admin", description: "Manage labels and DLP policies.", defaultRoles: "Compliance Administrator, Compliance Data Administrator", kind: "role", footnotes: [] },
      { name: "View-Only Audit Logs", description: "View audit logs.", defaultRoles: "Audit Reader", kind: "role", footnotes: [] },
    ],
  });
});

function draft(overrides = {}) {
  return {
    name: "Example Reader",
    risk: "Low",
    riskRationale: "Narrow read-only visibility into low-impact aggregate operational data.",
    description: "Reads a narrow operational report.",
    permissions: "Read an aggregate report.",
    leastPrivilege: "Assign only to reporting staff.",
    officialDocumentation: "Read an aggregate report.",
    privileged: false,
    ...overrides,
  };
}

test("flags tenant-wide sensitive content access rated below High", () => {
  const flags = evaluateRiskGuardrails(draft({
    name: "Workload Content Reader",
    permissions: "Read SharePoint, Teams, OneDrive, and Exchange content across the organization.",
    officialDocumentation: "Read all Microsoft 365 messages, documents, email, and content.",
  }));
  assert.ok(flags.some((flag) => flag.code === "sensitive-content-access-understated"));
});

test("flags role-management capability rated below High", () => {
  const flags = evaluateRiskGuardrails(draft({
    risk: "Medium",
    permissions: "Manage privileged role assignments and grant directory roles.",
  }));
  assert.ok(flags.some((flag) => flag.code === "privilege-management-understated"));
});

test("flags a Microsoft-privileged role rated below High", () => {
  const flags = evaluateRiskGuardrails(draft({ privileged: true, risk: "Medium" }));
  assert.ok(flags.some((flag) => flag.code === "privileged-role-understated"));
});

test("does not flag narrow low-impact aggregate reporting", () => {
  const flags = evaluateRiskGuardrails(draft());
  assert.equal(flags.length, 0);
});

const purviewFixture = readFileSync(new URL("./fixtures/purview-scc-permissions.md", import.meta.url), "utf8");
const officialPurview = parsePurviewDoc(purviewFixture);
const byName = (name) => officialPurview.roleGroups.find((role) => role.name === name);
const codes = (overrides) => evaluateRiskGuardrails(draft(overrides)).map((flag) => flag.code);

test("retains the applicable ABAC preview footnote for all six groups and six roles", () => {
  for (const list of [officialPurview.roleGroups, officialPurview.roles]) {
    const abacRoles = list.filter((role) => role.name.includes(" ABAC "));
    assert.equal(abacRoles.length, 6);
    for (const role of abacRoles) {
      assert.equal(role.footnotes.length, 1, role.name);
      assert.equal(role.footnotes[0].marker, "2");
      assert.match(role.footnotes[0].text, /not supported and has no operational effect outside the M365 ABAC private preview/);
      assert.match(role.footnotes[0].text, /support is planned only.*GCC High and DoD/);
      assert.doesNotMatch(role.footnotes[0].text, /search the audit log/);
      assert.doesNotMatch(role.name, /[¹²]/);
    }
  }
  assert.deepEqual(byName("Audit Reader").footnotes, []);
  assert.equal(byName("Compliance Administrator").footnotes[0].marker, "1");
  assert.doesNotMatch(byName("Compliance Administrator").footnotes[0].text, /private preview/);
});

for (const marker of ["²", "<sup>2</sup>", "^2^", "[^2]"]) {
  test(`resolves ${marker} footnotes with wrapped blockquoted note text and CRLF`, () => {
    const input = [
      "## Role groups in Microsoft Defender for Office 365 and Microsoft Purview",
      `| **Preview Reader**${marker} | Read definitions. | Definition Reader |`,
      "",
      "> [!NOTE]",
      `> ${marker}${marker.startsWith("[") ? ":" : ""} Unsupported outside the private preview.`,
      "> Support is planned only for GCC High and DoD.",
      "",
      "## Roles in Microsoft Defender for Office 365 and Microsoft Purview",
      "| **Unrestricted Reader** | Read definitions. | Readers |",
    ].join("\r\n");
    const parsed = parsePurviewDoc(input);
    assert.deepEqual(parsed.roleGroups[0].footnotes, [{ marker: "2", text: "Unsupported outside the private preview. Support is planned only for GCC High and DoD." }]);
    assert.deepEqual(parsed.roles[0].footnotes, []);
  });
}

test("fails closed on an unresolved numbered restriction instead of dropping it", () => {
  assert.throws(() => parsePurviewDoc([
    "## Role groups in Microsoft Defender for Office 365 and Microsoft Purview",
    "| **Restricted Reader**² | Read definitions. | Reader |",
  ].join("\n")), /Unresolved Purview footnote 2 for "Restricted Reader"/);
});

test("keeps full official restrictions in evidence and the actual drafting prompt without an API call", () => {
  const role = byName("Information Protection ABAC Policy Readers");
  // Restrictions must survive even when preceding capability text exceeds the old cap.
  const evidence = buildPurviewEvidence({ ...role, description: `${role.description} ${"source detail ".repeat(400)}` });
  assert.equal(evidence.officialCapabilities.includes("private preview"), false);
  assert.match(evidence.officialDocumentation, /Included default roles:/);
  assert.ok(evidence.officialDocumentation.endsWith(role.footnotes[0].text));
  const prompt = buildDraftPrompt({
    toDraft: [{ ...role, proposedId: "p1", product: "Purview", ...evidence }],
    myRoles: [], rolesSource: "", categories: () => ["Data Protection"],
  });
  assert.ok(prompt.includes(role.footnotes[0].text));
  assert.match(prompt, /Planned support is not current availability/);
  assert.match(prompt, /Preserve applicable official footnotes/);
});

test("legacy membership labels and read-only role names are not capabilities", () => {
  for (const membership of ["Role Management", "Global Administrator", "Privileged Identity Management", "View-Only Manage Alerts", "Information Protection ABAC Attribute Assignment Reader"]) {
    assert.deepEqual(codes({
      name: membership,
      officialDocumentation: `Read aggregate reports.\n\nDefault roles assigned to this role group: ${membership}`,
    }), [], membership);
  }
});

test("all three ABAC reader groups retain notes without false privilege or write flags", () => {
  for (const role of officialPurview.roleGroups.filter((role) => role.name.includes(" ABAC ") && role.name.endsWith("Readers"))) {
    assert.deepEqual(codes({ name: role.name, description: role.description, permissions: role.description, ...buildPurviewEvidence(role) }), [], role.name);
  }
});

test("ordinary scoped write groups do not get privilege-management flags from membership", () => {
  for (const name of ["Data Security Investigation Admins", "Data Security Investigation Investigators", "Data Security Investigation Reviewers", "Information Protection ABAC Attribute Assignment Administrators", "Information Protection ABAC Attribute Definition Administrators", "Information Protection ABAC Policy Administrators"]) {
    const role = byName(name);
    const result = codes({ risk: "Medium", name, description: role.description, permissions: role.description, ...buildPurviewEvidence(role) });
    assert.ok(!result.includes("privilege-management-understated"), name);
    assert.ok(codes({ name, description: role.description, permissions: role.description, ...buildPurviewEvidence(role) }).includes("write-capability-rated-low"), name);
  }
});

for (const permissions of [
  "Assign directory roles to users.",
  "Grant the Global Administrator role.",
  "Create, update, and delete role assignments.",
  "Manage privileged identity management.",
  "Remove users from privileged roles.",
]) {
  test(`flags affirmative privilege management: ${permissions}`, () => {
    assert.ok(codes({ risk: "Medium", permissions }).includes("privilege-management-understated"));
    assert.ok(codes({ permissions }).includes("write-capability-rated-low"));
  });
}

for (const permissions of [
  "View role assignments and privileged identity management configuration.",
  "Read-only access to Global Administrator role assignments.",
  "Cannot assign, grant, remove, or manage directory roles.",
  "Does not have permissions to create, update, or delete role assignments.",
  "View role assignments but cannot manage them.",
  "Read security policies without permission to modify them.",
  "No access to read or export all Microsoft 365 content.",
  "Cannot view tenant-wide messages, documents, or personal data.",
  "Read aggregate reports and cannot access all mailbox content.",
  "Read aggregate reports without access to SharePoint documents.",
  "Cannot read audit logs or security alerts.",
  "Can view but not manage role assignments.",
  "Must not create or modify security policies.",
  "No write access to security configuration.",
  "Read aggregate reports, not all mailbox content.",
  "View aggregate reports and no access to SharePoint content.",
  "Read-only access to View-Only Manage Alerts.",
  "The manager reviews previously assigned roles and updated reports.",
]) {
  test(`does not invent capability from read-only or negative text: ${permissions}`, () => {
    assert.deepEqual(codes({ permissions }), []);
  });
}

for (const permissions of [
  "Configure authentication methods and conditional access policies.",
  "Create credentials and client secrets.",
  "Reset passwords for all users.",
  "Cannot manage reports, but can modify security policies.",
  "Read-only access to reports; manage security configuration.",
]) {
  test(`preserves affirmative security-write detection: ${permissions}`, () => {
    assert.ok(codes({ risk: "Medium", permissions }).includes("identity-security-write-understated"));
  });
}

test("does not combine unrelated fields or separate read/write objects", () => {
  assert.deepEqual(codes({
    risk: "Medium", description: "View security policies.", permissions: "Create aggregate reports.",
  }), []);
  assert.deepEqual(codes({
    risk: "Medium", permissions: "Manage report settings and read security policies.",
  }), []);
  assert.deepEqual(codes({ description: "View aggregate reports.", officialDocumentation: "No access to all Microsoft 365 documents." }), []);
});

test("preserves High confidentiality flags for broad read-only content and Medium metadata flags", () => {
  assert.ok(codes({ permissions: "Read-only access to all Microsoft 365 documents and messages." }).includes("sensitive-content-access-understated"));
  assert.ok(codes({ permissions: "Cannot modify content, but may export all mailboxes and SharePoint files." }).includes("sensitive-content-access-understated"));
  assert.ok(codes({ permissions: "View audit logs and security alerts." }).includes("sensitive-metadata-understated"));
  assert.ok(!codes({ risk: "High", permissions: "Read all Microsoft 365 content." }).includes("sensitive-content-access-understated"));
  assert.ok(!codes({ risk: "High", permissions: "Manage privileged role assignments." }).includes("privilege-management-understated"));
});

test("flags sensitive content access across investigation cases", () => {
  for (const permissions of ["Read Content Explorer content across cases.", "Access investigation evidence across all cases.", "View sensitive content for all cases."]) {
    assert.ok(codes({ risk: "Medium", permissions }).includes("sensitive-content-access-understated"), permissions);
  }
});

test("capability instructions still flag genuine writes and role administration", () => {
  for (const permissions of ["Use this role group to manage directory roles.", "Users must manage privileged role assignments.", "Users need to create directory roles."]) {
    assert.ok(codes({ risk: "Medium", permissions }).includes("privilege-management-understated"), permissions);
    assert.ok(codes({ permissions }).includes("write-capability-rated-low"), permissions);
  }
  for (const name of ["AI Administrators", "Data Security AI Viewers"]) {
    const role = byName(name);
    assert.deepEqual(codes({ name, description: role.description, permissions: role.description, ...buildPurviewEvidence(role) }), [], name);
  }
  const admin = byName("Data Security AI Admins");
  assert.ok(codes({ description: admin.description, ...buildPurviewEvidence(admin) }).includes("write-capability-rated-low"));
});

test("coordinated read and write verbs preserve their shared sensitive object", () => {
  for (const permissions of ["Can manage and view directory role assignments.", "Can create, modify, and view directory roles."]) {
    assert.ok(codes({ risk: "Medium", permissions }).includes("privilege-management-understated"), permissions);
  }
  for (const permissions of ["Can create and read conditional access policies.", "Can view and modify security configuration."]) {
    assert.ok(codes({ risk: "Medium", permissions }).includes("identity-security-write-understated"), permissions);
  }
  assert.deepEqual(codes({ risk: "Medium", permissions: "Can create reports and read conditional access policies." }), []);
});

test("read-only qualifiers do not suppress a separate explicit write capability", () => {
  for (const permissions of [
    "Read-only access to reports, plus permission to manage directory role assignments.",
    "View-only access to reports and rights to create directory roles.",
    "Read-only access to reports with ability to grant privileged roles.",
  ]) {
    assert.ok(codes({ risk: "Medium", permissions }).includes("privilege-management-understated"), permissions);
    assert.ok(codes({ permissions }).includes("write-capability-rated-low"), permissions);
  }
  assert.deepEqual(codes({ permissions: "Read-only access to reports without permission to manage directory role assignments." }), []);
  assert.deepEqual(codes({ permissions: "Read-only access to settings for create, manage, and delete roles." }), []);
});

test("official View-Only Manage Alerts description names a feature, not a write capability", () => {
  const role = officialPurview.roles.find((entry) => entry.name === "View-Only Manage Alerts");
  assert.equal(role.description, "View the configuration and reports for the Manage Alerts feature.");
  assert.deepEqual(codes({ name: role.name, description: role.description, permissions: role.description, ...buildPurviewEvidence(role) }), []);
  assert.ok(codes({ permissions: "Manage alerts." }).includes("write-capability-rated-low"));
  assert.ok(codes({ permissions: "View reports and manage alerts." }).includes("write-capability-rated-low"));
});
