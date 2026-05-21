import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import RoleLibrary from "./pages/RoleLibrary";
import OverlapAnalyzer from "./pages/OverlapAnalyzer";
import AIAdvisor from "./pages/AIAdvisor";
import Updates from "./pages/Updates";

export default function App() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<RoleLibrary />} />
          <Route path="/analyzer" element={<OverlapAnalyzer />} />
          <Route path="/advisor" element={<AIAdvisor />} />
          <Route path="/updates" element={<Updates />} />
        </Routes>
      </main>
    </div>
  );
}
