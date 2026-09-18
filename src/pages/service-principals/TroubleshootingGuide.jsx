import KnowledgeGuideLayout, { GuideFaq, GuideSection } from "./KnowledgeGuideLayout";
import TroubleshootingEvidenceSections from "./TroubleshootingEvidenceSections";
import TroubleshootingFailureSections from "./TroubleshootingFailureSections";
import TroubleshootingRecoverySections from "./TroubleshootingRecoverySections";
import { faq, sources, toc } from "./troubleshootingGuideData";

export default function TroubleshootingGuide() {
  return (
    <KnowledgeGuideLayout
      pageId="service-principal-troubleshooting"
      eyebrow="Microsoft Entra troubleshooting guide"
      lede="Troubleshoot service principals by proving each layer in order: object and tenant, client authentication, consent records, token evidence, resource authorization, assignment and policy, and recovery state."
      summary="Turn an AADSTS error, sign-in failure, or portal mismatch into a repeatable evidence-based investigation."
      toc={toc}
      faq={faq}
      sources={sources}
      relatedPageIds={[
        "service-principal-identifiers",
        "service-principal-permissions",
      ]}
    >
      <TroubleshootingEvidenceSections />
      <TroubleshootingFailureSections />
      <TroubleshootingRecoverySections />

      <GuideSection
        id="faq"
        eyebrow="Quick answers"
        title="Questions administrators ask during incidents"
        intro="Use these answers to choose the next evidence source, then verify the exact object, tenant, grant, token, and resource involved."
      >
        <GuideFaq items={faq} />
      </GuideSection>
    </KnowledgeGuideLayout>
  );
}
