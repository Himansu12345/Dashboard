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
import type { SubjectBreakdownRow } from "@/types/analytics";

interface SubjectBreakdownProps {
  data: SubjectBreakdownRow[];
}

const TOOLTIP_ESCAPE_VIEWBOX = { x: true, y: true };
const TOOLTIP_WRAPPER_STYLE = { zIndex: 1200 };

function SubjectBreakdown({ data }: SubjectBreakdownProps) {
  const safeData = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const chartData = useMemo(
    () =>
      safeData.map((item) => ({
        subject: item.subject || "Unknown",
        correct: Number(item.correct) || 0,
        incorrect: Number(item.incorrect) || 0,
        skipped: Number(item.skipped) || 0,
        questions: Number(item.questions) || 0,
        submissions: Number(item.submissions) || 0,
        accuracy: Number(item.accuracy) || 0,
      })),
    [safeData],
  );

  const chartHeight = Math.max(200, chartData.length * 42);
  const yAxisWidth = useMemo(() => {
    const maxLength = chartData.reduce((largest, item) => {
      const labelLength = String(item.subject).length;
      return Math.max(largest, labelLength);
    }, 0);
    return Math.min(170, Math.max(88, maxLength * 7));
  }, [chartData]);

  return (
    <article className="date-popup-card">
      <header className="date-popup-card-head">
        <h4 className="date-popup-card-title">Subject Breakdown</h4>
        <p className="date-popup-card-note">Stacked outcomes across subjects for this date.</p>
      </header>

      {chartData.length === 0 ? (
        <p className="date-popup-empty">No subject-wise activity found for this date.</p>
      ) : (
        <>
          <div className="date-popup-chart-wrap">
            <FullscreenWrapper
              title="Subject Breakdown"
              subtitle="Stacked outcomes across subjects for this date."
            >
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart data={chartData} layout="vertical" margin={{ top: 6, right: 14, left: 6, bottom: 6 }}>
                  <CartesianGrid stroke={CHART_GRID_STROKE} strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    type="number"
                    tick={CHART_AXIS_TICK}
                    tickLine={false}
                    axisLine={CHART_AXIS_LINE}
                  />
                  <YAxis
                    dataKey="subject"
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
                    labelFormatter={(label) => `Subject: ${label}`}
                  />
                  <Bar
                    dataKey="correct"
                    stackId="subject-outcome"
                    fill={OUTCOME_COLORS.correct}
                    radius={[4, 0, 0, 4]}
                    animationDuration={540}
                  />
                  <Bar
                    dataKey="incorrect"
                    stackId="subject-outcome"
                    fill={OUTCOME_COLORS.incorrect}
                    animationDuration={540}
                  />
                  <Bar
                    dataKey="skipped"
                    stackId="subject-outcome"
                    fill={OUTCOME_COLORS.skipped}
                    radius={[0, 4, 4, 0]}
                    animationDuration={540}
                  />
                </BarChart>
              </ResponsiveContainer>
            </FullscreenWrapper>
          </div>

          <ul className="date-popup-inline-list">
            {chartData.map((item) => (
              <li key={item.subject} className="date-popup-inline-item">
                <span className="date-popup-inline-label">{item.subject}</span>
                <span className="date-popup-badge is-correct">C {item.correct}</span>
                <span className="date-popup-badge is-incorrect">I {item.incorrect}</span>
                <span className="date-popup-badge is-skipped">S {item.skipped}</span>
                <span className="date-popup-badge is-accuracy">{item.accuracy}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  );
}

export default memo(SubjectBreakdown);
