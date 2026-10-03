import { GuideCallout, GuideSection } from "../service-principals/KnowledgeGuideLayout";

const comparisonRows = [
  ["Purpose", "Allows a group to receive a Microsoft Entra role", "Makes group membership or ownership active only when needed"],
  ["Property", "isAssignableToRole", "Group brought under PIM for Groups management"],
  ["Required together?", "Required only when the group receives an Entra role", "Can govern role-assignable or ordinary supported groups"],
  ["What activates?", "The Microsoft Entra role can be active or eligible", "The user's membership or ownership activates"],
  ["Policy boundary", "PIM for Microsoft Entra roles", "Separate Member and Owner policies for the group"],
  ["Primary evidence", "Role assignment or eligibility schedule instances", "PIM for Groups assignment or eligibility schedule instances"],
];

const delegationRoles = [
  ["Create the group", "Privileged Role Administrator", "Approve immutable role-assignable design and initial recovery owners."],
  ["Assign the Entra role", "Privileged Role Administrator or approved role administrator", "Approve role definition, scope, active or eligible state, and duration."],
  ["Manage active membership", "Restricted group owner or privileged administrator", "Add or remove users only under an approved operating process."],
  ["Approve eligible membership", "Independent approver pool", "Validate the task and avoid requester, owner, and approver concentration."],
  ["Review effective access", "IAM, security, or independent governance reviewer", "Reconcile owners, members, role paths, scope, PIM, and activity evidence."],
  ["Recover or retire", "Documented identity recovery team", "Restore, replace, or retire the group without creating an alternate standing path."],
];

export default function RoleAssignableGroupsPimSections() {
  return (
    <>
      <GuideSection
        id="pim-designs"
        eyebrow="Choose the just-in-time layer"
        title="Role assignability and PIM for Groups are independent controls"
        intro="A role-assignable group determines whether the group can receive a Microsoft Entra role. PIM for Groups governs when a user becomes a member or owner. Either, both, or neither can be used, so the design must name the exact relationship that becomes active."
      >
        <div className="kg-table-wrap">
          <table className="kg-table rag-pim-table">
            <thead><tr><th>Question</th><th>Role-assignable group</th><th>PIM for Groups</th></tr></thead>
            <tbody>{comparisonRows.map((row) => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <th key={cell}>{cell}</th> : <td key={cell}>{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>

        <div className="rag-jit-grid">
          <article className="recommended">
            <span>Pattern A · Recommended for many M365 admin roles</span>
            <h3>Active membership, group eligible for the role</h3>
            <ol>
              <li>Users remain active members of the role-assignable group.</li>
              <li>The group is eligible for the Microsoft Entra role.</li>
              <li>Each user activates the role through PIM for Microsoft Entra roles.</li>
              <li>The role activation produces the temporary active role instance.</li>
            </ol>
            <strong>Best fit</strong>
            <p>Microsoft recommends this design for just-in-time access to roles used in Exchange, SharePoint, and Microsoft Purview because it avoids some group-membership propagation delays.</p>
          </article>
          <article>
            <span>Pattern B · Membership-gated access</span>
            <h3>Group active for the role, users eligible for membership</h3>
            <ol>
              <li>The group continuously holds the Microsoft Entra role.</li>
              <li>Users are eligible members in PIM for Groups.</li>
              <li>The user activates group membership.</li>
              <li>Target services must recognize the new group relationship.</li>
            </ol>
            <strong>Best fit</strong>
            <p>Useful when group membership is the universal switch for several systems, but the group itself remains a standing privileged principal and downstream access may not be immediate.</p>
          </article>
        </div>

        <GuideCallout tone="info" title="PIM for Groups is broader than role-assignable groups">
          Supported security and Microsoft 365 groups can be brought under PIM for Groups even when they do not receive a Microsoft Entra role. Dynamic groups and groups synchronized from on-premises cannot be managed in PIM for Groups. Once a group is brought under management, Microsoft does not provide a way to remove it from PIM management.
        </GuideCallout>

        <div className="rag-propagation-grid">
          <article>
            <span>Directory relationship</span>
            <h3>Activation is only the first layer</h3>
            <p>The user must become an active member or owner in Microsoft Entra ID before downstream authorization can be evaluated.</p>
          </article>
          <article>
            <span>Target service</span>
            <h3>Authorization can lag</h3>
            <p>Exchange, SharePoint, Purview, applications, tokens, and caches can take additional time to recognize the changed membership.</p>
          </article>
          <article>
            <span>SCIM provisioning</span>
            <h3>Application sync is separate</h3>
            <p>PIM membership activation can trigger app provisioning, but application design, throttling, and synchronization cycles affect when access becomes usable.</p>
          </article>
        </div>
      </GuideSection>

      <GuideSection
        id="last-owner"
        eyebrow="Operational edge case"
        title="Preserve an active ownership path before testing eligible ownership"
        intro="Microsoft Entra ID cannot remove the final active owner of a group. Eligible ownership can therefore become unexpectedly persistent when the previous active owner disappears."
      >
        <div className="rag-last-owner-flow" aria-label="Last active owner deactivation risk">
          {[
            ["Owner A", "Active owner"],
            ["Owner B", "Eligible owner"],
            ["Activation", "Owner B becomes active"],
            ["Owner A removed", "No other active owner remains"],
            ["Deactivation blocked", "Owner B stays active"],
          ].map(([title, text], index) => (
            <span key={title}>
              <article><small>{index + 1}</small><strong>{title}</strong><p>{text}</p></article>
              {index < 4 && <b aria-hidden="true">→</b>}
            </span>
          ))}
        </div>

        <div className="rag-last-owner-panel">
          <div>
            <span>Platform behavior</span>
            <h3>PIM retries deactivation for up to 30 days</h3>
            <p>If another active owner is added during the retry window, deactivation can complete. If no active owner is added, PIM eventually stops retrying and the activated owner remains active.</p>
          </div>
          <ul>
            <li>Maintain deliberate active recovery ownership.</li>
            <li>Do not remove the prior active owner during an ownership activation test.</li>
            <li>Monitor ownership activations and failed deactivations.</li>
            <li>Include owner succession in termination and emergency procedures.</li>
          </ul>
        </div>

        <GuideCallout tone="warning" title="Eligible owners are not a substitute for an active recovery owner">
          The group must remain manageable when an eligible owner cannot activate, an approval path fails, or the identity is unavailable. Document who can restore ownership, which role they require, and how emergency access is kept separate from ordinary operations.
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="delegation"
        eyebrow="Separation of duties"
        title="Delegate tasks without delegating the entire privileged-access lifecycle"
        intro="Making one person a group owner, PIM approver, role administrator, and access reviewer concentrates too much authority and weakens evidence. Separate responsibilities where the tenant's operating model permits it."
      >
        <div className="kg-table-wrap">
          <table className="kg-table rag-delegation-table">
            <thead><tr><th>Responsibility</th><th>Typical authority</th><th>Required evidence</th></tr></thead>
            <tbody>{delegationRoles.map((row) => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <th key={cell}>{cell}</th> : <td key={cell}>{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>

        <div className="rag-separation-grid">
          <article>
            <span>Business accountability</span>
            <h3>Why the access exists</h3>
            <p>Confirms the supported task, population, scope, service owner, and decommission trigger.</p>
          </article>
          <article>
            <span>Technical operation</span>
            <h3>How the group is maintained</h3>
            <p>Runs approved membership and ownership changes, validates PIM behavior, and preserves change evidence.</p>
          </article>
          <article>
            <span>Independent governance</span>
            <h3>Whether access should continue</h3>
            <p>Reviews the complete path and challenges standing access, broad roles, excess owners, and stale memberships.</p>
          </article>
          <article>
            <span>Security monitoring</span>
            <h3>What changed unexpectedly</h3>
            <p>Monitors group, owner, member, role, PIM policy, activation, and credential-reset events.</p>
          </article>
        </div>
      </GuideSection>
    </>
  );
}
