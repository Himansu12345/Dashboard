import { memo, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import FullscreenWrapper from "@/components/charts/FullscreenWrapper";
import {
  CHART_AXIS_LINE,
  CHART_AXIS_TICK,
  CHART_GRID_STROKE,
  CHART_TOOLTIP_STYLE,
  OUTCOME_COLORS,
} from "./chartTheme";
import type { TopicBreakdownRow } from "@/types/analytics";

interface TopicBreakdownProps {
  data: TopicBreakdownRow[];
}

const TOOLTIP_ESCAPE_VIEWBOX = { x: true, y: true };
const TOOLTIP_WRAPPER_STYLE = { zIndex: 1200 };

function TopicBreakdown({ data }: TopicBreakdownProps) {
  const safeData = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const chartData = useMemo(
    () =>
      safeData.map((item) => ({
        topic: item.topic || "Unknown",
        correct: Number(item.correct) || 0,
        incorrect: Number(item.incorrect) || 0,
        skipped: Number(item.skipped) || 0,
        accuracy: Number(item.accuracy) || 0,
      })),
    [safeData],
  );

  const chartHeight = Math.max(190, chartData.length * 34);
  const yAxisWidth = useMemo(() => {
    const maxLength = chartData.reduce((largest, item) => {
      const labelLength = String(item.topic).length;
      return Math.max(largest, labelLength);
    }, 0);
    return Math.min(220, Math.max(118, maxLength * 6.5));
  }, [chartData]);

  return (
    <article className="date-popup-card">
      <header className="date-popup-card-head">
        <h4 className="date-popup-card-title">Topic Breakdown</h4>
        <p className="date-popup-card-note">Mini horizontal bars for topic-wise outcome composition.</p>
      </header>

      {chartData.length === 0 ? (
        <p className="date-popup-empty">No topic-wise activity found for this date.</p>
      ) : (
        <div className="date-popup-chart-wrap is-compact">
          <FullscreenWrapper
            title="Topic Breakdown"
            subtitle="Mini horizontal bars for topic-wise outcome composition."
          >
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 4, right: 10, left: 6, bottom: 4 }}
                barCategoryGap={9}
              >
                <CartesianGrid stroke={CHART_GRID_STROKE} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  type="number"
                  tick={CHART_AXIS_TICK}
                  tickLine={false}
                  axisLine={CHART_AXIS_LINE}
                />
                <YAxis
                  dataKey="topic"
                  type="category"
                  width={yAxisWidth}
                  tick={CHART_AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  allowEscapeViewBox={TOOLTIP_ESCAPE_VIEWBOX}
                  wrapperStyle={TOOLTIP_WRAPPER_STYLE}
                  formatter={(value, name) => {
                    const mapping: Record<string, string> = {
                      correct: "Correct",
                      incorrect: "Incorrect",
                      skipped: "Skipped",
                    };
                    return [value, mapping[String(name)] || String(name)];
                  }}
                  labelFormatter={(label) => `Topic: ${label}`}
                />
                <Bar
                  dataKey="correct"
                  stackId="topic-outcome"
                  fill={OUTCOME_COLORS.correct}
                  radius={[4, 0, 0, 4]}
                  barSize={10}
                  animationDuration={520}
                />
                <Bar
                  dataKey="incorrect"
                  stackId="topic-outcome"
                  fill={OUTCOME_COLORS.incorrect}
                  barSize={10}
                  animationDuration={520}
                />
                <Bar
                  dataKey="skipped"
                  stackId="topic-outcome"
                  fill={OUTCOME_COLORS.skipped}
                  radius={[0, 4, 4, 0]}
                  barSize={10}
                  animationDuration={520}
                />
              </BarChart>
            </ResponsiveContainer>
          </FullscreenWrapper>
        </div>
      )}
    </article>
  );
}

export default memo(TopicBreakdown);
