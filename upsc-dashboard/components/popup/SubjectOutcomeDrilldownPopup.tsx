import { useMemo, useRef, type KeyboardEvent } from "react";
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
const TOOLTIP_WRAPPER_STYLE = { zIndex: 1200 };
const PIE_COLORS = ["#00ff95", "#ff5f74"];
const PIE_CHART_MARGIN = { top: 12, right: 20, left: 20, bottom: 16 };
interface SubjectOutcomeRow {
  subject: string;
  correct: number;
  incorrect: number;
  attempted: number;
  accuracy: number;
  pieData: Array<{ name: string; value: number }>;
}

interface SubjectOutcomeDrilldownPopupProps {
  isOpen: boolean;
  records: PracticeRecord[];
  onClose: () => void;
  onSubjectClick: (subject: string) => void;
}

function toNumber(value: unknown): number {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function buildSubjectOutcomeRows(records: PracticeRecord[]): SubjectOutcomeRow[] {
  const safeRecords = Array.isArray(records) ? records : [];
  const subjectStatsMap: Record<string, { subject: string; correct: number; incorrect: number }> = {};

  safeRecords.forEach((record) => {
    const subject = String(record?.subject || "Unknown");
    if (!subjectStatsMap[subject]) {
      subjectStatsMap[subject] = { subject, correct: 0, incorrect: 0 };
    }

    subjectStatsMap[subject].correct += toNumber(record?.correct);
    subjectStatsMap[subject].incorrect += toNumber(record?.incorrect);
  });

  return Object.values(subjectStatsMap)
    .map((subjectStats) => {
      const attempted = subjectStats.correct + subjectStats.incorrect;
      const accuracy = attempted === 0 ? 0 : Number(((subjectStats.correct / attempted) * 100).toFixed(2));

      return {
        subject: subjectStats.subject,
        correct: subjectStats.correct,
        incorrect: subjectStats.incorrect,
        attempted,
        accuracy,
        pieData: [
          { name: "Correct", value: subjectStats.correct },
          { name: "Incorrect", value: subjectStats.incorrect },
        ],
      };
    })
    .filter((row) => row.attempted > 0)
    .sort((first, second) => {
      if (second.attempted !== first.attempted) return second.attempted - first.attempted;
      return first.subject.localeCompare(second.subject);
    });
}

export default function SubjectOutcomeDrilldownPopup({
  isOpen,
  records,
  onClose,
  onSubjectClick,
}: SubjectOutcomeDrilldownPopupProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const subjectRows = useMemo(() => buildSubjectOutcomeRows(records), [records]);

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
        className="subject-popup-panel glass-panel fade-slide-in subject-pie-popup-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Subject accuracy drilldown"
        tabIndex={-1}
      >
        <header className="subject-popup-header">
          <div className="subject-popup-title-wrap">
            <p className="subject-popup-kicker">Accuracy Drilldown</p>
            <h3 className="subject-popup-title">Subject Correct vs Incorrect</h3>
            <p className="subject-popup-subtitle">
              Click any subject pie chart to open topic-wise correct vs incorrect breakdown.
            </p>
          </div>

          <button
            type="button"
            className="subject-popup-close ripple-btn"
            onClick={onClose}
            aria-label="Close subject pie drilldown popup"
            title="Close"
          >
            X
          </button>
        </header>

        {subjectRows.length === 0 ? (
          <div className="chart-empty-state drilldown-pie-empty">
            <p>No solved subject data found for the current filters.</p>
          </div>
        ) : (
          <section className="drilldown-pie-grid">
            {subjectRows.map((subjectRow, index) => (
              <ChartCard
                key={subjectRow.subject}
                title={subjectRow.subject}
                note={`${subjectRow.attempted} solved | ${subjectRow.accuracy}% accuracy`}
                delay={index % 3}
              >
                <div
                  className="drilldown-pie-shell is-clickable"
                  role="button"
                  tabIndex={0}
                  onClick={() => onSubjectClick(subjectRow.subject)}
                  onKeyDown={(event) => handleSubjectKeyDown(event, subjectRow.subject)}
                  aria-label={`Open topic pies for ${subjectRow.subject}`}
                  title={`Open topic-wise breakdown for ${subjectRow.subject}`}
                >
                  <div className="pie-chart-shell chart-donut-spin">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart margin={PIE_CHART_MARGIN}>
                        <Pie
                          data={subjectRow.pieData}
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
                          onClick={() => onSubjectClick(subjectRow.subject)}
                        >
                          {subjectRow.pieData.map((entry, colorIndex) => (
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
