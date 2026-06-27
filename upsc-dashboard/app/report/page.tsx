"use client";

import { useState } from "react";
import useReportData from "@/hooks/useReportData";
import ReportExporter from "@/components/ReportExporter";
import DateFilter from "@/components/filters/DateFilter";

interface DateRange {
  startDate: Date;
  endDate: Date;
}

export default function ReportPage() {
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  });

  const { data, summary, analysis, loading, error } = useReportData(
    dateRange.startDate,
    dateRange.endDate,
  );

  const handleDateChange = (newRange: DateRange) => {
    setDateRange(newRange);
  };

  const timelinePreview = analysis?.activityTimeline?.slice(0, 12) ?? [];
  const sessionsPreview = analysis?.sessionBreakdown?.slice(0, 8) ?? [];

  return (
    <div className="p-8 text-white">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold">Activity Report</h1>
        <DateFilter value={dateRange} onChange={handleDateChange} />
      </header>

      {loading ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <p>Loading report...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
          <p className="font-semibold">Failed to load report</p>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      ) : !data || !summary || !analysis ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <p>No report data found for this date range.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Export button */}
          <div className="flex justify-end">
            <ReportExporter reportData={data} dateRange={dateRange} />
          </div>

          {/* Summary cards */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-5 text-2xl font-semibold">Summary</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="Total Activities"
                value={summary.totalActivities}
              />
              <SummaryCard
                title="Questions Attempted"
                value={summary.totalQuestionsAttempted}
              />
              <SummaryCard title="Correct" value={summary.totalCorrect} />
              <SummaryCard title="Wrong" value={summary.totalWrong} />
              <SummaryCard title="Skipped" value={summary.totalSkipped} />
              <SummaryCard
                title="Accuracy"
                value={`${summary.accuracy.toFixed(2)}%`}
              />
              <SummaryCard
                title="Complete Actions"
                value={summary.totalCompleteActions}
              />
              <SummaryCard
                title="Revise Actions"
                value={summary.totalReviseActions}
              />
              <SummaryCard
                title="Star Actions"
                value={summary.totalStarActions}
              />
              <SummaryCard
                title="Uncomplete Actions"
                value={summary.totalUncompleteActions}
              />
              <SummaryCard
                title="Unrevise Actions"
                value={summary.totalUnreviseActions}
              />
              <SummaryCard
                title="Unstar Actions"
                value={summary.totalUnstarActions}
              />
              <SummaryCard title="Sessions" value={summary.sessionCount} />
            </div>
          </section>

          {/* Subject analysis */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-5 text-2xl font-semibold">Subject Analysis</h2>

            {Object.keys(analysis.subjectAnalysis ?? {}).length === 0 ? (
              <p className="text-sm text-white/70">
                No subject analysis available.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-white/70">
                      <th className="px-3 py-3">Subject</th>
                      <th className="px-3 py-3">Total</th>
                      <th className="px-3 py-3">Correct</th>
                      <th className="px-3 py-3">Wrong</th>
                      <th className="px-3 py-3">Skipped</th>
                      <th className="px-3 py-3">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(analysis.subjectAnalysis)
                      .sort((a, b) => b[1].total - a[1].total)
                      .map(([subject, bucket]) => (
                        <tr key={subject} className="border-b border-white/5">
                          <td className="px-3 py-3">{subject || "Unknown"}</td>
                          <td className="px-3 py-3">{bucket.total}</td>
                          <td className="px-3 py-3">{bucket.correct}</td>
                          <td className="px-3 py-3">{bucket.wrong}</td>
                          <td className="px-3 py-3">{bucket.skipped}</td>
                          <td className="px-3 py-3">
                            {bucket.accuracy.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Weak topics / strong topics */}
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-5 text-2xl font-semibold">Weak Topics</h2>

              {(analysis.aiAnalysisHelpers?.weakTopics?.length ?? 0) === 0 ? (
                <p className="text-sm text-white/70">No weak-topic data yet.</p>
              ) : (
                <div className="space-y-3">
                  {analysis.aiAnalysisHelpers.weakTopics
                    .slice(0, 10)
                    .map((item) => (
                      <div
                        key={item.key}
                        className="rounded-xl border border-white/10 bg-black/20 p-4"
                      >
                        <div className="font-medium">
                          {item.subject} → {item.chapter || "—"} →{" "}
                          {item.topic || "—"} → {item.subtopic || "—"}
                        </div>
                        <div className="mt-2 text-sm text-white/75">
                          Total: {item.total} | Wrong: {item.wrong} | Accuracy:{" "}
                          {item.accuracy.toFixed(2)}%
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-5 text-2xl font-semibold">Strong Topics</h2>

              {(analysis.aiAnalysisHelpers?.strongTopics?.length ?? 0) === 0 ? (
                <p className="text-sm text-white/70">
                  No strong-topic data yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {analysis.aiAnalysisHelpers.strongTopics
                    .slice(0, 10)
                    .map((item) => (
                      <div
                        key={item.key}
                        className="rounded-xl border border-white/10 bg-black/20 p-4"
                      >
                        <div className="font-medium">
                          {item.subject} → {item.chapter || "—"} →{" "}
                          {item.topic || "—"} → {item.subtopic || "—"}
                        </div>
                        <div className="mt-2 text-sm text-white/75">
                          Total: {item.total} | Correct: {item.correct} |
                          Accuracy: {item.accuracy.toFixed(2)}%
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </section>
          </div>

          {/* Activity timeline preview */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-5 text-2xl font-semibold">Activity Timeline</h2>

            {timelinePreview.length === 0 ? (
              <p className="text-sm text-white/70">
                No activity in this range.
              </p>
            ) : (
              <div className="space-y-3">
                {timelinePreview.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                      <div className="font-medium">{event.label}</div>
                      <div className="text-sm text-white/60">
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                    </div>

                    <div className="mt-2 text-sm text-white/75">
                      Subject: {event.subject || "—"}
                      {event.chapter ? ` | Chapter: ${event.chapter}` : ""}
                      {event.topic ? ` | Topic: ${event.topic}` : ""}
                      {event.subtopic ? ` | Subtopic: ${event.subtopic}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Sessions preview */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-5 text-2xl font-semibold">Study Sessions</h2>

            {sessionsPreview.length === 0 ? (
              <p className="text-sm text-white/70">
                No sessions found in this range.
              </p>
            ) : (
              <div className="space-y-3">
                {sessionsPreview.map((session) => (
                  <div
                    key={session.sessionId}
                    className="rounded-xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                      <div className="font-medium">
                        Session {session.sessionId}
                      </div>
                      <div className="text-sm text-white/60">
                        Accuracy: {session.accuracy.toFixed(2)}%
                      </div>
                    </div>

                    <div className="mt-2 text-sm text-white/75">
                      Questions: {session.questionsAttempted} | Correct:{" "}
                      {session.correctCount} | Wrong: {session.wrongCount} |
                      Skipped: {session.skippedCount}
                    </div>
                    <div className="mt-1 text-sm text-white/75">
                      Actions: {session.actionsPerformed} | Duration:{" "}
                      {session.sessionDurationSeconds ?? 0}s
                    </div>
                    <div className="mt-1 text-sm text-white/75">
                      Subjects:{" "}
                      {session.subjectsStudied.length > 0
                        ? session.subjectsStudied.join(", ")
                        : "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <h3 className="text-sm font-medium text-white/70">{title}</h3>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
