import { GuideCallout, GuideSection } from "../service-principals/KnowledgeGuideLayout";

const accessFactors = [
  { key: "Identity", value: "Who receives access", note: "User, security group, service principal, or governance-domain participant" },
  { key: "Permission plane", value: "Which system authorizes", note: "Purview role group, Microsoft Entra role, case, Data Map, catalog, or resource" },
  { key: "Capability", value: "What action is allowed", note: "Configure, investigate, search, export, view content, curate, approve, or delegate" },
  { key: "Scope", value: "Which users, sites, assets, or cases", note: "Tenant, Administrative Unit, compliance boundary, case, domain, collection, or item" },
  { key: "State & time", value: "When access is usable", note: "Direct, group-based, PIM-activated, temporary, permanent, or expired" },
  { key: "Content sensitivity", value: "What evidence can be exposed", note: "Metadata, alerts, communications, files, prompts, search results, or investigation data" },
  { key: "Evidence", value: "Why access should remain", note: "Owner, case, ticket, assignment source, recent use, review, and removal proof" },
];

const permissionPlanes = [
  {
    title: "Microsoft Purview role groups",
    label: "Portal RBAC",
    description: "Roles define tasks; role groups bundle roles and members into solution job functions. Built-in and custom role groups are managed under Settings > Roles and scopes.",
    evidence: "Role group, included roles, direct or group members, expiration, Administrative Units, audit history",
  },
  {
    title: "Microsoft Entra roles",
    label: "Directory roles",
    description: "Compliance Administrator, Compliance Data Administrator, Global Reader, Security roles, and other Entra roles can map to Purview capabilities and might override scoped Purview access.",
    evidence: "Active and eligible Entra assignments, assignment scope, member source, PIM state, role mapping",
  },
  {
    title: "Solution and case access",
    label: "Workload boundary",
    description: "eDiscovery cases, communication and insider-risk cases, policy ownership, and solution-specific settings can add another access decision after role-group membership.",
    evidence: "Case member, case role group, policy owner, investigation assignment, solution configuration",
  },
  {
    title: "Content and search boundaries",
    label: "Data exposure",
    description: "Content-viewer roles, list-viewer roles, compliance search permissions, and search-permissions filters decide what sensitive content or locations can be seen.",
    evidence: "Viewer role, search role, filter, attribute scope, export capability, target location",
  },
  {
    title: "Data governance permissions",
    label: "Catalog and Data Map",
    description: "Tenant role groups, Unified Catalog roles, governance-domain roles, Data Map domain or collection access, and underlying resource permissions combine to expose assets and metadata.",
    evidence: "Account type, tenant role group, catalog role, domain role, collection role, resource read or owner access",
  },
];

const roleGroupModel = [
  ["Member", "A user or supported security group receives the role group. Membership source and expiration remain separate evidence."],
  ["Role group", "The job-function container that combines roles, members, scope, and optional temporary assignment behavior."],
  ["Role", "One task capability such as Case Management, Audit Logs, DLP Compliance Management, or Data Classification Content Viewer."],
  ["Solution result", "The portal, policy, case, content, or governance action that becomes available after every required layer is satisfied."],
];

export default function PurviewGovernanceFoundationSections() {
  return (
    <>
      <GuideSection
        id="mental-model"
        eyebrow="The 30-second model"
        title="Purview access is a chain of permission decisions—not one role assignment"
        intro="A role-group screenshot does not prove effective access. Explain the identity, authorization plane, capability, scope, time state, content sensitivity, and evidence together."
      >
        <div className="pg-equation" aria-label="Microsoft Purview governance equation">
          {accessFactors.map((factor, index) => (
            <article key={factor.key}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{factor.key}</h3>
              <strong>{factor.value}</strong>
              <p>{factor.note}</p>
            </article>
          ))}
        </div>

        <div className="pg-answer-grid">
          <article className="good">
            <span>Governed access</span>
            <h3>Specific job function, bounded data, accountable owner</h3>
            <p>The assignment grants only the roles needed for the approved task, at the narrowest supported scope, for the shortest workable duration, with case and content exposure reviewed separately.</p>
          </article>
          <article className="warning">
            <span>Hidden expansion</span>
            <h3>An Entra role can erase a Purview scope boundary</h3>
            <p>When an overlapping Microsoft Entra role and a scoped Purview role-group assignment both exist, Microsoft documents that the Entra-derived permission takes precedence and is unscoped.</p>
          </article>
          <article className="danger">
            <span>Governance failure</span>
            <h3>Broad content access with no investigation boundary</h3>
            <p>Tenant-wide search, export, file-content viewing, communication review, or case oversight without clear ownership and evidence is a sensitive-data access defect even when the permission is read-only.</p>
          </article>
        </div>

        <GuideCallout tone="warning" title="Read-only does not mean low risk">
          <p>Purview read access can expose email, files, chats, prompts, alerts, policy matches, audit evidence, and investigation content across the organization. Rate the data sensitivity and searchable population—not only whether the role can modify settings.</p>
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="permission-planes"
        eyebrow="Authorization map"
        title="Choose the permission plane before choosing the role"
        intro="Microsoft Purview spans compliance, data security, eDiscovery, and data governance. Each area has a different combination of role groups, Entra roles, case access, scoping, and underlying data permissions."
      >
        <div className="pg-plane-grid">
          {permissionPlanes.map((plane) => (
            <article key={plane.title}>
              <span>{plane.label}</span>
              <h3>{plane.title}</h3>
              <p>{plane.description}</p>
              <dl><dt>Preserve</dt><dd>{plane.evidence}</dd></dl>
            </article>
          ))}
        </div>

        <div className="pg-decision-table kg-table-wrap">
          <table className="kg-table">
            <thead><tr><th>Administrator question</th><th>Start with</th><th>Do not assume</th></tr></thead>
            <tbody>
              <tr><th>Who can edit a DLP policy?</th><td>Purview role group, included DLP roles, member scope, and policy scope</td><td>Compliance Administrator is the only path</td></tr>
              <tr><th>Who can export eDiscovery results?</th><td>eDiscovery role, role group, case membership, and searchable-content boundary</td><td>Case access alone grants export</td></tr>
              <tr><th>Who can read scanned file content?</th><td>Content Explorer Content Viewer or a custom group containing the content-viewer role</td><td>Portal access or list-viewer access reveals content</td></tr>
              <tr><th>Who can curate a data product?</th><td>Unified Catalog and governance-domain roles plus Data Map and resource access</td><td>A compliance role group grants catalog ownership</td></tr>
              <tr><th>Who can manage Exchange mail-flow rules?</th><td>Exchange Online RBAC and the Exchange admin center</td><td>Purview DLP permissions automatically cover transport rules</td></tr>
            </tbody>
          </table>
        </div>

        <GuideCallout tone="success" title="Start with the protected data and requested action">
          <p>Identify whether the task changes a Purview configuration, investigates a case, reads sensitive content, searches a content location, administers a catalog, or operates another Microsoft 365 service. Then select the authorization system that actually evaluates that action.</p>
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="role-groups"
        eyebrow="Portal RBAC"
        title="A role group combines members and task roles—but it is not always the final boundary"
        intro="Microsoft Purview role groups are job-function containers. Effective access still depends on the member source, assignment duration, Administrative Unit scope, overlapping Entra roles, and solution-specific access."
      >
        <div className="pg-role-model">
          {roleGroupModel.map(([title, description], index) => (
            <span key={title}>
              <article><small>{String(index + 1).padStart(2, "0")}</small><h3>{title}</h3><p>{description}</p></article>
              {index < roleGroupModel.length - 1 && <b aria-hidden="true">→</b>}
            </span>
          ))}
        </div>

        <div className="pg-role-group-grid">
          <article>
            <span>Built-in role groups</span>
            <h3>Start with the supported job function</h3>
            <p>Use the built-in group when its role bundle matches the task. Examples include Audit Reader, Communication Compliance Investigators, Content Explorer viewers, eDiscovery Manager, Records Management, and solution-specific administrator or analyst groups.</p>
          </article>
          <article>
            <span>Custom role groups</span>
            <h3>Create only when the built-in bundle is materially wrong</h3>
            <p>Document the exact roles, business function, scope, member model, owner, review date, and case dependencies. A custom group can also receive Administrative Unit assignments, but its name cannot be changed after creation.</p>
          </article>
          <article>
            <span>Role Management</span>
            <h3>Permission delegation is itself privileged access</h3>
            <p>The Role Management role can view, create, and modify role groups. Review members of Organization Management and Purview Administrators because those groups receive Role Management by default.</p>
          </article>
        </div>

        <div className="pg-precedence">
          <div>
            <span>Scoped Purview assignment</span>
            <strong>Role group + Administrative Unit</strong>
            <p>Designed to limit supported Purview capabilities to a defined population or policy boundary.</p>
          </div>
          <b aria-hidden="true">+</b>
          <div>
            <span>Overlapping Microsoft Entra role</span>
            <strong>Compliance Administrator, Global Reader, or another mapped role</strong>
            <p>Microsoft documents that the Entra-derived permission takes precedence at runtime.</p>
          </div>
          <b aria-hidden="true">=</b>
          <div className="result">
            <span>Effective outcome</span>
            <strong>Unscoped overlapping access</strong>
            <p>The Administrative Unit does not restrict the capabilities supplied by the overlapping Entra role.</p>
          </div>
        </div>

        <GuideCallout tone="warning" title="Review Entra assignments before approving a scoped Purview design">
          <p>Inventory direct, group-based, active, and eligible Microsoft Entra roles for the same principal. A scoped Purview assignment is not a reliable boundary when an overlapping Entra role remains available through another path.</p>
        </GuideCallout>
      </GuideSection>
    </>
  );
}
