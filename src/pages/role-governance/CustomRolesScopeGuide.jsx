import KnowledgeGuideLayout, { GuideFaq, GuideSection } from "../service-principals/KnowledgeGuideLayout";
import CustomRolesScopeAdminUnitsSections from "./CustomRolesScopeAdminUnitsSections";
import CustomRolesScopeEvidenceSections from "./CustomRolesScopeEvidenceSections";
import CustomRolesScopeFoundationSections from "./CustomRolesScopeFoundationSections";
import CustomRolesScopeOperations from "./CustomRolesScopeOperations";
import RoleGovernanceJourney from "./RoleGovernanceJourney";
import { faq, sources, toc } from "./customRolesScopeData";
import "./CustomRolesScope.css";
import "./CustomRolesScopeResponsive.css";

export default function CustomRolesScopeGuide() {
  return (
    <KnowledgeGuideLayout
      pageId="role-governance-custom-scope"
      eyebrow="Microsoft Entra custom roles and scoped administration guide"
      lede="Least privilege is not one decision. Reduce the actions in the role, reduce where those actions apply, govern who inherits or activates the assignment, and preserve evidence that the approved boundary still matches the business task."
      summary="Design, inventory, scope, test, troubleshoot, and retire Microsoft Entra custom roles and Administrative Unit delegation."
      toc={toc}
      faq={faq}
      sources={sources}
      relatedPageIds={[
        "role-library",
        "role-overlap-analyzer",
        "service-principal-permissions",
      ]}
      relatedTitle="Continue role selection and application-permission investigation"
      relatedIntro="The Role Governance journey above connects action and scope design to PIM and group inheritance. Use the role tools to compare built-in alternatives, and use the permissions guide when the task involves application runtime access rather than administrator delegation."
      changePosture="Reduce actions, narrow scope, test allowed and denied operations"
    >
      <RoleGovernanceJourney currentPageId="role-governance-custom-scope" />
      <CustomRolesScopeFoundationSections />
      <CustomRolesScopeAdminUnitsSections />
      <CustomRolesScopeEvidenceSections />
      <CustomRolesScopeOperations />

      <GuideSection
        id="faq"
        eyebrow="Quick answers"
        title="Questions custom-role and scoped-administration teams ask most often"
        intro="Use these answers to orient the investigation, then verify the actual role definition, supported action, principal, assignment state, directory scope, target object membership, session, and audit evidence in the tenant."
      >
        <GuideFaq items={faq} />
      </GuideSection>
    </KnowledgeGuideLayout>
  );
}
