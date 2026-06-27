import {
  IconBrain,
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
  onToggleRecall,
  onToggleSmartMode,
  onToggleStarFilter,
}: DashboardControlsProps) {
  return (
    <section className="controls hide-in-zen" aria-label="Dashboard controls">
      <div className="search-wrapper">
        <IconSearch size={16} className="search-icon" aria-hidden="true" />
        <input
          className="search-input"
          type="text"
          placeholder="Search topics, points, or notes..."
          value={searchQuery}
          onChange={(event) => onSearch(event.target.value)}
        />
      </div>
      <div className="btn-group">
        <button className="control-btn" onClick={onExpandAll}>
          <IconFoldDown size={16} /> Expand All
        </button>
        <button className="control-btn" onClick={onCollapseAll}>
          <IconFoldUp size={16} /> Collapse All
        </button>
        <button
          className={`control-btn ${isRecall ? "active" : ""}`}
          id="btnRecall"
          onClick={onToggleRecall}
        >
          <IconBrain size={16} /> Active Recall
        </button>
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
