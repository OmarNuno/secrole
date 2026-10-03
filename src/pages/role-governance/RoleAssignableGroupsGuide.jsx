import KnowledgeGuideLayout, { GuideFaq, GuideSection } from "../service-principals/KnowledgeGuideLayout";
import RoleAssignableGroupsEvidenceSections from "./RoleAssignableGroupsEvidenceSections";
import RoleAssignableGroupsFoundationSections from "./RoleAssignableGroupsFoundationSections";
import RoleAssignableGroupsOperationsSections from "./RoleAssignableGroupsOperationsSections";
import RoleAssignableGroupsPimSections from "./RoleAssignableGroupsPimSections";
import RoleGovernanceJourney from "./RoleGovernanceJourney";
import { faq, sources, toc } from "./roleAssignableGroupsData";
import "./RoleAssignableGroups.css";
import "./RoleAssignableGroupsResponsive.css";

export default function RoleAssignableGroupsGuide() {
  return (
    <KnowledgeGuideLayout
      pageId="role-governance-groups"
      eyebrow="Microsoft Entra privileged group governance guide"
      lede="A role-assignable group turns membership and ownership into administrator-access decisions. Govern the complete path: who controls the group, who can become a member or owner, which role and scope the group grants, whether relationships are active or eligible, and what evidence proves continued need."
      summary="Create, inventory, govern, troubleshoot, and retire role-assignable groups without hidden privilege-escalation paths."
      toc={toc}
      faq={faq}
      sources={sources}
      relatedPageIds={[
        "role-library",
        "role-overlap-analyzer",
        "ai-role-advisor",
      ]}
      relatedTitle="Use SecRole tools to validate what the group grants"
      relatedIntro="The Role Governance journey above connects group inheritance to PIM and scope design. Use these tools to verify the assigned role's capability and compare less-privileged alternatives before changing membership or ownership."
      changePosture="Prove the complete group control path before changing access"
    >
      <RoleGovernanceJourney currentPageId="role-governance-groups" />
      <RoleAssignableGroupsFoundationSections />
      <RoleAssignableGroupsPimSections />
      <RoleAssignableGroupsEvidenceSections />
      <RoleAssignableGroupsOperationsSections />

      <GuideSection
        id="faq"
        eyebrow="Quick answers"
        title="Questions privileged-group administrators ask most often"
        intro="Use these answers to orient the investigation, then verify the actual group object, owners, members, PIM schedules, role assignments, scope, policies, and target-resource behavior in the tenant."
      >
        <GuideFaq items={faq} />
      </GuideSection>
    </KnowledgeGuideLayout>
  );
}
