import { GuideCallout, GuideCodeBlock, GuideSection } from "./KnowledgeGuideLayout";
import {
  accessEvidenceScript,
  certificateServicePrincipalExamples,
  managedIdentityExamples,
} from "./mfaMigrationGuideData";

export default function MfaMigrationArchitectureSections() {
  return (
    <>
      <GuideSection
        id="hybrid-pattern"
        eyebrow="Hybrid architecture"
        title="Split the on-premises process identity from cloud authentication"
        intro="A service principal does not replace Kerberos, LDAP, NTFS, SQL integrated authentication, or Windows scheduled-task logon. Preserve the local identity only where it is genuinely required and replace its Azure sign-in."
      >
        <div className="mfa-hybrid-diagram" aria-label="Hybrid service-account migration pattern">
          <article className="host">
            <span>Windows host or scheduler</span>
            <h3>AD account or gMSA</h3>
            <p>Runs the process and satisfies local Windows, Kerberos, LDAP, file-share, or SQL dependencies.</p>
          </article>
          <div className="split" aria-hidden="true">→</div>
          <div className="mfa-hybrid-destinations">
            <article>
              <span>On-premises path</span>
              <h3>Keep local authentication</h3>
              <p>AD cmdlets, LDAP, file shares, Windows services, and integrated-authentication dependencies.</p>
            </article>
            <article>
              <span>Cloud path</span>
              <h3>Use a workload identity</h3>
              <p>Managed identity, workload federation, or service principal authenticates separately to Azure and Microsoft Entra protected resources.</p>
            </article>
          </div>
        </div>

        <div className="mfa-hybrid-outcome">
          <strong>Target outcome</strong>
          <p>The synchronized user no longer owns cloud RBAC, directory roles, application permissions, or Azure-management sign-in responsibilities. The on-prem account remains only if a documented local dependency requires it.</p>
        </div>

        <GuideCallout tone="success" title="This reduces blast radius as well as MFA risk">
          Separating local execution from cloud authorization prevents one long-lived user credential from simultaneously controlling Windows logon, on-premises access, and Azure management.
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="access-mapping"
        eyebrow="Authorization migration"
        title="Map access deliberately—do not clone the old user's privilege"
        intro="A migration is an opportunity to prove what the workload needs. Inventory every privilege surface, then grant only the subset required by tested operations."
      >
        <div className="kg-table-wrap" role="region" aria-label="User account to workload identity access mapping" tabIndex="0">
          <table className="kg-table mfa-access-table">
            <thead>
              <tr><th>Existing access surface</th><th>Migration evidence</th><th>Target design</th></tr>
            </thead>
            <tbody>
              <tr><th>Azure RBAC</th><td>Subscription, management-group, resource-group, resource, role, and inherited scope</td><td>Grant the workload identity only the smallest tested scope and role.</td></tr>
              <tr><th>Microsoft Entra directory roles</th><td>Active and eligible assignments, scope, and actual operations</td><td>Avoid broad directory roles; use Graph application permissions or scoped alternatives where possible.</td></tr>
              <tr><th>Microsoft Graph / API permissions</th><td>Configured request, tenant grant record, token roles/scopes, and API calls</td><td>Grant only the required app roles; app-only automation should not inherit unrelated delegated access.</td></tr>
              <tr><th>Groups and resource-specific access</th><td>Direct and transitive membership, app assignments, Key Vault access, storage roles, SQL roles, and custom APIs</td><td>Recreate only dependencies confirmed by evidence and owner testing.</td></tr>
              <tr><th>Owned directory objects</th><td>Applications, service principals, groups, and other objects controlled by the user</td><td>Assign accountable human owners; do not make the replacement workload identity its own sole governor.</td></tr>
              <tr><th>Secrets and certificates</th><td>Location, consumers, expiration, rotation, and access controls</td><td>Eliminate where possible; otherwise protect and monitor the replacement credential.</td></tr>
              <tr><th>On-premises rights</th><td>AD delegation, file shares, SQL, service logon, local groups, and task rights</td><td>Keep separate from cloud access and remove anything no longer required.</td></tr>
            </tbody>
          </table>
        </div>

        <GuideCodeBlock
          title="Collect read-only directory and Azure RBAC evidence before access mapping"
          code={accessEvidenceScript}
        />

        <GuideCallout tone="warning" title="Do not assign the replacement identity every permission the user had">
          User accounts accumulate interactive access, group membership, inherited roles, and historical exceptions. Copying all of it to a workload identity preserves privilege debt and may create durable app-only access that is more dangerous than the original design.
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="code-migration"
        eyebrow="Authentication replacement"
        title="Replace the user sign-in in code and job configuration"
        intro="Change both the authentication command and the surrounding secret, host, deployment, logging, and operational model. A new identity with old password-handling practices is not a complete migration."
      >
        <div className="mfa-before-after">
          <article className="before">
            <span>Remove</span>
            <h3>User credential automation</h3>
            <ul>
              <li><code>Connect-AzAccount -Credential</code></li>
              <li><code>az login --username ... --password ...</code></li>
              <li><code>UsernamePasswordCredential</code></li>
              <li><code>AcquireTokenByUsernamePassword</code></li>
              <li><code>AZURE_USERNAME</code> and <code>AZURE_PASSWORD</code></li>
            </ul>
          </article>
          <article className="after">
            <span>Replace with</span>
            <h3>Workload authentication</h3>
            <ul>
              <li>Managed identity token acquisition</li>
              <li>OIDC federation and short-lived assertions</li>
              <li>Certificate-backed client credentials</li>
              <li>Centralized workload sign-in and resource logging</li>
              <li>Independent owner and lifecycle governance</li>
            </ul>
          </article>
        </div>

        <div className="kg-code-stack">
          <GuideCodeBlock
            title="Managed identity sign-in for Azure PowerShell and Azure CLI"
            code={managedIdentityExamples}
          />
          <GuideCodeBlock
            title="Certificate-backed service principal sign-in"
            code={certificateServicePrincipalExamples}
          />
        </div>

        <div className="mfa-federation-note">
          <span>Federation</span>
          <h3>Prefer short-lived external assertions over stored Microsoft Entra credentials</h3>
          <p>Configure the app registration or user-assigned managed identity to trust the external platform's OIDC issuer. Restrict the federated credential by exact issuer, subject, and audience, then let the workload exchange that assertion for a Microsoft Entra access token.</p>
        </div>
      </GuideSection>
    </>
  );
}
