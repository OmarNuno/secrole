import { useState } from "react";

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

export function GuideCodeBlock({ title, code, language = "PowerShell" }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        fallbackCopy(code);
      }
    } catch {
      fallbackCopy(code);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <article className="kg-code-card">
      <header>
        <div><span>{language}</span><h3>{title}</h3></div>
        <button type="button" onClick={copyCode}>{copied ? "Copied" : "Copy"}</button>
      </header>
      <pre><code>{code}</code></pre>
    </article>
  );
}

export function GuideSection({ id, eyebrow, title, children, intro = "" }) {
  return (
    <section className="kg-section" id={id}>
      <header className="kg-section-heading">
        <div className="kg-section-kicker">{eyebrow}</div>
        <h2>{title}</h2>
        {intro && <p>{intro}</p>}
      </header>
      {children}
    </section>
  );
}

export function GuideCallout({ tone = "info", title, children }) {
  return <aside className={`kg-callout ${tone}`}><strong>{title}</strong><div>{children}</div></aside>;
}

export function GuideFaq({ items }) {
  return (
    <div className="kg-faq-list">
      {items.map((item) => (
        <details key={item.question}>
          <summary>{item.question}<span aria-hidden="true">+</span></summary>
          <div><p>{item.answer}</p></div>
        </details>
      ))}
    </div>
  );
}

export function GuideSourceList({ sources }) {
  return (
    <div className="kg-source-list">
      {sources.map((source) => (
        <a href={source.href} target="_blank" rel="noreferrer" key={source.href}>
          <div><strong>{source.title}</strong><span>{source.note}</span></div>
          <span aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  );
}
