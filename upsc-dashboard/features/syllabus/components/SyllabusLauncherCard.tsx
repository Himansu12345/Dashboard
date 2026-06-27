import type {
  SyllabusDashboardPayload,
  SyllabusTab,
} from "@/types/syllabus";

interface SyllabusLauncherCardProps {
  dashboard: SyllabusDashboardPayload | null;
  isLoading: boolean;
  isRefreshing: boolean;
  onOpen: (tab: SyllabusTab) => void;
}

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export default function SyllabusLauncherCard({
  dashboard,
  isLoading,
  isRefreshing,
  onOpen,
}: SyllabusLauncherCardProps) {
  const summary = dashboard?.summary ?? null;
  const completedPercentage = clampProgress(
    summary && summary.totalTopics > 0
      ? (summary.masteredTopics / summary.totalTopics) * 100
      : 0,
  );
  const ringStyle = {
    background: `conic-gradient(from 180deg, rgba(24, 236, 200, 0.92) 0deg ${
      completedPercentage * 3.6
    }deg, rgba(24, 236, 200, 0.14) ${completedPercentage * 3.6}deg 360deg)`,
  };

  return (
    <button
      type="button"
      className="syllabus-launcher-card home-feature-card glass-panel ripple-btn"
      onClick={() => onOpen("tree")}
      aria-label="Open syllabus tracker"
    >
      <div className="home-feature-main">
        <div className="home-feature-copy">
          <div className="home-feature-meta">
            <h3 className="home-feature-title">Syllabus Tracker</h3>
            {isRefreshing ? (
              <span className="hero-chip is-live">Refreshing mastery graph</span>
            ) : null}
          </div>
          <p className="syllabus-launcher-progress">
            Completed:{" "}
            <strong>{isLoading ? "Loading..." : formatPercent(completedPercentage)}</strong>
          </p>
          <span className="syllabus-launcher-cta">OPEN TRACKER</span>
          <p className="home-feature-note">
            {isLoading
              ? "Mapping your syllabus mastery."
              : `${summary?.masteredTopics ?? 0}/${summary?.totalTopics ?? 0} topics mastered • ${summary?.strongestSubject || "No strongest subject yet"}`}
          </p>
        </div>

        <div className="home-feature-visual syllabus-launcher-visual">
          <span className="syllabus-launcher-ring" style={ringStyle}>
            <span className="syllabus-launcher-ring-core">
              {isLoading ? "..." : `${Math.round(completedPercentage)}%`}
            </span>
          </span>
        </div>
      </div>
    </button>
  );
}
