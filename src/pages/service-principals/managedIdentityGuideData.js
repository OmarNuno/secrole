export const toc = [
  { id: "decision", label: "Choose the identity model" },
  { id: "identity-types", label: "System vs. user assigned" },
  { id: "token-flow", label: "How managed identity works" },
  { id: "authorization", label: "Permissions and security boundary" },
  { id: "federation", label: "Workload identity federation" },
  { id: "implementation", label: "Implementation patterns" },
  { id: "inventory", label: "Read-only inventory" },
  { id: "operations", label: "Operations and troubleshooting" },
  { id: "faq", label: "Questions administrators ask" },
  { id: "official-sources", label: "Official sources" },
  { id: "related-guides", label: "Related guides" },
];

export const faq = [
  {
    question: "Is a managed identity a service principal?",
    answer: "Yes. Microsoft Entra creates a special service principal with servicePrincipalType set to ManagedIdentity. A managed identity doesn't have the normal application registration object used by an Application-type service principal.",
  },
  {
    question: "Should I use a system-assigned or user-assigned managed identity?",
    answer: "Use a system-assigned identity when one Azure resource needs a unique identity and you want the identity removed with the resource. Use a user-assigned identity when you need independent lifecycle, preauthorization, reuse across compatible resources, or stable permissions while compute resources are replaced. Microsoft currently recommends user-assigned identities for most broad service scenarios, but the identity boundary should still match the workload boundary.",
  },
  {
    question: "Can a managed identity be used by a workload that runs outside Azure?",
    answer: "A workload can't directly use the Azure managed identity endpoint when it isn't running on a supported Azure host. External workloads can instead use workload identity federation to a user-assigned managed identity or an app registration, provided their platform can issue a trusted OIDC token.",
  },
  {
    question: "Can a system-assigned managed identity be shared across resources?",
    answer: "No. A system-assigned managed identity belongs to one Azure resource and only that resource can request tokens as that identity. A user-assigned managed identity can be attached to multiple compatible Azure resources.",
  },
  {
    question: "Does managed identity remove the need to grant permissions?",
    answer: "No. Managed identity removes customer-managed authentication credentials. The identity still needs least-privilege authorization on every target, such as Azure RBAC, data-plane roles, Microsoft Graph app-role assignments, database permissions, or another resource-specific access model.",
  },
  {
    question: "Why did a managed identity permission change not take effect immediately?",
    answer: "Managed identity tokens are cached by Azure infrastructure. Microsoft documents that group or role membership changes can take several hours and that the backend cache can be around 24 hours per resource URI. For time-sensitive authorization changes, prefer direct assignments to the intended identity and test with the expected propagation window.",
  },
  {
    question: "Should production code use DefaultAzureCredential?",
    answer: "DefaultAzureCredential is convenient for development, but Microsoft recommends deterministic credentials in production. Use ManagedIdentityCredential directly for a managed-identity workload and explicitly select the user-assigned identity when more than one identity could be available.",
  },
  {
    question: "Is GitHub Actions OIDC completely secretless?",
    answer: "It removes the long-lived Microsoft Entra client secret or certificate from the workflow. The trust still depends on repository, branch, tag, environment, workflow permissions, issuer, subject, audience, and the security of the GitHub organization. Treat the federated trust as a credential boundary even though no reusable secret is stored.",
  },
  {
    question: "Can an Azure-hosted managed identity act as the credential for an app registration?",
    answer: "Yes, in supported scenarios a user-assigned managed identity can be configured as a federated identity credential on an app registration. The Azure workload first obtains a managed-identity token and exchanges it for a token representing the application, avoiding an app secret or certificate.",
  },
  {
    question: "What happens to Azure role assignments when a managed identity is deleted?",
    answer: "The role assignments aren't automatically deleted. They can remain as orphaned assignments that display Identity not found or ObjectType Unknown. Include assignment cleanup in decommissioning procedures for both system-assigned and user-assigned managed identities.",
  },
];

export const sources = [
  {
    title: "What is managed identities for Azure resources?",
    href: "https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview",
    note: "Core managed-identity model, system-assigned and user-assigned differences, token flow, and current Microsoft recommendations.",
  },
  {
    title: "Managed identities for Azure resources — developer overview",
    href: "https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview-for-developers",
    note: "How Azure-hosted applications acquire tokens and connect to downstream resources that support Microsoft Entra authentication.",
  },
  {
    title: "Managed identity best practice recommendations",
    href: "https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/managed-identity-best-practice-recommendations",
    note: "Identity selection, least privilege, source-resource security, token caching, maintenance, and orphaned role assignments.",
  },
  {
    title: "Azure services that support managed identities",
    href: "https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/managed-identities-status",
    note: "Current source-resource and target-resource support matrix for managed identity scenarios.",
  },
  {
    title: "Workload identity federation concepts",
    href: "https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation",
    note: "Secretless token exchange for GitHub Actions, Kubernetes, AWS, Google Cloud, Azure Pipelines, SPIFFE/SPIRE, and other OIDC-capable workloads.",
  },
  {
    title: "Create trust between an app and an external identity provider",
    href: "https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation-create-trust",
    note: "Federated identity credential issuer, subject, audience, limits, restrictions, and configuration examples.",
  },
  {
    title: "Use Azure Login with OpenID Connect",
    href: "https://learn.microsoft.com/en-us/azure/developer/github/connect-from-azure-openid-connect",
    note: "GitHub Actions OIDC setup using an app registration or user-assigned managed identity.",
  },
  {
    title: "Authentication best practices with Azure Identity for .NET",
    href: "https://learn.microsoft.com/en-us/dotnet/azure/sdk/authentication/best-practices",
    note: "Deterministic production credentials, ManagedIdentityCredential, credential reuse, caching, and retry behavior.",
  },
  {
    title: "List federated identity credentials with Microsoft Graph",
    href: "https://learn.microsoft.com/en-us/graph/api/federatedidentitycredential-list?view=graph-rest-1.0",
    note: "Read-only Graph relationship, least-privileged permissions, and appId or Object ID addressing for federation inventory.",
  },
  {
    title: "Microsoft Entra sign-in logs",
    href: "https://learn.microsoft.com/en-us/entra/identity/monitoring-health/concept-sign-ins",
    note: "Separate service-principal and managed-identity sign-in log categories used for operational monitoring.",
  },
];

export const managedIdentityInventoryPowerShell = `# Read-only inventory of user-assigned managed identities in the current subscription
Connect-AzAccount

Get-AzUserAssignedIdentity |
    Select-Object Name,
                  ResourceGroupName,
                  Location,
                  ClientId,
                  PrincipalId,
                  Id |
    Sort-Object ResourceGroupName, Name`;

export const managedIdentityGraphInventory = `# Read-only directory inventory of managed-identity service principals
Connect-MgGraph -Scopes "Application.Read.All","Directory.Read.All"

$Properties = @(
    "id",
    "appId",
    "displayName",
    "servicePrincipalType",
    "accountEnabled",
    "alternativeNames"
)

Get-MgServicePrincipal -Filter "servicePrincipalType eq 'ManagedIdentity'" -All -Property $Properties |
    Select-Object DisplayName,
                  AppId,
                  Id,
                  ServicePrincipalType,
                  AccountEnabled,
                  AlternativeNames |
    Sort-Object DisplayName`;

export const roleAssignmentInventory = `# Read-only Azure RBAC assignments for one managed identity
$PrincipalId = "00000000-0000-0000-0000-000000000000"

Get-AzRoleAssignment -ObjectId $PrincipalId |
    Select-Object DisplayName,
                  ObjectId,
                  ObjectType,
                  RoleDefinitionName,
                  Scope,
                  CanDelegate |
    Sort-Object Scope, RoleDefinitionName`;

export const federationInventoryPowerShell = `# Read-only federated credential inventory for app registrations
Connect-MgGraph -Scopes "Application.Read.All"

Get-MgApplication -All -Property "id,appId,displayName" |
    ForEach-Object {
        $Application = $_

        Get-MgApplicationFederatedIdentityCredential -ApplicationId $Application.Id -All -ErrorAction SilentlyContinue |
        ForEach-Object {
            [pscustomobject]@{
                Application      = $Application.DisplayName
                ApplicationId    = $Application.AppId
                AppObjectId      = $Application.Id
                CredentialName   = $_.Name
                Issuer           = $_.Issuer
                Subject          = $_.Subject
                Audiences        = ($_.Audiences -join ';')
                Description      = $_.Description
            }
        }
    } |
    Sort-Object Application, CredentialName`;

export const userAssignedFederationInventoryCli = `# Read-only federated credential inventory for one user-assigned managed identity
az identity federated-credential list \\
  --resource-group rg-workload-identity \\
  --identity-name id-orders-prod \\
  --query "[].{name:name,issuer:issuer,subject:subject,audiences:audiences}" \\
  --output table`;

export const createIdentityCli = `# STATE-CHANGING EXAMPLE — review names, scopes, and role before running

# Create a user-assigned managed identity
az identity create \\
  --resource-group rg-workload-identity \\
  --name id-orders-prod \\
  --location eastus

IDENTITY_ID=$(az identity show \\
  --resource-group rg-workload-identity \\
  --name id-orders-prod \\
  --query id -o tsv)

PRINCIPAL_ID=$(az identity show \\
  --resource-group rg-workload-identity \\
  --name id-orders-prod \\
  --query principalId -o tsv)

# Attach it to a VM
az vm identity assign \\
  --resource-group rg-application \\
  --name vm-orders-01 \\
  --identities "$IDENTITY_ID"

# Grant a data-plane role at the narrowest appropriate scope
az role assignment create \\
  --assignee-object-id "$PRINCIPAL_ID" \\
  --assignee-principal-type ServicePrincipal \\
  --role "Storage Blob Data Reader" \\
  --scope "/subscriptions/<subscription-id>/resourceGroups/<resource-group>/providers/Microsoft.Storage/storageAccounts/<storage-account>"`;

export const systemAssignedCli = `# STATE-CHANGING EXAMPLE — enables the VM's system-assigned identity
az vm identity assign \\
  --resource-group rg-application \\
  --name vm-orders-01

# Capture the new tenant-local service principal Object ID
az vm show \\
  --resource-group rg-application \\
  --name vm-orders-01 \\
  --query identity.principalId \\
  --output tsv`;

export const dotnetManagedIdentity = `using Azure.Identity;
using Azure.Security.KeyVault.Secrets;

string vaultUri = Environment.GetEnvironmentVariable("KEY_VAULT_URI")!;
string managedIdentityClientId = Environment.GetEnvironmentVariable("AZURE_CLIENT_ID")!;

// Deterministic production credential: select the expected user-assigned identity.
var credential = new ManagedIdentityCredential(
    ManagedIdentityId.FromUserAssignedClientId(managedIdentityClientId));

var secretClient = new SecretClient(new Uri(vaultUri), credential);
KeyVaultSecret secret = await secretClient.GetSecretAsync("OrdersApiConnection");`;

export const pythonManagedIdentity = `import os
from azure.identity import ManagedIdentityCredential
from azure.keyvault.secrets import SecretClient

credential = ManagedIdentityCredential(
    client_id=os.environ["AZURE_CLIENT_ID"]
)

client = SecretClient(
    vault_url=os.environ["KEY_VAULT_URI"],
    credential=credential,
)

secret = client.get_secret("OrdersApiConnection")`;

export const githubOidcWorkflow = `name: Azure deployment with OIDC
on:
  workflow_dispatch:

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Sign in to Azure with workload identity federation
        uses: azure/login@v2
        with:
          client-id: \${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: \${{ secrets.AZURE_TENANT_ID }}
          subscription-id: \${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Prove the Azure context
        uses: azure/cli@v2
        with:
          inlineScript: az account show`;

export const appFederationCli = `# STATE-CHANGING EXAMPLE — creates trust on an app registration
cat > credential.json <<'JSON'
{
  "name": "github-production",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:contoso/orders-api:environment:production",
  "description": "GitHub production deployment",
  "audiences": [
    "api://AzureADTokenExchange"
  ]
}
JSON

az ad app federated-credential create \\
  --id "<application-client-id-or-object-id>" \\
  --parameters credential.json`;
