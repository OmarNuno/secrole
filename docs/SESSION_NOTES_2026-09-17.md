# SecRole Session Notes — September 17, 2026

## Session objective

Turn the Service Principals reference into the first SecRole knowledge cluster by publishing two focused child guides, replacing the internal-looking roadmap at the bottom of the hub, and preserving enough implementation context to continue cleanly in the next session.

## Repository state at the start

- PR #2, the role-drift update, was merged into `main` as commit `749b983`.
- PR #3, the complete Service Principals reference hub, was merged into `main` as commit `d66d67f`.
- The completed feature branches were deleted after merge.
- This work started from the updated `main` branch on:
  - `feature/service-principal-guides`

## Pull request and preview

- Pull request: [#4 — Publish Service Principal identifier and permissions guides](https://github.com/OmarNuno/secrole/pull/4)
- Branch: `feature/service-principal-guides`
- First implementation commit: `586d5d6`
- Vercel deployment status: **Ready / successful**
- Preview root: https://secrole-git-feature-service-principal-guides-o-3026s-projects.vercel.app
- Hub preview: https://secrole-git-feature-service-principal-guides-o-3026s-projects.vercel.app/service-principals
- Identifier guide preview: https://secrole-git-feature-service-principal-guides-o-3026s-projects.vercel.app/service-principals/identifiers
- Permissions guide preview: https://secrole-git-feature-service-principal-guides-o-3026s-projects.vercel.app/service-principals/permissions-and-consent

## What was completed in this branch

### 1. Service Principals hub guide map

The main `/service-principals` article remains intact. Only the final roadmap-style section is replaced at runtime with a published-guide grid.

Public copy:

- Eyebrow: `Deep-dive guides`
- Heading: `Go deeper when the task gets specific`
- Description: guides are presented as focused task pages for portal steps, Graph examples, PowerShell, decision trees, and repeatable workflows.

Behavior:

- Raw route strings are removed from the visible cards.
- Dashed placeholder cards are replaced by solid, fully clickable guide cards.
- Only child pages marked `status: "published"` in `src/data/sitePages.js` are displayed.
- Planned pages remain in the route registry but are not rendered as dead links or included in discovery files.

Implementation note:

- `ServicePrincipalsRoute.jsx` wraps the established hub and portals the published-guide grid into `#related-guides`.
- `ServicePrincipalsGuideMap.css` hides only the old roadmap children and styles the new cards.
- A future hub cleanup can fold this small wrapper directly into `ServicePrincipals.jsx`; it is intentionally isolated now to avoid changing the 10/10 main article.

### 2. Identifier guide

Published route:

- `/service-principals/identifiers`

Page title:

- `Application ID vs. Object ID vs. Tenant ID in Microsoft Entra`

Coverage:

- The 15-second identifier decision rule
- Application (client) ID / `appId`
- Application Object ID / `application.id`
- Service Principal Object ID / `servicePrincipal.id`
- Directory (tenant) ID
- App registrations vs. Enterprise applications portal map
- Graph object-ID paths vs. `appId` alternate-key paths
- Azure RBAC `principalId`
- `requiredResourceAccess.resourceAppId`
- `appRoleAssignment` identifier fields
- Credential `keyId` vs. secret value
- Multitenant same-`appId`, different-object-ID example
- Read-only Graph PowerShell, Azure CLI, and Graph REST lookup commands
- Common identifier mistakes
- FAQ schema, breadcrumbs, TechArticle schema, primary sources, and sibling/hub links

### 3. Permissions and Admin Consent guide

Published route:

- `/service-principals/permissions-and-consent`

Page title:

- `Service Principal Permissions and Admin Consent`

Coverage:

- Four-stage access model: requested, consented, recorded, presented/enforced
- Delegated permissions vs. application permissions
- `requiredResourceAccess`
- `appRoleAssignments`
- `oauth2PermissionGrants`
- `appRoleAssignments` vs. `appRoleAssignedTo` direction
- User consent vs. administrator consent
- Admin consent vs. Enterprise Application assignment requirement
- Token evidence: `aud`, `tid`, `appid`, `azp`, `oid`, `sub`, `scp`, and `roles`
- Read-only Microsoft Graph PowerShell and REST investigation commands
- JWT payload decoding with an explicit warning that decoding is not validation
- Repeatable authorization troubleshooting sequence
- FAQ schema, breadcrumbs, TechArticle schema, primary sources, and sibling/hub links

### 4. Shared knowledge-guide framework

Reusable files were added for future guides:

- `KnowledgeGuideLayout.jsx`
- `KnowledgeGuideComponents.jsx`
- `KnowledgeGuide.css`
- `KnowledgeGuideCards.css`
- `KnowledgeGuideOperational.css`

The framework provides:

- Route-specific metadata and canonical URLs
- TechArticle, BreadcrumbList, and optional FAQPage JSON-LD
- Shared hero and breadcrumb treatment
- Visible last-reviewed dates
- Sticky desktop table of contents
- Related-guide and hub links
- Official-source lists
- Copyable command blocks
- Responsive tables, cards, FAQ accordions, and code layouts
- Keyboard focus styles and reduced-motion handling

### 5. Route and SEO registry

`src/data/sitePages.js` now marks the two guides as published and includes:

- Unique titles and descriptions
- Search intent
- Keywords
- Last-modified dates
- Sitemap priorities
- Guide-card tags

Generated discovery files were refreshed:

- `public/sitemap.xml`
- `public/llms.txt`

`docs/KNOWLEDGE_ARCHITECTURE.md` was updated to document the published-only card rule and the current Service Principal cluster.

## Files in this branch

### Modified

- `src/App.jsx`
- `src/data/sitePages.js`
- `docs/KNOWLEDGE_ARCHITECTURE.md`
- `public/sitemap.xml`
- `public/llms.txt`

### Added

- `src/pages/service-principals/ServicePrincipalsRoute.jsx`
- `src/pages/service-principals/ServicePrincipalsGuideMap.css`
- `src/pages/service-principals/KnowledgeGuideLayout.jsx`
- `src/pages/service-principals/KnowledgeGuideComponents.jsx`
- `src/pages/service-principals/KnowledgeGuide.css`
- `src/pages/service-principals/KnowledgeGuideCards.css`
- `src/pages/service-principals/KnowledgeGuideOperational.css`
- `src/pages/service-principals/IdentifiersGuide.jsx`
- `src/pages/service-principals/identifierGuideData.js`
- `src/pages/service-principals/IdentifierOverviewSections.jsx`
- `src/pages/service-principals/IdentifierPortalFieldSections.jsx`
- `src/pages/service-principals/IdentifierOperationsSections.jsx`
- `src/pages/service-principals/PermissionsConsentGuide.jsx`
- `src/pages/service-principals/permissionsGuideData.js`
- `src/pages/service-principals/PermissionsModelSections.jsx`
- `src/pages/service-principals/PermissionsDirectoryConsentSections.jsx`
- `src/pages/service-principals/PermissionsRuntimeSections.jsx`
- `docs/SESSION_NOTES_2026-09-17.md`

## Validation status

- [x] Git tree and commit created on `feature/service-principal-guides`
- [x] Pull request opened against `main`
- [x] Vercel preview build successful
- [ ] Direct-load both new routes in a browser
- [ ] Confirm the hub shows only the two published guide cards
- [ ] Review Identifier guide on desktop and mobile
- [ ] Review Permissions guide on desktop and mobile
- [ ] Test copy buttons
- [ ] Test sticky table-of-contents behavior
- [ ] Verify canonical URLs and page titles in the rendered document
- [x] Sitemap includes both new routes in the committed generated file
- [x] Planned routes remain absent from committed sitemap and public guide data

## Recommended continuation order

1. Review the Vercel preview for the hub and both guide routes.
2. Correct any visual, copy, command, or mobile issues found in preview.
3. Merge PR #4 only after both guides pass direct-load and responsive checks.
4. Delete `feature/service-principal-guides` after merge.
5. Build the next Service Principal guide in this order:
   - `/service-principals/troubleshooting`
   - `/service-principals/security-review`
   - `/service-principals/managed-identities`
   - `/service-principals/credential-lifecycle`
6. Add a `/knowledge` landing page after approximately four to six complete guides exist.

## Role-drift follow-up identified during this session

The role-drift automation should eventually be improved so read-only access is not automatically treated as Low risk. Read-only access to tenant-wide email, documents, communications, identity data, or sensitive evidence can still be Medium or High risk.

Suggested rubric refinement:

- Low: narrow operational visibility, aggregate reporting, or low-impact metadata
- Medium: broad configuration visibility or sensitive metadata
- High: tenant-wide content, communications, investigation evidence, sensitive identity data, or security data—even when read-only

Also consider allowing newly drafted roles within the same run to reference one another as related roles after IDs are assigned.
