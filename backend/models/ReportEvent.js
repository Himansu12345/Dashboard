const mongoose = require("mongoose");

function normalizeString(value, maxLength = 300) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function normalizeStringArray(value, maxItems = 20, maxLength = 300) {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value.map((item) => normalizeString(item, maxLength)).filter(Boolean),
    ),
  ).slice(0, maxItems);
}

function normalizeLooseObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value;
}

const REPORT_EVENT_TYPES = [
  "note_complete",
  "note_uncomplete",
  "note_revise",
  "note_unrevise",
  "note_star",
  "note_unstar",

  // keep these allowed now so we can extend reporting later
  "question_attempt",
  "session_start",
  "session_end",
  "session_activity",
];

const reportEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: REPORT_EVENT_TYPES,
      required: true,
      index: true,
    },

    // When the event actually happened
    timestamp: {
      type: Date,
      required: true,
      index: true,
      default: Date.now,
    },

    // Optional logical grouping of activity
    sessionId: {
      type: String,
      default: "",
      index: true,
    },

    // Subject hierarchy
    subject: {
      type: String,
      default: "",
      index: true,
    },
    chapter: {
      type: String,
      default: "",
      index: true,
    },
    topic: {
      type: String,
      default: "",
      index: true,
    },
    subtopic: {
      type: String,
      default: "",
      index: true,
    },

    /**
     * Full syllabus / note path for exact reconstruction in reports.
     * Example:
     * ["Polity", "Parliament", "Rajya Sabha", "Composition"]
     */
    path: {
      type: [String],
      default: [],
    },

    // Exact node / point identity if available
    pointUid: {
      type: String,
      default: "",
      index: true,
    },

    /**
     * Exact note point / content shown to user.
     * This is important for AI analysis of what was completed / revised / starred.
     */
    pointText: {
      type: String,
      default: "",
    },

    /**
     * Optional label of the clicked node / item if you want both title + content.
     * Example:
     * label = "Money Bill"
     * pointText = "Can be introduced only in Lok Sabha..."
     */
    label: {
      type: String,
      default: "",
    },

    /**
     * Previous status snapshot before action.
     * Example:
     * { isChecked: false, isStarred: true, isRevised: false }
     */
    previousStatus: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /**
     * New status snapshot after action.
     * Example:
     * { isChecked: true, isStarred: true, isRevised: false }
     */
    newStatus: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /**
     * Source page / module for debugging + reporting context.
     * Example:
     * "subject-dashboard"
     * "polity-page"
     * "quiz-page"
     */
    sourcePage: {
      type: String,
      default: "",
      index: true,
    },

    /**
     * Optional user-visible action label.
     * Example:
     * "Mark Complete"
     * "Unstar"
     */
    actionLabel: {
      type: String,
      default: "",
    },

    /**
     * Extra structured payload for future expansion without schema churn.
     * Examples:
     * {
     *   subjectKey: "polity",
     *   nodeType: "point",
     *   nodeDepth: 4
     * }
     */
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /**
     * Dedupe key to prevent accidental duplicate writes.
     * We will generate this in the API layer when inserting events.
     */
    eventKey: {
      type: String,
      default: "",
      index: true,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

// Helpful compound indexes for report filtering / aggregation
reportEventSchema.index({ timestamp: -1, eventType: 1 });
reportEventSchema.index({ subject: 1, topic: 1, subtopic: 1, timestamp: -1 });
reportEventSchema.index({ sessionId: 1, timestamp: 1 });
reportEventSchema.index({ pointUid: 1, timestamp: -1 });

/**
 * Small normalization helper so every insert/update stays clean.
 * We'll use this from the route layer before saving too,
 * but keeping it here gives us an extra safety net.
 */
reportEventSchema.statics.normalizePayload = function normalizePayload(
  payload,
) {
  const input =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? payload
      : {};

  const previousStatus = normalizeLooseObject(input.previousStatus);
  const newStatus = normalizeLooseObject(input.newStatus);
  const meta = normalizeLooseObject(input.meta);

  return {
    eventType: normalizeString(input.eventType, 100),
    timestamp: input.timestamp ? new Date(input.timestamp) : new Date(),
    sessionId: normalizeString(input.sessionId, 200),

    subject: normalizeString(input.subject, 200),
    chapter: normalizeString(input.chapter, 200),
    topic: normalizeString(input.topic, 200),
    subtopic: normalizeString(input.subtopic, 200),

    path: normalizeStringArray(input.path, 30, 300),

    pointUid: normalizeString(input.pointUid, 500),
    pointText: normalizeString(input.pointText, 5000),
    label: normalizeString(input.label, 500),

    previousStatus,
    newStatus,

    sourcePage: normalizeString(input.sourcePage, 200),
    actionLabel: normalizeString(input.actionLabel, 200),
    meta,

    eventKey: normalizeString(input.eventKey, 500),
  };
};

module.exports =
  mongoose.models.ReportEvent ||
  mongoose.model("ReportEvent", reportEventSchema);
