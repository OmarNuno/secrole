import test from "node:test";
import assert from "node:assert/strict";
import { PURVIEW_ROLES } from "../src/data/roles.js";

// Content boundaries reviewed against the Microsoft Learn references beside p61-p75.
// These are catalog regressions, not a substitute for tenant authorization tests.
const roles = new Map(PURVIEW_ROLES.map((role) => [role.id, role]));
const entry = (id) => {
  const role = roles.get(id);
  assert.ok(role, `Missing role ${id}`);
  return role;
};
const content = (id) => {
  const role = entry(id);
  return [role.description, role.permissions, role.leastPrivilege].join(" ");
};
const relatedNames = (id) => entry(id).relatedRoles.map((relatedId) => entry(relatedId).name);

test("reviewed Purview roles retain differentiated risk ratings", () => {
  const expected = {
    p61: "High", p62: "High", p63: "Medium", p64: "Medium", p65: "High",
    p66: "High", p67: "Medium", p68: "Low", p69: "Medium", p70: "Low",
    p71: "High", p72: "Low", p73: "High", p74: "High", p75: "Medium",
  };
  for (const [id, risk] of Object.entries(expected)) {
    assert.equal(entry(id).risk, risk, `${id} risk rating`);
  }
});

for (const id of ["p67", "p68", "p69", "p70", "p71", "p72"]) {
  test(`${id} carries its private-preview and government-cloud limitations`, () => {
    const role = entry(id);
    assert.match(role.description, /unsupported.*no operational effect outside the M365 ABAC private preview/i);
    assert.match(role.permissions, /^Within the private preview,/);
    assert.match(role.leastPrivilege, /only in an authorized M365 ABAC private-preview deployment/);
    assert.match(role.leastPrivilege, /planned only for GCC High and DoD/);
    assert.match(role.leastPrivilege, /visibility in commercial tenants does not indicate support/);
    assert.doesNotMatch(role.leastPrivilege, /assign to/i);
    assert.ok(role.tags.includes("private-preview"));
  });
}

test("ABAC definition administrators promise only the documented definition operations", () => {
  assert.match(entry("p69").permissions, /define.*activate or deactivate/i);
  assert.doesNotMatch(content("p69"), /\b(delete|deletion|edit)\b/i);
  assert.doesNotMatch(entry("p70").permissions, /activation status/i);
});

test("IRM triage agent discloses cross-case content and its non-interactive purpose", () => {
  assert.match(entry("p61").description, /non-interactive agent users/i);
  assert.match(entry("p61").permissions, /Content Explorer for all cases/);
  assert.match(entry("p61").leastPrivilege, /documented non-interactive IRM triage-agent purpose/);
  assert.doesNotMatch(content("p61"), /assign only to service accounts|designed for non-interactive service principals/i);
});

test("Data Security Viewers names the dashboard and distinguishes prompt execution from content access", () => {
  assert.match(entry("p63").description, /Security Dashboard for AI/);
  assert.match(entry("p63").description, /AI risk scorecard and AI inventory/);
  assert.match(entry("p63").permissions, /Microsoft Foundry applications and agents/);
  assert.match(entry("p63").permissions, /run prompts/);
  assert.match(entry("p63").permissions, /Viewing AI interaction prompts and responses requires the separate Data Security AI Content Viewer role/);
  assert.doesNotMatch(content("p63"), /Security Copilot AI risk scorecard/);
  assert.ok(relatedNames("p63").includes("Data Security AI Content Viewers"));
});

test("EDM Upload Admins stays limited to reference-data upload", () => {
  assert.match(entry("p64").permissions, /^Upload data for Exact Data Match\./);
  assert.match(entry("p64").permissions, /does not grant general EDM configuration or DLP policy administration/);
  assert.doesNotMatch(content("p64"), /upload and manage|responsible for EDM configuration/i);
});

test("Data Security Management includes content access and links to narrower solution groups", () => {
  assert.match(entry("p62").permissions, /download classified content/);
  assert.match(entry("p62").permissions, /investigate insider risk cases/);
  assert.match(entry("p62").permissions, /deploy Purview agents/);
  assert.match(entry("p62").leastPrivilege, /Prefer solution-specific groups/);
  assert.deepEqual(relatedNames("p62"), ["Information Protection", "Insider Risk Management", "Data Security Viewers"]);
});

test("Purview Global Reader describes broad visibility without implying universal content access", () => {
  assert.match(entry("p65").description, /Purview role group/);
  assert.match(entry("p65").description, /read-only/);
  assert.match(entry("p65").permissions, /Does not by itself grant Content Explorer content access/);
  assert.match(entry("p65").leastPrivilege, /Prefer a solution-specific reader group/);
  assert.doesNotMatch(content("p65"), /all Purview|all data protection and compliance features/i);
  assert.deepEqual(relatedNames("p65"), ["Audit Reader", "View-Only Audit Logs", "Data Security Viewers"]);
});

test("Information Protection distinguishes full policy control from narrower alternatives", () => {
  assert.match(entry("p66").permissions, /Create, edit, and delete labels, policies, and classifiers/);
  assert.match(entry("p66").permissions, /view and download content through Content Explorer/);
  assert.match(entry("p66").permissions, /deploy Purview agents/);
  assert.match(entry("p66").leastPrivilege, /Prefer narrower/);
  assert.deepEqual(relatedNames("p66"), ["Information Protection Admin", "Information Protection Analyst", "Information Protection Investigators", "Information Protection Reader"]);
});

test("Information Protection Investigators disclose content downloads while policies stay view-only", () => {
  assert.match(entry("p73").description, /policies.*classifiers remain view-only/);
  assert.match(entry("p73").permissions, /view and download Content Explorer content/);
  assert.match(entry("p73").leastPrivilege, /Prefer Information Protection Analysts when content access is unnecessary/);
  assert.deepEqual(relatedNames("p73"), ["Information Protection", "Information Protection Analyst", "Content Explorer Content Viewer"]);
});

test("IRM Admins separates administrative control from investigative case access", () => {
  assert.match(entry("p74").description, /Does not grant access to investigate alerts or cases, manage cases, or view Content Explorer content/);
  assert.doesNotMatch(entry("p74").permissions, /manage.*cases|investigate.*cases/i);
  assert.match(entry("p74").permissions, /alert\/case reports/);
  assert.match(entry("p74").permissions, /role assignments/);
  assert.ok(relatedNames("p74").includes("Insider Risk Management Analysts"));
  assert.ok(relatedNames("p74").includes("Insider Risk Management Investigators"));
});

test("IRM Auditors includes export, independent-log scope, and inherited Copilot access", () => {
  assert.match(entry("p75").description, /independent of the Microsoft 365 unified audit log/);
  assert.match(entry("p75").description, /inherits Security Copilot contributor access/);
  assert.match(entry("p75").permissions, /export insider risk audit activity to CSV/);
  assert.match(entry("p75").permissions, /Purview Copilot Workspace as a Contributor/);
  assert.match(entry("p75").leastPrivilege, /not exclusively read-only/);
  assert.ok(!entry("p75").tags.includes("read-only"));
});

// p76-p90 reviewed against scc-permissions and edisc-permissions on 2026-10-13.
test("restricted IRM groups preserve operational boundaries", () => {
  assert.match(entry("p76").description, /Does not grant access to investigations, alerts, cases, or sensitive content/);
  assert.match(entry("p76").leastPrivilege, /internal approval use only/);
  assert.match(entry("p77").leastPrivilege, /Do not assign manually/);
  assert.match(entry("p77").permissions, /background services only/);
  assert.doesNotMatch(content("p78"), /compliance training/i);
});

test("mail flow and organization management retain separate Exchange permissions", () => {
  assert.doesNotMatch(content("p79"), /device|Basic Mobility/i);
  assert.match(entry("p79").permissions, /separately an Exchange Administrator/);
  assert.match(entry("p80").permissions, /separate Exchange Online permissions/);
  assert.match(entry("p80").leastPrivilege, /emergency-use warning applies to Global Administrator/);
});

test("privacy contribution and approval expose content and exports", () => {
  for (const id of ["p82", "p90"]) {
    assert.equal(entry(id).risk, "High");
    for (const capability of [/search mailboxes/i, /preview/i, /export search results/i, /custodians/i]) assert.match(entry(id).permissions, capability);
  }
});

test("billing readers and case reviewers do not acquire management rights", () => {
  assert.match(entry("p84").permissions, /does not grant Role Management/);
  assert.equal(entry("p84").risk, "Low");
  assert.match(entry("p85").permissions, /Does not grant search-result preview/);
  assert.match(entry("p85").permissions, /tags requires the separate Manage Review Set Tags role/);
  assert.doesNotMatch(entry("p85").permissions, /manage review set content/);
});

test("security groups distinguish capability, assignment guidance, and related roles", () => {
  assert.match(entry("p86").leastPrivilege, /PIM approval is not universal/);
  assert.deepEqual(relatedNames("p86"), ["Security Reader", "Security Operator", "Organization Management"]);
  assert.deepEqual(relatedNames("p88"), ["Security Administrator", "Security Operator", "Global Reader"]);
  assert.equal(entry("p88").risk, "Medium");
  assert.equal(entry("p87").risk, "High");
  assert.match(entry("p87").permissions, /Tenant Allow\/Block List/);
  assert.match(entry("p87").permissions, /search mailboxes/);
});

// Reviewed October 19, 2026 against scc-permissions and
// communication-compliance-permissions: group membership is not a new role.
test("Supervisory Review distinguishes its role group from the included administrator role", () => {
  assert.match(entry("p91").description, /role group whose default role is Supervisory Review Administrator/);
  assert.match(entry("p35").description, /Individual policy-administration role/);
  assert.ok(relatedNames("p91").includes("Supervisory Review Administrator"));
  assert.ok(relatedNames("p35").includes("Supervisory Review"));
  assert.ok(!entry("p35").tags.includes("legacy"));
  assert.doesNotMatch(content("p35"), /Legacy role|replaced by|only relevant in older/i);
  for (const id of ["p35", "p91"]) {
    assert.equal(entry(id).risk, "High");
    assert.match(entry(id).leastPrivilege, /consider independent approval/i);
    assert.doesNotMatch(content(id), /requires approval workflows/i);
  }
  assert.match(entry("p35").permissions, /should not be treated as permission to investigate alerts or read message content/);
  assert.match(entry("p91").leastPrivilege, /Keep policy configuration separate from investigation and message-review duties/);
});
