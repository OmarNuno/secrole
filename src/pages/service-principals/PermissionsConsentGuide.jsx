import KnowledgeGuideLayout, { GuideFaq, GuideSection } from "./KnowledgeGuideLayout";
import PermissionsDirectoryConsentSections from "./PermissionsDirectoryConsentSections";
import PermissionsModelSections from "./PermissionsModelSections";
import PermissionsRuntimeSections from "./PermissionsRuntimeSections";
import { faq, sources, toc } from "./permissionsGuideData";

export default function PermissionsConsentGuide() {
  return (
    <KnowledgeGuideLayout
      pageId="service-principal-permissions"
      eyebrow="Microsoft Entra permissions and consent guide"
      lede="Configured permissions, administrator consent, directory grant records, and token claims are separate layers. This guide connects them so you can prove what an application requested, what the tenant granted, and what the workload can actually present at runtime."
      summary="Reconcile requested access, tenant consent, service-principal grants, and token evidence."
      toc={toc}
      faq={faq}
      sources={sources}
      relatedPageIds={[
        "service-principal-identifiers",
        "service-principal-troubleshooting",
        "service-principal-security-review",
        "service-principal-mfa-migration",
        "service-principal-managed-identities",
      ]}
    >
      <PermissionsModelSections />
      <PermissionsDirectoryConsentSections />
      <PermissionsRuntimeSections />

      <GuideSection
        id="faq"
        eyebrow="Quick answers"
        title="Questions administrators ask most often"
        intro="Use these answers to orient the investigation, then verify the relevant application object, service principals, grant records, and token."
      >
        <GuideFaq items={faq} />
      </GuideSection>
    </KnowledgeGuideLayout>
  );
}
