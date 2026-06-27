import { useId, useMemo, useRef, type KeyboardEvent } from "react";
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
const TOOLTIP_WRAPPER_STYLE = { zIndex: 1200 };
const CHART_AXIS_TICK = { fill: "#9eb7d6", fontSize: 12 };
const CHART_AXIS_LINE = { stroke: "rgba(133, 178, 229, 0.42)" };

interface SubjectAccuracyPoint {
  name: string;
  accuracy: number;
}

interface SubjectAccuracyChart {
  subject: string;
  attempts: number;
  overallAccuracy: number;
  trendData: SubjectAccuracyPoint[];
}

interface SubjectAccuracyDrilldownPopupProps {
  isOpen: boolean;
  records: PracticeRecord[];
  onClose: () => void;
  onSubjectClick: (subject: string) => void;
}

function toNumber(value: unknown): number {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function buildSubjectAccuracyCharts(records: PracticeRecord[]): SubjectAccuracyChart[] {
  const safeRecords = Array.isArray(records) ? records : [];
  const subjectMap = new Map<string, PracticeRecord[]>();

  safeRecords.forEach((record) => {
    const subject = String(record?.subject || "Unknown");
    if (!subjectMap.has(subject)) subjectMap.set(subject, []);
    subjectMap.get(subject)?.push(record);
  });

  return Array.from(subjectMap.entries())
    .map(([subject, subjectRecords]) => {
      const trendSource = [...subjectRecords].reverse();
      const trendData = trendSource.map((record, index) => ({
        name: String(index + 1),
        accuracy: toNumber(record.accuracy),
      }));

      const totalQuestions = subjectRecords.reduce(
        (sum, record) => sum + toNumber(record.total),
        0,
      );
      const totalCorrect = subjectRecords.reduce(
        (sum, record) => sum + toNumber(record.correct),
        0,
      );
      const overallAccuracy =
        totalQuestions === 0
          ? 0
          : Number(((totalCorrect / totalQuestions) * 100).toFixed(2));

      return {
        subject,
        attempts: trendData.length,
        overallAccuracy,
        trendData,
      };
    })
    .filter((row) => row.attempts > 0)
    .sort((first, second) => {
      if (second.attempts !== first.attempts) return second.attempts - first.attempts;
      return first.subject.localeCompare(second.subject);
    });
}

export default function SubjectAccuracyDrilldownPopup({
  isOpen,
  records,
  onClose,
  onSubjectClick,
}: SubjectAccuracyDrilldownPopupProps) {
  const chartId = useId().replaceAll(":", "");
  const panelRef = useRef<HTMLDivElement | null>(null);
  const subjectCharts = useMemo(() => buildSubjectAccuracyCharts(records), [records]);

  useBodyScrollLock(isOpen);
  useFocusTrap({
    isActive: isOpen,
    containerRef: panelRef,
    initialFocusSelector: "button, [tabindex]:not([tabindex='-1'])",
  });

  function handleSubjectKeyDown(event: KeyboardEvent<HTMLDivElement>, subject: string) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onSubjectClick(subject);
  }

  if (!isOpen) return null;

  return createPortal(
    <div className="subject-popup-backdrop subject-pie-popup-backdrop" onClick={onClose}>
      <div
        ref={panelRef}
        className="subject-popup-panel glass-panel fade-slide-in subject-pie-popup-panel subject-accuracy-popup-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Subject accuracy drilldown"
        tabIndex={-1}
      >
        <header className="subject-popup-header">
          <div className="subject-popup-title-wrap">
            <p className="subject-popup-kicker">Accuracy Drilldown</p>
            <h3 className="subject-popup-title">Subject-wise Accuracy</h3>
            <p className="subject-popup-subtitle">
              Each subject has its own graph. Click a graph to open topic-wise graphs.
            </p>
          </div>

          <button
            type="button"
            className="subject-popup-close ripple-btn"
            onClick={onClose}
            aria-label="Close subject accuracy popup"
            title="Close"
          >
            X
          </button>
        </header>

        {subjectCharts.length === 0 ? (
          <div className="chart-empty-state drilldown-pie-empty">
            <p>No subject accuracy data found for the current filters.</p>
          </div>
        ) : (
          <section className="topic-chart-grid subject-accuracy-popup-grid">
            {subjectCharts.map((subjectChart, index) => {
              const lineStrokeId = `subject-accuracy-line-${chartId}-${index}`;

              return (
                <ChartCard
                  key={subjectChart.subject}
                  title={`${subjectChart.subject} Accuracy Curve`}
                  note={`${subjectChart.attempts} attempts | ${subjectChart.overallAccuracy}% overall accuracy`}
                  delay={index % 3}
                >
                  <div
                    className="drilldown-pie-shell is-clickable subject-accuracy-chart-shell"
                    role="button"
                    tabIndex={0}
                    onClick={() => onSubjectClick(subjectChart.subject)}
                    onKeyDown={(event) => handleSubjectKeyDown(event, subjectChart.subject)}
                    aria-label={`Open topic-wise accuracy graphs for ${subjectChart.subject}`}
                    title={`Open topic-wise graphs for ${subjectChart.subject}`}
                  >
                    <ResponsiveContainer
                      width="100%"
                      aspect={1.55}
                      minHeight={180}
                      maxHeight={250}
                    >
                      <LineChart
                        data={subjectChart.trendData}
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
