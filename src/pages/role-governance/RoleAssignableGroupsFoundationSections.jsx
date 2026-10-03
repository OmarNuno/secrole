import { GuideCallout, GuideSection } from "../service-principals/KnowledgeGuideLayout";

const pathParts = [
  ["Principal", "The user or workload that can become a member or owner."],
  ["Group relationship", "Active or eligible membership or ownership."],
  ["Role assignment", "The Microsoft Entra role granted to the group."],
  ["Scope", "Tenant, Administrative Unit, or supported directory-resource boundary."],
  ["Controls", "PIM, approval, MFA, duration, owners, monitoring, and review."],
];

const accessPatterns = [
  {
    label: "Standing group access",
    title: "Active member + active role",
    description: "The user remains an active member and the group continuously holds the role. This is standing administrator access even when the user has no direct role assignment.",
    steps: ["Active group member", "Group has active role", "Standing effective access"],
    tone: "high",
  },
  {
    label: "PIM for Entra roles",
    title: "Active member + eligible role",
    description: "The membership is stable, but the role becomes active only after the user completes the Microsoft Entra role activation path.",
    steps: ["Active group member", "Group is eligible", "User activates role"],
    tone: "entra",
  },
  {
    label: "PIM for Groups",
    title: "Eligible member + active role",
    description: "The group continuously holds the role, while the user activates group membership. This can be useful, but downstream services can take time to recognize the new membership.",
    steps: ["Eligible group member", "User activates membership", "Group role becomes usable"],
    tone: "medium",
  },
];

const creationRules = [
  ["Creation only", "Set isAssignableToRole when the group is created. An existing ordinary group cannot be upgraded later."],
  ["Immutable property", "After creation, isAssignableToRole cannot be changed back to false."],
  ["Assigned membership", "Role-assignable groups cannot use dynamic membership."],
  ["No active nesting", "Another group cannot be added as an active member of a role-assignable group."],
  ["Cloud group", "On-premises groups cannot receive Microsoft Entra role assignments."],
  ["Tenant limit", "A tenant can currently create up to 500 role-assignable groups."],
  ["Creation authority", "At least Privileged Role Administrator is required to create one."],
  ["Licensing", "Role-assignable groups require Microsoft Entra ID P1 or P2; just-in-time role activation requires the appropriate PIM licensing."],
];

const ownerQuestions = [
  "Who is the accountable business owner?",
  "Who is the operational owner and backup owner?",
  "Can an owner add themselves as a member?",
  "Are owner changes monitored and reviewed?",
  "Can every owner explain the role, scope, and support model?",
  "Are inactive employees, contractors, or disabled accounts still owners?",
];

export default function RoleAssignableGroupsFoundationSections() {
  return (
    <>
      <GuideSection
        id="control-path"
        eyebrow="The 30-second answer"
        title="The group becomes part of the privileged-access control plane"
        intro="A role-assignable group is not merely a convenient membership list. It is an indirect path to administrator access, so the role assignment, membership, ownership, PIM state, scope, and every person who can change those relationships must be reviewed together."
      >
        <div className="rag-equation" aria-label="Role-assignable group governance equation">
          {pathParts.map(([title, text], index) => (
            <span className="rag-equation-part" key={title}>
              <article>
                <small>{String(index + 1).padStart(2, "0")}</small>
                <strong>{title}</strong>
                <p>{text}</p>
              </article>
              {index < pathParts.length - 1 && <b aria-hidden="true">×</b>}
            </span>
          ))}
        </div>

        <div className="rag-pattern-grid">
          {accessPatterns.map((pattern) => (
            <article className={`rag-pattern-card ${pattern.tone}`} key={pattern.title}>
              <span>{pattern.label}</span>
              <h3>{pattern.title}</h3>
              <p>{pattern.description}</p>
              <ol>
                {pattern.steps.map((step) => <li key={step}>{step}</li>)}
              </ol>
            </article>
          ))}
        </div>

        <GuideCallout tone="warning" title="Do not stop at the user's direct assignments">
          A user can have effective administrator access through a role-assignable group even when the user's role blade shows no direct assignment. Resolve the group membership or ownership path, the group's active or eligible role assignment, the scope, and any alternate access path before concluding that access is absent.
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="creation-boundary"
        eyebrow="Decide before create"
        title="Role assignability is an immutable security boundary"
        intro="The creation decision cannot be retrofitted onto an existing group or reversed later. Treat the design review as seriously as a privileged role assignment."
      >
        <div className="rag-creation-flow" aria-label="Role-assignable group creation decisions">
          {["Purpose and trust boundary", "Group type and naming", "Owners and recovery", "Active or eligible membership", "Role and scope", "Review and retirement trigger"].map((item, index) => (
            <span key={item}>
              <article><small>{index + 1}</small><strong>{item}</strong></article>
              {index < 5 && <b aria-hidden="true">→</b>}
            </span>
          ))}
        </div>

        <div className="kg-table-wrap">
          <table className="kg-table rag-rule-table">
            <thead><tr><th>Decision</th><th>Current platform rule</th><th>Governance consequence</th></tr></thead>
            <tbody>
              {creationRules.map(([rule, behavior]) => (
                <tr key={rule}>
                  <th>{rule}</th>
                  <td>{behavior}</td>
                  <td>{rule === "Creation only" ? "Create a replacement group for design changes; do not reuse a broad legacy group." :
                    rule === "Immutable property" ? "Deletion and migration are the rollback path, so preserve recovery evidence." :
                    rule === "Assigned membership" ? "Every membership change is an explicit privileged-access event." :
                    rule === "No active nesting" ? "Resolve users directly instead of assuming nested-group inheritance." :
                    rule === "Tenant limit" ? "Avoid one group per person or per temporary task; design reusable trust boundaries." :
                    "Validate this requirement before approval and deployment."}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rag-decision-grid">
          <article>
            <span>Good boundary</span>
            <h3>One purpose, one trust model</h3>
            <p>Members perform the same administrative task, at the same scope, under the same activation and review controls.</p>
          </article>
          <article>
            <span>Warning sign</span>
            <h3>Convenience aggregation</h3>
            <p>The group combines unrelated roles, scopes, teams, or support models simply to reduce the number of groups.</p>
          </article>
          <article>
            <span>Replacement trigger</span>
            <h3>The trust boundary changes</h3>
            <p>Create a new group when ownership, purpose, role, scope, or membership governance materially changes.</p>
          </article>
        </div>
      </GuideSection>

      <GuideSection
        id="ownership"
        eyebrow="Delegated administration"
        title="Ownership is a privileged-access decision path"
        intro="A group owner can become part of the control plane for membership and ownership. Owner lifecycle, recovery, and monitoring are therefore security controls—not collaboration housekeeping."
      >
        <div className="rag-owner-model">
          <article className="source">
            <span>Role administrator</span>
            <h3>Creates the group and assigns the role</h3>
            <p>Privileged Role Administrator is the least-privileged built-in role for creating and managing role-assignable group membership through supported delegated operations.</p>
          </article>
          <b aria-hidden="true">→</b>
          <article className="center">
            <span>Role-assignable group</span>
            <h3>Holds the role assignment</h3>
            <p>The group object links role, scope, active or eligible state, members, owners, and PIM policies.</p>
          </article>
          <b aria-hidden="true">←</b>
          <article className="source">
            <span>Group owner</span>
            <h3>May manage membership or ownership</h3>
            <p>Delegating ownership delegates influence over who can receive the group's administrator role. Define exactly what each owner is expected to manage.</p>
          </article>
        </div>

        <div className="rag-owner-checks">
          <div>
            <span>Review every owner</span>
            <h3>Questions that must have an answer</h3>
          </div>
          <ul>{ownerQuestions.map((question) => <li key={question}>{question}</li>)}</ul>
        </div>

        <GuideCallout tone="warning" title="Microsoft Graph uses a stronger permission boundary">
          <code>Group.ReadWrite.All</code> by itself does not authorize membership changes for a role-assignable group. Microsoft Graph requires <code>RoleManagement.ReadWrite.Directory</code>, and the signed-in administrator must hold a supported role. Privileged Role Administrator is the least-privileged built-in role for adding members to a role-assignable group.
        </GuideCallout>

        <div className="rag-protection-grid">
          <article>
            <span>Member and owner credentials</span>
            <h3>Stronger reset boundary</h3>
            <p>Changing credentials, resetting MFA, or modifying sensitive attributes for members or owners requires at least Privileged Authentication Administrator.</p>
          </article>
          <article>
            <span>Deletion and restore</span>
            <h3>Thirty-day recovery window</h3>
            <p>A deleted role-assignable group is soft-deleted and can be restored within 30 days. Include restoration and post-restore validation in the recovery plan.</p>
          </article>
          <article>
            <span>Multiple roles</span>
            <h3>Supported does not mean preferred</h3>
            <p>A group can receive more than one role, but combining roles can blur ownership, purpose, scope, and least-privilege review.</p>
          </article>
        </div>
      </GuideSection>
    </>
  );
}
