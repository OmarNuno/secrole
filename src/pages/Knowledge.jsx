import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../components/PageMeta";
import { getSitePage, publishedPages } from "../data/sitePages";
import "./Knowledge.css";

const SITE_URL = "https://www.secrole.com";
const page = getSitePage("knowledge");

const TRACKS = [
  {
    id: "understand",
    eyebrow: "Understand",
    title: "Build the right identity and permission model",
    description: "Start with the directory objects, identifiers, permissions, consent records, and runtime evidence that explain how access actually works.",
  },
  {
    id: "build",
    eyebrow: "Build & migrate",
    title: "Move automation to governed workload identities",
    description: "Choose managed identity or federation, migrate user-based automation, and design credential-free authentication without copying excess privilege.",
  },
  {
    id: "operate",
    eyebrow: "Operate & govern",
    title: "Troubleshoot, review, and control durable access",
    description: "Investigate failures, collect defensible evidence, review privilege and ownership, and make safe retain, reduce, contain, rotate, or retire decisions.",
  },
];

const TOOL_IDS = ["role-library", "role-overlap-analyzer", "ai-role-advisor", "updates"];

function normalizedSearchText(item) {
  return [
    item.title,
    item.heading,
    item.description,
    item.searchIntent,
    ...(item.keywords || []),
    ...(item.guideTags || []),
  ].filter(Boolean).join(" ").toLowerCase();
}

function HubCard({ item }) {
  return (
    <Link className="knowledge-hub-card" to={item.path}>
      <div className="knowledge-card-topline">
        <span>{item.knowledgeLabel || "Reference hub"}</span>
        <span aria-hidden="true">→</span>
      </div>
      <h3>{item.heading || item.title}</h3>
      <p>{item.description}</p>
      {item.guideTags?.length > 0 && (
        <div className="knowledge-card-tags" aria-label="Reference topics">
          {item.guideTags.map((tag) => <small key={tag}>{tag}</small>)}
        </div>
      )}
      <strong>Open the complete reference <span aria-hidden="true">→</span></strong>
    </Link>
  );
}

function GuideCard({ item }) {
  return (
    <Link className="knowledge-guide-card" to={item.path}>
      <div className="knowledge-card-topline">
        <span>{item.knowledgeLabel || "Knowledge guide"}</span>
        <span aria-hidden="true">→</span>
      </div>
      <h3>{item.heading || item.title}</h3>
      <p>{item.description}</p>
      {item.guideTags?.length > 0 && (
        <div className="knowledge-card-tags" aria-label="Guide features">
          {item.guideTags.map((tag) => <small key={tag}>{tag}</small>)}
        </div>
      )}
    </Link>
  );
}

function ToolCard({ item }) {
  const labels = {
    "role-library": "Search roles",
    "role-overlap-analyzer": "Compare access",
    "ai-role-advisor": "Investigate a requirement",
    updates: "Track changes",
  };

  return (
    <Link className="knowledge-tool-card" to={item.path}>
      <span>{labels[item.id] || "Open tool"}</span>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <strong>Open <span aria-hidden="true">→</span></strong>
    </Link>
  );
}

export default function Knowledge() {
  const [query, setQuery] = useState("");
  const hubs = useMemo(
    () => publishedPages
      .filter((item) => item.kind === "knowledge-hub")
      .sort((a, b) => (a.knowledgeOrder || 99) - (b.knowledgeOrder || 99)),
    [],
  );
  const guides = useMemo(
    () => publishedPages
      .filter((item) => item.kind === "knowledge-guide")
      .sort((a, b) => (a.knowledgeOrder || 99) - (b.knowledgeOrder || 99)),
    [],
  );
  const tools = useMemo(() => TOOL_IDS.map((id) => getSitePage(id)), []);
  const normalizedQuery = query.trim().toLowerCase();
  const matchingHubs = normalizedQuery
    ? hubs.filter((item) => normalizedSearchText(item).includes(normalizedQuery))
    : hubs;
  const matchingGuides = normalizedQuery
    ? guides.filter((item) => normalizedSearchText(item).includes(normalizedQuery))
    : guides;
  const resultCount = matchingHubs.length + matchingGuides.length;

  const schemas = useMemo(() => {
    const items = [...hubs, ...guides];
    return [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: page.title,
        description: page.description,
        url: `${SITE_URL}${page.path}`,
        dateModified: page.lastModified,
        isPartOf: { "@type": "WebSite", name: "SecRole", url: `${SITE_URL}/` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: items.length,
          itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.title,
            url: `${SITE_URL}${item.path}`,
          })),
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "SecRole", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Knowledge", item: `${SITE_URL}/knowledge` },
        ],
      },
    ];
  }, [guides, hubs]);

  return (
    <div className="knowledge-page">
      <PageMeta
        title={page.title}
        description={page.description}
        path={page.path}
        type="website"
        keywords={page.keywords}
        schema={schemas}
      />

      <header className="knowledge-hero">
        <div className="knowledge-width">
          <div className="knowledge-breadcrumb"><Link to="/">SecRole</Link><span>/</span><strong>Knowledge</strong></div>
          <div className="knowledge-eyebrow">SecRole knowledge library</div>
          <h1>{page.heading}</h1>
          <p>Use focused, operational guidance for Microsoft Entra identities, role governance, permissions, workload authentication, troubleshooting, and migration. Start with a complete reference hub or search for the task in front of you.</p>

          <form className="knowledge-search" role="search" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="knowledge-search-input">Search SecRole knowledge</label>
            <div>
              <span aria-hidden="true">⌕</span>
              <input
                id="knowledge-search-input"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search roles, PIM, scope, permissions, MFA, managed identity, rotation…"
                autoComplete="off"
              />
              {query && <button type="button" onClick={() => setQuery("")}>Clear</button>}
            </div>
            <small>{normalizedQuery
              ? `${resultCount} matching ${resultCount === 1 ? "page" : "pages"}`
              : `Search across ${hubs.length} reference hubs and ${guides.length} focused guides.`}</small>
          </form>

          <div className="knowledge-stats" aria-label="Knowledge library status">
            <div><strong>{hubs.length}</strong><span>complete reference hubs</span></div>
            <div><strong>{guides.length}</strong><span>focused operational guides</span></div>
            <div><strong>Read-only first</strong><span>investigate before changing state</span></div>
            <div><strong>Primary sources</strong><span>Microsoft documentation linked</span></div>
          </div>
        </div>
      </header>

      <div className="knowledge-width knowledge-body">
        {matchingHubs.length > 0 && (
          <section className="knowledge-section knowledge-foundation" aria-labelledby="knowledge-foundation-heading">
            <header className="knowledge-section-heading with-count">
              <div>
                <span>Start with the model</span>
                <h2 id="knowledge-foundation-heading">Complete reference hubs</h2>
                <p>Use a hub when you need the full mental model, operational evidence, commands, controls, and troubleshooting path for one identity domain.</p>
              </div>
              <strong>{matchingHubs.length} {matchingHubs.length === 1 ? "hub" : "hubs"}</strong>
            </header>
            <div className="knowledge-hub-grid">
              {matchingHubs.map((item) => <HubCard item={item} key={item.id} />)}
            </div>
          </section>
        )}

        {TRACKS.map((track) => {
          const trackGuides = matchingGuides.filter((item) => item.knowledgeTrack === track.id);
          if (!trackGuides.length) return null;

          return (
            <section className="knowledge-section" id={`track-${track.id}`} key={track.id}>
              <header className="knowledge-section-heading with-count">
                <div>
                  <span>{track.eyebrow}</span>
                  <h2>{track.title}</h2>
                  <p>{track.description}</p>
                </div>
                <strong>{trackGuides.length} {trackGuides.length === 1 ? "guide" : "guides"}</strong>
              </header>
              <div className="knowledge-guide-grid">
                {trackGuides.map((item) => <GuideCard item={item} key={item.id} />)}
              </div>
            </section>
          );
        })}

        {resultCount === 0 && (
          <section className="knowledge-empty" aria-live="polite">
            <span>⌕</span>
            <h2>No published knowledge matches “{query}”</h2>
            <p>Try a broader term such as role assignment, PIM, scope, service principal, permission, MFA, managed identity, credential rotation, security review, or troubleshooting.</p>
            <button type="button" onClick={() => setQuery("")}>Show all knowledge</button>
          </section>
        )}

        {!normalizedQuery && (
          <>
            <section className="knowledge-section" aria-labelledby="knowledge-tools-heading">
              <header className="knowledge-section-heading">
                <span>Use the tools</span>
                <h2 id="knowledge-tools-heading">Move from guidance to investigation</h2>
                <p>Search the role catalog, compare overlapping permissions, investigate an access requirement, or track official Microsoft changes.</p>
              </header>
              <div className="knowledge-tool-grid">
                {tools.map((item) => <ToolCard item={item} key={item.id} />)}
              </div>
            </section>

            <section className="knowledge-principles" aria-labelledby="knowledge-principles-heading">
              <div>
                <span>How SecRole writes knowledge</span>
                <h2 id="knowledge-principles-heading">Evidence before action</h2>
              </div>
              <ul>
                <li><strong>Separate systems and scopes.</strong><span>Identify the authorization plane, principal, role definition, tenant, and scope before drawing conclusions.</span></li>
                <li><strong>Separate requests from grants.</strong><span>Configured permissions are not proof of consent, role assignment, token claims, or resource authorization.</span></li>
                <li><strong>Investigate read-only first.</strong><span>Collect evidence before changing credentials, permissions, assignments, eligibility, or account state.</span></li>
                <li><strong>Prefer primary sources.</strong><span>Platform behavior is grounded in current Microsoft Learn, Graph, Azure, and product documentation.</span></li>
              </ul>
            </section>
          </>
        )}

        <footer className="knowledge-footer">
          <span>SecRole knowledge library</span>
          <strong>Last reviewed: September 19, 2026</strong>
          <p>The library expands as complete, useful references and guides are published. Planned pages remain private until they are ready for administrators to use.</p>
        </footer>
      </div>
    </div>
  );
}
