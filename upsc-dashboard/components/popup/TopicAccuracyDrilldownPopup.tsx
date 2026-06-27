import { useId, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartCard from "@/components/charts/ChartCard";
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
const CHART_AXIS_TICK = { fill: "#9eb7d6", fontSize: 12 };
const CHART_AXIS_LINE = { stroke: "rgba(133, 178, 229, 0.42)" };

interface TopicAccuracyPoint {
  name: string;
  accuracy: number;
}

interface TopicAccuracyChart {
  topic: string;
  attempts: number;
  overallAccuracy: number;
  trendData: TopicAccuracyPoint[];
}

interface TopicAccuracyDrilldownPopupProps {
  subject: string | null;
  records: PracticeRecord[];
  onClose: () => void;
}

function toNumber(value: unknown): number {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function buildTopicAccuracyCharts(records: PracticeRecord[], subject: string): TopicAccuracyChart[] {
  const safeRecords = Array.isArray(records) ? records : [];
  const topicMap = new Map<string, PracticeRecord[]>();

  safeRecords
    .filter((record) => String(record?.subject || "") === subject)
    .forEach((record) => {
      const topic = String(record?.topic || "Unknown");
      if (!topicMap.has(topic)) topicMap.set(topic, []);
      topicMap.get(topic)?.push(record);
    });

  return Array.from(topicMap.entries())
    .map(([topic, topicRecords]) => {
      const trendSource = [...topicRecords].reverse();
      const trendData = trendSource.map((record, index) => ({
        name: String(index + 1),
        accuracy: toNumber(record.accuracy),
      }));

      const totalQuestions = topicRecords.reduce(
        (sum, record) => sum + toNumber(record.total),
        0,
      );
      const totalCorrect = topicRecords.reduce(
        (sum, record) => sum + toNumber(record.correct),
        0,
      );
      const overallAccuracy =
        totalQuestions === 0
          ? 0
          : Number(((totalCorrect / totalQuestions) * 100).toFixed(2));

      return {
        topic,
        attempts: trendData.length,
        overallAccuracy,
        trendData,
      };
    })
    .filter((row) => row.attempts > 0)
    .sort((first, second) => {
      if (second.attempts !== first.attempts) return second.attempts - first.attempts;
      return first.topic.localeCompare(second.topic);
    });
}

export default function TopicAccuracyDrilldownPopup({
  subject,
  records,
  onClose,
}: TopicAccuracyDrilldownPopupProps) {
  const chartId = useId().replaceAll(":", "");
  const isOpen = Boolean(subject);
  const safeSubject = subject || "";
  const panelRef = useRef<HTMLDivElement | null>(null);
  const topicCharts = useMemo(
    () => (safeSubject ? buildTopicAccuracyCharts(records, safeSubject) : []),
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
            <h3 className="subject-popup-title">{safeSubject} - Topic-wise Accuracy</h3>
            <p className="subject-popup-subtitle">
              Each topic has its own accuracy graph.
            </p>
          </div>

          <button
            type="button"
            className="subject-popup-close ripple-btn"
            onClick={onClose}
            aria-label="Close topic accuracy popup"
            title="Close"
          >
            X
          </button>
        </header>

        {topicCharts.length === 0 ? (
          <div className="chart-empty-state drilldown-pie-empty">
            <p>No topic accuracy data found for {safeSubject} in the current filters.</p>
          </div>
        ) : (
          <section className="topic-chart-grid">
            {topicCharts.map((topicChart, index) => {
              const lineStrokeId = `topic-accuracy-line-${chartId}-${index}`;

              return (
                <ChartCard
                  key={topicChart.topic}
                  title={`${topicChart.topic} Accuracy Curve`}
                  note={`${topicChart.attempts} attempts | ${topicChart.overallAccuracy}% overall accuracy`}
                  delay={index % 3}
                >
                  <div className="drilldown-pie-shell">
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart
                        data={topicChart.trendData}
                        margin={{ top: 10, right: 14, left: -6, bottom: 4 }}
                      >
                        <defs>
                          <linearGradient id={lineStrokeId} x1="0" y1="0" x2="1" y2="0">
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
                          label={{ value: "Attempt", position: "insideBottom", offset: -2 }}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={CHART_AXIS_TICK}
                          tickLine={false}
                          axisLine={CHART_AXIS_LINE}
                        />
                        <Tooltip
                          contentStyle={TOOLTIP_STYLE}
                          allowEscapeViewBox={TOOLTIP_ESCAPE_VIEWBOX}
                          wrapperStyle={TOOLTIP_WRAPPER_STYLE}
                          formatter={(value, name) => [
                            value,
                            name === "accuracy" ? "Accuracy %" : String(name),
                          ]}
                          labelFormatter={(label) => `Attempt ${label}`}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="accuracy"
                          name="Accuracy %"
                          stroke={`url(#${lineStrokeId})`}
                          strokeWidth={3}
                          dot={{ r: 3, fill: "#8ff6ff", strokeWidth: 0 }}
                          activeDot={{
                            r: 5,
                            fill: "#9ffeff",
                            stroke: "#0d1933",
                            strokeWidth: 2,
                          }}
                          animationDuration={700}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              );
            })}
          </section>
        )}
      </div>
    </div>,
    document.body,
  );
}
