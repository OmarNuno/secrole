import { GuideCallout, GuideSection } from "../service-principals/KnowledgeGuideLayout";

const pimControls = [
  ["Eligibility", "Keep human administrators out of standing privileged access until the task requires elevation."],
  ["Activation duration", "Limit how long the active privilege remains usable after activation."],
  ["MFA and authentication context", "Require strong authentication at the point of elevation where supported."],
  ["Approval", "Add an independent decision for roles whose activation needs business or security oversight."],
  ["Justification and ticket", "Preserve why the privilege was activated and connect it to an approved change or incident."],
  ["Notifications", "Alert role owners and security teams when privileged assignments or activations occur."],
  ["Access reviews", "Reconfirm that active and eligible assignments remain necessary over time."],
  ["Audit history", "Retain assignment, activation, approval, and change evidence for investigation and compliance."],
];

const groupRules = [
  { value: "Immutable", label: "isAssignableToRole", note: "It must be enabled when the group is created and cannot be added to an existing group." },
  { value: "Assigned", label: "Membership type", note: "Dynamic membership is not supported because a rule change could become privilege escalation." },
  { value: "No nesting", label: "Group structure", note: "Another group cannot be added as a member of a role-assignable group." },
  { value: "Privileged", label: "Membership operations", note: "Managing members or owners of the group is effectively managing the role assignment." },
  { value: "500", label: "Tenant maximum", note: "Microsoft documents a maximum of 500 role-assignable groups per tenant." },
  { value: "PRA", label: "Creation authority", note: "At least Privileged Role Administrator is required to create a role-assignable group." },
];

const emergencyChecks = [
  "Maintain at least two cloud-only emergency accounts with no dependency on on-premises federation or synchronization.",
  "Use the tenant's onmicrosoft.com domain and strong passwordless authentication such as FIDO2 or certificate-based authentication.",
  "Keep Global Administrator active and permanent for the emergency identities rather than eligible-only.",
  "Exclude the accounts from Conditional Access policies that could block emergency sign-in, while continuing to monitor report-only results.",
  "Store credentials or authenticators in secure, separated locations with controlled access and documented custody.",
  "Monitor every sign-in and audit event and test the accounts regularly from the designated secure workstation path.",
];

export default function RoleGovernanceControlSections() {
  return (
    <GuideSection
      id="governance-controls"
      eyebrow="Layered controls"
      title="Use PIM, governed groups, narrow scope, and resilient emergency access together"
      intro="No single feature proves least privilege. Strong role governance combines assignment design, just-in-time activation, scope, authentication, ownership, recurring review, and a tested recovery path."
    >
      <div className="rg-control-stack">
        <section>
          <header>
            <span>Privileged Identity Management</span>
            <h3>Make privilege temporary, attributable, and reviewable</h3>
            <p>PIM changes how human administrators receive and use access. It does not make a broad role or scope safe by itself.</p>
          </header>
          <div className="rg-pim-grid">
            {pimControls.map(([title, description]) => (
              <article key={title}><strong>{title}</strong><p>{description}</p></article>
            ))}
          </div>
        </section>

        <section>
          <header>
            <span>Role-assignable groups</span>
            <h3>Treat membership and ownership as privileged operations</h3>
            <p>Groups can simplify role administration and integrate with governance workflows, but every membership path becomes part of the role's trust boundary.</p>
          </header>
          <div className="rg-rule-grid">
            {groupRules.map((rule) => (
              <article key={rule.label}>
                <strong>{rule.value}</strong>
                <span>{rule.label}</span>
                <p>{rule.note}</p>
              </article>
            ))}
          </div>
          <GuideCallout tone="warning" title="A group owner can indirectly control role access">
            Delegating group ownership can be useful, but it also delegates the ability to decide who receives the roles assigned to that group. Review owners, members, PIM-for-Groups settings, and membership changes as privileged-access evidence.
          </GuideCallout>
        </section>

        <section>
          <header>
            <span>Emergency access</span>
            <h3>Design a recovery path that does not depend on the control that failed</h3>
            <p>Emergency identities are a deliberate exception to ordinary just-in-time access. They exist so the tenant remains recoverable during federation, MFA, approval, policy, personnel, or network failures.</p>
          </header>
          <ol className="rg-emergency-list">
            {emergencyChecks.map((check, index) => (
              <li key={check}><span>{index + 1}</span><p>{check}</p></li>
            ))}
          </ol>
        </section>
      </div>

      <div className="rg-layer-model">
        <article><span>01</span><h3>Right role</h3><p>Prefer the least-privileged built-in role that performs the approved task.</p></article>
        <article><span>02</span><h3>Right scope</h3><p>Use tenant-wide scope only when a narrower Administrative Unit or resource scope cannot work.</p></article>
        <article><span>03</span><h3>Right time</h3><p>Use eligibility, activation duration, expiration, and access reviews to reduce standing access.</p></article>
        <article><span>04</span><h3>Right context</h3><p>Require strong authentication, compliant administration paths, approval, and justification proportionate to risk.</p></article>
        <article><span>05</span><h3>Right evidence</h3><p>Preserve owner, assignment source, scope, activation, audit, ticket, and review records.</p></article>
      </div>

      <GuideCallout tone="success" title="Custom roles should reduce privilege—not disguise it">
        Start with built-in roles. Create a custom role only when the supported built-in permissions are materially too broad or too narrow, include only the required actions, and assign it at the narrowest supported scope. Review custom definitions whenever Microsoft adds a better built-in role.
      </GuideCallout>
    </GuideSection>
  );
}
