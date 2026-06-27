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
import type { DifficultyBreakdownRow } from "@/types/analytics";

interface DifficultyBreakdownProps {
  data: DifficultyBreakdownRow[];
}

const TOOLTIP_ESCAPE_VIEWBOX = { x: true, y: true };
const TOOLTIP_WRAPPER_STYLE = { zIndex: 1200 };

function DifficultyBreakdown({ data }: DifficultyBreakdownProps) {
  const safeData = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const chartData = useMemo(
    () =>
      safeData.map((item) => ({
        difficulty: item.difficulty || "Unknown",
        correct: Number(item.correct) || 0,
        incorrect: Number(item.incorrect) || 0,
        skipped: Number(item.skipped) || 0,
        submissions: Number(item.submissions) || 0,
        questions: Number(item.questions) || 0,
        accuracy: Number(item.accuracy) || 0,
      })),
    [safeData],
  );

  return (
    <article className="date-popup-card">
      <header className="date-popup-card-head">
        <h4 className="date-popup-card-title">Difficulty Breakdown</h4>
        <p className="date-popup-card-note">Visual distribution of outcomes across difficulty levels.</p>
      </header>

      {chartData.length === 0 ? (
        <p className="date-popup-empty">No difficulty distribution found for this date.</p>
      ) : (
        <>
          <div className="date-popup-chart-wrap">
            <FullscreenWrapper
              title="Difficulty Breakdown"
              subtitle="Visual distribution of outcomes across difficulty levels."
            >
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={chartData} margin={{ top: 8, right: 14, left: -2, bottom: 8 }}>
                  <CartesianGrid stroke={CHART_GRID_STROKE} strokeDasharray="3 3" />
                  <XAxis dataKey="difficulty" tick={CHART_AXIS_TICK} tickLine={false} axisLine={CHART_AXIS_LINE} />
                  <YAxis tick={CHART_AXIS_TICK} tickLine={false} axisLine={CHART_AXIS_LINE} />
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
                    labelFormatter={(label) => `Difficulty: ${label}`}
                  />
                  <Bar
                    dataKey="correct"
                    stackId="difficulty-outcome"
                    fill={OUTCOME_COLORS.correct}
                    radius={[4, 4, 0, 0]}
                    animationDuration={560}
                  />
                  <Bar
                    dataKey="incorrect"
                    stackId="difficulty-outcome"
                    fill={OUTCOME_COLORS.incorrect}
                    animationDuration={560}
                  />
                  <Bar
                    dataKey="skipped"
                    stackId="difficulty-outcome"
                    fill={OUTCOME_COLORS.skipped}
                    animationDuration={560}
                  />
                </BarChart>
              </ResponsiveContainer>
            </FullscreenWrapper>
          </div>

          <ul className="date-popup-inline-list">
            {chartData.map((item) => (
              <li key={item.difficulty} className="date-popup-inline-item">
                <span className="date-popup-inline-label">{item.difficulty}</span>
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

export default memo(DifficultyBreakdown);
