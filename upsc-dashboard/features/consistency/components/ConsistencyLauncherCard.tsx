import type {
  ConsistencyDashboardPayload,
  ConsistencyTab,
} from "@/types/consistency";

interface ConsistencyLauncherCardProps {
  dashboard: ConsistencyDashboardPayload | null;
  isLoading: boolean;
  isRefreshing: boolean;
  onOpen: (tab: ConsistencyTab) => void;
}

type WeekDayBadge = {
  key: string;
  label: string;
  isActive: boolean;
  isToday: boolean;
};

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const DAY_IN_MS = 24 * 60 * 60 * 1000;

function toIsoDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfWeek(date: Date): Date {
  const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = normalized.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  normalized.setDate(normalized.getDate() + offset);
  return normalized;
}

function buildWeekBadges(
  dashboard: ConsistencyDashboardPayload | null,
): WeekDayBadge[] {
  const activityByDate = new Map<string, boolean>();

  for (const month of dashboard?.months ?? []) {
    for (const day of month.days) {
      activityByDate.set(day.date, day.isActive);
    }
  }

  const weekStart = startOfWeek(new Date());
  const todayKey = toIsoDateString(new Date());

  return WEEKDAY_LABELS.map((label, index) => {
    const currentDate = new Date(weekStart.getTime() + index * DAY_IN_MS);
    const dateKey = toIsoDateString(currentDate);

    return {
      key: dateKey,
      label,
      isActive: activityByDate.get(dateKey) ?? false,
      isToday: dateKey === todayKey,
    };
  });
}

function FlameIcon() {
  return (
    <svg viewBox="0 0 140 160" aria-hidden="true" className="consistency-launcher-flame">
      <path
        className="consistency-launcher-flame-outer"
        d="M92 10c8 23-4 35-4 49 0 9 4 15 12 20 14 9 24 26 24 43 0 23-18 38-46 38-33 0-56-22-56-54 0-19 10-34 26-49 10-9 18-22 20-35 2-10 2-18 0-25 15 8 20 24 19 40 13-7 22-18 24-27Z"
      />
      <path
        className="consistency-launcher-flame-inner"
        d="M74 59c9 15-3 22-3 33 0 5 3 9 9 13 9 6 15 15 15 25 0 16-12 27-30 27-22 0-36-14-36-35 0-13 7-23 18-32 7-6 13-14 14-22 1-6 1-11 0-16 9 5 13 16 13 27Z"
      />
    </svg>
  );
}

export default function ConsistencyLauncherCard({
  dashboard,
  isLoading,
  isRefreshing,
  onOpen,
}: ConsistencyLauncherCardProps) {
  const summary = dashboard?.summary ?? null;
  const weekBadges = buildWeekBadges(dashboard);
  const streakLabel = isLoading
    ? "Loading streak..."
    : `${summary?.currentStreak ?? 0} Day${summary?.currentStreak === 1 ? "" : "s"}`;

  return (
    <button
      type="button"
      className="consistency-launcher-card home-feature-card glass-panel ripple-btn"
      onClick={() => onOpen("streaks")}
      aria-label="Open current streak dashboard"
    >
      <div className="home-feature-main">
        <div className="home-feature-copy">
          <div className="home-feature-meta">
            <h3 className="home-feature-title">Current Streak</h3>
            {isRefreshing ? (
              <span className="hero-chip is-live">Refreshing streaks</span>
            ) : null}
          </div>
          <p className="consistency-launcher-streak">{streakLabel}</p>
          <div className="consistency-launcher-week" aria-label="This week activity">
            {weekBadges.map((day) => (
              <span
                key={day.key}
                className={`consistency-launcher-day${
                  day.isActive ? " is-active" : ""
                }${day.isToday ? " is-today" : ""}`}
              >
                {day.label}
              </span>
            ))}
          </div>
          <p className="home-feature-note">
            {isLoading
              ? "Computing your discipline rhythm."
              : `${summary?.consistencyState ?? "Discipline loading"} • Best streak ${summary?.bestStreak ?? 0} days`}
          </p>
        </div>

        <div className="home-feature-visual consistency-launcher-visual">
          <FlameIcon />
          <span className="home-feature-hint">Tap to open streaks</span>
        </div>
      </div>
    </button>
  );
}
