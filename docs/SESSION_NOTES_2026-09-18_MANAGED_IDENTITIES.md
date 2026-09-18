# SecRole Session Notes — Managed Identities and Workload Identity Federation

Date: September 18, 2026

## Repository state

- PR #7, **Publish mandatory MFA service-account migration guide**, was reviewed and merged.
- Current `main` at the start of this work: `6f7e290`
- New branch:
  - `feature/managed-identities-workload-federation`

## Objective

Publish the sixth focused Service Principal child guide:

- `/service-principals/managed-identities`

The guide must help administrators and engineers choose the correct identity boundary, understand managed-identity token acquisition, distinguish system-assigned from user-assigned lifecycle, implement OIDC federation, authorize the resulting service principal, inventory the identity, and operate it without reintroducing unmanaged credentials.

## Implementation completed in this branch

### New route

- `/service-principals/managed-identities`

### Guide structure

1. Workload identity decision order
2. System-assigned vs. user-assigned managed identity
3. Managed-identity token flow
4. Target authorization and source-resource threat boundary
5. Workload identity federation token exchange
6. App-registration vs. user-assigned-identity federation targets
7. GitHub Actions, Kubernetes, cross-cloud, Azure Pipelines, and SPIFFE/SPIRE patterns
8. Deterministic .NET and Python production credentials
9. Managed-identity and federated-credential inventory
10. State-changing creation examples clearly labeled
11. Implementation runbook, operational evidence, troubleshooting, and decommissioning
12. FAQ structured data and official Microsoft references
13. Related links to migration, security review, permissions, troubleshooting, identifiers, and the parent hub

## Technical distinctions preserved

- Managed identity vs. app-registration service principal
- System-assigned lifecycle vs. user-assigned independent lifecycle
- Authentication mechanism vs. target authorization
- Source-resource administration vs. target-resource permissions
- User-assigned identity reuse vs. over-sharing blast radius
- Managed identity endpoint vs. external OIDC federation
- Federation to an app registration vs. federation to a user-assigned managed identity
- Credential-free authentication vs. governance-free operation
- Developer convenience credentials vs. deterministic production credentials
- Identity deletion vs. cleanup of orphaned authorization records

## Current platform details documented

- Managed identities are special Microsoft Entra service principals whose underlying credentials are managed by Azure.
- System-assigned identities belong to one resource and are removed with that resource.
- User-assigned identities are standalone Azure resources with independent lifecycle and can be attached to multiple compatible resources.
- External OIDC workloads can federate to an app registration or a user-assigned managed identity.
- Issuer, subject, and audience trust values must match the incoming assertion exactly and case-sensitively.
- Federated identity credential names are immutable, wildcards are unsupported, and each application or user-assigned identity has a documented credential-count limit.
- Source-resource administrators and identity-assignment permissions are part of the workload credential boundary.
- Managed-identity token caching can delay some group or role claim changes.
- Deleting a managed identity does not automatically remove every Azure role assignment or resource-specific authorization record.

## Files added

- `src/pages/service-principals/ManagedIdentitiesGuide.jsx`
- `src/pages/service-principals/ManagedIdentityDecisionSections.jsx`
- `src/pages/service-principals/ManagedIdentityFoundationSections.jsx`
- `src/pages/service-principals/ManagedIdentityFederationSections.jsx`
- `src/pages/service-principals/ManagedIdentityOperationsSections.jsx`
- `src/pages/service-principals/managedIdentityGuideData.js`
- `src/pages/service-principals/ManagedIdentitiesGuide.css`
- `docs/SESSION_NOTES_2026-09-18_MANAGED_IDENTITIES.md`

## Files modified

- `src/App.jsx`
- `src/data/sitePages.js`
- `src/pages/service-principals/IdentifiersGuide.jsx`
- `src/pages/service-principals/PermissionsConsentGuide.jsx`
- `src/pages/service-principals/TroubleshootingGuide.jsx`
- `src/pages/service-principals/SecurityReviewGuide.jsx`
- `src/pages/service-principals/MfaServiceAccountMigrationGuide.jsx`
- `docs/KNOWLEDGE_ARCHITECTURE.md`
- `public/sitemap.xml`
- `public/llms.txt`

## Expected hub behavior

The bottom of `/service-principals` should automatically show six published guide cards:

1. Application ID vs. Object ID vs. Tenant ID
2. Service Principal Permissions and Admin Consent
3. Microsoft Entra Service Principal Troubleshooting Guide
4. How to Review a Service Principal for Security Risk
5. Microsoft Mandatory MFA: Migrate Service Accounts to Workload Identities
6. Managed Identities and Workload Identity Federation

Credential Lifecycle remains planned and must not appear in the public guide grid or sitemap.

## Pull request and preview

- Pull request: [#8 — Publish Managed Identities and Workload Identity Federation guide](https://github.com/OmarNuno/secrole/pull/8)
- First implementation commit: `da08004`
- Vercel deployment status: **Ready / successful**
- Preview root: https://secrole-git-feature-managed-identities-3e5985-o-3026s-projects.vercel.app
- Hub preview: https://secrole-git-feature-managed-identities-3e5985-o-3026s-projects.vercel.app/service-principals
- Managed Identities guide preview: https://secrole-git-feature-managed-identities-3e5985-o-3026s-projects.vercel.app/service-principals/managed-identities

## Validation checklist

- [x] JavaScript and JSX syntax parsing
- [x] CSS parsing
- [x] Route registry duplicate-path check
- [x] Sitemap includes `/service-principals/managed-identities`
- [x] `/knowledge` and Credential Lifecycle remain absent from discovery files
- [x] Branch has no merge-base drift from `main`
- [x] Vercel preview deployment successful
- [ ] Direct-load the new route
- [ ] Confirm the hub displays exactly six published guide cards
- [ ] Review system-vs-user table on mobile
- [ ] Review token and federation flows on mobile
- [ ] Test every copy button and code-block scrolling
- [ ] Validate title, canonical URL, TechArticle, BreadcrumbList, FAQPage, and official sources

## Continuation order after merge

1. Build `/knowledge` as the SecRole knowledge-library landing page
2. Build `/service-principals/credential-lifecycle`
3. Continue expanding Entra, Purview, workload-identity, governance, and troubleshooting clusters
4. Revisit role-drift risk classification so sensitive tenant-wide read access is not automatically rated Low
