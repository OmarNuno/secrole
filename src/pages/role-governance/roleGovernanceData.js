export const toc = [
  { id: "mental-model", label: "The governance equation" },
  { id: "role-systems", label: "Choose the right role system" },
  { id: "assignment-model", label: "Assignment state and inheritance" },
  { id: "scope", label: "Scope and delegation" },
  { id: "governance-controls", label: "PIM, groups, and emergency access" },
  { id: "review-workflow", label: "Repeatable review workflow" },
  { id: "commands", label: "Read-only inventory" },
  { id: "troubleshooting", label: "Troubleshooting field guide" },
  { id: "faq", label: "Questions administrators ask" },
  { id: "official-sources", label: "Official sources" },
  { id: "related-guides", label: "Related SecRole resources" },
];

export const faq = [
  {
    question: "What is the difference between a Microsoft Entra role and an Azure role?",
    answer: "Microsoft Entra roles authorize management of directory and Microsoft 365 identity resources through Microsoft Graph. Azure roles authorize management or data access for Azure resources through Azure Resource Manager. Similar names do not make the two role systems interchangeable.",
  },
  {
    question: "Does an eligible PIM assignment grant access immediately?",
    answer: "No. Eligibility means the principal can activate the role during the eligibility window. Access begins only after the required activation controls are completed and an active assignment instance exists.",
  },
  {
    question: "Is a permanent assignment always active?",
    answer: "No. Permanent describes duration, while active or eligible describes assignment type. A principal can be permanently eligible, permanently active, time-bound eligible, or time-bound active.",
  },
  {
    question: "Can I assign a Microsoft Entra role to any existing group?",
    answer: "No. The group must be created with isAssignableToRole set to true. That property is immutable, dynamic membership and nested groups are not supported, and membership management becomes part of the privileged-access boundary.",
  },
  {
    question: "Does Administrative Unit scope hide users outside the Administrative Unit?",
    answer: "No. Administrative Units constrain supported management permissions. They do not create a general data-visibility boundary or remove ordinary directory browsing permissions outside the scope.",
  },
  {
    question: "Why does a user still lack access after activating a role?",
    answer: "Confirm the correct role system, assignment scope, activation status and expiration, group-based inheritance, target action, and token or session refresh. A valid activation for a Microsoft Entra role does not grant Azure RBAC access, and an Azure role does not grant Microsoft Graph directory permissions.",
  },
  {
    question: "Should every privileged role be eligible in PIM?",
    answer: "Most human administrative access should be just-in-time where licensing and operations support it. Emergency access accounts are a deliberate exception: Microsoft recommends two or more cloud-only accounts with permanent active Global Administrator assignments, strong phishing-resistant authentication, monitoring, and regular testing.",
  },
  {
    question: "When should I create a custom Microsoft Entra role?",
    answer: "Use a built-in role when it meets the task. Create a custom role when the built-in choices are materially too broad or too narrow, then include only the required supported actions and assign the role at the narrowest workable scope.",
  },
];

export const sources = [
  {
    title: "Best practices for Microsoft Entra roles",
    href: "https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/best-practices",
    note: "Least privilege, PIM, access reviews, privileged-role limits, group assignments, cloud-native admin accounts, emergency access, and layered controls.",
  },
  {
    title: "Overview of role-based access control in Microsoft Entra ID",
    href: "https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/custom-overview",
    note: "Role definitions, assignments, principals, tenant and resource scopes, and the distinction from Azure RBAC.",
  },
  {
    title: "What is Microsoft Entra Privileged Identity Management?",
    href: "https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure",
    note: "Eligible and active assignments, activation, time bounds, approval, MFA, notifications, reviews, and audit history.",
  },
  {
    title: "Use Microsoft Entra groups to manage role assignments",
    href: "https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/groups-concept",
    note: "Role-assignable group creation, immutable isAssignableToRole, assigned membership, no nesting, delegated ownership, and protection requirements.",
  },
  {
    title: "Administrative units in Microsoft Entra ID",
    href: "https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/administrative-units",
    note: "Scoped administration for users, groups, and devices, along with important container and membership limitations.",
  },
  {
    title: "Manage emergency access admin accounts",
    href: "https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/security-emergency-access",
    note: "Cloud-only emergency identities, permanent active Global Administrator assignments, strong authentication, monitoring, and testing.",
  },
  {
    title: "unifiedRoleAssignment resource",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/unifiedroleassignment?view=graph-rest-1.0",
    note: "Direct role definition assignments to users, role-assignable groups, or service principals at a specified scope.",
  },
  {
    title: "unifiedRoleAssignmentScheduleInstance resource",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/unifiedroleassignmentscheduleinstance?view=graph-rest-1.0",
    note: "The effective instances for assigned and PIM-activated Microsoft Entra role access.",
  },
  {
    title: "unifiedRoleEligibilityScheduleInstance resource",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/unifiedroleeligibilityscheduleinstance?view=graph-rest-1.0",
    note: "The effective instances for current Microsoft Entra role eligibility, including scope, dates, and inheritance type.",
  },
  {
    title: "Microsoft Entra built-in roles",
    href: "https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference",
    note: "Current role definitions, permissions, privileged markers, template IDs, and service-specific capabilities.",
  },
];

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

export const roleInventoryPowerShell = `Connect-MgGraph -Scopes "RoleManagement.Read.Directory","Directory.Read.All"

$graphRoot = "https://graph.microsoft.com/v1.0"

$definitions = Get-GraphCollection -Uri (
    $graphRoot + "/roleManagement/directory/roleDefinitions?" +
    "%24select=id,displayName,description,isBuiltIn,templateId"
)

$directAssignments = Get-GraphCollection -Uri (
    $graphRoot + "/roleManagement/directory/roleAssignments?" +
    "%24expand=principal,roleDefinition,directoryScope&%24top=999"
)

$activeInstances = Get-GraphCollection -Uri (
    $graphRoot + "/roleManagement/directory/roleAssignmentScheduleInstances?" +
    "%24expand=principal,roleDefinition,directoryScope&%24top=999"
)

$eligibleInstances = Get-GraphCollection -Uri (
    $graphRoot + "/roleManagement/directory/roleEligibilityScheduleInstances?" +
    "%24expand=principal,roleDefinition,directoryScope&%24top=999"
)

[pscustomobject]@{
    RoleDefinitions   = $definitions.Count
    DirectAssignments = $directAssignments.Count
    ActiveInstances   = $activeInstances.Count
    EligibleInstances = $eligibleInstances.Count
}`;

export const assignmentExportPowerShell = `$activeReport = foreach ($item in $activeInstances) {
    [pscustomobject]@{
        AssignmentState = $item.assignmentType
        Eligibility     = "Active"
        MemberType      = $item.memberType
        PrincipalName   = $item.principal.displayName
        PrincipalId     = $item.principalId
        PrincipalType   = $item.principal.'@odata.type' -replace '#microsoft.graph.',''
        RoleName        = $item.roleDefinition.displayName
        RoleDefinitionId= $item.roleDefinitionId
        DirectoryScopeId= $item.directoryScopeId
        ScopeName       = $item.directoryScope.displayName
        StartDateTime   = $item.startDateTime
        EndDateTime     = $item.endDateTime
    }
}

$eligibleReport = foreach ($item in $eligibleInstances) {
    [pscustomobject]@{
        AssignmentState = "Eligible"
        Eligibility     = "Eligible"
        MemberType      = $item.memberType
        PrincipalName   = $item.principal.displayName
        PrincipalId     = $item.principalId
        PrincipalType   = $item.principal.'@odata.type' -replace '#microsoft.graph.',''
        RoleName        = $item.roleDefinition.displayName
        RoleDefinitionId= $item.roleDefinitionId
        DirectoryScopeId= $item.directoryScopeId
        ScopeName       = $item.directoryScope.displayName
        StartDateTime   = $item.startDateTime
        EndDateTime     = $item.endDateTime
    }
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmm"
@($activeReport + $eligibleReport) |
    Sort-Object RoleName, PrincipalName, AssignmentState |
    Export-Csv ".\\Entra_Role_Governance_$timestamp.csv" -NoTypeInformation`;

export const roleAssignableGroupsPowerShell = `$headers = @{ ConsistencyLevel = "eventual" }
$uri = "https://graph.microsoft.com/v1.0/groups?" +
       "%24filter=isAssignableToRole%20eq%20true&" +
       "%24select=id,displayName,description,securityEnabled,mailEnabled,createdDateTime&" +
       "%24count=true&%24top=999"

$roleAssignableGroups = Get-GraphCollection -Uri $uri -Headers $headers

$roleAssignableGroups |
    Select-Object id, displayName, description, securityEnabled, mailEnabled, createdDateTime |
    Sort-Object displayName`;

export const administrativeUnitsPowerShell = `$administrativeUnits = Get-GraphCollection -Uri (
    "https://graph.microsoft.com/v1.0/directory/administrativeUnits?" +
    "%24select=id,displayName,description,membershipType,membershipRule,visibility&%24top=999"
)

$administrativeUnits |
    Select-Object id, displayName, description, membershipType, visibility |
    Sort-Object displayName`;
