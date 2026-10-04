import { GuideCallout, GuideCodeBlock, GuideSection } from "../service-principals/KnowledgeGuideLayout";
import {
  administrativeUnitInventoryPowerShell,
  complianceBoundaryInventoryPowerShell,
  graphCollectionHelper,
  purviewFindingsPowerShell,
  purviewRoleGroupInventoryPowerShell,
} from "./purviewGovernanceCode";

const outputs = [
  {
    label: "Role groups",
    title: "Purview_RoleGroups_<timestamp>.csv",
    text: "One row per role group with included roles, resolved members, owner metadata, and summary counts.",
  },
  {
    label: "Members",
    title: "Purview_RoleGroupMembers_<timestamp>.csv",
    text: "One row per direct role-group member with identity, SMTP address, and recipient type for assignment-source review.",
  },
  {
    label: "Roles",
    title: "Purview_RoleGroupRoles_<timestamp>.csv",
    text: "One row per management-role assignment so custom and built-in role bundles can be compared accurately.",
  },
  {
    label: "Boundaries",
    title: "Purview_ComplianceSecurityFilters_<timestamp>.csv",
    text: "Search-permissions filters, assigned users or role groups, actions, and mailbox or site filter expressions.",
  },
  {
    label: "Administrative Units",
    title: "Purview_AdministrativeUnits_<timestamp>.csv",
    text: "Microsoft Entra Administrative Unit properties and direct user, group, and device counts for Purview scope reconciliation.",
  },
  {
    label: "Findings",
    title: "Purview_Permission_Findings_<timestamp>.csv",
    text: "Prioritized conditions involving delegation, sensitive-content roles, empty groups, broad membership, and filter assignments.",
  },
];

const findingCards = [
  ["ROLE_MANAGEMENT_EXPOSURE", "Critical", "A role group grants the ability to create or modify Purview role groups and therefore delegate compliance or governance access."],
  ["UNSCOPED_ENTRA_OVERRIDE", "High", "An overlapping Microsoft Entra role can bypass the intended Administrative Unit restriction."],
  ["SENSITIVE_CONTENT_ACCESS", "High", "The assignment exposes item content, communications, search results, prompts, investigation evidence, or export capability."],
  ["EDISCOVERY_CASE_DEPENDENCY", "High", "The role group participates in cases, so changing its roles can remove it from those cases."],
  ["ROLE_GROUP_WITH_NO_ROLES", "High", "The group cannot supply a job function and will not activate a compliance-boundary filter."],
  ["LARGE_ROLE_GROUP_MEMBERSHIP", "Review", "Membership may exceed a coherent job-function or investigation boundary."],
  ["TEMPORARY_ACCESS_WITHOUT_OWNER", "Review", "Expiration exists, but no owner or renewal decision is documented before access ends."],
  ["DATA_GOVERNANCE_PATH_INCOMPLETE", "Review", "Catalog, Data Map, domain, collection, or source-resource access is missing from the evidence package."],
];

const evidenceRows = [
  ["Identity", "Display name, Object ID, principal type, account status, assignment source, group owners, and employment or service status"],
  ["Purview role group", "Name, identity, built-in or custom purpose, included roles, direct members, group members, expiration, and owner"],
  ["Microsoft Entra role", "Active and eligible role, assignment source, PIM state, scope, dates, and mapped Purview capability"],
  ["Scope", "Administrative Units, restricted or unrestricted status, supported solution, policy scope, SharePoint site query, and propagation state"],
  ["Case and investigation", "Case ID, case members, role groups, investigator role, case owner, compliance boundary, and recovery administrator"],
  ["Sensitive content", "List viewer, content viewer, audit, search, preview, export, purge, message-content, prompt, and response capability"],
  ["Data governance", "Account type, tenant role group, catalog role, governance-domain role, Data Map domain or collection, and source access"],
  ["Time and evidence", "Start, expiration, activation, approval, ticket, recent use, audit event, reviewer, disposition, and next review date"],
];

export default function PurviewGovernanceEvidenceSections() {
  return (
    <GuideSection
      id="inventory"
      eyebrow="Read-only evidence first"
      title="Inventory role groups, roles, members, boundaries, and Administrative Units before changing access"
      intro="No single Purview endpoint resolves every permission layer. Start with Security & Compliance PowerShell for role groups and search filters, then reconcile Microsoft Entra roles, Administrative Units, cases, content roles, and data-governance permissions."
    >
      <GuideCallout tone="info" title="Run from a controlled administrative session">
        <p>The examples are read-only, but they can return sensitive identity and governance information. Confirm ExchangeOnlineManagement and Microsoft Graph module versions, tenant size, sovereign-cloud endpoints, export location, and least-privileged read permissions before running them in production.</p>
      </GuideCallout>

      <div className="pg-code-stack">
        <GuideCodeBlock
          label="Role-group inventory"
          title="Export Purview role groups, members, and included roles"
          code={purviewRoleGroupInventoryPowerShell}
        />
        <GuideCodeBlock
          label="Compliance boundaries"
          title="Export eDiscovery search-permissions filters"
          code={complianceBoundaryInventoryPowerShell}
        />
        <GuideCodeBlock
          label="PowerShell helper"
          title="Follow Microsoft Graph pagination safely"
          code={graphCollectionHelper}
        />
        <GuideCodeBlock
          label="Scope inventory"
          title="Export Administrative Units and direct members"
          code={administrativeUnitInventoryPowerShell}
        />
        <GuideCodeBlock
          label="Control findings"
          title="Generate prioritized Purview permission findings"
          code={purviewFindingsPowerShell}
        />
      </div>

      <div className="pg-output-grid">
        {outputs.map((output) => (
          <article key={output.title}>
            <span>{output.label}</span>
            <h3>{output.title}</h3>
            <p>{output.text}</p>
          </article>
        ))}
      </div>

      <GuideCallout tone="warning" title="The scripts do not resolve every portal-only relationship">
        <p>Reconcile the exports with Purview Settings &gt; Roles and scopes, My Permissions, solution policy ownership, eDiscovery case membership, temporary expiration, PIM group activation, Unified Catalog roles, and underlying resource permissions. Portal and workload evidence remains required.</p>
      </GuideCallout>

      <div className="pg-finding-grid">
        {findingCards.map(([code, severity, text]) => (
          <article key={code}>
            <span className={`severity ${severity.toLowerCase()}`}>{severity}</span>
            <code>{code}</code>
            <p>{text}</p>
          </article>
        ))}
      </div>

      <div className="kg-table-wrap pg-evidence-table-wrap">
        <table className="kg-table pg-evidence-table">
          <thead><tr><th>Evidence domain</th><th>Minimum evidence to preserve</th></tr></thead>
          <tbody>
            {evidenceRows.map(([domain, evidence]) => (
              <tr key={domain}><th>{domain}</th><td>{evidence}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <GuideCallout tone="success" title="A defensible review explains effective access and blocked access">
        <p>Record one approved operation that succeeds, one sensitive operation the principal should not perform, and one out-of-scope user, site, case, or asset that remains unavailable. Preserve the corresponding audit and target-solution evidence.</p>
      </GuideCallout>
    </GuideSection>
  );
}
