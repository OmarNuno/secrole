export function RiskBadge({ risk, size = "md" }) {
  const configs = {
    Critical: { color: "var(--critical)", bg: "var(--critical-bg)", border: "var(--critical-border)" },
    High:     { color: "var(--high)",     bg: "var(--high-bg)",     border: "var(--high-border)" },
    Medium:   { color: "var(--medium)",   bg: "var(--medium-bg)",   border: "var(--medium-border)" },
    Low:      { color: "var(--low)",      bg: "var(--low-bg)",      border: "var(--low-border)" },
  };
  const c = configs[risk] || configs.Low;
  const sm = size === "sm";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: c.bg, border: `1px solid ${c.border}`, color: c.color,
      borderRadius: 6, padding: sm ? "2px 7px" : "3px 9px",
      fontSize: sm ? 10 : 11, fontWeight: 600, letterSpacing: "0.05em",
      textTransform: "uppercase", whiteSpace: "nowrap",
    }}>
      <span style={{ width: sm ? 5 : 6, height: sm ? 5 : 6, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
      {risk}
    </span>
  );
}

export function ProductBadge({ product, size = "md" }) {
  const configs = {
    Entra:   { color: "var(--entra)",   bg: "var(--entra-bg)",   border: "var(--entra-border)" },
    Purview: { color: "var(--purview)", bg: "var(--purview-bg)", border: "var(--purview-border)" },
  };
  const c = configs[product] || configs.Entra;
  const sm = size === "sm";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: c.bg, border: `1px solid ${c.border}`, color: c.color,
      borderRadius: 6, padding: sm ? "2px 7px" : "3px 9px",
      fontSize: sm ? 10 : 11, fontWeight: 700, letterSpacing: "0.06em",
      textTransform: "uppercase", whiteSpace: "nowrap",
    }}>{product}</span>
  );
}

export function CategoryBadge({ category }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: "var(--bg-muted)", border: "1px solid var(--border)",
      color: "var(--text-muted)", borderRadius: 6,
      padding: "3px 9px", fontSize: 11, whiteSpace: "nowrap",
    }}>{category}</span>
  );
}
