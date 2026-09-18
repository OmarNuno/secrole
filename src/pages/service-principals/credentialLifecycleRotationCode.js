export const addSecretPowerShell = `# STATE-CHANGING EXAMPLE
# Adds a second credential. The old credential remains active during validation.

$CredentialResource = "applications"   # or: servicePrincipals
$DirectoryObjectId  = "00000000-0000-0000-0000-000000000000"

if ($CredentialResource -notin @("applications","servicePrincipals")) {
    throw "CredentialResource must be applications or servicePrincipals."
}

$Body = @{
    passwordCredential = @{
        displayName   = "prod-rotation-2026-09"
        startDateTime = [DateTimeOffset]::UtcNow.ToString("o")
        endDateTime   = [DateTimeOffset]::UtcNow.AddDays(90).ToString("o")
    }
} | ConvertTo-Json -Depth 5

$NewCredential = Invoke-MgGraphRequest \`
    -Method POST \`
    -Uri "https://graph.microsoft.com/v1.0/$CredentialResource/$DirectoryObjectId/addPassword" \`
    -Body $Body \`
    -ContentType "application/json"

$NewKeyId = $NewCredential.keyId
$SecretText = $NewCredential.secretText

if (-not $SecretText) {
    throw "Microsoft Graph did not return secretText."
}

Write-Host "New credential keyId: $NewKeyId" -ForegroundColor Green
Write-Host "Store SecretText directly in the approved secret store. Do not log it."

# Send $SecretText to the approved secret store here.
# After storage, clear the local variable.
$SecretText = $null
Remove-Variable SecretText -ErrorAction SilentlyContinue`;

export const removeSecretPowerShell = `# STATE-CHANGING EXAMPLE
# Run only after the replacement is deployed and proven.

$CredentialResource = "applications"   # or: servicePrincipals
$DirectoryObjectId  = "00000000-0000-0000-0000-000000000000"
$OldCredentialKeyId = "11111111-1111-1111-1111-111111111111"

$Body = @{
    keyId = $OldCredentialKeyId
} | ConvertTo-Json

Invoke-MgGraphRequest \`
    -Method POST \`
    -Uri "https://graph.microsoft.com/v1.0/$CredentialResource/$DirectoryObjectId/removePassword" \`
    -Body $Body \`
    -ContentType "application/json"

Write-Host "Removed old credential keyId: $OldCredentialKeyId" -ForegroundColor Green`;
