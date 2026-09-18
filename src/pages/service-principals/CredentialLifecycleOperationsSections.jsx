import { GuideCallout, GuideCodeBlock, GuideSection } from "./KnowledgeGuideLayout";
import {
  auditCredentialChangesPowerShell,
  policyInventoryPowerShell,
} from "./credentialLifecycleOperationsCode";

export default function CredentialLifecycleOperationsSections() {
  return (
    <>
      <GuideSection
        id="policy-and-alerting"
        eyebrow="Preventive controls"
        title="Use policy to prevent new debt—and monitoring to manage what already exists"
        intro="Application-management policy can restrict new credentials and their maximum lifetimes. Alerting, ownership, and rotation evidence are still required for the credentials that policy permits."
      >
        <div className="cl-policy-grid">
          <article>
            <span>Tenant default</span>
            <h3><code>defaultAppManagementPolicy</code></h3>
            <p>Defines the default application and service-principal credential restrictions for the tenant when no object-specific policy overrides them.</p>
          </article>
          <article>
            <span>Object-specific</span>
            <h3><code>appManagementPolicy</code></h3>
            <p>Applies tailored restrictions to selected applications or service principals. Use sparingly and document why the object differs from the tenant standard.</p>
          </article>
          <article>
            <span>Password controls</span>
            <h3>Addition and lifetime restrictions</h3>
            <p>Policies can block password additions or set a maximum password lifetime. The enforcement date can be scoped to newly created or existing applications.</p>
          </article>
          <article>
            <span>Certificate controls</span>
            <h3>Asymmetric-key lifetime restrictions</h3>
            <p>Policies can cap certificate/key lifetime. This reduces new long-lived credentials but does not rotate or remove existing credentials automatically.</p>
          </article>
        </div>

        <GuideCodeBlock
          title="Read the tenant default and object-specific app-management policies"
          code={policyInventoryPowerShell}
        />

        <div className="cl-alerting-model">
          <header>
            <span>Recommended monitoring design</span>
            <h3>Alert early enough to investigate—not merely to replace</h3>
          </header>
          <div>
            <article><strong>90 days</strong><p>Validate ownership, dependency mapping, migration opportunity, authorization, and maintenance-window requirements.</p></article>
            <article><strong>60 days</strong><p>Confirm the rotation method, replacement destination, approvers, validation plan, and rollback owner.</p></article>
            <article><strong>30 days</strong><p>Open or escalate the change. Microsoft Entra recommendations can help identify some service-principal credentials in this window.</p></article>
            <article><strong>14 days</strong><p>Escalate unresolved production and privileged credentials to the accountable owner and governance process.</p></article>
            <article><strong>7 days</strong><p>Treat as urgent outage prevention. Require an execution date and named engineer.</p></article>
            <article><strong>Expired</strong><p>Classify whether the workload is already broken, the credential is unused, or another active credential is masking stale inventory.</p></article>
          </div>
        </div>

        <GuideCallout tone="info" title="Built-in recommendations are useful supplemental coverage">
          Microsoft Entra can surface a recommendation when certain service-principal credentials are within 30 days of expiration. Keep your own application-and-service-principal inventory because recommendation scope, licensing, object location, and timing do not replace enterprise reporting.
        </GuideCallout>

        <GuideCallout tone="warning" title="Do not rely on notificationEmailAddresses for OAuth credential alerting">
          The service-principal <code>notificationEmailAddresses</code> property is documented for notifications about the active SAML token-signing certificate on Microsoft Entra Gallery applications. It is not a universal alert list for every app secret and client certificate.
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="operations"
        eyebrow="Operating model"
        title="Credential lifecycle is a recurring control, not a quarterly spreadsheet"
        intro="Combine scheduled inventory, event-driven review, owner accountability, safe rotation, and clean decommissioning."
      >
        <div className="cl-operating-cadence">
          <article>
            <span>Daily</span>
            <h3>Expiration and anomaly scan</h3>
            <p>Refresh credential status, compare against the previous run, and alert on new credentials, changed dates, unexpected keys, and threshold crossings.</p>
          </article>
          <article>
            <span>Weekly</span>
            <h3>At-risk queue review</h3>
            <p>Review expiring, expired, nonexpiring, ownerless, high-privilege, and recently changed credentials with named action owners.</p>
          </article>
          <article>
            <span>Monthly</span>
            <h3>Owner and dependency attestation</h3>
            <p>Confirm that active credentials still map to supported workloads, approved storage, valid owners, and intended permissions.</p>
          </article>
          <article>
            <span>Quarterly</span>
            <h3>Credential elimination review</h3>
            <p>Identify workloads that can move to managed identity or federation and remove credentials that no longer have a justified dependency.</p>
          </article>
          <article>
            <span>On change</span>
            <h3>Audit and deployment correlation</h3>
            <p>Every add, remove, lifetime change, owner change, and policy exception should map to an approved change, deployment, or incident.</p>
          </article>
          <article>
            <span>On retirement</span>
            <h3>Authorization cleanup</h3>
            <p>Remove the credential, application access, role assignments, grants, groups, secret-store entries, private keys, documentation, and alert records.</p>
          </article>
        </div>

        <GuideCodeBlock
          title="Review recent application-management audit events for one object"
          code={auditCredentialChangesPowerShell}
        />

        <div className="cl-evidence-package">
          <header>
            <span>Rotation evidence</span>
            <h3>What the change record should prove</h3>
          </header>
          <div>
            <article><strong>Before</strong><p>Old keyId, locator, expiration, object location, runtime dependency, owner, permissions, and reason for rotation.</p></article>
            <article><strong>Replacement</strong><p>New keyId, name, validity window, storage location, deployment version, approver, and creation actor.</p></article>
            <article><strong>Validation</strong><p>Successful sign-in, target operation, timestamp, correlation ID, expected resource, and negative authorization test.</p></article>
            <article><strong>Retirement</strong><p>Old key removal time, private-key or secret cleanup, audit event, rollback decision, and residual-risk statement.</p></article>
          </div>
        </div>

        <div className="cl-antipatterns">
          <header>
            <span>Anti-patterns</span>
            <h3>Signals that the process is creating future outages</h3>
          </header>
          <ul>
            <li><strong>One shared secret for many workloads</strong><span>There is no safe way to attribute use or rotate one dependency independently.</span></li>
            <li><strong>Credential names such as “Secret 1”</strong><span>The directory metadata provides no environment, workload, owner, or purpose context.</span></li>
            <li><strong>Rotation on the expiration date</strong><span>There is no time for dependency discovery, approvals, validation, rollback, or propagation.</span></li>
            <li><strong>Creating a replacement but never deleting the old one</strong><span>The identity accumulates valid authentication paths and incident-response ambiguity.</span></li>
            <li><strong>Keeping the private key on engineer workstations</strong><span>The deployment path bypasses governed storage, access control, and inventory.</span></li>
            <li><strong>Assuming no sign-ins means no dependency</strong><span>Review the correct log type, time window, token cache, schedule, and target-resource evidence.</span></li>
          </ul>
        </div>

        <div className="cl-decommission-checklist">
          <h3>Credential decommission checklist</h3>
          <ol>
            <li><span>1</span>Confirm the workload no longer requests tokens with the credential.</li>
            <li><span>2</span>Remove the directory credential by its exact keyId.</li>
            <li><span>3</span>Delete the secret-store version or private-key material according to retention policy.</li>
            <li><span>4</span>Remove pipeline variables, service connections, host configuration, and deployment artifacts.</li>
            <li><span>5</span>Review authorization that is no longer required.</li>
            <li><span>6</span>Close alerts and update the dependency inventory.</li>
            <li><span>7</span>Preserve change and audit evidence outside the identity object.</li>
          </ol>
        </div>
      </GuideSection>
    </>
  );
}
