import { useEffect } from "react";

const SITE_NAME = "SecRole";
const SITE_URL = "https://www.secrole.com";
const DEFAULT_TITLE = "SecRole — Microsoft Entra & Purview Role Intelligence";
const DEFAULT_DESCRIPTION = "Security-focused reference for Microsoft Entra ID and Microsoft Purview roles, identities, permissions, overlap analysis, and least-privilege administration.";
const DEFAULT_SOCIAL_DESCRIPTION = "Role, identity, permission, and least-privilege reference for Microsoft Entra ID and Microsoft Purview administrators.";

function upsertMeta(selector, attributes, content) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function removeMeta(selector) {
  document.head.querySelector(selector)?.remove();
}

function setCanonical(url) {
  let element = document.head.querySelector('link[rel="canonical"]');

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }

  element.setAttribute("href", url);
}

function setPageSchema(content) {
  let element = document.head.querySelector('script[data-secrole-schema="page"]');

  if (!element) {
    element = document.createElement("script");
    element.type = "application/ld+json";
    element.dataset.secroleSchema = "page";
    document.head.appendChild(element);
  }

  element.textContent = content;
}

function removePageSchema() {
  document.head.querySelector('script[data-secrole-schema="page"]')?.remove();
}

function applySiteDefaults() {
  document.title = DEFAULT_TITLE;
  upsertMeta('meta[name="description"]', { name: "description" }, DEFAULT_DESCRIPTION);
  upsertMeta('meta[name="robots"]', { name: "robots" }, "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");
  upsertMeta('meta[property="og:site_name"]', { property: "og:site_name" }, SITE_NAME);
  upsertMeta('meta[property="og:title"]', { property: "og:title" }, DEFAULT_TITLE);
  upsertMeta('meta[property="og:description"]', { property: "og:description" }, DEFAULT_SOCIAL_DESCRIPTION);
  upsertMeta('meta[property="og:type"]', { property: "og:type" }, "website");
  upsertMeta('meta[property="og:url"]', { property: "og:url" }, `${SITE_URL}/`);
  upsertMeta('meta[name="twitter:card"]', { name: "twitter:card" }, "summary");
  upsertMeta('meta[name="twitter:title"]', { name: "twitter:title" }, DEFAULT_TITLE);
  upsertMeta('meta[name="twitter:description"]', { name: "twitter:description" }, DEFAULT_SOCIAL_DESCRIPTION);
  setCanonical(`${SITE_URL}/`);
  removeMeta('meta[name="keywords"]');
  removeMeta('meta[property="og:image"]');
  removeMeta('meta[name="twitter:image"]');
  removePageSchema();
}

/**
 * Lightweight route-level metadata without adding another dependency.
 *
 * Future knowledge pages can reuse this component for unique titles,
 * descriptions, canonical URLs, social cards, and JSON-LD schemas.
 */
export default function PageMeta({
  title,
  description,
  path,
  keywords = [],
  type = "article",
  schema = [],
  image = "",
}) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const canonicalUrl = `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const keywordText = Array.isArray(keywords) ? keywords.join(", ") : keywords;
  const schemaJson = JSON.stringify(Array.isArray(schema) ? schema : [schema]);
  const imageUrl = image
    ? (image.startsWith("http") ? image : `${SITE_URL}${image.startsWith("/") ? image : `/${image}`}`)
    : "";

  useEffect(() => {
    document.title = fullTitle;
    upsertMeta('meta[name="description"]', { name: "description" }, description);
    upsertMeta('meta[name="robots"]', { name: "robots" }, "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name" }, SITE_NAME);
    upsertMeta('meta[property="og:title"]', { property: "og:title" }, fullTitle);
    upsertMeta('meta[property="og:description"]', { property: "og:description" }, description);
    upsertMeta('meta[property="og:type"]', { property: "og:type" }, type);
    upsertMeta('meta[property="og:url"]', { property: "og:url" }, canonicalUrl);
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card" }, imageUrl ? "summary_large_image" : "summary");
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title" }, fullTitle);
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description" }, description);
    setCanonical(canonicalUrl);

    if (keywordText) {
      upsertMeta('meta[name="keywords"]', { name: "keywords" }, keywordText);
    } else {
      removeMeta('meta[name="keywords"]');
    }

    if (imageUrl) {
      upsertMeta('meta[property="og:image"]', { property: "og:image" }, imageUrl);
      upsertMeta('meta[name="twitter:image"]', { name: "twitter:image" }, imageUrl);
    } else {
      removeMeta('meta[property="og:image"]');
      removeMeta('meta[name="twitter:image"]');
    }

    if (schemaJson !== "[]") {
      setPageSchema(schemaJson);
    } else {
      removePageSchema();
    }

    return applySiteDefaults;
  }, [canonicalUrl, description, fullTitle, imageUrl, keywordText, schemaJson, type]);

  return null;
}
