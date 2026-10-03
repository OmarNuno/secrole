# SecRole Session Notes — Custom Roles, Scope, and Administrative Units

Date: October 2, 2026

## Repository state

- PR #15, **Publish role-assignable groups and delegated administration guide**, was merged.
- Current `main` at the start of this work: `41a5868`
- New branch: `feature/custom-roles-and-scope`

## Pull request and preview

- Pull request: [#16 — Publish Microsoft Entra custom roles scope and Administrative Units guide](https://github.com/OmarNuno/secrole/pull/16)
- Implementation state: one consolidated branch commit above `main`
- Vercel deployment status: **Ready / successful**
- Preview root: https://secrole-git-feature-custom-roles-and-scope-o-3026s-projects.vercel.app
- Knowledge preview: https://secrole-git-feature-custom-roles-and-scope-o-3026s-projects.vercel.app/knowledge
- Role Governance hub preview: https://secrole-git-feature-custom-roles-and-scope-o-3026s-projects.vercel.app/role-governance
- Custom Roles and Scope guide preview: https://secrole-git-feature-custom-roles-and-scope-o-3026s-projects.vercel.app/role-governance/custom-roles-and-scope

## Objective

Publish the third focused Microsoft Entra Role Governance child guide:

- `/role-governance/custom-roles-and-scope`

The guide completes the initial Role Governance cluster by explaining how to reduce privilege across both dimensions that administrators control directly:

1. The actions included in the role definition
2. The scope where those actions can be exercised

It also covers Administrative Units, Restricted Management Administrative Units, application-specific delegation, service-principal read requirements, evidence collection, negative testing, recovery, and troubleshooting.

## New guide structure

1. Least-privilege equation: actions × scope × principal × state/time × evidence
2. Built-in role, scoped built-in role, or custom-role decision sequence
3. Microsoft Entra custom roles vs. Azure custom roles vs. app roles vs. Purview role groups
4. `unifiedRoleDefinition` anatomy and identifier distinctions
5. Tenant, Administrative Unit, and supported Microsoft Entra resource scopes
6. Administrative Unit behavior and the group-member scope trap
7. Service principal and guest directory-read requirements
8. Regular vs. Restricted Management Administrative Units
9. Application-registration and Enterprise Application delegation
10. Read-only custom-role definition and assignment inventory
11. Read-only Administrative Unit inventory
12. Automated custom-role and scope findings
13. Twelve-step design and review workflow
14. Clearly labeled state-changing examples
15. Authorization-order troubleshooting and operating cadence
16. FAQ structured data and official Microsoft sources

## Important distinctions preserved

- Microsoft Entra custom directory role vs. Azure custom RBAC role
- Administrator delegation vs. application runtime app roles and API grants
- Role definition Object ID vs. template ID
- `allowedResourceActions` vs. assignment `directoryScopeId`
- Built-in role selection vs. custom-role creation
- Permission reduction vs. scope reduction
- Tenant scope vs. Administrative Unit container scope vs. one-resource scope
- Group object membership in an AU vs. membership of users inside that group
- Administrative Unit management scope vs. directory visibility
- Regular Administrative Unit vs. Restricted Management Administrative Unit
- Scoped management rights vs. tenant-scoped directory-read capability for service principals and guests
- Positive task validation vs. prohibited and out-of-scope negative testing

## Read-only tooling

The page includes Microsoft Graph PowerShell for:

- Pagination-safe collection retrieval
- Custom role definition inventory
- Active and eligible custom-role assignment inventory
- Administrative Unit properties, members, and scoped role counts
- Prioritized findings for tenant-wide assignments, permanent-active access, high-impact actions, missing descriptions, stale definitions, service-principal read dependencies, AU group-member assumptions, and restricted-AU workflow risks

Exports:

- `Entra_Custom_Role_Definitions_<timestamp>.csv`
- `Entra_Custom_Role_Assignments_<timestamp>.csv`
- `Entra_Administrative_Units_<timestamp>.csv`
- `Entra_Custom_Role_Findings_<timestamp>.csv`

## State-changing examples

The guide visibly labels examples that:

- Create a Microsoft Entra custom role definition
- Assign an existing custom role at tenant, Administrative Unit, or supported resource scope
- Create a regular or Restricted Management Administrative Unit
- Define a custom Enterprise App assignment operator role

The page requires definition review, scope review, principal review, negative testing, rollback, and evidence before production deployment.

## Knowledge-library behavior

After publication:

- `/knowledge` contains two reference hubs and ten focused guides.
- The **Govern privileged access** track contains:
  - Microsoft Entra PIM Role Settings and Eligible Assignments
  - Role-Assignable Groups and Delegated Role Administration
  - Microsoft Entra Custom Roles, Scope, and Administrative Units
- The Role Governance hub links directly to all three child guides.
- PIM and Role-Assignable Groups link to the new Custom Roles and Scope guide.
- The Role Governance cluster is complete as one hub plus three focused guides.

## Files added

- `src/pages/role-governance/CustomRolesScopeGuide.jsx`
- `src/pages/role-governance/CustomRolesScopeFoundationSections.jsx`
- `src/pages/role-governance/CustomRolesScopeAdminUnitsSections.jsx`
- `src/pages/role-governance/CustomRolesScopeEvidenceSections.jsx`
- `src/pages/role-governance/CustomRolesScopeOperations.jsx`
- `src/pages/role-governance/customRolesScopeData.js`
- `src/pages/role-governance/customRolesScopeInventoryCode.js`
- `src/pages/role-governance/customRolesScopeChangeCode.js`
- `src/pages/role-governance/CustomRolesScope.css`
- `src/pages/role-governance/CustomRolesScopeResponsive.css`
- `docs/SESSION_NOTES_2026-10-02_CUSTOM_ROLES_SCOPE.md`

## Files modified

- `src/App.jsx`
- `src/data/sitePages.js`
- `src/pages/Knowledge.jsx`
- `src/pages/role-governance/RoleGovernance.jsx`
- `src/pages/role-governance/PimRoleSettingsGuide.jsx`
- `src/pages/role-governance/RoleAssignableGroupsGuide.jsx`
- `docs/KNOWLEDGE_ARCHITECTURE.md`
- `public/sitemap.xml`
- `public/llms.txt`

## Expected public behavior

- `/role-governance/custom-roles-and-scope` loads directly.
- The Role Governance hub links to all three focused guides.
- `/knowledge` reports ten focused guides.
- The Govern privileged access track contains three guides.
- Knowledge navigation remains active on the new route.
- The route is present in sitemap and llms discovery.

## Validation status

- [x] Branch created from current `main`
- [x] Branch has no merge-base drift
- [x] Changes consolidated into one implementation commit
- [x] Published route added to the central registry
- [x] React route added
- [x] Knowledge Library and sibling cross-links updated
- [x] Sitemap and llms discovery updated
- [x] Knowledge architecture updated
- [x] JavaScript and JSX production build successful through Vercel
- [x] Pull request #16 opened
- [x] Pull request is mergeable
- [x] Vercel preview deployment successful
- [ ] Direct-load the new route in a browser
- [ ] Confirm Knowledge counts and privileged-access track behavior
- [ ] Test copy buttons and horizontal scrolling
- [ ] Review desktop and mobile in light and dark themes
- [ ] Verify title, canonical URL, TechArticle, BreadcrumbList, FAQPage, and official-source links in the rendered preview

## Recommended continuation after merge

1. Review the complete Role Governance cluster as one user journey.
2. Normalize cross-linking, command titles, export naming, source presentation, and mobile behavior across the hub and three guides.
3. Decide whether Microsoft Purview Administration and Role Governance becomes the third SecRole knowledge hub.
4. Continue reviewing the hardened role-drift output as Microsoft adds or changes roles.
