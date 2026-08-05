import type {
  DateAnalyticsResult,
  DifficultyBreakdownRow,
  SubjectBreakdownRow,
  TopicBreakdownRow,
} from "@/types/analytics";
import type {
  PlannerCalendarDayDetails,
  PlannerCalendarMission,
  PlannerDayCompletion,
  PlannerDayCompletionMap,
} from "@/types/activityCalendar";
import type { PracticeRecord } from "@/types/records";

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const VISIBLE_MONTHS = 3;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

type BreakdownKey = "subject" | "topic" | "difficulty";

interface BreakdownStats {
  submissions: number;
  questions: number;
  correct: number;
  incorrect: number;
  skipped: number;
}

type BreakdownRow = SubjectBreakdownRow | TopicBreakdownRow | DifficultyBreakdownRow;

export function clampSliderIndex(index: number): number {
  const maxIndex = MONTH_NAMES.length - VISIBLE_MONTHS;
  return Math.max(0, Math.min(maxIndex, index));
}

export function getInitialSliderIndex(monthIndex: number): number {
  return clampSliderIndex(monthIndex - 1);
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getHeatColor(count: number): string {
  if (count === 0) return "#141f35";
  if (count <= 2) return "#00d5ff";
  if (count <= 4) return "#00ff95";
  if (count <= 7) return "#ffd25a";
  return "#ff5f74";
}

export function getMissionCompletionColor(
  completion: PlannerDayCompletion | null | undefined,
): string {
  if (!completion || completion.totalMissions <= 0) return "#141f35";
  
  // 🛡️ PRO FIX: Time-Guard checks if the day is in the future.
  // If it's a future day, it renders as grey/empty instead of Failed (Red)
  if ((completion as any).isFuture) return "#141f35";

  if (completion.completionPercent >= 100) return "#22c55e";
  if (completion.completionPercent >= 50) return "#f59e0b";
  return "#ef4444";
}

function toNumber(value: unknown): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function parseRecordDate(dateSource: string | null | undefined): Date | null {
  if (!dateSource) return null;
  const normalized = String(dateSource).trim();
  if (!normalized) return null;

  const isoMatch = ISO_DATE_PATTERN.exec(normalized);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    if (year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return new Date(year, month - 1, day);
    }
    return null;
  }

  const parsedDate = new Date(normalized);
  if (Number.isNaN(parsedDate.getTime())) return null;
  return parsedDate;
}

export function getRecordDateKey(record: PracticeRecord | null | undefined): string {
  if (!record) return "";
  const dateSource = record.dateValue || record.date;
  if (!dateSource) return "";

  const parsedDate = parseRecordDate(dateSource);
  if (!parsedDate) return "";
  return formatDate(parsedDate);
}

export function buildDateCountMap(records: PracticeRecord[], selectedYear: number): Record<string, number> {
  const safeRecords = Array.isArray(records) ? records : [];
  const dateMap: Record<string, number> = {};

  safeRecords.forEach((record) => {
    const key = getRecordDateKey(record);
    if (!key) return;

    const keyYear = Number(key.slice(0, 4));
    if (!Number.isFinite(keyYear) || keyYear !== selectedYear) return;

    if (!dateMap[key]) dateMap[key] = 0;
    dateMap[key] += 1;
  });

  return dateMap;
}

function isCompletedMission(mission: unknown): boolean {
  if (!mission || typeof mission !== "object" || Array.isArray(mission)) {
    return false;
  }

  const missionRecord = mission as {
    progress?: { status?: unknown; completionPercent?: unknown };
    isCompleted?: unknown;
  };
  const status = String(missionRecord.progress?.status || "").toLowerCase();
  if (status === "completed" || status === "revised") return true;
  if (missionRecord.isCompleted === true) return true;

  const percent = Number(missionRecord.progress?.completionPercent);
  return Number.isFinite(percent) && percent >= 100;
}

export functionbuildPlannerCompletionMap(
  days: unknown[],
): PlannerDayCompletionMap {
  const completionMap: PlannerDayCompletionMap = {};
  const safeDays = Array.isArray(days) ? days : [];

  // 🛡️ PRO FIX: Get today's Date string to guard against future visual penalties
  const todayStr = formatDate(new Date());

  safeDays.forEach((day) => {
    if (!day || typeof day !== "object" || Array.isArray(day)) return;

    const dayRecord = day as {
      dateKey?: unknown;
      noteMissions?: unknown;
      testMissions?: unknown;
      otherMissions?: unknown;
    };
    const dateKey = String(dayRecord.dateKey || "");
    if (!ISO_DATE_PATTERN.test(dateKey)) return;

    // 🧠 Detect if this map entry belongs to the future
    const isFuture = dateKey > todayStr;

    const missions = [
      ...(Array.isArray(dayRecord.noteMissions) ? dayRecord.noteMissions : []),
      ...(Array.isArray(dayRecord.testMissions) ? dayRecord.testMissions : []),
      ...(Array.isArray(dayRecord.otherMissions)
        ? dayRecord.otherMissions.filter((mission) => {
            if (!mission || typeof mission !== "object" || Array.isArray(mission)) {
              return true;
            }
            return (mission as { type?: unknown }).type !== "debt_collector";
          })
        : []),
    ];
    const totalMissions = missions.length;
    const completedMissions = missions.filter(isCompletedMission).length;

    completionMap[dateKey] = {
      totalMissions,
      completedMissions,
      completionPercent:
        totalMissions > 0
          ? Math.round((completedMissions / totalMissions) * 100)
          : 0,
      isFuture, // 🛡️ Pass this down to the color renderer!
    } as any; // Cast as any so TS allows our dynamic injection
  });

  return completionMap;
}

function getMissionStatus(mission: unknown): string {
  if (!mission || typeof mission !== "object" || Array.isArray(mission)) {
    return "not_started";
  }

  const status = String(
    (mission as { progress?: { status?: unknown }; isCompleted?: unknown })
      .progress?.status || "",
  ).toLowerCase();
  if (status) return status;
  return (mission as { isCompleted?: unknown }).isCompleted === true
    ? "completed"
    : "not_started";
}

function getMissionTime(mission: unknown, key: "plannedStart" | "plannedEnd") {
  if (!mission || typeof mission !== "object" || Array.isArray(mission)) {
    return undefined;
  }

  const value = (mission as { timeValidation?: Record<string, unknown> })
    .timeValidation?.[key];
  return typeof value === "string" && value !== "00:00" ? value : undefined;
}

function buildNoteMissionDetails(mission: Record<string, unknown>): string[] {
  const progress =
    mission.progress && typeof mission.progress === "object" && !Array.isArray(mission.progress)
      ? (mission.progress as Record<string, unknown>)
      : {};
  const targets = Array.isArray(progress.targets)
    ? (progress.targets as unknown[])
    : Array.isArray(mission.targets)
      ? mission.targets
      : [];

  return targets
    .map((target) => {
      if (!target || typeof target !== "object" || Array.isArray(target)) {
        return "";
      }
      const item = target as Record<string, unknown>;
      const label = String(item.label || item.uid || "Target");
      const total = Number(item.totalLeafCount) || (Array.isArray(item.leafUids) ? item.leafUids.length : 0);
      const completed = Number(item.completedLeafCount) || 0;
      const revised = Number(item.revisedLeafCount) || 0;
      return `${label}: ${Math.max(completed, revised)}/${total || 1}`;
    })
    .filter(Boolean);
}

function normalizePlannerMission(
  mission: unknown,
  type: PlannerCalendarMission["type"],
  index: number,
): PlannerCalendarMission | null {
  if (!mission || typeof mission !== "object" || Array.isArray(mission)) {
    return null;
  }

  const item = mission as Record<string, unknown>;
  const progress =
    item.progress && typeof item.progress === "object" && !Array.isArray(item.progress)
      ? (item.progress as Record<string, unknown>)
      : {};
  const status = getMissionStatus(item);

  if (type === "note") {
    const totalCount =
      Number(progress.totalTargets) ||
      (Array.isArray(item.targets)
        ? item.targets.reduce((sum, target) => {
            if (!target || typeof target !== "object" || Array.isArray(target)) return sum;
            const leafUids = (target as { leafUids?: unknown }).leafUids;
            return sum + (Array.isArray(leafUids) ? leafUids.length : 1);
          }, 0)
        : 0);
    const mode = item.mode === "revise" ? "revise" : "complete";
    const completedCount =
      mode === "revise"
        ? Number(progress.revisedTargets) || 0
        : Number(progress.completedTargets) || 0;

    return {
      id: String(item.id || `note-${index}`),
      type,
      title: String(item.chapterLabel || "Note mission"),
      subject: String(item.subject || "Unknown"),
      chapter: String(item.chapterLabel || ""),
      mode,
      status,
      plannedStart: getMissionTime(item, "plannedStart"),
      plannedEnd: getMissionTime(item, "plannedEnd"),
      completedCount,
      totalCount,
      remainingCount: Math.max(0, totalCount - completedCount),
      details: buildNoteMissionDetails(item),
    };
  }

  if (type === "test") {
    const totalCount = Number(item.totalQuestions) || 0;
    const completedCount = Number(progress.completedQuestions) || 0;
    return {
      id: String(item.id || `test-${index}`),
      type,
      title: String(item.chapterTitle || "Test mission"),
      subject: String(item.subject || "Unknown"),
      chapter: String(item.chapterTitle || ""),
      mode: typeof item.mode === "string" ? item.mode : undefined,
      status,
      plannedStart: getMissionTime(item, "plannedStart"),
      plannedEnd: getMissionTime(item, "plannedEnd"),
      completedCount,
      totalCount,
      remainingCount: Math.max(0, totalCount - completedCount),
      details: [`Questions: ${completedCount}/${totalCount}`],
    };
  }

  return {
    id: String(item.id || `other-${index}`),
    type,
    title: String(item.title || item.task || "Other mission"),
    subject: String(item.subject || "General"),
    chapter: String(item.chapter || ""),
    status,
    plannedStart: getMissionTime(item, "plannedStart"),
    plannedEnd: getMissionTime(item, "plannedEnd"),
    completedCount: isCompletedMission(item) ? 1 : 0,
    totalCount: 1,
    remainingCount: isCompletedMission(item) ? 0 : 1,
    details: [],
  };
}

export function buildPlannerDayDetailsMap(
  days: unknown[],
): Record<string, PlannerCalendarDayDetails> {
  const detailsMap: Record<string, PlannerCalendarDayDetails> = {};
  const safeDays = Array.isArray(days) ? days : [];

  safeDays.forEach((day) => {
    if (!day || typeof day !== "object" || Array.isArray(day)) return;

    const dayRecord = day as {
      dateKey?: unknown;
      noteMissions?: unknown;
      testMissions?: unknown;
      otherMissions?: unknown;
    };
    const dateKey = String(dayRecord.dateKey || "");
    if (!ISO_DATE_PATTERN.test(dateKey)) return;

    const missions = [
      ...(Array.isArray(dayRecord.noteMissions)
        ? dayRecord.noteMissions
            .map((mission, index) => normalizePlannerMission(mission, "note", index))
            .filter((mission): mission is PlannerCalendarMission => Boolean(mission))
        : []),
      ...(Array.isArray(dayRecord.testMissions)
        ? dayRecord.testMissions
            .map((mission, index) => normalizePlannerMission(mission, "test", index))
            .filter((mission): mission is PlannerCalendarMission => Boolean(mission))
        : []),
      ...(Array.isArray(dayRecord.otherMissions)
        ? dayRecord.otherMissions
            .filter((mission) => {
              if (!mission || typeof mission !== "object" || Array.isArray(mission)) return true;
              return (mission as { type?: unknown }).type !== "debt_collector";
            })
            .map((mission, index) => normalizePlannerMission(mission, "other", index))
            .filter((mission): mission is PlannerCalendarMission => Boolean(mission))
        : []),
    ];

    const completedMissions = missions.filter((mission) =>
      ["completed", "revised"].includes(mission.status),
    ).length;

    detailsMap[dateKey] = {
      dateKey,
      totalMissions: missions.length,
      completedMissions,
      remainingMissions: Math.max(0, missions.length - completedMissions),
      missions,
    };
  });

  return detailsMap;
}

export function buildYearDays(selectedYear: number): Date[] {
  const days: Date[] = [];
  const startDate = new Date(selectedYear, 0, 1);
  const endDate = new Date(selectedYear, 11, 31);

  for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
    days.push(new Date(currentDate));
  }

  return days;
}

export function groupDaysByMonth(allDays: Date[]): Date[][] {
  const groupedMonths: Date[][] = Array.from({ length: 12 }, () => []);
  allDays.forEach((date) => {
    groupedMonths[date.getMonth()].push(date);
  });
  return groupedMonths;
}

function toBreakdownArray(
  map: Map<string, BreakdownStats>,
  totalSubmissions: number,
  totalQuestions: number,
  keyName: BreakdownKey,
): BreakdownRow[] {
  const sharedMetrics = (stats: BreakdownStats) => ({
    submissions: stats.submissions,
    questions: stats.questions,
    correct: stats.correct,
    incorrect: stats.incorrect,
    skipped: stats.skipped,
    accuracy: stats.questions === 0 ? 0 : Number(((stats.correct / stats.questions) * 100).toFixed(2)),
    submissionShare:
      totalSubmissions === 0 ? 0 : Number(((stats.submissions / totalSubmissions) * 100).toFixed(2)),
    questionShare: totalQuestions === 0 ? 0 : Number(((stats.questions / totalQuestions) * 100).toFixed(2)),
  });

  const rows =
    keyName === "subject"
      ? Array.from(map.entries()).map(
          ([name, stats]): SubjectBreakdownRow => ({
            subject: name,
            ...sharedMetrics(stats),
          }),
        )
      : keyName === "topic"
        ? Array.from(map.entries()).map(
            ([name, stats]): TopicBreakdownRow => ({
              topic: name,
              ...sharedMetrics(stats),
            }),
          )
        : Array.from(map.entries()).map(
            ([name, stats]): DifficultyBreakdownRow => ({
              difficulty: name,
              ...sharedMetrics(stats),
            }),
          );

  return rows.sort((first, second) => second.submissions - first.submissions);
}

export function buildDateAnalytics(records: PracticeRecord[], dateKey: string): DateAnalyticsResult {
  const safeRecords = Array.isArray(records) ? records : [];
  const dateRecords = safeRecords.filter((record) => getRecordDateKey(record) === dateKey);

  const totalSubmissions = dateRecords.length;
  const totalQuestionsAttempted = dateRecords.reduce((sum, record) => sum + toNumber(record.total), 0);
  const totalCorrect = dateRecords.reduce((sum, record) => sum + toNumber(record.correct), 0);
  const totalIncorrect = dateRecords.reduce((sum, record) => sum + toNumber(record.incorrect), 0);
  const totalSkipped = dateRecords.reduce((sum, record) => sum + toNumber(record.skipped), 0);
  const accuracy =
    totalQuestionsAttempted === 0 ? 0 : Number(((totalCorrect / totalQuestionsAttempted) * 100).toFixed(2));

  const subjectMap = new Map<string, BreakdownStats>();
  const topicMap = new Map<string, BreakdownStats>();
  const difficultyMap = new Map<string, BreakdownStats>();

  dateRecords.forEach((record) => {
    const subject = record.subject || "Unknown";
    const topic = record.topic || "Unknown";
    const difficulty = record.difficulty || "Unknown";

    if (!subjectMap.has(subject)) {
      subjectMap.set(subject, {
        submissions: 0,
        questions: 0,
        correct: 0,
        incorrect: 0,
        skipped: 0,
      });
    }
    if (!topicMap.has(topic)) {
      topicMap.set(topic, {
        submissions: 0,
        questions: 0,
        correct: 0,
        incorrect: 0,
        skipped: 0,
      });
    }
    if (!difficultyMap.has(difficulty)) {
      difficultyMap.set(difficulty, {
        submissions: 0,
        questions: 0,
        correct: 0,
        incorrect: 0,
        skipped: 0,
      });
    }

    const updates: BreakdownStats = {
      submissions: 1,
      questions: toNumber(record.total),
      correct: toNumber(record.correct),
      incorrect: toNumber(record.incorrect),
      skipped: toNumber(record.skipped),
    };

    const subjectStats = subjectMap.get(subject);
    if (subjectStats) {
      subjectStats.submissions += updates.submissions;
      subjectStats.questions += updates.questions;
      subjectStats.correct += updates.correct;
      subjectStats.incorrect += updates.incorrect;
      subjectStats.skipped += updates.skipped;
    }

    const topicStats = topicMap.get(topic);
    if (topicStats) {
      topicStats.submissions += updates.submissions;
      topicStats.questions += updates.questions;
      topicStats.correct += updates.correct;
      topicStats.incorrect += updates.incorrect;
      topicStats.skipped += updates.skipped;
    }

    const difficultyStats = difficultyMap.get(difficulty);
    if (difficultyStats) {
      difficultyStats.submissions += updates.submissions;
      difficultyStats.questions += updates.questions;
      difficultyStats.correct += updates.correct;
      difficultyStats.incorrect += updates.incorrect;
      difficultyStats.skipped += updates.skipped;
    }
  });

  const subjectBreakdown = toBreakdownArray(
    subjectMap,
    totalSubmissions,
    totalQuestionsAttempted,
    "subject",
  ) as SubjectBreakdownRow[];
  const topicBreakdown = toBreakdownArray(
    topicMap,
    totalSubmissions,
    totalQuestionsAttempted,
    "topic",
  ) as TopicBreakdownRow[];
  const difficultyBreakdown = toBreakdownArray(
    difficultyMap,
    totalSubmissions,
    totalQuestionsAttempted,
    "difficulty",
  ) as DifficultyBreakdownRow[];

  return {
    dateKey,
    totalSubmissions,
    totalQuestionsAttempted,
    totalCorrect,
    totalIncorrect,
    totalSkipped,
    accuracy,
    subjectBreakdown,
    topicBreakdown,
    difficultyBreakdown,
  };
}
