import { useMemo, useState } from "react";

const APP_ID = "7f3b9c21-4e8a-4d6f-bb2c-1a9e0d5c8f42";
const OBJECT_IDS = {
  application: "a13e6b40-…-9f2c",
  home: "c91d0f72-…-4ab8",
  contoso: "e44f5a18-…-2d7e",
  fabrikam: "0b27c9e3-…-1f6a",
};

function DirectoryObject({ kind, objectId, muted = false }) {
  return (
    <div className={`sp-model-object ${kind}${muted ? " is-muted" : ""}`}>
      <div className="sp-model-object-label">
        <span className="sp-model-dot" aria-hidden="true" />
        {kind === "application" ? "Application object" : "Service principal"}
      </div>
      <dl>
        <div>
          <dt>appId</dt>
          <dd className="is-shared">{APP_ID.slice(0, 13)}…</dd>
        </div>
        <div>
          <dt>objectId</dt>
          <dd>{objectId}</dd>
        </div>
      </dl>
    </div>
  );
}

function TenantCard({ name, role, home = false, application, servicePrincipal, emptyText }) {
  return (
    <article className={`sp-tenant-card${home ? " is-home" : ""}`}>
      <header>
        <div>
          <span className="sp-tenant-icon" aria-hidden="true">▦</span>
          <strong>{name}</strong>
        </div>
        <span>{role}</span>
      </header>
      <div className="sp-tenant-objects">
        {!application && !servicePrincipal && <p className="sp-model-empty">{emptyText}</p>}
        {application && <DirectoryObject kind="application" objectId={OBJECT_IDS.application} />}
        {application && servicePrincipal && <div className="sp-model-link" aria-hidden="true" />}
        {servicePrincipal && <DirectoryObject kind="service-principal" objectId={servicePrincipal} />}
      </div>
    </article>
  );
}

export default function ServicePrincipalModel() {
  const [mode, setMode] = useState("single");
  const [registered, setRegistered] = useState(false);
  const [contoso, setContoso] = useState(false);
  const [fabrikam, setFabrikam] = useState(false);

  const multiTenant = mode === "multi";
  const servicePrincipalCount = registered ? 1 + Number(contoso) + Number(fabrikam) : 0;

  const explanation = useMemo(() => {
    if (!registered) {
      return multiTenant
        ? "Register the multitenant app in its home tenant, then model consent in consumer tenants."
        : "Register an internal app to create the application definition and its local service principal.";
    }

    if (!multiTenant) {
      return "One internal app, two directory objects: the registration defines the app; the service principal is the identity that signs in and receives local access.";
    }

    if (contoso && fabrikam) {
      return "One application object now maps to three service principals. The appId is shared; every directory object keeps a different objectId.";
    }

    if (contoso || fabrikam) {
      return "Consent created another tenant-local service principal without creating another application object.";
    }

    return "The home tenant has both objects. Add a consumer tenant to see the one-to-many relationship.";
  }, [contoso, fabrikam, multiTenant, registered]);

  const reset = (nextMode = mode) => {
    setMode(nextMode);
    setRegistered(false);
    setContoso(false);
    setFabrikam(false);
  };

  return (
    <div className="sp-model">
      <div className="sp-model-toolbar">
        <div className="sp-segmented" role="tablist" aria-label="Application tenant model">
          <button
            type="button"
            role="tab"
            aria-selected={!multiTenant}
            className={!multiTenant ? "is-active" : ""}
            onClick={() => reset("single")}
          >
            Single tenant
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={multiTenant}
            className={multiTenant ? "is-active" : ""}
            onClick={() => reset("multi")}
          >
            Multitenant
          </button>
        </div>

        <div className="sp-model-actions">
          <button type="button" className="sp-action primary" disabled={registered} onClick={() => setRegistered(true)}>
            Register app
          </button>
          {multiTenant && (
            <>
              <button type="button" className="sp-action secondary" disabled={!registered || contoso} onClick={() => setContoso(true)}>
                Contoso consents
              </button>
              <button type="button" className="sp-action secondary" disabled={!registered || fabrikam} onClick={() => setFabrikam(true)}>
                Fabrikam consents
              </button>
            </>
          )}
          <button type="button" className="sp-action ghost" onClick={() => reset()}>
            Reset
          </button>
        </div>
      </div>

      <div className="sp-model-readout" aria-live="polite">
        <div><strong>1</strong><span>software app</span></div>
        <div><strong>{registered ? 1 : 0}</strong><span>application object</span></div>
        <div><strong>{servicePrincipalCount}</strong><span>service principal{servicePrincipalCount === 1 ? "" : "s"}</span></div>
        <p>{explanation}</p>
      </div>

      <div className={`sp-tenant-grid${multiTenant ? "" : " is-single"}`}>
        <TenantCard
          name="Adatum"
          role={multiTenant ? "Home tenant" : "Your tenant"}
          home
          application={registered}
          servicePrincipal={registered ? OBJECT_IDS.home : null}
          emptyText="Register the application to create the home objects."
        />
        {multiTenant && (
          <TenantCard
            name="Contoso"
            role="Consumer tenant"
            servicePrincipal={contoso ? OBJECT_IDS.contoso : null}
            emptyText="A local service principal appears after consent."
          />
        )}
        {multiTenant && (
          <TenantCard
            name="Fabrikam"
            role="Consumer tenant"
            servicePrincipal={fabrikam ? OBJECT_IDS.fabrikam : null}
            emptyText="A local service principal appears after consent."
          />
        )}
      </div>

      <p className="sp-model-footnote">
        Portal registration normally creates the home service principal with the application object. Creating only an <code>application</code> through Microsoft Graph is a separate operation from creating its <code>servicePrincipal</code>.
      </p>
    </div>
  );
}
