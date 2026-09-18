import { GuideCallout, GuideSection } from "./KnowledgeGuideLayout";

const evidenceSources = [
  {
    label: "Service principal sign-ins",
    title: "App-only authentication activity",
    detail: "Review source IP, target resource, credential type, status, Conditional Access evaluation, first/last occurrence, and whether the pattern matches the workload design.",
    path: "Monitoring & health → Sign-in logs → Service principal sign-ins",
  },
  {
    label: "Managed identity sign-ins",
    title: "Azure-managed workload activity",
    detail: "Managed identities have a separate sign-in log. Do not conclude a managed identity is inactive because the service-principal sign-in tab is empty.",
    path: "Monitoring & health → Sign-in logs → Managed identity sign-ins",
  },
  {
    label: "Directory audit logs",
    title: "Who changed the identity and its access",
    detail: "Look for owner changes, credentials, consent, app-role assignments, account state, assignment requirements, federation rules, policies, and deletions.",
    path: "Monitoring & health → Audit logs",
  },
  {
    label: "Target-resource logs",
    title: "What the workload actually did",
    detail: "The token service proves authentication and issuance. The target API, Azure resource, database, Key Vault, Microsoft 365 workload, or application log proves resource usage.",
    path: "Resource diagnostic / audit / access logs",
  },
  {
    label: "Risk detections",
    title: "Signals that the identity might be compromised",
    detail: "Review leaked credentials, suspicious sign-ins, anomalous service-principal activity, suspicious API traffic, threat intelligence, and administrator-confirmed compromise when available.",
    path: "ID Protection → Risky workload identities",
  },
  {
    label: "Owner evidence",
    title: "Expected behavior and dependency confirmation",
    detail: "Require owners to identify deployment location, credential or federation path, expected resources, normal network origin, data handled, support contacts, and safe outage window.",
    path: "Governance record / owner attestation",
  },
];

const controlCards = [
  ["Account state", "accountEnabled", "Confirm whether the local identity is enabled and whether disablement is technically and operationally recoverable."],
  ["Assignment requirement", "appRoleAssignmentRequired", "For applicable apps, confirm whether users or calling principals must receive explicit assignments before access."],
  ["Conditional Access", "Workload identity policy", "Review direct policy targeting, report-only results, network conditions, risk conditions, exclusions, and feature-scope limitations."],
  ["Workload risk", "riskyServicePrincipals", "Investigate current risk level, detections, history, suspicious configuration changes, and unauthorized role acquisition."],
  ["Application management policy", "appManagementPolicies", "Determine whether credential restrictions and application-management standards are enforced on the app."],
  ["Classification", "tags / notes / custom attributes", "Use governed metadata to record tier, owner, environment, exception, review date, and lifecycle state when your organization supports it."],
];

const riskRows = [
  ["Critical / contain now", "Confirmed or strongly suspected compromise; leaked or unexpected valid credential; Microsoft-disabled malicious app; unexplained high-impact privilege plus anomalous activity.", "Preserve evidence, activate incident response, block or disable according to the containment plan, rotate credentials, and investigate downstream resources."],
  ["High / urgent remediation", "Tenant-wide sensitive data access, role-management capability, broad directory write, high-scope Azure RBAC, long-lived reusable credentials, weak ownership, or high blast radius.", "Confirm dependency and owner, reduce privilege, replace risky authentication, add controls, and schedule near-term verification."],
  ["Medium / planned correction", "Scoped write access, reducible grants, incomplete owner coverage, aging credentials, limited monitoring, ambiguous purpose, or inconsistent lifecycle records.", "Correct ownership and documentation, narrow access, improve evidence collection, and set a dated follow-up review."],
  ["Lower / retain with monitoring", "Purpose and owners confirmed, access tightly scoped, authentication is credential-free or strongly managed, activity is expected, no adverse risk signals, and controls are tested.", "Retain, document the evidence, set the next review date, and monitor for privilege, credential, and activity drift."],
];

export default function SecurityReviewEvidenceSections() {
  return (
    <>
      <GuideSection
        id="activity-evidence"
        eyebrow="Operational evidence"
        title="Prove how the identity is used and how it changed"
        intro="A secure-looking object can still be compromised, abandoned, or used outside its intended pattern. Correlate identity logs with the resource that accepted the token."
      >
        <div className="kg-record-grid sr-evidence-grid">
          {evidenceSources.map((item) => (
            <article className="kg-record-card" key={item.title}>
              <span>{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
              <code>{item.path}</code>
            </article>
          ))}
        </div>

        <GuideCallout tone="warning" title="No sign-in record is not the same as no use">
          Verify the log type, retention window, export coverage, delegated flows, managed identity activity, provisioning, target-resource logs, and owner-confirmed schedule. Some workloads run monthly, quarterly, during disaster recovery, or only when an event occurs.
        </GuideCallout>

        <div className="kg-decision-banner">
          <strong>Baseline the expected pattern</strong>
          <p>Document normal source networks, target resources, credential type, schedule, region, user agent or client library, and administrative change path. Future reviews become much stronger when they can compare current activity to an approved baseline.</p>
        </div>
      </GuideSection>

      <GuideSection
        id="controls-risk"
        eyebrow="Preventive & detective controls"
        title="Evaluate the controls that reduce blast radius or expose compromise"
        intro="Controls must match the service-principal type and platform scope. Record exclusions and unsupported scenarios instead of assuming one policy covers every workload identity."
      >
        <div className="kg-card-grid sr-control-grid">
          {controlCards.map(([label, field, detail]) => (
            <article className="kg-card" key={label}>
              <div className="kg-card-label">{label}</div>
              <h3>{field}</h3>
              <p>{detail}</p>
            </article>
          ))}
        </div>

        <GuideCallout tone="info" title="Conditional Access has workload-specific scope limits">
          Current workload-identity policies can target eligible single-tenant service principals registered in the tenant. Microsoft and third-party SaaS applications, multitenant applications, and managed identities are outside this policy scope. Target the service principal directly; group targeting does not enforce the policy for the contained service principal.
        </GuideCallout>

        <GuideCallout tone="warning" title="Risk reporting does not cover every workload identity equally">
          Microsoft Entra ID Protection detects risk for supported application and service-principal scenarios, while managed identities are currently outside the risky-workload-identity scope. Preserve separate monitoring and resource evidence for identities the risk report does not cover.
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="risk-decision"
        eyebrow="Decision model"
        title="Classify the cumulative risk, then choose a documented disposition"
        intro="This SecRole rating is an operational review model—not a Microsoft product classification. One severe signal can outweigh several healthy controls, and business impact can raise the result."
      >
        <div className="kg-table-wrap" role="region" aria-label="SecRole service principal review decision matrix" tabIndex="0">
          <table className="kg-table sr-risk-table">
            <thead><tr><th>Disposition band</th><th>Example evidence</th><th>Expected action</th></tr></thead>
            <tbody>
              {riskRows.map(([band, evidence, action]) => (
                <tr key={band}><th>{band}</th><td>{evidence}</td><td>{action}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sr-disposition-grid">
          <article><span>Retain</span><h3>Access remains justified</h3><p>Evidence supports the purpose, privilege, authentication, activity, ownership, and control posture. Record the next review date.</p></article>
          <article><span>Reduce</span><h3>Need exists, access is excessive</h3><p>Replace unused or reducible permissions, narrow resource scope, separate duties, and verify the workload after the change.</p></article>
          <article><span>Contain</span><h3>Compromise or unacceptable exposure</h3><p>Preserve evidence, coordinate incident response, block access according to the plan, rotate credentials, and investigate downstream impact.</p></article>
          <article><span>Retire</span><h3>No supported business need remains</h3><p>Confirm dependencies, stage disablement, monitor for failure, retain recovery evidence, and delete only after approval and the recovery window decision.</p></article>
        </div>
      </GuideSection>
    </>
  );
}
