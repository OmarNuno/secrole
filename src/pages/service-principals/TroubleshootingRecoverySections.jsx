import { GuideCallout, GuideCodeBlock, GuideSection } from "./KnowledgeGuideLayout";
import {
  errorRows,
  graphBaseline,
  graphDeleted,
  graphEvidence,
  powershellBaseline,
  powershellGrants,
  powershellSignIns,
} from "./troubleshootingGuideData";

export default function TroubleshootingRecoverySections() {
  return (
    <>
      <GuideSection
        id="recovery"
        eyebrow="Deletion and recovery"
        title="Restore the object, then rebuild the operating state"
        intro="Application and service principal recovery can return the directory objects, but successful recovery still requires validation of policy, provisioning, credentials, grants, and workload behavior."
      >
        <div className="kg-card-grid">
          <article className="kg-card">
            <div className="kg-card-label">Recovery window</div>
            <h3>Applications and service principals are soft-deleted</h3>
            <p>Microsoft documents that deleted application and service principal objects remain available to restore for up to 30 days before permanent deletion.</p>
            <code>directory/deletedItems</code>
          </article>
          <article className="kg-card">
            <div className="kg-card-label">Application restore</div>
            <h3>The corresponding service principal can return</h3>
            <p>When an application registration and its corresponding service principal were deleted together, restoring the application registration also restores the service principal.</p>
            <code>restore application → verify both objects</code>
          </article>
          <article className="kg-card">
            <div className="kg-card-label">Policies</div>
            <h3>Service principal policies are not recovered</h3>
            <p>Re-create required policies after restore. Also verify assignment requirements, owners, SSO, provisioning, consent records, and resource-specific authorization.</p>
            <code>object restored ≠ operating state restored</code>
          </article>
          <article className="kg-card">
            <div className="kg-card-label">Managed identities</div>
            <h3>Recovery behavior is different</h3>
            <p>Managed identity service principals are soft-deleted, but Microsoft documents that they cannot be restored or permanently deleted through the same process.</p>
            <code>recreate the Azure identity through its resource lifecycle</code>
          </article>
        </div>

        <ol className="kg-checklist">
          <li><span>1</span><div><strong>Resolve both active objects</strong><br />Confirm the expected Application ID, application Object ID, service principal Object ID, tenant ID, and enabled state.</div></li>
          <li><span>2</span><div><strong>Reconcile credentials and federation</strong><br />Verify secrets, certificates, federated credentials, managed identity configuration, and the deployed workload settings.</div></li>
          <li><span>3</span><div><strong>Reconcile access</strong><br />Review app-role assignments, delegated grants, Azure RBAC, directory roles, resource-specific permissions, and user or group assignments.</div></li>
          <li><span>4</span><div><strong>Rebuild local configuration</strong><br />Restore policies, SSO, provisioning, claims, app proxy, and owner or support metadata that did not return automatically.</div></li>
          <li><span>5</span><div><strong>Prove the workload</strong><br />Run a controlled authentication and authorization test, then confirm sign-in and resource logs before closing the incident.</div></li>
        </ol>

        <GuideCallout tone="info" title="Expect some post-recovery delay">
          Microsoft notes that recovered provisioning data can initially be unavailable and may take from roughly 40 minutes to one day to resolve. App proxy data can also take time to synchronize after API-based recovery.
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="commands"
        eyebrow="Copy & run"
        title="Collect read-only evidence before remediation"
        intro="These examples resolve the objects, grants, sign-ins, and deleted items without changing tenant state. Connect to the tenant where the failing request is expected to run."
      >
        <div className="kg-code-stack">
          <GuideCodeBlock title="Resolve the application and local service principal" code={powershellBaseline} />
          <GuideCodeBlock title="Read application and delegated grants" code={powershellGrants} />
          <GuideCodeBlock title="Read recent sign-in evidence for an Application ID" code={powershellSignIns} />
          <GuideCodeBlock title="Resolve both object types with Microsoft Graph REST" code={graphBaseline} language="Microsoft Graph REST" />
          <GuideCodeBlock title="Read grants and sign-in evidence with Microsoft Graph REST" code={graphEvidence} language="Microsoft Graph REST" />
          <GuideCodeBlock title="Find soft-deleted application and service principal objects" code={graphDeleted} language="Microsoft Graph REST" />
        </div>

        <GuideCallout tone="warning" title="A decoded token is not a validated token">
          Token claims can help identify the tenant, client, audience, scopes, and app roles, but the receiving API must still validate the signature, issuer, audience, lifetime, and applicable policy.
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="error-catalog"
        eyebrow="AADSTS field guide"
        title="Use the error code to choose the troubleshooting branch"
        intro="Microsoft can refine error codes over time. Capture the complete response and use the current Microsoft error lookup rather than building automation that depends on message text."
      >
        <div className="kg-table-wrap" role="region" aria-label="Common service principal AADSTS error codes" tabIndex="0">
          <table className="kg-table">
            <thead>
              <tr><th>Error</th><th>What it indicates</th><th>First checks</th></tr>
            </thead>
            <tbody>
              {errorRows.map(([code, meaning, checks]) => (
                <tr key={code}>
                  <th><code>{code}</code></th>
                  <td>{meaning}</td>
                  <td>{checks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="kg-decision-banner">
          <strong>Current lookup</strong>
          <p>Use <code>https://login.microsoftonline.com/error?code=&lt;number&gt;</code> or the Microsoft Entra error-code reference to check the current description. Preserve the error code, timestamp, trace ID, and correlation ID from the actual response.</p>
        </div>
      </GuideSection>
    </>
  );
}
