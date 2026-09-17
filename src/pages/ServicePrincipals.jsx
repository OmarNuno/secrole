import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../components/PageMeta";
import { getChildPages, getSitePage } from "../data/sitePages";
import CommandReference from "./service-principals/CommandReference";
import ServicePrincipalModel from "./service-principals/ServicePrincipalModel";
import {
  authenticationMethods,
  comparisonRows,
  governanceChecks,
  identifiers,
  officialSources,
  quickFacts,
  servicePrincipalTypes,
  tocItems,
  troubleshootingItems,
} from "./service-principals/referenceData";
import "./service-principals/ServicePrincipals.css";
import "./service-principals/ServicePrincipalsModel.css";
import "./service-principals/ServicePrincipalsReference.css";
import "./service-principals/ServicePrincipalsOperational.css";
import "./service-principals/ServicePrincipalsResponsive.css";

const page = getSitePage("service-principals");
const knowledgeExpansion = getChildPages(page.id);
const reviewedDate = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
}).format(new Date(`${page.lastModified}T12:00:00Z`));

function Icon({ name, size = 18 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    relationship: <><rect x="3" y="4" width="7" height="6" rx="1.5" /><rect x="14" y="14" width="7" height="6" rx="1.5" /><path d="M10 7h3a4 4 0 0 1 4 4v3" /></>,
    identifiers: <><path d="M12 2a7 7 0 0 0-7 7v3" /><path d="M19 9a7 7 0 0 0-12.6-4.2" /><path d="M8 22v-8a4 4 0 0 1 8 0v5" /><path d="M12 22v-8" /></>,
    comparison: <><rect x="3" y="4" width="7" height="16" rx="2" /><rect x="14" y="4" width="7" height="16" rx="2" /><path d="M10 9h4M10 15h4" /></>,
    permissions: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /><path d="M12 14v3" /></>,
    types: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    authentication: <><circle cx="8" cy="15" r="4" /><path d="m11 12 8-8M15 4h4v4" /></>,
    governance: <><path d="M12 3 4.5 6v5.5c0 4.5 3 7.8 7.5 9.5 4.5-1.7 7.5-5 7.5-9.5V6L12 3Z" /><path d="m9 12 2 2 4-5" /></>,
    troubleshooting: <><path d="M14.7 6.3a5 5 0 0 0-6.9 6.9L3 18l3 3 4.8-4.8a5 5 0 0 0 6.9-6.9l-3.2 3.2-3-3 3.2-3.2Z" /></>,
    commands: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m7 9 3 3-3 3M13 16h4" /></>,
    sources: <><path d="M6 3h11a2 2 0 0 1 2 2v16H8a3 3 0 0 1-3-3V4a1 1 0 0 1 1-1Z" /><path d="M8 17h11M9 7h6M9 11h7" /></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
    external: <><path d="M14 4h6v6M10 14 20 4" /><path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" /></>,
  };

  return <svg {...common}>{paths[name] || paths.sources}</svg>;
}

function SectionHeading({ icon, eyebrow, title, children }) {
  return (
    <header className="sp-section-heading">
      <div className="sp-section-kicker"><Icon name={icon} size={15} /> {eyebrow}</div>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </header>
  );
}

function useActiveSection(sectionIds) {
  const [activeSection, setActiveSection] = useState(sectionIds[0]);
  const idsKey = sectionIds.join("|");

  useEffect(() => {
    const ids = idsKey.split("|");
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!elements.length || !("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -68% 0px", threshold: [0, 0.1, 0.35] },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [idsKey]);

  return activeSection;
}

function OnThisPage() {
  const ids = useMemo(() => tocItems.map((item) => item.id), []);
  const active = useActiveSection(ids);

  return (
    <aside className="sp-toc" aria-label="On this page">
      <div className="sp-toc-inner">
        <p>On this page</p>
        <nav>
          {tocItems.map((item) => (
            <a className={active === item.id ? "is-active" : ""} href={`#${item.id}`} key={item.id}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="sp-toc-note">
          <span>Reference status</span>
          <strong>Reviewed {reviewedDate}</strong>
          <small>Built from current Microsoft Learn and Microsoft Graph documentation.</small>
        </div>
      </div>
    </aside>
  );
}

function ObjectPrimer() {
  return (
    <div className="sp-primer" aria-label="Application object and service principal relationship">
      <article className="sp-primer-card app">
        <span>Definition · home tenant</span>
        <h2>Application object</h2>
        <p>The app registration: its global client ID, sign-in audience, redirect settings, exposed API, requested resource access, and common client credentials.</p>
        <code>microsoft.graph.application</code>
      </article>
      <div className="sp-primer-arrow" aria-hidden="true">
        <span>creates / references</span>
        <Icon name="arrow" size={21} />
      </div>
      <article className="sp-primer-card principal">
        <span>Identity · tenant local</span>
        <h2>Service principal</h2>
        <p>The security principal used in a tenant: it signs in, receives grants and assignments, and carries local enterprise-application configuration.</p>
        <code>microsoft.graph.servicePrincipal</code>
      </article>
    </div>
  );
}

function PermissionFlow() {
  return (
    <div className="sp-permission-flow">
      <article>
        <span className="sp-step-number">1</span>
        <div>
          <small>Application object</small>
          <h3>Requested access</h3>
          <code>requiredResourceAccess</code>
          <p>What the developer configured the application to request during consent.</p>
        </div>
      </article>
      <div className="sp-flow-arrow" aria-hidden="true"><Icon name="arrow" /></div>
      <article>
        <span className="sp-step-number">2</span>
        <div>
          <small>Tenant decision</small>
          <h3>Consent and policy</h3>
          <code>user / admin / policy</code>
          <p>The tenant evaluates publisher, permission type, consent policy, and administrator authority.</p>
        </div>
      </article>
      <div className="sp-flow-arrow" aria-hidden="true"><Icon name="arrow" /></div>
      <article>
        <span className="sp-step-number">3</span>
        <div>
          <small>Service principal</small>
          <h3>Granted access</h3>
          <code>appRoleAssignments + oauth2PermissionGrants</code>
          <p>The records that show what the tenant actually granted to the local client identity.</p>
        </div>
      </article>
    </div>
  );
}

export default function ServicePrincipals() {
  const schemas = useMemo(() => [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: "Microsoft Entra service principals: application objects, IDs, permissions, and security",
      description: page.description,
      datePublished: "2026-09-16",
      dateModified: page.lastModified,
      inLanguage: "en-US",
      proficiencyLevel: "Expert",
      author: { "@type": "Organization", name: "SecRole", url: "https://www.secrole.com" },
      publisher: { "@type": "Organization", name: "SecRole", url: "https://www.secrole.com" },
      mainEntityOfPage: "https://www.secrole.com/service-principals",
      about: [
        "Microsoft Entra ID",
        "service principals",
        "application registrations",
        "managed identities",
        "OAuth permissions",
        "Microsoft Graph",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "SecRole", item: "https://www.secrole.com/" },
        { "@type": "ListItem", position: 2, name: "Service principals", item: "https://www.secrole.com/service-principals" },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: troubleshootingItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ], []);

  return (
    <div className="sp-reference">
      <PageMeta
        title={page.title}
        description={page.description}
        path={page.path}
        type="article"
        keywords={page.keywords}
        schema={schemas}
      />

      <header className="sp-hero">
        <div className="sp-page-width">
          <div className="sp-breadcrumb"><Link to="/">SecRole</Link><span>/</span><span>Knowledge</span><span>/</span><strong>Service principals</strong></div>
          <div className="sp-hero-copy">
            <div className="sp-eyebrow">Microsoft Entra workload identity reference</div>
            <h1>Application objects &amp; service principals</h1>
            <p>An application object defines a registered app. Its Application-type service principal is the tenant-local identity that represents it and receives access. This page connects the object model, IDs, consent records, credentials, operations, and security controls in one place.</p>
            <div className="sp-hero-actions">
              <a className="sp-button primary" href="#identifiers">Understand the IDs</a>
              <a className="sp-button secondary" href="#commands">Jump to commands</a>
            </div>
          </div>

          <ObjectPrimer />

          <div className="sp-quick-facts">
            {quickFacts.map((fact) => (
              <article key={fact.value}>
                <strong>{fact.value}</strong>
                <span>{fact.label}</span>
              </article>
            ))}
          </div>
        </div>
      </header>

      <div className="sp-page-width sp-layout">
        <main className="sp-content">
          <section className="sp-section" id="relationship">
            <SectionHeading icon="relationship" eyebrow="The mental model" title="For application-backed workloads: one definition, one local identity per tenant">
              Start with the object boundary. Most service-principal confusion comes from using “app,” “app registration,” and “enterprise application” as though they were the same directory object.
            </SectionHeading>

            <ol className="sp-lifecycle">
              <li><span>1</span><div><strong>Register</strong><p>The home tenant stores the application object. Portal registration normally creates a matching home-tenant service principal.</p></div></li>
              <li><span>2</span><div><strong>Consent or provision</strong><p>A consuming tenant creates its own service principal and records its local grants and enterprise-app configuration.</p></div></li>
              <li><span>3</span><div><strong>Authenticate and authorize</strong><p>The workload authenticates as the app, while the tenant evaluates the local service principal, grants, assignments, and policy.</p></div></li>
            </ol>

            <div className="sp-callout info">
              <strong>Important Graph API detail</strong>
              <p>Creating a Microsoft Graph <code>application</code> object does not, by itself, create the matching <code>servicePrincipal</code>. That is a separate create operation. The Entra admin center registration experience normally creates both home-tenant objects for you.</p>
            </div>

            <details className="sp-explorer">
              <summary>
                <span><strong>Explore the object model</strong><small>Build a single-tenant or multitenant example and watch the IDs and object counts.</small></span>
                <span className="sp-summary-action">Open interactive model</span>
              </summary>
              <ServicePrincipalModel />
            </details>
          </section>

          <section className="sp-section" id="identifiers">
            <SectionHeading icon="identifiers" eyebrow="IDs explained" title="Know which ID the field is asking for">
              The client ID identifies the app. Object IDs identify concrete directory objects. The tenant ID tells you which directory context you are operating in.
            </SectionHeading>

            <div className="sp-identifier-grid">
              {identifiers.map((item) => (
                <article className={`sp-identifier-card ${item.accent}`} key={item.label}>
                  <div className="sp-card-label">{item.label}</div>
                  <code>{item.graph}</code>
                  <div className="sp-guid">{item.example}</div>
                  <strong>{item.scope}</strong>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>

            <div className="sp-id-rule">
              <div><span>Configuration asks for</span><strong>client_id</strong><p>Use the Application (client) ID: <code>appId</code>.</p></div>
              <div><span>Graph path asks for</span><strong>servicePrincipal-id</strong><p>Use the local service principal Object ID: <code>servicePrincipal.id</code>.</p></div>
              <div><span>Azure assignment shows</span><strong>principalId</strong><p>For a workload identity, this usually points to the service principal Object ID.</p></div>
            </div>
          </section>

          <section className="sp-section" id="comparison">
            <SectionHeading icon="comparison" eyebrow="Side-by-side reference" title="Application object vs. service principal">
              This comparison describes Application-type service principals. Use it when a portal blade, Graph relationship, or ticket uses the word “application” without saying which object it means.
            </SectionHeading>

            <div className="sp-table-wrap" role="region" aria-label="Application object and service principal comparison" tabIndex="0">
              <table className="sp-comparison-table">
                <thead>
                  <tr><th>Question</th><th>Application object</th><th>Service principal</th></tr>
                </thead>
                <tbody>
                  {comparisonRows.map(([question, application, principal]) => (
                    <tr key={question}><th scope="row">{question}</th><td>{application}</td><td>{principal}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="sp-section" id="permissions">
            <SectionHeading icon="permissions" eyebrow="Permissions & consent" title="Requested access is not the same as granted access">
              The app registration drives the consent request. The tenant-local service principal is where you investigate what was actually granted.
            </SectionHeading>

            <PermissionFlow />

            <div className="sp-permission-grid">
              <article>
                <div className="sp-card-label app">Application object</div>
                <h3>What the app requests</h3>
                <code>requiredResourceAccess</code>
                <p>Lists resource APIs plus delegated scopes or application roles configured by the developer. It drives the consent experience but is not proof that consent exists.</p>
              </article>
              <article>
                <div className="sp-card-label principal">Client service principal</div>
                <h3>Application permissions</h3>
                <code>appRoleAssignments</code>
                <p>App roles assigned to the client service principal. These are the application permissions the workload can use as itself.</p>
              </article>
              <article>
                <div className="sp-card-label principal">Client service principal</div>
                <h3>Delegated permissions</h3>
                <code>oauth2PermissionGrants</code>
                <p>OAuth delegated grants that authorize the client to call an API on behalf of a signed-in user, subject to both user and application authorization.</p>
              </article>
            </div>

            <div className="sp-callout warning">
              <strong>Direction matters in Microsoft Graph</strong>
              <p><code>appRoleAssignments</code> means roles this service principal has been granted on resource service principals. <code>appRoleAssignedTo</code> means users, groups, or other principals assigned to roles exposed by this service principal. Similar names, opposite direction.</p>
            </div>
          </section>

          <section className="sp-section" id="types">
            <SectionHeading icon="types" eyebrow="Object types" title="Four service principal types you may encounter">
              The classic three-type model now also includes agent identities. The Graph value tells you which lifecycle and management rules apply.
            </SectionHeading>

            <div className="sp-type-grid">
              {servicePrincipalTypes.map((item) => (
                <article key={item.type}>
                  <div className="sp-type-top"><code>{item.type}</code><span>{item.badge}</span></div>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <dl>
                    <div><dt>Backing object</dt><dd>{item.backingObject}</dd></div>
                    <div><dt>Credentials</dt><dd>{item.credentials}</dd></div>
                    <div><dt>Created by</dt><dd>{item.createdBy}</dd></div>
                  </dl>
                </article>
              ))}
            </div>

            <p className="sp-fine-print">Microsoft Graph also documents <code>SocialIdp</code> as an internal-use value. It is not presented here as a normal administrator-managed workload identity type.</p>
          </section>

          <section className="sp-section" id="authentication">
            <SectionHeading icon="authentication" eyebrow="Authentication methods" title="Reduce or eliminate long-lived credentials">
              The service principal is the identity; the credential or federation mechanism is how the workload proves it is allowed to act as that identity.
            </SectionHeading>

            <div className="sp-auth-grid">
              {authenticationMethods.map((item, index) => (
                <article key={item.title}>
                  <div className="sp-auth-rank">{String(index + 1).padStart(2, "0")}</div>
                  <span className="sp-auth-posture">{item.posture}</span>
                  <h3>{item.title}</h3>
                  <small>{item.fit}</small>
                  <p>{item.description}</p>
                  <ul>{item.checks.map((check) => <li key={check}>{check}</li>)}</ul>
                </article>
              ))}
            </div>
          </section>

          <section className="sp-section" id="governance">
            <SectionHeading icon="governance" eyebrow="Security & governance" title="A review should prove ownership, need, and use">
              A service principal can hold durable privilege without an interactive user. Treat workload identities as managed security principals with an accountable lifecycle.
            </SectionHeading>

            <div className="sp-governance-grid">
              {governanceChecks.map((item) => (
                <article key={item.title}>
                  <span>{item.risk}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>

            <div className="sp-review-sequence">
              <h3>Safe review sequence</h3>
              <ol>
                <li><span>1</span>Identify the appId, all local object IDs, owners, and purpose.</li>
                <li><span>2</span>Inventory grants, directory roles, Azure RBAC, credentials, and assignments.</li>
                <li><span>3</span>Collect sign-in, audit, provisioning, and owner evidence over an appropriate period.</li>
                <li><span>4</span>Reduce permissions or disable first when the risk and recovery plan support it.</li>
                <li><span>5</span>Delete only with approval, dependency validation, and documented recovery steps.</li>
              </ol>
            </div>
          </section>

          <section className="sp-section" id="troubleshooting">
            <SectionHeading icon="troubleshooting" eyebrow="Troubleshooting" title="When the portal views do not seem to agree">
              Start with appId, tenant ID, and object type. Those three facts usually reveal whether you are looking at the definition, the local identity, or the wrong directory.
            </SectionHeading>

            <div className="sp-faq-list">
              {troubleshootingItems.map((item) => (
                <details key={item.question}>
                  <summary>{item.question}<span aria-hidden="true">+</span></summary>
                  <div>
                    <p>{item.answer}</p>
                    <aside><strong>Next check</strong><code>{item.next}</code></aside>
                  </div>
                </details>
              ))}
            </div>
          </section>

          <section className="sp-section" id="commands">
            <SectionHeading icon="commands" eyebrow="Copy & run" title="PowerShell, Azure CLI, and Microsoft Graph">
              These examples are investigation-oriented and read-only. Replace placeholders and connect with the least-privileged permissions appropriate for your environment.
            </SectionHeading>
            <CommandReference />
          </section>

          <section className="sp-section sp-knowledge-map" id="related-guides">
            <SectionHeading icon="sources" eyebrow="Knowledge map" title="This page is the hub, not the finish line">
              Broad concepts stay here. Topics that need procedures, screenshots, decision trees, or larger scripts can become dedicated guides and link back to this foundation.
            </SectionHeading>
            <div className="sp-expansion-grid">
              {knowledgeExpansion.map((item) => (
                <article data-future-path={item.path} key={item.id}>
                  <span>Deep-dive path</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <code>{item.path}</code>
                </article>
              ))}
            </div>
          </section>

          <section className="sp-section" id="sources">
            <SectionHeading icon="sources" eyebrow="Official sources" title="Primary documentation used for this reference">
              SecRole translates the object model into an operational reference. Microsoft Learn and Microsoft Graph documentation remain the source of truth for platform behavior and API contracts.
            </SectionHeading>

            <div className="sp-source-list">
              {officialSources.map((source) => (
                <a href={source.href} target="_blank" rel="noreferrer" key={source.href}>
                  <div><strong>{source.title}</strong><span>{source.note}</span></div>
                  <Icon name="external" size={16} />
                </a>
              ))}
            </div>

            <footer className="sp-reference-footer">
              <span>SecRole knowledge reference</span>
              <strong>Last reviewed: {reviewedDate}</strong>
              <p>Review current Microsoft documentation before making production changes. Tenant configuration, licensing, sovereign cloud behavior, and platform updates can change the exact experience.</p>
            </footer>
          </section>
        </main>

        <OnThisPage />
      </div>
    </div>
  );
}
