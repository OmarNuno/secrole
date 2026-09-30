export const graphCollectionHelper = `function Get-GraphCollection {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$Uri,

        [hashtable]$Headers = @{}
    )

    $items = [System.Collections.Generic.List[object]]::new()
    $nextLink = $Uri

    while ($nextLink) {
        $response = Invoke-MgGraphRequest -Method GET -Uri $nextLink -Headers $Headers
        foreach ($item in @($response.value)) {
            $items.Add($item)
        }
        $nextLink = $response.'@odata.nextLink'
    }

    return $items
}`;

export const pimAssignmentInventoryPowerShell = `Connect-MgGraph -Scopes "RoleAssignmentSchedule.Read.Directory","RoleEligibilitySchedule.Read.Directory","Directory.Read.All"

$graphRoot = "https://graph.microsoft.com/v1.0"

$activeInstances = Get-GraphCollection -Uri (
    $graphRoot + "/roleManagement/directory/roleAssignmentScheduleInstances?" +
    "%24expand=principal,roleDefinition,directoryScope&%24top=999"
)

$eligibleInstances = Get-GraphCollection -Uri (
    $graphRoot + "/roleManagement/directory/roleEligibilityScheduleInstances?" +
    "%24expand=principal,roleDefinition,directoryScope&%24top=999"
)

$activeReport = foreach ($item in $activeInstances) {
    $scopeName = if ($item.directoryScopeId -eq "/") {
        "Tenant root"
    } elseif ($item.directoryScope.displayName) {
        $item.directoryScope.displayName
    } else {
        $item.directoryScopeId
    }

    [pscustomobject]@{
        AccessState       = "Active"
        AssignmentType    = $item.assignmentType
        MemberType        = $item.memberType
        PrincipalName     = $item.principal.displayName
        PrincipalId       = $item.principalId
        PrincipalType     = $item.principal.'@odata.type' -replace '#microsoft.graph.',''
        RoleName          = $item.roleDefinition.displayName
        RoleDefinitionId  = $item.roleDefinitionId
        DirectoryScopeId  = $item.directoryScopeId
        ScopeName         = $scopeName
        StartDateTimeUtc  = $item.startDateTime
        EndDateTimeUtc    = $item.endDateTime
        IsPermanent       = [string]::IsNullOrWhiteSpace([string]$item.endDateTime)
        InstanceId        = $item.id
        SourceScheduleId  = $item.roleAssignmentScheduleId
    }
}

$eligibleReport = foreach ($item in $eligibleInstances) {
    $scopeName = if ($item.directoryScopeId -eq "/") {
        "Tenant root"
    } elseif ($item.directoryScope.displayName) {
        $item.directoryScope.displayName
    } else {
        $item.directoryScopeId
    }

    [pscustomobject]@{
        AccessState       = "Eligible"
        AssignmentType    = "Eligible"
        MemberType        = $item.memberType
        PrincipalName     = $item.principal.displayName
        PrincipalId       = $item.principalId
        PrincipalType     = $item.principal.'@odata.type' -replace '#microsoft.graph.',''
        RoleName          = $item.roleDefinition.displayName
        RoleDefinitionId  = $item.roleDefinitionId
        DirectoryScopeId  = $item.directoryScopeId
        ScopeName         = $scopeName
        StartDateTimeUtc  = $item.startDateTime
        EndDateTimeUtc    = $item.endDateTime
        IsPermanent       = [string]::IsNullOrWhiteSpace([string]$item.endDateTime)
        InstanceId        = $item.id
        SourceScheduleId  = $item.roleEligibilityScheduleId
    }
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmm"
$report = @($activeReport + $eligibleReport) |
    Sort-Object RoleName, PrincipalName, AccessState

$report | Export-Csv ".\\Entra_PIM_Assignments_$timestamp.csv" -NoTypeInformation
$report | Format-Table RoleName, PrincipalName, AccessState, AssignmentType, MemberType, ScopeName, EndDateTimeUtc -AutoSize`;

export const pimPolicyInventoryPowerShell = `Connect-MgGraph -Scopes "RoleManagementPolicy.Read.Directory","RoleManagement.Read.Directory","Directory.Read.All"

$graphRoot = "https://graph.microsoft.com/v1.0"

$definitions = Get-GraphCollection -Uri (
    $graphRoot + "/roleManagement/directory/roleDefinitions?" +
    "%24select=id,displayName,isBuiltIn,templateId&%24top=999"
)
$definitionById = @{}
foreach ($definition in $definitions) {
    $definitionById[$definition.id] = $definition
}

$policyAssignments = Get-GraphCollection -Uri (
    $graphRoot + "/policies/roleManagementPolicyAssignments?" +
    "%24filter=scopeId%20eq%20'%2F'%20and%20scopeType%20eq%20'DirectoryRole'&" +
    "%24expand=policy(%24expand=rules)&%24top=999"
)

function Get-PimRule {
    param(
        [object[]]$Rules,
        [string]$Id
    )

    return @($Rules | Where-Object { $_.id -eq $Id }) | Select-Object -First 1
}

function Test-PimRuleEnabled {
    param(
        [object]$Rule,
        [string]$Name
    )

    if (-not $Rule) { return $false }
    return @($Rule.enabledRules) -contains $Name
}

function Get-ApproverSummary {
    param([object]$ApprovalRule)

    if (-not $ApprovalRule -or -not $ApprovalRule.setting) {
        return ""
    }

    $approvers = foreach ($stage in @($ApprovalRule.setting.approvalStages)) {
        foreach ($approver in @($stage.primaryApprovers)) {
            if ($approver.description) {
                $approver.description
            } elseif ($approver.id) {
                "$($approver.'@odata.type'):$($approver.id)"
            } else {
                $approver.'@odata.type'
            }
        }
    }

    return (@($approvers | Where-Object { $_ }) -join "; ")
}

$policyReport = foreach ($assignment in $policyAssignments) {
    $rules = @($assignment.policy.rules)

    $activationExpiration = Get-PimRule -Rules $rules -Id "Expiration_EndUser_Assignment"
    $activationEnablement = Get-PimRule -Rules $rules -Id "Enablement_EndUser_Assignment"
    $activationApproval = Get-PimRule -Rules $rules -Id "Approval_EndUser_Assignment"
    $activationAuthContext = Get-PimRule -Rules $rules -Id "AuthenticationContext_EndUser_Assignment"
    $eligibleExpiration = Get-PimRule -Rules $rules -Id "Expiration_Admin_Eligibility"
    $activeExpiration = Get-PimRule -Rules $rules -Id "Expiration_Admin_Assignment"
    $activeEnablement = Get-PimRule -Rules $rules -Id "Enablement_Admin_Assignment"

    $notificationRules = @($rules | Where-Object {
        $_.'@odata.type' -eq '#microsoft.graph.unifiedRoleManagementPolicyNotificationRule'
    })
    $notificationSummary = @($notificationRules | ForEach-Object {
        "$($_.recipientType):$($_.notificationLevel):Default=$($_.isDefaultRecipientsEnabled)"
    }) -join "; "

    $definition = $definitionById[$assignment.roleDefinitionId]
    $approvalRequired = $false
    if ($activationApproval -and $activationApproval.setting) {
        $approvalRequired = [bool]$activationApproval.setting.isApprovalRequired
    }

    [pscustomobject]@{
        RoleName                       = $definition.displayName
        RoleDefinitionId               = $assignment.roleDefinitionId
        PolicyId                       = $assignment.policyId
        PolicyLastModifiedUtc          = $assignment.policy.lastModifiedDateTime
        ActivationMaximumDuration      = $activationExpiration.maximumDuration
        ActivationMfaRequired          = Test-PimRuleEnabled -Rule $activationEnablement -Name "MultiFactorAuthentication"
        ActivationJustificationRequired= Test-PimRuleEnabled -Rule $activationEnablement -Name "Justification"
        ActivationTicketRequired       = Test-PimRuleEnabled -Rule $activationEnablement -Name "Ticketing"
        AuthenticationContextEnabled   = [bool]$activationAuthContext.isEnabled
        AuthenticationContextClaim     = $activationAuthContext.claimValue
        ApprovalRequired               = $approvalRequired
        Approvers                      = Get-ApproverSummary -ApprovalRule $activationApproval
        PermanentEligibilityAllowed    = -not [bool]$eligibleExpiration.isExpirationRequired
        EligibilityMaximumDuration     = $eligibleExpiration.maximumDuration
        PermanentActiveAllowed         = -not [bool]$activeExpiration.isExpirationRequired
        ActiveMaximumDuration          = $activeExpiration.maximumDuration
        ActiveAssignmentMfaRequired    = Test-PimRuleEnabled -Rule $activeEnablement -Name "MultiFactorAuthentication"
        ActiveAssignmentJustification  = Test-PimRuleEnabled -Rule $activeEnablement -Name "Justification"
        NotificationRules              = $notificationSummary
    }
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmm"
$policyReport |
    Sort-Object RoleName |
    Export-Csv ".\\Entra_PIM_RoleSettings_$timestamp.csv" -NoTypeInformation

$policyReport |
    Format-Table RoleName, ActivationMaximumDuration, ApprovalRequired, ActivationMfaRequired, AuthenticationContextEnabled, PermanentEligibilityAllowed, PermanentActiveAllowed -AutoSize`;

export const pimRequestHistoryPowerShell = `Connect-MgGraph -Scopes "RoleAssignmentSchedule.ReadWrite.Directory","RoleEligibilitySchedule.ReadWrite.Directory","Directory.Read.All"

$graphRoot = "https://graph.microsoft.com/v1.0"

$assignmentRequests = Get-GraphCollection -Uri (
    $graphRoot + "/roleManagement/directory/roleAssignmentScheduleRequests?" +
    "%24expand=principal,roleDefinition,directoryScope&%24top=999"
)

$eligibilityRequests = Get-GraphCollection -Uri (
    $graphRoot + "/roleManagement/directory/roleEligibilityScheduleRequests?" +
    "%24expand=principal,roleDefinition,directoryScope&%24top=999"
)

$assignmentReport = foreach ($request in $assignmentRequests) {
    [pscustomobject]@{
        RequestType        = "Active assignment"
        Action             = $request.action
        Status             = $request.status
        PrincipalName      = $request.principal.displayName
        PrincipalId        = $request.principalId
        RoleName           = $request.roleDefinition.displayName
        RoleDefinitionId   = $request.roleDefinitionId
        DirectoryScopeId   = $request.directoryScopeId
        Justification      = $request.justification
        TicketSystem       = $request.ticketInfo.ticketSystem
        TicketNumber       = $request.ticketInfo.ticketNumber
        RequestedStartUtc  = $request.scheduleInfo.startDateTime
        ExpirationType     = $request.scheduleInfo.expiration.type
        RequestedEndUtc    = $request.scheduleInfo.expiration.endDateTime
        RequestedDuration  = $request.scheduleInfo.expiration.duration
        CreatedDateTimeUtc = $request.createdDateTime
        CompletedDateTimeUtc = $request.completedDateTime
        RequestId          = $request.id
        TargetScheduleId   = $request.targetScheduleId
        ApprovalId         = $request.approvalId
    }
}

$eligibilityReport = foreach ($request in $eligibilityRequests) {
    [pscustomobject]@{
        RequestType        = "Eligibility"
        Action             = $request.action
        Status             = $request.status
        PrincipalName      = $request.principal.displayName
        PrincipalId        = $request.principalId
        RoleName           = $request.roleDefinition.displayName
        RoleDefinitionId   = $request.roleDefinitionId
        DirectoryScopeId   = $request.directoryScopeId
        Justification      = $request.justification
        TicketSystem       = $request.ticketInfo.ticketSystem
        TicketNumber       = $request.ticketInfo.ticketNumber
        RequestedStartUtc  = $request.scheduleInfo.startDateTime
        ExpirationType     = $request.scheduleInfo.expiration.type
        RequestedEndUtc    = $request.scheduleInfo.expiration.endDateTime
        RequestedDuration  = $request.scheduleInfo.expiration.duration
        CreatedDateTimeUtc = $request.createdDateTime
        CompletedDateTimeUtc = $request.completedDateTime
        RequestId          = $request.id
        TargetScheduleId   = $request.targetScheduleId
        ApprovalId         = $request.approvalId
    }
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmm"
@($assignmentReport + $eligibilityReport) |
    Sort-Object CreatedDateTimeUtc -Descending |
    Export-Csv ".\\Entra_PIM_Requests_$timestamp.csv" -NoTypeInformation`;

export const pendingApprovalPowerShell = `Connect-MgGraph -Scopes "RoleAssignmentSchedule.ReadWrite.Directory","RoleManagement.Read.Directory"

$uri = "https://graph.microsoft.com/v1.0/roleManagement/directory/" +
       "roleAssignmentScheduleRequests/filterByCurrentUser(on='approver')?" +
       "%24filter=status%20eq%20'PendingApproval'"

$pendingApprovals = Get-GraphCollection -Uri $uri

$pendingApprovals |
    Select-Object id, action, status, principalId, roleDefinitionId,
        directoryScopeId, justification, createdDateTime, approvalId |
    Sort-Object createdDateTime`;

export const selfActivateHttp = `POST https://graph.microsoft.com/v1.0/roleManagement/directory/roleAssignmentScheduleRequests
Content-Type: application/json

{
  "action": "selfActivate",
  "principalId": "00000000-0000-0000-0000-000000000000",
  "roleDefinitionId": "00000000-0000-0000-0000-000000000000",
  "directoryScopeId": "/",
  "justification": "CHG0001234 - approved privileged task",
  "scheduleInfo": {
    "startDateTime": "2026-09-29T20:00:00Z",
    "expiration": {
      "type": "afterDuration",
      "duration": "PT2H"
    }
  },
  "ticketInfo": {
    "ticketSystem": "Change management",
    "ticketNumber": "CHG0001234"
  }
}`;

export const auditCorrelationKql = `// Start with the PIM audit event and capture roleAssignmentRequestId
AuditLogs
| where TimeGenerated > ago(30d)
| where OperationName has_any (
    "Add member to role",
    "Remove member from role",
    "PIM activation",
    "role assignment"
)
| project TimeGenerated, OperationName, Result, InitiatedBy,
          TargetResources, CorrelationId, AdditionalDetails
| order by TimeGenerated desc

// Then replace the value below to reconstruct the request lifecycle
let roleAssignmentRequestId = "<roleAssignmentRequestId>";
AuditLogs
| where TimeGenerated > ago(30d)
| where AdditionalDetails has roleAssignmentRequestId
| project TimeGenerated, OperationName, Result, InitiatedBy,
          TargetResources, CorrelationId, AdditionalDetails
| order by TimeGenerated asc`;
