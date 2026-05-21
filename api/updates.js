import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const CACHE_FILE = "/tmp/secrole-updates-cache.json";
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const REFRESH_SECRET = process.env.UPDATES_REFRESH_SECRET || "secrole-refresh";

function loadCache() {
  try {
    if (existsSync(CACHE_FILE)) {
      const raw = readFileSync(CACHE_FILE, "utf8");
      return JSON.parse(raw);
    }
  } catch {}
  return null;
}

function saveCache(data) {
  try {
    writeFileSync(CACHE_FILE, JSON.stringify(data), "utf8");
  } catch (e) {
    console.error("Cache write error:", e.message);
  }
}

async function fetchUpdates(apiKey) {
  const prompt = `You are a Microsoft identity and security news curator for SecRole.com, a reference tool for Microsoft Entra ID and Microsoft Purview roles.

Search the web for the most recent updates (last 30 days) related to:
1. New Microsoft Entra ID roles or role changes
2. New Microsoft Purview roles or permission changes  
3. Microsoft Entra feature announcements and rollouts
4. Microsoft Purview feature announcements
5. Security advisories related to Entra ID or Purview RBAC
6. Microsoft 365 roadmap items affecting identity or compliance roles

For each update found, provide:
- A clear title
- A 2-3 sentence summary of what changed and why it matters to admins
- The category (New Role / Permission Change / Feature Update / Security Advisory / Roadmap)
- The source name
- Approximate date

Return ONLY a valid JSON object in this exact format, no markdown, no backticks:
{
  "lastUpdated": "ISO date string",
  "updates": [
    {
      "id": "unique-slug",
      "title": "Update title",
      "summary": "2-3 sentence summary",
      "category": "Feature Update",
      "source": "Microsoft Tech Community",
      "date": "May 2025",
      "importance": "high"
    }
  ]
}

Importance levels: "high" (new roles, breaking changes), "medium" (feature updates), "low" (minor changes)
Return 8-12 updates maximum. Focus on what's most relevant to IT admins managing Entra and Purview roles.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Anthropic API error");
  }

  // Extract text from response
  const textBlock = data.content?.find(b => b.type === "text");
  if (!textBlock?.text) throw new Error("No text in response");

  // Parse JSON — strip any accidental markdown
  const clean = textBlock.text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

export default async function handler(req, res) {
  const timestamp = new Date().toISOString();

  // GET — serve cached content
  if (req.method === "GET") {
    const cache = loadCache();

    if (cache && Date.now() - new Date(cache.fetchedAt).getTime() < CACHE_DURATION_MS) {
      console.log(JSON.stringify({ event: "updates_cache_hit", timestamp }));
      return res.status(200).json({ ...cache, fromCache: true });
    }

    // Cache miss or expired — return stale if available, suggest refresh
    if (cache) {
      return res.status(200).json({ ...cache, fromCache: true, stale: true });
    }

    return res.status(200).json({
      updates: [],
      lastUpdated: null,
      fromCache: false,
      message: "No updates fetched yet. Use the refresh button to load latest updates."
    });
  }

  // POST — refresh (requires secret)
  if (req.method === "POST") {
    const { secret } = req.body || {};

    if (secret !== REFRESH_SECRET) {
      return res.status(401).json({ error: "Invalid refresh secret" });
    }

    const apiKey = process.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API key not configured" });
    }

    try {
      console.log(JSON.stringify({ event: "updates_refresh_started", timestamp }));
      const updates = await fetchUpdates(apiKey);
      const cacheData = { ...updates, fetchedAt: timestamp };
      saveCache(cacheData);

      console.log(JSON.stringify({
        event: "updates_refresh_success",
        timestamp,
        count: updates.updates?.length || 0,
      }));

      return res.status(200).json({ ...cacheData, fromCache: false });
    } catch (error) {
      console.error(JSON.stringify({
        event: "updates_refresh_error",
        error: error.message,
        timestamp,
      }));
      return res.status(500).json({ error: "Failed to fetch updates", details: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
