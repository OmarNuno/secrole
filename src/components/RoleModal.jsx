import { useEffect } from "react";
import { RiskBadge, ProductBadge, CategoryBadge } from "./Badges";
import { ALL_ROLES } from "../data/roles";

export default function RoleModal({ role, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const related = (role.relatedRoles || [])
    .map(id => ALL_ROLES.find(r => r.id === id))
    .filter(Boolean);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)",
        backdropFilter: "blur(4px)", zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--bg)", borderRadius: 16,
          border: "1px solid var(--border)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          maxWidth: 640, width: "100%", maxHeight: "88vh", overflowY: "auto",
          animation: "fadeUp 0.2s ease",
        }}
      >
        {/* Header */}
        <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1, paddingRight: 16 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                <ProductBadge product={role.product} />
                <CategoryBadge category={role.category} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
                {role.name}
              </h2>
            </div>
            <button onClick={onClose} style={{
              background: "var(--bg-muted)", border: "1px solid var(--border)",
              borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center",
              justifyContent: "center", color: "var(--text-muted)", fontSize: 16, flexShrink: 0,
            }}>✕</button>
          </div>
        </div>

        {/* Risk banner */}
        <div style={{ padding: "14px 28px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
          <RiskBadge risk={role.risk} />
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {role.risk === "Critical" && "Treat as equivalent to Global Administrator. Strict controls required."}
            {role.risk === "High" && "Significant permissions. Assign with documented justification only."}
            {role.risk === "Medium" && "Moderate permissions. Scope carefully and review periodically."}
            {role.risk === "Low" && "Limited permissions. Generally safe for appropriate team members."}
          </span>
        </div>

        {/* Content */}
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
          <Section title="What this role does" content={role.description} />
          <Section title="Permissions granted" content={role.permissions} code />
          <Section title="⚡ Least Privilege Guidance" content={role.leastPrivilege} accent />

          {/* Tags */}
          <div>
            <div style={labelStyle}>Keywords</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {role.tags.map(t => (
                <span key={t} style={{
                  fontSize: 11, color: "var(--text-muted)",
                  background: "var(--bg-subtle)", border: "1px solid var(--border)",
                  borderRadius: 20, padding: "3px 10px",
                }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Related roles */}
          {related.length > 0 && (
            <div>
              <div style={labelStyle}>Often confused with</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {related.map(r => (
                  <div key={r.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", background: "var(--bg-subtle)",
                    border: "1px solid var(--border)", borderRadius: 8,
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>{r.category}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <ProductBadge product={r.product} size="sm" />
                      <RiskBadge risk={r.risk} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: 11, fontWeight: 600, color: "var(--text-faint)",
  textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8,
};

function Section({ title, content, code, accent }) {
  return (
    <div>
      <div style={{ ...labelStyle, color: accent ? "var(--purview)" : "var(--text-faint)" }}>{title}</div>
      <p style={{
        fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, margin: 0,
        background: code ? "var(--bg-subtle)" : "transparent",
        border: code ? "1px solid var(--border)" : "none",
        borderRadius: code ? 8 : 0,
        padding: code ? "10px 14px" : 0,
        fontFamily: code ? "'SF Mono', 'Fira Code', monospace" : "inherit",
        fontSize: code ? 13 : 14,
      }}>{content}</p>
    </div>
  );
}
