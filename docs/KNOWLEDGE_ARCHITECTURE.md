# SecRole Knowledge Architecture

Last updated: September 16, 2026

## Purpose

SecRole knowledge content uses a **hub-and-spoke** model. A hub page explains the full mental model and answers the most common questions. When a topic needs a procedure, screenshots, a decision tree, a larger script, or substantially deeper coverage, it becomes a dedicated child guide.

The first hub is:

- `/service-principals` — the complete application object and service principal reference

The hub must remain useful on its own. Child pages should expand a topic rather than remove the essential explanation from the hub.

## Route registry

`src/data/sitePages.js` is the source of truth for published and planned routes.

- `status: "published"` includes the route in generated discovery files.
- `status: "planned"` reserves the content idea but keeps it out of the sitemap.
- `parentId` creates the hub-and-spoke relationship.
- `searchIntent` documents the question the page is meant to answer.

The build runs `scripts/generate-seo-files.mjs`, which validates published routes and creates:

- `public/sitemap.xml`
- `public/robots.txt`
- `public/llms.txt`

After Vite builds, `scripts/generate-route-entrypoints.mjs` also creates an extensionless static HTML entrypoint for every published knowledge route. The entrypoint contains the route-specific title, description, canonical URL, social metadata, and article schema before React loads. Vercel serves those files through `cleanUrls` and then falls back to the SPA for tool routes.

Do not add unfinished routes to the sitemap or link users to placeholder pages.

## Service principal content cluster

| Route | Role | Primary intent |
|---|---|---|
| `/service-principals` | Published hub | Understand the complete object, ID, consent, authentication, governance, and troubleshooting model |
| `/service-principals/identifiers` | Planned guide | Know whether a field needs appId, application object ID, service principal object ID, or tenant ID |
| `/service-principals/permissions-and-consent` | Planned guide | Reconcile requested permissions, admin consent, app-role assignments, OAuth grants, and token claims |
| `/service-principals/managed-identities` | Planned guide | Choose managed identity, federation, certificate, or secret authentication |
| `/service-principals/security-review` | Planned guide | Perform a repeatable service principal risk and governance review |
| `/service-principals/credential-lifecycle` | Planned guide | Inventory, alert, rotate, and retire secrets and certificates safely |
| `/service-principals/troubleshooting` | Planned guide | Diagnose object lookup, consent, assignment, authentication, and recovery failures |

## Page contract

Every published knowledge page should include:

1. One clear H1 that matches the reader's problem.
2. A concise answer near the top before deeper detail.
3. A visible last-reviewed date.
4. A route-specific title, description, canonical URL, Open Graph metadata, and structured data through `PageMeta`.
5. Standard crawlable links back to its parent hub and to relevant sibling guides.
6. Primary-source references, normally Microsoft Learn or Microsoft Graph documentation.
7. Read-only investigation commands before any destructive or state-changing example.
8. Explicit distinctions between object types, tenant context, requested configuration, granted access, and runtime evidence.
9. Responsive tables or cards that remain usable on mobile.
10. No quiz, filler, or thin content added only to target a keyword.

## Internal-linking rules

- The hub links to every published child guide in the relevant section and in a related-guides block.
- Every child guide links back to the hub near the top.
- Child guides link to siblings only when the link helps complete the task.
- Link text should describe the destination; avoid generic text such as “click here.”
- Planned routes are displayed as a roadmap only, not as clickable dead links.

## Publishing a new guide

1. Change or add the page in `src/data/sitePages.js` with a unique path and `status: "planned"` while drafting.
2. Build the React page under `src/pages/` and add its route to `src/App.jsx`.
3. Add visible links from its parent hub and, when appropriate, navigation or a knowledge landing page.
4. Reuse `PageMeta` for route-specific metadata and JSON-LD.
5. Verify the page returns HTTP 200 on a direct load and renders meaningful content without authentication.
6. Change the registry status to `published` and set an accurate `lastModified` date.
7. Run `npm run build`; the prebuild generator validates routes and refreshes the sitemap, robots file, and llms file.
8. Test mobile layout, keyboard navigation, code-copy controls, canonical URL, structured data, and source links.
9. After deployment, inspect the canonical URL in Google Search Console and submit the sitemap once if it has not already been submitted.

## SEO principles

- Write for the administrator's task first; search visibility follows useful, complete content.
- Use one canonical URL for each distinct topic.
- Keep page titles and descriptions unique and descriptive.
- Use logical, stable, human-readable paths.
- Publish only pages that add information beyond the hub.
- Keep `lastModified` truthful; do not refresh dates when content did not materially change.
- Sitemaps support discovery but do not guarantee indexing or ranking.
- JavaScript pages must remain publicly accessible and should be tested with rendered HTML in Search Console.

## Future platform decision

Route-specific static entrypoints provide final metadata in the initial HTML response today, while React renders the article body. As the knowledge library grows, evaluate full static generation or server rendering so the complete article content is also present before JavaScript executes. That migration should preserve the route registry and URL structure defined here.
