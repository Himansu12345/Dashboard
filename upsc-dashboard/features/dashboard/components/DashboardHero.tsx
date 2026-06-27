interface DashboardHeroProps {
  totalCount: number;
  filteredCount: number;
  isRefreshing: boolean;
}

export default function DashboardHero(_props: DashboardHeroProps) {
  return (
    <div className="page-hero">
      {/* <div className="page-hero-main">
        <div>
          <p className="page-kicker">Overview</p>
          <h2 className="page-title">Performance Radar</h2>
        </div>
        <div className="page-hero-status" aria-live="polite">
          <span className="hero-chip">{totalCount} attempts captured</span>
          <span className="hero-chip muted">{filteredCount} in current view</span>
          {isRefreshing ? <span className="hero-chip is-live">Syncing live</span> : null}
        </div>
      </div> */}
    </div>
  );
}
