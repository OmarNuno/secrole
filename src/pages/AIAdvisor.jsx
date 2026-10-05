import { useState, useRef, useEffect } from "react";

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
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
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
  const requestRef = useRef(null);

  useEffect(() => () => {
    requestRef.current?.abort();
    requestRef.current = null;
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const ask = async (question) => {
    const q = (question || input).trim();
    if (!q || q.length > 4000 || loading || requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setInput("");
    setMessages(m => [...m, { role: "user", text: q }]);
    setLoading(true);

    const conversation = [
      ...messages.filter(message => !message.error).map(message => ({ role: message.role, content: message.text.slice(0, message.role === "user" ? 4000 : 8000) })),
      { role: "user", content: q },
    ].slice(-19);
    while (conversation.length > 1 && (
      conversation.reduce((total, message) => total + message.content.length, 0) > 20000 ||
      new TextEncoder().encode(JSON.stringify(conversation)).length > 24000
    )) {
      conversation.shift();
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({ feature: "ai-advisor", messages: conversation }),
      });
      const data = await res.json();
      if (requestRef.current !== controller) return;
      if (!res.ok) {
        setMessages(m => [...m, { role: "assistant", error: true, text: typeof data.message === "string" ? data.message : "AI is temporarily unavailable. Please try again shortly." }]);
      } else if (typeof data.text === "string" && data.text.trim()) {
        setMessages(m => [...m, { role: "assistant", text: data.text }]);
      } else {
        setMessages(m => [...m, { role: "assistant", error: true, text: "AI returned an empty response. Please try again." }]);
      }
    } catch {
      if (requestRef.current === controller && !controller.signal.aborted) {
        setMessages(m => [...m, { role: "assistant", error: true, text: "Connection error. Please try again." }]);
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", height: "calc(100vh - 100px)" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.03em", marginBottom: 8 }}>
          AI Role Advisor
        </h1>
        <div style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 8 }}>Powered by OpenAI</div>
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
                <div role={m.error ? "alert" : undefined} dangerouslySetInnerHTML={{ __html: formatMessage(m.text) }} />
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
            maxLength={4000}
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
