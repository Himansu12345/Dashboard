import type {
  DateAnalyticsResult,
  DifficultyBreakdownRow,
  SubjectBreakdownRow,
  TopicBreakdownRow,
} from "@/types/analytics";
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
