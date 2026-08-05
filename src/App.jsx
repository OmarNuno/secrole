import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Nav from "./components/Nav";
import RoleLibrary from "./pages/RoleLibrary";
import OverlapAnalyzer from "./pages/OverlapAnalyzer";
import AIAdvisor from "./pages/AIAdvisor";
import Updates from "./pages/Updates";
import ServicePrincipals from "./pages/ServicePrincipals";

export default function App() {
  // Initialize theme on first load
  useEffect(() => {
    const saved = localStorage.getItem("secrole-theme");
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", saved || preferred);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<RoleLibrary />} />
          <Route path="/analyzer" element={<OverlapAnalyzer />} />
          <Route path="/advisor" element={<AIAdvisor />} />
          <Route path="/updates" element={<Updates />} />
          <Route path="/service-principals" element={<ServicePrincipals />} />
        </Routes>
      </main>
    </div>
  );
}
