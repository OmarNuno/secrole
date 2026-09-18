import KnowledgeGuideLayout, { GuideFaq, GuideSection } from "./KnowledgeGuideLayout";
import MfaMigrationArchitectureSections from "./MfaMigrationArchitectureSections";
import MfaMigrationDiscoverySections from "./MfaMigrationDiscoverySections";
import MfaMigrationRunbookSections from "./MfaMigrationRunbookSections";
import MfaMigrationScopeSections from "./MfaMigrationScopeSections";
import { faq, sources, toc } from "./mfaMigrationGuideData";
import "./MfaMigrationGuide.css";

export default function MfaServiceAccountMigrationGuide() {
  return (
    <KnowledgeGuideLayout
      pageId="service-principal-mfa-migration"
      eyebrow="Mandatory MFA migration guide"
      lede="Microsoft mandatory MFA applies to user identities that perform covered Azure and admin operations. A synchronized Active Directory account used for unattended automation is still a user identity, so its cloud authentication must move to a managed identity, federated workload identity, or service principal."
      summary="Discover user-based Azure automation, choose the right workload identity, migrate access safely, and retire cloud sign-in from the old account."
      toc={toc}
      faq={faq}
      sources={sources}
      relatedPageIds={[
        "service-principal-managed-identities",
        "service-principal-credential-lifecycle",
        "service-principal-troubleshooting",
        "service-principal-security-review",
        "service-principal-identifiers",
        "service-principal-permissions",
      ]}
    >
      <MfaMigrationScopeSections />
      <MfaMigrationDiscoverySections />
      <MfaMigrationArchitectureSections />
      <MfaMigrationRunbookSections />

      <GuideSection
        id="faq"
        eyebrow="Migration questions"
        title="Questions administrators ask before changing production automation"
        intro="Use these answers to classify impact correctly, then validate the exact sign-in path, workload host, resource, and dependency before cutover."
      >
        <GuideFaq items={faq} />
      </GuideSection>
    </KnowledgeGuideLayout>
  );
}
