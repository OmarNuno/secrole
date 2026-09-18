import { GuideCallout, GuideSection } from "./KnowledgeGuideLayout";

export default function ManagedIdentityDecisionSections() {
  return (
    <>
      <GuideSection
        id="decision"
        eyebrow="Start with the runtime"
        title="Choose the identity model in this order"
        intro="The safest design follows where the workload runs, whether the host can supply an identity, and whether the identity lifecycle should be unique, shared, or independent."
      >
        <div className="mi-decision-grid">
          <article className="mi-decision-card preferred">
            <span>01 · Azure-hosted</span>
            <h3>Use a managed identity</h3>
            <p>When the Azure host supports managed identity and the target accepts Microsoft Entra tokens, let Azure supply and rotate the identity credential.</p>
            <strong>Best default for Azure workloads</strong>
          </article>
          <article className="mi-decision-card">
            <span>02 · External OIDC workload</span>
            <h3>Use workload identity federation</h3>
            <p>Trust a short-lived assertion from GitHub Actions, Kubernetes, AWS, Google Cloud, Azure Pipelines, SPIFFE/SPIRE, or another compatible issuer.</p>
            <strong>No reusable Entra secret</strong>
          </article>
          <article className="mi-decision-card">
            <span>03 · App identity required</span>
            <h3>Federate to an app registration</h3>
            <p>Use an app registration when the workload needs the application object model, exposed API, multitenant behavior, or an app-specific permission surface.</p>
            <strong>Application service principal</strong>
          </article>
          <article className="mi-decision-card fallback">
            <span>04 · No federation support</span>
            <h3>Use a certificate before a client secret</h3>
            <p>If the platform cannot use managed identity or OIDC federation, use a protected certificate-backed service principal and treat a client secret as a temporary compatibility bridge.</p>
            <strong>Document the exit plan</strong>
          </article>
        </div>

        <div className="mi-decision-path" aria-label="Workload identity decision path">
          <div><span>Runs on supported Azure host?</span><strong>Managed identity</strong></div>
          <b aria-hidden="true">→</b>
          <div><span>One resource and one lifecycle?</span><strong>System-assigned</strong></div>
          <b aria-hidden="true">or</b>
          <div><span>Shared, stable, or preauthorized?</span><strong>User-assigned</strong></div>
        </div>
        <div className="mi-decision-path external" aria-label="External workload federation decision path">
          <div><span>Runs outside Azure?</span><strong>External workload</strong></div>
          <b aria-hidden="true">→</b>
          <div><span>Trusted OIDC token available?</span><strong>Federation</strong></div>
          <b aria-hidden="true">→</b>
          <div><span>Identity target</span><strong>App or user-assigned identity</strong></div>
        </div>

        <GuideCallout tone="success" title="Authentication and authorization are separate">
          Managed identity and federation remove the long-lived credential from the workload. They do not grant access by themselves. The resulting service principal still needs the minimum Azure RBAC, API app roles, database roles, resource ACLs, or other target-specific authorization required for the task.
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="identity-types"
        eyebrow="Managed identity types"
        title="System-assigned and user-assigned identities solve different lifecycle problems"
        intro="Both are special Microsoft Entra service principals whose credentials are managed by Azure. The difference is who owns the lifecycle and how broadly the identity can be attached."
      >
        <div className="kg-table-wrap" role="region" aria-label="System-assigned versus user-assigned managed identity" tabIndex="0">
          <table className="kg-table mi-identity-table">
            <thead>
              <tr><th>Question</th><th>System-assigned</th><th>User-assigned</th></tr>
            </thead>
            <tbody>
              <tr><th>Created as</th><td>Part of one Azure resource</td><td>Standalone Azure resource</td></tr>
              <tr><th>Directory object</th><td>Special service principal</td><td>Special service principal</td></tr>
              <tr><th>Lifecycle</th><td>Created and deleted with the parent resource</td><td>Independent; must be deleted explicitly</td></tr>
              <tr><th>Sharing</th><td>Cannot be shared</td><td>Can be attached to multiple compatible resources</td></tr>
              <tr><th>Preauthorization</th><td>Usually available only after the source resource exists</td><td>Can be created and authorized before compute deployment</td></tr>
              <tr><th>Attribution</th><td>Strong one-resource-to-one-identity mapping</td><td>Actions identify the shared identity; correlate with resource logs to identify the caller</td></tr>
              <tr><th>Best fit</th><td>One resource, unique permissions, and delete-with-resource lifecycle</td><td>Replicated workloads, stable permissions, preprovisioning, or frequently recycled resources</td></tr>
              <tr><th>Main risk</th><td>Identity and role-assignment sprawl at scale</td><td>Every attached resource can use every permission granted to the shared identity</td></tr>
            </tbody>
          </table>
        </div>

        <div className="kg-card-grid mi-boundary-grid">
          <article className="kg-card">
            <div className="kg-card-label">Use system-assigned when</div>
            <h3>The resource is the security boundary</h3>
            <p>Choose it when the workload is contained in one resource, permissions should disappear with that resource, and resource-level attribution is more important than reuse.</p>
          </article>
          <article className="kg-card">
            <div className="kg-card-label">Use user-assigned when</div>
            <h3>The identity needs an independent lifecycle</h3>
            <p>Choose it for preauthorization, repeated deployments, ephemeral compute, controlled reuse, or stable access while the source resources change.</p>
          </article>
          <article className="kg-card">
            <div className="kg-card-label">Do not over-share</div>
            <h3>Reuse only inside one trust boundary</h3>
            <p>A shared identity reduces administration, but it also couples blast radius. Do not attach one broadly privileged identity to unrelated applications, teams, environments, or data classifications.</p>
          </article>
          <article className="kg-card">
            <div className="kg-card-label">Multiple identities</div>
            <h3>Select the expected identity explicitly</h3>
            <p>A resource can support a system-assigned identity plus one or more user-assigned identities. Production code should select the intended identity rather than depend on ambiguous discovery.</p>
          </article>
        </div>

        <GuideCallout tone="warning" title="The source resource becomes part of the credential boundary">
          Anyone who can deploy or execute code on a resource can potentially request tokens for identities attached to that resource. Anyone who can assign a user-assigned identity to another compatible resource may be able to use all permissions already granted to that identity. Review source-resource administration and managed-identity assignment rights as carefully as the target permissions.
        </GuideCallout>
      </GuideSection>
    </>
  );
}
