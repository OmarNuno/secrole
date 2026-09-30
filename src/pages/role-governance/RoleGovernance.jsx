import KnowledgeGuideLayout, { GuideFaq, GuideSection } from "../service-principals/KnowledgeGuideLayout";
import RoleGovernanceAssignmentSections from "./RoleGovernanceAssignmentSections";
import RoleGovernanceControlSections from "./RoleGovernanceControlSections";
import RoleGovernanceFoundationSections from "./RoleGovernanceFoundationSections";
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
      relatedTitle="Use SecRole to choose and compare roles"
      relatedIntro="The reference explains the governance model. Use SecRole's tools to inspect role capabilities, compare overlap, and investigate the least-privileged role for a requirement."
      changePosture="Evidence, least privilege, then controlled change"
    >
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
