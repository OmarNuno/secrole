import { GuideCallout, GuideSection } from "./KnowledgeGuideLayout";

export default function PermissionsModelSections() {
  return (
    <>
      <GuideSection
        id="access-model"
        eyebrow="Authorization model"
        title="Four stages separate configuration from real access"
        intro="An app can request a permission, receive consent, have a directory grant record, and still fail at runtime. Treat each stage as separate evidence."
      >
        <div className="kg-flow">
          <article>
            <span>01</span>
            <h3>Requested</h3>
            <code>application.requiredResourceAccess</code>
            <p>The app registration lists resource APIs plus delegated scopes or application roles that the developer wants the app to request.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Consented</h3>
            <code>user, administrator, or policy decision</code>
            <p>The tenant evaluates permission type, consent policy, publisher, administrator authority, and the user context before approving access.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Recorded</h3>
            <code>appRoleAssignments / oauth2PermissionGrants</code>
            <p>Microsoft Entra stores the resulting application-permission assignment or delegated OAuth grant against tenant-local service principals.</p>
          </article>
          <article>
            <span>04</span>
            <h3>Presented and enforced</h3>
            <code>access-token claims + resource authorization</code>
            <p>The workload presents a token whose audience, tenant, client, scopes, or roles must satisfy the receiving API and its own authorization policy.</p>
          </article>
        </div>

        <GuideCallout tone="warning" title="Configured does not mean granted">
          The API permissions list under App registrations is evidence of requested access. It is not proof that the tenant created a grant, that a new token contains the permission, or that the target API accepts the request.
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="permission-types"
        eyebrow="Permission types"
        title="Delegated permissions and application permissions authorize different actors"
        intro="Start by identifying whether the workload acts with a signed-in user or as the application itself. That determines the grant record and expected token claim."
      >
        <div className="kg-model-grid">
          <article className="kg-model-card">
            <span>Delegated access</span>
            <h3>User plus client application</h3>
            <p>The app calls an API on behalf of a signed-in user. Effective access is constrained by the delegated grant, the user's own permissions, tenant policy, and the resource API.</p>
            <code>oauth2PermissionGrant → access token scp claim</code>
          </article>
          <article className="kg-model-card">
            <span>Application access</span>
            <h3>Client application without a user</h3>
            <p>The workload calls an API as itself, commonly through the client-credentials flow. Application permissions require administrator consent and can provide durable background access.</p>
            <code>appRoleAssignment → access token roles claim</code>
          </article>
          <article className="kg-model-card">
            <span>Resource boundary</span>
            <h3>The target API defines the permission</h3>
            <p>Delegated scopes and application roles are exposed by the resource application's service principal. The client receives a grant to those resource-defined permissions.</p>
            <code>resource service principal + permission definition ID</code>
          </article>
        </div>

        <div className="kg-table-wrap" role="region" aria-label="Delegated and application permission comparison" tabIndex="0">
          <table className="kg-table">
            <thead>
              <tr><th>Question</th><th>Delegated permission</th><th>Application permission</th></tr>
            </thead>
            <tbody>
              <tr><th>Who is acting?</th><td>A client application with a signed-in user</td><td>The client application itself</td></tr>
              <tr><th>Typical OAuth flow</th><td>Authorization code, device code, or another user-delegated flow</td><td>Client credentials or another app-only workload flow</td></tr>
              <tr><th>Directory grant record</th><td><code>oauth2PermissionGrant</code></td><td><code>appRoleAssignment</code></td></tr>
              <tr><th>Expected token claim</th><td><code>scp</code></td><td><code>roles</code></td></tr>
              <tr><th>Consent authority</th><td>User consent when tenant policy permits, otherwise administrator consent</td><td>Administrator consent</td></tr>
              <tr><th>Effective authorization</th><td>Grant plus user authorization plus resource policy</td><td>Assigned app role plus resource policy</td></tr>
            </tbody>
          </table>
        </div>
      </GuideSection>
    </>
  );
}
