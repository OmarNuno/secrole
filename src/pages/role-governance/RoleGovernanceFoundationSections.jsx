import { GuideCallout, GuideSection } from "../service-principals/KnowledgeGuideLayout";

const governanceFactors = [
  { key: "Principal", value: "Who receives the access", note: "User, role-assignable group, or service principal" },
  { key: "Role", value: "What actions are allowed", note: "Built-in or custom role definition" },
  { key: "Scope", value: "Where the actions apply", note: "Tenant, Administrative Unit, or directory resource" },
  { key: "State", value: "Whether access is usable now", note: "Active, eligible, assigned, or activated" },
  { key: "Duration", value: "How long the access exists", note: "Permanent or time-bound" },
  { key: "Controls", value: "What must happen before use", note: "MFA, approval, justification, device, and review" },
  { key: "Evidence", value: "Why access should remain", note: "Owner, task, activation, audit, and review records" },
];

const roleSystems = [
  {
    name: "Microsoft Entra roles",
    plane: "Directory control plane",
    protects: "Users, groups, applications, service principals, devices, identity policy, and supported Microsoft 365 administration",
    endpoint: "Microsoft Graph",
    clue: "Roles & admins / roleManagement/directory",
  },
  {
    name: "Azure RBAC roles",
    plane: "Azure resource control and data planes",
    protects: "Subscriptions, resource groups, virtual machines, storage, Key Vault, and other Azure resources",
    endpoint: "Azure Resource Manager and resource data endpoints",
    clue: "Access control (IAM) / roleAssignments",
  },
  {
    name: "Microsoft Purview role groups",
    plane: "Compliance and data-governance workloads",
    protects: "eDiscovery, audit, DLP, retention, information protection, insider risk, privacy, and related solutions",
    endpoint: "Purview and workload-specific authorization",
    clue: "Purview portal permissions / role groups",
  },
];

export default function RoleGovernanceFoundationSections() {
  return (
    <>
      <GuideSection
        id="mental-model"
        eyebrow="The 30-second model"
        title="A role name is only one part of the access decision"
        intro="Governance starts when you can explain the principal, role definition, scope, assignment state, duration, controls, and evidence together. A screenshot that only shows the role name is incomplete."
      >
        <div className="rg-equation" aria-label="Role governance equation">
          {governanceFactors.map((factor, index) => (
            <article key={factor.key}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{factor.key}</h3>
              <strong>{factor.value}</strong>
              <p>{factor.note}</p>
            </article>
          ))}
        </div>

        <div className="rg-answer-grid">
          <article className="rg-answer-card good">
            <span>Governed assignment</span>
            <h3>Specific role, narrow scope, limited time</h3>
            <p>The principal has the smallest role that performs the approved task, at the smallest workable scope, with activation and review controls proportionate to the risk.</p>
          </article>
          <article className="rg-answer-card warning">
            <span>Hidden privilege</span>
            <h3>Group membership or eligibility is still access</h3>
            <p>A principal might not appear as a direct active assignee. Group-based assignments, eligible schedules, inherited access, and activated instances must be included in the review.</p>
          </article>
          <article className="rg-answer-card danger">
            <span>Governance failure</span>
            <h3>Broad, permanent, ownerless, and unused</h3>
            <p>Standing tenant-wide privilege with no accountable owner, no evidence of current need, and no expiration or review path should be treated as an access-control defect.</p>
          </article>
        </div>

        <GuideCallout tone="warning" title="Do not govern by display name alone">
          Preserve the principal Object ID, role definition ID, assignment or schedule instance ID, scope ID, assignment source, and dates. Display names can be duplicated or changed; the identifiers let you prove exactly which access record you reviewed.
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="role-systems"
        eyebrow="Authorization boundaries"
        title="Choose the role system before choosing the role"
        intro="Microsoft Entra roles, Azure RBAC roles, and Microsoft Purview role groups solve different authorization problems. A role in one system does not grant access in another."
      >
        <div className="rg-system-grid">
          {roleSystems.map((system) => (
            <article key={system.name}>
              <span>{system.plane}</span>
              <h3>{system.name}</h3>
              <dl>
                <div><dt>Protects</dt><dd>{system.protects}</dd></div>
                <div><dt>Evaluated through</dt><dd>{system.endpoint}</dd></div>
                <div><dt>Where to investigate</dt><dd><code>{system.clue}</code></dd></div>
              </dl>
            </article>
          ))}
        </div>

        <div className="rg-decision-table" role="region" aria-label="Which role system should I investigate">
          <table>
            <thead>
              <tr><th>Question</th><th>Start with</th><th>Common mistake</th></tr>
            </thead>
            <tbody>
              <tr><td>Who can reset a cloud user's password?</td><td>Microsoft Entra role assignment</td><td>Looking at Azure subscription IAM</td></tr>
              <tr><td>Who can restart a virtual machine?</td><td>Azure RBAC assignment</td><td>Looking for an Entra directory role</td></tr>
              <tr><td>Who can search an eDiscovery case?</td><td>Purview role group and case membership</td><td>Assuming Compliance Administrator explains every case permission</td></tr>
              <tr><td>Who can access an enterprise application?</td><td>Application assignment, app role, and consent model</td><td>Confusing enterprise-app assignment with an administrator role</td></tr>
            </tbody>
          </table>
        </div>

        <GuideCallout tone="success" title="Start with the protected resource">
          Identify the action and target resource first. Then choose the authorization system that evaluates that action. This prevents a large percentage of role-assignment troubleshooting from beginning in the wrong portal or API.
        </GuideCallout>
      </GuideSection>
    </>
  );
}
