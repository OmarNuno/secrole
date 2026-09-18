export const toc = [
  { id: "urgent-answer", label: "The 30-second answer" },
  { id: "enforcement-scope", label: "What is affected" },
  { id: "discovery", label: "Find candidate accounts" },
  { id: "decision-tree", label: "Choose the target identity" },
  { id: "hybrid-pattern", label: "Hybrid on-prem pattern" },
  { id: "access-mapping", label: "Map existing access" },
  { id: "code-migration", label: "Replace user authentication" },
  { id: "cutover-runbook", label: "Cutover runbook" },
  { id: "validation", label: "Validation and retirement" },
  { id: "faq", label: "Questions administrators ask" },
  { id: "official-sources", label: "Official sources" },
  { id: "related-guides", label: "Related guides" },
];

export const faq = [
  {
    question: "Will every synchronized Active Directory service account stop working?",
    answer: "No. This specific enforcement matters when a synchronized account is used as a Microsoft Entra user identity to sign in to an affected admin application or to perform covered Azure Resource Manager operations. An on-premises-only service account is not affected merely because it exists or synchronizes.",
  },
  {
    question: "Can a Conditional Access exclusion permanently bypass Microsoft's mandatory MFA enforcement?",
    answer: "No. Microsoft applies the system enforcement to user accounts performing the covered operations, including accounts excluded from tenant Conditional Access policies. Workload identities such as managed identities and service principals are outside the mandatory user-MFA enforcement.",
  },
  {
    question: "Are Microsoft Graph API calls included in Azure Phase 2 enforcement?",
    answer: "Generally no. Microsoft's current scope statement says Azure Phase 2 applies to requests targeting the Azure Resource Manager endpoint at management.azure.com. Microsoft Graph APIs are generally outside that Azure Phase 2 scope, although their own permissions and policies still apply.",
  },
  {
    question: "Do read-only Azure CLI and Azure PowerShell operations require MFA under Phase 2?",
    answer: "Microsoft's current Phase 2 scope requires MFA for create, update, and delete operations. Read operations do not require MFA under Phase 2 itself. Do not treat that as permission to preserve username-and-password automation: the design remains fragile and incompatible with broader MFA and ROPC deprecation.",
  },
  {
    question: "Can we register MFA methods on the service account and keep the unattended script?",
    answer: "Registering MFA helps an interactive user sign in, but it does not make an unattended username-and-password flow capable of completing an MFA challenge. The automation must move to nonuser workload authentication.",
  },
  {
    question: "What if the same account performs both on-premises Active Directory work and Azure management?",
    answer: "Split the identity contexts. Keep an on-premises identity or gMSA only where Windows, Kerberos, LDAP, file-share, SQL integrated-authentication, or scheduled-task logon dependencies require it. Authenticate separately to Azure with a managed identity, federated workload identity, or service principal.",
  },
  {
    question: "Which workload identity should replace the user account?",
    answer: "Prefer a managed identity when the workload runs on Azure and the hosting service supports it. For external OIDC-capable platforms, prefer workload identity federation. Otherwise use a certificate-backed service principal. Treat a client secret as an interim option with monitoring and a documented replacement plan.",
  },
  {
    question: "Is the Microsoft Entra Connect synchronization service account affected?",
    answer: "Microsoft documents that the synchronization service account used by Microsoft Entra Connect or Cloud Sync is not affected by this mandatory MFA requirement. Do not generalize that exception to other synchronized user accounts used for Azure automation.",
  },
];

export const sources = [
  {
    title: "Mandatory multifactor authentication for Azure and admin portals",
    href: "https://learn.microsoft.com/en-us/entra/identity/authentication/concept-mandatory-multifactor-authentication",
    note: "Enforcement phases, affected applications, account scope, user-based service accounts, ROPC impact, exclusions, public-cloud scope, and workload-identity exemption.",
  },
  {
    title: "Verify that users are set up for mandatory MFA",
    href: "https://learn.microsoft.com/en-us/entra/identity/authentication/how-to-mandatory-multifactor-authentication",
    note: "Microsoft guidance for using affected application IDs, sign-in analysis, Conditional Access report-only evaluation, and tenant preparation.",
  },
  {
    title: "Securing cloud-based service accounts",
    href: "https://learn.microsoft.com/en-us/entra/architecture/secure-service-accounts",
    note: "Microsoft recommendation to use managed identities for Azure-hosted workloads and service principals when managed identity is unavailable.",
  },
  {
    title: "What are workload identities?",
    href: "https://learn.microsoft.com/en-us/entra/workload-id/workload-identities-overview",
    note: "Defines applications, service principals, and managed identities as Microsoft Entra workload identities.",
  },
  {
    title: "Workload identity federation concepts",
    href: "https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation",
    note: "Secretless trust for GitHub Actions, Kubernetes, AWS, Google Cloud, Azure Pipelines, and other external OIDC-capable workloads.",
  },
  {
    title: "Sign in to Azure PowerShell non-interactively",
    href: "https://learn.microsoft.com/en-us/powershell/azure/authenticate-noninteractive",
    note: "Managed identity and service-principal authentication patterns for Azure PowerShell automation.",
  },
  {
    title: "Sign into Azure with a managed identity using Azure CLI",
    href: "https://learn.microsoft.com/en-us/cli/azure/authenticate-azure-cli-managed-identity",
    note: "System-assigned and user-assigned managed identity sign-in examples for Azure CLI.",
  },
  {
    title: "Sign into Azure with a service principal using Azure CLI",
    href: "https://learn.microsoft.com/en-us/cli/azure/authenticate-azure-cli-service-principal",
    note: "Certificate and client-secret service-principal authentication syntax for Azure CLI.",
  },
  {
    title: "List Microsoft Entra sign-ins with Microsoft Graph",
    href: "https://learn.microsoft.com/en-us/graph/api/signin-list?view=graph-rest-1.0",
    note: "AuditLog.Read.All requirements, retention limits, date filtering, sign-in properties, and PowerShell examples.",
  },
];

export const affectedApplications = [
  {
    name: "Azure, Entra, and Intune admin portals",
    appId: "c44b4083-3bb0-49c1-b47d-974e53cbdf3c",
    enforcement: "Phase 1",
    operations: "Create, read, update, and delete",
  },
  {
    name: "Azure CLI",
    appId: "04b07795-8ddb-461a-bbee-02f9e1bf7b46",
    enforcement: "Phase 2",
    operations: "Create, update, and delete",
  },
  {
    name: "Azure PowerShell",
    appId: "1950a258-227b-4e31-a9cf-717495945fc2",
    enforcement: "Phase 2",
    operations: "Create, update, and delete",
  },
  {
    name: "Azure mobile app",
    appId: "0c1307d4-29d6-4389-a11c-5cbe7f65d7fa",
    enforcement: "Phase 2",
    operations: "Create, update, and delete",
  },
];

export const candidateSignInReport = `# Read-only discovery report for user identities signing in to affected apps.
# Requirements: Microsoft.Graph.Reports + AuditLog.Read.All and User.Read.All.
# Sign-in availability depends on licensing and the tenant's retention period.

Connect-MgGraph -Scopes "AuditLog.Read.All","User.Read.All"

$DaysBack = 90
$Since = (Get-Date).AddDays(-$DaysBack).ToUniversalTime().
    ToString("yyyy-MM-ddTHH:mm:ssZ")

$AffectedApplications = @{
    "c44b4083-3bb0-49c1-b47d-974e53cbdf3c" = "Azure / Entra / Intune admin portals"
    "04b07795-8ddb-461a-bbee-02f9e1bf7b46" = "Azure CLI"
    "1950a258-227b-4e31-a9cf-717495945fc2" = "Azure PowerShell"
    "0c1307d4-29d6-4389-a11c-5cbe7f65d7fa" = "Azure mobile app"
}

$SignIns = Get-MgAuditLogSignIn \`
    -Filter "createdDateTime ge $Since" \`
    -All |
    Where-Object {
        $_.UserId -and $AffectedApplications.ContainsKey($_.AppId)
    }

$Report = $SignIns |
    Group-Object UserId |
    ForEach-Object {
        $Events = $_.Group | Sort-Object CreatedDateTime -Descending
        $Latest = $Events[0]

        $User = Get-MgUser -UserId $_.Name -Property @(
            "id",
            "displayName",
            "userPrincipalName",
            "accountEnabled",
            "onPremisesSyncEnabled",
            "onPremisesSamAccountName"
        )

        [pscustomobject]@{
            UserPrincipalName       = $User.UserPrincipalName
            DisplayName             = $User.DisplayName
            AccountEnabled          = $User.AccountEnabled
            OnPremisesSyncEnabled   = $User.OnPremisesSyncEnabled
            OnPremisesSamAccountName = $User.OnPremisesSamAccountName
            AffectedApplications    = (
                $Events.AppId |
                Sort-Object -Unique |
                ForEach-Object { $AffectedApplications[$_] }
            ) -join "; "
            LastSignInUtc           = $Latest.CreatedDateTime
            LastClient              = $Latest.ClientAppUsed
            LastResource            = $Latest.ResourceDisplayName
            LastInteractive         = $Latest.IsInteractive
            LastStatus              = if ($Latest.Status.ErrorCode -eq 0) {
                "Success"
            } else {
                "$($Latest.Status.ErrorCode): $($Latest.Status.FailureReason)"
            }
            ConditionalAccessStatus = $Latest.ConditionalAccessStatus
            LastIpAddress           = $Latest.IpAddress
            CorrelationId           = $Latest.CorrelationId
            SignInCount             = $Events.Count
        }
    } |
    Sort-Object LastSignInUtc -Descending

$Path = ".\\MandatoryMFA_UserAutomation_Candidates_{0}.csv" -f \`
    (Get-Date -Format "yyyyMMdd_HHmm")

$Report | Export-Csv -Path $Path -NoTypeInformation -Encoding UTF8
$Report | Format-Table -AutoSize
Write-Host "Exported: $Path"

# Treat this as a candidate list, not proof that every row is automation.
# ARM REST/SDK activity can require additional Azure Activity and workload-log review.`;

export const sourceCodeSearch = `$Root = "C:\\Automation"

$Patterns = @(
    "Connect-AzAccount.*-Credential",
    "az\\s+login.*--username",
    "AZURE_USERNAME",
    "AZURE_PASSWORD",
    "UsernamePasswordCredential",
    "AcquireTokenByUsernamePassword",
    "acquire_token_by_username_password"
)

Get-ChildItem -Path $Root -Recurse -File -Include \`
    *.ps1,*.psm1,*.py,*.js,*.ts,*.json,*.yml,*.yaml,*.config |
    Select-String -Pattern $Patterns -AllMatches |
    Select-Object Path, LineNumber, Line |
    Export-Csv ".\\UserPasswordAutomationPatterns.csv" \`
        -NoTypeInformation -Encoding UTF8`;

export const managedIdentityExamples = `# Azure PowerShell - system-assigned managed identity
Connect-AzAccount -Identity

# Azure PowerShell - user-assigned managed identity
$ManagedIdentityClientId = "00000000-0000-0000-0000-000000000000"
Connect-AzAccount -Identity -AccountId $ManagedIdentityClientId

# Azure CLI - system-assigned managed identity
az login --identity

# Azure CLI - user-assigned managed identity
az login --identity --client-id 00000000-0000-0000-0000-000000000000`;

export const certificateServicePrincipalExamples = `# Azure PowerShell - certificate-backed service principal
$TenantId  = "00000000-0000-0000-0000-000000000000"
$AppId     = "00000000-0000-0000-0000-000000000000"
$Thumbprint = "CERTIFICATE_THUMBPRINT"

Connect-AzAccount \`
    -ServicePrincipal \`
    -Tenant $TenantId \`
    -ApplicationId $AppId \`
    -CertificateThumbprint $Thumbprint

# Azure CLI - certificate and private key in the required PEM file
az login \\
  --service-principal \\
  --username "$APP_ID" \\
  --certificate /secure/path/service-principal.pem \\
  --tenant "$TENANT_ID"`;

export const accessEvidenceScript = `# Read-only inventory to support access mapping before cutover.
# Replace the old user UPN and new workload Application ID.

Connect-MgGraph -Scopes @(
    "Application.Read.All",
    "Directory.Read.All",
    "RoleManagement.Read.Directory"
)

$OldUserUpn = "svc_automation@contoso.com"
$NewAppId   = "00000000-0000-0000-0000-000000000000"

$OldUser = Get-MgUser -UserId $OldUserUpn -Property "id,displayName,userPrincipalName"
$NewSp = Get-MgServicePrincipal -Filter "appId eq '$NewAppId'" \`
    -Property "id,appId,displayName"

# Directory-role assignments for the old user
Get-MgRoleManagementDirectoryRoleAssignment \`
    -Filter "principalId eq '$($OldUser.Id)'" \`
    -All

# Microsoft Graph / API application permissions on the new workload identity
Get-MgServicePrincipalAppRoleAssignment \`
    -ServicePrincipalId $NewSp.Id \`
    -All

# Delegated grants associated with the new workload identity
Get-MgServicePrincipalOauth2PermissionGrant \`
    -ServicePrincipalId $NewSp.Id \`
    -All

# Azure RBAC is queried separately in each relevant subscription / management group:
# Get-AzRoleAssignment -ObjectId $OldUser.Id
# Get-AzRoleAssignment -ObjectId $NewSp.Id`;

export const migrationRecordTemplate = `Workload name:
Business owner:
Technical owner:
Backup owner:
Current user account / UPN:
On-premises host or Azure resource:
Schedule / trigger:
Repositories and script paths:
Affected Azure subscriptions / management groups:
Target resources and APIs:
Current directory roles:
Current Azure RBAC:
Current API permissions / grants:
Chosen workload identity:
Authentication method:
New Application ID:
New service principal Object ID:
Tenant ID:
Test plan:
Rollback owner and rollback steps:
Cutover date:
Cloud permissions removed from old user:
On-premises account retained? Why:
Final validation evidence:
Next review date:`;
