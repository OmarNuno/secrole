# SecRole Session Notes — Service Principal Credential Lifecycle

Date: September 18, 2026

## Repository state

- PR #9, **Publish SecRole knowledge library landing page**, was reviewed and merged.
- Current `main` at the start of this work: `bc8ce75`
- New branch:
  - `feature/service-principal-credential-lifecycle`

## Pull request and preview

- Pull request: [#10 — Publish Service Principal credential lifecycle guide](https://github.com/OmarNuno/secrole/pull/10)
- First implementation commit: `45e3145`
- Vercel deployment status: **Ready / successful**
- Preview root: https://secrole-git-feature-service-principal-c-7a6e8d-o-3026s-projects.vercel.app
- Knowledge preview: https://secrole-git-feature-service-principal-c-7a6e8d-o-3026s-projects.vercel.app/knowledge
- Service Principals hub preview: https://secrole-git-feature-service-principal-c-7a6e8d-o-3026s-projects.vercel.app/service-principals
- Credential Lifecycle guide preview: https://secrole-git-feature-service-principal-c-7a6e8d-o-3026s-projects.vercel.app/service-principals/credential-lifecycle

## Objective

Publish the seventh focused Service Principal child guide:

- `/service-principals/credential-lifecycle`

The guide must help administrators inventory every Microsoft Entra application and service-principal secret or certificate, prioritize risk before the final week, rotate through controlled overlap, respond to compromise, prevent new long-lived credential debt, and decommission stale credentials without causing an outage.

## Implementation completed in this branch

### New route

- `/service-principals/credential-lifecycle`

### Guide structure

1. The no-outage rotation rule
2. Application object, service-principal object, and runtime dependency mapping
3. Client secret, client certificate, federation, managed identity, and SAML certificate distinctions
4. Tenant-wide inventory of both `applications` and `servicePrincipals`
5. At-risk owner enrichment without one owner request for every object
6. Risk prioritization by expiration, privilege, ownership, provenance, exposure, and business impact
7. Client-secret overlap and replacement workflow
8. Certificate/public-key and private-key rotation workflow
9. Compromised-credential containment and already-issued-token considerations
10. Tenant default and object-specific application-management policies
11. 90/60/30/14/7-day alerting model
12. Daily, weekly, monthly, and event-driven operating cadence
13. Audit-log evidence and clean decommissioning
14. FAQ structured data, official Microsoft sources, and sibling-guide links

## Important technical distinctions

- Most OAuth credentials live on the application object, but `servicePrincipal` can also contain `passwordCredentials` and `keyCredentials`; both collections must be inventoried.
- Microsoft Graph returns `secretText` only during the initial `addPassword` operation.
- The credential `keyId` identifies the directory record; it is not the secret value.
- A certificate's public record in Microsoft Entra and the workload's protected private key form one operational dependency.
- SAML token-signing certificate lifecycle is not the same as OAuth client-authentication certificate lifecycle.
- Adding a replacement credential does not deploy it to the workload.
- Removing a credential blocks new token acquisition through that credential but does not retroactively invalidate every access token already issued.
- Managed identity and workload identity federation are preferred when supported because they remove customer-managed long-lived credentials.
- Application-management policy can restrict new password or asymmetric-key lifetimes, but policy does not replace inventory, alerting, owner accountability, rotation testing, or decommissioning.

## Read-only tooling

The guide includes PowerShell and Graph examples for:

- Application-object credential inventory
- Service-principal credential inventory
- Secret hints, certificate thumbprints, key IDs, validity windows, days remaining, and status bands
- Owner enrichment only for the at-risk subset
- App-management-policy inventory
- Credential-change audit evidence

The initial inventory intentionally avoids per-object owner calls so it can scale more safely in large tenants.

## State-changing examples

The page visibly labels the examples that:

- Add a replacement client secret while retaining the current credential
- Remove the old secret only after deployment and proof

The add example deliberately does not print `secretText`. It directs administrators to send the one-time value into an approved secret store and then clear the local variable.

## Knowledge-library behavior

After publication, `/knowledge` should contain:

- One complete Service Principals reference hub
- Seven focused guides
- Three task tracks
- Credential Lifecycle as the third guide in **Operate & govern**

The Service Principals hub should automatically display seven published guide cards. Existing Managed Identities, Mandatory MFA Migration, Security Review, Troubleshooting, Permissions, and Identifiers guides link to the new Credential Lifecycle guide.

## Files added

- `src/pages/service-principals/CredentialLifecycleGuide.jsx`
- `src/pages/service-principals/CredentialLifecycleFoundationSections.jsx`
- `src/pages/service-principals/CredentialLifecycleInventorySections.jsx`
- `src/pages/service-principals/CredentialLifecycleRotationSections.jsx`
- `src/pages/service-principals/CredentialLifecycleOperationsSections.jsx`
- `src/pages/service-principals/credentialLifecycleGuideData.js`
- `src/pages/service-principals/credentialLifecycleInventoryCode.js`
- `src/pages/service-principals/credentialLifecycleRotationCode.js`
- `src/pages/service-principals/credentialLifecycleOperationsCode.js`
- `src/pages/service-principals/CredentialLifecycleGuide.css`
- `docs/SESSION_NOTES_2026-09-18_CREDENTIAL_LIFECYCLE.md`

## Files modified

- `src/App.jsx`
- `src/data/sitePages.js`
- `src/pages/Knowledge.jsx`
- `src/pages/service-principals/IdentifiersGuide.jsx`
- `src/pages/service-principals/PermissionsConsentGuide.jsx`
- `src/pages/service-principals/ManagedIdentitiesGuide.jsx`
- `src/pages/service-principals/MfaServiceAccountMigrationGuide.jsx`
- `src/pages/service-principals/TroubleshootingGuide.jsx`
- `src/pages/service-principals/SecurityReviewGuide.jsx`
- `docs/KNOWLEDGE_ARCHITECTURE.md`
- `public/sitemap.xml`
- `public/llms.txt`

## Expected public behavior

- `/service-principals/credential-lifecycle` loads directly.
- The Service Principals hub displays seven guide cards.
- `/knowledge` reports seven focused operational guides.
- The Operate & govern track displays Troubleshooting, Security Review, and Credential Lifecycle.
- Planned or incomplete pages remain absent from public cards and discovery files.

## Validation status

- [x] Branch created from the current `main`
- [x] JavaScript and JSX syntax parsing
- [x] CSS parsing
- [x] Published route duplicate-path check
- [x] Sitemap contains `/service-principals/credential-lifecycle`
- [x] Implementation commit pushed
- [x] Pull request #10 opened
- [x] Vercel preview deployment successful
- [x] Branch has no merge-base drift from `main`
- [ ] Direct-load the new route in a browser
- [ ] Confirm seven hub cards and seven focused knowledge guides
- [ ] Test every copy button and horizontal code scrolling
- [ ] Review inventory, risk, rotation, incident, and policy layouts on mobile
- [ ] Verify title, canonical URL, TechArticle, BreadcrumbList, FAQPage, sitemap, llms, and official sources in the rendered preview

## Recommended continuation after merge

1. Review site-wide polish and mobile consistency across the knowledge library.
2. Decide the second knowledge cluster: Microsoft Entra role governance or Microsoft Purview administration.
3. Improve role-drift risk classification so sensitive tenant-wide read access is not automatically rated Low.
4. Consider full static generation or server rendering as the library grows.
