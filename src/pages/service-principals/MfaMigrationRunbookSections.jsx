import { GuideCallout, GuideCodeBlock, GuideSection } from "./KnowledgeGuideLayout";
import { migrationRecordTemplate } from "./mfaMigrationGuideData";

const runbookSteps = [
  ["Discover", "Find user identities, scripts, hosts, schedules, affected endpoints, and username-password flows."],
  ["Assign ownership", "Name the technical owner, business owner, backup owner, support team, and cutover approver."],
  ["Classify the runtime", "Decide whether the workload is Azure-hosted, external OIDC-capable, external without federation, or hybrid on-prem/cloud."],
  ["Choose the target identity", "Select managed identity, workload federation, certificate-backed service principal, or a documented short-lived secret bridge."],
  ["Map current access", "Inventory Azure RBAC, directory roles, API grants, groups, resource roles, and on-premises dependencies."],
  ["Design least privilege", "Grant only the operations and resource scopes required by the workload's tested behavior."],
  ["Update the code", "Replace user authentication, remove username/password variables, update deployment, and add useful workload logging."],
  ["Test outside production", "Validate token acquisition, authorization, resource operations, negative tests, failure behavior, and observability."],
  ["Run controlled parallel validation", "Compare outputs from the old and new identities without creating duplicate writes or conflicting jobs."],
  ["Cut over", "Move the schedule or service to the workload identity during an approved change window."],
  ["Monitor", "Review workload sign-ins, Azure Activity, target-resource logs, job output, and business results."],
  ["Remove cloud access from the user", "Revoke Azure RBAC, directory roles, API grants, cloud groups, and stored cloud credentials."],
  ["Retire or constrain the old account", "Disable or delete when no dependency remains; otherwise retain only documented on-premises rights."],
];

export default function MfaMigrationRunbookSections() {
  return (
    <>
      <GuideSection
        id="cutover-runbook"
        eyebrow="Migration runbook"
        title="Use an evidence-based cutover sequence"
        intro="The goal is not only to make authentication succeed. The goal is to preserve service, reduce privilege, remove the old cloud dependency, and leave a supportable operating model."
      >
        <ol className="mfa-runbook">
          {runbookSteps.map(([title, detail], index) => (
            <li key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><strong>{title}</strong><p>{detail}</p></div>
            </li>
          ))}
        </ol>

        <GuideCallout tone="warning" title="Parallel does not mean duplicate writes">
          When comparing old and new identities, use dry-run modes, read-only checks, isolated test targets, idempotent operations, or mutually exclusive schedules. Do not let two production writers race against the same resource.
        </GuideCallout>

        <GuideCodeBlock
          title="Migration record template for change control and owner sign-off"
          code={migrationRecordTemplate}
          language="Documentation template"
        />
      </GuideSection>

      <GuideSection
        id="validation"
        eyebrow="Exit criteria"
        title="Prove the new identity works and the old user no longer controls Azure"
        intro="A successful test run is necessary but not sufficient. Close the migration only when access, ownership, observability, rollback, and retirement evidence are complete."
      >
        <div className="mfa-validation-grid">
          <article>
            <span>Authentication</span>
            <h3>Token acquisition is noninteractive</h3>
            <p>No username, password, cached user session, device-code prompt, or MFA challenge is required by the production job.</p>
          </article>
          <article>
            <span>Authorization</span>
            <h3>Least privilege is proven</h3>
            <p>The workload can perform required operations and fails safely when attempting unapproved operations or scopes.</p>
          </article>
          <article>
            <span>Operations</span>
            <h3>Business output matches</h3>
            <p>Schedules, runtime duration, return codes, generated artifacts, alerts, and downstream outcomes meet the agreed test criteria.</p>
          </article>
          <article>
            <span>Observability</span>
            <h3>Logs identify the workload identity</h3>
            <p>Service principal or managed identity sign-ins, Azure Activity, resource logs, and application logs can be correlated.</p>
          </article>
          <article>
            <span>Retirement</span>
            <h3>The user lost cloud privilege</h3>
            <p>Azure RBAC, directory roles, grants, cloud groups, secret references, and scheduled user sign-ins are removed.</p>
          </article>
          <article>
            <span>Governance</span>
            <h3>Owners and review dates exist</h3>
            <p>The new workload identity has accountable human owners, support documentation, credential or federation governance, and a review cadence.</p>
          </article>
        </div>

        <div className="mfa-rollback">
          <h3>Rollback must be designed before cutover</h3>
          <ul>
            <li>Define the exact condition that triggers rollback.</li>
            <li>Preserve the old job configuration only for the approved rollback window.</li>
            <li>Do not restore broad user access when a narrower workload fix is possible.</li>
            <li>Record who can authorize rollback and how evidence will be preserved.</li>
            <li>Set a hard expiration for the rollback path so it does not become the permanent design.</li>
          </ul>
        </div>

        <GuideCallout tone="success" title="Close the project by removing cloud dependence from the user">
          The migration is incomplete if the new workload identity works but the synchronized user still holds Azure roles, API grants, cloud group membership, or active username-password secrets. Remove those paths after the approved validation period.
        </GuideCallout>
      </GuideSection>
    </>
  );
}
