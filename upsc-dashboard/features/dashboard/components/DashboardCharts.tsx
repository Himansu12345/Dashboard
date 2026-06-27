import type { KeyboardEvent } from "react";
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
import ChartContainer from "@/components/charts/ChartContainer";
import ChartCard from "@/components/charts/ChartCard";
import { renderInnerDonutPercentageLabel } from "@/components/charts/donutChartUtils";
import type { DashboardAnalytics } from "@/types/analytics";
import {
  CHART_AXIS_LINE,
  CHART_AXIS_TICK,
  CHART_TOOLTIP_STYLE,
  formatSubjectAxisLabel,
  PIE_CHART_MARGIN,
  PIE_COLORS,
  TOOLTIP_ESCAPE_VIEWBOX,
  TOOLTIP_WRAPPER_STYLE,
} from "@/features/dashboard/dashboardChartConfig";

interface DashboardChartsProps {
  analytics: DashboardAnalytics;
  isChartDataEmpty: boolean;
  accuracyStrokeId: string;
  barFillId: string;
  onSubjectBarClick: (barData: unknown) => void;
  onOverallPieClick: () => void;
  onAccuracyTrendClick: () => void;
}

export default function DashboardCharts({
  analytics,
  isChartDataEmpty,
  accuracyStrokeId,
  barFillId,
  onSubjectBarClick,
  onOverallPieClick,
  onAccuracyTrendClick,
}: DashboardChartsProps) {
  const shouldTiltSubjectTicks = analytics.subjectChartData.length > 6;

  function handleAccuracyTrendKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onAccuracyTrendClick();
  }

  return (
    <ChartContainer>
      <ChartCard
        title="Accuracy Trend"
      
        delay={0}
        isEmpty={isChartDataEmpty}
      >
        <div
          className="drilldown-pie-shell is-clickable"
          role="button"
          tabIndex={0}
          onClick={onAccuracyTrendClick}
          onKeyDown={handleAccuracyTrendKeyDown}
          aria-label="Open subject-wise accuracy drilldown"
          title="Open subject-wise accuracy drilldown"
        >
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={analytics.lineChartData}
              margin={{ top: 10, right: 12, left: -12, bottom: 0 }}
            >
              <defs>
                <linearGradient id={accuracyStrokeId} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00e5ff" />
                  <stop offset="100%" stopColor="#00ff95" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={CHART_AXIS_TICK}
                tickLine={false}
                axisLine={CHART_AXIS_LINE}
              />
              <YAxis
                domain={[0, 100]}
                tick={CHART_AXIS_TICK}
                tickLine={false}
                axisLine={CHART_AXIS_LINE}
              />
              <Tooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                allowEscapeViewBox={TOOLTIP_ESCAPE_VIEWBOX}
                wrapperStyle={TOOLTIP_WRAPPER_STYLE}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke={`url(#${accuracyStrokeId})`}
                strokeWidth={3}
                dot={{ r: 2, fill: "#6fefff", strokeWidth: 0 }}
                activeDot={{
                  r: 5,
                  fill: "#9ffeff",
                  stroke: "#0d1933",
                  strokeWidth: 2,
                }}
                animationDuration={720}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard
        title="Subject-wise Accuracy"
       
        delay={1}
        isEmpty={isChartDataEmpty}
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={analytics.subjectChartData}
            margin={{ top: 10, right: 8, left: -12, bottom: shouldTiltSubjectTicks ? 16 : 6 }}
          >
            <defs>
              <linearGradient id={barFillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7dfcff" />
                <stop offset="100%" stopColor="#00c8ff" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="subject"
              tick={CHART_AXIS_TICK}
              tickFormatter={formatSubjectAxisLabel}
              interval={0}
              minTickGap={0}
              tickMargin={10}
              angle={shouldTiltSubjectTicks ? -20 : 0}
              textAnchor={shouldTiltSubjectTicks ? "end" : "middle"}
              height={shouldTiltSubjectTicks ? 52 : 34}
              tickLine={false}
              axisLine={CHART_AXIS_LINE}
            />
            <YAxis
              domain={[0, 100]}
              tick={CHART_AXIS_TICK}
              tickLine={false}
              axisLine={CHART_AXIS_LINE}
            />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              allowEscapeViewBox={TOOLTIP_ESCAPE_VIEWBOX}
              wrapperStyle={TOOLTIP_WRAPPER_STYLE}
            />
            <Legend />
            <Bar
              dataKey="accuracy"
              fill={`url(#${barFillId})`}
              radius={[9, 9, 2, 2]}
              animationDuration={720}
              cursor="pointer"
              onClick={onSubjectBarClick}
              activeBar={{
                fill: "#9cf8ff",
                stroke: "rgba(12, 24, 46, 0.6)",
                strokeWidth: 1,
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Correct vs Incorrect"
        
        delay={2}
        isEmpty={isChartDataEmpty}
      >
        <div className="pie-chart-shell chart-donut-spin">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart margin={PIE_CHART_MARGIN}>
              <Pie
                data={analytics.pieData}
                cx="50%"
                cy="45%"
                innerRadius="34%"
                outerRadius="64%"
                dataKey="value"
                paddingAngle={4}
                labelLine={false}
                label={renderInnerDonutPercentageLabel}
                isAnimationActive={false}
                cursor="pointer"
                onClick={onOverallPieClick}
              >
                {analytics.pieData.map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                allowEscapeViewBox={TOOLTIP_ESCAPE_VIEWBOX}
                wrapperStyle={TOOLTIP_WRAPPER_STYLE}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </ChartContainer>
  );
}
