import { Link, useLocation } from "react-router-dom";

export default function Nav() {
  const { pathname } = useLocation();

  const links = [
    { to: "/", label: "Role Library" },
    { to: "/analyzer", label: "Overlap Analyzer" },
    { to: "/advisor", label: "AI Advisor" },
  ];

  return (
    <header style={{
      borderBottom: "1px solid var(--border)",
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(8px)",
      position: "sticky", top: 0, zIndex: 50,
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>

        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, var(--entra) 0%, var(--purview) 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, flexShrink: 0,
          }}>🛡️</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", letterSpacing: "-0.02em", lineHeight: 1 }}>SecRole</div>
            <div style={{ fontSize: 10, color: "var(--text-faint)", letterSpacing: "0.04em", textTransform: "uppercase", marginTop: 1 }}>Microsoft Role Intelligence</div>
          </div>
        </Link>

        {/* Nav links */}
        <nav style={{ display: "flex", gap: 4 }}>
          {links.map(({ to, label }) => {
            const active = pathname === to;
            return (
              <Link key={to} to={to} style={{
                padding: "6px 14px", borderRadius: 7, fontSize: 13, fontWeight: 500,
                color: active ? "var(--entra)" : "var(--text-muted)",
                background: active ? "var(--entra-bg)" : "transparent",
                border: `1px solid ${active ? "var(--entra-border)" : "transparent"}`,
                transition: "all 0.15s",
                textDecoration: "none",
              }}>{label}</Link>
            );
          })}
        </nav>

        {/* Stats */}
        <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-faint)" }}>
          <span><b style={{ color: "var(--entra)" }}>111</b> Entra</span>
          <span><b style={{ color: "var(--purview)" }}>40</b> Purview</span>
          <span><b style={{ color: "var(--critical)" }}>3</b> Critical</span>
        </div>
      </div>
    </header>
  );
}
