# SecRole Knowledge Architecture

Last updated: October 3, 2026

## Purpose

SecRole knowledge content uses a **library → hub → focused guide** model.

- `/knowledge` is the public library index. It organizes complete content by administrator task and links to SecRole tools.
- A hub explains the complete mental model for one domain.
- Focused child guides expand procedures, decision trees, commands, migrations, governance workflows, and troubleshooting scenarios.

Published domain hubs:

- `/service-principals` — application objects, service principals, workload identities, authentication, permissions, and lifecycle
- `/role-governance` — Microsoft Entra role definitions, assignments, PIM, groups, custom roles, scope, emergency access, and recurring governance
- `/purview-governance` — Microsoft Purview role groups, mapped Entra roles, Administrative Units, temporary access, eDiscovery, sensitive content, Data Map, and Unified Catalog governance

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
- `knowledgeLabel` supplies a visitor-facing card type such as Reference hub, PIM guide, Group governance guide, or Scope design guide.

`src/data/pageDisplay.js` supplies concise card and breadcrumb labels when an article H1 is too long for navigation. Canonical titles, metadata, and page headings remain in `sitePages.js`.

The build runs `scripts/generate-seo-files.mjs`, which validates published routes and creates:

- `public/sitemap.xml`
- `public/robots.txt`
- `public/llms.txt`

After Vite builds, `scripts/generate-route-entrypoints.mjs` creates an extensionless static HTML entrypoint for every published `knowledge-index`, `knowledge-hub`, and `knowledge-guide` route. The entrypoint contains route-specific title, description, canonical URL, social metadata, and page-level structured data before React loads.

Do not add unfinished routes to discovery files or link users to placeholder pages.

## Knowledge library

The public library is:

```text
/knowledge
```

It currently contains:

- Three complete reference hubs
- Ten focused guides
- Search across published titles, descriptions, search intent, keywords, and tags
- Four task tracks for focused guides:
  - Understand the identity and permission model
  - Build and migrate workload identities
  - Operate and govern durable access
  - Govern privileged access
- Links to the Role Library, Overlap Analyzer, AI Advisor, and Updates pages

The top navigation uses **Knowledge** as the broader destination. It remains active while the visitor is on `/knowledge`, any published hub, or any child route beneath those hubs.

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

| Route | Status | Track | Primary intent |
|---|---|---|---|
| `/role-governance` | Published hub | Start here | Understand effective Microsoft Entra administrator access across definitions, principals, direct and group assignments, PIM schedules, custom roles, scope, controls, emergency access, and evidence |
| `/role-governance/privileged-identity-management` | Published guide | Govern privileged access | Configure, inventory, review, troubleshoot, and migrate privileged role access to governed eligibility and activation |
| `/role-governance/role-assignable-groups` | Published guide | Govern privileged access | Create, inventory, govern, troubleshoot, and retire role-assignable groups, ownership, membership, PIM for Groups, and delegated control paths |
| `/role-governance/custom-roles-and-scope` | Published guide | Govern privileged access | Design, inventory, scope, test, troubleshoot, and retire custom roles, Administrative Units, restricted boundaries, and application-specific delegation |

The Role Governance cluster is complete as one hub plus three focused guides. Future pages should extend a distinct administrator task rather than duplicate these models.

## Microsoft Purview Governance cluster

| Route | Status | Track | Primary intent |
|---|---|---|---|
| `/purview-governance` | Published hub | Start here | Understand effective Purview access across role groups, Entra roles, scope, time controls, cases, content roles, compliance boundaries, catalog roles, Data Map, and source permissions |
| `/purview-governance/role-groups-and-scoping` | Planned guide | Future | Govern role groups, members, PIM for Groups, temporary assignments, Entra precedence, and Administrative Unit scope |
| `/purview-governance/ediscovery-permissions` | Planned guide | Future | Govern eDiscovery Manager and Administrator access, case membership, service principals, searches, exports, and compliance boundaries |
| `/purview-governance/sensitive-content-access` | Planned guide | Future | Review Content Explorer, communications, insider-risk, audit, search, export, and investigation access as sensitive-data permissions |
| `/purview-governance/data-governance-roles` | Planned guide | Future | Govern tenant role groups, Unified Catalog roles, governance domains, Data Map domains and collections, and source-resource access |

The Purview hub is complete and independently useful. Planned child routes remain hidden until each guide provides additional operational depth.

## Role-governance content contract

Role-governance content must preserve these distinctions:

- Microsoft Entra roles vs. Azure RBAC roles vs. application app roles vs. Microsoft Purview role groups
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

## PIM content contract

PIM guidance must preserve these distinctions:

- Permanent active vs. time-bound active vs. permanent eligible vs. time-bound eligible vs. activated access
- Role-management policy vs. policy assignment vs. role assignment
- Configuration schedules and requests vs. effective schedule instances
- MFA claim reuse vs. explicit reauthentication through authentication context
- Authentication-context controls for activation vs. Conditional Access controls for role use after activation
- Approval requirement vs. approver availability and escalation design
- Ticket metadata vs. actual ticket-system validation
- Eligible access vs. a current active role assignment
- Planned standing-access migration vs. emergency-access exceptions
- CorrelationId vs. roleAssignmentRequestId for asynchronous audit correlation

The PIM guide follows this migration order:

1. Inventory all effective access paths.
2. Reduce role and scope before changing state.
3. Create eligibility while the current active path remains available.
4. Configure activation and assignment policy.
5. Test requester, approver, authentication, notification, and target task.
6. Prove expiration and audit evidence.
7. Remove the old standing assignment.
8. Monitor early production use and schedule recurring review.

## Role-assignable group content contract

Role-assignable group guidance must preserve these distinctions:

- Role-assignable group vs. ordinary security or Microsoft 365 group
- `isAssignableToRole` creation property vs. PIM for Groups management
- Direct role assignment vs. role inherited through a group
- Active membership vs. eligible membership
- Active ownership vs. eligible ownership
- PIM for Microsoft Entra roles vs. PIM for Groups
- Group role state vs. member or owner state
- Role assignment scope vs. group membership scope
- Directory relationship activation vs. target-service authorization readiness
- `Group.ReadWrite.All` vs. `RoleManagement.ReadWrite.Directory`
- Eligible ownership vs. an active recovery-owner path
- One privileged trust boundary vs. a convenience group that combines unrelated roles or teams

A privileged-group review must identify:

1. The group object and immutable creation properties.
2. Every active and eligible role assignment and scope.
3. Every active and eligible member and owner.
4. Who can change membership, ownership, role assignment, and PIM policy.
5. Which approvers and recovery paths remain usable.
6. Evidence from directory audit, PIM, sign-in, provisioning, and target-resource logs.
7. The final disposition and proof that the change produced the expected effective access.

## Custom roles and scoped administration content contract

Custom-role and scope guidance must preserve these distinctions:

- Microsoft Entra custom directory role vs. Azure custom RBAC role vs. application app role vs. Purview role group
- Role definition Object ID vs. template ID
- `allowedResourceActions` in the definition vs. `directoryScopeId` in the assignment
- Built-in-role selection vs. custom-role creation
- Permission-set reduction vs. assignment-scope reduction
- Tenant container scope vs. Administrative Unit container scope vs. one-resource scope
- Administrative Unit group membership vs. membership of users or devices inside that group
- Administrative Unit management scope vs. general directory visibility
- Regular Administrative Unit vs. Restricted Management Administrative Unit
- Scoped management permission vs. tenant-scoped directory-read capability for service principals and guests
- Administrative delegation over an application object vs. runtime app roles, consent, and API authorization
- Required positive operation vs. prohibited and out-of-scope negative tests

The custom-role design order is:

1. Document the exact business task and target object.
2. Confirm the correct authorization system.
3. Select the least-privileged built-in role when possible.
4. Test whether narrower scope solves the requirement.
5. Identify only the required supported custom actions.
6. Create and independently review the definition.
7. Assign it at the narrowest workable scope.
8. Govern the principal through PIM and role-assignable groups where appropriate.
9. Test required, prohibited, and out-of-scope operations.
10. Monitor first use, review regularly, and retire stale definitions and assignments.

## Purview-governance content contract

Microsoft Purview guidance must preserve these distinctions:

- Purview role vs. role group vs. member
- Purview role group vs. Microsoft Entra role mapping
- Scoped Purview access vs. overlapping unscoped Entra capability
- Direct user assignment vs. security-group assignment
- Temporary assignment vs. PIM-for-Groups activation
- Administrative Unit scope vs. unsupported or tenant-wide features
- Portal visibility vs. list visibility vs. content visibility
- Role capability vs. eDiscovery case membership
- Case membership vs. searchable-content boundary
- Compliance investigation permission vs. Exchange Online administration
- Unified Catalog role vs. Data Map domain or collection permission
- Purview metadata access vs. underlying Azure, Fabric, or source-resource access
- Configuration access vs. sensitive content, search, export, purge, prompt, message, or investigation access

A Purview review must explain the **identity, permission plane, capability, scope, state and duration, content sensitivity, recovery path, and evidence** together.

The Purview review order is:

1. Define the exact solution task and target data.
2. Identify the permission plane.
3. Inventory all direct, group, PIM, temporary, and Entra-derived access paths.
4. Inspect every role in the role group.
5. Validate Administrative Unit, policy, case, boundary, domain, collection, and resource scope.
6. Rate metadata, content, message, prompt, search, export, and investigation sensitivity separately.
7. Review expiration and activation controls.
8. Confirm ownership and recovery.
9. Correlate actual use and audit evidence.
10. Retain, separate, scope, time-bound, reduce sensitive-content capability, or remove the path.
11. Prove required and denied behavior.
12. Preserve evidence and schedule review.

The permanent domain contract is stored at:

```text
docs/PURVIEW_GOVERNANCE_CLUSTER.md
```

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

For Microsoft Entra privileged access:

- `/role-governance` is the complete reference hub.
- `/role-governance/privileged-identity-management` is the focused authority for eligible role access and activation policy.
- `/role-governance/role-assignable-groups` is the focused authority for indirect group-based access, ownership, membership, and PIM for Groups.
- `/role-governance/custom-roles-and-scope` is the focused authority for permission-set design, Administrative Units, resource scope, and restricted management boundaries.
- The Knowledge library groups all three pages under Govern privileged access.

For Microsoft Purview access:

- `/purview-governance` is the complete reference hub.
- The Role Library remains the searchable inventory of Microsoft Purview roles and role groups.
- The Role Governance hub explains mapped Microsoft Entra roles, PIM, security-group inheritance, and Administrative Units.
- Future focused pages deepen role-group scoping, eDiscovery, sensitive-content access, and data-governance tasks.
- Updates points high-impact Microsoft permission changes to the permanent hub or focused guide.

Smaller entry points summarize and route. They do not duplicate the complete runbook.

## Page contract

Every published knowledge page should include:

1. One clear H1 that matches the reader's problem.
2. A concise answer near the top before deeper detail.
3. A visible last-reviewed date.
4. Route-specific title, description, canonical URL, social metadata, and structured data through `PageMeta`.
5. Standard crawlable links back to `/knowledge`, its parent hub, and relevant sibling guides or tools.
6. Primary-source references, normally Microsoft Learn, Microsoft Graph, Exchange Online, Azure, or product documentation.
7. Read-only investigation commands before destructive or state-changing examples.
8. Explicit distinctions between authorization systems, objects, principals, scopes, assignment state, direct and inherited access, sensitive data, runtime evidence, and resource-side authorization.
9. Responsive tables, cards, diagrams, and code blocks that remain usable on mobile.
10. No quiz, filler, or thin content added only to target a keyword.

## Internal-linking rules

- `/knowledge` links to every published hub and focused guide.
- Hubs link back to the library and to relevant SecRole tools.
- A hub displays or links only published child guides; planned routes remain hidden.
- Every child guide links to `/knowledge`, its parent hub, and relevant siblings or tools.
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

1. Review and publish the Microsoft Purview Administration and Role Governance hub.
2. Build the Purview Role Groups, Administrative Units, and Temporary Access guide.
3. Build the Purview eDiscovery Permissions, Cases, and Compliance Boundaries guide.
4. Build the Purview Sensitive Content Access and Investigation Roles guide.
5. Build the Unified Catalog and Data Map Role Governance guide.
6. Review the completed Purview cluster for cross-linking, command consistency, mobile behavior, and duplicate content.
7. Continue monitoring and improving role-drift quality as Microsoft adds or changes Entra and Purview roles.
8. Evaluate full static generation or server rendering as the library grows.

## Future platform decision

Route-specific static entrypoints provide final metadata in the initial HTML response today, while React renders the complete article and index body. As the knowledge library grows, evaluate full static generation or server rendering so complete content is present before JavaScript executes. Preserve the route registry and URL structure during that migration.
