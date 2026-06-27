import { v4 as uuidv4 } from "uuid";
import { getDB } from "./db";

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes inactivity

let currentSession = {
  id: null,
  lastActivity: 0,
};

/**
 * Gets or creates a study session id.
 */
async function getSessionId() {
  const now = Date.now();

  if (
    !currentSession.id ||
    now - currentSession.lastActivity > SESSION_TIMEOUT
  ) {
    if (currentSession.id) {
      await endStudySession(currentSession.id, currentSession.lastActivity);
    }

    const newSessionId = uuidv4();
    const db = await getDB();

    await db.put("studySessions", {
      id: newSessionId,
      startTime: now,
      endTime: null,
      duration: null,
      subjects: [],
      chapters: [],
      topics: [],
      actionsCount: 0,
      questionAttempts: 0,
      correctCount: 0,
      wrongCount: 0,
      skippedCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    currentSession.id = newSessionId;
  }

  currentSession.lastActivity = now;
  return currentSession.id;
}

/**
 * Safely updates study session aggregate stats when an event is tracked.
 */
async function updateSessionStats(sessionId, event) {
  if (!sessionId) return;

  const db = await getDB();
  const session = await db.get("studySessions", sessionId);
  if (!session) return;

  const nextSubjects = new Set(
    Array.isArray(session.subjects) ? session.subjects : [],
  );
  const nextChapters = new Set(
    Array.isArray(session.chapters) ? session.chapters : [],
  );
  const nextTopics = new Set(
    Array.isArray(session.topics) ? session.topics : [],
  );

  if (event.subject) nextSubjects.add(event.subject);
  if (event.chapter) nextChapters.add(event.chapter);
  if (event.topic) nextTopics.add(event.topic);

  session.subjects = Array.from(nextSubjects);
  session.chapters = Array.from(nextChapters);
  session.topics = Array.from(nextTopics);
  session.actionsCount = (session.actionsCount || 0) + 1;

  if (event.eventType === "question_attempt") {
    session.questionAttempts = (session.questionAttempts || 0) + 1;

    if (event.result === "Correct") {
      session.correctCount = (session.correctCount || 0) + 1;
    } else if (event.result === "Incorrect") {
      session.wrongCount = (session.wrongCount || 0) + 1;
    } else if (event.result === "Skipped") {
      session.skippedCount = (session.skippedCount || 0) + 1;
    }
  }

  session.updatedAt = Date.now();
  await db.put("studySessions", session);
}

/**
 * Ends a study session.
 */
async function endStudySession(sessionId, endTime) {
  const db = await getDB();
  const session = await db.get("studySessions", sessionId);

  if (session && !session.endTime) {
    session.endTime = endTime;
    session.duration = Math.max(
      0,
      Math.round((endTime - session.startTime) / 1000),
    );
    session.updatedAt = Date.now();
    await db.put("studySessions", session);
  }
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function toDateParts(timestamp) {
  const date = new Date(timestamp);

  const pad = (n) => String(n).padStart(2, "0");

  const attemptDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const attemptTime = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

  return { attemptDate, attemptTime };
}

/**
 * Normalizes a question attempt into a stable report-ready shape.
 */
function normalizeQuestionAttempt(attemptData, sessionId) {
  const timestamp =
    typeof attemptData?.timestamp === "number" &&
    Number.isFinite(attemptData.timestamp)
      ? attemptData.timestamp
      : Date.now();

  const { attemptDate, attemptTime } = toDateParts(timestamp);

  const question = normalizeObject(attemptData?.question);
  const options = normalizeObject(question.options || attemptData?.options);
  const explanation = normalizeObject(attemptData?.explanation);

  const selectedOptionId =
    attemptData?.selectedOptionId ?? attemptData?.finalSelectedOptionId ?? null;
  const correctOptionId =
    attemptData?.correctOptionId ?? question.correctOptionId ?? null;

  const selectedOption =
    normalizeString(attemptData?.selectedOption) ||
    (selectedOptionId && typeof options[selectedOptionId] === "string"
      ? options[selectedOptionId]
      : "");

  const correctOption =
    normalizeString(attemptData?.correctOption) ||
    (correctOptionId && typeof options[correctOptionId] === "string"
      ? options[correctOptionId]
      : "") ||
    normalizeString(question.correctOption);

  const result =
    attemptData?.result === "Correct" ||
    attemptData?.result === "Incorrect" ||
    attemptData?.result === "Skipped"
      ? attemptData.result
      : attemptData?.isCorrect
        ? "Correct"
        : selectedOptionId
          ? "Incorrect"
          : "Skipped";

  return {
    id: uuidv4(),
    eventType: "question_attempt",
    timestamp,
    attemptDate,
    attemptTime,
    sessionId,

    // source / taxonomy
    sourceModule:
      normalizeString(attemptData?.sourceModule) || "quiz-session-popup",
    mode: normalizeString(attemptData?.mode) || "practice",
    subject: normalizeString(attemptData?.subject) || "Unknown",
    chapter: normalizeString(attemptData?.chapter),
    topic: normalizeString(attemptData?.topic),
    subtopic: normalizeString(attemptData?.subtopic),
    subtopicId: normalizeString(attemptData?.subtopicId),

    // question identity
    questionId: normalizeString(attemptData?.questionId),
    questionType: normalizeString(attemptData?.questionType),
    difficulty: normalizeString(attemptData?.difficulty),

    // question content
    questionText: normalizeString(question.stem || attemptData?.questionText),
    statements: normalizeArray(question.statements || attemptData?.statements),
    instruction: normalizeString(
      question.instruction || attemptData?.instruction,
    ),
    options,
    correctOptionId,
    correctOption,

    // user answer
    selectedOptionId,
    selectedOption,
    initialSelectedOptionId: attemptData?.initialSelectedOptionId ?? null,
    initialSelectedOption: normalizeString(attemptData?.initialSelectedOption),
    finalSelectedOptionId:
      attemptData?.finalSelectedOptionId ?? selectedOptionId ?? null,
    finalSelectedOption:
      normalizeString(attemptData?.finalSelectedOption) || selectedOption,
    answerChangeCount:
      typeof attemptData?.answerChangeCount === "number"
        ? attemptData.answerChangeCount
        : 0,

    // result / timing
    isCorrect: result === "Correct",
    result,
    timeLimit:
      typeof attemptData?.timeLimit === "number" ? attemptData.timeLimit : null,
    timeTaken:
      typeof attemptData?.timeTaken === "number" ? attemptData.timeTaken : null,
    confidence: attemptData?.confidence ?? null,
    attemptNumber:
      typeof attemptData?.attemptNumber === "number"
        ? attemptData.attemptNumber
        : 1,

    // explanation
    explanation: {
      coreConcept: normalizeString(explanation.coreConcept),
      trapUsed: normalizeString(explanation.trapUsed),
      laxmikanthCitation: normalizeString(explanation.laxmikanthCitation),
      visionIasCitation: normalizeString(explanation.visionIasCitation),
    },

    // optional extras
    meta: normalizeObject(attemptData?.meta),
  };
}

/**
 * Tracks a single normalized question attempt.
 */
export const trackQuestionAttempt = async (attemptData) => {
  const db = await getDB();
  const sessionId = await getSessionId();
  const record = normalizeQuestionAttempt(attemptData, sessionId);

  await db.put("questionAttempts", record);
  await updateSessionStats(sessionId, record);

  return record;
};

/**
 * Tracks note / subject action.
 * This keeps your earlier note reporting compatible with session analytics too.
 */
export const trackNoteAction = async (actionData) => {
  const db = await getDB();
  const sessionId = await getSessionId();
  const timestamp = Date.now();
  const { attemptDate, attemptTime } = toDateParts(timestamp);

  const record = {
    id: uuidv4(),
    eventType: "note_action",
    timestamp,
    attemptDate,
    attemptTime,
    sessionId,
    sourceModule:
      normalizeString(actionData?.sourceModule) || "subject-dashboard",

    actionType: normalizeString(actionData?.actionType || actionData?.action),
    previousStatus: actionData?.previousStatus ?? null,
    newStatus: actionData?.newStatus ?? null,

    subject: normalizeString(actionData?.subject),
    chapter: normalizeString(actionData?.chapter),
    topic: normalizeString(actionData?.topic),
    subtopic: normalizeString(actionData?.subtopic),
    subtopicId: normalizeString(actionData?.subtopicId),
    pointUid: normalizeString(actionData?.pointUid || actionData?.uid),
    pointText: normalizeString(actionData?.pointText || actionData?.note),

    meta: normalizeObject(actionData?.meta),
  };

  await db.put("noteActions", record);
  await updateSessionStats(sessionId, record);

  return record;
};

/**
 * Retrieves report data for a date range.
 */
export const getReportData = async (startDate, endDate) => {
  const db = await getDB();
  const tsRange = IDBKeyRange.bound(startDate.getTime(), endDate.getTime());

  const questionAttempts = await db.getAllFromIndex(
    "questionAttempts",
    "timestamp",
    tsRange,
  );

  const noteActions = await db.getAllFromIndex(
    "noteActions",
    "timestamp",
    tsRange,
  );

  const studySessions = await db.getAllFromIndex(
    "studySessions",
    "startTime",
    tsRange,
  );

  return {
    questionAttempts,
    noteActions,
    studySessions,
  };
};
