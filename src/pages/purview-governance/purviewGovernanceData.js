export const toc = [
  { id: "mental-model", label: "The Purview access equation" },
  { id: "permission-planes", label: "Choose the permission plane" },
  { id: "role-groups", label: "Roles, role groups, and Entra roles" },
  { id: "scope-and-time", label: "Scope, PIM, and expiration" },
  { id: "sensitive-content", label: "Sensitive content access" },
  { id: "ediscovery", label: "eDiscovery and compliance boundaries" },
  { id: "data-governance", label: "Data Map and Unified Catalog" },
  { id: "inventory", label: "Read-only evidence" },
  { id: "review-workflow", label: "Governance workflow" },
  { id: "troubleshooting", label: "Troubleshooting field guide" },
  { id: "faq", label: "Questions administrators ask" },
  { id: "official-sources", label: "Official sources" },
  { id: "related-guides", label: "Related SecRole resources" },
];

export const faq = [
  {
    question: "What is the difference between a Microsoft Purview role and a role group?",
    answer: "A role grants one set of Purview tasks. A role group bundles roles and members into a job function. Effective access depends on the roles inside the group, the member assignment, any Administrative Unit scope, solution-specific case or policy access, and overlapping Microsoft Entra roles.",
  },
  {
    question: "Can a scoped Purview role group restrict a user who also has an overlapping Microsoft Entra role?",
    answer: "No. Microsoft documents that an overlapping Microsoft Entra role takes precedence at runtime. The user receives the unscoped Entra-derived capability even when a Purview role group assignment is restricted to an Administrative Unit.",
  },
  {
    question: "Can I use PIM directly on a user assignment to a Microsoft Purview role group?",
    answer: "Not for just-in-time activation. Use Microsoft Entra PIM for Groups on a security group, then assign that security group to the Purview role group. Direct user assignments in Purview do not receive PIM activation behavior.",
  },
  {
    question: "Why can an eDiscovery Manager not see a case?",
    answer: "Role-group membership grants eDiscovery capabilities, but case access is another layer. An eDiscovery Manager can manage cases they create or cases to which they are added. An eDiscovery Administrator has broader oversight and can add themselves to cases when recovery is required.",
  },
  {
    question: "Why did a role group disappear from an eDiscovery case after a permission change?",
    answer: "Microsoft automatically removes a role group from every eDiscovery case when roles are added to or removed from that group. Review affected cases and re-add the group after the role change is approved and validated.",
  },
  {
    question: "Does Content Explorer access mean the user can read document contents?",
    answer: "Only the content-viewer permission grants content access. List-viewer and content-viewer are separate, noncumulative role groups. Content-viewer access is highly sensitive because it can reveal scanned file content and item names that might contain sensitive information.",
  },
  {
    question: "Do Microsoft Purview permissions grant Exchange mail-flow administration?",
    answer: "Not automatically. Purview portal permissions cover supported compliance and governance capabilities. Exchange-specific tasks such as mail-flow rules require the appropriate Exchange Online permissions and administration path.",
  },
  {
    question: "Why does Unified Catalog search omit an asset even though the user can open the portal?",
    answer: "Portal access alone is not the complete data-governance model. Unified Catalog results depend on catalog roles, Data Map domain or collection permissions, and underlying resource access. Confirm all three layers for the asset.",
  },
  {
    question: "Can temporary Purview permissions be used for eDiscovery Manager or eDiscovery Administrator?",
    answer: "No. Microsoft currently excludes eDiscovery Manager and eDiscovery Administrator from automatic expiring role-group assignments. Govern those paths through tightly controlled membership, case access, security groups where supported, recurring review, and evidence.",
  },
];

export const sources = [
  {
    title: "Permissions in the Microsoft Purview portal",
    href: "https://learn.microsoft.com/en-us/purview/purview-permissions",
    note: "Purview RBAC, role groups, Microsoft Entra role mappings, PIM for Groups, role precedence, Administrative Unit scope, temporary assignments, and role-group administration.",
  },
  {
    title: "Roles and role groups in Microsoft Defender and Microsoft Purview",
    href: "https://learn.microsoft.com/en-us/defender-office-365/scc-permissions",
    note: "Current built-in role groups, descriptions, default roles, Role Management authority, and solution-specific capability bundles.",
  },
  {
    title: "Administrative units in Microsoft Purview",
    href: "https://learn.microsoft.com/en-us/purview/purview-admin-units",
    note: "Supported solutions, role groups, restricted-administrator behavior, policy scope, SharePoint site support, prerequisites, and propagation considerations.",
  },
  {
    title: "Assign permissions in eDiscovery",
    href: "https://learn.microsoft.com/en-us/purview/edisc-permissions",
    note: "eDiscovery Manager and Administrator capabilities, group restrictions, case recovery, service-principal considerations, licensing, and least-privilege guidance.",
  },
  {
    title: "Access and permission settings in eDiscovery cases",
    href: "https://learn.microsoft.com/en-us/purview/edisc-settings-access-permissions",
    note: "Users and role groups as case members, case access requirements, and behavior when role-group definitions change.",
  },
  {
    title: "Set up compliance boundaries in eDiscovery",
    href: "https://learn.microsoft.com/en-us/purview/edisc-compliance-boundaries",
    note: "Search permissions filters, role-group separation, searchable-content boundaries, supported attributes, and case implications.",
  },
  {
    title: "Get started with Content Explorer",
    href: "https://learn.microsoft.com/en-us/purview/data-classification-content-explorer",
    note: "Portal access versus list-viewer and content-viewer permissions, sensitive-content exposure, and Administrative Unit support.",
  },
  {
    title: "Data governance roles and permissions in Microsoft Purview",
    href: "https://learn.microsoft.com/en-us/purview/data-governance-roles-permissions",
    note: "Tenant role groups, Unified Catalog roles, governance-domain roles, Data Map domain and collection permissions, and underlying data access.",
  },
  {
    title: "Create and manage governance domains in Unified Catalog",
    href: "https://learn.microsoft.com/en-us/purview/unified-catalog-governance-domains-create-manage",
    note: "Governance Domain Owner, Data Steward, Data Product Owner, catalog-reader behavior, and domain-level delegation.",
  },
  {
    title: "Learn about the Microsoft Purview portal",
    href: "https://learn.microsoft.com/en-us/purview/portal",
    note: "Portal visibility, licensing and permissions, PIM for Groups propagation, user role-group visibility, and solution discovery behavior.",
  },
];
