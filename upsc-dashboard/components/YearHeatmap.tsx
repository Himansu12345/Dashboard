import { memo } from "react";
import ActivityCalendar from "./activity-calendar/ActivityCalendar";
import type { PracticeRecord } from "@/types/records";

interface YearHeatmapProps {
  records: PracticeRecord[];
}

function YearHeatmap({ records }: YearHeatmapProps) {
  return <ActivityCalendar records={records} />;
}

export default memo(YearHeatmap);
