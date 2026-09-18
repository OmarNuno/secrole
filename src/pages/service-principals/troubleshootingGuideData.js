export const toc = [
  { id: "evidence", label: "Capture the evidence" },
  { id: "decision-tree", label: "Six-stage decision tree" },
  { id: "object-lookup", label: "Object and tenant lookup" },
  { id: "client-authentication", label: "Client authentication" },
  { id: "grants-and-token", label: "Grants and token evidence" },
  { id: "logs", label: "Sign-in and audit logs" },
  { id: "recovery", label: "Deletion and recovery" },
  { id: "commands", label: "Read-only commands" },
  { id: "error-catalog", label: "Common AADSTS errors" },
  { id: "faq", label: "Questions administrators ask" },
  { id: "official-sources", label: "Official sources" },
  { id: "related-guides", label: "Related guides" },
];

export const faq = [
  {
    question: "The app registration exists. Why can I not find the Enterprise application?",
    answer: "The application object can exist in its home tenant while a service principal has not been created in the tenant you are checking. Search service principals by Application ID in the target tenant. Also verify the tenant and cloud, because the same Application ID can have a different local service principal Object ID in each tenant.",
  },
  {
    question: "What does AADSTS700016 usually mean?",
    answer: "Microsoft Entra could not find the client application in the directory used by the request. Verify the client Application ID, tenant or authority, cloud endpoint, and whether the application has been installed or consented in that tenant when a local service principal is required.",
  },
  {
    question: "A secret was rotated, but the workload still receives invalid_client. What should I check?",
    answer: "Confirm the workload is using the new secret value rather than the secret record ID, that the secret belongs to the correct application object, and that the deployed configuration was refreshed. Verify the client ID and tenant ID as one set, then restart or redeploy components that cache credentials before removing the old credential.",
  },
  {
    question: "The API permissions page shows the permission. Why does the API still return 403?",
    answer: "Configured API permissions describe requested access. Verify the tenant grant record, the access token audience, and the roles or scopes presented at runtime. The target API can also apply its own RBAC, object-level authorization, licensing, or policy after Microsoft Entra issues a valid token.",
  },
  {
    question: "Why is there no entry in the service principal sign-in log?",
    answer: "Verify the tenant, time range, Application ID, and sign-in log category. Managed identity sign-ins are shown in the separate managed identity sign-in log. Service principal events can also be grouped when the principal, status, IP address, and resource match, so expand the grouped row before concluding there was no activity.",
  },
  {
    question: "Is User assignment required the same as admin consent?",
    answer: "No. Admin consent creates API permission grants. User assignment required controls whether users or groups must be assigned to the Enterprise application before interactive sign-in. Investigate consent records and user assignments as separate controls.",
  },
  {
    question: "What should I verify after restoring a deleted application or service principal?",
    answer: "Confirm the application and service principal are active, then validate credentials, grants, owners, user or group assignments, provisioning, SSO, and sign-in behavior. Microsoft documents that service principal policies are not recovered and must be configured again. Provisioning data can also take time to reappear after recovery.",
  },
];

export const sources = [
  {
    title: "Microsoft Entra authentication and authorization error codes",
    href: "https://learn.microsoft.com/en-us/entra/identity-platform/reference-error-codes",
    note: "Current AADSTS descriptions, diagnostic fields, error lookup guidance, and recommended client actions.",
  },
  {
    title: "Service principal sign-in logs",
    href: "https://learn.microsoft.com/en-us/entra/identity/monitoring-health/concept-service-principal-sign-ins",
    note: "App-only sign-in evidence, aggregation behavior, resources, IP addresses, status, and credential-based sign-ins.",
  },
  {
    title: "Managed identity sign-in logs",
    href: "https://learn.microsoft.com/en-us/entra/identity/monitoring-health/concept-managed-identity-sign-ins",
    note: "The separate sign-in report for Azure resources authenticating through managed identities.",
  },
  {
    title: "Sign-in logs in Microsoft Entra ID",
    href: "https://learn.microsoft.com/en-us/entra/identity/monitoring-health/concept-sign-ins",
    note: "The available sign-in log categories and the boundary between user, service principal, and managed identity activity.",
  },
  {
    title: "Apps and service principals in Microsoft Entra ID",
    href: "https://learn.microsoft.com/en-us/entra/identity-platform/app-objects-and-service-principals",
    note: "Application objects, tenant-local service principals, consent creation, and portal object boundaries.",
  },
  {
    title: "Deletion and recovery of applications FAQ",
    href: "https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/delete-recover-faq",
    note: "Soft-deletion, the 30-day recovery window, service principal restoration, provisioning delays, policies, and managed identities.",
  },
  {
    title: "Microsoft Graph servicePrincipal resource",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/serviceprincipal?view=graph-rest-1.0",
    note: "Properties used during troubleshooting, including accountEnabled, appRoleAssignmentRequired, appId, owners, and grant relationships.",
  },
  {
    title: "Permissions and consent in the Microsoft identity platform",
    href: "https://learn.microsoft.com/en-us/entra/identity-platform/permissions-consent-overview",
    note: "Delegated and application permissions, consent, app-role assignments, and OAuth2 permission grants.",
  },
  {
    title: "Microsoft identity platform access-token claims reference",
    href: "https://learn.microsoft.com/en-us/entra/identity-platform/access-token-claims-reference",
    note: "Audience, tenant, client, subject, scope, and app-role claims used to validate runtime context.",
  },
];

export const powershellBaseline = `Connect-MgGraph -Scopes @(
    "Application.Read.All"
    "Directory.Read.All"
    "DelegatedPermissionGrant.Read.All"
    "AuditLog.Read.All"
)

$AppId = "00000000-0000-0000-0000-000000000000"

$app = Get-MgApplication -Filter "appId eq '$AppId'" -Property "id,appId,displayName,signInAudience,passwordCredentials,keyCredentials,requiredResourceAccess"

$sp = Get-MgServicePrincipal -Filter "appId eq '$AppId'" -Property "id,appId,displayName,servicePrincipalType,appOwnerOrganizationId,accountEnabled,appRoleAssignmentRequired"

$app | Select-Object DisplayName, AppId, Id, SignInAudience
$sp  | Select-Object DisplayName, AppId, Id, ServicePrincipalType,
    AppOwnerOrganizationId, AccountEnabled, AppRoleAssignmentRequired`;

export const powershellGrants = `$AppId = "00000000-0000-0000-0000-000000000000"
$sp = Get-MgServicePrincipal -Filter "appId eq '$AppId'" -Property "id,displayName,appId"

# Application permissions granted to the client service principal
Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $sp.Id -All |
    Select-Object PrincipalId, ResourceId, AppRoleId, CreatedDateTime

# Delegated OAuth permission grants for the client service principal
Get-MgServicePrincipalOauth2PermissionGrant -ServicePrincipalId $sp.Id -All |
    Select-Object ClientId, ResourceId, ConsentType, PrincipalId, Scope`;

export const powershellSignIns = `$AppId = "00000000-0000-0000-0000-000000000000"
$Since = (Get-Date).AddDays(-7).ToUniversalTime().ToString("o")
$Filter = "appId eq '$AppId' and createdDateTime ge $Since"

Get-MgAuditLogSignIn -Filter $Filter -All |
    Select-Object CreatedDateTime, AppDisplayName, AppId,
        ResourceDisplayName, ResourceId, IPAddress, CorrelationId,
        @{Name='ErrorCode';Expression={$_.Status.ErrorCode}},
        @{Name='FailureReason';Expression={$_.Status.FailureReason}} |
    Sort-Object CreatedDateTime -Descending`;

export const graphBaseline = `GET https://graph.microsoft.com/v1.0/applications?$filter=appId eq '{appId}'&$select=id,appId,displayName,signInAudience,passwordCredentials,keyCredentials,requiredResourceAccess

GET https://graph.microsoft.com/v1.0/servicePrincipals?$filter=appId eq '{appId}'&$select=id,appId,displayName,servicePrincipalType,appOwnerOrganizationId,accountEnabled,appRoleAssignmentRequired`;

export const graphEvidence = `GET https://graph.microsoft.com/v1.0/servicePrincipals/{client-service-principal-id}/appRoleAssignments

GET https://graph.microsoft.com/v1.0/servicePrincipals/{client-service-principal-id}/oauth2PermissionGrants

GET https://graph.microsoft.com/v1.0/auditLogs/signIns?$filter=appId eq '{appId}'&$select=createdDateTime,appDisplayName,appId,resourceDisplayName,resourceId,status,correlationId,ipAddress`;

export const graphDeleted = `GET https://graph.microsoft.com/v1.0/directory/deletedItems/microsoft.graph.application?$filter=appId eq '{appId}'

GET https://graph.microsoft.com/v1.0/directory/deletedItems/microsoft.graph.servicePrincipal?$filter=appId eq '{appId}'`;

export const errorRows = [
  ["AADSTS700016", "Client application not found in the directory", "Verify client App ID, tenant or authority, cloud, and whether the app is represented in that tenant."],
  ["AADSTS700011", "Client app not found in the tenant", "Confirm the application has been installed or consented and that the request targets the intended tenant."],
  ["AADSTS500011", "Resource service principal not found", "Verify the requested resource identifier, target tenant, and whether the resource application is available in that tenant."],
  ["AADSTS90002", "Tenant name or ID is invalid", "Correct the tenant identifier and confirm the national-cloud authority host."],
  ["AADSTS7000215", "Invalid client secret", "Use the secret value, not the secret ID; verify the correct app, tenant, deployment setting, and active credential."],
  ["AADSTS7000222", "Provided client secrets are expired", "Create and deploy a replacement credential, validate it, then retire the expired or superseded credential."],
  ["AADSTS700027", "Client assertion signature validation failed", "Verify private key, certificate, assertion audience, signing algorithm, key ID or thumbprint, and clock."],
  ["AADSTS65001", "Consent does not exist", "Complete the appropriate user or admin consent flow and verify the resulting grant record."],
  ["AADSTS650056", "Application or consent is misconfigured", "Reconcile requested permissions, resource identifier, tenant grant, and certificate or client configuration."],
  ["AADSTS50105", "Signed-in user is not assigned", "Check appRoleAssignmentRequired and assign the user or an eligible group to the Enterprise application."],
  ["AADSTS53003", "Blocked by Conditional Access", "Inspect the applied policy and sign-in details; do not bypass policy without an approved risk decision."],
  ["AADSTS7000112", "Client application is disabled", "Check the local service principal's accountEnabled state and the administrative reason for disabling it."],
  ["AADSTS500014", "Resource service principal is disabled", "Confirm the resource service status, subscription or service state, and whether an administrator disabled it."],
];
