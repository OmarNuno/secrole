import test from "node:test";
import assert from "node:assert/strict";
import { evaluateRiskGuardrails } from "./check-role-drift.js";

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
