import { GuideCallout, GuideSection } from "../service-principals/KnowledgeGuideLayout";

const activationControls = [
  {
    label: "Time boundary",
    title: "Activation maximum duration",
    description: "Defines how long a self-activated role can remain active. Microsoft Entra role activation duration can be configured from one to 24 hours.",
    proof: "Expiration_EndUser_Assignment",
  },
  {
    label: "Identity proof",
    title: "MFA on activation",
    description: "Requires an MFA claim before activation. A new prompt is not guaranteed when the current session already satisfies the requirement.",
    proof: "Enablement_EndUser_Assignment",
  },
  {
    label: "Stronger session",
    title: "Authentication context",
    description: "Connects activation to Conditional Access requirements such as authentication strength, compliant device, or terms of use.",
    proof: "AuthenticationContext_EndUser_Assignment",
  },
  {
    label: "Human decision",
    title: "Approval",
    description: "Requires a delegated approver before activation. Approvers cannot approve their own request, and service principals cannot approve.",
    proof: "Approval_EndUser_Assignment",
  },
  {
    label: "Business evidence",
    title: "Justification and ticket",
    description: "Captures the reason and ticket reference. Ticket fields are informational; PIM does not validate them against the ticketing platform.",
    proof: "Enablement_EndUser_Assignment",
  },
  {
    label: "Operational visibility",
    title: "Notifications",
    description: "Controls email recipients and severity for assignment, eligibility, activation, approval, extension, and renewal events.",
    proof: "Notification_* rules",
  },
  {
    label: "Assignment lifecycle",
    title: "Eligible and active duration",
    description: "Controls whether permanent assignments are allowed and the maximum duration for time-bound eligibility or active access.",
    proof: "Expiration_Admin_*",
  },
  {
    label: "Creation controls",
    title: "MFA and justification on active assignment",
    description: "Applies when an administrator creates an active assignment. It does not force MFA every time the already-active role is used.",
    proof: "Enablement_Admin_Assignment",
  },
];

const baselineRows = [
  {
    roleClass: "Tenant takeover and role-management roles",
    examples: "Global Administrator, Privileged Role Administrator, Privileged Authentication Administrator",
    assignment: "Eligible for normal administration; emergency accounts remain a separate permanent-active exception.",
    controls: "Short activation, phishing-resistant authentication context, approval, justification, monitored ticket, notifications, frequent review.",
  },
  {
    roleClass: "Broad security, application, and identity administration",
    examples: "Security Administrator, Application Administrator, Conditional Access Administrator",
    assignment: "Eligible by default; time-bound active only when operations require continuous access.",
    controls: "MFA or authentication context, justification, targeted approval for the highest-impact tasks, notifications, quarterly or more frequent review.",
  },
  {
    roleClass: "Scoped operational administration",
    examples: "Administrative Unit-scoped user or group administration",
    assignment: "Eligible or time-bound active based on task frequency and support model.",
    controls: "Narrow scope, limited duration, justification, monitored use, and verified fallback coverage.",
  },
  {
    roleClass: "Sensitive read-only access",
    examples: "Security evidence, identity data, communications, audit or compliance content",
    assignment: "Eligible when data sensitivity or investigation scope is significant; do not assume read-only means Low risk.",
    controls: "Strong authentication, short duration where practical, owner approval, data-use evidence, and recurring review.",
  },
  {
    roleClass: "Emergency access",
    examples: "Cloud-only emergency Global Administrator accounts",
    assignment: "Permanent active by design, outside normal activation dependencies.",
    controls: "Two or more accounts, separate custody, strong passwordless authentication, immediate alerting, no routine use, and scheduled testing.",
  },
];

export default function PimControlSections() {
  return (
    <>
      <GuideSection
        id="activation-controls"
        eyebrow="Role settings"
        title="Design the activation path, not only the eligibility"
        intro="An eligible assignment becomes safer only when the role's activation, assignment, notification, and approval rules match the privilege and operating model."
      >
        <div className="pim-control-grid">
          {activationControls.map((control) => (
            <article className="pim-control-card" key={control.title}>
              <span>{control.label}</span>
              <h3>{control.title}</h3>
              <p>{control.description}</p>
              <code>{control.proof}</code>
            </article>
          ))}
        </div>

        <GuideCallout tone="warning" title="MFA does not always mean a fresh prompt">
          <p>A user might already have a valid MFA claim in the current session. When the design requires explicit reauthentication, a particular authentication strength, or a compliant device, use an authentication context with a Conditional Access policy and test the complete flow.</p>
        </GuideCallout>

        <div className="pim-auth-context-model">
          <article>
            <span>Activation policy</span>
            <h3>Conditional Access targets the authentication context</h3>
            <p>Controls what the user must satisfy to activate the eligible role.</p>
          </article>
          <b aria-hidden="true">+</b>
          <article>
            <span>Use policy</span>
            <h3>Conditional Access targets the directory role</h3>
            <p>Controls how the user can sign in and use the role after activation.</p>
          </article>
          <b aria-hidden="true">=</b>
          <article className="result">
            <span>Layered control</span>
            <h3>Strong activation and governed use</h3>
            <p>Prevents activation from being the only moment when device, location, or session requirements matter.</p>
          </article>
        </div>

        <GuideCallout tone="info" title="Authentication context depends on Conditional Access governance">
          <p>Conditional Access Administrators and Security Administrators can change or disable the policy that enforces the authentication context. Protect those roles accordingly, create and enable the policy before referencing the context in PIM, and verify exclusions, report-only state, and sign-in frequency.</p>
        </GuideCallout>

        <div className="pim-approval-panel">
          <div className="pim-approval-flow" aria-label="PIM approval flow">
            <div><span>1</span><strong>Eligible requester</strong><small>Role, scope, duration, reason, ticket</small></div>
            <i aria-hidden="true">→</i>
            <div><span>2</span><strong>Independent approver pool</strong><small>At least two monitored approvers</small></div>
            <i aria-hidden="true">→</i>
            <div><span>3</span><strong>Activation controls</strong><small>Authentication, approval, and policy evaluation</small></div>
            <i aria-hidden="true">→</i>
            <div><span>4</span><strong>Temporary active access</strong><small>Audited and automatically expired</small></div>
          </div>
          <ul>
            <li><strong>Use at least two approvers.</strong><span>Microsoft recommends selecting at least two. Avoid one-person availability risk.</span></li>
            <li><strong>Keep approvers independent.</strong><span>Do not make the only approvers depend on the same role they are approving.</span></li>
            <li><strong>Monitor the queue.</strong><span>Approval requests expire after 24 hours if no approver responds; that window is not configurable.</span></li>
            <li><strong>Document escalation.</strong><span>Define who can respond when normal approvers are unavailable without turning emergency accounts into routine approvers.</span></li>
          </ul>
        </div>

        <GuideCallout tone="warning" title="Lockout pattern to prevent">
          <p>If all Global Administrators and Privileged Role Administrators are only eligible, approval is required, and no specific approvers are configured, the tenant can be locked out of the approval path. Maintain tested emergency access and explicitly configured approvers before removing the last active administrative path.</p>
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="governance-baseline"
        eyebrow="SecRole design baseline"
        title="Match controls to capability, scope, and data sensitivity"
        intro="This is a SecRole governance baseline, not a Microsoft universal default. Adapt it to the tenant's licensing, operating hours, support model, regulatory obligations, and emergency procedures."
      >
        <div className="kg-table-wrap">
          <table className="kg-table pim-baseline-table">
            <thead>
              <tr>
                <th>Access class</th>
                <th>Examples</th>
                <th>Assignment posture</th>
                <th>Recommended controls</th>
              </tr>
            </thead>
            <tbody>
              {baselineRows.map((row) => (
                <tr key={row.roleClass}>
                  <th>{row.roleClass}</th>
                  <td>{row.examples}</td>
                  <td>{row.assignment}</td>
                  <td>{row.controls}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pim-baseline-principles">
          <article><span>01</span><h3>Reduce the role first</h3><p>PIM does not make an unnecessarily broad role least-privileged. Choose the smallest role before designing activation.</p></article>
          <article><span>02</span><h3>Narrow the scope</h3><p>Tenant-wide eligibility can still be excessive. Use Administrative Unit or supported resource scope when the task permits it.</p></article>
          <article><span>03</span><h3>Limit the activation</h3><p>Set the shortest practical duration and require evidence that connects the activation to a real administrative task.</p></article>
          <article><span>04</span><h3>Prove the control path</h3><p>Test requester, approver, authentication, notification, target task, expiration, and audit evidence together.</p></article>
        </div>

        <GuideCallout tone="success" title="Emergency access is a designed exception">
          <p>Emergency accounts should not depend on ordinary PIM activation, delegated approval, on-premises federation, or a single device. Keep at least two cloud-only emergency accounts with permanent active Global Administrator assignments, strong phishing-resistant authentication, secure custody, immediate monitoring, and regular testing.</p>
        </GuideCallout>
      </GuideSection>
    </>
  );
}
