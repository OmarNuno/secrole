import test from "node:test";
import assert from "node:assert/strict";
import { validateRoleCollections } from "./role-data-validation.js";

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
