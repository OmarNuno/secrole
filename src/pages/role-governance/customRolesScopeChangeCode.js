export const createCustomRolePowerShell = `# STATE-CHANGING: create one Microsoft Entra custom role definition.
# Confirm every action is enabled for custom-role use before running.

Connect-MgGraph -Scopes "RoleManagement.ReadWrite.Directory"

$body = @{
    displayName = "Regional User Profile Operator"
    description = "Updates approved profile fields for users in an assigned Administrative Unit."
    isEnabled   = $true
    templateId  = (New-Guid).Guid
    version     = "1"
    rolePermissions = @(
        @{
            allowedResourceActions = @(
                "microsoft.directory/users/basic/update",
                "microsoft.directory/users/contactInfo/update",
                "microsoft.directory/users/jobInfo/update"
            )
        }
    )
}

$customRole = New-MgRoleManagementDirectoryRoleDefinition -BodyParameter $body

$customRole |
    Select-Object Id, DisplayName, Description, IsEnabled, TemplateId, Version`;

export const assignCustomRolePowerShell = `# STATE-CHANGING: assign an existing custom role at one approved scope.
# Use exactly one DirectoryScopeId after independent review.

Connect-MgGraph -Scopes "RoleManagement.ReadWrite.Directory"

$principalId = "00000000-0000-0000-0000-000000000000"
$roleDefinitionId = "11111111-1111-1111-1111-111111111111"

# Tenant scope:
$tenantScope = "/"

# Administrative Unit scope:
$administrativeUnitId = "22222222-2222-2222-2222-222222222222"
$administrativeUnitScope = "/administrativeUnits/$administrativeUnitId"

# One supported Microsoft Entra resource, such as an app registration:
$applicationObjectId = "33333333-3333-3333-3333-333333333333"
$applicationScope = "/$applicationObjectId"

# Choose one reviewed scope. This example uses the Administrative Unit.
$body = @{
    principalId      = $principalId
    roleDefinitionId = $roleDefinitionId
    directoryScopeId = $administrativeUnitScope
}

New-MgRoleManagementDirectoryRoleAssignment -BodyParameter $body`;

export const createAdministrativeUnitPowerShell = `# STATE-CHANGING: create a regular or Restricted Management Administrative Unit.
# isMemberManagementRestricted is immutable. Test support and recovery first.

Connect-MgGraph -Scopes "AdministrativeUnit.ReadWrite.All"

$body = @{
    displayName = "Executive Identity Boundary"
    description = "Protected identities requiring explicitly scoped administration."
    visibility  = "Public"
    isMemberManagementRestricted = $true
}

$request = @{
    Method      = "POST"
    Uri         = "https://graph.microsoft.com/v1.0/directory/administrativeUnits"
    Body        = ($body | ConvertTo-Json -Depth 5)
    ContentType = "application/json"
}

Invoke-MgGraphRequest @request`;

export const applicationAssignmentRoleHttp = `# STATE-CHANGING: create a custom role for one Enterprise App assignment task.
# The role definition is tenant-wide, but its assignment can be scoped to one app.

POST https://graph.microsoft.com/v1.0/roleManagement/directory/roleDefinitions
Content-Type: application/json

{
  "displayName": "Enterprise App Assignment Operator",
  "description": "Manages user and group assignments for approved Enterprise Applications.",
  "isEnabled": true,
  "templateId": "44444444-4444-4444-4444-444444444444",
  "version": "1",
  "rolePermissions": [
    {
      "allowedResourceActions": [
        "microsoft.directory/servicePrincipals/appRoleAssignedTo/read",
        "microsoft.directory/servicePrincipals/appRoleAssignedTo/update"
      ]
    }
  ]
}`;
