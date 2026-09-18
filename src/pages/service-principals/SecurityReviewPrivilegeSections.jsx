import { GuideCallout, GuideSection } from "./KnowledgeGuideLayout";

const privilegeSurfaces = [
  {
    label: "Application permissions",
    title: "App roles granted to the client",
    detail: "Review appRoleAssignments for tenant-wide or high-impact access that the workload can exercise without a signed-in user.",
    field: "servicePrincipal.appRoleAssignments",
  },
  {
    label: "Delegated grants",
    title: "Scopes used on behalf of users",
    detail: "Review oauth2PermissionGrants, consent type, scope strings, resource service principal, and whether one-user or tenant-wide consent is still justified.",
    field: "servicePrincipal.oauth2PermissionGrants",
  },
  {
    label: "Microsoft Entra roles",
    title: "Directory-role membership",
    detail: "A service principal can hold directory roles directly or through supported membership paths. Treat role-management and broad directory-write capabilities as high-impact.",
    field: "transitiveMemberOf / directoryRole",
  },
  {
    label: "Azure RBAC",
    title: "Management-plane access",
    detail: "Inventory role assignments at management-group, subscription, resource-group, and resource scope, including inherited assignments and conditions.",
    field: "Azure roleAssignments",
  },
  {
    label: "Resource-specific access",
    title: "Permissions outside the obvious Graph view",
    detail: "Check workload-specific roles, Exchange and SharePoint permissions, Key Vault access, database roles, Teams resource-specific consent, and target-service policy.",
    field: "resource control plane",
  },
  {
    label: "Group membership",
    title: "Access inherited through groups",
    detail: "Review direct and transitive membership because groups can grant application access, resource roles, custom policy, or ownership outside the Enterprise applications blade.",
    field: "memberOf / transitiveMemberOf",
  },
  {
    label: "Owned objects",
    title: "Objects this principal can administer as owner",
    detail: "Ownership can provide management power over applications, service principals, groups, or other directory objects even when no obvious role assignment is present.",
    field: "ownedObjects",
  },
  {
    label: "Exposed roles",
    title: "Who can access this application",
    detail: "If the service principal represents a resource API or enterprise app, review appRoleAssignedTo, user/group assignments, and appRoleAssignmentRequired separately from roles granted to the client.",
    field: "appRoleAssignedTo",
  },
];

const credentialQuestions = [
  ["Client secrets", "Where is the value stored, how old is it, when does it expire, and can the workload move to a credential-free method?"],
  ["Certificates", "Who controls the private key, what is the issuer and key protection model, and is overlapping rotation tested?"],
  ["Federated credentials", "Are issuer, subject, and audience constrained to the exact external workload, repository, branch, namespace, or service account?"],
  ["Managed identity", "Is the identity attached only to the intended Azure resource and are its Azure and downstream permissions independently least privileged?"],
  ["Service-principal credentials", "Does the local Enterprise application hold credentials or token-signing keys that are not visible on the app registration?"],
  ["Recent credential changes", "Were new secrets, certificates, or federation rules added through an expected process by an authorized actor?"],
];

export default function SecurityReviewPrivilegeSections() {
  return (
    <>
      <GuideSection
        id="privilege-map"
        eyebrow="Privilege inventory"
        title="Map every privilege surface—not only configured API permissions"
        intro="The API permissions page is one input. A complete review follows the service principal into directory roles, Azure RBAC, groups, owned objects, consent records, and the target resource."
      >
        <div className="kg-record-grid sr-privilege-grid">
          {privilegeSurfaces.map((item) => (
            <article className="kg-record-card" key={item.title}>
              <span>{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
              <code>{item.field}</code>
            </article>
          ))}
        </div>

        <GuideCallout tone="warning" title="Read-only can still have a large blast radius">
          Tenant-wide access to mail, files, chats, identities, security findings, or investigation evidence can be highly sensitive even when the permission cannot modify data. Classify confidentiality scope, resource reach, and business impact—not just the Read or Write verb.
        </GuideCallout>

        <div className="kg-decision-banner">
          <strong>Least-privilege test</strong>
          <p>For every grant, identify the exact feature or API call that requires it, confirm current usage, find the least-permissive alternative, and document why any tenant-wide scope cannot be reduced to selected resources, resource-specific consent, a narrower role, or a separate workload identity.</p>
        </div>
      </GuideSection>

      <GuideSection
        id="credentials"
        eyebrow="Authentication posture"
        title="Inventory every credential and trust relationship"
        intro="The service principal is the identity. Secrets, certificates, managed identity, and federation are the mechanisms that let a workload prove it may act as that identity. Review both the application object and service principal."
      >
        <div className="kg-table-wrap" role="region" aria-label="Service principal credential review questions" tabIndex="0">
          <table className="kg-table sr-credential-table">
            <thead><tr><th>Method or evidence</th><th>Review question</th></tr></thead>
            <tbody>
              {credentialQuestions.map(([method, question]) => (
                <tr key={method}><th>{method}</th><td>{question}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sr-credential-posture">
          <article className="best"><span>Preferred when supported</span><h3>Managed identity</h3><p>Azure manages the underlying credential lifecycle. Continue to review attachment, privilege, sign-in evidence, and resource scope.</p></article>
          <article className="best"><span>Preferred for external workloads</span><h3>Workload identity federation</h3><p>Removes the long-lived Entra secret, but a broad issuer or subject match can create its own impersonation path.</p></article>
          <article className="review"><span>Strong with operational discipline</span><h3>Certificate credential</h3><p>Review private-key protection, issuer, key length, expiration, overlap, inventory, and emergency rotation.</p></article>
          <article className="avoid"><span>Higher operational exposure</span><h3>Client secret</h3><p>Review storage, distribution, lifetime, logging, rotation, and whether any old secret remains usable after migration.</p></article>
        </div>

        <GuideCallout tone="info" title="Credential metadata is not credential usage evidence">
          A key ID, start date, and expiration date prove that a credential record exists. They do not prove which deployment uses it, where the private material is stored, or whether an overlapping credential is still needed. Correlate inventory with sign-ins, deployment configuration, secret-store versions, and owner attestation.
        </GuideCallout>
      </GuideSection>
    </>
  );
}
