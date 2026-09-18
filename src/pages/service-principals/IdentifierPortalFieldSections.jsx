import { GuideCallout, GuideSection } from "./KnowledgeGuideLayout";

export default function IdentifierPortalFieldSections() {
  return (
    <>
      <GuideSection
        id="portal-map"
        eyebrow="Portal map"
        title="Where Microsoft Entra shows each value"
        intro="The labels are similar across portal blades, so first confirm whether you opened App registrations or Enterprise applications."
      >
        <div className="kg-portal-grid">
          <article className="kg-portal-card">
            <span>App registrations</span>
            <h3>Application overview</h3>
            <p>Shows the Application (client) ID, the application Object ID, and the Directory (tenant) ID for the registration's home tenant.</p>
            <code>Entra ID → App registrations → application → Overview</code>
          </article>
          <article className="kg-portal-card">
            <span>Enterprise applications</span>
            <h3>Service principal properties</h3>
            <p>Shows the same Application ID plus the tenant-local service principal Object ID. The Object ID here is not the app-registration Object ID.</p>
            <code>Entra ID → Enterprise applications → application → Properties</code>
          </article>
          <article className="kg-portal-card">
            <span>Microsoft Entra overview</span>
            <h3>Directory context</h3>
            <p>Shows the Directory (tenant) ID. Confirm this value before comparing portal screenshots, Graph output, or service principals from different directories.</p>
            <code>Entra ID → Overview → Tenant ID</code>
          </article>
        </div>

        <GuideCallout tone="info" title="Portal label that causes the most mistakes">
          Both App registrations and Enterprise applications display an <strong>Object ID</strong>. Each blade is correct: one is the application object's ID and the other is the service principal's ID. Record the blade or Graph type beside the value.
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="field-decoder"
        eyebrow="Field decoder"
        title="Translate common fields into the ID they require"
        intro="Use the resource name in the API path or property definition instead of guessing from the GUID."
      >
        <div className="kg-table-wrap" role="region" aria-label="Microsoft Entra identifier field decoder" tabIndex="0">
          <table className="kg-table">
            <thead>
              <tr><th>Field or operation</th><th>Use this identifier</th><th>Why</th></tr>
            </thead>
            <tbody>
              <tr><th><code>client_id</code></th><td>Application (client) ID / <code>appId</code></td><td>OAuth identifies the client application, not either directory object's <code>id</code>.</td></tr>
              <tr><th>Authority tenant segment</th><td>Directory (tenant) ID or verified tenant domain</td><td>Selects the directory that authenticates the client or user and issues the token.</td></tr>
              <tr><th><code>/applications/{'{id}'}</code></th><td>Application Object ID</td><td>The normal Graph path addresses one <code>application</code> resource by its <code>id</code>.</td></tr>
              <tr><th><code>/applications(appId='…')</code></th><td>Application (client) ID</td><td>This is the documented alternate-key form for locating the application by <code>appId</code>.</td></tr>
              <tr><th><code>/servicePrincipals/{'{id}'}</code></th><td>Service principal Object ID</td><td>The normal Graph path addresses the tenant-local <code>servicePrincipal</code> resource.</td></tr>
              <tr><th><code>/servicePrincipals(appId='…')</code></th><td>Application (client) ID</td><td>The alternate-key form locates the local service principal by its shared <code>appId</code>.</td></tr>
              <tr><th>Azure RBAC <code>principalId</code></th><td>Service principal Object ID</td><td>For an application workload or managed identity, Azure RBAC assigns access to the local security principal.</td></tr>
              <tr><th><code>requiredResourceAccess.resourceAppId</code></th><td>Target API's Application ID</td><td>The app registration declares which resource application it wants to call.</td></tr>
              <tr><th><code>appRoleAssignment.principalId</code></th><td>Grantee's Object ID</td><td>Identifies the user, group, or service principal receiving the app role.</td></tr>
              <tr><th><code>appRoleAssignment.resourceId</code></th><td>Resource service principal Object ID</td><td>Identifies the tenant-local API service principal exposing the app role.</td></tr>
              <tr><th><code>appRoleAssignment.appRoleId</code></th><td>App-role definition GUID</td><td>This is the ID of one exposed app role—not an application, service principal, or tenant ID.</td></tr>
              <tr><th>Credential <code>keyId</code></th><td>Credential record ID</td><td>Identifies a secret or certificate record. It is not the secret value and cannot authenticate by itself.</td></tr>
            </tbody>
          </table>
        </div>
      </GuideSection>
    </>
  );
}
