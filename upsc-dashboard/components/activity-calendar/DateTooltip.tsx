import type { PlannerDayCompletion } from "@/types/activityCalendar";

interface DateTooltipProps {
  dateKey?: string;
  completion?: PlannerDayCompletion;
}

export default function DateTooltip({
  dateKey,
  completion,
}: DateTooltipProps): string {
  const safeDateKey = dateKey || "Unknown date";
  const totalMissions = completion?.totalMissions || 0;
  const completedMissions = completion?.completedMissions || 0;

  return `${safeDateKey} -> ${completedMissions}/${totalMissions} missions complete`;
}
