import { useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import ChartCard from "@/components/charts/ChartCard";
import { renderInnerDonutPercentageLabel } from "@/components/charts/donutChartUtils";
import useBodyScrollLock from "@/hooks/useBodyScrollLock";
import useFocusTrap from "@/hooks/useFocusTrap";
import type { PracticeRecord } from "@/types/records";

const TOOLTIP_STYLE = {
  borderRadius: "12px",
  border: "1px solid rgba(0, 229, 255, 0.35)",
  background: "linear-gradient(130deg, rgba(9, 18, 36, 0.96), rgba(12, 24, 46, 0.94))",
  boxShadow: "0 14px 24px rgba(0, 0, 0, 0.4)",
};
const TOOLTIP_ESCAPE_VIEWBOX = { x: true, y: true };
const TOOLTIP_WRAPPER_STYLE = { zIndex: 1250 };
const PIE_COLORS = ["#00ff95", "#ff5f74"];
const PIE_CHART_MARGIN = { top: 12, right: 20, left: 20, bottom: 16 };
interface TopicOutcomeRow {
  topic: string;
  correct: number;
  incorrect: number;
  attempted: number;
  accuracy: number;
  pieData: Array<{ name: string; value: number }>;
}

interface TopicOutcomeDrilldownPopupProps {
  subject: string | null;
  records: PracticeRecord[];
  onClose: () => void;
}

function toNumber(value: unknown): number {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function buildTopicOutcomeRows(records: PracticeRecord[], subject: string): TopicOutcomeRow[] {
  const safeRecords = Array.isArray(records) ? records : [];
  const topicStatsMap: Record<string, { topic: string; correct: number; incorrect: number }> = {};

  safeRecords
    .filter((record) => String(record?.subject || "") === subject)
    .forEach((record) => {
      const topic = String(record?.topic || "Unknown");
      if (!topicStatsMap[topic]) {
        topicStatsMap[topic] = { topic, correct: 0, incorrect: 0 };
      }

      topicStatsMap[topic].correct += toNumber(record?.correct);
      topicStatsMap[topic].incorrect += toNumber(record?.incorrect);
    });

  return Object.values(topicStatsMap)
    .map((topicStats) => {
      const attempted = topicStats.correct + topicStats.incorrect;
      const accuracy = attempted === 0 ? 0 : Number(((topicStats.correct / attempted) * 100).toFixed(2));

      return {
        topic: topicStats.topic,
        correct: topicStats.correct,
        incorrect: topicStats.incorrect,
        attempted,
        accuracy,
        pieData: [
          { name: "Correct", value: topicStats.correct },
          { name: "Incorrect", value: topicStats.incorrect },
        ],
      };
    })
    .filter((row) => row.attempted > 0)
    .sort((first, second) => {
      if (second.attempted !== first.attempted) return second.attempted - first.attempted;
      return first.topic.localeCompare(second.topic);
    });
}

export default function TopicOutcomeDrilldownPopup({
  subject,
  records,
  onClose,
}: TopicOutcomeDrilldownPopupProps) {
  const isOpen = Boolean(subject);
  const safeSubject = subject || "";
  const panelRef = useRef<HTMLDivElement | null>(null);
  const topicRows = useMemo(
    () => (safeSubject ? buildTopicOutcomeRows(records, safeSubject) : []),
    [records, safeSubject],
  );

  useBodyScrollLock(isOpen);
  useFocusTrap({
    isActive: isOpen,
    containerRef: panelRef,
    initialFocusSelector: "button",
  });

  if (!isOpen) return null;

  return createPortal(
    <div className="subject-popup-backdrop topic-pie-popup-backdrop" onClick={onClose}>
      <div
        ref={panelRef}
        className="subject-popup-panel glass-panel fade-slide-in topic-pie-popup-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${safeSubject} topic accuracy drilldown`}
        tabIndex={-1}
      >
        <header className="subject-popup-header">
          <div className="subject-popup-title-wrap">
            <p className="subject-popup-kicker">Topic Drilldown</p>
            <h3 className="subject-popup-title">{safeSubject} - Correct vs Incorrect</h3>
            <p className="subject-popup-subtitle">
              Topic-wise correct vs incorrect distribution for solved questions.
            </p>
          </div>

          <button
            type="button"
            className="subject-popup-close ripple-btn"
            onClick={onClose}
            aria-label="Close topic pie drilldown popup"
            title="Close"
          >
            X
          </button>
        </header>

        {topicRows.length === 0 ? (
          <div className="chart-empty-state drilldown-pie-empty">
            <p>No solved topic data found for {safeSubject} in the current filters.</p>
          </div>
        ) : (
          <section className="drilldown-pie-grid">
            {topicRows.map((topicRow, index) => (
              <ChartCard
                key={topicRow.topic}
                title={topicRow.topic}
                note={`${topicRow.attempted} solved | ${topicRow.accuracy}% accuracy`}
                delay={index % 3}
              >
                <div className="drilldown-pie-shell">
                  <div className="pie-chart-shell chart-donut-spin">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart margin={PIE_CHART_MARGIN}>
                        <Pie
                          data={topicRow.pieData}
                          cx="50%"
                          cy="45%"
                          innerRadius="34%"
                          outerRadius="64%"
                          dataKey="value"
                          paddingAngle={4}
                          labelLine={false}
                          label={renderInnerDonutPercentageLabel}
                          isAnimationActive={false}
                        >
                          {topicRow.pieData.map((entry, colorIndex) => (
                            <Cell key={entry.name} fill={PIE_COLORS[colorIndex]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={TOOLTIP_STYLE}
                          allowEscapeViewBox={TOOLTIP_ESCAPE_VIEWBOX}
                          wrapperStyle={TOOLTIP_WRAPPER_STYLE}
                        />
                        <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </ChartCard>
            ))}
          </section>
        )}
      </div>
    </div>,
    document.body,
  );
}
