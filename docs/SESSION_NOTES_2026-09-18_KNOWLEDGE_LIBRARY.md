# SecRole Session Notes — Knowledge Library Landing Page

Date: September 18, 2026

## Repository state

- PR #8, **Publish Managed Identities and Workload Identity Federation guide**, was reviewed and merged.
- Current `main` at the start of this work: `8b7f374`
- New branch:
  - `feature/knowledge-library`

## Objective

Publish the broader SecRole knowledge-library landing page now that the first Service Principal and workload identity cluster contains:

- One complete reference hub
- Six focused child guides

New route:

- `/knowledge`

## Implementation completed in this branch

### Knowledge library page

The new page provides:

- A visitor-facing knowledge-library hero
- Search across published hub and guide metadata
- Derived counts for the reference hub and focused guides
- A featured Service Principals reference-hub card
- Three task-oriented tracks:
  1. Understand the identity and permission model
  2. Build and migrate workload identities
  3. Operate and govern durable access
- Published guide cards with descriptive tags
- Empty search results with a clear reset action
- Links to the Role Library, Overlap Analyzer, AI Advisor, and Updates
- SecRole content principles: object and tenant precision, request-vs-grant separation, read-only investigation first, and primary sources
- CollectionPage, ItemList, and BreadcrumbList structured data
- Responsive desktop and mobile layouts
- Keyboard focus and reduced-motion support

### Navigation

The top navigation now uses **Knowledge** instead of the narrower **Service Principals** label.

The Knowledge navigation item remains active for:

- `/knowledge`
- `/service-principals`
- Every `/service-principals/*` child route

This keeps the top navigation broad without losing access to the Service Principals hub.

### Breadcrumb and linking changes

- Every focused guide breadcrumb now follows:
  - SecRole → Knowledge → Service principals → Current guide
- Breadcrumb structured data follows the same hierarchy.
- The Service Principals deep-dive section includes a link to the full knowledge library.
- Planned routes remain hidden.

### Route and SEO behavior

- `src/data/sitePages.js` now marks `/knowledge` as published.
- Published knowledge guides include `knowledgeTrack`, `knowledgeOrder`, and `knowledgeLabel` metadata.
- The static route-entrypoint generator now supports `knowledge-index` pages and emits CollectionPage schema for `/knowledge`.
- `sitemap.xml` and `llms.txt` include `/knowledge`.
- RouteMeta defers knowledge-index metadata to the page component.

## Files added

- `src/pages/Knowledge.jsx`
- `src/pages/Knowledge.css`
- `docs/SESSION_NOTES_2026-09-18_KNOWLEDGE_LIBRARY.md`

## Files modified

- `src/App.jsx`
- `src/components/Nav.jsx`
- `src/components/RouteMeta.jsx`
- `src/data/sitePages.js`
- `src/pages/service-principals/KnowledgeGuideLayout.jsx`
- `src/pages/service-principals/ServicePrincipalsRoute.jsx`
- `src/pages/service-principals/ServicePrincipalsGuideMap.css`
- `scripts/generate-route-entrypoints.mjs`
- `docs/KNOWLEDGE_ARCHITECTURE.md`
- `public/sitemap.xml`
- `public/llms.txt`

## Expected public behavior

### Top navigation

- Knowledge replaces Service Principals.
- Knowledge is highlighted across the whole Service Principal content cluster.

### `/knowledge`

The page should display:

- One featured reference hub
- Six focused guides
- Two guides under Understand
- Two guides under Build & migrate
- Two guides under Operate & govern
- Four supporting SecRole tools

Search should find pages using title, heading, description, search intent, keywords, and guide tags.

### `/service-principals`

The hub should still show all six guide cards and now include:

- `Browse the full SecRole knowledge library →`

### Focused guide breadcrumbs

Each guide should visibly link back to both Knowledge and the Service Principals hub.

## Validation checklist

- [x] Feature branch created from the current `main`
- [x] New Knowledge page and styling prepared
- [x] Route registry publishes `/knowledge`
- [x] Static route entrypoint generator includes knowledge indexes
- [x] Sitemap and llms discovery files include `/knowledge`
- [ ] JavaScript and JSX syntax parsing
- [ ] CSS parsing
- [ ] Commit and push branch
- [ ] Open PR #9
- [ ] Confirm Vercel preview deployment
- [ ] Direct-load `/knowledge`
- [ ] Test search and clear behavior
- [ ] Confirm exactly six focused guides plus one hub
- [ ] Confirm all guide and tool links
- [ ] Review desktop and mobile in light and dark themes
- [ ] Confirm Knowledge nav active state across child routes
- [ ] Confirm CollectionPage, ItemList, BreadcrumbList, title, canonical URL, sitemap, and source discovery

## Continuation order after merge

1. Build `/service-principals/credential-lifecycle`
2. Decide the next major cluster:
   - Microsoft Entra role governance
   - Microsoft Purview role and permission administration
   - Workload identity monitoring and incident response
3. Revisit role-drift risk classification so sensitive tenant-wide read access is not automatically rated Low
4. Evaluate full static generation or server rendering as the knowledge library grows
