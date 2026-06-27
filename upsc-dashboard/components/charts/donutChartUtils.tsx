import type { PieLabelRenderProps } from "recharts";

const RADIAN = Math.PI / 180;

export const DONUT_LABEL_STYLE = {
  fill: "#ecf7ff",
  fontSize: 12,
  fontWeight: 700 as const,
};

export function renderInnerDonutPercentageLabel({
  cx = 0,
  cy = 0,
  midAngle = 0,
  innerRadius = 0,
  outerRadius = 0,
  percent = 0,
}: PieLabelRenderProps) {
  if (!percent || percent <= 0) return null;

  const percentage = percent * 100;
  if (percentage < 4) return null;

  const inner = Number(innerRadius);
  const outer = Number(outerRadius);
  const radius = inner + (outer - inner) * 0.52;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill={DONUT_LABEL_STYLE.fill}
      fontSize={DONUT_LABEL_STYLE.fontSize}
      fontWeight={DONUT_LABEL_STYLE.fontWeight}
      textAnchor="middle"
      dominantBaseline="central"
      aria-hidden="true"
    >
      {`${percentage.toFixed(0)}%`}
    </text>
  );
}
