import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import RoleLibrary from "./pages/RoleLibrary";
import OverlapAnalyzer from "./pages/OverlapAnalyzer";
import AIAdvisor from "./pages/AIAdvisor";

export default function App() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<RoleLibrary />} />
          <Route path="/analyzer" element={<OverlapAnalyzer />} />
          <Route path="/advisor" element={<AIAdvisor />} />
        </Routes>
      </main>
    </div>
  );
}
