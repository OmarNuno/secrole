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
| `/knowledge` | Published reference hubs and operational guides |
| `/service-principals` | Application object and service principal reference |
| `/role-governance` | Microsoft Entra role governance reference |
| `/purview-governance` | Microsoft Purview access and role governance reference |
| `/updates` | Entra and Purview update feed |

## Technology

- React 19
- Vite 8
- React Router
- Plain JavaScript and JSX
- CSS custom properties with light and dark themes
- Vercel deployment
- GitHub Actions for Microsoft update collection and role-drift review
- OpenAI Responses API for optional server-side AI features, with native `fetch` and no AI SDK dependency

## Local development

```bash
npm install
npm run dev
```

Production validation:

```bash
npm run validate:roles
npm test
npm run lint:ai
npm run lint
npm run build
npm run preview
```

`npm run build` also:

1. Validates the role catalog and published route registry.
2. Generates `robots.txt`, `sitemap.xml`, and `llms.txt`.
3. Creates route-specific HTML entrypoints for published knowledge pages so their title, description, canonical URL, social metadata, and article schema are present before React loads.

## OpenAI-only AI integration

All three AI paths use the shared server-side adapter in `lib/openai.js`:

| Path | Purpose | When it calls OpenAI |
|---|---|---|
| `api/chat.js` | AI Advisor and Overlap Analyzer | A visitor requests analysis and the Vercel server has a key |
| `scripts/fetch-updates.js` | Summarize fetched Microsoft updates | Explicit `--generate` mode; automation also requires the opt-in below |
| `scripts/check-role-drift.js` | Draft missing role entries from official sources | Explicit `--draft` mode; automation also requires the opt-in below |

The adapter uses `https://api.openai.com/v1/responses` and the pinned default `gpt-4.1-mini-2025-04-14`. `OPENAI_MODEL` is an optional server-side override for a compatible OpenAI model. Browser requests cannot choose the provider or model. There is no alternate-provider fallback. Requests use `store: false`, a timeout, and explicit handling for API failures, incomplete output, and refusals.

See the official [model documentation](https://developers.openai.com/api/docs/models/gpt-4.1-mini) and [current API pricing](https://developers.openai.com/api/docs/pricing). API usage is billed separately from using an assistant to prepare a code change. Do not assume a fixed daily or monthly cost, or treat `store: false` as a zero-retention guarantee.

### Safe defaults and rollout

**Code migration does not activate a paid service.** This change does not create credentials, configure secrets, enable paid automation, make a live OpenAI call, or deploy the site. A migration PR leaves the default branch and production behavior unchanged until the owner merges and deploys it.

After the migrated code is merged/deployed, with no new configuration:

- The role library, knowledge pages, and existing updates cache remain available
- Role-drift checks run discovery only, with no AI call or catalog edit
- The daily updates workflow uses `--dry-run`; it keeps the current cache, so the feed stops refreshing
- `/api/chat` returns a clear `503` unavailable response until its server-side key is configured

To activate AI, the owner must explicitly approve the paid rollout and securely configure each destination:

| Setting | Location | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | GitHub Actions repository **secret** | Server-side authentication for both automation scripts |
| `OPENAI_AUTOMATION_ENABLED` | GitHub Actions repository **variable** | Exact value `true` opts in to paid daily summaries and scheduled weekly drafting |
| `OPENAI_API_KEY` | Vercel project server-side environment variable | Authentication for `/api/chat` |
| `OPENAI_MODEL` | GitHub Actions repository variable and/or Vercel server environment; optional | Override the pinned default only after compatibility and quality review |

Adding a GitHub secret alone does not enable paid automation. Manual **Check Role Drift** runs default to discovery: select `draft_roles: true` only for an approved drafting run, with the repository opt-in also set to `true`. Manual **Fetch Entra & Purview Updates** runs likewise default to discovery and require `generate_updates: true` for approved generation. Scheduled runs can summarize updates and draft roles once the repository opt-in is enabled. The Vercel chat setting is separate from this automation gate.

Local script defaults are also read-only. After paid generation is approved and the server environment securely provides `OPENAI_API_KEY`, `npm run role-drift:draft` opts into role drafting (`--draft`) and `npm run updates:generate` opts into update summarization (`--generate`). Neither command should be used as an unpaid connectivity test. `npm run test:ai` uses mocked responses for an offline check.

Never place an API key in `VITE_*`, browser code, committed files, workflow variables, screenshots, or chat. Use each provider's secure settings interface; local server execution should receive secrets through its environment. `npm run dev` serves the Vite frontend and does not itself run Vercel serverless functions. A server-side environment change requires the relevant application process/deployment to load the new configuration.

Do not restore legacy-provider keys or endpoints as a fallback. Retiring old live credentials is a separate owner-approved action; removing their code references does not revoke them.

### Role review without a repository API key

```bash
# Offline structural checks and tests
npm run validate:roles
npm run test:role-drift

# Fetch official Microsoft sources; no AI call or roles.js edit
npm run role-drift:dry-run

# Discover update source items without modifying the published cache
npm run updates:dry-run
```

An OpenAI assistant can use the discovery report and current official Microsoft documentation to prepare role entries in a separate branch without adding an API key to SecRole. Validate the catalog, run tests/lint/build, and open a **draft PR** for human review. Nothing publishes or merges automatically. See [Role Drift Automation](docs/ROLE_DRIFT_AUTOMATION.md) for the drafting commands, risk rubric, and review checklist.

Project architecture and contributor context are in [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md).

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
