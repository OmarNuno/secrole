# SecRole Knowledge Architecture

Last updated: September 18, 2026

## Purpose

SecRole knowledge content uses a **library → hub → focused guide** model.

- `/knowledge` is the public library index. It organizes complete content by administrator task and links to SecRole tools.
- A hub explains the complete mental model for one domain.
- Focused child guides expand procedures, decision trees, screenshots, commands, migrations, governance workflows, and troubleshooting scenarios.

The first domain hub is:

- `/service-principals` — the complete application object and service principal reference

The hub must remain useful on its own. Child guides expand a task rather than remove essential explanation from the hub.

## Route registry

`src/data/sitePages.js` is the source of truth for published and planned routes.

- `status: "published"` includes a route in generated discovery files and public indexes.
- `status: "planned"` reserves a content idea but keeps it out of the sitemap, knowledge library, and hub guide grid.
- `parentId` creates the hub-and-spoke relationship.
- `searchIntent` documents the question the page is meant to answer.
- `guideTags` supplies short task labels for guide cards.
- `knowledgeTrack` groups published guides on `/knowledge`.
- `knowledgeOrder` provides stable display ordering.
- `knowledgeLabel` supplies a visitor-facing card type such as Identifier guide or Governance guide.

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

- One complete reference hub
- Six focused Service Principal and workload identity guides
- Search across published knowledge titles, descriptions, search intent, keywords, and guide tags
- Three task tracks:
  - Understand the identity and permission model
  - Build and migrate workload identities
  - Operate and govern durable access
- Links to the Role Library, Overlap Analyzer, AI Advisor, and Updates pages

The top navigation uses **Knowledge** as the broader destination. The Knowledge item remains active while the visitor is on `/knowledge`, `/service-principals`, or any Service Principal child guide.

## Service principal content cluster

| Route | Status | Track | Primary intent |
|---|---|---|---|
| `/service-principals` | Published hub | Start here | Understand the complete object, ID, consent, authentication, governance, and troubleshooting model |
| `/service-principals/identifiers` | Published guide | Understand | Know whether a field needs appId, application Object ID, service principal Object ID, tenant ID, app-role ID, or credential ID |
| `/service-principals/permissions-and-consent` | Published guide | Understand | Reconcile requested permissions, admin consent, app-role assignments, OAuth grants, token claims, and resource authorization |
| `/service-principals/managed-identities` | Published guide | Build & migrate | Choose and implement managed identity or workload identity federation |
| `/service-principals/mfa-service-account-migration` | Published guide | Build & migrate | Discover user-based Azure automation affected by mandatory MFA and migrate it to a workload identity |
| `/service-principals/troubleshooting` | Published guide | Operate & govern | Diagnose object lookup, authentication, consent, authorization, assignment, Conditional Access, logging, and recovery failures |
| `/service-principals/security-review` | Published guide | Operate & govern | Perform a repeatable ownership, provenance, privilege, credential, activity, risk, and control review |
| `/service-principals/credential-lifecycle` | Planned guide | Future | Inventory, alert, rotate, and retire secrets and certificates safely |

The public hub and library must display only published content. Credential Lifecycle remains internal until complete and reviewed.

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
4. A route-specific title, description, canonical URL, Open Graph metadata, and structured data through `PageMeta`.
5. Standard crawlable links back to `/knowledge`, its parent hub, and relevant sibling guides.
6. Primary-source references, normally Microsoft Learn, Microsoft Graph, Azure, or product documentation.
7. Read-only investigation commands before destructive or state-changing examples.
8. Explicit distinctions between object types, tenant context, requested configuration, granted access, runtime evidence, and resource-side authorization.
9. Responsive tables, cards, diagrams, and code blocks that remain usable on mobile.
10. No quiz, filler, or thin content added only to target a keyword.

## Internal-linking rules

- `/knowledge` links to every published hub and guide.
- The hub displays only published child guides in its related-guides block and links back to the full library.
- Every child guide links to `/knowledge` through its breadcrumb, back to the hub, and to relevant sibling guides.
- Child guides link to siblings only when the destination helps complete the administrator's task.
- Link text should describe the destination; avoid generic text such as “click here.”
- Planned routes remain in the registry but are not rendered as disabled cards, raw paths, or dead links.

## Publishing a new guide

1. Add or update the page in `src/data/sitePages.js` with a unique path and `status: "planned"` while drafting.
2. Assign a future `knowledgeTrack`, `knowledgeOrder`, `knowledgeLabel`, and `guideTags` before publication.
3. Build the React page under `src/pages/` and add its route to `src/App.jsx`.
4. Add visible links from its parent hub and relevant sibling guides.
5. Reuse `PageMeta` or `KnowledgeGuideLayout` for route-specific metadata and JSON-LD.
6. Verify the page returns HTTP 200 on direct load and renders meaningful content without authentication.
7. Change the registry status to `published` and add accurate `lastModified`, `priority`, and display metadata.
8. Run `npm run build`; the generators validate routes and refresh sitemap, robots, llms, and static route entrypoints.
9. Test mobile layout, keyboard navigation, search discovery, copy controls, canonical URL, structured data, and source links.
10. After deployment, inspect the canonical URL in Google Search Console and submit the sitemap when needed.

## SEO principles

- Write for the administrator's task first; search visibility follows useful, complete content.
- Use one canonical URL for each distinct topic.
- Keep page titles and descriptions unique and descriptive.
- Use logical, stable, human-readable paths.
- Publish only pages that add information beyond the hub.
- Keep `lastModified` truthful; do not refresh dates when content did not materially change.
- Sitemaps support discovery but do not guarantee indexing or ranking.
- JavaScript pages must remain publicly accessible and should be tested with rendered HTML in Search Console.

## Next content sequence

1. Publish `/knowledge` as the SecRole knowledge-library landing page.
2. Publish `/service-principals/credential-lifecycle`.
3. Begin a second knowledge cluster, likely Microsoft Entra role governance or Microsoft Purview administration.
4. Continue expanding workload identity, permission, governance, migration, and troubleshooting content without overcrowding the top navigation.
5. Revisit role-drift risk classification so sensitive tenant-wide read access is not automatically rated Low.

## Future platform decision

Route-specific static entrypoints provide final metadata in the initial HTML response today, while React renders the complete page body. As the knowledge library grows, evaluate full static generation or server rendering so complete article and index content is present before JavaScript executes. Preserve the route registry and URL structure during that migration.
