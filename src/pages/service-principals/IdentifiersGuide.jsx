import KnowledgeGuideLayout, { GuideFaq, GuideSection } from "./KnowledgeGuideLayout";
import IdentifierOperationsSections from "./IdentifierOperationsSections";
import IdentifierOverviewSections from "./IdentifierOverviewSections";
import IdentifierPortalFieldSections from "./IdentifierPortalFieldSections";
import { faq, sources, toc } from "./identifierGuideData";

export default function IdentifiersGuide() {
  return (
    <KnowledgeGuideLayout
      pageId="service-principal-identifiers"
      eyebrow="Microsoft Entra identifier guide"
      lede="The same application can expose several GUIDs that look interchangeable but identify different things. Use this guide to choose the correct value for OAuth configuration, Microsoft Graph, portal troubleshooting, Azure RBAC, and multitenant investigations."
      summary="Translate a field name or portal value into the correct app, object, or tenant identifier."
      toc={toc}
      faq={faq}
      sources={sources}
      relatedPageIds={[
        "service-principal-permissions",
        "service-principal-troubleshooting",
        "service-principal-security-review",
        "service-principal-mfa-migration",
      ]}
    >
      <IdentifierOverviewSections />
      <IdentifierPortalFieldSections />
      <IdentifierOperationsSections />

      <GuideSection
        id="faq"
        eyebrow="Quick answers"
        title="Questions administrators ask most often"
        intro="Open a question for the direct answer, then use the field decoder and read-only commands when you need to prove it in the tenant."
      >
        <GuideFaq items={faq} />
      </GuideSection>
    </KnowledgeGuideLayout>
  );
}
