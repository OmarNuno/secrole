import {
  GuideCallout,
  GuideCodeBlock,
  GuideSection,
} from "../service-principals/KnowledgeGuideLayout";
import {
  auditCorrelationKql,
  graphCollectionHelper,
  pendingApprovalPowerShell,
  pimAssignmentInventoryPowerShell,
  pimPolicyInventoryPowerShell,
  pimRequestHistoryPowerShell,
  selfActivateHttp,
} from "./pimRoleSettingsCode";

const cadence = [
  {
    label: "Daily",
    title: "Watch activations and exceptions",
    description: "Review denied or failed activations, unexpected high-impact role use, emergency account activity, and approval requests approaching expiration.",
  },
  {
    label: "Weekly",
    title: "Review standing and long-lived paths",
    description: "Find permanent active assignments, permanent eligibility, excessive activation duration, missing approvers, and policies that allow weak activation.",
  },
  {
    label: "Monthly",
    title: "Reconcile policy and assignment drift",
    description: "Compare role settings, approver pools, assignment dates, group inheritance, scope, and ownership against the approved governance baseline.",
  },
  {
    label: "Quarterly",
    title: "Attest continued need",
    description: "Require business owners to confirm role, scope, state, duration, controls, and evidence of use. Remove access that lacks an accountable owner or task.",
  },
  {
    label: "Event-driven",
    title: "Review after every material change",
    description: "Trigger review after role-setting changes, Conditional Access changes, approver changes, privilege incidents, reorganizations, or emergency-account use.",
  },
];

const troubleshooting = [
  {
    symptom: "Activation succeeded, but the administrator is still denied",
    checks: "Confirm the role system, role definition, directory scope, active schedule instance, target action, token or session refresh, and application-side caching.",
  },
  {
    symptom: "The user is eligible but sees no Activate action",
    checks: "Verify the effective eligibility schedule instance, eligibility dates, principal identity, role and scope, group-based inheritance behavior, licensing, and portal context.",
  },
  {
    symptom: "Approval remains pending until it expires",
    checks: "Verify at least two active approvers, monitored notifications, mailbox delivery, approver access to PIM, self-approval restrictions, and the 24-hour request window.",
  },
  {
    symptom: "Authentication context cannot be satisfied",
    checks: "Confirm the authentication context exists, the Conditional Access policy is enabled, requester scope is correct, exclusions are intentional, required authentication strength is registered, and no circular dependency exists.",
  },
  {
    symptom: "The user was not prompted for MFA",
    checks: "Inspect the current session's MFA claim. MFA on activation can be satisfied by prior strong authentication; use authentication context and sign-in frequency when explicit reauthentication is required.",
  },
  {
    symptom: "The role remains usable after deactivation",
    checks: "Confirm the active schedule instance is gone, then investigate cached application authorization, existing tokens, browser or PowerShell sessions, and target-service refresh behavior.",
  },
  {
    symptom: "Removing one active assignment did not remove access",
    checks: "Resolve other direct assignments, group-based assignments, activated instances, alternate roles, overlapping permissions, Azure RBAC, and application-specific authorization.",
  },
  {
    symptom: "Approval design blocks the identity team during an incident",
    checks: "Use tested emergency access, identify the circular or unavailable approver dependency, restore a controlled administrative path, and redesign the approver pool before normal operations resume.",
  },
  {
    symptom: "PIM evidence has multiple correlation IDs",
    checks: "Use roleAssignmentRequestId from audit AdditionalDetails to correlate asynchronous request, approval, scheduled activation, assignment, and deactivation events.",
  },
];

export default function PimOperationsSections() {
  return (
    <>
      <GuideSection
        id="commands"
        eyebrow="Read-only evidence first"
        title="Inventory effective access, role settings, and requests"
        intro="Start with current instances and policy rules. Preserve identifiers and timestamps before changing eligibility, role settings, approval configuration, or active assignments."
      >
        <GuideCallout tone="info" title="Permissions and modules">
          <p>The effective-instance reports use the least-privileged <code>RoleAssignmentSchedule.Read.Directory</code> and <code>RoleEligibilitySchedule.Read.Directory</code> scopes. Policy inventory uses <code>RoleManagementPolicy.Read.Directory</code>. Microsoft Graph currently requires schedule permissions whose names include <code>ReadWrite</code> to list request history or pending approvals, even when the example performs only a GET. <code>Directory.Read.All</code> supports principal and scope resolution.</p>
        </GuideCallout>

        <div className="pim-command-stack">
          <GuideCodeBlock
            title="Pagination-safe Microsoft Graph collection helper"
            code={graphCollectionHelper}
          />
          <GuideCodeBlock
            title="Export all active and eligible Microsoft Entra role instances"
            code={pimAssignmentInventoryPowerShell}
          />
          <GuideCodeBlock
            title="Export PIM role settings and policy rules"
            code={pimPolicyInventoryPowerShell}
          />
          <GuideCodeBlock
            title="Export assignment and eligibility request history"
            code={pimRequestHistoryPowerShell}
          />
          <GuideCodeBlock
            title="List activation requests pending your approval"
            code={pendingApprovalPowerShell}
          />
        </div>

        <div className="pim-output-grid">
          <article><span>Assignment evidence</span><h3>Who can activate and who is active now</h3><p>Principal, role, scope, member type, assignment type, start, end, instance ID, and source schedule.</p></article>
          <article><span>Policy evidence</span><h3>What activation and assignment rules apply</h3><p>Duration, MFA, authentication context, approval, approvers, justification, ticket, permanency, and notifications.</p></article>
          <article><span>Workflow evidence</span><h3>Why and how the state changed</h3><p>Request action, status, justification, ticket, schedule, approval ID, request ID, and completion time.</p></article>
          <article><span>Scope evidence</span><h3>Where the privilege applies</h3><p>Tenant root, Administrative Unit, supported directory resource, or app scope, with the exact scope identifier preserved.</p></article>
        </div>

        <GuideCallout tone="warning" title="State-changing activation example">
          <p>The request below creates temporary active access from an eligible assignment. Use it only after validating the principal, role definition, scope, duration, policy requirements, and business authorization.</p>
        </GuideCallout>
        <GuideCodeBlock
          title="Self-activate an eligible role for two hours"
          code={selfActivateHttp}
          language="HTTP"
        />
      </GuideSection>

      <GuideSection
        id="operations"
        eyebrow="Operating model"
        title="Govern the access path after the initial PIM rollout"
        intro="PIM configuration is not a one-time conversion project. Role settings, assignments, approvers, Conditional Access, owners, and use evidence change over time."
      >
        <div className="pim-cadence-grid">
          {cadence.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>

        <div className="kg-table-wrap">
          <table className="kg-table pim-evidence-table">
            <thead>
              <tr>
                <th>Evidence field</th>
                <th>What to preserve</th>
                <th>Why it matters</th>
              </tr>
            </thead>
            <tbody>
              <tr><th>Principal</th><td>Name, Object ID, type, owner, employment or service status</td><td>Proves who can activate and who is accountable.</td></tr>
              <tr><th>Role</th><td>Display name, role definition ID, built-in or custom status, privileged marker</td><td>Prevents name-only assumptions and supports permission review.</td></tr>
              <tr><th>Scope</th><td>Directory scope ID, app scope ID, resolved scope name</td><td>Shows where the role can act and whether scope can be narrowed.</td></tr>
              <tr><th>State and duration</th><td>Eligible or active, assignment type, member type, start, end, permanency</td><td>Distinguishes durable paths from current privilege.</td></tr>
              <tr><th>Role settings</th><td>Activation duration, MFA, authentication context, approval, approvers, justification, ticket, notifications</td><td>Proves the controls required before access becomes active.</td></tr>
              <tr><th>Workflow</th><td>Request ID, approval ID, action, status, justification, ticket, completion time</td><td>Connects the access event to the approved business activity.</td></tr>
              <tr><th>Use evidence</th><td>Sign-in, audit, target action, result, change record, owner confirmation</td><td>Shows whether the privilege was used as intended.</td></tr>
              <tr><th>Review decision</th><td>Retain, reduce, narrow, expire, remove, exception owner, next review date</td><td>Creates a defensible governance record rather than an undocumented snapshot.</td></tr>
            </tbody>
          </table>
        </div>

        <GuideCallout tone="info" title="Correlate by request ID, not only CorrelationId">
          <p>PIM activation can involve asynchronous request, approval, scheduled activation, assignment, and deactivation operations with different correlation IDs. Microsoft documents <code>roleAssignmentRequestId</code> as the more reliable value for reconstructing the full lifecycle.</p>
        </GuideCallout>
        <GuideCodeBlock
          title="Correlate PIM activation and deactivation in Log Analytics"
          code={auditCorrelationKql}
          language="KQL"
        />
      </GuideSection>

      <GuideSection
        id="troubleshooting"
        eyebrow="Field guide"
        title="Troubleshoot the failed layer instead of changing random settings"
        intro="Prove eligibility, policy, request, approval, active instance, scope, session, and target authorization in order."
      >
        <div className="pim-troubleshooting-list">
          {troubleshooting.map((item) => (
            <details key={item.symptom}>
              <summary>{item.symptom}<span aria-hidden="true">+</span></summary>
              <div><p>{item.checks}</p></div>
            </details>
          ))}
        </div>

        <div className="pim-troubleshooting-order">
          <span>Investigation order</span>
          <ol>
            <li><strong>Eligibility</strong><small>Does an effective eligible instance exist for the correct principal, role, scope, and date?</small></li>
            <li><strong>Policy</strong><small>Which role-management policy and effective rules apply?</small></li>
            <li><strong>Request</strong><small>Was activation submitted with the required duration, reason, ticket, and authentication?</small></li>
            <li><strong>Approval</strong><small>Is approval required, assigned, monitored, and completed before expiration?</small></li>
            <li><strong>Active instance</strong><small>Did PIM create the temporary active assignment, and has it expired or been removed?</small></li>
            <li><strong>Scope and system</strong><small>Does the assignment govern the actual resource and action being attempted?</small></li>
            <li><strong>Session and target</strong><small>Has the user refreshed tokens or sessions, and is the target service caching authorization?</small></li>
          </ol>
        </div>
      </GuideSection>
    </>
  );
}
