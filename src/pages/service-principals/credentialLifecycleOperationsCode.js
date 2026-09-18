export const auditCredentialChangesPowerShell = `# Read-only directory audit review for one application or service principal.

param(
    [Parameter(Mandatory)]
    [string]$ObjectId,

    [int]$LookbackDays = 30
)

Connect-MgGraph -Scopes "AuditLog.Read.All","Directory.Read.All" -NoWelcome

$StartUtc = [DateTimeOffset]::UtcNow.AddDays(-$LookbackDays).ToString("o")

Get-MgAuditLogDirectoryAudit \`
    -Filter "activityDateTime ge $StartUtc" \`
    -All |
    Where-Object {
        $_.Category -eq "ApplicationManagement" -and
        $_.TargetResources.Id -contains $ObjectId
    } |
    Sort-Object ActivityDateTime -Descending |
    Select-Object \`
        ActivityDateTime,
        ActivityDisplayName,
        Result,
        ResultReason,
        CorrelationId,
        @{Name="InitiatedByUser";Expression={$_.InitiatedBy.User.UserPrincipalName}},
        @{Name="InitiatedByApp";Expression={$_.InitiatedBy.App.DisplayName}},
        @{Name="TargetIds";Expression={$_.TargetResources.Id -join ";"}} |
    Format-Table -AutoSize`;

export const policyInventoryPowerShell = `# Read-only application-management policy inventory.

Connect-MgGraph -Scopes "Policy.Read.All","Application.Read.All" -NoWelcome

$TenantPolicy = Invoke-MgGraphRequest \`
    -Method GET \`
    -Uri "https://graph.microsoft.com/v1.0/policies/defaultAppManagementPolicy"

$ObjectPolicies = Invoke-MgGraphRequest \`
    -Method GET \`
    -Uri "https://graph.microsoft.com/v1.0/policies/appManagementPolicies"

[pscustomobject]@{
    Scope                        = "Tenant default"
    DisplayName                  = $TenantPolicy.displayName
    IsEnabled                    = $TenantPolicy.isEnabled
    ApplicationRestrictions      = ($TenantPolicy.applicationRestrictions | ConvertTo-Json -Depth 10 -Compress)
    ServicePrincipalRestrictions = ($TenantPolicy.servicePrincipalRestrictions | ConvertTo-Json -Depth 10 -Compress)
}

foreach ($Policy in $ObjectPolicies.value) {
    [pscustomobject]@{
        Scope                        = "Object-specific"
        DisplayName                  = $Policy.displayName
        IsEnabled                    = $Policy.isEnabled
        ApplicationRestrictions      = ($Policy.restrictions | ConvertTo-Json -Depth 10 -Compress)
        ServicePrincipalRestrictions = $null
    }
}`;
