import type { PieLabelRenderProps } from "recharts";

export const CHART_AXIS_TICK = { fill: "#9eb7d6", fontSize: 12 };
export const CHART_AXIS_LINE = { stroke: "rgba(133, 178, 229, 0.42)" };
export const CHART_TOOLTIP_STYLE = {
  borderRadius: "12px",
  border: "1px solid rgba(0, 229, 255, 0.35)",
  background:
    "linear-gradient(130deg, rgba(9, 18, 36, 0.96), rgba(12, 24, 46, 0.94))",
  boxShadow: "0 14px 24px rgba(0, 0, 0, 0.4)",
};
export const TOOLTIP_ESCAPE_VIEWBOX = { x: true, y: true };
export const TOOLTIP_WRAPPER_STYLE = { zIndex: 1200 };
export const PIE_COLORS = ["#00ff95", "#ff5f74"];
export const PIE_CHART_MARGIN = { top: 12, right: 20, left: 20, bottom: 16 };
export const PIE_LABEL_STYLE = {
  fill: "#d6ebff",
  fontSize: 11,
  fontWeight: 600 as const,
};

const SUBJECT_AXIS_LABEL_MAP: Record<string, string> = {
  Economics: "Economy",
  Environment: "Environ.",
  "Art & Culture": "Art/Culture",
  "Science & Tech": "Sci/Tech",
};

const RADIAN = Math.PI / 180;

export function renderPieLabel({
  cx = 0,
  cy = 0,
  midAngle = 0,
  outerRadius = 0,
  percent = 0,
  name = "",
}: PieLabelRenderProps) {
  if (!percent || percent <= 0) return null;

  const percentage = percent * 100;
  if (percentage < 2) return null;

  const outer = Number(outerRadius);
  const radius = outer + 14;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const anchor = x >= cx ? "start" : "end";

  return (
    <text
      x={x}
      y={y}
      fill={PIE_LABEL_STYLE.fill}
      fontSize={PIE_LABEL_STYLE.fontSize}
      fontWeight={PIE_LABEL_STYLE.fontWeight}
      textAnchor={anchor}
      dominantBaseline="central"
    >
      {`${name} ${percentage.toFixed(0)}%`}
    </text>
  );
}

export function formatSubjectAxisLabel(value: unknown): string {
  const normalized = String(value || "").trim();
  if (!normalized) return "";
  return SUBJECT_AXIS_LABEL_MAP[normalized] || normalized;
}

export function getSubjectFromBarClick(eventData: unknown): string | null {
  if (!eventData || typeof eventData !== "object") return null;

  const raw = eventData as { payload?: { subject?: string }; subject?: string };
  return raw.payload?.subject || raw.subject || null;
}
