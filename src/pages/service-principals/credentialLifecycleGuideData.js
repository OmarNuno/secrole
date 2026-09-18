export const toc = [
  { id: "quick-answer", label: "The no-outage rule" },
  { id: "credential-model", label: "What must be inventoried" },
  { id: "inventory", label: "Tenant-wide inventory" },
  { id: "prioritization", label: "Prioritize the backlog" },
  { id: "secret-rotation", label: "Rotate client secrets" },
  { id: "certificate-rotation", label: "Rotate certificates" },
  { id: "incident-response", label: "Compromised credentials" },
  { id: "policy-and-alerting", label: "Policy and alerting" },
  { id: "operations", label: "Operational lifecycle" },
  { id: "faq", label: "Questions administrators ask" },
  { id: "official-sources", label: "Official sources" },
  { id: "related-guides", label: "Related guides" },
];

export const faq = [
  {
    question: "Where can a service principal credential be stored in Microsoft Entra?",
    answer: "Most application authentication credentials are stored on the backing application object in passwordCredentials or keyCredentials. A servicePrincipal object can also have passwordCredentials and keyCredentials, especially for legacy, SAML, gallery, or other tenant-local scenarios. A complete inventory must inspect both object types and preserve the object ID and object location.",
  },
  {
    question: "Can I retrieve a client secret value after it was created?",
    answer: "No. Microsoft Graph returns secretText only in the response to the initial addPassword operation. Later reads return metadata such as keyId, displayName, hint, startDateTime, and endDateTime, but not the secret value. Capture the value once into an approved secret store and never depend on retrieving it from Microsoft Entra later.",
  },
  {
    question: "Should I delete the old credential as soon as I create a replacement?",
    answer: "Not for a planned rotation. Add the replacement first, deploy it, restart or reload workloads that cache credentials, prove successful authentication with the new credential, observe at least one representative execution cycle, and only then remove the old credential. A confirmed compromise can justify a much shorter overlap or immediate removal.",
  },
  {
    question: "How do I know which secret or certificate a workload is actually using?",
    answer: "Credential metadata alone might not prove runtime use. Map the workload's secret-store entry, certificate thumbprint, deployment version, pipeline connection, or configuration record to the Microsoft Entra keyId. Correlate that mapping with sign-in, deployment, and target-resource evidence before removal.",
  },
  {
    question: "Are expired credentials harmless if they remain on the object?",
    answer: "An expired credential can no longer be used to obtain a new token, but leaving stale entries creates operational noise, complicates incident response, and hides whether owners understand the active credential set. Remove expired and unused credentials after dependency validation and retain the evidence in the change record rather than on the identity.",
  },
  {
    question: "Does removing a secret immediately terminate every session created with it?",
    answer: "Removing the credential prevents future token requests that rely on that credential. Access tokens already issued have their own validity period, so incident response must continue monitoring resource activity and may require additional containment at the service principal, permission, resource, or network layer.",
  },
  {
    question: "Can Microsoft Entra enforce shorter credential lifetimes?",
    answer: "Yes. Tenant-wide and object-specific application management policies can restrict password additions and maximum password or asymmetric-key lifetimes. Use policy to prevent new long-lived credentials, but do not treat policy as a replacement for inventory, alerting, ownership, rotation testing, and decommissioning.",
  },
  {
    question: "Should a certificate always replace a client secret?",
    answer: "Prefer managed identity or workload identity federation when supported because they remove the customer-managed credential. When a service principal must use a reusable credential, a certificate is generally preferred to a client secret, but the private key still requires strong storage, access control, monitoring, and planned rotation.",
  },
];

export const sources = [
  {
    title: "Microsoft Graph application resource",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/application?view=graph-rest-1.0",
    note: "Application passwordCredentials, keyCredentials, owners, and app-management-policy relationships.",
  },
  {
    title: "Microsoft Graph servicePrincipal resource",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/serviceprincipal?view=graph-rest-1.0",
    note: "Tenant-local service-principal credentials, ownership, servicePrincipalType, and SAML-related certificate behavior.",
  },
  {
    title: "Microsoft Graph passwordCredential resource",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/passwordcredential?view=graph-rest-1.0",
    note: "Secret metadata, expiration fields, keyId, hint, and the one-time secretText return behavior.",
  },
  {
    title: "Microsoft Graph keyCredential resource",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/keycredential?view=graph-rest-1.0",
    note: "Certificate/key metadata including thumbprint identifier, keyId, validity, type, and usage.",
  },
  {
    title: "Securing cloud-based service accounts",
    href: "https://learn.microsoft.com/en-us/entra/architecture/secure-service-accounts",
    note: "Microsoft guidance to prefer managed identity, then service principal, and certificates over client secrets where possible.",
  },
  {
    title: "Microsoft identity platform certificate credentials",
    href: "https://learn.microsoft.com/en-us/entra/identity-platform/certificate-credentials",
    note: "Certificate-backed client assertions, certificate registration, and multi-valued keyCredentials.",
  },
  {
    title: "Microsoft Graph appManagementPolicy resource",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/appmanagementpolicy?view=graph-rest-1.0",
    note: "Object-specific application-management restrictions and tenant-policy fallback behavior.",
  },
  {
    title: "Password credential configuration",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/passwordcredentialconfiguration?view=graph-rest-1.0",
    note: "Password addition and password-lifetime restrictions with ISO 8601 maximum lifetimes.",
  },
  {
    title: "Key credential configuration",
    href: "https://learn.microsoft.com/en-us/graph/api/resources/keycredentialconfiguration?view=graph-rest-1.0",
    note: "Asymmetric-key lifetime restrictions for application and service-principal credentials.",
  },
  {
    title: "Renew expiring service principal credentials recommendation",
    href: "https://learn.microsoft.com/en-us/entra/identity/monitoring-health/recommendation-renew-expiring-service-principal-credential",
    note: "Microsoft Entra recommendation behavior for service-principal credentials nearing expiration.",
  },
];

export const statusBands = [
  {
    title: "Critical",
    window: "Confirmed compromise or unapproved credential",
    response: "Contain immediately, preserve evidence, replace or disable access, and monitor already-issued tokens and target resources.",
  },
  {
    title: "Urgent",
    window: "Expired or 0–7 days",
    response: "Escalate to the technical and business owner, create a controlled replacement, and execute the cutover as an outage-prevention change.",
  },
  {
    title: "High",
    window: "8–30 days",
    response: "Schedule rotation now, validate dependency mapping, and do not wait for the final week.",
  },
  {
    title: "Planned",
    window: "31–60 days",
    response: "Confirm owner, runtime, secret store, rotation method, and maintenance window.",
  },
  {
    title: "Governed",
    window: "More than 60 days",
    response: "Retain monitoring, verify policy compliance, and migrate to managed identity or federation where practical.",
  },
];
