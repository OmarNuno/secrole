import { GuideCallout, GuideCodeBlock, GuideSection } from "./KnowledgeGuideLayout";
import {
  createIdentityCli,
  federationInventoryPowerShell,
  managedIdentityGraphInventory,
  managedIdentityInventoryPowerShell,
  roleAssignmentInventory,
  systemAssignedCli,
  userAssignedFederationInventoryCli,
} from "./managedIdentityGuideData";

const implementationSteps = [
  ["1", "Define the workload boundary", "Document the runtime, environment, owning team, target resources, data sensitivity, expected operations, and failure impact."],
  ["2", "Confirm platform support", "Verify that the source can use managed identity or produce OIDC tokens and that every target accepts Microsoft Entra authentication."],
  ["3", "Choose the identity lifecycle", "Select system-assigned for one-resource lifecycle or user-assigned for preauthorization, reuse, or stable identity across resource replacement."],
  ["4", "Create or enable the identity", "Record client ID, service principal Object ID, Azure resource ID, tenant, owner, environment, and intended attachment boundary."],
  ["5", "Grant least privilege", "Assign only required management-plane, data-plane, API, database, or resource-specific permissions at the narrowest practical scope."],
  ["6", "Use deterministic code", "Select ManagedIdentityCredential or the exact federation credential in production rather than relying on an ambiguous credential chain."],
  ["7", "Test positive and negative access", "Prove required operations succeed and unapproved operations fail. Validate the intended identity from logs and token claims."],
  ["8", "Monitor and document", "Review managed-identity sign-ins, Azure Activity, target logs, federated trust changes, role assignments, and owner attestation."],
  ["9", "Remove the old credential", "After controlled cutover, remove superseded secrets, certificates, user credentials, role assignments, and duplicated access."],
  ["10", "Decommission cleanly", "Detach or delete unused identities, federated credentials, group memberships, database users, and orphaned Azure role assignments."],
];

export default function ManagedIdentityOperationsSections() {
  return (
    <>
      <GuideSection
        id="implementation"
        eyebrow="Implementation workflow"
        title="Build the identity, permission, code, and evidence as one deployment"
        intro="A credential-free design still needs lifecycle management. Treat the identity and its authorization as infrastructure, not as an afterthought added after the workload is deployed."
      >
        <ol className="mi-runbook">
          {implementationSteps.map(([number, title, description]) => (
            <li key={number}>
              <span>{number}</span>
              <div><strong>{title}</strong><p>{description}</p></div>
            </li>
          ))}
        </ol>

        <div className="mi-pattern-grid">
          <article>
            <span>Pattern A</span>
            <h3>One app on one Azure resource</h3>
            <p>Enable the system-assigned identity, grant narrow target permissions, use <code>ManagedIdentityCredential()</code>, and let deletion follow the source resource.</p>
          </article>
          <article>
            <span>Pattern B</span>
            <h3>Replicated or frequently replaced compute</h3>
            <p>Create one user-assigned identity per workload and environment, preauthorize it, attach it to each approved resource, and select its client ID explicitly.</p>
          </article>
          <article>
            <span>Pattern C</span>
            <h3>External CI/CD or Kubernetes workload</h3>
            <p>Create an app or user-assigned identity, configure an exact issuer/subject/audience trust, grant target access, and exchange short-lived OIDC assertions.</p>
          </article>
          <article>
            <span>Pattern D</span>
            <h3>Azure host must act as an app registration</h3>
            <p>Assign a user-assigned identity to the Azure host, configure it as a federated credential on the app, then exchange the managed-identity token for the application token.</p>
          </article>
        </div>

        <GuideCallout tone="warning" title="Separate environments and trust boundaries">
          Production, test, and development should not share a broadly privileged managed identity or federated credential. Separate identities make permissions, sign-in evidence, incident containment, and decommissioning easier to reason about.
        </GuideCallout>

        <div className="kg-code-stack">
          <GuideCodeBlock title="Create, attach, and authorize a user-assigned managed identity" code={createIdentityCli} language="Azure CLI · state changing" />
          <GuideCodeBlock title="Enable a system-assigned managed identity on a VM" code={systemAssignedCli} language="Azure CLI · state changing" />
        </div>
      </GuideSection>

      <GuideSection
        id="inventory"
        eyebrow="Read-only evidence"
        title="Inventory both the Azure resource and Microsoft Entra directory views"
        intro="The Azure identity resource, the tenant-local service principal, attached source resources, target permissions, and federated credentials are separate evidence sets. Preserve all of them."
      >
        <div className="kg-code-stack">
          <GuideCodeBlock title="List user-assigned managed identity resources" code={managedIdentityInventoryPowerShell} language="Azure PowerShell · read only" />
          <GuideCodeBlock title="List managed-identity service principals in Microsoft Entra" code={managedIdentityGraphInventory} language="Graph PowerShell · read only" />
          <GuideCodeBlock title="List Azure RBAC assignments for one identity" code={roleAssignmentInventory} language="Azure PowerShell · read only" />
          <GuideCodeBlock title="List federated credentials on app registrations" code={federationInventoryPowerShell} language="Graph PowerShell · read only" />
          <GuideCodeBlock title="List federated credentials on a user-assigned managed identity" code={userAssignedFederationInventoryCli} language="Azure CLI · read only" />
        </div>

        <div className="mi-evidence-grid">
          <article><span>Identity record</span><h3>Client ID, principal ID, resource ID</h3><p>Keep the Azure identity resource and Entra service-principal identifiers together so scripts, role assignments, and sign-in evidence resolve to the same identity.</p></article>
          <article><span>Attachment record</span><h3>Which resources can use it?</h3><p>For user-assigned identities, list every attached source resource. An unexpected attachment expands where the identity's permissions can be exercised.</p></article>
          <article><span>Authorization record</span><h3>What can it access?</h3><p>Collect direct and inherited Azure RBAC, API app roles, group memberships, database roles, resource ACLs, and owned objects.</p></article>
          <article><span>Federation record</span><h3>Which external assertions are trusted?</h3><p>Record issuer, subject, audience, name, owner, environment, external repository or namespace, and review date.</p></article>
          <article><span>Runtime record</span><h3>Where and when is it used?</h3><p>Use managed-identity sign-ins, service-principal sign-ins for app federation, Azure Activity, workload logs, and target-resource logs.</p></article>
          <article><span>Lifecycle record</span><h3>Who approves and retires it?</h3><p>Document technical owner, backup owner, support team, purpose, expiration or review cadence, source-resource boundary, and decommission trigger.</p></article>
        </div>
      </GuideSection>

      <GuideSection
        id="operations"
        eyebrow="Operations and troubleshooting"
        title="Most failures are identity selection, target support, trust mismatch, or authorization"
        intro="Start by proving the source resource and expected identity, then follow the token to the target. Avoid adding a new secret simply because managed authentication is misconfigured."
      >
        <div className="mi-ops-grid">
          <article><span>Identity unavailable</span><h3>The identity is not assigned to this source</h3><p>Confirm the system identity is enabled or the exact user-assigned identity is attached. A valid client ID in the wrong host still fails.</p><code>source resource → assigned identities</code></article>
          <article><span>Wrong identity</span><h3>More than one managed identity is available</h3><p>Select the expected user-assigned identity by client ID, object ID, or resource ID. Do not let production code choose implicitly.</p><code>ManagedIdentityCredential(expected identity)</code></article>
          <article><span>Token succeeds, API fails</span><h3>The target denied authorization</h3><p>Validate token audience and tenant, then check data-plane roles, Azure RBAC, API app roles, database users, resource ACLs, and target policy.</p><code>aud + tid + roles + resource logs</code></article>
          <article><span>Permission seems stale</span><h3>Cached tokens have not reflected the change</h3><p>Group or role membership updates can take hours for managed identities. Verify whether the access was granted directly or through token claims.</p><code>propagation and token cache</code></article>
          <article><span>Federation exchange fails</span><h3>Issuer, subject, or audience does not match</h3><p>Decode the external token and compare exact case-sensitive values. Check environment, branch, tag, namespace, service account, cloud, and audience.</p><code>iss + sub + aud</code></article>
          <article><span>Works locally, fails in Azure</span><h3>The credential chain changed identities</h3><p>Development tools may authenticate as a person while Azure should use managed identity. Use a deterministic production credential and log the resolved client identity.</p><code>developer identity ≠ workload identity</code></article>
          <article><span>Target has no Entra support</span><h3>Managed identity cannot replace every protocol</h3><p>Use the managed identity to retrieve a credential from a secure store only when the downstream system cannot accept a Microsoft Entra token directly.</p><code>managed identity → secure secret store → legacy target</code></article>
          <article><span>Identity deleted</span><h3>Authorization records remain</h3><p>Remove orphaned Azure role assignments, app-role assignments, database principals, groups, resource ACLs, and federated trust records during decommissioning.</p><code>Identity not found / ObjectType Unknown</code></article>
        </div>

        <div className="mi-operating-checklist">
          <h3>Production operating standard</h3>
          <ul>
            <li><span>1</span><p><strong>One accountable workload boundary.</strong> Do not share an identity merely to reduce object count.</p></li>
            <li><span>2</span><p><strong>One documented authorization inventory.</strong> Include Azure, Entra, API, database, and resource-specific access.</p></li>
            <li><span>3</span><p><strong>Deterministic credential selection.</strong> Production code must use the intended managed or federated identity.</p></li>
            <li><span>4</span><p><strong>Positive and negative tests.</strong> Required actions succeed; excessive access is denied.</p></li>
            <li><span>5</span><p><strong>Runtime evidence.</strong> Sign-in, activity, and target logs prove the identity and operation.</p></li>
            <li><span>6</span><p><strong>Lifecycle cleanup.</strong> Detach, remove grants, and delete unused identities and federation rules.</p></li>
          </ul>
        </div>

        <GuideCallout tone="success" title="The desired outcome is credential-free—not control-free">
          Managed identity and federation reduce secret leakage and expiration risk, but they increase the importance of source-resource security, trust-rule precision, least-privilege authorization, identity attachment governance, monitoring, and clean decommissioning.
        </GuideCallout>
      </GuideSection>
    </>
  );
}
