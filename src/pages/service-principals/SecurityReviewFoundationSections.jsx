import { GuideCallout, GuideSection } from "./KnowledgeGuideLayout";

const outcomes = [
  ["Identity", "Which application and tenant-local service principal are being reviewed?"],
  ["Purpose", "What business capability depends on the workload and how critical is it?"],
  ["Accountability", "Which active technical and business owners can approve changes and support recovery?"],
  ["Privilege", "What can the identity read, change, administer, or own across every control plane?"],
  ["Authentication", "How does the workload prove its identity and where are those credentials or trust rules managed?"],
  ["Evidence", "Do sign-ins, audit events, resource logs, risk signals, and owner confirmation support continued access?"],
];

const identityFields = [
  ["Application ID", "application.appId / servicePrincipal.appId", "Stable app identity used to correlate objects and configurations."],
  ["Application Object ID", "application.id", "Home-tenant app-registration object and the common location for requested permissions and client credentials."],
  ["Service Principal Object ID", "servicePrincipal.id", "Tenant-local security principal targeted by grants, ownership, assignments, and many controls."],
  ["Home tenant", "servicePrincipal.appOwnerOrganizationId", "Tenant where the backing application is registered for Application-type service principals."],
  ["Object type", "servicePrincipal.servicePrincipalType", "Distinguishes Application, ManagedIdentity, Legacy, and ServiceIdentity lifecycle rules."],
  ["Publisher", "servicePrincipal.verifiedPublisher", "Provenance signal for the associated application—not an approval of its permissions."],
  ["Created by", "createdByAppId / template origin", "Helps distinguish portal registration, automation, gallery/template, first-party, and unexpected creation paths."],
  ["Microsoft status", "disabledByMicrosoftStatus", "Shows whether Microsoft disabled the application for suspicious, abusive, malicious, or agreement-violation reasons."],
];

export default function SecurityReviewFoundationSections() {
  return (
    <>
      <GuideSection
        id="review-outcome"
        eyebrow="Review objective"
        title="A complete review proves identity, need, privilege, authentication, and evidence"
        intro="The goal is not to produce a list of GUIDs. The goal is to determine whether the workload identity is understood, appropriately controlled, and still justified."
      >
        <div className="sr-outcome-grid">
          {outcomes.map(([title, detail]) => (
            <article key={title}>
              <span>{title}</span>
              <p>{detail}</p>
            </article>
          ))}
        </div>

        <GuideCallout tone="info" title="Review both directory objects">
          For an Application-type service principal, the application object and service principal can have different owners, credentials, properties, and security relationships. A review that inspects only App registrations or only Enterprise applications is incomplete.
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="fast-triage"
        eyebrow="First pass"
        title="Use a 10-minute triage before the full evidence review"
        intro="The first pass identifies urgent containment signals and determines which specialists and data sources are needed for the deeper review."
      >
        <div className="kg-flow sr-triage-flow">
          <article><span>01</span><h3>Resolve the identity</h3><code>appId + object IDs + tenant</code><p>Confirm the exact application, local service principal, object type, home tenant, and target directory.</p></article>
          <article><span>02</span><h3>Find accountability</h3><code>purpose + owners + support</code><p>Identify active owners, business sponsor, support team, data handled, and expected lifetime.</p></article>
          <article><span>03</span><h3>Find blast radius</h3><code>grants + roles + credentials</code><p>Look for tenant-wide permissions, directory roles, Azure RBAC, resource roles, and reusable credentials.</p></article>
          <article><span>04</span><h3>Look for urgency</h3><code>risk + anomalies + recent change</code><p>Check risky workload identities, new credentials, unfamiliar IPs/resources, Microsoft disablement, and owner denial.</p></article>
        </div>

        <ul className="kg-checklist sr-triage-list">
          <li><span>1</span><div><strong>Stop and escalate</strong> when the owner denies knowledge of the app, a leaked or unexpected credential exists, Microsoft disabled the app, or risk detections indicate compromise.</div></li>
          <li><span>2</span><div><strong>Prioritize the full review</strong> when the service principal has tenant-wide application permissions, privileged directory roles, broad Azure RBAC, no accountable owners, or long-lived credentials.</div></li>
          <li><span>3</span><div><strong>Do not call it inactive yet</strong> when one log source is empty. Confirm retention, delegated flows, managed identity logs, target-resource logs, and owner evidence.</div></li>
          <li><span>4</span><div><strong>Preserve evidence before changes</strong>: timestamps, object properties, grants, credential metadata, audit history, sign-in details, risk detections, and resource-side logs.</div></li>
        </ul>
      </GuideSection>

      <GuideSection
        id="identity-ownership"
        eyebrow="Identity & accountability"
        title="Establish provenance, ownership, and lifecycle before judging risk"
        intro="Permissions are easier to interpret when you know who created the identity, who supports it, what it does, and whether it is internal, third-party, Microsoft first-party, gallery-based, managed, or legacy."
      >
        <div className="kg-table-wrap" role="region" aria-label="Service principal identity and provenance evidence" tabIndex="0">
          <table className="kg-table sr-evidence-table">
            <thead><tr><th>Evidence</th><th>Directory field or source</th><th>Review question</th></tr></thead>
            <tbody>
              {identityFields.map(([evidence, field, question]) => (
                <tr key={evidence}><th>{evidence}</th><td><code>{field}</code></td><td>{question}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="kg-card-grid sr-owner-grid">
          <article className="kg-card"><div className="kg-card-label">Application owners</div><h3>Who can manage the app registration?</h3><p>Review the owners of the application object, including whether they can add credentials or change requested permissions. Verify that each owner is active and appropriate.</p><code>application / owners</code></article>
          <article className="kg-card"><div className="kg-card-label">Service principal owners</div><h3>Who can manage the Enterprise application?</h3><p>Review local owners separately. Microsoft Graph documentation recommends at least two service principal owners, but owner quality and accountability matter more than the count alone.</p><code>servicePrincipal / owners</code></article>
          <article className="kg-card"><div className="kg-card-label">Business ownership</div><h3>Who accepts the risk and confirms the need?</h3><p>Directory ownership is not a substitute for a named business sponsor, data owner, technical support team, backup owner, criticality, and documented recovery contact.</p><code>governance record</code></article>
          <article className="kg-card"><div className="kg-card-label">Lifecycle</div><h3>When should this identity change or retire?</h3><p>Record creation date, expected lifetime, review cadence, decommission trigger, dependency inventory, and the approval path for disabling or deleting the object.</p><code>createdDateTime + review record</code></article>
        </div>

        <GuideCallout tone="warning" title="Verified publisher is only one trust signal">
          Publisher verification helps identify the publisher behind an application. It does not prove that the app is safe, uncompromised, necessary, or entitled to the permissions requested in your tenant. Continue the privilege and activity review.
        </GuideCallout>
      </GuideSection>
    </>
  );
}
