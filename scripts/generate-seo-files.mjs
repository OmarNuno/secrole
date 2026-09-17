import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { publishedPages } from "../src/data/sitePages.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const SITE_URL = "https://www.secrole.com";

function xmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function validatePages(pages) {
  const paths = new Set();

  for (const page of pages) {
    for (const field of ["id", "path", "title", "description"]) {
      if (!page[field]) throw new Error(`Published page ${page.id || "<unknown>"} is missing ${field}.`);
    }

    if (!page.path.startsWith("/")) throw new Error(`Page path must start with /: ${page.path}`);
    if (paths.has(page.path)) throw new Error(`Duplicate published route: ${page.path}`);
    paths.add(page.path);
  }
}

function buildSitemap(pages) {
  const urls = pages.map((page) => {
    const location = page.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${page.path}`;
    const lines = [
      "  <url>",
      `    <loc>${xmlEscape(location)}</loc>`,
    ];

    if (page.lastModified) lines.push(`    <lastmod>${xmlEscape(page.lastModified)}</lastmod>`);
    lines.push("  </url>");
    return lines.join("\n");
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function buildLlmsText(pages) {
  const entries = pages.map((page) => {
    const url = page.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${page.path}`;
    return `- [${page.title}](${url}): ${page.description}`;
  }).join("\n");

  return `# SecRole\n\n> Microsoft Entra ID and Microsoft Purview role, identity, permission, and least-privilege reference for IT administrators and security engineers.\n\nSecRole combines searchable role intelligence, comparison tools, official-source updates, and practical Microsoft Entra knowledge guides. Technical reference pages are grounded in Microsoft Learn and Microsoft Graph documentation and include a visible last-reviewed date.\n\n## Published pages\n\n${entries}\n\n## Content principles\n\n- Prefer Microsoft primary documentation for platform facts and API behavior.\n- Distinguish requested permissions from tenant grants and configuration from runtime evidence.\n- Provide read-only investigation commands before change or remediation examples.\n- Treat Microsoft documentation as the source of truth when platform behavior changes.\n`;
}

validatePages(publishedPages);
await mkdir(PUBLIC_DIR, { recursive: true });
await writeFile(path.join(PUBLIC_DIR, "sitemap.xml"), buildSitemap(publishedPages), "utf8");
await writeFile(path.join(PUBLIC_DIR, "llms.txt"), buildLlmsText(publishedPages), "utf8");
await writeFile(
  path.join(PUBLIC_DIR, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
  "utf8",
);

console.log(`Generated SEO files for ${publishedPages.length} published SecRole pages.`);
