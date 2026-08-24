import { memo } from "react";
import DateTooltip from "./DateTooltip";
import { getMissionCompletionColor } from "./activityCalendarUtils";
import type { PlannerDayCompletion } from "@/types/activityCalendar";

interface DateBlockProps {
  dateKey?: string;
  count: number;
  completion?: PlannerDayCompletion;
  isBlank: boolean;
  onSelectDate: (dateKey: string | null) => void;
}

function DateBlock({
  dateKey,
  count: _count,
  completion,
  isBlank,
  onSelectDate,
}: DateBlockProps) {
  if (isBlank) {
    return <div className="heatmap-blank" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      className="heatmap-date-btn heatmap-block"
      style={{ background: getMissionCompletionColor(completion, dateKey) }}
      onClick={() => {
        if (dateKey) {
          onSelectDate(dateKey);
        }
      }}
      title={DateTooltip({ dateKey, completion })}
      aria-label={`Open analytics for ${dateKey}`}
    />
  );
}

export default memo(DateBlock);
