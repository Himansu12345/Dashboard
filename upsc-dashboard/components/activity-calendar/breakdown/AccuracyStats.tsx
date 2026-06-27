import { memo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { renderInnerDonutPercentageLabel } from "@/components/charts/donutChartUtils";
import FullscreenWrapper from "@/components/charts/FullscreenWrapper";
import { CHART_TOOLTIP_STYLE, OUTCOME_COLORS } from "./chartTheme";
import type { DateAnalyticsResult } from "@/types/analytics";

const TOOLTIP_ESCAPE_VIEWBOX = { x: true, y: true };
const TOOLTIP_WRAPPER_STYLE = { zIndex: 1200 };
const DONUT_MARGIN = { top: 10, right: 18, left: 18, bottom: 8 };

function formatPercent(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : "0.00";
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

interface AccuracyStatsProps {
  analytics: DateAnalyticsResult;
}

function AccuracyStats({ analytics }: AccuracyStatsProps) {
  const safeAnalytics = analytics || {
    totalSubmissions: 0,
    totalQuestionsAttempted: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    totalSkipped: 0,
    accuracy: 0,
  };
  const totalSubmissions = toNumber(safeAnalytics.totalSubmissions);
  const totalQuestionsAttempted = toNumber(
    safeAnalytics.totalQuestionsAttempted,
  );
  const totalCorrect = toNumber(safeAnalytics.totalCorrect);
  const totalIncorrect = toNumber(safeAnalytics.totalIncorrect);
  const totalSkipped = toNumber(safeAnalytics.totalSkipped);
  const accuracy = toNumber(safeAnalytics.accuracy);

  const donutData = [
    { name: "Correct", value: totalCorrect, fill: OUTCOME_COLORS.correct },
    {
      name: "Incorrect",
      value: totalIncorrect,
      fill: OUTCOME_COLORS.incorrect,
    },
    { name: "Skipped", value: totalSkipped, fill: OUTCOME_COLORS.skipped },
  ];

  return (
    <article className="date-popup-card">
      <header className="date-popup-card-head">
        <h4 className="date-popup-card-title">Accuracy Snapshot</h4>
        <p className="date-popup-card-note">
          Correct vs incorrect vs skipped performance for this date.
        </p>
      </header>

      {totalQuestionsAttempted === 0 ? (
        <p className="date-popup-empty">
          No question attempts available for chart rendering.
        </p>
      ) : (
        <div className="date-popup-donut-wrap">
          <FullscreenWrapper
            title="Accuracy Snapshot"
            subtitle="Correct vs incorrect vs skipped performance for this date."
          >
            <div className="date-popup-donut-shell chart-donut-spin">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart margin={DONUT_MARGIN}>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="65%"
                    outerRadius="85%"
                    paddingAngle={2}
                    labelLine={false}
                    label={renderInnerDonutPercentageLabel}
                    isAnimationActive={false}
                  >
                    {donutData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    allowEscapeViewBox={TOOLTIP_ESCAPE_VIEWBOX}
                    wrapperStyle={TOOLTIP_WRAPPER_STYLE}
                    formatter={(value, name) => {
                      const safeValue = Number(value) || 0;
                      const share =
                        totalQuestionsAttempted === 0
                          ? 0
                          : ((safeValue / totalQuestionsAttempted) * 100).toFixed(
                              1,
                            );
                      return [`${safeValue} (${share}%)`, String(name)];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="date-popup-donut-center" aria-hidden="true">
                <span className="date-popup-donut-accuracy-label">Accuracy</span>
                <strong className="date-popup-donut-accuracy-value">
                  {formatPercent(accuracy)}%
                </strong>
              </div>
            </div>
          </FullscreenWrapper>

          <div className="date-popup-badge-row">
            <span className="date-popup-badge is-correct">
              Correct {totalCorrect}
            </span>
            <span className="date-popup-badge is-incorrect">
              Incorrect {totalIncorrect}
            </span>
            <span className="date-popup-badge is-skipped">
              Skipped {totalSkipped}
            </span>
            <span className="date-popup-badge is-accuracy">
              {totalQuestionsAttempted} Questions
            </span>
            <span className="date-popup-badge">
              {totalSubmissions} Submissions
            </span>
          </div>
        </div>
      )}
    </article>
  );
}

export default memo(AccuracyStats);
