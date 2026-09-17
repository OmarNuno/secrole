export const toc = [
  { id: "access-model", label: "The four-stage access model" },
  { id: "permission-types", label: "Delegated vs. application" },
  { id: "directory-records", label: "Directory records that matter" },
  { id: "admin-consent", label: "Admin consent and assignment" },
  { id: "token-evidence", label: "What the access token proves" },
  { id: "commands", label: "Read-only investigation" },
  { id: "troubleshooting", label: "Troubleshooting sequence" },
  { id: "faq", label: "Questions administrators ask" },
  { id: "official-sources", label: "Official sources" },
  { id: "related-guides", label: "Related guides" },
];

export const faq = [
  {
    question: "Does adding a permission under App registrations grant access?",
    answer: "No. Adding configured API permissions updates what the application requests. The tenant must still create the appropriate grant record through user consent, administrator consent, policy, or another authorized process, and the runtime token must contain the expected scopes or roles.",
  },
  {
    question: "Where are application permissions stored after admin consent?",
    answer: "Application permissions are represented as app-role assignments granted to the client service principal on the resource service principal. Inspect the client service principal's appRoleAssignments relationship to see roles granted to it.",
  },
  {
    question: "Where are delegated permissions stored?",
    answer: "Delegated consent is represented through OAuth2 permission grants associated with the client service principal. The grant includes the resource service principal, consent type, scope string, and—when consent applies to one user—the principal ID.",
  },
  {
    question: "Why is appRoleAssignedTo not the same as appRoleAssignments?",
    answer: "The direction is opposite. appRoleAssignments lists roles that this service principal has received from resource service principals. appRoleAssignedTo lists users, groups, or other service principals assigned to roles exposed by this service principal.",
  },
  {
    question: "Can a token be valid but still fail authorization?",
    answer: "Yes. A token can be correctly signed and unexpired but target the wrong audience, come from the wrong tenant, omit the required scope or app role, represent the wrong client, or fail resource-specific policy and authorization checks.",
  },
  {
    question: "Is user assignment required the same as admin consent?",
    answer: "No. Consent grants API access. The enterprise application's assignment requirement controls which users or groups can sign in to that application. They are separate controls and must be investigated separately.",
  },
];

export const sources = [
  {
    title: "Permissions and consent in the Microsoft identity platform",
    href: "https://learn.microsoft.com/en-us/entra/identity-platform/permissions-consent-overview",
    note: "Delegated and app-only access, scopes, app roles, consent, and the resulting Microsoft Graph records.",
  },
  {
    title: "User and admin consent overview",
    href: "https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/user-admin-consent-overview",
    note: "Tenant consent policy, user consent boundaries, administrator consent, and governance considerations.",
  },
  {
    title: "Grant tenant-wide admin consent to an application",
    href: "https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/grant-admin-consent",
    note: "Portal locations, consent authority, tenant-wide consent behavior, and administrative cautions.",
  },
  {
    title: "Microsoft Graph requiredResourceAccess resource",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/requiredresourceaccess?view=graph-rest-1.0",
    note: "The application object's configured resource APIs, delegated scopes, and application roles requested during consent.",
  },
  {
    title: "List app-role assignments granted to a service principal",
    href: "https://learn.microsoft.com/en-us/graph/api/serviceprincipal-list-approleassignments?view=graph-rest-1.0",
    note: "Application permissions assigned to the client service principal by resource service principals.",
  },
  {
    title: "List delegated permission grants for a service principal",
    href: "https://learn.microsoft.com/en-us/graph/api/serviceprincipal-list-oauth2permissiongrants?view=graph-rest-1.0",
    note: "OAuth2 delegated permission grants associated with the client service principal.",
  },
  {
    title: "Microsoft identity platform access-token claims reference",
    href: "https://learn.microsoft.com/en-us/entra/identity-platform/access-token-claims-reference",
    note: "Audience, tenant, client, subject, scope, and role claims used to validate runtime authorization context.",
  },
  {
    title: "Microsoft identity platform scopes and permissions",
    href: "https://learn.microsoft.com/en-us/entra/identity-platform/scopes-oidc",
    note: "Scope syntax, .default behavior, delegated permissions, application permissions, and consent requests.",
  },
];

export const powershellPermissions = `Connect-MgGraph -Scopes "Application.Read.All","Directory.Read.All","DelegatedPermissionGrant.Read.All"

$AppId = "00000000-0000-0000-0000-000000000000"
$sp = Get-MgServicePrincipal -Filter "appId eq '$AppId'" -Property "id,appId,displayName"

# Read only: application permissions granted to the client service principal
Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $sp.Id -All |
    Select-Object PrincipalId, ResourceId, AppRoleId, CreatedDateTime

# Read only: delegated OAuth permission grants for the client service principal
Get-MgServicePrincipalOauth2PermissionGrant -ServicePrincipalId $sp.Id -All |
    Select-Object ClientId, ResourceId, ConsentType, PrincipalId, Scope`;

export const powershellRequested = `$AppId = "00000000-0000-0000-0000-000000000000"

Get-MgApplication -Filter "appId eq '$AppId'" \
  -Property "id,appId,displayName,requiredResourceAccess" |
  Select-Object DisplayName, AppId, Id, RequiredResourceAccess`;

export const graphPermissions = `GET https://graph.microsoft.com/v1.0/applications?$filter=appId eq '{appId}'&$select=id,appId,displayName,requiredResourceAccess

GET https://graph.microsoft.com/v1.0/servicePrincipals?$filter=appId eq '{appId}'&$select=id,appId,displayName

GET https://graph.microsoft.com/v1.0/servicePrincipals/{client-service-principal-id}/appRoleAssignments

GET https://graph.microsoft.com/v1.0/servicePrincipals/{client-service-principal-id}/oauth2PermissionGrants`;

export const tokenClaims = `# Decode the middle JWT segment for investigation only.
# Signature and policy validation must still be performed by the receiving API.

$Token = "<access-token>"
$Payload = $Token.Split('.')[1].Replace('-', '+').Replace('_', '/')
while ($Payload.Length % 4) { $Payload += '=' }

[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($Payload)) |
    ConvertFrom-Json |
    Select-Object aud, tid, appid, azp, oid, sub, scp, roles`;

