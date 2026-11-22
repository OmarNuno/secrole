import test from "node:test";
import assert from "node:assert/strict";
import { validateRoleCollections } from "./role-data-validation.js";
import { ENTRA_ROLES, PURVIEW_ROLES } from "../src/data/roles.js";

test("the published role catalog passes structural validation", () => {
  const result = validateRoleCollections({ entraRoles: ENTRA_ROLES, purviewRoles: PURVIEW_ROLES });
  assert.deepEqual(result.errors, []);
});

test("Compliance Administrator retains its intended related-role family", () => {
  const roleById = new Map(PURVIEW_ROLES.map((entry) => [entry.id, entry]));
  const administrator = PURVIEW_ROLES.find((entry) => entry.name === "Compliance Administrator");
  assert.ok(administrator);
  assert.deepEqual(administrator.relatedRoles.map((id) => roleById.get(id)?.name), [
    "Compliance Data Administrator",
    "DLP Compliance Management",
    "Information Protection Admin",
  ]);
});

function role(overrides = {}) {
  return {
    id: "e1",
    name: "Example Administrator",
    product: "Entra",
    category: "Identity",
    risk: "High",
    description: "Manages an example identity capability for the tenant.",
    permissions: "Create and manage example identity configuration records.",
    leastPrivilege: "Assign only to the team responsible for this capability.",
    tags: ["example", "identity"],
    relatedRoles: [],
    ...overrides,
  };
}

test("accepts a structurally valid catalog", () => {
  const result = validateRoleCollections({
    entraRoles: [role()],
    purviewRoles: [role({ id: "p1", name: "Example Purview Reader", product: "Purview", risk: "Low" })],
  });
  assert.equal(result.errors.length, 0);
  assert.equal(result.counts.total, 2);
});

test("rejects duplicate IDs and duplicate names within a product", () => {
  const result = validateRoleCollections({
    entraRoles: [role(), role({ name: "Example Administrator" })],
    purviewRoles: [],
  });
  assert.ok(result.errors.some((issue) => issue.code === "duplicate-id"));
  assert.ok(result.errors.some((issue) => issue.code === "duplicate-name"));
});

test("rejects unknown and self-referencing related roles", () => {
  const result = validateRoleCollections({
    entraRoles: [role({ relatedRoles: ["e1", "e404"] })],
    purviewRoles: [],
  });
  assert.ok(result.errors.some((issue) => issue.code === "self-related-role"));
  assert.ok(result.errors.some((issue) => issue.code === "unknown-related-role"));
});


test("resource policy roles retain reviewed capability boundaries and risk", () => {
  const byId = new Map(ENTRA_ROLES.map((entry) => [entry.id, entry]));
  const admin = byId.get("e137");
  const evaluator = byId.get("e138");
  const reader = byId.get("e139");
  assert.equal(admin.risk, "High");
  assert.match(admin.permissions, /privileged-read application ID/i);
  assert.match(admin.permissions, /tenant-wide configuration/i);
  assert.match(admin.leastPrivilege, /PIM/);
  assert.equal(evaluator.risk, "Low");
  assert.match(evaluator.permissions, /Does not grant.*read or write/i);
  assert.equal(reader.risk, "Low");
  assert.match(reader.permissions, /No policy-management write access/i);
  assert.ok(byId.get("e54").relatedRoles.includes("e137"));
  for (const id of ["e137", "e138", "e139"]) {
    const role = byId.get(id);
    assert.ok(role);
    assert.ok(role.relatedRoles.every((relatedId) => byId.has(relatedId)));
  }
});
