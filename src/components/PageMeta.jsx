import { useEffect } from "react";

const SITE_NAME = "SecRole";
const SITE_URL = "https://www.secrole.com";
const DEFAULT_TITLE = "SecRole — Microsoft Entra & Purview Role Intelligence";
const DEFAULT_DESCRIPTION = "Security-focused reference for Microsoft Entra ID and Microsoft Purview roles, identities, permissions, and least-privilege administration.";

function upsertMeta(selector, attributes, content) {
  let element = document.head.querySelector(selector);
  const created = !element;

  if (!element) {
    element = document.createElement("meta");
    Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
    document.head.appendChild(element);
  }

  const previous = element.getAttribute("content");
  element.setAttribute("content", content);

  return () => {
    if (created) {
      element.remove();
    } else if (previous === null) {
      element.removeAttribute("content");
    } else {
      element.setAttribute("content", previous);
    }
  };
}


function upsertSchema(content) {
  let element = document.head.querySelector('script[data-secrole-schema="page"]');
  const created = !element;

  if (!element) {
    element = document.createElement("script");
    element.type = "application/ld+json";
    element.dataset.secroleSchema = "page";
    document.head.appendChild(element);
  }

  const previous = element.textContent;
  element.textContent = content;

  return () => {
    if (created) {
      element.remove();
    } else {
      element.textContent = previous;
    }
  };
}

function upsertCanonical(url) {
  let element = document.head.querySelector('link[rel="canonical"]');
  const created = !element;

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }

  const previous = element.getAttribute("href");
  element.setAttribute("href", url);

  return () => {
    if (created) {
      element.remove();
    } else if (previous === null) {
      element.removeAttribute("href");
    } else {
      element.setAttribute("href", previous);
    }
  };
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
  const imageUrl = image ? (image.startsWith("http") ? image : `${SITE_URL}${image.startsWith("/") ? image : `/${image}`}`) : "";

  useEffect(() => {
    const previousTitle = document.title;
    document.title = fullTitle;

    const cleanups = [
      upsertMeta('meta[name="description"]', { name: "description" }, description),
      upsertMeta('meta[property="og:title"]', { property: "og:title" }, fullTitle),
      upsertMeta('meta[property="og:description"]', { property: "og:description" }, description),
      upsertMeta('meta[property="og:type"]', { property: "og:type" }, type),
      upsertMeta('meta[property="og:url"]', { property: "og:url" }, canonicalUrl),
      upsertMeta('meta[property="og:site_name"]', { property: "og:site_name" }, SITE_NAME),
      upsertMeta('meta[name="robots"]', { name: "robots" }, "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"),
      upsertMeta('meta[name="twitter:card"]', { name: "twitter:card" }, imageUrl ? "summary_large_image" : "summary"),
      upsertMeta('meta[name="twitter:title"]', { name: "twitter:title" }, fullTitle),
      upsertMeta('meta[name="twitter:description"]', { name: "twitter:description" }, description),
      upsertCanonical(canonicalUrl),
    ];

    if (keywordText) {
      cleanups.push(upsertMeta('meta[name="keywords"]', { name: "keywords" }, keywordText));
    }

    if (imageUrl) {
      cleanups.push(upsertMeta('meta[property="og:image"]', { property: "og:image" }, imageUrl));
      cleanups.push(upsertMeta('meta[name="twitter:image"]', { name: "twitter:image" }, imageUrl));
    }

    cleanups.push(upsertSchema(schemaJson));

    return () => {
      document.title = previousTitle || DEFAULT_TITLE;
      cleanups.reverse().forEach((cleanup) => cleanup());

      if (!document.head.querySelector('meta[name="description"]')) {
        const fallback = document.createElement("meta");
        fallback.name = "description";
        fallback.content = DEFAULT_DESCRIPTION;
        document.head.appendChild(fallback);
      }
    };
  }, [canonicalUrl, description, fullTitle, imageUrl, keywordText, schemaJson, type]);

  return null;
}
