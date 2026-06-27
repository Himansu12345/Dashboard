"use client";

import { useMemo, useState } from "react";
import type {
  ConsistencyDashboardPayload,
  ConsistencyMonth,
} from "@/types/consistency";

interface DailyTestStreakScreenProps {
  dashboard: ConsistencyDashboardPayload | null;
  isLoading: boolean;
  isRefreshing: boolean;
  onBack: () => void;
}

type CalendarCell = {
  key: string;
  label: string;
  date: string | null;
  isCurrentMonth: boolean;
  isActive: boolean;
  isToday: boolean;
};

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function formatMonthHeading(month: ConsistencyMonth | null): string {
  if (!month) return "No Data";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(month.year, month.month - 1, 1)));
}

function getInitialMonthIndex(dashboard: ConsistencyDashboardPayload | null): number {
  if (!dashboard || dashboard.months.length === 0) return 0;

  const todayIndex = dashboard.months.findIndex((month) =>
    month.days.some((day) => day.isToday),
  );
  if (todayIndex >= 0) return todayIndex;

  return dashboard.months.length - 1;
}

function buildCalendarCells(month: ConsistencyMonth | null): CalendarCell[] {
  if (!month) return [];

  const firstDate = new Date(month.year, month.month - 1, 1);
  const startOffset = (firstDate.getDay() + 6) % 7;
  const totalDays = new Date(month.year, month.month, 0).getDate();
  const dayMap = new Map(month.days.map((day) => [day.date, day]));
  const cells: CalendarCell[] = [];

  for (let index = 0; index < startOffset; index += 1) {
    cells.push({
      key: `blank-start-${index}`,
      label: "",
      date: null,
      isCurrentMonth: false,
      isActive: false,
      isToday: false,
    });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const dateValue = `${month.year}-${String(month.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const matchedDay = dayMap.get(dateValue);

    cells.push({
      key: dateValue,
      label: String(day),
      date: dateValue,
      isCurrentMonth: true,
      isActive: matchedDay?.isActive ?? false,
      isToday: matchedDay?.isToday ?? false,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({
      key: `blank-end-${cells.length}`,
      label: "",
      date: null,
      isCurrentMonth: false,
      isActive: false,
      isToday: false,
    });
  }

  return cells;
}

export default function DailyTestStreakScreen({
  dashboard,
  isLoading,
  isRefreshing,
  onBack,
}: DailyTestStreakScreenProps) {
  const [activeMonthIndex, setActiveMonthIndex] = useState(() =>
    getInitialMonthIndex(dashboard),
  );
  const months = dashboard?.months ?? [];
  const safeMonthIndex =
    activeMonthIndex < months.length ? activeMonthIndex : Math.max(0, months.length - 1);
  const activeMonth = months[safeMonthIndex] ?? null;
  const calendarCells = useMemo(() => buildCalendarCells(activeMonth), [activeMonth]);
  const selectedActiveDay =
    activeMonth?.days.find((day) => day.isToday) ??
    activeMonth?.days.find((day) => day.isActive) ??
    null;

  return (
    <section className="tracker-screen tracker-streak-screen">
      <header className="tracker-screen-header">
        <button
          type="button"
          className="tracker-back-button ripple-btn"
          onClick={onBack}
          aria-label="Go back"
        >
          &#8249;
        </button>
        <div>
          <h2 className="tracker-screen-title">DAILY TEST STREAK</h2>
          {isRefreshing ? (
            <p className="tracker-screen-subtitle">Refreshing streak intelligence</p>
          ) : null}
        </div>
      </header>

      <section className="tracker-goal-card">
        <span className="tracker-goal-icon" aria-hidden="true">
          ✓
        </span>
        <div>
          <strong>Goal</strong>
          <p>Attempt at-least 1 test everyday</p>
        </div>
      </section>

      <section className="tracker-streak-metrics">
        <article className="tracker-streak-metric">
          <span className="tracker-metric-icon" aria-hidden="true">
            🔥
          </span>
          <div>
            <strong>
              {isLoading ? "..." : `${dashboard?.summary.currentStreak ?? 0} Days`}
            </strong>
            <p>Current Streak</p>
          </div>
        </article>
        <article className="tracker-streak-metric">
          <span className="tracker-metric-icon" aria-hidden="true">
            ❤️‍🔥
          </span>
          <div>
            <strong>
              {isLoading ? "..." : `${dashboard?.summary.bestStreak ?? 0} Days`}
            </strong>
            <p>Longest Streak</p>
          </div>
        </article>
      </section>

      <section className="tracker-calendar-shell">
        <div className="tracker-calendar-head">
          <button
            type="button"
            className="tracker-month-nav ripple-btn"
            onClick={() => setActiveMonthIndex((value) => Math.max(0, value - 1))}
            disabled={safeMonthIndex <= 0}
            aria-label="Previous month"
          >
            &#8249;
          </button>
          <strong>{formatMonthHeading(activeMonth)}</strong>
          <button
            type="button"
            className="tracker-month-nav ripple-btn"
            onClick={() =>
              setActiveMonthIndex((value) => Math.min(months.length - 1, value + 1))
            }
            disabled={safeMonthIndex >= months.length - 1}
            aria-label="Next month"
          >
            &#8250;
          </button>
        </div>

        <div className="tracker-weekday-row" aria-hidden="true">
          {WEEKDAY_LABELS.map((label, index) => (
            <span key={`${label}-${index}`}>{label}</span>
          ))}
        </div>

        <div className="tracker-calendar-grid">
          {calendarCells.map((cell) =>
            cell.date ? (
              <button
                key={cell.key}
                type="button"
                className={`tracker-day-cell${cell.isActive ? " is-active" : ""}${
                  cell.isToday ? " is-today" : ""
                }`}
                title={cell.date}
              >
                {cell.label}
              </button>
            ) : (
              <span key={cell.key} className="tracker-day-cell is-blank" aria-hidden="true" />
            ),
          )}
        </div>

        <div className="tracker-calendar-footer">
          <span className="tracker-footer-dot" />
          <p>
            {selectedActiveDay
              ? `${selectedActiveDay.attemptCount} attempts on ${selectedActiveDay.date}`
              : "No recorded activity for this month yet."}
          </p>
        </div>
      </section>
    </section>
  );
}
