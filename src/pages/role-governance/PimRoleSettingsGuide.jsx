import KnowledgeGuideLayout, { GuideFaq, GuideSection } from "../service-principals/KnowledgeGuideLayout";
import PimControlSections from "./PimControlSections";
import PimFoundationSections from "./PimFoundationSections";
import PimMigrationSections from "./PimMigrationSections";
import PimOperationsSections from "./PimOperationsSections";
import { faq, sources, toc } from "./pimRoleSettingsData";
import "./PimRoleSettings.css";

export default function PimRoleSettingsGuide() {
  return (
    <KnowledgeGuideLayout
      pageId="role-governance-pim"
      eyebrow="Microsoft Entra Privileged Identity Management guide"
      lede="PIM does not remove privileged access. It changes when access becomes active, how long it lasts, what the administrator must prove, who can approve it, and which evidence remains after the task. Design the complete activation path before removing standing access."
      summary="Design eligible assignments, role settings, approvers, activation controls, evidence, and reviews without creating a privileged-access lockout."
      toc={toc}
      faq={faq}
      sources={sources}
      relatedPageIds={[
        "role-library",
        "role-overlap-analyzer",
        "ai-role-advisor",
      ]}
      relatedTitle="Continue role selection and governance work"
      relatedIntro="Return to the Role Governance hub for the complete assignment model, then use SecRole's tools to inspect capability, overlap, and least-privilege alternatives."
      changePosture="Create and prove eligibility before removing standing access"
    >
      <PimFoundationSections />
      <PimControlSections />
      <PimMigrationSections />
      <PimOperationsSections />

      <GuideSection
        id="faq"
        eyebrow="Quick answers"
        title="Questions PIM administrators ask most often"
        intro="Use these answers to orient the investigation, then verify the actual role, scope, policy assignment, effective rules, eligibility, request, approval, and active schedule instance in the tenant."
      >
        <GuideFaq items={faq} />
      </GuideSection>
    </KnowledgeGuideLayout>
  );
}
