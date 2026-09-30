export const toc = [
  { id: "state-model", label: "Active, eligible, and activated" },
  { id: "policy-model", label: "Role settings and Graph records" },
  { id: "activation-controls", label: "Activation controls" },
  { id: "governance-baseline", label: "SecRole governance baseline" },
  { id: "migration", label: "Move standing access to PIM" },
  { id: "commands", label: "Read-only inventory and requests" },
  { id: "operations", label: "Operating evidence and reviews" },
  { id: "troubleshooting", label: "Troubleshooting field guide" },
  { id: "faq", label: "Questions administrators ask" },
  { id: "official-sources", label: "Official sources" },
  { id: "related-guides", label: "Related SecRole resources" },
];

export const faq = [
  {
    question: "Is permanent eligibility the same as permanent active access?",
    answer: "No. Permanent eligibility means the principal can request activation without an eligibility end date. The role is not active until activation succeeds, but the durable path to privilege still requires ownership, role settings, monitoring, and recurring review.",
  },
  {
    question: "Are PIM role settings configured per user?",
    answer: "No. Microsoft Entra PIM role settings are defined for a role at a scope. Assignments for that role and scope follow the applicable policy rules, while individual assignments carry their own principal, dates, state, and inheritance path.",
  },
  {
    question: "Does requiring MFA guarantee a new MFA prompt for every activation?",
    answer: "Not necessarily. A user might already have an MFA claim in the current session. For explicit reauthentication or a particular authentication strength, use a Conditional Access authentication context and configure the related Conditional Access policy carefully.",
  },
  {
    question: "Does authentication context protect use of the role after activation?",
    answer: "The authentication context controls activation. It does not by itself prevent the user from using the activated role from another session, device, or location. Use a separate Conditional Access policy targeting the directory role when ongoing session controls are required.",
  },
  {
    question: "How many approvers should a role have?",
    answer: "Microsoft recommends selecting at least two approvers when approval is required. SecRole also recommends an independently monitored approver pool, a documented escalation path, and emergency access that does not depend on the approval workflow.",
  },
  {
    question: "Can an approver approve their own activation request?",
    answer: "No. Approvers cannot approve their own role activation requests, and service principals cannot approve requests. Approval design must avoid circular dependencies and single-person failure points.",
  },
  {
    question: "Why does an activated role still not work immediately?",
    answer: "Confirm the role, scope, request status, active schedule instance, and target authorization system. Some applications cache role information, so sign-out, token refresh, or session renewal may be required even after PIM creates the active assignment.",
  },
  {
    question: "Should emergency access accounts be eligible in PIM?",
    answer: "No. Emergency access accounts are a deliberate exception to ordinary just-in-time administration. Microsoft recommends two or more cloud-only accounts with permanent active Global Administrator assignments, strong authentication, monitoring, secure custody, and regular testing.",
  },
  {
    question: "What is the safest order for moving a permanent active assignment to PIM?",
    answer: "Create the eligible assignment, configure role settings, test activation and approval, prove the real administrative task, verify monitoring, and only then remove the old permanent active assignment. Preserve a rollback path until the new process is proven.",
  },
];

export const sources = [
  {
    title: "Configure Microsoft Entra role settings in Privileged Identity Management",
    href: "https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-how-to-change-default-settings",
    note: "Per-role policy settings, activation duration, MFA, authentication context, justification, tickets, approval, assignment duration, notifications, and Graph policy queries.",
  },
  {
    title: "Activate a Microsoft Entra role in PIM",
    href: "https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-how-to-activate-role",
    note: "Eligible-role activation, reduced scope, scheduled activation, request status, temporary active assignments, and Graph activation requests.",
  },
  {
    title: "Approve or deny requests for Microsoft Entra roles in PIM",
    href: "https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-approval-workflow",
    note: "Delegated approvers, 24-hour approval window, self-approval restrictions, notifications, and pending-request APIs.",
  },
  {
    title: "View audit history for Microsoft Entra roles in PIM",
    href: "https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-how-to-use-audit-log",
    note: "Role assignment changes, activations, PIM policy changes, retention, and roleAssignmentRequestId correlation across asynchronous events.",
  },
  {
    title: "Manage emergency access admin accounts",
    href: "https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/security-emergency-access",
    note: "Cloud-only emergency identities, permanent active Global Administrator assignments, strong authentication, monitoring, and regular testing.",
  },
  {
    title: "List roleManagementPolicyAssignments",
    href: "https://learn.microsoft.com/en-us/graph/api/policyroot-list-rolemanagementpolicyassignments?view=graph-rest-1.0",
    note: "Tenant-scoped Microsoft Entra role policy assignments, nested policy and rule expansion, permissions, and rule identifiers.",
  },
  {
    title: "Rules in PIM - mapping guide",
    href: "https://learn.microsoft.com/en-us/graph/identity-governance-pim-rules-overview",
    note: "The 17 predefined activation, assignment, and notification rules and their immutable Microsoft Graph rule IDs.",
  },
  {
    title: "List roleAssignmentScheduleRequests",
    href: "https://learn.microsoft.com/en-us/graph/api/rbacapplication-list-roleassignmentschedulerequests?view=graph-rest-1.0",
    note: "Active-assignment and activation request history, supported OData expansion, and the current least-privileged schedule permission requirement.",
  },
  {
    title: "List roleEligibilityScheduleRequests",
    href: "https://learn.microsoft.com/en-us/graph/api/rbacapplication-list-roleeligibilityschedulerequests?view=graph-rest-1.0",
    note: "Eligibility request history and the current least-privileged schedule permission requirement.",
  },
  {
    title: "Create roleAssignmentScheduleRequests",
    href: "https://learn.microsoft.com/en-us/graph/api/rbacapplication-post-roleassignmentschedulerequests?view=graph-rest-1.0",
    note: "Self-activation and administrator assignment actions, request body fields, MFA requirement, scope, schedule, justification, and ticket data.",
  },
  {
    title: "unifiedRoleManagementPolicy resource",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/unifiedrolemanagementpolicy?view=graph-rest-1.0",
    note: "Role management policies, rules, effective rules, scope, and last-modified evidence.",
  },
  {
    title: "unifiedRoleManagementPolicyAssignment resource",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/unifiedrolemanagementpolicyassignment?view=graph-rest-1.0",
    note: "The mapping between a PIM policy and a role definition at a scope.",
  },
  {
    title: "unifiedRoleManagementPolicyEnablementRule resource",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/unifiedrolemanagementpolicyenablementrule?view=graph-rest-1.0",
    note: "MFA, justification, and ticketing enablement rules for assignment and activation actions.",
  },
  {
    title: "unifiedRoleManagementPolicyApprovalRule resource",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/unifiedrolemanagementpolicyapprovalrule?view=graph-rest-1.0",
    note: "Approval requirements, approval stages, and approver configuration.",
  },
  {
    title: "unifiedRoleManagementPolicyExpirationRule resource",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/unifiedrolemanagementpolicyexpirationrule?view=graph-rest-1.0",
    note: "Permanent-assignment allowance and maximum duration for eligibility, active assignments, and activations.",
  },
  {
    title: "unifiedRoleEligibilityScheduleInstance resource",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/unifiedroleeligibilityscheduleinstance?view=graph-rest-1.0",
    note: "Current effective role eligibility, scope, dates, member type, and source schedule.",
  },
  {
    title: "unifiedRoleAssignmentScheduleInstance resource",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/unifiedroleassignmentscheduleinstance?view=graph-rest-1.0",
    note: "Current effective active role access, including assigned and PIM-activated instances.",
  },
];
