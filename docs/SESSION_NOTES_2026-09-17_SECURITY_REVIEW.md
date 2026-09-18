# SecRole Session Notes — Service Principal Security Review Guide

Date: September 17, 2026

## Repository state

- PR #5, **Publish Service Principal troubleshooting guide**, was reviewed, merged, and its feature branch was deleted.
- Current `main` at the start of this work: `3b208d9`
- New branch:
  - `feature/service-principal-security-review`

## Objective

Publish the fourth focused Service Principal child guide:

- `/service-principals/security-review`

The guide must help an identity, security, audit, or application-governance reviewer build a defensible retain, reduce, contain, or retire decision from ownership, provenance, privilege, credentials, activity, risk signals, and preventive controls.

## Implementation completed in this branch

### New route

- `/service-principals/security-review`

### Guide structure

1. What a complete security review must prove
2. Ten-minute triage for urgent containment signals
3. Identity, provenance, ownership, and lifecycle evidence
4. Every privilege surface, including:
   - Application permissions
   - Delegated grants
   - Microsoft Entra directory roles
   - Azure RBAC
   - Resource-specific access
   - Direct and transitive group membership
   - Owned directory objects
   - App roles exposed to users, groups, and other service principals
5. Credential and authentication review:
   - Client secrets
   - Certificates
   - Workload identity federation
   - Managed identities
   - Credentials stored on the service principal
   - Recent credential changes
6. Usage and change evidence:
   - Service principal sign-ins
   - Managed identity sign-ins
   - Directory audit logs
   - Target-resource logs
   - Workload identity risk detections
   - Owner attestation
7. Controls and current product scope:
   - `accountEnabled`
   - `appRoleAssignmentRequired`
   - Conditional Access for workload identities
   - Microsoft Entra ID Protection workload-risk detections
   - Application management policies
   - Tags, notes, and custom security attributes
8. SecRole operational disposition model:
   - Critical / contain now
   - High / urgent remediation
   - Medium / planned correction
   - Lower / retain with monitoring
9. Read-only evidence collection commands for Microsoft Graph PowerShell and Azure CLI
10. Safe remediation sequence that preserves evidence and minimizes outage
11. FAQ structured data and primary Microsoft sources
12. Related links to Identifiers, Permissions, Troubleshooting, and the parent hub

## Technical distinctions preserved

- Application object vs. service principal
- Application owners vs. service principal owners
- Publisher verification vs. application approval
- Read-only permission name vs. confidentiality impact
- Requested permissions vs. tenant grants
- Microsoft Entra roles vs. Azure RBAC vs. target-resource authorization
- Credential metadata vs. proof of actual credential use
- Service principal sign-ins vs. managed identity sign-ins
- Risk detections vs. independent resource-side evidence
- Governance disablement vs. incident containment

## Current Microsoft platform scope documented

- Microsoft Graph recommends at least two owners for applications and service principals.
- Conditional Access for workload identities applies to eligible single-tenant service principals registered in the tenant.
- Microsoft and third-party SaaS applications, multitenant applications, and managed identities are outside that Conditional Access workload-policy scope.
- Workload Conditional Access must target the service principal directly; policy assignment through a containing group is not enforced for that service principal.
- Microsoft Entra ID Protection can surface risky workload identities and detections for supported application/service-principal scenarios; managed identities are currently outside that risk-report scope.
- Service principal sign-ins and managed identity sign-ins are separate log types.

## Files added

- `src/pages/service-principals/SecurityReviewGuide.jsx`
- `src/pages/service-principals/SecurityReviewFoundationSections.jsx`
- `src/pages/service-principals/SecurityReviewPrivilegeSections.jsx`
- `src/pages/service-principals/SecurityReviewEvidenceSections.jsx`
- `src/pages/service-principals/SecurityReviewOperationsSections.jsx`
- `src/pages/service-principals/securityReviewGuideData.js`
- `src/pages/service-principals/SecurityReviewGuide.css`
- `docs/SESSION_NOTES_2026-09-17_SECURITY_REVIEW.md`

## Files modified

- `src/App.jsx`
- `src/data/sitePages.js`
- `src/pages/service-principals/IdentifiersGuide.jsx`
- `src/pages/service-principals/PermissionsConsentGuide.jsx`
- `src/pages/service-principals/TroubleshootingGuide.jsx`
- `docs/KNOWLEDGE_ARCHITECTURE.md`
- `public/sitemap.xml`
- `public/llms.txt`

## Expected hub behavior

The bottom of `/service-principals` should automatically show four published guide cards:

1. Application ID vs. Object ID vs. Tenant ID
2. Service Principal Permissions and Admin Consent
3. Microsoft Entra Service Principal Troubleshooting Guide
4. How to Review a Service Principal for Security Risk

Managed Identities and Credential Lifecycle remain planned and must not appear in the public guide grid or sitemap.

## Preview QA checklist

- [ ] Direct-load `/service-principals/security-review`
- [ ] Confirm the hub displays exactly four published guide cards
- [ ] Confirm sibling guides link to Security Review
- [ ] Confirm the right-side table of contents tracks the active section
- [ ] Review desktop layout
- [ ] Review mobile layout
- [ ] Test every copy button
- [ ] Confirm code blocks and evidence tables scroll horizontally on small screens
- [ ] Review the disposition matrix and credential posture cards in both themes
- [ ] Verify page title and canonical URL
- [ ] Verify TechArticle, BreadcrumbList, and FAQPage JSON-LD
- [ ] Confirm `/service-principals/security-review` appears in `sitemap.xml`
- [ ] Confirm planned routes remain absent from discovery files

## Continuation order after merge

1. Build `/service-principals/managed-identities`
2. Build `/service-principals/credential-lifecycle`
3. Add `/knowledge` after the cluster contains approximately five or six complete child guides
4. Revisit role-drift risk classification so tenant-wide sensitive read access is not automatically rated Low
