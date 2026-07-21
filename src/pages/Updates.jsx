import { useState, useEffect } from "react";

const CATEGORY_CONFIG = {
  "New Role":          { color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", icon: "✦" },
  "Permission Change": { color: "#dc2626", bg: "#fef2f2", border: "#fecaca", icon: "⚡" },
  "Feature Update":    { color: "#0078d4", bg: "#eff6ff", border: "#bfdbfe", icon: "🔄" },
  "Security Advisory": { color: "#ea580c", bg: "#fff7ed", border: "#fed7aa", icon: "⚠️" },
  "Roadmap":           { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", icon: "🗺️" },
};

const IMPORTANCE_CONFIG = {
  high:   { label: "High Impact", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  medium: { label: "Medium",      color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  low:    { label: "Low",         color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
};

const NEW_ROLE_COLOR = CATEGORY_CONFIG["New Role"].color;

function CategoryBadge({ category }) {
  const c = CATEGORY_CONFIG[category] || CATEGORY_CONFIG["Feature Update"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: c.bg, border: `1px solid ${c.border}`, color: c.color,
      borderRadius: 6, padding: "3px 9px", fontSize: 11, fontWeight: 600,
      letterSpacing: "0.04em", whiteSpace: "nowrap",
    }}>
      {c.icon} {category}
    </span>
  );
}

function ImportanceBadge({ importance }) {
  const c = IMPORTANCE_CONFIG[importance] || IMPORTANCE_CONFIG.medium;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: c.bg, border: `1px solid ${c.border}`, color: c.color,
      borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 600,
      textTransform: "uppercase", letterSpacing: "0.06em",
    }}>{c.label}</span>
  );
}

function UpdateCard({ update }) {
  return (
    <div style={{
      background: "var(--bg)", border: "1px solid var(--border)",
      borderRadius: 12, padding: "20px 24px",
      borderLeft: `3px solid ${CATEGORY_CONFIG[update.category]?.color || "var(--entra)"}`,
      transition: "box-shadow 0.15s",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "var(--shadow-md)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 12 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", lineHeight: 1.3, flex: 1 }}>
          {update.url ? (
            <a href={update.url} target="_blank" rel="noopener noreferrer"
               style={{ color: "inherit", textDecoration: "none" }}
               onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
               onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
              {update.title} ↗
            </a>
          ) : update.title}
        </h3>
        <ImportanceBadge importance={update.importance} />
      </div>

      <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, margin: "0 0 14px" }}>
        {update.summary}
      </p>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <CategoryBadge category={update.category} />
        <span style={{ fontSize: 11, color: "var(--text-faint)" }}>
          {update.source}
        </span>
        <span style={{ fontSize: 11, color: "var(--text-faint)", marginLeft: "auto" }}>
          {update.date}
        </span>
      </div>
    </div>
  );
}

// Section header used by New Roles / High Impact / Other Updates
function SectionHeader({ label, color, count }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <div style={{ width: 3, height: 20, background: color, borderRadius: 2 }} />
      <span style={{ fontSize: 12, fontWeight: 700, color, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {label}
      </span>
      {count != null && (
        <span style={{ fontSize: 12, color: "var(--text-faint)", background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: 20, padding: "1px 8px" }}>
          {count}
        </span>
      )}
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
    </div>
  );
}

export default function Updates() {
  const [updates, setUpdates] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");

  useEffect(() => {
    // Static file written daily by the GitHub Action — no API call, no cost, no auth.
    // Cache-bust so users don't get a stale CDN copy after the daily refresh.
    fetch(`/updates-cache.json?t=${Date.now()}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setUpdates(data.updates || []);
        setLastUpdated(data.fetchedAt || data.lastUpdated);
      })
      .catch(() => {
        setError("Updates couldn't be loaded right now. Try again in a few minutes.");
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...Object.keys(CATEGORY_CONFIG)];
  const filtered = filterCategory === "All"
    ? updates
    : updates.filter(u => u.category === filterCategory);

  // New Roles are pinned to the top of the "All" view in their own section.
  // While pinned, they're excluded from the High Impact / Other groupings below
  // so they never appear twice. Selecting the "New Role" filter shows them
  // through the normal filtered list instead.
  const showNewRolesSection = filterCategory === "All";
  const newRoles = showNewRolesSection
    ? filtered.filter(u => u.category === "New Role")
    : [];
  const rest = showNewRolesSection
    ? filtered.filter(u => u.category !== "New Role")
    : filtered;

  const highImpact = rest.filter(u => u.importance === "high");
  const other = rest.filter(u => u.importance !== "high");

  const formatDate = (iso) => {
    if (!iso) return null;
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
      });
    } catch { return iso; }
  };

  const formatDateShort = (iso) => {
    if (!iso) return null;
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric"
      });
    } catch { return iso; }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.03em", marginBottom: 8 }}>
          Entra &amp; Purview Updates
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-muted)" }}>
          Latest role changes, feature announcements, and security advisories from Microsoft.
          Refreshed daily.
        </p>
        {lastUpdated && (
          <p style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 6 }}>
            ✓ Last refreshed: {formatDate(lastUpdated)}
          </p>
        )}
      </div>

      {/* Category filters */}
      {updates.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilterCategory(cat)} style={{
              padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500,
              background: filterCategory === cat ? "var(--text)" : "var(--bg)",
              color: filterCategory === cat ? "var(--bg)" : "var(--text-muted)",
              border: `1px solid ${filterCategory === cat ? "var(--text)" : "var(--border)"}`,
              transition: "all 0.15s", cursor: "pointer",
            }}>{cat}</button>
          ))}
          <span style={{ fontSize: 12, color: "var(--text-faint)", marginLeft: "auto", alignSelf: "center" }}>
            {filtered.length} updates
          </span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 24px" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 12 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: "50%", background: "var(--entra)",
                animation: "blink 1.2s infinite", animationDelay: `${i * 0.2}s`,
              }} />
            ))}
          </div>
          <p style={{ fontSize: 14, color: "var(--text-faint)" }}>Loading updates…</p>
        </div>
      )}

      {/* Empty / error state — no button; the feed refreshes itself daily */}
      {!loading && updates.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📡</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
            {error ? "Updates unavailable" : "No updates yet"}
          </h3>
          <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 420, margin: "0 auto" }}>
            {error || "The feed refreshes automatically every morning. Check back soon for the latest Entra and Purview news."}
          </p>
        </div>
      )}

      {/* New Roles — pinned section, always first on the "All" view */}
      {!loading && updates.length > 0 && showNewRolesSection && (
        <div style={{ marginBottom: 32 }}>
          <SectionHeader
            label="✦ New Roles"
            color={NEW_ROLE_COLOR}
            count={newRoles.length > 0 ? newRoles.length : null}
          />
          {newRoles.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {newRoles.map(u => <UpdateCard key={u.id} update={u} />)}
            </div>
          ) : (
            <div style={{
              border: "1px dashed var(--border)", borderRadius: 12,
              padding: "20px 24px", display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ fontSize: 20, color: NEW_ROLE_COLOR }}>✦</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>
                  No new Entra or Purview roles announced
                </p>
                <p style={{ fontSize: 12, color: "var(--text-faint)", margin: "4px 0 0" }}>
                  Last checked {formatDateShort(lastUpdated) || "recently"} — new role announcements appear here first.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* High impact section */}
      {!loading && highImpact.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <SectionHeader label="High Impact" color="var(--critical)" count={highImpact.length} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {highImpact.map(u => <UpdateCard key={u.id} update={u} />)}
          </div>
        </div>
      )}

      {/* Other updates */}
      {!loading && other.length > 0 && (
        <div>
          {highImpact.length > 0 && (
            <SectionHeader label="Other Updates" color="var(--entra)" />
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {other.map(u => <UpdateCard key={u.id} update={u} />)}
          </div>
        </div>
      )}
    </div>
  );
}
