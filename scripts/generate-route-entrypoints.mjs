import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { publishedPages } from "../src/data/sitePages.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST_DIR = path.join(ROOT, "dist");
const SITE_URL = "https://www.secrole.com";
const SITE_NAME = "SecRole";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function replaceRequired(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(`Unable to find ${label} in dist/index.html.`);
  return html.replace(pattern, replacement);
}

function buildPageSchema(page, canonicalUrl) {
  if (page.kind === "knowledge-index") {
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: page.title,
      description: page.description,
      dateModified: page.lastModified,
      inLanguage: "en-US",
      url: canonicalUrl,
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: `${SITE_URL}/` },
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: page.title,
    description: page.description,
    datePublished: page.lastModified,
    dateModified: page.lastModified,
    inLanguage: "en-US",
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: canonicalUrl,
  };
}

function buildRouteHtml(template, page) {
  const fullTitle = page.title.includes(SITE_NAME) ? page.title : `${page.title} | ${SITE_NAME}`;
  const canonicalUrl = `${SITE_URL}${page.path}`;
  const openGraphType = page.kind === "knowledge-index" ? "website" : "article";
  let html = template;

  html = replaceRequired(html, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(fullTitle)}</title>`, "title");
  html = replaceRequired(html, /<meta name="description" content="[^"]*"\s*\/>/i, `<meta name="description" content="${escapeHtml(page.description)}" />`, "description");
  html = replaceRequired(html, /<link rel="canonical" href="[^"]*"\s*\/>/i, `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`, "canonical link");
  html = replaceRequired(html, /<meta property="og:title" content="[^"]*"\s*\/>/i, `<meta property="og:title" content="${escapeHtml(fullTitle)}" />`, "Open Graph title");
  html = replaceRequired(html, /<meta property="og:description" content="[^"]*"\s*\/>/i, `<meta property="og:description" content="${escapeHtml(page.description)}" />`, "Open Graph description");
  html = replaceRequired(html, /<meta property="og:type" content="[^"]*"\s*\/>/i, `<meta property="og:type" content="${openGraphType}" />`, "Open Graph type");
  html = replaceRequired(html, /<meta property="og:url" content="[^"]*"\s*\/>/i, `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`, "Open Graph URL");
  html = replaceRequired(html, /<meta name="twitter:title" content="[^"]*"\s*\/>/i, `<meta name="twitter:title" content="${escapeHtml(fullTitle)}" />`, "Twitter title");
  html = replaceRequired(html, /<meta name="twitter:description" content="[^"]*"\s*\/>/i, `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`, "Twitter description");

  const schemaJson = JSON.stringify(buildPageSchema(page, canonicalUrl)).replaceAll("<", "\\u003c");
  html = html.replace(
    "</head>",
    `    <script type="application/ld+json" data-secrole-schema="page">${schemaJson}</script>\n  </head>`,
  );

  return html;
}

const template = await readFile(path.join(DIST_DIR, "index.html"), "utf8");
const knowledgeKinds = new Set(["knowledge-index", "knowledge-hub", "knowledge-guide"]);
const routePages = publishedPages.filter((page) => knowledgeKinds.has(page.kind));

for (const page of routePages) {
  if (!page.lastModified) throw new Error(`Knowledge page ${page.id} requires lastModified for route metadata.`);

  const relativeFile = `${page.path.replace(/^\//, "")}.html`;
  const outputFile = path.join(DIST_DIR, relativeFile);
  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, buildRouteHtml(template, page), "utf8");
  console.log(`Generated route entrypoint: ${page.path} -> ${relativeFile}`);
}
