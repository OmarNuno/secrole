import KnowledgeGuideLayout, { GuideFaq, GuideSection } from "./KnowledgeGuideLayout";
import ManagedIdentityDecisionSections from "./ManagedIdentityDecisionSections";
import ManagedIdentityFederationSections from "./ManagedIdentityFederationSections";
import ManagedIdentityFoundationSections from "./ManagedIdentityFoundationSections";
import ManagedIdentityOperationsSections from "./ManagedIdentityOperationsSections";
import { faq, sources, toc } from "./managedIdentityGuideData";
import "./ManagedIdentitiesGuide.css";

export default function ManagedIdentitiesGuide() {
  return (
    <KnowledgeGuideLayout
      pageId="service-principal-managed-identities"
      eyebrow="Credential-free workload authentication"
      lede="Choose the identity boundary before choosing the code. Use a managed identity for supported Azure-hosted workloads, use workload identity federation for trusted OIDC workloads, and keep long-lived secrets or certificates only where the platform cannot support a credential-free design."
      summary="Choose, authorize, implement, inventory, and operate managed identities and federated workload identities safely."
      toc={toc}
      faq={faq}
      sources={sources}
      relatedPageIds={[
        "service-principal-mfa-migration",
        "service-principal-credential-lifecycle",
        "service-principal-security-review",
        "service-principal-permissions",
        "service-principal-troubleshooting",
      ]}
    >
      <ManagedIdentityDecisionSections />
      <ManagedIdentityFoundationSections />
      <ManagedIdentityFederationSections />
      <ManagedIdentityOperationsSections />

      <GuideSection
        id="faq"
        eyebrow="Architecture questions"
        title="Questions engineers ask before standardizing the identity model"
        intro="Use these answers to choose the right boundary, then validate current support and authorization behavior for the exact source resource and target service."
      >
        <GuideFaq items={faq} />
      </GuideSection>
    </KnowledgeGuideLayout>
  );
}
