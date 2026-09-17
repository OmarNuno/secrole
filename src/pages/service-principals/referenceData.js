export const tocItems = [
  { id: "relationship", label: "Object relationship" },
  { id: "identifiers", label: "IDs explained" },
  { id: "comparison", label: "Side-by-side reference" },
  { id: "permissions", label: "Permissions & consent" },
  { id: "types", label: "Service principal types" },
  { id: "authentication", label: "Authentication methods" },
  { id: "governance", label: "Security & governance" },
  { id: "troubleshooting", label: "Troubleshooting" },
  { id: "commands", label: "PowerShell, CLI & Graph" },
  { id: "related-guides", label: "Related guides" },
  { id: "sources", label: "Official sources" },
];

export const quickFacts = [
  { value: "1 → many", label: "One application object can correspond to many tenant-local service principals." },
  { value: "Same appId", label: "The Application (client) ID identifies the same app across tenants." },
  { value: "Different id", label: "Every application object and service principal has its own Object ID." },
  { value: "Grant ≠ request", label: "Configured API permissions are not proof that tenant consent was granted." },
];

export const identifiers = [
  {
    label: "Application (client) ID",
    graph: "application.appId / servicePrincipal.appId",
    example: "7f3b9c21-4e8a-4d6f-bb2c-1a9e0d5c8f42",
    scope: "Stable identity for the software application",
    detail: "Shared by the application object and every Application-type service principal created from it. Use this when you need to find all local instances of the same app.",
    accent: "app",
  },
  {
    label: "Application object ID",
    graph: "application.id",
    example: "a13e6b40-5f7b-4b90-bd6d-87b1888f9f2c",
    scope: "Unique directory object in the home tenant",
    detail: "Identifies the app registration object itself. It is not the client ID and should not be copied into application configuration that expects client_id.",
    accent: "app",
  },
  {
    label: "Service principal object ID",
    graph: "servicePrincipal.id",
    example: "c91d0f72-6d14-4740-9a83-155e87514ab8",
    scope: "Unique local instance in one tenant",
    detail: "This is the Object ID shown under Enterprise applications. RBAC assignments, app-role assignments, owners, and many Graph operations target this ID.",
    accent: "sp",
  },
  {
    label: "Directory (tenant) ID",
    graph: "organization.id / tid claim",
    example: "d84c8d9b-6e2f-4ff8-b327-4c9a2bb678d0",
    scope: "Identifies the Microsoft Entra tenant",
    detail: "Provides the directory context. The same appId can resolve to a different service principal object ID when queried in another tenant.",
    accent: "neutral",
  },
];

export const comparisonRows = [
  ["What it represents", "The definition or blueprint for the software application", "The security principal representing that app in one tenant"],
  ["Tenant scope", "Home tenant", "One specific tenant"],
  ["How many", "One application object per app registration", "One per tenant where the app is represented"],
  ["Portal location", "App registrations", "Enterprise applications"],
  ["Microsoft Graph type", "application", "servicePrincipal"],
  ["Stable app identifier", "appId — Application (client) ID", "appId — copied from the associated application"],
  ["Directory object identifier", "id — application Object ID", "id — service principal Object ID"],
  ["Requested API access", "requiredResourceAccess describes what the app asks for", "Not the authoritative record of what this tenant granted"],
  ["Granted application permissions", "Not stored as the tenant grant", "appRoleAssignments on the client service principal"],
  ["Granted delegated permissions", "Not stored as the tenant grant", "oauth2PermissionGrants associated with the client service principal"],
  ["Assignment and sign-in controls", "Defines app capabilities and registration settings", "Controls local access, assignment requirement, SSO, provisioning, and tenant-specific policy"],
  ["Credentials", "Common home for client secrets, certificates, and federated credentials", "Can also hold credentials in specific enterprise-app and SAML scenarios"],
  ["Owners", "Application owners manage the registration", "Service principal owners manage the local enterprise application"],
];

export const servicePrincipalTypes = [
  {
    type: "Application",
    title: "Application service principal",
    summary: "The tenant-local instance of an app registration. This is the everyday service principal created during registration or consent.",
    backingObject: "Associated application object",
    credentials: "Usually defined on the app registration; tenant-specific enterprise-app configuration also lives here",
    createdBy: "App registration, admin/user consent, gallery provisioning, Graph, CLI, or PowerShell",
    badge: "Most common",
  },
  {
    type: "ManagedIdentity",
    title: "Managed identity service principal",
    summary: "Represents an Azure-managed identity for a workload. Microsoft manages the underlying credentials and rotation.",
    backingObject: "No application object",
    credentials: "No customer-managed secret or certificate",
    createdBy: "Enabling a system-assigned or user-assigned managed identity",
    badge: "Azure workload",
  },
  {
    type: "Legacy",
    title: "Legacy service principal",
    summary: "A tenant-local identity created through older experiences. It can carry editable properties but has no associated modern app registration.",
    backingObject: "No associated application object",
    credentials: "May contain credentials and reply URLs",
    createdBy: "Legacy application experiences",
    badge: "Review carefully",
  },
  {
    type: "ServiceIdentity",
    title: "Agent identity",
    summary: "A specialized service principal used by Microsoft Entra Agent ID so an AI agent can authenticate and receive permissions in the directory.",
    backingObject: "Agent identity blueprint relationship",
    credentials: "Managed through the Agent ID identity model",
    createdBy: "Microsoft Entra Agent ID workflows and APIs",
    badge: "Agent 365",
  },
];

export const authenticationMethods = [
  {
    title: "Managed identity",
    fit: "Azure-hosted workloads",
    posture: "Use first when supported",
    description: "Azure supplies and rotates the identity credentials. The workload requests tokens without storing a client secret or private certificate itself.",
    checks: ["Grant only required resource access", "Use separate identities per workload boundary", "Review both Azure RBAC and Microsoft Graph permissions"],
  },
  {
    title: "Workload identity federation",
    fit: "GitHub Actions, Kubernetes, AWS, Google Cloud, and other OIDC workloads",
    posture: "Secretless federation",
    description: "Microsoft Entra trusts a token from an external identity provider and exchanges it for an Entra access token. No long-lived Microsoft Entra secret is stored in the workload.",
    checks: ["Match issuer, subject, and audience exactly", "Constrain the external identity as tightly as possible", "Review federated credential inventory"],
  },
  {
    title: "Certificate credential",
    fit: "Confidential clients that cannot use managed identity or federation",
    posture: "Preferred over a client secret",
    description: "The application proves possession of a private key while Microsoft Entra stores the public certificate. Rotation and private-key protection are still required.",
    checks: ["Protect the private key", "Track certificate expiration", "Plan overlap during rotation"],
  },
  {
    title: "Client secret",
    fit: "Limited compatibility or short-lived development scenarios",
    posture: "Avoid for production when alternatives exist",
    description: "A shared secret is simple to implement but must be stored, protected, rotated, and recovered before expiration to avoid outage or compromise.",
    checks: ["Never place the value in source control", "Use a secure secret store", "Alert well before expiration"],
  },
];

export const governanceChecks = [
  {
    title: "Purpose and ownership",
    risk: "Ownership",
    description: "Record the business purpose, technical owner, backup owner, support team, and expected lifetime. Microsoft Graph recommends at least two service principal owners.",
  },
  {
    title: "Permission inventory",
    risk: "Privilege",
    description: "Review application permissions, delegated grants, directory-role membership, Azure RBAC, and resource-specific permissions. Do not rely only on the app registration's configured API permissions page.",
  },
  {
    title: "Credential hygiene",
    risk: "Credential",
    description: "Inventory secrets, certificates, and federated credentials. Alert before expiry, remove unused credentials, and prefer managed identity or federation where supported.",
  },
  {
    title: "Usage evidence",
    risk: "Lifecycle",
    description: "Review service principal sign-ins, managed identity sign-ins, audit events, provisioning activity, and workload-owner confirmation before disabling or deleting an identity.",
  },
  {
    title: "Tenant controls",
    risk: "Access",
    description: "Review accountEnabled, appRoleAssignmentRequired, user/group assignments, consent policy, Conditional Access for workload identities, and cross-tenant exposure.",
  },
  {
    title: "Publisher and provenance",
    risk: "Trust",
    description: "Validate publisher information, appOwnerOrganizationId, creation path, gallery/template origin, and whether the identity is Microsoft first-party, third-party, or internally developed.",
  },
];

export const troubleshootingItems = [
  {
    question: "I have an Application (client) ID, but I cannot find the Enterprise application.",
    answer: "Search service principals by appId in the tenant where the workload runs. The app registration can exist in its home tenant while the local service principal has not yet been created in the tenant you are checking. Creating an application through Microsoft Graph also does not automatically create its service principal unless you create that object separately.",
    next: "Get-MgServicePrincipal -Filter \"appId eq '{AppId}'\"",
  },
  {
    question: "Why does the same app have several Object IDs?",
    answer: "The Application (client) ID identifies the software application. The application object has its own id in the home tenant, and every service principal has a different id in the tenant where that instance exists. This is expected, especially for multitenant applications.",
    next: "Compare application.appId with application.id and servicePrincipal.id.",
  },
  {
    question: "The API permissions page shows a permission, but the app still receives authorization errors.",
    answer: "Configured permissions on the application describe requested access. Verify that the tenant actually granted the application permission through appRoleAssignments or the delegated permission through oauth2PermissionGrants. Also verify the token contains the expected roles or scopes and that the code requests the correct resource and .default scope where applicable.",
    next: "Inspect the local service principal's appRoleAssignments and oauth2PermissionGrants.",
  },
  {
    question: "A secret was rotated, but authentication still fails.",
    answer: "Confirm the workload is using the new secret value rather than the credential ID, that the new value was saved before leaving the portal, and that the secret belongs to the correct app registration. Then check tenant ID, client ID, secret-store version, deployment restart behavior, and token-endpoint error details.",
    next: "Validate tenant ID + client ID + active credential as one set.",
  },
  {
    question: "The service principal exists, but no user can sign in to the enterprise application.",
    answer: "Check accountEnabled, user assignment requirements, direct or group assignments, app roles, SSO configuration, Conditional Access, and whether the application expects users from the current sign-in audience. For application-only workloads, review service principal sign-in logs instead of user sign-in assumptions.",
    next: "Review Enterprise applications > Properties, Users and groups, Sign-in logs, and Conditional Access.",
  },
  {
    question: "An application or enterprise application was deleted. What should I verify after recovery?",
    answer: "Application objects and service principals are soft-deleted and generally remain recoverable for up to 30 days. Recovery behavior can depend on which object and restoration path you use, so confirm that both the application object and required service principal are active, then validate credentials, consent grants, assignments, and sign-in behavior before returning the workload to service.",
    next: "Query directory/deletedItems for both application and servicePrincipal objects.",
  },
];

export const officialSources = [
  {
    title: "Apps and service principals in Microsoft Entra ID",
    href: "https://learn.microsoft.com/en-us/entra/identity-platform/app-objects-and-service-principals",
    note: "Core object model, tenant relationship, portal locations, and lifecycle behavior.",
  },
  {
    title: "Microsoft Graph servicePrincipal resource",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/serviceprincipal?view=graph-rest-1.0",
    note: "Properties, relationships, servicePrincipalType values, owners, and permission relationships.",
  },
  {
    title: "Microsoft Graph application resource",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/application?view=graph-rest-1.0",
    note: "Application object properties, credentials, requested resource access, and identifiers.",
  },
  {
    title: "List app-role assignments granted to a service principal",
    href: "https://learn.microsoft.com/en-us/graph/api/serviceprincipal-list-approleassignments?view=graph-rest-1.0",
    note: "Application permissions granted to the client service principal.",
  },
  {
    title: "List delegated permission grants for a service principal",
    href: "https://learn.microsoft.com/en-us/graph/api/serviceprincipal-list-oauth2permissiongrants?view=graph-rest-1.0",
    note: "Delegated OAuth2 permission grants associated with a client service principal.",
  },
  {
    title: "Workload identity federation concepts",
    href: "https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation",
    note: "Secretless authentication for external and cross-platform workloads.",
  },
  {
    title: "Add and manage application credentials",
    href: "https://learn.microsoft.com/en-us/entra/identity-platform/how-to-add-credentials",
    note: "Certificates, client secrets, federated credentials, and production guidance.",
  },
  {
    title: "Agent 365 identity",
    href: "https://learn.microsoft.com/en-us/microsoft-agent-365/developer/identity",
    note: "ServiceIdentity agent identities, blueprint relationships, credentials, permissions, and runtime modes.",
  },
  {
    title: "Deletion and recovery of applications FAQ",
    href: "https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/delete-recover-faq",
    note: "Deleted-item retention and recovery considerations for application and service principal objects.",
  },
];
