# SecRole Session Notes — Role-Assignable Groups and Delegated Role Administration

Date: September 30, 2026

## Repository state

- PR #14, **Publish Microsoft Entra PIM role settings and eligible assignments guide**, was merged.
- Current `main` at the start of this work: `892a1bf`
- New branch: `feature/role-assignable-groups`

## Pull request and preview

- Pull request: [#15 — Publish role-assignable groups and delegated administration guide](https://github.com/OmarNuno/secrole/pull/15)
- Implementation state: one consolidated branch commit above `main`
- Vercel deployment status: **Ready / successful**
- Preview root: https://secrole-git-feature-role-assignable-groups-o-3026s-projects.vercel.app
- Knowledge preview: https://secrole-git-feature-role-assignable-groups-o-3026s-projects.vercel.app/knowledge
- Role Governance hub preview: https://secrole-git-feature-role-assignable-groups-o-3026s-projects.vercel.app/role-governance
- Role-Assignable Groups guide preview: https://secrole-git-feature-role-assignable-groups-o-3026s-projects.vercel.app/role-governance/role-assignable-groups

## Objective

Publish the second focused Microsoft Entra Role Governance child guide:

- `/role-governance/role-assignable-groups`

The guide explains the complete indirect privileged-access path through a role-assignable group: immutable group design, role assignment, scope, active and eligible membership, active and eligible ownership, PIM for Groups, PIM for Microsoft Entra roles, delegated administration, Graph permission boundaries, evidence, recovery, and troubleshooting.

## New guide structure

1. Complete role-assignable group control path
2. Standing access, eligible-role, and eligible-membership patterns
3. Immutable creation decisions and platform restrictions
4. Ownership as a privileged-access control path
5. Role-assignable groups versus PIM for Groups
6. Recommended just-in-time patterns and target-service propagation
7. Last-active-owner deactivation trap
8. Separation of duties for creation, assignment, membership, approval, review, and recovery
9. Read-only inventory of groups, role paths, active and eligible members, active and eligible owners, and group PIM policy assignments
10. Automated control-path findings
11. Twelve-step review workflow and evidence package
12. Clearly labeled state-changing creation, owner, and member examples
13. Seven-layer troubleshooting order
14. Daily, weekly, monthly, quarterly, and event-driven operating cadence
15. FAQ structured data and official Microsoft sources

## Important distinctions preserved

- Role-assignable group vs. ordinary group
- Role-assignable property vs. PIM for Groups management
- Active group membership vs. eligible group membership
- Active ownership vs. eligible ownership
- PIM for Microsoft Entra roles vs. PIM for Groups
- Direct role assignment vs. role inherited through a group
- Group role state vs. member or owner state
- Directory relationship activation vs. target-service authorization readiness
- `Group.ReadWrite.All` vs. `RoleManagement.ReadWrite.Directory`
- Eligible ownership vs. an active recovery owner
- Eligible access vs. standing access

## Read-only tooling

The page includes Microsoft Graph PowerShell for:

- Pagination-safe collection retrieval
- Role-assignable group inventory
- Active and eligible role assignments for every group
- Directory owner and member inventory
- PIM for Groups active assignment schedule instances
- PIM for Groups eligibility schedule instances
- Group-scoped role-management policy assignments
- Findings for missing owners, single owners, standing access, alternate JIT designs, disabled principals, multiple roles, and unresolved PIM policy evidence

The reports are intentionally layered so large tenants can inventory groups and role paths first, then enrich higher-risk groups with owner, membership, and PIM evidence.

## State-changing examples

The guide visibly labels examples that:

- Create a new role-assignable security group
- Add a group owner
- Add a group member

The page warns that `isAssignableToRole` is immutable and that owner or member changes can create or remove effective administrator access.

## Knowledge-library behavior

After publication:

- `/knowledge` contains two reference hubs and nine focused guides.
- The **Govern privileged access** track contains the PIM guide and the Role-Assignable Groups guide.
- The Role Governance hub links directly to both focused guides.
- The PIM guide links to the new group-governance guide.
- The Custom Roles and Scope route remains planned, hidden, and excluded from discovery files.

## Files added

- `src/pages/role-governance/RoleAssignableGroupsGuide.jsx`
- `src/pages/role-governance/RoleAssignableGroupsFoundationSections.jsx`
- `src/pages/role-governance/RoleAssignableGroupsPimSections.jsx`
- `src/pages/role-governance/RoleAssignableGroupsEvidenceSections.jsx`
- `src/pages/role-governance/RoleAssignableGroupsOperationsSections.jsx`
- `src/pages/role-governance/roleAssignableGroupsData.js`
- `src/pages/role-governance/roleAssignableGroupsCode.js`
- `src/pages/role-governance/RoleAssignableGroups.css`
- `src/pages/role-governance/RoleAssignableGroupsResponsive.css`
- `docs/SESSION_NOTES_2026-09-30_ROLE_ASSIGNABLE_GROUPS.md`

## Files modified

- `src/App.jsx`
- `src/data/sitePages.js`
- `src/pages/Knowledge.jsx`
- `src/pages/role-governance/RoleGovernance.jsx`
- `src/pages/role-governance/PimRoleSettingsGuide.jsx`
- `docs/KNOWLEDGE_ARCHITECTURE.md`
- `public/sitemap.xml`
- `public/llms.txt`

## Expected public behavior

- `/role-governance/role-assignable-groups` loads directly.
- The Role Governance hub links to the PIM and Role-Assignable Groups guides.
- `/knowledge` reports nine focused guides.
- The Govern privileged access track contains two guides.
- Knowledge navigation remains active on the new route.
- `/role-governance/custom-roles-and-scope` remains hidden.

## Validation status

- [x] Branch created from current `main`
- [x] Branch has no merge-base drift
- [x] Changes consolidated into one implementation commit
- [x] Vercel production-style preview build successful
- [x] Pull request #15 opened
- [x] Pull request is mergeable
- [x] Route registry publishes the new guide
- [x] Sitemap and llms discovery include the route
- [x] Custom Roles and Scope remains planned and excluded
- [ ] Direct-load the guide in a browser
- [ ] Confirm Knowledge counts and privileged-access track behavior
- [ ] Test copy buttons and horizontal scrolling
- [ ] Review desktop and mobile in light and dark themes
- [ ] Verify title, canonical URL, TechArticle, BreadcrumbList, FAQPage, and official source links in the rendered preview

## Recommended continuation after merge

1. Publish `/role-governance/custom-roles-and-scope`.
2. Review the complete Role Governance cluster as one user journey.
3. Decide whether Microsoft Purview administration becomes the third major SecRole knowledge hub.
4. Continue monitoring the hardened role-drift workflow and review newly detected Microsoft roles.
