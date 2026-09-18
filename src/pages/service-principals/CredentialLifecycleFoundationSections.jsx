import { GuideCallout, GuideSection } from "./KnowledgeGuideLayout";

export default function CredentialLifecycleFoundationSections() {
  return (
    <>
      <GuideSection
        id="quick-answer"
        eyebrow="Start here"
        title="The no-outage rotation rule"
        intro="A planned rotation is a controlled overlap: create a replacement, deploy it, prove it, then remove the old credential. Expiration should never be the event that tells you a dependency still exists."
      >
        <div className="cl-lifecycle-flow">
          <article>
            <span>01</span>
            <h3>Discover</h3>
            <p>Find every secret and certificate on both application and service-principal objects, then identify the workload, owner, and runtime store behind each credential.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Add</h3>
            <p>Create a replacement while the current credential still works. Give it a clear name, bounded lifetime, accountable owner, and approved storage destination.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Deploy</h3>
            <p>Update the secret store, certificate store, pipeline connection, or application configuration. Restart or redeploy anything that caches credentials.</p>
          </article>
          <article>
            <span>04</span>
            <h3>Prove</h3>
            <p>Validate authentication and the business operation with the replacement. Confirm the expected tenant, client, resource, permission, and deployment version.</p>
          </article>
          <article>
            <span>05</span>
            <h3>Retire</h3>
            <p>Remove the old credential by keyId only after the replacement has completed a representative execution cycle and the rollback decision is documented.</p>
          </article>
        </div>

        <GuideCallout tone="warning" title="Do not rotate by deleting first">
          Deleting the active credential before the replacement is deployed turns a maintenance task into an outage. The exception is a confirmed or strongly suspected compromise where containment risk outweighs availability.
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="credential-model"
        eyebrow="Credential model"
        title="Inventory the directory object, the runtime secret, and the workload together"
        intro="Microsoft Entra stores credential metadata on directory objects. The actual secret value or certificate private key normally lives somewhere else, so a useful lifecycle record must connect all three layers."
      >
        <div className="cl-object-map">
          <article>
            <span>Directory definition</span>
            <h3>Application object</h3>
            <p>Most OAuth client secrets and client-authentication certificates belong to the app registration in <code>passwordCredentials</code> or <code>keyCredentials</code>.</p>
            <code>microsoft.graph.application</code>
          </article>
          <div className="cl-object-arrow" aria-hidden="true">↔</div>
          <article>
            <span>Tenant-local identity</span>
            <h3>Service principal object</h3>
            <p>Tenant-local credentials can also exist here, including legacy, gallery, SAML, and other service-principal-specific scenarios. Inventory this object separately.</p>
            <code>microsoft.graph.servicePrincipal</code>
          </article>
          <div className="cl-object-arrow" aria-hidden="true">↔</div>
          <article>
            <span>Runtime dependency</span>
            <h3>Secret or private-key location</h3>
            <p>The deployable secret value, private key, certificate binding, pipeline connection, or secret-store version must be mapped back to the directory <code>keyId</code>.</p>
            <code>Key Vault / HSM / pipeline / host</code>
          </article>
        </div>

        <div className="cl-table-wrap" role="region" aria-label="Credential type and evidence comparison" tabIndex="0">
          <table className="cl-table">
            <thead>
              <tr>
                <th>Authentication method</th>
                <th>Directory record</th>
                <th>Useful locator</th>
                <th>Sensitive material</th>
                <th>Lifecycle posture</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Client secret</th>
                <td><code>passwordCredentials</code></td>
                <td><code>keyId</code>, name, first-three-character hint</td>
                <td>Secret value outside Microsoft Entra after creation</td>
                <td>Shortest practical lifetime; replace with federation or managed identity when possible</td>
              </tr>
              <tr>
                <th>Client certificate</th>
                <td><code>keyCredentials</code></td>
                <td><code>keyId</code>, thumbprint, validity, usage</td>
                <td>Private key in certificate store, Key Vault, HSM, or workload host</td>
                <td>Preferred over a secret when a reusable app credential is required</td>
              </tr>
              <tr>
                <th>Workload federation</th>
                <td><code>federatedIdentityCredentials</code></td>
                <td>Issuer, subject, audience, credential name</td>
                <td>Short-lived assertion issued by the external identity provider</td>
                <td>No Microsoft Entra secret or certificate to rotate; govern the trust rule</td>
              </tr>
              <tr>
                <th>Managed identity</th>
                <td><code>servicePrincipalType = ManagedIdentity</code></td>
                <td>Client ID, principal ID, Azure resource ID</td>
                <td>Azure-managed credential</td>
                <td>Preferred for supported Azure-hosted workloads</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="cl-posture-grid">
          <article>
            <span>Best target</span>
            <h3>Eliminate the reusable credential</h3>
            <p>Use managed identity or workload identity federation when the source and target support it. Rotation then becomes trust and assignment governance rather than secret distribution.</p>
          </article>
          <article>
            <span>Preferred fallback</span>
            <h3>Certificate-backed service principal</h3>
            <p>Microsoft recommends certificates over client secrets when a service principal must authenticate with a reusable credential. Protect and rotate the private key as a privileged asset.</p>
          </article>
          <article>
            <span>Compatibility bridge</span>
            <h3>Short-lived client secret</h3>
            <p>Use only when the workload cannot support a stronger method. Record the dependency, storage location, owner, expiration, alerting path, and replacement plan at creation time.</p>
          </article>
        </div>

        <GuideCallout tone="info" title="A certificate on a service principal is not automatically an OAuth client certificate">
          Service-principal key credentials can support SAML token signing, gallery applications, legacy behavior, or client authentication. Preserve the object location, key usage, certificate thumbprint, SSO mode, and owning workload before deciding what to rotate.
        </GuideCallout>
      </GuideSection>
    </>
  );
}
