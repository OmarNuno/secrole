import { GuideCallout, GuideSection } from "./KnowledgeGuideLayout";

export default function TroubleshootingFailureSections() {
  return (
    <>
      <GuideSection
        id="object-lookup"
        eyebrow="Objects and tenant"
        title="Prove that you are looking in the right directory"
        intro="The application object, service principal, tenant, and cloud authority form one identity context. A correct GUID used in the wrong directory still fails."
      >
        <div className="kg-card-grid">
          <article className="kg-card">
            <div className="kg-card-label">App registration exists</div>
            <h3>Enterprise application is missing</h3>
            <p>The application object can exist in its home tenant without a service principal in the tenant you are checking. Search local service principals by <code>appId</code>, not display name.</p>
            <code>servicePrincipal.appId == application.appId</code>
          </article>
          <article className="kg-card">
            <div className="kg-card-label">Wrong directory</div>
            <h3>App ID is valid somewhere else</h3>
            <p><code>AADSTS700016</code> commonly means the request targeted a tenant that cannot resolve the client application. Verify the authority, tenant ID, sign-in audience, and installation or consent state.</p>
            <code>authority tenant → local service principal</code>
          </article>
          <article className="kg-card">
            <div className="kg-card-label">Wrong resource</div>
            <h3>Resource service principal cannot be resolved</h3>
            <p><code>AADSTS500011</code> points to the resource side. Confirm the requested scope or resource URI, resource Application ID, target tenant, and whether the resource application is available there.</p>
            <code>requested resource → resource service principal</code>
          </article>
          <article className="kg-card">
            <div className="kg-card-label">Wrong cloud</div>
            <h3>Commercial and sovereign endpoints do not mix</h3>
            <p>Confirm the authority host, Microsoft Graph endpoint, tenant location, and resource audience. A tenant or application in one national cloud cannot be assumed to exist in another.</p>
            <code>authority host + resource host + tenant cloud</code>
          </article>
        </div>

        <GuideCallout tone="warning" title="Do not use display name as identity proof">
          Display names can be duplicated, changed, or rendered differently between App registrations and Enterprise applications. Preserve <code>appId</code>, object type, Object ID, and tenant ID together.
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="client-authentication"
        eyebrow="Credential layer"
        title="Separate the client identity from the credential it presents"
        intro="The Application ID selects the client. The secret, certificate, managed identity, or federated assertion proves that the caller is allowed to act as that client."
      >
        <div className="kg-portal-grid">
          <article className="kg-portal-card">
            <span>Client secret</span>
            <h3>Value, app, and deployment must match</h3>
            <p>Use the secret value—not the credential record ID. Confirm it belongs to the correct application object, is active, and was actually deployed to the runtime that is failing.</p>
            <code>AADSTS7000215 / AADSTS7000222</code>
          </article>
          <article className="kg-portal-card">
            <span>Certificate assertion</span>
            <h3>The private key must sign a valid assertion</h3>
            <p>Verify the certificate is active on the correct app, the workload has the matching private key, the assertion audience is the token endpoint, and system time is accurate.</p>
            <code>AADSTS700027 / AADSTS50013</code>
          </article>
          <article className="kg-portal-card">
            <span>Workload federation</span>
            <h3>Issuer, subject, and audience are exact matches</h3>
            <p>Compare the incoming OIDC token to the federated credential. A branch, repository, namespace, service account, issuer, or audience mismatch prevents token exchange.</p>
            <code>issuer + subject + audience</code>
          </article>
        </div>

        <div className="kg-decision-banner">
          <strong>Rotation rule</strong>
          <p>Add the replacement credential, deploy it, prove a successful sign-in with the new credential, and only then remove the old credential. Restart or redeploy workloads that cache environment variables, secret-store versions, certificates, or tokens.</p>
        </div>
      </GuideSection>

      <GuideSection
        id="grants-and-token"
        eyebrow="Authorization layers"
        title="A valid token can still be the wrong token"
        intro="After client authentication succeeds, reconcile what was requested, what the tenant granted, what the token contains, and what the target API requires."
      >
        <div className="kg-record-grid">
          <article className="kg-record-card">
            <span>Application object</span>
            <h3>Configured request</h3>
            <p><code>requiredResourceAccess</code> describes the permissions configured by the developer. It does not prove that the target tenant granted them.</p>
            <code>requested access</code>
          </article>
          <article className="kg-record-card">
            <span>Client service principal</span>
            <h3>Tenant grant records</h3>
            <p>Application permissions appear through <code>appRoleAssignments</code>. Delegated grants appear through <code>oauth2PermissionGrants</code>.</p>
            <code>granted access</code>
          </article>
          <article className="kg-record-card">
            <span>Access token</span>
            <h3>Runtime evidence</h3>
            <p>Verify <code>aud</code>, <code>tid</code>, client identity, expiry, and the expected <code>roles</code> or <code>scp</code> claim before blaming the API.</p>
            <code>presented access</code>
          </article>
        </div>

        <div className="kg-card-grid">
          <article className="kg-card">
            <div className="kg-card-label">401 or invalid token</div>
            <h3>Validate issuer, signature, time, and audience</h3>
            <p>A token for Microsoft Graph is not a token for another API. The receiving API must validate the issuer and audience intended for that resource.</p>
          </article>
          <article className="kg-card">
            <div className="kg-card-label">403 or insufficient privileges</div>
            <h3>Validate roles, scopes, and resource authorization</h3>
            <p>The token may be valid but lack the required app role or delegated scope. The API can also enforce resource-specific RBAC, object ownership, licensing, or policy.</p>
          </article>
          <article className="kg-card">
            <div className="kg-card-label">Interactive user sign-in</div>
            <h3>User assignment is separate from consent</h3>
            <p>If <code>appRoleAssignmentRequired</code> is true, confirm the user or an eligible group is assigned to the Enterprise application. <code>AADSTS50105</code> is a common clue.</p>
          </article>
          <article className="kg-card">
            <div className="kg-card-label">Tenant policy</div>
            <h3>Conditional Access can block token issuance</h3>
            <p>Use the sign-in details to identify the applied policy and failure reason. Treat <code>AADSTS53003</code> as a policy decision, not as proof that credentials or consent are wrong.</p>
          </article>
        </div>
      </GuideSection>

      <GuideSection
        id="logs"
        eyebrow="Operational evidence"
        title="Use the log category that matches the workload"
        intro="Microsoft Entra separates user, service principal, and managed identity sign-ins. Audit logs explain configuration changes; resource logs explain what happened after token issuance."
      >
        <div className="kg-portal-grid">
          <article className="kg-portal-card">
            <span>Service principal sign-ins</span>
            <h3>Client-secret and certificate activity</h3>
            <p>Use this report for app-only sign-ins by nonuser accounts. Expand grouped rows to see timestamps when principal, status, IP, and resource match.</p>
            <code>Monitoring & health → Sign-in logs → Service principal sign-ins</code>
          </article>
          <article className="kg-portal-card">
            <span>Managed identity sign-ins</span>
            <h3>Azure-managed workload identities</h3>
            <p>Managed identity activity is intentionally separated from the service principal sign-in report. Check this category when Azure manages the workload credential.</p>
            <code>Monitoring & health → Sign-in logs → Managed identity sign-ins</code>
          </article>
          <article className="kg-portal-card">
            <span>Audit and resource logs</span>
            <h3>Configuration change and API decision</h3>
            <p>Use audit logs for object, credential, consent, owner, assignment, or policy changes. Use the target API or Azure resource logs for authorization and operation failures after a token was issued.</p>
            <code>correlation ID + UTC timestamp + resource</code>
          </article>
        </div>

        <GuideCallout tone="success" title="Correlation IDs are the bridge">
          Preserve the correlation ID, trace ID, UTC timestamp, Application ID, resource, and tenant from the failing request. Those fields let administrators line up the error payload, Entra sign-in record, workload log, and resource log.
        </GuideCallout>
      </GuideSection>
    </>
  );
}
