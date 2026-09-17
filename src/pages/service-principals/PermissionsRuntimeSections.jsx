import { GuideCallout, GuideCodeBlock, GuideSection } from "./KnowledgeGuideLayout";
import {
  graphPermissions,
  powershellPermissions,
  powershellRequested,
  tokenClaims,
} from "./permissionsGuideData";

export default function PermissionsRuntimeSections() {
  return (
    <>
      <GuideSection
        id="token-evidence"
        eyebrow="Runtime evidence"
        title="The access token proves what the client presented to one resource"
        intro="Decode claims for troubleshooting, but validate the token correctly at the receiving API. A decoded payload alone is not proof that the signature, issuer, audience, lifetime, or policy is valid."
      >
        <div className="kg-token-grid">
          <article className="kg-token-card"><span>Target resource</span><h3><code>aud</code></h3><p>The audience must identify the API receiving the token. A valid token for Microsoft Graph cannot authorize a different API.</p><code>audience / resource</code></article>
          <article className="kg-token-card"><span>Tenant context</span><h3><code>tid</code></h3><p>The tenant that issued the token. Compare it with the tenant where the expected service principal and grant records exist.</p><code>directory boundary</code></article>
          <article className="kg-token-card"><span>Client application</span><h3><code>appid</code> or <code>azp</code></h3><p>Identifies the client application that obtained the token. Claim availability can vary by token version and flow.</p><code>client appId</code></article>
          <article className="kg-token-card"><span>Subject identity</span><h3><code>oid</code> and <code>sub</code></h3><p>Help identify the user or service principal represented by the token. Interpret them in the token's tenant and flow context.</p><code>principal evidence</code></article>
          <article className="kg-token-card"><span>Delegated access</span><h3><code>scp</code></h3><p>Contains space-delimited delegated permission values presented when a client acts on behalf of a user.</p><code>delegated scopes</code></article>
          <article className="kg-token-card"><span>Application access</span><h3><code>roles</code></h3><p>Contains app-role values assigned to the client for the target resource in an app-only authorization scenario.</p><code>application roles</code></article>
        </div>

        <GuideCallout tone="info" title="Token evidence is a point-in-time view">
          Tokens can remain usable until expiration after a grant is changed, and a client may reuse cached tokens. After consent or permission changes, acquire a new token and compare its audience, tenant, client, scopes, and roles with the directory grant records.
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="commands"
        eyebrow="Copy & run"
        title="Investigate requested, granted, and presented access without changing the tenant"
        intro="These commands are read-only. Resolve the correct tenant and client service principal before interpreting grant relationships."
      >
        <div className="kg-code-stack">
          <GuideCodeBlock title="Read configured API permissions from the application object" code={powershellRequested} />
          <GuideCodeBlock title="Read application and delegated grants from the client service principal" code={powershellPermissions} />
          <GuideCodeBlock title="Read the same evidence with Microsoft Graph REST" code={graphPermissions} language="Microsoft Graph REST" />
          <GuideCodeBlock title="Decode selected JWT payload claims for troubleshooting" code={tokenClaims} />
        </div>

        <GuideCallout tone="warning" title="Decoding is not token validation">
          The JWT example only displays payload claims. Production APIs must validate signature, issuer, audience, lifetime, token version, and required authorization claims with supported identity-platform middleware or equivalent validated logic.
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="troubleshooting"
        eyebrow="Decision sequence"
        title="Troubleshoot authorization in the same order every time"
        intro="Avoid jumping directly to admin consent. Prove the object, request, grant, token, and resource decision in sequence."
      >
        <ol className="kg-checklist">
          <li><span>1</span><div><strong>Confirm tenant, Application ID, and object type.</strong> Resolve the application object and the tenant-local client service principal. Do not rely on display name or an Object ID copied from another tenant.</div></li>
          <li><span>2</span><div><strong>Confirm the requested permission.</strong> Resolve <code>requiredResourceAccess.resourceAppId</code> to the resource API and map each permission GUID to a delegated scope or application-role definition.</div></li>
          <li><span>3</span><div><strong>Confirm the grant record.</strong> Inspect <code>appRoleAssignments</code> for application permissions or <code>oauth2PermissionGrants</code> for delegated permissions. Verify client, resource, permission, consent type, and user scope.</div></li>
          <li><span>4</span><div><strong>Acquire a new token.</strong> Eliminate cached-token ambiguity after consent, role, secret, certificate, or policy changes.</div></li>
          <li><span>5</span><div><strong>Inspect runtime claims.</strong> Verify <code>aud</code>, <code>tid</code>, client identity, and the expected <code>scp</code> or <code>roles</code> value. Do not treat a claim from the wrong resource token as valid evidence.</div></li>
          <li><span>6</span><div><strong>Check user and assignment controls.</strong> For delegated or interactive scenarios, confirm the user's own authorization, Enterprise Application assignment, sign-in audience, and Conditional Access.</div></li>
          <li><span>7</span><div><strong>Check resource-specific authorization.</strong> The API can require additional roles, ownership, licenses, resource-scoped assignments, mailbox/application-access policy, or other service controls.</div></li>
          <li><span>8</span><div><strong>Use the error as evidence.</strong> Record the correlation ID, timestamp, token endpoint or API endpoint, HTTP status, error code, tenant, and client ID before changing permissions.</div></li>
        </ol>
      </GuideSection>
    </>
  );
}
