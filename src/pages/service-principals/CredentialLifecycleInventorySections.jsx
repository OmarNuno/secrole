import { GuideCallout, GuideCodeBlock, GuideSection } from "./KnowledgeGuideLayout";
import { statusBands } from "./credentialLifecycleGuideData";
import {
  credentialInventoryPowerShell,
  graphInventoryRest,
  ownerEnrichmentPowerShell,
} from "./credentialLifecycleInventoryCode";

export default function CredentialLifecycleInventorySections() {
  return (
    <>
      <GuideSection
        id="inventory"
        eyebrow="Tenant-wide discovery"
        title="Build one report from both application and service-principal credentials"
        intro="Start with credential metadata only. Do not retrieve, copy, or expose secret values or private keys during discovery."
      >
        <div className="cl-inventory-principles">
          <article>
            <span>Scope</span>
            <h3>Read both object collections</h3>
            <p>Query <code>applications</code> and <code>servicePrincipals</code>. A report that reads only App registrations can miss tenant-local credentials.</p>
          </article>
          <article>
            <span>Efficiency</span>
            <h3>Select only required properties</h3>
            <p>Large tenants should request IDs, names, credential arrays, and service-principal type first. Enrich owners only for the at-risk subset.</p>
          </article>
          <article>
            <span>Evidence</span>
            <h3>Preserve the object location</h3>
            <p>The same Application ID can be associated with multiple directory objects. Record object type and Object ID beside every credential keyId.</p>
          </article>
          <article>
            <span>Safety</span>
            <h3>Metadata is not the credential</h3>
            <p>The inventory should contain expiration, keyId, hint, thumbprint, type, and usage—but never a secret value or private key.</p>
          </article>
        </div>

        <GuideCodeBlock
          title="Export every application and service-principal secret and certificate"
          code={credentialInventoryPowerShell}
        />

        <div className="cl-output-grid">
          <article>
            <span>Identity fields</span>
            <ul>
              <li>Object type and Object ID</li>
              <li>Application ID</li>
              <li>Display name</li>
              <li>Service-principal type</li>
            </ul>
          </article>
          <article>
            <span>Credential fields</span>
            <ul>
              <li>Secret or certificate</li>
              <li>Credential display name</li>
              <li>Credential keyId</li>
              <li>Hint or certificate thumbprint</li>
            </ul>
          </article>
          <article>
            <span>Lifecycle fields</span>
            <ul>
              <li>Start and end time in UTC</li>
              <li>Days remaining</li>
              <li>Expiration bucket</li>
              <li>Key type and usage</li>
            </ul>
          </article>
        </div>

        <GuideCallout tone="warning" title="Do not add one owner lookup per object to the first full-tenant pass">
          In a large directory, per-object owner calls can turn a simple inventory into thousands of additional Graph requests. Export the credential metadata first, then enrich only expired, nonexpiring, or soon-to-expire objects.
        </GuideCallout>

        <GuideCodeBlock
          title="Enrich owners only for the at-risk subset"
          code={ownerEnrichmentPowerShell}
        />

        <GuideCodeBlock
          title="Equivalent Microsoft Graph REST collections"
          code={graphInventoryRest}
          language="Microsoft Graph REST"
        />
      </GuideSection>

      <GuideSection
        id="prioritization"
        eyebrow="Backlog triage"
        title="Expiration date is only one part of priority"
        intro="Combine time remaining with business criticality, privilege, credential type, owner quality, runtime evidence, and compromise indicators."
      >
        <div className="cl-priority-grid">
          {statusBands.map((band, index) => (
            <article className={`priority-${index + 1}`} key={band.title}>
              <span>{band.title}</span>
              <h3>{band.window}</h3>
              <p>{band.response}</p>
            </article>
          ))}
        </div>

        <div className="cl-risk-factors">
          <header>
            <span>Increase urgency when</span>
            <h3>The credential has more impact than its date suggests</h3>
          </header>
          <ul>
            <li><strong>Broad privilege</strong><span>Directory roles, subscription-wide RBAC, tenant-wide Graph access, or sensitive data-plane roles.</span></li>
            <li><strong>Weak accountability</strong><span>No owner, disabled owner, only one owner, or no support team and escalation path.</span></li>
            <li><strong>Poor provenance</strong><span>Unknown creator, ambiguous workload, generic display name, or no mapping to a runtime host.</span></li>
            <li><strong>High exposure</strong><span>Secret in source code, pipeline variables, local files, shared accounts, email, tickets, or broad-access secret stores.</span></li>
            <li><strong>Unexplained change</strong><span>Credential added outside a change window, unexpected thumbprint, or no matching deployment event.</span></li>
            <li><strong>Business concentration</strong><span>One credential supports multiple production systems or a user-assigned identity boundary is shared too widely.</span></li>
          </ul>
        </div>

        <div className="cl-dependency-record">
          <h3>Minimum dependency record for every active credential</h3>
          <div>
            <span>Directory</span>
            <p>Object type, Object ID, Application ID, keyId, display name, start and end dates.</p>
          </div>
          <div>
            <span>Runtime</span>
            <p>Host, application, scheduled task, service, pipeline, runbook, container, or integration that consumes it.</p>
          </div>
          <div>
            <span>Storage</span>
            <p>Key Vault secret name and version, certificate store path, HSM key, pipeline connection, or approved equivalent.</p>
          </div>
          <div>
            <span>Ownership</span>
            <p>Technical owner, backup owner, business owner, support team, and escalation contact.</p>
          </div>
          <div>
            <span>Authorization</span>
            <p>Azure RBAC, directory roles, API grants, resource roles, groups, databases, and downstream ACLs.</p>
          </div>
          <div>
            <span>Recovery</span>
            <p>Rotation procedure, validation evidence, rollback trigger, maintenance window, and decommission date.</p>
          </div>
        </div>
      </GuideSection>
    </>
  );
}
