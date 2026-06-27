import type { DateBounds, DashboardFilters } from "@/types/filters";
import type { PracticeRecord } from "@/types/records";

export const ALL_SUBJECTS = "All Subjects";
export const ALL_DIFFICULTIES = "All Difficulties";

const DIFFICULTY_ORDER = ["Easy", "Medium", "Hard"] as const;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function getDefaultFilters(): DashboardFilters {
  return {
    startDate: "",
    endDate: "",
    subject: ALL_SUBJECTS,
    difficulty: ALL_DIFFICULTIES,
  };
}

function toIsoDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateInput(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
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

export function getRecordDateValue(record: Partial<PracticeRecord> | null | undefined): string | null {
  if (!record) return null;

  if (typeof record.dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(record.dateValue)) {
    return record.dateValue;
  }

  const parsedDate = parseDateInput(record.dateValue || record.date || "");
  if (!parsedDate) return null;
  return toIsoDateString(parsedDate);
}

export function filterRecords(records: PracticeRecord[], filters: DashboardFilters): PracticeRecord[] {
  const safeRecords = Array.isArray(records) ? records : [];
  const {
    startDate = "",
    endDate = "",
    subject = ALL_SUBJECTS,
    difficulty = ALL_DIFFICULTIES,
  } = filters || getDefaultFilters();

  return safeRecords.filter((record) => {
    if (subject !== ALL_SUBJECTS && record.subject !== subject) return false;
    if (difficulty !== ALL_DIFFICULTIES && record.difficulty !== difficulty) return false;

    if (!startDate && !endDate) return true;

    const recordDate = getRecordDateValue(record);
    if (!recordDate) return false;

    if (startDate && recordDate < startDate) return false;
    if (endDate && recordDate > endDate) return false;

    return true;
  });
}

export function getDateBounds(records: PracticeRecord[]): DateBounds {
  const safeRecords = Array.isArray(records) ? records : [];
  const dateValues = safeRecords
    .map((record) => getRecordDateValue(record))
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => a.localeCompare(b));

  return {
    minDate: dateValues[0] || "",
    maxDate: dateValues[dateValues.length - 1] || "",
  };
}

export function getSubjectOptions(records: PracticeRecord[]): string[] {
  const safeRecords = Array.isArray(records) ? records : [];
  const subjects = Array.from(new Set(safeRecords.map((record) => record.subject).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b),
  );
  return [ALL_SUBJECTS, ...subjects];
}

export function getDifficultyOptions(records: PracticeRecord[]): string[] {
  const safeRecords = Array.isArray(records) ? records : [];
  const difficultiesInRecords = new Set(safeRecords.map((record) => record.difficulty).filter(Boolean));
  const orderedDifficulties = DIFFICULTY_ORDER.filter((difficulty) => difficultiesInRecords.has(difficulty));
  const extraDifficulties = Array.from(difficultiesInRecords)
    .filter((difficulty) => !DIFFICULTY_ORDER.includes(difficulty as (typeof DIFFICULTY_ORDER)[number]))
    .sort((a, b) => a.localeCompare(b));

  return [ALL_DIFFICULTIES, ...orderedDifficulties, ...extraDifficulties];
}
