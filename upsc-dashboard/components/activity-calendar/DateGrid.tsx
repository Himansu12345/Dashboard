import { useMemo } from "react";
import useActivityCalendarContext from "./useActivityCalendarContext";
import DateBlock from "./DateBlock";
import { formatDate } from "./activityCalendarUtils";
import type { DateCell } from "@/types/activityCalendar";

interface DateGridProps {
  monthDates: Date[];
}

export default function DateGrid({ monthDates }: DateGridProps) {
  const { dateCountMap, plannerCompletionMap, onDateSelect } =
    useActivityCalendarContext();

  const cells = useMemo<DateCell[]>(() => {
    const safeMonthDates = Array.isArray(monthDates) ? monthDates : [];
    if (!safeMonthDates.length) return [];

    const firstDate = safeMonthDates[0];
    let weekDay = firstDate.getDay();
    weekDay = weekDay === 0 ? 6 : weekDay - 1;

    const items: DateCell[] = [];
    for (let index = 0; index < weekDay; index += 1) {
      items.push({
        key: `blank-${index}`,
        isBlank: true,
      });
    }

    safeMonthDates.forEach((date) => {
      const dateKey = formatDate(date);
      items.push({
        key: dateKey,
        isBlank: false,
          dateKey,
          count: dateCountMap[dateKey] || 0,
        });
    });

    return items;
  }, [dateCountMap, monthDates]);

  return (
    <div className="heatmap-blocks">
      {cells.map((cell) => (
        <DateBlock
          key={cell.key}
          dateKey={cell.isBlank ? undefined : cell.dateKey}
          count={cell.isBlank ? 0 : cell.count}
          completion={
            cell.isBlank ? undefined : plannerCompletionMap[cell.dateKey]
          }
          isBlank={cell.isBlank}
          onSelectDate={onDateSelect}
        />
      ))}
    </div>
  );
}
