import { Link } from "react-router-dom";
import { getSitePage } from "../../data/sitePages";
import "./RoleGovernanceJourney.css";

const journeyStages = [
  {
    pageId: "role-governance",
    step: "01",
    label: "Foundation",
    title: "Explain effective access",
    description: "Start with the principal, role definition, scope, state, duration, controls, inheritance path, and evidence.",
  },
  {
    pageId: "role-governance-pim",
    step: "02",
    label: "Time",
    title: "Control when privilege activates",
    description: "Design eligibility, activation duration, authentication, approval, expiration, and auditable PIM evidence.",
  },
  {
    pageId: "role-governance-groups",
    step: "03",
    label: "Inheritance",
    title: "Control how privilege is inherited",
    description: "Govern role-assignable group ownership, membership, PIM for Groups, delegated control, and recovery.",
  },
  {
    pageId: "role-governance-custom-scope",
    step: "04",
    label: "Capability & scope",
    title: "Control what actions apply where",
    description: "Reduce custom-role permissions, narrow tenant or Administrative Unit scope, and prove denied outcomes.",
  },
];

export default function RoleGovernanceJourney({ currentPageId }) {
  return (
    <section className="rg-journey" aria-labelledby="rg-journey-heading">
      <header className="rg-journey-heading">
        <div>
          <span>Role Governance journey</span>
          <h2 id="rg-journey-heading">Four pages, one effective-access model</h2>
          <p>Start with the complete model, then move through time, inheritance, capability, and scope. Each page answers a different part of the same privileged-access decision.</p>
        </div>
        <strong>Model → Time → Inheritance → Scope</strong>
      </header>

      <ol className="rg-journey-grid">
        {journeyStages.map((stage) => {
          const page = getSitePage(stage.pageId);
          const isCurrent = stage.pageId === currentPageId;

          return (
            <li key={stage.pageId}>
              <Link
                className={isCurrent ? "is-current" : ""}
                to={page.path}
                aria-current={isCurrent ? "page" : undefined}
              >
                <div className="rg-journey-topline">
                  <span>{stage.step}</span>
                  <small>{isCurrent ? "You are here" : stage.label}</small>
                </div>
                <h3>{stage.title}</h3>
                <p>{stage.description}</p>
                <strong>{isCurrent ? "Current page" : "Open this step"} <span aria-hidden="true">→</span></strong>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
