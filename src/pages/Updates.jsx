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
          {update.title}
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

function EmptyState({ onRefresh, refreshing }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 24px" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📡</div>
      <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
        No updates loaded yet
      </h3>
      <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>
        Click the button below to fetch the latest Microsoft Entra and Purview updates from official sources.
      </p>
      <button onClick={onRefresh} disabled={refreshing} style={{
        background: "var(--entra)", color: "white", border: "none",
        borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 600,
        cursor: refreshing ? "not-allowed" : "pointer",
        opacity: refreshing ? 0.7 : 1,
      }}>
        {refreshing ? "Fetching updates…" : "Load Latest Updates"}
      </button>
    </div>
  );
}

export default function Updates() {
  const [updates, setUpdates] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stale, setStale] = useState(false);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [showRefreshInput, setShowRefreshInput] = useState(false);
  const [refreshSecret, setRefreshSecret] = useState("");

  useEffect(() => {
    fetchCached();
  }, []);

  const fetchCached = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/updates");
      const data = await res.json();
      if (data.updates?.length > 0) {
        setUpdates(data.updates);
        setLastUpdated(data.fetchedAt || data.lastUpdated);
        setStale(data.stale || false);
      }
    } catch (e) {
      setError("Failed to load updates.");
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    if (!refreshSecret.trim()) return;
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch("/api/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: refreshSecret }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Refresh failed. Check your secret key.");
      } else {
        setUpdates(data.updates || []);
        setLastUpdated(data.fetchedAt);
        setStale(false);
        setShowRefreshInput(false);
        setRefreshSecret("");
      }
    } catch (e) {
      setError("Connection error during refresh.");
    }
    setRefreshing(false);
  };

  const categories = ["All", ...Object.keys(CATEGORY_CONFIG)];
  const filtered = filterCategory === "All"
    ? updates
    : updates.filter(u => u.category === filterCategory);

  const highImpact = filtered.filter(u => u.importance === "high");
  const other = filtered.filter(u => u.importance !== "high");

  const formatDate = (iso) => {
    if (!iso) return null;
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
      });
    } catch { return iso; }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.03em", marginBottom: 8 }}>
            Entra & Purview Updates
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-muted)" }}>
            Latest role changes, feature announcements, and security advisories from Microsoft.
          </p>
          {lastUpdated && (
            <p style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 6 }}>
              {stale ? "⚠️ Cache may be outdated · " : "✓ "}
              Last refreshed: {formatDate(lastUpdated)}
            </p>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
          <button
            onClick={() => setShowRefreshInput(!showRefreshInput)}
            style={{
              background: "var(--bg-subtle)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "8px 16px", fontSize: 13,
              color: "var(--text-muted)", cursor: "pointer", fontWeight: 500,
            }}
          >
            🔄 Refresh Updates
          </button>

          {showRefreshInput && (
            <div style={{ display: "flex", gap: 8, animation: "fadeUp 0.2s ease" }}>
              <input
                type="password"
                value={refreshSecret}
                onChange={e => setRefreshSecret(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleRefresh()}
                placeholder="Enter refresh key…"
                style={{
                  background: "var(--bg)", border: "1px solid var(--border)",
                  borderRadius: 8, padding: "8px 12px", fontSize: 13,
                  color: "var(--text)", outline: "none", width: 180,
                }}
              />
              <button onClick={handleRefresh} disabled={refreshing || !refreshSecret.trim()} style={{
                background: "var(--entra)", color: "white", border: "none",
                borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600,
                cursor: "pointer", opacity: refreshing || !refreshSecret.trim() ? 0.5 : 1,
              }}>
                {refreshing ? "…" : "Go"}
              </button>
            </div>
          )}

          {error && (
            <p style={{ fontSize: 12, color: "var(--critical)", maxWidth: 260, textAlign: "right" }}>{error}</p>
          )}
        </div>
      </div>

      {/* Category filters */}
      {updates.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilterCategory(cat)} style={{
              padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500,
              background: filterCategory === cat ? "var(--text)" : "var(--bg)",
              color: filterCategory === cat ? "white" : "var(--text-muted)",
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
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: "50%", background: "var(--entra)",
                animation: "blink 1.2s infinite", animationDelay: `${i * 0.2}s`,
              }} />
            ))}
          </div>
          <p style={{ fontSize: 14, color: "var(--text-faint)" }}>Loading updates…</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && updates.length === 0 && (
        <EmptyState onRefresh={() => setShowRefreshInput(true)} refreshing={refreshing} />
      )}

      {/* High impact section */}
      {!loading && highImpact.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 3, height: 20, background: "var(--critical)", borderRadius: 2 }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--critical)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              High Impact
            </span>
            <span style={{ fontSize: 12, color: "var(--text-faint)", background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: 20, padding: "1px 8px" }}>
              {highImpact.length}
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {highImpact.map(u => <UpdateCard key={u.id} update={u} />)}
          </div>
        </div>
      )}

      {/* Other updates */}
      {!loading && other.length > 0 && (
        <div>
          {highImpact.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 3, height: 20, background: "var(--entra)", borderRadius: 2 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--entra)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Other Updates
              </span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {other.map(u => <UpdateCard key={u.id} update={u} />)}
          </div>
        </div>
      )}
    </div>
  );
}
