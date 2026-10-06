export const purviewRoleGroupInventoryPowerShell = `# Read-only: export Microsoft Purview role groups, assigned roles, and members.
# Requires the ExchangeOnlineManagement module and an account that can read
# Security & Compliance role configuration.

$ErrorActionPreference = "Stop"
Import-Module ExchangeOnlineManagement
Connect-IPPSSession

$timestamp = Get-Date -Format "yyyyMMdd_HHmm"
$roleGroups = @(Get-RoleGroup -ResultSize Unlimited | Sort-Object Name)

$summaryRows = [System.Collections.Generic.List[object]]::new()
$memberRows = [System.Collections.Generic.List[object]]::new()
$roleRows = [System.Collections.Generic.List[object]]::new()

foreach ($group in $roleGroups) {
    $members = @(
        Get-RoleGroupMember -Identity $group.Identity -ResultSize Unlimited -ErrorAction SilentlyContinue
    )

    $assignments = @(
        Get-ManagementRoleAssignment -RoleAssignee $group.Identity -ErrorAction SilentlyContinue
    )

    $roleNames = @(
        $assignments |
            ForEach-Object { [string]$_.Role } |
            Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
            Sort-Object -Unique
    )

    $memberNames = @(
        $members |
            ForEach-Object {
                if ($_.PrimarySmtpAddress) { [string]$_.PrimarySmtpAddress }
                elseif ($_.Name) { [string]$_.Name }
                else { [string]$_.Identity }
            } |
            Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
            Sort-Object -Unique
    )

    $summaryRows.Add([pscustomobject]@{
        RoleGroupName = $group.Name
        Identity      = $group.Identity
        Description   = $group.Description
        RoleCount     = $roleNames.Count
        Roles         = $roleNames -join "; "
        MemberCount   = $memberNames.Count
        Members       = $memberNames -join "; "
        ManagedBy     = @($group.ManagedBy) -join "; "
        WhenCreated   = $group.WhenCreatedUTC
    })

    foreach ($member in $members) {
        $memberRows.Add([pscustomobject]@{
            RoleGroupName       = $group.Name
            RoleGroupIdentity   = $group.Identity
            MemberName          = $member.Name
            MemberIdentity      = $member.Identity
            PrimarySmtpAddress  = $member.PrimarySmtpAddress
            RecipientType       = $member.RecipientType
            RecipientTypeDetail = $member.RecipientTypeDetails
        })
    }

    foreach ($assignment in $assignments) {
        $roleRows.Add([pscustomobject]@{
            RoleGroupName      = $group.Name
            RoleGroupIdentity  = $group.Identity
            RoleName           = $assignment.Role
            AssignmentName     = $assignment.Name
            AssignmentMethod   = $assignment.AssignmentMethod
            EffectiveUserName  = $assignment.EffectiveUserName
            RoleAssigneeType   = $assignment.RoleAssigneeType
            CustomRecipientWriteScope = $assignment.CustomRecipientWriteScope
            CustomConfigWriteScope    = $assignment.CustomConfigWriteScope
        })
    }
}

$summaryRows |
    Export-Csv ".\\Purview_RoleGroups_$timestamp.csv" -NoTypeInformation

$memberRows |
    Sort-Object RoleGroupName, PrimarySmtpAddress, MemberName |
    Export-Csv ".\\Purview_RoleGroupMembers_$timestamp.csv" -NoTypeInformation

$roleRows |
    Sort-Object RoleGroupName, RoleName |
    Export-Csv ".\\Purview_RoleGroupRoles_$timestamp.csv" -NoTypeInformation

Write-Host "Role groups: $($summaryRows.Count)" -ForegroundColor Cyan
Write-Host "Membership rows: $($memberRows.Count)" -ForegroundColor Cyan
Write-Host "Role assignment rows: $($roleRows.Count)" -ForegroundColor Cyan`;

export const complianceBoundaryInventoryPowerShell = `# Read-only: export eDiscovery search-permissions filters.
# These filters can restrict which content locations an investigator can search.

$ErrorActionPreference = "Stop"
Import-Module ExchangeOnlineManagement
Connect-IPPSSession

$timestamp = Get-Date -Format "yyyyMMdd_HHmm"
$filters = @(Get-ComplianceSecurityFilter -ErrorAction Stop)

$report = foreach ($filter in $filters) {
    [pscustomobject]@{
        FilterName = $filter.FilterName
        Action     = $filter.Action
        Users      = @($filter.Users) -join "; "
        Filters    = @($filter.Filters) -join "; "
        Region     = $filter.Region
    }
}

$report |
    Sort-Object FilterName |
    Export-Csv ".\\Purview_ComplianceSecurityFilters_$timestamp.csv" -NoTypeInformation

$report | Format-Table FilterName, Action, Users -AutoSize`;

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

export const administrativeUnitInventoryPowerShell = `# Read-only: inventory Microsoft Entra Administrative Units and direct members.
# Reconcile this export with Purview Settings > Roles and scopes because
# Purview role-group-to-AU assignments are managed in the Purview portal.
# Run Get-GraphCollection first.

Connect-MgGraph -Scopes "AdministrativeUnit.Read.All","Directory.Read.All"

$graphRoot = "https://graph.microsoft.com/v1.0"
$units = Get-GraphCollection -Uri (
    $graphRoot + "/directory/administrativeUnits?" +
    "%24select=id,displayName,description,membershipType,membershipRule," +
    "membershipRuleProcessingState,visibility&%24top=999"
)

$unitRows = [System.Collections.Generic.List[object]]::new()
$memberRows = [System.Collections.Generic.List[object]]::new()

foreach ($unit in $units) {
    $members = Get-GraphCollection -Uri (
        $graphRoot + "/directory/administrativeUnits/" + $unit.id +
        "/members?%24select=id,displayName,userPrincipalName,mail&%24top=999"
    )

    $users = @($members | Where-Object { $_.'@odata.type' -eq '#microsoft.graph.user' })
    $groups = @($members | Where-Object { $_.'@odata.type' -eq '#microsoft.graph.group' })
    $devices = @($members | Where-Object { $_.'@odata.type' -eq '#microsoft.graph.device' })

    $unitRows.Add([pscustomobject]@{
        AdministrativeUnitName = $unit.displayName
        AdministrativeUnitId   = $unit.id
        Description            = $unit.description
        MembershipType         = $unit.membershipType
        MembershipRule         = $unit.membershipRule
        RuleProcessingState    = $unit.membershipRuleProcessingState
        Visibility             = $unit.visibility
        UserCount              = $users.Count
        GroupCount             = $groups.Count
        DeviceCount            = $devices.Count
    })

    foreach ($member in $members) {
        $memberRows.Add([pscustomobject]@{
            AdministrativeUnitName = $unit.displayName
            AdministrativeUnitId   = $unit.id
            MemberDisplayName      = $member.displayName
            MemberId               = $member.id
            MemberType             = $member.'@odata.type' -replace '#microsoft.graph.',''
            UserPrincipalName      = $member.userPrincipalName
            Mail                   = $member.mail
        })
    }
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmm"
$unitRows |
    Sort-Object AdministrativeUnitName |
    Export-Csv ".\\Purview_AdministrativeUnits_$timestamp.csv" -NoTypeInformation

$memberRows |
    Sort-Object AdministrativeUnitName, MemberType, MemberDisplayName |
    Export-Csv ".\\Purview_AdministrativeUnitMembers_$timestamp.csv" -NoTypeInformation`;

export const purviewFindingsPowerShell = `# Read-only: prioritize findings from the preceding role-group and filter reports.
# Run the role-group and compliance-filter inventory first.

$findings = [System.Collections.Generic.List[object]]::new()

function Add-PurviewFinding {
    param(
        [string]$Severity,
        [string]$Code,
        [string]$Target,
        [string]$Evidence,
        [string]$RecommendedAction
    )

    $findings.Add([pscustomobject]@{
        Severity          = $Severity
        FindingCode       = $Code
        Target            = $Target
        Evidence          = $Evidence
        RecommendedAction = $RecommendedAction
    })
}

foreach ($group in $summaryRows) {
    if ($group.MemberCount -eq 0) {
        Add-PurviewFinding "Review" "ROLE_GROUP_WITH_NO_MEMBERS" $group.RoleGroupName \`
            "The role group currently has no resolved members." \`
            "Confirm whether it is staged, filter-only, obsolete, or ready for retirement."
    }

    if ($group.RoleCount -eq 0) {
        Add-PurviewFinding "High" "ROLE_GROUP_WITH_NO_ROLES" $group.RoleGroupName \`
            "No role assignment was resolved for the role group." \`
            "Confirm design intent. Search-permissions filters require a role group with at least one role."
    }

    if ($group.Roles -match '(Role Management|Data Classification Content Viewer|Compliance Search|Export|Insider Risk Management Investigation|Communication Compliance Investigation)') {
        Add-PurviewFinding "High" "SENSITIVE_OR_DELEGATING_ROLE" $group.RoleGroupName \`
            $group.Roles \`
            "Validate membership, scope, time controls, case access, content exposure, ownership, and recent use."
    }

    if ($group.MemberCount -gt 25) {
        Add-PurviewFinding "Review" "LARGE_ROLE_GROUP_MEMBERSHIP" $group.RoleGroupName \`
            ("Resolved members: " + $group.MemberCount) \`
            "Confirm the group is a job-function boundary rather than a convenience assignment."
    }
}

foreach ($filter in $report) {
    if ([string]::IsNullOrWhiteSpace([string]$filter.Users)) {
        Add-PurviewFinding "High" "FILTER_WITHOUT_ASSIGNEES" $filter.FilterName \`
            $filter.Filters \`
            "Confirm the compliance boundary is still effective and assigned to the intended role group."
    }
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmm"
$findings |
    Sort-Object Severity, FindingCode, Target |
    Export-Csv ".\\Purview_Permission_Findings_$timestamp.csv" -NoTypeInformation

$findings | Format-Table Severity, FindingCode, Target -AutoSize`;
