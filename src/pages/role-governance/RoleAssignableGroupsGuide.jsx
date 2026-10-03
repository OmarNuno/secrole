import KnowledgeGuideLayout, { GuideFaq, GuideSection } from "../service-principals/KnowledgeGuideLayout";
import RoleAssignableGroupsEvidenceSections from "./RoleAssignableGroupsEvidenceSections";
import RoleAssignableGroupsFoundationSections from "./RoleAssignableGroupsFoundationSections";
import RoleAssignableGroupsOperationsSections from "./RoleAssignableGroupsOperationsSections";
import RoleAssignableGroupsPimSections from "./RoleAssignableGroupsPimSections";
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
        "role-governance-pim",
        "role-library",
        "role-overlap-analyzer",
        "ai-role-advisor",
      ]}
      relatedTitle="Continue privileged-access governance"
      relatedIntro="Use the PIM guide to design activation controls, return to the Role Governance hub for the complete assignment model, and use SecRole's tools to reduce role capability before granting it through a group."
      changePosture="Prove the complete group control path before changing access"
    >
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
