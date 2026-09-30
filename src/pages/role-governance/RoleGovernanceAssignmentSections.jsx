import { GuideCallout, GuideSection } from "../service-principals/KnowledgeGuideLayout";

const assignmentStates = [
  {
    label: "Direct active",
    posture: "Usable now",
    description: "The principal is assigned the role directly and does not need to activate it. Review duration, scope, owner, and evidence of ongoing need.",
    evidence: "unifiedRoleAssignment or active schedule instance",
  },
  {
    label: "Group active",
    posture: "Usable through membership",
    description: "The role is assigned to a role-assignable group. Group membership and ownership now control who receives the role.",
    evidence: "memberType = Group plus group membership",
  },
  {
    label: "Eligible",
    posture: "Not usable until activation",
    description: "The principal can activate the role during the eligibility window after satisfying configured PIM controls.",
    evidence: "unifiedRoleEligibilityScheduleInstance",
  },
  {
    label: "Activated",
    posture: "Temporarily usable now",
    description: "An eligible assignment has been activated. Confirm the start, end, approval, justification, and the task that required elevation.",
    evidence: "assignmentType = Activated",
  },
  {
    label: "Time-bound active",
    posture: "Usable until expiration",
    description: "The assignment is active without activation but has explicit start and end dates. It still creates standing access during that window.",
    evidence: "active schedule with endDateTime",
  },
  {
    label: "Permanent eligible",
    posture: "Activation remains available",
    description: "The principal can continue activating indefinitely. Review eligibility as access that must still have an owner, business purpose, and recurring review.",
    evidence: "eligible schedule without an end date",
  },
];

const graphRecords = [
  ["unifiedRoleDefinition", "The built-in or custom permission set", "What can this role do?"],
  ["unifiedRoleAssignment", "A direct role definition assignment at a scope", "Who has a non-PIM assignment?"],
  ["unifiedRoleAssignmentScheduleInstance", "The effective view of active assignments", "Who can use a role now, and was it assigned or activated?"],
  ["unifiedRoleEligibilityScheduleInstance", "The effective view of role eligibility", "Who can activate a role, during which dates, and through what source?"],
  ["schedule requests and schedules", "The requested and governing PIM operations", "How was the assignment or activation created, extended, renewed, or removed?"],
];

const scopeCards = [
  {
    title: "Tenant scope",
    code: "directoryScopeId = /",
    description: "The role applies across supported resources in the organization. Tenant-wide should be deliberate, especially for privileged or data-sensitive roles.",
  },
  {
    title: "Administrative Unit scope",
    code: "directoryScopeId = /administrativeUnits/{id}",
    description: "The role applies to supported users, groups, or devices inside an Administrative Unit. The exact role and object type determine what can be managed.",
  },
  {
    title: "Directory resource scope",
    code: "directoryScopeId = /{resource}/{id}",
    description: "Supported roles can be limited to a specific application registration, enterprise application, or group instead of the entire tenant.",
  },
  {
    title: "App-specific scope",
    code: "appScopeId = /...",
    description: "Some providers define scopes understood by the application itself, such as an entitlement-management catalog. Investigate the provider-specific meaning.",
  },
];

export default function RoleGovernanceAssignmentSections() {
  return (
    <>
      <GuideSection
        id="assignment-model"
        eyebrow="Effective access"
        title="Inventory direct, group-based, active, eligible, and activated access"
        intro="Assignment type, duration, and inheritance answer different questions. A complete review needs both the currently active view and the current eligibility view."
      >
        <div className="rg-state-grid">
          {assignmentStates.map((state) => (
            <article key={state.label}>
              <span>{state.posture}</span>
              <h3>{state.label}</h3>
              <p>{state.description}</p>
              <code>{state.evidence}</code>
            </article>
          ))}
        </div>

        <div className="rg-record-map">
          <header>
            <span>Microsoft Graph record map</span>
            <h3>Do not use one endpoint to answer every role question</h3>
          </header>
          <div>
            {graphRecords.map(([record, meaning, question]) => (
              <article key={record}>
                <code>{record}</code>
                <p>{meaning}</p>
                <strong>{question}</strong>
              </article>
            ))}
          </div>
        </div>

        <GuideCallout tone="warning" title="Eligibility is dormant privilege, not no privilege">
          An eligible assignment is not usable until activation, but it still creates a path to privileged access. Govern the eligibility window, role settings, approvers, activation evidence, and recurring need—not only the moments when the role is active.
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="scope"
        eyebrow="Where access applies"
        title="The same role can have radically different risk at a different scope"
        intro="Microsoft Entra role assignments combine a principal, role definition, and scope. Scope reduction is often the safest way to preserve a business function while shrinking blast radius."
      >
        <div className="rg-scope-grid">
          {scopeCards.map((scope) => (
            <article key={scope.title}>
              <h3>{scope.title}</h3>
              <code>{scope.code}</code>
              <p>{scope.description}</p>
            </article>
          ))}
        </div>

        <div className="rg-scope-comparison">
          <article>
            <span>Container scope</span>
            <h3>Tenant or Administrative Unit</h3>
            <p>Grants supported management permissions over objects contained in the scope. Administrative Units can contain users, groups, or devices and cannot be nested.</p>
          </article>
          <article>
            <span>Resource scope</span>
            <h3>One group, enterprise app, or app registration</h3>
            <p>Grants supported management permissions over the specific directory resource itself. Scope does not automatically extend to members of a scoped group.</p>
          </article>
        </div>

        <div className="rg-au-warning">
          <strong>Administrative Unit limitation</strong>
          <p>Adding a group to an Administrative Unit brings the group object into scope—not every user or device inside that group. To manage an individual member's user properties or authentication methods, that user must also be directly in the Administrative Unit.</p>
        </div>

        <GuideCallout tone="warning" title="Administrative Units are management scopes, not general visibility boundaries">
          They constrain supported administrator actions. They do not prevent ordinary directory browsing outside the Administrative Unit, and not every Microsoft 365 or organization-level feature honors Administrative Unit scope.
        </GuideCallout>
      </GuideSection>
    </>
  );
}
