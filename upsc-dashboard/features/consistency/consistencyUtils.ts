import type {
  ConsistencyDayActivity,
  ConsistencyMonth,
  ConsistencyState,
  MomentumState,
} from "@/types/consistency";

const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: "short",
  year: "numeric",
});

const DAY_LABEL_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

export function formatShortDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return DAY_LABEL_FORMATTER.format(parsed);
}

export function formatMonthLabel(value: string): string {
  const parsed = new Date(`${value}-01T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return MONTH_LABEL_FORMATTER.format(parsed);
}

export function getConsistencyTone(state: ConsistencyState): string {
  if (state === "Weak") return "rose";
  if (state === "Improving") return "amber";
  if (state === "Disciplined") return "teal";
  return "mint";
}

export function getMomentumTone(state: MomentumState): string {
  if (state === "Momentum Rising") return "mint";
  if (state === "Momentum Falling") return "rose";
  return "teal";
}

export function getHeatmapCellClassName(level: number, isToday: boolean): string {
  const normalizedLevel = Math.max(0, Math.min(4, level));
  return [
    "consistency-heatmap-cell",
    `level-${normalizedLevel}`,
    isToday ? "is-today" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function getMonthGrid(month: ConsistencyMonth): Array<Array<ConsistencyDayActivity | null>> {
  const days = month.days;
  if (days.length === 0) return [];
  const firstDayOffset = days[0]?.dayOfWeek ?? 0;
  const cells: Array<ConsistencyDayActivity | null> = [
    ...Array.from({ length: firstDayOffset }, () => null),
    ...days,
  ];
  const weeks: Array<Array<ConsistencyDayActivity | null>> = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }
  return weeks;
}

export function getDefaultSelectedDay(months: ConsistencyMonth[]): ConsistencyDayActivity | null {
  const latestMonth = months[months.length - 1];
  if (!latestMonth || latestMonth.days.length === 0) return null;
  return [...latestMonth.days].reverse().find((day) => day.isActive) || latestMonth.days[latestMonth.days.length - 1] || null;
}

export function getActiveMonthIndex(
  months: ConsistencyMonth[],
  selectedDay: ConsistencyDayActivity | null,
): number {
  if (!selectedDay) return Math.max(0, months.length - 1);
  const foundIndex = months.findIndex((month) => month.key === selectedDay.monthKey);
  return foundIndex >= 0 ? foundIndex : Math.max(0, months.length - 1);
}
