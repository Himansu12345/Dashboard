import { buildMetricSparkline, buildSparklinePath, type MetricDirection } from "./revisionEngineUtils";

interface MetricSparklineProps {
  value: number;
  direction: MetricDirection;
  tone: string;
}

export default function MetricSparkline({
  value,
  direction,
  tone,
}: MetricSparklineProps) {
  const points = buildMetricSparkline(value, direction);
  const path = buildSparklinePath(points);

  return (
    <div className="revision-sparkline-shell" aria-hidden="true">
      <svg
        className="revision-sparkline"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path d={path} className="revision-sparkline-path" style={{ stroke: tone }} />
      </svg>
    </div>
  );
}
