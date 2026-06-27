import ActivityCalendar from "./activity-calendar/ActivityCalendar";
import type { PracticeRecord } from "@/types/records";

interface YearHeatmapProps {
  records: PracticeRecord[];
}

export default function YearHeatmap({ records }: YearHeatmapProps) {
  return <ActivityCalendar records={records} />;
}
