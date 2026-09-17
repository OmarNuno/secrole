import { GuideCallout, GuideSection } from "./KnowledgeGuideLayout";

export default function IdentifierOverviewSections() {
  return (
    <>
      <GuideSection
        id="quick-answer"
        eyebrow="Start here"
        title="The 15-second answer"
        intro="Identify what the target field is trying to locate: the software application, one directory object, or the directory itself."
      >
        <div className="kg-answer-grid">
          <article className="kg-answer-card">
            <span>Software application</span>
            <h3>Application (client) ID</h3>
            <p>Use <code>appId</code> for <code>client_id</code>, app configuration, and finding every tenant-local instance of the same app.</p>
          </article>
          <article className="kg-answer-card">
            <span>Home-tenant definition</span>
            <h3>Application Object ID</h3>
            <p>Use <code>application.id</code> when a Graph application endpoint or app-registration operation requires the actual directory object.</p>
          </article>
          <article className="kg-answer-card">
            <span>Tenant-local identity</span>
            <h3>Service principal Object ID</h3>
            <p>Use <code>servicePrincipal.id</code> for Enterprise application operations, local assignments, ownership, and many RBAC relationships.</p>
          </article>
          <article className="kg-answer-card">
            <span>Directory context</span>
            <h3>Directory (tenant) ID</h3>
            <p>Use the tenant ID to establish which Microsoft Entra directory owns the objects, grants, policy, and token context you are examining.</p>
          </article>
        </div>

        <div className="kg-decision-banner">
          <strong>Fast decision rule</strong>
          <p><code>client_id</code> means Application ID. A Graph path ending in <code>/{'{id}'}</code> normally means that resource's Object ID. A tenant or authority field means Directory (tenant) ID. When the word <em>principal</em> appears, verify whether it means the local service principal Object ID.</p>
        </div>
      </GuideSection>

      <GuideSection
        id="four-identifiers"
        eyebrow="Object model"
        title="Four identifiers, four different jobs"
        intro="The values are all GUIDs, so their appearance does not reveal their meaning. The resource type and tenant context do."
      >
        <div className="kg-card-grid">
          <article className="kg-card">
            <div className="kg-card-label">Application (client) ID</div>
            <h3>The stable identifier for the app</h3>
            <p>The application object's <code>appId</code> is copied to every Application-type service principal created from that app. It is the value OAuth clients send as <code>client_id</code>.</p>
            <code>application.appId = servicePrincipal.appId</code>
          </article>
          <article className="kg-card">
            <div className="kg-card-label">Application Object ID</div>
            <h3>The home tenant's application object</h3>
            <p>The application's <code>id</code> identifies the app-registration directory object. Another app registration—even with a similar display name—has a different Object ID and Application ID.</p>
            <code>microsoft.graph.application.id</code>
          </article>
          <article className="kg-card">
            <div className="kg-card-label">Service principal Object ID</div>
            <h3>The local Enterprise application identity</h3>
            <p>The service principal's <code>id</code> is unique inside the tenant. Owners, grants, assignments, account state, SSO, provisioning, and local policy attach to this object.</p>
            <code>microsoft.graph.servicePrincipal.id</code>
          </article>
          <article className="kg-card">
            <div className="kg-card-label">Directory (tenant) ID</div>
            <h3>The boundary around local objects and grants</h3>
            <p>The tenant ID identifies the directory being queried or issuing a token. The same Application ID can resolve to a different service principal Object ID when the tenant changes.</p>
            <code>organization.id / tid claim</code>
          </article>
        </div>

        <GuideCallout tone="warning" title="Do not identify an app by display name alone">
          Display names are not guaranteed to be unique and may differ across tenant-local experiences. Preserve the Application ID, object type, Object ID, and tenant ID together in tickets, inventories, and audit evidence.
        </GuideCallout>
      </GuideSection>
    </>
  );
}
