import { useMemo } from "react";
import type { ConsistencyDayActivity, ConsistencyMonth } from "@/types/consistency";
import {
  formatShortDate,
  getHeatmapCellClassName,
  getMonthGrid,
} from "@/features/consistency/consistencyUtils";

interface ConsistencyHeatmapProps {
  month: ConsistencyMonth | null;
  selectedDay: ConsistencyDayActivity | null;
  onSelectDay: (day: ConsistencyDayActivity) => void;
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default function ConsistencyHeatmap({
  month,
  selectedDay,
  onSelectDay,
}: ConsistencyHeatmapProps) {
  const weeks = useMemo(() => (month ? getMonthGrid(month) : []), [month]);

  if (!month) {
    return (
      <div className="consistency-heatmap-empty">
        No heatmap data is available yet.
      </div>
    );
  }

  return (
    <div className="consistency-heatmap-shell">
      <div className="consistency-heatmap-weekdays" aria-hidden="true">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="consistency-heatmap-grid" role="grid" aria-label={`${month.label} activity heatmap`}>
        {weeks.map((week, weekIndex) => (
          <div key={`${month.key}-${weekIndex}`} className="consistency-heatmap-week" role="row">
            {week.map((day, dayIndex) =>
              day ? (
                <button
                  key={day.date}
                  type="button"
                  className={`${getHeatmapCellClassName(day.activityLevel, day.isToday)} ${
                    selectedDay?.date === day.date ? "is-selected" : ""
                  }`}
                  onClick={() => onSelectDay(day)}
                  title={`${formatShortDate(day.date)} - ${day.isActive ? `${day.studyDurationMinutes} focus min` : "No activity"}`}
                  role="gridcell"
                  aria-label={`${formatShortDate(day.date)}. ${
                    day.isActive
                      ? `${day.revisedTopicsCount} topics, ${day.studyDurationMinutes} minutes`
                      : "No activity"
                  }`}
                />
              ) : (
                <span
                  key={`${month.key}-${weekIndex}-${dayIndex}`}
                  className="consistency-heatmap-cell is-empty"
                  aria-hidden="true"
                />
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
