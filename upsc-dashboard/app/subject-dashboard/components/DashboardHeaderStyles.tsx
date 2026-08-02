"use client";

const dashboardHeaderStyles = `
  :root {
    --dh-bg: #0b1324;
    --dh-surface: rgba(17, 27, 46, 0.82);
    --dh-surface-2: rgba(20, 33, 56, 0.92);
    --dh-surface-3: rgba(27, 42, 70, 0.96);

    --dh-border: rgba(148, 163, 184, 0.16);
    --dh-border-strong: rgba(125, 211, 252, 0.26);

    --dh-text: #eef4ff;
    --dh-text-soft: #d8e6fb;
    --dh-text-muted: #9fb0c8;

    --dh-accent: #7dd3fc;
    --dh-accent-2: #5fb3ff;
    --dh-success: #34d399;
    --dh-warning: #fbbf24;
    --dh-danger: #fb7185;

    --dh-shadow-soft: 0 12px 30px rgba(0, 0, 0, 0.22);
    --dh-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);

    --dh-radius-xl: 24px;
    --dh-radius-lg: 18px;
    --dh-radius-md: 14px;
    --dh-radius-sm: 10px;

    --dh-font-display:
      Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
      "Segoe UI", sans-serif;
  }

  /* =========================================================
     TOP BAR
     ========================================================= */

  .top-bar {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-bottom: 14px;
  }

  .icon-btn {
    width: 40px;
    height: 40px;
    border: 1px solid var(--dh-border);
    border-radius: 12px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.025)),
      rgba(18, 28, 46, 0.84);
    color: var(--dh-text);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: var(--dh-shadow-soft);
    transition:
      transform 180ms ease,
      border-color 180ms ease,
      background 180ms ease,
      box-shadow 180ms ease;
  }

  .icon-btn:hover {
    transform: translateY(-1px);
    border-color: var(--dh-border-strong);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.035)),
      rgba(24, 36, 58, 0.94);
    box-shadow: var(--dh-shadow);
  }

  .icon-btn:active {
    transform: translateY(0);
  }

  /* =========================================================
     DASHBOARD HERO / HEADER
     ========================================================= */

  .dashboard-hero {
    position: relative;
    margin-bottom: 20px;
    padding: 6px 0 2px;
  }

  .dashboard-hero-copy {
    max-width: 980px;
  }

  .dashboard-eyebrow {
    margin: 0 0 10px;
    color: var(--dh-accent);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .mh-title {
    margin: 0;
    color: #f8fbff;
    font-family: var(--dh-font-display);
    font-size: clamp(2rem, 3.8vw, 3.35rem);
    font-weight: 900;
    line-height: 1.04;
    letter-spacing: -0.04em;
    text-wrap: balance;
  }

  .mh-sub {
    margin: 12px 0 0;
    color: var(--dh-text-soft);
    font-size: 1rem;
    line-height: 1.7;
    max-width: 78ch;
  }

  /* =========================================================
     PROGRESS BAR
     ========================================================= */

  .progress-container {
    position: relative;
    z-index: 1;
    margin-bottom: 14px;
    padding: 18px 20px;
    border: 1px solid var(--dh-border);
    border-radius: var(--dh-radius-lg);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.018)),
      var(--dh-surface);
    box-shadow: var(--dh-shadow-soft);
    backdrop-filter: blur(10px);
  }

  .progress-text {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
    color: var(--dh-text-soft);
    font-size: 14px;
    font-weight: 700;
  }

  .progress-text span:first-child {
    color: #f3f8ff;
  }

  .progress-text #pCount {
    color: var(--dh-accent);
    font-weight: 800;
  }

  .progress-track {
    width: 100%;
    height: 11px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(148, 163, 184, 0.14);
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.22);
  }

  .progress-fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(
      90deg,
      rgba(52, 211, 153, 0.95) 0%,
      rgba(95, 179, 255, 0.95) 100%
    );
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.04),
      0 0 18px rgba(52, 211, 153, 0.22);
    transition: width 280ms ease;
  }

  /* =========================================================
     LEGEND
     ========================================================= */

  .legend {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 18px;
  }

  .pbadge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 48px;
    height: 28px;
    padding: 0 12px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.05em;
    border: 1px solid transparent;
    user-select: none;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  .pbadge.high {
    color: #dcfce7;
    background: rgba(16, 185, 129, 0.16);
    border-color: rgba(16, 185, 129, 0.24);
  }

  .pbadge.mid {
    color: #fde68a;
    background: rgba(245, 158, 11, 0.16);
    border-color: rgba(245, 158, 11, 0.24);
  }

  .pbadge.low {
    color: #c7d2fe;
    background: rgba(96, 165, 250, 0.14);
    border-color: rgba(96, 165, 250, 0.22);
  }

  /* =========================================================
     CONTROLS WRAP
     ========================================================= */

  .controls {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    gap: 14px;
    margin-bottom: 26px;
    padding: 18px;
    border: 1px solid var(--dh-border);
    border-radius: var(--dh-radius-xl);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.025)),
      var(--dh-surface);
    box-shadow: var(--dh-shadow-soft);
    backdrop-filter: blur(10px);
  }

  /* =========================================================
     SEARCH
     ========================================================= */

  .search-wrapper {
    position: relative;
    flex: 1 1 320px;
    min-width: min(100%, 280px);
  }

  .search-icon {
    position: absolute;
    top: 50%;
    left: 16px;
    transform: translateY(-50%);
    color: var(--dh-text-muted);
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    height: 46px;
    padding: 0 16px 0 44px;
    border-radius: 14px;
    border: 1px solid rgba(148, 163, 184, 0.16);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.015)),
      rgba(10, 18, 32, 0.56);
    color: #eef4ff;
    font: inherit;
    outline: none;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.18);
    transition:
      border-color 180ms ease,
      box-shadow 180ms ease,
      background 180ms ease;
  }

  .search-input::placeholder {
    color: #8fa4c6;
  }

  .search-input:focus {
    border-color: rgba(125, 211, 252, 0.34);
    box-shadow:
      0 0 0 3px rgba(125, 211, 252, 0.08),
      inset 0 1px 2px rgba(0, 0, 0, 0.18);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02)),
      rgba(14, 24, 40, 0.72);
  }

  /* =========================================================
     BUTTON GROUP
     ========================================================= */

  .btn-group {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: stretch;
  }

  .control-btn {
    min-height: 46px;
    padding: 0 14px;
    border: 1px solid rgba(148, 163, 184, 0.16);
    border-radius: 14px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02)),
      rgba(24, 35, 56, 0.86);
    color: #e7f1ff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font: inherit;
    font-size: 14px;
    font-weight: 700;
    white-space: nowrap;
    cursor: pointer;
    box-shadow: var(--dh-shadow-soft);
    transition:
      transform 180ms ease,
      border-color 180ms ease,
      background 180ms ease,
      box-shadow 180ms ease,
      color 180ms ease;
  }

  .control-btn:hover {
    transform: translateY(-1px);
    border-color: rgba(125, 211, 252, 0.28);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.025)),
      rgba(31, 46, 74, 0.96);
    box-shadow: var(--dh-shadow);
  }

  .control-btn:active {
    transform: translateY(0);
  }

  .control-btn.active {
    border-color: rgba(95, 179, 255, 0.3);
    background:
      linear-gradient(180deg, rgba(95, 179, 255, 0.18), rgba(95, 179, 255, 0.1)),
      rgba(22, 37, 60, 0.96);
    color: #f6fbff;
    box-shadow:
      0 0 0 1px rgba(95, 179, 255, 0.08),
      0 14px 30px rgba(0, 0, 0, 0.24);
  }

  .download-menu {
    position: relative;
    display: inline-flex;
  }

  .download-menu-panel {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    z-index: 20;
    min-width: 132px;
    padding: 6px;
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 12px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.025)),
      rgba(15, 25, 42, 0.98);
    box-shadow: var(--dh-shadow);
  }

  .download-menu-option {
    width: 100%;
    min-height: 36px;
    padding: 0 12px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: #e7f1ff;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    font: inherit;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
  }

  .download-menu-option:hover {
    background: rgba(95, 179, 255, 0.14);
    color: #f6fbff;
  }

  /* =========================================================
     SMART MODE TOGGLE
     ========================================================= */

  .smart-mode-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 16px 18px;
    border: 1px solid rgba(56, 189, 248, 0.18);
    border-radius: 18px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02)),
      rgba(15, 23, 42, 0.46);
    color: var(--dh-text);
    box-shadow: var(--dh-shadow-soft);
    cursor: pointer;
    transition:
      transform 180ms ease,
      border-color 180ms ease,
      background 180ms ease,
      box-shadow 180ms ease;
  }

  .smart-mode-toggle:hover {
    transform: translateY(-1px);
    border-color: rgba(56, 189, 248, 0.3);
    box-shadow: var(--dh-shadow);
  }

  .smart-mode-toggle.active {
    border-color: rgba(56, 189, 248, 0.34);
    background:
      linear-gradient(180deg, rgba(56, 189, 248, 0.12), rgba(56, 189, 248, 0.04)),
      rgba(15, 23, 42, 0.72);
    box-shadow:
      0 0 0 1px rgba(56, 189, 248, 0.08),
      0 18px 40px rgba(0, 0, 0, 0.26);
  }

  .smart-mode-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
    text-align: left;
  }

  .smart-mode-kicker {
    color: var(--dh-accent);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .smart-mode-title {
    color: #f7fbff;
    font-size: 1rem;
    font-weight: 800;
    line-height: 1.3;
  }

  .smart-mode-subtitle {
    color: var(--dh-text-muted);
    font-size: 0.93rem;
    line-height: 1.55;
  }

  .smart-mode-toggle.active .smart-mode-subtitle {
    color: #d7ecff;
  }

  .smart-mode-switch {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .smart-mode-switch-track {
    position: relative;
    width: 58px;
    height: 32px;
    border-radius: 999px;
    background: rgba(148, 163, 184, 0.18);
    border: 1px solid rgba(148, 163, 184, 0.16);
    transition:
      background 180ms ease,
      border-color 180ms ease;
  }

  .smart-mode-switch-thumb {
    position: absolute;
    top: 3px;
    left: 4px;
    width: 24px;
    height: 24px;
    border-radius: 999px;
    background: #f8fbff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.22);
    transition:
      transform 180ms ease,
      background 180ms ease;
  }

  .smart-mode-toggle.active .smart-mode-switch-track {
    background: rgba(56, 189, 248, 0.22);
    border-color: rgba(56, 189, 248, 0.28);
  }

  .smart-mode-toggle.active .smart-mode-switch-thumb {
    transform: translateX(26px);
    background: #ffffff;
  }

  .smart-mode-state {
    min-width: 34px;
    color: #f2f8ff;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-align: right;
  }

  /* =========================================================
     ZEN HELPERS
     ========================================================= */

  .hide-in-zen {
    transition:
      opacity 180ms ease,
      transform 180ms ease;
  }

  .zen-mode .hide-in-zen {
    opacity: 0;
    pointer-events: none;
    transform: translateY(-6px);
  }

  /* =========================================================
     RESPONSIVE
     ========================================================= */

  @media (max-width: 1080px) {
    .mh-title {
      font-size: clamp(1.95rem, 5vw, 3rem);
    }

    .controls {
      padding: 16px;
    }
  }

  @media (max-width: 860px) {
    .progress-text {
      flex-direction: column;
      align-items: flex-start;
    }

    .btn-group {
      width: 100%;
    }

    .control-btn {
      flex: 1 1 calc(50% - 5px);
    }

    .smart-mode-toggle {
      align-items: flex-start;
      flex-direction: column;
    }

    .smart-mode-switch {
      width: 100%;
      justify-content: space-between;
    }
  }

  @media (max-width: 640px) {
    .top-bar {
      margin-bottom: 12px;
    }

    .dashboard-eyebrow {
      margin-bottom: 8px;
    }

    .mh-sub {
      font-size: 0.95rem;
      line-height: 1.65;
    }

    .progress-container {
      padding: 16px;
    }

    .controls {
      gap: 12px;
      padding: 14px;
      border-radius: 20px;
    }

    .search-input {
      height: 44px;
    }

    .control-btn {
      min-height: 44px;
    }

    .smart-mode-toggle {
      padding: 14px 16px;
    }
  }

  @media (max-width: 520px) {
    .mh-title {
      font-size: clamp(1.7rem, 9vw, 2.35rem);
    }

    .control-btn {
      flex: 1 1 100%;
    }

    .smart-mode-title {
      font-size: 0.96rem;
    }

    .smart-mode-subtitle {
      font-size: 0.88rem;
    }
  }
`;

export function DashboardHeaderStyles() {
  return <style>{dashboardHeaderStyles}</style>;
}

export default DashboardHeaderStyles;
