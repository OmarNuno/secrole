import { Link } from "react-router-dom";
import { GuideCallout } from "./KnowledgeGuideLayout";

export default function MfaTroubleshootingCallout() {
  return (
    <GuideCallout
      tone="warning"
      title="Automation started failing with MFA or claims-challenge errors"
    >
      <p>
        A synchronized Active Directory service account is still a Microsoft Entra
        user identity. When unattended Azure automation depends on username/password
        sign-in, mandatory MFA is a migration signal—not a prompt-handling problem.
      </p>
      <Link className="kg-button primary" to="/service-principals/mfa-service-account-migration">
        Open the mandatory MFA migration guide
      </Link>
    </GuideCallout>
  );
}
