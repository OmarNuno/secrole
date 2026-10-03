import { GuideCallout, GuideCodeBlock, GuideSection } from "../service-principals/KnowledgeGuideLayout";
import {
  addMemberOwnerHttp,
  createRoleAssignableGroupPowerShell,
} from "./roleAssignableGroupsCode";

const troubleshooting = [
  {
    symptom: "The user has a role but no direct assignment",
    checks: "Resolve roleAssignmentScheduleInstances and roleEligibilityScheduleInstances where principalId is a group, then verify the user's active or eligible membership path.",
  },
  {
    symptom: "Group.ReadWrite.All cannot add a member",
    checks: "Role-assignable group membership requires RoleManagement.ReadWrite.Directory and a supported signed-in administrator role. Confirm the exact token permissions and caller role.",
  },
  {
    symptom: "An existing group cannot be made role-assignable",
    checks: "The setting is creation-only and immutable. Create a replacement group, migrate owners and members, prove access, then remove the old path.",
  },
  {
    symptom: "A dynamic or nested group design fails",
    checks: "Role-assignable groups require Assigned membership and do not support active group nesting. Resolve users directly or redesign the trust boundary.",
  },
  {
    symptom: "PIM membership is active but the service still denies access",
    checks: "Confirm the directory relationship, group role assignment, role scope, token or session refresh, and target-service propagation. Exchange, SharePoint, Purview, SCIM, and application caches can lag.",
  },
  {
    symptom: "An activated owner does not deactivate",
    checks: "Check whether the identity became the last active owner. Add another deliberate active owner and review PIM deactivation history before attempting cleanup.",
  },
  {
    symptom: "Access remains after membership removal",
    checks: "Look for another active or eligible group path, direct role assignment, cached token, service-side role, provisioning record, or delayed target-resource authorization update.",
  },
  {
    symptom: "A deleted group still appears in PIM",
    checks: "Validate the soft-delete state, restore window, actual effective schedule instances, and known portal caching behavior before creating a duplicate replacement path.",
  },
];

const cadence = [
  ["Daily", "Alert on owner, member, role assignment, PIM policy, activation, deletion, restoration, and disabled-principal changes."],
  ["Weekly", "Review critical and high findings, pending access changes, failed deactivations, and groups with standing administrator paths."],
  ["Monthly", "Reconcile groups, roles, scopes, active and eligible relationships, PIM policies, owners, and target-service evidence."],
  ["Quarterly", "Obtain business-owner attestation, challenge multiple-role groups, test recovery, and confirm retirement triggers."],
  ["Event-driven", "Review immediately after privileged incidents, owner termination, role redesign, scope change, PIM policy change, or recovery use."],
];

export default function RoleAssignableGroupsOperationsSections() {
  return (
    <>
      <GuideSection
        id="change-examples"
        eyebrow="Controlled implementation"
        title="Create and change the group only after the control model is approved"
        intro="The examples below change tenant state. Use placeholders, record the approved purpose and owners, validate the immutable group properties, and add relationships only through an approved privileged-change process."
      >
        <GuideCallout tone="warning" title="State-changing examples">
          Creating a role-assignable group cannot be undone by toggling a property. Membership and ownership changes can grant or remove administrator access. Test in a nonproduction tenant where possible and preserve the returned group Object ID, change ticket, approver, and verification evidence.
        </GuideCallout>

        <GuideCodeBlock label="State-changing PowerShell" title="Create a security role-assignable group" code={createRoleAssignableGroupPowerShell} />
        <GuideCodeBlock label="State-changing HTTP" title="Add an owner and member through Microsoft Graph" code={addMemberOwnerHttp} language="HTTP" />

        <div className="rag-change-gates">
          {[
            ["Before create", "Purpose, role, scope, naming, owner recovery, PIM design, licensing, and decommission trigger approved."],
            ["Before owner change", "New owner understands the access path, cannot create an unreviewed escalation, and has a documented backup."],
            ["Before member change", "Business task, role, scope, active or eligible state, duration, approver, and removal date are known."],
            ["Before role assignment", "Role and scope are least privileged, group members are appropriate, and the activation model has been tested."],
            ["Before retirement", "All direct and eligible role paths, members, owners, downstream app assignments, and recovery dependencies are removed or migrated."],
          ].map(([title, detail]) => (
            <article key={title}><span>Change gate</span><h3>{title}</h3><p>{detail}</p></article>
          ))}
        </div>
      </GuideSection>

      <GuideSection
        id="troubleshooting"
        eyebrow="Field guide"
        title="Troubleshoot in control-path order"
        intro="Start with the group object and relationship state, then move outward to role, scope, PIM policy, token, provisioning, and target-resource authorization. Do not assume a portal delay explains every failure."
      >
        <div className="rag-troubleshooting-order" aria-label="Troubleshooting order">
          {["Group object", "Owner/member relationship", "PIM schedule instance", "Role assignment", "Scope", "Token or session", "Target resource"].map((item, index) => (
            <span key={item}><strong>{index + 1}</strong>{item}{index < 6 && <b aria-hidden="true">→</b>}</span>
          ))}
        </div>

        <div className="rag-troubleshooting-grid">
          {troubleshooting.map((item) => (
            <article key={item.symptom}>
              <span>Symptom</span>
              <h3>{item.symptom}</h3>
              <p>{item.checks}</p>
            </article>
          ))}
        </div>

        <GuideCallout tone="info" title="A successful membership activation is not proof of usable target access">
          The group relationship may be active while the target service still has an older token, cached directory data, delayed provisioning, or a different authorization model. Preserve timestamps and correlation evidence from PIM, directory audit, sign-in, provisioning, and target-resource logs.
        </GuideCallout>

        <div className="rag-cadence-grid">
          {cadence.map(([interval, activity]) => (
            <article key={interval}><span>{interval}</span><p>{activity}</p></article>
          ))}
        </div>
      </GuideSection>
    </>
  );
}
