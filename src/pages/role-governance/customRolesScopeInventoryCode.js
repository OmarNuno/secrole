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

export const customRoleDefinitionInventory = `# Read-only: inventory Microsoft Entra custom role definitions.
# Run Get-GraphCollection first.

Connect-MgGraph -Scopes "RoleManagement.Read.Directory","Directory.Read.All"

$graphRoot = "https://graph.microsoft.com/v1.0"
$uri = $graphRoot + "/roleManagement/directory/roleDefinitions?" +
       "%24filter=isBuiltIn%20eq%20false&" +
       "%24select=id,displayName,description,isBuiltIn,isEnabled,templateId,version,resourceScopes,rolePermissions&" +
       "%24top=999"

$definitions = Get-GraphCollection -Uri $uri

$definitionReport = foreach ($definition in $definitions) {
    $actions = @(
        $definition.rolePermissions |
            ForEach-Object { @($_.allowedResourceActions) }
    ) | Sort-Object -Unique

    [pscustomobject]@{
        RoleName               = $definition.displayName
        RoleDefinitionId       = $definition.id
        TemplateId             = $definition.templateId
        Description            = $definition.description
        IsEnabled              = $definition.isEnabled
        IsBuiltIn              = $definition.isBuiltIn
        Version                = $definition.version
        PermissionCount        = $actions.Count
        AllowedResourceActions = $actions -join "; "
        ResourceScopes         = @($definition.resourceScopes) -join "; "
    }
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmm"
$definitionReport |
    Sort-Object RoleName |
    Export-Csv ".\\Entra_Custom_Role_Definitions_$timestamp.csv" -NoTypeInformation

$definitionReport | Format-Table RoleName, IsEnabled, PermissionCount -AutoSize`;

export const customRoleAssignmentInventory = `# Read-only: inventory active and eligible assignments for custom roles.
# Run Get-GraphCollection and the custom-role definition inventory first.

Connect-MgGraph -Scopes @(
    "RoleManagement.Read.Directory",
    "RoleAssignmentSchedule.Read.Directory",
    "Directory.Read.All"
)

$graphRoot = "https://graph.microsoft.com/v1.0"
$customRoleIds = @($definitions.id)

$activeUri = $graphRoot + "/roleManagement/directory/roleAssignmentScheduleInstances?" +
             "%24expand=principal,roleDefinition,directoryScope&%24top=999"
$eligibleUri = $graphRoot + "/roleManagement/directory/roleEligibilityScheduleInstances?" +
               "%24expand=principal,roleDefinition,directoryScope&%24top=999"

$activeInstances = Get-GraphCollection -Uri $activeUri
$eligibleInstances = Get-GraphCollection -Uri $eligibleUri

function Get-ScopeType {
    param([string]$DirectoryScopeId)

    if ($DirectoryScopeId -eq "/") { return "Tenant" }
    if ($DirectoryScopeId -like "/administrativeUnits/*") { return "AdministrativeUnit" }
    return "MicrosoftEntraResource"
}

$activeReport = foreach ($item in $activeInstances) {
    if ($item.roleDefinitionId -notin $customRoleIds) { continue }

    [pscustomobject]@{
        RoleName         = $item.roleDefinition.displayName
        RoleDefinitionId = $item.roleDefinitionId
        PrincipalName    = $item.principal.displayName
        PrincipalId      = $item.principalId
        PrincipalType    = $item.principal.'@odata.type' -replace '#microsoft.graph.',''
        AssignmentState  = "Active"
        MemberType       = $item.memberType
        DirectoryScopeId = $item.directoryScopeId
        ScopeType        = Get-ScopeType -DirectoryScopeId $item.directoryScopeId
        ScopeDisplayName = $item.directoryScope.displayName
        StartDateTime    = $item.startDateTime
        EndDateTime      = $item.endDateTime
        IsPermanent      = [string]::IsNullOrWhiteSpace([string]$item.endDateTime)
        AssignmentId     = $item.id
    }
}

$eligibleReport = foreach ($item in $eligibleInstances) {
    if ($item.roleDefinitionId -notin $customRoleIds) { continue }

    [pscustomobject]@{
        RoleName         = $item.roleDefinition.displayName
        RoleDefinitionId = $item.roleDefinitionId
        PrincipalName    = $item.principal.displayName
        PrincipalId      = $item.principalId
        PrincipalType    = $item.principal.'@odata.type' -replace '#microsoft.graph.',''
        AssignmentState  = "Eligible"
        MemberType       = $item.memberType
        DirectoryScopeId = $item.directoryScopeId
        ScopeType        = Get-ScopeType -DirectoryScopeId $item.directoryScopeId
        ScopeDisplayName = $item.directoryScope.displayName
        StartDateTime    = $item.startDateTime
        EndDateTime      = $item.endDateTime
        IsPermanent      = [string]::IsNullOrWhiteSpace([string]$item.endDateTime)
        AssignmentId     = $item.id
    }
}

$assignmentReport = @($activeReport + $eligibleReport)
$timestamp = Get-Date -Format "yyyyMMdd_HHmm"
$assignmentReport |
    Sort-Object RoleName, PrincipalName, AssignmentState, DirectoryScopeId |
    Export-Csv ".\\Entra_Custom_Role_Assignments_$timestamp.csv" -NoTypeInformation

$assignmentReport |
    Group-Object AssignmentState, ScopeType |
    Select-Object Name, Count |
    Format-Table -AutoSize`;

export const administrativeUnitInventory = `# Read-only: inventory Administrative Units, members, and scoped role paths.
# Run Get-GraphCollection first.

Connect-MgGraph -Scopes @(
    "AdministrativeUnit.Read.All",
    "RoleManagement.Read.Directory",
    "RoleAssignmentSchedule.Read.Directory",
    "Directory.Read.All"
)

$graphRoot = "https://graph.microsoft.com/v1.0"
$administrativeUnits = Get-GraphCollection -Uri (
    $graphRoot + "/directory/administrativeUnits?" +
    "%24select=id,displayName,description,membershipType,membershipRule," +
    "membershipRuleProcessingState,visibility,isMemberManagementRestricted&%24top=999"
)

$activeInstances = Get-GraphCollection -Uri (
    $graphRoot + "/roleManagement/directory/roleAssignmentScheduleInstances?" +
    "%24expand=principal,roleDefinition,directoryScope&%24top=999"
)

$eligibleInstances = Get-GraphCollection -Uri (
    $graphRoot + "/roleManagement/directory/roleEligibilityScheduleInstances?" +
    "%24expand=principal,roleDefinition,directoryScope&%24top=999"
)

$auReport = foreach ($au in $administrativeUnits) {
    $members = Get-GraphCollection -Uri (
        $graphRoot + "/directory/administrativeUnits/" + $au.id +
        "/members?%24select=id,displayName&%24top=999"
    )

    $scopeId = "/administrativeUnits/" + $au.id
    $activeScoped = @($activeInstances | Where-Object directoryScopeId -eq $scopeId)
    $eligibleScoped = @($eligibleInstances | Where-Object directoryScopeId -eq $scopeId)

    $users = @($members | Where-Object { $_.'@odata.type' -eq '#microsoft.graph.user' })
    $groups = @($members | Where-Object { $_.'@odata.type' -eq '#microsoft.graph.group' })
    $devices = @($members | Where-Object { $_.'@odata.type' -eq '#microsoft.graph.device' })

    [pscustomobject]@{
        AdministrativeUnitName        = $au.displayName
        AdministrativeUnitId          = $au.id
        Description                   = $au.description
        MembershipType                = $au.membershipType
        MembershipRule                = $au.membershipRule
        MembershipRuleProcessingState = $au.membershipRuleProcessingState
        Visibility                    = $au.visibility
        IsRestrictedManagement        = $au.isMemberManagementRestricted
        UserCount                     = $users.Count
        GroupCount                    = $groups.Count
        DeviceCount                   = $devices.Count
        ActiveRoleAssignmentCount     = $activeScoped.Count
        EligibleRoleAssignmentCount   = $eligibleScoped.Count
        ScopedRoleAssignmentCount     = $activeScoped.Count + $eligibleScoped.Count
    }
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmm"
$auReport |
    Sort-Object AdministrativeUnitName |
    Export-Csv ".\\Entra_Administrative_Units_$timestamp.csv" -NoTypeInformation

$auReport |
    Format-Table AdministrativeUnitName, IsRestrictedManagement, UserCount, GroupCount, DeviceCount, ScopedRoleAssignmentCount -AutoSize`;

export const customRoleFindings = `# Read-only: prioritize custom-role and Administrative Unit review findings.
# Run the preceding inventory scripts first.

$findings = [System.Collections.Generic.List[object]]::new()

function Add-Finding {
    param(
        [string]$Severity,
        [string]$Finding,
        [string]$TargetType,
        [string]$TargetName,
        [string]$TargetId,
        [string]$Evidence,
        [string]$RecommendedAction
    )

    $findings.Add([pscustomobject]@{
        Severity          = $Severity
        Finding           = $Finding
        TargetType        = $TargetType
        TargetName        = $TargetName
        TargetId          = $TargetId
        Evidence          = $Evidence
        RecommendedAction = $RecommendedAction
    })
}

foreach ($definition in $definitionReport) {
    $assignments = @($assignmentReport | Where-Object RoleDefinitionId -eq $definition.RoleDefinitionId)

    if (-not $definition.Description) {
        $finding = @{
            Severity = "Medium"
            Finding = "MISSING_DESCRIPTION"
            TargetType = "RoleDefinition"
            TargetName = $definition.RoleName
            TargetId = $definition.RoleDefinitionId
            Evidence = "The custom role has no useful description."
            RecommendedAction = "Document the business task, supported actions, owner, and review trigger."
        }
        Add-Finding @finding
    }

    if ($assignments.Count -eq 0) {
        $finding = @{
            Severity = "Review"
            Finding = "CUSTOM_ROLE_WITH_NO_ASSIGNMENTS"
            TargetType = "RoleDefinition"
            TargetName = $definition.RoleName
            TargetId = $definition.RoleDefinitionId
            Evidence = "No active or eligible assignment instance was found."
            RecommendedAction = "Confirm whether the definition is staged, stale, or safe to retire."
        }
        Add-Finding @finding
    }

    if ($definition.IsEnabled -eq $false -and $assignments.Count -gt 0) {
        $finding = @{
            Severity = "High"
            Finding = "DISABLED_ROLE_WITH_ASSIGNMENTS"
            TargetType = "RoleDefinition"
            TargetName = $definition.RoleName
            TargetId = $definition.RoleDefinitionId
            Evidence = "The definition is disabled but assignment records remain."
            RecommendedAction = "Resolve effective access, dependencies, and cleanup evidence."
        }
        Add-Finding @finding
    }

    if ($definition.AllowedResourceActions -match '(allTasks|credentials/update|authenticationMethods|roleAssignments|authorizationPolicy|conditionalAccess|appRoleAssignedTo/update)') {
        $finding = @{
            Severity = "High"
            Finding = "HIGH_IMPACT_ACTION"
            TargetType = "RoleDefinition"
            TargetName = $definition.RoleName
            TargetId = $definition.RoleDefinitionId
            Evidence = $definition.AllowedResourceActions
            RecommendedAction = "Verify the action set, assignment scope, PIM controls, and negative test cases."
        }
        Add-Finding @finding
    }
}

foreach ($assignment in $assignmentReport) {
    if ($assignment.DirectoryScopeId -eq "/") {
        $finding = @{
            Severity = "High"
            Finding = "TENANT_SCOPE_CUSTOM_ROLE"
            TargetType = "RoleAssignment"
            TargetName = $assignment.RoleName
            TargetId = $assignment.AssignmentId
            Evidence = $assignment.PrincipalName + " | " + $assignment.AssignmentState
            RecommendedAction = "Confirm that tenant scope is required and that narrower AU or resource scope cannot satisfy the task."
        }
        Add-Finding @finding
    }

    if ($assignment.AssignmentState -eq "Active" -and $assignment.IsPermanent -eq $true) {
        $finding = @{
            Severity = "High"
            Finding = "PERMANENT_ACTIVE_ASSIGNMENT"
            TargetType = "RoleAssignment"
            TargetName = $assignment.RoleName
            TargetId = $assignment.AssignmentId
            Evidence = $assignment.PrincipalName + " | " + $assignment.DirectoryScopeId
            RecommendedAction = "Evaluate time-bound or eligible access and preserve an approved exception when standing access is required."
        }
        Add-Finding @finding
    }

    if ($assignment.PrincipalType -eq "servicePrincipal" -and $assignment.ScopeType -eq "AdministrativeUnit") {
        $finding = @{
            Severity = "Review"
            Finding = "SERVICE_PRINCIPAL_DIRECTORY_READ_CHECK"
            TargetType = "RoleAssignment"
            TargetName = $assignment.RoleName
            TargetId = $assignment.AssignmentId
            Evidence = $assignment.PrincipalName + " | " + $assignment.DirectoryScopeId
            RecommendedAction = "Verify the service principal has sufficient tenant-scoped directory read permission to locate target objects."
        }
        Add-Finding @finding
    }
}

foreach ($au in $auReport) {
    if ($au.IsRestrictedManagement -eq $true) {
        $finding = @{
            Severity = "High"
            Finding = "RESTRICTED_AU_WORKFLOW_RISK"
            TargetType = "AdministrativeUnit"
            TargetName = $au.AdministrativeUnitName
            TargetId = $au.AdministrativeUnitId
            Evidence = $au.UserCount.ToString() + " users; " + $au.GroupCount.ToString() + " groups; " + $au.DeviceCount.ToString() + " devices"
            RecommendedAction = "Validate support, recovery, automation, lifecycle, PIM, access-review, and group-owner workflows before changing membership."
        }
        Add-Finding @finding
    }

    if ($au.GroupCount -gt 0) {
        $finding = @{
            Severity = "Review"
            Finding = "AU_GROUP_MEMBER_ASSUMPTION"
            TargetType = "AdministrativeUnit"
            TargetName = $au.AdministrativeUnitName
            TargetId = $au.AdministrativeUnitId
            Evidence = $au.GroupCount.ToString() + " group objects are members of this Administrative Unit."
            RecommendedAction = "Confirm whether user or device members must also be added directly for the delegated task."
        }
        Add-Finding @finding
    }

    if ($au.ScopedRoleAssignmentCount -eq 0) {
        $finding = @{
            Severity = "Review"
            Finding = "AU_WITH_NO_SCOPED_ASSIGNMENTS"
            TargetType = "AdministrativeUnit"
            TargetName = $au.AdministrativeUnitName
            TargetId = $au.AdministrativeUnitId
            Evidence = "No active or eligible scoped role assignment was found."
            RecommendedAction = "Confirm whether the Administrative Unit is staged, used only for other services, or ready for retirement."
        }
        Add-Finding @finding
    }
}

$severityOrder = @{ High = 1; Medium = 2; Review = 3 }
$timestamp = Get-Date -Format "yyyyMMdd_HHmm"
$findings |
    Sort-Object @{Expression={ $severityOrder[$_.Severity] }}, Finding, TargetName |
    Export-Csv ".\\Entra_Custom_Role_Findings_$timestamp.csv" -NoTypeInformation

$findings | Group-Object Severity, Finding | Select-Object Name, Count | Format-Table -AutoSize`;
