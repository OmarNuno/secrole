import { useLocation } from "react-router-dom";
import { publishedPages } from "../data/sitePages";
import PageMeta from "./PageMeta";

const SITE_URL = "https://www.secrole.com";

function normalizePath(pathname) {
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "");
}

/**
 * Supplies basic metadata for tool and update routes that do not render their
 * own article-level PageMeta component. Knowledge pages own their richer
 * article, breadcrumb, and FAQ schema inside the page component.
 */
export default function RouteMeta() {
  const { pathname } = useLocation();
  const page = publishedPages.find((item) => item.path === normalizePath(pathname));

  if (!page || page.kind === "knowledge-hub" || page.kind === "knowledge-guide") {
    return null;
  }

  const canonicalUrl = page.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${page.path}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": page.kind === "updates" ? "CollectionPage" : "WebPage",
    name: page.title,
    description: page.description,
    url: canonicalUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "SecRole",
      url: `${SITE_URL}/`,
    },
  };

  return (
    <PageMeta
      title={page.title}
      description={page.description}
      path={page.path}
      type="website"
      schema={schema}
    />
  );
}
