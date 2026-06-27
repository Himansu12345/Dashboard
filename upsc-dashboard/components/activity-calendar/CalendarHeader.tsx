import type { ChangeEvent } from "react";

interface CalendarHeaderProps {
  totalSubmissions: number;
  selectedYear: number;
  currentYear: number;
  onYearChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}

export default function CalendarHeader({
  totalSubmissions,
  selectedYear,
  currentYear,
  onYearChange,
}: CalendarHeaderProps) {
  return (
    <div className="heatmap-header">
      <h3 className="heatmap-title">
        Activity Pulse: {totalSubmissions} submissions in {selectedYear}
      </h3>

      <select
        value={selectedYear}
        onChange={onYearChange}
        className="field-control heatmap-year"
        title="Switch year"
      >
        {Array.from({ length: 6 }).map((_, index) => {
          const year = currentYear - index;
          return (
            <option key={year} value={year}>
              {year}
            </option>
          );
        })}
      </select>
    </div>
  );
}
