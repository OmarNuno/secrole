import { GuideCallout, GuideCodeBlock, GuideSection } from "./KnowledgeGuideLayout";
import {
  candidateSignInReport,
  sourceCodeSearch,
} from "./mfaMigrationGuideData";

export default function MfaMigrationDiscoverySections() {
  return (
    <>
      <GuideSection
        id="discovery"
        eyebrow="Discovery"
        title="Find candidate user-based automation before it fails"
        intro="Use sign-in evidence, source-code searches, scheduler inventories, and owner interviews together. No single data source can prove every dependency."
      >
        <div className="mfa-discovery-grid">
          <article>
            <span>Sign-in evidence</span>
            <h3>Affected application IDs</h3>
            <p>Search Microsoft Entra user sign-ins for the Azure portal, Azure CLI, Azure PowerShell, and Azure mobile app IDs published by Microsoft.</p>
          </article>
          <article>
            <span>Code and configuration</span>
            <h3>Username/password patterns</h3>
            <p>Search repositories, job definitions, variable groups, vault references, and configuration files for user-credential authentication APIs.</p>
          </article>
          <article>
            <span>Execution inventory</span>
            <h3>Schedulers and hosts</h3>
            <p>Review Windows Task Scheduler, services, runbooks, CI/CD systems, VM extensions, orchestration platforms, and jump hosts.</p>
          </article>
          <article>
            <span>Human evidence</span>
            <h3>Owner and support confirmation</h3>
            <p>Require technical and business owners to identify purpose, schedule, dependencies, target resources, failure impact, and retirement criteria.</p>
          </article>
        </div>

        <GuideCodeBlock
          title="Export user identities that signed in to Microsoft's affected applications"
          code={candidateSignInReport}
        />

        <GuideCallout tone="warning" title="Candidate list, not final truth">
          A matching sign-in shows that a user identity accessed an affected client application. It does not prove the account is unattended automation. Conversely, ARM REST or SDK activity may require Azure Activity Logs, workload logs, secret-store evidence, and code review because those paths do not always map neatly to one published client Application ID.
        </GuideCallout>

        <GuideCodeBlock
          title="Search automation repositories for legacy user-password patterns"
          code={sourceCodeSearch}
        />

        <div className="mfa-inventory-fields">
          <h3>Minimum inventory record for every candidate</h3>
          <div>
            {[
              "User account and Entra Object ID",
              "On-premises sAMAccountName and sync state",
              "Host, scheduler, service, or pipeline",
              "Repository and script path",
              "Business owner and technical owner",
              "Backup owner and support team",
              "Target subscriptions, resources, and APIs",
              "Current directory roles, Azure RBAC, and grants",
              "Credential source and rotation process",
              "Schedule, failure impact, and rollback path",
            ].map((item, index) => (
              <span key={item}><b>{index + 1}</b>{item}</span>
            ))}
          </div>
        </div>
      </GuideSection>

      <GuideSection
        id="decision-tree"
        eyebrow="Target identity"
        title="Choose the replacement based on where the workload runs"
        intro="Select the authentication model from the runtime environment and trust boundary—not from what is easiest to copy from the old user account."
      >
        <div className="mfa-decision-grid">
          <article className="preferred">
            <span>Workload runs in Azure</span>
            <h3>Managed identity</h3>
            <p>Use a system-assigned or user-assigned managed identity when the Azure hosting service and target resource support Microsoft Entra authentication.</p>
            <strong>No customer-managed secret</strong>
          </article>
          <article className="preferred">
            <span>External platform supports OIDC</span>
            <h3>Workload identity federation</h3>
            <p>Trust a constrained external issuer, subject, and audience for GitHub Actions, Kubernetes, AWS, Google Cloud, Azure Pipelines, or another supported platform.</p>
            <strong>Secretless token exchange</strong>
          </article>
          <article>
            <span>External workload cannot federate</span>
            <h3>Certificate-backed service principal</h3>
            <p>Use an application and service principal with a protected private key, monitored expiration, documented rotation, and least-privilege authorization.</p>
            <strong>Preferred credential fallback</strong>
          </article>
          <article className="temporary">
            <span>Interim compatibility only</span>
            <h3>Client-secret service principal</h3>
            <p>Use only when stronger options are unavailable. Store the value securely, alert before expiration, limit lifetime, and document the planned exit.</p>
            <strong>Temporary migration state</strong>
          </article>
        </div>

        <div className="mfa-decision-rule">
          <strong>Identity selection rule</strong>
          <p>Azure-hosted and supported → managed identity. External and OIDC-capable → federation. External without federation → certificate-backed service principal. Client secret → documented exception and short-lived bridge.</p>
        </div>
      </GuideSection>
    </>
  );
}
