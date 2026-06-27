"use client";

export function DashboardStyles() {
  return (
    <style jsx global>{`
      :root {
        --bg: #0b1324;
        --panel: #121c2f;
        --panel-2: #17243a;
        --panel-3: #1d2b44;
        --line: rgba(148, 163, 184, 0.18);
        --line-strong: rgba(96, 165, 250, 0.22);
        --text: #eef4ff;
        --muted: #9fb0c8;
        --soft: #c7d3e8;
        --blue: #5fb3ff;
        --blue-2: #7ec7ff;
        --green: #34d399;
        --amber: #fbbf24;
        --purple: #b794f6;
        --danger: #fb7185;
        --shadow: 0 16px 40px rgba(0, 0, 0, 0.28);
        --radius-xl: 24px;
        --radius-lg: 18px;
        --radius-md: 14px;
        --radius-sm: 10px;
      }

      /* ------------------------------------------------------------------ */
      /* PAGE / WRAPPERS                                                    */
      /* ------------------------------------------------------------------ */

      body {
        background:
          radial-gradient(
            circle at top,
            rgba(41, 89, 168, 0.22),
            transparent 28%
          ),
          linear-gradient(180deg, #08101f 0%, #0b1324 28%, #0d1628 100%);
        color: var(--text);
      }

      .mh-wrap {
        width: min(1400px, calc(100vw - 32px));
        margin: 0 auto;
        padding: 18px 0 48px;
      }

      .active-recall .ncard {
        border-color: rgba(96, 165, 250, 0.24);
      }

      /* ------------------------------------------------------------------ */
      /* GENERIC PANELS                                                     */
      /* ------------------------------------------------------------------ */

      .tree-shell,
      .chapter-stats-modal,
      .note-manager-modal,
      .wrong-questions-modal,
      .controls-shell,
      .legend-shell,
      .progress-shell,
      .dashboard-header,
      .topbar-shell {
        background: linear-gradient(
          180deg,
          rgba(27, 40, 64, 0.98) 0%,
          rgba(20, 31, 52, 0.98) 100%
        );
        border: 1px solid var(--line);
        box-shadow: var(--shadow);
      }

      /* ------------------------------------------------------------------ */
      /* TREE SHELL                                                         */
      /* ------------------------------------------------------------------ */

      .tree-shell {
        position: relative;
        border-radius: var(--radius-xl);
        padding: 22px 18px 22px;
        overflow: hidden;
      }

      .tree-shell::before {
        content: "";
        position: absolute;
        inset: 0 0 auto 0;
        height: 1px;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(125, 211, 252, 0.28),
          transparent
        );
        pointer-events: none;
      }

      .tree-shell-head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;
        padding: 0 4px 14px;
        margin-bottom: 16px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.14);
      }

      .tree-shell-kicker {
        margin: 0 0 4px;
        color: #7dd3fc;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      .tree-shell-title {
        margin: 0;
        color: #f8fbff;
        font-size: 1.95rem;
        font-weight: 800;
        line-height: 1.05;
      }

      .tree-shell-note {
        margin: 0;
        max-width: 520px;
        color: var(--muted);
        font-size: 0.92rem;
        line-height: 1.55;
        text-align: right;
      }

      .tree {
        position: relative;
      }

      .tnodes {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .tnodes.root {
        display: grid;
        gap: 16px;
      }

      .tnodes.child {
        margin-top: 12px;
        margin-left: 18px;
        padding-left: 18px;
        border-left: 1px solid rgba(148, 163, 184, 0.18);
        display: grid;
        gap: 12px;
      }

      .tnodes.child.hidden {
        display: none;
      }

      /* ------------------------------------------------------------------ */
      /* TREE NODE                                                          */
      /* ------------------------------------------------------------------ */

      .tnode {
        position: relative;
      }

      .ncard {
        position: relative;
        border-radius: 20px;
        border: 1px solid rgba(148, 163, 184, 0.16);
        background: linear-gradient(
          180deg,
          rgba(28, 40, 64, 0.96) 0%,
          rgba(20, 30, 49, 0.96) 100%
        );
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.02),
          0 10px 24px rgba(0, 0, 0, 0.16);
        transition:
          border-color 0.16s ease,
          transform 0.16s ease,
          box-shadow 0.16s ease;
      }

      .ncard:hover {
        border-color: rgba(96, 165, 250, 0.28);
      }

      .tnode.checked > .ncard {
        border-color: rgba(52, 211, 153, 0.34);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.02),
          0 10px 24px rgba(0, 0, 0, 0.16),
          0 0 0 1px rgba(52, 211, 153, 0.08);
      }

      .tnode.indeterminate > .ncard {
        border-color: rgba(251, 191, 36, 0.28);
      }

      .nhead {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 18px;
        padding: 16px 16px 14px;
      }

      .nhead-left {
        min-width: 0;
        flex: 1 1 auto;
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      .nhead-right {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        flex-shrink: 0;
      }

      .collapse-btn,
      .collapse-spacer {
        width: 24px;
        min-width: 24px;
        height: 24px;
        margin-top: 2px;
      }

      .collapse-spacer {
        display: inline-block;
      }

      .collapse-btn {
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: linear-gradient(
          180deg,
          rgba(56, 72, 99, 0.9) 0%,
          rgba(45, 59, 82, 0.9) 100%
        );
        color: #e5efff;
        border-radius: 8px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition:
          transform 0.16s ease,
          border-color 0.16s ease,
          background 0.16s ease;
      }

      .collapse-btn:hover {
        border-color: rgba(125, 211, 252, 0.3);
        background: linear-gradient(
          180deg,
          rgba(66, 86, 118, 0.96) 0%,
          rgba(50, 66, 94, 0.96) 100%
        );
      }

      .nhead input[type="checkbox"] {
        width: 16px;
        height: 16px;
        margin-top: 5px;
        accent-color: #34d399;
        cursor: pointer;
        flex-shrink: 0;
      }

      .node-copy {
        min-width: 0;
        flex: 1 1 auto;
      }

      .nlabel {
        min-width: 0;
      }

      .node-meta {
        margin-top: 12px;
        padding-top: 10px;
        border-top: 1px dashed rgba(148, 163, 184, 0.18);
        color: #94a9c7;
        font-size: 12px;
        line-height: 1.4;
      }

      .user-note {
        margin: 0 16px 16px 52px;
        padding: 12px 14px;
        border-radius: 14px;
        border: 1px solid rgba(125, 211, 252, 0.18);
        background: rgba(21, 32, 52, 0.88);
        color: #dbe8fb;
        font-size: 0.92rem;
        line-height: 1.65;
        white-space: pre-wrap;
      }

      /* ------------------------------------------------------------------ */
      /* ACTIONS / BADGES                                                   */
      /* ------------------------------------------------------------------ */

      .node-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .act-btn,
      .history-badge {
        width: 34px;
        height: 34px;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.16);
        background: rgba(43, 56, 82, 0.74);
        color: #dbe7fb;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition:
          transform 0.14s ease,
          border-color 0.14s ease,
          background 0.14s ease,
          color 0.14s ease;
      }

      .act-btn:hover,
      .history-badge:hover {
        transform: translateY(-1px);
        border-color: rgba(125, 211, 252, 0.28);
        background: rgba(55, 72, 104, 0.92);
      }

      .act-btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
        transform: none;
      }

      .act-btn.note.active {
        color: #7dd3fc;
        border-color: rgba(125, 211, 252, 0.28);
      }

      .act-btn.star.active {
        color: #fbbf24;
        border-color: rgba(251, 191, 36, 0.28);
      }

      .history-badge.active {
        border-color: rgba(125, 211, 252, 0.28);
        color: #7dd3fc;
      }

      .history-badge-wrap {
        position: relative;
      }

      .pbadge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 44px;
        height: 26px;
        padding: 0 10px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.04em;
        border: 1px solid transparent;
        user-select: none;
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

      /* ------------------------------------------------------------------ */
      /* NOTE CONTENT RENDERING                                             */
      /* ------------------------------------------------------------------ */

      .note-copy {
        min-width: 0;
        color: var(--soft);
      }

      .note-title {
        color: #f7fbff;
        font-size: 1rem;
        font-weight: 800;
        line-height: 1.45;
      }

      .note-pill {
        display: inline-flex;
        align-items: center;
        min-height: 42px;
        padding: 10px 14px;
        border-radius: 14px;
        border: 1px solid rgba(96, 165, 250, 0.24);
        background: linear-gradient(
          180deg,
          rgba(33, 53, 82, 0.92) 0%,
          rgba(28, 44, 69, 0.92) 100%
        );
        color: #e9f3ff;
        font-weight: 700;
        line-height: 1.5;
      }

      .note-paragraphs {
        display: grid;
        gap: 10px;
      }

      .note-paragraph {
        margin: 0;
        color: #d8e5f8;
        font-size: 0.95rem;
        line-height: 1.8;
      }

      .note-bullets,
      .outline-bullets,
      .case-list {
        margin: 0;
        padding-left: 18px;
        display: grid;
        gap: 8px;
      }

      .note-bullets li,
      .outline-bullets li,
      .case-list li {
        color: #dbe7fa;
        line-height: 1.7;
      }

      .note-numbered,
      .note-outline {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 12px;
      }

      .note-numbered li,
      .outline-item {
        border-radius: 16px;
        border: 1px solid rgba(148, 163, 184, 0.14);
        background: rgba(22, 33, 54, 0.6);
        padding: 12px 14px;
      }

      .note-numbered li {
        display: grid;
        grid-template-columns: 34px minmax(0, 1fr);
        gap: 12px;
        align-items: flex-start;
      }

      .outline-head {
        display: grid;
        grid-template-columns: 34px minmax(0, 1fr);
        gap: 12px;
        align-items: flex-start;
      }

      .num {
        width: 28px;
        height: 28px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(95, 179, 255, 0.16);
        border: 1px solid rgba(95, 179, 255, 0.26);
        color: #dff0ff;
        font-size: 13px;
        font-weight: 800;
        flex-shrink: 0;
      }

      .num-copy,
      .outline-copy {
        color: #e2ecfb;
        line-height: 1.7;
        min-width: 0;
      }

      .outline-bullets {
        margin-top: 10px;
        padding-left: 46px;
      }

      .outline-special {
        list-style: none;
        margin-left: -18px;
      }

      .case-card,
      .trap-card {
        border-radius: 16px;
        padding: 14px 14px 14px;
      }

      .case-card {
        border: 1px solid rgba(183, 148, 246, 0.22);
        background: linear-gradient(
          180deg,
          rgba(46, 36, 70, 0.92) 0%,
          rgba(34, 28, 54, 0.92) 100%
        );
      }

      .trap-card {
        border: 1px solid rgba(251, 191, 36, 0.26);
        background: linear-gradient(
          180deg,
          rgba(60, 49, 28, 0.9) 0%,
          rgba(48, 40, 25, 0.92) 100%
        );
      }

      .case-card.compact,
      .trap-card.compact {
        padding: 12px 12px;
      }

      .note-chip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 46px;
        height: 24px;
        padding: 0 10px;
        border-radius: 999px;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        margin-bottom: 10px;
      }

      .note-chip.purple {
        background: rgba(183, 148, 246, 0.18);
        color: #e9d8fd;
        border: 1px solid rgba(183, 148, 246, 0.26);
      }

      .note-chip.amber {
        background: rgba(251, 191, 36, 0.18);
        color: #fde68a;
        border: 1px solid rgba(251, 191, 36, 0.26);
      }

      .case-title {
        color: #f4ebff;
        font-size: 1rem;
        font-weight: 800;
        line-height: 1.65;
      }

      .case-body,
      .trap-copy {
        display: grid;
        gap: 8px;
        color: #f2f6ff;
        line-height: 1.75;
      }

      .case-body p,
      .trap-copy p {
        margin: 0;
      }

      /* ------------------------------------------------------------------ */
      /* HISTORY POPUP                                                      */
      /* ------------------------------------------------------------------ */

      .history-popup {
        border-radius: 16px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: linear-gradient(
          180deg,
          rgba(20, 31, 51, 0.98) 0%,
          rgba(15, 24, 40, 0.98) 100%
        );
        box-shadow: 0 24px 48px rgba(0, 0, 0, 0.38);
        overflow: hidden;
      }

      .history-popup-title {
        padding: 14px 16px 12px;
        font-weight: 800;
        color: #f7fbff;
        border-bottom: 1px solid rgba(148, 163, 184, 0.12);
      }

      .history-popup-list {
        max-height: 320px;
        overflow: auto;
      }

      .history-popup-item,
      .history-popup-empty {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        padding: 12px 16px;
        color: #dbe8fb;
        font-size: 0.92rem;
        border-top: 1px solid rgba(148, 163, 184, 0.08);
      }

      .history-popup-empty {
        justify-content: flex-start;
        color: var(--muted);
      }

      /* ------------------------------------------------------------------ */
      /* CHAPTER / NOTE / WRONG QUESTION MODALS                             */
      /* ------------------------------------------------------------------ */

      .chapter-stats-overlay {
        position: fixed;
        inset: 0;
        z-index: 9999;
        background: rgba(5, 10, 20, 0.62);
        backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }

      .chapter-stats-modal,
      .wrong-questions-modal,
      .note-manager-modal {
        width: min(1080px, calc(100vw - 28px));
        max-height: calc(100vh - 40px);
        overflow: auto;
        border-radius: 24px;
        padding: 22px;
      }

      .chapter-stats-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 20px;
      }

      .chapter-stats-head-actions {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .chapter-stats-kicker {
        margin: 0 0 4px;
        color: #7dd3fc;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }

      .chapter-stats-title {
        margin: 0;
        font-size: 1.35rem;
        font-weight: 800;
        color: #f8fbff;
      }

      .chapter-stats-subtitle {
        margin: 6px 0 0;
        color: var(--muted);
        line-height: 1.6;
      }

      .chapter-stats-close,
      .note-manager-primary,
      .note-manager-inline-btn,
      .note-manager-tab {
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.16);
        background: rgba(49, 64, 92, 0.84);
        color: #edf5ff;
        cursor: pointer;
        transition:
          transform 0.14s ease,
          border-color 0.14s ease,
          background 0.14s ease;
      }

      .chapter-stats-close,
      .note-manager-primary {
        min-height: 40px;
        padding: 0 14px;
        font-weight: 700;
      }

      .note-manager-primary:hover,
      .chapter-stats-close:hover,
      .note-manager-inline-btn:hover,
      .note-manager-tab:hover {
        transform: translateY(-1px);
        border-color: rgba(125, 211, 252, 0.28);
        background: rgba(59, 77, 110, 0.94);
      }

      .note-manager-primary {
        background: linear-gradient(
          180deg,
          rgba(59, 130, 246, 0.88) 0%,
          rgba(37, 99, 235, 0.88) 100%
        );
        border-color: rgba(96, 165, 250, 0.3);
      }

      .note-manager-tabs {
        display: flex;
        gap: 10px;
        margin-bottom: 18px;
      }

      .note-manager-tab {
        min-height: 38px;
        padding: 0 14px;
        font-weight: 700;
      }

      .note-manager-tab.active {
        background: rgba(66, 88, 126, 0.96);
        border-color: rgba(125, 211, 252, 0.28);
      }

      .note-manager-composer {
        display: grid;
        gap: 12px;
        margin-bottom: 18px;
      }

      .note-manager-composer.compact {
        margin-top: 12px;
      }

      .note-manager-textarea {
        width: 100%;
        resize: vertical;
        border-radius: 16px;
        border: 1px solid rgba(148, 163, 184, 0.16);
        background: rgba(17, 27, 44, 0.92);
        color: #edf5ff;
        padding: 14px 16px;
        font: inherit;
        line-height: 1.7;
        outline: none;
      }

      .note-manager-textarea:focus {
        border-color: rgba(125, 211, 252, 0.28);
        box-shadow: 0 0 0 3px rgba(125, 211, 252, 0.08);
      }

      .note-manager-actions,
      .note-manager-inline-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .note-manager-list,
      .wrong-question-list,
      .chapter-stats-history-list {
        display: grid;
        gap: 14px;
      }

      .note-manager-item,
      .wrong-question-card,
      .chapter-stats-history-item {
        border-radius: 18px;
        border: 1px solid rgba(148, 163, 184, 0.14);
        background: rgba(20, 30, 49, 0.8);
      }

      .note-manager-item {
        padding: 16px;
      }

      .note-manager-item-head {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 10px;
      }

      .note-manager-item-head strong {
        display: block;
        color: #f5f9ff;
      }

      .note-manager-item-head span {
        display: block;
        margin-top: 4px;
        color: var(--muted);
        font-size: 12px;
      }

      .note-manager-inline-btn {
        min-height: 34px;
        padding: 0 12px;
        font-weight: 700;
      }

      .note-manager-inline-btn.danger {
        color: #ffd7df;
        border-color: rgba(251, 113, 133, 0.22);
        background: rgba(92, 37, 49, 0.6);
      }

      .note-manager-copy {
        margin: 0;
        color: #dce8fb;
        line-height: 1.8;
        white-space: pre-wrap;
      }

      .chapter-stats-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 18px;
      }

      .chapter-stats-tile {
        border-radius: 16px;
        border: 1px solid rgba(148, 163, 184, 0.14);
        background: rgba(20, 30, 49, 0.8);
        padding: 14px;
      }

      .chapter-stats-tile span {
        display: block;
        color: var(--muted);
        font-size: 12px;
        margin-bottom: 6px;
      }

      .chapter-stats-tile strong {
        color: #f7fbff;
        font-size: 1.25rem;
      }

      .chapter-stats-band {
        height: 12px;
        border-radius: 999px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.06);
        display: flex;
        margin-bottom: 10px;
      }

      .chapter-stats-band-fill.correct {
        background: #34d399;
      }

      .chapter-stats-band-fill.incorrect {
        background: #fb7185;
      }

      .chapter-stats-band-fill.skipped {
        background: #94a3b8;
      }

      .chapter-stats-meta {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        color: var(--muted);
        margin-bottom: 18px;
      }

      .chapter-stats-history-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;
        color: #f5f9ff;
        font-weight: 700;
      }

      .chapter-stats-history-item {
        padding: 14px 16px;
        display: flex;
        justify-content: space-between;
        gap: 16px;
      }

      .chapter-stats-history-item strong {
        display: block;
        color: #f5f9ff;
      }

      .chapter-stats-history-item span {
        display: block;
        margin-top: 4px;
        color: var(--muted);
        font-size: 12px;
      }

      .chapter-stats-empty {
        border-radius: 16px;
        border: 1px dashed rgba(148, 163, 184, 0.18);
        background: rgba(20, 30, 49, 0.5);
        color: var(--muted);
        padding: 16px;
        text-align: center;
      }

      .chapter-stats-empty.compact {
        padding: 12px;
        text-align: left;
      }

      .wrong-question-card {
        padding: 16px;
        display: grid;
        gap: 14px;
      }

      .wrong-question-head {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: flex-start;
      }

      .wrong-question-head strong {
        display: block;
        color: #f5f9ff;
      }

      .wrong-question-head span {
        display: block;
        margin-top: 4px;
        color: var(--muted);
        font-size: 12px;
      }

      .wrong-question-badges {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .wrong-badge {
        display: inline-flex;
        align-items: center;
        min-height: 28px;
        padding: 0 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 700;
      }

      .wrong-badge.wrong {
        color: #ffd5dd;
        background: rgba(251, 113, 133, 0.14);
        border: 1px solid rgba(251, 113, 133, 0.24);
      }

      .wrong-badge.correct {
        color: #d8fff0;
        background: rgba(52, 211, 153, 0.14);
        border: 1px solid rgba(52, 211, 153, 0.24);
      }

      .wrong-question-copy {
        margin: 0;
        color: #edf5ff;
        line-height: 1.75;
      }

      .wrong-question-options {
        display: grid;
        gap: 8px;
      }

      .wrong-question-option {
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.14);
        background: rgba(17, 27, 44, 0.8);
        padding: 10px 12px;
        color: #dce8fb;
      }

      .wrong-question-option.correct {
        border-color: rgba(52, 211, 153, 0.28);
        background: rgba(16, 75, 57, 0.22);
      }

      .wrong-question-option.selected {
        border-color: rgba(251, 113, 133, 0.26);
        background: rgba(92, 37, 49, 0.22);
      }

      .wrong-question-notes {
        display: grid;
        gap: 10px;
      }

      .wrong-question-notes-head {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: center;
      }

      .wrong-question-note-list {
        display: grid;
        gap: 10px;
      }

      .wrong-question-note-item {
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.14);
        background: rgba(17, 27, 44, 0.7);
        padding: 12px;
      }

      .wrong-question-note-item p {
        margin: 0 0 10px;
        color: #dce8fb;
        line-height: 1.75;
        white-space: pre-wrap;
      }

      /* ------------------------------------------------------------------ */
      /* RESPONSIVE                                                         */
      /* ------------------------------------------------------------------ */

      @media (max-width: 1100px) {
        .chapter-stats-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 900px) {
        .tree-shell-head,
        .chapter-stats-head,
        .wrong-question-head,
        .note-manager-item-head {
          flex-direction: column;
          align-items: flex-start;
        }

        .tree-shell-note {
          text-align: left;
          max-width: none;
        }

        .nhead {
          flex-direction: column;
          align-items: stretch;
        }

        .nhead-right {
          width: 100%;
          justify-content: space-between;
        }

        .chapter-stats-history-item {
          flex-direction: column;
        }
      }

      @media (max-width: 720px) {
        .mh-wrap {
          width: min(100vw - 16px, 100%);
          padding-top: 12px;
        }

        .tree-shell {
          padding: 16px 12px;
          border-radius: 20px;
        }

        .tree-shell-title {
          font-size: 1.5rem;
        }

        .nhead {
          padding: 14px 12px;
        }

        .tnodes.child {
          margin-left: 10px;
          padding-left: 12px;
        }

        .node-actions {
          flex-wrap: wrap;
        }

        .user-note {
          margin: 0 12px 12px 12px;
        }

        .chapter-stats-modal,
        .wrong-questions-modal,
        .note-manager-modal {
          width: calc(100vw - 16px);
          padding: 16px;
          border-radius: 20px;
        }

        .chapter-stats-grid {
          grid-template-columns: 1fr;
        }
      }

      .concept-card {
        margin-top: 0.35rem;
        padding: 0.95rem 1rem;
        border-radius: 16px;
        border: 1px solid rgba(83, 212, 196, 0.18);
        background: linear-gradient(
          180deg,
          rgba(18, 29, 49, 0.92) 0%,
          rgba(16, 25, 43, 0.96) 100%
        );
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.03),
          0 10px 24px rgba(4, 10, 24, 0.22);
      }

      .concept-title {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 800;
        line-height: 1.45;
        color: #f3f8ff;
        letter-spacing: 0.01em;
      }

      .concept-body {
        margin-top: 0.6rem;
        display: grid;
        gap: 0.45rem;
      }

      .concept-body p {
        margin: 0;
        color: rgba(219, 231, 255, 0.92);
        font-size: 0.92rem;
        line-height: 1.68;
        font-weight: 560;
      }

      .concept-body p + p {
        position: relative;
        padding-left: 1rem;
      }

      .concept-body p + p::before {
        content: "";
        position: absolute;
        left: 0.08rem;
        top: 0.72rem;
        width: 0.38rem;
        height: 0.38rem;
        border-radius: 999px;
        background: #5ad7ff;
        box-shadow: 0 0 0 3px rgba(90, 215, 255, 0.12);
      }
    `}</style>
  );
}

export default DashboardStyles;
