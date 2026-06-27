"use client";

import { useMemo, useState } from "react";
import useReportData from "@/hooks/useReportData";

type PresetRange =
  | "today"
  | "yesterday"
  | "last7"
  | "last30"
  | "thisMonth"
  | "previousMonth"
  | "custom";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function toInputDate(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function getPresetRange(preset: PresetRange) {
  const now = new Date();

  switch (preset) {
    case "today": {
      return {
        startDate: startOfDay(now),
        endDate: endOfDay(now),
      };
    }

    case "yesterday": {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        startDate: startOfDay(yesterday),
        endDate: endOfDay(yesterday),
      };
    }

    case "last7": {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      return {
        startDate: startOfDay(start),
        endDate: endOfDay(now),
      };
    }

    case "last30": {
      const start = new Date(now);
      start.setDate(start.getDate() - 29);
      return {
        startDate: startOfDay(start),
        endDate: endOfDay(now),
      };
    }

    case "thisMonth": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        startDate: startOfDay(start),
        endDate: endOfDay(end),
      };
    }

    case "previousMonth": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        startDate: startOfDay(start),
        endDate: endOfDay(end),
      };
    }

    case "custom":
    default: {
      return {
        startDate: startOfDay(now),
        endDate: endOfDay(now),
      };
    }
  }
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function formatPct(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) return "0.00%";
  return `${value.toFixed(2)}%`;
}

function formatNumber(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) return "0";
  return value.toLocaleString();
}

function formatSeconds(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  if (value < 60) return `${value}s`;

  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const seconds = value % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

function cardStyle(): React.CSSProperties {
  return {
    border: "1px solid #2b2b2b",
    borderRadius: 12,
    padding: "1rem",
    background: "#111",
    color: "#fff",
  };
}

function sectionTitleStyle(): React.CSSProperties {
  return {
    margin: "0 0 1rem 0",
    fontSize: "1.1rem",
    fontWeight: 700,
  };
}

export default function ReportPageClient() {
  const [preset, setPreset] = useState<PresetRange>("last7");

  const initialPresetRange = useMemo(() => getPresetRange("last7"), []);
  const [customStartDate, setCustomStartDate] = useState(
    toInputDate(initialPresetRange.startDate),
  );
  const [customEndDate, setCustomEndDate] = useState(
    toInputDate(initialPresetRange.endDate),
  );

  const activeRange = useMemo(() => {
    if (preset === "custom") {
      const start = customStartDate
        ? startOfDay(new Date(customStartDate))
        : null;
      const end = customEndDate ? endOfDay(new Date(customEndDate)) : null;

      return {
        startDate: start,
        endDate: end,
      };
    }

    return getPresetRange(preset);
  }, [preset, customStartDate, customEndDate]);

  const { report, summary, analysis, timeline, sessions, loading, error } =
    useReportData(activeRange.startDate, activeRange.endDate);

  const topSubjects = useMemo(() => {
    return Object.entries(analysis.subjectAnalysis || {})
      .map(([subject, value]) => ({
        subject,
        ...value,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [analysis.subjectAnalysis]);

  const topChapters = useMemo(() => {
    return Object.entries(analysis.chapterAnalysis || {})
      .map(([key, value]) => ({
        key,
        ...value,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 12);
  }, [analysis.chapterAnalysis]);

  const topTopics = useMemo(() => {
    return Object.entries(analysis.topicAnalysis || {})
      .map(([key, value]) => ({
        key,
        ...value,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 12);
  }, [analysis.topicAnalysis]);

  const difficultyRows = useMemo(() => {
    return Object.entries(analysis.difficultyAnalysis || {})
      .map(([difficulty, value]) => ({
        difficulty,
        ...value,
      }))
      .sort((a, b) => b.total - a.total);
  }, [analysis.difficultyAnalysis]);

  const timelinePreview = useMemo(
    () => timeline.slice(-50).reverse(),
    [timeline],
  );

  const weakTopics = analysis.aiAnalysisHelpers?.weakTopics ?? [];
  const strongTopics = analysis.aiAnalysisHelpers?.strongTopics ?? [];
  const repeatedMistakes =
    analysis.aiAnalysisHelpers?.repeatedMistakePatterns ?? [];

  const handleExportJson = () => {
    if (!report) return;

    const startLabel = activeRange.startDate
      ? toInputDate(activeRange.startDate)
      : "unknown-start";
    const endLabel = activeRange.endDate
      ? toInputDate(activeRange.endDate)
      : "unknown-end";

    downloadJson(`upsc-report-${startLabel}-to-${endLabel}.json`, report);
  };

  return (
    <div
      style={{
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        background: "#0b0b0b",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "1.8rem" }}>Report</h1>
          <p style={{ margin: "0.35rem 0 0 0", color: "#aaa" }}>
            AI-ready reporting dashboard with timeline, sessions, analytics, and
            JSON export.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportJson}
          disabled={!report || loading}
          style={{
            border: "1px solid #444",
            background: report && !loading ? "#fff" : "#444",
            color: report && !loading ? "#000" : "#bbb",
            borderRadius: 10,
            padding: "0.8rem 1rem",
            fontWeight: 700,
            cursor: report && !loading ? "pointer" : "not-allowed",
          }}
        >
          Export JSON
        </button>
      </div>

      <div style={cardStyle()}>
        <div style={sectionTitleStyle()}>Date Filters</div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          {[
            ["today", "Today"],
            ["yesterday", "Yesterday"],
            ["last7", "Last 7 Days"],
            ["last30", "Last 30 Days"],
            ["thisMonth", "This Month"],
            ["previousMonth", "Previous Month"],
            ["custom", "Custom"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setPreset(value as PresetRange)}
              style={{
                border: "1px solid #444",
                background: preset === value ? "#fff" : "#111",
                color: preset === value ? "#000" : "#fff",
                borderRadius: 999,
                padding: "0.6rem 0.9rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {preset === "custom" && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <label
                htmlFor="report-start-date"
                style={{ display: "block", marginBottom: 6 }}
              >
                Start Date
              </label>
              <input
                id="report-start-date"
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                style={{
                  background: "#111",
                  color: "#fff",
                  border: "1px solid #444",
                  borderRadius: 8,
                  padding: "0.6rem",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="report-end-date"
                style={{ display: "block", marginBottom: 6 }}
              >
                End Date
              </label>
              <input
                id="report-end-date"
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                style={{
                  background: "#111",
                  color: "#fff",
                  border: "1px solid #444",
                  borderRadius: 8,
                  padding: "0.6rem",
                }}
              />
            </div>
          </div>
        )}

        <div style={{ marginTop: "1rem", color: "#aaa" }}>
          Active range:{" "}
          <strong style={{ color: "#fff" }}>
            {activeRange.startDate?.toLocaleString()} →{" "}
            {activeRange.endDate?.toLocaleString()}
          </strong>
        </div>
      </div>

      {loading && (
        <div style={cardStyle()}>
          <div style={sectionTitleStyle()}>Loading report...</div>
          <p style={{ margin: 0, color: "#aaa" }}>
            Fetching attempts, note activity, sessions, and analytics.
          </p>
        </div>
      )}

      {!loading && error && (
        <div style={{ ...cardStyle(), borderColor: "#8b2f2f" }}>
          <div style={sectionTitleStyle()}>Error</div>
          <p style={{ margin: 0, color: "#ff8f8f" }}>{error}</p>
        </div>
      )}

      {!loading && !error && !report && (
        <div style={cardStyle()}>
          <div style={sectionTitleStyle()}>No report available</div>
          <p style={{ margin: 0, color: "#aaa" }}>
            No report data found for the selected range.
          </p>
        </div>
      )}

      {!loading && !error && report && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
            }}
          >
            <div style={cardStyle()}>
              <div style={{ color: "#aaa", marginBottom: 8 }}>
                Questions Attempted
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800 }}>
                {formatNumber(summary?.totalQuestionsAttempted)}
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ color: "#aaa", marginBottom: 8 }}>Correct</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800 }}>
                {formatNumber(summary?.totalCorrect)}
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ color: "#aaa", marginBottom: 8 }}>Wrong</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800 }}>
                {formatNumber(summary?.totalWrong)}
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ color: "#aaa", marginBottom: 8 }}>Accuracy</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800 }}>
                {formatPct(summary?.accuracy)}
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ color: "#aaa", marginBottom: 8 }}>
                Complete Actions
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800 }}>
                {formatNumber(summary?.totalCompleteActions)}
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ color: "#aaa", marginBottom: 8 }}>
                Revise Actions
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800 }}>
                {formatNumber(summary?.totalReviseActions)}
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ color: "#aaa", marginBottom: 8 }}>Star Actions</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800 }}>
                {formatNumber(summary?.totalStarActions)}
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ color: "#aaa", marginBottom: 8 }}>Sessions</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800 }}>
                {formatNumber(summary?.sessionCount)}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: "1rem",
            }}
          >
            <div style={cardStyle()}>
              <div style={sectionTitleStyle()}>Subject Analysis</div>
              {topSubjects.length === 0 ? (
                <p style={{ margin: 0, color: "#aaa" }}>
                  No subject attempt data.
                </p>
              ) : (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  {topSubjects.map((item) => (
                    <div
                      key={item.subject}
                      style={{
                        border: "1px solid #222",
                        borderRadius: 10,
                        padding: "0.8rem",
                        background: "#0d0d0d",
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>
                        {item.subject}
                      </div>
                      <div style={{ color: "#aaa", fontSize: 14 }}>
                        Total: {item.total} | Correct: {item.correct} | Wrong:{" "}
                        {item.wrong} | Accuracy: {formatPct(item.accuracy)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={cardStyle()}>
              <div style={sectionTitleStyle()}>Difficulty Analysis</div>
              {difficultyRows.length === 0 ? (
                <p style={{ margin: 0, color: "#aaa" }}>No difficulty data.</p>
              ) : (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  {difficultyRows.map((row) => (
                    <div
                      key={row.difficulty}
                      style={{
                        border: "1px solid #222",
                        borderRadius: 10,
                        padding: "0.8rem",
                        background: "#0d0d0d",
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>
                        {row.difficulty || "Unknown"}
                      </div>
                      <div style={{ color: "#aaa", fontSize: 14 }}>
                        Total: {row.total} | Correct: {row.correct} | Wrong:{" "}
                        {row.wrong} | Accuracy: {formatPct(row.accuracy)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: "1rem",
            }}
          >
            <div style={cardStyle()}>
              <div style={sectionTitleStyle()}>Top Chapters by Attempts</div>
              {topChapters.length === 0 ? (
                <p style={{ margin: 0, color: "#aaa" }}>No chapter data.</p>
              ) : (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  {topChapters.map((item) => (
                    <div
                      key={item.key}
                      style={{
                        border: "1px solid #222",
                        borderRadius: 10,
                        padding: "0.8rem",
                        background: "#0d0d0d",
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>
                        {item.subject} → {item.chapter || "Unknown"}
                      </div>
                      <div style={{ color: "#aaa", fontSize: 14 }}>
                        Total: {item.total} | Correct: {item.correct} | Wrong:{" "}
                        {item.wrong} | Accuracy: {formatPct(item.accuracy)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={cardStyle()}>
              <div style={sectionTitleStyle()}>Top Topics by Attempts</div>
              {topTopics.length === 0 ? (
                <p style={{ margin: 0, color: "#aaa" }}>No topic data.</p>
              ) : (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  {topTopics.map((item) => (
                    <div
                      key={item.key}
                      style={{
                        border: "1px solid #222",
                        borderRadius: 10,
                        padding: "0.8rem",
                        background: "#0d0d0d",
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>
                        {item.subject} → {item.chapter || "Unknown"} →{" "}
                        {item.topic || "Unknown"}
                      </div>
                      <div style={{ color: "#aaa", fontSize: 14 }}>
                        Total: {item.total} | Correct: {item.correct} | Wrong:{" "}
                        {item.wrong} | Accuracy: {formatPct(item.accuracy)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={sectionTitleStyle()}>Time Analysis</div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  border: "1px solid #222",
                  borderRadius: 10,
                  padding: "0.8rem",
                  background: "#0d0d0d",
                }}
              >
                <div style={{ color: "#aaa", marginBottom: 6 }}>
                  Average Question Time
                </div>
                <div style={{ fontWeight: 800, fontSize: "1.2rem" }}>
                  {formatSeconds(
                    analysis.timeAnalysis?.averageTimeTakenSeconds,
                  )}
                </div>
              </div>

              <div
                style={{
                  border: "1px solid #222",
                  borderRadius: 10,
                  padding: "0.8rem",
                  background: "#0d0d0d",
                }}
              >
                <div style={{ color: "#aaa", marginBottom: 6 }}>
                  Median Question Time
                </div>
                <div style={{ fontWeight: 800, fontSize: "1.2rem" }}>
                  {formatSeconds(analysis.timeAnalysis?.medianTimeTakenSeconds)}
                </div>
              </div>

              <div
                style={{
                  border: "1px solid #222",
                  borderRadius: 10,
                  padding: "0.8rem",
                  background: "#0d0d0d",
                }}
              >
                <div style={{ color: "#aaa", marginBottom: 6 }}>
                  Average Session Duration
                </div>
                <div style={{ fontWeight: 800, fontSize: "1.2rem" }}>
                  {formatSeconds(
                    analysis.timeAnalysis?.averageSessionDurationSeconds,
                  )}
                </div>
              </div>
            </div>

            <div style={{ color: "#aaa", fontSize: 14 }}>
              Hour-wise performance and fastest/slowest question data are
              included in the exported JSON.
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: "1rem",
            }}
          >
            <div style={cardStyle()}>
              <div style={sectionTitleStyle()}>Weak Topics</div>
              {weakTopics.length === 0 ? (
                <p style={{ margin: 0, color: "#aaa" }}>
                  No weak-topic pattern yet.
                </p>
              ) : (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  {weakTopics.slice(0, 10).map((item) => (
                    <div
                      key={item.key}
                      style={{
                        border: "1px solid #222",
                        borderRadius: 10,
                        padding: "0.8rem",
                        background: "#0d0d0d",
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>
                        {item.subject} → {item.chapter || "Unknown"} →{" "}
                        {item.topic || "Unknown"} → {item.subtopic || "Unknown"}
                      </div>
                      <div style={{ color: "#aaa", fontSize: 14 }}>
                        Attempts: {item.total} | Wrong: {item.wrong} | Accuracy:{" "}
                        {formatPct(item.accuracy)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={cardStyle()}>
              <div style={sectionTitleStyle()}>Strong Topics</div>
              {strongTopics.length === 0 ? (
                <p style={{ margin: 0, color: "#aaa" }}>
                  No strong-topic pattern yet.
                </p>
              ) : (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  {strongTopics.slice(0, 10).map((item) => (
                    <div
                      key={item.key}
                      style={{
                        border: "1px solid #222",
                        borderRadius: 10,
                        padding: "0.8rem",
                        background: "#0d0d0d",
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>
                        {item.subject} → {item.chapter || "Unknown"} →{" "}
                        {item.topic || "Unknown"} → {item.subtopic || "Unknown"}
                      </div>
                      <div style={{ color: "#aaa", fontSize: 14 }}>
                        Attempts: {item.total} | Correct: {item.correct} |
                        Accuracy: {formatPct(item.accuracy)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={sectionTitleStyle()}>Repeated Mistake Patterns</div>

            {repeatedMistakes.length === 0 ? (
              <p style={{ margin: 0, color: "#aaa" }}>
                No repeated mistake pattern detected yet.
              </p>
            ) : (
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {repeatedMistakes.slice(0, 12).map((item, index) => (
                  <div
                    key={`${item.questionId ?? "question"}-${index}`}
                    style={{
                      border: "1px solid #222",
                      borderRadius: 10,
                      padding: "0.8rem",
                      background: "#0d0d0d",
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>
                      {item.subject} → {item.chapter || "Unknown"} →{" "}
                      {item.topic || "Unknown"} → {item.subtopic || "Unknown"}
                    </div>
                    <div style={{ color: "#fff", marginBottom: 6 }}>
                      {item.questionText || "(Question text unavailable)"}
                    </div>
                    <div style={{ color: "#aaa", fontSize: 14 }}>
                      Wrong Attempts: {item.wrongAttempts} | Total Attempts:{" "}
                      {item.totalAttempts}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={cardStyle()}>
            <div style={sectionTitleStyle()}>Study Sessions</div>

            {sessions.length === 0 ? (
              <p style={{ margin: 0, color: "#aaa" }}>
                No study sessions in selected range.
              </p>
            ) : (
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {sessions.slice(0, 20).map((session) => (
                  <div
                    key={session.sessionId}
                    style={{
                      border: "1px solid #222",
                      borderRadius: 10,
                      padding: "0.9rem",
                      background: "#0d0d0d",
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>
                      Session: {session.sessionId}
                    </div>
                    <div
                      style={{ color: "#aaa", fontSize: 14, marginBottom: 6 }}
                    >
                      Start:{" "}
                      {session.sessionStart
                        ? new Date(session.sessionStart).toLocaleString()
                        : "-"}
                    </div>
                    <div
                      style={{ color: "#aaa", fontSize: 14, marginBottom: 6 }}
                    >
                      End:{" "}
                      {session.sessionEnd
                        ? new Date(session.sessionEnd).toLocaleString()
                        : "-"}
                    </div>
                    <div
                      style={{ color: "#aaa", fontSize: 14, marginBottom: 6 }}
                    >
                      Duration: {formatSeconds(session.sessionDurationSeconds)}
                    </div>
                    <div style={{ color: "#aaa", fontSize: 14 }}>
                      Questions: {session.questionsAttempted} | Correct:{" "}
                      {session.correctCount} | Wrong: {session.wrongCount} |
                      Accuracy: {formatPct(session.accuracy)} | Actions:{" "}
                      {session.actionsPerformed}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={cardStyle()}>
            <div style={sectionTitleStyle()}>Activity Timeline Preview</div>

            {timelinePreview.length === 0 ? (
              <p style={{ margin: 0, color: "#aaa" }}>
                No activity found in selected range.
              </p>
            ) : (
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {timelinePreview.map((event) => (
                  <div
                    key={event.id}
                    style={{
                      border: "1px solid #222",
                      borderRadius: 10,
                      padding: "0.8rem",
                      background: "#0d0d0d",
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>
                      {event.label}
                    </div>
                    <div
                      style={{ color: "#aaa", fontSize: 14, marginBottom: 4 }}
                    >
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                    <div style={{ color: "#aaa", fontSize: 14 }}>
                      Subject: {event.subject || "-"}
                      {event.chapter ? ` | Chapter: ${event.chapter}` : ""}
                      {event.topic ? ` | Topic: ${event.topic}` : ""}
                      {event.subtopic ? ` | Subtopic: ${event.subtopic}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
