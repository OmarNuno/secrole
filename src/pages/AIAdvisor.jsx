import { useState, useRef, useEffect } from "react";
import { ALL_ROLES } from "../data/roles";

const SUGGESTIONS = [
  "Who should manage DLP policies with least privilege?",
  "What's the difference between Security Admin and Compliance Admin?",
  "Which role lets helpdesk reset MFA without being a full admin?",
  "What roles are needed for a new eDiscovery attorney?",
  "Is Global Admin needed to manage sensitivity labels?",
  "What's the safest role for someone who only needs to read audit logs?",
];

const formatMessage = (text) => {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
};

export default function AIAdvisor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const ask = async (question) => {
    const q = (question || input).trim();
    if (!q || loading) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text: q }]);
    setLoading(true);

    const rolesSummary = ALL_ROLES.map(r =>
      `${r.name} (${r.product}, ${r.risk} risk, ${r.category}): ${r.description}`
    ).join("\n");

    const system = `You are a senior Microsoft identity and security architect specializing in Entra ID and Microsoft Purview RBAC. You help IT admins and security teams understand which roles to assign following the principle of least privilege.

Complete role reference:
${rolesSummary}

Guidelines for responses:
- Always lead with the specific role recommendation
- Explain WHY it's the right role (what it does that matches the need)
- Call out if the request implies a higher-risk role than necessary
- Warn explicitly if a suggested role is High or Critical risk
- Keep responses under 150 words — be direct and practical
- Use role names exactly as they appear in the reference above`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1000,
          system,
          messages: [
            ...messages.map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.text })),
            { role: "user", content: q }
          ],
        }),
      });
      const data = await res.json();
      const reply = data.content?.map(b => b.text).join("") || "Unable to respond.";
      setMessages(m => [...m, { role: "assistant", text: reply }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", text: "Connection error. Please try again." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", height: "calc(100vh - 100px)" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.03em", marginBottom: 8 }}>
          AI Role Advisor
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-muted)" }}>
          Describe your scenario and get least-privilege role recommendations for Entra ID and Purview — instantly.
        </p>
      </div>

      {/* Chat area */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        background: "var(--bg)", border: "1px solid var(--border)",
        borderRadius: 12, overflow: "hidden", minHeight: 0,
      }}>

        <div ref={chatRef} style={{
          flex: 1, overflowY: "auto", padding: "20px",
          display: "flex", flexDirection: "column", gap: 16,
        }}>
          {messages.length === 0 && (
            <div style={{ paddingTop: 20 }}>
              <div style={{ fontSize: 13, color: "var(--text-faint)", marginBottom: 14, textAlign: "center" }}>
                Try one of these common questions:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => ask(s)} style={{
                    background: "var(--bg-subtle)", border: "1px solid var(--border)",
                    borderRadius: 8, padding: "10px 14px", color: "var(--text-muted)",
                    fontSize: 13, cursor: "pointer", textAlign: "left",
                    transition: "border-color 0.15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "var(--entra-border)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "80%",
              background: m.role === "user" ? "var(--entra)" : "var(--bg-subtle)",
              border: `1px solid ${m.role === "user" ? "var(--entra)" : "var(--border)"}`,
              borderRadius: m.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
              padding: "12px 16px",
              fontSize: 14,
              lineHeight: 1.75,
              color: m.role === "user" ? "white" : "var(--text)",
            }}>
              {m.role === "user" ? (
                m.text
              ) : (
                <div dangerouslySetInnerHTML={{ __html: formatMessage(m.text) }} />
              )}
            </div>
          ))}

          {loading && (
            <div style={{
              alignSelf: "flex-start",
              background: "var(--bg-subtle)", border: "1px solid var(--border)",
              borderRadius: "12px 12px 12px 3px", padding: "14px 18px",
              display: "flex", gap: 5,
            }}>
              {[0,1,2].map(i => (
                <span key={i} style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: "var(--entra)", display: "inline-block",
                  animation: "blink 1.2s infinite",
                  animationDelay: `${i * 0.2}s`,
                }} />
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{
          borderTop: "1px solid var(--border)", padding: "14px 16px",
          display: "flex", gap: 10, background: "var(--bg-subtle)",
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && ask()}
            placeholder="e.g. What role should I assign for managing DLP policies?"
            style={{
              flex: 1, background: "var(--bg)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "10px 14px", fontSize: 13,
              color: "var(--text)", outline: "none",
            }}
          />
          <button onClick={() => ask()} disabled={!input.trim() || loading} style={{
            background: "var(--entra)", color: "white", border: "none",
            borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600,
            cursor: "pointer", opacity: !input.trim() || loading ? 0.4 : 1,
            transition: "opacity 0.2s",
          }}>Ask</button>
        </div>
      </div>
    </div>
  );
}
