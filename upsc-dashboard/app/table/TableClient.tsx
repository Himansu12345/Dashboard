"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteAttempt,
  fetchAttempts,
  type AttemptQuestionDetail,
  type AttemptResponse,
} from "@/lib/api/attempts";

const UPSC_CORRECT_MARKS = 2;
const UPSC_NEGATIVE_MARKS = 0.66;
const DEFAULT_SECONDS_PER_QUESTION = 90;

type QuestionOutcome = "correct" | "incorrect" | "skipped";

type QuestionRow = AttemptQuestionDetail & {
  displayIndex: number;
  outcome: QuestionOutcome;
};

type AttemptRow = AttemptResponse & {
  difficultySummary: string;
  displayDate: string;
  marks: number;
  questions: QuestionRow[];
  testNo: number;
  timeSeconds: number;
};

const tableHeadings = [
  { key: "date", label: "Date" },
  { key: "test", label: "Test" },
  { key: "subject", label: "Subject" },
  { key: "total", label: "Total" },

  { key: "correct", label: "Right", icon: "check" },
  { key: "incorrect", label: "Wrong", icon: "cross" },

  { key: "skipped", label: "Skipped", icon: "skip" },
  { key: "accuracy", label: "Accuracy", icon: "target" },
  { key: "difficulty", label: "Difficulty", icon: "difficulty" },
  { key: "marks", label: "Marks", icon: "star" },
  { key: "time", label: "Time", icon: "clock" },

  { key: "actions", label: "Actions" },
] as const;

const compactStats = [
  { key: "total", label: "Total" },
  { key: "correct", label: "Right" },
  { key: "incorrect", label: "Wrong" },
  { key: "skipped", label: "Skipped" },
] as const;

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CrossIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 6l12 12M18 6L6 18"
      />
    </svg>
  );
}

function parseAttemptTime(attempt: AttemptResponse) {
  const parsed = new Date(attempt.createdAt).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDate(dateValue: string | null, fallback: string) {
  const parsed = dateValue
    ? new Date(`${dateValue}T00:00:00`)
    : new Date(fallback);
  if (Number.isNaN(parsed.getTime())) return "N/A";

  return parsed.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatSeconds(seconds: number) {
  const totalSeconds = Math.max(0, Math.round(seconds || 0));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  if (minutes < 1) return `${remainingSeconds}s`;
  if (minutes < 60)
    return `${minutes}m ${String(remainingSeconds).padStart(2, "0")}s`;

  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function formatMarks(value: number) {
  return value.toFixed(Number.isInteger(value) ? 0 : 2);
}

function normalizeDifficulty(value: string | undefined) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (normalized === "easy") return "Easy";
  if (normalized === "medium" || normalized === "mid") return "Mid";
  if (normalized === "hard") return "Hard";
  return "Unknown";
}

function accuracyLabel(attempt: AttemptResponse) {
  if (attempt.total <= 0) return "0%";
  return `${Math.round((attempt.correct / attempt.total) * 100)}%`;
}

function buildQuestionRows(attempt: AttemptResponse): QuestionRow[] {
  return [
    ...(attempt.correctDetails || []).map((detail) => ({
      ...detail,
      outcome: "correct" as const,
    })),
    ...(attempt.incorrectDetails || []).map((detail) => ({
      ...detail,
      outcome: "incorrect" as const,
    })),
    ...(attempt.skippedDetails || []).map((detail) => ({
      ...detail,
      outcome: "skipped" as const,
    })),
  ].map((question, index) => ({
    ...question,
    displayIndex: index + 1,
  }));
}

function buildDifficultySummary(
  attempt: AttemptResponse,
  questions: QuestionRow[],
) {
  const counts = questions.reduce(
    (acc, question) => {
      const difficulty = normalizeDifficulty(question.difficulty);
      if (difficulty === "Easy") acc.easy += 1;
      if (difficulty === "Mid") acc.mid += 1;
      if (difficulty === "Hard") acc.hard += 1;
      return acc;
    },
    { easy: 0, mid: 0, hard: 0 },
  );

  if (counts.easy + counts.mid + counts.hard > 0) {
    return `${counts.easy}/${counts.mid}/${counts.hard}`;
  }

  return normalizeDifficulty(attempt.difficulty);
}

function getAttemptTime(attempt: AttemptResponse, questions: QuestionRow[]) {
  const spentSeconds = questions.reduce(
    (sum, question) =>
      sum + Math.max(0, Math.round(question.timeSpentSeconds || 0)),
    0,
  );

  return spentSeconds > 0
    ? spentSeconds
    : attempt.allottedTimeSeconds ||
        attempt.total * DEFAULT_SECONDS_PER_QUESTION;
}

function buildRows(attempts: AttemptResponse[]): AttemptRow[] {
  return attempts
    .filter((attempt) => !attempt.deletedAt)
    .slice()
    .sort((a, b) => parseAttemptTime(a) - parseAttemptTime(b))
    .map((attempt, index) => {
      const questions = buildQuestionRows(attempt);

      return {
        ...attempt,
        difficultySummary: buildDifficultySummary(attempt, questions),
        displayDate: formatDate(attempt.dateValue, attempt.createdAt),
        marks:
          attempt.correct * UPSC_CORRECT_MARKS -
          attempt.incorrect * UPSC_NEGATIVE_MARKS,
        questions,
        testNo: index + 1,
        timeSeconds: getAttemptTime(attempt, questions),
      };
    })
    .reverse();
}

function outcomeStyles(outcome: QuestionOutcome) {
  if (outcome === "correct") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  }
  if (outcome === "skipped") {
    return "border-amber-400/30 bg-amber-400/10 text-amber-200";
  }
  return "border-rose-400/30 bg-rose-400/10 text-rose-200";
}

function optionClass(
  outcome: QuestionOutcome,
  isCorrect: boolean,
  isSelected: boolean,
) {
  const base = "bg-white/[0.035] text-slate-300 transition-all duration-200";

  // (iii) Skipped
  if (outcome === "skipped") {
    return `${base} border border-white/10`;
  }

  // (i) Correct
  if (outcome === "correct") {
    if (isSelected) {
      return `${base} border-2 border-emerald-500`;
    }

    return `${base} border border-white/10`;
  }

  // (ii) Incorrect
  if (outcome === "incorrect") {
    if (isCorrect) {
      return `${base} border-2 border-emerald-500`;
    }

    if (isSelected) {
      return `${base} border-2 border-rose-500`;
    }

    return `${base} border border-white/10`;
  }

  return `${base} border border-white/10`;
}

function ReviewModal({
  attempt,
  onClose,
}: {
  attempt: AttemptRow;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // const summary = [
  //   ["Total", attempt.total],
  //   ["Right", attempt.correct],
  //   ["Wrong", attempt.incorrect],
  //   ["Skipped", attempt.skipped],
  //   ["Marks", formatMarks(attempt.marks)],
  // ];

  return (
    <div
      aria-label={`Test ${attempt.testNo} question review`}
      aria-modal="true"
      className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-[#020817]/78 px-3 py-5 backdrop-blur-md"
      onMouseDown={onClose}
      role="dialog"
    >
      <section
        className="flex max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-[18px] border border-cyan-300/20 bg-[linear-gradient(145deg,rgba(12,23,46,0.98),rgba(6,14,29,0.98))] text-slate-100 shadow-[0_28px_90px_rgba(0,0,0,0.58),0_0_0_1px_rgba(255,255,255,0.03)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex flex-col gap-4 border-b border-cyan-200/12 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
              <span>{attempt.displayDate}</span>
              <span>Test {attempt.testNo}</span>
              <span>{attempt.subject || "Unknown subject"}</span>
            </div>
            <h2 className="mt-1 truncate text-xl font-black text-white">
              {attempt.topic || "Question review"}
            </h2>
          </div>

          <button
            className="h-9 rounded-full border border-cyan-300/30 bg-cyan-300/8 px-4 text-sm font-bold text-cyan-100 transition-colors hover:border-cyan-200/60 hover:bg-cyan-300/14"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </header>

        <div className="border-b border-cyan-200/12 bg-white/[0.025] px-6 py-3">
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-semibold">
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Questions</span>
              <span className="font-bold text-white">{attempt.total}</span>
            </div>

            <span className="text-slate-600">│</span>

            <div className="flex items-center gap-1">
              <span className="font-bold text-emerald-400">✓</span>
              <span className="font-bold text-emerald-400">
                {attempt.correct}
              </span>
            </div>

            <span className="text-slate-600">│</span>

            <div className="flex items-center gap-1">
              <span className="font-bold text-rose-400">✕</span>
              <span className="font-bold text-rose-400">
                {attempt.incorrect}
              </span>
            </div>

            <span className="text-slate-600">│</span>

            <div className="flex items-center gap-1">
              <span className="font-bold text-amber-400">⏭</span>
              <span className="font-bold text-amber-400">
                {attempt.skipped}
              </span>
            </div>

            <span className="text-slate-600">│</span>

            <div className="flex items-center gap-1">
              <span className="font-bold text-cyan-300">★</span>
              <span className="font-bold text-cyan-300">
                {formatMarks(attempt.marks)}
              </span>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {attempt.questions.length === 0 ? (
            <div className="rounded-[16px] border border-white/10 bg-white/[0.035] px-4 py-8 text-center text-sm font-semibold text-slate-400">
              Question-level details are not available for this saved test.
            </div>
          ) : (
            <div className="space-y-3">
              {attempt.questions.map((question) => (
                <article
                  className="rounded-[16px] border border-white/10 bg-white/[0.03] p-4"
                  key={`${question.questionId || question.question}-${question.displayIndex}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-black text-slate-200">
                      Q{question.displayIndex}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-black uppercase ${outcomeStyles(question.outcome)}`}
                    >
                      {question.outcome}
                    </span>
                    <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs font-bold text-slate-300">
                      {normalizeDifficulty(question.difficulty)}
                    </span>
                    <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs font-bold text-slate-300">
                      {formatSeconds(question.timeSpentSeconds || 0)}
                    </span>
                  </div>

                  <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-6 text-slate-100">
                    {question.question}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(question.options || []).map((option, index) => {
                      const isCorrect =
                        String(option).trim() ===
                        String(question.correctAnswer).trim();

                      const isSelected =
                        String(option).trim() ===
                        String(question.selectedAnswer).trim();

                      console.log({
                        option,
                        correctAnswer: question.correctAnswer,
                        selectedAnswer: question.selectedAnswer,
                        isCorrect,
                        isSelected,
                        outcome: question.outcome,
                      });
                      const letter = String.fromCharCode(65 + index);

                      const borderColor =
                        question.outcome === "correct" && isSelected
                          ? "#22c55e"
                          : question.outcome === "incorrect" && isCorrect
                            ? "#22c55e"
                            : question.outcome === "incorrect" && isSelected
                              ? "#ef4444"
                              : "rgba(255,255,255,0.10)";

                      return (
                        <div
                          key={`${question.displayIndex}-${letter}-${index}`}
                          className="
    w-full
    md:w-[calc(50%-4px)]
    rounded-[12px]
    px-3
    py-2.5
    text-sm
    font-semibold
    bg-white/[0.035]
    text-slate-300
    transition-all
    duration-200
  "
                          style={{
                            border: `2px solid ${borderColor}`,
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <span className="shrink-0 font-black">
                              {letter}.
                            </span>
                            <span className="min-w-0 flex-1">{option}</span>
                          </div>
                          {/* No badges needed. Border color already explains the result. */}
                        </div>
                      );
                    })}
                  </div>

                  {question.options.length === 0 && (
                    <div className="mt-4 grid gap-2 text-sm font-semibold sm:grid-cols-2">
                      <div className="rounded-[12px] border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-rose-100">
                        Selected: {question.selectedAnswer || "Skipped"}
                      </div>
                      <div className="rounded-[12px] border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-emerald-100">
                        Correct: {question.correctAnswer || "N/A"}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function TableClient() {
  const [selectedAttempt, setSelectedAttempt] = useState<AttemptRow | null>(
    null,
  );
  const [deletingAttemptId, setDeletingAttemptId] = useState<string | null>(
    null,
  );
  const queryClient = useQueryClient();

  const attemptsQuery = useQuery({
    queryFn: fetchAttempts,
    queryKey: ["attempts"],
    staleTime: 15000,
  });
  const deleteAttemptMutation = useMutation({ mutationFn: deleteAttempt });

  const rows = useMemo(
    () => buildRows(attemptsQuery.data ?? []),
    [attemptsQuery.data],
  );

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => {
          acc.tests += 1;
          acc.questions += row.total;
          acc.correct += row.correct;
          return acc;
        },
        { tests: 0, questions: 0, correct: 0 },
      ),
    [rows],
  );

  const overallAccuracy =
    totals.questions > 0
      ? Math.round((totals.correct / totals.questions) * 100)
      : 0;
  const summaryItems = [
    ["Tests", totals.tests],
    ["Questions", totals.questions],
    ["Accuracy", `${overallAccuracy}%`],
  ];

  const handleDeleteAttempt = async (attempt: AttemptRow) => {
    if (deletingAttemptId) return;

    const shouldDelete = window.confirm(
      `Delete Test ${attempt.testNo}? It will be moved to the recycle bin.`,
    );
    if (!shouldDelete) return;

    setDeletingAttemptId(attempt._id);

    try {
      await deleteAttemptMutation.mutateAsync(attempt._id);
      if (selectedAttempt?._id === attempt._id) setSelectedAttempt(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["attempts"] }),
        queryClient.invalidateQueries({
          queryKey: ["attempts", "recycle-bin"],
        }),
        queryClient.invalidateQueries({ queryKey: ["revision-dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["consistency-dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["syllabus-dashboard"] }),
      ]);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Unable to delete test.",
      );
    } finally {
      setDeletingAttemptId(null);
    }
  };

  return (
    <main className="table-page text-slate-100">
      <section className="glass-panel mx-auto flex w-full flex-col gap-5 px-4 py-5 sm:px-5 lg:px-6">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.34em] text-cyan-200/75">
              Test Ledger
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Completed Tests
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-full border border-cyan-300/18 bg-black/20 px-2 py-2">
            {summaryItems.map(([label, value]) => (
              <div
                className="flex items-center gap-2 rounded-full bg-white/[0.045] px-3 py-1.5"
                key={label}
              >
                <span className="text-[9px] font-black uppercase tracking-wide text-slate-400">
                  {label}
                </span>
                <span className="text-sm font-black text-white">{value}</span>
              </div>
            ))}
          </div>
        </header>

        <div className="hidden overflow-hidden rounded-[14px] border border-cyan-200/14 bg-[#071124]/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] lg:block">
          <div className="table-page-scroll overflow-x-auto">
            <table className="w-full min-w-[1200px] border-collapse">
              <thead>
                <tr className="bg-white/[0.035] text-left">
                  {tableHeadings.map((heading) => (
                    <th
                      className="px-3 py-3 text-[9px] font-black uppercase tracking-wide text-slate-400"
                      key={heading.key}
                    >
                      {(heading as any).icon === "check" ? (
                        <span className="flex justify-center text-emerald-300">
                          <CheckIcon className="h-3.5 w-3.5" />
                        </span>
                      ) : (heading as any).icon === "cross" ? (
                        <span className="flex justify-center text-rose-300">
                          <CrossIcon className="h-3.5 w-3.5" />
                        </span>
                      ) : (heading as any).icon === "skip" ? (
                        <span className="text-amber-300 text-sm">⏭</span>
                      ) : (heading as any).icon === "target" ? (
                        <span className="text-cyan-300 text-sm">🎯</span>
                      ) : (heading as any).icon === "difficulty" ? (
                        <span className="text-violet-300 text-sm">⚖️</span>
                      ) : (heading as any).icon === "star" ? (
                        <span className="text-cyan-300 text-sm">★</span>
                      ) : (heading as any).icon === "clock" ? (
                        <span className="text-slate-300 text-sm">🕒</span>
                      ) : (
                        heading.label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {attemptsQuery.isLoading && (
                  <tr>
                    <td
                      className="px-4 py-12 text-center text-sm font-bold text-slate-400"
                      colSpan={tableHeadings.length}
                    >
                      Loading completed tests...
                    </td>
                  </tr>
                )}

                {attemptsQuery.isError && (
                  <tr>
                    <td
                      className="px-4 py-12 text-center text-sm font-bold text-rose-300"
                      colSpan={tableHeadings.length}
                    >
                      Unable to load saved tests.
                    </td>
                  </tr>
                )}

                {!attemptsQuery.isLoading &&
                  !attemptsQuery.isError &&
                  rows.length === 0 && (
                    <tr>
                      <td
                        className="px-4 py-12 text-center text-sm font-bold text-slate-400"
                        colSpan={tableHeadings.length}
                      >
                        No completed tests have been saved yet.
                      </td>
                    </tr>
                  )}

                {!attemptsQuery.isLoading &&
                  !attemptsQuery.isError &&
                  rows.map((attempt) => (
                    <tr
                      className="border-b border-white/[0.06] transition-colors last:border-0 hover:bg-cyan-300/[0.045]"
                      key={attempt._id}
                    >
                      <td className="whitespace-nowrap px-3 py-4 text-xs font-black text-slate-300">
                        {attempt.displayDate}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-xs font-black text-white">
                        Test {attempt.testNo}
                      </td>
                      <td className="max-w-[180px] truncate px-3 py-4 text-xs font-black text-slate-100">
                        {attempt.subject || "Unknown"}
                      </td>
                      <td className="px-3 py-4 text-xs font-black text-white">
                        {attempt.total}
                      </td>
                      <td className="px-3 py-4 text-xs font-black text-emerald-300">
                        {attempt.correct}
                      </td>
                      <td className="px-3 py-4 text-xs font-black text-rose-300">
                        {attempt.incorrect}
                      </td>
                      <td className="px-3 py-4 text-xs font-black text-amber-300">
                        {attempt.skipped}
                      </td>
                      <td className="px-3 py-4 text-xs font-black text-cyan-200">
                        {accuracyLabel(attempt)}
                      </td>
                      <td className="max-w-[230px] truncate px-3 py-4 text-[11px] font-bold text-slate-300">
                        {attempt.difficultySummary}
                      </td>
                      <td className="px-3 py-4 text-xs font-black text-white">
                        {formatMarks(attempt.marks)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-xs font-black text-slate-300">
                        {formatSeconds(attempt.timeSeconds)}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            className="h-8 rounded-full border border-cyan-300/35 bg-cyan-300/12 px-4 text-[10px] font-black uppercase tracking-wide text-cyan-100 transition-colors hover:bg-cyan-300/20"
                            onClick={() => setSelectedAttempt(attempt)}
                            type="button"
                          >
                            View
                          </button>
                          <button
                            className="h-8 rounded-full border border-rose-300/30 bg-rose-400/10 px-4 text-[10px] font-black uppercase tracking-wide text-rose-100 transition-colors hover:bg-rose-400/18 disabled:cursor-wait disabled:opacity-60"
                            disabled={deletingAttemptId === attempt._id}
                            onClick={() => handleDeleteAttempt(attempt)}
                            type="button"
                          >
                            {deletingAttemptId === attempt._id
                              ? "Deleting"
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-3 lg:hidden">
          {attemptsQuery.isLoading && (
            <div className="rounded-[14px] border border-white/10 bg-white/[0.045] px-4 py-10 text-center text-sm font-bold text-slate-400">
              Loading completed tests...
            </div>
          )}

          {attemptsQuery.isError && (
            <div className="rounded-[14px] border border-rose-400/25 bg-rose-400/10 px-4 py-10 text-center text-sm font-bold text-rose-200">
              Unable to load saved tests.
            </div>
          )}

          {!attemptsQuery.isLoading &&
            !attemptsQuery.isError &&
            rows.length === 0 && (
              <div className="rounded-[14px] border border-white/10 bg-white/[0.045] px-4 py-10 text-center text-sm font-bold text-slate-400">
                No completed tests have been saved yet.
              </div>
            )}

          {!attemptsQuery.isLoading &&
            !attemptsQuery.isError &&
            rows.map((attempt) => (
              <article
                className="rounded-[14px] border border-cyan-200/14 bg-[#071124]/82 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                key={attempt._id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                      {attempt.displayDate}
                    </p>
                    <h2 className="mt-1 truncate text-base font-black text-white">
                      Test {attempt.testNo} - {attempt.subject || "Unknown"}
                    </h2>
                  </div>
                  <div className="rounded-full border border-cyan-300/25 bg-cyan-300/12 px-2.5 py-1 text-xs font-black text-cyan-100">
                    {accuracyLabel(attempt)}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-2">
                  {compactStats.map((stat) => {
                    const tone =
                      stat.key === "correct"
                        ? "text-emerald-300"
                        : stat.key === "incorrect"
                          ? "text-rose-300"
                          : stat.key === "skipped"
                            ? "text-amber-300"
                            : "text-white";

                    return (
                      <div
                        className="rounded-[10px] border border-white/10 bg-white/[0.045] px-2 py-2"
                        key={stat.key}
                      >
                        <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
                          {stat.label}
                        </p>
                        <p className={`mt-1 text-sm font-black ${tone}`}>
                          {attempt[stat.key]}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 grid gap-2 text-xs font-bold text-slate-300 sm:grid-cols-3">
                  <div className="rounded-[10px] border border-white/10 bg-white/[0.045] px-3 py-2">
                    <span className="block text-[9px] font-black uppercase tracking-wide text-slate-400">
                      Difficulty
                    </span>
                    <span className="mt-1 block truncate">
                      {attempt.difficultySummary}
                    </span>
                  </div>
                  <div className="rounded-[10px] border border-white/10 bg-white/[0.045] px-3 py-2">
                    <span className="block text-[9px] font-black uppercase tracking-wide text-slate-400">
                      Marks
                    </span>
                    <span className="mt-1 block text-white">
                      {formatMarks(attempt.marks)}
                    </span>
                  </div>
                  <div className="rounded-[10px] border border-white/10 bg-white/[0.045] px-3 py-2">
                    <span className="block text-[9px] font-black uppercase tracking-wide text-slate-400">
                      Time
                    </span>
                    <span className="mt-1 block text-white">
                      {formatSeconds(attempt.timeSeconds)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    className="h-10 rounded-full border border-cyan-300/35 bg-cyan-300/12 text-xs font-black uppercase tracking-wide text-cyan-100 transition-colors hover:bg-cyan-300/20"
                    onClick={() => setSelectedAttempt(attempt)}
                    type="button"
                  >
                    View
                  </button>
                  <button
                    className="h-10 rounded-full border border-rose-300/30 bg-rose-400/10 text-xs font-black uppercase tracking-wide text-rose-100 transition-colors hover:bg-rose-400/18 disabled:cursor-wait disabled:opacity-60"
                    disabled={deletingAttemptId === attempt._id}
                    onClick={() => handleDeleteAttempt(attempt)}
                    type="button"
                  >
                    {deletingAttemptId === attempt._id ? "Deleting" : "Delete"}
                  </button>
                </div>
              </article>
            ))}
        </div>
      </section>

      {selectedAttempt && (
        <ReviewModal
          attempt={selectedAttempt}
          onClose={() => setSelectedAttempt(null)}
        />
      )}
    </main>
  );
}
