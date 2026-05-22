import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";

export default function Nav() {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();

  const links = [
    { to: "/", label: "Role Library" },
    { to: "/analyzer", label: "Overlap Analyzer" },
    { to: "/advisor", label: "AI Advisor" },
    { to: "/updates", label: "Updates", badge: "NEW" },
  ];

  return (
    <header style={{
      borderBottom: `1px solid var(--nav-border)`,
      background: "var(--nav-bg)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      position: "sticky", top: 0, zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between", height: 60,
      }}>

        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, var(--entra) 0%, var(--purview) 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, flexShrink: 0, boxShadow: "0 2px 8px rgba(56,139,253,0.3)",
          }}>🛡️</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", letterSpacing: "-0.02em", lineHeight: 1 }}>
              SecRole
            </div>
            <div style={{ fontSize: 10, color: "var(--text-faint)", letterSpacing: "0.04em", textTransform: "uppercase", marginTop: 2 }}>
              Microsoft Role Intelligence
            </div>
          </div>
        </Link>

        {/* Nav links */}
        <nav style={{ display: "flex", gap: 4 }}>
          {links.map(({ to, label, badge }) => {
            const active = pathname === to;
            return (
              <Link key={to} to={to} className={`nav-link ${active ? "active" : ""}`}>
                {badge && (
                  <span style={{
                    fontSize: 9, background: "#1a7f37", color: "white",
                    borderRadius: 4, padding: "1px 5px", fontWeight: 700,
                    letterSpacing: "0.05em",
                  }}>{badge}</span>
                )}
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right side — stats + theme toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--text-faint)" }}>
            <span><b style={{ color: "var(--entra)" }}>111</b> Entra</span>
            <span><b style={{ color: "var(--purview)" }}>40</b> Purview</span>
            <span><b style={{ color: "var(--critical)" }}>3</b> Critical</span>
          </div>
          <button className="theme-toggle" onClick={toggleTheme} title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </header>
  );
}
