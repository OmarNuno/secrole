import { pathToFileURL } from "node:url";

export const VALID_PRODUCTS = new Set(["Entra", "Purview"]);
export const VALID_RISKS = new Set(["Critical", "High", "Medium", "Low"]);

export function normalizeRoleName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ");
}

function addIssue(list, code, message, role = null) {
  list.push({ code, message, roleId: role?.id || null, roleName: role?.name || null });
}

export function validateRoleCollections({ entraRoles, purviewRoles }) {
  const errors = [];
  const warnings = [];

  if (!Array.isArray(entraRoles)) addIssue(errors, "missing-entra-array", "ENTRA_ROLES must be an array.");
  if (!Array.isArray(purviewRoles)) addIssue(errors, "missing-purview-array", "PURVIEW_ROLES must be an array.");
  if (errors.length) return { errors, warnings, counts: { entra: 0, purview: 0, total: 0 } };

  const allRoles = [...entraRoles, ...purviewRoles];
  const idMap = new Map();
  const nameMap = new Map();

  for (const role of allRoles) {
    if (!role || typeof role !== "object" || Array.isArray(role)) {
      addIssue(errors, "invalid-role-record", "Every role entry must be an object.");
      continue;
    }

    if (!/^[ep][a-z0-9]+$/i.test(String(role.id || ""))) {
      addIssue(errors, "invalid-id", `Role ID "${role.id}" must start with e or p and contain only letters or digits.`, role);
    }
    if (!VALID_PRODUCTS.has(role.product)) {
      addIssue(errors, "invalid-product", `Unsupported product "${role.product}".`, role);
    }
    if (role.product === "Entra" && !String(role.id || "").startsWith("e")) {
      addIssue(errors, "id-product-mismatch", "Entra role IDs must start with e.", role);
    }
    if (role.product === "Purview" && !String(role.id || "").startsWith("p")) {
      addIssue(errors, "id-product-mismatch", "Purview role IDs must start with p.", role);
    }
    if (!String(role.name || "").trim()) addIssue(errors, "missing-name", "Role name is required.", role);
    if (!String(role.category || "").trim()) addIssue(errors, "missing-category", "Role category is required.", role);
    if (!VALID_RISKS.has(role.risk)) addIssue(errors, "invalid-risk", `Unsupported risk "${role.risk}".`, role);

    for (const field of ["description", "permissions", "leastPrivilege"]) {
      const value = String(role[field] || "").trim();
      if (!value) addIssue(errors, `missing-${field}`, `${field} is required.`, role);
      else if (value.length < 24) addIssue(warnings, `short-${field}`, `${field} is unusually short (${value.length} characters).`, role);
    }

    if (!Array.isArray(role.tags)) {
      addIssue(errors, "invalid-tags", "tags must be an array.", role);
    } else {
      const uniqueTags = new Set(role.tags.map((tag) => String(tag).toLowerCase()));
      if (uniqueTags.size !== role.tags.length) addIssue(warnings, "duplicate-tags", "tags contains duplicate values.", role);
      if (role.tags.length < 2) addIssue(warnings, "few-tags", "Use at least two useful search tags.", role);
      if (role.tags.some((tag) => !/^[a-z0-9][a-z0-9-]*$/.test(String(tag)))) {
        addIssue(warnings, "nonstandard-tag", "tags should use lowercase kebab-case.", role);
      }
    }

    if (!Array.isArray(role.relatedRoles)) addIssue(errors, "invalid-related-roles", "relatedRoles must be an array.", role);

    if (idMap.has(role.id)) {
      addIssue(errors, "duplicate-id", `Duplicate role ID also used by "${idMap.get(role.id).name}".`, role);
    } else if (role.id) {
      idMap.set(role.id, role);
    }

    const nameKey = `${role.product}:${normalizeRoleName(role.name)}`;
    if (nameMap.has(nameKey)) {
      addIssue(errors, "duplicate-name", `Duplicate ${role.product} role name also used by "${nameMap.get(nameKey).name}".`, role);
    } else if (role.name && role.product) {
      nameMap.set(nameKey, role);
    }
  }

  for (const role of allRoles) {
    if (!Array.isArray(role?.relatedRoles)) continue;
    const seen = new Set();
    for (const relatedId of role.relatedRoles) {
      if (seen.has(relatedId)) addIssue(warnings, "duplicate-related-role", `relatedRoles repeats ${relatedId}.`, role);
      seen.add(relatedId);
      if (relatedId === role.id) addIssue(errors, "self-related-role", "A role cannot reference itself in relatedRoles.", role);
      const related = idMap.get(relatedId);
      if (!related) {
        addIssue(errors, "unknown-related-role", `relatedRoles references unknown ID ${relatedId}.`, role);
      } else if (related.product !== role.product) {
        addIssue(warnings, "cross-product-related-role", `${relatedId} belongs to ${related.product}, not ${role.product}.`, role);
      }
    }
  }

  return {
    errors,
    warnings,
    counts: { entra: entraRoles.length, purview: purviewRoles.length, total: allRoles.length },
  };
}

export async function validateRolesFile(filePath) {
  const moduleUrl = `${pathToFileURL(filePath).href}?validate=${Date.now()}`;
  const mod = await import(moduleUrl);
  return validateRoleCollections({ entraRoles: mod.ENTRA_ROLES, purviewRoles: mod.PURVIEW_ROLES });
}

export function formatValidationReport(result) {
  const lines = [];
  lines.push(`Role data: ${result.counts.entra} Entra + ${result.counts.purview} Purview = ${result.counts.total} total`);
  if (!result.errors.length && !result.warnings.length) lines.push("✓ No validation issues found.");
  for (const issue of result.errors) {
    lines.push(`ERROR [${issue.code}]${issue.roleId ? ` ${issue.roleId}` : ""}: ${issue.message}`);
  }
  for (const issue of result.warnings) {
    lines.push(`WARN  [${issue.code}]${issue.roleId ? ` ${issue.roleId}` : ""}: ${issue.message}`);
  }
  return lines.join("\n");
}
