import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useId } from "react";
import ChartCard from "../charts/ChartCard";
import { renderInnerDonutPercentageLabel } from "@/components/charts/donutChartUtils";
import type { TopicAnalytics } from "@/types/analytics";

const TOPIC_TOOLTIP_STYLE = {
  borderRadius: "12px",
  border: "1px solid rgba(0, 229, 255, 0.35)",
  background: "linear-gradient(130deg, rgba(9, 18, 36, 0.96), rgba(12, 24, 46, 0.94))",
  boxShadow: "0 14px 24px rgba(0, 0, 0, 0.4)",
};
const TOOLTIP_ESCAPE_VIEWBOX = { x: true, y: true };
const TOOLTIP_WRAPPER_STYLE = { zIndex: 1200 };
const TOPIC_PIE_MARGIN = { top: 8, right: 22, left: 22, bottom: 14 };
const CHART_AXIS_TICK = { fill: "#9eb7d6", fontSize: 12 };
const CHART_AXIS_LINE = { stroke: "rgba(133, 178, 229, 0.42)" };
const OUTCOME_PIE_COLORS: Record<string, string> = {
  Correct: "#00e5ff",
  Incorrect: "#ff5f74",
};
interface TopicChartGroupProps {
  topicAnalytics: TopicAnalytics;
}

export default function TopicChartGroup({ topicAnalytics }: TopicChartGroupProps) {
  const chartId = useId().replaceAll(":", "");
  const {
    topicAccuracyData = [],
    topicLineData = [],
    topicShareData = [],
  } = topicAnalytics || {};
  const isEmpty = topicAccuracyData.length === 0;
  const isTopicShareEmpty = topicShareData.length === 0;
  const topicShareTotal = topicShareData.reduce((sum, row) => sum + Number(row.value || 0), 0);
  const topicBarFillId = `topic-bar-fill-${chartId}`;
  const topicLineStrokeId = `topic-line-stroke-${chartId}`;

  return (
    <section className="topic-chart-grid">
      <ChartCard
        title="Topic-wise Accuracy"
        note="Understand concept mastery inside this subject."
        delay={0}
        isEmpty={isEmpty}
        emptyText="No topic data for the selected popup filters."
      >
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={topicAccuracyData} margin={{ top: 10, right: 14, left: -6, bottom: 6 }}>
            <defs>
              <linearGradient id={topicBarFillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#89f9ff" />
                <stop offset="100%" stopColor="#00d4ff" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="topic"
              tick={CHART_AXIS_TICK}
              tickLine={false}
              axisLine={CHART_AXIS_LINE}
              interval={0}
              angle={-12}
              textAnchor="end"
              height={56}
            />
            <YAxis
              domain={[0, 100]}
              tick={CHART_AXIS_TICK}
              tickLine={false}
              axisLine={CHART_AXIS_LINE}
            />
            <Tooltip
              contentStyle={TOPIC_TOOLTIP_STYLE}
              allowEscapeViewBox={TOOLTIP_ESCAPE_VIEWBOX}
              wrapperStyle={TOOLTIP_WRAPPER_STYLE}
            />
            <Legend />
            <Bar
              dataKey="accuracy"
              fill={`url(#${topicBarFillId})`}
              name="Accuracy %"
              radius={[9, 9, 2, 2]}
              animationDuration={700}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Topic Curve"
        note="Visual comparison of relative accuracy across topics."
        delay={1}
        isEmpty={isEmpty}
        emptyText="No topic progression available."
      >
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={topicLineData} margin={{ top: 10, right: 14, left: -6, bottom: 4 }}>
            <defs>
              <linearGradient id={topicLineStrokeId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00e5ff" />
                <stop offset="100%" stopColor="#00ff95" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="topic" tick={CHART_AXIS_TICK} tickLine={false} axisLine={CHART_AXIS_LINE} />
            <YAxis
              domain={[0, 100]}
              tick={CHART_AXIS_TICK}
              tickLine={false}
              axisLine={CHART_AXIS_LINE}
            />
            <Tooltip
              contentStyle={TOPIC_TOOLTIP_STYLE}
              allowEscapeViewBox={TOOLTIP_ESCAPE_VIEWBOX}
              wrapperStyle={TOOLTIP_WRAPPER_STYLE}
              formatter={(value, name) => [
                value,
                name === "accuracy" ? "Accuracy %" : String(name),
              ]}
              labelFormatter={(label, payload) => {
                const row = payload?.[0]?.payload as { topic?: string } | undefined;
                return row?.topic ? `Topic: ${row.topic}` : label;
              }}
            />
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke={`url(#${topicLineStrokeId})`}
              strokeWidth={3}
              dot={{ r: 3, fill: "#8ff6ff", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#9ffeff", stroke: "#0d1933", strokeWidth: 2 }}
              animationDuration={700}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Correct vs Incorrect"
        note="Outcome distribution for solved questions in this subject."
        delay={2}
        isEmpty={isTopicShareEmpty}
        emptyText="No correct/incorrect data to display."
      >
        <div className="pie-chart-shell chart-donut-spin">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart margin={TOPIC_PIE_MARGIN}>
              <Pie
                data={topicShareData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                innerRadius="30%"
                outerRadius="58%"
                paddingAngle={topicShareData.length > 1 ? 2 : 0}
                labelLine={false}
                label={renderInnerDonutPercentageLabel}
                isAnimationActive={false}
              >
                {topicShareData.map((topic, index) => (
                  <Cell
                    key={`${topic.name || "topic"}-${index}`}
                    fill={OUTCOME_PIE_COLORS[topic.name] || (index === 0 ? "#00e5ff" : "#ff5f74")}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={TOPIC_TOOLTIP_STYLE}
                allowEscapeViewBox={TOOLTIP_ESCAPE_VIEWBOX}
                wrapperStyle={TOOLTIP_WRAPPER_STYLE}
                formatter={(value, _name, item) => {
                  const numericValue = Number(value) || 0;
                  const percentage = topicShareTotal > 0 ? (numericValue / topicShareTotal) * 100 : 0;
                  const label = String(item?.name || "Solved Questions");
                  return [`${numericValue} (${percentage.toFixed(1)}%)`, label];
                }}
              />
              <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </section>
  );
}
