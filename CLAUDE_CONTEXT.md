# SecRole — CLAUDE_CONTEXT.md

> **Purpose of this file:** Paste this at the start of every new Claude session to restore full project context instantly. Last updated: July 20, 2026.

---

## 📌 Project Overview

**SecRole** (`secrole.com`) is a Microsoft identity and security role intelligence tool built for IT admins, security engineers, and compliance officers. It provides a complete reference for all Microsoft Entra ID and Microsoft Purview RBAC roles with risk levels, permissions, least-privilege guidance, an AI-powered overlap analyzer, an AI role advisor, and a daily-refreshed news feed pulling real Microsoft updates from official sources.

**Owner:** Omar Nuno (Velotek.ai)
**Repo:** github.com/OmarNuno/secrole
**Live URL:** secrole.com (also secrole.vercel.app)
**Started:** April 2026
**Current Version:** V1.1 (Updates pipeline live as of July 20, 2026)

---

## 🏗️ Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React + Vite | No TypeScript — plain JSX. `"type": "module"` in package.json |
| Routing | react-router-dom | SPA with BrowserRouter |
| Styling | CSS variables + inline styles | Full light/dark theme via `data-theme` attribute |
| AI (in-app) | Anthropic Claude API | Via `/api/chat` proxy |
| AI (updates pipeline) | Claude Haiku (`claude-haiku-4-5-20251001`) | Runs in GitHub Action, ~$0.02/day |
| API Proxy | Vercel Serverless Function | `api/chat.js` — handles CORS, rate limiting, logging |
| Updates | GitHub Actions + static JSON | Daily cron 6am UTC → commits `public/updates-cache.json` |
| Hosting | Vercel (Hobby free tier) | Auto-deploys on push to `main` |
| Domain | name.com | DNS A record → 216.198.79.1, CNAME www → Vercel |
| Version Control | GitHub | Public repo: OmarNuno/secrole |

**No database.** All role data is static JS. No Supabase. No auth.

---

## 📁 Project Structure

```
secrole/
├── api/
│   └── chat.js              ← Anthropic API proxy (rate limiting + logging)
│                              (legacy api/updates.js DELETED July 2026)
├── public/
│   └── updates-cache.json   ← Written + committed daily by GitHub Action
├── scripts/
│   └── fetch-updates.js     ← Updates pipeline (v3) — see Updates Pipeline section
├── src/
│   ├── components/
│   │   ├── Badges.jsx        ← RiskBadge, ProductBadge, CategoryBadge
│   │   ├── Nav.jsx           ← Sticky nav with dark mode toggle + mobile hamburger
│   │   └── RoleModal.jsx     ← Full-screen role detail modal
│   ├── data/
│   │   └── roles.js          ← ALL role data (111 Entra + 40 Purview = 151 roles)
│   ├── hooks/
│   │   └── useTheme.js       ← Dark/light theme hook (persists to localStorage)
│   ├── pages/
│   │   ├── AIAdvisor.jsx     ← Chat interface for role recommendations
│   │   ├── OverlapAnalyzer.jsx ← Multi-role overlap + pushback template generator
│   │   ├── RoleLibrary.jsx   ← Main role grid with search + filters
│   │   └── Updates.jsx       ← Reads /updates-cache.json (rewritten July 2026)
│   ├── App.jsx               ← Routes + theme initialization
│   ├── index.css             ← CSS variables for light/dark themes + utility classes
│   └── main.jsx              ← React entry point with BrowserRouter
├── .github/
│   └── workflows/
│       └── fetch-updates.yml ← Daily 6am UTC + manual dispatch; commits cache
├── vercel.json               ← SPA rewrites + API routing
├── vite.config.js            ← Standard Vite config
└── CLAUDE_CONTEXT.md         ← This file
```

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
- Prompt rules: Claude consolidates duplicate CVEs into one card (e.g., "7 DoS Vulnerabilities Patched in ADFS"), splits monthly digests, categorizes New Role / Permission Change / Feature Update / Security Advisory / Roadmap, and must keep a mix of sources/categories
- **Anti-hallucination:** output URLs are validated against fetched URLs — Claude cannot invent articles
- Graceful degradation: any single source failing logs a ⚠️ and continues; Claude failure keeps the old cache; unchanged results skip the commit
- Run logs print per-source counts — first place to look when debugging

### Frontend (Updates.jsx)
Fetches `/updates-cache.json?t=${Date.now()}` (cache-buster). No refresh button, no secrets — the old secret-key UI is gone. Items with a `url` render clickable titles. Empty state says the feed refreshes daily.

---

## ✅ Current State

### Features
- [x] Role Library — 111 Entra ID + 40 Purview roles with full data
- [x] Search by name, description, tags, category
- [x] Filter by product (Entra/Purview), risk level, category
- [x] Role detail modal — description, permissions, least-privilege guidance, related roles
- [x] Risk badges — Critical / High / Medium / Low with color coding
- [x] Overlap Analyzer — add 2-6 roles, get AI analysis with pushback template
- [x] AI Advisor — chat interface with role recommendations
- [x] Markdown rendering in AI responses (bold, headers, bullets, HR)
- [x] **Updates page — LIVE with real Microsoft news, daily auto-refresh, clickable sources** (July 2026)
- [x] GitHub Action — daily fetch + commit of updates-cache.json (verified working, ~26s runs)
- [x] Dark/light mode toggle — persists to localStorage, respects system preference
- [x] Mobile hamburger menu — slide-out drawer on ≤768px
- [x] Rate limiting — 10 requests/IP/hour in api/chat.js
- [x] Usage logging — structured JSON logs in Vercel
- [x] Custom domain — secrole.com live with SSL
- [x] Legacy api/updates.js deleted; UPDATES_REFRESH_SECRET removed from Vercel
- [x] Workflow actions on v5, Node 22 (deprecation warning silenced)

### Known Issues / Not Done Yet
- [ ] Model name in AIAdvisor.jsx and OverlapAnalyzer.jsx still says `claude-sonnet-4-5` — update to `claude-haiku-4-5-20251001` to cut costs 70%
- [ ] Tech Community blog RSS feeds all return 0 (Microsoft killed them again) — page is healthy without them; revisit only if the feed feels thin
- [ ] Rate limiter is in-memory only — resets on Vercel cold starts (fine for now; Upstash Redis is the upgrade path)
- [ ] No SEO individual role pages yet (planned V1.2)
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
  category: "Identity",        // Groups roles in the UI
  risk: "Critical",            // "Critical" | "High" | "Medium" | "Low"
  description: "...",          // 1-2 sentence plain English description
  permissions: "...",          // What the role can actually do
  leastPrivilege: "...",       // Guidance on when/how to assign
  tags: ["identity", "admin"], // Used in search
  relatedRoles: ["e5", "e21"]  // IDs of commonly confused roles
}
```

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

---

## 🛣️ Routes

| Path | Component | Description |
|---|---|---|
| `/` | RoleLibrary | Main role grid — default landing page |
| `/analyzer` | OverlapAnalyzer | Multi-role overlap analysis |
| `/advisor` | AIAdvisor | AI chat for role recommendations |
| `/updates` | Updates | Daily Entra/Purview news feed (static JSON) |
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
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` | `scripts/fetch-updates.js` in the daily Action |

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

### Static JSON for Updates page (the architecture that finally worked)
V1 used a serverless endpoint with a `/tmp` cache and a secret-key refresh — the cache died on every cold start and users saw a permanently empty page. Replaced entirely: the GitHub Action fetches, triages, and **commits** the JSON to the repo, so it deploys like any other static asset. Users pay zero API cost; the Action pays ~$0.02/day (Haiku).

### Fetch real sources, let Claude only edit
Claude never generates "news" from memory — the script fetches actual Microsoft content first, then Claude filters/summarizes/categorizes it, and output URLs are validated against input URLs. This eliminates stale or invented articles.

### Entra Release Notes as the role-announcement source of truth
`learn.microsoft.com/en-us/entra/fundamentals/whats-new` is where Microsoft announces new built-in roles and permission changes, and its raw markdown is publicly fetchable from the entra-docs GitHub repo with clean `Type` / `Service category` metadata. This powers the "New Role" and "Permission Change" categories.

### Dark mode as default
Security tools skew toward dark mode users. GitHub-dark style (`#0d1117`) background. System preference respected on first visit, then persisted.

### CSS variables for theming
All colors on `:root` (light) and `[data-theme="dark"]`. Theme switches by toggling `data-theme` on `document.documentElement`.

### In-memory rate limiting
10 requests/IP/hour. Resets on cold starts — acceptable. Upgrade path is Upstash Redis.

### Haiku vs Sonnet
Updates pipeline already uses `claude-haiku-4-5-20251001`. The in-app AI Advisor and Overlap Analyzer still use Sonnet — switching them to Haiku is the top remaining cost optimization.

---

## ⚠️ Gotchas

1. **NVM not in PATH by default on this Mac.** Always run before npm:
   ```bash
   export NVM_DIR="$HOME/.nvm"
   [ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"
   nvm use --lts
   ```

2. **The bot commits to main daily → always `git pull --rebase` before pushing.** The Action commits `chore: refresh updates cache` most mornings, so local pushes get rejected until you pull. `git config pull.rebase true` is set so plain `git pull` rebases.

3. **Tech Community RSS is a graveyard.** Microsoft has broken these feeds repeatedly (2024 platform migration killed `board.id` URLs; the `t5/s/` workaround died by mid-2026; plugin-style `custom-blog-rss` URLs also return empty). The script tries fallback URL lists and logs which URL served or that all were exhausted. Don't burn time here — the other four sources carry the page.

4. **Purview docs repo is private.** Unlike entra-docs, there's no raw markdown for Purview's What's New — the script fetches the rendered learn.microsoft.com HTML and strips tags.

5. **Vercel rewrites catch /api routes.** `vercel.json` must list the API route BEFORE the SPA catch-all or `/api/chat` returns 404:
   ```json
   { "rewrites": [
       { "source": "/api/:path*", "destination": "/api/:path*" },
       { "source": "/:path*", "destination": "/index.html" } ] }
   ```

6. **Two separate API key homes.** Vercel uses `VITE_ANTHROPIC_API_KEY` (for api/chat.js); GitHub Actions uses `ANTHROPIC_API_KEY` (no VITE_ prefix, for the updates script). Different systems, both required.

7. **Model string format matters.** Use dated versions like `claude-haiku-4-5-20251001`, not `claude-haiku-4-5`.

8. **Git push requires Personal Access Token** — stored in macOS keychain (`git config --global credential.helper osxkeychain`).

9. **Vite only reads `.env` on startup.** After editing `.env`, restart `npm run dev`.

10. **Markdown in AI responses.** `AIAdvisor.jsx` and `OverlapAnalyzer.jsx` have a `formatMessage()` using `dangerouslySetInnerHTML` — only safe because content comes from our own API.

11. **Finder hides dotfolders** (`.github`, `.env`). Press **Cmd+Shift+.** to toggle visibility, or just use Terminal.

12. **VS Code's `!` icon on .yml files is the YAML file-type icon**, not an error. `M` = modified/uncommitted (real signal); dot in the tab = unsaved.

13. **Debugging the updates pipeline:** Actions tab → latest run → "Fetch and categorize updates" step. Per-source counts print first (e.g. `Entra Release Notes: 11 | ... | MSRC: 23`). A source at 0 with a ⚠️ means its URL(s) died; everything else degrades gracefully.

---

## 📋 Next Steps (Priority Order)

### Immediate
- [ ] Switch model to `claude-haiku-4-5-20251001` in AIAdvisor.jsx and OverlapAnalyzer.jsx (70% cost cut on in-app AI)
- [ ] Update README.md with real project description

### V1.2 — SEO
- [ ] Add React Router routes for individual roles: `/roles/global-administrator`
- [ ] Generate individual role pages with full SEO meta tags
- [ ] Add sitemap.xml generation
- [ ] Add comparison pages: `/compare/global-admin-vs-security-admin`
- [ ] Submit to Google Search Console (verification TXT already on name.com)

### V1.3 — Features
- [ ] Side-by-side role comparison tool (pick 2-3 roles, compare columns)
- [ ] "What role do I need?" wizard (3-4 question flow → recommendation)
- [ ] Upgrade rate limiter to Upstash Redis for persistent limits
- [ ] Add new roles surfaced by the Updates feed (e.g. SOC Identity Responder, June 2026) to roles.js data — the feed now discovers these automatically; adding them to the library is manual
- [ ] Mobile layout polish for Overlap Analyzer and AI Advisor

### V1.4 — Monetization (if traffic warrants)
- [ ] Consider API key per-team model if enterprise interest
- [ ] Newsletter / email capture for updates
- [ ] Share SecRole with Microsoft Tech Community and r/sysadmin

---

## 💰 Cost Summary

| Service | Plan | Monthly Cost |
|---|---|---|
| Vercel | Hobby (free) | $0 |
| GitHub | Free (public repo) | $0 |
| Anthropic API (in-app AI) | Pay per use | ~$8-20 at 20-50 questions/day (drops ~70% after Haiku switch) |
| Updates fetch | GitHub Action once/day, Haiku | ~$0.02/day = ~$0.60/mo |
| name.com domain | Annual | ~$1/mo amortized |
| **Total** | | **~$10-22/mo** |

**Previous cost with Lovable + Supabase Pro:** ~$50-75/mo

---

## 🚀 Standard Session-Opening Prompt

When starting a new Claude session for this project, say:

> "I'm working on SecRole (secrole.com) — here's the full context: [paste this file]. Today I want to work on: [describe task]."

---

*Regenerated July 20, 2026 after building and verifying the Updates pipeline end to end.*
