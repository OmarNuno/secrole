/**
 * SecRole's route and content registry.
 *
 * Keep published pages here so navigation, page metadata, sitemap generation,
 * and future knowledge hubs can share one source of truth. Planned pages stay
 * out of the sitemap until their status changes to "published".
 */
export const sitePages = [
  {
    id: "role-library",
    path: "/",
    status: "published",
    kind: "tool",
    title: "Microsoft Entra & Purview Role Library",
    description: "Search Microsoft Entra ID and Microsoft Purview roles, compare risk, review permissions, and find least-privilege alternatives.",
    changeFrequency: "weekly",
    priority: 1.0,
  },
  {
    id: "role-overlap-analyzer",
    path: "/analyzer",
    status: "published",
    kind: "tool",
    title: "Microsoft Role Overlap Analyzer",
    description: "Compare Microsoft Entra and Purview roles to identify overlapping permissions, excess privilege, and possible least-privilege alternatives.",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    id: "ai-role-advisor",
    path: "/advisor",
    status: "published",
    kind: "tool",
    title: "Microsoft Entra & Purview Role Advisor",
    description: "Describe an access requirement and use SecRole's role intelligence to investigate relevant Microsoft Entra and Purview roles.",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    id: "service-principals",
    path: "/service-principals",
    status: "published",
    kind: "knowledge-hub",
    title: "Microsoft Entra Service Principals: Complete Reference",
    heading: "Application objects & service principals",
    description: "Understand Microsoft Entra service principals, application objects, app IDs vs. object IDs, permissions, consent, authentication, and governance.",
    keywords: [
      "Microsoft Entra service principal",
      "application object vs service principal",
      "app ID vs object ID",
      "enterprise applications",
      "managed identity",
      "Microsoft Graph app permissions",
      "service principal PowerShell",
    ],
    lastModified: "2026-09-17",
    changeFrequency: "monthly",
    priority: 0.95,
  },
  {
    id: "updates",
    path: "/updates",
    status: "published",
    kind: "updates",
    title: "Microsoft Entra & Purview Updates",
    description: "Track Microsoft Entra ID and Purview role, permission, security, and roadmap updates curated from official Microsoft sources.",
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    id: "service-principal-identifiers",
    parentId: "service-principals",
    path: "/service-principals/identifiers",
    status: "published",
    kind: "knowledge-guide",
    title: "Application ID vs. Object ID vs. Tenant ID in Microsoft Entra",
    heading: "Application ID vs. Object ID vs. Tenant ID",
    description: "Choose the correct Microsoft Entra application, service principal, and tenant ID for OAuth, Microsoft Graph, Azure RBAC, and troubleshooting.",
    keywords: [
      "application ID vs object ID",
      "client ID vs object ID",
      "service principal object ID",
      "Microsoft Entra tenant ID",
      "appId Microsoft Graph",
      "Azure principalId service principal",
    ],
    searchIntent: "Understand which Microsoft Entra application or service principal ID a portal, API, script, or configuration field requires.",
    guideTags: ["Portal map", "Graph examples", "PowerShell"],
    lastModified: "2026-09-17",
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    id: "service-principal-permissions",
    parentId: "service-principals",
    path: "/service-principals/permissions-and-consent",
    status: "published",
    kind: "knowledge-guide",
    title: "Service Principal Permissions and Admin Consent",
    heading: "Service principal permissions and admin consent",
    description: "Reconcile configured API permissions, admin consent, app-role assignments, delegated grants, and access-token claims in Microsoft Entra.",
    keywords: [
      "service principal permissions",
      "Microsoft Entra admin consent",
      "requiredResourceAccess",
      "appRoleAssignments",
      "oauth2PermissionGrants",
      "application permissions vs delegated permissions",
      "access token roles scp claims",
    ],
    searchIntent: "Determine what an application requested, what a tenant granted, and why an access token does or does not contain the required permissions.",
    guideTags: ["Grant model", "Token claims", "Troubleshooting"],
    lastModified: "2026-09-17",
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    id: "service-principal-managed-identities",
    parentId: "service-principals",
    path: "/service-principals/managed-identities",
    status: "planned",
    kind: "knowledge-guide",
    title: "Managed Identities and Workload Identity Federation",
    description: "System-assigned and user-assigned managed identities, workload identity federation, and credential-free workload authentication patterns.",
    searchIntent: "Choose between managed identity, workload identity federation, certificates, and client secrets for a Microsoft Entra workload.",
  },
  {
    id: "service-principal-security-review",
    parentId: "service-principals",
    path: "/service-principals/security-review",
    status: "planned",
    kind: "knowledge-guide",
    title: "How to Review a Service Principal for Security Risk",
    description: "A repeatable governance checklist, evidence model, PowerShell inventory, permission review, and remediation workflow for service principals.",
    searchIntent: "Audit ownership, permissions, credentials, sign-in evidence, and lifecycle risk for Microsoft Entra service principals.",
  },
  {
    id: "service-principal-credential-lifecycle",
    parentId: "service-principals",
    path: "/service-principals/credential-lifecycle",
    status: "planned",
    kind: "knowledge-guide",
    title: "Service Principal Credential Expiration and Rotation",
    description: "Inventory, alerting, rotation, overlap, outage prevention, and incident-response guidance for application secrets and certificates.",
    searchIntent: "Find, monitor, rotate, and retire Microsoft Entra application secrets and certificates without causing an outage.",
  },
  {
    id: "service-principal-troubleshooting",
    parentId: "service-principals",
    path: "/service-principals/troubleshooting",
    status: "planned",
    kind: "knowledge-guide",
    title: "Service Principal Troubleshooting Guide",
    description: "Decision trees for missing enterprise applications, incorrect IDs, failed authentication, missing consent, assignments, and deleted objects.",
    searchIntent: "Troubleshoot Microsoft Entra service principal authentication, consent, assignment, object lookup, and recovery problems.",
  },
];

export const publishedPages = sitePages.filter((page) => page.status === "published");
export const plannedPages = sitePages.filter((page) => page.status === "planned");

export function getSitePage(id) {
  const page = sitePages.find((item) => item.id === id);
  if (!page) throw new Error(`Unknown SecRole page id: ${id}`);
  return page;
}

export function getChildPages(parentId) {
  return sitePages.filter((page) => page.parentId === parentId);
}

export function getPublishedChildPages(parentId) {
  return sitePages.filter((page) => page.parentId === parentId && page.status === "published");
}
