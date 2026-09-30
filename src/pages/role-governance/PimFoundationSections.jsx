import { GuideCallout, GuideSection } from "../service-principals/KnowledgeGuideLayout";

const states = [
  {
    tone: "critical",
    label: "Standing privilege",
    title: "Permanent active",
    access: "Active now",
    activation: "No",
    duration: "No assignment end date",
    description: "The principal continuously possesses the role until an administrator removes the assignment.",
  },
  {
    tone: "high",
    label: "Scheduled privilege",
    title: "Time-bound active",
    access: "Active now",
    activation: "No",
    duration: "Ends at a defined time",
    description: "The role is active immediately, but the assignment expires automatically at the configured end time.",
  },
  {
    tone: "medium",
    label: "Durable path",
    title: "Permanent eligible",
    access: "Not active",
    activation: "Yes",
    duration: "Eligibility has no end date",
    description: "The principal can request activation indefinitely. The access path is durable even though the role is not continuously active.",
  },
  {
    tone: "low",
    label: "Time-bound path",
    title: "Time-bound eligible",
    access: "Not active",
    activation: "Yes",
    duration: "Eligibility ends automatically",
    description: "The principal can activate only during the approved eligibility window and only after required controls are satisfied.",
  },
  {
    tone: "entra",
    label: "Temporary privilege",
    title: "Activated",
    access: "Active temporarily",
    activation: "Already completed",
    duration: "Ends after activation duration",
    description: "PIM created a temporary active assignment after the eligible principal completed the activation workflow.",
  },
];

const graphRecords = [
  {
    label: "Role capability",
    title: "unifiedRoleDefinition",
    description: "The role name, permissions, built-in or custom status, and role definition identifier.",
    code: "/roleManagement/directory/roleDefinitions",
  },
  {
    label: "Policy binding",
    title: "unifiedRoleManagementPolicyAssignment",
    description: "Maps one role definition and scope to the PIM policy that governs assignments and activation.",
    code: "/policies/roleManagementPolicyAssignments",
  },
  {
    label: "Role settings",
    title: "unifiedRoleManagementPolicy",
    description: "Contains the approval, expiration, enablement, authentication-context, and notification rules for the role.",
    code: "policy.rules / policy.effectiveRules",
  },
  {
    label: "Effective eligibility",
    title: "unifiedRoleEligibilityScheduleInstance",
    description: "Represents current eligible access after schedules, dates, scope, and inheritance are resolved.",
    code: "/roleEligibilityScheduleInstances",
  },
  {
    label: "Effective active access",
    title: "unifiedRoleAssignmentScheduleInstance",
    description: "Represents current active access, whether it is directly assigned, time-bound, group-based, or PIM-activated.",
    code: "/roleAssignmentScheduleInstances",
  },
  {
    label: "Workflow history",
    title: "Schedule requests",
    description: "Records admin assignment, self-activation, extension, renewal, removal, and other requested actions with status and justification.",
    code: "/roleAssignmentScheduleRequests",
  },
];

export default function PimFoundationSections() {
  return (
    <>
      <GuideSection
        id="state-model"
        eyebrow="The state model"
        title="Active, eligible, and activated are different facts"
        intro="Always describe assignment type and duration separately. Permanent does not mean active, and eligible does not mean the role is currently usable."
      >
        <div className="pim-equation" aria-label="PIM access equation">
          <div><span>Principal</span><strong>Who can receive access</strong></div>
          <b aria-hidden="true">×</b>
          <div><span>Role + scope</span><strong>What the access can do and where</strong></div>
          <b aria-hidden="true">×</b>
          <div><span>State + duration</span><strong>Whether access is active and for how long</strong></div>
          <b aria-hidden="true">×</b>
          <div><span>Controls</span><strong>What must happen before activation</strong></div>
        </div>

        <div className="pim-state-grid">
          {states.map((state) => (
            <article className={`pim-state-card ${state.tone}`} key={state.title}>
              <span>{state.label}</span>
              <h3>{state.title}</h3>
              <p>{state.description}</p>
              <dl>
                <div><dt>Has privileges now</dt><dd>{state.access}</dd></div>
                <div><dt>Activation needed</dt><dd>{state.activation}</dd></div>
                <div><dt>Duration</dt><dd>{state.duration}</dd></div>
              </dl>
            </article>
          ))}
        </div>

        <GuideCallout tone="warning" title="Permanent eligibility is still durable privilege">
          <p>A permanently eligible administrator does not possess the role continuously, but the tenant has granted a continuing path to activation. Treat that path as privileged access: assign an owner, configure strong role settings, monitor activations, and review continued need.</p>
        </GuideCallout>

        <div className="kg-table-wrap">
          <table className="kg-table pim-state-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Active assignment</th>
                <th>Eligible assignment</th>
                <th>Activated instance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Can the principal perform the role now?</th>
                <td>Yes, while the active assignment exists.</td>
                <td>No. Eligibility only permits a future activation request.</td>
                <td>Yes, until the activation expires or is deactivated.</td>
              </tr>
              <tr>
                <th>Where is current effective state proven?</th>
                <td><code>roleAssignmentScheduleInstances</code></td>
                <td><code>roleEligibilityScheduleInstances</code></td>
                <td><code>roleAssignmentScheduleInstances</code> with an activated assignment type</td>
              </tr>
              <tr>
                <th>Can it be permanent?</th>
                <td>Yes, when policy allows permanent active assignments.</td>
                <td>Yes, when policy allows permanent eligibility.</td>
                <td>No. Activation has a maximum duration.</td>
              </tr>
              <tr>
                <th>What should reviewers verify?</th>
                <td>Business need, scope, expiration, assignment source, and exception justification.</td>
                <td>Need to activate, role settings, ownership, eligibility window, and review cadence.</td>
                <td>Request, approval, justification, duration, actual use, and deactivation.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </GuideSection>

      <GuideSection
        id="policy-model"
        eyebrow="Configuration versus effective state"
        title="A role setting is a policy; an assignment is a separate record"
        intro="PIM role settings apply to a role at a scope. The principal's eligibility or active access is represented by schedules, requests, and effective instances—not by the policy alone."
      >
        <div className="pim-flow" aria-label="PIM policy and assignment flow">
          <div><span>1</span><strong>Role definition</strong><small>What actions are allowed</small></div>
          <i aria-hidden="true">→</i>
          <div><span>2</span><strong>Policy assignment</strong><small>Which PIM policy governs the role</small></div>
          <i aria-hidden="true">→</i>
          <div><span>3</span><strong>Policy rules</strong><small>Approval, duration, MFA, notifications</small></div>
          <i aria-hidden="true">→</i>
          <div><span>4</span><strong>Eligibility or assignment</strong><small>Who receives the access path</small></div>
          <i aria-hidden="true">→</i>
          <div><span>5</span><strong>Request and instance</strong><small>What became effective and when</small></div>
        </div>

        <div className="pim-record-grid">
          {graphRecords.map((record) => (
            <article className="pim-record-card" key={record.title}>
              <span>{record.label}</span>
              <h3>{record.title}</h3>
              <p>{record.description}</p>
              <code>{record.code}</code>
            </article>
          ))}
        </div>

        <GuideCallout tone="info" title="Policy is normally per role, not per assignee">
          <p>All assignments for the same Microsoft Entra role and scope follow the applicable role-management policy. A stricter requirement for one person is usually implemented through scope, assignment dates, Conditional Access, group design, or a different role—not a private per-user copy of the role settings.</p>
        </GuideCallout>

        <div className="kg-table-wrap">
          <table className="kg-table">
            <thead>
              <tr>
                <th>Evidence question</th>
                <th>Best Graph record</th>
                <th>What it proves</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>What does this role allow?</th>
                <td><code>unifiedRoleDefinition</code></td>
                <td>Role identity, permissions, template, and built-in or custom status.</td>
              </tr>
              <tr>
                <th>What settings govern this role?</th>
                <td><code>unifiedRoleManagementPolicyAssignment</code> expanded to <code>policy.rules</code></td>
                <td>Approval, duration, MFA, authentication context, justification, ticket, and notification rules.</td>
              </tr>
              <tr>
                <th>Who can activate?</th>
                <td><code>unifiedRoleEligibilityScheduleInstance</code></td>
                <td>Current effective eligibility after dates, scope, and inheritance are resolved.</td>
              </tr>
              <tr>
                <th>Who has the role now?</th>
                <td><code>unifiedRoleAssignmentScheduleInstance</code></td>
                <td>Current effective active access, including activated and assigned instances.</td>
              </tr>
              <tr>
                <th>Why did the state change?</th>
                <td>Assignment or eligibility schedule requests plus audit logs</td>
                <td>Action, request status, justification, ticket, approval, actor, and lifecycle evidence.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </GuideSection>
    </>
  );
}
