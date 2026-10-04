import { GuideCallout, GuideSection } from "../service-principals/KnowledgeGuideLayout";

const workflow = [
  ["01", "Define the exact task", "Name the solution, action, target users or data, frequency, business owner, and consequences of misuse or outage."],
  ["02", "Choose the permission plane", "Determine whether the task is authorized by a Purview role group, Microsoft Entra role, case, search filter, catalog role, Data Map role, or another service."],
  ["03", "Inventory every assignment path", "Resolve direct users, security groups, PIM eligibility, temporary assignments, overlapping Entra roles, and service-principal paths."],
  ["04", "Inspect the role bundle", "Record every role in the role group and remove capabilities that are unrelated to the documented job function."],
  ["05", "Validate scope", "Confirm Administrative Units, policy scope, SharePoint site membership, case access, compliance boundaries, domains, collections, and resource access."],
  ["06", "Rate content sensitivity", "Separate configuration, metadata, list, content, message, prompt, search, export, purge, and investigation access."],
  ["07", "Review time controls", "Evaluate permanent, temporary, group-based, and PIM-for-Groups access plus expiration, activation, approvers, and propagation."],
  ["08", "Resolve recovery", "Document who can restore role-group management, case access, domain ownership, and investigation continuity when an owner leaves."],
  ["09", "Correlate actual use", "Review permission changes, activations, case events, searches, exports, policy changes, content access, and target-solution evidence."],
  ["10", "Choose a disposition", "Retain, separate, scope, time-bound, reduce content access, replace, or remove the access path."],
  ["11", "Test allowed and denied behavior", "Prove the approved operation succeeds while a prohibited operation and an out-of-scope target remain blocked."],
  ["12", "Preserve and schedule review", "Record approver, reviewer, evidence, change result, exception owner, expiration, and the next recurring review date."],
];

const dispositions = [
  ["Retain", "Role bundle, member source, scope, time state, content access, owner, and evidence remain appropriate."],
  ["Separate", "Split configuration, investigation, content viewing, export, and role-management duties into distinct groups or teams."],
  ["Scope", "Apply supported Administrative Unit, case, compliance-boundary, domain, collection, or resource scope."],
  ["Time-bound", "Use a temporary direct assignment or PIM for Groups where the role group and workflow support it."],
  ["Reduce content access", "Keep the operational role while removing list, content, message, search, export, or investigation permissions that are not required."],
  ["Remove", "No current owner, approved task, dependency, or acceptable risk justification remains."],
];

const changeGates = [
  ["Before membership", "Confirm identity, owner, job function, exact role group, scope, duration, and alternate assignment paths."],
  ["Before role changes", "Inventory every eDiscovery case and workflow that references the role group; changing roles can remove the group from cases."],
  ["Before AU scoping", "Confirm the solution supports Administrative Units and that no overlapping Entra role will restore unscoped access."],
  ["Before content access", "Obtain explicit data-access approval and define monitoring for files, messages, prompts, search results, and exports."],
  ["Before removal", "Preserve case continuity, catalog ownership, policy administration, emergency recovery, and proof that required operations still work."],
];

const troubleshootingOrder = [
  "Portal and license",
  "Permission plane",
  "Role or role group",
  "Member source and time",
  "Scope",
  "Case or boundary",
  "Content role",
  "Session and propagation",
  "Target evidence",
];

const troubleshooting = [
  {
    title: "The Purview solution card is missing",
    text: "Confirm the user has a supported subscription and a role that grants access to the solution. Portal visibility can depend on both licensing and permissions; it does not prove every task inside the solution is authorized.",
  },
  {
    title: "A scoped administrator can see data outside the assigned Administrative Unit",
    text: "Check for overlapping Microsoft Entra roles such as Compliance Administrator, Compliance Data Administrator, Global Reader, or Security roles. Entra-derived overlapping capability takes precedence and is unscoped.",
  },
  {
    title: "PIM group membership is active but Purview still denies access",
    text: "Confirm the security group is assigned to the correct Purview role group, activation is active, no direct assignment is being confused with PIM, and enough propagation time has passed. Microsoft notes that Purview permissions can take up to two hours after activation.",
  },
  {
    title: "A temporary assignment expired but the user still has access",
    text: "Resolve other direct assignments, security-group assignments, Entra roles, case membership, and solution-specific roles. Each path is evaluated independently, and My Permissions displays the latest active expiration.",
  },
  {
    title: "An eDiscovery Manager cannot open a case",
    text: "Verify the manager created the case or was added as a user or supported role group. Role capability and case membership are separate. Use an eDiscovery Administrator for controlled recovery when the only case member has left.",
  },
  {
    title: "A role group disappeared from multiple eDiscovery cases",
    text: "Check whether roles were added to or removed from the group. Microsoft automatically removes a changed role group from every case that references it. Revalidate the bundle and re-add it to approved cases.",
  },
  {
    title: "eDiscovery search results exceed the expected compliance boundary",
    text: "Verify the search-permissions filter, assigned role group, supported mailbox attributes, site filters, and attribute population. Ensure the filter group contains at least one role and that capability and boundary groups are separated as designed.",
  },
  {
    title: "Content Explorer opens but item content is hidden",
    text: "Portal or Information Protection access does not grant content viewing. Confirm List Viewer and Content Viewer separately, plus Administrative Unit scope and any recent membership changes.",
  },
  {
    title: "A role group allows Purview work but not Exchange mail-flow changes",
    text: "Purview RBAC does not automatically grant Exchange Online administration. Identify the protected service and use the Exchange admin center or Exchange RBAC for transport rules and other Exchange-specific operations.",
  },
  {
    title: "Unified Catalog search omits an expected asset",
    text: "Confirm account type, catalog or governance-domain role, Data Map domain or collection permissions, and underlying Azure or Fabric access. Newly assigned permissions can also require propagation time.",
  },
];

const cadence = [
  ["Daily", "Alert on Role Management use, role-group membership changes, sensitive-content grants, case membership changes, searches, exports, and restricted-scope failures."],
  ["Weekly", "Review high-risk findings, temporary assignments approaching expiration, failed PIM propagation, owner gaps, and eDiscovery case dependency changes."],
  ["Monthly", "Reconcile role groups, included roles, security groups, Entra roles, Administrative Units, cases, filters, content roles, and data-governance paths."],
  ["Quarterly", "Require owner attestation, challenge broad content and search access, test recovery, and validate allowed, denied, and out-of-scope operations."],
  ["Event driven", "Re-review after a role-group definition change, Entra role change, new Purview solution, Administrative Unit redesign, investigation incident, or Microsoft permission update."],
];

export default function PurviewGovernanceOperationsSections() {
  return (
    <>
      <GuideSection
        id="review-workflow"
        eyebrow="Repeatable governance"
        title="Review the complete Purview access path from job function to sensitive data"
        intro="Do not approve a role group because its name sounds correct. Resolve the authorization plane, exact roles, member source, scope, case access, content exposure, time controls, and operational evidence."
      >
        <div className="pg-workflow-grid">
          {workflow.map(([number, title, text]) => (
            <article key={number}>
              <span>{number}</span>
              <div><h3>{title}</h3><p>{text}</p></div>
            </article>
          ))}
        </div>

        <div className="pg-disposition-grid">
          {dispositions.map(([title, text]) => (
            <article key={title}><span>Disposition</span><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>

        <GuideCallout tone="warning" title="Role-group changes can be access changes and workflow changes">
          <p>Adding or removing one role can change policy administration, investigation capability, content exposure, and eDiscovery case membership at the same time. Review dependencies and rollback before changing a shared production role group.</p>
        </GuideCallout>

        <div className="pg-change-gates">
          {changeGates.map(([title, text], index) => (
            <article key={title}><span>{index + 1}</span><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </GuideSection>

      <GuideSection
        id="troubleshooting"
        eyebrow="When Purview access does not add up"
        title="Troubleshoot the failed permission layer in order"
        intro="A portal role-group assignment is only one layer. Work from licensing and authorization plane through membership, scope, case, content role, propagation, and target evidence."
      >
        <div className="pg-troubleshooting-order" aria-label="Microsoft Purview permission troubleshooting order">
          {troubleshootingOrder.map((item, index) => (
            <span key={item}><strong>{index + 1}</strong>{item}{index < troubleshootingOrder.length - 1 && <b aria-hidden="true">→</b>}</span>
          ))}
        </div>

        <div className="pg-troubleshooting-grid">
          {troubleshooting.map((item) => (
            <article key={item.title}><span>Investigate</span><h3>{item.title}</h3><p>{item.text}</p></article>
          ))}
        </div>

        <GuideCallout tone="success" title="Prove the effective path—not only the intended assignment">
          <p>Use My Permissions, role-group exports, Microsoft Entra assignment evidence, case membership, Administrative Unit scope, compliance filters, catalog roles, and target-solution audit data together. One correct configuration screen does not rule out another access path.</p>
        </GuideCallout>

        <div className="pg-cadence-grid">
          {cadence.map(([label, text]) => <article key={label}><span>{label}</span><p>{text}</p></article>)}
        </div>
      </GuideSection>
    </>
  );
}
