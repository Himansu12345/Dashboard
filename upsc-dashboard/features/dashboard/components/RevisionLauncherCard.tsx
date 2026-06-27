interface RevisionLauncherCardProps {
  trackedTopicCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  onOpen: () => void;
}

export default function RevisionLauncherCard({
  trackedTopicCount,
  isLoading,
  isRefreshing,
  onOpen,
}: RevisionLauncherCardProps) {
  return (
    <section className="revision-launcher-card glass-panel">
      <div className="table-header-row revision-launcher-head">
        <div className="table-heading-group">
          <h3 className="section-title">Intelligent Revision Engine</h3>
          <p className="section-note">
            Open your AI-powered spaced-repetition queue in a dedicated focus box.
          </p>
        </div>
        <div className="table-header-actions">
          <span className="table-summary-pill">
            {isLoading ? "Loading revision graph..." : `${trackedTopicCount} tracked topics`}
          </span>
          {isRefreshing ? <span className="hero-chip is-live">Refreshing queue</span> : null}
          <button
            type="button"
            className="review-btn ripple-btn revision-launcher-button"
            onClick={onOpen}
          >
            Open Revision Engine
          </button>
        </div>
      </div>
    </section>
  );
}
