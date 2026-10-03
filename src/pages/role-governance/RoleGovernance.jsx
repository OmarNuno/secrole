import KnowledgeGuideLayout, { GuideFaq, GuideSection } from "../service-principals/KnowledgeGuideLayout";
import RoleGovernanceAssignmentSections from "./RoleGovernanceAssignmentSections";
import RoleGovernanceControlSections from "./RoleGovernanceControlSections";
import RoleGovernanceFoundationSections from "./RoleGovernanceFoundationSections";
import RoleGovernanceJourney from "./RoleGovernanceJourney";
import RoleGovernanceOperationsSections from "./RoleGovernanceOperationsSections";
import { faq, sources, toc } from "./roleGovernanceData";
import "./RoleGovernance.css";

export default function RoleGovernance() {
  return (
    <KnowledgeGuideLayout
      pageId="role-governance"
      eyebrow="Microsoft Entra role governance reference"
      lede="Govern Microsoft Entra administrator access as a complete assignment model: the principal, role definition, scope, assignment state, duration, activation controls, inheritance path, emergency-access design, and evidence that proves continued need."
      summary="Understand, inventory, review, troubleshoot, and reduce Microsoft Entra role access across direct assignments, PIM, groups, scopes, and custom roles."
      toc={toc}
      faq={faq}
      sources={sources}
      relatedPageIds={[
        "role-library",
        "role-overlap-analyzer",
        "ai-role-advisor",
      ]}
      relatedTitle="Move from the governance model into role investigation"
      relatedIntro="The journey above connects the complete Role Governance cluster. Use SecRole's tools here to inspect role capability, compare overlap, and investigate the least-privileged role for a documented administrative task."
      changePosture="Evidence, least privilege, then controlled change"
    >
      <RoleGovernanceJourney currentPageId="role-governance" />
      <RoleGovernanceFoundationSections />
      <RoleGovernanceAssignmentSections />
      <RoleGovernanceControlSections />
      <RoleGovernanceOperationsSections />

      <GuideSection
        id="faq"
        eyebrow="Quick answers"
        title="Questions role-governance teams ask most often"
        intro="Use these answers to choose the correct evidence source, then verify the exact principal, definition, scope, schedule, inheritance path, and authorization system involved."
      >
        <GuideFaq items={faq} />
      </GuideSection>
    </KnowledgeGuideLayout>
  );
}
