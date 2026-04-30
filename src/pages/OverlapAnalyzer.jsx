import { useState, useRef, useEffect } from "react";
import { ALL_ROLES } from "../data/roles";
import { RiskBadge, ProductBadge } from "../components/Badges";

function RoleSelector({ selected, onAdd, onRemove }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const suggestions = ALL_ROLES.filter(r =>
    !selected.find(s => s.id === r.id) &&
    (r.name.toLowerCase().includes(query.toLowerCase()) || r.category.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 8);

  return (
    <div>
      {/* Selected roles */}
      {selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {selected.map(r => (
            <div key={r.id} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "var(--bg-subtle)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "6px 10px 6px 12px",
            }}>
              <ProductBadge product={r.product} size="sm" />
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{r.name}</span>
              <RiskBadge risk={r.risk} size="sm" />
              <button onClick={() => onRemove(r.id)} style={{
                background: "none", border: "none", color: "var(--text-faint)",
                cursor: "pointer", fontSize: 14, lineHeight: 1, padding: "0 2px",
              }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Search input */}
      {selected.length < 6 && (
        <div ref={ref} style={{ position: "relative" }}>
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={selected.length === 0 ? "Start typing a role name (e.g. Global Admin, Compliance…)" : "Add another role…"}
            style={{
              width: "100%", background: "var(--bg)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--text)", outline: "none",
            }}
          />
          {open && query && suggestions.length > 0 && (
            <div style={{
              position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10,
              background: "var(--bg)", border: "1px solid var(--border)",
              borderRadius: 8, marginTop: 4,
              boxShadow: "var(--shadow-md)", maxHeight: 300, overflowY: "auto",
            }}>
              {suggestions.map(r => (
                <div key={r.id} onClick={() => { onAdd(r); setQuery(""); setOpen(false); }} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px", cursor: "pointer",
                  borderBottom: "1px solid var(--border)",
                  transition: "background 0.1s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg-subtle)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>{r.category}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <ProductBadge product={r.product} size="sm" />
                    <RiskBadge risk={r.risk} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AnalysisResult({ roles, result, loading }) {
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "48px 24px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: "50%",
              background: "var(--entra)",
              animation: "blink 1.2s infinite",
              animationDelay: `${i * 0.2}s`,
            }} />
          ))}
        </div>
        <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Analyzing role overlap and permissions…</div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>
      {/* Role risk summary */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${roles.length}, 1fr)`, gap: 12, marginBottom: 20 }}>
        {roles.map(r => (
          <div key={r.id} style={{
            background: "var(--bg-subtle)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "14px 16px",
          }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
              <ProductBadge product={r.product} size="sm" />
              <RiskBadge risk={r.risk} size="sm" />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{r.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 4 }}>{r.category}</div>
          </div>
        ))}
      </div>

      {/* AI Analysis */}
      <div style={{
        background: "var(--bg)", border: "1px solid var(--border)",
        borderRadius: 12, overflow: "hidden",
      }}>
        <div style={{
          padding: "14px 20px", borderBottom: "1px solid var(--border)",
          background: "var(--entra-bg)", display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 16 }}>🤖</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--entra)" }}>AI Overlap Analysis</span>
          <span style={{ fontSize: 11, color: "var(--text-faint)", marginLeft: "auto" }}>Powered by Claude</span>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <div style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{result}</div>
        </div>
      </div>
    </div>
  );
}

export default function OverlapAnalyzer() {
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const addRole = (role) => setSelectedRoles(prev => [...prev, role]);
  const removeRole = (id) => { setSelectedRoles(prev => prev.filter(r => r.id !== id)); setResult(null); };

  const analyze = async () => {
    if (selectedRoles.length < 2) return;
    setLoading(true);
    setResult(null);

    const roleDetails = selectedRoles.map(r =>
      `**${r.name}** (${r.product}, ${r.risk} Risk)\n- Category: ${r.category}\n- Permissions: ${r.permissions}\n- Tags: ${r.tags.join(", ")}`
    ).join("\n\n");

    const prompt = `An IT admin has received a request to add a user to these ${selectedRoles.length} Microsoft roles simultaneously:

${roleDetails}

Please provide a structured analysis covering:

1. **OVERLAP ANALYSIS**: Which permissions overlap between these roles? Which roles include capabilities already covered by another role in this list?

2. **REDUNDANT ROLES**: Are any of these roles completely unnecessary given the others? Explain why.

3. **RISK ASSESSMENT**: What is the combined risk of assigning all these roles together? Flag any dangerous combinations.

4. **RECOMMENDATION**: What is the minimum set of roles that would satisfy legitimate needs? What single role or smaller combination would work?

5. **PUSHBACK TEMPLATE**: Provide a 2-3 sentence response the admin can send back to the requester explaining why some roles are not needed.

Be direct and specific. Reference actual permission names where relevant.`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
    },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are a Microsoft identity and security expert specializing in least-privilege access control for Entra ID and Microsoft Purview. You help IT administrators push back on over-privileged access requests with clear, evidence-based analysis. Be concise, structured, and practical.",
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text).join("") || "Analysis unavailable.";
      setResult(text);
    } catch {
      setResult("Error connecting to AI. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.03em", marginBottom: 8 }}>
          Role Overlap Analyzer
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-muted)", maxWidth: 600 }}>
          Got a ticket requesting multiple roles? Paste them in and instantly identify redundant permissions, dangerous combinations, and the minimum roles actually needed.
        </p>
      </div>

      {/* How it works */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28,
      }}>
        {[
          { n: "1", title: "Add the requested roles", desc: "Search and add up to 6 roles from a ticket or access request" },
          { n: "2", title: "Run the analysis", desc: "AI maps permission overlaps and flags redundant or dangerous combinations" },
          { n: "3", title: "Get the pushback", desc: "Copy a ready-to-send response explaining which roles aren't needed" },
        ].map(s => (
          <div key={s.n} style={{
            background: "var(--bg-subtle)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "14px 16px",
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              background: "var(--entra)", color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, marginBottom: 8,
            }}>{s.n}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{s.title}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{s.desc}</div>
          </div>
        ))}
      </div>

      {/* Role selector */}
      <div style={{
        background: "var(--bg)", border: "1px solid var(--border)",
        borderRadius: 12, padding: "20px 24px", marginBottom: 20,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 14 }}>
          Roles to analyze {selectedRoles.length > 0 && <span style={{ color: "var(--text-faint)", fontWeight: 400 }}>({selectedRoles.length} selected)</span>}
        </div>
        <RoleSelector selected={selectedRoles} onAdd={addRole} onRemove={removeRole} />
      </div>

      {/* Analyze button */}
      {selectedRoles.length >= 2 && (
        <div style={{ marginBottom: 28, animation: "fadeUp 0.2s ease" }}>
          <button onClick={analyze} disabled={loading} style={{
            background: "var(--entra)", color: "white", border: "none",
            borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1, transition: "opacity 0.2s",
          }}>
            {loading ? "Analyzing…" : `Analyze ${selectedRoles.length} Roles →`}
          </button>
          {selectedRoles.length < 2 && (
            <span style={{ fontSize: 12, color: "var(--text-faint)", marginLeft: 12 }}>Add at least 2 roles to analyze</span>
          )}
        </div>
      )}

      {selectedRoles.length === 1 && (
        <div style={{ fontSize: 13, color: "var(--text-faint)", marginBottom: 28 }}>
          Add at least one more role to run the analysis.
        </div>
      )}

      {/* Results */}
      <AnalysisResult roles={selectedRoles} result={result} loading={loading} />
    </div>
  );
}
