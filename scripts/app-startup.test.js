import test from "node:test";
import assert from "node:assert/strict";

const codeModule = "../src/pages/purview-governance/purviewGovernanceCode.js";

test("eagerly imported Purview code examples evaluate without a startup error", async () => {
  const examples = await import(codeModule);

  assert.deepEqual(Object.keys(examples).sort(), [
    "administrativeUnitInventoryPowerShell",
    "complianceBoundaryInventoryPowerShell",
    "graphCollectionHelper",
    "purviewFindingsPowerShell",
    "purviewRoleGroupInventoryPowerShell",
  ]);
  for (const [name, code] of Object.entries(examples)) {
    assert.equal(typeof code, "string", name);
    assert.ok(code.trim().length > 0, name);
  }
});

test("Purview findings retain every PowerShell line continuation", async () => {
  const { purviewFindingsPowerShell: code } = await import(codeModule);
  const continuedLines = code.split("\n").filter((line) => line.endsWith("`"));

  // Ordinary quoted strings keep the expected PowerShell backticks literal.
  assert.deepEqual(continuedLines, [
    '        Add-PurviewFinding "Review" "ROLE_GROUP_WITH_NO_MEMBERS" $group.RoleGroupName `',
    '            "The role group currently has no resolved members." `',
    '        Add-PurviewFinding "High" "ROLE_GROUP_WITH_NO_ROLES" $group.RoleGroupName `',
    '            "No role assignment was resolved for the role group." `',
    '        Add-PurviewFinding "High" "SENSITIVE_OR_DELEGATING_ROLE" $group.RoleGroupName `',
    '            $group.Roles `',
    '        Add-PurviewFinding "Review" "LARGE_ROLE_GROUP_MEMBERSHIP" $group.RoleGroupName `',
    '            ("Resolved members: " + $group.MemberCount) `',
    '        Add-PurviewFinding "High" "FILTER_WITHOUT_ASSIGNEES" $filter.FilterName `',
    '            $filter.Filters `',
  ]);
  assert.equal(code.split("`").length - 1, 10);
  assert.ok(!code.includes("\\`"), "JavaScript escaping must not leak into copied PowerShell");
  assert.ok(code.includes('Export-Csv ".\\Purview_Permission_Findings_$timestamp.csv" -NoTypeInformation'));
  assert.ok(code.endsWith("$findings | Format-Table Severity, FindingCode, Target -AutoSize"));
});
