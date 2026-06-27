

type DateRangeInput = {
  startDate: Date;
  endDate: Date;
};

type RawQuestionAttempt = Record<string, any>;
type RawNoteAction = Record<string, any>;
type RawStudySession = Record<string, any>;

type SubjectProgressNoteAction = {
  id?: string;
  timestamp: number;
  sessionId?: string | null;

  subject?: string;
  chapter?: string;
  topic?: string;
  subtopic?: string;

  // subject-progress / derived note-action shape
  action?:
    | "completed"
    | "revised"
    | "starred"
    | "uncompleted"
    | "unrevised"
    | "unstarred";

  note?: string;
  point?: string;
  path?: string[];
  previousStatus?: Record<string, boolean>;
  newStatus?: Record<string, boolean>;

  // IndexedDB trackingService note-action shape
  actionType?: string;
  pointUid?: string;
  pointText?: string;
};

export interface BuildReportDataInput {
  startDate: Date;
  endDate: Date;
  questionAttempts: RawQuestionAttempt[];
  noteActions: SubjectProgressNoteAction[];
  studySessions: RawStudySession[];
}

export interface QuestionAttemptReportRecord {
  id: string;
  eventType: "question_attempt";
  timestamp: number;
  date: string;
  time: string;
  sessionId: string | null;

  questionId: string | null;
  attemptNumber: number | null;

  subject: string;
  chapter: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  questionType: string;
  sourceModule: string;

  questionText: string;
  statements: string[];
  options: Record<string, string>;
  selectedOption: string | null;
  correctOption: string | null;
  initialSelectedOption: string | null;
  finalSelectedOption: string | null;
  answerChangeCount: number;
  result: "Correct" | "Wrong" | "Skipped" | "Unknown";

  timeLimitSeconds: number | null;
  timeTakenSeconds: number | null;

  explanation: unknown;
  confidence: unknown;
  noteChapterId: string | null;
  noteChapter: string | null;
}

export interface NoteActionReportRecord {
  id: string;
  eventType: "note_action";
  timestamp: number;
  date: string;
  time: string;
  sessionId: string | null;

  subject: string;
  chapter: string;
  topic: string;
  subtopic: string;
  point: string;
  uid: string;

  action:
    | "completed"
    | "revised"
    | "starred"
    | "uncompleted"
    | "unrevised"
    | "unstarred";

  previousStatus: Record<string, boolean>;
  newStatus: Record<string, boolean>;
  path: string[];
}

export interface TimelineRecord {
  id: string;
  timestamp: number;
  date: string;
  time: string;
  eventType:
    | "question_attempt"
    | "question_correct"
    | "question_wrong"
    | "question_skipped"
    | "note_completed"
    | "note_revised"
    | "note_starred"
    | "note_uncompleted"
    | "note_unrevised"
    | "note_unstarred";
  sessionId: string | null;
  subject: string;
  chapter?: string;
  topic?: string;
  subtopic?: string;
  point?: string;
  questionId?: string | null;
  result?: string;
  action?: string;
  label: string;
  meta?: Record<string, unknown>;
}

export interface SessionBreakdownRecord {
  sessionId: string;
  sessionStart: number | null;
  sessionEnd: number | null;
  sessionDurationSeconds: number | null;

  questionsAttempted: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  accuracy: number;

  subjectsStudied: string[];
  chaptersStudied: string[];
  topicsStudied: string[];
  actionsPerformed: number;

  questionAttemptIds: string[];
  noteActionIds: string[];
  timelineEventIds: string[];
}

export interface AggregateBucket {
  total: number;
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number;
}

export interface TimeAnalysis {
  byHour: Record<
    string,
    {
      totalQuestions: number;
      correct: number;
      wrong: number;
      skipped: number;
      accuracy: number;
    }
  >;
  averageTimeTakenSeconds: number;
  medianTimeTakenSeconds: number | null;
  slowestQuestions: Array<{
    id: string;
    subject: string;
    chapter: string;
    topic: string;
    subtopic: string;
    questionText: string;
    timeTakenSeconds: number;
    result: string;
  }>;
  fastestQuestions: Array<{
    id: string;
    subject: string;
    chapter: string;
    topic: string;
    subtopic: string;
    questionText: string;
    timeTakenSeconds: number;
    result: string;
  }>;
  averageSessionDurationSeconds: number;
}

export interface AiAnalysisHelpers {
  weakTopics: Array<{
    key: string;
    subject: string;
    chapter: string;
    topic: string;
    subtopic: string;
    total: number;
    wrong: number;
    accuracy: number;
  }>;
  strongTopics: Array<{
    key: string;
    subject: string;
    chapter: string;
    topic: string;
    subtopic: string;
    total: number;
    correct: number;
    accuracy: number;
  }>;
  mostWrongSubjects: Array<{
    subject: string;
    wrong: number;
    total: number;
    accuracy: number;
  }>;
  mostWrongChapters: Array<{
    key: string;
    subject: string;
    chapter: string;
    wrong: number;
    total: number;
    accuracy: number;
  }>;
  repeatedMistakePatterns: Array<{
    questionId: string | null;
    questionText: string;
    subject: string;
    chapter: string;
    topic: string;
    subtopic: string;
    wrongAttempts: number;
    totalAttempts: number;
  }>;
  revisionGaps: Array<{
    uid: string;
    subject: string;
    chapter: string;
    topic: string;
    subtopic: string;
    completedAt?: number;
    latestRevisionAt?: number;
    gapDays: number | null;
  }>;
  completionGaps: Array<{
    subject: string;
    completedCount: number;
    revisedCount: number;
    revisionCoveragePct: number;
  }>;
  accuracyTrend: Array<{
    date: string;
    total: number;
    correct: number;
    wrong: number;
    accuracy: number;
  }>;
  speedTrend: Array<{
    date: string;
    averageTimeTakenSeconds: number;
    totalQuestions: number;
  }>;
}

export interface AiReadyReport {
  metadata: {
    generatedAt: string;
    generatedBy: string;
    selectedDateRange: {
      startDate: string;
      endDate: string;
    };
    appVersion: string | null;
    userName: string | null;
  };
  summary: {
    totalActivities: number;
    totalQuestionsAttempted: number;
    totalCorrect: number;
    totalWrong: number;
    totalSkipped: number;
    accuracy: number;
    totalCompleteActions: number;
    totalReviseActions: number;
    totalStarActions: number;
    totalUncompleteActions: number;
    totalUnreviseActions: number;
    totalUnstarActions: number;
    sessionCount: number;
  };
  questionAttempts: QuestionAttemptReportRecord[];
  noteActions: NoteActionReportRecord[];
  activityTimeline: TimelineRecord[];
  sessionBreakdown: SessionBreakdownRecord[];
  subjectAnalysis: Record<string, AggregateBucket>;
  chapterAnalysis: Record<string, AggregateBucket & { subject: string; chapter: string }>;
  topicAnalysis: Record<
    string,
    AggregateBucket & {
      subject: string;
      chapter: string;
      topic: string;
    }
  >;
  subtopicAnalysis: Record<
    string,
    AggregateBucket & {
      subject: string;
      chapter: string;
      topic: string;
      subtopic: string;
    }
  >;
  difficultyAnalysis: Record<string, AggregateBucket>;
  timeAnalysis: TimeAnalysis;
  aiAnalysisHelpers: AiAnalysisHelpers;
}

function safeString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function safeNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function safeArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function normalizeResult(
  value: unknown,
): "Correct" | "Wrong" | "Skipped" | "Unknown" {
  if (typeof value !== "string") return "Unknown";
  const lower = value.trim().toLowerCase();

  if (lower === "correct") return "Correct";
  if (lower === "wrong" || lower === "incorrect") return "Wrong";
  if (lower === "skipped") return "Skipped";

  return "Unknown";
}

function normalizeNoteActionType(
  value: unknown,
): NoteActionReportRecord["action"] | null {
  if (typeof value !== "string") return null;

  const lower = value.trim().toLowerCase();

  if (
    lower === "completed" ||
    lower === "revised" ||
    lower === "starred" ||
    lower === "uncompleted" ||
    lower === "unrevised" ||
    lower === "unstarred"
  ) {
    return lower;
  }

  return null;
}

function toDateString(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function toTimeString(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function addAggregate(
  map: Record<string, AggregateBucket>,
  key: string,
  result: "Correct" | "Wrong" | "Skipped" | "Unknown",
) {
  if (!map[key]) {
    map[key] = { total: 0, correct: 0, wrong: 0, skipped: 0, accuracy: 0 };
  }

  map[key].total += 1;
  if (result === "Correct") map[key].correct += 1;
  if (result === "Wrong") map[key].wrong += 1;
  if (result === "Skipped") map[key].skipped += 1;
}

function finalizeAggregates<T extends Record<string, AggregateBucket>>(map: T): T {
  for (const key of Object.keys(map)) {
    const bucket = map[key];
    bucket.accuracy =
      bucket.total > 0 ? (bucket.correct / bucket.total) * 100 : 0;
  }
  return map;
}

function normalizeQuestionAttempt(
  raw: RawQuestionAttempt,
  index: number,
): QuestionAttemptReportRecord {
  const timestamp = safeNumber(raw.timestamp) ?? Date.now();

  const selectedOption =
    raw.selectedOption ??
    raw.selectedOptionId ??
    raw.finalSelectedOption ??
    raw.finalSelectedOptionId ??
    null;

  const correctOption =
    raw.correctOption ??
    raw.correctOptionId ??
    null;

  const initialSelectedOption =
    raw.initialSelectedOption ??
    raw.initialSelectedOptionId ??
    null;

  const finalSelectedOption =
    raw.finalSelectedOption ??
    raw.finalSelectedOptionId ??
    raw.selectedOption ??
    raw.selectedOptionId ??
    null;

  const result = normalizeResult(raw.result);

  const questionText =
    safeString(raw.questionText) ||
    safeString(raw.question) ||
    safeString(raw.stem) ||
    "";

  const questionId =
    safeString(raw.questionId) ||
    safeString(raw.quizQuestionId) ||
    null;

  const attemptId =
    safeString(raw.id) ||
    `${questionId ?? "question"}-${timestamp}-${index}`;

  return {
    id: attemptId,
    eventType: "question_attempt",
    timestamp,
    date: toDateString(timestamp),
    time: toTimeString(timestamp),
    sessionId: raw.sessionId == null ? null : String(raw.sessionId),

    questionId,
    attemptNumber: safeNumber(raw.attemptNumber),

    subject: safeString(raw.subject),
    chapter: safeString(raw.chapter),
    topic: safeString(raw.topic),
    subtopic: safeString(raw.subtopic),
    difficulty: safeString(raw.difficulty),
    questionType: safeString(raw.questionType),
    sourceModule: safeString(raw.sourceModule),

    questionText,
    statements: safeArray<string>(raw.statements),
    options:
      raw.options && typeof raw.options === "object" && !Array.isArray(raw.options)
        ? (raw.options as Record<string, string>)
        : {},
    selectedOption:
      selectedOption == null ? null : String(selectedOption),
    correctOption:
      correctOption == null ? null : String(correctOption),
    initialSelectedOption:
      initialSelectedOption == null ? null : String(initialSelectedOption),
    finalSelectedOption:
      finalSelectedOption == null ? null : String(finalSelectedOption),
    answerChangeCount:
      safeNumber(raw.answerChangeCount) ??
      safeNumber(raw.optionChangeCount) ??
      0,
    result,

    timeLimitSeconds:
      safeNumber(raw.timeLimitSeconds) ??
      safeNumber(raw.timeLimit) ??
      null,
    timeTakenSeconds:
      safeNumber(raw.timeTakenSeconds) ??
      safeNumber(raw.timeTaken) ??
      null,

    explanation: raw.explanation ?? null,
    confidence: raw.confidence ?? null,
    noteChapterId:
      raw.noteChapterId == null ? null : String(raw.noteChapterId),
    noteChapter:
      raw.noteChapter == null ? null : String(raw.noteChapter),
  };
}

function normalizeNoteAction(
  raw: SubjectProgressNoteAction,
  index: number,
): NoteActionReportRecord | null {
  const timestamp = safeNumber(raw.timestamp);
  if (timestamp == null) return null;

  const action =
    normalizeNoteActionType(raw.action) ??
    normalizeNoteActionType(raw.actionType);

  if (!action) return null;

  const uid =
    safeString(raw.note) ||
    safeString(raw.pointUid) ||
    "";

  const point =
    safeString(raw.point) ||
    safeString(raw.pointText) ||
    "";

  const id =
    safeString(raw.id) ||
    `${safeString(raw.subject) || "subject"}-${uid || "uid"}-${action}-${timestamp}-${index}`;

  return {
    id,
    eventType: "note_action",
    timestamp,
    date: toDateString(timestamp),
    time: toTimeString(timestamp),
    sessionId: raw.sessionId == null ? null : String(raw.sessionId),

    subject: safeString(raw.subject),
    chapter: safeString(raw.chapter),
    topic: safeString(raw.topic),
    subtopic: safeString(raw.subtopic),
    point,
    uid,

    action,
    previousStatus:
      raw.previousStatus && typeof raw.previousStatus === "object"
        ? raw.previousStatus
        : {},
    newStatus:
      raw.newStatus && typeof raw.newStatus === "object"
        ? raw.newStatus
        : {},
    path: Array.isArray(raw.path)
      ? raw.path.filter((v) => typeof v === "string")
      : [],
  };
}

function buildTimeline(
  questionAttempts: QuestionAttemptReportRecord[],
  noteActions: NoteActionReportRecord[],
): TimelineRecord[] {
  const questionEvents: TimelineRecord[] = questionAttempts.map((attempt) => ({
    id: `timeline-question-${attempt.id}`,
    timestamp: attempt.timestamp,
    date: attempt.date,
    time: attempt.time,
    eventType:
      attempt.result === "Correct"
        ? "question_correct"
        : attempt.result === "Wrong"
          ? "question_wrong"
          : attempt.result === "Skipped"
            ? "question_skipped"
            : "question_attempt",
    sessionId: attempt.sessionId,
    subject: attempt.subject,
    chapter: attempt.chapter || undefined,
    topic: attempt.topic || undefined,
    subtopic: attempt.subtopic || undefined,
    questionId: attempt.questionId,
    result: attempt.result,
    label:
      attempt.result === "Correct"
        ? "Correct question attempt"
        : attempt.result === "Wrong"
          ? "Wrong question attempt"
          : attempt.result === "Skipped"
            ? "Skipped question"
            : "Question attempt",
    meta: {
      questionText: attempt.questionText,
      difficulty: attempt.difficulty,
      selectedOption: attempt.selectedOption,
      correctOption: attempt.correctOption,
      timeTakenSeconds: attempt.timeTakenSeconds,
    },
  }));

  const noteEvents: TimelineRecord[] = noteActions.map((action) => {
    const eventTypeMap: Record<NoteActionReportRecord["action"], TimelineRecord["eventType"]> = {
      completed: "note_completed",
      revised: "note_revised",
      starred: "note_starred",
      uncompleted: "note_uncompleted",
      unrevised: "note_unrevised",
      unstarred: "note_unstarred",
    };

    return {
      id: `timeline-note-${action.id}`,
      timestamp: action.timestamp,
      date: action.date,
      time: action.time,
      eventType: eventTypeMap[action.action],
      sessionId: action.sessionId,
      subject: action.subject,
      chapter: action.chapter || undefined,
      topic: action.topic || undefined,
      subtopic: action.subtopic || undefined,
      point: action.point || undefined,
      action: action.action,
      label: `Note ${action.action}`,
      meta: {
        uid: action.uid,
        path: action.path,
      },
    };
  });

  return [...questionEvents, ...noteEvents].sort(
    (a, b) => a.timestamp - b.timestamp,
  );
}

function buildSessionBreakdown(
  studySessions: RawStudySession[],
  questionAttempts: QuestionAttemptReportRecord[],
  noteActions: NoteActionReportRecord[],
  timeline: TimelineRecord[],
): SessionBreakdownRecord[] {
  const sessionMap = new Map<string, SessionBreakdownRecord>();

  for (const session of studySessions) {
    const sessionId = session?.id == null ? null : String(session.id);
    if (!sessionId) continue;

    sessionMap.set(sessionId, {
      sessionId,
      sessionStart: safeNumber(session.startTime),
      sessionEnd: safeNumber(session.endTime),
      sessionDurationSeconds: safeNumber(session.duration),

      questionsAttempted: 0,
      correctCount: 0,
      wrongCount: 0,
      skippedCount: 0,
      accuracy: 0,

      subjectsStudied: [],
      chaptersStudied: [],
      topicsStudied: [],
      actionsPerformed: 0,

      questionAttemptIds: [],
      noteActionIds: [],
      timelineEventIds: [],
    });
  }

  function ensureSession(sessionId: string): SessionBreakdownRecord {
    if (!sessionMap.has(sessionId)) {
      sessionMap.set(sessionId, {
        sessionId,
        sessionStart: null,
        sessionEnd: null,
        sessionDurationSeconds: null,

        questionsAttempted: 0,
        correctCount: 0,
        wrongCount: 0,
        skippedCount: 0,
        accuracy: 0,

        subjectsStudied: [],
        chaptersStudied: [],
        topicsStudied: [],
        actionsPerformed: 0,

        questionAttemptIds: [],
        noteActionIds: [],
        timelineEventIds: [],
      });
    }
    return sessionMap.get(sessionId)!;
  }

  for (const attempt of questionAttempts) {
    if (!attempt.sessionId) continue;
    const session = ensureSession(attempt.sessionId);

    session.questionsAttempted += 1;
    if (attempt.result === "Correct") session.correctCount += 1;
    if (attempt.result === "Wrong") session.wrongCount += 1;
    if (attempt.result === "Skipped") session.skippedCount += 1;

    if (attempt.subject && !session.subjectsStudied.includes(attempt.subject)) {
      session.subjectsStudied.push(attempt.subject);
    }

    const chapterKey = [attempt.subject, attempt.chapter].filter(Boolean).join(" :: ");
    if (chapterKey && !session.chaptersStudied.includes(chapterKey)) {
      session.chaptersStudied.push(chapterKey);
    }

    const topicKey = [attempt.subject, attempt.chapter, attempt.topic]
      .filter(Boolean)
      .join(" :: ");
    if (topicKey && !session.topicsStudied.includes(topicKey)) {
      session.topicsStudied.push(topicKey);
    }

    session.questionAttemptIds.push(attempt.id);
  }

  for (const action of noteActions) {
    if (!action.sessionId) continue;
    const session = ensureSession(action.sessionId);

    session.actionsPerformed += 1;

    if (action.subject && !session.subjectsStudied.includes(action.subject)) {
      session.subjectsStudied.push(action.subject);
    }

    const chapterKey = [action.subject, action.chapter].filter(Boolean).join(" :: ");
    if (chapterKey && !session.chaptersStudied.includes(chapterKey)) {
      session.chaptersStudied.push(chapterKey);
    }

    const topicKey = [action.subject, action.chapter, action.topic]
      .filter(Boolean)
      .join(" :: ");
    if (topicKey && !session.topicsStudied.includes(topicKey)) {
      session.topicsStudied.push(topicKey);
    }

    session.noteActionIds.push(action.id);
  }

  for (const event of timeline) {
    if (!event.sessionId) continue;
    const session = ensureSession(event.sessionId);
    session.timelineEventIds.push(event.id);
  }

  const sessions = Array.from(sessionMap.values()).map((session) => ({
    ...session,
    accuracy:
      session.questionsAttempted > 0
        ? (session.correctCount / session.questionsAttempted) * 100
        : 0,
  }));

  sessions.sort((a, b) => {
    const aTime = a.sessionStart ?? 0;
    const bTime = b.sessionStart ?? 0;
    return aTime - bTime;
  });

  return sessions;
}

function buildTimeAnalysis(
  questionAttempts: QuestionAttemptReportRecord[],
  sessions: SessionBreakdownRecord[],
): TimeAnalysis {
  const byHour: TimeAnalysis["byHour"] = {};

  const timeTakenValues: number[] = [];
  const questionWithTime = questionAttempts.filter(
    (q) => typeof q.timeTakenSeconds === "number" && q.timeTakenSeconds != null,
  );

  for (const attempt of questionAttempts) {
    const hour = new Date(attempt.timestamp).getHours().toString().padStart(2, "0");

    if (!byHour[hour]) {
      byHour[hour] = {
        totalQuestions: 0,
        correct: 0,
        wrong: 0,
        skipped: 0,
        accuracy: 0,
      };
    }

    byHour[hour].totalQuestions += 1;
    if (attempt.result === "Correct") byHour[hour].correct += 1;
    if (attempt.result === "Wrong") byHour[hour].wrong += 1;
    if (attempt.result === "Skipped") byHour[hour].skipped += 1;

    if (typeof attempt.timeTakenSeconds === "number") {
      timeTakenValues.push(attempt.timeTakenSeconds);
    }
  }

  for (const hour of Object.keys(byHour)) {
    const bucket = byHour[hour];
    bucket.accuracy =
      bucket.totalQuestions > 0
        ? (bucket.correct / bucket.totalQuestions) * 100
        : 0;
  }

  const averageTimeTakenSeconds =
    timeTakenValues.length > 0
      ? timeTakenValues.reduce((sum, value) => sum + value, 0) / timeTakenValues.length
      : 0;

  const slowestQuestions = [...questionWithTime]
    .sort((a, b) => (b.timeTakenSeconds ?? 0) - (a.timeTakenSeconds ?? 0))
    .slice(0, 10)
    .map((q) => ({
      id: q.id,
      subject: q.subject,
      chapter: q.chapter,
      topic: q.topic,
      subtopic: q.subtopic,
      questionText: q.questionText,
      timeTakenSeconds: q.timeTakenSeconds ?? 0,
      result: q.result,
    }));

  const fastestQuestions = [...questionWithTime]
    .sort((a, b) => (a.timeTakenSeconds ?? 0) - (b.timeTakenSeconds ?? 0))
    .slice(0, 10)
    .map((q) => ({
      id: q.id,
      subject: q.subject,
      chapter: q.chapter,
      topic: q.topic,
      subtopic: q.subtopic,
      questionText: q.questionText,
      timeTakenSeconds: q.timeTakenSeconds ?? 0,
      result: q.result,
    }));

  const sessionDurations = sessions
    .map((session) => session.sessionDurationSeconds)
    .filter((value): value is number => typeof value === "number");

  const averageSessionDurationSeconds =
    sessionDurations.length > 0
      ? sessionDurations.reduce((sum, value) => sum + value, 0) /
        sessionDurations.length
      : 0;

  return {
    byHour,
    averageTimeTakenSeconds,
    medianTimeTakenSeconds: median(timeTakenValues),
    slowestQuestions,
    fastestQuestions,
    averageSessionDurationSeconds,
  };
}

function buildAiAnalysisHelpers(
  questionAttempts: QuestionAttemptReportRecord[],
  noteActions: NoteActionReportRecord[],
  subtopicAnalysis: Record<
    string,
    AggregateBucket & {
      subject: string;
      chapter: string;
      topic: string;
      subtopic: string;
    }
  >,
  subjectAnalysis: Record<string, AggregateBucket>,
  chapterAnalysis: Record<
    string,
    AggregateBucket & {
      subject: string;
      chapter: string;
    }
  >,
): AiAnalysisHelpers {
  const weakTopics = Object.entries(subtopicAnalysis)
    .map(([key, value]) => ({
      key,
      subject: value.subject,
      chapter: value.chapter,
      topic: value.topic,
      subtopic: value.subtopic,
      total: value.total,
      wrong: value.wrong,
      accuracy: value.accuracy,
    }))
    .filter((item) => item.total > 0)
    .sort((a, b) => {
      if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
      return b.wrong - a.wrong;
    })
    .slice(0, 15);

  const strongTopics = Object.entries(subtopicAnalysis)
    .map(([key, value]) => ({
      key,
      subject: value.subject,
      chapter: value.chapter,
      topic: value.topic,
      subtopic: value.subtopic,
      total: value.total,
      correct: value.correct,
      accuracy: value.accuracy,
    }))
    .filter((item) => item.total > 0)
    .sort((a, b) => {
      if (a.accuracy !== b.accuracy) return b.accuracy - a.accuracy;
      return b.correct - a.correct;
    })
    .slice(0, 15);

  const mostWrongSubjects = Object.entries(subjectAnalysis)
    .map(([subject, value]) => ({
      subject,
      wrong: value.wrong,
      total: value.total,
      accuracy: value.accuracy,
    }))
    .sort((a, b) => b.wrong - a.wrong)
    .slice(0, 15);

  const mostWrongChapters = Object.entries(chapterAnalysis)
    .map(([key, value]) => ({
      key,
      subject: value.subject,
      chapter: value.chapter,
      wrong: value.wrong,
      total: value.total,
      accuracy: value.accuracy,
    }))
    .sort((a, b) => b.wrong - a.wrong)
    .slice(0, 15);

  const byQuestion = new Map<
    string,
    {
      questionId: string | null;
      questionText: string;
      subject: string;
      chapter: string;
      topic: string;
      subtopic: string;
      wrongAttempts: number;
      totalAttempts: number;
    }
  >();

  for (const attempt of questionAttempts) {
    const key =
      attempt.questionId ??
      `${attempt.subject}::${attempt.chapter}::${attempt.topic}::${attempt.questionText}`;

    if (!byQuestion.has(key)) {
      byQuestion.set(key, {
        questionId: attempt.questionId,
        questionText: attempt.questionText,
        subject: attempt.subject,
        chapter: attempt.chapter,
        topic: attempt.topic,
        subtopic: attempt.subtopic,
        wrongAttempts: 0,
        totalAttempts: 0,
      });
    }

    const bucket = byQuestion.get(key)!;
    bucket.totalAttempts += 1;
    if (attempt.result === "Wrong") bucket.wrongAttempts += 1;
  }

  const repeatedMistakePatterns = Array.from(byQuestion.values())
    .filter((item) => item.wrongAttempts >= 2)
    .sort((a, b) => {
      if (a.wrongAttempts !== b.wrongAttempts) {
        return b.wrongAttempts - a.wrongAttempts;
      }
      return b.totalAttempts - a.totalAttempts;
    })
    .slice(0, 20);

  const completionMap = new Map<
    string,
    {
      uid: string;
      subject: string;
      chapter: string;
      topic: string;
      subtopic: string;
      completedAt?: number;
      latestRevisionAt?: number;
      revisedCount: number;
    }
  >();

  for (const action of noteActions) {
    const key = `${action.subject}::${action.uid}`;
    if (!completionMap.has(key)) {
      completionMap.set(key, {
        uid: action.uid,
        subject: action.subject,
        chapter: action.chapter,
        topic: action.topic,
        subtopic: action.subtopic,
        revisedCount: 0,
      });
    }

    const record = completionMap.get(key)!;
    if (action.action === "completed") {
      record.completedAt = action.timestamp;
    }
    if (action.action === "revised") {
      record.latestRevisionAt = Math.max(
        record.latestRevisionAt ?? 0,
        action.timestamp,
      );
      record.revisedCount += 1;
    }
  }

  const revisionGaps = Array.from(completionMap.values())
    .map((item) => ({
      uid: item.uid,
      subject: item.subject,
      chapter: item.chapter,
      topic: item.topic,
      subtopic: item.subtopic,
      completedAt: item.completedAt,
      latestRevisionAt: item.latestRevisionAt,
      gapDays:
        item.completedAt && item.latestRevisionAt
          ? Math.round(
              (item.latestRevisionAt - item.completedAt) / (1000 * 60 * 60 * 24),
            )
          : null,
    }))
    .sort((a, b) => {
      const aGap = a.gapDays ?? -1;
      const bGap = b.gapDays ?? -1;
      return bGap - aGap;
    });

  const completionCoverageMap = new Map<
    string,
    { completedCount: number; revisedCount: number }
  >();

  for (const action of noteActions) {
    if (!completionCoverageMap.has(action.subject)) {
      completionCoverageMap.set(action.subject, {
        completedCount: 0,
        revisedCount: 0,
      });
    }

    const record = completionCoverageMap.get(action.subject)!;
    if (action.action === "completed") record.completedCount += 1;
    if (action.action === "revised") record.revisedCount += 1;
  }

  const completionGaps = Array.from(completionCoverageMap.entries()).map(
    ([subject, value]) => ({
      subject,
      completedCount: value.completedCount,
      revisedCount: value.revisedCount,
      revisionCoveragePct:
        value.completedCount > 0
          ? (value.revisedCount / value.completedCount) * 100
          : 0,
    }),
  );

  const accuracyTrendMap = new Map<
    string,
    { total: number; correct: number; wrong: number }
  >();

  const speedTrendMap = new Map<
    string,
    { totalQuestions: number; totalTimeTakenSeconds: number }
  >();

  for (const attempt of questionAttempts) {
    const date = attempt.date;

    if (!accuracyTrendMap.has(date)) {
      accuracyTrendMap.set(date, { total: 0, correct: 0, wrong: 0 });
    }

    const accuracyBucket = accuracyTrendMap.get(date)!;
    accuracyBucket.total += 1;
    if (attempt.result === "Correct") accuracyBucket.correct += 1;
    if (attempt.result === "Wrong") accuracyBucket.wrong += 1;

    if (typeof attempt.timeTakenSeconds === "number") {
      if (!speedTrendMap.has(date)) {
        speedTrendMap.set(date, { totalQuestions: 0, totalTimeTakenSeconds: 0 });
      }
      const speedBucket = speedTrendMap.get(date)!;
      speedBucket.totalQuestions += 1;
      speedBucket.totalTimeTakenSeconds += attempt.timeTakenSeconds;
    }
  }

  const accuracyTrend = Array.from(accuracyTrendMap.entries())
    .map(([date, value]) => ({
      date,
      total: value.total,
      correct: value.correct,
      wrong: value.wrong,
      accuracy: value.total > 0 ? (value.correct / value.total) * 100 : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const speedTrend = Array.from(speedTrendMap.entries())
    .map(([date, value]) => ({
      date,
      averageTimeTakenSeconds:
        value.totalQuestions > 0
          ? value.totalTimeTakenSeconds / value.totalQuestions
          : 0,
      totalQuestions: value.totalQuestions,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    weakTopics,
    strongTopics,
    mostWrongSubjects,
    mostWrongChapters,
    repeatedMistakePatterns,
    revisionGaps,
    completionGaps,
    accuracyTrend,
    speedTrend,
  };
}

export function buildReportData({
  startDate,
  endDate,
  questionAttempts,
  noteActions,
  studySessions,
}: BuildReportDataInput): AiReadyReport {
  const normalizedQuestionAttempts = questionAttempts.map(normalizeQuestionAttempt);

  const normalizedNoteActions = noteActions
    .map(normalizeNoteAction)
    .filter((item): item is NoteActionReportRecord => item !== null);

  const timeline = buildTimeline(normalizedQuestionAttempts, normalizedNoteActions);

  const sessions = buildSessionBreakdown(
    studySessions,
    normalizedQuestionAttempts,
    normalizedNoteActions,
    timeline,
  );

  const subjectAnalysis: Record<string, AggregateBucket> = {};
  const difficultyAnalysis: Record<string, AggregateBucket> = {};
  const chapterAnalysis: Record<
    string,
    AggregateBucket & { subject: string; chapter: string }
  > = {};
  const topicAnalysis: Record<
    string,
    AggregateBucket & { subject: string; chapter: string; topic: string }
  > = {};
  const subtopicAnalysis: Record<
    string,
    AggregateBucket & {
      subject: string;
      chapter: string;
      topic: string;
      subtopic: string;
    }
  > = {};

  for (const attempt of normalizedQuestionAttempts) {
    const subjectKey = attempt.subject || "Unknown";
    addAggregate(subjectAnalysis, subjectKey, attempt.result);

    const difficultyKey = attempt.difficulty || "Unknown";
    addAggregate(difficultyAnalysis, difficultyKey, attempt.result);

    const chapterKey = [attempt.subject, attempt.chapter].filter(Boolean).join(" :: ");
    if (chapterKey) {
      if (!chapterAnalysis[chapterKey]) {
        chapterAnalysis[chapterKey] = {
          subject: attempt.subject,
          chapter: attempt.chapter,
          total: 0,
          correct: 0,
          wrong: 0,
          skipped: 0,
          accuracy: 0,
        };
      }
      addAggregate(chapterAnalysis, chapterKey, attempt.result);
    }

    const topicKey = [attempt.subject, attempt.chapter, attempt.topic]
      .filter(Boolean)
      .join(" :: ");
    if (topicKey) {
      if (!topicAnalysis[topicKey]) {
        topicAnalysis[topicKey] = {
          subject: attempt.subject,
          chapter: attempt.chapter,
          topic: attempt.topic,
          total: 0,
          correct: 0,
          wrong: 0,
          skipped: 0,
          accuracy: 0,
        };
      }
      addAggregate(topicAnalysis, topicKey, attempt.result);
    }

    const subtopicKey = [
      attempt.subject,
      attempt.chapter,
      attempt.topic,
      attempt.subtopic,
    ]
      .filter(Boolean)
      .join(" :: ");
    if (subtopicKey) {
      if (!subtopicAnalysis[subtopicKey]) {
        subtopicAnalysis[subtopicKey] = {
          subject: attempt.subject,
          chapter: attempt.chapter,
          topic: attempt.topic,
          subtopic: attempt.subtopic,
          total: 0,
          correct: 0,
          wrong: 0,
          skipped: 0,
          accuracy: 0,
        };
      }
      addAggregate(subtopicAnalysis, subtopicKey, attempt.result);
    }
  }

  finalizeAggregates(subjectAnalysis);
  finalizeAggregates(difficultyAnalysis);
  finalizeAggregates(chapterAnalysis);
  finalizeAggregates(topicAnalysis);
  finalizeAggregates(subtopicAnalysis);

  const timeAnalysis = buildTimeAnalysis(normalizedQuestionAttempts, sessions);
  const aiAnalysisHelpers = buildAiAnalysisHelpers(
    normalizedQuestionAttempts,
    normalizedNoteActions,
    subtopicAnalysis,
    subjectAnalysis,
    chapterAnalysis,
  );

  const totalCorrect = normalizedQuestionAttempts.filter(
    (attempt) => attempt.result === "Correct",
  ).length;

  const totalWrong = normalizedQuestionAttempts.filter(
    (attempt) => attempt.result === "Wrong",
  ).length;

  const totalSkipped = normalizedQuestionAttempts.filter(
    (attempt) => attempt.result === "Skipped",
  ).length;

  const totalQuestionsAttempted = normalizedQuestionAttempts.length;

  const totalCompleteActions = normalizedNoteActions.filter(
    (action) => action.action === "completed",
  ).length;

  const totalReviseActions = normalizedNoteActions.filter(
    (action) => action.action === "revised",
  ).length;

  const totalStarActions = normalizedNoteActions.filter(
    (action) => action.action === "starred",
  ).length;

  const totalUncompleteActions = normalizedNoteActions.filter(
    (action) => action.action === "uncompleted",
  ).length;

  const totalUnreviseActions = normalizedNoteActions.filter(
    (action) => action.action === "unrevised",
  ).length;

  const totalUnstarActions = normalizedNoteActions.filter(
    (action) => action.action === "unstarred",
  ).length;

  return {
    metadata: {
      generatedAt: new Date().toISOString(),
      generatedBy: "UPSC Dashboard Report System",
      selectedDateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      appVersion: null,
      userName: null,
    },
    summary: {
      totalActivities: timeline.length,
      totalQuestionsAttempted,
      totalCorrect,
      totalWrong,
      totalSkipped,
      accuracy:
        totalQuestionsAttempted > 0
          ? (totalCorrect / totalQuestionsAttempted) * 100
          : 0,
      totalCompleteActions,
      totalReviseActions,
      totalStarActions,
      totalUncompleteActions,
      totalUnreviseActions,
      totalUnstarActions,
      sessionCount: sessions.length,
    },
    questionAttempts: normalizedQuestionAttempts.sort(
      (a, b) => a.timestamp - b.timestamp,
    ),
    noteActions: normalizedNoteActions.sort((a, b) => a.timestamp - b.timestamp),
    activityTimeline: timeline,
    sessionBreakdown: sessions,
    subjectAnalysis,
    chapterAnalysis,
    topicAnalysis,
    subtopicAnalysis,
    difficultyAnalysis,
    timeAnalysis,
    aiAnalysisHelpers,
  };
}