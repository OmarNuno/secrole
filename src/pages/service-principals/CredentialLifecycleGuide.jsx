import KnowledgeGuideLayout, { GuideFaq, GuideSection } from "./KnowledgeGuideLayout";
import CredentialLifecycleFoundationSections from "./CredentialLifecycleFoundationSections";
import CredentialLifecycleInventorySections from "./CredentialLifecycleInventorySections";
import CredentialLifecycleOperationsSections from "./CredentialLifecycleOperationsSections";
import CredentialLifecycleRotationSections from "./CredentialLifecycleRotationSections";
import { faq, sources, toc } from "./credentialLifecycleGuideData";
import "./CredentialLifecycleGuide.css";

export default function CredentialLifecycleGuide() {
  return (
    <KnowledgeGuideLayout
      pageId="service-principal-credential-lifecycle"
      eyebrow="Microsoft Entra credential lifecycle guide"
      lede="Prevent service-principal outages by inventorying every client secret and certificate, prioritizing risk before the final week, rotating through controlled overlap, proving the replacement, and retiring the old credential with complete evidence."
      summary="Find, monitor, rotate, contain, and retire Microsoft Entra application credentials without losing the workload or the audit trail."
      toc={toc}
      faq={faq}
      sources={sources}
      relatedPageIds={[
        "service-principal-managed-identities",
        "service-principal-security-review",
        "service-principal-troubleshooting",
        "service-principal-mfa-migration",
        "service-principal-permissions",
      ]}
    >
      <CredentialLifecycleFoundationSections />
      <CredentialLifecycleInventorySections />
      <CredentialLifecycleRotationSections />
      <CredentialLifecycleOperationsSections />

      <GuideSection
        id="faq"
        eyebrow="Credential decisions"
        title="Questions administrators ask before rotating production access"
        intro="Use these answers to choose the correct object, credential, overlap, and evidence path—then validate the exact workload before making a state-changing update."
      >
        <GuideFaq items={faq} />
      </GuideSection>
    </KnowledgeGuideLayout>
  );
}
