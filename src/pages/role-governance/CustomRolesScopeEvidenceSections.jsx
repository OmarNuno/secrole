import { GuideCallout, GuideCodeBlock, GuideSection } from "../service-principals/KnowledgeGuideLayout";
import {
  administrativeUnitInventory,
  customRoleAssignmentInventory,
  customRoleDefinitionInventory,
  customRoleFindings,
  graphCollectionHelper,
} from "./customRolesScopeInventoryCode";

const outputs = [
  {
    label: "Definitions",
    title: "Entra_Custom_Role_Definitions_<timestamp>.csv",
    text: "Every custom role definition, its identifiers, enabled state, permission count, and complete allowedResourceActions list.",
  },
  {
    label: "Assignments",
    title: "Entra_Custom_Role_Assignments_<timestamp>.csv",
    text: "Active and eligible assignment instances with principal, member type, scope type, dates, and permanent-versus-time-bound state.",
  },
  {
    label: "Administrative Units",
    title: "Entra_Administrative_Units_<timestamp>.csv",
    text: "AU properties, restricted-management state, member counts, membership rule, visibility, and scoped assignment counts.",
  },
  {
    label: "Findings",
    title: "Entra_Custom_Role_Findings_<timestamp>.csv",
    text: "Prioritized role, assignment, and Administrative Unit conditions that require evidence or remediation.",
  },
];

const findings = [
  {
    severity: "High",
    code: "TENANT_SCOPE_CUSTOM_ROLE",
    text: "A tenant-specific role is assigned across the organization. Confirm that AU or resource scope cannot satisfy the task.",
  },
  {
    severity: "High",
    code: "PERMANENT_ACTIVE_ASSIGNMENT",
    text: "Custom privilege is continuously active. Evaluate time-bound active or eligible access and document any approved exception.",
  },
  {
    severity: "High",
    code: "HIGH_IMPACT_ACTION",
    text: "The role includes credential, authentication, role-management, consent, Conditional Access, or allTasks-style capability.",
  },
  {
    severity: "High",
    code: "RESTRICTED_AU_WORKFLOW_RISK",
    text: "A restricted AU can break ordinary support, automation, ownership, PIM, lifecycle, review, or recovery workflows.",
  },
  {
    severity: "Medium",
    code: "MISSING_DESCRIPTION",
    text: "The definition does not explain the task, owner, target object, or intended assignment boundary.",
  },
  {
    severity: "Review",
    code: "CUSTOM_ROLE_WITH_NO_ASSIGNMENTS",
    text: "The definition may be staged, stale, superseded, or safe to retire after confirming no external dependency.",
  },
  {
    severity: "Review",
    code: "SERVICE_PRINCIPAL_DIRECTORY_READ_CHECK",
    text: "An AU-scoped service principal may need tenant-scoped directory-read capability before the delegated operation is usable.",
  },
  {
    severity: "Review",
    code: "AU_GROUP_MEMBER_ASSUMPTION",
    text: "Groups are AU members, but their users and devices are not automatically in scope for individual-object administration.",
  },
];

const evidenceRows = [
  ["Business task", "Exact operation, object type, frequency, support owner, business owner, ticket or approval source"],
  ["Role definition", "Definition ID, template ID, description, version, enabled state, and every allowedResourceAction"],
  ["Assignment", "Principal, principal type, direct or group path, active or eligible state, start, end, and assignment ID"],
  ["Scope", "directoryScopeId, scope type, scope display name, target object membership, and out-of-scope test target"],
  ["Administrative Unit", "Member type counts, membership rule, restricted status, scoped roles, owners, recovery path, and review date"],
  ["Control path", "PIM policy, role-assignable group, approver, authentication requirement, notification, and emergency-access exception"],
  ["Validation", "Required action succeeds, prohibited action fails, out-of-scope action fails, and audit events identify the change"],
  ["Disposition", "Retain, reduce actions, narrow scope, move to PIM, replace, disable, or retire with named approver and date"],
];

export default function CustomRolesScopeEvidenceSections() {
  return (
    <GuideSection
      id="inventory"
      eyebrow="Read-only evidence first"
      title="Inventory definitions, assignments, scopes, and Administrative Units before changing anything"
      intro="The reports are intentionally layered. Start with the tenant-wide definition and assignment model, then enrich Administrative Units and prioritize the combinations that create the largest blast radius or recovery risk."
    >
      <GuideCallout tone="info" title="Run in a controlled administrative session">
        <p>The examples use Microsoft Graph read permissions and pagination-safe collection retrieval. Confirm tenant size, throttling, sovereign-cloud endpoints, module version, and export location before running across a large production directory.</p>
      </GuideCallout>

      <GuideCodeBlock
        title="Pagination-safe Microsoft Graph collection helper"
        code={graphCollectionHelper}
      />

      <GuideCodeBlock
        title="Export all Microsoft Entra custom role definitions"
        code={customRoleDefinitionInventory}
      />

      <GuideCodeBlock
        title="Export active and eligible custom-role assignments"
        code={customRoleAssignmentInventory}
      />

      <GuideCodeBlock
        title="Export Administrative Units and scoped role counts"
        code={administrativeUnitInventory}
      />

      <GuideCodeBlock
        title="Create a prioritized custom-role and scope findings report"
        code={customRoleFindings}
      />

      <div className="crs-output-grid">
        {outputs.map((output) => (
          <article key={output.title}>
            <span>{output.label}</span>
            <h3>{output.title}</h3>
            <p>{output.text}</p>
          </article>
        ))}
      </div>

      <GuideCallout tone="warning" title="No single export proves effective access">
        <p>Join the role definition, every active and eligible assignment, group inheritance, Administrative Unit membership, PIM state, directory-read capability, target-resource behavior, and current session evidence before deciding that access exists—or has been removed.</p>
      </GuideCallout>

      <div className="crs-finding-grid">
        {findings.map((finding) => (
          <article key={finding.code}>
            <span className={`severity ${finding.severity.toLowerCase()}`}>{finding.severity}</span>
            <code>{finding.code}</code>
            <p>{finding.text}</p>
          </article>
        ))}
      </div>

      <div className="kg-table-wrap crs-evidence-table-wrap">
        <table className="kg-table crs-evidence-table">
          <thead><tr><th>Evidence area</th><th>Minimum evidence package</th></tr></thead>
          <tbody>
            {evidenceRows.map(([area, evidence]) => <tr key={area}><th>{area}</th><td>{evidence}</td></tr>)}
          </tbody>
        </table>
      </div>

      <GuideCallout tone="success" title="A defensible review explains both success and failure">
        <p>Record the approved operation that succeeds, the prohibited operation that fails, the out-of-scope object that remains protected, and the audit event that proves the resulting configuration. A screenshot of the role name is not enough.</p>
      </GuideCallout>
    </GuideSection>
  );
}
