import { GuideCallout, GuideCodeBlock, GuideSection } from "./KnowledgeGuideLayout";
import {
  addSecretPowerShell,
  removeSecretPowerShell,
} from "./credentialLifecycleRotationCode";

export default function CredentialLifecycleRotationSections() {
  return (
    <>
      <GuideSection
        id="secret-rotation"
        eyebrow="Client-secret rotation"
        title="A new secret is a new credential record—not an edit to the old value"
        intro="Microsoft Entra generates a new secret value and returns it only once. Treat creation, approved storage, deployment, verification, and removal as separate controlled steps."
      >
        <div className="cl-secret-facts">
          <article>
            <span>One-time value</span>
            <h3><code>secretText</code> cannot be retrieved later</h3>
            <p>The portal and Microsoft Graph expose the secret value only at creation. Later reads show metadata such as keyId, name, hint, start date, and expiration.</p>
          </article>
          <article>
            <span>Stable locator</span>
            <h3>Track the directory <code>keyId</code></h3>
            <p>Store the keyId in the change record and, where practical, in secret-store metadata. The first-three-character hint is not a dependable enterprise inventory key.</p>
          </article>
          <article>
            <span>Deployment dependency</span>
            <h3>Changing Key Vault is not always enough</h3>
            <p>Workloads can cache environment variables, secret-store versions, connection objects, or tokens. Restart, redeploy, or force refresh according to the runtime.</p>
          </article>
        </div>

        <ol className="cl-rotation-steps">
          <li><span>1</span><div><strong>Confirm the active dependency</strong><p>Identify the exact workload, host, secret-store record, current keyId, owner, permissions, schedule, and failure impact.</p></div></li>
          <li><span>2</span><div><strong>Add the replacement</strong><p>Create a clearly named credential with the shortest practical lifetime while the existing credential remains valid.</p></div></li>
          <li><span>3</span><div><strong>Store without exposure</strong><p>Write the one-time secret value directly to the approved secret store. Never place it in console output, tickets, source code, email, or a CSV.</p></div></li>
          <li><span>4</span><div><strong>Deploy and reload</strong><p>Update the workload configuration and restart or redeploy components that cache credentials or secret versions.</p></div></li>
          <li><span>5</span><div><strong>Prove the replacement</strong><p>Validate authentication plus the real business operation. Correlate sign-in, deployment, application, and target-resource evidence.</p></div></li>
          <li><span>6</span><div><strong>Remove the old keyId</strong><p>After a representative execution cycle and documented rollback decision, remove only the old credential record.</p></div></li>
        </ol>

        <GuideCodeBlock
          title="Add a replacement client secret while preserving the old one"
          code={addSecretPowerShell}
        />

        <GuideCallout tone="warning" title="The example intentionally does not print the new secret">
          Sending the secret to standard output can expose it in shell history, transcript logs, CI/CD logs, ticket attachments, terminal capture, or monitoring. Integrate the returned value directly with the approved secret store.
        </GuideCallout>

        <GuideCodeBlock
          title="Remove the old secret after the replacement is proven"
          code={removeSecretPowerShell}
        />
      </GuideSection>

      <GuideSection
        id="certificate-rotation"
        eyebrow="Certificate rotation"
        title="Rotate the public credential and the private key as one controlled dependency"
        intro="Microsoft Entra stores the public certificate information used to verify a client assertion. The workload must possess and protect the matching private key."
      >
        <div className="cl-certificate-flow">
          <article>
            <span>Generate</span>
            <h3>Create a new key pair</h3>
            <p>Use the approved certificate authority, key size, algorithm, subject naming, exportability rule, and private-key storage standard.</p>
          </article>
          <div aria-hidden="true">→</div>
          <article>
            <span>Register</span>
            <h3>Add the public certificate</h3>
            <p>Append the new certificate to the correct application or service-principal object. Preserve the current certificate during validation.</p>
          </article>
          <div aria-hidden="true">→</div>
          <article>
            <span>Deploy</span>
            <h3>Install the private key</h3>
            <p>Deliver the private key through Key Vault, HSM, managed certificate service, or a protected host store with least-privileged access.</p>
          </article>
          <div aria-hidden="true">→</div>
          <article>
            <span>Prove</span>
            <h3>Authenticate with the new thumbprint</h3>
            <p>Confirm the runtime selected the replacement key, issued a valid assertion, received the intended token, and completed the target operation.</p>
          </article>
          <div aria-hidden="true">→</div>
          <article>
            <span>Retire</span>
            <h3>Remove the old public key and private key</h3>
            <p>Delete both sides after validation. Leaving the old private key behind preserves an unnecessary credential path even after directory cleanup.</p>
          </article>
        </div>

        <div className="cl-cert-checks">
          <article>
            <span>Directory checks</span>
            <ul>
              <li>Correct application or service-principal Object ID</li>
              <li>New keyId and thumbprint recorded</li>
              <li>Validity window is intentional</li>
              <li>Type and usage match the scenario</li>
              <li>Old and new keys overlap only for the change window</li>
            </ul>
          </article>
          <article>
            <span>Private-key checks</span>
            <ul>
              <li>Private key exists only in approved locations</li>
              <li>Exportability follows policy</li>
              <li>Runtime identity can read—but not broadly manage—the key</li>
              <li>Backup and recovery behavior is documented</li>
              <li>Old private-key copies are removed after cutover</li>
            </ul>
          </article>
          <article>
            <span>Runtime checks</span>
            <ul>
              <li>Application selects the intended certificate</li>
              <li>Clock and assertion lifetime are valid</li>
              <li>Deployment picked up the new version</li>
              <li>Sign-in and target logs show expected activity</li>
              <li>Negative tests confirm excess access is denied</li>
            </ul>
          </article>
        </div>

        <GuideCallout tone="info" title="Automated addKey and removeKey have proof-of-possession requirements">
          Microsoft Graph supports <code>addKey</code> and <code>removeKey</code> for automated rollover when the caller can prove possession of an existing valid key. If the application has no valid certificate, the addKey action cannot satisfy that proof and a different authorized update path is required.
        </GuideCallout>

        <GuideCallout tone="warning" title="Do not confuse a SAML signing certificate with a client-authentication certificate">
          A SAML enterprise application can have token-signing certificates on the service principal. Rotating or deleting those keys can affect SSO assertions rather than OAuth client credentials. Verify SSO mode, key usage, and the relying party before changing them.
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="incident-response"
        eyebrow="Credential incident"
        title="A compromised credential is not a normal maintenance rotation"
        intro="When exposure is confirmed or strongly suspected, shorten the overlap and coordinate identity, workload, resource, and incident-response controls."
      >
        <div className="cl-incident-grid">
          <article className="compromise">
            <span>Confirmed or likely compromise</span>
            <h3>Contain new token acquisition</h3>
            <p>Remove the affected credential or disable the service principal when the impact supports it. Preserve the keyId, timeline, initiating actor, deployment state, and audit evidence first when possible.</p>
          </article>
          <article>
            <span>Authorization containment</span>
            <h3>Reduce what the identity can reach</h3>
            <p>Revoke unnecessary app roles, Azure RBAC, directory roles, group membership, database roles, resource ACLs, and owned-object control. Network restrictions may also be required.</p>
          </article>
          <article>
            <span>Runtime recovery</span>
            <h3>Replace every exposed copy</h3>
            <p>Rotate the Microsoft Entra credential and the corresponding secret-store value or private key. Search source control, build logs, deployment artifacts, host disks, and backup locations.</p>
          </article>
          <article>
            <span>Threat hunt</span>
            <h3>Correlate identity and resource evidence</h3>
            <p>Review service-principal sign-ins, directory audit logs, deployment records, Azure Activity Logs, target-resource logs, unusual IPs, and operations outside the normal workload pattern.</p>
          </article>
        </div>

        <div className="cl-token-warning">
          <strong>Credential removal is necessary, but it is not the whole incident response.</strong>
          <p>A credential is used to obtain tokens. Removing it blocks future requests that depend on that credential, but already-issued access tokens can remain usable until their own validity ends. Continue monitoring and apply resource-side containment when needed.</p>
        </div>

        <ol className="cl-incident-sequence">
          <li><span>1</span>Open an incident and preserve the credential metadata, audit records, deployment evidence, and known secret locations.</li>
          <li><span>2</span>Determine whether immediate credential removal, service-principal disablement, or permission containment is required.</li>
          <li><span>3</span>Create and deploy a clean replacement through a trusted administration path.</li>
          <li><span>4</span>Remove the exposed credential and every known copy of the secret or private key.</li>
          <li><span>5</span>Review token issuance, target-resource activity, permission changes, and persistence paths.</li>
          <li><span>6</span>Document root cause, affected resources, evidence window, remediation, owner, and prevention action.</li>
        </ol>
      </GuideSection>
    </>
  );
}
