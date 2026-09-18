export const credentialInventoryPowerShell = `# Read-only tenant credential inventory
# Requires: Microsoft.Graph.Applications
# Recommended scopes: Application.Read.All, Directory.Read.All

param(
    [string]$OutputFolder = "."
)

Import-Module Microsoft.Graph.Applications -ErrorAction Stop
Connect-MgGraph -Scopes "Application.Read.All","Directory.Read.All" -NoWelcome

$Now = [DateTimeOffset]::UtcNow
$Rows = [System.Collections.Generic.List[object]]::new()

function Convert-CustomKeyIdentifier {
    param($Value)

    if ($null -eq $Value) {
        return $null
    }

    try {
        if ($Value -is [byte[]]) {
            $Bytes = $Value
        }
        else {
            $Bytes = [Convert]::FromBase64String([string]$Value)
        }

        return -join ($Bytes | ForEach-Object { $_.ToString("X2") })
    }
    catch {
        return [string]$Value
    }
}

function Get-CredentialState {
    param([Nullable[DateTimeOffset]]$EndDateTime)

    if ($null -eq $EndDateTime) {
        return [pscustomobject]@{
            Status        = "No expiration recorded"
            DaysRemaining = $null
            RiskOrder     = 2
        }
    }

    $DaysRemaining = [math]::Floor(($EndDateTime.Value - $Now).TotalDays)

    if ($DaysRemaining -lt 0) {
        $Status = "Expired"
        $RiskOrder = 1
    }
    elseif ($DaysRemaining -le 7) {
        $Status = "Expires within 7 days"
        $RiskOrder = 2
    }
    elseif ($DaysRemaining -le 30) {
        $Status = "Expires within 30 days"
        $RiskOrder = 3
    }
    elseif ($DaysRemaining -le 60) {
        $Status = "Expires within 60 days"
        $RiskOrder = 4
    }
    elseif ($DaysRemaining -le 90) {
        $Status = "Expires within 90 days"
        $RiskOrder = 5
    }
    else {
        $Status = "More than 90 days"
        $RiskOrder = 6
    }

    [pscustomobject]@{
        Status        = $Status
        DaysRemaining = $DaysRemaining
        RiskOrder     = $RiskOrder
    }
}

function Add-CredentialRows {
    param(
        [Parameter(Mandatory)]$DirectoryObject,
        [Parameter(Mandatory)][string]$ObjectType,
        [string]$ServicePrincipalType
    )

    foreach ($Credential in @($DirectoryObject.PasswordCredentials)) {
        if ($null -eq $Credential) {
            continue
        }

        $End = if ($Credential.EndDateTime) {
            [DateTimeOffset]$Credential.EndDateTime
        }
        else {
            $null
        }

        $State = Get-CredentialState -EndDateTime $End
        $Locator = if ($Credential.Hint) {
            "Secret hint: $($Credential.Hint)..."
        }
        else {
            $null
        }

        $Rows.Add([pscustomobject]@{
            ObjectType           = $ObjectType
            ObjectId             = $DirectoryObject.Id
            AppId                = $DirectoryObject.AppId
            DisplayName          = $DirectoryObject.DisplayName
            ServicePrincipalType = $ServicePrincipalType
            CredentialType       = "Client secret"
            CredentialDisplayName= $Credential.DisplayName
            KeyId                = $Credential.KeyId
            Locator              = $Locator
            KeyType              = $null
            Usage                = $null
            StartDateTimeUtc     = $Credential.StartDateTime
            EndDateTimeUtc       = $Credential.EndDateTime
            DaysRemaining        = $State.DaysRemaining
            Status               = $State.Status
            RiskOrder            = $State.RiskOrder
        })
    }

    foreach ($Credential in @($DirectoryObject.KeyCredentials)) {
        if ($null -eq $Credential) {
            continue
        }

        $End = if ($Credential.EndDateTime) {
            [DateTimeOffset]$Credential.EndDateTime
        }
        else {
            $null
        }

        $State = Get-CredentialState -EndDateTime $End
        $Thumbprint = Convert-CustomKeyIdentifier -Value $Credential.CustomKeyIdentifier

        $Rows.Add([pscustomobject]@{
            ObjectType           = $ObjectType
            ObjectId             = $DirectoryObject.Id
            AppId                = $DirectoryObject.AppId
            DisplayName          = $DirectoryObject.DisplayName
            ServicePrincipalType = $ServicePrincipalType
            CredentialType       = "Certificate / key"
            CredentialDisplayName= $Credential.DisplayName
            KeyId                = $Credential.KeyId
            Locator              = if ($Thumbprint) { "Thumbprint: $Thumbprint" } else { $null }
            KeyType              = $Credential.Type
            Usage                = $Credential.Usage
            StartDateTimeUtc     = $Credential.StartDateTime
            EndDateTimeUtc       = $Credential.EndDateTime
            DaysRemaining        = $State.DaysRemaining
            Status               = $State.Status
            RiskOrder            = $State.RiskOrder
        })
    }
}

Write-Host "Reading application objects..." -ForegroundColor Cyan
Get-MgApplication -All -Property "id,appId,displayName,passwordCredentials,keyCredentials" |
    ForEach-Object {
        Add-CredentialRows -DirectoryObject $_ -ObjectType "Application"
    }

Write-Host "Reading service principal objects..." -ForegroundColor Cyan
Get-MgServicePrincipal -All -Property "id,appId,displayName,servicePrincipalType,passwordCredentials,keyCredentials" |
    ForEach-Object {
        Add-CredentialRows \`
            -DirectoryObject $_ \`
            -ObjectType "ServicePrincipal" \`
            -ServicePrincipalType $_.ServicePrincipalType
    }

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$OutputPath = Join-Path $OutputFolder "Entra_Credential_Inventory_$Timestamp.csv"

$Rows |
    Sort-Object RiskOrder, EndDateTimeUtc, DisplayName |
    Select-Object * -ExcludeProperty RiskOrder |
    Export-Csv -Path $OutputPath -NoTypeInformation -Encoding UTF8

Write-Host ""
Write-Host "Credential rows: $($Rows.Count)" -ForegroundColor Green
Write-Host "Expired: $(($Rows | Where-Object Status -eq 'Expired').Count)"
Write-Host "Expires within 30 days: $(($Rows | Where-Object { $_.DaysRemaining -ge 0 -and $_.DaysRemaining -le 30 }).Count)"
Write-Host "Report: $OutputPath" -ForegroundColor Green

Disconnect-MgGraph`;

export const ownerEnrichmentPowerShell = `# Read-only owner enrichment for only the at-risk objects in an inventory.
# Avoids one owner request for every app in a large tenant.

param(
    [Parameter(Mandatory)]
    [string]$CredentialReportPath,

    [int]$ThresholdDays = 60
)

Connect-MgGraph -Scopes "Application.Read.All","Directory.Read.All" -NoWelcome

$Rows = Import-Csv $CredentialReportPath
$AtRiskObjects = $Rows |
    Where-Object {
        $_.Status -eq "Expired" -or
        $_.Status -eq "No expiration recorded" -or
        ($_.DaysRemaining -ne "" -and [int]$_.DaysRemaining -le $ThresholdDays)
    } |
    Select-Object ObjectType, ObjectId -Unique

$OwnerMap = @{}

foreach ($Object in $AtRiskObjects) {
    $MapKey = "$($Object.ObjectType)|$($Object.ObjectId)"

    try {
        $Owners = if ($Object.ObjectType -eq "Application") {
            Get-MgApplicationOwner -ApplicationId $Object.ObjectId -All
        }
        else {
            Get-MgServicePrincipalOwner -ServicePrincipalId $Object.ObjectId -All
        }

        $OwnerLabels = foreach ($Owner in $Owners) {
            $Properties = $Owner.AdditionalProperties
            $DisplayName = $Properties["displayName"]
            $Upn = $Properties["userPrincipalName"]
            $OwnerAppId = $Properties["appId"]

            if ($Upn) {
                "$DisplayName <$Upn>"
            }
            elseif ($OwnerAppId) {
                "$DisplayName [appId: $OwnerAppId]"
            }
            elseif ($DisplayName) {
                $DisplayName
            }
            else {
                $Owner.Id
            }
        }

        $OwnerMap[$MapKey] = if ($OwnerLabels) {
            $OwnerLabels -join "; "
        }
        else {
            "NO OWNER"
        }
    }
    catch {
        $OwnerMap[$MapKey] = "LOOKUP ERROR: $($_.Exception.Message)"
    }
}

$Enriched = foreach ($Row in $Rows) {
    $MapKey = "$($Row.ObjectType)|$($Row.ObjectId)"

    [pscustomobject]@{
        ObjectType            = $Row.ObjectType
        ObjectId              = $Row.ObjectId
        AppId                 = $Row.AppId
        DisplayName           = $Row.DisplayName
        CredentialType        = $Row.CredentialType
        CredentialDisplayName = $Row.CredentialDisplayName
        KeyId                 = $Row.KeyId
        Locator               = $Row.Locator
        EndDateTimeUtc        = $Row.EndDateTimeUtc
        DaysRemaining         = $Row.DaysRemaining
        Status                = $Row.Status
        Owners                = $OwnerMap[$MapKey]
    }
}

$OutputPath = [IO.Path]::ChangeExtension(
    $CredentialReportPath,
    "with_owners.csv"
)

$Enriched | Export-Csv $OutputPath -NoTypeInformation -Encoding UTF8
Write-Host "Enriched report: $OutputPath" -ForegroundColor Green`;

export const graphInventoryRest = `GET https://graph.microsoft.com/v1.0/applications?
  $select=id,appId,displayName,passwordCredentials,keyCredentials

GET https://graph.microsoft.com/v1.0/servicePrincipals?
  $select=id,appId,displayName,servicePrincipalType,passwordCredentials,keyCredentials`;
