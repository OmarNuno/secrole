# SecRole — CLAUDE_CONTEXT.md

> **Purpose of this file:** Paste this at the start of every new Claude session to restore full project context instantly. Last updated: July 22, 2026.

---

## 📌 Project Overview

**SecRole** (`secrole.com`) is a Microsoft identity and security role intelligence tool built for IT admins, security engineers, and compliance officers. It provides a complete reference for all Microsoft Entra ID and Microsoft Purview RBAC roles with risk levels, permissions, least-privilege guidance, an AI-powered overlap analyzer, an AI role advisor, and a daily-refreshed news feed pulling real Microsoft updates from official sources. As of July 22, 2026 it also **keeps its own role library in sync with Microsoft** via an automated weekly drift checker that drafts new roles for human approval.

**Owner:** Omar Nuno (Velotek.ai)
**Repo:** github.com/OmarNuno/secrole
**Live URL:** secrole.com (also secrole.vercel.app)
**Started:** April 2026
**Current Version:** V1.2 (Role drift checker live July 22; Updates pipeline July 20; pinned New Roles section + full Haiku switch July 21, 2026)

**Current role counts (live):** 126 Entra + 40 Purview = 166 roles. Risk mix: 6 Critical, 63 High, 45 Medium, 52 Low. The 6 Criticals are Global Administrator (e1), Privileged Role Administrator (e5), Privileged Authentication Administrator (e21), Directory Synchronization Accounts (e119), Partner Tier1 Support (e123), Partner Tier2 Support (e124).

---

## 🏗️ Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React + Vite | No TypeScript — plain JSX. `"type": "module"` in package.json |
| Routing | react-router-dom | SPA with BrowserRouter |
| Styling | CSS variables + inline styles | Full light/dark theme via `data-theme` attribute |
| AI (in-app) | Claude Haiku (`claude-haiku-4-5-20251001`) | Via `/api/chat` proxy — switched from Sonnet July 21, 2026 |
| AI (updates pipeline) | Claude Haiku (`claude-haiku-4-5-20251001`) | Runs in GitHub Action, ~$0.02/day |
| AI (role drift checker) | Claude Haiku (`claude-haiku-4-5-20251001`) | Runs in GitHub Action, drafts new role entries; a few cents per drafting run |
| API Proxy | Vercel Serverless Function | `api/chat.js` — handles CORS, rate limiting, logging. Model string is passed from the frontend; chat.js is model-agnostic |
| Updates | GitHub Actions + static JSON | Daily cron 6am UTC → commits `public/updates-cache.json` |
| Role drift | GitHub Actions + PR | Weekly cron Mon 7am UTC → drafts new roles → opens PR for review |
| Hosting | Vercel (Hobby free tier) | Auto-deploys on push to `main` |
| Domain | name.com | DNS A record → 216.198.79.1, CNAME www → Vercel |
| Version Control | GitHub | Public repo: OmarNuno/secrole |

**No database.** All role data is static JS. No Supabase. No auth.

**The entire product runs on Haiku end to end** — in-app AI, updates pipeline, and role drift checker all use `claude-haiku-4-5-20251001`.

---

## 📁 Project Structure

```
secrole/
├── api/
│   └── chat.js              ← Anthropic API proxy (rate limiting + logging)
│                              (legacy api/updates.js DELETED July 2026)
├── public/
│   └── updates-cache.json   ← Written + committed daily by the updates GitHub Action
├── scripts/
│   ├── fetch-updates.js     ← Updates pipeline (v3) — see Updates Pipeline section
│   ├── check-role-drift.js  ← Role drift checker (v1) — see Role Drift Checker section
│   └── role-drift-ignore.json ← Names to exclude from drift detection { "entra": [], "purview": [] }
├── src/
│   ├── components/
│   │   ├── Badges.jsx        ← RiskBadge, ProductBadge, CategoryBadge
│   │   ├── Nav.jsx           ← Sticky nav. Counts (Entra/Purview/Critical) are DERIVED from role data (July 22)
│   │   └── RoleModal.jsx     ← Full-screen role detail modal
│   ├── data/
│   │   └── roles.js          ← ALL role data (126 Entra + 40 Purview = 166 roles)
│   ├── hooks/
│   │   └── useTheme.js       ← Dark/light theme hook (persists to localStorage)
│   ├── pages/
│   │   ├── AIAdvisor.jsx     ← Chat interface for role recommendations (Haiku, line ~62)
│   │   ├── OverlapAnalyzer.jsx ← Multi-role overlap + pushback template (Haiku, line ~212)
│   │   ├── RoleLibrary.jsx   ← Main role grid with search + filters
│   │   └── Updates.jsx       ← Reads /updates-cache.json; pinned New Roles section (July 21)
│   ├── App.jsx               ← Routes + theme initialization
│   ├── index.css             ← CSS variables for light/dark themes + utility classes
│   └── main.jsx              ← React entry point with BrowserRouter
├── .github/
│   └── workflows/
│       ├── fetch-updates.yml    ← Daily 6am UTC + manual dispatch; commits cache
│       └── check-role-drift.yml ← Weekly Mon 7am UTC + manual dispatch; opens role PR
├── vercel.json               ← SPA rewrites + API routing
├── vite.config.js            ← Standard Vite config
└── CLAUDE_CONTEXT.md         ← This file
```

---

## 🤖 Role Drift Checker (built & verified July 22, 2026)

Keeps `src/data/roles.js` in sync with Microsoft's official role lists. **Auto-draft, human-approve** model — it never commits roles to `main` on its own; it opens a PR for review.

**GitHub Action (weekly Mon 7am UTC, after the 6am updates run)** → runs `scripts/check-role-drift.js` (Node 22, zero npm deps) → fetches Microsoft's canonical role lists → diffs against `roles.js` → if drift found, Haiku drafts full role entries grounded in the fetched docs → patches `roles.js` → **opens a pull request** (branch `role-drift/<date>`) with a risk-rating summary table → you review and merge from anywhere → Vercel auto-deploys on merge.

### Sources (in the script)
| Source | Method | Notes |
|---|---|---|
| Entra built-in roles | Raw markdown `raw.githubusercontent.com/MicrosoftDocs/entra-docs/main/docs/identity/role-based-access-control/permissions-reference.md` | Canonical "All roles" table (name, anchor slug, description, template ID, privileged flag). Per-role permission detail fetched from the matching `includes/<slug>.md` |
| Purview roles & role groups | Raw markdown `raw.githubusercontent.com/MicrosoftDocs/defender-docs/main/defender-office-365/scc-permissions.md` | **defender-docs is PUBLIC** (unlike the Purview docs repo) so we get clean raw markdown, not scraped HTML. Parses both "Role groups" and "Roles" tables. `public` branch is a fallback URL |

### How it works (fetch → diff → draft → PR)
1. **Fetch** both canonical docs. If parsing yields suspiciously few roles (Entra < 50 or Purview groups < 20), it aborts loudly rather than "detecting" mass retirement — guards against Microsoft changing the doc format.
2. **Diff** official names against `roles.js` using fuzzy matching (`normName`) that tolerates Microsoft's plural/"Admin(s)" naming drift, minus anything in `scripts/role-drift-ignore.json`. Purview additions come from role **groups** only. Deprecated Purview groups (description starts with "Don't use") are skipped.
3. **Draft** up to `DRIFT_DRAFT_CAP` (default 15) roles per run — Entra first. For each, it fetches the official permission detail and Haiku drafts a full entry in SecRole house style: risk, description, permissions, leastPrivilege, category (constrained to existing categories), tags, relatedRoles (validated against real same-product IDs).
4. **Validate + patch:** drafts are validated (exact official name enforced, valid risk, valid category, required text present, relatedRoles filtered to existing same-product IDs). Sequential IDs assigned (next `e`/`p`). File is patched, then **re-imported to prove it still parses** before anything is committed.
5. **PR body** written to `$DRIFT_PR_BODY`; the workflow turns the working-tree change into a PR. Retired/renamed roles (in SecRole but no longer in the docs) are **flagged in the PR body, never auto-deleted**.

### Anti-hallucination & safety
- Claude drafts **only from fetched official doc text**, never from memory. Names must match the official list exactly; relatedRoles validated against real IDs.
- Nothing ships without a human merging the PR.
- If a `role-drift/*` PR is already open, the workflow **skips** the run (won't stack PRs) — merge or close the open one first.
- PRs are created by the default `GITHUB_TOKEN`, which doesn't trigger other workflows — fine here since Vercel deploys on **merge**, not on PR.

### Running it / clearing the backlog
- **Manual run:** GitHub → **Actions** tab → **Check Role Drift** → **Run workflow** (leave branch `main`). Use this repeatedly to work through a backlog faster than the weekly cadence.
- **Weekly cadence:** runs automatically every Monday 7am UTC.
- **Backlog note (as of July 22):** the first run added 15 Entra roles (e112–e126). **~54 roles remain queued** (rest of Entra + the full Purview role-group set). Either re-run the workflow manually a few times this week to pull them in, or let the Monday cadence clear them over the next several weeks. Each run opens a fresh PR to review and merge the same way.
- **Reviewing a drift PR:** check the risk-rating summary table in the PR body, then read the actual drafted text in the **Files changed** tab (especially anything rated Critical), and optionally open the **Vercel preview deployment** the PR builds to see the new roles rendered before merging. Merge → auto-deploys → nav counts update automatically (they're derived — see below).
- **Excluding a role:** don't want an obscure role group in the library? Close the PR and add its exact name to `scripts/role-drift-ignore.json` (`entra` or `purview` array) — it will never be flagged again.

### First run history (July 22, 2026)
Run #1 detected +24 Entra and +45 Purview missing. Drafted the first 15 (Entra), opened PR #1, merged after review. Added roles e112–e126: Agent Registry Administrator, AI Reader, Application Developer, Authentication Extensibility Administrator, Authentication Extensibility Password Administrator, Cloud App Security Administrator, Customer Delegated Admin Relationship Administrator, Directory Synchronization Accounts, Entra Backup Administrator, Entra Backup Reader, Exchange Backup Administrator, Partner Tier1 Support, Partner Tier2 Support, Password Administrator, Purview Workload Content Administrator. Two entries were later hand-corrected (e114, e119 — see Key Decisions). The run flagged Data Curator (p25) and Information Barriers Administrator (p34) as possibly retired/renamed — **still unverified, nothing deleted.**

---

## 📰 Updates Pipeline (built & verified July 20, 2026)

The `/updates` page is a real, self-maintaining Entra/Purview news feed. Full chain:

**GitHub Action (daily 6am UTC)** → runs `scripts/fetch-updates.js` (Node 22, zero npm deps) → fetches real Microsoft sources → sends compact batch to Claude Haiku for editorial triage → writes `public/updates-cache.json` → **commits as `secrole-bot`** → Vercel auto-deploys → users fetch a static file (free, instant, no per-user API cost).

### Sources (in the script)
| Source | Method | Notes |
|---|---|---|
| Microsoft Entra Release Notes | Raw markdown from `raw.githubusercontent.com/MicrosoftDocs/entra-docs/.../whats-new.md` | **The canonical place new Entra roles & permission changes are announced.** Parsed into per-announcement items with `[Type \| Service category]` tags |
| Microsoft Purview What's New | HTML from `learn.microsoft.com/en-us/purview/whats-new` (repo is private) | 2 most recent months as "Digest:" items; Claude splits digests into individual cards |
| M365 Roadmap API | JSON from `microsoft.com/releasecommunications/api/v1/m365`, no auth | Filtered to products containing entra/purview/azure active directory |
| MSRC Security Update Guide | RSS `api.msrc.microsoft.com/update-guide/rss` | Keyword pre-filter (entra, ADFS, kerberos, identity, purview, dlp, …) — raw feed is ~2,000 CVEs on Patch Tuesday |
| Tech Community Entra + Security blogs | RSS with fallback URL lists | ⚠️ Currently ALL fallback URLs return 0 items (see Gotchas) — page works fine without them |

### Script safeguards (fetch-updates.js v3)
- **Per-source cap of 12** items so no source floods the 50-item batch (learned the hard way: MSRC once contributed 2,061)
- Prompt rules: Claude consolidates duplicate CVEs into one card, splits monthly digests, categorizes New Role / Permission Change / Feature Update / Security Advisory / Roadmap, and must keep a mix of sources/categories
- **Anti-hallucination:** output URLs are validated against fetched URLs — Claude cannot invent articles
- Graceful degradation: any single source failing logs a ⚠️ and continues; Claude failure keeps the old cache; unchanged results skip the commit
- Run logs print per-source counts — first place to look when debugging

### Frontend (Updates.jsx — rewritten July 20, pinned New Roles added July 21)
Fetches `/updates-cache.json?t=${Date.now()}` (cache-buster). No refresh button, no secrets.

**Pinned "✦ New Roles" section (July 21, 2026):**
- On the "All" filter view, all `category: "New Role"` items render in a dedicated purple-accented section pinned ABOVE High Impact — new roles are SecRole's core value, so they're always first
- While pinned, New Role items are **excluded** from the High Impact / Other groupings below (no duplicates). Selecting the "New Role" filter chip shows them via the normal filtered list instead
- **Empty state:** when no New Role items exist in the cache, a dashed card shows "No new Entra or Purview roles announced — Last checked {date}" using `fetchedAt`
- Section headers refactored into a shared `SectionHeader` component used by New Roles / High Impact / Other Updates

**Note the division of labor:** the Updates feed *announces* new roles as news; the **Role Drift Checker** is what actually *adds them to the Role Library*. These are two separate pipelines with two separate GitHub Actions.

---

## ✅ Current State

### Features
- [x] Role Library — 126 Entra ID + 40 Purview roles with full data
- [x] Search by name, description, tags, category
- [x] Filter by product (Entra/Purview), risk level, category
- [x] Role detail modal — description, permissions, least-privilege guidance, related roles
- [x] Risk badges — Critical / High / Medium / Low with color coding
- [x] Overlap Analyzer — add 2-6 roles, get AI analysis with pushback template
- [x] AI Advisor — chat interface with role recommendations
- [x] Markdown rendering in AI responses (bold, headers, bullets, HR)
- [x] Updates page — LIVE with real Microsoft news, daily auto-refresh, clickable sources (July 20, 2026)
- [x] Pinned ✦ New Roles section on /updates with empty-state fallback (July 21, 2026)
- [x] In-app AI switched to Haiku 4.5 — ~70% cost cut (July 21, 2026)
- [x] **Role Drift Checker — weekly auto-detect of new Microsoft roles, Haiku drafts entries, opens PR for approval (July 22, 2026 — verified live, PR #1 merged)**
- [x] **Nav counts (Entra/Purview/Critical) now DERIVED from role data — auto-update on every drift merge (July 22, 2026)**
- [x] GitHub Actions — daily updates fetch + weekly role drift, both verified working
- [x] Dark/light mode toggle — persists to localStorage, respects system preference
- [x] Mobile hamburger menu — slide-out drawer on ≤768px
- [x] Rate limiting — 10 requests/IP/hour in api/chat.js
- [x] Usage logging — structured JSON logs in Vercel
- [x] Custom domain — secrole.com live with SSL

### Known Issues / Not Done Yet
- [ ] **~54 roles still queued** in the drift backlog (rest of Entra + full Purview role-group set) — run the Check Role Drift workflow manually a few times, or wait for the weekly cadence. See Role Drift Checker section
- [ ] **p25 Data Curator & p34 Information Barriers Administrator flagged as possibly retired/renamed** by the drift checker — unverified; nothing deleted. Verify against Microsoft docs when convenient
- [ ] Tech Community blog RSS feeds all return 0 (Microsoft killed them again) — updates page is healthy without them
- [ ] Rate limiter is in-memory only — resets on Vercel cold starts (fine for now; Upstash Redis is the upgrade path)
- [ ] No SEO individual role pages yet (planned V1.3)
- [ ] No side-by-side role comparison tool yet (planned V1.3)
- [ ] README.md still has default Vite content — needs updating
- [ ] Mobile layout for Overlap Analyzer and AI Advisor pages needs work

---

## 🗄️ Data Schema

### Role object (`src/data/roles.js`)
```js
{
  id: "e1",                    // "e" prefix = Entra, "p" prefix = Purview
  name: "Global Administrator",
  product: "Entra",            // "Entra" | "Purview"
  category: "Identity",        // Groups roles in the UI (drift checker constrains to existing categories)
  risk: "Critical",            // "Critical" | "High" | "Medium" | "Low"
  description: "...",          // 1-2 sentence plain English description
  permissions: "...",          // What the role can actually do
  leastPrivilege: "...",       // Guidance on when/how to assign
  tags: ["identity", "admin"], // Used in search
  relatedRoles: ["e5", "e21"]  // IDs of commonly confused roles (same product)
}
```

**Exports:** `ENTRA_ROLES`, `PURVIEW_ROLES`, `ALL_ROLES` (`[...ENTRA_ROLES, ...PURVIEW_ROLES]`), `RISK_ORDER`, `CATEGORIES`. Latest IDs: last Entra `e126`, last Purview `p40` (note: Purview IDs have a gap — 39 entries, IDs run to p40, plus a `p13c` sub-entry). **Nav.jsx derives its badge counts from these exports** — never hardcode counts again.

### Updates cache (`public/updates-cache.json`)
```json
{
  "lastUpdated": "ISO string",
  "fetchedAt": "ISO string",
  "updates": [
    {
      "id": "unique-slug",
      "title": "Update title",
      "summary": "2-3 sentence summary (Claude-written, original wording)",
      "category": "New Role | Permission Change | Feature Update | Security Advisory | Roadmap",
      "source": "e.g. Microsoft Entra Release Notes",
      "date": "Month YYYY",
      "importance": "high | medium | low",
      "url": "link to the original Microsoft source (optional but usually present)"
    }
  ]
}
```

`category: "New Role"` drives the pinned New Roles section on /updates.

### Role drift ignore list (`scripts/role-drift-ignore.json`)
```json
{ "entra": [], "purview": [] }
```
Exact role names in these arrays are excluded from drift detection forever. Use it to permanently dismiss role groups you don't want in the library.

---

## 🛣️ Routes

| Path | Component | Description |
|---|---|---|
| `/` | RoleLibrary | Main role grid — default landing page |
| `/analyzer` | OverlapAnalyzer | Multi-role overlap analysis |
| `/advisor` | AIAdvisor | AI chat for role recommendations |
| `/updates` | Updates | Daily Entra/Purview news feed (static JSON, pinned New Roles first) |
| `/api/chat` | api/chat.js | Serverless function — Anthropic proxy |

---

## 🔑 Environment Variables

### Vercel (Settings → Environment Variables)
| Key | Value | Used by |
|---|---|---|
| `VITE_ANTHROPIC_API_KEY` | `sk-ant-api03-...` | `api/chat.js` — Anthropic API proxy. **DO NOT DELETE** |

(`UPDATES_REFRESH_SECRET` was removed July 2026 — no longer exists.)

### GitHub (Settings → Secrets and variables → Actions)
| Key | Value | Used by |
|---|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` | `scripts/fetch-updates.js` (daily) AND `scripts/check-role-drift.js` (weekly) |

**Both GitHub Actions share the one `ANTHROPIC_API_KEY` secret** — no separate key for the drift checker.

### GitHub repo setting required for the drift checker
Settings → Actions → General → Workflow permissions → **"Allow GitHub Actions to create and approve pull requests"** must be CHECKED, or `gh pr create` fails. The read/write radio can stay on the restrictive "Read repository contents" default — the workflow declares its own explicit `permissions:` block (`contents: write`, `pull-requests: write`, `issues: write`), which overrides the repo default. (This is a personal repo, so no org policy can cap the workflow block.)

### Local development (`.env` at project root — never commit)
```
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
```

---

## 🧠 Key Decisions & Why

### No database
Role data is static — it changes maybe once a month when Microsoft adds roles. Data lives in `src/data/roles.js` and deploys with the app.

### Vercel serverless proxy for AI calls
Direct browser → Anthropic API calls fail with CORS errors. `api/chat.js` runs server-side, passes the API key securely, and adds rate limiting.

### Static JSON for Updates page
The GitHub Action fetches, triages, and **commits** the JSON to the repo, so it deploys like any other static asset. Users pay zero API cost; the Action pays ~$0.02/day (Haiku). (V1's `/tmp` cache + secret-refresh approach died on every cold start — replaced entirely.)

### Fetch real sources, let Claude only edit
Both the updates pipeline and the drift checker fetch actual Microsoft content first, then Claude filters/summarizes/categorizes/drafts from it, and outputs are validated against inputs (URLs for updates; role names + IDs for drift). Claude never generates role facts from memory. This is the core anti-hallucination principle across the whole product.

### Role drift: auto-draft, human-approve (July 22, 2026)
New Microsoft roles are detected automatically and drafted by Haiku, but shipped only via a **PR you merge** — never auto-committed to `main`. Risk classification is a judgment call for a security audience, so a human reviews every entry before it goes live. Fits the "fetch real sources, let Claude only edit" principle. The alternative designs (notify-only, or fully-automatic commit) were rejected: notify-only makes you do all the writing; fully-automatic risks a mis-rated risk level shipping unreviewed to a security tool.

### Nav counts derived, not hardcoded (July 22, 2026)
`Nav.jsx` originally hardcoded `111 / 40 / 3` in two places (desktop stats + mobile drawer). After the first drift merge the role data updated but the badges didn't. Fixed by importing `ENTRA_ROLES`, `PURVIEW_ROLES`, `ALL_ROLES` and computing `entraCount` / `purviewCount` / `criticalCount` (`ALL_ROLES.filter(r => r.risk === "Critical").length`) once at the top of the component. Badges now track the data automatically on every future merge. **Lesson: never reintroduce hardcoded counts anywhere in the UI — derive from the exports.**

### e114 / e119 hand-corrections (July 22, 2026)
Two of the first 15 drafted roles had imprecise wording caught in review, both fixed against Microsoft's official `includes/*.md`:
- **e114 Application Developer:** draft implied it could "grant OAuth 2.0 permissions" broadly. The real scope is create-app-registrations + **self-consent** for apps it owns (`createAsOwner`), not granting to others' apps. Reworded description + permissions; High rating kept.
- **e119 Directory Synchronization Accounts:** draft's permissions matched Microsoft's documented single read action — which looked self-contradictory next to its Critical rating. The Critical rating is correct but comes from **context**: the role is bound to the Entra Connect sync account, which holds broad effective directory-write + password-hash-sync access and is a tier-0 attack target. Reworded permissions + leastPrivilege to explain this rather than inventing write actions (which would have been hallucination). **Takeaway for reviewing future drift PRs: a role's documented permission list and its real-world risk can legitimately diverge — explain the gap, don't fabricate permissions to close it.**

### Entra Release Notes / permissions-reference as role sources of truth
Entra role announcements come from `whats-new.md` (updates feed); the canonical full role list is `permissions-reference.md` with per-role `includes/<slug>.md` detail (drift checker). Purview role groups come from `defender-docs` `scc-permissions.md` — which is a **public** repo, so clean raw markdown, unlike the private Purview docs repo the updates feed has to scrape as HTML.

### New Roles pinned first on /updates (July 21, 2026)
New role announcements are SecRole's core differentiator vs generic Microsoft news aggregators. Dedicated purple section always at the top of the "All" view, with a useful empty state. This section is the future hook for a one-click "add to Role Library" flow (would tie the Updates feed to the Drift Checker).

### Full Haiku (July 21, 2026)
Everything runs on `claude-haiku-4-5-20251001` — updates pipeline, drift checker, and in-app AI Advisor / Overlap Analyzer. Model string lives in the frontend (`AIAdvisor.jsx` ~62, `OverlapAnalyzer.jsx` ~212) and passes through the model-agnostic `api/chat.js`. Domain knowledge is in the system prompts, not the model. If answers feel thin, tune the prompts before considering a model upgrade.

### Dark mode as default
Security tools skew toward dark mode users. GitHub-dark style (`#0d1117`) background. System preference respected on first visit, then persisted.

### In-memory rate limiting
10 requests/IP/hour. Resets on cold starts — acceptable. Upgrade path is Upstash Redis.

---

## ⚠️ Gotchas

1. **NVM not in PATH by default on this Mac.** Always run before npm:
   ```bash
   export NVM_DIR="$HOME/.nvm"
   [ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"
   nvm use --lts
   ```

2. **The bot commits to main → always `git pull --rebase` before pushing.** The updates Action commits the cache most mornings; a merged drift PR also lands on main. Local pushes get rejected until you pull. `git config pull.rebase true` is set. **Watch for this trap:** `git status` can say "up to date" against a *cached* ref while `origin/main` is actually ahead — run `git pull --rebase` anyway and check the output for a fast-forward. (This bit us July 22: an uploaded roles.js was the stale pre-merge version because local hadn't truly pulled.)

3. **Tech Community RSS is a graveyard.** Microsoft has broken these feeds repeatedly. The updates script tries fallback URL lists and logs which served. Don't burn time here — the other four sources carry the page.

4. **Purview docs split across repos.** Purview *What's New* (updates feed) is a **private** repo → scraped as HTML from learn.microsoft.com. Purview *roles & role groups* (drift checker) is in the **public** `defender-docs` repo → clean raw markdown at `defender-office-365/scc-permissions.md`. Don't confuse the two.

5. **Vercel rewrites catch /api routes.** `vercel.json` must list the API route BEFORE the SPA catch-all or `/api/chat` returns 404:
   ```json
   { "rewrites": [
       { "source": "/api/:path*", "destination": "/api/:path*" },
       { "source": "/:path*", "destination": "/index.html" } ] }
   ```

6. **One shared API key on GitHub, one on Vercel.** GitHub Actions (both updates + drift) use `ANTHROPIC_API_KEY`. Vercel uses `VITE_ANTHROPIC_API_KEY` (for api/chat.js). Different systems, both required.

7. **Model string format matters.** Use dated versions like `claude-haiku-4-5-20251001`, not `claude-haiku-4-5`.

8. **Git push requires Personal Access Token** — stored in macOS keychain (`git config --global credential.helper osxkeychain`).

9. **Vite only reads `.env` on startup.** After editing `.env`, restart `npm run dev`.

10. **Markdown in AI responses.** `AIAdvisor.jsx` and `OverlapAnalyzer.jsx` have a `formatMessage()` using `dangerouslySetInnerHTML` — only safe because content comes from our own API.

11. **Finder hides dotfolders** (`.github`, `.env`). Press **Cmd+Shift+.** to toggle, or use Terminal. (`src/`, `scripts/` are normal folders, visible in Finder.)

12. **VS Code's `!` icon on .yml files is the YAML file-type icon**, not an error. `M` = modified/uncommitted (real signal).

13. **Debugging the pipelines via Actions tab:**
    - *Updates:* latest "Fetch and categorize updates" run → per-source counts print first (`Entra Release Notes: 11 | ... | MSRC: 23`). A source at 0 with ⚠️ means its URL(s) died; everything else degrades gracefully.
    - *Drift:* latest "Check for role drift" run → prints official vs SecRole counts, then `🔍 Drift: +N Entra, +M Purview`, then drafting logs. If it says "in sync" there's genuinely no drift. If a `role-drift/*` PR is already open, the run **skips** (by design — merge/close the open one first).

14. **Files downloaded from Claude land in ~/Downloads — they don't replace project files by themselves.** Sanity-check before committing a Claude-provided file: `grep -c "<something unique to the new code>" <target file>` — if it prints 0, the copy never happened. Fix: `cp ~/Downloads/<file> <target path>`. (Verified strings we've used: `entraCount` in Nav.jsx, `tier-0 target` in roles.js, `check-role-drift` in the workflow.)

15. **Drift checker needs the PR-creation repo setting.** Settings → Actions → General → **"Allow GitHub Actions to create and approve pull requests"** must be checked. The read-only default radio is fine — the workflow's explicit `permissions:` block overrides it. See Env Variables section.

---

## 📋 Next Steps (Priority Order)

### Immediate
- [ ] **Clear the drift backlog** — run Check Role Drift a few more times this week (Actions → Check Role Drift → Run workflow) to bring in the ~54 queued roles, reviewing/merging each PR. Or let the Monday cadence handle it
- [ ] **Verify p25 Data Curator & p34 Information Barriers Administrator** — drift flagged them as possibly retired/renamed; confirm against Microsoft docs and either rename in roles.js or leave as-is
- [ ] Update README.md with real project description
- [ ] Spot-check Haiku answer quality over a week of team use — tune system prompts if responses feel thin

### V1.3 — SEO & Features
- [ ] Individual role pages: `/roles/global-administrator` with full SEO meta tags
- [ ] sitemap.xml generation
- [ ] Comparison pages: `/compare/global-admin-vs-security-admin`
- [ ] Submit to Google Search Console (verification TXT already on name.com)
- [ ] Dedicated `/new-roles` route (own URL to bookmark/share + SEO) reading the cache filtered to New Role
- [ ] Side-by-side role comparison tool (pick 2-3 roles, compare columns)
- [ ] "What role do I need?" wizard (3-4 question flow → recommendation)
- [ ] Upgrade rate limiter to Upstash Redis for persistent limits
- [ ] Mobile layout polish for Overlap Analyzer and AI Advisor
- [ ] **One-click "add to Role Library" from the Updates New Roles section** — would connect the Updates feed to the Drift Checker (the feed discovers, the checker drafts)

### V1.4 — Monetization (if traffic warrants)
- [ ] API key per-team model if enterprise interest
- [ ] Newsletter / email capture for updates
- [ ] Share SecRole with Microsoft Tech Community and r/sysadmin

---

## 💰 Cost Summary

| Service | Plan | Monthly Cost |
|---|---|---|
| Vercel | Hobby (free) | $0 |
| GitHub | Free (public repo) | $0 |
| Anthropic API (in-app AI, Haiku) | Pay per use | ~$2-6 at 20-50 questions/day |
| Updates fetch | GitHub Action once/day, Haiku | ~$0.02/day = ~$0.60/mo |
| Role drift checker | GitHub Action weekly, Haiku | ~a few cents per drafting run; $0 when in sync (~pennies/mo at steady state) |
| name.com domain | Annual | ~$1/mo amortized |
| **Total** | | **~$4-8/mo** |

**Previous cost with Lovable + Supabase Pro:** ~$50-75/mo. Sonnet-era cost: ~$10-22/mo.

---

## 🚀 Standard Session-Opening Prompt

When starting a new Claude session for this project, say:

> "I'm working on SecRole (secrole.com) — here's the full context: [paste this file]. Today I want to work on: [describe task]."

---

*Regenerated July 22, 2026 after shipping the Role Drift Checker (weekly auto-detect of new Microsoft roles → Haiku drafts → PR for approval), making the nav counts derive from role data, and hand-correcting the e114/e119 entries. Live role count: 126 Entra + 40 Purview.*
