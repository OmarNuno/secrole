# SecRole Session Notes — Microsoft Entra Role Governance Hub

Date: September 19, 2026

## Repository state

- PR #10, **Publish Service Principal credential lifecycle guide**, was merged.
- PR #11, **Harden role drift risk review and validation**, was prepared on a separate branch.
- This work starts independently from `main` on:
  - `feature/entra-role-governance-hub`

## Objective

Publish SecRole's second complete knowledge hub:

- `/role-governance`

The page must explain effective Microsoft Entra administrator access across role systems, principals, role definitions, direct and group assignments, PIM eligibility and activation, scope, duration, emergency access, custom roles, and recurring evidence-based reviews.

## Implementation completed

### Role-governance mental model

The hub frames effective access as:

- Principal
- Role definition
- Scope
- State
- Duration
- Controls
- Evidence

A role name by itself is not considered a complete governance record.

### Authorization-system boundary

The page distinguishes:

- Microsoft Entra directory roles
- Azure RBAC roles
- Microsoft Purview role groups
- Enterprise-application assignments and app roles

The protected resource and requested action determine which authorization system to investigate.

### Assignment state and Microsoft Graph records

The reference covers:

- Direct active access
- Group-based active access
- Eligible assignments
- Activated assignments
- Time-bound active assignments
- Permanent eligibility
- `unifiedRoleDefinition`
- `unifiedRoleAssignment`
- `unifiedRoleAssignmentScheduleInstance`
- `unifiedRoleEligibilityScheduleInstance`
- Schedule and request records

### Scope

The page explains:

- Tenant scope
- Administrative Unit scope
- Directory-resource scope
- App-specific scope
- Container scope vs. resource scope
- Administrative Unit group-member limitations
- Administrative Units as management scopes rather than general visibility boundaries

### Governance controls

The hub covers:

- PIM eligibility and activation
- Activation duration
- MFA and authentication context
- Approval and justification
- Notifications and access reviews
- Role-assignable group restrictions
- Group ownership as a privileged decision path
- Two or more cloud-only emergency access accounts
- Permanent-active emergency Global Administrator assignments
- Custom roles and layered controls

### Operational workflow

The review sequence includes:

1. Identify the authorization system
2. Inventory role definitions
3. Inventory active access
4. Inventory eligibility
5. Resolve inheritance
6. Validate scope
7. Review controls
8. Correlate evidence
9. Choose a disposition
10. Prove the change

Supported dispositions include retain, move to PIM, reduce role, narrow scope, custom role, or remove.

### Read-only commands

The page includes Microsoft Graph PowerShell examples for:

- Pagination-safe Graph collection retrieval
- Role definitions
- Direct assignments
- Active assignment schedule instances
- Eligibility schedule instances
- Combined active and eligible CSV export
- Role-assignable groups
- Administrative Units

### Troubleshooting

The field guide covers:

- Successful activation but denied action
- Effective access with no direct assignment
- Group member not receiving the role
- Administrative Unit group vs. user scope confusion
- Azure Owner vs. Microsoft Entra role confusion
- Permanent eligibility vs. active access
- Overlapping assignment sources after removal
- PIM approval lockout

## Knowledge-library changes

- `/knowledge` now supports multiple reference hubs.
- Published hubs are derived from the central route registry.
- Search covers both hubs and focused guides.
- Structured-data ItemList includes all published hubs and guides.
- Knowledge navigation remains active on `/role-governance` and future child routes.
- Service Principal focused-guide tracks remain unchanged.

## Route registry

Published:

- `/role-governance`

Planned and hidden:

- `/role-governance/privileged-identity-management`
- `/role-governance/role-assignable-groups`
- `/role-governance/custom-roles-and-scope`

## Files added

- `src/pages/role-governance/RoleGovernance.jsx`
- `src/pages/role-governance/RoleGovernanceFoundationSections.jsx`
- `src/pages/role-governance/RoleGovernanceAssignmentSections.jsx`
- `src/pages/role-governance/RoleGovernanceControlSections.jsx`
- `src/pages/role-governance/RoleGovernanceOperationsSections.jsx`
- `src/pages/role-governance/roleGovernanceData.js`
- `src/pages/role-governance/RoleGovernance.css`
- `src/pages/KnowledgeHubs.css`
- `src/pages/service-principals/KnowledgeGuideBreadcrumbs.css`
- `docs/SESSION_NOTES_2026-09-19_ROLE_GOVERNANCE.md`

## Files modified

- `src/App.jsx`
- `src/components/Nav.jsx`
- `src/data/sitePages.js`
- `src/pages/Knowledge.jsx`
- `src/pages/service-principals/KnowledgeGuideLayout.jsx`
- `docs/KNOWLEDGE_ARCHITECTURE.md`
- `public/sitemap.xml`
- `public/llms.txt`

## Preview QA checklist

- [ ] Direct-load `/role-governance`
- [ ] Confirm `/knowledge` shows two reference hubs
- [ ] Search Knowledge for `PIM`, `role assignment`, and `scope`
- [ ] Confirm planned role-governance child pages remain absent
- [ ] Confirm Knowledge navigation is active on `/role-governance`
- [ ] Review the governance equation on desktop and mobile
- [ ] Review role-system, assignment-state, Graph-record, PIM, group, emergency-access, and disposition layouts
- [ ] Test every copy button and horizontal code block
- [ ] Validate light and dark themes
- [ ] Verify title, canonical URL, TechArticle, BreadcrumbList, FAQPage, sitemap, llms, and source links
- [ ] Confirm existing Service Principal guide breadcrumbs and related-hub links still work after layout generalization

## Next planned sequence

1. PIM and eligible assignments
2. Role-assignable groups and delegated administration
3. Custom roles, scope, and Administrative Units
4. Decide whether the next major cluster is Microsoft Purview administration
