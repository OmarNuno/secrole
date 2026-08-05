import React, { useState, useMemo } from "react";
import { RiskBadge } from "../components/Badges";

/*
 * SecRole — src/pages/ServicePrincipals.jsx
 * Interactive teaching page: application objects vs. service principals (Microsoft Entra ID).
 *
 * Integration:
 *  - Nav-less: the shared <Nav/> from App.jsx wraps every route, so this renders body-only.
 *  - Inherits global theme tokens from index.css (light/dark via [data-theme]); all colors
 *    route through var(--entra), var(--purview), var(--critical), etc. — no hardcoded palette.
 *  - Application object = --entra (blue); service principal = --purview (indigo).
 *  - Risk chips reuse the shared <RiskBadge/> component for consistency.
 *
 * Wire-up (see App.jsx + Nav.jsx edits): route "/service-principals".
 */

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

.sp-root {
  /* Inherits secrole.com's global tokens (index.css) so it tracks the active
     light/dark theme automatically. Fallbacks are the site's dark values, so the
     component still renders correctly on its own (e.g. in an artifact preview). */

  /* surfaces */
  --sp-bg: var(--bg, #0d1117);
  --sp-nav: var(--nav-bg, rgba(13,17,23,0.92));
  --sp-nav-bd: var(--nav-border, rgba(255,255,255,0.08));
  --sp-surface: var(--bg-elevated, #1c2128);
  --sp-surface-2: var(--bg-muted, #1c2128);
  --sp-border: var(--border, #30363d);
  --sp-border-soft: var(--border, #30363d);
  --sp-border-strong: var(--border-strong, #484f58);
  --sp-text: var(--text, #e6edf3);
  --sp-muted: var(--text-muted, #8d96a0);
  --sp-faint: var(--text-faint, #6e7681);

  /* entities — application object = Entra blue, service principal = Purview indigo */
  --sp-app: var(--entra, #388bfd);
  --sp-app-dim: var(--entra-bg, #0d1f33);
  --sp-app-bd: var(--entra-border, #1a3a5c);
  --sp-sp: var(--purview, #818cf8);
  --sp-sp-dim: var(--purview-bg, #12103a);
  --sp-sp-bd: var(--purview-border, #2a2660);

  /* semantic — secrole risk tokens */
  --sp-low: var(--low, #3fb950);
  --sp-low-dim: var(--low-bg, #0a2a10);
  --sp-low-bd: var(--low-border, #1a5a25);
  --sp-high: var(--high, #ffa657);
  --sp-high-dim: var(--high-bg, #2a1500);
  --sp-high-bd: var(--high-border, #5a3000);
  --sp-crit: var(--critical, #ff7b72);
  --sp-crit-dim: var(--critical-bg, #2a0e0b);
  --sp-crit-bd: var(--critical-border, #5a1a15);

  --sp-rad: var(--radius, 8px);
  --sp-rad-lg: var(--radius-lg, 12px);
  --sp-rad-xl: var(--radius-xl, 16px);

  --sp-sans: 'Inter', -apple-system, BlinkMacSystemFont, ui-sans-serif, system-ui, sans-serif;
  --sp-mono: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;

  background: var(--sp-bg);
  color: var(--sp-text);
  font-family: var(--sp-sans);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  font-size: 16px;
}
.sp-root * { box-sizing: border-box; }
.sp-root ::selection { background: var(--sp-app); color: #07111f; }

.sp-wrap { width: 100%; }
.sp-page { max-width: 1200px; margin: 0 auto; padding: 28px 24px 56px; }


/* ---- hero ---- */
.sp-hero { padding: 4px 0 20px; }
.sp-crumb { font-size: 12.5px; color: var(--sp-faint); margin-bottom: 18px; }
.sp-crumb b { color: var(--sp-app); font-weight: 600; }
.sp-h1 { font-weight: 700; letter-spacing: -0.03em; font-size: clamp(26px, 4vw, 34px); line-height: 1.1; margin: 0 0 12px; }
.sp-lede { font-size: clamp(15.5px, 2.1vw, 18px); color: var(--sp-muted); max-width: 600px; margin: 0; }

/* ---- the one idea ---- */
.sp-dual { display: grid; grid-template-columns: 1fr auto 1fr; gap: 0; margin: 40px 0 8px; align-items: stretch; }
@media (max-width: 720px){ .sp-dual { grid-template-columns: 1fr; } }
.sp-idea { border: 1px solid var(--sp-border); background: var(--sp-surface); padding: 22px; border-radius: 12px; position: relative; overflow: hidden; }
.sp-idea.app { border-color: var(--sp-app-bd); }
.sp-idea.sp { border-color: var(--sp-sp-bd); }
.sp-idea::before { content:""; position:absolute; inset:0 0 auto 0; height:2px; }
.sp-idea.app::before { background: linear-gradient(90deg, var(--sp-app), transparent); }
.sp-idea.sp::before { background: linear-gradient(90deg, var(--sp-sp), transparent); }
.sp-idea-tag { font-weight: 700; font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; }
.sp-idea.app .sp-idea-tag { color: var(--sp-app); }
.sp-idea.sp .sp-idea-tag { color: var(--sp-sp); }
.sp-idea h3 { font-weight: 700; font-size: 21px; margin: 9px 0 8px; letter-spacing: -0.01em; }
.sp-idea p { margin: 0; color: var(--sp-muted); font-size: 14px; }
.sp-idea .sp-pill { display:inline-block; margin-top:14px; font-family: var(--sp-mono); font-size: 11.5px; padding: 3px 9px; border-radius: 999px; }
.sp-idea.app .sp-pill { background: var(--sp-app-dim); color: var(--sp-app); }
.sp-idea.sp .sp-pill { background: var(--sp-sp-dim); color: var(--sp-sp); }
.sp-arrow { display:flex; align-items:center; justify-content:center; padding: 0 16px; color: var(--sp-faint); font-size: 13px; font-weight: 500; }
@media (max-width: 720px){ .sp-arrow { padding: 8px 0; transform: rotate(90deg); } }

/* ---- section header (secrole pattern) ---- */
.sp-section { padding: 52px 0; border-top: 1px solid var(--sp-border-soft); }
.sp-section:first-of-type { border-top: none; }
.sp-shead { display: flex; align-items: center; gap: 11px; margin-bottom: 18px; }
.sp-sbar { width: 3px; height: 16px; border-radius: 2px; background: var(--sp-app); }
.sp-slabel { font-weight: 700; font-size: 12.5px; letter-spacing: .12em; text-transform: uppercase; color: var(--sp-app); }
.sp-schip { font-size: 11px; color: var(--sp-muted); background: var(--sp-surface-2); border: 1px solid var(--sp-border); padding: 2px 9px; border-radius: 999px; }
.sp-sline { flex: 1; height: 1px; background: var(--sp-border-soft); }
.sp-h2 { font-weight: 700; letter-spacing: -0.02em; font-size: clamp(23px, 3.4vw, 30px); margin: 0 0 10px; }
.sp-sub { color: var(--sp-muted); max-width: 640px; margin: 0 0 26px; font-size: 15px; }

/* ---- badges + tags ---- */
.sp-tag { font-weight:700; font-size:10px; letter-spacing:.06em; text-transform:uppercase; color:var(--sp-app); background:var(--sp-app-dim); border:1px solid var(--sp-app-bd); padding:3px 8px; border-radius:6px; }

/* ---- simulator ---- */
.sp-sim { border: 1px solid var(--sp-border); background: var(--sp-surface); border-radius: var(--sp-rad-lg); padding: 20px; }
.sp-sim-controls { display: flex; flex-wrap: wrap; gap: 9px; }
.sp-btn { font-family: var(--sp-sans); font-size: 13px; font-weight: 500; cursor: pointer; border-radius: 8px; padding: 9px 13px; border: 1px solid var(--sp-border); background: var(--sp-surface-2); color: var(--sp-text); transition: border-color .15s, background .15s, transform .05s, opacity .15s; display: inline-flex; align-items: center; gap: 7px; }
.sp-btn:hover:not(:disabled) { border-color: var(--sp-faint); }
.sp-btn:active:not(:disabled) { transform: translateY(1px); }
.sp-btn:disabled { opacity: .36; cursor: not-allowed; }
.sp-btn.primary { border-color: var(--sp-app-bd); color: var(--sp-app); background: var(--sp-app-dim); }
.sp-btn.go { border-color: var(--sp-sp-bd); color: var(--sp-sp); background: var(--sp-sp-dim); }
.sp-btn.warn { border-color: var(--sp-crit-bd); color: var(--sp-crit); background: var(--sp-crit-dim); }
.sp-btn.ghost { background: transparent; color: var(--sp-muted); }
.sp-btn svg { width: 14px; height: 14px; }

.sp-readout { display: flex; flex-wrap: wrap; gap: 22px; align-items: center; margin: 16px 0 18px; padding: 13px 16px; border-radius: 10px; background: var(--sp-bg); border: 1px solid var(--sp-border-soft); }
.sp-stat { display: flex; align-items: baseline; gap: 9px; }
.sp-stat-num { font-weight: 800; font-size: 27px; line-height: 1; letter-spacing: -0.02em; }
.sp-stat-num.app { color: var(--sp-app); } .sp-stat-num.sp { color: var(--sp-sp); }
.sp-stat-lbl { font-size: 12px; color: var(--sp-muted); }
.sp-readout-note { font-size: 13px; color: var(--sp-muted); margin-left: auto; max-width: 440px; }
@media (max-width: 720px){ .sp-readout-note { margin-left: 0; flex-basis: 100%; } }

.sp-tenants { display: grid; grid-template-columns: repeat(3, 1fr); gap: 13px; }
@media (max-width: 760px){ .sp-tenants { grid-template-columns: 1fr; } }
.sp-tenant { border: 1px solid var(--sp-border); border-radius: 12px; padding: 15px; background: var(--sp-bg); min-height: 228px; transition: border-color .2s; }
.sp-tenant.home { border-color: var(--sp-app-bd); }
.sp-tenant-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.sp-tenant-name { font-weight: 600; font-size: 14.5px; display:flex; align-items:center; gap:8px; }
.sp-tenant-role { font-weight: 700; font-size: 9.5px; letter-spacing: .08em; text-transform: uppercase; color: var(--sp-faint); }
.sp-tenant-role.home { color: var(--sp-app); }

.sp-obj { border-radius: 9px; padding: 12px; margin-top: 10px; border: 1px solid var(--sp-border); background: var(--sp-surface); animation: sp-pop .3s ease; }
.sp-obj.app { border-left: 2px solid var(--sp-app); }
.sp-obj.sp { border-left: 2px solid var(--sp-sp); }
.sp-obj.orphan { opacity: .42; filter: grayscale(.5); }
.sp-obj-top { display: flex; align-items: center; gap: 8px; }
.sp-obj-kind { font-weight: 700; font-size: 10.5px; letter-spacing: .05em; text-transform: uppercase; }
.sp-obj.app .sp-obj-kind { color: var(--sp-app); }
.sp-obj.sp .sp-obj-kind { color: var(--sp-sp); }
.sp-obj-id { font-family: var(--sp-mono); font-size: 11px; color: var(--sp-muted); margin-top: 9px; line-height: 1.75; }
.sp-obj-id b { color: var(--sp-faint); font-weight: 400; }
.sp-obj-id .shared { color: var(--sp-app); }
.sp-empty { color: var(--sp-faint); font-size: 12.5px; text-align: center; padding: 26px 8px; font-family: var(--sp-mono); }
.sp-connector { height: 13px; border-left: 1.5px dashed var(--sp-sp-bd); margin: 0 0 -4px 15px; animation: sp-grow .3s ease; }
@keyframes sp-pop { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes sp-grow { from { opacity: 0; } to { opacity: 1; } }
.sp-flash { font-size: 13px; color: var(--sp-high); margin-top: 14px; min-height: 20px; }

/* ---- comparison ---- */
.sp-cmp { border: 1px solid var(--sp-border); border-radius: 12px; overflow: hidden; }
.sp-cmp-row { display: grid; grid-template-columns: 160px 1fr 1fr; border-top: 1px solid var(--sp-border-soft); }
.sp-cmp-row:first-child { border-top: none; }
.sp-cmp-row > div { padding: 13px 16px; font-size: 14px; }
.sp-cmp-axis { color: var(--sp-faint); font-weight: 600; font-size: 11px; letter-spacing: .04em; text-transform: uppercase; background: var(--sp-bg); display:flex; align-items:center; }
.sp-cmp-app { background: var(--sp-app-dim); border-left: 2px solid var(--sp-app); }
.sp-cmp-sp { background: var(--sp-sp-dim); border-left: 2px solid var(--sp-sp); }
.sp-cmp-head { font-weight: 700; font-size: 14.5px; }
.sp-cmp-head.app { color: var(--sp-app); } .sp-cmp-head.sp { color: var(--sp-sp); }
.sp-mono-inline { font-family: var(--sp-mono); font-size: 12.5px; color: var(--sp-muted); }
@media (max-width: 720px){ .sp-cmp-row { grid-template-columns: 1fr 1fr; } .sp-cmp-axis { grid-column: 1 / -1; border-bottom: 1px solid var(--sp-border-soft); } }

/* ---- type tabs ---- */
.sp-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.sp-tab { cursor: pointer; border: 1px solid var(--sp-border); background: var(--sp-surface); border-radius: 9px; padding: 10px 15px; color: var(--sp-muted); font-family: var(--sp-sans); font-size: 13.5px; font-weight: 500; transition: all .15s; display:flex; align-items:center; gap:8px; }
.sp-tab:hover { color: var(--sp-text); }
.sp-tab.active { color: var(--sp-app); border-color: var(--sp-app-bd); background: var(--sp-app-dim); }
.sp-tab svg { width: 15px; height: 15px; }
.sp-tabpanel { border: 1px solid var(--sp-border); border-radius: 12px; padding: 22px; background: var(--sp-surface); }
.sp-tabpanel h3 { font-weight: 700; margin: 0 0 6px; font-size: 18px; display:flex; align-items:center; gap:10px; }
.sp-tp-sub { color: var(--sp-muted); margin: 0 0 18px; font-size: 14px; }
.sp-facts { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: var(--sp-border-soft); border-radius: 9px; overflow: hidden; }
@media (max-width: 560px){ .sp-facts { grid-template-columns: 1fr; } }
.sp-fact { background: var(--sp-bg); padding: 12px 15px; }
.sp-fact .k { font-weight: 600; font-size: 10.5px; text-transform: uppercase; letter-spacing: .05em; color: var(--sp-faint); margin-bottom: 4px; }
.sp-fact .v { font-size: 13.5px; }
.sp-yes { color: var(--sp-low); font-weight: 600; } .sp-no { color: var(--sp-crit); font-weight: 600; }

/* ---- field notes ---- */
.sp-notes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 13px; }
@media (max-width: 760px){ .sp-notes { grid-template-columns: 1fr; } }
.sp-note { border: 1px solid var(--sp-border); border-radius: 12px; padding: 17px; background: var(--sp-surface); }
.sp-note-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.sp-note-ic { width: 32px; height: 32px; border-radius: 8px; display:flex; align-items:center; justify-content:center; }
.sp-note-ic.high { background: var(--sp-high-dim); color: var(--sp-high); border:1px solid var(--sp-high-bd); }
.sp-note-ic.crit { background: var(--sp-crit-dim); color: var(--sp-crit); border:1px solid var(--sp-crit-bd); }
.sp-note-ic.app { background: var(--sp-app-dim); color: var(--sp-app); border:1px solid var(--sp-app-bd); }
.sp-note-ic svg { width: 16px; height: 16px; }
.sp-note h4 { font-weight: 700; font-size: 15.5px; margin: 0 0 6px; }
.sp-note p { color: var(--sp-muted); font-size: 13px; margin: 0 0 10px; }
.sp-note .fix { font-size: 12.5px; color: var(--sp-text); border-top: 1px solid var(--sp-border-soft); padding-top: 10px; }
.sp-note .fix b { color: var(--sp-app); font-weight: 600; }

/* ---- code ---- */
.sp-code { border: 1px solid var(--sp-border); border-radius: 10px; overflow: hidden; margin-bottom: 11px; background: var(--sp-bg); }
.sp-code-hd { display:flex; align-items:center; justify-content:space-between; padding: 9px 14px; border-bottom: 1px solid var(--sp-border-soft); }
.sp-code-lbl { font-size: 12px; color: var(--sp-muted); }
.sp-code pre { margin: 0; padding: 14px; overflow-x: auto; }
.sp-code code { font-family: var(--sp-mono); font-size: 12.5px; color: var(--sp-text); white-space: pre; }
.sp-copy { cursor: pointer; background: transparent; border: 1px solid var(--sp-border); color: var(--sp-muted); border-radius: 7px; padding: 4px 10px; font-size: 12px; font-family: var(--sp-sans); display:inline-flex; align-items:center; gap:6px; transition: all .15s; }
.sp-copy:hover { color: var(--sp-text); border-color: var(--sp-faint); }
.sp-copy.done { color: var(--sp-low); border-color: var(--sp-low); }
.sp-copy svg { width: 13px; height: 13px; }

/* ---- quiz ---- */
.sp-quiz { display: grid; gap: 13px; }
.sp-q { border: 1px solid var(--sp-border); border-radius: 12px; padding: 18px; background: var(--sp-surface); }
.sp-q-stem { font-weight: 600; margin: 0 0 14px; font-size: 15px; }
.sp-q-opts { display: grid; gap: 8px; }
.sp-opt { text-align: left; cursor: pointer; border: 1px solid var(--sp-border); background: var(--sp-bg); color: var(--sp-text); border-radius: 8px; padding: 11px 14px; font-family: var(--sp-sans); font-size: 14px; transition: all .15s; display:flex; align-items:center; gap:10px; }
.sp-opt:hover:not(:disabled) { border-color: var(--sp-faint); }
.sp-opt:disabled { cursor: default; }
.sp-opt.correct { border-color: var(--sp-low); background: var(--sp-low-dim); color: var(--sp-low); }
.sp-opt.wrong { border-color: var(--sp-crit); background: var(--sp-crit-dim); color: var(--sp-crit); }
.sp-opt-mark { width: 17px; height: 17px; flex-shrink: 0; }
.sp-explain { margin-top: 12px; font-size: 13px; color: var(--sp-muted); border-top: 1px solid var(--sp-border-soft); padding-top: 12px; }
.sp-explain b { color: var(--sp-text); }

.sp-foot { border-top: 1px solid var(--sp-border-soft); padding: 28px 0 48px; color: var(--sp-faint); font-size: 12.5px; }

@media (prefers-reduced-motion: reduce){ .sp-root * { animation: none !important; transition: none !important; } }
.sp-root a:focus-visible, .sp-root button:focus-visible { outline: 2px solid var(--sp-app); outline-offset: 2px; border-radius: 7px; }
`;

/* ----------------- inline icons ----------------- */
const I = {
  shield: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 13c0 5-3.5 7.5-7.7 8.9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1 1 0 0 1 1.5 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1Z"/></svg>),
  layers: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></svg>),
  box: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>),
  building: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4M9 6h.01M15 6h.01M9 10h.01M15 10h.01M9 14h.01M15 14h.01"/></svg>),
  chip: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2M9 2v2M15 20v2M9 20v2M2 15h2M2 9h2M20 15h2M20 9h2"/></svg>),
  history: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/></svg>),
  key: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/></svg>),
  trash: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>),
  reset: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>),
  copy: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2"/></svg>),
  check: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 6 9 17l-5-5"/></svg>),
  x: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 6 6 18M6 6l12 12"/></svg>),
  warn: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z"/><path d="M12 9v4M12 17h.01"/></svg>),
  plus: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M12 5v14"/></svg>),
  sun: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>),
};

/* ----------------- small components ----------------- */
function CopyButton({ text }) {
  const [done, setDone] = useState(false);
  return (
    <button className={"sp-copy" + (done ? " done" : "")} onClick={() => {
      try { navigator.clipboard.writeText(text); } catch (e) {}
      setDone(true); setTimeout(() => setDone(false), 1400);
    }}>
      {done ? <I.check /> : <I.copy />} {done ? "Copied" : "Copy"}
    </button>
  );
}

function CodeBlock({ label, lines }) {
  const plain = lines.map((l) => l.text).join("\n");
  return (
    <div className="sp-code">
      <div className="sp-code-hd"><span className="sp-code-lbl">{label}</span><CopyButton text={plain} /></div>
      <pre><code>{lines.map((l, i) => (<span key={i}>{l.text}{i < lines.length - 1 ? "\n" : ""}</span>))}</code></pre>
    </div>
  );
}

function SectionHead({ label, chip }) {
  return (
    <div className="sp-shead">
      <span className="sp-sbar" /><span className="sp-slabel">{label}</span>
      {chip && <span className="sp-schip">{chip}</span>}
      <span className="sp-sline" />
    </div>
  );
}

/* ----------------- simulator ----------------- */
const APPID = "7f3b9c21-4e8a-4d6f-bb2c-1a9e0d5c8f42";
const IDS = { appObj: "a13e6b40-…-9f2c", homeSp: "c91d0f72-…-4ab8", contoso: "e44f5a18-…-2d7e", fabrikam: "0b27c9e3-…-1f6a" };

function Simulator() {
  const [reg, setReg] = useState(false);
  const [contoso, setContoso] = useState(false);
  const [fabrikam, setFabrikam] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [restored, setRestored] = useState(false);
  const [flash, setFlash] = useState("");

  const appObjExists = reg && (!deleted || restored);
  const homeSpExists = reg && !deleted;
  const appCount = appObjExists ? 1 : 0;
  const spCount = (homeSpExists ? 1 : 0) + (contoso ? 1 : 0) + (fabrikam ? 1 : 0);

  const reset = () => { setReg(false); setContoso(false); setFabrikam(false); setDeleted(false); setRestored(false); setFlash(""); };
  const ping = (m) => { setFlash(m); setTimeout(() => setFlash(""), 2600); };

  const note = useMemo(() => {
    if (!reg) return "Register the app to create its one application object — plus a service principal in its home tenant.";
    if (deleted && !restored) return "Deleting the application object cascaded to its home-tenant service principal. Contoso and Fabrikam still have theirs — they live in different tenants.";
    if (restored) return "The application object is back, but its home-tenant service principal did not return with it. You'd re-consent to recreate it.";
    if (contoso && fabrikam) return "One application object, three service principals. Same appId everywhere; a distinct objectId per tenant.";
    if (contoso || fabrikam) return "Each tenant that consents gets its own service principal — its local instance of the same global app.";
    return "The home-tenant service principal was created automatically at registration. Now have a consumer tenant consent.";
  }, [reg, contoso, fabrikam, deleted, restored]);

  const renderSp = (id) => (
    <>
      <div className="sp-connector" />
      <div className="sp-obj sp">
        <div className="sp-obj-top"><I.box style={{ width: 15, height: 15, color: "var(--sp-sp)" }} /><span className="sp-obj-kind">Service principal</span></div>
        <div className="sp-obj-id"><div><b>appId</b> <span className="shared">{APPID.slice(0, 13)}…</span></div><div><b>objectId</b> {id}</div></div>
      </div>
    </>
  );

  return (
    <div className="sp-sim">
      <div className="sp-sim-controls">
        <button className="sp-btn primary" disabled={reg} onClick={() => { setReg(true); ping("Created: 1 application object + 1 home-tenant service principal in Adatum."); }}><I.plus /> Register app (Adatum)</button>
        <button className="sp-btn go" disabled={!reg || deleted || contoso} onClick={() => { setContoso(true); ping("Contoso admin consented → new service principal in Contoso."); }}><I.plus /> Contoso consents</button>
        <button className="sp-btn go" disabled={!reg || deleted || fabrikam} onClick={() => { setFabrikam(true); ping("Fabrikam admin consented → new service principal in Fabrikam."); }}><I.plus /> Fabrikam consents</button>
        <button className="sp-btn warn" disabled={!reg || deleted} onClick={() => { setDeleted(true); setRestored(false); ping("Application object deleted — its home service principal went with it."); }}><I.trash /> Delete app object</button>
        <button className="sp-btn ghost" disabled={!deleted || restored} onClick={() => { setRestored(true); ping("App object restored. Notice the home service principal is still gone."); }}><I.reset /> Restore app object</button>
        <button className="sp-btn ghost" onClick={reset} style={{ marginLeft: "auto" }}><I.reset /> Reset</button>
      </div>

      <div className="sp-readout">
        <div className="sp-stat"><span className="sp-stat-num app">{appCount}</span><span className="sp-stat-lbl">application<br/>object</span></div>
        <div className="sp-stat"><span className="sp-stat-num sp">{spCount}</span><span className="sp-stat-lbl">service<br/>principals</span></div>
        <div className="sp-readout-note">{note}</div>
      </div>

      <div className="sp-tenants">
        <div className="sp-tenant home">
          <div className="sp-tenant-hd"><span className="sp-tenant-name"><I.building style={{ width: 16, height: 16, color: "var(--sp-app)" }} /> Adatum</span><span className="sp-tenant-role home">Home tenant</span></div>
          {!reg && <div className="sp-empty">no app yet</div>}
          {appObjExists && (
            <div className="sp-obj app">
              <div className="sp-obj-top"><I.layers style={{ width: 15, height: 15, color: "var(--sp-app)" }} /><span className="sp-obj-kind">Application object</span></div>
              <div className="sp-obj-id"><div><b>appId</b> <span className="shared">{APPID.slice(0, 13)}…</span></div><div><b>objectId</b> {IDS.appObj}</div></div>
            </div>
          )}
          {homeSpExists && renderSp(IDS.homeSp)}
          {restored && !homeSpExists && <div className="sp-empty" style={{ paddingTop: 18, paddingBottom: 6 }}>home SP not restored</div>}
        </div>

        <div className="sp-tenant">
          <div className="sp-tenant-hd"><span className="sp-tenant-name"><I.building style={{ width: 16, height: 16, color: "var(--sp-muted)" }} /> Contoso</span><span className="sp-tenant-role">Consumer</span></div>
          {contoso ? renderSp(IDS.contoso) : <div className="sp-empty">awaiting consent</div>}
        </div>

        <div className="sp-tenant">
          <div className="sp-tenant-hd"><span className="sp-tenant-name"><I.building style={{ width: 16, height: 16, color: "var(--sp-muted)" }} /> Fabrikam</span><span className="sp-tenant-role">Consumer</span></div>
          {fabrikam ? renderSp(IDS.fabrikam) : <div className="sp-empty">awaiting consent</div>}
        </div>
      </div>

      <div className="sp-flash">{flash}</div>
    </div>
  );
}

/* ----------------- SP type tabs ----------------- */
const TYPES = [
  { id: "application", label: "Application", icon: I.box, h: "Application service principal",
    sub: "The local instance of an app registration. The everyday case — one is created in each tenant where the app is used.",
    facts: [["Backed by app object", <span className="sp-yes">Yes</span>], ["Credentials", "Secrets / certificates"], ["Created by", "Registration or admin consent"], ["You'll see it as", "An Enterprise application"]] },
  { id: "managed", label: "Managed identity", icon: I.chip, h: "Managed identity service principal",
    sub: "An identity Azure manages for you so a workload can authenticate without any secret to store, rotate, or leak.",
    facts: [["Backed by app object", <span className="sp-no">No</span>], ["Credentials", "None — platform-managed"], ["Created by", "Enabling a managed identity"], ["You'll see it as", "Granted access, not edited directly"]] },
  { id: "legacy", label: "Legacy", icon: I.history, h: "Legacy service principal",
    sub: "Predates app registrations. Can hold credentials and reply URLs but has no app registration behind it, and only works in the tenant where it was created.",
    facts: [["Backed by app object", <span className="sp-no">No</span>], ["Credentials", "Editable by an authorized user"], ["Created by", "Legacy experiences"], ["You'll see it as", "Single-tenant only"]] },
];

function TypeTabs() {
  const [active, setActive] = useState("application");
  const t = TYPES.find((x) => x.id === active);
  const Icon = t.icon;
  return (
    <div>
      <div className="sp-tabs" role="tablist">
        {TYPES.map((x) => { const X = x.icon; return (
          <button key={x.id} role="tab" aria-selected={active === x.id} className={"sp-tab" + (active === x.id ? " active" : "")} onClick={() => setActive(x.id)}><X /> {x.label}</button>
        ); })}
      </div>
      <div className="sp-tabpanel" role="tabpanel">
        <h3><Icon style={{ width: 19, height: 19, color: "var(--sp-app)" }} /> {t.h}</h3>
        <p className="sp-tp-sub">{t.sub}</p>
        <div className="sp-facts">{t.facts.map(([k, v], i) => (<div className="sp-fact" key={i}><div className="k">{k}</div><div className="v">{v}</div></div>))}</div>
      </div>
    </div>
  );
}

/* ----------------- quiz ----------------- */
const QUESTIONS = [
  { q: "A multitenant app is in use by three organizations. How many application objects exist?", opts: ["One", "Three", "One per user", "Zero"], correct: 0,
    why: "The application object is global — exactly one, in the app's home tenant. Each consuming tenant gets its own service principal, but they all reference that single object." },
  { q: "You delete an app registration, then restore it from the portal. What happens to its home-tenant service principal?", opts: ["It's restored automatically", "It is not restored", "It moves to another tenant", "It becomes a managed identity"], correct: 1,
    why: "Deleting the application object cascades to its home-tenant service principal — but restoring the app object does not bring the service principal back. You re-consent to recreate it." },
  { q: "Which service principal type lets a workload authenticate with no secret to store or rotate?", opts: ["Legacy", "Application", "Managed identity", "Multitenant"], correct: 2,
    why: "A managed identity has no associated app object and no credentials you manage — Azure handles them. It's the credential-free path you generally want to move toward." },
];

function Quiz() {
  const [picked, setPicked] = useState({});
  return (
    <div className="sp-quiz">
      {QUESTIONS.map((item, qi) => {
        const choice = picked[qi];
        const answered = choice !== undefined;
        return (
          <div className="sp-q" key={qi}>
            <p className="sp-q-stem">{qi + 1}. {item.q}</p>
            <div className="sp-q-opts">
              {item.opts.map((opt, oi) => {
                let cls = "sp-opt";
                if (answered && oi === item.correct) cls += " correct";
                else if (answered && oi === choice && oi !== item.correct) cls += " wrong";
                return (
                  <button key={oi} className={cls} disabled={answered} onClick={() => setPicked((p) => ({ ...p, [qi]: oi }))}>
                    {answered && oi === item.correct && <I.check className="sp-opt-mark" />}
                    {answered && oi === choice && oi !== item.correct && <I.x className="sp-opt-mark" />}
                    {opt}
                  </button>
                );
              })}
            </div>
            {answered && <div className="sp-explain"><b>{choice === item.correct ? "Correct." : "Not quite."}</b> {item.why}</div>}
          </div>
        );
      })}
    </div>
  );
}

/* ----------------- page ----------------- */
export default function ServicePrincipals() {
  return (
    <div className="sp-root">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="sp-page">

      <header className="sp-hero">
        <div className="sp-wrap">
          <div className="sp-crumb"><b>Learn</b> / Identity primer · Microsoft Entra ID</div>
          <h1 className="sp-h1">Application objects &amp; service principals</h1>
          <p className="sp-lede">One is the blueprint. The other is what actually signs in and holds permissions. Get the difference and most of Entra's app model falls into place — so below, you build it yourself.</p>
        </div>
      </header>

      <div className="sp-wrap">
        <div className="sp-dual">
          <div className="sp-idea app">
            <div className="sp-idea-tag">Global · one</div>
            <h3>Application object</h3>
            <p>The single definition of your app, in the tenant where you registered it. A template that says how tokens are issued, what it can access, and what it can do.</p>
            <span className="sp-pill">like a class</span>
          </div>
          <div className="sp-arrow">stamps →</div>
          <div className="sp-idea sp">
            <div className="sp-idea-tag">Local · many</div>
            <h3>Service principal</h3>
            <p>The instance created in each tenant that uses the app. It's the security principal that authenticates and carries the permissions and consent for that tenant.</p>
            <span className="sp-pill">like an object</span>
          </div>
        </div>
      </div>

      <section className="sp-section"><div className="sp-wrap">
        <SectionHead label="Interactive · build it" chip="6 steps" />
        <h2 className="sp-h2">The multitenant model, one step at a time</h2>
        <p className="sp-sub">Register an app, have consumer tenants consent, then try deleting the app object. Watch the object counts and the <span className="sp-mono-inline">appId</span> / <span className="sp-mono-inline">objectId</span> values as you go.</p>
        <Simulator />
      </div></section>

      <section className="sp-section"><div className="sp-wrap">
        <SectionHead label="Side by side" chip="2 objects" />
        <h2 className="sp-h2">Same app, two objects</h2>
        <div className="sp-cmp">
          <div className="sp-cmp-row">
            <div className="sp-cmp-axis"></div>
            <div className="sp-cmp-app"><span className="sp-cmp-head app">Application object</span></div>
            <div className="sp-cmp-sp"><span className="sp-cmp-head sp">Service principal</span></div>
          </div>
          {[
            ["Scope", "Global — across all tenants", "Local — one specific tenant"],
            ["How many", "Exactly one", "One per tenant that uses the app"],
            ["Lives in", "The app's home tenant", "Every tenant where it's consented"],
            ["Defines", "How the app is built and what it may do", "What the app can do here, and who may use it"],
            ["Managed in", "App registrations", "Enterprise applications"],
            ["Graph entity", "application", "servicePrincipal"],
          ].map(([axis, a, b], i) => (
            <div className="sp-cmp-row" key={i}>
              <div className="sp-cmp-axis">{axis}</div>
              <div className="sp-cmp-app">{i >= 4 ? <span className="sp-mono-inline">{a}</span> : a}</div>
              <div className="sp-cmp-sp">{i >= 4 ? <span className="sp-mono-inline">{b}</span> : b}</div>
            </div>
          ))}
        </div>
      </div></section>

      <section className="sp-section"><div className="sp-wrap">
        <SectionHead label="Not all the same" chip="3 types" />
        <h2 className="sp-h2">Three kinds of service principal</h2>
        <p className="sp-sub">Most are the Application type, but you'll meet all three in a real tenant. The difference that matters most: which ones carry credentials you have to manage.</p>
        <TypeTabs />
      </div></section>

      <section className="sp-section"><div className="sp-wrap">
        <SectionHead label="From the tenant" chip="field notes" />
        <h2 className="sp-h2">What actually pages you</h2>
        <p className="sp-sub">The operational realities the reference docs never lead with.</p>
        <div className="sp-notes">
          <div className="sp-note">
            <div className="sp-note-hd"><div className="sp-note-ic high"><I.key /></div><RiskBadge risk="High" size="sm" /></div>
            <h4>Secrets expire quietly</h4>
            <p>Client secrets and certs live on the app registration. When one lapses, the app stops authenticating with no warning to the SP.</p>
            <div className="fix"><b>Do:</b> inventory credential expiry on a schedule; prefer certificates over secrets.</div>
          </div>
          <div className="sp-note">
            <div className="sp-note-hd"><div className="sp-note-ic crit"><I.warn /></div><RiskBadge risk="Critical" size="sm" /></div>
            <h4>Over-consented enterprise apps</h4>
            <p>A service principal keeps whatever was consented — often broad app permissions no one reviews after onboarding.</p>
            <div className="fix"><b>Do:</b> audit consented permissions on Enterprise applications; revoke what isn't used.</div>
          </div>
          <div className="sp-note">
            <div className="sp-note-hd"><div className="sp-note-ic app"><I.chip /></div><span style={{ display:"inline-flex", alignItems:"center", gap:5, background:"var(--low-bg)", border:"1px solid var(--low-border)", color:"var(--low)", borderRadius:6, padding:"2px 7px", fontSize:10, fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase", whiteSpace:"nowrap" }}>Best practice</span></div>
            <h4>Kill the credential</h4>
            <p>Anywhere a workload runs in Azure, a managed identity removes the secret entirely — nothing to store, rotate, or leak.</p>
            <div className="fix"><b>Do:</b> migrate app-secret auth to managed identities where the platform supports it.</div>
          </div>
        </div>
      </div></section>

      <section className="sp-section"><div className="sp-wrap">
        <SectionHead label="Copy & run" chip="PowerShell · CLI" />
        <h2 className="sp-h2">The commands you'll reach for</h2>
        <p className="sp-sub">Replace <span className="sp-mono-inline">{"{AppId}"}</span> with the app (client) ID.</p>
        <CodeBlock label="List the service principals for an app — Microsoft Graph PowerShell" lines={[{ text: "Get-MgServicePrincipal -Filter \"appId eq '{AppId}'\"" }]} />
        <CodeBlock label="Same, Azure CLI" lines={[{ text: "az ad sp list --filter \"appId eq '{AppId}'\"" }]} />
        <CodeBlock label="Inspect the application object behind it" lines={[{ text: "Get-MgApplication -Filter \"appId eq '{AppId}'\"" }]} />
        <CodeBlock label="Create a service principal from an existing app" lines={[{ text: "New-MgServicePrincipal -AppId '{AppId}'" }]} />
        <CodeBlock label="Find app credentials expiring in the next 30 days" lines={[
          { text: "$soon = (Get-Date).AddDays(30)" },
          { text: "Get-MgApplication -All |" },
          { text: "  Where-Object { $_.PasswordCredentials.EndDateTime -lt $soon } |" },
          { text: "  Select-Object DisplayName, AppId" },
        ]} />
      </div></section>

      <section className="sp-section"><div className="sp-wrap">
        <SectionHead label="Knowledge check" chip="3 questions" />
        <h2 className="sp-h2">Three quick ones</h2>
        <p className="sp-sub">Pick an answer to see why it's right.</p>
        <Quiz />
      </div></section>

      <footer className="sp-foot"><div className="sp-wrap">SecRole · Learn. Concept adapted from Microsoft's application &amp; service principal documentation — rebuilt to be learned by doing.</div></footer>
      </div>
    </div>
  );
}
