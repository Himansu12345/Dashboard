const mongoose = require("mongoose");

const PlannerTopicTargetSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true },
    label: { type: String, required: true },
    topicUid: { type: String, default: null },
    leafUids: { type: [String], default: [] },
    isCompleted: { type: Boolean, default: false },
    isRevised: { type: Boolean, default: false },
  },
  { _id: false },
);

// PHASE 1: New Time Validation Schema
const TimeValidationSchema = new mongoose.Schema(
  {
    plannedStart: { type: String, default: "00:00" },
    plannedEnd: { type: String, default: "00:00" },
    actualStart: { type: Date, default: null },
    actualEnd: { type: Date, default: null },
    validationState: {
      type: String,
      enum: [
        "pending",
        "early_bird",
        "on_time",
        "delayed_start",
        "accident_shift",
      ],
      default: "pending",
    },
    delayReason: { type: String, default: "" },
  },
  { _id: false },
);
const NoteMissionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    mode: {
      type: String,
      enum: ["complete", "revise"],
      default: "complete",
    },
    createdAt: { type: Number, default: () => Date.now() },

    googleCalendarEventId: {
      type: String,
      default: null,
    },
    subjectKey: { type: String, required: true },
    subject: { type: String, required: true },
    chapterUid: { type: String, required: true },
    chapterLabel: { type: String, required: true },
    targets: { type: [PlannerTopicTargetSchema], default: [] },
    timeValidation: { type: TimeValidationSchema, default: () => ({}) }, // Embedded Time Logic
    progress: {
      status: { type: String, default: "not_started" },
      completionPercent: { type: Number, default: 0 },
      totalTargets: { type: Number, default: 0 },
      completedTargets: { type: Number, default: 0 },
      revisedTargets: { type: Number, default: 0 },
      closedAt: { type: Number, default: null },
      },
  },
  { _id: false },
);

// Keep legacy task schemas so existing data doesn't break
const RevisionTaskSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    topic: { type: String, required: true },
    subject: { type: String, default: "" },
    priority: { type: String, default: "Medium" },
    time: { type: String, default: "" },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { _id: false },
);

const McqTaskSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    subject: { type: String, required: true },
    chapter: { type: String, default: "All" },
    difficulty: { type: String, default: "Mixed" },
    target: { type: Number, required: true },
    completed: { type: Number, default: 0 },
    accuracy: { type: String, default: "0%" },
    time: { type: String, default: "" },
  },
  { _id: false },
);

const ChallengeTaskSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    task: { type: String, required: true },
    type: { type: String, default: "Mixed" },
    time: { type: String, default: "" },
    color: { type: String, default: "blue" },
    isCompleted: { type: Boolean, default: false },
  },
  { _id: false },
);

const DailyPlanSchema = new mongoose.Schema(
  {
    dateKey: { type: String, required: true },
    dayOfWeek: { type: String, required: true },
    dateLabel: { type: String, required: true },
    notes: { type: String, default: "" },

    // New Granular Mission Tracking
    noteMissions: { type: [NoteMissionSchema], default: [] },
    testMissions: { type: [mongoose.Schema.Types.Mixed], default: [] }, // Accepts timeValidation dynamically
    otherMissions: { type: [mongoose.Schema.Types.Mixed], default: [] },

    // Legacy arrays
    revisionTasks: { type: [RevisionTaskSchema], default: [] },
    mcqTasks: { type: [McqTaskSchema], default: [] },
    challengeTasks: { type: [ChallengeTaskSchema], default: [] },
  },
  { _id: false },
);

const ExecutionMatrixSchema = new mongoose.Schema(
  {
    currentStreak: { type: Number, default: 0, min: 0 },
    lastPenaltyAt: { type: Date, default: null },
    penaltyCount: { type: Number, default: 0, min: 0 },
    resetCount: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const WeeklyPlanSchema = new mongoose.Schema(
  {
    weekStartDate: { type: String, required: true, unique: true, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    status: { type: String, enum: ["Draft", "Committed"], default: "Draft" },
    committedAt: { type: Date, default: null },
    revisionsCount: { type: Number, default: 0 },
    executionMatrix: { type: ExecutionMatrixSchema, default: () => ({}) },
    days: { type: [DailyPlanSchema], default: [] },
    updatedAt: { type: Number, default: Date.now },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.WeeklyPlan || mongoose.model("WeeklyPlan", WeeklyPlanSchema);
