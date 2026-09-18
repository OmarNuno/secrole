# SecRole Session Notes — Troubleshooting Guide Continuation

Date: September 17, 2026

## Repository state

- PR #4, **Publish Service Principal identifier and permissions guides**, was reviewed, merged, and its feature branch was deleted.
- Current `main` at the start of this work: `4a9d4c2`
- New branch:
  - `feature/service-principal-troubleshooting`

## Objective

Publish the third focused Service Principal child guide:

- `/service-principals/troubleshooting`

The guide must help an administrator move from a portal mismatch, AADSTS error, failed client credential, missing consent, 401/403 response, sign-in-log question, or deleted object to a repeatable evidence-based investigation.

## Implementation completed in this branch

### New route

- `/service-principals/troubleshooting`

### New guide structure

The guide uses the shared `KnowledgeGuideLayout` introduced in PR #4 and contains:

1. Evidence capture before tenant changes
2. Six-stage troubleshooting decision tree
3. Application and service-principal object lookup
4. Tenant and national-cloud validation
5. Client-secret, certificate, and workload-federation checks
6. Requested permissions vs. tenant grants vs. token evidence
7. User assignment and Conditional Access separation
8. Service principal, managed identity, audit, and resource logs
9. Application and service-principal deletion/recovery behavior
10. Read-only Graph PowerShell and Microsoft Graph REST commands
11. Common AADSTS error catalog
12. FAQ structured data and official Microsoft sources
13. Links to the Identifier, Permissions, and parent hub pages

### Technical distinctions preserved

- Application object vs. service principal
- Application ID vs. directory Object IDs
- Client authentication vs. API authorization
- Requested permissions vs. actual grants
- Valid token vs. correct token for the target API
- Admin consent vs. Enterprise Application user assignment
- Service principal sign-ins vs. managed identity sign-ins
- Object restoration vs. complete operating-state recovery

### Recovery details grounded in current Microsoft documentation

- Deleted application and service principal objects remain restorable for up to 30 days.
- Restoring an application registration also restores its corresponding service principal when both were deleted together.
- Service principal policies are not recovered and must be configured again.
- Provisioning data can take time to reappear after recovery.
- Managed identity service principals have different recovery behavior and cannot be restored through the same process.

## Files added

- `src/pages/service-principals/TroubleshootingGuide.jsx`
- `src/pages/service-principals/TroubleshootingEvidenceSections.jsx`
- `src/pages/service-principals/TroubleshootingFailureSections.jsx`
- `src/pages/service-principals/TroubleshootingRecoverySections.jsx`
- `src/pages/service-principals/troubleshootingGuideData.js`
- `docs/SESSION_NOTES_2026-09-17_TROUBLESHOOTING.md`

## Files modified

- `src/App.jsx`
- `src/data/sitePages.js`
- `src/pages/service-principals/IdentifiersGuide.jsx`
- `src/pages/service-principals/PermissionsConsentGuide.jsx`
- `docs/KNOWLEDGE_ARCHITECTURE.md`
- `public/sitemap.xml`
- `public/llms.txt`

## Expected hub behavior

The bottom of `/service-principals` should automatically show three published guide cards:

1. Application ID vs. Object ID vs. Tenant ID
2. Service Principal Permissions and Admin Consent
3. Microsoft Entra Service Principal Troubleshooting Guide

Planned Security Review, Managed Identities, and Credential Lifecycle pages remain absent from the public guide grid and sitemap.

## Preview QA checklist

- [ ] Direct-load `/service-principals/troubleshooting`
- [ ] Confirm the hub displays exactly three published guide cards
- [ ] Confirm the right-side table of contents tracks the active section
- [ ] Review desktop layout
- [ ] Review mobile layout
- [ ] Test every copy button
- [ ] Confirm code blocks scroll horizontally on small screens
- [ ] Check the AADSTS error table on mobile
- [ ] Verify page title and canonical URL
- [ ] Verify TechArticle, BreadcrumbList, and FAQPage JSON-LD
- [ ] Confirm `/service-principals/troubleshooting` appears in `sitemap.xml`
- [ ] Confirm planned routes remain absent from discovery files

## Continuation order after merge

1. Build `/service-principals/security-review`
2. Build `/service-principals/managed-identities`
3. Build `/service-principals/credential-lifecycle`
4. Add `/knowledge` once the cluster contains roughly four to six completed guides

## Separate role-drift follow-up

The role-drift automation still needs a later improvement so tenant-wide read-only access to content, communications, identity data, or investigation evidence is not automatically classified as Low risk.
