import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Nav from "./components/Nav";
import RouteMeta from "./components/RouteMeta";
import RoleLibrary from "./pages/RoleLibrary";
import OverlapAnalyzer from "./pages/OverlapAnalyzer";
import AIAdvisor from "./pages/AIAdvisor";
import Updates from "./pages/Updates";
import Knowledge from "./pages/Knowledge";
import ServicePrincipalsRoute from "./pages/service-principals/ServicePrincipalsRoute";
import IdentifiersGuide from "./pages/service-principals/IdentifiersGuide";
import PermissionsConsentGuide from "./pages/service-principals/PermissionsConsentGuide";
import TroubleshootingGuide from "./pages/service-principals/TroubleshootingGuide";
import SecurityReviewGuide from "./pages/service-principals/SecurityReviewGuide";
import MfaServiceAccountMigrationGuide from "./pages/service-principals/MfaServiceAccountMigrationGuide";
import ManagedIdentitiesGuide from "./pages/service-principals/ManagedIdentitiesGuide";

export default function App() {
  // Initialize theme on first load
  useEffect(() => {
    const saved = localStorage.getItem("secrole-theme");
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", saved || preferred);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <RouteMeta />
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<RoleLibrary />} />
          <Route path="/analyzer" element={<OverlapAnalyzer />} />
          <Route path="/advisor" element={<AIAdvisor />} />
          <Route path="/updates" element={<Updates />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/service-principals" element={<ServicePrincipalsRoute />} />
          <Route path="/service-principals/identifiers" element={<IdentifiersGuide />} />
          <Route path="/service-principals/permissions-and-consent" element={<PermissionsConsentGuide />} />
          <Route path="/service-principals/troubleshooting" element={<TroubleshootingGuide />} />
          <Route path="/service-principals/security-review" element={<SecurityReviewGuide />} />
          <Route path="/service-principals/mfa-service-account-migration" element={<MfaServiceAccountMigrationGuide />} />
          <Route path="/service-principals/managed-identities" element={<ManagedIdentitiesGuide />} />
        </Routes>
      </main>
    </div>
  );
}
