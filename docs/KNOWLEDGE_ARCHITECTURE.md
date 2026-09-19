# SecRole Knowledge Architecture

Last updated: September 19, 2026

## Purpose

SecRole knowledge content uses a **library → hub → focused guide** model.

- `/knowledge` is the public library index. It organizes complete content by administrator task and links to SecRole tools.
- A hub explains the complete mental model for one domain.
- Focused child guides expand procedures, decision trees, screenshots, commands, migrations, governance workflows, and troubleshooting scenarios.

Published domain hubs:

- `/service-principals` — application objects, service principals, workload identities, authentication, permissions, and lifecycle
- `/role-governance` — Microsoft Entra role definitions, assignments, PIM, groups, scope, emergency access, and recurring governance

A hub must remain useful on its own. Child guides deepen one task rather than remove essential explanation from the hub.

## Route registry

`src/data/sitePages.js` is the source of truth for published and planned routes.

- `status: "published"` includes a route in generated discovery files and public indexes.
- `status: "planned"` reserves a content idea but keeps it out of the sitemap, knowledge library, and public guide grids.
- `parentId` creates the hub-and-spoke relationship.
- `searchIntent` documents the question the page is meant to answer.
- `guideTags` supplies short task labels for cards.
- `knowledgeTrack` groups published focused guides on `/knowledge`.
- `knowledgeOrder` provides stable display ordering for hubs and guides.
- `knowledgeLabel` supplies a visitor-facing card type such as Reference hub or Governance guide.

The build runs `scripts/generate-seo-files.mjs`, which validates published routes and creates:

- `public/sitemap.xml`
- `public/robots.txt`
- `public/llms.txt`

After Vite builds, `scripts/generate-route-entrypoints.mjs` creates an extensionless static HTML entrypoint for every published `knowledge-index`, `knowledge-hub`, and `knowledge-guide` route. The entrypoint contains route-specific title, description, canonical URL, social metadata, and page-level structured data before React loads.

Do not add unfinished routes to discovery files or link users to placeholder pages.

## Knowledge library

The public library is:

- `/knowledge` — published knowledge index

It currently contains:

- Two complete reference hubs
- Seven focused Service Principal and workload-identity guides
- Search across published titles, descriptions, search intent, keywords, and tags
- Three task tracks for focused guides:
  - Understand the identity and permission model
  - Build and migrate workload identities
  - Operate and govern durable access
- Links to the Role Library, Overlap Analyzer, AI Advisor, and Updates pages

The top navigation uses **Knowledge** as the broader destination. It remains active while the visitor is on `/knowledge`, either published hub, or any child guide beneath those hubs.

## Service Principal content cluster

| Route | Status | Track | Primary intent |
|---|---|---|---|
| `/service-principals` | Published hub | Start here | Understand the complete object, ID, consent, authentication, governance, and troubleshooting model |
| `/service-principals/identifiers` | Published guide | Understand | Know whether a field needs appId, application Object ID, service principal Object ID, tenant ID, app-role ID, or credential ID |
| `/service-principals/permissions-and-consent` | Published guide | Understand | Reconcile requested permissions, admin consent, app-role assignments, OAuth grants, token claims, and resource authorization |
| `/service-principals/managed-identities` | Published guide | Build & migrate | Choose and implement managed identity or workload identity federation |
| `/service-principals/mfa-service-account-migration` | Published guide | Build & migrate | Discover user-based Azure automation affected by mandatory MFA and migrate it to a workload identity |
| `/service-principals/troubleshooting` | Published guide | Operate & govern | Diagnose object lookup, authentication, consent, authorization, assignment, Conditional Access, logging, and recovery failures |
| `/service-principals/security-review` | Published guide | Operate & govern | Perform a repeatable ownership, provenance, privilege, credential, activity, risk, and control review |
| `/service-principals/credential-lifecycle` | Published guide | Operate & govern | Inventory, prioritize, rotate, contain, and retire application secrets and certificates safely |

## Microsoft Entra Role Governance cluster

| Route | Status | Primary intent |
|---|---|---|
| `/role-governance` | Published hub | Understand effective Microsoft Entra administrator access across definitions, principals, direct and group assignments, PIM schedules, scope, controls, emergency access, and evidence |
| `/role-governance/privileged-identity-management` | Planned guide | Configure eligible assignments, activation controls, approvers, notifications, reviews, and audit evidence |
| `/role-governance/role-assignable-groups` | Planned guide | Govern role-assignable group ownership, membership, PIM for Groups, and delegated administration |
| `/role-governance/custom-roles-and-scope` | Planned guide | Design custom role definitions and assign them at tenant, Administrative Unit, or supported directory-resource scope |

The initial hub is intentionally complete before the child guides are published. Planned child routes remain hidden and unlinked.

## Role-governance content contract

Role-governance content must preserve these distinctions:

- Microsoft Entra roles vs. Azure RBAC roles vs. Microsoft Purview role groups
- Security principal vs. role definition vs. assignment
- Direct vs. group-based vs. inherited access
- Active vs. eligible vs. activated state
- Permanent vs. time-bound duration
- Tenant vs. Administrative Unit vs. resource vs. app-specific scope
- Assignment record vs. schedule vs. effective schedule instance
- Role-assignable group membership vs. ordinary group membership
- Standing privileged access vs. emergency-access exceptions
- Built-in role selection vs. custom role design

A review should explain the **principal, role, scope, state, duration, controls, inheritance path, and evidence** together.

## Credential-lifecycle content contract

Credential-lifecycle guidance must preserve these distinctions:

- Application-object credentials vs. service-principal-object credentials
- Directory credential metadata vs. the external secret value or private key
- Client-authentication certificates vs. SAML token-signing certificates
- Planned overlap rotation vs. compromise containment
- Credential expiration vs. access-token expiration
- Credential removal vs. authorization removal
- Tenant-default app-management policy vs. object-specific policy
- Read-only inventory vs. state-changing rotation examples

The preferred authentication hierarchy remains:

1. Managed identity where supported
2. Workload identity federation for trusted OIDC workloads
3. Certificate-backed service principal when a reusable credential is required
4. Short-lived client secret only as a compatibility bridge

## Cross-entry-point rule for high-impact changes

A major platform change can have one authoritative guide plus smaller entry points elsewhere in SecRole.

For mandatory Azure MFA and user-based automation:

- The authoritative page is `/service-principals/mfa-service-account-migration`.
- The Service Principals hub contains a migration warning under Authentication methods.
- The Troubleshooting guide links MFA and claims-challenge failures to the migration page.
- The Updates page contains a high-impact migration card that links to the permanent guide.
- The Knowledge library includes the migration guide in the Build & migrate track.

The smaller entry points summarize and route. They do not duplicate the complete runbook.

## Page contract

Every published knowledge page should include:

1. One clear H1 that matches the reader's problem.
2. A concise answer near the top before deeper detail.
3. A visible last-reviewed date.
4. Route-specific title, description, canonical URL, social metadata, and structured data through `PageMeta`.
5. Standard crawlable links back to `/knowledge`, its parent hub, and relevant sibling guides or tools.
6. Primary-source references, normally Microsoft Learn, Microsoft Graph, Azure, or product documentation.
7. Read-only investigation commands before destructive or state-changing examples.
8. Explicit distinctions between authorization systems, objects, principals, scopes, requested configuration, granted access, effective state, runtime evidence, and resource-side authorization.
9. Responsive tables, cards, diagrams, and code blocks that remain usable on mobile.
10. No quiz, filler, or thin content added only to target a keyword.

## Internal-linking rules

- `/knowledge` links to every published hub and focused guide.
- Hubs link back to the library and to relevant SecRole tools.
- A hub displays only published child guides; planned routes remain hidden.
- Every child guide links to `/knowledge`, its parent hub, and relevant siblings.
- Link text describes the destination; avoid generic text such as “click here.”

## Publishing a new guide

1. Add or update the page in `src/data/sitePages.js` with a unique path and `status: "planned"` while drafting.
2. Assign future `knowledgeTrack`, `knowledgeOrder`, `knowledgeLabel`, and `guideTags` values before publication.
3. Build the React page and route.
4. Add useful links from its parent hub and relevant sibling pages.
5. Reuse `PageMeta` or `KnowledgeGuideLayout` for route metadata and JSON-LD.
6. Verify direct HTTP loading and meaningful public content.
7. Change status to `published` and add truthful `lastModified`, priority, and display metadata.
8. Run the full build so route validation, sitemap, robots, llms, and static entrypoints refresh.
9. Test mobile layout, keyboard navigation, search discovery, copy controls, canonical URL, structured data, and source links.
10. Inspect the deployed route in Google Search Console and submit the sitemap when needed.

## SEO principles

- Write for the administrator's task first; search visibility follows useful, complete content.
- Use one canonical URL for each distinct topic.
- Keep titles and descriptions unique and descriptive.
- Use logical, stable, human-readable paths.
- Publish only pages that add information beyond the hub.
- Keep `lastModified` truthful.
- Sitemaps support discovery but do not guarantee indexing or ranking.
- JavaScript pages must remain publicly accessible and should be tested with rendered HTML in Search Console.

## Next content sequence

1. Publish the Microsoft Entra Role Governance reference hub.
2. Publish the PIM and eligible-assignment guide.
3. Publish the role-assignable groups and delegated-administration guide.
4. Publish the custom roles, scope, and Administrative Units guide.
5. Decide whether the next major cluster is Microsoft Purview administration or another high-demand Entra governance area.
6. Continue improving role-drift quality and evaluate full static generation or server rendering as the library grows.

## Future platform decision

Route-specific static entrypoints provide final metadata in the initial HTML response today, while React renders the complete page body. As the library grows, evaluate full static generation or server rendering so complete article and index content is present before JavaScript executes. Preserve the route registry and URL structure during that migration.
