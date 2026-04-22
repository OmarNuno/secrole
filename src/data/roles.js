export const ENTRA_ROLES = [
  {
    id: "e1", name: "Global Administrator", product: "Entra", category: "Identity", risk: "Critical",
    description: "Full access to all administrative features in Microsoft Entra ID and all services that use Microsoft Entra identities. The most powerful role in the tenant.",
    permissions: "All permissions across all Microsoft 365 services, Entra ID, Azure AD, and connected applications.",
    leastPrivilege: "Reserve exclusively for break-glass emergency accounts. Assign specific scoped roles for all regular admin work. Require PIM activation with MFA and justification.",
    tags: ["identity", "global", "admin", "all-permissions"],
    relatedRoles: ["e5", "e3", "e6"]
  },
  {
    id: "e2", name: "Global Reader", product: "Entra", category: "Identity", risk: "Low",
    description: "Read-only equivalent of Global Administrator. Can read everything a Global Admin can see but cannot make any changes.",
    permissions: "Read-only access across all Microsoft 365 services and Entra ID configurations.",
    leastPrivilege: "Preferred role for auditors, compliance reviewers, and reporting personas who need broad visibility without write access.",
    tags: ["identity", "read-only", "audit", "reporting"],
    relatedRoles: ["e1", "e23"]
  },
  {
    id: "e3", name: "Security Administrator", product: "Entra", category: "Security", risk: "High",
    description: "Manages security-related features across Microsoft 365 Defender, Entra ID Protection, Conditional Access, and Microsoft Defender for Cloud Apps.",
    permissions: "Read and manage security policies, alerts, identity protection, Conditional Access, and security configurations.",
    leastPrivilege: "Assign to dedicated security team members only. Avoid assigning to help desk or general IT staff.",
    tags: ["security", "defender", "policies", "alerts"],
    relatedRoles: ["e4", "e7", "e1"]
  },
  {
    id: "e4", name: "Security Reader", product: "Entra", category: "Security", risk: "Low",
    description: "Read-only access to security features including security alerts, identity protection reports, Conditional Access policies, and Secure Score.",
    permissions: "Read security reports, alerts, identity protection data, and security configurations.",
    leastPrivilege: "Ideal for SOC analysts and security reviewers who need visibility without the ability to change configurations.",
    tags: ["security", "read-only", "soc", "alerts"],
    relatedRoles: ["e3", "e2"]
  },
  {
    id: "e5", name: "Privileged Role Administrator", product: "Entra", category: "Privileged Access", risk: "Critical",
    description: "Manages role assignments in Microsoft Entra ID and Privileged Identity Management (PIM). Can grant any Entra role to any user including Global Administrator.",
    permissions: "Assign and remove all Entra roles, configure PIM policies, manage eligible assignments and activation settings.",
    leastPrivilege: "Strictly limit to 1-2 identity governance team members. Require PIM activation with approval and full justification. Treat as near-equivalent to Global Admin.",
    tags: ["pim", "roles", "privileged", "role-management"],
    relatedRoles: ["e1", "e21"]
  },
  {
    id: "e6", name: "User Administrator", product: "Entra", category: "Identity", risk: "Medium",
    description: "Creates and manages users and groups, resets passwords for non-administrators, manages licenses, and monitors service health.",
    permissions: "Create/delete users, manage groups, reset passwords for non-admin users, assign licenses.",
    leastPrivilege: "Scope to Administrative Units where possible to limit blast radius. Appropriate for HR-adjacent IT roles.",
    tags: ["users", "groups", "helpdesk", "passwords"],
    relatedRoles: ["e12", "e13", "e8"]
  },
  {
    id: "e7", name: "Conditional Access Administrator", product: "Entra", category: "Security", risk: "High",
    description: "Creates and manages Conditional Access policies that control how, when, and from where users can access Microsoft 365 resources.",
    permissions: "Create, modify, enable, disable, and delete Conditional Access policies tenant-wide.",
    leastPrivilege: "Limit to security architects and senior identity engineers. A misconfigured policy can lock all users out of the tenant.",
    tags: ["conditional-access", "policies", "mfa", "zero-trust"],
    relatedRoles: ["e3", "e9"]
  },
  {
    id: "e8", name: "Authentication Administrator", product: "Entra", category: "Identity", risk: "High",
    description: "Can view, set, and reset authentication methods and credentials for non-administrator users. Cannot modify admin accounts.",
    permissions: "Reset passwords and authentication methods for non-admin users, require re-registration of MFA.",
    leastPrivilege: "Appropriate for tier-1 helpdesk staff. Cannot reset admin credentials. Scope to Administrative Units for larger orgs.",
    tags: ["authentication", "helpdesk", "mfa", "passwords"],
    relatedRoles: ["e21", "e6", "e9"]
  },
  {
    id: "e9", name: "Authentication Policy Administrator", product: "Entra", category: "Identity", risk: "High",
    description: "Configures the tenant-wide authentication methods policy, MFA settings, password protection policy, and SSPR settings.",
    permissions: "Manage authentication methods policy, MFA settings, banned password lists, smart lockout configuration.",
    leastPrivilege: "Assign only to identity security team leads. Changes affect authentication for all users in the tenant.",
    tags: ["mfa", "policies", "authentication", "password-protection"],
    relatedRoles: ["e7", "e8"]
  },
  {
    id: "e10", name: "Application Administrator", product: "Entra", category: "Applications", risk: "High",
    description: "Creates and manages all aspects of app registrations and enterprise applications including credentials, permissions, and assignments.",
    permissions: "Manage all app registrations, enterprise apps, service principals, OAuth consent, and application credentials.",
    leastPrivilege: "Limit to developers and app owners. This role can update app credentials and escalate privileges via app permission abuse.",
    tags: ["apps", "registrations", "service-principals", "oauth"],
    relatedRoles: ["e11", "e1"]
  },
  {
    id: "e11", name: "Cloud Application Administrator", product: "Entra", category: "Applications", risk: "High",
    description: "Same permissions as Application Administrator except cannot manage Application Proxy settings.",
    permissions: "Manage app registrations, enterprise apps, service principals — excludes Application Proxy.",
    leastPrivilege: "Use instead of Application Administrator when Application Proxy management is not needed. Smaller scope.",
    tags: ["apps", "cloud", "service-principals"],
    relatedRoles: ["e10"]
  },
  {
    id: "e12", name: "Helpdesk Administrator", product: "Entra", category: "Identity", risk: "Medium",
    description: "Resets passwords and invalidates refresh tokens for non-admin users and users assigned lower-privilege admin roles.",
    permissions: "Reset passwords for non-admin users, invalidate sessions, manage service requests, monitor service health.",
    leastPrivilege: "Standard role for tier-1 support staff. Scope to Administrative Units in large orgs to limit reach.",
    tags: ["helpdesk", "passwords", "support", "reset"],
    relatedRoles: ["e6", "e8"]
  },
  {
    id: "e13", name: "Groups Administrator", product: "Entra", category: "Identity", risk: "Low",
    description: "Creates and manages Microsoft 365 groups and security groups including membership, settings, naming policies, and expiration.",
    permissions: "Create, modify, delete groups; manage group membership, settings, naming policies, and expiration policies.",
    leastPrivilege: "Good for collaboration administrators managing Teams and M365 Groups. Low risk as it doesn't touch user credentials.",
    tags: ["groups", "teams", "collaboration", "m365"],
    relatedRoles: ["e6"]
  },
  {
    id: "e14", name: "License Administrator", product: "Entra", category: "Identity", risk: "Low",
    description: "Manages product license assignments on users and groups. Cannot manage users or groups beyond license assignment.",
    permissions: "Assign and remove product licenses to users and groups.",
    leastPrivilege: "Safe for procurement or IT operations team members managing license assignments. Very limited scope.",
    tags: ["licenses", "billing", "assignments"],
    relatedRoles: ["e6"]
  },
  {
    id: "e15", name: "Intune Administrator", product: "Entra", category: "Device Management", risk: "High",
    description: "Full administrative access to Microsoft Intune including device enrollment, compliance policies, configuration profiles, and app deployment.",
    permissions: "Manage all Intune features: device enrollment, compliance policies, configuration profiles, app deployment, and reporting.",
    leastPrivilege: "Assign to dedicated endpoint management team only. This role has access to deploy software and policies to all enrolled devices.",
    tags: ["intune", "devices", "mdm", "endpoint", "compliance"],
    relatedRoles: ["e22", "e1"]
  },
  {
    id: "e16", name: "Exchange Administrator", product: "Entra", category: "Collaboration", risk: "High",
    description: "Manages all aspects of Exchange Online including mailboxes, distribution groups, mail flow rules, and email security settings.",
    permissions: "Manage mailboxes, distribution lists, mail flow rules, transport settings, connectors, and email security.",
    leastPrivilege: "Assign to Exchange or messaging team. Note this role provides access to all mailbox content and email metadata.",
    tags: ["exchange", "email", "mailbox", "mail-flow"],
    relatedRoles: ["e17", "e18"]
  },
  {
    id: "e17", name: "SharePoint Administrator", product: "Entra", category: "Collaboration", risk: "High",
    description: "Manages all SharePoint Online sites, storage quotas, external sharing settings, and OneDrive for Business configurations.",
    permissions: "Manage all SharePoint site collections, settings, external access, storage, and OneDrive policies.",
    leastPrivilege: "Assign to SharePoint/OneDrive team. Can access all SharePoint and OneDrive content across the organization.",
    tags: ["sharepoint", "onedrive", "sites", "external-sharing"],
    relatedRoles: ["e16", "e18"]
  },
  {
    id: "e18", name: "Teams Administrator", product: "Entra", category: "Collaboration", risk: "Medium",
    description: "Manages Microsoft Teams settings, policies, calling features, meetings configurations, and Teams apps.",
    permissions: "Manage Teams policies, calling features, meeting settings, messaging policies, and Teams app governance.",
    leastPrivilege: "Appropriate for collaboration or unified communications team managing Teams deployment.",
    tags: ["teams", "meetings", "voice", "collaboration"],
    relatedRoles: ["e16", "e17"]
  },
  {
    id: "e19", name: "Billing Administrator", product: "Entra", category: "Billing", risk: "Medium",
    description: "Manages billing subscriptions, makes purchases, manages support tickets, and monitors Microsoft 365 service health.",
    permissions: "Manage subscriptions, make purchases, view invoices, manage support tickets, monitor service health.",
    leastPrivilege: "Assign to finance or procurement roles. Has no access to user data, security settings, or directory objects.",
    tags: ["billing", "subscriptions", "finance", "purchases"],
    relatedRoles: []
  },
  {
    id: "e20", name: "Directory Readers", product: "Entra", category: "Identity", risk: "Low",
    description: "Read-only access to basic directory information. Commonly assigned to applications that need to read directory data via Microsoft Graph.",
    permissions: "Read basic directory data including users, groups, contacts, and application registrations.",
    leastPrivilege: "Use for service accounts and applications needing minimal directory read access. Not recommended for human users.",
    tags: ["directory", "read-only", "apps", "graph"],
    relatedRoles: ["e2"]
  },
  {
    id: "e21", name: "Privileged Authentication Administrator", product: "Entra", category: "Privileged Access", risk: "Critical",
    description: "Can reset authentication methods and credentials for ALL users in the tenant, including Global Administrators. Highest risk authentication role.",
    permissions: "Reset passwords and authentication methods for all users without exception, including all admin roles.",
    leastPrivilege: "Extremely dangerous. Effectively equivalent risk to Global Administrator. Limit to absolute minimum. Require PIM with approval workflow.",
    tags: ["authentication", "privileged", "critical", "all-users"],
    relatedRoles: ["e8", "e5", "e1"]
  },
  {
    id: "e22", name: "Cloud Device Administrator", product: "Entra", category: "Device Management", risk: "Medium",
    description: "Enables, disables, and deletes devices in Microsoft Entra ID. Can read BitLocker recovery keys for managed devices.",
    permissions: "Enable/disable/delete Entra-joined devices, read BitLocker recovery keys.",
    leastPrivilege: "Assign to endpoint or helpdesk team for device lifecycle management. Separate from Intune Administrator.",
    tags: ["devices", "bitlocker", "endpoint", "entra-join"],
    relatedRoles: ["e15"]
  },
  {
    id: "e23", name: "Reports Reader", product: "Entra", category: "Reporting", risk: "Low",
    description: "Reads sign-in and audit reports in Microsoft Entra ID, and usage reports in the Microsoft 365 admin center.",
    permissions: "Read sign-in logs, audit logs, and usage reports across Microsoft 365 services.",
    leastPrivilege: "Safe for operations, BI, or management teams needing usage analytics and audit trail visibility.",
    tags: ["reports", "audit", "analytics", "sign-in-logs"],
    relatedRoles: ["e2", "e4"]
  },
  {
    id: "e24", name: "Attack Simulation Administrator", product: "Entra", category: "Security", risk: "Medium",
    description: "Creates, launches, and manages phishing simulation campaigns and attack simulations in Microsoft Defender for Office 365.",
    permissions: "Create and manage attack simulations, phishing campaigns, payloads, and review simulation results.",
    leastPrivilege: "Assign to security awareness team running phishing simulations. Results visible to all admins in tenant.",
    tags: ["defender", "simulation", "phishing", "awareness"],
    relatedRoles: ["e3"]
  },
];

export const PURVIEW_ROLES = [
  {
    id: "p1", name: "Compliance Administrator", product: "Purview", category: "Compliance", risk: "High",
    description: "Manages compliance features in the Microsoft Purview portal including DLP policies, retention policies, sensitivity labels, and eDiscovery configuration.",
    permissions: "Manage all compliance policies, DLP rules, retention policies, sensitivity labels, communication compliance, and insider risk settings.",
    leastPrivilege: "Assign to compliance officers and data protection leads. Has broad access to configure policies that affect all users and data.",
    tags: ["compliance", "dlp", "retention", "labels", "ediscovery"],
    relatedRoles: ["p2", "p12", "p13"]
  },
  {
    id: "p2", name: "Compliance Data Administrator", product: "Purview", category: "Compliance", risk: "High",
    description: "All permissions of Compliance Administrator plus access to data protected by compliance policies including content under review.",
    permissions: "All Compliance Administrator permissions plus read access to compliance-protected data and content.",
    leastPrivilege: "More privileged than Compliance Administrator. Assign only when direct data access is required in addition to policy management.",
    tags: ["compliance", "data-access", "dlp", "content"],
    relatedRoles: ["p1"]
  },
  {
    id: "p3", name: "eDiscovery Administrator", product: "Purview", category: "eDiscovery", risk: "High",
    description: "Manages all eDiscovery cases across the organization and can access content associated with any case regardless of membership.",
    permissions: "Create and manage all eDiscovery cases, access all content under legal hold, export case data across the entire organization.",
    leastPrivilege: "Assign to legal/compliance team leads only. Has unrestricted access to all eDiscovery cases and their content.",
    tags: ["ediscovery", "legal", "hold", "cases", "export"],
    relatedRoles: ["p4", "p1"]
  },
  {
    id: "p4", name: "eDiscovery Manager", product: "Purview", category: "eDiscovery", risk: "Medium",
    description: "Creates and manages eDiscovery cases they are a member of. Cannot access cases created by other eDiscovery Managers.",
    permissions: "Create and manage own eDiscovery cases, search content, place holds, export case-specific data.",
    leastPrivilege: "Appropriate for legal staff managing specific matters. Scoped to their own cases only — use instead of eDiscovery Administrator when possible.",
    tags: ["ediscovery", "legal", "search", "cases", "holds"],
    relatedRoles: ["p3"]
  },
  {
    id: "p5", name: "Audit Manager", product: "Purview", category: "Audit", risk: "Medium",
    description: "Searches and exports audit logs across Microsoft 365 services. Can manage audit settings including enabling and disabling audit logging.",
    permissions: "Search audit logs, export audit data, enable/disable audit logging, manage audit retention policies.",
    leastPrivilege: "Assign to compliance or security operations team. Use Audit Reader instead if only log searching is needed.",
    tags: ["audit", "logs", "export", "compliance", "investigation"],
    relatedRoles: ["p6"]
  },
  {
    id: "p6", name: "Audit Reader", product: "Purview", category: "Audit", risk: "Low",
    description: "Read-only access to search and view audit logs across Microsoft 365. Cannot export logs or manage audit settings.",
    permissions: "Search and view audit logs only. No export, no settings management.",
    leastPrivilege: "Good for SOC analysts who need to review audit trails without management capabilities. Use this before Audit Manager.",
    tags: ["audit", "logs", "read-only", "soc"],
    relatedRoles: ["p5"]
  },
  {
    id: "p7", name: "Insider Risk Management", product: "Purview", category: "Insider Risk", risk: "High",
    description: "Full administrative access to Insider Risk Management including policy creation, alert management, case management, and viewing user activity content.",
    permissions: "Create and manage insider risk policies, view all alerts, manage cases, access user activity content and evidence.",
    leastPrivilege: "Strictly limit to insider risk program administrators. Has access to sensitive employee behavior data and communications.",
    tags: ["insider-risk", "user-activity", "alerts", "cases", "policies"],
    relatedRoles: ["p8", "p9"]
  },
  {
    id: "p8", name: "Insider Risk Management Analysts", product: "Purview", category: "Insider Risk", risk: "Medium",
    description: "Access to Insider Risk Management alerts and cases but cannot view the underlying user activity content or evidence.",
    permissions: "View and triage alerts, manage case metadata, add notes — no access to user activity content or evidence files.",
    leastPrivilege: "Appropriate for risk analysts doing initial triage. Cannot see raw user activity — assign Investigators role when content access is needed.",
    tags: ["insider-risk", "alerts", "analyst", "triage"],
    relatedRoles: ["p7", "p9"]
  },
  {
    id: "p9", name: "Insider Risk Management Investigators", product: "Purview", category: "Insider Risk", risk: "High",
    description: "Full access to insider risk alerts, cases, and the ability to view user activity content and evidence for active investigations.",
    permissions: "View all insider risk case data including user activity content, evidence, communications, and export case data.",
    leastPrivilege: "Higher privilege than Analysts. Assign only to investigators with confirmed business need to access user content evidence.",
    tags: ["insider-risk", "investigation", "user-content", "evidence"],
    relatedRoles: ["p7", "p8"]
  },
  {
    id: "p10", name: "Communication Compliance", product: "Purview", category: "Communication Compliance", risk: "High",
    description: "Full access to Communication Compliance including creating policies that monitor employee communications and reviewing flagged messages.",
    permissions: "Create communication compliance policies, review flagged messages and communications, manage cases and remediation.",
    leastPrivilege: "Limit to HR/compliance team leads. Reviewers can read monitored employee communications. Require documented business justification.",
    tags: ["communication", "compliance", "messages", "review", "policies"],
    relatedRoles: ["p11"]
  },
  {
    id: "p11", name: "Communication Compliance Analysts", product: "Purview", category: "Communication Compliance", risk: "Medium",
    description: "Reviews Communication Compliance alerts and investigates policy matches. Cannot create policies or access full unredacted message content.",
    permissions: "Review policy match alerts, investigate cases, limited message preview — no policy management or full content access.",
    leastPrivilege: "Appropriate for first-level reviewers. Use instead of full Communication Compliance role when policy management is not needed.",
    tags: ["communication", "compliance", "analyst", "review"],
    relatedRoles: ["p10"]
  },
  {
    id: "p12", name: "DLP Compliance Management", product: "Purview", category: "Data Protection", risk: "High",
    description: "Creates and manages Data Loss Prevention policies to prevent sharing of sensitive information across Exchange, SharePoint, Teams, and endpoints.",
    permissions: "Create, modify, delete, enable, and disable DLP policies across all Microsoft 365 workloads and endpoints.",
    leastPrivilege: "Assign to data protection officers and compliance engineers. DLP policy misconfiguration can block legitimate business workflows.",
    tags: ["dlp", "data-protection", "policies", "sensitive-data"],
    relatedRoles: ["p1", "p13"]
  },
  {
    id: "p13", name: "Information Protection Admin", product: "Purview", category: "Data Protection", risk: "High",
    description: "Creates and manages sensitivity labels, label policies, and information protection policies including auto-labeling configurations.",
    permissions: "Create and publish sensitivity labels, manage label policies, configure auto-labeling for Exchange, SharePoint, and OneDrive.",
    leastPrivilege: "Assign to information protection team. Label policies affect how documents and emails are classified across the organization.",
    tags: ["sensitivity-labels", "information-protection", "auto-labeling", "policies"],
    relatedRoles: ["p14", "p12", "p1"]
  },
  {
    id: "p14", name: "Information Protection Analyst", product: "Purview", category: "Data Protection", risk: "Medium",
    description: "Read-only access to Information Protection features including sensitivity labels, label analytics, and Activity Explorer data.",
    permissions: "View sensitivity labels, label policies, Activity Explorer data, and label analytics reports.",
    leastPrivilege: "Good for compliance analysts monitoring labeling activity. Use before Information Protection Admin when write access is not needed.",
    tags: ["sensitivity-labels", "analytics", "read-only", "activity-explorer"],
    relatedRoles: ["p13"]
  },
  {
    id: "p15", name: "Content Explorer Content Viewer", product: "Purview", category: "Data Protection", risk: "High",
    description: "Can open and view the actual content of items discovered by Content Explorer including sensitive documents and emails.",
    permissions: "View full content of all scanned items in Content Explorer including documents, emails, and Teams messages.",
    leastPrivilege: "Very sensitive role. Assign only to investigators with documented business need to view the actual content of classified items.",
    tags: ["content-explorer", "sensitive-data", "documents", "content-access"],
    relatedRoles: ["p16"]
  },
  {
    id: "p16", name: "Content Explorer List Viewer", product: "Purview", category: "Data Protection", risk: "Medium",
    description: "Views the list of items discovered in Content Explorer including file names and metadata, but cannot open or read the actual content.",
    permissions: "View file list, names, locations, and metadata in Content Explorer — no ability to open or read content.",
    leastPrivilege: "Safe for data mapping and inventory exercises. Use before Content Explorer Content Viewer when actual content access is not needed.",
    tags: ["content-explorer", "metadata", "read-only", "inventory"],
    relatedRoles: ["p15"]
  },
  {
    id: "p17", name: "Records Management", product: "Purview", category: "Records", risk: "Medium",
    description: "Manages records management including retention labels, file plans, event-based retention, and disposition reviews.",
    permissions: "Create retention labels for records, manage file plans, configure event-based retention, approve or reject dispositions.",
    leastPrivilege: "Assign to records managers and compliance staff managing the information lifecycle. Separate from general Retention Management.",
    tags: ["records", "retention", "disposition", "file-plan"],
    relatedRoles: ["p18"]
  },
  {
    id: "p18", name: "Retention Management", product: "Purview", category: "Records", risk: "Medium",
    description: "Creates and manages retention policies and retention labels across all Microsoft 365 workloads.",
    permissions: "Create and publish retention policies and labels across Exchange, SharePoint, OneDrive, Teams, and Viva Engage.",
    leastPrivilege: "Assign to compliance team. Misconfigured retention policies can cause premature deletion of business-critical data.",
    tags: ["retention", "policies", "labels", "compliance", "lifecycle"],
    relatedRoles: ["p17", "p1"]
  },
  {
    id: "p19", name: "Data Governance Administrator", product: "Purview", category: "Data Governance", risk: "High",
    description: "Full administrative access to Microsoft Purview Data Governance including Data Map, Unified Catalog, governance domains, and role assignments.",
    permissions: "Manage all data governance features, create and manage governance domains, collections, and assign governance roles.",
    leastPrivilege: "Assign to data governance program leads. This role can grant access to all governance resources in the tenant.",
    tags: ["data-governance", "data-map", "catalog", "domains", "admin"],
    relatedRoles: ["p20", "p21"]
  },
  {
    id: "p20", name: "Data Curator", product: "Purview", category: "Data Governance", risk: "Medium",
    description: "Creates and manages data assets in the Purview Unified Catalog including classifications, glossary terms, and asset metadata.",
    permissions: "Create, read, modify, move, and delete data assets; apply classifications; create and manage glossary terms.",
    leastPrivilege: "Appropriate for data stewards managing the data catalog. Does not grant access to actual underlying data.",
    tags: ["data-catalog", "metadata", "classifications", "steward", "glossary"],
    relatedRoles: ["p19", "p21"]
  },
  {
    id: "p21", name: "Data Reader", product: "Purview", category: "Data Governance", risk: "Low",
    description: "Read-only access to data assets, classifications, collections, and glossary terms in the Purview Data Map and Unified Catalog.",
    permissions: "Read data assets, view classifications, browse collections, read glossary terms.",
    leastPrivilege: "Safe for business users who need to discover and understand data assets without modifying them.",
    tags: ["data-catalog", "read-only", "discovery", "browse"],
    relatedRoles: ["p20"]
  },
  {
    id: "p22", name: "Privacy Management", product: "Purview", category: "Privacy", risk: "High",
    description: "Manages privacy risk management features including subject rights requests, privacy assessments, and privacy risk policies.",
    permissions: "Manage subject rights requests, create privacy assessments, configure privacy risk policies, view personal data reports.",
    leastPrivilege: "Assign to privacy officers and legal team members. Has access to personal data inventory and privacy risk reports.",
    tags: ["privacy", "gdpr", "subject-rights", "dsr", "risk"],
    relatedRoles: ["p23"]
  },
  {
    id: "p23", name: "Subject Rights Request Administrator", product: "Purview", category: "Privacy", risk: "Medium",
    description: "Creates and manages data subject rights requests (access, deletion, export) to support compliance with GDPR, CCPA, and other privacy regulations.",
    permissions: "Create and manage all subject rights requests, run data searches, view associated personal data.",
    leastPrivilege: "Assign to privacy team members handling GDPR/CCPA requests. Has access to personal data discovered during request processing.",
    tags: ["privacy", "subject-rights", "gdpr", "ccpa", "dsr"],
    relatedRoles: ["p22"]
  },
  {
    id: "p24", name: "Purview Administrator", product: "Purview", category: "Administration", risk: "High",
    description: "Administrative role for the Microsoft Purview platform covering role management, domain management, and admin unit extension management.",
    permissions: "Role Management, Purview Domain Manager, Admin Unit Extension Manager across the Purview platform.",
    leastPrivilege: "Assign to Purview platform administrators responsible for the governance infrastructure setup and maintenance.",
    tags: ["admin", "purview", "roles", "domains", "platform"],
    relatedRoles: ["p19", "p1"]
  },
];

export const ALL_ROLES = [...ENTRA_ROLES, ...PURVIEW_ROLES];

export const RISK_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };

export const CATEGORIES = [...new Set(ALL_ROLES.map(r => r.category))].sort();
