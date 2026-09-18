# SecRole Session Notes — Mandatory MFA Service-Account Migration Guide

Date: September 17, 2026

## Repository state

- PR #6, **Publish Service Principal security review guide**, was reviewed and merged.
- Current `main` at the start of this work: `4a23599`
- New branch:
  - `feature/mfa-service-account-migration`

## Pull request and preview

- Pull request: [#7 — Publish mandatory MFA service-account migration guide](https://github.com/OmarNuno/secrole/pull/7)
- First implementation commit: `578baf7`
- Vercel deployment status: **Ready / successful**
- Preview root: https://secrole-git-feature-mfa-service-account-e303ef-o-3026s-projects.vercel.app
- Hub preview: https://secrole-git-feature-mfa-service-account-e303ef-o-3026s-projects.vercel.app/service-principals
- Migration guide preview: https://secrole-git-feature-mfa-service-account-e303ef-o-3026s-projects.vercel.app/service-principals/mfa-service-account-migration
- Troubleshooting preview: https://secrole-git-feature-mfa-service-account-e303ef-o-3026s-projects.vercel.app/service-principals/troubleshooting
- Updates preview: https://secrole-git-feature-mfa-service-account-e303ef-o-3026s-projects.vercel.app/updates

## Why the roadmap changed

Microsoft mandatory MFA enforcement makes user-based Azure automation an urgent migration problem. An on-premises Active Directory account that synchronizes to Microsoft Entra ID remains a `user` object. When that identity performs covered Azure management operations, Microsoft applies user authentication requirements even when the account is named or treated operationally as a service account.

The knowledge roadmap was revised so this migration guide is published before the broader Managed Identities and Workload Identity Federation guide.

## Revised roadmap

1. Publish `/service-principals/mfa-service-account-migration`
2. Publish `/service-principals/managed-identities`
3. Add `/knowledge` after the workload identity cluster reaches approximately six focused guides
4. Publish `/service-principals/credential-lifecycle`
5. Continue expanding security, governance, migration, and troubleshooting clusters

## Objective

Publish a dedicated guide:

- `/service-principals/mfa-service-account-migration`

The guide should help administrators identify user accounts used for Azure automation, understand the exact mandatory-MFA scope, select an appropriate workload identity, migrate without copying excessive privilege, and retire cloud authentication from the synchronized user safely.

## Technical scope documented

The page distinguishes:

- User identities from workload identities
- A naming convention such as `svc_` from the actual Microsoft Entra object type
- Azure Resource Manager control-plane write operations from read-only operations
- Azure management endpoints from Microsoft Graph
- Tenant Conditional Access configuration from Microsoft's mandatory MFA enforcement
- User-based ROPC or username/password authentication from noninteractive workload authentication
- Azure-hosted workloads from external OIDC-capable workloads
- Cloud authentication from the on-premises Windows, Kerberos, LDAP, NTFS, or SQL identity context
- Temporary client secrets from preferred managed identity, federation, or certificate patterns

## Planned guide structure

1. The 30-second answer
2. What mandatory MFA covers
3. What is and is not affected
4. Why synchronized AD service accounts are still user identities
5. Discovery of candidate user-based automation accounts
6. Code and configuration search patterns
7. Target-identity decision tree
8. Hybrid on-premises and cloud identity pattern
9. Existing-access inventory
10. Thirteen-step migration runbook
11. Authentication examples for:
    - Managed identity
    - Workload identity federation
    - Certificate-backed service principal
12. Cutover validation and rollback planning
13. FAQ and official Microsoft sources

## Discovery design

The guide includes a read-only Microsoft Graph PowerShell report that searches user sign-ins for Microsoft's documented affected client applications:

- Azure portal and Microsoft admin experiences
- Azure CLI
- Azure PowerShell
- Azure mobile application

The report labels results as **candidate user-based automation accounts** because sign-in telemetry alone does not prove that an account is an unattended service account.

The guide also includes a source-code and configuration scan for patterns such as:

- `Connect-AzAccount -Credential`
- `az login --username`
- `AZURE_USERNAME`
- `AZURE_PASSWORD`
- `UsernamePasswordCredential`
- `AcquireTokenByUsernamePassword`
- `acquire_token_by_username_password`

## Hybrid migration pattern

A synchronized AD service account might still be required for local Windows service logon, scheduled tasks, Kerberos, LDAP, file shares, or SQL integrated authentication. The page therefore recommends separating identity contexts rather than assuming one identity must perform both jobs:

- Keep an on-premises AD account or gMSA where the local dependency is legitimate.
- Authenticate the cloud portion independently with managed identity, workload identity federation, or a service principal.
- Remove Azure, Microsoft Entra, and API privilege from the synchronized user after cutover.
- Retire the user object only when no valid on-premises dependency remains.

## SecRole cross-entry points

The dedicated guide is the authoritative page. Additional entry points are included in:

- Service Principals hub, under Authentication Methods
- Service Principal Troubleshooting guide
- Entra & Purview Updates page as a permanent high-impact alert
- Related-guide sections on Identifiers, Permissions, Troubleshooting, and Security Review

## Files expected in this branch

### Added

- `src/pages/service-principals/MfaServiceAccountMigrationGuide.jsx`
- `src/pages/service-principals/MfaMigrationScopeSections.jsx`
- `src/pages/service-principals/MfaMigrationDiscoverySections.jsx`
- `src/pages/service-principals/MfaMigrationArchitectureSections.jsx`
- `src/pages/service-principals/MfaMigrationRunbookSections.jsx`
- `src/pages/service-principals/mfaMigrationGuideData.js`
- `src/pages/service-principals/MfaMigrationGuide.css`
- `src/pages/service-principals/MfaTroubleshootingCallout.jsx`
- `docs/SESSION_NOTES_2026-09-17_MFA_MIGRATION.md`

### Modified

- `src/App.jsx`
- `src/data/sitePages.js`
- `src/pages/service-principals/ServicePrincipalsRoute.jsx`
- `src/pages/service-principals/ServicePrincipalsGuideMap.css`
- `src/pages/service-principals/IdentifiersGuide.jsx`
- `src/pages/service-principals/PermissionsConsentGuide.jsx`
- `src/pages/service-principals/TroubleshootingGuide.jsx`
- `src/pages/service-principals/SecurityReviewGuide.jsx`
- `src/pages/Updates.jsx`
- `docs/KNOWLEDGE_ARCHITECTURE.md`
- `public/sitemap.xml`
- `public/llms.txt`

## Validation checklist

- [x] New branch created from current `main`
- [x] JavaScript and JSX syntax validated
- [x] CSS syntax validated
- [x] Route registry contains no duplicate published paths
- [x] New route appears in the sitemap
- [x] Planned routes remain absent from the sitemap
- [x] Git tree and commit created
- [x] Pull request opened
- [x] Vercel preview successful
- [ ] Direct-load migration guide
- [ ] Confirm Service Principals hub displays five published cards
- [ ] Confirm hub Authentication section displays the MFA migration callout
- [ ] Confirm Troubleshooting guide links to the migration guide
- [ ] Confirm Updates page displays the permanent high-impact alert
- [ ] Test desktop and mobile layouts
- [ ] Test every copy button
- [ ] Review the affected-scenarios table on mobile
- [ ] Review the hybrid identity diagram on mobile
- [ ] Verify title, canonical URL, TechArticle, BreadcrumbList, and FAQPage JSON-LD

## Continuation order after merge

1. Build `/service-principals/managed-identities`
2. Add `/knowledge`
3. Build `/service-principals/credential-lifecycle`
4. Revisit role-drift risk classification so tenant-wide sensitive read access is not automatically rated Low
