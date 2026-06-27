"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MotionCard, MotionList, MotionListItem } from "@/components/motion/MotionWrappers";
import ConsistencyHeatmap from "@/features/consistency/components/ConsistencyHeatmap";
import {
  formatMonthLabel,
  formatShortDate,
  getActiveMonthIndex,
  getConsistencyTone,
  getDefaultSelectedDay,
  getHeatmapCellClassName,
  getMomentumTone,
} from "@/features/consistency/consistencyUtils";
import type {
  ConsistencyDashboardPayload,
  ConsistencyDayActivity,
  ConsistencyTab,
} from "@/types/consistency";

interface ConsistencyDashboardProps {
  dashboard: ConsistencyDashboardPayload | null;
  isLoading: boolean;
  isRefreshing: boolean;
  activeTab: ConsistencyTab;
  onTabChange: (tab: ConsistencyTab) => void;
}

const TAB_ITEMS: Array<{ id: ConsistencyTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "heatmap", label: "Heatmap" },
  { id: "streaks", label: "Streaks" },
  { id: "momentum", label: "Momentum" },
];

function buildDeltaLabel(delta: number): string {
  if (delta > 0) return `+${delta.toFixed(1)} trend`;
  if (delta < 0) return `${delta.toFixed(1)} trend`;
  return "Flat trend";
}

function getMomentumArrow(state: string): string {
  if (state === "Momentum Rising") return "\u2197";
  if (state === "Momentum Falling") return "\u2198";
  return "\u2192";
}

export default function ConsistencyDashboard({
  dashboard,
  isLoading,
  isRefreshing,
  activeTab,
  onTabChange,
}: ConsistencyDashboardProps) {
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);
  const [viewedMonthKey, setViewedMonthKey] = useState<string | null>(null);

  const allDays = useMemo(
    () => dashboard?.months.flatMap((month) => month.days) || [],
    [dashboard],
  );
  const selectedDay = useMemo(() => {
    if (!dashboard) return null;
    return allDays.find((day) => day.date === selectedDayDate) || getDefaultSelectedDay(dashboard.months);
  }, [allDays, dashboard, selectedDayDate]);
  const activeMonthIndex = useMemo(() => {
    if (!dashboard) return 0;

    if (viewedMonthKey) {
      const viewedIndex = dashboard.months.findIndex((month) => month.key === viewedMonthKey);
      if (viewedIndex >= 0) return viewedIndex;
    }

    return getActiveMonthIndex(dashboard.months, selectedDay);
  }, [dashboard, selectedDay, viewedMonthKey]);
  const activeMonth = dashboard?.months[activeMonthIndex] || null;
  const selectedDayDetails =
    selectedDay && activeMonth?.key === selectedDay.monthKey
      ? selectedDay
      : activeMonth?.days.find((day) => day.isToday) ||
        activeMonth?.days.find((day) => day.isActive) ||
        activeMonth?.days[activeMonth?.days.length - 1] ||
        null;

  const trendData = useMemo(
    () =>
      (dashboard?.recentTrend || []).map((entry) => ({
        ...entry,
        shortDate: formatShortDate(entry.date),
      })),
    [dashboard?.recentTrend],
  );

  const consistencyTone = dashboard ? getConsistencyTone(dashboard.summary.consistencyState) : "teal";
  const momentumTone = dashboard ? getMomentumTone(dashboard.summary.momentumState) : "teal";

  if (isLoading || !dashboard) {
    return (
      <section className="consistency-os-shell">
        <div className="consistency-empty-state glass-panel">
          Preparing your premium consistency operating system...
        </div>
      </section>
    );
  }

  return (
    <section className="consistency-os-shell">
      <div className="consistency-os-header">
        <div>
          <p className="page-kicker">Discipline Intelligence</p>
          <h3 className="consistency-os-title">Consistency &amp; Streak System</h3>
          <p className="consistency-os-note">
            Calm productivity intelligence for revision consistency, long-term momentum, and retention discipline.
          </p>
        </div>
        <div className="page-hero-status">
          <span className={`hero-chip consistency-chip tone-${consistencyTone}`}>
            {dashboard.summary.consistencyState}
          </span>
          <span className={`hero-chip consistency-chip tone-${momentumTone}`}>
            {dashboard.summary.momentumState}
          </span>
          {isRefreshing ? <span className="hero-chip is-live">Refreshing discipline graph</span> : null}
        </div>
      </div>

      <div className="consistency-tab-row" role="tablist" aria-label="Consistency sections">
        {TAB_ITEMS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`consistency-tab ripple-btn ${activeTab === tab.id ? "is-active" : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" || activeTab === "streaks" ? (
        <MotionList className="consistency-summary-grid">
          <MotionListItem>
            <MotionCard className={`consistency-summary-card tone-${consistencyTone}`}>
              <p className="metric-kicker">Consistency Score</p>
              <h4 className="metric-value">{dashboard.summary.consistencyScore}%</h4>
              <p className="metric-label">{dashboard.summary.consistencyState}</p>
              <p className="metric-meta">
                Weighted by activity frequency, streak continuity, regularity, and revision rhythm.
              </p>
            </MotionCard>
          </MotionListItem>

          <MotionListItem>
            <MotionCard className="consistency-summary-card tone-mint">
              <p className="metric-kicker">Current Streak</p>
              <h4 className="metric-value">{dashboard.summary.currentStreak}d</h4>
              <p className="metric-label">Best run: {dashboard.summary.bestStreak} days</p>
              <p className="metric-meta">
                Breaking this chain costs momentum. Keeping it alive compounds discipline.
              </p>
            </MotionCard>
          </MotionListItem>

          <MotionListItem>
            <MotionCard className="consistency-summary-card tone-amber">
              <p className="metric-kicker">Active This Month</p>
              <h4 className="metric-value">{dashboard.summary.activeThisMonth}</h4>
              <p className="metric-label">{dashboard.summary.missedDays} missed days in tracked range</p>
              <p className="metric-meta">
                Active days drive the visual habit loop and strengthen your retention cadence.
              </p>
            </MotionCard>
          </MotionListItem>

          <MotionListItem>
            <MotionCard className={`consistency-summary-card tone-${momentumTone}`}>
              <p className="metric-kicker">Preparation Momentum</p>
              <h4 className="metric-value">{dashboard.summary.momentumState.replace("Momentum ", "")}</h4>
              <p className="metric-label">{buildDeltaLabel(dashboard.summary.momentumDelta)}</p>
              <p className="metric-meta">
                Trend is derived from recent activity pressure, continuity, and recovery after gaps.
              </p>
            </MotionCard>
          </MotionListItem>
        </MotionList>
      ) : null}

      {activeTab === "overview" ? (
        <div className="consistency-overview-grid">
          <MotionCard className="consistency-panel">
            <div className="table-header-row">
              <div className="table-heading-group">
                <h4 className="section-title">Achievement Rail</h4>
                <p className="section-note">
                  Quiet rewards that reinforce discipline without turning the dashboard into a game.
                </p>
              </div>
            </div>
            <div className="consistency-achievement-grid">
              {dashboard.achievements.map((achievement) => (
                <article
                  key={achievement.id}
                  className={`consistency-achievement-card tone-${achievement.tone} ${
                    achievement.unlocked ? "is-unlocked" : "is-locked"
                  }`}
                >
                  <p className="consistency-achievement-title">{achievement.title}</p>
                  <p className="consistency-achievement-copy">{achievement.description}</p>
                  <span className="consistency-achievement-meta">
                    {achievement.unlocked
                      ? achievement.unlockedAt
                        ? `Unlocked ${formatShortDate(achievement.unlockedAt)}`
                        : "Unlocked"
                      : "Still building"}
                  </span>
                </article>
              ))}
            </div>
          </MotionCard>

          <MotionCard className="consistency-panel">
            <div className="table-header-row">
              <div className="table-heading-group">
                <h4 className="section-title">Strongest Week</h4>
                <p className="section-note">
                  Your best seven-day discipline burst across activity intensity and active day continuity.
                </p>
              </div>
            </div>
            <div className="consistency-highlight-strip">
              <div>
                <p className="consistency-highlight-value">{dashboard.summary.strongestWeek.label}</p>
                <p className="consistency-highlight-copy">
                  {dashboard.summary.strongestWeek.activeDays} active days and{" "}
                  {Math.round(dashboard.summary.strongestWeek.intensityScore)} intensity points.
                </p>
              </div>
              <div className="notes-hub-summary">
                <span className="hero-chip muted">
                  {formatShortDate(dashboard.summary.strongestWeek.startDate)}
                </span>
                <span className="hero-chip muted">
                  {formatShortDate(dashboard.summary.strongestWeek.endDate)}
                </span>
              </div>
            </div>
            <div className="consistency-mini-heatmap">
              {dashboard.months[dashboard.months.length - 1]?.days.slice(-28).map((day) => (
                <span
                  key={day.date}
                  className={getHeatmapCellClassName(day.activityLevel, day.isToday)}
                  title={`${formatShortDate(day.date)} - ${day.studyDurationMinutes} min`}
                />
              ))}
            </div>
          </MotionCard>
        </div>
      ) : null}

      {activeTab === "heatmap" ? (
        <div className="consistency-heatmap-layout">
          <MotionCard className="consistency-panel">
            <div className="consistency-month-header">
              <div>
                <h4 className="section-title">Activity Heatmap</h4>
                <p className="section-note">
                  GitHub-style revision activity map with premium hover response and day-level study impact.
                </p>
              </div>
              <div className="consistency-month-actions">
                <button
                  type="button"
                  className="month-slider-btn ripple-btn"
                  onClick={() => setViewedMonthKey(dashboard.months[Math.max(0, activeMonthIndex - 1)]?.key || null)}
                  disabled={activeMonthIndex <= 0}
                >
                  &#8249;
                </button>
                <span className="table-summary-pill">
                  {activeMonth ? formatMonthLabel(activeMonth.key) : "No month"}
                </span>
                <button
                  type="button"
                  className="month-slider-btn ripple-btn"
                  onClick={() =>
                    setViewedMonthKey(
                      dashboard.months[Math.min(dashboard.months.length - 1, activeMonthIndex + 1)]?.key || null,
                    )
                  }
                  disabled={activeMonthIndex >= dashboard.months.length - 1}
                >
                  &#8250;
                </button>
              </div>
            </div>

            <ConsistencyHeatmap
              month={activeMonth}
              selectedDay={selectedDayDetails}
              onSelectDay={(day: ConsistencyDayActivity | null) => {
                setSelectedDayDate(day?.date || null);
                setViewedMonthKey(day?.monthKey || null);
              }}
            />

            <div className="consistency-legend-row">
              <span className="legend-row-label">Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <span key={level} className={getHeatmapCellClassName(level, false)} />
              ))}
              <span className="legend-row-label">More</span>
            </div>
          </MotionCard>

          <MotionCard className="consistency-panel consistency-day-panel">
            <div className="table-header-row">
              <div className="table-heading-group">
                <h4 className="section-title">
                  {selectedDayDetails ? formatShortDate(selectedDayDetails.date) : "Daily Focus"}
                </h4>
                <p className="section-note">
                  Click any day to inspect revised topics, revision count, consistency pressure, and retention impact.
                </p>
              </div>
            </div>

            {selectedDayDetails ? (
              <div className="consistency-day-details">
                <div className="consistency-day-metrics">
                  <div className="consistency-day-metric">
                    <span>Focus Time</span>
                    <strong>{selectedDayDetails.studyDurationMinutes} min</strong>
                  </div>
                  <div className="consistency-day-metric">
                    <span>Revision Count</span>
                    <strong>{selectedDayDetails.revisionCount}</strong>
                  </div>
                  <div className="consistency-day-metric">
                    <span>Topics Revised</span>
                    <strong>{selectedDayDetails.revisedTopicsCount}</strong>
                  </div>
                  <div className="consistency-day-metric">
                    <span>Consistency Impact</span>
                    <strong>{selectedDayDetails.consistencyImpact}%</strong>
                  </div>
                  <div className="consistency-day-metric">
                    <span>Retention Impact</span>
                    <strong>{selectedDayDetails.retentionImpact}%</strong>
                  </div>
                  <div className="consistency-day-metric">
                    <span>Revision Quality</span>
                    <strong>{selectedDayDetails.qualityScore}%</strong>
                  </div>
                </div>

                <div className="consistency-topic-list">
                  {selectedDayDetails.topics.length > 0 ? (
                    selectedDayDetails.topics.map((topic) => (
                      <span key={topic} className="consistency-topic-chip">
                        {topic}
                      </span>
                    ))
                  ) : (
                    <p className="review-popup-empty">
                      No revision or practice activity was recorded for this day.
                    </p>
                  )}
                </div>
              </div>
            ) : null}
          </MotionCard>
        </div>
      ) : null}

      {activeTab === "streaks" ? (
        <div className="consistency-overview-grid">
          <MotionCard className="consistency-panel">
            <div className="table-header-row">
              <div className="table-heading-group">
                <h4 className="section-title">Streak Intelligence</h4>
                <p className="section-note">
                  Designed to create emotional attachment to continuity and make missed days feel expensive.
                </p>
              </div>
            </div>
            <div className="consistency-streak-grid">
              <div className="consistency-streak-card">
                <span>Current Streak</span>
                <strong>{dashboard.summary.currentStreak} Days</strong>
              </div>
              <div className="consistency-streak-card">
                <span>Best Streak</span>
                <strong>{dashboard.summary.bestStreak} Days</strong>
              </div>
              <div className="consistency-streak-card">
                <span>Comeback Streak</span>
                <strong>{dashboard.summary.comebackStreak} Days</strong>
              </div>
              <div className="consistency-streak-card">
                <span>Active Days</span>
                <strong>{dashboard.summary.activeDays}</strong>
              </div>
            </div>
          </MotionCard>

          <MotionCard className="consistency-panel">
            <div className="table-header-row">
              <div className="table-heading-group">
                <h4 className="section-title">Streak Archive</h4>
                <p className="section-note">
                  Previous runs, completed streaks, and comeback stretches stored as discipline history.
                </p>
              </div>
            </div>
            <div className="consistency-history-list">
              {dashboard.streakHistory.length > 0 ? (
                dashboard.streakHistory.map((item) => (
                  <article key={item.streakKey} className="consistency-history-item">
                    <div>
                      <p className="consistency-history-title">
                        {item.length} Day {item.type === "comeback" ? "Comeback" : "Streak"}
                      </p>
                      <p className="consistency-history-meta">
                        {formatShortDate(item.startDate)} to {formatShortDate(item.endDate)}
                      </p>
                    </div>
                    <span className={`hero-chip muted ${item.status === "active" ? "is-live" : ""}`}>
                      {item.status === "active" ? "Active now" : "Completed"}
                    </span>
                  </article>
                ))
              ) : (
                <p className="review-popup-empty">Streak history will appear after your first active run.</p>
              )}
            </div>
          </MotionCard>
        </div>
      ) : null}

      {activeTab === "momentum" ? (
        <div className="consistency-overview-grid">
          <MotionCard className="consistency-panel">
            <div className="table-header-row">
              <div className="table-heading-group">
                <h4 className="section-title">Momentum Curve</h4>
                <p className="section-note">
                  Recent discipline pressure and recovery trend across the last tracked sessions.
                </p>
              </div>
            </div>
            <div className="consistency-trend-chart">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={trendData} margin={{ top: 12, right: 10, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="consistencyTrendFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="rgba(0,229,255,0.55)" />
                      <stop offset="100%" stopColor="rgba(0,229,255,0.02)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,205,255,0.12)" />
                  <XAxis dataKey="shortDate" tickLine={false} axisLine={false} stroke="#9ac7ef" />
                  <YAxis tickLine={false} axisLine={false} stroke="#9ac7ef" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(7, 14, 29, 0.96)",
                      border: "1px solid rgba(110, 195, 255, 0.24)",
                      borderRadius: "14px",
                      color: "#eaf7ff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="intensityScore"
                    stroke="#69edff"
                    strokeWidth={2.6}
                    fill="url(#consistencyTrendFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </MotionCard>

          <MotionCard className="consistency-panel">
            <div className="table-header-row">
              <div className="table-heading-group">
                <h4 className="section-title">Momentum Reading</h4>
                <p className="section-note">
                  Trend state reflects streak growth, recent activity, and how well you recover after friction.
                </p>
              </div>
            </div>
            <div className="consistency-momentum-stack">
              <div className={`consistency-momentum-banner tone-${momentumTone}`}>
                <span className="consistency-arrow">
                  {getMomentumArrow(dashboard.summary.momentumState)}
                </span>
                <div>
                  <strong>{dashboard.summary.momentumState}</strong>
                  <p>{buildDeltaLabel(dashboard.summary.momentumDelta)}</p>
                </div>
              </div>
              <div className="consistency-day-metrics">
                <div className="consistency-day-metric">
                  <span>Total Focus Time</span>
                  <strong>{dashboard.summary.totalRevisionMinutes} min</strong>
                </div>
                <div className="consistency-day-metric">
                  <span>Comeback Strength</span>
                  <strong>{dashboard.summary.comebackStreak}d</strong>
                </div>
                <div className="consistency-day-metric">
                  <span>Current Discipline Run</span>
                  <strong>{dashboard.summary.currentStreak}d</strong>
                </div>
              </div>
            </div>
          </MotionCard>
        </div>
      ) : null}
    </section>
  );
}
