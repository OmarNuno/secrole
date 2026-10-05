import test from "node:test";
import assert from "node:assert/strict";
import { evaluateRiskGuardrails, parsePurviewDoc } from "./check-role-drift.js";

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
    roleGroups: [{ name: "Audit Reader", description: "Search, view, and export audit logs.", defaultRoles: "View-Only Audit Logs, Audit Logs", kind: "role group" }],
    roles: [{ name: "View-Only Audit Logs", description: "View audit logs.", defaultRoles: "Audit Reader", kind: "role" }],
  });
});

test("parses Microsoft Learn Markdown spacing, footnotes, and CRLF lines", () => {
  const result = parsePurviewDoc([
    "## Role groups in Microsoft Defender for Office 365 and Microsoft Purview",
    "| Role group | Description | Default roles |",
    "| --- | --- | --- |",
    "| **Compliance Administrator**¹ | Manage compliance settings. | DLP Compliance Management  Information Protection Admin |",
    "## Roles in Microsoft Defender for Office 365 and Microsoft Purview",
    "| Role | Description | Default role groups |",
    "| --- | --- | --- |",
    "| ^\\*^**Information Protection Admin** | Manage labels and DLP policies. | Compliance Administrator  Compliance Data Administrator |",
    "| **View-Only Audit Logs** | View audit logs. | Audit Reader |",
  ].join("\r\n"));
  assert.deepEqual(result, {
    roleGroups: [{ name: "Compliance Administrator", description: "Manage compliance settings.", defaultRoles: "DLP Compliance Management, Information Protection Admin", kind: "role group" }],
    roles: [
      { name: "Information Protection Admin", description: "Manage labels and DLP policies.", defaultRoles: "Compliance Administrator, Compliance Data Administrator", kind: "role" },
      { name: "View-Only Audit Logs", description: "View audit logs.", defaultRoles: "Audit Reader", kind: "role" },
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
