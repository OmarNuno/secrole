import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { ENTRA_ROLES, PURVIEW_ROLES, ALL_ROLES } from "../data/roles";

export default function Nav() {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  // Derived from the role data so the nav badges update automatically
  // whenever roles are added (e.g. via the role-drift PR flow).
  const entraCount = ENTRA_ROLES.length;
  const purviewCount = PURVIEW_ROLES.length;
  const criticalCount = ALL_ROLES.filter((r) => r.risk === "Critical").length;

  const links = [
    { to: "/", label: "Role Library" },
    { to: "/analyzer", label: "Overlap Analyzer" },
    { to: "/advisor", label: "AI Advisor" },
    { to: "/service-principals", label: "Service Principals" },
    { to: "/updates", label: "Updates" },
  ];

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-stats { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-desktop { display: flex !important; }
          .nav-stats { display: flex !important; }
          .nav-hamburger { display: none !important; }
          .nav-drawer { display: none !important; }
          .nav-drawer-overlay { display: none !important; }
        }
        .nav-drawer {
          position: fixed;
          top: 0; right: 0; bottom: 0;
          width: 280px;
          background: var(--bg-elevated);
          border-left: 1px solid var(--border);
          z-index: 200;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow: -8px 0 24px rgba(0,0,0,0.15);
          transform: translateX(100%);
          transition: transform 0.25s ease;
        }
        .nav-drawer.open {
          transform: translateX(0);
        }
        .nav-drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 199;
          backdrop-filter: blur(2px);
        }
        .drawer-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 500;
          color: var(--text-muted);
          text-decoration: none;
          border: 1px solid transparent;
          transition: all 0.15s;
        }
        .drawer-link:hover {
          background: var(--bg-muted);
          color: var(--text);
        }
        .drawer-link.active {
          background: var(--entra-bg);
          border-color: var(--entra-border);
          color: var(--entra);
        }
      `}</style>

      <header style={{
        borderBottom: `1px solid var(--nav-border)`,
        background: "var(--nav-bg)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto", padding: "0 20px",
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

          {/* Desktop nav */}
          <nav className="nav-desktop" style={{ gap: 4 }}>
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

          {/* Desktop right side */}
          <div className="nav-stats" style={{ alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--text-faint)" }}>
              <span><b style={{ color: "var(--entra)" }}>{entraCount}</b> Entra</span>
              <span><b style={{ color: "var(--purview)" }}>{purviewCount}</b> Purview</span>
              <span><b style={{ color: "var(--critical)" }}>{criticalCount}</b> Critical</span>
            </div>
            <button className="theme-toggle" onClick={toggleTheme} title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>

          {/* Mobile right side — theme toggle + hamburger */}
          <div className="nav-hamburger" style={{ alignItems: "center", gap: 8 }}>
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button
              onClick={() => setMenuOpen(true)}
              style={{
                width: 36, height: 36, borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--bg-subtle)",
                color: "var(--text-muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: 18,
              }}
            >☰</button>
          </div>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {menuOpen && (
        <div className="nav-drawer-overlay" onClick={closeMenu} />
      )}

      {/* Mobile drawer */}
      <div className={`nav-drawer ${menuOpen ? "open" : ""}`}>
        {/* Drawer header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>SecRole</div>
          <button onClick={closeMenu} style={{
            background: "var(--bg-muted)", border: "1px solid var(--border)",
            borderRadius: 8, width: 32, height: 32, cursor: "pointer",
            color: "var(--text-muted)", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>

        {/* Drawer links */}
        {links.map(({ to, label, badge }) => {
          const active = pathname === to;
          return (
            <Link key={to} to={to} className={`drawer-link ${active ? "active" : ""}`} onClick={closeMenu}>
              {badge && (
                <span style={{
                  fontSize: 9, background: "#1a7f37", color: "white",
                  borderRadius: 4, padding: "2px 6px", fontWeight: 700,
                }}>NEW</span>
              )}
              {label}
            </Link>
          );
        })}

        {/* Stats at bottom */}
        <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", gap: 16, fontSize: 13, color: "var(--text-faint)" }}>
          <span><b style={{ color: "var(--entra)" }}>{entraCount}</b> Entra</span>
          <span><b style={{ color: "var(--purview)" }}>{purviewCount}</b> Purview</span>
          <span><b style={{ color: "var(--critical)" }}>{criticalCount}</b> Critical</span>
        </div>
      </div>
    </>
  );
}
