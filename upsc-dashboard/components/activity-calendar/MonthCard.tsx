import { memo } from "react";
import DateGrid from "./DateGrid";

interface MonthCardProps {
  monthName: string;
  monthDates: Date[];
}

function MonthCard({ monthName, monthDates }: MonthCardProps) {
  return (
    <div className="month-card">
      <p className="month-title">{monthName}</p>
      <DateGrid monthDates={monthDates} />
    </div>
  );
}

export default memo(MonthCard);
