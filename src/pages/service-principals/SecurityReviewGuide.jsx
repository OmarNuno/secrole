import KnowledgeGuideLayout, { GuideFaq, GuideSection } from "./KnowledgeGuideLayout";
import SecurityReviewEvidenceSections from "./SecurityReviewEvidenceSections";
import SecurityReviewFoundationSections from "./SecurityReviewFoundationSections";
import SecurityReviewOperationsSections from "./SecurityReviewOperationsSections";
import SecurityReviewPrivilegeSections from "./SecurityReviewPrivilegeSections";
import { faq, sources, toc } from "./securityReviewGuideData";
import "./SecurityReviewGuide.css";

export default function SecurityReviewGuide() {
  return (
    <KnowledgeGuideLayout
      pageId="service-principal-security-review"
      eyebrow="Microsoft Entra security review guide"
      lede="Review a service principal as a durable security identity: prove its purpose and owners, map every privilege surface, inventory credentials, validate actual activity, inspect workload risk and controls, and choose a documented retain, reduce, contain, or retire decision."
      summary="Build a defensible service-principal risk decision from ownership, privilege, authentication, activity, and control evidence."
      toc={toc}
      faq={faq}
      sources={sources}
      relatedPageIds={[
        "service-principal-credential-lifecycle",
        "service-principal-permissions",
        "service-principal-troubleshooting",
        "service-principal-identifiers",
        "service-principal-mfa-migration",
        "service-principal-managed-identities",
      ]}
    >
      <SecurityReviewFoundationSections />
      <SecurityReviewPrivilegeSections />
      <SecurityReviewEvidenceSections />
      <SecurityReviewOperationsSections />

      <GuideSection
        id="faq"
        eyebrow="Review decisions"
        title="Questions security reviewers ask most often"
        intro="Use these answers to avoid common shortcuts, then preserve the underlying evidence and the reasoning behind the final disposition."
      >
        <GuideFaq items={faq} />
      </GuideSection>
    </KnowledgeGuideLayout>
  );
}
