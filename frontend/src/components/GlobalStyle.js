import React from "react";

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
    :root {
      --bg: #05080e; --bg2: #0a0e18; --bg3: #0f1420;
      --card: #111827; --border: rgba(255,255,255,.08);
      --text: #f0f4ff; --muted: #6b7280;
      --amber: #ffb830; --teal: #2dd4bf; --rose: #f43f5e;
      --violet: #8b5cf6;
      --font-display: 'Bricolage Grotesque', sans-serif;
      --font-body: 'Plus Jakarta Sans', sans-serif;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: var(--bg); color: var(--text); font-family: var(--font-body); }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--bg2); }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
    .inp {
      width: 100%; background: var(--bg3); border: 1px solid var(--border);
      color: var(--text); border-radius: 10px; padding: 12px 14px;
      font-family: var(--font-body); font-size: 14px; outline: none;
      transition: border-color .2s; -webkit-appearance: none;
    }
    .inp:focus { border-color: rgba(255,184,48,.4); }
    .ta { width:100%; min-height:120px; resize:vertical; background: var(--bg3);
      border: 1px solid var(--border); color: var(--text); border-radius: 10px;
      padding: 12px 14px; font-family: var(--font-body); font-size: 14px; outline: none; }
    .ta:focus { border-color: rgba(255,184,48,.4); }
    .sel { background: var(--bg3); border: 1px solid var(--border); color: var(--text);
      border-radius: 10px; padding: 11px 14px; font-family: var(--font-body);
      font-size: 14px; outline: none; cursor: pointer; -webkit-appearance: none; }
    pre { white-space: pre-wrap; font-family: var(--font-body); font-size: 14px;
      line-height: 1.8; color: var(--text); }
    @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    @keyframes slideInLeft { from { transform:translateX(-100%); } to { transform:translateX(0); } }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes orb1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-30px) scale(1.08)} }
    @keyframes orb2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,20px) scale(1.05)} }
    .animate-in { animation: fadeIn .5s ease forwards; }
    .loading-dots::after { content:''; animation: pulse 1s infinite; }

    /* ── Mobile Sidebar Drawer ── */
    .mob-sidebar-wrap {
      flex-shrink: 0; width: 240px;
      background: var(--bg2); border-right: 1px solid var(--border);
      overflow-y: auto; display: flex; flex-direction: column;
    }
    .mob-overlay {
      display: none; position: fixed; inset: 0; top: 65px;
      background: rgba(0,0,0,.65); z-index: 499; backdrop-filter: blur(4px);
      animation: fadeIn .2s ease;
    }
    .mob-overlay.open { display: block; }

    /* ── Responsive Utility Classes ── */
    .desk-only { display: flex; }
    .mob-only  { display: none !important; }
    .plans-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
    .selector-bar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

    /* ── Touch-friendly tap targets ── */
    button, select, input { touch-action: manipulation; }

    @media (max-width: 768px) {
      .desk-only { display: none !important; }
      .mob-only  { display: flex !important; }

      /* Sidebar becomes fixed drawer on mobile */
      .mob-sidebar-wrap {
        position: fixed; top: 65px; left: 0;
        height: calc(100vh - 65px); z-index: 500; width: 272px;
        transform: translateX(-100%); transition: transform .28s cubic-bezier(.4,0,.2,1);
        box-shadow: 6px 0 32px rgba(0,0,0,.6);
      }
      .mob-sidebar-wrap.open { transform: translateX(0); }

      /* Compact plans grid on mobile */
      .plans-grid { grid-template-columns: 1fr; }

      /* Nav compact */
      .nav-name { display: none; }

      /* Landing hero padding */
      .hero-section { padding: 64px 16px 40px !important; }

      /* Selector bar scrollable on mobile */
      .selector-bar { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 4px; }
      .selector-bar::-webkit-scrollbar { height: 0; }

      /* Panel content padding on mobile */
      .panel-content { padding: 16px 14px !important; }

      /* Modals full width on mobile */
      .modal-card { border-radius: 16px !important; }

      /* Input sizes on mobile */
      .inp, .ta, .sel { font-size: 16px !important; } /* prevents iOS zoom */

      /* Stats row wraps tightly */
      .stats-row { gap: 20px 32px !important; }
    }

    @media (max-width: 480px) {
      .plans-grid { grid-template-columns: 1fr; gap: 10px; }
      .nav-upgrade-text { display: none; }
    }
  `}</style>
);

export default GlobalStyle;
