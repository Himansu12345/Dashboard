import type {
  ConsistencyAchievement,
  ConsistencyDashboardPayload,
  ConsistencyDayActivity,
  ConsistencyMonth,
  ConsistencyState,
  ConsistencySummary,
  MomentumState,
  StreakHistoryItem,
  StrongestWeekSummary,
  ConsistencyTrendPoint,
} from "@/types/consistency";
import {
  buildApiUrl,
  parseJsonSafely,
  toApiErrorMessage,
} from "@/lib/api/client";

function buildConsistencyUrl(path: string): string {
  return buildApiUrl(path);
}

function toFiniteNumber(value: unknown): number {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function normalizeConsistencyState(value: unknown): ConsistencyState {
  return [
    "Weak",
    "Improving",
    "Disciplined",
    "Elite Consistency",
  ].includes(String(value))
    ? (value as ConsistencyState)
    : "Improving";
}

function normalizeMomentumState(value: unknown): MomentumState {
  return [
    "Momentum Rising",
    "Momentum Stable",
    "Momentum Falling",
  ].includes(String(value))
    ? (value as MomentumState)
    : "Momentum Stable";
}

function normalizeStrongestWeek(value: unknown): StrongestWeekSummary {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    label: typeof raw.label === "string" ? raw.label : "No active week yet",
    startDate: typeof raw.startDate === "string" ? raw.startDate : "",
    endDate: typeof raw.endDate === "string" ? raw.endDate : "",
    intensityScore: toFiniteNumber(raw.intensityScore),
    activeDays: toFiniteNumber(raw.activeDays),
  };
}

function normalizeSummary(value: unknown): ConsistencySummary {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    currentStreak: toFiniteNumber(raw.currentStreak),
    bestStreak: toFiniteNumber(raw.bestStreak),
    comebackStreak: toFiniteNumber(raw.comebackStreak),
    activeDays: toFiniteNumber(raw.activeDays),
    missedDays: toFiniteNumber(raw.missedDays),
    activeThisMonth: toFiniteNumber(raw.activeThisMonth),
    totalRevisionMinutes: toFiniteNumber(raw.totalRevisionMinutes),
    consistencyScore: toFiniteNumber(raw.consistencyScore),
    consistencyState: normalizeConsistencyState(raw.consistencyState),
    momentumState: normalizeMomentumState(raw.momentumState),
    momentumDelta: toFiniteNumber(raw.momentumDelta),
    strongestWeek: normalizeStrongestWeek(raw.strongestWeek),
  };
}

function normalizeDay(value: unknown): ConsistencyDayActivity | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const date = typeof raw.date === "string" ? raw.date : "";
  if (!date) return null;

  return {
    date,
    monthKey: typeof raw.monthKey === "string" ? raw.monthKey : date.slice(0, 7),
    dayOfWeek: toFiniteNumber(raw.dayOfWeek),
    isToday: Boolean(raw.isToday),
    isActive: Boolean(raw.isActive),
    activityLevel: toFiniteNumber(raw.activityLevel),
    intensityScore: toFiniteNumber(raw.intensityScore),
    attemptCount: toFiniteNumber(raw.attemptCount),
    revisionCount: toFiniteNumber(raw.revisionCount),
    revisedTopicsCount: toFiniteNumber(raw.revisedTopicsCount),
    studyDurationMinutes: toFiniteNumber(raw.studyDurationMinutes),
    qualityScore: toFiniteNumber(raw.qualityScore),
    consistencyImpact: toFiniteNumber(raw.consistencyImpact),
    retentionImpact: toFiniteNumber(raw.retentionImpact),
    accuracyAverage: toFiniteNumber(raw.accuracyAverage),
    reviewSuccessRate: toFiniteNumber(raw.reviewSuccessRate),
    streakContinued: Boolean(raw.streakContinued),
    topics: Array.isArray(raw.topics)
      ? raw.topics.filter((entry): entry is string => typeof entry === "string")
      : [],
  };
}

function normalizeMonth(value: unknown): ConsistencyMonth | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const key = typeof raw.key === "string" ? raw.key : "";
  if (!key) return null;
  return {
    key,
    label: typeof raw.label === "string" ? raw.label : key,
    year: toFiniteNumber(raw.year),
    month: toFiniteNumber(raw.month),
    days: Array.isArray(raw.days)
      ? raw.days.map((entry) => normalizeDay(entry)).filter((entry): entry is ConsistencyDayActivity => Boolean(entry))
      : [],
  };
}

function normalizeAchievement(value: unknown): ConsistencyAchievement | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const id = typeof raw.id === "string" ? raw.id : "";
  if (!id) return null;
  return {
    id,
    title: typeof raw.title === "string" ? raw.title : "Achievement",
    description: typeof raw.description === "string" ? raw.description : "",
    unlocked: Boolean(raw.unlocked),
    unlockedAt: typeof raw.unlockedAt === "string" ? raw.unlockedAt : null,
    tone: ["teal", "mint", "amber", "rose"].includes(String(raw.tone))
      ? (raw.tone as ConsistencyAchievement["tone"])
      : "teal",
  };
}

function normalizeTrendPoint(value: unknown): ConsistencyTrendPoint | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const date = typeof raw.date === "string" ? raw.date : "";
  if (!date) return null;
  return {
    date,
    intensityScore: toFiniteNumber(raw.intensityScore),
    consistencyScore: toFiniteNumber(raw.consistencyScore),
    active: Boolean(raw.active),
  };
}

function normalizeStreakHistoryItem(value: unknown): StreakHistoryItem | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const streakKey = typeof raw.streakKey === "string" ? raw.streakKey : "";
  if (!streakKey) return null;
  return {
    streakKey,
    startDate: typeof raw.startDate === "string" ? raw.startDate : "",
    endDate: typeof raw.endDate === "string" ? raw.endDate : "",
    length: toFiniteNumber(raw.length),
    status: raw.status === "active" ? "active" : "completed",
    type: raw.type === "comeback" ? "comeback" : "standard",
  };
}

function normalizeConsistencyDashboardPayload(input: unknown): ConsistencyDashboardPayload {
  const raw = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  return {
    generatedAt:
      typeof raw.generatedAt === "string" ? raw.generatedAt : new Date().toISOString(),
    summary: normalizeSummary(raw.summary),
    months: Array.isArray(raw.months)
      ? raw.months.map((entry) => normalizeMonth(entry)).filter((entry): entry is ConsistencyMonth => Boolean(entry))
      : [],
    achievements: Array.isArray(raw.achievements)
      ? raw.achievements
          .map((entry) => normalizeAchievement(entry))
          .filter((entry): entry is ConsistencyAchievement => Boolean(entry))
      : [],
    recentTrend: Array.isArray(raw.recentTrend)
      ? raw.recentTrend
          .map((entry) => normalizeTrendPoint(entry))
          .filter((entry): entry is ConsistencyTrendPoint => Boolean(entry))
      : [],
    streakHistory: Array.isArray(raw.streakHistory)
      ? raw.streakHistory
          .map((entry) => normalizeStreakHistoryItem(entry))
          .filter((entry): entry is StreakHistoryItem => Boolean(entry))
      : [],
  };
}

export async function fetchConsistencyDashboard(): Promise<ConsistencyDashboardPayload> {
  const response = await fetch(buildConsistencyUrl("/api/consistency/dashboard"), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await toApiErrorMessage(response, "Unable to fetch consistency dashboard"));
  }

  const payload = await parseJsonSafely<{ data?: unknown }>(response);
  return normalizeConsistencyDashboardPayload(payload?.data);
}
