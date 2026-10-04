import KnowledgeGuideLayout, { GuideFaq, GuideSection } from "../service-principals/KnowledgeGuideLayout";
import PurviewGovernanceAccessSections from "./PurviewGovernanceAccessSections";
import PurviewGovernanceEvidenceSections from "./PurviewGovernanceEvidenceSections";
import PurviewGovernanceFoundationSections from "./PurviewGovernanceFoundationSections";
import PurviewGovernanceOperationsSections from "./PurviewGovernanceOperationsSections";
import { faq, sources, toc } from "./purviewGovernanceData";
import "./PurviewGovernance.css";
import "./PurviewGovernanceResponsive.css";

export default function PurviewGovernance() {
  return (
    <KnowledgeGuideLayout
      pageId="purview-governance"
      eyebrow="Microsoft Purview administration and role governance reference"
      lede="Microsoft Purview is not one permission system. Govern the complete access path across portal role groups, mapped Microsoft Entra roles, Administrative Units, temporary and PIM-based membership, eDiscovery cases, compliance boundaries, sensitive-content roles, Unified Catalog, Data Map, and underlying resource permissions."
      summary="Understand, inventory, scope, review, troubleshoot, and reduce Microsoft Purview compliance, data-security, investigation, and data-governance access."
      toc={toc}
      faq={faq}
      sources={sources}
      relatedPageIds={[
        "role-library",
        "role-overlap-analyzer",
        "ai-role-advisor",
        "role-governance",
        "updates",
      ]}
      relatedTitle="Continue Purview role and identity investigation"
      relatedIntro="Use SecRole's role catalog and comparison tools to inspect Purview capability bundles, the Entra Role Governance hub to resolve mapped directory-role paths, and Updates to track Microsoft permission changes."
      changePosture="Resolve every permission layer before granting or removing access"
    >
      <PurviewGovernanceFoundationSections />
      <PurviewGovernanceAccessSections />
      <PurviewGovernanceEvidenceSections />
      <PurviewGovernanceOperationsSections />

      <GuideSection
        id="faq"
        eyebrow="Quick answers"
        title="Questions Microsoft Purview administrators ask most often"
        intro="Use these answers to orient the investigation, then verify the actual role group, roles, member source, Entra assignments, scope, case, content access, governance-domain permissions, and target-solution evidence in the tenant."
      >
        <GuideFaq items={faq} />
      </GuideSection>
    </KnowledgeGuideLayout>
  );
}
