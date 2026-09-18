import { GuideCallout, GuideCodeBlock, GuideSection } from "./KnowledgeGuideLayout";
import {
  activityInventory,
  azureRbacInventory,
  coreInventory,
  credentialInventory,
  privilegeInventory,
  workloadRiskInventory,
} from "./securityReviewGuideData";

const remediationSteps = [
  ["Preserve", "Capture object properties, owners, grants, memberships, credential metadata, sign-ins, audit events, risk detections, target-resource evidence, and timestamps before changing state."],
  ["Confirm", "Identify the business sponsor, technical owner, support team, dependency chain, data handled, expected activity pattern, outage impact, and recovery authority."],
  ["Reduce", "Remove unused or reducible permissions, narrow Azure and resource scope, separate unrelated functions, and remove obsolete group membership or ownership."],
  ["Replace", "Move from client secrets to managed identity, workload identity federation, or protected certificates where supported. Rotate using tested overlap and verify the active deployment."],
  ["Control", "Apply supported workload Conditional Access, assignment requirements, application-management policies, classification metadata, monitoring, and risk response."],
  ["Validate", "Test the workload, inspect new sign-in and resource logs, confirm the token claims and target resource behavior, and obtain owner acceptance of the reduced state."],
  ["Disable", "For retirement or containment, disable according to an approved plan, monitor for dependency failures, retain rollback details, and communicate the observation window."],
  ["Delete", "Delete only after dependency validation, approval, recovery planning, and a decision about the soft-delete window. Record the final evidence and closure date."],
];

export default function SecurityReviewOperationsSections() {
  return (
    <>
      <GuideSection
        id="commands"
        eyebrow="Copy & run"
        title="Build a repeatable, read-only evidence package"
        intro="Run these examples with the least-privileged access available in your environment. Preserve the tenant ID, retrieval time, reviewer, and source beside every output."
      >
        <div className="kg-code-stack">
          <GuideCodeBlock title="Resolve the application, service principal, core controls, and owners" code={coreInventory} />
          <GuideCodeBlock title="Inventory application permissions, delegated grants, directory roles, and memberships" code={privilegeInventory} />
          <GuideCodeBlock title="Inventory secrets, certificates, service-principal keys, and federated credentials" code={credentialInventory} />
          <GuideCodeBlock title="Collect recent service-principal sign-ins and directory changes" code={activityInventory} />
          <GuideCodeBlock title="Query Microsoft Entra risky workload identity state when available" code={workloadRiskInventory} />
          <GuideCodeBlock title="List Azure RBAC assignments and inherited scope" code={azureRbacInventory} language="Azure CLI" />
        </div>

        <GuideCallout tone="info" title="Resolve friendly permission and role names before approval">
          Raw appRoleId, resourceId, roleTemplateId, and Azure role-definition IDs are not sufficient for a human review. Resolve each identifier to the resource service principal, permission or role display name, assignment scope, and whether the access is application, delegated, direct, or inherited.
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="remediation"
        eyebrow="Change safely"
        title="Remediate in an order that protects evidence and avoids unnecessary outage"
        intro="The safest review produces a controlled sequence, an accountable approver, a rollback path, and post-change evidence. Do not start by deleting the object."
      >
        <ol className="sr-remediation-sequence">
          {remediationSteps.map(([title, detail], index) => (
            <li key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><strong>{title}</strong><p>{detail}</p></div>
            </li>
          ))}
        </ol>

        <div className="kg-card-grid sr-change-grid">
          <article className="kg-card"><div className="kg-card-label">Permission change</div><h3>Reduce one privilege boundary at a time</h3><p>Remove or replace a grant, test the feature, inspect token and resource evidence, and document the result before changing the next control plane.</p></article>
          <article className="kg-card"><div className="kg-card-label">Credential rotation</div><h3>Add, deploy, prove, then remove</h3><p>Create the replacement, deploy it securely, prove the workload uses it, monitor successful sign-ins, and only then remove the old credential.</p></article>
          <article className="kg-card"><div className="kg-card-label">Containment</div><h3>Coordinate identity and resource response</h3><p>Disabling token acquisition does not rotate secrets already copied elsewhere or undo actions performed in target systems. Investigate downstream data and resources.</p></article>
          <article className="kg-card"><div className="kg-card-label">Retirement</div><h3>Prefer staged disablement before deletion</h3><p>Where the risk allows, disable and observe first, maintain recovery instructions, and delete only after the owner and resource teams confirm no dependency remains.</p></article>
        </div>

        <GuideCallout tone="warning" title="Ownership is itself a privileged relationship">
          Application and service-principal owners can manage the objects they own, and that management can include credential or configuration changes. Review owner eligibility, privileged access paths, terminations, role-assignable groups, and whether an owner account could become a route to the workload identity.
        </GuideCallout>
      </GuideSection>
    </>
  );
}
