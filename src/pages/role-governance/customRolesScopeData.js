export const toc = [
  { id: "least-privilege", label: "Reduce actions and scope" },
  { id: "role-systems", label: "Choose the correct role system" },
  { id: "role-anatomy", label: "Custom role anatomy" },
  { id: "scope-map", label: "Tenant, AU, and resource scope" },
  { id: "administrative-units", label: "Administrative Units" },
  { id: "restricted-management", label: "Restricted management AUs" },
  { id: "application-scope", label: "Application-specific delegation" },
  { id: "inventory", label: "Read-only inventory" },
  { id: "design-workflow", label: "Design and review workflow" },
  { id: "change-examples", label: "State-changing examples" },
  { id: "troubleshooting", label: "Troubleshooting field guide" },
  { id: "faq", label: "Questions administrators ask" },
  { id: "official-sources", label: "Official sources" },
  { id: "related-guides", label: "Related SecRole resources" },
];

export const faq = [
  {
    question: "Should I create a custom role whenever a built-in role seems too broad?",
    answer: "Not immediately. Start with the least-privileged built-in role, then test whether a narrower assignment scope solves the requirement. Create a custom role only when supported built-in roles remain materially too broad or too narrow for the documented task.",
  },
  {
    question: "Is a Microsoft Entra custom role the same as an Azure custom role?",
    answer: "No. Microsoft Entra custom roles authorize directory-management actions through Microsoft Graph. Azure custom roles authorize Azure Resource Manager actions over subscriptions, resource groups, and Azure resources. Their permissions and scopes are not interchangeable.",
  },
  {
    question: "Can every permission from a built-in Microsoft Entra role be used in a custom role?",
    answer: "No. Only permissions that Microsoft enables for custom-role use can be selected. Confirm support for every required microsoft.directory action before designing the role or promising the delegated task.",
  },
  {
    question: "Can a custom role be assigned at Administrative Unit scope?",
    answer: "Yes, when the custom role contains at least one permission relevant to users, groups, or devices. The scoped permissions apply to supported Administrative Unit members and do not grant organization-level configuration rights.",
  },
  {
    question: "Does adding a group to an Administrative Unit also add its users?",
    answer: "No. The group object becomes a member of the Administrative Unit, but its users and devices do not. Add each target user or device directly, or use a supported dynamic Administrative Unit membership rule, when the delegated administrator must manage those objects.",
  },
  {
    question: "Why can a service principal have an Administrative Unit-scoped role but still fail?",
    answer: "Service principals and guest users do not receive the same default directory-read capability as ordinary member users. They can require Directory Readers or another role with sufficient read permissions at tenant scope because directory-read permissions cannot currently be assigned at Administrative Unit scope.",
  },
  {
    question: "Does a Restricted Management Administrative Unit prevent Global Administrators from changing its members?",
    answer: "Tenant-scoped administrators, including Global Administrators, are blocked from directly modifying protected member objects unless they also have an appropriate role assignment at that restricted scope. Global and Privileged Role Administrators can still manage the restricted Administrative Unit and assign scoped access, which creates an auditable escalation path.",
  },
  {
    question: "Can I change a normal Administrative Unit into a Restricted Management Administrative Unit later?",
    answer: "No. The restricted-management property must be selected when the Administrative Unit is created and is immutable. Build and test a new restricted Administrative Unit, validate every support and automation dependency, then migrate protected objects deliberately.",
  },
  {
    question: "What is the difference between a container scope and a resource scope?",
    answer: "A container scope such as the tenant or an Administrative Unit applies supported permissions to objects contained by that scope. A resource scope applies the role to the selected object itself, such as one application registration or Enterprise Application, and does not automatically extend to objects related to or contained by that resource.",
  },
];

export const sources = [
  {
    title: "Overview of Microsoft Entra role-based access control",
    href: "https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/custom-overview",
    note: "Role definitions, principals, assignments, tenant, Administrative Unit and resource scopes, and the distinction between Microsoft Entra RBAC and Azure RBAC.",
  },
  {
    title: "Best practices for Microsoft Entra roles",
    href: "https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/best-practices",
    note: "Least privilege across the permission set, assignment scope, and duration of access.",
  },
  {
    title: "Create a custom role in Microsoft Entra ID",
    href: "https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/custom-create",
    note: "Custom-role prerequisites, supported permission categories, portal, PowerShell and Graph creation, update, assignment and deletion patterns.",
  },
  {
    title: "List Microsoft Entra role definitions",
    href: "https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/role-definitions-list",
    note: "Read built-in and custom unifiedRoleDefinition objects and inspect their rolePermissions.",
  },
  {
    title: "Assign Microsoft Entra roles",
    href: "https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/manage-roles-portal",
    note: "Tenant, application registration and Administrative Unit scopes, supported principals, custom-role eligibility for AU scope, and directory-read requirements for guests and service principals.",
  },
  {
    title: "Administrative units in Microsoft Entra ID",
    href: "https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/administrative-units",
    note: "Administrative Unit objects, supported member types, group-member behavior, licensing, visibility limitations, and supported management scenarios.",
  },
  {
    title: "Restricted management administrative units",
    href: "https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/admin-units-restricted-management",
    note: "Protected-object behavior, blocked operations, immutable creation setting, recovery authority, audit events and current limitations.",
  },
  {
    title: "Create custom roles to manage enterprise apps",
    href: "https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/custom-enterprise-apps",
    note: "Fine-grained appRoleAssignedTo permissions and organization-wide versus single-application role assignment scope.",
  },
  {
    title: "Delegate application management administrator permissions",
    href: "https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/delegate-app-roles",
    note: "Application-registration and Enterprise Application object-scoped administration patterns.",
  },
  {
    title: "unifiedRoleDefinition resource",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/unifiedroledefinition?view=graph-rest-1.0",
    note: "Role-definition identifiers, enabled state, template ID, version, resource scopes and allowedResourceActions.",
  },
  {
    title: "List roleDefinitions",
    href: "https://learn.microsoft.com/en-us/graph/api/rbacapplication-list-roledefinitions?view=graph-rest-1.0",
    note: "Read Microsoft Entra role definitions with Microsoft Graph and the least-privileged read permissions.",
  },
  {
    title: "Microsoft Entra service limits and restrictions",
    href: "https://learn.microsoft.com/en-us/entra/identity/users/directory-service-limits-restrictions",
    note: "Current limits for custom role definitions, custom-role assignments per principal, and other directory resources.",
  },
];
