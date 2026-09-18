import { GuideCallout, GuideSection } from "./KnowledgeGuideLayout";
import { affectedApplications } from "./mfaMigrationGuideData";

export default function MfaMigrationScopeSections() {
  return (
    <>
      <GuideSection
        id="urgent-answer"
        eyebrow="Start here"
        title="The 30-second answer"
        intro="Microsoft enforces MFA on user identities performing covered Azure and administrative operations. Naming a synchronized user account like a service account does not change its object type."
      >
        <div className="mfa-answer-flow" aria-label="User-based automation migration flow">
          <article>
            <span>Current state</span>
            <h3>Synced user account</h3>
            <p>Unattended script signs in with a username and password or another user authentication flow.</p>
            <code>object type: user</code>
          </article>
          <div aria-hidden="true">→</div>
          <article>
            <span>Required action</span>
            <h3>Inventory and classify</h3>
            <p>Find the script, host, owners, permissions, resources, and sign-in method before changing production access.</p>
            <code>evidence before change</code>
          </article>
          <div aria-hidden="true">→</div>
          <article>
            <span>Target state</span>
            <h3>Workload identity</h3>
            <p>Use managed identity, federation, or a certificate-backed service principal with least-privilege access.</p>
            <code>nonuser authentication</code>
          </article>
        </div>

        <div className="mfa-object-rule">
          <strong>Microsoft evaluates the identity type, not the account name</strong>
          <p><code>svc_AzureAutomation</code> is still a user identity if the Microsoft Entra object is a <code>user</code>. User MFA requirements apply to that sign-in path. Managed identities and service principals are workload identities and are outside this mandatory user-MFA enforcement.</p>
        </div>

        <GuideCallout tone="warning" title="Treat this as active remediation">
          Phase 2 rollout began on October 1, 2025. Microsoft's documented postponement window ran only through July 1, 2026, and there is no permanent opt-out. Do not wait for the first production claims challenge to discover which jobs still depend on user authentication.
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="enforcement-scope"
        eyebrow="Scope decoder"
        title="Know exactly what is and is not covered"
        intro="Portal enforcement and Azure management-client enforcement are not identical. Preserve the operation type, target endpoint, client application, and identity object type when assessing impact."
      >
        <div className="mfa-phase-grid">
          <article>
            <span>Phase 1</span>
            <h3>Admin portals</h3>
            <p>Azure portal, Microsoft Entra admin center, Microsoft Intune admin center, and Microsoft 365 admin center require MFA for user sign-ins performing the covered portal operations.</p>
            <code>portal CRUD</code>
          </article>
          <article>
            <span>Phase 2</span>
            <h3>Azure management clients</h3>
            <p>Azure CLI, Azure PowerShell, Azure mobile app, IaC tools, Azure SDKs, and Azure Resource Manager REST requests require MFA for create, update, and delete operations.</p>
            <code>management.azure.com</code>
          </article>
          <article>
            <span>Outside this specific scope</span>
            <h3>Different endpoint or identity</h3>
            <p>Microsoft Graph is generally outside Azure Phase 2. Read-only ARM operations do not require MFA under Phase 2 itself. Workload identities are not affected by either phase.</p>
            <code>verify the real path</code>
          </article>
        </div>

        <div className="kg-table-wrap" role="region" aria-label="Mandatory MFA impact matrix" tabIndex="0">
          <table className="kg-table mfa-scope-table">
            <thead>
              <tr><th>Scenario</th><th>Mandatory MFA impact</th><th>Migration interpretation</th></tr>
            </thead>
            <tbody>
              <tr><th>Synced AD user running <code>Connect-AzAccount -Credential</code></th><td>Covered when performing scoped Azure operations</td><td>Replace cloud authentication with a workload identity.</td></tr>
              <tr><th>User account running <code>az login --username</code></th><td>Covered for Phase 2 create, update, and delete operations</td><td>Do not design unattended recovery around an MFA prompt.</td></tr>
              <tr><th>ROPC or <code>UsernamePasswordCredential</code></th><td>Incompatible with MFA</td><td>Redesign the authentication flow rather than rotating the password.</td></tr>
              <tr><th>Azure CLI / PowerShell read-only ARM query</th><td>Read operations are not required to perform MFA under Phase 2</td><td>Still inventory and migrate fragile user-based automation.</td></tr>
              <tr><th>Microsoft Graph API call</th><td>Generally outside Azure Phase 2</td><td>Graph permissions and tenant policies still apply; user-password automation remains poor practice.</td></tr>
              <tr><th>Managed identity or service principal</th><td>Not affected by either mandatory user-MFA phase</td><td>Use as the target cloud identity.</td></tr>
              <tr><th>Microsoft Entra Connect / Cloud Sync service account</th><td>Microsoft documents the synchronization service account as unaffected</td><td>Do not extend this exception to unrelated synced user accounts.</td></tr>
              <tr><th>On-premises-only service account</th><td>Outside this specific enforcement if it never performs an affected sign-in</td><td>Retain only for genuine on-prem dependencies and govern separately.</td></tr>
              <tr><th>Azure Government or another sovereign cloud</th><td>Microsoft currently documents enforcement for public Azure cloud</td><td>Confirm current sovereign-cloud documentation before assuming parity.</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mfa-app-grid">
          {affectedApplications.map((item) => (
            <article key={item.appId}>
              <span>{item.enforcement}</span>
              <h3>{item.name}</h3>
              <code>{item.appId}</code>
              <p>{item.operations}</p>
            </article>
          ))}
        </div>

        <GuideCallout tone="info" title="No account-name or Conditional Access exception">
          System enforcement applies to user accounts performing the covered operations, including accounts that teams call service accounts, emergency accounts, test accounts, or excluded users. Tenant exclusions do not create a permanent bypass.
        </GuideCallout>
      </GuideSection>
    </>
  );
}
