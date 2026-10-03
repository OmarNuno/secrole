const pageDisplayOverrides = {
  "role-governance": {
    cardTitle: "Microsoft Entra Role Governance",
    breadcrumbLabel: "Role Governance",
  },
  "role-governance-pim": {
    cardTitle: "PIM Role Settings & Eligible Assignments",
    breadcrumbLabel: "PIM Role Settings",
  },
  "role-governance-groups": {
    cardTitle: "Role-Assignable Groups & Delegated Administration",
    breadcrumbLabel: "Role-Assignable Groups",
  },
  "role-governance-custom-scope": {
    cardTitle: "Custom Roles, Scope & Administrative Units",
    breadcrumbLabel: "Custom Roles & Scope",
  },
};

export function getPageCardTitle(page) {
  return pageDisplayOverrides[page.id]?.cardTitle || page.cardTitle || page.heading || page.title;
}

export function getPageBreadcrumbLabel(page) {
  return pageDisplayOverrides[page.id]?.breadcrumbLabel || page.breadcrumbLabel || page.heading || page.title;
}
