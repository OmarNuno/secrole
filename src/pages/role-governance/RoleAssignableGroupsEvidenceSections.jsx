import { GuideCallout, GuideCodeBlock, GuideSection } from "../service-principals/KnowledgeGuideLayout";
import {
  controlPathFindingsPowerShell,
  graphCollectionHelper,
  groupRelationshipsPowerShell,
  groupRolePathsPowerShell,
  roleAssignableGroupInventoryPowerShell,
} from "./roleAssignableGroupsCode";

const inventoryOutputs = [
  {
    label: "Group inventory",
    title: "Which groups can carry Microsoft Entra roles?",
    description: "Records object type, creation time, group purpose, role-assignable state, and the immutable membership model.",
    file: "RoleAssignable_Groups_<timestamp>.csv",
  },
  {
    label: "Role paths",
    title: "Which role and scope does each group grant?",
    description: "Reconciles active and eligible role schedule instances so group-based access is visible even without a user-level direct assignment.",
    file: "RoleAssignable_Group_RolePaths_<timestamp>.csv",
  },
  {
    label: "Relationships",
    title: "Who is active or eligible as a member or owner?",
    description: "Combines directory owners and members with PIM for Groups active and eligible schedule instances.",
    file: "RoleAssignable_Group_Relationships_<timestamp>.csv",
  },
  {
    label: "Control findings",
    title: "Where should review start first?",
    description: "Flags missing or single-owner recovery, standing access, alternate JIT patterns, disabled principals, multiple roles, and unresolved PIM policy evidence.",
    file: "RoleAssignable_Group_Findings_<timestamp>.csv",
  },
];

const evidenceFields = [
  ["Group", "Display name, Object ID, description, group type, creation date, role-assignable status"],
  ["Role path", "Role definition, active or eligible state, scope, dates, member type, schedule and instance IDs"],
  ["Relationships", "Active and eligible members and owners, account state, synchronization state, relationship source"],
  ["Control authority", "Role administrators, delegated owners, PIM approvers, policy administrators, security reviewers"],
  ["Operational evidence", "Requests, approvals, activations, membership changes, role changes, audit events, target-service use"],
  ["Decision", "Business owner, reviewer, disposition, remediation owner, due date, proof of change, next review"],
];

const findingCards = [
  ["NO_ACTIVE_OWNER", "Critical", "No active recovery owner was resolved."],
  ["ONE_ACTIVE_OWNER", "High", "One owner remains and eligible ownership may not prevent a deactivation trap."],
  ["STANDING_ROLE_PATH", "High", "An active role and active members create standing administrator access."],
  ["LAST_OWNER_DEACTIVATION_RISK", "High", "Eligible ownership exists while only one owner remains active."],
  ["DISABLED_PRINCIPAL", "High", "A disabled identity still appears in a member, owner, or PIM relationship."],
  ["MULTIPLE_ROLE_ASSIGNMENTS", "Review", "One group grants multiple roles and may combine unrelated trust boundaries."],
];

export default function RoleAssignableGroupsEvidenceSections() {
  return (
    <>
      <GuideSection
        id="inventory"
        eyebrow="Read-only evidence"
        title="Inventory the full path—not only the group object"
        intro="A defensible report joins four layers: the role-assignable group, the group's active or eligible role assignments, active and eligible member or owner relationships, and the people or policies that can change those relationships. Run the helper once, then execute the reports in order."
      >
        <div className="rag-output-grid">
          {inventoryOutputs.map((item) => (
            <article key={item.title}>
              <span>{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <code>{item.file}</code>
            </article>
          ))}
        </div>

        <GuideCodeBlock title="Pagination-safe Microsoft Graph collection helper" code={graphCollectionHelper} />
        <GuideCodeBlock title="Inventory all role-assignable groups" code={roleAssignableGroupInventoryPowerShell} />
        <GuideCodeBlock title="Resolve active and eligible roles assigned to each group" code={groupRolePathsPowerShell} />
        <GuideCodeBlock title="Resolve active and eligible members, owners, and PIM policy evidence" code={groupRelationshipsPowerShell} />
        <GuideCodeBlock title="Generate prioritized control-path findings" code={controlPathFindingsPowerShell} />

        <GuideCallout tone="info" title="Large-tenant note">
          The relationship pass makes several Graph requests per role-assignable group. Start with the group and role-path inventories, then scope owner and membership enrichment to the groups that grant high-impact roles, have standing access, or lack accountable ownership when tenant size makes a full pass operationally expensive.
        </GuideCallout>

        <div className="rag-finding-grid">
          {findingCards.map(([code, severity, description]) => (
            <article key={code}>
              <span className={`severity ${severity.toLowerCase()}`}>{severity}</span>
              <code>{code}</code>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </GuideSection>

      <GuideSection
        id="review-workflow"
        eyebrow="Repeatable governance"
        title="Review every path from authority to effective access"
        intro="Do not approve the group because its name looks correct. Resolve who controls it, what it grants, when the relationship is active, where the role applies, and what evidence proves continued need."
      >
        <div className="rag-review-steps">
          {[
            ["01", "Inventory role-assignable groups", "Establish the complete population and record immutable design properties."],
            ["02", "Confirm purpose and ownership", "Resolve business purpose, technical owner, backup owner, support team, and retirement trigger."],
            ["03", "Inventory role assignments", "Capture active and eligible role paths, scope, dates, schedule IDs, and assignment source."],
            ["04", "Resolve active members", "Identify every user or principal that currently receives standing access through the group."],
            ["05", "Resolve eligible members", "Identify who can activate group membership and under which PIM for Groups policy."],
            ["06", "Resolve active and eligible owners", "Treat ownership as a separate privileged relationship with its own activation and recovery risk."],
            ["07", "Identify control authorities", "Record who can add members, add owners, assign roles, edit PIM policy, or approve activation."],
            ["08", "Validate role and scope", "Reduce the role or scope before adding more activation controls to an excessive permission set."],
            ["09", "Review both PIM layers", "Inspect PIM for Microsoft Entra roles and PIM for Groups; either can create the effective path."],
            ["10", "Correlate activity", "Review role activations, group activations, membership and ownership changes, sign-ins, tickets, and target-resource use."],
            ["11", "Choose a disposition", "Retain, move to eligibility, reduce role, narrow scope, remove owners, split, replace, or retire."],
            ["12", "Prove the change", "Validate effective access and prohibited access, preserve evidence, and schedule the next review."],
          ].map(([number, title, description]) => (
            <article key={number}>
              <span>{number}</span>
              <div><h3>{title}</h3><p>{description}</p></div>
            </article>
          ))}
        </div>

        <div className="rag-disposition-grid">
          {[
            ["Retain", "Purpose, role, scope, owners, members, controls, and evidence remain justified."],
            ["Move to eligibility", "Convert a standing role path or membership relationship to a tested just-in-time design."],
            ["Reduce role", "Replace an excessive built-in role with a narrower supported role."],
            ["Narrow scope", "Preserve the approved task while reducing tenant-wide blast radius."],
            ["Split the boundary", "Separate unrelated teams, roles, scopes, or approver models into distinct groups."],
            ["Retire", "Remove assignments and relationships, validate downstream removal, preserve recovery evidence, then delete."],
          ].map(([title, description]) => (
            <article key={title}><span>Disposition</span><h3>{title}</h3><p>{description}</p></article>
          ))}
        </div>

        <div className="kg-table-wrap">
          <table className="kg-table rag-evidence-table">
            <thead><tr><th>Evidence domain</th><th>Minimum evidence to preserve</th></tr></thead>
            <tbody>{evidenceFields.map(([field, detail]) => <tr key={field}><th>{field}</th><td>{detail}</td></tr>)}</tbody>
          </table>
        </div>
      </GuideSection>
    </>
  );
}
