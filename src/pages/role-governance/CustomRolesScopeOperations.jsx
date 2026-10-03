import { GuideCallout, GuideCodeBlock, GuideSection } from "../service-principals/KnowledgeGuideLayout";
import {
  applicationAssignmentRoleHttp,
  assignCustomRolePowerShell,
  createAdministrativeUnitPowerShell,
  createCustomRolePowerShell,
} from "./customRolesScopeChangeCode";

const workflow = [
  ["01", "Document the business task", "State the exact operation, target resource, frequency, support owner, business owner, and failure impact."],
  ["02", "Identify the authorization system", "Confirm the task belongs to Microsoft Entra RBAC—not Azure RBAC, app roles, API consent, or a Purview role group."],
  ["03", "Search built-in roles", "Use the SecRole Role Library and Microsoft's permission reference to find the least-privileged supported built-in definition."],
  ["04", "Test scope reduction first", "Determine whether a built-in role at Administrative Unit or resource scope satisfies the requirement."],
  ["05", "Identify required actions", "Capture every required microsoft.directory action and the objects against which it must work."],
  ["06", "Confirm custom-role support", "Verify that each action is enabled for custom use and works at the intended scope."],
  ["07", "Create the role definition", "Use a task-based name, clear description, accountable owner, version, review date, and only approved actions."],
  ["08", "Assign the narrowest scope", "Choose tenant, Administrative Unit, or supported Microsoft Entra resource scope and record the exact directoryScopeId."],
  ["09", "Govern the principal", "Resolve role-assignable groups, PIM eligibility, service principal authentication, ownership, and approval paths."],
  ["10", "Test success and denial", "Prove the required task succeeds, prohibited actions fail, and out-of-scope resources remain protected."],
  ["11", "Monitor first use", "Correlate role-management audit events, target-object changes, tickets, PIM activation, and operational output."],
  ["12", "Review and retire", "Remove stale assignments, disable or delete unused definitions, clean up scopes, and preserve evidence of the final state."],
];

const dispositions = [
  {
    label: "Retain",
    title: "Boundary matches the task",
    text: "The supported actions, principal, scope, state, duration, tests, ownership, and evidence remain justified.",
  },
  {
    label: "Reduce actions",
    title: "Definition is too broad",
    text: "Remove permissions that are not required, create a replacement version, test, migrate assignments, and retire the old definition.",
  },
  {
    label: "Narrow scope",
    title: "Assignment is too broad",
    text: "Replace tenant-wide access with an Administrative Unit or supported resource-scoped assignment.",
  },
  {
    label: "Move to PIM",
    title: "Access should not remain active",
    text: "Create and prove an eligible path before removing the existing standing assignment.",
  },
  {
    label: "Replace",
    title: "Built-in role now meets the need",
    text: "Migrate to a Microsoft-supported built-in role when it provides the same task with clearer lifecycle and supportability.",
  },
  {
    label: "Retire",
    title: "No approved need remains",
    text: "Remove assignments first, validate loss of access, then disable or delete the role definition and record the decision.",
  },
];

const changeGates = [
  {
    number: "1",
    title: "Definition review",
    text: "A second reviewer validates every action, description, naming standard, owner, and intended target object.",
  },
  {
    number: "2",
    title: "Scope review",
    text: "The exact directoryScopeId is resolved and a narrower supported scope has been considered.",
  },
  {
    number: "3",
    title: "Principal review",
    text: "Direct, group, service principal, owner, approver, and emergency-access paths are documented.",
  },
  {
    number: "4",
    title: "Negative testing",
    text: "Prohibited action and out-of-scope target tests are written before the production assignment is created.",
  },
  {
    number: "5",
    title: "Rollback and evidence",
    text: "Assignment removal, replacement role, audit correlation, and incident owner are known before deployment.",
  },
];

const troubleshootingOrder = [
  "Authorization system",
  "Role definition",
  "Allowed action",
  "Principal",
  "Assignment state",
  "Directory scope",
  "Target membership",
  "Session and audit",
];

const troubleshooting = [
  {
    title: "The custom role does not appear in the Administrative Unit picker",
    text: "Confirm the definition is enabled and includes at least one supported permission relevant to users, groups, or devices. Not every custom role is meaningful at AU scope.",
  },
  {
    title: "A built-in role has the action, but the action cannot be selected",
    text: "Microsoft exposes only a subset of permissions for custom-role use. Verify the official custom-role permission reference instead of assuming built-in availability implies custom-role support.",
  },
  {
    title: "The assignment exists, but the task is denied",
    text: "Verify the exact action, roleDefinitionId, principal, active or eligible state, directoryScopeId, target object's direct scope membership, token refresh, and target service authorization.",
  },
  {
    title: "The role works tenant-wide but fails at Administrative Unit scope",
    text: "The action might not support AU scope, the target may not be a direct AU member, or the operation may change an organization-level setting outside the scoped boundary.",
  },
  {
    title: "The group is in the AU, but the user cannot be managed",
    text: "The group object is in scope; its members are not automatically in scope. Add the user directly or use a supported dynamic AU membership design.",
  },
  {
    title: "A service principal has the scoped role but cannot find the object",
    text: "Confirm tenant-scoped directory-read capability. Service principals and guests do not automatically receive the read permissions needed to locate AU members.",
  },
  {
    title: "A Restricted Management AU blocks a Global Administrator",
    text: "That is expected for direct modification of protected members. Use an appropriate role assignment at the restricted scope, or have Global or Privileged Role Administration establish the auditable recovery path.",
  },
  {
    title: "Access remains after one assignment is removed",
    text: "Resolve direct, group-based, active, eligible, resource-scoped, AU-scoped, tenant-scoped, and alternate role paths. Also account for session and target-service propagation.",
  },
  {
    title: "The wrong role or scope identifier was used",
    text: "Distinguish role definition Object ID from templateId, and distinguish Administrative Unit ID from the complete /administrativeUnits/{id} directoryScopeId string.",
  },
];

const cadence = [
  ["Daily", "Review high-impact role-definition, assignment, scope, and restricted-AU changes plus failed privileged operations."],
  ["Weekly", "Triage new custom roles, tenant-scope assignments, permanent-active paths, and unresolved findings."],
  ["Monthly", "Reconcile definitions, assignments, PIM state, AU membership, service principal read grants, and owner records."],
  ["Quarterly", "Require business-owner attestation and positive, negative, and out-of-scope retesting for privileged custom roles."],
  ["Event driven", "Re-review after Microsoft adds built-in roles, permissions change, an AU becomes restricted, or a support model changes."],
];

export default function CustomRolesScopeOperations() {
  return (
    <>
      <GuideSection
        id="design-workflow"
        eyebrow="Repeatable governance"
        title="Design and review the permission set, scope, and assignment as one control path"
        intro="Do not create a definition first and decide its purpose later. The business task, supported action set, scope, principal, state, tests, and retirement trigger should be approved together."
      >
        <div className="crs-workflow-grid">
          {workflow.map(([number, title, text]) => (
            <article key={number}>
              <span>{number}</span>
              <div><h3>{title}</h3><p>{text}</p></div>
            </article>
          ))}
        </div>

        <GuideCallout tone="success" title="Test the denial boundary">
          <p>Least privilege is proven by what fails as well as what succeeds. Every production design should include one required action, one prohibited action on the same resource, and one otherwise-valid action against an out-of-scope resource.</p>
        </GuideCallout>

        <div className="crs-disposition-grid">
          {dispositions.map((item) => (
            <article key={item.label}><span>{item.label}</span><h3>{item.title}</h3><p>{item.text}</p></article>
          ))}
        </div>

        <div className="crs-change-gates">
          {changeGates.map((gate) => (
            <article key={gate.number}><span>{gate.number}</span><h3>{gate.title}</h3><p>{gate.text}</p></article>
          ))}
        </div>
      </GuideSection>

      <GuideSection
        id="change-examples"
        eyebrow="State-changing examples"
        title="Separate definition creation, assignment, and scope creation into reviewed control points"
        intro="These examples modify tenant state. Use placeholders, test in a nonproduction tenant, preserve a rollback path, and obtain the required approvals before adapting them for production."
      >
        <GuideCallout tone="warning" title="Never create and assign in one unreviewed step">
          <p>Create the role definition, inspect the resulting identifiers and actions, obtain approval, create one assignment at the reviewed scope, run positive and negative tests, then monitor the first use.</p>
        </GuideCallout>

        <GuideCodeBlock
          label="State-changing PowerShell"
          title="STATE-CHANGING — Create one Microsoft Entra custom role definition"
          code={createCustomRolePowerShell}
        />

        <GuideCodeBlock
          label="State-changing PowerShell"
          title="STATE-CHANGING — Assign the custom role at one approved scope"
          code={assignCustomRolePowerShell}
        />

        <GuideCodeBlock
          label="State-changing PowerShell"
          title="STATE-CHANGING — Create a regular or Restricted Management Administrative Unit"
          code={createAdministrativeUnitPowerShell}
        />

        <GuideCodeBlock
          label="State-changing HTTP"
          title="STATE-CHANGING — Define an Enterprise App assignment operator role"
          code={applicationAssignmentRoleHttp}
          language="Microsoft Graph HTTP"
        />

        <div className="crs-postchange-grid">
          <article><span>Inspect</span><h3>Read back the definition and assignment</h3><p>Compare returned IDs, action list, principal, state, and directoryScopeId with the approved design.</p></article>
          <article><span>Prove</span><h3>Run the real task and denial tests</h3><p>Use an in-scope target, an out-of-scope target, and a prohibited operation.</p></article>
          <article><span>Correlate</span><h3>Capture audit and target evidence</h3><p>Record role-management events, target-object changes, ticket, reviewer, and execution timestamp.</p></article>
          <article><span>Rollback</span><h3>Remove the assignment before the definition</h3><p>Validate loss of effective access, then disable or delete a definition only after all dependencies are resolved.</p></article>
        </div>
      </GuideSection>

      <GuideSection
        id="troubleshooting"
        eyebrow="When the boundary does not behave as expected"
        title="Troubleshoot in authorization order—not portal order"
        intro="A visible role assignment is only one layer. Walk from the authorization system through the role action, principal, effective state, scope, target membership, session, and audit evidence."
      >
        <div className="crs-troubleshooting-order" aria-label="Custom role troubleshooting order">
          {troubleshootingOrder.map((item, index) => (
            <span key={item}><strong>{index + 1}</strong>{item}{index < troubleshootingOrder.length - 1 && <b aria-hidden="true">→</b>}</span>
          ))}
        </div>

        <div className="crs-troubleshooting-grid">
          {troubleshooting.map((item) => (
            <article key={item.title}><span>Investigate</span><h3>{item.title}</h3><p>{item.text}</p></article>
          ))}
        </div>

        <GuideCallout tone="info" title="Scope errors often look like permission errors">
          <p>The role can contain the correct action and still fail because the target object is outside the assignment scope, the action is not supported at that scope, the principal has not activated, the session is stale, or the target service uses a different authorization system.</p>
        </GuideCallout>

        <div className="crs-cadence-grid">
          {cadence.map(([label, text]) => <article key={label}><span>{label}</span><p>{text}</p></article>)}
        </div>
      </GuideSection>
    </>
  );
}
