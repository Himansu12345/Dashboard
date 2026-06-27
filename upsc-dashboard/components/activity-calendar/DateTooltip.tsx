interface DateTooltipProps {
  dateKey?: string;
  count?: number;
}

export default function DateTooltip({ dateKey, count }: DateTooltipProps): string {
  const safeDateKey = dateKey || "Unknown date";
  const safeCount = Number(count) || 0;
  return `${safeDateKey} -> ${safeCount} submissions`;
}
