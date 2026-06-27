import type { DashboardAnalytics } from "@/types/analytics";
import { MotionCard, MotionList } from "@/components/motion/MotionWrappers";

interface DashboardMetricsProps {
  totals: DashboardAnalytics["totals"];
  filteredCount: number;
}

export default function DashboardMetrics({
  totals,
  filteredCount,
}: DashboardMetricsProps) {
  const metricItems = [
    {
      title: "Number of practice entries captured",
      value: totals.totalAttempts,
      label: "Filtered Attempts",
      tone: "attempts",
    },
    {
      title: "Total solved questions in filtered records",
      value: totals.totalQuestions,
      label: "Questions Solved",
      tone: "questions",
    },
    {
      title: "Aggregate accuracy across filtered records",
      value: `${totals.overallAccuracy}%`,
      label: "Overall Accuracy",
      tone: "accuracy",
    },
  ] as const;

  return (
    <MotionList className="metric-grid">
      {metricItems.map((item) => (
        <MotionCard
          key={item.label}
          className={`metric-card metric-card-${item.tone}`}
          title={item.title}
        >
          <p className="metric-kicker">Current View</p>
          <h3 className="metric-value">{item.value}</h3>
          <p className="metric-label">{item.label}</p>
          <p className="metric-meta">{filteredCount} records contributing</p>
        </MotionCard>
      ))}
    </MotionList>
  );
}
