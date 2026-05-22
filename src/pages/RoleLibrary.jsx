import { useState } from "react";
import { ENTRA_ROLES, PURVIEW_ROLES, CATEGORIES } from "../data/roles";
import { RiskBadge, ProductBadge, CategoryBadge } from "../components/Badges";
import RoleModal from "../components/RoleModal";

function RoleCard({ role, onClick }) {
  return (
    <div className="role-card" onClick={() => onClick(role)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", lineHeight: 1.3, flex: 1 }}>{role.name}</span>
        <RiskBadge risk={role.risk} size="sm" />
      </div>
      <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 12px", lineHeight: 1.55 }}>
        {role.description.length > 110 ? role.description.slice(0, 110) + "…" : role.description}
      </p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <ProductBadge product={role.product} size="sm" />
        <CategoryBadge category={role.category} />
      </div>
    </div>
  );
}

function SectionHeader({ label, color, count }) {
  return (
    <div className="section-header">
      <div style={{ width: 3, height: 20, background: color, borderRadius: 2, flexShrink: 0 }} />
      <span style={{ fontSize: 12, fontWeight: 700, color, letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{label}</span>
      <span style={{
        fontSize: 11, color: "var(--text-faint)",
        background: "var(--bg-muted)", border: "1px solid var(--border)",
        borderRadius: 20, padding: "1px 8px", whiteSpace: "nowrap",
      }}>{count} roles</span>
      <div className="section-divider" />
    </div>
  );
}

export default function RoleLibrary() {
  const [search, setSearch] = useState("");
  const [filterProduct, setFilterProduct] = useState("All");
  const [filterRisk, setFilterRisk] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [selectedRole, setSelectedRole] = useState(null);

  const filter = (roles) => roles.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags.some(t => t.includes(q)) || r.category.toLowerCase().includes(q);
    const matchRisk = filterRisk === "All" || r.risk === filterRisk;
    const matchCat = filterCategory === "All" || r.category === filterCategory;
    return matchSearch && matchRisk && matchCat;
  });

  const entraRoles = filter(ENTRA_ROLES);
  const purviewRoles = filter(PURVIEW_ROLES);
  const showEntra = filterProduct === "All" || filterProduct === "Entra";
  const showPurview = filterProduct === "All" || filterProduct === "Purview";
  const totalShown = (showEntra ? entraRoles.length : 0) + (showPurview ? purviewRoles.length : 0);

  return (
    <div className="page-container" style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>

      {/* Hero */}
      <div style={{ marginBottom: 28, animation: "fadeUp 0.4s ease" }}>
        <h1 className="page-title" style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.03em", marginBottom: 8 }}>
          Microsoft Role Intelligence
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-muted)", maxWidth: 600 }}>
          Security-focused reference for all Microsoft Entra ID and Microsoft Purview roles — with risk levels, permissions, and least-privilege guidance.
        </p>
      </div>

      {/* Search + Filters */}
      <div style={{
        background: "var(--bg-subtle)", border: "1px solid var(--border)",
        borderRadius: 12, padding: "16px 20px", marginBottom: 28,
      }}>
        <div className="filter-bar" style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <input
            className="search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍  Search roles, permissions, categories…"
          />

          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {["All","Entra","Purview"].map(v => (
              <button key={v} className={`filter-btn ${filterProduct === v ? "active" : ""}`}
                onClick={() => setFilterProduct(v)}>{v}</button>
            ))}
          </div>

          <div className="filter-divider" style={{ width: 1, height: 20, background: "var(--border)" }} />

          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {["All","Critical","High","Medium","Low"].map(v => (
              <button key={v} className={`filter-btn ${filterRisk === v ? "active" : ""}`}
                onClick={() => setFilterRisk(v)}>{v}</button>
            ))}
          </div>

          <div className="filter-divider" style={{ width: 1, height: 20, background: "var(--border)" }} />

          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-faint)" }}>
            {totalShown} roles
          </span>
        </div>
      </div>

      {/* Entra Section */}
      {showEntra && entraRoles.length > 0 && (
        <div style={{ marginBottom: 36, animation: "fadeUp 0.4s ease" }}>
          <SectionHeader label="Microsoft Entra ID" color="var(--entra)" count={entraRoles.length} />
          <div className="roles-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 12 }}>
            {entraRoles.map(r => <RoleCard key={r.id} role={r} onClick={setSelectedRole} />)}
          </div>
        </div>
      )}

      {/* Purview Section */}
      {showPurview && purviewRoles.length > 0 && (
        <div style={{ animation: "fadeUp 0.5s ease" }}>
          <SectionHeader label="Microsoft Purview" color="var(--purview)" count={purviewRoles.length} />
          <div className="roles-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 12 }}>
            {purviewRoles.map(r => <RoleCard key={r.id} role={r} onClick={setSelectedRole} />)}
          </div>
        </div>
      )}

      {totalShown === 0 && (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-faint)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>No roles match your filters</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Try adjusting your search or clearing the filters</div>
        </div>
      )}

      {selectedRole && <RoleModal role={selectedRole} onClose={() => setSelectedRole(null)} />}
    </div>
  );
}
