# SecRole

**Microsoft Entra ID and Microsoft Purview role, identity, permission, and least-privilege intelligence for IT administrators and security engineers.**

Live site: [secrole.com](https://www.secrole.com)

## What SecRole provides

- Searchable Microsoft Entra and Microsoft Purview role reference
- Risk, permission, and least-privilege guidance
- Role overlap analysis
- AI-assisted role investigation
- Microsoft identity and security updates sourced from official Microsoft material
- Practical knowledge references for workload identities, permissions, governance, and troubleshooting

## Current routes

| Route | Purpose |
|---|---|
| `/` | Entra and Purview role library |
| `/analyzer` | Role overlap analyzer |
| `/advisor` | AI role advisor |
| `/service-principals` | Application object and service principal reference |
| `/updates` | Entra and Purview update feed |

## Technology

- React 19
- Vite 8
- React Router
- Plain JavaScript and JSX
- CSS custom properties with light and dark themes
- Vercel deployment
- GitHub Actions for Microsoft update collection and role-drift review

## Local development

```bash
npm install
npm run dev
```

Production validation:

```bash
npm run lint
npm run build
npm run preview
```

`npm run build` also:

1. Validates the published route registry.
2. Generates `robots.txt`, `sitemap.xml`, and `llms.txt`.
3. Creates route-specific HTML entrypoints for published knowledge pages so their title, description, canonical URL, social metadata, and article schema are present before React loads.

## Knowledge and SEO architecture

Published and planned pages are registered in `src/data/sitePages.js`. Planned routes are intentionally excluded from generated discovery files until the content is complete.

Knowledge content follows a hub-and-spoke model: a complete hub answers the core question, while dedicated child guides expand procedures, decision trees, screenshots, and reusable scripts. See [`docs/KNOWLEDGE_ARCHITECTURE.md`](docs/KNOWLEDGE_ARCHITECTURE.md).

## Source policy

Platform facts and API behavior should be grounded in primary Microsoft documentation. SecRole content should clearly distinguish:

- application objects from service principals
- stable application IDs from tenant-local object IDs
- requested permissions from granted permissions
- configuration from runtime evidence
- read-only investigation from state-changing remediation

Microsoft Learn and Microsoft Graph documentation remain the source of truth when platform behavior changes.
