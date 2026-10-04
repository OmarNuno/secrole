import { GuideCallout, GuideSection } from "../service-principals/KnowledgeGuideLayout";

const timeModels = [
  {
    title: "Direct permanent assignment",
    posture: "Standing access",
    description: "The user remains a direct role-group member until an administrator removes the assignment. Use only when continuous access is operationally justified.",
    evidence: "Member source, owner, role bundle, scope, last use, next review",
  },
  {
    title: "Direct temporary assignment",
    posture: "Automatic expiration",
    description: "Purview can expire most direct user role-group assignments after one day to two years. eDiscovery Manager and eDiscovery Administrator are currently excluded.",
    evidence: "Start date, expiration, assignment audit event, alternate access paths",
  },
  {
    title: "Security group membership",
    posture: "Group-governed access",
    description: "A supported Microsoft Entra security group is assigned to the Purview role group. Group ownership and membership now control who receives the Purview capability.",
    evidence: "Group Object ID, owners, active members, assignment expiration, change logs",
  },
  {
    title: "PIM for Groups",
    posture: "Just-in-time membership",
    description: "Users activate eligible membership in the security group that is assigned to the Purview role group. Direct Purview user assignments do not gain PIM activation behavior.",
    evidence: "Eligibility, activation, approver, group assignment, Purview propagation, expiration",
  },
];

const sensitiveAccess = [
  ["Portal or solution visibility", "Role or mapped Entra role", "The user can open a solution or tab, but might not be able to see protected items or case data."],
  ["List and location visibility", "Data Classification List Viewer", "The user can see items and locations in a list without automatically receiving item-content access."],
  ["File or item content", "Data Classification Content Viewer", "The user can view scanned content and item names that might contain sensitive information. Treat as high-sensitivity access."],
  ["Audit evidence", "View-Only Audit Logs or Audit Logs", "The user can search and possibly manage or export audit data, depending on the exact role bundle."],
  ["Communication content", "Investigation roles", "Communication Compliance or Insider Risk investigation access can expose messages, user activity, alerts, and case evidence."],
  ["Search and export", "Compliance Search and eDiscovery roles", "The user can search, preview, export, hold, or purge content only when the relevant role, case, and boundary layers are satisfied."],
];

const ediscoveryLayers = [
  {
    number: "01",
    title: "Role capability",
    description: "eDiscovery Manager, eDiscovery Administrator, or a custom role group supplies Case Management, Compliance Search, export, hold, and related task permissions.",
  },
  {
    number: "02",
    title: "Case access",
    description: "The investigator must have access to the specific case. Managers generally work with cases they create or are added to; Administrators provide broad recovery and oversight capability.",
  },
  {
    number: "03",
    title: "Searchable-content boundary",
    description: "A search-permissions filter can restrict which mailboxes, SharePoint sites, and OneDrive locations the investigator can search, preview, export, or purge.",
  },
  {
    number: "04",
    title: "Licensing and service state",
    description: "The investigator, custodians, solution tier, billing, Conditional Access, and service-specific requirements must support the requested operation.",
  },
];

const governanceLayers = [
  {
    title: "Tenant role groups",
    code: "Purview Administrators · Data Source Administrators · Data Governance",
    description: "Organization-level capabilities for account administration, data sources, Data Map, and the overall governance program.",
  },
  {
    title: "Unified Catalog roles",
    code: "Catalog-level and governance-domain permissions",
    description: "Governance Domain Creators, catalog readers, domain owners, Data Stewards, Data Product Owners, and other roles govern catalog concepts and domain work.",
  },
  {
    title: "Data Map permissions",
    code: "Domain and collection access",
    description: "Data readers, curators, source administrators, and collection or domain permissions determine which assets and metadata can be viewed or managed.",
  },
  {
    title: "Underlying resource access",
    code: "Azure, Fabric, and source permissions",
    description: "A user might discover or manage metadata because they already have Read or Owner/Write permissions on the underlying data resource.",
  },
];

export default function PurviewGovernanceAccessSections() {
  return (
    <>
      <GuideSection
        id="scope-and-time"
        eyebrow="Where and when access applies"
        title="Combine Administrative Unit scope, temporary assignments, and PIM without assuming universal support"
        intro="Purview supports several ways to reduce standing or tenant-wide access, but each control has a different boundary. Validate the specific solution, role group, principal type, and propagation behavior."
      >
        <div className="pg-time-grid">
          {timeModels.map((model) => (
            <article key={model.title}>
              <span>{model.posture}</span>
              <h3>{model.title}</h3>
              <p>{model.description}</p>
              <dl><dt>Preserve</dt><dd>{model.evidence}</dd></dl>
            </article>
          ))}
        </div>

        <div className="pg-scope-grid">
          <article>
            <span>Administrative Units</span>
            <h3>Supported Purview solutions can restrict visibility and policy administration</h3>
            <p>Current support includes areas such as Data Lifecycle Management, DLP, Communication Compliance, Insider Risk Management, Records Management, sensitivity labeling, audit search, activity exploration, and selected alerts or cases.</p>
          </article>
          <article>
            <span>Restricted administrators</span>
            <h3>Scope applies to supported features—not the entire portal</h3>
            <p>A restricted administrator can work only with supported users, policies, alerts, cases, or sites in assigned Administrative Units. Unsupported features and overlapping Entra roles can remain unscoped.</p>
          </article>
          <article>
            <span>Custom role groups</span>
            <h3>Administrative Unit assignment is available for custom groups</h3>
            <p>That flexibility does not prove the roles inside the custom group honor the intended boundary. Test the exact policy, data, and investigation operations in scope and out of scope.</p>
          </article>
          <article>
            <span>Propagation</span>
            <h3>Activation and resource scope may not be immediate</h3>
            <p>Microsoft notes that PIM-for-Groups activation can take up to two hours to become effective in Purview. SharePoint-site membership queries for Purview Administrative Units can take up to five days to fully populate.</p>
          </article>
        </div>

        <GuideCallout tone="warning" title="Expiration does not prove access is gone">
          <p>Each direct and group assignment is evaluated independently. If a user receives the same capability through another role group, security group, Entra role, case role, or governance-domain path, one expiration can occur while effective access remains.</p>
        </GuideCallout>

        <GuideCallout tone="info" title="Temporary permissions have operational gaps">
          <p>Purview does not send a warning before a temporary assignment expires, and Microsoft does not generate an additional audit event at the moment of expiration. Build your own owner notification, reconciliation, and overdue-removal process.</p>
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="sensitive-content"
        eyebrow="Confidentiality boundary"
        title="Separate portal access, metadata access, content access, and export capability"
        intro="Several Purview experiences intentionally require extra roles before a user can view item names, file content, communications, search results, or investigation evidence. Review these roles as data access—not merely administration."
      >
        <div className="kg-table-wrap pg-sensitive-table-wrap">
          <table className="kg-table pg-sensitive-table">
            <thead><tr><th>Access layer</th><th>Representative permission</th><th>What it means</th></tr></thead>
            <tbody>
              {sensitiveAccess.map(([layer, permission, meaning]) => (
                <tr key={layer}><th>{layer}</th><td>{permission}</td><td>{meaning}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pg-content-model">
          <article>
            <span>List viewer</span>
            <h3>Know that an item exists and where it is located</h3>
            <p>Useful for inventory and classification review, but still sensitive because locations and metadata can reveal business context.</p>
          </article>
          <b aria-hidden="true">≠</b>
          <article className="high">
            <span>Content viewer</span>
            <h3>Read the scanned item and sensitive item name</h3>
            <p>This access can override local item permissions for the Purview experience. Restrict membership, scope it where supported, and review actual use.</p>
          </article>
          <b aria-hidden="true">≠</b>
          <article className="critical">
            <span>Search and export</span>
            <h3>Collect content across locations or investigations</h3>
            <p>Search, preview, export, purge, and case access combine multiple permission layers and can create a large confidentiality and evidence-handling impact.</p>
          </article>
        </div>

        <GuideCallout tone="warning" title="Content roles are independent—not cumulative by name">
          <p>Content Explorer List Viewer and Content Explorer Content Viewer are separate role groups. Assign the exact capability required and do not infer content access from portal visibility or list access.</p>
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="ediscovery"
        eyebrow="Investigations and legal access"
        title="eDiscovery requires role capability, case access, searchable-content scope, and recovery design"
        intro="The role group explains what an investigator can do. The case and compliance boundary explain where they can do it. Licensing and service state determine whether the operation can complete."
      >
        <div className="pg-ediscovery-flow">
          {ediscoveryLayers.map((layer, index) => (
            <span key={layer.number}>
              <article><small>{layer.number}</small><h3>{layer.title}</h3><p>{layer.description}</p></article>
              {index < ediscoveryLayers.length - 1 && <b aria-hidden="true">→</b>}
            </span>
          ))}
        </div>

        <div className="pg-ediscovery-grid">
          <article>
            <span>eDiscovery Manager</span>
            <h3>Case and search operations within assigned access</h3>
            <p>Managers can create and manage cases, holds, searches, previews, exports, and case data according to their roles, but do not automatically receive every case in the organization.</p>
          </article>
          <article>
            <span>eDiscovery Administrator</span>
            <h3>Organization-wide oversight and recovery capability</h3>
            <p>Administrators can access the case list, oversee all cases, configure settings, and add themselves to a case when recovery is required. Limit this highly sensitive role.</p>
          </article>
          <article>
            <span>Compliance boundary</span>
            <h3>Search-permissions filters restrict content locations</h3>
            <p>Use attributes and filters to limit searchable mailboxes and sites. Microsoft recommends separating the group used for the filter from the group used to grant eDiscovery roles.</p>
          </article>
        </div>

        <GuideCallout tone="warning" title="Changing a case role group can remove it from every case">
          <p>If you add or remove a role from a role group that is a member of eDiscovery cases, Microsoft automatically removes that role group from those cases. Inventory case dependencies, approve the new role bundle, make the change, and re-add the role group where required.</p>
        </GuideCallout>

        <GuideCallout tone="warning" title="Empty role groups no longer activate compliance-boundary filters">
          <p>A role group associated with a search-permissions filter must contain at least one role. Keep boundary and capability groups separate so a permission change does not silently alter both searchable locations and investigator tasks.</p>
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="data-governance"
        eyebrow="Data Map and Unified Catalog"
        title="Data governance combines tenant roles, catalog roles, domain or collection access, and source permissions"
        intro="Opening Unified Catalog does not prove that a user can see or manage every asset. The access path crosses Purview governance roles, Data Map scope, and the underlying data platform."
      >
        <div className="pg-governance-grid">
          {governanceLayers.map((layer) => (
            <article key={layer.title}>
              <span>{layer.title}</span>
              <code>{layer.code}</code>
              <p>{layer.description}</p>
            </article>
          ))}
        </div>

        <div className="pg-governance-flow">
          <span>Tenant role group</span><b aria-hidden="true">→</b>
          <span>Catalog or domain role</span><b aria-hidden="true">→</b>
          <span>Data Map domain or collection</span><b aria-hidden="true">→</b>
          <span>Underlying resource access</span><b aria-hidden="true">→</b>
          <span>Visible or manageable asset</span>
        </div>

        <div className="pg-governance-notes">
          <article>
            <span>Governance ownership</span>
            <h3>Assign at least two accountable domain owners</h3>
            <p>Governance Domain Owners delegate domain roles and control domain-level resources. Backup ownership is part of the recovery model, not merely administrative convenience.</p>
          </article>
          <article>
            <span>Catalog discovery</span>
            <h3>Search results follow Data Map and resource visibility</h3>
            <p>A user can search Unified Catalog without one universal catalog role, but returned assets depend on domain or collection access and, for some sources, existing Azure or Fabric read permissions.</p>
          </article>
          <article>
            <span>Account model</span>
            <h3>Free, enterprise, new, and classic experiences differ</h3>
            <p>Record the Purview account type and whether the tenant is using Unified Catalog, the classic catalog, or both during transition. Do not apply one permission model to every experience.</p>
          </article>
        </div>

        <GuideCallout tone="warning" title="Underlying data access can expand catalog visibility">
          <p>Microsoft notes that users with existing Read permissions on Azure or Microsoft Fabric resources might see assets in Unified Catalog that were not expected from catalog roles alone. Reconcile Purview permissions with the source platform.</p>
        </GuideCallout>
      </GuideSection>
    </>
  );
}
