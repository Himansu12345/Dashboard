// 🌍 PRO FIX: Force Node.js to operate entirely in Indian Standard Time (IST)
// This strictly prevents native JS Date objects from drifting on UTC cloud servers.
process.env.TZ = "Asia/Kolkata";

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const crypto = require("crypto");
const helmet = require("helmet");
const ReportEvent = require("./models/ReportEvent");
const SubjectProgress = require("./models/SubjectProgress");
const {
  calculateNoteMissionProgress,
} = require("../upsc-dashboard/shared/plannerMissionProgress"); // 🛡️ PRO FIX: Path corrected!
const { rateLimit } = require("express-rate-limit");
const {
  buildConsistencyDashboard,
  createConsistencyModels,
} = require("./consistencyEngine");
const {
  buildSyllabusDashboard,
  createSyllabusModels,
} = require("./syllabusEngine");
require("dotenv").config();

const ALLOWED_DIFFICULTIES = new Set(["Easy", "Medium", "Hard", "Unknown"]);
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];
const SUBJECT_ALIASES = {
  "Ancient History": "Ancient",
  "Medieval History": "Medieval",
  "Modern History": "Modern",
  "Environment & Ecology": "Environment",
  "Science & Technology": "Science & Tech",
  Economy: "Economics",
};
const plannerSubjectSyncQueues = new Map();

if (!process.env.MONGO_URL) {
  console.error("CRITICAL ERROR: Missing MONGO_URL in .env file.");
  process.exit(1);
}

function safeString(value, maxLength = 300) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function safeStringArray(value, maxItems = 30, maxLength = 300) {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(value.map((item) => safeString(item, maxLength)).filter(Boolean)),
  ).slice(0, maxItems);
}

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function enqueuePlannerSubjectSync(weekStartDate, syncTask) {
  const previousTask =
    plannerSubjectSyncQueues.get(weekStartDate) || Promise.resolve();
  const nextTask = previousTask
    .catch(() => undefined)
    .then(syncTask)
    .catch((error) => {
      const message = error && error.message ? error.message : String(error);
      console.error(
        `Planner subject-progress sync failed for week ${weekStartDate}:`,
        message,
      );
    })
    .finally(() => {
      if (plannerSubjectSyncQueues.get(weekStartDate) === nextTask) {
        plannerSubjectSyncQueues.delete(weekStartDate);
      }
    });

  plannerSubjectSyncQueues.set(weekStartDate, nextTask);
  return nextTask;
}

function toFiniteTimestamp(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const numericValue = Number(value);
    if (Number.isFinite(numericValue)) return numericValue;

    const parsedDate = new Date(value).getTime();
    if (Number.isFinite(parsedDate)) return parsedDate;
  }
  return null;
}

function getStartOfWeekStr() {
  // 🛡️ PRO FIX: Local Date formatting prevents real-time sync from failing between 12:00 AM and 5:30 AM IST
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const mondayDate = new Date(d.setDate(diff));
  return `${mondayDate.getFullYear()}-${String(
    mondayDate.getMonth() + 1,
  ).padStart(2, "0")}-${String(mondayDate.getDate()).padStart(2, "0")}`;
}

function isValidReportEventType(value) {
  return [
    "note_complete",
    "note_uncomplete",
    "note_revise",
    "note_unrevise",
    "note_star",
    "note_unstar",
    "question_attempt",
    "session_start",
    "session_end",
    "session_activity",
  ].includes(value);
}

function buildReportEventKey(payload) {
  const eventType = safeString(payload.eventType, 100);
  const sessionId = safeString(payload.sessionId, 200);
  const subject = safeString(payload.subject, 200);
  const chapter = safeString(payload.chapter, 200);
  const topic = safeString(payload.topic, 200);
  const subtopic = safeString(payload.subtopic, 200);
  const pointUid = safeString(payload.pointUid, 500);
  const timestamp =
    payload.timestamp && !Number.isNaN(new Date(payload.timestamp).getTime())
      ? new Date(payload.timestamp).getTime()
      : Date.now();

  return [
    eventType,
    sessionId,
    subject,
    chapter,
    topic,
    subtopic,
    pointUid,
    timestamp,
  ].join("|");
}

function toPositiveInt(value, fallbackValue) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallbackValue;
  return parsed;
}

function parseAllowedOrigins(value) {
  const raw = String(value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return new Set(raw.length > 0 ? raw : DEFAULT_ALLOWED_ORIGINS);
}

const allowedOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGINS);
const API_RATE_LIMIT_WINDOW_MS = toPositiveInt(
  process.env.API_RATE_LIMIT_WINDOW_MS,
  60_000,
);
const API_RATE_LIMIT_MAX = toPositiveInt(process.env.API_RATE_LIMIT_MAX, 300);
const JSON_BODY_LIMIT = String(process.env.JSON_BODY_LIMIT || "10mb");

function isAllowedCorsOrigin(origin) {
  if (!origin) return true;
  return allowedOrigins.has(origin);
}

const app = express();

// 🛡️ PRO FIX: Safely accommodate heavy 6-day Matrix payloads
app.use(express.json({ limit: JSON_BODY_LIMIT }));
app.disable("x-powered-by");
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedCorsOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    optionsSuccessStatus: 204,
  }),
);
app.use(express.json({ limit: JSON_BODY_LIMIT }));
app.use(
  "/api",
  rateLimit({
    windowMs: API_RATE_LIMIT_WINDOW_MS,
    limit: API_RATE_LIMIT_MAX,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again later." },
  }),
);

/**
 * POST /api/report-events
 * Saves note / report activity events into Mongo for later reporting/export.
 */
app.post("/api/report-events", async (req, res) => {
  try {
    const raw = req.body && typeof req.body === "object" ? req.body : {};
    const normalized = ReportEvent.normalizePayload(raw);

    if (!isValidReportEventType(normalized.eventType)) {
      return res.status(400).json({
        error: "Invalid report event type.",
      });
    }

    const eventTimestamp =
      normalized.timestamp instanceof Date &&
      !Number.isNaN(normalized.timestamp.getTime())
        ? normalized.timestamp
        : new Date();

    const payload = {
      ...normalized,
      timestamp: eventTimestamp,
      subject: safeString(normalized.subject, 200),
      chapter: safeString(normalized.chapter, 200),
      topic: safeString(normalized.topic, 200),
      subtopic: safeString(normalized.subtopic, 200),
      pointUid: safeString(normalized.pointUid, 500),
      pointText: safeString(normalized.pointText, 5000),
      label: safeString(normalized.label, 500),
      sourcePage: safeString(normalized.sourcePage, 200),
      actionLabel: safeString(normalized.actionLabel, 200),
      sessionId: safeString(normalized.sessionId, 200),
      path: safeStringArray(normalized.path, 30, 300),
      previousStatus: safeObject(normalized.previousStatus),
      newStatus: safeObject(normalized.newStatus),
      meta: safeObject(normalized.meta),
    };

    const eventKey =
      safeString(normalized.eventKey, 500) || buildReportEventKey(payload);

    const existing = await ReportEvent.findOne({ eventKey }).lean();
    if (existing) {
      return res.json({
        ok: true,
        deduped: true,
        eventId: existing._id,
        eventKey: existing.eventKey,
      });
    }

    const created = await ReportEvent.create({
      ...payload,
      eventKey,
    });

    return res.json({
      ok: true,
      deduped: false,
      eventId: created._id,
      eventKey: created.eventKey,
    });
  } catch (error) {
    console.error("POST /api/report-events failed:", error);
    return res.status(500).json({
      error: "Failed to store report event.",
    });
  }
});

const AttemptQuestionSchema = new mongoose.Schema(
  {
    questionId: { type: String, default: "", trim: true },
    question: { type: String, required: true, trim: true },
    options: { type: [String], default: [] },
    correctAnswer: { type: String, default: "", trim: true },
    selectedAnswer: { type: String, default: "", trim: true },
    difficulty: { type: String, default: "Unknown", trim: true },
    timeSpentSeconds: { type: Number, default: 0, min: 0 },
    notes: { type: [String], default: [] },
    // Legacy single-note field kept for backward compatibility.
    note: { type: String, default: "", trim: true, maxlength: 2000 },
    why: { type: String, default: "", trim: true, maxlength: 2000 },
  },
  { _id: false },
);

const AttemptSchema = new mongoose.Schema({
  subject: { type: String, required: true, trim: true },
  topic: { type: String, required: true, trim: true },
  subtopic: { type: String, default: null, trim: true },
  difficulty: { type: String, default: "Unknown", trim: true },
  dateValue: { type: String, default: null },
  total: { type: Number, required: true, min: 0 },
  correct: { type: Number, required: true, min: 0 },
  incorrect: { type: Number, required: true, min: 0 },
  skipped: { type: Number, required: true, min: 0 },
  accuracy: { type: Number, default: 0, min: 0 },
  allottedTimeSeconds: { type: Number, default: 0, min: 0 },
  attemptKey: {
    type: String,
    required: true,
    trim: true,
  },
  correctDetails: { type: [AttemptQuestionSchema], default: [] },
  incorrectDetails: { type: [AttemptQuestionSchema], default: [] },
  skippedDetails: { type: [AttemptQuestionSchema], default: [] },
  deletedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

AttemptSchema.index({ attemptKey: 1 }, { unique: true, sparse: true });
AttemptSchema.index({ deletedAt: 1, createdAt: -1 });

const Attempt = mongoose.model("Attempt", AttemptSchema);

const SyllabusTopicNoteSchema = new mongoose.Schema({
  noteKey: { type: String, required: true, trim: true, unique: true },
  subject: { type: String, required: true, trim: true },
  topicKey: { type: String, required: true, trim: true },
  topicLabel: { type: String, required: true, trim: true },
  path: { type: [String], default: [] },
  notes: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

SyllabusTopicNoteSchema.index({ subject: 1, topicKey: 1 }, { unique: true });

const SyllabusTopicNote = mongoose.model(
  "SyllabusTopicNote",
  SyllabusTopicNoteSchema,
);

const SRS_INTERVALS = [1, 3, 7, 21, 45];
const PRIORITY_LEVELS = ["Critical", "High", "Medium", "Stable"];

const RevisionHistorySchema = new mongoose.Schema(
  {
    reviewedAt: { type: Date, required: true },
    outcome: { type: String, enum: ["correct", "wrong"], required: true },
    intervalDays: { type: Number, default: 1, min: 1 },
    retentionScoreBefore: { type: Number, default: 0, min: 0, max: 100 },
    retentionScoreAfter: { type: Number, default: 0, min: 0, max: 100 },
    revisionStrengthAfter: { type: Number, default: 0, min: 0 },
    nextReviewDate: { type: Date, required: true },
  },
  { _id: false },
);

const RevisionTopicSchema = new mongoose.Schema({
  topicKey: { type: String, required: true, trim: true, unique: true },
  subject: { type: String, required: true, trim: true },
  topic: { type: String, required: true, trim: true },
  attemptsCount: { type: Number, default: 0, min: 0 },
  totalQuestions: { type: Number, default: 0, min: 0 },
  correctCount: { type: Number, default: 0, min: 0 },
  incorrectCount: { type: Number, default: 0, min: 0 },
  skippedCount: { type: Number, default: 0, min: 0 },
  accuracy: { type: Number, default: 0, min: 0, max: 100 },
  repeatedMistakeCount: { type: Number, default: 0, min: 0 },
  lastAttemptAt: { type: Date, default: null },
  lastReviewedAt: { type: Date, default: null },
  nextReviewDate: { type: Date, default: null },
  revisionStrength: {
    type: Number,
    default: 0,
    min: 0,
    max: SRS_INTERVALS.length - 1,
  },
  retentionScore: { type: Number, default: 0, min: 0, max: 100 },
  decayScore: { type: Number, default: 0, min: 0, max: 100 },
  overdueDays: { type: Number, default: 0, min: 0 },
  priority: { type: String, enum: PRIORITY_LEVELS, default: "Medium" },
  reviewHistory: { type: [RevisionHistorySchema], default: [] },
  lastCalculatedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["active", "archived"], default: "active" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

RevisionTopicSchema.index({
  priority: 1,
  nextReviewDate: 1,
  retentionScore: 1,
});
RevisionTopicSchema.index({ status: 1, nextReviewDate: 1 });
RevisionTopicSchema.index({ subject: 1, topic: 1 });

const RevisionTopic = mongoose.model("RevisionTopic", RevisionTopicSchema);
const { ConsistencyDay, ConsistencySnapshot, StreakHistory } =
  createConsistencyModels(mongoose);
const { SyllabusNodeProgress, SyllabusProgressSnapshot } =
  createSyllabusModels(mongoose);

const INVALID_SUBJECT_TOPIC_VALUES = new Set([
  "unknown",
  "unknown topic",
  "null",
  "undefined",
  "n/a",
]);

function normalizeString(value) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ");
}

function normalizeIsoDateValue(value) {
  const normalized = normalizeString(value);
  if (!normalized) return null;
  return ISO_DATE_PATTERN.test(normalized) ? normalized : null;
}

function normalizeDifficulty(value) {
  const normalized = normalizeString(value);
  if (!normalized) return "Unknown";
  const lower = normalized.toLowerCase();
  if (lower === "easy") return "Easy";
  if (lower === "medium" || lower === "mid") return "Medium";
  if (lower === "hard") return "Hard";
  return ALLOWED_DIFFICULTIES.has(normalized) ? normalized : "Unknown";
}

function normalizeSubject(value) {
  const normalized = normalizeString(value);
  if (!normalized) return "";
  return SUBJECT_ALIASES[normalized] || normalized;
}

function normalizeQuestionText(value) {
  if (typeof value !== "string") return "";

  const normalized = value
    .replace(/\u00a0/g, " ")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .trim();

  return normalized;
}

function isValidSubjectOrTopic(value) {
  const normalized = normalizeString(value);
  if (!normalized) return false;
  return !INVALID_SUBJECT_TOPIC_VALUES.has(normalized.toLowerCase());
}

function toNonNegativeNumber(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, parsed);
}

function normalizeQueryLimit(value, defaultLimit = 100, maxLimit = 500) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return defaultLimit;
  return Math.min(maxLimit, parsed);
}

function parseBooleanQuery(value) {
  const normalized = normalizeString(value).toLowerCase();
  if (!normalized) return false;
  return (
    normalized === "1" ||
    normalized === "true" ||
    normalized === "yes" ||
    normalized === "y"
  );
}

function toDate(value) {
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function addDays(dateValue, days) {
  const base = toDate(dateValue) || new Date();
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function differenceInDays(laterValue, earlierValue) {
  const later = toDate(laterValue);
  const earlier = toDate(earlierValue);
  if (!later || !earlier) return 0;
  const milliseconds = later.getTime() - earlier.getTime();
  return Math.max(0, Math.floor(milliseconds / 86_400_000));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round2(value) {
  return Number(Number(value || 0).toFixed(2));
}

function buildTopicKey(subject, topic) {
  return `${normalizeSubject(subject)}::${normalizeString(topic)}`;
}

function buildSyllabusTopicNoteKey(subject, topicKey) {
  return `${normalizeString(subject)}::${normalizeString(topicKey)}`;
}

function normalizeQuestionNote(value) {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n?/g, "\n").trim().slice(0, 2000);
}

function normalizeQuestionNotes(value) {
  if (!Array.isArray(value)) return [];

  const normalizedNotes = value
    .map((noteValue) => normalizeQuestionNote(noteValue))
    .filter(Boolean);

  return Array.from(new Set(normalizedNotes)).slice(0, 50);
}

function normalizeSyllabusPath(value) {
  if (!Array.isArray(value)) return [];

  const normalizedPath = value
    .map((entry) => normalizeString(entry))
    .filter(Boolean);

  return Array.from(new Set(normalizedPath)).slice(0, 20);
}

function normalizeDetailNotes(detail) {
  const notes = normalizeQuestionNotes(detail && detail.notes);
  if (notes.length > 0) return notes;

  const legacyNote = normalizeQuestionNote(detail && detail.note);
  return legacyNote ? [legacyNote] : [];
}

function normalizeOptions(options) {
  if (!Array.isArray(options)) return [];

  const cleaned = options
    .map((option) => normalizeString(option))
    .filter(Boolean);

  const deduped = Array.from(new Set(cleaned));
  return deduped.slice(0, 4);
}

function normalizeQuestionDetail(rawDetail, fallbackSelectedAnswer = "") {
  if (!rawDetail || typeof rawDetail !== "object") return null;

  const questionId = normalizeString(rawDetail.questionId);
  const question = normalizeQuestionText(rawDetail.question);
  if (!question) return null;

  const notes = normalizeDetailNotes(rawDetail);

  return {
    questionId,
    question,
    options: normalizeOptions(rawDetail.options),
    correctAnswer: normalizeString(rawDetail.correctAnswer),
    selectedAnswer: normalizeString(
      rawDetail.selectedAnswer || fallbackSelectedAnswer,
    ),
    difficulty: normalizeDifficulty(rawDetail.difficulty),
    timeSpentSeconds: toNonNegativeNumber(rawDetail.timeSpentSeconds),
    notes,
    note: notes[0] || "",
    why: normalizeQuestionNote(rawDetail.why),
  };
}

function dedupeQuestionDetails(details) {
  const map = new Map();

  for (const detail of details) {
    if (!detail) continue;
    const key = detail.questionId
      ? `id::${detail.questionId}`
      : `${detail.question}::${detail.selectedAnswer}::${detail.correctAnswer}`;
    if (!map.has(key)) {
      map.set(key, detail);
      continue;
    }

    const existingDetail = map.get(key);
    const mergedNotes = Array.from(
      new Set([
        ...normalizeDetailNotes(existingDetail),
        ...normalizeDetailNotes(detail),
      ]),
    ).slice(0, 50);

    const existingSignature = normalizeDetailNotes(existingDetail).join("::");
    const mergedSignature = mergedNotes.join("::");
    if (existingSignature !== mergedSignature) {
      map.set(key, {
        ...existingDetail,
        notes: mergedNotes,
        note: mergedNotes[0] || "",
        why:
          normalizeQuestionNote(detail.why) ||
          normalizeQuestionNote(existingDetail.why),
      });
    } else {
      const nextWhy =
        normalizeQuestionNote(existingDetail.why) ||
        normalizeQuestionNote(detail.why);
      if (nextWhy !== normalizeQuestionNote(existingDetail.why)) {
        map.set(key, {
          ...existingDetail,
          why: nextWhy,
        });
      }
    }
  }

  return Array.from(map.values());
}

function clampQuestionDetails(details, maxCount) {
  if (!Array.isArray(details)) return [];
  const count = toNonNegativeNumber(maxCount);
  return details.slice(0, count);
}

function normalizeAnswerComparison(value) {
  return normalizeString(value).toLowerCase();
}

function isSameAnswer(firstAnswer, secondAnswer) {
  const first = normalizeAnswerComparison(firstAnswer);
  const second = normalizeAnswerComparison(secondAnswer);
  return first.length > 0 && second.length > 0 && first === second;
}

function filterOutCorrectlyAnsweredDetails(details) {
  if (!Array.isArray(details)) return [];
  return details.filter(
    (detail) => !isSameAnswer(detail.selectedAnswer, detail.correctAnswer),
  );
}

function buildAttemptKey(payload) {
  const quizSignature = normalizeString(payload.quizSignature);

  const stablePayload = {
    quizSignature,
    total: payload.total,
    correct: payload.correct,
    incorrect: payload.incorrect,
    skipped: payload.skipped,
    incorrectDetails: payload.incorrectDetails,
    skippedDetails: payload.skippedDetails,
  };

  return crypto
    .createHash("sha256")
    .update(JSON.stringify(stablePayload))
    .digest("hex");
}

function serializeQuestionDetails(rawDetails) {
  if (!Array.isArray(rawDetails)) return [];

  return dedupeQuestionDetails(
    rawDetails.map((detail) => normalizeQuestionDetail(detail)).filter(Boolean),
  );
}

function serializeAttempt(attempt) {
  const correctDetails = serializeQuestionDetails(attempt.correctDetails);
  const incorrectDetails = serializeQuestionDetails(attempt.incorrectDetails);
  const skippedDetails = serializeQuestionDetails(attempt.skippedDetails).map(
    (detail) => ({
      ...detail,
      selectedAnswer: detail.selectedAnswer || "",
    }),
  );

  const mergedIncorrectDetails = dedupeQuestionDetails([
    ...incorrectDetails,
    ...skippedDetails,
  ]);

  return {
    _id: String(attempt._id),
    subject: normalizeSubject(attempt.subject),
    topic: normalizeString(attempt.topic),
    subtopic: normalizeString(attempt.subtopic) || null,
    difficulty: normalizeDifficulty(attempt.difficulty),
    dateValue: normalizeIsoDateValue(attempt.dateValue),
    total: toNonNegativeNumber(attempt.total),
    correct: toNonNegativeNumber(attempt.correct),
    incorrect: toNonNegativeNumber(attempt.incorrect),
    skipped: toNonNegativeNumber(attempt.skipped),
    accuracy: toNonNegativeNumber(attempt.accuracy),
    allottedTimeSeconds: toNonNegativeNumber(attempt.allottedTimeSeconds),
    correctDetails,
    incorrectDetails: mergedIncorrectDetails,
    skippedDetails,
    deletedAt: attempt.deletedAt || null,
    createdAt: attempt.createdAt,
    updatedAt: attempt.updatedAt,
  };
}

function buildRevisionQuestionKey(detail) {
  return `${normalizeQuestionText(detail && detail.question)}::${normalizeString(
    detail && detail.correctAnswer,
  )}`;
}

function calculateRepeatedMistakeCount(incorrectDetailsCollections) {
  const frequencyMap = new Map();

  for (const detailCollection of incorrectDetailsCollections) {
    const safeCollection = Array.isArray(detailCollection)
      ? detailCollection
      : [];
    for (const detail of safeCollection) {
      const questionKey = buildRevisionQuestionKey(detail);
      if (!questionKey) continue;
      frequencyMap.set(questionKey, (frequencyMap.get(questionKey) || 0) + 1);
    }
  }

  let repeatedMistakeCount = 0;
  frequencyMap.forEach((count) => {
    if (count > 1) repeatedMistakeCount += count - 1;
  });
  return repeatedMistakeCount;
}

function calculateRetentionScore({
  revisionStrength,
  referenceDate,
  accuracy,
  repeatedMistakeCount,
  overdueDays,
}) {
  const daysSinceReference = differenceInDays(new Date(), referenceDate);
  const baseInterval =
    SRS_INTERVALS[clamp(revisionStrength, 0, SRS_INTERVALS.length - 1)] || 1;
  const halfLife = Math.max(1.25, baseInterval * 1.7);
  const exponentialDecay = Math.exp(-daysSinceReference / halfLife) * 100;
  const accuracyBoost = clamp(
    (toNonNegativeNumber(accuracy) - 50) * 0.32,
    -18,
    14,
  );
  const mistakePenalty = clamp(
    toNonNegativeNumber(repeatedMistakeCount) * 5.5,
    0,
    30,
  );
  const overduePenalty = clamp(toNonNegativeNumber(overdueDays) * 7, 0, 32);
  return round2(
    clamp(
      exponentialDecay + accuracyBoost - mistakePenalty - overduePenalty,
      5,
      99,
    ),
  );
}

function calculatePriority({
  accuracy,
  retentionScore,
  overdueDays,
  repeatedMistakeCount,
}) {
  if (overdueDays >= 3 || retentionScore < 35 || accuracy < 45)
    return "Critical";
  if (
    overdueDays >= 1 ||
    retentionScore < 55 ||
    repeatedMistakeCount >= 2 ||
    accuracy < 60
  ) {
    return "High";
  }
  if (retentionScore < 75 || accuracy < 78 || repeatedMistakeCount >= 1)
    return "Medium";
  return "Stable";
}

function serializeRevisionTopic(revisionTopic) {
  const nextReviewDate = toDate(revisionTopic.nextReviewDate);
  const lastReviewedAt = toDate(revisionTopic.lastReviewedAt);
  const lastAttemptAt = toDate(revisionTopic.lastAttemptAt);
  const referenceDate =
    lastReviewedAt || lastAttemptAt || nextReviewDate || new Date();
  const lastReviewOutcome =
    Array.isArray(revisionTopic.reviewHistory) &&
    revisionTopic.reviewHistory.length > 0
      ? revisionTopic.reviewHistory[revisionTopic.reviewHistory.length - 1]
          .outcome
      : null;

  return {
    id: String(revisionTopic._id),
    topicKey: revisionTopic.topicKey,
    subject: revisionTopic.subject,
    topic: revisionTopic.topic,
    attemptsCount: toNonNegativeNumber(revisionTopic.attemptsCount),
    totalQuestions: toNonNegativeNumber(revisionTopic.totalQuestions),
    correctCount: toNonNegativeNumber(revisionTopic.correctCount),
    incorrectCount: toNonNegativeNumber(revisionTopic.incorrectCount),
    skippedCount: toNonNegativeNumber(revisionTopic.skippedCount),
    accuracy: round2(toNonNegativeNumber(revisionTopic.accuracy)),
    repeatedMistakeCount: toNonNegativeNumber(
      revisionTopic.repeatedMistakeCount,
    ),
    lastAttemptAt: lastAttemptAt ? lastAttemptAt.toISOString() : null,
    lastReviewedAt: lastReviewedAt ? lastReviewedAt.toISOString() : null,
    nextReviewDate: nextReviewDate ? nextReviewDate.toISOString() : null,
    revisionStrength: toNonNegativeNumber(revisionTopic.revisionStrength),
    retentionScore: round2(toNonNegativeNumber(revisionTopic.retentionScore)),
    decayScore: round2(toNonNegativeNumber(revisionTopic.decayScore)),
    overdueDays: toNonNegativeNumber(revisionTopic.overdueDays),
    priority: revisionTopic.priority || "Medium",
    reviewHistory: Array.isArray(revisionTopic.reviewHistory)
      ? revisionTopic.reviewHistory.map((entry) => ({
          reviewedAt: toDate(entry.reviewedAt)?.toISOString() || null,
          outcome: entry.outcome,
          intervalDays: toNonNegativeNumber(entry.intervalDays),
          retentionScoreBefore: round2(
            toNonNegativeNumber(entry.retentionScoreBefore),
          ),
          retentionScoreAfter: round2(
            toNonNegativeNumber(entry.retentionScoreAfter),
          ),
          revisionStrengthAfter: toNonNegativeNumber(
            entry.revisionStrengthAfter,
          ),
          nextReviewDate: toDate(entry.nextReviewDate)?.toISOString() || null,
        }))
      : [],
    lastReviewOutcome,
    status: revisionTopic.status || "active",
    daysSinceReference: differenceInDays(new Date(), referenceDate),
  };
}

async function aggregateAttemptTopics() {
  return Attempt.aggregate([
    { $match: { deletedAt: null } },
    {
      $group: {
        _id: {
          subject: "$subject",
          topic: "$topic",
        },
        subject: { $first: "$subject" },
        topic: { $first: "$topic" },
        attemptsCount: { $sum: 1 },
        totalQuestions: { $sum: "$total" },
        correctCount: { $sum: "$correct" },
        incorrectCount: { $sum: "$incorrect" },
        skippedCount: { $sum: "$skipped" },
        accuracy: { $avg: "$accuracy" },
        lastAttemptAt: { $max: "$createdAt" },
        incorrectDetailsCollections: { $push: "$incorrectDetails" },
      },
    },
    {
      $project: {
        _id: 0,
        topicKey: {
          $concat: ["$subject", "::", "$topic"],
        },
        subject: 1,
        topic: 1,
        attemptsCount: 1,
        totalQuestions: 1,
        correctCount: 1,
        incorrectCount: 1,
        skippedCount: 1,
        accuracy: 1,
        lastAttemptAt: 1,
        incorrectDetailsCollections: 1,
      },
    },
    { $sort: { accuracy: 1, attemptsCount: -1, subject: 1, topic: 1 } },
  ]);
}

function buildRevisionDocumentFromAggregate(aggregateRow, existingRevision) {
  const safeAccuracy = round2(toNonNegativeNumber(aggregateRow.accuracy));
  const attemptsCount = toNonNegativeNumber(aggregateRow.attemptsCount);
  const totalQuestions = toNonNegativeNumber(aggregateRow.totalQuestions);
  const correctCount = toNonNegativeNumber(aggregateRow.correctCount);
  const incorrectCount = toNonNegativeNumber(aggregateRow.incorrectCount);
  const skippedCount = toNonNegativeNumber(aggregateRow.skippedCount);
  const repeatedMistakeCount = calculateRepeatedMistakeCount(
    aggregateRow.incorrectDetailsCollections,
  );
  const revisionStrength = clamp(
    toNonNegativeNumber(existingRevision && existingRevision.revisionStrength),
    0,
    SRS_INTERVALS.length - 1,
  );
  const lastReviewedAt = toDate(
    existingRevision && existingRevision.lastReviewedAt,
  );
  const lastAttemptAt = toDate(aggregateRow.lastAttemptAt);
  const baselineDate = lastReviewedAt || lastAttemptAt || new Date();

  let nextReviewDate = toDate(
    existingRevision && existingRevision.nextReviewDate,
  );
  if (!nextReviewDate) {
    nextReviewDate = addDays(
      lastAttemptAt || new Date(),
      SRS_INTERVALS[revisionStrength] || 1,
    );
  }

  const overdueDays = nextReviewDate
    ? differenceInDays(new Date(), nextReviewDate)
    : 0;
  const retentionScore = calculateRetentionScore({
    revisionStrength,
    referenceDate: baselineDate,
    accuracy: safeAccuracy,
    repeatedMistakeCount,
    overdueDays,
  });
  const decayScore = round2(clamp(100 - retentionScore, 1, 100));
  const priority = calculatePriority({
    accuracy: safeAccuracy,
    retentionScore,
    overdueDays,
    repeatedMistakeCount,
  });

  return {
    topicKey:
      aggregateRow.topicKey ||
      buildTopicKey(aggregateRow.subject, aggregateRow.topic),
    subject: normalizeSubject(aggregateRow.subject),
    topic: normalizeString(aggregateRow.topic),
    attemptsCount,
    totalQuestions,
    correctCount,
    incorrectCount,
    skippedCount,
    accuracy: safeAccuracy,
    repeatedMistakeCount,
    lastAttemptAt,
    lastReviewedAt,
    nextReviewDate,
    revisionStrength,
    retentionScore,
    decayScore,
    overdueDays,
    priority,
    reviewHistory:
      existingRevision && Array.isArray(existingRevision.reviewHistory)
        ? existingRevision.reviewHistory.slice(-30)
        : [],
    lastCalculatedAt: new Date(),
    status: "active",
    updatedAt: new Date(),
  };
}

async function syncRevisionTopics() {
  const [topicAggregates, existingRevisions] = await Promise.all([
    aggregateAttemptTopics(),
    RevisionTopic.find({ status: { $in: ["active", "archived"] } }).lean(),
  ]);

  const existingRevisionMap = new Map(
    existingRevisions.map((revision) => [revision.topicKey, revision]),
  );

  const bulkOperations = topicAggregates.map((aggregateRow) => {
    const nextRevisionDocument = buildRevisionDocumentFromAggregate(
      aggregateRow,
      existingRevisionMap.get(aggregateRow.topicKey),
    );

    return {
      updateOne: {
        filter: { topicKey: nextRevisionDocument.topicKey },
        update: {
          $set: nextRevisionDocument,
          $setOnInsert: { createdAt: new Date() },
        },
        upsert: true,
      },
    };
  });

  const activeTopicKeys = new Set(topicAggregates.map((row) => row.topicKey));
  existingRevisions.forEach((revision) => {
    if (!activeTopicKeys.has(revision.topicKey)) {
      bulkOperations.push({
        updateOne: {
          filter: { topicKey: revision.topicKey },
          update: {
            $set: {
              status: "archived",
              updatedAt: new Date(),
              lastCalculatedAt: new Date(),
            },
          },
        },
      });
    }
  });

  if (bulkOperations.length > 0) {
    await RevisionTopic.bulkWrite(bulkOperations, { ordered: false });
  }
}

function buildRevisionDashboardPayload(revisionTopics) {
  const safeTopics = revisionTopics.map((entry) =>
    serializeRevisionTopic(entry),
  );
  const today = startOfToday();

  const overdueTopics = safeTopics
    .filter(
      (topic) => topic.nextReviewDate && new Date(topic.nextReviewDate) < today,
    )
    .sort(
      (first, second) =>
        second.overdueDays - first.overdueDays ||
        first.retentionScore - second.retentionScore,
    );

  const dueTodayTopics = safeTopics.filter((topic) => {
    if (!topic.nextReviewDate) return false;
    const reviewDate = new Date(topic.nextReviewDate);
    return reviewDate <= addDays(today, 1) && reviewDate >= today;
  });

  const queueTopicsSource =
    dueTodayTopics.length > 0 || overdueTopics.length > 0
      ? [...overdueTopics, ...dueTodayTopics]
      : [...safeTopics]
          .sort((first, second) => {
            const priorityDelta =
              PRIORITY_LEVELS.indexOf(first.priority) -
              PRIORITY_LEVELS.indexOf(second.priority);
            if (priorityDelta !== 0) return priorityDelta;
            return first.retentionScore - second.retentionScore;
          })
          .slice(0, 8);

  const queueTopics = Array.from(
    new Map(queueTopicsSource.map((topic) => [topic.topicKey, topic])).values(),
  )
    .sort((first, second) => {
      const priorityDelta =
        PRIORITY_LEVELS.indexOf(first.priority) -
        PRIORITY_LEVELS.indexOf(second.priority);
      if (priorityDelta !== 0) return priorityDelta;
      return (
        second.overdueDays - first.overdueDays ||
        first.retentionScore - second.retentionScore
      );
    })
    .slice(0, 10);

  const fadingTopics = [...safeTopics]
    .sort(
      (first, second) =>
        first.retentionScore - second.retentionScore ||
        second.decayScore - first.decayScore,
    )
    .slice(0, 6);

  const recentlyStrengthenedTopics = [...safeTopics]
    .filter(
      (topic) =>
        topic.lastReviewedAt &&
        topic.lastReviewOutcome === "correct" &&
        differenceInDays(new Date(), topic.lastReviewedAt) <= 7,
    )
    .sort(
      (first, second) =>
        new Date(second.lastReviewedAt).getTime() -
        new Date(first.lastReviewedAt).getTime(),
    )
    .slice(0, 6);

  const priorityCounts = safeTopics.reduce(
    (accumulator, topic) => {
      accumulator[topic.priority] = (accumulator[topic.priority] || 0) + 1;
      return accumulator;
    },
    { Critical: 0, High: 0, Medium: 0, Stable: 0 },
  );

  const summary = {
    totalTrackedTopics: safeTopics.length,
    dueTodayCount: queueTopics.filter(
      (topic) =>
        topic.nextReviewDate &&
        new Date(topic.nextReviewDate) <= addDays(today, 1),
    ).length,
    overdueCount: overdueTopics.length,
    fadingCount: safeTopics.filter((topic) => topic.retentionScore < 60).length,
    averageRetentionScore:
      safeTopics.length === 0
        ? 0
        : round2(
            safeTopics.reduce((sum, topic) => sum + topic.retentionScore, 0) /
              safeTopics.length,
          ),
    priorityCounts,
  };

  return {
    generatedAt: new Date().toISOString(),
    summary,
    queueTopics,
    fadingTopics,
    overdueTopics: overdueTopics.slice(0, 8),
    recentlyStrengthenedTopics,
    allTopics: safeTopics,
  };
}

app.post("/api/attempt", async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const subject = normalizeSubject(body.subject);
    const topic = normalizeString(body.topic);
    const subtopic = normalizeString(body.subtopic) || null;

    if (!isValidSubjectOrTopic(subject) || !isValidSubjectOrTopic(topic)) {
      return res.status(400).json({
        error: "Subject and topic are required before saving an attempt.",
      });
    }

    const requestedTotal = toNonNegativeNumber(body.total);
    const requestedCorrect = toNonNegativeNumber(body.correct);
    const requestedIncorrect = toNonNegativeNumber(body.incorrect);
    const requestedSkipped = toNonNegativeNumber(body.skipped);

    const correctDetails = Array.isArray(body.correctDetails)
      ? body.correctDetails
      : [];
    const incorrectDetails = Array.isArray(body.incorrectDetails)
      ? body.incorrectDetails
      : [];
    const skippedDetails = Array.isArray(body.skippedDetails)
      ? body.skippedDetails
      : [];

    let normalizedCorrectDetails = dedupeQuestionDetails(
      correctDetails
        .map((detail) => normalizeQuestionDetail(detail))
        .filter(Boolean),
    );
    let normalizedIncorrectDetails = dedupeQuestionDetails(
      incorrectDetails
        .map((detail) => normalizeQuestionDetail(detail))
        .filter(Boolean),
    );
    let normalizedSkippedDetails = dedupeQuestionDetails(
      skippedDetails
        .map((detail) => normalizeQuestionDetail(detail, ""))
        .filter(Boolean),
    ).map((detail) => ({
      ...detail,
      selectedAnswer: "",
    }));
    normalizedIncorrectDetails = filterOutCorrectlyAnsweredDetails(
      normalizedIncorrectDetails,
    );

    let correct = normalizedCorrectDetails.length;
    let incorrect = normalizedIncorrectDetails.length;
    let skipped = normalizedSkippedDetails.length;
    const derivedTotal = correct + incorrect + skipped;
    const requestedBreakdownTotal =
      requestedCorrect + requestedIncorrect + requestedSkipped;
    const hasConsistentRequestedBreakdown =
      requestedTotal > 0 && requestedBreakdownTotal === requestedTotal;

    if (hasConsistentRequestedBreakdown) {
      // Client-provided score counters are the authoritative breakdown.
      correct = requestedCorrect;
      incorrect = requestedIncorrect;
      skipped = requestedSkipped;

      // Avoid over-collected DOM details from inflating UI review counts.
      normalizedCorrectDetails = clampQuestionDetails(
        normalizedCorrectDetails,
        requestedCorrect,
      );
      normalizedIncorrectDetails = clampQuestionDetails(
        normalizedIncorrectDetails,
        requestedIncorrect,
      );
      normalizedSkippedDetails = clampQuestionDetails(
        normalizedSkippedDetails,
        requestedSkipped,
      );
    } else if (derivedTotal === 0) {
      // Fallback when details were not captured at all.
      correct = requestedCorrect;
      incorrect = requestedIncorrect;
      skipped = requestedSkipped;
    }

    let total = correct + incorrect + skipped;

    if (requestedTotal > 0 && total === 0) {
      // Preserve score visibility even if details were not captured.
      total = requestedTotal;
      skipped = Math.max(0, requestedTotal - correct - incorrect);
      total = correct + incorrect + skipped;
    }

    if (requestedTotal > 0 && total !== requestedTotal) {
      console.warn(
        `Score mismatch corrected on backend. incoming total=${requestedTotal}, derived total=${total}.`,
      );
    }

    if (total <= 0) {
      return res.status(400).json({ error: "Unable to save empty attempt." });
    }

    const accuracy = Number(((correct / total) * 100).toFixed(2));

    const attemptKey =
      normalizeString(body.attemptKey) ||
      buildAttemptKey({
        quizSignature: normalizeString(body.quizSignature),
        total,
        correct,
        incorrect,
        skipped,
        incorrectDetails: normalizedIncorrectDetails,
        correctDetails: normalizedCorrectDetails,
        skippedDetails: normalizedSkippedDetails,
      });

    const attemptDocument = {
      subject,
      topic,
      subtopic,
      difficulty: normalizeDifficulty(body.difficulty),
      dateValue: normalizeIsoDateValue(body.dateValue),
      total,
      correct,
      incorrect,
      skipped,
      accuracy,
      allottedTimeSeconds: toNonNegativeNumber(body.allottedTimeSeconds),
      attemptKey,
      correctDetails: normalizedCorrectDetails,
      incorrectDetails: normalizedIncorrectDetails,
      skippedDetails: normalizedSkippedDetails,
      deletedAt: null,
      updatedAt: new Date(),
    };

    const syncPlannerTestProgress = async () => {
      try {
        const currentWeekStr = getStartOfWeekStr(); // 🛡️ PRO FIX: Removed duplicate variables
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        const WeeklyPlan = require("./models/WeeklyPlan");

        const activePlan = await WeeklyPlan.findOne({
          weekStartDate: currentWeekStr,
        });
        if (!activePlan) return;

        let planUpdated = false;
        activePlan.days.forEach((dayPlan) => {
          if (dayPlan.dateKey !== todayStr) return;

          if (Array.isArray(dayPlan.mcqTasks)) {
            dayPlan.mcqTasks.forEach((task) => {
              if (
                task.subject &&
                task.subject.toLowerCase() === subject.toLowerCase()
              ) {
                task.completed = Math.min(
                  Number(task.target || total),
                  Number(task.completed || 0) + total,
                );
                task.accuracy = `${accuracy}%`;
                planUpdated = true;
              }
            });
          }

          if (Array.isArray(dayPlan.testMissions)) {
            dayPlan.testMissions.forEach((mission) => {
              const sameSubject =
                mission.subject &&
                String(mission.subject).toLowerCase() === subject.toLowerCase();
              const sameChapter =
                !mission.chapterSlug ||
                !topic ||
                String(mission.chapterSlug).toLowerCase() ===
                  topic.toLowerCase() ||
                String(mission.chapterTitle || "").toLowerCase() ===
                  topic.toLowerCase();

              if (!sameSubject || !sameChapter) return;

              const totalQuestions = Number(mission.totalQuestions || total);
              const completedQuestions = Math.min(
                totalQuestions,
                Number(mission.progress?.completedQuestions || 0) + total,
              );

              mission.progress = {
                ...(mission.progress || {}),
                completedQuestions,
                accuracy,
                completionPercent:
                  totalQuestions > 0
                    ? Math.round((completedQuestions / totalQuestions) * 100)
                    : 0,
                status:
                  totalQuestions > 0 && completedQuestions >= totalQuestions
                    ? "completed"
                    : completedQuestions > 0
                      ? "in_progress"
                      : "not_started",
              };
              planUpdated = true;
            });
          }
        });

        if (planUpdated) {
          activePlan.markModified("days");
          await activePlan.save();
        }
      } catch (syncErr) {
        console.error("Planner MCQ Real-time Sync Failed:", syncErr.message);
      }
    };
    const existingAttempt = await Attempt.findOne({ attemptKey })
      .select("_id deletedAt")
      .lean();

    if (existingAttempt && existingAttempt.deletedAt) {
      await Attempt.updateOne(
        { _id: existingAttempt._id },
        {
          $set: { ...attemptDocument, deletedAt: null, updatedAt: new Date() },
        },
      );
      syncRevisionTopics().catch((syncError) => {
        console.error("Revision Sync Error:", syncError.message);
      });
      syncPlannerTestProgress();
      return res.status(200).json({
        message: "Attempt restored from recycle bin.",
        id: existingAttempt._id,
        duplicate: false,
        restored: true,
      });
    }

    if (existingAttempt && !existingAttempt.deletedAt) {
      return res.status(200).json({
        message: "Attempt already exists; duplicate write skipped.",
        id: existingAttempt._id,
        duplicate: true,
      });
    }

    const createdAttempt = await Attempt.create(attemptDocument);
    syncRevisionTopics().catch((syncError) => {
      console.error("Revision Sync Error:", syncError.message);
    });
    syncPlannerTestProgress();

    return res.status(201).json({
      message: "Quiz data saved successfully",
      id: createdAttempt._id || null,
      duplicate: false,
      restored: false,
    });
  } catch (err) {
    if (err && err.code === 11000) {
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const fallbackAttemptKey =
        normalizeString(body.attemptKey) ||
        buildAttemptKey({
          quizSignature: normalizeString(body.quizSignature),
          total: toNonNegativeNumber(body.total),
          correct: toNonNegativeNumber(body.correct),
          incorrect: toNonNegativeNumber(body.incorrect),
          skipped: toNonNegativeNumber(body.skipped),
          correctDetails: dedupeQuestionDetails(
            (Array.isArray(body.correctDetails) ? body.correctDetails : [])
              .map((detail) => normalizeQuestionDetail(detail))
              .filter(Boolean),
          ),
          incorrectDetails: dedupeQuestionDetails(
            (Array.isArray(body.incorrectDetails) ? body.incorrectDetails : [])
              .map((detail) => normalizeQuestionDetail(detail))
              .filter(Boolean),
          ),
          skippedDetails: dedupeQuestionDetails(
            (Array.isArray(body.skippedDetails) ? body.skippedDetails : [])
              .map((detail) => normalizeQuestionDetail(detail, ""))
              .filter(Boolean),
          ),
        });

      const duplicateAttempt = await Attempt.findOne({
        attemptKey: fallbackAttemptKey,
      })
        .select("_id deletedAt")
        .lean();

      if (duplicateAttempt && duplicateAttempt.deletedAt) {
        await Attempt.updateOne(
          { _id: duplicateAttempt._id },
          {
            $set: {
              deletedAt: null,
              updatedAt: new Date(),
            },
          },
        );
        syncRevisionTopics().catch((syncError) => {
          console.error("Revision Sync Error:", syncError.message);
        });
        return res.status(200).json({
          message: "Attempt restored from recycle bin.",
          id: duplicateAttempt._id,
          duplicate: false,
          restored: true,
        });
      }

      return res.status(200).json({
        message: "Attempt already exists; duplicate write skipped.",
        id: duplicateAttempt ? duplicateAttempt._id : null,
        duplicate: true,
      });
    }

    console.error("Save Error:", err.message);
    return res
      .status(500)
      .json({ error: "Failed to save attempt to database." });
  }
});

app.get("/api/attempt", async (req, res) => {
  try {
    const limit = normalizeQueryLimit(req.query.limit, 100, 500);
    const includeDeleted = parseBooleanQuery(req.query.includeDeleted);
    const onlyDeleted = parseBooleanQuery(req.query.onlyDeleted);
    const findFilter = {};

    if (onlyDeleted) {
      findFilter.deletedAt = { $ne: null };
    } else if (!includeDeleted) {
      findFilter.deletedAt = null;
    }

    const data = await Attempt.find(findFilter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit)
      .lean();
    res.json(data.map((attempt) => serializeAttempt(attempt)));
  } catch (err) {
    console.error("Fetch Error:", err.message);
    res.status(500).json({ error: "Failed to fetch data." });
  }
});

app.get("/api/attempt/recycle-bin", async (req, res) => {
  try {
    const limit = normalizeQueryLimit(req.query.limit, 100, 500);
    const data = await Attempt.find({ deletedAt: { $ne: null } })
      .sort({ deletedAt: -1, _id: -1 })
      .limit(limit)
      .lean();

    return res.json(data.map((attempt) => serializeAttempt(attempt)));
  } catch (err) {
    console.error("Recycle Bin Fetch Error:", err.message);
    return res.status(500).json({ error: "Failed to fetch recycle bin data." });
  }
});

app.patch("/api/attempt/:attemptId", async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const { attemptId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({ error: "Invalid attempt id." });
    }

    const subject = normalizeSubject(body.subject);
    const topic = normalizeString(body.topic);
    const subtopic = normalizeString(body.subtopic) || null;
    const difficulty = normalizeDifficulty(body.difficulty);

    if (!isValidSubjectOrTopic(subject) || !isValidSubjectOrTopic(topic)) {
      return res.status(400).json({
        error: "Subject and topic are required before classifying an attempt.",
      });
    }

    const updated = await Attempt.findOneAndUpdate(
      { _id: attemptId, deletedAt: null },
      {
        $set: {
          subject,
          topic,
          subtopic,
          difficulty,
          updatedAt: new Date(),
        },
      },
      { new: true },
    ).lean();

    if (!updated) {
      return res.status(404).json({ error: "Attempt not found." });
    }

    syncRevisionTopics().catch((syncError) => {
      console.error("Revision Sync Error:", syncError.message);
    });

    return res.json({
      message: "Attempt classification updated.",
      data: serializeAttempt(updated),
    });
  } catch (err) {
    console.error("Classify Error:", err.message);
    return res.status(500).json({ error: "Failed to classify attempt." });
  }
});

async function handleAttemptQuestionNoteUpdate(req, res) {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const { attemptId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({ error: "Invalid attempt id." });
    }

    const targetQuestion = normalizeQuestionText(body.question);
    const targetSelectedAnswer = normalizeString(body.selectedAnswer);
    const targetCorrectAnswer = normalizeString(body.correctAnswer);
    const note = normalizeQuestionNote(body.note);
    const field = normalizeString(body.field).toLowerCase() || "note";
    const mode = normalizeString(body.mode).toLowerCase() || "replace";
    const parsedNoteIndex = Number(body.noteIndex);
    const noteIndex = Number.isInteger(parsedNoteIndex)
      ? parsedNoteIndex
      : null;
    const allowedModes = new Set(["add", "edit", "replace", "delete"]);

    if (!["note", "why"].includes(field)) {
      return res.status(400).json({ error: "Invalid annotation field." });
    }

    if (!targetQuestion) {
      return res
        .status(400)
        .json({ error: "Question text is required to save note." });
    }

    if (!allowedModes.has(mode)) {
      return res.status(400).json({ error: "Invalid note mode." });
    }

    if ((mode === "add" || mode === "edit") && !note) {
      return res.status(400).json({ error: "Note is required." });
    }

    if (
      field === "note" &&
      mode === "edit" &&
      (noteIndex === null || noteIndex < 0)
    ) {
      return res.status(400).json({ error: "Invalid note index." });
    }

    if (field === "why" && !["replace", "delete", "edit"].includes(mode)) {
      return res.status(400).json({ error: "Invalid why mode." });
    }

    const attempt = await Attempt.findOne({ _id: attemptId, deletedAt: null });
    if (!attempt) {
      return res.status(404).json({ error: "Attempt not found." });
    }

    let hasUpdatedQuestion = false;
    let hasInvalidNoteIndex = false;
    const updateQuestionNotes = (details, forceEmptySelected = false) => {
      if (!Array.isArray(details)) return [];

      return details.map((rawDetail) => {
        const detail = normalizeQuestionDetail(
          rawDetail,
          forceEmptySelected ? "" : undefined,
        );
        if (!detail) return rawDetail;

        const targetQuestionId = normalizeString(body.questionId);
        const isTargetMatch = targetQuestionId
          ? detail.questionId === targetQuestionId
          : detail.question === targetQuestion &&
            normalizeString(detail.selectedAnswer) === targetSelectedAnswer &&
            normalizeString(detail.correctAnswer) === targetCorrectAnswer;

        if (!isTargetMatch) return detail;
        if (field === "why") {
          hasUpdatedQuestion = true;
          return {
            ...detail,
            selectedAnswer: forceEmptySelected ? "" : detail.selectedAnswer,
            why: mode === "delete" ? "" : note,
          };
        }

        const currentNotes = normalizeDetailNotes(detail);
        let nextNotes = currentNotes;

        if (mode === "add") {
          nextNotes = Array.from(new Set([...currentNotes, note])).slice(0, 50);
        } else if (mode === "edit") {
          if (noteIndex === null || noteIndex >= currentNotes.length) {
            hasInvalidNoteIndex = true;
            return detail;
          }
          nextNotes = currentNotes.map((entry, index) =>
            index === noteIndex ? note : entry,
          );
        } else if (mode === "delete") {
          if (noteIndex === null) {
            nextNotes = [];
          } else if (noteIndex < 0 || noteIndex >= currentNotes.length) {
            hasInvalidNoteIndex = true;
            return detail;
          } else {
            nextNotes = currentNotes.filter(
              (_entry, index) => index !== noteIndex,
            );
          }
        } else {
          nextNotes = note ? [note] : [];
        }

        hasUpdatedQuestion = true;
        return {
          ...detail,
          selectedAnswer: forceEmptySelected ? "" : detail.selectedAnswer,
          notes: nextNotes,
          note: nextNotes[0] || "",
        };
      });
    };

    const nextIncorrectDetails = dedupeQuestionDetails(
      updateQuestionNotes(attempt.incorrectDetails),
    );
    const nextSkippedDetails = dedupeQuestionDetails(
      updateQuestionNotes(attempt.skippedDetails, true),
    ).map((detail) => ({
      ...detail,
      selectedAnswer: "",
    }));

    if (hasInvalidNoteIndex) {
      return res.status(400).json({ error: "Invalid note index." });
    }

    if (!hasUpdatedQuestion) {
      return res.status(404).json({ error: "Question detail not found." });
    }

    attempt.incorrectDetails = nextIncorrectDetails;
    attempt.skippedDetails = nextSkippedDetails;
    attempt.updatedAt = new Date();
    await attempt.save();

    return res.json({
      message:
        field === "why" ? "Question reason saved." : "Question note saved.",
      data: serializeAttempt(attempt),
    });
  } catch (err) {
    console.error("Question Note Error:", err.message);
    return res.status(500).json({ error: "Failed to save question note." });
  }
}

app.patch(
  "/api/attempt/:attemptId/question-note",
  handleAttemptQuestionNoteUpdate,
);
app.post(
  "/api/attempt/:attemptId/question-note",
  handleAttemptQuestionNoteUpdate,
);
app.patch("/api/attempt/:attemptId/note", handleAttemptQuestionNoteUpdate);
app.post("/api/attempt/:attemptId/note", handleAttemptQuestionNoteUpdate);

app.delete("/api/attempt/:attemptId", async (req, res) => {
  try {
    const { attemptId } = req.params;
    const attemptKeyFromQuery = normalizeString(req.query.attemptKey);
    const attemptKeyFromParam = mongoose.Types.ObjectId.isValid(attemptId)
      ? ""
      : normalizeString(attemptId);

    let attemptFilter;
    if (attemptKeyFromQuery) {
      // Uses the same idempotent key index used by save.
      attemptFilter = { attemptKey: attemptKeyFromQuery };
    } else if (mongoose.Types.ObjectId.isValid(attemptId)) {
      attemptFilter = { _id: attemptId };
    } else if (attemptKeyFromParam) {
      attemptFilter = { attemptKey: attemptKeyFromParam };
    } else {
      return res.status(400).json({ error: "Invalid attempt id." });
    }

    const moveToRecycleBinResult = await Attempt.updateOne(
      { ...attemptFilter, deletedAt: null },
      { $set: { deletedAt: new Date(), updatedAt: new Date() } },
    );

    if (moveToRecycleBinResult.modifiedCount) {
      syncRevisionTopics().catch((syncError) => {
        console.error("Revision Sync Error:", syncError.message);
      });
      return res.json({ message: "Attempt moved to recycle bin." });
    }

    const existingAttempt = await Attempt.findOne(attemptFilter)
      .select("_id deletedAt")
      .lean();

    if (!existingAttempt) {
      return res.status(404).json({ error: "Attempt not found." });
    }

    if (existingAttempt.deletedAt) {
      return res.json({ message: "Attempt is already in recycle bin." });
    }

    return res
      .status(500)
      .json({ error: "Failed to move attempt to recycle bin." });
  } catch (err) {
    console.error("Delete Error:", err.message);
    return res
      .status(500)
      .json({ error: "Failed to move attempt to recycle bin." });
  }
});

app.post("/api/attempt/:attemptId/restore", async (req, res) => {
  try {
    const { attemptId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({ error: "Invalid attempt id." });
    }

    const restoreResult = await Attempt.updateOne(
      { _id: attemptId, deletedAt: { $ne: null } },
      { $set: { deletedAt: null, updatedAt: new Date() } },
    );

    if (restoreResult.modifiedCount) {
      syncRevisionTopics().catch((syncError) => {
        console.error("Revision Sync Error:", syncError.message);
      });
      return res.json({ message: "Attempt restored from recycle bin." });
    }

    const existingAttempt = await Attempt.findById(attemptId)
      .select("_id deletedAt")
      .lean();
    if (!existingAttempt) {
      return res.status(404).json({ error: "Attempt not found." });
    }

    if (!existingAttempt.deletedAt) {
      return res.json({ message: "Attempt is already active." });
    }

    return res.status(500).json({ error: "Failed to restore attempt." });
  } catch (err) {
    console.error("Restore Error:", err.message);
    return res.status(500).json({ error: "Failed to restore attempt." });
  }
});

async function handlePermanentAttemptDelete(req, res) {
  try {
    const { attemptId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({ error: "Invalid attempt id." });
    }

    const deleteResult = await Attempt.deleteOne({
      _id: attemptId,
      deletedAt: { $ne: null },
    });

    if (deleteResult.deletedCount) {
      syncRevisionTopics().catch((syncError) => {
        console.error("Revision Sync Error:", syncError.message);
      });
      return res.json({ message: "Attempt permanently deleted." });
    }

    const existingAttempt = await Attempt.findById(attemptId)
      .select("_id deletedAt")
      .lean();

    if (!existingAttempt) {
      return res.status(404).json({ error: "Attempt not found." });
    }

    if (!existingAttempt.deletedAt) {
      return res.status(400).json({
        error: "Only recycle bin attempts can be permanently deleted.",
      });
    }

    return res
      .status(500)
      .json({ error: "Failed to permanently delete attempt." });
  } catch (err) {
    console.error("Permanent Delete Error:", err.message);
    return res
      .status(500)
      .json({ error: "Failed to permanently delete attempt." });
  }
}

app.delete("/api/attempt/:attemptId/permanent", handlePermanentAttemptDelete);
app.post("/api/attempt/:attemptId/permanent", handlePermanentAttemptDelete);
app.delete(
  "/api/attempt/:attemptId/permanent-delete",
  handlePermanentAttemptDelete,
);
app.delete("/api/attempt/:attemptId/hard-delete", handlePermanentAttemptDelete);

app.get("/api/revision/dashboard", async (_req, res) => {
  try {
    await syncRevisionTopics();
    const revisionTopics = await RevisionTopic.find({ status: "active" })
      .sort({ nextReviewDate: 1, retentionScore: 1, accuracy: 1 })
      .lean();

    return res.json({
      data: buildRevisionDashboardPayload(revisionTopics),
    });
  } catch (err) {
    console.error("Revision Dashboard Error:", err.message);
    return res
      .status(500)
      .json({ error: "Failed to build revision dashboard." });
  }
});

app.get("/api/revision/topics", async (req, res) => {
  try {
    const limit = normalizeQueryLimit(req.query.limit, 50, 200);
    await syncRevisionTopics();
    const revisionTopics = await RevisionTopic.find({ status: "active" })
      .sort({ priority: 1, nextReviewDate: 1, retentionScore: 1 })
      .limit(limit)
      .lean();

    return res.json({
      data: revisionTopics.map((topic) => serializeRevisionTopic(topic)),
    });
  } catch (err) {
    console.error("Revision Topics Error:", err.message);
    return res.status(500).json({ error: "Failed to fetch revision topics." });
  }
});

app.post("/api/revision/:revisionId/review", async (req, res) => {
  try {
    const { revisionId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(revisionId)) {
      return res.status(400).json({ error: "Invalid revision id." });
    }

    const body = req.body && typeof req.body === "object" ? req.body : {};
    const outcome = normalizeString(body.outcome).toLowerCase();
    if (!["correct", "wrong"].includes(outcome)) {
      return res
        .status(400)
        .json({ error: "Review outcome must be correct or wrong." });
    }

    const revisionTopic = await RevisionTopic.findOne({
      _id: revisionId,
      status: "active",
    });
    if (!revisionTopic) {
      return res.status(404).json({ error: "Revision topic not found." });
    }

    const reviewedAt = new Date();
    const retentionScoreBefore = calculateRetentionScore({
      revisionStrength: revisionTopic.revisionStrength,
      referenceDate:
        revisionTopic.lastReviewedAt ||
        revisionTopic.lastAttemptAt ||
        revisionTopic.nextReviewDate,
      accuracy: revisionTopic.accuracy,
      repeatedMistakeCount: revisionTopic.repeatedMistakeCount,
      overdueDays: revisionTopic.nextReviewDate
        ? differenceInDays(reviewedAt, revisionTopic.nextReviewDate)
        : 0,
    });

    const nextStrength =
      outcome === "wrong"
        ? 0
        : clamp(
            toNonNegativeNumber(revisionTopic.revisionStrength) + 1,
            0,
            SRS_INTERVALS.length - 1,
          );
    const nextIntervalDays =
      outcome === "wrong" ? 1 : SRS_INTERVALS[nextStrength];
    const nextReviewDate = addDays(reviewedAt, nextIntervalDays);
    const nextOverdueDays = differenceInDays(reviewedAt, nextReviewDate);
    const retentionScoreAfter = calculateRetentionScore({
      revisionStrength: nextStrength,
      referenceDate: reviewedAt,
      accuracy: revisionTopic.accuracy,
      repeatedMistakeCount: revisionTopic.repeatedMistakeCount,
      overdueDays: nextOverdueDays,
    });

    revisionTopic.lastReviewedAt = reviewedAt;
    revisionTopic.nextReviewDate = nextReviewDate;
    revisionTopic.revisionStrength = nextStrength;
    revisionTopic.retentionScore = retentionScoreAfter;
    revisionTopic.decayScore = round2(clamp(100 - retentionScoreAfter, 1, 100));
    revisionTopic.overdueDays = nextOverdueDays;
    revisionTopic.priority = calculatePriority({
      accuracy: revisionTopic.accuracy,
      retentionScore: retentionScoreAfter,
      overdueDays: nextOverdueDays,
      repeatedMistakeCount: revisionTopic.repeatedMistakeCount,
    });
    revisionTopic.reviewHistory = [
      ...(Array.isArray(revisionTopic.reviewHistory)
        ? revisionTopic.reviewHistory
        : []),
      {
        reviewedAt,
        outcome,
        intervalDays: nextIntervalDays,
        retentionScoreBefore,
        retentionScoreAfter,
        revisionStrengthAfter: nextStrength,
        nextReviewDate,
      },
    ].slice(-30);
    revisionTopic.lastCalculatedAt = reviewedAt;
    revisionTopic.updatedAt = reviewedAt;
    await revisionTopic.save();

    return res.json({
      message: "Revision review recorded.",
      data: serializeRevisionTopic(revisionTopic.toObject()),
    });
  } catch (err) {
    console.error("Revision Review Error:", err.message);
    return res.status(500).json({ error: "Failed to record revision review." });
  }
});

app.get("/api/consistency/dashboard", async (_req, res) => {
  try {
    const data = await buildConsistencyDashboard({
      Attempt,
      RevisionTopic,
      ConsistencyDay,
      ConsistencySnapshot,
      StreakHistory,
    });

    return res.json({ data });
  } catch (err) {
    console.error("Consistency Dashboard Error:", err.message);
    return res
      .status(500)
      .json({ error: "Failed to build consistency dashboard." });
  }
});

app.get("/api/syllabus/tree", async (_req, res) => {
  try {
    const data = await buildSyllabusDashboard({
      Attempt,
      RevisionTopic,
      SyllabusNodeProgress,
      SyllabusProgressSnapshot,
    });

    return res.json({ data });
  } catch (err) {
    console.error("Syllabus Tree Error:", err.message);
    return res.status(500).json({ error: "Failed to build syllabus tree." });
  }
});

app.get("/api/syllabus/topic-notes", async (req, res) => {
  try {
    const subject = normalizeString(req.query.subject);
    const topicKey = normalizeString(req.query.topicKey);

    if (!subject || !topicKey) {
      return res
        .status(400)
        .json({ error: "Subject and topic key are required." });
    }

    const existingNote = await SyllabusTopicNote.findOne({
      subject,
      topicKey,
    }).lean();

    return res.json({
      data: existingNote
        ? {
            subject: existingNote.subject,
            topicKey: existingNote.topicKey,
            topicLabel: normalizeString(existingNote.topicLabel) || topicKey,
            path: normalizeSyllabusPath(existingNote.path),
            notes: normalizeQuestionNotes(existingNote.notes),
            createdAt: existingNote.createdAt
              ? new Date(existingNote.createdAt).toISOString()
              : null,
            updatedAt: existingNote.updatedAt
              ? new Date(existingNote.updatedAt).toISOString()
              : null,
          }
        : {
            subject,
            topicKey,
            topicLabel:
              topicKey.split("::").filter(Boolean).slice(-1)[0] || topicKey,
            path: [],
            notes: [],
            createdAt: null,
            updatedAt: null,
          },
    });
  } catch (err) {
    console.error("Syllabus Topic Notes Fetch Error:", err.message);
    return res
      .status(500)
      .json({ error: "Failed to fetch syllabus topic notes." });
  }
});

app.put("/api/syllabus/topic-notes", async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const subject = normalizeString(body.subject);
    const topicKey = normalizeString(body.topicKey);
    const topicLabel = normalizeString(body.topicLabel);
    const path = normalizeSyllabusPath(body.path);
    const notes = normalizeQuestionNotes(body.notes);

    if (!subject || !topicKey || !topicLabel) {
      return res.status(400).json({
        error: "Subject, topic key, and topic label are required.",
      });
    }

    const noteKey = buildSyllabusTopicNoteKey(subject, topicKey);
    const now = new Date();

    const updatedNote = await SyllabusTopicNote.findOneAndUpdate(
      { noteKey },
      {
        $set: {
          noteKey,
          subject,
          topicKey,
          topicLabel,
          path,
          notes,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      {
        upsert: true,
        new: true,
      },
    ).lean();

    return res.json({
      message: "Syllabus topic notes saved.",
      data: {
        subject: updatedNote.subject,
        topicKey: updatedNote.topicKey,
        topicLabel: updatedNote.topicLabel,
        path: normalizeSyllabusPath(updatedNote.path),
        notes: normalizeQuestionNotes(updatedNote.notes),
        createdAt: updatedNote.createdAt
          ? new Date(updatedNote.createdAt).toISOString()
          : null,
        updatedAt: updatedNote.updatedAt
          ? new Date(updatedNote.updatedAt).toISOString()
          : null,
      },
    });
  } catch (err) {
    console.error("Syllabus Topic Notes Save Error:", err.message);
    return res
      .status(500)
      .json({ error: "Failed to save syllabus topic notes." });
  }
});

app.get("/healthz", (_req, res) => {
  const isMongoReady = mongoose.connection.readyState === 1;
  res.status(isMongoReady ? 200 : 503).json({
    status: isMongoReady ? "ok" : "degraded",
    mongoReady: isMongoReady,
  });
});
const plannerRouter = require("./models/routes/planner");

// Register planner routes FIRST
app.use("/api/planner", plannerRouter);
app.use("/planner", plannerRouter);

const googleRouter = require("./models/routes/google");

app.use("/api/google", googleRouter);

const PORT = process.env.PORT || 5000;

function setupProcessHandlers(server) {
  let isShuttingDown = false;

  async function shutdown(signal) {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`Received ${signal}. Shutting down gracefully...`);

    const closeServer = new Promise((resolve) => {
      server.close(() => resolve());
    });

    const forceExit = setTimeout(() => {
      console.error("Forced shutdown due to timeout.");
      process.exit(1);
    }, 10_000);

    try {
      await closeServer;
      await mongoose.connection.close(false);
      clearTimeout(forceExit);
      process.exit(0);
    } catch (shutdownError) {
      clearTimeout(forceExit);
      const message =
        shutdownError && shutdownError.message
          ? shutdownError.message
          : "Unknown shutdown error";
      console.error("Shutdown Error:", message);
      process.exit(1);
    }
  }

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });
  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);
  });
  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    void shutdown("uncaughtException");
  });
}
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB Connected");

    // 🛡️ PRO FIX: Auto-Healing DB Listeners prevent silent server hangs
    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB Disconnected! Attempting to auto-reconnect...");
    });
    mongoose.connection.on("error", (err) => {
      console.error("🚨 MongoDB Connection Error:", err.message);
    });

    console.log("REGISTERING SUBJECT PROGRESS ROUTES");

    // Only define this once
    function isValidSubjectKey(subject) {
      return (
        typeof subject === "string" &&
        /^upsc(?:_checked|[-_][a-z0-9][a-z0-9_-]{0,80}checked)$/i.test(subject)
      );
    }

    // GET SUBJECT PROGRESS
    app.get("/api/subject-progress", async (req, res) => {
      try {
        const subject = String(req.query.subject || "");

        if (!isValidSubjectKey(subject)) {
          return res.status(400).json({
            error: "Invalid subject.",
          });
        }

        const progress = await SubjectProgress.findOne({
          subjectKey: subject,
        }).lean();

        if (!progress) {
          return res.json({
            progress: {
              checkedUids: [],
              completionTimes: {},
              updatedAt: Date.now(),
            },
          });
        }

        return res.json({
          progress: {
            checkedUids: progress.checkedUids || [],
            completionTimes:
              progress.completionTimes instanceof Map
                ? Object.fromEntries(progress.completionTimes)
                : progress.completionTimes || {},
            updatedAt: progress.updatedAt || Date.now(),
          },
        });
      } catch (err) {
        console.error("GET SUBJECT PROGRESS:", err);

        return res.status(500).json({
          error: "Failed to load subject progress.",
        });
      }
    });

    app.post("/api/subject-progress/batch", async (req, res) => {
      try {
        const body = req.body && typeof req.body === "object" ? req.body : {};
        const subjects = Array.isArray(body.subjects)
          ? Array.from(
              new Set(
                body.subjects
                  .map((subject) => String(subject || ""))
                  .filter((subject) => isValidSubjectKey(subject)),
              ),
            ).slice(0, 30)
          : [];

        if (subjects.length === 0) {
          return res.json({ progress: {} });
        }

        const progressRows = await SubjectProgress.find({
          subjectKey: { $in: subjects },
        }).lean();

        const progressMap = {};
        subjects.forEach((subject) => {
          progressMap[subject] = {
            checkedUids: [],
            completionTimes: {},
            updatedAt: Date.now(),
          };
        });

        progressRows.forEach((progress) => {
          progressMap[progress.subjectKey] = {
            checkedUids: progress.checkedUids || [],
            completionTimes:
              progress.completionTimes instanceof Map
                ? Object.fromEntries(progress.completionTimes)
                : progress.completionTimes || {},
            updatedAt: progress.updatedAt || Date.now(),
          };
        });

        return res.json({ progress: progressMap });
      } catch (err) {
        console.error("POST SUBJECT PROGRESS BATCH:", err);

        return res.status(500).json({
          error: "Failed to load subject progress.",
        });
      }
    });

    // SAVE SUBJECT PROGRESS
    // SAVE SUBJECT PROGRESS & REAL-TIME PLANNER SYNC
    // SAVE SUBJECT PROGRESS & REAL-TIME PLANNER SYNC
    app.put("/api/subject-progress", async (req, res) => {
      const subject = String(req.query.subject || "");
      const body = req.body || {};

      if (!isValidSubjectKey(subject)) {
        return res.status(400).json({ error: "Invalid subject." });
      }

      try {
        const existingProgress = await SubjectProgress.findOne({
          subjectKey: subject,
        }).lean();
        const clientUpdatedAt = toFiniteTimestamp(body.updatedAt);

        if (
          existingProgress &&
          existingProgress.updatedAt &&
          clientUpdatedAt !== null &&
          clientUpdatedAt < existingProgress.updatedAt
        ) {
          return res.status(409).json({
            error: "Conflict: Newer subject progress exists in database.",
            data: {
              checkedUids: existingProgress.checkedUids || [],
              completionTimes:
                existingProgress.completionTimes instanceof Map
                  ? Object.fromEntries(existingProgress.completionTimes)
                  : existingProgress.completionTimes || {},
              updatedAt: existingProgress.updatedAt,
            },
          });
        }

        const serverUpdatedAt = Date.now();
        const savedProgress = await SubjectProgress.findOneAndUpdate(
          { subjectKey: subject },
          {
            subjectKey: subject,
            checkedUids: Array.isArray(body.checkedUids)
              ? body.checkedUids
              : [],
            completionTimes: body.completionTimes || {},
            updatedAt: serverUpdatedAt,
          },
          { upsert: true, new: true },
        ).lean();

        res.json({
          ok: true,
          updatedAt: savedProgress?.updatedAt || serverUpdatedAt,
          data: {
            checkedUids: savedProgress?.checkedUids || [],
            completionTimes:
              savedProgress?.completionTimes instanceof Map
                ? Object.fromEntries(savedProgress.completionTimes)
                : savedProgress?.completionTimes || {},
            updatedAt: savedProgress?.updatedAt || serverUpdatedAt,
          },
        });
      } catch (err) {
        console.error("PUT SUBJECT PROGRESS ERROR:", err);
        return res
          .status(500)
          .json({ error: "Failed to save subject progress." });
      }

      // ⚡ FAST RESPONSE: Unblock the client immediately
      // 🛡️ ASYNC DETACHED PROCESS: Run the heavy Planner Sync in the background
      // 🛡️ ASYNC DETACHED PROCESS: Run the heavy Planner Sync in the background
      (async () => {
        try {
          const currentWeekStr = getStartOfWeekStr(); // 🛡️ PRO FIX: Removed duplicate variables

          await enqueuePlannerSubjectSync(currentWeekStr, async () => {
            const WeeklyPlan = require("./models/WeeklyPlan");
            const activePlan = await WeeklyPlan.findOne({
              weekStartDate: currentWeekStr,
            });

            if (activePlan) {
              let planUpdated = false;
              const reqCheckedUids = Array.isArray(body.checkedUids)
                ? body.checkedUids
                : [];
              const completionTimes =
                body.completionTimes && typeof body.completionTimes === "object"
                  ? body.completionTimes
                  : {};
              const checkedUidSet = new Set(reqCheckedUids);

              const getMissionRevisionStart = (mission) => {
                if (
                  typeof mission.createdAt === "number" &&
                  Number.isFinite(mission.createdAt)
                ) {
                  return mission.createdAt;
                }

                const actualStart = mission.timeValidation?.actualStart
                  ? new Date(mission.timeValidation.actualStart).getTime()
                  : NaN;
                return Number.isFinite(actualStart) ? actualStart : Date.now();
              };

              const isLeafRevised = (uid, sinceTimestamp = 0) => {
                const record = completionTimes && completionTimes[uid];
                if (!record) return false;
                if (typeof record !== "object" || Array.isArray(record)) {
                  return false;
                }

                const revisions = Array.isArray(record.revisions)
                  ? record.revisions.filter(
                      (entry) =>
                        typeof entry === "number" && Number.isFinite(entry),
                    )
                  : [];

                const revisedAt =
                  typeof record.revisedAt === "number" &&
                  Number.isFinite(record.revisedAt)
                    ? record.revisedAt
                    : null;

                return (
                  revisions.some((entry) => entry >= sinceTimestamp) ||
                  (revisedAt !== null && revisedAt >= sinceTimestamp)
                );
              };

              const now = new Date();
              const todayStr = `${now.getFullYear()}-${String(
                now.getMonth() + 1,
              ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

              activePlan.days.forEach((dayPlan) => {
                // A. Sync Note Missions
                if (Array.isArray(dayPlan.noteMissions)) {
                  dayPlan.noteMissions.forEach((mission) => {
                    if (
                      mission.subjectKey &&
                      mission.subjectKey.toLowerCase() === subject.toLowerCase()
                    ) {
                      const progress = calculateNoteMissionProgress(
                        mission,
                        {
                          checkedUids: reqCheckedUids,
                          completionTimes,
                        },
                        {
                          isLeafRevised: (uid, sinceTimestamp) =>
                            isLeafRevised(uid, sinceTimestamp),
                          getMissionRevisionStart,
                        },
                      );

                      if (mission.progress) {
                        mission.progress = progress.progress;
                        planUpdated = true;
                      }
                      mission.progress = progress.progress;
                      planUpdated = true;
                    }
                  });
                }

                // B. Sync Legacy Revision Tasks
                if (Array.isArray(dayPlan.revisionTasks)) {
                  dayPlan.revisionTasks.forEach((task) => {
                    if (checkedUidSet.has(task.topic)) {
                      if (!task.isCompleted) {
                        task.isCompleted = true;

                        task.completedAt = new Date();
                        planUpdated = true;
                      }
                    }
                  });
                }
              });

              if (planUpdated) {
                activePlan.markModified("days");
                await activePlan.save();
              }
            }
          });
        } catch (syncErr) {
          console.error("Planner Sync Failed:", syncErr.message);
        }

        // Removed the duplicate return res.json()
      })(); // <--- CORRECT: Closes AND invokes the background process immediately!
    }); // <--- CORRECT: Securely closes the app.put route!

    // 404 handler MUST be the last normal middleware.
    // 404 handler MUST be the last normal middleware.
    app.use((_req, res) => {
      res.status(404).json({
        error: "Route not found.",
      });
    });
    app.use((err, _req, res, _next) => {
      if (err && err.message === "Not allowed by CORS") {
        return res.status(403).json({ error: "CORS origin blocked." });
      }

      const errorMessage = err && err.message ? err.message : "Unknown error";
      console.error("Unhandled Error:", errorMessage);
      return res.status(500).json({ error: "Internal server error." });
    });
    const server = app.listen(PORT, () =>
      console.log(`Backend running on port ${PORT}`),
    );
    setupProcessHandlers(server);
  } catch (err) {
    const message = err && err.message ? err.message : "Unknown DB error";
    console.error("MongoDB Error:", message);
    process.exit(1);
  }
}

void startServer();
