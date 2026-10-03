import { GuideCallout, GuideSection } from "../service-principals/KnowledgeGuideLayout";

const equationParts = [
  {
    label: "Actions",
    title: "What can be done?",
    text: "The allowedResourceActions in the role definition determine the supported directory-management operations.",
  },
  {
    label: "Scope",
    title: "Where can it be done?",
    text: "The role assignment limits those actions to the tenant, an Administrative Unit, or one supported Microsoft Entra resource.",
  },
  {
    label: "Principal",
    title: "Who receives access?",
    text: "Resolve the user, role-assignable group, service principal, ownership path, and every indirect assignment source.",
  },
  {
    label: "State and time",
    title: "When is access usable?",
    text: "Active, eligible, activated, permanent, and time-bound states determine when the principal can exercise the role.",
  },
  {
    label: "Evidence",
    title: "Why should it remain?",
    text: "Business purpose, task evidence, audit history, test results, ownership, and review decisions make the boundary defensible.",
  },
];

const decisionSteps = [
  {
    number: "01",
    title: "Start with the business task",
    text: "Describe the exact operation, target object type, support team, frequency, and failure impact before selecting permissions.",
  },
  {
    number: "02",
    title: "Find the least-privileged built-in role",
    text: "Use the Role Library and Microsoft permission reference before inventing a tenant-specific definition.",
  },
  {
    number: "03",
    title: "Narrow the assignment scope",
    text: "Test tenant, Administrative Unit, or supported resource scope before deciding the built-in role is too broad.",
  },
  {
    number: "04",
    title: "Create only the missing permission set",
    text: "Use a custom role when supported built-in roles still grant materially more capability than the approved task requires.",
  },
  {
    number: "05",
    title: "Prove allowed and denied outcomes",
    text: "The required operation must succeed, and prohibited operations must fail at both in-scope and out-of-scope targets.",
  },
];

const roleSystems = [
  {
    eyebrow: "Directory administration",
    title: "Microsoft Entra custom role",
    permission: "microsoft.directory/...",
    scope: "Tenant, Administrative Unit, or supported Microsoft Entra resource",
    evidence: "unifiedRoleDefinition and unifiedRoleAssignment records",
  },
  {
    eyebrow: "Azure resources",
    title: "Azure custom RBAC role",
    permission: "Microsoft.Compute/... or dataActions",
    scope: "Management group, subscription, resource group, or Azure resource",
    evidence: "Azure Resource Manager role definitions and assignments",
  },
  {
    eyebrow: "Application runtime",
    title: "Application app role",
    permission: "Application-defined role value",
    scope: "The resource application's authorization model",
    evidence: "appRole definitions, assignments, and token roles claims",
  },
  {
    eyebrow: "Compliance services",
    title: "Microsoft Purview role group",
    permission: "Purview solution and compliance capabilities",
    scope: "Purview role group, solution, and supported service boundaries",
    evidence: "Purview role group membership and solution audit data",
  },
];

const anatomyFields = [
  {
    field: "id",
    label: "Role definition Object ID",
    meaning: "Tenant-local identifier used when creating the role assignment.",
    mistake: "Using the templateId when Graph expects the role definition id.",
  },
  {
    field: "templateId",
    label: "Template identifier",
    meaning: "A GUID that can identify related definitions created from a common template.",
    mistake: "Treating the template identifier as the active assignment target.",
  },
  {
    field: "displayName",
    label: "Role name",
    meaning: "Human-readable name that should describe the approved task, not a person or project nickname.",
    mistake: "Relying on the name instead of inspecting the actual actions.",
  },
  {
    field: "rolePermissions",
    label: "Permission collection",
    meaning: "Contains allowedResourceActions that define what the role can do.",
    mistake: "Assuming every built-in role permission is available for custom use.",
  },
  {
    field: "isEnabled",
    label: "Definition state",
    meaning: "Indicates whether the custom role definition is enabled.",
    mistake: "Leaving stale assignments unresolved when the definition is disabled.",
  },
  {
    field: "directoryScopeId",
    label: "Assignment scope",
    meaning: "Stored on the assignment—not inside the reusable role definition—and determines where the actions apply.",
    mistake: "Reviewing the role definition without reviewing every assignment scope.",
  },
];

export default function CustomRolesScopeFoundationSections() {
  return (
    <>
      <GuideSection
        id="least-privilege"
        eyebrow="The 30-second answer"
        title="Reduce privilege twice: narrow the actions and narrow where they apply"
        intro="A custom role is not automatically least privilege. Effective access is the combined result of the role's actions, the assignment scope, the principal and inheritance path, the access state and duration, and the evidence that supports continued need."
      >
        <div className="crs-equation" aria-label="Custom role least privilege equation">
          {equationParts.map((part, index) => (
            <div className="crs-equation-part" key={part.label}>
              <article>
                <span>{part.label}</span>
                <strong>{part.title}</strong>
                <p>{part.text}</p>
              </article>
              {index < equationParts.length - 1 && <b aria-hidden="true">×</b>}
            </div>
          ))}
        </div>

        <GuideCallout tone="success" title="The operating principle">
          <p><strong>Reduce the action set first, reduce the assignment scope second, then govern activation and inheritance.</strong> PIM, approvals, and monitoring do not make an unnecessarily broad role definition least-privileged.</p>
        </GuideCallout>

        <div className="crs-decision-flow">
          {decisionSteps.map((step) => (
            <article key={step.number}>
              <span>{step.number}</span>
              <div><h3>{step.title}</h3><p>{step.text}</p></div>
            </article>
          ))}
        </div>

        <GuideCallout tone="warning" title="Do not design from a role name">
          <p>Two custom roles with similar names can have very different permissions. One definition can also be assigned many times at different scopes. Always review the exact <code>allowedResourceActions</code> and every active or eligible assignment.</p>
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="role-systems"
        eyebrow="Authorization boundary"
        title="Choose the correct role system before designing the permission"
        intro="The phrase custom role is overloaded. Microsoft Entra directory roles, Azure RBAC roles, application app roles, and Microsoft Purview role groups protect different resources and use different permission languages."
      >
        <div className="crs-system-grid">
          {roleSystems.map((system) => (
            <article key={system.title}>
              <span>{system.eyebrow}</span>
              <h3>{system.title}</h3>
              <dl>
                <div><dt>Permission language</dt><dd><code>{system.permission}</code></dd></div>
                <div><dt>Typical scope</dt><dd>{system.scope}</dd></div>
                <div><dt>Primary evidence</dt><dd>{system.evidence}</dd></div>
              </dl>
            </article>
          ))}
        </div>

        <div className="kg-table-wrap crs-system-table-wrap">
          <table className="kg-table crs-system-table">
            <thead><tr><th>Question</th><th>Microsoft Entra custom role</th><th>Azure custom RBAC role</th><th>Application app role</th></tr></thead>
            <tbody>
              <tr><th>What is protected?</th><td>Directory and Microsoft identity resources</td><td>Azure management and data-plane resources</td><td>Features inside one application or API</td></tr>
              <tr><th>Where is it evaluated?</th><td>Microsoft Entra and Microsoft Graph authorization</td><td>Azure Resource Manager and target data plane</td><td>The application or API receiving the token</td></tr>
              <tr><th>What is the common mistake?</th><td>Expecting directory permission to grant Azure resource access</td><td>Expecting Azure Owner to grant Entra administrator access</td><td>Confusing runtime app roles with administrator delegation over the app object</td></tr>
            </tbody>
          </table>
        </div>

        <GuideCallout tone="info" title="Start with the protected resource">
          <p>Ask which service authorizes the requested operation. That answer determines which portal, API, role definition, assignment record, scope, and audit log should be investigated.</p>
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="role-anatomy"
        eyebrow="Definition versus assignment"
        title="Understand the anatomy of a Microsoft Entra custom role"
        intro="A custom role definition is a reusable collection of supported permissions. The role assignment connects that definition to a principal at a specific directory scope."
      >
        <div className="crs-anatomy-model">
          <article>
            <span>Reusable definition</span>
            <h3>unifiedRoleDefinition</h3>
            <code>displayName</code>
            <code>description</code>
            <code>id</code>
            <code>templateId</code>
            <code>isEnabled</code>
            <code>rolePermissions.allowedResourceActions</code>
          </article>
          <b aria-hidden="true">+</b>
          <article>
            <span>Access recipient</span>
            <h3>Security principal</h3>
            <code>user</code>
            <code>role-assignable group</code>
            <code>service principal</code>
          </article>
          <b aria-hidden="true">+</b>
          <article>
            <span>Effective boundary</span>
            <h3>Role assignment</h3>
            <code>principalId</code>
            <code>roleDefinitionId</code>
            <code>directoryScopeId</code>
            <code>active or eligible state</code>
            <code>start and end time</code>
          </article>
        </div>

        <div className="kg-table-wrap">
          <table className="kg-table crs-anatomy-table">
            <thead><tr><th>Field or concept</th><th>What it means</th><th>Review failure to avoid</th></tr></thead>
            <tbody>
              {anatomyFields.map((item) => (
                <tr key={item.field}>
                  <th><code>{item.field}</code><span>{item.label}</span></th>
                  <td>{item.meaning}</td>
                  <td>{item.mistake}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="crs-limit-grid">
          <article><span>Current tenant limit</span><strong>100 custom role definitions</strong><p>Design reusable task-based roles and retire stale definitions instead of creating one role per person or ticket.</p></article>
          <article><span>Assignment limit</span><strong>150 custom-role assignments per principal</strong><p>Resolve direct, group-based, active, and eligible paths before adding another assignment.</p></article>
          <article><span>License boundary</span><strong>Microsoft Entra ID P1 or P2</strong><p>Each user assigned a custom role requires the appropriate license; PIM and governance features can add further requirements.</p></article>
        </div>
      </GuideSection>
    </>
  );
}
