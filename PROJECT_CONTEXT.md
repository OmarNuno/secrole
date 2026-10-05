# SecRole project context

Last reviewed: October 5, 2026

Use this file with the actual checkout, [README](README.md), and linked architecture guides when working on SecRole. The repository's current code and verified deployment state take precedence over historical notes. AI implementation is OpenAI-only; do not reintroduce another provider, legacy credentials, or browser-selected model configuration.

## Project overview

SecRole is a Microsoft identity and security role intelligence tool for IT administrators, security engineers, and compliance teams. It combines a searchable Microsoft Entra ID and Microsoft Purview role catalog, risk and least-privilege guidance, an AI overlap analyzer, an AI role advisor, an official-source updates feed, and operational knowledge guides.

- Owner: Omar Nuno (Velotek.ai)
- Repository: [OmarNuno/secrole](https://github.com/OmarNuno/secrole)
- Public site: [secrole.com](https://www.secrole.com)
- Project started: April 2026
- Catalog in this checkout on October 5, 2026: 136 Entra and 60 Purview entries, 196 total. These are repository counts, not a claim about the live deployment. Derive current counts from the data exports rather than copying this snapshot into the UI.

## Migration and rollout status

The OpenAI-only migration covers all three AI paths: in-app chat/analysis, daily update summaries, and weekly role drafting. Its safe default is discovery-only automation with no paid AI calls.

The migration code does **not** create or install credentials, enable paid automation, make a live API test, deploy the site, or revoke old credentials. A migration PR leaves the existing default branch unchanged until it is merged; production behavior changes only after deployment. Verify those external states separately.

After the migrated code is merged/deployed without new configuration:

- The static catalog and knowledge pages continue working
- The existing updates cache remains visible but stops refreshing
- Role discovery continues without AI drafting or catalog changes
- In-app AI returns `503` until its Vercel server key is configured

Paid activation requires the owner's explicit consent and secure configuration. Both GitHub Actions scripts use the repository secret `OPENAI_API_KEY`; the repository variable `OPENAI_AUTOMATION_ENABLED=true` opts in to paid daily summarization and scheduled weekly drafting. Manual role-drift runs additionally need `draft_roles: true`; its default is `false`. Manual updates generation likewise requires `generate_updates: true` (default `false`). Vercel needs a separate server-side `OPENAI_API_KEY` for chat. The Actions opt-in does not control Vercel chat.

See [README rollout guidance](README.md#safe-defaults-and-rollout) for the settings and [Role Drift Automation](docs/ROLE_DRIFT_AUTOMATION.md) for the workflow mode matrix. Retiring old live credentials remains a separate owner-approved action. Never restore obsolete provider configuration as a fallback.

## Architecture

| Layer | Implementation |
|---|---|
| Frontend | React 19, Vite 8, React Router; JavaScript/JSX with ES modules |
| Styling | CSS variables and component styling; light/dark themes through `data-theme` |
| AI integration | `lib/openai.js`, shared by all three server-side callers; native `fetch`, no AI SDK dependency |
| In-app API | `api/chat.js`, Vercel serverless endpoint with in-memory request limits and structured logs |
| Role data | Static JavaScript in `src/data/roles.js`; no database or tenant connection |
| Updates | `public/updates-cache.json`, refreshed by enabled GitHub Actions runs |
| Role maintenance | Official-source discovery; optional drafting into human-reviewed draft PRs |
| Hosting | Vercel; repository integration may deploy approved merges to the default branch |
| Discovery/SEO | Route registry, generated discovery files, and route-specific initial HTML metadata |

### OpenAI contract

- Fixed endpoint: `https://api.openai.com/v1/responses`
- Default snapshot: `gpt-4.1-mini-2025-04-14`, documented on the [official model page](https://developers.openai.com/api/docs/models/gpt-4.1-mini)
- Optional `OPENAI_MODEL` override belongs in the server environment and must remain compatible with the adapter
- Only `OPENAI_API_KEY` authenticates the server requests; never use a `VITE_*` secret
- Client payloads do not select the provider or model
- No alternate-provider fallback or user-controlled API base URL
- Requests use `store: false`, a timeout, and explicit rejection of API failures, incomplete output, and refusals
- `store: false` is a request-storage setting, not a promise about every form of service retention
- Official sources remain authoritative; fluent generated text is not validation

Use [current API pricing](https://developers.openai.com/api/docs/pricing) and measured token usage for cost decisions. Old daily/monthly estimates are not a budget or current price guarantee.

## Main project files

```text
api/chat.js                       In-app server endpoint
lib/openai.js                     Shared OpenAI Responses adapter
public/updates-cache.json          Last generated Microsoft update feed
scripts/fetch-updates.js           Public-source collection and optional summarization
scripts/check-role-drift.js        Discovery, optional drafting, and review report
scripts/role-data-validation.js    Catalog validation
scripts/role-drift-ignore.json     Explicitly ignored official role names
scripts/generate-seo-files.mjs     Route validation and discovery-file generation
scripts/generate-route-entrypoints.mjs  Initial HTML metadata for knowledge routes
src/data/roles.js                  Entra and Purview role data and exports
src/data/sitePages.js              Published/planned route registry
src/data/pageDisplay.js            Short navigation labels
src/components/Nav.jsx            Navigation; counts derived from role data
src/pages/AIAdvisor.jsx            Role advice chat
src/pages/OverlapAnalyzer.jsx      Role overlap analysis and response template
src/pages/RoleLibrary.jsx          Catalog search and filters
src/pages/Updates.jsx              Static update feed with pinned new-role items
src/pages/Knowledge.jsx            Published knowledge index
src/pages/service-principals/      Workload identity hub and operational guides
src/pages/role-governance/         Entra governance hub and operational guides
src/pages/purview-governance/       Purview access/governance content
.github/workflows/fetch-updates.yml      Daily workflow, 06:00 UTC
.github/workflows/check-role-drift.yml   Weekly workflow, Monday 07:00 UTC
PROJECT_CONTEXT.md                This contributor context
```

## Source and content policy

Fetch current official Microsoft material first. Use generated text to organize and explain it, then validate the result against those sources. Neither the assistant's memory nor existing catalog prose is sufficient evidence for a changed platform capability.

Preserve these distinctions:

- Application object vs. service principal
- Stable application ID vs. tenant-local Object ID
- Requested permissions vs. granted permissions
- Entra roles vs. Azure RBAC vs. application app roles vs. Purview role groups
- Principal vs. role definition vs. assignment
- Direct vs. inherited or group-based access
- Active vs. eligible vs. activated assignment state
- Permission set vs. scope vs. duration
- Portal or metadata visibility vs. access to sensitive content
- Configuration vs. actual runtime evidence
- Read-only investigation vs. state-changing remediation

Security risk depends on capability, scope, content sensitivity, and control paths. Read-only access to tenant-wide sensitive material can warrant High risk. Explain any gap between a role's documented actions and its practical threat model instead of inventing permissions.

For complete page contracts and content clusters, read [Knowledge Architecture](docs/KNOWLEDGE_ARCHITECTURE.md). Do not add unfinished routes to the sitemap or expose placeholder guides.

## Role-drift maintenance

The drift script fetches Microsoft's canonical Entra role list and individual permission includes, plus Purview role-group documentation. It normalizes names, honors `scripts/role-drift-ignore.json`, checks source-count sanity, and reports differences.

Discovery is the default CLI mode and needs no API key. Explicit `--draft` mode sends official source text to OpenAI, drafts up to `DRIFT_DRAFT_CAP` entries (integer from 1 to 15, default 15), validates them, applies additions to the working branch, and writes a human-review report. Use `npm run role-drift:draft` for the explicit drafting command. The workflow, not the script, creates the draft PR.

Validation and review safeguards include:

- Exact official names, valid product/category/risk values, required fields, and unique IDs
- Same-product related-role references, including surviving drafts from the same batch
- Deterministic flags for ratings that conflict with privileged markers, broad write access, or sensitive read access
- Required per-draft risk rationale in the review report
- Catalog revalidation before proposing changes
- No automatic role deletion, retirement, merge, or publication
- An open `role-drift/*` PR prevents stacking further drafting proposals

Retirement and rename flags are investigation leads, not deletion instructions. If a source changes format, repair discovery before trusting its output.

### Keyless role-writing path

Run `npm run role-drift:dry-run` and use the report plus current official sources to ask an OpenAI assistant for role entries. Put those entries on a review branch, supply source links and risk rationales, run validators/tests/lint/build, and open a draft PR. This does not require a repository API credential or a call to SecRole's adapter. Human review remains required, including the risk checks that a manually authored patch does not automatically run through the drafting report generator.

## Updates pipeline

The updates script collects real items from:

- Microsoft Entra release notes (raw markdown)
- Microsoft Purview What's New (public Microsoft Learn page)
- Microsoft 365 Roadmap API, filtered to relevant products
- MSRC Security Update Guide RSS, prefiltered for identity/security topics
- Tech Community Entra and security feeds, when their fallback URLs work

It balances sources using a per-source cap, summarizes a bounded batch through OpenAI, validates output links against fetched URLs, and writes static JSON. Summaries must not invent announcements or URLs. A source failure can degrade gracefully while other sources remain usable. A generation failure preserves the old cache rather than publishing unvalidated replacement content.

No flag and `--dry-run` both run source discovery without replacing the cache (`npm run updates:dry-run`). Summarization requires explicit `--generate` (`npm run updates:generate`), an API key, and owner-approved paid use. The disabled workflow runs discovery only. Only an enabled, successful summarization run may commit updated JSON. Inspect actual source counts and cache timestamps when investigating stale content; do not infer freshness from a successful discovery-only run.

The frontend pins `category: "New Role"` cards above other updates on the All view and avoids duplicate placement below. An empty new-role section uses the cache's recorded check time. The feed announces roles; the separate drift workflow proposes catalog additions.

## Data contracts

### Role objects

```js
{
  id: "e1",                    // Entra IDs use e; Purview IDs use p
  name: "Global Administrator",
  product: "Entra",            // Entra | Purview
  category: "Identity",        // Existing product category
  risk: "Critical",            // Critical | High | Medium | Low
  description: "...",
  permissions: "...",
  leastPrivilege: "...",
  tags: ["identity", "admin"],
  relatedRoles: ["e5", "e21"]  // Valid same-product IDs
}
```

Exports include `ENTRA_ROLES`, `PURVIEW_ROLES`, `ALL_ROLES`, `RISK_ORDER`, and `CATEGORIES`. IDs are stable references, not a count: gaps and historical nonsequential IDs may exist. Derive all UI counts from exports. Keep draft review metadata and source/risk rationale in the review report as required by the workflow rather than silently changing the published schema.

### Update cache

```json
{
  "lastUpdated": "ISO timestamp",
  "fetchedAt": "ISO timestamp",
  "updates": [
    {
      "id": "unique-slug",
      "title": "Update title",
      "summary": "Source-grounded summary in original wording",
      "category": "New Role",
      "source": "Microsoft Entra Release Notes",
      "date": "Month YYYY",
      "importance": "high",
      "url": "https://learn.microsoft.com/..."
    }
  ]
}
```

Categories are New Role, Permission Change, Feature Update, Security Advisory, or Roadmap. Importance is high, medium, or low. Check the current script for the complete validation rules.

### Ignore list

```json
{ "entra": [], "purview": [] }
```

An exact official role name stays excluded while it is in its product array. Document the reason in the review that adds it; do not use exclusions to hide a parser failure.

## Routes and SEO

Core routes are `/`, `/analyzer`, `/advisor`, `/updates`, and `/knowledge`. Reference hubs are `/service-principals`, `/role-governance`, and `/purview-governance`; published focused guides are registered in `src/data/sitePages.js` and routed in `src/App.jsx`. `/api/chat` is a server endpoint.

The build validates role data and the route registry, generates `robots.txt`, `sitemap.xml`, and `llms.txt`, then creates route-specific HTML metadata for published knowledge pages. Planned pages remain excluded. Those initial entrypoints provide metadata; do not claim full server-rendered article bodies without checking the implementation.

## Development and verification

Use Node 22 to match CI. Run:

```bash
npm install
npm run dev

npm run validate:roles
npm run role-drift:validate
npm test
npm run lint:ai
npm run lint
npm run build
npm run preview
```

`npm test` includes the role checks and AI adapter/API tests. `npm run test:ai` runs the focused AI suite. Use mocked network responses for offline migration tests; a test passing with mocks is not a paid live-service smoke test. Vite development/preview serves the frontend and does not itself run Vercel serverless functions.

Before finishing a change, inspect `git diff`, verify only intended files changed, and report which tests passed, failed, or were not run. Fetch current branch state before publishing to avoid overwriting bot cache commits or human edits. Do not overwrite a newer catalog with an old downloaded copy.

## Operational safeguards and known limitations

- Never commit secrets, print them in logs, or prefix server secrets with `VITE_`. Use GitHub Actions secrets and Vercel server-side environment settings separately.
- Set the automation opt-in only after explicit approval of paid calls. A stored key alone must not enable scheduled spending.
- Review model compatibility and output quality before changing `OPENAI_MODEL`.
- In-memory rate limits reset on cold starts and do not provide a durable global spending cap. Consider a persistent store separately if usage warrants it.
- Generated AI output remains untrusted. A server-origin response alone does not make rendered HTML safe; preserve escaping/sanitization and review any `dangerouslySetInnerHTML` path.
- Microsoft source URLs and document layouts can change. Check current logs instead of treating historical RSS failures as current evidence.
- Workflow PR creation depends on repository/org permissions and the Actions setting permitting pull requests. Do not silently broaden those settings; request owner approval when needed.
- `GITHUB_TOKEN`-created commits/PRs may not start all downstream workflows. Verify checks for the actual commit rather than assuming preview or CI ran.
- Inspect current `vercel.json` and generated routes before changing rewrites. Historical snippets may no longer match the current deployment layout.
- An environment change needs the relevant process/deployment to reload; adding a key in a dashboard is not proof the running application has it.

## Historical context and review lessons

These notes describe earlier work, not current rollout status or an active backlog:

- July 20, 2026: the updates pipeline moved to committed static JSON, avoiding an ephemeral serverless cache.
- July 21, 2026: new-role announcements gained a pinned section on the updates page.
- July 22, 2026: the first drift run proposed 15 Entra roles, e112–e126, and the project adopted human-reviewed catalog PRs. Historical missing-role counts must be recomputed; do not rerun drafting based on the old backlog estimate.
- July 22, 2026: navigation counts were changed to derive from role data after hardcoded counts became stale.
- July 22, 2026: the e114 Application Developer draft was corrected to distinguish owned-application creation/self-consent from broad consent powers. Recheck current official documentation when editing it.
- July 22, 2026: e119 Directory Synchronization Accounts needed a clearer explanation of the relationship between documented actions and synchronization-account risk. Do not fabricate permission actions to justify a risk rating.
- Historical drift flags for Data Curator (p25) and Information Barriers Administrator (p34) were unverified leads. Check the present catalog and Microsoft sources before treating either as retired or still unresolved.
- October 5, 2026: migration work replaces the previous AI integration with the shared OpenAI-only contract and paid-automation opt-in. This records the code change, not evidence of live activation.

## Future work to verify before starting

- Owner-approved migration merge/deployment and, if wanted, secure OpenAI activation and live verification
- Current role-discovery findings, with source-grounded drafts and human review
- Planned Purview focused guides described in the knowledge architecture
- Individual role/compare pages, side-by-side comparisons, and task-based role selection if still desired
- Mobile and accessibility review of advisor/analyzer flows
- Durable rate limits if actual usage requires them
- Connecting new-role announcements to a reviewable catalog proposal without bypassing human approval

Recheck whether any item is already complete or superseded before implementing it. Domain/DNS, account plans, costs, and production configuration must be verified from current owner-authorized evidence rather than this project context.
