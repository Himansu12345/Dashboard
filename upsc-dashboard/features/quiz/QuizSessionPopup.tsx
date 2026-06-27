"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
  useCallback,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  fetchAttempts,
  type CreateAttemptPayload,
  type CreateAttemptQuestionDetailPayload,
} from "@/lib/api/attempts";
import { saveAttemptWithLocalRetry } from "@/lib/quiz/attemptQueue";
import { trackQuestionAttempt } from "@/trackingService";
import {
  decrementTime,
  nextQuestion,
  resetQuiz,
  submitAnswer,
  setQuestionIndex,
  setSessionPhase,
  toggleMarkForReview,
  toggleElimination,
  type QuizMode,
  type QuizOptionId,
} from "@/store/slices/quizSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const optionIds: QuizOptionId[] = ["A", "B", "C", "D"];
const UPSC_CORRECT_MARKS = 2;
const UPSC_NEGATIVE_MARKS = 0.66;
const PRACTICE_QUERY_KEYS = [
  ["attempts"],
  ["attempts", "recycle-bin"],
  ["revision-dashboard"],
  ["consistency-dashboard"],
  ["syllabus-dashboard"],
] as const;

// --- UTILS & TYPES ---
type ResultMetrics = {
  attempts: number;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  skipped: number;
  scoreLabel: string;
  rawScore: number;
  negativeMarks: number;
  finalScore: number;
  accuracy: number;
  percentage: number;
};

type SessionResultsSnapshot = {
  subject: string;
  topic: string;
  session: ResultMetrics;
  topicOverall: ResultMetrics;
  subjectOverall: ResultMetrics;
};

type ConfidenceLevel = "100%" | "50/50" | "Gut";

type QuestionSelectionHistory = {
  initialSelectedOptionId: QuizOptionId | null;
  finalSelectedOptionId: QuizOptionId | null;
  answerChangeCount: number;
};

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function formatTime(seconds: number) {
  const s = Math.max(0, seconds);
  return `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

function formatScore(value: number) {
  return value.toFixed(value % 1 === 0 ? 0 : 2);
}

function buildMetrics(
  records: Array<{
    total: number;
    correct: number;
    incorrect: number;
    skipped: number;
  }>,
): ResultMetrics {
  const totals = records.reduce(
    (res, rec) => {
      res.totalQuestions += Number(rec.total) || 0;
      res.correct += Number(rec.correct) || 0;
      res.incorrect += Number(rec.incorrect) || 0;
      res.skipped += Number(rec.skipped) || 0;
      return res;
    },
    { totalQuestions: 0, correct: 0, incorrect: 0, skipped: 0 },
  );

  const attempted = totals.correct + totals.incorrect;
  const accuracy = attempted > 0 ? (totals.correct / attempted) * 100 : 0;
  const rawScore = totals.correct * UPSC_CORRECT_MARKS;
  const negativeMarks = totals.incorrect * UPSC_NEGATIVE_MARKS;

  return {
    attempts: records.length,
    totalQuestions: totals.totalQuestions,
    correct: totals.correct,
    incorrect: totals.incorrect,
    skipped: totals.skipped,
    scoreLabel: `${totals.correct}/${totals.totalQuestions}`,
    rawScore,
    negativeMarks,
    finalScore: rawScore - negativeMarks,
    accuracy,
    percentage:
      totals.totalQuestions > 0
        ? (totals.correct / totals.totalQuestions) * 100
        : 0,
  };
}

function toLocalIsoDateValue(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDashboardDifficulty(questionTypes: string[]): string {
  const normalizedTypes = new Set(
    questionTypes.map((type) =>
      String(type || "")
        .trim()
        .toLowerCase(),
    ),
  );

  if (normalizedTypes.size === 1) {
    const [type] = Array.from(normalizedTypes);
    if (type === "easy") return "Easy";
    if (type === "medium") return "Medium";
    if (type === "hard") return "Hard";
  }

  return "Unknown";
}

function buildQuestionDetail(
  question: {
    id: string;
    stem: string;
    statements: string[];
    instruction?: string;
    options: Record<QuizOptionId, string>;
    correctOptionId: string;
  },
  selectedOptionId: QuizOptionId | null,
): CreateAttemptQuestionDetailPayload {
  const questionParts = [
    question.stem,
    ...question.statements.map(
      (statement, index) => `${index + 1}. ${statement}`,
    ),
    question.instruction || "",
  ]
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    questionId: question.id,
    question: questionParts.join("\n"),
    options: optionIds
      .map((optionId) => question.options[optionId])
      .map((option) => option.trim())
      .filter(Boolean),
    correctAnswer:
      question.options[question.correctOptionId as QuizOptionId] || "",
    selectedAnswer: selectedOptionId
      ? question.options[selectedOptionId] || ""
      : "",
  };
}

// --- COMPONENTS ---
function ActiveTimer() {
  const dispatch = useAppDispatch();
  const timeLeft = useAppSelector((state) => state.quiz.timeLeft);
  const isMounted = useIsMounted();

  useEffect(() => {
    if (!isMounted || timeLeft <= 0) return;
    const id = window.setInterval(() => dispatch(decrementTime()), 1000);
    return () => window.clearInterval(id);
  }, [dispatch, isMounted, timeLeft]);

  const isLow = timeLeft <= 60;

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-[13px] font-bold shadow-inner transition-colors ${
        isLow
          ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
          : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
      }`}
    >
      <svg
        className="h-4 w-4 opacity-70"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {isMounted ? formatTime(timeLeft) : "--:--"}
    </div>
  );
}

function ScorePill() {
  const score = useAppSelector((state) => state.quiz.score);

  return (
    <div className="flex items-center gap-2 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 font-mono text-[13px] font-bold text-indigo-300 shadow-inner">
      <span>Score</span>
      <span className="text-white">{formatScore(score)}</span>
    </div>
  );
}

function ProgressStrip() {
  const currentIndex = useAppSelector((state) => state.quiz.currentIndex);
  const questions = useAppSelector((state) => state.quiz.questions);
  const answersByIndex = useAppSelector((state) => state.quiz.answersByIndex);
  const sessionPhase = useAppSelector((state) => state.quiz.sessionPhase);
  const markedForReview = useAppSelector((state) => state.quiz.markedForReview);
  const dispatch = useAppDispatch();

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1">
      {questions.map((q, index) => {
        const isAnswered = !!answersByIndex[index];
        const isReview = markedForReview.includes(q.id);
        const isActive = index === currentIndex;

        let bgColor = "bg-white/10 hover:bg-white/30";
        if (isActive) {
          bgColor = "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]";
        } else if (isReview) {
          bgColor = "bg-amber-400 hover:bg-amber-300";
        } else if (isAnswered) {
          bgColor =
            sessionPhase === "pass2"
              ? "bg-emerald-900/60"
              : "bg-emerald-400 hover:bg-emerald-300";
        } else if (index < currentIndex && !isAnswered) {
          bgColor = "bg-rose-900/50 hover:bg-rose-800/50";
        }

        return (
          <button
            key={q.id}
            onClick={() => dispatch(setQuestionIndex(index))}
            className={`h-1.5 min-w-[4px] flex-1 rounded-full transition-all duration-300 sm:min-w-[8px] cursor-pointer ${bgColor} ${
              isActive ? "scale-y-150" : ""
            }`}
            aria-label={`Question ${index + 1}`}
          />
        );
      })}
    </div>
  );
}

function ResultMetricCard({
  title,
  subtitle,
  metrics,
  accentClassName,
}: {
  title: string;
  subtitle: string;
  metrics: ResultMetrics;
  accentClassName: string;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_45px_rgba(0,0,0,0.24)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="m-0 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">
            {title}
          </p>
          <h3 className="m-0 mt-1 text-lg font-extrabold leading-tight text-zinc-50 sm:text-[1.6rem]">
            {subtitle}
          </h3>
        </div>
        <div
          className={`w-fit rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${accentClassName}`}
        >
          {metrics.attempts} {metrics.attempts === 1 ? "attempt" : "attempts"}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[22px] border border-white/8 bg-[#0d1015] p-4">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Raw Score
          </p>
          <p className="m-0 mt-2 text-2xl font-black text-zinc-50">
            {formatScore(metrics.rawScore)}
          </p>
        </div>

        <div className="rounded-[22px] border border-white/8 bg-[#0d1015] p-4">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Negative Marks
          </p>
          <p className="m-0 mt-2 text-2xl font-black text-rose-200">
            -{formatScore(metrics.negativeMarks)}
          </p>
        </div>

        <div className="rounded-[22px] border border-white/8 bg-[#0d1015] p-4">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Final Score
          </p>
          <p className="m-0 mt-2 text-2xl font-black text-emerald-200">
            {formatScore(metrics.finalScore)}
          </p>
        </div>
      </div>
    </section>
  );
}

function ResultsSummaryModal({
  snapshot,
  onClose,
}: {
  snapshot: SessionResultsSnapshot;
  onClose: () => void;
}) {
  const sections = [
    {
      key: "session",
      label: "This Test",
      title: "This Test",
      subtitle: "Latest attempt",
      metrics: snapshot.session,
      accentClassName:
        "border-emerald-300/20 bg-emerald-500/14 text-emerald-100",
    },
    {
      key: "topic",
      label: "Topic Overall",
      title: "Topic Overall",
      subtitle: snapshot.topic,
      metrics: snapshot.topicOverall,
      accentClassName: "border-sky-300/20 bg-sky-500/14 text-sky-100",
    },
    {
      key: "subject",
      label: "Subject Overall",
      title: "Subject Overall",
      subtitle: snapshot.subject,
      metrics: snapshot.subjectOverall,
      accentClassName: "border-violet-300/20 bg-violet-500/14 text-violet-100",
    },
  ] as const;

  const [activeSection] = useState<(typeof sections)[number]["key"]>("session");
  const currentSection =
    sections.find((section) => section.key === activeSection) || sections[0];

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#05070b]/72 px-4 py-6 backdrop-blur-md sm:px-6">
      <div className="max-h-full w-full max-w-4xl overflow-y-auto rounded-[32px] border border-white/12 bg-[linear-gradient(180deg,rgba(18,21,29,0.985),rgba(8,10,15,0.985))] p-4 shadow-[0_32px_100px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-7">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="m-0 text-[11px] font-black uppercase tracking-[0.22em] text-[#9ec2ff]">
                Test Completed
              </p>
              <h2 className="m-0 mt-2 text-xl font-black tracking-[-0.03em] text-zinc-50 sm:text-2xl lg:text-3xl">
                {snapshot.topic}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-11 w-full rounded-full bg-[#a9c7ff] px-6 text-xs font-black uppercase tracking-[0.12em] text-[#111217] transition-colors hover:bg-[#bdd4ff] sm:w-auto"
            >
              Back to quiz hub
            </button>
          </div>

          <ResultMetricCard
            title={currentSection.title}
            subtitle={currentSection.subtitle}
            metrics={currentSection.metrics}
            accentClassName={currentSection.accentClassName}
          />
        </div>
      </div>
    </div>
  );
}

// --- MAIN QUESTION COMPONENT ---
function QuestionContent() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const [isSavingAttempt, setIsSavingAttempt] = useState(false);
  const [resultsSnapshot, setResultsSnapshot] =
    useState<SessionResultsSnapshot | null>(null);

  // time spent per question
  const [timeSpentMap, setTimeSpentMap] = useState<Record<number, number>>({});

  // confidence per question
  const [confidenceTags, setConfidenceTags] = useState<
    Record<string, ConfidenceLevel>
  >({});

  // reporting-only answer history
  const [selectionHistoryMap, setSelectionHistoryMap] = useState<
    Record<string, QuestionSelectionHistory>
  >({});

  const sessionMeta = useAppSelector((state) => state.quiz.sessionMeta);
  const questions = useAppSelector((state) => state.quiz.questions);
  const answersByIndex = useAppSelector((state) => state.quiz.answersByIndex);
  const currentQuestion = useAppSelector(
    (state) => state.quiz.questions[state.quiz.currentIndex],
  );
  const currentIndex = useAppSelector((state) => state.quiz.currentIndex);
  const totalQuestions = useAppSelector((state) => state.quiz.questions.length);
  const isLocked = useAppSelector((state) => state.quiz.isLocked);
  const selectedOptionId = useAppSelector(
    (state) => state.quiz.selectedOptionId,
  );
  const sessionPhase = useAppSelector((state) => state.quiz.sessionPhase);
  const markedForReview = useAppSelector((state) => state.quiz.markedForReview);
  const eliminatedOptions = useAppSelector(
    (state) => state.quiz.eliminatedOptions,
  );
  const timeLeftState = useAppSelector((state) => state.quiz.timeLeft);

  const isPracticeMode = sessionMeta?.mode !== "exam";
  const quizMode: QuizMode = sessionMeta?.mode === "exam" ? "exam" : "practice";

  // elapsed time for active question
  const questionTimeElapsed = timeSpentMap[currentIndex] || 0;

  // dedupe tracker so the same finalized answer is not written repeatedly
  const trackedAttemptSignatureRef = useRef<Record<number, string>>({});

  // track exam-mode answered questions once on finish
  const trackedExamQuestionIdsRef = useRef<Set<string>>(new Set());

  /**
   * Keep reporting-only answer history up to date.
   * This does not affect quiz behavior; it's only for report export.
   */
  useEffect(() => {
    if (!currentQuestion) return;
    if (!selectedOptionId) return;

    setSelectionHistoryMap((prev) => {
      const existing = prev[currentQuestion.id];

      if (!existing) {
        return {
          ...prev,
          [currentQuestion.id]: {
            initialSelectedOptionId: selectedOptionId,
            finalSelectedOptionId: selectedOptionId,
            answerChangeCount: 0,
          },
        };
      }

      if (existing.finalSelectedOptionId === selectedOptionId) {
        return prev;
      }

      return {
        ...prev,
        [currentQuestion.id]: {
          ...existing,
          finalSelectedOptionId: selectedOptionId,
          answerChangeCount: existing.answerChangeCount + 1,
        },
      };
    });
  }, [currentQuestion, selectedOptionId]);

  /**
   * PRACTICE MODE QUESTION TRACKING
   * Track when a question is locked with its final answer.
   */
  useEffect(() => {
    if (!isPracticeMode) return;
    if (!isLocked) return;

    const answer = answersByIndex[currentIndex];
    const question = questions[currentIndex];

    if (!answer || !question || !sessionMeta) return;

    const signature = `${question.id}::${answer}`;
    if (trackedAttemptSignatureRef.current[currentIndex] === signature) {
      return;
    }

    const isCorrect = answer === question.correctOptionId;
    const selectionHistory = selectionHistoryMap[question.id];

    const attemptData = {
      questionId: question.id,
      questionType: question.questionType,
      question: {
        stem: question.stem,
        statements: question.statements,
        instruction: question.instruction,
        options: question.options,
        correctOptionId: question.correctOptionId,
        correctOption: question.options[question.correctOptionId],
      },
      explanation: question.explanation,

      selectedOptionId: answer,
      selectedOption: question.options[answer] || "",
      correctOptionId: question.correctOptionId,
      correctOption: question.options[question.correctOptionId] || "",

      initialSelectedOptionId:
        selectionHistory?.initialSelectedOptionId ?? answer,
      initialSelectedOption: selectionHistory?.initialSelectedOptionId
        ? question.options[selectionHistory.initialSelectedOptionId] || ""
        : question.options[answer] || "",

      finalSelectedOptionId: selectionHistory?.finalSelectedOptionId ?? answer,
      finalSelectedOption: selectionHistory?.finalSelectedOptionId
        ? question.options[selectionHistory.finalSelectedOptionId] || ""
        : question.options[answer] || "",

      answerChangeCount: selectionHistory?.answerChangeCount ?? 0,

      isCorrect,
      result: (isCorrect ? "Correct" : "Incorrect") as "Correct" | "Incorrect",
      subject: sessionMeta.subject,
      chapter: sessionMeta.topic,
      topic: sessionMeta.topic,
      subtopic: sessionMeta.noteChapter,
      subtopicId: sessionMeta.noteChapterId,
      difficulty: question.questionType,
      timeLimit: sessionMeta.timeLimitPerMcqSeconds,
      timeTaken: questionTimeElapsed,
      timestamp: Date.now(),
      confidence: confidenceTags[question.id] || null,
      sourceModule: "quiz-session-popup",
      mode: quizMode,
      attemptNumber: 1,
    };

    void trackQuestionAttempt(attemptData);
    trackedAttemptSignatureRef.current[currentIndex] = signature;
  }, [
    isPracticeMode,
    isLocked,
    currentIndex,
    answersByIndex,
    questions,
    sessionMeta,
    questionTimeElapsed,
    confidenceTags,
    selectionHistoryMap,
    quizMode,
  ]);

  /**
   * QUESTION TIMER
   */
  useEffect(() => {
    if (isSavingAttempt || isLocked) return;

    const id = window.setInterval(() => {
      setTimeSpentMap((prev) => ({
        ...prev,
        [currentIndex]: (prev[currentIndex] || 0) + 1,
      }));
    }, 1000);

    return () => window.clearInterval(id);
  }, [isSavingAttempt, isLocked, currentIndex]);

  const handleToggleElimination = useCallback(
    (optionId: QuizOptionId, e?: React.MouseEvent | KeyboardEvent) => {
      if (e) e.preventDefault();
      if (!currentQuestion || isSavingAttempt || (isPracticeMode && isLocked)) {
        return;
      }

      dispatch(toggleElimination({ questionId: currentQuestion.id, optionId }));
    },
    [currentQuestion, isSavingAttempt, isPracticeMode, isLocked, dispatch],
  );

  const handleToggleReview = useCallback(() => {
    if (!currentQuestion) return;
    dispatch(toggleMarkForReview(currentQuestion.id));
  }, [currentQuestion, dispatch]);

  /**
   * EXAM MODE QUESTION TRACKING
   * When finishing the session, write per-question records for every answered question.
   * This is the missing piece from the old version.
   */
  const trackExamQuestionAttempts = useCallback(async () => {
    if (!sessionMeta || questions.length === 0) return;

    const promises = questions.map(async (question, index) => {
      const answer = answersByIndex[index] || null;
      if (!answer) return;

      if (trackedExamQuestionIdsRef.current.has(question.id)) return;

      const isCorrect = answer === question.correctOptionId;
      const selectionHistory = selectionHistoryMap[question.id];

      const attemptData = {
        questionId: question.id,
        questionType: question.questionType,
        question: {
          stem: question.stem,
          statements: question.statements,
          instruction: question.instruction,
          options: question.options,
          correctOptionId: question.correctOptionId,
          correctOption: question.options[question.correctOptionId],
        },
        explanation: question.explanation,

        selectedOptionId: answer,
        selectedOption: question.options[answer] || "",
        correctOptionId: question.correctOptionId,
        correctOption: question.options[question.correctOptionId] || "",

        initialSelectedOptionId:
          selectionHistory?.initialSelectedOptionId ?? answer,
        initialSelectedOption: selectionHistory?.initialSelectedOptionId
          ? question.options[selectionHistory.initialSelectedOptionId] || ""
          : question.options[answer] || "",

        finalSelectedOptionId:
          selectionHistory?.finalSelectedOptionId ?? answer,
        finalSelectedOption: selectionHistory?.finalSelectedOptionId
          ? question.options[selectionHistory.finalSelectedOptionId] || ""
          : question.options[answer] || "",

        answerChangeCount: selectionHistory?.answerChangeCount ?? 0,

        isCorrect,
        result: (isCorrect ? "Correct" : "Incorrect") as
          | "Correct"
          | "Incorrect",
        subject: sessionMeta.subject,
        chapter: sessionMeta.topic,
        topic: sessionMeta.topic,
        subtopic: sessionMeta.noteChapter,
        subtopicId: sessionMeta.noteChapterId,
        difficulty: question.questionType,
        timeLimit: sessionMeta.timeLimitPerMcqSeconds,
        timeTaken: timeSpentMap[index] || 0,
        timestamp: Date.now(),
        confidence: confidenceTags[question.id] || null,
        sourceModule: "quiz-session-popup",
        mode: quizMode,
        attemptNumber: 1,
      };

      await trackQuestionAttempt(attemptData);
      trackedExamQuestionIdsRef.current.add(question.id);
    });

    await Promise.all(promises);
  }, [
    sessionMeta,
    questions,
    answersByIndex,
    selectionHistoryMap,
    timeSpentMap,
    confidenceTags,
    quizMode,
  ]);

  const handleFinishSession = useCallback(async () => {
    if (!sessionMeta || questions.length === 0 || isSavingAttempt) return;

    // For exam mode, persist per-question attempt records now.
    if (!isPracticeMode) {
      await trackExamQuestionAttempts();
    }

    const incorrectDetails: CreateAttemptQuestionDetailPayload[] = [];
    const skippedDetails: CreateAttemptQuestionDetailPayload[] = [];
    let correct = 0;
    let incorrect = 0;
    let skipped = 0;

    questions.forEach((question, index) => {
      const optionId = answersByIndex[index] || null;

      if (!optionId) {
        skipped += 1;
        skippedDetails.push(buildQuestionDetail(question, null));
        return;
      }

      if (optionId === question.correctOptionId) {
        correct += 1;
        return;
      }

      incorrect += 1;
      incorrectDetails.push(buildQuestionDetail(question, optionId));
    });

    const quizSignature = [
      "dashboard-mcq",
      sessionMeta.subject || "Unknown",
      sessionMeta.topic || "Unknown",
      Date.now().toString(),
      questions.map((q) => q.id).join("|"),
    ].join("::");

    const payload: CreateAttemptPayload = {
      subject: sessionMeta.subject || "Unknown",
      topic: sessionMeta.topic || "Unknown",
      subtopic: sessionMeta.noteChapter || null,
      total: questions.length,
      correct,
      incorrect,
      skipped,
      difficulty: toDashboardDifficulty(questions.map((q) => q.questionType)),
      dateValue: toLocalIsoDateValue(),
      attemptKey: quizSignature,
      quizSignature,
      correctDetails: [],
      incorrectDetails,
      skippedDetails,
    };

    setIsSavingAttempt(true);

    try {
      const saveResult = await saveAttemptWithLocalRetry(payload);
      const attempts = saveResult.synced ? await fetchAttempts() : [];

      const allAttempts = [
        ...attempts,
        {
          subject: payload.subject,
          topic: payload.topic,
          total: payload.total,
          correct: payload.correct,
          incorrect: payload.incorrect,
          skipped: payload.skipped,
          deletedAt: null,
        },
      ];

      const topicAttempts = allAttempts.filter(
        (a) =>
          (a.subject || "Unknown") === payload.subject &&
          (a.topic || "Unknown") === payload.topic &&
          !a.deletedAt,
      );

      const subjectAttempts = allAttempts.filter(
        (a) => (a.subject || "Unknown") === payload.subject && !a.deletedAt,
      );

      setResultsSnapshot({
        subject: payload.subject,
        topic: payload.topic,
        session: buildMetrics([
          {
            total: payload.total,
            correct: payload.correct,
            incorrect: payload.incorrect,
            skipped: payload.skipped,
          },
        ]),
        topicOverall: buildMetrics(topicAttempts),
        subjectOverall: buildMetrics(subjectAttempts),
      });

      await Promise.all(
        PRACTICE_QUERY_KEYS.map((key) =>
          queryClient.invalidateQueries({
            queryKey: [...key],
            refetchType: "all",
          }),
        ),
      );

      if (saveResult.queued) {
        console.warn(
          saveResult.pendingCount === 1
            ? "Saved locally. Will sync automatically."
            : `Saved locally. ${saveResult.pendingCount} attempts waiting to sync.`,
        );
      }
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : "Unable to save quiz attempt.",
      );
    } finally {
      setIsSavingAttempt(false);
    }
  }, [
    answersByIndex,
    isPracticeMode,
    isSavingAttempt,
    queryClient,
    questions,
    sessionMeta,
    trackExamQuestionAttempts,
  ]);

  const finishSessionRef = useRef(handleFinishSession);

  useEffect(() => {
    finishSessionRef.current = handleFinishSession;
  }, [handleFinishSession]);

  useEffect(() => {
    if (
      timeLeftState !== 0 ||
      resultsSnapshot ||
      isSavingAttempt ||
      !sessionMeta
    ) {
      return;
    }

    void finishSessionRef.current();
  }, [timeLeftState, resultsSnapshot, isSavingAttempt, sessionMeta]);

  const findNextPass2Question = useCallback(() => {
    for (let i = currentIndex + 1; i < totalQuestions; i++) {
      if (!answersByIndex[i] || markedForReview.includes(questions[i].id)) {
        return i;
      }
    }

    for (let i = 0; i < currentIndex; i++) {
      if (!answersByIndex[i] || markedForReview.includes(questions[i].id)) {
        return i;
      }
    }

    return -1;
  }, [
    currentIndex,
    totalQuestions,
    answersByIndex,
    markedForReview,
    questions,
  ]);

  const handlePrimaryAction = useCallback(() => {
    if (isSavingAttempt || (isPracticeMode && !isLocked)) return;

    if (sessionPhase === "pass1" && currentIndex >= totalQuestions - 1) {
      const hasPending = questions.some(
        (q, idx) => !answersByIndex[idx] || markedForReview.includes(q.id),
      );

      if (hasPending) {
        dispatch(setSessionPhase("pass2"));
        const nextIdx = findNextPass2Question();
        if (nextIdx !== -1) dispatch(setQuestionIndex(nextIdx));
        return;
      }

      void handleFinishSession();
      return;
    }

    if (sessionPhase === "pass2") {
      const nextIdx = findNextPass2Question();
      if (nextIdx !== -1) {
        dispatch(setQuestionIndex(nextIdx));
        return;
      }

      void handleFinishSession();
      return;
    }

    dispatch(nextQuestion());
  }, [
    isSavingAttempt,
    isPracticeMode,
    isLocked,
    sessionPhase,
    currentIndex,
    totalQuestions,
    questions,
    answersByIndex,
    markedForReview,
    dispatch,
    handleFinishSession,
    findNextPass2Question,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSavingAttempt || timeLeftState === 0 || !currentQuestion) return;
      if (isPracticeMode && isLocked && e.key !== "Enter") return;

      switch (e.key.toLowerCase()) {
        case "a":
        case "1":
          e.shiftKey
            ? handleToggleElimination("A", e)
            : dispatch(submitAnswer("A"));
          break;
        case "b":
        case "2":
          e.shiftKey
            ? handleToggleElimination("B", e)
            : dispatch(submitAnswer("B"));
          break;
        case "c":
        case "3":
          e.shiftKey
            ? handleToggleElimination("C", e)
            : dispatch(submitAnswer("C"));
          break;
        case "d":
        case "4":
          e.shiftKey
            ? handleToggleElimination("D", e)
            : dispatch(submitAnswer("D"));
          break;
        case " ":
          e.preventDefault();
          handleToggleReview();
          break;
        case "enter":
          e.preventDefault();
          handlePrimaryAction();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentQuestion,
    isSavingAttempt,
    timeLeftState,
    isPracticeMode,
    isLocked,
    dispatch,
    handleToggleElimination,
    handlePrimaryAction,
    handleToggleReview,
  ]);

  if (!currentQuestion) return null;

  const stemBlocks = currentQuestion.stem
    .split(/\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  const instructionBlocks = (currentQuestion.instruction || "")
    .split(/\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  const currentEliminated = eliminatedOptions[currentQuestion.id] || [];
  const isReviewMarked = markedForReview.includes(currentQuestion.id);

  const hasStatements =
    currentQuestion.statements && currentQuestion.statements.length > 0;

  const displayStatements = hasStatements
    ? currentQuestion.statements
    : optionIds.map((id) => currentQuestion.options[id]);

  const getDisplayOptionText = (optId: QuizOptionId) => {
    if (hasStatements) return currentQuestion.options[optId];

    const fallbackMap: Record<QuizOptionId, string> = {
      A: "Option 1",
      B: "Option 2",
      C: "Option 3",
      D: "Option 4",
    };

    return fallbackMap[optId];
  };

  const renderMetaHeader = (isUnifiedLayout = false) => (
    <div
      className={`flex items-center justify-between border-b border-white/5 pb-4 ${
        isUnifiedLayout ? "mb-8" : "mb-0"
      }`}
    >
      <button
        onClick={handleToggleReview}
        className={`group flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
          isReviewMarked
            ? "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
            : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
        }`}
      >
        <span
          className={`transition-transform duration-300 ${
            isReviewMarked
              ? "rotate-[144deg] scale-110 text-amber-400"
              : "group-hover:scale-110"
          }`}
        >
          ★
        </span>
        {isReviewMarked ? "Marked for Review" : "Mark (Space)"}
      </button>

      <div className="flex flex-col items-end px-2">
        <span className="mb-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
          Time Spent
        </span>
        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-black/40 shadow-inner">
          <div
            className={`h-full transition-all duration-1000 ${
              questionTimeElapsed > 90
                ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]"
                : questionTimeElapsed > 45
                  ? "bg-amber-400"
                  : "bg-emerald-400"
            }`}
            style={{
              width: `${Math.min(100, (questionTimeElapsed / 120) * 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative mx-auto flex w-full flex-1 flex-col transition-all duration-500">
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-40 sm:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col lg:flex-row gap-8 lg:gap-16">
          {/* LEFT: READING CANVAS */}
          <div className="flex-1 lg:min-w-0">
            <div className="flex gap-4 sm:gap-6">
              <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-[15px] font-black text-indigo-400 ring-1 ring-indigo-500/30">
                Q{currentIndex + 1}
              </div>

              <div className="space-y-8 pb-10">
                <div className="space-y-4">
                  {stemBlocks.map((block, i) => (
                    <p
                      key={i}
                      className="text-xl font-bold leading-[1.65] text-zinc-50 tracking-tight"
                    >
                      {block}
                    </p>
                  ))}
                </div>

                <div className="relative ml-2 space-y-7 border-l-2 border-white/10 pl-6 sm:ml-3 sm:pl-8">
                  {displayStatements.map((statement, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[35px] sm:-left-[43px] top-1 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#0b0d10] font-mono text-[13px] font-bold text-zinc-400 ring-2 ring-white/10">
                        {idx + 1}
                      </div>
                      <p className="text-[17px] leading-[1.7] text-zinc-300">
                        {statement}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: INTERACTION CONSOLE */}
          <div className="w-full lg:w-[440px] xl:w-[480px] shrink-0">
            <div className="flex flex-col gap-6 rounded-[28px] bg-white/[0.015] p-5 ring-1 ring-white/10 backdrop-blur-xl sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.3)] lg:sticky lg:top-4">
              {renderMetaHeader(false)}

              {instructionBlocks.length > 0 && (
                <div className="space-y-2">
                  {instructionBlocks.map((block, i) => (
                    <p
                      key={i}
                      className="text-[15px] font-semibold italic text-zinc-300"
                    >
                      {block}
                    </p>
                  ))}
                </div>
              )}

              <div className="grid gap-3.5">
                {optionIds.map((optionId) => {
                  const isCorrect =
                    optionId === currentQuestion.correctOptionId;
                  const isSelected = selectedOptionId === optionId;
                  const isSelectedWrong = isSelected && !isCorrect;
                  const isEliminated = currentEliminated.includes(optionId);

                  let optionStyle =
                    "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:border-white/20";
                  let circleStyle = "bg-white/10 text-zinc-400 font-bold";

                  if (isPracticeMode && isLocked) {
                    if (isCorrect) {
                      optionStyle =
                        "border-emerald-500/50 bg-emerald-500/10 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.15)]";
                      circleStyle =
                        "bg-emerald-500 text-white shadow-lg font-black";
                    } else if (isSelectedWrong) {
                      optionStyle =
                        "border-rose-500/50 bg-rose-500/10 text-rose-100";
                      circleStyle = "bg-rose-500 text-white font-black";
                    } else {
                      optionStyle =
                        "border-transparent bg-white/[0.02] text-zinc-500 opacity-40";
                    }
                  } else if (isEliminated) {
                    optionStyle =
                      "border-transparent bg-black/20 text-zinc-600 line-through opacity-50 grayscale";
                  } else if (isSelected) {
                    optionStyle =
                      "border-indigo-500/60 bg-indigo-500/15 text-white shadow-[0_0_25px_rgba(99,102,241,0.2)] scale-[1.02] z-10";
                    circleStyle =
                      "bg-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.6)] font-black";
                  }

                  return (
                    <button
                      key={optionId}
                      disabled={
                        (isPracticeMode && isLocked) ||
                        isSavingAttempt ||
                        timeLeftState === 0
                      }
                      onClick={(e) => {
                        if (isEliminated) {
                          handleToggleElimination(optionId, e as any);
                        }
                        dispatch(submitAnswer(optionId));
                      }}
                      onContextMenu={(e) =>
                        handleToggleElimination(optionId, e)
                      }
                      className={`group flex min-h-[3.75rem] w-full items-center gap-4 rounded-[18px] border px-4 py-3 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0d10] ${optionStyle}`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] transition-colors ${circleStyle}`}
                      >
                        {optionId}
                      </span>
                      <span className="flex-1 text-[15px] font-semibold leading-snug">
                        {getDisplayOptionText(optionId)}
                      </span>
                      {!isSelected && !isLocked && !isEliminated && (
                        <span className="hidden sm:block shrink-0 ml-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          Right-Click to cross out
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedOptionId && !(isPracticeMode && isLocked) && (
                <div className="mt-2 flex gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {(["100%", "50/50", "Gut"] as ConfidenceLevel[]).map(
                    (level) => {
                      const isActive =
                        confidenceTags[currentQuestion.id] === level;

                      return (
                        <button
                          key={level}
                          onClick={() =>
                            setConfidenceTags((prev) => ({
                              ...prev,
                              [currentQuestion.id]: level,
                            }))
                          }
                          className={`flex-1 rounded-xl border py-2.5 text-[11px] font-black tracking-[0.15em] uppercase transition-all active:scale-95 ${
                            isActive
                              ? "border-indigo-400 bg-indigo-500/20 text-indigo-200 shadow-[0_0_15px_rgba(129,140,248,0.25)]"
                              : "border-white/10 bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300"
                          }`}
                        >
                          {level}
                        </button>
                      );
                    },
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- STICKY ACTION FOOTER --- */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between border-t border-white/10 bg-[#08090b]/80 px-4 py-4 backdrop-blur-xl sm:px-8">
        <button
          type="button"
          onClick={() => dispatch(resetQuiz())}
          className="rounded-full px-6 py-3 text-sm font-bold text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
        >
          Quit Session
        </button>

        <button
          type="button"
          disabled={(isPracticeMode && !isLocked) || isSavingAttempt}
          onClick={handlePrimaryAction}
          className={`flex h-12 min-w-[140px] items-center justify-center rounded-full px-8 text-[15px] font-black transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 ${
            sessionPhase === "pass1" && currentIndex === totalQuestions - 1
              ? "bg-amber-400 text-amber-950 hover:bg-amber-300 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]"
              : "bg-indigo-500 text-white hover:bg-indigo-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
          }`}
        >
          {isSavingAttempt
            ? "Saving..."
            : sessionPhase === "pass1" && currentIndex === totalQuestions - 1
              ? "Begin Pass 2"
              : sessionPhase === "pass2" && findNextPass2Question() === -1
                ? "Finish Exam"
                : "Next Question →"}
        </button>
      </div>

      {resultsSnapshot && (
        <ResultsSummaryModal
          snapshot={resultsSnapshot}
          onClose={() => {
            setResultsSnapshot(null);
            dispatch(resetQuiz());
          }}
        />
      )}
    </div>
  );
}

// --- PORTAL WRAPPER ---
export default function QuizSessionPopup() {
  const sessionMeta = useAppSelector((state) => state.quiz.sessionMeta);
  const currentIndex = useAppSelector((state) => state.quiz.currentIndex);
  const totalQuestions = useAppSelector((state) => state.quiz.questions.length);
  const isMounted = useIsMounted();
  const quizMode: QuizMode = sessionMeta?.mode === "exam" ? "exam" : "practice";

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!isMounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[2147483647] flex h-dvh w-screen flex-col overflow-hidden bg-[#07080a] text-zinc-100 selection:bg-indigo-500/30 font-sans">
      <style>{`
        .overflow-y-auto::-webkit-scrollbar { display: none; }
        .overflow-y-auto { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,rgba(79,70,229,0.08),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(56,189,248,0.05),transparent_50%)]" />

      <section className="relative z-10 flex min-h-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 bg-[#07080a]/80 px-4 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-6">
            <div className="hidden h-9 w-9 items-center justify-center rounded-[10px] bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20 sm:flex">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                {quizMode === "exam" ? "Exam Protocol" : "Practice Session"}
              </p>
              <h2 className="mt-0.5 truncate text-[15px] font-bold text-zinc-100">
                {sessionMeta?.subject ? `${sessionMeta.subject}: ` : ""}
                {sessionMeta?.topic || "Session Active"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ActiveTimer />
            {quizMode === "practice" && <ScorePill />}
          </div>
        </header>

        {/* Progress Strip */}
        <div className="w-full border-b border-white/5 bg-[#07080a]/90 px-4 py-2.5 shadow-sm sm:px-8">
          <div className="flex items-center gap-5">
            <ProgressStrip />
            <span className="shrink-0 font-mono text-[11px] font-black tracking-widest text-zinc-500">
              {currentIndex + 1} / {totalQuestions}
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex min-h-0 flex-1 justify-center relative">
          <QuestionContent />
        </div>
      </section>
    </div>,
    document.body,
  );
}
