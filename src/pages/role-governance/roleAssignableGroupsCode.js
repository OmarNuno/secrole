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

export const roleAssignableGroupInventoryPowerShell = `Connect-MgGraph -Scopes @(
    "Group.Read.All",
    "Directory.Read.All",
    "RoleManagement.Read.Directory",
    "PrivilegedAssignmentSchedule.Read.AzureADGroup",
    "PrivilegedEligibilitySchedule.Read.AzureADGroup",
    "RoleManagementPolicy.Read.AzureADGroup"
)

$graphRoot = "https://graph.microsoft.com/v1.0"
$headers = @{ ConsistencyLevel = "eventual" }

$groupUri = $graphRoot + "/groups?" +
    "%24filter=isAssignableToRole%20eq%20true&" +
    "%24select=id,displayName,description,createdDateTime,groupTypes," +
    "mailEnabled,securityEnabled,visibility,isAssignableToRole&" +
    "%24count=true&%24top=999"

$RoleAssignableGroups = Get-GraphCollection -Uri $groupUri -Headers $headers

$timestamp = Get-Date -Format "yyyyMMdd_HHmm"
$RoleAssignableGroups |
    ForEach-Object {
        [pscustomobject]@{
            GroupDisplayName   = $_.displayName
            GroupId            = $_.id
            GroupType          = if ($_.groupTypes -contains "Unified") { "Microsoft 365" } else { "Security" }
            Description        = $_.description
            CreatedDateTime    = $_.createdDateTime
            MailEnabled        = $_.mailEnabled
            SecurityEnabled    = $_.securityEnabled
            Visibility         = $_.visibility
            IsAssignableToRole = $_.isAssignableToRole
            MembershipType     = "Assigned"
        }
    } |
    Sort-Object GroupDisplayName |
    Tee-Object -Variable RoleAssignableGroupInventory |
    Export-Csv ".\\RoleAssignable_Groups_$timestamp.csv" -NoTypeInformation

Write-Host "Role-assignable groups found: $($RoleAssignableGroups.Count)" -ForegroundColor Cyan`;

export const groupRolePathsPowerShell = `$rolePathRows = [System.Collections.Generic.List[object]]::new()

foreach ($group in $RoleAssignableGroups) {
    $groupId = $group.id

    $activeUri = $graphRoot +
        "/roleManagement/directory/roleAssignmentScheduleInstances?" +
        "%24filter=principalId%20eq%20'$groupId'&" +
        "%24expand=roleDefinition,directoryScope&%24top=999"

    $eligibleUri = $graphRoot +
        "/roleManagement/directory/roleEligibilityScheduleInstances?" +
        "%24filter=principalId%20eq%20'$groupId'&" +
        "%24expand=roleDefinition,directoryScope&%24top=999"

    $activeInstances = Get-GraphCollection -Uri $activeUri
    $eligibleInstances = Get-GraphCollection -Uri $eligibleUri

    foreach ($item in $activeInstances) {
        $rolePathRows.Add([pscustomobject]@{
            GroupDisplayName = $group.displayName
            GroupId          = $groupId
            RoleName         = $item.roleDefinition.displayName
            RoleDefinitionId = $item.roleDefinitionId
            AssignmentState  = "Active"
            AssignmentType   = $item.assignmentType
            MemberType       = $item.memberType
            DirectoryScopeId = $item.directoryScopeId
            ScopeDisplayName = $item.directoryScope.displayName
            StartDateTime    = $item.startDateTime
            EndDateTime      = $item.endDateTime
            IsPermanent      = [string]::IsNullOrWhiteSpace([string]$item.endDateTime)
            ScheduleId       = $item.roleAssignmentScheduleId
            InstanceId       = $item.id
        })
    }

    foreach ($item in $eligibleInstances) {
        $rolePathRows.Add([pscustomobject]@{
            GroupDisplayName = $group.displayName
            GroupId          = $groupId
            RoleName         = $item.roleDefinition.displayName
            RoleDefinitionId = $item.roleDefinitionId
            AssignmentState  = "Eligible"
            AssignmentType   = "Eligible"
            MemberType       = $item.memberType
            DirectoryScopeId = $item.directoryScopeId
            ScopeDisplayName = $item.directoryScope.displayName
            StartDateTime    = $item.startDateTime
            EndDateTime      = $item.endDateTime
            IsPermanent      = [string]::IsNullOrWhiteSpace([string]$item.endDateTime)
            ScheduleId       = $item.roleEligibilityScheduleId
            InstanceId       = $item.id
        })
    }
}

$RolePathReport = $rolePathRows |
    Sort-Object GroupDisplayName, RoleName, AssignmentState

$RolePathReport |
    Export-Csv ".\\RoleAssignable_Group_RolePaths_$timestamp.csv" -NoTypeInformation

Write-Host "Group role paths exported: $($RolePathReport.Count)" -ForegroundColor Cyan`;

export const groupRelationshipsPowerShell = `$relationshipRows = [System.Collections.Generic.List[object]]::new()

foreach ($group in $RoleAssignableGroups) {
    $groupId = $group.id

    $owners = Get-GraphCollection -Uri (
        $graphRoot + "/groups/$groupId/owners?" +
        "%24select=id,displayName,userPrincipalName,accountEnabled,onPremisesSyncEnabled&%24top=999"
    )

    $members = Get-GraphCollection -Uri (
        $graphRoot + "/groups/$groupId/members?" +
        "%24select=id,displayName,userPrincipalName,accountEnabled,onPremisesSyncEnabled&%24top=999"
    )

    $pimActive = Get-GraphCollection -Uri (
        $graphRoot + "/identityGovernance/privilegedAccess/group/assignmentScheduleInstances?" +
        "%24filter=groupId%20eq%20'$groupId'&%24expand=principal&%24top=999"
    )

    $pimEligible = Get-GraphCollection -Uri (
        $graphRoot + "/identityGovernance/privilegedAccess/group/eligibilityScheduleInstances?" +
        "%24filter=groupId%20eq%20'$groupId'&%24expand=principal&%24top=999"
    )

    $policyAssignments = Get-GraphCollection -Uri (
        $graphRoot + "/policies/roleManagementPolicyAssignments?" +
        "%24filter=scopeId%20eq%20'$groupId'%20and%20scopeType%20eq%20'Group'&" +
        "%24select=id,policyId,scopeId,scopeType,roleDefinitionId&%24top=999"
    )

    foreach ($owner in $owners) {
        $relationshipRows.Add([pscustomobject]@{
            GroupDisplayName         = $group.displayName
            GroupId                  = $groupId
            Relationship             = "Owner"
            AssignmentState          = "Active"
            EvidenceSource           = "Directory relationship"
            PrincipalDisplayName     = $owner.displayName
            PrincipalId              = $owner.id
            PrincipalType            = $owner.'@odata.type' -replace '#microsoft.graph.',''
            UserPrincipalName        = $owner.userPrincipalName
            AccountEnabled           = $owner.accountEnabled
            OnPremisesSyncEnabled    = $owner.onPremisesSyncEnabled
            StartDateTime            = $null
            EndDateTime              = $null
            PIMPolicyAssignmentCount = $policyAssignments.Count
        })
    }

    foreach ($member in $members) {
        $relationshipRows.Add([pscustomobject]@{
            GroupDisplayName         = $group.displayName
            GroupId                  = $groupId
            Relationship             = "Member"
            AssignmentState          = "Active"
            EvidenceSource           = "Directory relationship"
            PrincipalDisplayName     = $member.displayName
            PrincipalId              = $member.id
            PrincipalType            = $member.'@odata.type' -replace '#microsoft.graph.',''
            UserPrincipalName        = $member.userPrincipalName
            AccountEnabled           = $member.accountEnabled
            OnPremisesSyncEnabled    = $member.onPremisesSyncEnabled
            StartDateTime            = $null
            EndDateTime              = $null
            PIMPolicyAssignmentCount = $policyAssignments.Count
        })
    }

    foreach ($item in $pimActive) {
        $relationshipRows.Add([pscustomobject]@{
            GroupDisplayName         = $group.displayName
            GroupId                  = $groupId
            Relationship             = [string]$item.accessId
            AssignmentState          = "PIM Active"
            EvidenceSource           = "PIM for Groups assignment instance"
            PrincipalDisplayName     = $item.principal.displayName
            PrincipalId              = $item.principalId
            PrincipalType            = $item.principal.'@odata.type' -replace '#microsoft.graph.',''
            UserPrincipalName        = $item.principal.userPrincipalName
            AccountEnabled           = $item.principal.accountEnabled
            OnPremisesSyncEnabled    = $item.principal.onPremisesSyncEnabled
            StartDateTime            = $item.startDateTime
            EndDateTime              = $item.endDateTime
            PIMPolicyAssignmentCount = $policyAssignments.Count
        })
    }

    foreach ($item in $pimEligible) {
        $relationshipRows.Add([pscustomobject]@{
            GroupDisplayName         = $group.displayName
            GroupId                  = $groupId
            Relationship             = [string]$item.accessId
            AssignmentState          = "PIM Eligible"
            EvidenceSource           = "PIM for Groups eligibility instance"
            PrincipalDisplayName     = $item.principal.displayName
            PrincipalId              = $item.principalId
            PrincipalType            = $item.principal.'@odata.type' -replace '#microsoft.graph.',''
            UserPrincipalName        = $item.principal.userPrincipalName
            AccountEnabled           = $item.principal.accountEnabled
            OnPremisesSyncEnabled    = $item.principal.onPremisesSyncEnabled
            StartDateTime            = $item.startDateTime
            EndDateTime              = $item.endDateTime
            PIMPolicyAssignmentCount = $policyAssignments.Count
        })
    }
}

$GroupRelationshipReport = $relationshipRows |
    Sort-Object GroupDisplayName, Relationship, AssignmentState, PrincipalDisplayName

$GroupRelationshipReport |
    Export-Csv ".\\RoleAssignable_Group_Relationships_$timestamp.csv" -NoTypeInformation

Write-Host "Relationship evidence rows exported: $($GroupRelationshipReport.Count)" -ForegroundColor Cyan`;

export const controlPathFindingsPowerShell = `$findings = [System.Collections.Generic.List[object]]::new()

foreach ($group in $RoleAssignableGroups) {
    $groupRoles = @($RolePathReport | Where-Object GroupId -eq $group.id)
    $groupRelationships = @($GroupRelationshipReport | Where-Object GroupId -eq $group.id)

    $activeOwners = @($groupRelationships | Where-Object {
        $_.Relationship -match '^owner$' -and $_.AssignmentState -in @('Active','PIM Active')
    } | Sort-Object PrincipalId -Unique)

    $eligibleOwners = @($groupRelationships | Where-Object {
        $_.Relationship -match '^owner$' -and $_.AssignmentState -eq 'PIM Eligible'
    } | Sort-Object PrincipalId -Unique)

    $activeMembers = @($groupRelationships | Where-Object {
        $_.Relationship -match '^member$' -and $_.AssignmentState -in @('Active','PIM Active')
    } | Sort-Object PrincipalId -Unique)

    $eligibleMembers = @($groupRelationships | Where-Object {
        $_.Relationship -match '^member$' -and $_.AssignmentState -eq 'PIM Eligible'
    } | Sort-Object PrincipalId -Unique)

    $activeRoles = @($groupRoles | Where-Object AssignmentState -eq 'Active')
    $eligibleRoles = @($groupRoles | Where-Object AssignmentState -eq 'Eligible')
    $policyCount = @($groupRelationships | Select-Object -First 1).PIMPolicyAssignmentCount

    $addFinding = {
        param($Code, $Severity, $Detail)
        $findings.Add([pscustomobject]@{
            GroupDisplayName = $group.displayName
            GroupId          = $group.id
            FindingCode      = $Code
            Severity         = $Severity
            Detail           = $Detail
        })
    }

    if ($activeOwners.Count -eq 0) {
        & $addFinding "NO_ACTIVE_OWNER" "Critical" "No active owner was resolved. Confirm recoverability immediately."
    } elseif ($activeOwners.Count -eq 1) {
        & $addFinding "ONE_ACTIVE_OWNER" "High" "Only one active owner was resolved; eligible ownership alone does not prevent the last-active-owner deactivation trap."
    }

    if ($activeRoles.Count -gt 0 -and $activeMembers.Count -gt 0) {
        & $addFinding "STANDING_ROLE_PATH" "High" "The group has active role access and active members. Every active member receives standing administrator access."
    }

    if ($activeRoles.Count -gt 0 -and $eligibleMembers.Count -gt 0) {
        & $addFinding "JIT_BY_GROUP_MEMBERSHIP" "Review" "The role is active on the group while users activate membership. Validate target-service propagation time and PIM for Groups policy."
    }

    if ($eligibleRoles.Count -gt 0 -and $activeMembers.Count -gt 0) {
        & $addFinding "JIT_BY_ROLE_ACTIVATION" "Info" "Users are active members and the group is eligible for the role. Review the PIM role policy and approver resilience."
    }

    if ($groupRoles.Count -gt 1) {
        & $addFinding "MULTIPLE_ROLE_ASSIGNMENTS" "Review" "The group grants more than one role path. Confirm the roles share one business purpose and trust boundary."
    }

    if ($eligibleOwners.Count -gt 0 -and $activeOwners.Count -eq 1) {
        & $addFinding "LAST_OWNER_DEACTIVATION_RISK" "High" "Eligible owners exist, but only one active owner remains. Preserve another active owner before testing ownership activation."
    }

    if (@($groupRelationships | Where-Object { $_.AccountEnabled -eq $false }).Count -gt 0) {
        & $addFinding "DISABLED_PRINCIPAL" "High" "A disabled user remains in an owner, member, or PIM relationship."
    }

    if ([int]$policyCount -eq 0 -and ($eligibleMembers.Count + $eligibleOwners.Count) -gt 0) {
        & $addFinding "PIM_POLICY_NOT_RESOLVED" "Review" "Eligible relationships were found but no group-scoped policy assignment was resolved. Verify permissions and policy inventory."
    }
}

$ControlFindingReport = $findings |
    Sort-Object Severity, GroupDisplayName, FindingCode

$ControlFindingReport |
    Export-Csv ".\\RoleAssignable_Group_Findings_$timestamp.csv" -NoTypeInformation

$ControlFindingReport | Format-Table -AutoSize`;

export const createRoleAssignableGroupPowerShell = `# STATE-CHANGING EXAMPLE
# Review naming, ownership, purpose, role, scope, and recovery design first.

Connect-MgGraph -Scopes "Group.ReadWrite.All"

$body = @{
    displayName        = "SEC-ROLE-Helpdesk-Eligible"
    description        = "Governed Helpdesk Administrator access. Owner: IAM Operations. Review: quarterly."
    mailEnabled        = $false
    mailNickname       = "sec-role-helpdesk-eligible"
    securityEnabled    = $true
    isAssignableToRole = $true
}

$group = New-MgGroup -BodyParameter $body

$group |
    Select-Object Id, DisplayName, IsAssignableToRole, SecurityEnabled, MailEnabled

# isAssignableToRole is immutable. Do not continue until the returned group
# matches the approved design and accountable owners are ready.`;

export const addMemberOwnerHttp = `# STATE-CHANGING EXAMPLES
# Role-assignable group membership requires RoleManagement.ReadWrite.Directory
# and a supported signed-in administrator role such as Privileged Role Administrator.

POST https://graph.microsoft.com/v1.0/groups/{group-id}/owners/$ref
Content-Type: application/json

{
  "@odata.id": "https://graph.microsoft.com/v1.0/users/{owner-user-id}"
}

POST https://graph.microsoft.com/v1.0/groups/{group-id}/members/$ref
Content-Type: application/json

{
  "@odata.id": "https://graph.microsoft.com/v1.0/users/{member-user-id}"
}`;
