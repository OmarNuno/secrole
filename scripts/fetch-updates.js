/**
 * SecRole — fetch-updates.js  (v2)
 * Runs daily via GitHub Actions. Zero npm dependencies (Node 20+ native fetch).
 *
 * Pipeline:
 *   1. Fetch REAL content from official Microsoft sources:
 *      - Microsoft Entra release notes (learn.microsoft.com "What's new" — where
 *        new roles & permission changes are announced; fetched as raw markdown)
 *      - Microsoft Purview "What's new" (learn.microsoft.com; fetched as HTML)
 *      - M365 Roadmap API (filtered to Entra + Purview products)
 *      - Tech Community Entra (Identity) blog RSS
 *      - Tech Community Security & Compliance blog RSS
 *      - MSRC Security Update Guide RSS
 *   2. Send the fetched items to Claude (Haiku) to filter for role/RBAC/identity
 *      relevance, summarize, consolidate duplicate CVEs, and categorize into the
 *      SecRole schema.
 *   3. Write public/updates-cache.json (committed by the workflow → deployed by Vercel).
 *
 * Claude NEVER invents news — it only works with items fetched in step 1,
 * and every output item carries an original source URL.
 */

import { writeFileSync, readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, "..", "public", "updates-cache.json");

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = "claude-haiku-4-5-20251001";
const LOOKBACK_DAYS = 30;       // only consider items from the last 30 days
const MAX_ITEMS_TO_CLAUDE = 50; // cap raw items sent for categorization
const MAX_OUTPUT_ITEMS = 20;    // cap items shown on the Updates page

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

const ROADMAP_API = "https://www.microsoft.com/releasecommunications/api/v1/m365";

// Raw markdown behind learn.microsoft.com/en-us/entra/fundamentals/whats-new —
// the canonical page where new Entra roles and permission changes are announced.
const ENTRA_WHATS_NEW_RAW =
  "https://raw.githubusercontent.com/MicrosoftDocs/entra-docs/main/docs/fundamentals/whats-new.md";
const ENTRA_WHATS_NEW_PAGE =
  "https://learn.microsoft.com/en-us/entra/fundamentals/whats-new";

// Purview's docs repo is private, so we fetch the rendered page and strip HTML.
const PURVIEW_WHATS_NEW_PAGE =
  "https://learn.microsoft.com/en-us/purview/whats-new";

const RSS_SOURCES = [
  {
    name: "Microsoft Entra Blog",
    url: "https://techcommunity.microsoft.com/t5/s/gxcuf89792/rss/board?board.id=Identity",
  },
  {
    name: "Microsoft Security & Compliance Blog",
    url: "https://techcommunity.microsoft.com/t5/s/gxcuf89792/rss/board?board.id=MicrosoftSecurityandCompliance",
  },
  {
    name: "MSRC Security Update Guide",
    url: "https://api.msrc.microsoft.com/update-guide/rss",
  },
];

const FETCH_HEADERS = {
  "User-Agent": "SecRole-UpdatesBot/1.0 (+https://secrole.com)",
  "Accept": "application/json, application/rss+xml, application/xml, text/html, text/markdown, */*",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const cutoffDate = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);

function stripHtml(html = "") {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripMarkdown(md = "") {
  return md
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // [text](link) → text
    .replace(/[*_`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function monthToISO(monthYear) {
  // "June 2026" → "2026-06-01" (for lookback filtering / sorting)
  const d = new Date(`${monthYear} 1`);
  return isNaN(d) ? "" : d.toISOString().slice(0, 10);
}

function tag(xml, name) {
  // Extracts <name>…</name>, handling CDATA. Pragmatic RSS parsing, zero deps.
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  if (!m) return "";
  return stripHtml(m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1"));
}

async function fetchWithTimeout(url, ms = 20000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { headers: FETCH_HEADERS, signal: controller.signal, redirect: "follow" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } finally {
    clearTimeout(t);
  }
}

// ---------------------------------------------------------------------------
// Step 1a: Entra release notes (markdown) — new roles & permission changes
// ---------------------------------------------------------------------------

async function fetchEntraReleaseNotes() {
  try {
    const res = await fetchWithTimeout(ENTRA_WHATS_NEW_RAW, 30000);
    const md = await res.text();

    // Split into "## June 2026" month sections; keep months within lookback
    // (a month counts if its 1st OR its last day is inside the window).
    const monthSections = [...md.matchAll(/^## ([A-Z][a-z]+ \d{4})\n([\s\S]*?)(?=^## [A-Z][a-z]+ \d{4}|(?![\s\S]))/gm)];
    const items = [];

    for (const [, monthYear, body] of monthSections) {
      const monthStart = new Date(`${monthYear} 1`);
      if (isNaN(monthStart)) continue;
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      if (monthEnd < cutoffDate) continue;

      // Each announcement is a "### Heading" entry with **Type:** metadata.
      const entries = [...body.matchAll(/^### (.+)\n([\s\S]*?)(?=^### |(?![\s\S]))/gm)];
      for (const [, heading, entryBody] of entries) {
        const type = entryBody.match(/\*\*Type:\*\*\s*([^\n]+)/)?.[1]?.trim() || "";
        const category = entryBody.match(/\*\*Service category:\*\*\s*([^\n]+)/)?.[1]?.trim() || "";
        items.push({
          source: "Microsoft Entra Release Notes",
          title: stripMarkdown(heading),
          description: `[${type}${category ? ` | ${category}` : ""}] ${stripMarkdown(entryBody).slice(0, 500)}`,
          date: monthToISO(monthYear),
          url: ENTRA_WHATS_NEW_PAGE,
        });
      }
    }

    return items.slice(0, 25); // newest months come first in the doc
  } catch (e) {
    console.error(`⚠️  Entra release notes failed: ${e.message} — continuing without them.`);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Step 1b: Purview "What's new" (HTML) — monthly digests
// ---------------------------------------------------------------------------

async function fetchPurviewWhatsNew() {
  try {
    const res = await fetchWithTimeout(PURVIEW_WHATS_NEW_PAGE, 30000);
    const html = await res.text();

    // Month sections are <h2>June 2026</h2> … up to the next <h2>.
    const sections = [...html.matchAll(/<h2[^>]*>\s*([A-Z][a-z]+ \d{4})\s*<\/h2>([\s\S]*?)(?=<h2[^>]*>|$)/g)];
    const items = [];

    for (const [, monthYear, body] of sections.slice(0, 2)) { // 2 most recent months
      const monthStart = new Date(`${monthYear} 1`);
      if (isNaN(monthStart)) continue;
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      if (monthEnd < cutoffDate) continue;

      items.push({
        source: "Microsoft Purview What's New",
        title: `Digest: Microsoft Purview updates — ${monthYear}`,
        description: stripHtml(body).slice(0, 2500),
        date: monthToISO(monthYear),
        url: PURVIEW_WHATS_NEW_PAGE,
      });
    }

    return items;
  } catch (e) {
    console.error(`⚠️  Purview What's New failed: ${e.message} — continuing without it.`);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Step 1c: M365 Roadmap API — filter to Entra / Purview
// ---------------------------------------------------------------------------

async function fetchRoadmap() {
  try {
    const res = await fetchWithTimeout(ROADMAP_API, 30000);
    const all = await res.json();

    const relevant = all.filter((item) => {
      const products = (item.tagsContainer?.products || item.TagsContainer?.products || [])
        .map((p) => (p.tagName || p.TagName || "").toLowerCase());
      const isEntraOrPurview = products.some(
        (p) => p.includes("entra") || p.includes("purview") || p.includes("azure active directory")
      );
      const modified = new Date(item.modified || item.Modified || 0);
      return isEntraOrPurview && modified >= cutoffDate;
    });

    return relevant.map((item) => ({
      source: "Microsoft 365 Roadmap",
      title: stripHtml(item.title || item.Title || ""),
      description: stripHtml(item.description || item.Description || "").slice(0, 600),
      date: (item.modified || item.Modified || "").slice(0, 10),
      status: item.status || item.Status || "",
      url: `https://www.microsoft.com/microsoft-365/roadmap?id=${item.id || item.Id}`,
    }));
  } catch (e) {
    console.error(`⚠️  Roadmap API failed: ${e.message} — continuing without it.`);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Step 1d: RSS feeds
// ---------------------------------------------------------------------------

async function fetchRss({ name, url }) {
  try {
    const res = await fetchWithTimeout(url);
    const xml = await res.text();

    const items = [...xml.matchAll(/<item[\s>]([\s\S]*?)<\/item>/gi)].map((m) => m[1]);
    return items
      .map((item) => {
        const pubDate = tag(item, "pubDate") || tag(item, "dc:date");
        return {
          source: name,
          title: tag(item, "title"),
          description: tag(item, "description").slice(0, 600),
          date: pubDate ? new Date(pubDate).toISOString().slice(0, 10) : "",
          url: tag(item, "link") || (item.match(/<link[^>]*href="([^"]+)"/i)?.[1] ?? ""),
        };
      })
      .filter((i) => i.title && (!i.date || new Date(i.date) >= cutoffDate));
  } catch (e) {
    console.error(`⚠️  RSS "${name}" failed: ${e.message} — continuing without it.`);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Step 2: Claude — filter, summarize, consolidate, categorize
// ---------------------------------------------------------------------------

async function categorizeWithClaude(rawItems) {
  const prompt = `You are the news editor for SecRole (secrole.com), a reference tool for Microsoft Entra ID and Microsoft Purview RBAC roles. Your audience is IT admins, security engineers, and compliance officers.

Below is a JSON array of REAL items fetched today from official Microsoft sources. Your job:

1. SELECT only items relevant to: Microsoft Entra ID (identity, authentication, Conditional Access, PIM, RBAC, admin roles, governance), Microsoft Purview (compliance, DLP, information protection, audit, roles), or security advisories affecting identity/access. DISCARD items about unrelated products (Teams calling, Outlook UI, Excel, etc.).
2. For each selected item, write a fresh 2-3 sentence summary IN YOUR OWN WORDS explaining what changed and why an admin should care. Do not copy the source text.
3. Categorize each as exactly one of: "New Role", "Permission Change", "Feature Update", "Security Advisory", "Roadmap". Roadmap API items are usually "Roadmap" unless they describe a new admin role or permission change. Items from "Microsoft Entra Release Notes" describing a new built-in role are "New Role"; items describing changed role permissions or scope are "Permission Change".
4. Rate importance: "high" (new roles, permission changes, security advisories, breaking changes), "medium" (notable features), "low" (minor/cosmetic).
5. Keep at most ${MAX_OUTPUT_ITEMS} items, prioritizing high importance and recency. New roles and permission changes ALWAYS make the cut.
6. Preserve each item's original "url" and "source" EXACTLY as given. Never invent items not in the input.
7. CONSOLIDATE near-duplicate items: if multiple CVEs affect the same product with the same vulnerability class (e.g. several ADFS denial-of-service advisories), merge them into ONE item whose title names the product and count (e.g. "7 Denial of Service Vulnerabilities Patched in ADFS") and whose summary lists the CVE IDs. Use the most relevant single URL from the merged items.
8. SPLIT digest items: an input item whose title starts with "Digest:" is a monthly rollup containing several announcements. Extract each DISTINCT role/RBAC/security-relevant announcement inside it as its OWN output item (with the digest's url and source), and skip the rest of the digest's content. Do not output the digest itself as one blob.

Respond with ONLY a valid JSON array (no markdown fences, no preamble) where each element is:
{
  "id": "kebab-case-slug-from-title",
  "title": "Cleaned up title",
  "summary": "Your 2-3 sentence summary",
  "category": "one of the five categories",
  "source": "original source name",
  "date": "Month YYYY",
  "importance": "high | medium | low",
  "url": "original url"
}

INPUT ITEMS:
${JSON.stringify(rawItems, null, 1)}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .replace(/```json|```/g, "")
    .trim();

  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error("Claude did not return a JSON array.");

  // Safety: only keep URLs that actually came from our fetched items.
  const allowedUrls = new Set(rawItems.map((i) => i.url));
  return parsed
    .filter((u) => u.title && u.summary)
    .map((u) => ({ ...u, url: allowedUrls.has(u.url) ? u.url : undefined }))
    .slice(0, MAX_OUTPUT_ITEMS);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (!ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY is not set. Add it in GitHub → Settings → Secrets → Actions.");
    process.exit(1);
  }

  console.log("📡 Fetching sources…");
  const [entraNotes, purviewNotes, roadmap, ...rssResults] = await Promise.all([
    fetchEntraReleaseNotes(),
    fetchPurviewWhatsNew(),
    fetchRoadmap(),
    ...RSS_SOURCES.map(fetchRss),
  ]);

  const rawItems = [entraNotes, purviewNotes, roadmap, ...rssResults]
    .flat()
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .slice(0, MAX_ITEMS_TO_CLAUDE);

  console.log(
    `   Entra Release Notes: ${entraNotes.length} | Purview What's New: ${purviewNotes.length} | Roadmap: ${roadmap.length} | ` +
    RSS_SOURCES.map((s, i) => `${s.name}: ${rssResults[i].length}`).join(" | ")
  );
  console.log(`   → ${rawItems.length} items sent to Claude for triage.`);

  if (rawItems.length === 0) {
    console.error("❌ Every source returned zero items. Keeping the existing cache untouched.");
    process.exit(existsSync(OUTPUT_PATH) ? 0 : 1);
  }

  console.log(`🤖 Categorizing with ${MODEL}…`);
  let updates;
  try {
    updates = await categorizeWithClaude(rawItems);
  } catch (e) {
    console.error(`❌ Claude step failed: ${e.message}`);
    console.error("   Keeping the existing cache untouched.");
    process.exit(existsSync(OUTPUT_PATH) ? 0 : 1);
  }

  const now = new Date().toISOString();
  const cache = { lastUpdated: now, fetchedAt: now, updates };

  // Skip the commit churn if nothing actually changed.
  if (existsSync(OUTPUT_PATH)) {
    try {
      const prev = JSON.parse(readFileSync(OUTPUT_PATH, "utf8"));
      if (JSON.stringify(prev.updates) === JSON.stringify(updates)) {
        console.log("✓ No new updates since last run — cache left as-is.");
        return;
      }
    } catch { /* corrupt/missing previous cache — just overwrite */ }
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(cache, null, 2));
  console.log(`✅ Wrote ${updates.length} updates to public/updates-cache.json`);
}

main();
