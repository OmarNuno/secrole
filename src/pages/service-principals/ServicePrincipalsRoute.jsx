import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import ServicePrincipals from "../ServicePrincipals";
import { getPublishedChildPages } from "../../data/sitePages";
import "./ServicePrincipalsGuideMap.css";

const publishedGuides = getPublishedChildPages("service-principals");

function PublishedGuideMap() {
  return (
    <div className="sp-published-guide-map">
      <header className="sp-section-heading">
        <div className="sp-section-kicker">Deep-dive guides</div>
        <h2>Go deeper when the task gets specific</h2>
        <p>Use these focused guides when you need portal steps, Microsoft Graph examples, PowerShell, decision trees, or a repeatable security workflow.</p>
      </header>

      <div className="sp-expansion-grid">
        {publishedGuides.map((item) => (
          <Link className="sp-guide-card" to={item.path} key={item.id}>
            <span>Published guide</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            {item.guideTags?.length > 0 && (
              <div className="sp-guide-tags" aria-label="Guide features">
                {item.guideTags.map((tag) => <small key={tag}>{tag}</small>)}
              </div>
            )}
            <strong>Read guide <span aria-hidden="true">→</span></strong>
          </Link>
        ))}
      </div>
    </div>
  );
}

function MandatoryMfaMigrationCallout() {
  return (
    <aside className="sp-mfa-migration-callout">
      <div>
        <span>Mandatory MFA migration</span>
        <h3>User-based Azure automation needs a workload identity</h3>
        <p>A synchronized Active Directory service account is still a Microsoft Entra user identity. Unattended scripts that depend on username/password Azure sign-in should move to managed identity, federation, or a service principal.</p>
      </div>
      <Link to="/service-principals/mfa-service-account-migration">
        Open migration guide <span aria-hidden="true">→</span>
      </Link>
    </aside>
  );
}

/**
 * Keeps the established reference hub intact while enhancing only selected
 * sections through portals. This wrapper can be folded into ServicePrincipals.jsx
 * during a future hub refactor.
 */
export default function ServicePrincipalsRoute() {
  const [guideTarget, setGuideTarget] = useState(null);
  const [authenticationTarget, setAuthenticationTarget] = useState(null);

  useEffect(() => {
    setGuideTarget(document.getElementById("related-guides"));
    setAuthenticationTarget(document.getElementById("authentication"));
  }, []);

  return (
    <>
      <ServicePrincipals />
      {guideTarget ? createPortal(<PublishedGuideMap />, guideTarget) : null}
      {authenticationTarget ? createPortal(<MandatoryMfaMigrationCallout />, authenticationTarget) : null}
    </>
  );
}
