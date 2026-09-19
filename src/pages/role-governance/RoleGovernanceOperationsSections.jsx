import { GuideCallout, GuideCodeBlock, GuideSection } from "../service-principals/KnowledgeGuideLayout";
import {
  administrativeUnitsPowerShell,
  assignmentExportPowerShell,
  graphCollectionHelper,
  roleAssignableGroupsPowerShell,
  roleInventoryPowerShell,
} from "./roleGovernanceData";

const workflow = [
  ["Identify the role system", "Write down the protected resource, requested action, and the authorization system that evaluates it."],
  ["Inventory role definitions", "Record built-in and custom definitions, privileged markers, template IDs, and permitted actions."],
  ["Inventory active access", "Collect direct, group-based, assigned, activated, permanent, and time-bound active instances."],
  ["Inventory eligibility", "Collect who can activate, the eligibility dates, source, scope, and role settings that govern activation."],
  ["Resolve inheritance", "Expand role-assignable group members and owners, and identify the governance process that changes membership."],
  ["Validate scope", "Confirm tenant, Administrative Unit, directory-resource, or app-specific scope and whether the role supports it."],
  ["Review controls", "Inspect PIM approval, MFA, activation duration, notifications, access reviews, Conditional Access, and admin workstation expectations."],
  ["Correlate evidence", "Use sign-in, audit, activation, ticket, owner, and business-operation evidence to establish actual need and use."],
  ["Choose a disposition", "Retain, move to eligibility, reduce role, narrow scope, replace with a custom role, time-bound, or remove."],
  ["Prove the change", "Validate required administration still works, prohibited administration fails, and emergency access remains usable."],
];

const dispositions = [
  { label: "Retain", tone: "retain", when: "Role, scope, assignment type, duration, controls, owner, and evidence are all appropriate." },
  { label: "Move to PIM", tone: "pim", when: "A human needs occasional privilege but does not need standing active access." },
  { label: "Reduce role", tone: "reduce", when: "The task remains valid but a less-privileged built-in role can perform it." },
  { label: "Narrow scope", tone: "scope", when: "The role is appropriate but tenant-wide access is broader than the managed population or resource." },
  { label: "Custom role", tone: "custom", when: "No built-in role matches the required supported actions without material excess privilege." },
  { label: "Remove", tone: "remove", when: "No accountable owner, current purpose, dependency, or acceptable risk justification remains." },
];

const troubleshooting = [
  {
    problem: "PIM activation succeeded, but the action is still denied",
    checks: "Confirm the role system, assignment scope, activation end time, target action, role definition permissions, and whether a fresh token or admin session is required.",
  },
  {
    problem: "The portal says a user has a role, but no direct assignment exists",
    checks: "Inspect active schedule instances and memberType. The access might be inherited through a role-assignable group or represented by a PIM schedule instance.",
  },
  {
    problem: "A group member does not receive the role",
    checks: "Verify the group is role-assignable, membership is direct rather than nested, the user is an assigned member, the role assignment targets the group, and propagation has completed.",
  },
  {
    problem: "An Administrative Unit-scoped admin can manage the group but not the users inside it",
    checks: "Adding a group to an Administrative Unit scopes the group object, not every member. Add individual users to the Administrative Unit when the role must manage their user properties.",
  },
  {
    problem: "An Azure Owner cannot manage Microsoft Entra directory roles",
    checks: "Azure RBAC and Microsoft Entra RBAC are separate systems. Azure subscription ownership does not automatically grant Privileged Role Administrator or other directory roles.",
  },
  {
    problem: "The eligible assignment appears permanent",
    checks: "Permanent describes the eligibility duration, not active access. Verify whether an active activated instance exists and whether the permanent eligibility is still justified.",
  },
  {
    problem: "Removing a direct assignment did not remove effective access",
    checks: "Check group-based assignments, additional active schedules, overlapping roles, custom roles, Administrative Unit scope, Azure RBAC, and workload-specific authorization.",
  },
  {
    problem: "No one can approve privileged activation",
    checks: "Confirm approvers exist and remain active. Preserve tested permanent-active emergency Global Administrator accounts so PIM approval design cannot lock the tenant out.",
  },
];

export default function RoleGovernanceOperationsSections() {
  return (
    <>
      <GuideSection
        id="review-workflow"
        eyebrow="Operational governance"
        title="Review effective access—not only the assignments blade"
        intro="A repeatable review should explain how a principal can obtain privilege, where it applies, when it is usable, which controls surround it, and what evidence supports keeping it."
      >
        <ol className="rg-workflow">
          {workflow.map(([title, description], index) => (
            <li key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><h3>{title}</h3><p>{description}</p></div>
            </li>
          ))}
        </ol>

        <div className="rg-disposition-grid">
          {dispositions.map((item) => (
            <article className={item.tone} key={item.label}>
              <span>{item.label}</span>
              <p>{item.when}</p>
            </article>
          ))}
        </div>

        <GuideCallout tone="warning" title="Do not remove privilege from a screenshot alone">
          Before changing a production assignment, identify the dependent task, business owner, current administrator path, group source, activation pattern, scope, and rollback plan. Then validate both the required operation and a prohibited operation after the change.
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="commands"
        eyebrow="Copy & run"
        title="Build one evidence set for active, eligible, group-based, and scoped access"
        intro="These examples are investigation-oriented and read-only. Use an account with the least Microsoft Graph permissions needed for role-management and directory visibility in your tenant."
      >
        <div className="kg-code-stack">
          <GuideCodeBlock
            label="PowerShell helper"
            title="Follow Microsoft Graph pagination safely"
            code={graphCollectionHelper}
          />
          <GuideCodeBlock
            label="Microsoft Graph PowerShell"
            title="Inventory definitions, direct assignments, active instances, and eligibility"
            code={roleInventoryPowerShell}
          />
          <GuideCodeBlock
            label="CSV evidence"
            title="Export active and eligible assignment instances together"
            code={assignmentExportPowerShell}
          />
          <GuideCodeBlock
            label="Privileged groups"
            title="List role-assignable groups"
            code={roleAssignableGroupsPowerShell}
          />
          <GuideCodeBlock
            label="Delegated scope"
            title="List Administrative Units"
            code={administrativeUnitsPowerShell}
          />
        </div>

        <div className="rg-evidence-package">
          <header><span>Minimum evidence package</span><h3>Keep the fields that let another reviewer reproduce the decision</h3></header>
          <ul>
            <li>Principal name, Object ID, type, source, and accountable owner</li>
            <li>Role name, definition ID, built-in or custom status, and privileged marker</li>
            <li>Tenant, directory scope ID, app scope ID, and resolved scope name</li>
            <li>Direct, group, or inherited member type</li>
            <li>Assigned, activated, or eligible state</li>
            <li>Start date, end date, permanent status, and activation duration</li>
            <li>PIM controls, approvers, justification, ticket, and access-review outcome</li>
            <li>Recent use, audit changes, business purpose, final disposition, and reviewer</li>
          </ul>
        </div>
      </GuideSection>

      <GuideSection
        id="troubleshooting"
        eyebrow="When access does not add up"
        title="Troubleshoot the assignment source, state, scope, and role system in order"
        intro="Most role problems become clearer when you stop asking only whether the role exists and instead prove which record grants effective access to which resource."
      >
        <div className="kg-faq-list rg-troubleshooting-list">
          {troubleshooting.map((item) => (
            <details key={item.problem}>
              <summary>{item.problem}<span aria-hidden="true">+</span></summary>
              <div><p>{item.checks}</p></div>
            </details>
          ))}
        </div>

        <GuideCallout tone="success" title="Use assignment instances for the effective view">
          Direct assignment records explain one source. Active and eligibility schedule instances provide the resolved view needed to include assigned, activated, direct, group-based, inherited, permanent, and time-bound access.
        </GuideCallout>
      </GuideSection>
    </>
  );
}
