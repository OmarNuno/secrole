export const toc = [
  { id: "quick-answer", label: "The 15-second answer" },
  { id: "four-identifiers", label: "The four identifiers" },
  { id: "portal-map", label: "Where the portal shows them" },
  { id: "field-decoder", label: "Field and API decoder" },
  { id: "multitenant", label: "Multitenant example" },
  { id: "commands", label: "Read-only commands" },
  { id: "common-mistakes", label: "Common mistakes" },
  { id: "faq", label: "Questions administrators ask" },
  { id: "official-sources", label: "Official sources" },
  { id: "related-guides", label: "Related guides" },
];

export const faq = [
  {
    question: "Is the Application (client) ID the same as the application Object ID?",
    answer: "No. The Application (client) ID is the appId used by OAuth clients and shared by the application object and its Application-type service principals. The application Object ID is the id of the application object stored in the home tenant.",
  },
  {
    question: "Why does the same app have a different Enterprise application Object ID in another tenant?",
    answer: "Each tenant stores its own service principal for the application. Those service principals share the same appId but each has a tenant-local id, so a service principal Object ID from one tenant cannot be reused as the Object ID in another tenant.",
  },
  {
    question: "Which ID belongs in client_id?",
    answer: "Use the Application (client) ID, represented by appId. Do not use the application Object ID, service principal Object ID, credential key ID, or secret value in the client_id field.",
  },
  {
    question: "What does principalId mean in an Azure role assignment for a workload?",
    answer: "For a service principal or managed identity, principalId normally points to that tenant-local service principal Object ID. Always verify the principal type and tenant before using the value in another API or directory.",
  },
  {
    question: "Can Microsoft Graph address an application or service principal by appId instead of Object ID?",
    answer: "Yes, selected application and servicePrincipal endpoints support appId as an alternate key. The URL syntax is different from the standard object-ID path, so use the documented alternate-key form rather than placing appId where an object id expected.",
  },
];

export const sources = [
  {
    title: "Apps and service principals in Microsoft Entra ID",
    href: "https://learn.microsoft.com/en-us/entra/identity-platform/app-objects-and-service-principals",
    note: "Application objects, tenant-local service principals, portal locations, and the shared application ID relationship.",
  },
  {
    title: "Microsoft Graph application resource",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/application?view=graph-rest-1.0",
    note: "Definitions for application.id, application.appId, requiredResourceAccess, credentials, and alternate keys.",
  },
  {
    title: "Microsoft Graph servicePrincipal resource",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/serviceprincipal?view=graph-rest-1.0",
    note: "Definitions for servicePrincipal.id, servicePrincipal.appId, tenant-local settings, and relationships.",
  },
  {
    title: "Microsoft Graph requiredResourceAccess resource",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/requiredresourceaccess?view=graph-rest-1.0",
    note: "Explains why resourceAppId is the Application ID of the target resource API and how requested scopes and roles are represented.",
  },
  {
    title: "Microsoft identity platform access-token claims reference",
    href: "https://learn.microsoft.com/en-us/entra/identity-platform/access-token-claims-reference",
    note: "Tenant, client application, object, scope, role, and audience claims used when validating runtime identity context.",
  },
];

export const graphLookup = `GET https://graph.microsoft.com/v1.0/applications?$filter=appId eq '{appId}'&$select=id,appId,displayName

GET https://graph.microsoft.com/v1.0/servicePrincipals?$filter=appId eq '{appId}'&$select=id,appId,displayName,servicePrincipalType,appOwnerOrganizationId`;

export const powershellLookup = `Connect-MgGraph -Scopes "Application.Read.All","Directory.Read.All"

$AppId = "00000000-0000-0000-0000-000000000000"

$app = Get-MgApplication -Filter "appId eq '$AppId'" -Property "id,appId,displayName"
$sp  = Get-MgServicePrincipal -Filter "appId eq '$AppId'" -Property "id,appId,displayName,servicePrincipalType,appOwnerOrganizationId"

$app | Select-Object DisplayName, AppId, Id
$sp  | Select-Object DisplayName, AppId, Id, ServicePrincipalType, AppOwnerOrganizationId`;

export const cliLookup = `APP_ID="00000000-0000-0000-0000-000000000000"

az ad app list \
  --filter "appId eq '$APP_ID'" \
  --query "[].{displayName:displayName,appId:appId,applicationObjectId:id}" \
  --output table

az ad sp list \
  --filter "appId eq '$APP_ID'" \
  --query "[].{displayName:displayName,appId:appId,servicePrincipalObjectId:id,type:servicePrincipalType}" \
  --output table`;

