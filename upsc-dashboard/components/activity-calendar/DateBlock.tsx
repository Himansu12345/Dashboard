import { memo } from "react";
import DateTooltip from "./DateTooltip";
import { getHeatColor } from "./activityCalendarUtils";

interface DateBlockProps {
  dateKey?: string;
  count: number;
  isBlank: boolean;
  onSelectDate: (dateKey: string | null) => void;
}

function DateBlock({ dateKey, count, isBlank, onSelectDate }: DateBlockProps) {
  if (isBlank) {
    return <div className="heatmap-blank" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      className="heatmap-date-btn heatmap-block"
      style={{ background: getHeatColor(count) }}
      onClick={() => {
        if (dateKey) {
          onSelectDate(dateKey);
        }
      }}
      title={DateTooltip({ dateKey, count })}
      aria-label={`Open analytics for ${dateKey}`}
    />
  );
}

export default memo(DateBlock);
