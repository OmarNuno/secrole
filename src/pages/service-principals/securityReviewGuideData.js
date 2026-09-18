export const toc = [
  { id: "review-outcome", label: "What the review must prove" },
  { id: "fast-triage", label: "10-minute triage" },
  { id: "identity-ownership", label: "Identity, trust, and ownership" },
  { id: "privilege-map", label: "Map every privilege surface" },
  { id: "credentials", label: "Credentials and authentication" },
  { id: "activity-evidence", label: "Usage and change evidence" },
  { id: "controls-risk", label: "Controls and risk signals" },
  { id: "commands", label: "Build the evidence package" },
  { id: "risk-decision", label: "Risk decision" },
  { id: "remediation", label: "Safe remediation sequence" },
  { id: "faq", label: "Questions reviewers ask" },
  { id: "official-sources", label: "Official sources" },
  { id: "related-guides", label: "Related guides" },
];

export const faq = [
  {
    question: "Does read-only access automatically make a service principal low risk?",
    answer: "No. Read-only access to tenant-wide email, documents, chats, identity data, security findings, or investigation evidence can still create a large confidentiality impact. Rate the data scope and blast radius, not only whether the permission name contains Read.",
  },
  {
    question: "Does a verified publisher mean an application is safe to approve?",
    answer: "No. Publisher verification is a provenance signal that helps establish who published the application. It does not prove the requested permissions are necessary, that the app is uncompromised, or that the tenant should grant the requested access.",
  },
  {
    question: "How many owners should an application and service principal have?",
    answer: "Microsoft Graph documentation recommends at least two owners for applications and service principals. Reviewers should also verify that the owners are active, appropriate, and able to support the workload rather than merely counting owner objects.",
  },
  {
    question: "Can I call a service principal unused when I do not see sign-in logs?",
    answer: "Not by sign-in logs alone. Confirm the review window, log retention and export coverage, delegated usage, managed identity logs, target-resource logs, provisioning activity, and owner evidence. Absence of one log source is not proof that the workload is unused.",
  },
  {
    question: "Can Conditional Access protect every service principal?",
    answer: "No. Conditional Access for workload identities applies to eligible single-tenant service principals registered in the tenant. Microsoft and third-party SaaS applications, multitenant applications, and managed identities are outside that policy scope. The service principal must be targeted directly rather than only through a group.",
  },
  {
    question: "When should I disable a service principal during a review?",
    answer: "For a suspected compromise, containment can take priority after evidence is preserved and incident responders understand the likely impact. For governance cleanup, confirm owners, dependencies, recent usage, recovery steps, and a monitoring plan before disabling. Disabling should be a controlled decision, not a substitute for investigation.",
  },
  {
    question: "What is the difference between application owners and service principal owners?",
    answer: "Application owners manage the home-tenant app registration. Service principal owners manage the tenant-local Enterprise application object. Review both collections because the people, responsibilities, and security impact can differ.",
  },
];

export const sources = [
  {
    title: "Securing service principals in Microsoft Entra ID",
    href: "https://learn.microsoft.com/en-us/entra/architecture/service-accounts-principal",
    note: "Service-principal discovery, privilege reduction, consent, credential storage, sign-in monitoring, and Azure RBAC guidance.",
  },
  {
    title: "Microsoft Entra security operations guide for applications",
    href: "https://learn.microsoft.com/en-us/entra/architecture/security-operations-applications",
    note: "Security monitoring for application changes, credentials, consent, owners, permissions, and anomalous activity.",
  },
  {
    title: "Enhance security with the principle of least privilege",
    href: "https://learn.microsoft.com/en-us/entra/identity-platform/secure-least-privileged-access",
    note: "Unused and reducible permissions, deployed-application audits, consent, and blast-radius reduction.",
  },
  {
    title: "Microsoft Graph servicePrincipal resource",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/serviceprincipal?view=graph-rest-1.0",
    note: "Owners, credentials, grants, memberships, local controls, provenance, and service-principal properties used in the review.",
  },
  {
    title: "Microsoft Graph application resource",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/application?view=graph-rest-1.0",
    note: "Application owners, configured permissions, credentials, sign-in audience, verified publisher, and registration properties.",
  },
  {
    title: "Sign-in logs in Microsoft Entra ID",
    href: "https://learn.microsoft.com/en-us/entra/identity/monitoring-health/concept-sign-ins",
    note: "Service-principal and managed-identity sign-in log types plus application usage and credential activity reports.",
  },
  {
    title: "Service principal sign-in logs",
    href: "https://learn.microsoft.com/en-us/entra/identity/monitoring-health/concept-service-principal-sign-ins",
    note: "How app-only sign-ins are recorded, grouped, and interpreted for service principals.",
  },
  {
    title: "Conditional Access for workload identities",
    href: "https://learn.microsoft.com/en-us/entra/identity/conditional-access/workload-identity",
    note: "Policy scope, location and risk conditions, report-only validation, licensing, and current exclusions.",
  },
  {
    title: "Securing workload identities with Microsoft Entra ID Protection",
    href: "https://learn.microsoft.com/en-us/entra/id-protection/concept-workload-identity-risk",
    note: "Risk detections, investigation questions, risky service-principal APIs, containment, and credential remediation.",
  },
  {
    title: "List owners of a service principal",
    href: "https://learn.microsoft.com/en-us/graph/api/serviceprincipal-list-owners?view=graph-rest-1.0",
    note: "Read-only owner inventory and least-privileged Microsoft Graph permissions.",
  },
];

export const coreInventory = `Connect-MgGraph -Scopes @(
    "Application.Read.All",
    "Directory.Read.All",
    "DelegatedPermissionGrant.Read.All",
    "AuditLog.Read.All"
)

$AppId = "00000000-0000-0000-0000-000000000000"

$app = Get-MgApplication -Filter "appId eq '$AppId'" -Property @(
    "id","appId","displayName","createdDateTime","signInAudience",
    "requiredResourceAccess","passwordCredentials","keyCredentials","tags"
)

$sp = Get-MgServicePrincipal -Filter "appId eq '$AppId'" -Property @(
    "id","appId","displayName","servicePrincipalType","appOwnerOrganizationId",
    "accountEnabled","appRoleAssignmentRequired","disabledByMicrosoftStatus",
    "verifiedPublisher","passwordCredentials","keyCredentials","tags","notes"
)

if (-not $sp) { throw "No local service principal found for appId $AppId" }

$appOwners = if ($app) {
    Get-MgApplicationOwner -ApplicationId $app.Id -All
}

$spOwners = Get-MgServicePrincipalOwner -ServicePrincipalId $sp.Id -All

[pscustomobject]@{
    DisplayName              = $sp.DisplayName
    AppId                    = $sp.AppId
    ApplicationObjectId      = $app.Id
    ServicePrincipalObjectId = $sp.Id
    ServicePrincipalType     = $sp.ServicePrincipalType
    HomeTenantId             = $sp.AppOwnerOrganizationId
    AccountEnabled           = $sp.AccountEnabled
    AssignmentRequired       = $sp.AppRoleAssignmentRequired
    DisabledByMicrosoft      = $sp.DisabledByMicrosoftStatus
    VerifiedPublisher        = $sp.VerifiedPublisher.DisplayName
    ApplicationOwnerCount    = @($appOwners).Count
    ServicePrincipalOwners   = @($spOwners).Count
}`;

export const privilegeInventory = `$SpId = $sp.Id

# Application permissions granted to this client service principal
$appRoleAssignments = Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $SpId -All

# Delegated OAuth grants associated with this client service principal
$oauthGrants = Get-MgServicePrincipalOauth2PermissionGrant -ServicePrincipalId $SpId -All

# Directory roles inherited through direct or transitive membership
$directoryRoles = Invoke-MgGraphRequest -Method GET -Uri (
    "https://graph.microsoft.com/v1.0/servicePrincipals/$SpId/" +
    "transitiveMemberOf/microsoft.graph.directoryRole?%24select=id,displayName,roleTemplateId"
)

# All direct/transitive groups and other directory memberships
$memberships = Invoke-MgGraphRequest -Method GET -Uri (
    "https://graph.microsoft.com/v1.0/servicePrincipals/$SpId/" +
    "transitiveMemberOf?%24select=id,displayName"
)

$appRoleAssignments | Select-Object PrincipalId, ResourceId, AppRoleId, CreatedDateTime
$oauthGrants        | Select-Object ClientId, ResourceId, ConsentType, PrincipalId, Scope
$directoryRoles.value
$memberships.value`;

export const credentialInventory = `$Now = Get-Date
$Cutoff = $Now.AddDays(30)

$credentialReport = @(
    foreach ($credential in @($app.PasswordCredentials)) {
        [pscustomobject]@{
            ObjectType = "Application"
            Type       = "Client secret"
            KeyId      = $credential.KeyId
            Start      = $credential.StartDateTime
            End        = $credential.EndDateTime
            Status     = if ($credential.EndDateTime -lt $Now) { "Expired" }
                         elseif ($credential.EndDateTime -le $Cutoff) { "Expires within 30 days" }
                         else { "Active" }
        }
    }

    foreach ($credential in @($app.KeyCredentials)) {
        [pscustomobject]@{
            ObjectType = "Application"
            Type       = "Certificate"
            KeyId      = $credential.KeyId
            Start      = $credential.StartDateTime
            End        = $credential.EndDateTime
            Status     = if ($credential.EndDateTime -lt $Now) { "Expired" }
                         elseif ($credential.EndDateTime -le $Cutoff) { "Expires within 30 days" }
                         else { "Active" }
        }
    }

    foreach ($credential in @($sp.PasswordCredentials)) {
        [pscustomobject]@{
            ObjectType = "Service principal"
            Type       = "Client secret"
            KeyId      = $credential.KeyId
            Start      = $credential.StartDateTime
            End        = $credential.EndDateTime
            Status     = if ($credential.EndDateTime -lt $Now) { "Expired" }
                         elseif ($credential.EndDateTime -le $Cutoff) { "Expires within 30 days" }
                         else { "Active" }
        }
    }

    foreach ($credential in @($sp.KeyCredentials)) {
        [pscustomobject]@{
            ObjectType = "Service principal"
            Type       = "Certificate / key"
            KeyId      = $credential.KeyId
            Start      = $credential.StartDateTime
            End        = $credential.EndDateTime
            Status     = if ($credential.EndDateTime -lt $Now) { "Expired" }
                         elseif ($credential.EndDateTime -le $Cutoff) { "Expires within 30 days" }
                         else { "Active" }
        }
    }
)

$credentialReport | Sort-Object End | Format-Table -AutoSize

# Federated credentials on the app registration, when present
if ($app) {
    Get-MgApplicationFederatedIdentityCredential -ApplicationId $app.Id -All |
        Select-Object Name, Issuer, Subject, Audiences
}`;

export const activityInventory = `$Since = (Get-Date).ToUniversalTime().AddDays(-30)
$SinceIso = $Since.ToString("yyyy-MM-ddTHH:mm:ssZ")

# Service-principal sign-in evidence
$signInFilter = [uri]::EscapeDataString(
    "servicePrincipalId eq '$($sp.Id)' and createdDateTime ge $SinceIso"
)

$signIns = Invoke-MgGraphRequest -Method GET -Uri (
    "https://graph.microsoft.com/v1.0/auditLogs/signIns?" +
    "%24filter=$signInFilter&" +
    "%24select=createdDateTime,servicePrincipalId,servicePrincipalName," +
    "resourceDisplayName,resourceServicePrincipalId,ipAddress,status,conditionalAccessStatus"
)

$signIns.value | Sort-Object createdDateTime -Descending

# Directory changes targeting the application or service principal
Get-MgAuditLogDirectoryAudit -Filter "activityDateTime ge $SinceIso" -All |
    Where-Object {
        $_.TargetResources.Id -contains $app.Id -or
        $_.TargetResources.Id -contains $sp.Id
    } |
    Select-Object ActivityDateTime, ActivityDisplayName, InitiatedBy, Result, TargetResources`;

export const workloadRiskInventory = `# Requires the appropriate Microsoft Entra Workload ID capability and
# IdentityRiskyServicePrincipal.Read.All permission.
Connect-MgGraph -Scopes "IdentityRiskyServicePrincipal.Read.All"

$SpId = "00000000-0000-0000-0000-000000000000"

try {
    Invoke-MgGraphRequest -Method GET -Uri (
        "https://graph.microsoft.com/v1.0/identityProtection/" +
        "riskyServicePrincipals/$SpId"
    )
}
catch {
    Write-Warning "No accessible risky-service-principal record was returned. Confirm licensing, permissions, and whether the identity is currently represented in the risk report."
}`;

export const azureRbacInventory = `SP_OBJECT_ID="00000000-0000-0000-0000-000000000000"

# Read-only Azure RBAC inventory. Review inherited scope as well as direct scope.
az role assignment list \
  --assignee-object-id "$SP_OBJECT_ID" \
  --all \
  --include-inherited \
  --query "[].{role:roleDefinitionName,scope:scope,condition:condition,createdBy:createdBy,createdOn:createdOn}" \
  --output table`;
