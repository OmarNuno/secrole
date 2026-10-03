export const toc = [
  { id: "control-path", label: "The complete control path" },
  { id: "creation-boundary", label: "Immutable creation decisions" },
  { id: "ownership", label: "Ownership and delegated control" },
  { id: "pim-designs", label: "PIM design patterns" },
  { id: "last-owner", label: "Last-active-owner trap" },
  { id: "delegation", label: "Delegated administration" },
  { id: "inventory", label: "Read-only inventory" },
  { id: "review-workflow", label: "Repeatable review workflow" },
  { id: "change-examples", label: "State-changing examples" },
  { id: "troubleshooting", label: "Troubleshooting field guide" },
  { id: "faq", label: "Questions administrators ask" },
  { id: "official-sources", label: "Official sources" },
  { id: "related-guides", label: "Related SecRole resources" },
];

export const faq = [
  {
    question: "Can I convert an existing group into a role-assignable group?",
    answer: "No. The isAssignableToRole property can be set only when the group is created and is immutable afterward. Build a new group, validate its owners, members, role assignments, and dependencies, then migrate access deliberately.",
  },
  {
    question: "Is a role-assignable group automatically managed by PIM for Groups?",
    answer: "No. Role assignability and PIM for Groups are independent properties. A group can be role-assignable without PIM for Groups, and an eligible PIM group does not have to be role-assignable unless it will receive a Microsoft Entra role.",
  },
  {
    question: "Which just-in-time design should I use for Exchange, SharePoint, or Purview administrator roles?",
    answer: "Microsoft recommends keeping users as active group members and making the group eligible for the Microsoft Entra role. Activating group membership while the group permanently holds the role can introduce service propagation delays.",
  },
  {
    question: "Can a dynamic group receive a Microsoft Entra role?",
    answer: "No. Role-assignable groups must use Assigned membership. Dynamic membership could allow an administrator who controls the rule to elevate privilege indirectly.",
  },
  {
    question: "Can I nest one group inside a role-assignable group?",
    answer: "Active group nesting is not supported for role-assignable groups. PIM for Groups can represent an eligible group relationship, but activation applies to the requesting user rather than activating an entire nested group.",
  },
  {
    question: "Why does Group.ReadWrite.All fail when I add a member?",
    answer: "Role-assignable groups have a stronger permission boundary. Microsoft Graph requires RoleManagement.ReadWrite.Directory in addition to the supported calling-user role; Privileged Role Administrator is the least-privileged built-in role for adding members to a role-assignable group.",
  },
  {
    question: "Why can an eligible owner remain active after the activation window ends?",
    answer: "Microsoft Entra ID cannot remove the last active owner. If an eligible owner activates and becomes the only active owner, PIM retries deactivation for up to 30 days. If no other active owner is added, the activated owner can remain active.",
  },
  {
    question: "Does removing a user from the group immediately remove every downstream permission?",
    answer: "The directory relationship changes first, but target services, tokens, provisioning systems, and application caches can take additional time to reflect the removal. Validate the group relationship, PIM schedule, role assignment, target-service access, and relevant logs before closing the change.",
  },
];

export const sources = [
  {
    title: "Use Microsoft Entra groups to manage role assignments",
    href: "https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/groups-concept",
    note: "Role-assignable group behavior, immutable creation setting, 500-group tenant limit, assigned membership, Graph permissions, nesting restrictions, deletion, licensing, and known issues.",
  },
  {
    title: "Create a role-assignable group in Microsoft Entra ID",
    href: "https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/groups-create-eligible",
    note: "Admin-center, Microsoft Graph PowerShell, and Graph API creation requirements and examples.",
  },
  {
    title: "Privileged Identity Management for Groups",
    href: "https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/concept-pim-for-groups",
    note: "PIM membership and ownership, independent role-assignable and PIM properties, last-owner deactivation behavior, JIT design options, nesting, and application-provisioning considerations.",
  },
  {
    title: "Bring groups into Privileged Identity Management",
    href: "https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/groups-discover-groups",
    note: "Supported groups, permissions, Restricted Management Administrative Unit limitation, override paths, and the one-way decision to bring a group under PIM management.",
  },
  {
    title: "Assign eligibility for a group in Privileged Identity Management",
    href: "https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/groups-assign-member-owner",
    note: "Active and eligible membership or ownership, required role permissions, licensing, assignment duration, approval guidance, and update or removal behavior.",
  },
  {
    title: "Add members with Microsoft Graph",
    href: "https://learn.microsoft.com/en-us/graph/api/group-post-members?view=graph-rest-1.0",
    note: "Member API permissions, delegated role requirements, replication behavior, and the additional RoleManagement.ReadWrite.Directory requirement for role-assignable groups.",
  },
  {
    title: "List PIM for Groups assignment schedule instances",
    href: "https://learn.microsoft.com/en-us/graph/api/privilegedaccessgroup-list-assignmentscheduleinstances?view=graph-rest-1.0",
    note: "Read current active member and owner schedule instances for one group or principal and the least-privileged PIM for Groups read permission.",
  },
  {
    title: "List PIM for Groups eligibility schedule instances",
    href: "https://learn.microsoft.com/en-us/graph/api/privilegedaccessgroup-list-eligibilityscheduleinstances?view=graph-rest-1.0",
    note: "Read current eligible member and owner schedule instances for one group or principal.",
  },
  {
    title: "List role-management policy assignments",
    href: "https://learn.microsoft.com/en-us/graph/api/policyroot-list-rolemanagementpolicyassignments?view=graph-rest-1.0",
    note: "Retrieve PIM for Groups policy assignments by group scope and expand their effective rules.",
  },
  {
    title: "unifiedRoleAssignmentScheduleInstance resource",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/unifiedroleassignmentscheduleinstance?view=graph-rest-1.0",
    note: "Effective active Microsoft Entra role access, including role assignments inherited through a group.",
  },
  {
    title: "unifiedRoleEligibilityScheduleInstance resource",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/unifiedroleeligibilityscheduleinstance?view=graph-rest-1.0",
    note: "Effective Microsoft Entra role eligibility, including Direct, Inherited, and Group member types.",
  },
];
