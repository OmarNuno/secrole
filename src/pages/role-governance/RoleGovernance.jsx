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
        "role-governance-pim",
        "role-governance-groups",
        "role-governance-custom-scope",
        "role-library",
        "role-overlap-analyzer",
        "ai-role-advisor",
      ]}
      relatedTitle="Continue with privileged-access design and role investigation"
      relatedIntro="Use the focused PIM, role-assignable group, and custom-role scope guides to control activation, inheritance, permissions, and blast radius, then use SecRole's tools to compare capabilities and find the least-privileged role for a requirement."
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
