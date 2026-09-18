import { GuideCallout, GuideCodeBlock, GuideSection } from "./KnowledgeGuideLayout";
import { dotnetManagedIdentity, pythonManagedIdentity } from "./managedIdentityGuideData";

export default function ManagedIdentityFoundationSections() {
  return (
    <>
      <GuideSection
        id="token-flow"
        eyebrow="Token acquisition"
        title="The platform proves the workload identity; your code requests the token"
        intro="A managed identity replaces a stored credential with an Azure-controlled token endpoint. The source resource authenticates locally to Azure, then Microsoft Entra issues a token for the requested target resource."
      >
        <div className="mi-token-flow" aria-label="Managed identity token flow">
          <article>
            <span>1</span>
            <small>Source</small>
            <h3>Azure-hosted workload</h3>
            <p>Code runs on a VM, App Service, Function, Logic App, container platform, or another supported Azure host.</p>
          </article>
          <b aria-hidden="true">→</b>
          <article>
            <span>2</span>
            <small>Platform</small>
            <h3>Managed identity endpoint</h3>
            <p>Azure validates that the workload is running on the assigned resource. No client secret or private key is exposed to the application.</p>
          </article>
          <b aria-hidden="true">→</b>
          <article>
            <span>3</span>
            <small>Identity provider</small>
            <h3>Microsoft Entra token</h3>
            <p>Microsoft Entra issues a short-lived access token for the requested audience or scope.</p>
          </article>
          <b aria-hidden="true">→</b>
          <article>
            <span>4</span>
            <small>Target</small>
            <h3>Resource authorization</h3>
            <p>The target evaluates Azure RBAC, app roles, database roles, resource ACLs, or its own authorization policy.</p>
          </article>
        </div>

        <div className="mi-prerequisite-grid">
          <article><span>Source support</span><strong>The Azure host must support managed identity</strong><p>Support and configuration differ by resource provider. Verify the exact source resource and deployment mode.</p></article>
          <article><span>Target support</span><strong>The target must accept Microsoft Entra tokens</strong><p>Managed identity cannot directly authenticate to a target that only accepts keys, passwords, or another unsupported protocol.</p></article>
          <article><span>Authorization</span><strong>The identity needs a separate grant</strong><p>Create the identity first, then grant only the data-plane or control-plane access the workload actually needs.</p></article>
          <article><span>Identity selection</span><strong>Choose the expected identity explicitly</strong><p>When a host has multiple identities, supply the user-assigned client ID, object ID, or resource ID supported by the SDK.</p></article>
        </div>

        <GuideCallout tone="info" title="Managed identity is not a portable password">
          The workload does not receive a reusable secret that can be copied to another machine. The identity works because the Azure platform can prove where the code is running and which managed identity is assigned to that host.
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="authorization"
        eyebrow="Permission model"
        title="Grant access at the target, and keep the source host inside the threat model"
        intro="A managed identity can receive the same kinds of durable workload privilege as other service principals. Inventory every authorization plane instead of stopping at the Identity blade."
      >
        <div className="mi-auth-surface-grid">
          <article><span>Azure control plane</span><h3>Azure RBAC</h3><p>Management-plane roles at management group, subscription, resource group, or resource scope.</p><code>Microsoft.Authorization/roleAssignments</code></article>
          <article><span>Azure data plane</span><h3>Service-specific data roles</h3><p>Storage data roles, Key Vault data-plane RBAC, Service Bus roles, and other resource-specific permissions.</p><code>target service authorization</code></article>
          <article><span>Microsoft APIs</span><h3>Application app roles</h3><p>Microsoft Graph or another API can grant application permissions to the managed-identity service principal through app-role assignments.</p><code>appRoleAssignments</code></article>
          <article><span>Databases and applications</span><h3>Local roles and ACLs</h3><p>SQL users, Cosmos DB roles, application roles, object ACLs, and custom authorization still require explicit configuration.</p><code>resource-specific access</code></article>
          <article><span>Directory</span><h3>Groups and directory roles</h3><p>Managed identities can participate in directory authorization, but broad group or directory-role assignment should be treated as privileged and reviewed carefully.</p><code>transitive privilege</code></article>
          <article><span>Source host</span><h3>Code execution and identity assignment</h3><p>A person who can execute code on the source can use attached identities; a person who can attach the identity elsewhere can expand where it is usable.</p><code>source-resource control</code></article>
        </div>

        <div className="mi-latency-panel">
          <div>
            <span>Authorization-change latency</span>
            <h3>Group and role membership changes can take hours</h3>
            <p>Azure infrastructure caches managed-identity tokens per resource URI. Microsoft documents a backend cache around 24 hours, so group or role membership changes might not appear immediately and cannot be forced to refresh on demand.</p>
          </div>
          <div>
            <span>Operational recommendation</span>
            <h3>Use direct grants for time-sensitive changes</h3>
            <p>When rapid permission changes are required, grant the narrow role directly to the intended user-assigned identity rather than changing a group membership that must flow into cached token claims.</p>
          </div>
        </div>

        <GuideCallout tone="warning" title="Deletion does not clean up every authorization record">
          Deleting a managed identity does not automatically delete its Azure role assignments. Decommissioning must remove orphaned assignments, stale group membership, API app-role assignments, database principals, and resource-specific permissions. Portal entries can remain as <em>Identity not found</em>, while PowerShell can show <code>ObjectType</code> as <code>Unknown</code>.
        </GuideCallout>

        <div className="kg-code-stack mi-sdk-examples">
          <GuideCodeBlock title="Use a deterministic user-assigned managed identity in .NET" code={dotnetManagedIdentity} language="C# / Azure.Identity" />
          <GuideCodeBlock title="Use a deterministic user-assigned managed identity in Python" code={pythonManagedIdentity} language="Python / azure-identity" />
        </div>

        <GuideCallout tone="success" title="Use deterministic production credentials">
          <code>DefaultAzureCredential</code> is excellent for development convenience, but a production credential chain can silently fall through to an unexpected developer or CLI identity. Microsoft recommends selecting the production credential explicitly—for example, <code>ManagedIdentityCredential</code> with the expected user-assigned client ID—and using a separate development credential strategy locally.
        </GuideCallout>
      </GuideSection>
    </>
  );
}
