import { GuideCallout, GuideSection } from "../service-principals/KnowledgeGuideLayout";

const migrationSteps = [
  {
    number: "01",
    title: "Inventory current effective access",
    description: "Collect direct, group-based, active, eligible, activated, and time-bound paths. Do not treat one portal view as the full answer.",
  },
  {
    number: "02",
    title: "Resolve the real business task",
    description: "Document what the administrator must do, how often, in which system, and at what scope. Use the task to reduce role and scope before migration.",
  },
  {
    number: "03",
    title: "Identify exceptions",
    description: "Separate emergency access, nonhuman automation, shift coverage, and continuous operations from ordinary human administration.",
  },
  {
    number: "04",
    title: "Create the eligible assignment",
    description: "Preserve the existing active path while the new eligibility, dates, principal, role, and scope are introduced.",
  },
  {
    number: "05",
    title: "Configure role settings",
    description: "Set activation duration, authentication, approval, justification, ticket, notifications, and assignment-duration rules for the role.",
  },
  {
    number: "06",
    title: "Test the requester experience",
    description: "Verify the role appears, activation is available, required controls are enforced, and the user can submit a complete request.",
  },
  {
    number: "07",
    title: "Test approval and escalation",
    description: "Verify notifications, approver availability, self-approval prevention, response time, denial, expiration, and escalation paths.",
  },
  {
    number: "08",
    title: "Prove the actual task",
    description: "After activation, perform the approved administrative task at the intended scope and confirm prohibited actions remain blocked.",
  },
  {
    number: "09",
    title: "Verify evidence and expiration",
    description: "Confirm schedule instances, request status, audit records, ticket linkage, notifications, and automatic removal when activation ends.",
  },
  {
    number: "10",
    title: "Remove the standing assignment",
    description: "Only after the eligible path is proven, remove the old permanent-active or overbroad assignment by its exact assignment path.",
  },
  {
    number: "11",
    title: "Monitor early production use",
    description: "Watch initial activations, denials, approval latency, failed tasks, scope issues, and unexpected alternative access paths.",
  },
  {
    number: "12",
    title: "Schedule recurring review",
    description: "Assign owners, review eligibility and settings, analyze use evidence, and define the condition that removes the access path.",
  },
];

const proofChecks = [
  {
    label: "Positive proof",
    title: "The approved task succeeds",
    description: "The user activates the intended role, at the intended scope, for the intended duration, and completes the real administrative action.",
  },
  {
    label: "Negative proof",
    title: "Excess access remains blocked",
    description: "The principal cannot perform higher-impact actions, operate outside scope, bypass approval, or retain access after expiration.",
  },
  {
    label: "Workflow proof",
    title: "Approvers and notifications work",
    description: "The monitored approver pool receives the request, responds within the operating target, and leaves complete audit evidence.",
  },
  {
    label: "Recovery proof",
    title: "Rollback and emergency access are usable",
    description: "The team can restore a controlled path or use emergency access without depending on the same failed PIM workflow.",
  },
];

export default function PimMigrationSections() {
  return (
    <GuideSection
      id="migration"
      eyebrow="Standing-access reduction"
      title="Create and prove eligibility before removing active access"
      intro="The migration is a controlled access-path change. Do not begin by deleting the old assignment and hoping the new PIM design works during the next incident."
    >
      <div className="pim-migration-banner">
        <div className="before">
          <span>Before</span>
          <strong>Permanent active assignment</strong>
          <small>Continuous privilege with limited activation evidence</small>
        </div>
        <i aria-hidden="true">→</i>
        <div className="bridge">
          <span>Controlled overlap</span>
          <strong>Existing active + tested eligibility</strong>
          <small>Temporary migration window with explicit rollback</small>
        </div>
        <i aria-hidden="true">→</i>
        <div className="after">
          <span>Target state</span>
          <strong>Eligible, controlled, and reviewable</strong>
          <small>Temporary activation with policy, evidence, and expiration</small>
        </div>
      </div>

      <div className="pim-runbook-grid">
        {migrationSteps.map((step) => (
          <article className="pim-runbook-card" key={step.number}>
            <span>{step.number}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </article>
        ))}
      </div>

      <GuideCallout tone="warning" title="Do not remove the only working path first">
        <p>Maintain a controlled overlap period while the eligibility, activation controls, approvers, target task, expiration, and evidence are validated. The overlap must have an owner and an expiration date so it does not become a permanent duplicate assignment.</p>
      </GuideCallout>

      <div className="pim-proof-grid">
        {proofChecks.map((check) => (
          <article key={check.title}>
            <span>{check.label}</span>
            <h3>{check.title}</h3>
            <p>{check.description}</p>
          </article>
        ))}
      </div>

      <div className="kg-table-wrap">
        <table className="kg-table pim-migration-table">
          <thead>
            <tr>
              <th>Migration decision</th>
              <th>Required evidence before cutover</th>
              <th>Rollback trigger</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Role and scope</th>
              <td>Approved task mapped to the narrowest role and supported scope; negative access test completed.</td>
              <td>The new role cannot perform the required task or unexpectedly allows higher-impact actions.</td>
            </tr>
            <tr>
              <th>Activation policy</th>
              <td>Duration, authentication, approval, justification, ticket, and notifications tested with the real requester and approver path.</td>
              <td>Activation cannot be completed during the operating window or required controls fail open or closed.</td>
            </tr>
            <tr>
              <th>Operational coverage</th>
              <td>Primary and backup administrators can activate; approver coverage and escalation are documented.</td>
              <td>Shift, leave, or incident coverage depends on an unavailable person or unmonitored mailbox.</td>
            </tr>
            <tr>
              <th>Evidence and monitoring</th>
              <td>Request, activation, role use, expiration, and audit events are visible and retained for the required period.</td>
              <td>Security operations cannot distinguish legitimate activation from unexpected privileged use.</td>
            </tr>
            <tr>
              <th>Emergency access</th>
              <td>Emergency accounts are separately secured, monitored, and tested without relying on ordinary PIM approval.</td>
              <td>The PIM migration would remove the last usable recovery path.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </GuideSection>
  );
}
