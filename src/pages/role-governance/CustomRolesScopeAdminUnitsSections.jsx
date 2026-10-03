import { Link } from "react-router-dom";
import { GuideCallout, GuideSection } from "../service-principals/KnowledgeGuideLayout";

const scopeCards = [
  {
    label: "Tenant container scope",
    path: "/",
    title: "Organization-wide",
    text: "Supported actions can apply across the tenant. This is the broadest directory scope and requires the strongest justification.",
    boundary: "All supported target objects in the organization",
  },
  {
    label: "Administrative Unit container scope",
    path: "/administrativeUnits/{id}",
    title: "Delegated population",
    text: "Supported user, group, or device actions apply only to objects that are direct members of the selected Administrative Unit.",
    boundary: "Supported members of one Administrative Unit",
  },
  {
    label: "Microsoft Entra resource scope",
    path: "/{resource-object-id}",
    title: "One supported resource",
    text: "The role applies to the selected application registration, Enterprise Application, or other supported Microsoft Entra resource itself.",
    boundary: "The selected resource—not every related object",
  },
];

const auFacts = [
  {
    title: "Supported members",
    text: "Administrative Units can contain users, groups, and devices. A user or device can belong to more than one Administrative Unit.",
  },
  {
    title: "No nesting",
    text: "Administrative Units do not form a hierarchy. Design overlapping boundaries intentionally and inventory every applicable scoped assignment.",
  },
  {
    title: "Management scope—not visibility",
    text: "The scope constrains supported management actions. It does not automatically hide other directory objects from ordinary read access.",
  },
  {
    title: "No tenant-wide settings",
    text: "An AU-scoped administrator cannot use the scoped role to change organization-wide policies such as group naming or expiration settings.",
  },
  {
    title: "Custom role relevance",
    text: "A custom role appears for AU assignment only when it contains at least one supported action relevant to users, groups, or devices.",
  },
  {
    title: "Principals",
    text: "Users, role-assignable groups, and service principals can receive supported role assignments at Administrative Unit scope.",
  },
];

const restrictedComparison = [
  {
    question: "Primary purpose",
    regular: "Limit where delegated administrators can perform supported management actions.",
    restricted: "Protect sensitive member objects from direct modification by administrators outside explicitly scoped paths.",
  },
  {
    question: "Tenant-scoped admin",
    regular: "Can still modify objects when their tenant-wide role permits the operation.",
    restricted: "Direct modification is blocked, even for tenant-scoped Global Administrators, unless appropriate scoped access is established.",
  },
  {
    question: "Creation setting",
    regular: "Standard Administrative Unit.",
    restricted: "isMemberManagementRestricted must be set during creation and cannot be changed later.",
  },
  {
    question: "Governance features",
    regular: "Use supported PIM, access review, lifecycle, and entitlement workflows according to product scope.",
    restricted: "Current restrictions affect PIM, Entitlement Management, Lifecycle Workflows, Access Reviews, role-assignable group membership, and other operations.",
  },
  {
    question: "Recovery authority",
    regular: "Privileged administrators can update membership and scoped assignments according to normal role permissions.",
    restricted: "Global or Privileged Role Administrators can manage the restricted AU and assign scoped access, creating an auditable escalation path.",
  },
];

const restrictedRisks = [
  {
    label: "Automation",
    title: "Existing service accounts can fail",
    text: "Directory automation that previously used tenant-wide permissions can be blocked when it directly modifies a protected member.",
  },
  {
    label: "Support",
    title: "Normal escalation paths can disappear",
    text: "Helpdesk and identity support roles must be explicitly available at the restricted scope before protected objects are migrated.",
  },
  {
    label: "Groups",
    title: "Ownership may not provide recovery",
    text: "Group owners cannot manage protected group membership, and role-assignable groups have additional current restrictions in restricted AUs.",
  },
  {
    label: "Identity governance",
    title: "Lifecycle workflows may break",
    text: "Validate PIM, access review, entitlement, and lifecycle scenarios before using a restricted AU as a general-purpose boundary.",
  },
  {
    label: "Deletion",
    title: "Protection removal is not instant",
    text: "After a restricted AU is deleted, Microsoft documents that protection removal from former members can take time.",
  },
  {
    label: "Capacity",
    title: "Treat the feature as selective",
    text: "The tenant currently supports a limited number of restricted management Administrative Units. Reserve them for genuinely sensitive identities and groups.",
  },
];

const appDelegationExamples = [
  {
    title: "App registration maintenance",
    action: "microsoft.directory/applications/basic/update",
    text: "Allow an application support team to update approved registration properties without granting broad application administration.",
  },
  {
    title: "Credential maintenance",
    action: "microsoft.directory/applications/credentials/update",
    text: "Delegate credential changes only where the workload and key-custody model justify that powerful operation.",
  },
  {
    title: "Enterprise App assignments",
    action: "microsoft.directory/servicePrincipals/appRoleAssignedTo/update",
    text: "Allow an operator to manage user and group assignment for approved Enterprise Applications—organization-wide or for one scoped app.",
  },
];

export default function CustomRolesScopeAdminUnitsSections() {
  return (
    <>
      <GuideSection
        id="scope-map"
        eyebrow="Where the actions apply"
        title="Use one role definition at different directory scopes"
        intro="The custom role definition describes the allowed actions. Each assignment connects that definition to one principal and one scope, so the same role can create very different exposure depending on where it is assigned."
      >
        <div className="crs-scope-grid">
          {scopeCards.map((scope) => (
            <article key={scope.label}>
              <span>{scope.label}</span>
              <code>{scope.path}</code>
              <h3>{scope.title}</h3>
              <p>{scope.text}</p>
              <strong>{scope.boundary}</strong>
            </article>
          ))}
        </div>

        <div className="crs-same-role-model">
          <header>
            <span>One reusable definition</span>
            <h3>Regional User Profile Operator</h3>
            <code>users/basic/update</code>
            <code>users/contactInfo/update</code>
          </header>
          <b aria-hidden="true">→</b>
          <div>
            <article><span>Assignment A</span><strong>Tenant scope</strong><p>Operator can update supported fields across the organization.</p></article>
            <article><span>Assignment B</span><strong>West Region AU</strong><p>Operator can update only direct user members of that Administrative Unit.</p></article>
            <article><span>Assignment C</span><strong>Different principal</strong><p>A separate support team can receive the same role at another approved scope.</p></article>
          </div>
        </div>

        <GuideCallout tone="info" title="Container scope versus resource scope">
          <p>Tenant and Administrative Unit scopes apply supported permissions to objects contained by the scope. A Microsoft Entra resource scope applies the role to the selected object itself and does not automatically extend to related users, members, owners, or applications.</p>
        </GuideCallout>

        <div className="kg-table-wrap">
          <table className="kg-table crs-scope-table">
            <thead><tr><th>Scope question</th><th>Evidence to collect</th><th>Failure to avoid</th></tr></thead>
            <tbody>
              <tr><th>What is the exact directoryScopeId?</th><td>Assignment record, scope type, scope object ID, display name</td><td>Assuming a role is tenant-wide because its definition is visible tenant-wide</td></tr>
              <tr><th>Does the action support that scope?</th><td>Official permission documentation and an in-scope positive test</td><td>Assigning a permission that only works at tenant or another resource scope</td></tr>
              <tr><th>What must fail?</th><td>Out-of-scope target and prohibited operation test cases</td><td>Testing only the approved success path</td></tr>
              <tr><th>Are there alternate access paths?</th><td>Direct, group, active, eligible, and inherited assignments</td><td>Removing one scoped assignment while tenant-wide access remains elsewhere</td></tr>
            </tbody>
          </table>
        </div>
      </GuideSection>

      <GuideSection
        id="administrative-units"
        eyebrow="Delegated populations"
        title="Administrative Units scope management actions—not the whole directory experience"
        intro="Administrative Units are Microsoft Entra management containers for users, groups, and devices. They are not on-premises OUs, nested hierarchies, universal Microsoft 365 boundaries, or automatic visibility filters."
      >
        <div className="crs-au-fact-grid">
          {auFacts.map((fact) => (
            <article key={fact.title}><span>Administrative Unit</span><h3>{fact.title}</h3><p>{fact.text}</p></article>
          ))}
        </div>

        <div className="crs-group-trap">
          <article className="container">
            <span>Administrative Unit</span>
            <h3>North Region Support</h3>
            <strong>Contains the group object</strong>
          </article>
          <b aria-hidden="true">→</b>
          <article className="group">
            <span>Group member of AU</span>
            <h3>North Region Employees</h3>
            <strong>The group can be managed in scope</strong>
          </article>
          <b aria-hidden="true">≠</b>
          <div>
            <article><span>User in group</span><strong>Avery Adams</strong><p>Not automatically an AU member</p></article>
            <article><span>User in group</span><strong>Jordan Lee</strong><p>Not automatically an AU member</p></article>
          </div>
        </div>

        <GuideCallout tone="warning" title="The group-member assumption">
          <p>Adding a group to an Administrative Unit brings the group object into scope, not its members. Add users or devices directly—or use a supported dynamic Administrative Unit membership rule—when the delegated administrator must manage those individual objects.</p>
        </GuideCallout>

        <div className="crs-au-examples">
          <article>
            <span>In-scope group task</span>
            <h3>Update the group or its membership</h3>
            <p>A supported group administrator scoped to the AU can manage the group object and supported membership operations.</p>
          </article>
          <article>
            <span>Out-of-scope user task</span>
            <h3>Reset a group member's password</h3>
            <p>The user must be a direct AU member and the role must support the operation at AU scope.</p>
          </article>
          <article>
            <span>Tenant configuration</span>
            <h3>Change group naming policy</h3>
            <p>Organization-level configuration remains outside the AU-scoped assignment.</p>
          </article>
        </div>

        <div className="crs-read-model">
          <article>
            <span>Scoped management permission</span>
            <h3>Role at Administrative Unit scope</h3>
            <p>Authorizes supported actions against direct members of that scope.</p>
          </article>
          <b aria-hidden="true">+</b>
          <article>
            <span>Directory discovery</span>
            <h3>Sufficient read capability</h3>
            <p>Allows the principal to locate and interpret the target objects.</p>
          </article>
          <b aria-hidden="true">=</b>
          <article className="result">
            <span>Usable administration</span>
            <h3>Scoped operation succeeds</h3>
            <p>Service principals and guest users commonly need tenant-scoped Directory Readers or equivalent read access.</p>
          </article>
        </div>

        <GuideCallout tone="info" title="Service principals and guests need special attention">
          <p>Directory read permissions cannot currently be granted at Administrative Unit scope. A service principal or guest can hold the scoped management role and still fail until sufficient tenant-scoped directory read permission is added. Keep that read grant as narrow as the platform allows and document why it exists.</p>
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="restricted-management"
        eyebrow="Advanced protection boundary"
        title="Use Restricted Management Administrative Units only for genuinely sensitive objects"
        intro="A regular Administrative Unit delegates management. A Restricted Management Administrative Unit additionally blocks direct modification by administrators outside explicitly scoped management paths—even when they hold powerful tenant-wide roles."
      >
        <div className="kg-table-wrap">
          <table className="kg-table crs-restricted-table">
            <thead><tr><th>Design question</th><th>Regular Administrative Unit</th><th>Restricted Management Administrative Unit</th></tr></thead>
            <tbody>
              {restrictedComparison.map((row) => (
                <tr key={row.question}><th>{row.question}</th><td>{row.regular}</td><td>{row.restricted}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="crs-restricted-flow">
          <article>
            <span>Tenant-scoped administrator</span>
            <h3>Global or service administrator</h3>
            <p>Possesses a broad directory role.</p>
          </article>
          <b aria-hidden="true">×</b>
          <article className="protected">
            <span>Protected member</span>
            <h3>Object in restricted AU</h3>
            <p>Direct modification is blocked outside an approved scoped path.</p>
          </article>
          <b aria-hidden="true">→</b>
          <article>
            <span>Recovery and delegation</span>
            <h3>Explicit role at restricted scope</h3>
            <p>Global or Privileged Role Administrators can create the auditable scoped access path.</p>
          </article>
        </div>

        <div className="crs-restricted-risk-grid">
          {restrictedRisks.map((risk) => (
            <article key={risk.title}><span>{risk.label}</span><h3>{risk.title}</h3><p>{risk.text}</p></article>
          ))}
        </div>

        <GuideCallout tone="warning" title="The creation decision is irreversible">
          <p><code>isMemberManagementRestricted</code> must be selected when the Administrative Unit is created and cannot later be toggled. Build a dependency map, test every support and recovery path, and migrate protected objects only after the scoped administrators can perform the real operational tasks.</p>
        </GuideCallout>

        <GuideCallout tone="info" title="Restricted does not mean ungovernable">
          <p>Global and Privileged Role Administrators cannot directly edit protected member objects through their tenant role, but they can manage the restricted AU and assign scoped administrators—including themselves. Monitor those assignment and membership events as privileged escalation evidence.</p>
        </GuideCallout>
      </GuideSection>

      <GuideSection
        id="application-scope"
        eyebrow="One-resource delegation"
        title="Use custom roles to delegate application administration without granting every application"
        intro="Application and Enterprise Application administration is a strong custom-role use case because the role definition can describe one narrow task and the assignment can be limited to one approved resource."
      >
        <div className="crs-app-grid">
          {appDelegationExamples.map((item) => (
            <article key={item.action}>
              <span>Application administration</span>
              <h3>{item.title}</h3>
              <code>{item.action}</code>
              <p>{item.text}</p>
            </article>
          ))}
        </div>

        <div className="crs-app-boundary">
          <article>
            <span>Administrative delegation</span>
            <h3>Custom Microsoft Entra role</h3>
            <p>Controls who can update the application object, service principal, credentials, or user and group assignments.</p>
          </article>
          <b aria-hidden="true">≠</b>
          <article>
            <span>Runtime authorization</span>
            <h3>App roles, consent, and API grants</h3>
            <p>Control what the application, users, or client workload can do when a token is issued and accepted.</p>
          </article>
        </div>

        <GuideCallout tone="success" title="Connect the two SecRole models">
          <p>Use this guide to govern administrative control over the application objects. Use the <Link to="/service-principals/permissions-and-consent">Service Principal Permissions and Admin Consent guide</Link> to reconcile requested permissions, actual grants, token claims, and resource-side authorization.</p>
        </GuideCallout>

        <div className="crs-app-test-grid">
          <article><span>Positive test</span><strong>Manage assignments for the approved Enterprise Application</strong><p>The intended operator can add and remove approved users or groups.</p></article>
          <article><span>Negative test</span><strong>Attempt the same action on another Enterprise Application</strong><p>The resource-scoped assignment should not authorize the operation elsewhere.</p></article>
          <article><span>Privilege test</span><strong>Attempt credential or consent changes</strong><p>Operations not included in the custom role must fail even on the in-scope application.</p></article>
        </div>
      </GuideSection>
    </>
  );
}
