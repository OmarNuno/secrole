import { GuideCallout, GuideCodeBlock, GuideSection } from "./KnowledgeGuideLayout";
import { cliLookup, graphLookup, powershellLookup } from "./identifierGuideData";

export default function IdentifierOperationsSections() {
  return (
    <>
      <GuideSection
        id="multitenant"
        eyebrow="Multitenant model"
        title="Same Application ID, different Object IDs"
        intro="A multitenant application has one application object in its home tenant and a separate service principal in every tenant where the app is represented."
      >
        <div className="kg-multitenant">
          <article className="kg-tenant-card home">
            <span>Home tenant · Adatum</span>
            <h3>Definition and home identity</h3>
            <div className="kg-id-row"><span>Application ID</span><code>7f3b9c21-4e8a-4d6f-bb2c-1a9e0d5c8f42</code></div>
            <div className="kg-id-row"><span>Application Object ID</span><code>a13e6b40-5f7b-4b90-bd6d-87b1888f9f2c</code></div>
            <div className="kg-id-row"><span>Home SP Object ID</span><code>c91d0f72-6d14-4740-9a83-155e87514ab8</code></div>
            <div className="kg-id-row"><span>Tenant ID</span><code>d84c8d9b-6e2f-4ff8-b327-4c9a2bb678d0</code></div>
          </article>
          <div className="kg-multi-arrow" aria-hidden="true">→</div>
          <article className="kg-tenant-card consumer">
            <span>Consumer tenant · Contoso</span>
            <h3>Local identity and local grants</h3>
            <div className="kg-id-row"><span>Application ID</span><code>7f3b9c21-4e8a-4d6f-bb2c-1a9e0d5c8f42</code></div>
            <div className="kg-id-row"><span>Application Object ID</span><code>Not stored here</code></div>
            <div className="kg-id-row"><span>Local SP Object ID</span><code>e44f5a18-f061-49ca-a727-9bb139712d7e</code></div>
            <div className="kg-id-row"><span>Tenant ID</span><code>8272e6b8-54db-4d1e-a237-67dc068ff93a</code></div>
          </article>
        </div>

        <GuideCallout tone="success" title="What remains stable across tenants">
          The Application (client) ID identifies the same software application. The tenant ID and service principal Object ID identify the local directory context and local security principal. Consent, assignments, owners, and enterprise-application settings are evaluated locally.
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="commands"
        eyebrow="Copy & run"
        title="Resolve the IDs without changing the tenant"
        intro="These examples are read-only. Connect to the tenant you intend to inspect before comparing results."
      >
        <div className="kg-code-stack">
          <GuideCodeBlock title="Resolve application and service principal objects by Application ID" code={powershellLookup} />
          <GuideCodeBlock title="Resolve both object types with Azure CLI" code={cliLookup} language="Azure CLI" />
          <GuideCodeBlock title="Resolve both object types with Microsoft Graph REST" code={graphLookup} language="Microsoft Graph REST" />
        </div>
      </GuideSection>

      <GuideSection
        id="common-mistakes"
        eyebrow="Failure patterns"
        title="Common identifier mistakes"
        intro="Most errors become obvious when the value is labeled with its object type and tenant before it is copied into another system."
      >
        <div className="kg-mistake-grid">
          <article className="kg-mistake-card"><span>Configuration</span><h3>Putting an Object ID in <code>client_id</code></h3><p>The token endpoint expects <code>appId</code>. An application or service principal Object ID identifies a directory object, not the OAuth client application.</p></article>
          <article className="kg-mistake-card"><span>Tenant context</span><h3>Using another tenant's service principal ID</h3><p>A tenant-local Object ID resolves only in the directory where that service principal exists. Find the local instance by <code>appId</code> after switching tenants.</p></article>
          <article className="kg-mistake-card"><span>Credentials</span><h3>Confusing secret ID with secret value</h3><p>The credential record's <code>keyId</code> helps inventory and rotate it. Authentication requires the secret value captured at creation time, not the record ID.</p></article>
          <article className="kg-mistake-card"><span>Permissions</span><h3>Confusing an app-role ID with an app ID</h3><p><code>appRoleId</code> identifies one role definition exposed by a resource API. The resource application and service principal have separate identifiers.</p></article>
          <article className="kg-mistake-card"><span>Lookup</span><h3>Searching only by display name</h3><p>Display names can be duplicated or changed. Use the Application ID plus tenant and object type to establish identity before making an access decision.</p></article>
          <article className="kg-mistake-card"><span>Evidence</span><h3>Recording a GUID without its label</h3><p>A GUID alone is weak evidence. Record the property name, resource type, tenant ID, display name, and retrieval time beside every identifier.</p></article>
        </div>
      </GuideSection>
    </>
  );
}
