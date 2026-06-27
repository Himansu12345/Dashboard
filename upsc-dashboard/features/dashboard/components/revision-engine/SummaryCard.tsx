import { MotionCard } from "@/components/motion/MotionWrappers";
import type { RevisionDashboardPayload } from "@/types/revision";
import MetricSparkline from "./MetricSparkline";
import {
  AnimatedNumber,
  getMetricMeta,
  PRIORITY_COLOR_MAP,
} from "./revisionEngineUtils";

interface SummaryCardProps {
  label: string;
  value: number;
  tone: string;
  dashboard: RevisionDashboardPayload;
}

function getToneColor(tone: string) {
  if (tone === "critical") return PRIORITY_COLOR_MAP.Critical;
  if (tone === "high") return PRIORITY_COLOR_MAP.High;
  if (tone === "medium") return PRIORITY_COLOR_MAP.Medium;
  return PRIORITY_COLOR_MAP.Stable;
}

export default function SummaryCard({
  label,
  value,
  tone,
  dashboard,
}: SummaryCardProps) {
  const metricMeta = getMetricMeta(label, dashboard);

  return (
    <MotionCard className={`revision-summary-card tone-${tone}`}>
      <div className="revision-summary-topline">
        <p className="metric-kicker">Revision Signal</p>
        <span className={`revision-summary-status is-${metricMeta.direction}`}>
          {metricMeta.direction === "up"
            ? "Up"
            : metricMeta.direction === "down"
              ? "Down"
              : "Steady"}
        </span>
      </div>
      <div className="revision-summary-main">
        <h4 className="metric-value">
          <AnimatedNumber
            value={value}
            suffix={label === "Average Retention" ? "%" : ""}
          />
        </h4>
        <MetricSparkline
          value={Number.isFinite(value) ? value : 0}
          direction={metricMeta.direction}
          tone={getToneColor(tone)}
        />
      </div>
      <p className="metric-label">{label}</p>
      <p className="revision-summary-caption">{metricMeta.label}</p>
    </MotionCard>
  );
}
