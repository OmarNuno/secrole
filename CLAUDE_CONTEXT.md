# SecRole — CLAUDE_CONTEXT.md

> **Purpose of this file:** Paste this at the start of every new Claude session to restore full project context instantly. Last updated: June 2026.

---

## 📌 Project Overview

**SecRole** (`secrole.com`) is a Microsoft identity and security role intelligence tool built for IT admins, security engineers, and compliance officers. It provides a complete reference for all Microsoft Entra ID and Microsoft Purview RBAC roles with risk levels, permissions, least-privilege guidance, an AI-powered overlap analyzer, an AI role advisor, and a daily-refreshed news feed pulling Microsoft updates.

**Owner:** Omar Nuno (Velotek.ai)
**Repo:** github.com/OmarNuno/secrole
**Live URL:** secrole.com (also secrole.vercel.app)
**Started:** April 2026
**Current Version:** V1.1

---

## 🏗️ Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React + Vite | No TypeScript — plain JSX |
| Routing | react-router-dom | SPA with BrowserRouter |
| Styling | CSS variables + inline styles | Full light/dark theme via `data-theme` attribute |
| AI | Anthropic Claude API | Sonnet 4.5 via `/api/chat` proxy |
| API Proxy | Vercel Serverless Function | `api/chat.js` — handles CORS, rate limiting, logging |
| Updates | GitHub Actions + static JSON | Daily cron → `public/updates-cache.json` |
| Hosting | Vercel (Hobby free tier) | Auto-deploys on push to `main` |
| Domain | name.com | DNS A record → 216.198.79.1, CNAME www → Vercel |
| Version Control | GitHub | Public repo: OmarNuno/secrole |

**No database.** All role data is static JS. No Supabase. No auth.

---

## 📁 Project Structure

```
secrole/
├── api/
│   ├── chat.js              ← Anthropic API proxy (rate limiting + logging)
│   └── updates.js           ← Legacy — no longer used, can delete
├── public/
│   └── updates-cache.json   ← Static JSON written by GitHub Action daily
├── scripts/
│   └── fetch-updates.js     ← Node script run by GitHub Action
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
│   │   └── Updates.jsx       ← Reads from /updates-cache.json — no API calls
│   ├── App.jsx               ← Routes + theme initialization
│   ├── index.css             ← CSS variables for light/dark themes + utility classes
│   └── main.jsx              ← React entry point with BrowserRouter
├── .github/
│   └── workflows/
│       └── fetch-updates.yml ← Runs daily at 6am UTC
├── vercel.json               ← SPA rewrites + API routing
├── vite.config.js            ← Standard Vite config
└── CLAUDE_CONTEXT.md         ← This file
```

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
- [x] Updates page — reads static JSON, no API calls for end users
- [x] GitHub Action — daily auto-refresh of updates-cache.json
- [x] Dark/light mode toggle — persists to localStorage, respects system preference
- [x] Mobile hamburger menu — slide-out drawer on ≤768px
- [x] Rate limiting — 10 requests/IP/hour in api/chat.js
- [x] Usage logging — structured JSON logs in Vercel
- [x] Custom domain — secrole.com live with SSL

### Known Issues / Not Done Yet
- [ ] Model name in AIAdvisor.jsx and OverlapAnalyzer.jsx still says `claude-sonnet-4-5` — update to `claude-haiku-4-5-20251001` to cut costs 70%
- [ ] `api/updates.js` still exists but is no longer used — safe to delete
- [ ] Rate limiter is in-memory only — resets on Vercel cold starts (good enough for now, upgrade to Upstash Redis for production scale)
- [ ] No SEO individual role pages yet (planned V1.2)
- [ ] No side-by-side role comparison tool yet (planned V1.3)
- [ ] README.md still has default Vite content — needs updating
- [ ] Mobile layout for Overlap Analyzer and AI Advisor pages needs work
- [ ] The `_lovable.www.secrole.com` TXT record on name.com was deleted (confirmed)

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
      "summary": "2-3 sentence summary",
      "category": "Feature Update | New Role | Permission Change | Security Advisory | Roadmap",
      "source": "Microsoft Tech Community",
      "date": "May 2026",
      "importance": "high | medium | low"
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
| `/updates` | Updates | Microsoft Entra/Purview news feed |
| `/api/chat` | api/chat.js | Serverless function — Anthropic proxy |

---

## 🔑 Environment Variables

### Vercel (Settings → Environment Variables)
| Key | Value | Used by |
|---|---|---|
| `VITE_ANTHROPIC_API_KEY` | `sk-ant-api03-...` | `api/chat.js` — Anthropic API proxy |
| `UPDATES_REFRESH_SECRET` | any password you choose | Legacy `api/updates.js` — no longer needed |

### GitHub (Settings → Secrets → Actions)
| Key | Value | Used by |
|---|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` | `scripts/fetch-updates.js` in GitHub Action |

### Local development (`.env` at project root — never commit)
```
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
```

---

## 🧠 Key Decisions & Why

### No database
Role data is static — it changes maybe once a month when Microsoft adds roles. A database would add cost, complexity, and a Supabase dependency we explicitly moved away from. Data lives in `src/data/roles.js` and gets deployed with the app.

### Vercel serverless proxy for AI calls
Direct browser → Anthropic API calls fail with CORS errors. The `api/chat.js` serverless function runs server-side, passes the API key securely, and adds rate limiting. This is the correct architecture for any frontend app calling the Anthropic API.

### Static JSON for Updates page
Originally built with a secret-key refresh mechanism, but that meant users saw empty content. Switched to GitHub Actions writing a static JSON file daily. Users fetch a static file (free, instant, no API cost). The GitHub Action pays the API cost once per day (~$0.25).

### Dark mode as default
Security tools skew toward dark mode users (SOC analysts, IT admins working late). GitHub-dark style (`#0d1117`) background. System preference respected on first visit, then persisted to localStorage.

### CSS variables for theming
All colors defined as CSS variables on `:root` (light) and `[data-theme="dark"]`. Components use `var(--text)`, `var(--bg)` etc. Theme switches by toggling `data-theme` on `document.documentElement`. No CSS-in-JS library needed.

### In-memory rate limiting
10 requests/IP/hour. Resets on cold starts which is acceptable — we're not a bank. Upgrade path is Upstash Redis (free tier, 1 line of code) when we need persistence.

### Haiku vs Sonnet
Currently using `claude-sonnet-4-5` — should switch to `claude-haiku-4-5-20251001` for 70% cost reduction. For role lookup and recommendation tasks (pattern matching against known data) Haiku quality is sufficient.

---

## ⚠️ Gotchas

1. **NVM not in PATH by default on this Mac.** Always run before npm:
   ```bash
   export NVM_DIR="$HOME/.nvm"
   [ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"
   nvm use --lts
   ```
   Or add to `~/.zshrc` to make permanent.

2. **Vercel rewrites catch /api routes.** The `vercel.json` must include the API route BEFORE the SPA catch-all or `/api/chat` returns 404. Current working config:
   ```json
   {
     "rewrites": [
       { "source": "/api/:path*", "destination": "/api/:path*" },
       { "source": "/:path*", "destination": "/index.html" }
     ]
   }
   ```

3. **GitHub Actions needs ANTHROPIC_API_KEY secret separately** from Vercel's env vars. They are different systems. Vercel uses `VITE_ANTHROPIC_API_KEY`, GitHub Action uses `ANTHROPIC_API_KEY` (no VITE_ prefix).

4. **Model string format matters.** Use `claude-haiku-4-5-20251001` not `claude-haiku-4-5` — Anthropic API requires the dated version string for current models.

5. **`/tmp` cache resets on Vercel cold starts.** The old `api/updates.js` used `/tmp` for caching which meant cache was lost frequently. This is why we switched to GitHub Actions writing to `public/updates-cache.json` instead.

6. **Git push requires Personal Access Token** on this machine — password auth is disabled by GitHub. Token stored in macOS keychain after first use (`git config --global credential.helper osxkeychain`).

7. **Vite only reads `.env` on startup.** After creating or editing `.env`, always restart `npm run dev`.

8. **`useTheme` hook must be imported from `../hooks/useTheme`** — the hooks folder is inside `src/`. Easy to place it at root level by mistake.

9. **Markdown in AI responses.** Both `AIAdvisor.jsx` and `OverlapAnalyzer.jsx` have a `formatMessage()` function that converts `**bold**`, `## headers`, `- bullets`, and `---` to HTML. Uses `dangerouslySetInnerHTML` — only safe because content comes from our own API.

10. **Don't delete `api/updates.js` until confirming GitHub Action works** — it's unused but harmless. Delete after first successful Action run.

---

## 📋 Next Steps (Priority Order)

### Immediate
- [ ] Switch model to `claude-haiku-4-5-20251001` in AIAdvisor.jsx and OverlapAnalyzer.jsx
- [ ] Add `ANTHROPIC_API_KEY` secret to GitHub repo for the Actions workflow
- [ ] Trigger GitHub Action manually to test and populate updates-cache.json
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
- [ ] Add Purview roles discovered in Updates feed to roles.js data

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
| Anthropic API | Pay per use | ~$8-20 at 20-50 questions/day |
| Updates fetch | GitHub Action once/day | ~$0.25/day = ~$7.50/mo |
| name.com domain | Annual | ~$1/mo amortized |
| **Total** | | **~$17-30/mo** |

**Previous cost with Lovable + Supabase Pro:** ~$50-75/mo
**Savings:** ~$30-45/mo

---

## 🚀 Standard Session-Opening Prompt

When starting a new Claude session for this project, say:

> "I'm working on SecRole (secrole.com) — here's the full context: [paste this file]. Today I want to work on: [describe task]."

---

*Generated from full project build session — April through June 2026.*
