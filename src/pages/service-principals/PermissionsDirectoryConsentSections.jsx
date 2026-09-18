import { GuideCallout, GuideSection } from "./KnowledgeGuideLayout";

export default function PermissionsDirectoryConsentSections() {
  return (
    <>
      <GuideSection
        id="directory-records"
        eyebrow="Directory evidence"
        title="Three records answer three different questions"
        intro="Use the application object to see what was requested and the tenant-local service principals to prove what the tenant actually granted."
      >
        <div className="kg-record-grid">
          <article className="kg-record-card">
            <span>Application object</span>
            <h3>What did the app request?</h3>
            <p><code>requiredResourceAccess</code> lists target resource applications plus permission definition IDs configured by the developer.</p>
            <code>application.requiredResourceAccess</code>
          </article>
          <article className="kg-record-card">
            <span>Client service principal</span>
            <h3>Which application roles were granted?</h3>
            <p><code>appRoleAssignments</code> lists app roles this client service principal received from resource service principals.</p>
            <code>servicePrincipal.appRoleAssignments</code>
          </article>
          <article className="kg-record-card">
            <span>OAuth delegated grant</span>
            <h3>Which delegated scopes were consented?</h3>
            <p><code>oauth2PermissionGrants</code> records the client, resource, consent type, optional user principal, and space-delimited scope values.</p>
            <code>servicePrincipal.oauth2PermissionGrants</code>
          </article>
        </div>

        <GuideCallout tone="info" title="Direction matters in Microsoft Graph">
          <code>appRoleAssignments</code> means roles granted <em>to</em> this service principal. <code>appRoleAssignedTo</code> means users, groups, or service principals assigned <em>to roles exposed by</em> this service principal. Similar names describe opposite sides of the relationship.
        </GuideCallout>

        <div className="kg-table-wrap" role="region" aria-label="Permission directory record decoder" tabIndex="0">
          <table className="kg-table">
            <thead>
              <tr><th>Property</th><th>What it identifies</th><th>Investigation use</th></tr>
            </thead>
            <tbody>
              <tr><th><code>resourceAppId</code></th><td>The Application ID of the target resource API</td><td>Resolve the API whose scopes or app roles the client requested.</td></tr>
              <tr><th><code>resourceAccess.id</code></th><td>A delegated scope ID or application-role ID exposed by that resource</td><td>Map the GUID to the resource service principal's <code>oauth2PermissionScopes</code> or <code>appRoles</code>.</td></tr>
              <tr><th><code>appRoleAssignment.principalId</code></th><td>The client service principal receiving the app role</td><td>Confirm which local workload identity received application access.</td></tr>
              <tr><th><code>appRoleAssignment.resourceId</code></th><td>The resource service principal granting the app role</td><td>Resolve the tenant-local API instance and its app-role definitions.</td></tr>
              <tr><th><code>appRoleAssignment.appRoleId</code></th><td>The assigned application-role definition</td><td>Map the grant to a readable permission value such as a Microsoft Graph application permission.</td></tr>
              <tr><th><code>oauth2PermissionGrant.clientId</code></th><td>The client service principal Object ID</td><td>Identify the application receiving delegated access.</td></tr>
              <tr><th><code>oauth2PermissionGrant.resourceId</code></th><td>The resource service principal Object ID</td><td>Identify the target API in this tenant.</td></tr>
              <tr><th><code>oauth2PermissionGrant.consentType</code></th><td><code>AllPrincipals</code> or <code>Principal</code></td><td>Determine whether the grant is tenant-wide or limited to one user.</td></tr>
              <tr><th><code>oauth2PermissionGrant.scope</code></th><td>Space-delimited delegated permission values</td><td>Compare granted scope values with the access token's <code>scp</code> claim.</td></tr>
            </tbody>
          </table>
        </div>
      </GuideSection>

      <GuideSection
        id="admin-consent"
        eyebrow="Consent and assignment"
        title="Admin consent grants API access; assignment controls who may sign in"
        intro="Consent, user assignment, Conditional Access, and application authorization are related controls, but one does not replace the others."
      >
        <div className="kg-card-grid">
          <article className="kg-card">
            <div className="kg-card-label">User consent</div>
            <h3>Delegated access within tenant policy</h3>
            <p>A user may consent only when the tenant's consent settings permit it and the requested delegated permissions fall within policy. The resulting grant can be scoped to that user.</p>
            <code>consentType = Principal</code>
          </article>
          <article className="kg-card">
            <div className="kg-card-label">Administrator consent</div>
            <h3>Tenant-wide delegated or application access</h3>
            <p>An authorized administrator can approve delegated permissions for the organization and is required to approve application permissions. Review the exact client, resource, and permission definitions before granting.</p>
            <code>AllPrincipals or appRoleAssignment</code>
          </article>
          <article className="kg-card">
            <div className="kg-card-label">Assignment required</div>
            <h3>Which users may sign in to the enterprise application</h3>
            <p><code>appRoleAssignmentRequired</code> and user/group assignments control interactive access to the enterprise application. They do not create API consent grants.</p>
            <code>servicePrincipal.appRoleAssignmentRequired</code>
          </article>
          <article className="kg-card">
            <div className="kg-card-label">Conditional Access and resource policy</div>
            <h3>Additional runtime authorization</h3>
            <p>A consented permission does not bypass Conditional Access, workload-identity policy, user authorization, resource-specific roles, or other controls enforced by the target service.</p>
            <code>grant ≠ unconditional access</code>
          </article>
        </div>

        <GuideCallout tone="warning" title="Treat admin consent as a production access change">
          Tenant-wide consent can create durable access for a workload. Verify publisher and ownership, resolve every permission ID to a readable value, document business need, and use the tenant's approval and least-privilege process. The command examples in this guide intentionally remain read-only.
        </GuideCallout>
      </GuideSection>
    </>
  );
}
