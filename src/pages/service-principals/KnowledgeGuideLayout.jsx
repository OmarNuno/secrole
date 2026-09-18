import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../../components/PageMeta";
import { getSitePage } from "../../data/sitePages";
import { GuideSection, GuideSourceList } from "./KnowledgeGuideComponents";
import "./KnowledgeGuide.css";
import "./KnowledgeGuideCards.css";
import "./KnowledgeGuideOperational.css";

export { GuideCallout, GuideCodeBlock, GuideFaq, GuideSection } from "./KnowledgeGuideComponents";

const SITE_URL = "https://www.secrole.com";

function formatReviewedDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

function useActiveSection(sectionIds) {
  const [active, setActive] = useState(sectionIds[0] || "");
  const key = sectionIds.join("|");

  useEffect(() => {
    const ids = key.split("|").filter(Boolean);
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!elements.length || !("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -68% 0px", threshold: [0, 0.08, 0.3] },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [key]);

  return active;
}

function GuideToc({ items, reviewedDate }) {
  const ids = useMemo(() => items.map((item) => item.id), [items]);
  const active = useActiveSection(ids);

  return (
    <aside className="kg-toc" aria-label="On this page">
      <div className="kg-toc-inner">
        <p>On this page</p>
        <nav>
          {items.map((item) => <a className={active === item.id ? "is-active" : ""} href={`#${item.id}`} key={item.id}>{item.label}</a>)}
        </nav>
        <div className="kg-toc-status">
          <span>Guide status</span>
          <strong>Reviewed {reviewedDate}</strong>
          <small>Grounded in current Microsoft Learn and Microsoft Graph documentation.</small>
        </div>
      </div>
    </aside>
  );
}

function RelatedGuides({ pageIds }) {
  const pages = pageIds.map((id) => getSitePage(id));

  return (
    <div className="kg-related-grid">
      {pages.map((page) => (
        <Link to={page.path} key={page.id}>
          <span>Related guide</span><h3>{page.title}</h3><p>{page.description}</p><strong>Read guide <span aria-hidden="true">→</span></strong>
        </Link>
      ))}
      <Link to="/service-principals" className="hub">
        <span>Reference hub</span><h3>Application objects &amp; service principals</h3><p>Return to the complete object, identity, authentication, governance, and troubleshooting reference.</p><strong>Open the hub <span aria-hidden="true">→</span></strong>
      </Link>
    </div>
  );
}

export default function KnowledgeGuideLayout({
  pageId,
  eyebrow,
  lede,
  summary,
  toc,
  faq = [],
  sources,
  relatedPageIds = [],
  children,
}) {
  const page = getSitePage(pageId);
  const reviewedDate = formatReviewedDate(page.lastModified);
  const canonicalUrl = `${SITE_URL}${page.path}`;
  const firstSection = toc[0]?.id || "";

  const schemas = useMemo(() => {
    const schema = [
      {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: page.title,
        description: page.description,
        datePublished: page.lastModified,
        dateModified: page.lastModified,
        inLanguage: "en-US",
        proficiencyLevel: "Expert",
        author: { "@type": "Organization", name: "SecRole", url: SITE_URL },
        publisher: { "@type": "Organization", name: "SecRole", url: SITE_URL },
        mainEntityOfPage: canonicalUrl,
        about: page.keywords,
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "SecRole", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Service principals", item: `${SITE_URL}/service-principals` },
          { "@type": "ListItem", position: 3, name: page.title, item: canonicalUrl },
        ],
      },
    ];

    if (faq.length) {
      schema.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      });
    }

    return schema;
  }, [canonicalUrl, faq, page.description, page.keywords, page.lastModified, page.title]);

  return (
    <div className="kg-reference">
      <PageMeta title={page.title} description={page.description} path={page.path} type="article" keywords={page.keywords} schema={schemas} />

      <header className="kg-hero">
        <div className="kg-page-width">
          <div className="kg-breadcrumb"><Link to="/">SecRole</Link><span>/</span><Link to="/service-principals">Service principals</Link><span>/</span><strong>{page.heading || page.title}</strong></div>
          <div className="kg-hero-copy">
            <div className="kg-eyebrow">{eyebrow}</div>
            <h1>{page.heading || page.title}</h1>
            <p>{lede}</p>
            <div className="kg-hero-actions">
              {firstSection && <a className="kg-button primary" href={`#${firstSection}`}>Start with the answer</a>}
              <Link className="kg-button secondary" to="/service-principals">Back to reference hub</Link>
            </div>
          </div>
          <div className="kg-summary-strip">
            <div><span>Purpose</span><strong>{summary}</strong></div>
            <div><span>Last reviewed</span><strong>{reviewedDate}</strong></div>
            <div><span>Change posture</span><strong>Read-only investigation first</strong></div>
          </div>
        </div>
      </header>

      <div className="kg-page-width kg-layout">
        <main className="kg-content">
          {children}

          <GuideSection id="official-sources" eyebrow="Primary references" title="Official Microsoft documentation used for this guide" intro="SecRole translates the platform model into an operational workflow. Microsoft documentation remains the source of truth when the service changes.">
            <GuideSourceList sources={sources} />
          </GuideSection>

          <GuideSection id="related-guides" eyebrow="Continue the investigation" title="Related SecRole guides" intro="Use the hub for the complete mental model, then move between focused guides as the task becomes more specific.">
            <RelatedGuides pageIds={relatedPageIds} />
          </GuideSection>

          <footer className="kg-footer">
            <span>SecRole knowledge guide</span><strong>Last reviewed: {reviewedDate}</strong><p>Verify tenant configuration, licensing, sovereign-cloud behavior, and current Microsoft documentation before making production changes.</p>
          </footer>
        </main>

        <GuideToc items={toc} reviewedDate={reviewedDate} />
      </div>
    </div>
  );
}
