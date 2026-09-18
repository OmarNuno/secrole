import { GuideCallout, GuideSection } from "./KnowledgeGuideLayout";

export default function TroubleshootingEvidenceSections() {
  return (
    <>
      <GuideSection
        id="evidence"
        eyebrow="Start with evidence"
        title="Capture the request before changing the tenant"
        intro="A screenshot of the portal is not enough. Preserve the identifiers and diagnostic fields that let you correlate the request across Microsoft Entra, the workload, and the target API."
      >
        <ol className="kg-checklist">
          <li><span>1</span><div><strong>Error payload</strong><br />Capture the OAuth error, full <code>error_description</code>, AADSTS code, timestamp in UTC, trace ID, correlation ID, and error URI.</div></li>
          <li><span>2</span><div><strong>Identity context</strong><br />Record Application ID, tenant ID, service principal Object ID when known, display name, object type, and national-cloud environment.</div></li>
          <li><span>3</span><div><strong>Request context</strong><br />Record authority or token endpoint, grant type, requested scope or resource, redirect URI when relevant, and the API endpoint that failed.</div></li>
          <li><span>4</span><div><strong>Change context</strong><br />Record the last successful time, deployment version, recent secret or certificate rotation, consent change, assignment change, policy change, and owner confirmation.</div></li>
        </ol>

        <GuideCallout tone="warning" title="Do not place secrets or complete tokens in tickets">
          Preserve credential IDs, certificate thumbprints, token claim summaries, and correlation data—but redact client secret values, private keys, authorization codes, refresh tokens, and complete access tokens.
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="decision-tree"
        eyebrow="Triage model"
        title="Move through six stages in order"
        intro="Do not jump directly to permissions. First prove the object and tenant, then client authentication, then the grant and token, and finally the target resource's authorization decision."
      >
        <div className="kg-flow">
          <article>
            <span>01</span>
            <h3>Object discovery</h3>
            <code>tenant + appId + object type</code>
            <p>Can Microsoft Graph resolve the application object and the tenant-local service principal in the directory the request targets?</p>
          </article>
          <article>
            <span>02</span>
            <h3>Client authentication</h3>
            <code>secret / certificate / federation</code>
            <p>Did Microsoft Entra accept the credential or federated assertion for this client application?</p>
          </article>
          <article>
            <span>03</span>
            <h3>Consent and grants</h3>
            <code>appRoleAssignments / oauth2PermissionGrants</code>
            <p>Does the target tenant contain the application or delegated grant the workload needs?</p>
          </article>
          <article>
            <span>04</span>
            <h3>Token issuance</h3>
            <code>issuer + audience + client + claims</code>
            <p>Was a token issued by the expected tenant for the expected resource and client?</p>
          </article>
          <article>
            <span>05</span>
            <h3>Resource authorization</h3>
            <code>roles / scp / API policy</code>
            <p>Does the token carry the required role or scope, and does the API accept that permission for the requested object or action?</p>
          </article>
          <article>
            <span>06</span>
            <h3>Assignment and policy</h3>
            <code>accountEnabled + assignment + Conditional Access</code>
            <p>Is the local Enterprise application enabled, correctly assigned, and allowed by tenant and workload-identity policy?</p>
          </article>
        </div>

        <GuideCallout tone="info" title="The first failing stage owns the next action">
          A later symptom can be misleading. For example, a 403 from an API does not prove consent is missing, and an invalid-client error should be resolved before investigating resource RBAC.
        </GuideCallout>
      </GuideSection>
    </>
  );
}
