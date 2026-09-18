import { GuideCallout, GuideCodeBlock, GuideSection } from "./KnowledgeGuideLayout";
import { appFederationCli, githubOidcWorkflow } from "./managedIdentityGuideData";

export default function ManagedIdentityFederationSections() {
  return (
    <GuideSection
      id="federation"
      eyebrow="Workload identity federation"
      title="Trust a short-lived external assertion instead of storing an Entra credential"
      intro="Federation lets an OIDC-capable platform prove the workload identity with its own signed token. Microsoft Entra validates the trust rule and exchanges that assertion for an access token representing an app registration or user-assigned managed identity."
    >
      <div className="mi-federation-flow" aria-label="Workload identity federation token exchange">
        <article>
          <small>External platform</small>
          <h3>OIDC workload token</h3>
          <p>GitHub, Kubernetes, AWS, Google Cloud, Azure Pipelines, SPIFFE/SPIRE, or another trusted issuer creates a short-lived signed assertion.</p>
        </article>
        <b aria-hidden="true">→</b>
        <article>
          <small>Microsoft Entra trust</small>
          <h3>Federated identity credential</h3>
          <p>The configured issuer, subject, and audience must match the incoming token exactly and case-sensitively.</p>
        </article>
        <b aria-hidden="true">→</b>
        <article>
          <small>Token exchange</small>
          <h3>Client-credentials flow</h3>
          <p>The external assertion is presented instead of a client secret or certificate.</p>
        </article>
        <b aria-hidden="true">→</b>
        <article>
          <small>Target access</small>
          <h3>Microsoft Entra access token</h3>
          <p>The workload receives a normal access token containing the tenant, client, audience, roles, and other runtime claims.</p>
        </article>
      </div>

      <div className="mi-trust-grid">
        <article>
          <span>Issuer · iss</span>
          <h3>Who signed the external token?</h3>
          <p>The issuer URL must match the token's <code>iss</code> claim and expose the signing keys Microsoft Entra uses for validation.</p>
        </article>
        <article>
          <span>Subject · sub</span>
          <h3>Which exact workload is trusted?</h3>
          <p>Use the narrowest supported subject: repository plus environment, Kubernetes namespace plus service account, or the exact external workload identity.</p>
        </article>
        <article>
          <span>Audience · aud</span>
          <h3>Was the token intended for this exchange?</h3>
          <p>The common public-cloud value is <code>api://AzureADTokenExchange</code>. National-cloud scenarios can require a different audience.</p>
        </article>
      </div>

      <div className="kg-table-wrap" role="region" aria-label="Federated workload identity target comparison" tabIndex="0">
        <table className="kg-table mi-federation-table">
          <thead>
            <tr><th>Federation target</th><th>Use it when</th><th>Directory shape</th><th>Important consideration</th></tr>
          </thead>
          <tbody>
            <tr><th>App registration</th><td>The workload needs an application object, app-specific API permissions, exposed app roles, or multitenant application behavior</td><td>Application object plus Application-type service principal</td><td>The federated credential is stored on the application object</td></tr>
            <tr><th>User-assigned managed identity</th><td>The workload needs an Azure resource identity with independent lifecycle and no app-registration features</td><td>ManagedIdentity service principal plus Azure identity resource</td><td>Only user-assigned—not system-assigned—managed identities host external federated credentials</td></tr>
            <tr><th>Managed identity as FIC for an app</th><td>Azure-hosted code must act as a specific app registration without storing that app's secret or certificate</td><td>User-assigned managed identity proves the workload; application service principal is the final client identity</td><td>Advanced two-identity design; document both identities and the token-exchange dependency</td></tr>
          </tbody>
        </table>
      </div>

      <div className="mi-scenario-grid">
        <article><span>GitHub Actions</span><h3>Repository, ref, or environment trust</h3><p>Use protected environments and narrow subject rules. The workflow requires <code>id-token: write</code> to request the GitHub OIDC token.</p></article>
        <article><span>Kubernetes</span><h3>Namespace and service-account trust</h3><p>Kubernetes subjects normally use <code>system:serviceaccount:&lt;namespace&gt;:&lt;service-account&gt;</code>. Protect the issuer and service-account binding.</p></article>
        <article><span>AWS or Google Cloud</span><h3>Cross-cloud workload identity</h3><p>Trust the exact external workload identity rather than distributing a Microsoft Entra secret into another cloud.</p></article>
        <article><span>Azure Pipelines</span><h3>Federated ARM service connection</h3><p>Use workload identity federation for the service connection so pipeline authentication does not depend on an expiring client secret.</p></article>
        <article><span>SPIFFE / SPIRE</span><h3>Platform-neutral workload identity</h3><p>Map a specific SPIFFE ID to a federated credential and preserve the workload identity lifecycle outside Azure.</p></article>
        <article><span>Azure compute to app identity</span><h3>Managed identity as the assertion source</h3><p>Use a user-assigned managed identity as a federated credential when Azure code must receive a token as an app registration.</p></article>
      </div>

      <GuideCallout tone="warning" title="Federated trust is a credential boundary">
        Federation removes the reusable secret, but a broad trust rule can still authorize the wrong workload. Microsoft Entra allows a maximum of 20 federated identity credentials per application or user-assigned managed identity. Credential names are immutable, wildcards are not supported, and issuer, subject, and audience comparisons are exact and case-sensitive.
      </GuideCallout>

      <div className="kg-code-stack">
        <GuideCodeBlock title="GitHub Actions sign-in using OpenID Connect" code={githubOidcWorkflow} language="GitHub Actions YAML" />
        <GuideCodeBlock title="Create a GitHub federated credential on an app registration" code={appFederationCli} language="Azure CLI · state changing" />
      </div>

      <GuideCallout tone="info" title="Client ID, tenant ID, and subscription ID are identifiers—not authentication secrets">
        A GitHub workflow can store those values in repository or environment secrets to keep configuration centralized, but the security control is the short-lived GitHub OIDC assertion and the federated trust rule. Protect the repository, workflow, environment approvals, and subject boundary accordingly.
      </GuideCallout>
    </GuideSection>
  );
}
