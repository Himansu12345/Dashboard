import { useEffect, useState, type MouseEvent } from "react";

import {
  IconBrain,
  IconDownload,
  IconFoldDown,
  IconFoldUp,
  IconSearch,
  IconStarFilled,
} from "../icons";

type DashboardControlsProps = {
  searchQuery: string;
  isRecall: boolean;
  isSmartModeEnabled: boolean;
  canToggleSmartMode: boolean;
  starFilter: boolean;
  onSearch: (value: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onDownloadNotes: () => void;
  onDownloadQuiz: () => void | Promise<void>;
  onToggleRecall: () => void;
  onToggleSmartMode: () => void;
  onToggleStarFilter: () => void;
};
export function DashboardControls({
  searchQuery,
  isRecall,
  isSmartModeEnabled,
  canToggleSmartMode,
  starFilter,
  onSearch,
  onExpandAll,
  onCollapseAll,
  onDownloadNotes,
  onDownloadQuiz,
  onToggleRecall,
  onToggleSmartMode,
  onToggleStarFilter,
}: DashboardControlsProps) {
  // ⚡ PRO POWER FIX: Decouple the fast typing UI from the heavy parent search execution
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearch(localSearch);
      }
    }, 250); // Filters the massive tree only after typing stops
    return () => clearTimeout(handler);
  }, [localSearch, onSearch, searchQuery]);

  useEffect(() => {
    if (!isDownloadMenuOpen) return;

    const handleDocumentClick = () => setIsDownloadMenuOpen(false);
    document.addEventListener("click", handleDocumentClick);

    return () => document.removeEventListener("click", handleDocumentClick);
  }, [isDownloadMenuOpen]);

  const handleDownloadMenuClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <section className="controls hide-in-zen" aria-label="Dashboard controls">
      <div className="search-wrapper">
        <IconSearch size={16} className="search-icon" aria-hidden="true" />
        <input
          className="search-input"
          type="text"
          placeholder="Search topics, points, or notes..."
          value={localSearch}
          onChange={(event) => setLocalSearch(event.target.value)}
        />
      </div>
      <div className="btn-group">
        <button className="control-btn" onClick={onExpandAll}>
          <IconFoldDown size={16} /> Expand All
        </button>
        <button className="control-btn" onClick={onCollapseAll}>
          <IconFoldUp size={16} /> Collapse All
        </button>
        <div className="download-menu" onClick={handleDownloadMenuClick}>
          <button
            className="control-btn"
            onClick={() => setIsDownloadMenuOpen((value) => !value)}
            aria-expanded={isDownloadMenuOpen}
            aria-haspopup="menu"
          >
            <IconDownload size={16} /> Download
          </button>
          {isDownloadMenuOpen ? (
            <div className="download-menu-panel" role="menu">
              <button
                type="button"
                className="download-menu-option"
                role="menuitem"
                onClick={() => {
                  setIsDownloadMenuOpen(false);
                  onDownloadNotes();
                }}
              >
                Note
              </button>
              <button
                type="button"
                className="download-menu-option"
                role="menuitem"
                onClick={() => {
                  setIsDownloadMenuOpen(false);
                  void onDownloadQuiz();
                }}
              >
                Quiz
              </button>
            </div>
          ) : null}
        </div>
        {/* <button
          className={`control-btn ${isRecall ? "active" : ""}`}
          id="btnRecall"
          onClick={onToggleRecall}
        >
          <IconBrain size={16} /> Active Recall
        </button> */}
        <button
          className={`control-btn ${starFilter ? "active" : ""}`}
          id="btnStarFilter"
          onClick={onToggleStarFilter}
        >
          <IconStarFilled size={16} /> Starred
        </button>
      </div>
      {canToggleSmartMode ? (
        <button
          type="button"
          className={`smart-mode-toggle ${isSmartModeEnabled ? "active" : ""}`}
          onClick={onToggleSmartMode}
          aria-pressed={isSmartModeEnabled}
          aria-label={`Smart mode ${isSmartModeEnabled ? "on" : "off"}`}
        >
          <div className="smart-mode-copy">
            <span className="smart-mode-kicker">Notes Mode</span>
            <strong className="smart-mode-title">Smart Mode</strong>
            <span className="smart-mode-subtitle">
              {isSmartModeEnabled
                ? "ON - showing smart recall notes"
                : "OFF - showing normal notes"}
            </span>
          </div>
          <div className="smart-mode-switch" aria-hidden="true">
            <span className="smart-mode-switch-track">
              <span className="smart-mode-switch-thumb" />
            </span>
            <span className="smart-mode-state">
              {isSmartModeEnabled ? "ON" : "OFF"}
            </span>
          </div>
        </button>
      ) : null}
    </section>
  );
}
