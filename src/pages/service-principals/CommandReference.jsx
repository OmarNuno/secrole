import { useState } from "react";

const commandSets = {
  powershell: {
    label: "Graph PowerShell",
    intro: "Read-only examples using the Microsoft Graph PowerShell SDK. Connect with only the scopes required for your investigation.",
    commands: [
      {
        id: "ps-find",
        title: "Find the application object and local service principal by client ID",
        code: `Connect-MgGraph -Scopes "Application.Read.All","Directory.Read.All"

$AppId = "00000000-0000-0000-0000-000000000000"

$app = Get-MgApplication -Filter "appId eq '$AppId'" -Property "id,appId,displayName,requiredResourceAccess,keyCredentials,passwordCredentials"

$sp = Get-MgServicePrincipal -Filter "appId eq '$AppId'" -Property "id,appId,displayName,servicePrincipalType,appOwnerOrganizationId,accountEnabled,appRoleAssignmentRequired"

$app | Select-Object DisplayName, AppId, Id
$sp  | Select-Object DisplayName, AppId, Id, ServicePrincipalType, AppOwnerOrganizationId, AccountEnabled, AppRoleAssignmentRequired`,
      },
      {
        id: "ps-permissions",
        title: "Inspect granted application and delegated permissions",
        code: `$AppId = "00000000-0000-0000-0000-000000000000"
$sp = Get-MgServicePrincipal -Filter "appId eq '$AppId'" -Property "id,displayName,appId"

# Application permissions granted to this client service principal
Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $sp.Id -All

# Delegated permission grants for this client service principal
Get-MgServicePrincipalOauth2PermissionGrant -ServicePrincipalId $sp.Id -All`,
      },
      {
        id: "ps-owners",
        title: "List service principal owners",
        code: `$AppId = "00000000-0000-0000-0000-000000000000"
$sp = Get-MgServicePrincipal -Filter "appId eq '$AppId'" -Property "id,displayName"

Get-MgServicePrincipalOwner -ServicePrincipalId $sp.Id -All |
    Select-Object Id, @{Name='Type';Expression={$_.AdditionalProperties['@odata.type']}}, @{Name='DisplayName';Expression={$_.AdditionalProperties['displayName']}}`,
      },
      {
        id: "ps-expiry",
        title: "Report expired credentials and credentials expiring within 30 days",
        code: `$Now = Get-Date
$Cutoff = $Now.AddDays(30)

$Report = Get-MgApplication -All -Property "id,displayName,appId,passwordCredentials,keyCredentials" |
    ForEach-Object {
        $App = $_

        foreach ($Credential in @($App.PasswordCredentials)) {
            [pscustomobject]@{
                Application  = $App.DisplayName
                AppId         = $App.AppId
                CredentialType = 'Client secret'
                CredentialId  = $Credential.KeyId
                EndDateTime   = $Credential.EndDateTime
            }
        }

        foreach ($Credential in @($App.KeyCredentials)) {
            [pscustomobject]@{
                Application  = $App.DisplayName
                AppId         = $App.AppId
                CredentialType = 'Certificate'
                CredentialId  = $Credential.KeyId
                EndDateTime   = $Credential.EndDateTime
            }
        }
    } |
    Where-Object {
        $_.EndDateTime -and $_.EndDateTime -le $Cutoff
    } |
    Select-Object *, @{Name='Status';Expression={
        if ($_.EndDateTime -lt $Now) { 'Expired' } else { 'Expires within 30 days' }
    }} |
    Sort-Object EndDateTime

$Report | Format-Table -AutoSize`,
      },
    ],
  },
  cli: {
    label: "Azure CLI",
    intro: "Use Azure CLI for fast object lookup. The id returned for a service principal is its tenant-local Object ID, not the Application (client) ID.",
    commands: [
      {
        id: "cli-find-sp",
        title: "Find a service principal by Application (client) ID",
        code: `APP_ID="00000000-0000-0000-0000-000000000000"

az ad sp list \
  --filter "appId eq '$APP_ID'" \
  --query "[].{displayName:displayName,appId:appId,objectId:id,type:servicePrincipalType,enabled:accountEnabled}" \
  --output table`,
      },
      {
        id: "cli-find-app",
        title: "Find the application object behind the app registration",
        code: `APP_ID="00000000-0000-0000-0000-000000000000"

az ad app list \
  --filter "appId eq '$APP_ID'" \
  --query "[].{displayName:displayName,appId:appId,applicationObjectId:id}" \
  --output table`,
      },
      {
        id: "cli-show",
        title: "Inspect a known service principal object",
        code: `SP_OBJECT_ID="00000000-0000-0000-0000-000000000000"

az ad sp show \
  --id "$SP_OBJECT_ID" \
  --query "{displayName:displayName,appId:appId,objectId:id,type:servicePrincipalType,enabled:accountEnabled,assignmentRequired:appRoleAssignmentRequired}"`,
      },
    ],
  },
  graph: {
    label: "Microsoft Graph REST",
    intro: "Graph REST makes the object boundaries explicit. URL-encode filters when calling these endpoints outside Graph Explorer.",
    commands: [
      {
        id: "graph-find",
        title: "Resolve both object types by Application (client) ID",
        code: `GET https://graph.microsoft.com/v1.0/applications?$filter=appId eq '{appId}'&$select=id,appId,displayName,requiredResourceAccess

GET https://graph.microsoft.com/v1.0/servicePrincipals?$filter=appId eq '{appId}'&$select=id,appId,displayName,servicePrincipalType,appOwnerOrganizationId,accountEnabled,appRoleAssignmentRequired`,
      },
      {
        id: "graph-permissions",
        title: "Read application and delegated grants",
        code: `GET https://graph.microsoft.com/v1.0/servicePrincipals/{servicePrincipal-id}/appRoleAssignments

GET https://graph.microsoft.com/v1.0/servicePrincipals/{servicePrincipal-id}/oauth2PermissionGrants`,
      },
      {
        id: "graph-owners",
        title: "Read service principal owners",
        code: `GET https://graph.microsoft.com/v1.0/servicePrincipals/{servicePrincipal-id}/owners?$select=id,displayName,userPrincipalName,appId`,
      },
      {
        id: "graph-deleted",
        title: "Find soft-deleted application and service principal objects",
        code: `GET https://graph.microsoft.com/v1.0/directory/deletedItems/microsoft.graph.application?$filter=appId eq '{appId}'

GET https://graph.microsoft.com/v1.0/directory/deletedItems/microsoft.graph.servicePrincipal?$filter=appId eq '{appId}'`,
      },
    ],
  },
};

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

export default function CommandReference() {
  const [active, setActive] = useState("powershell");
  const [copied, setCopied] = useState("");
  const current = commandSets[active];

  const copyCode = async (id, code) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        fallbackCopy(code);
      }
      setCopied(id);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      fallbackCopy(code);
      setCopied(id);
      window.setTimeout(() => setCopied(""), 1800);
    }
  };

  return (
    <div className="sp-command-reference">
      <div className="sp-command-tabs" role="tablist" aria-label="Command language">
        {Object.entries(commandSets).map(([key, set]) => (
          <button
            type="button"
            role="tab"
            aria-selected={active === key}
            className={active === key ? "is-active" : ""}
            key={key}
            onClick={() => {
              setActive(key);
              setCopied("");
            }}
          >
            {set.label}
          </button>
        ))}
      </div>

      <p className="sp-command-intro">{current.intro}</p>

      <div className="sp-command-list">
        {current.commands.map((command) => (
          <article className="sp-code-card" key={command.id}>
            <header>
              <h3>{command.title}</h3>
              <button type="button" onClick={() => copyCode(command.id, command.code)}>
                {copied === command.id ? "Copied" : "Copy"}
              </button>
            </header>
            <pre><code>{command.code}</code></pre>
          </article>
        ))}
      </div>
    </div>
  );
}
