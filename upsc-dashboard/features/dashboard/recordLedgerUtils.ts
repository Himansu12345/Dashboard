import type { PracticeQuestionDetail, PracticeRecord } from "@/types/records";

export interface LedgerSummaryRow {
  key: string;
  label: string;
  subject: string;
  topic?: string;
  subtopic?: string;
  testCount: number;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  difficultySummary: string;
}

export interface AttemptLedgerEntry {
  attemptNumber: number;
  record: PracticeRecord;
  wrongQuestionCount: number;
}

export interface AttemptLedgerDateGroup {
  dateKey: string;
  dateLabel: string;
  attemptCount: number;
  totalQuestions: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalSkipped: number;
  attempts: AttemptLedgerEntry[];
}

interface DifficultyBucket {
  easy: number;
  medium: number;
  hard: number;
}

function createDifficultyBucket(): DifficultyBucket {
  return { easy: 0, medium: 0, hard: 0 };
}

function toDifficultyKey(value: string): keyof DifficultyBucket | null {
  const normalized = value.trim().toLowerCase();
  if (normalized === "easy") return "easy";
  if (normalized === "medium") return "medium";
  if (normalized === "hard") return "hard";
  return null;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function toTimestamp(value: string | undefined): number {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildDifficultySummary(bucket: DifficultyBucket): string {
  return `${bucket.easy}/${bucket.medium}/${bucket.hard}`;
}

function buildSummaryRows(
  records: PracticeRecord[],
  groupKeyBuilder: (record: PracticeRecord) => string,
  labelBuilder: (record: PracticeRecord) => string,
): LedgerSummaryRow[] {
  const summaryMap = new Map<
    string,
    {
      key: string;
      label: string;
      subject: string;
      topic?: string;
      subtopic?: string;
      testCount: number;
      totalQuestions: number;
      correct: number;
      incorrect: number;
      difficultyBucket: DifficultyBucket;
    }
  >();

  records.forEach((record) => {
    const key = groupKeyBuilder(record);
    const existing = summaryMap.get(key) || {
      key,
      label: labelBuilder(record),
      subject: record.subject,
      topic: record.topic,
      subtopic: record.subtopic || undefined,
      testCount: 0,
      totalQuestions: 0,
      correct: 0,
      incorrect: 0,
      difficultyBucket: createDifficultyBucket(),
    };

    existing.testCount += 1;
    existing.totalQuestions += Number(record.total) || 0;
    existing.correct += Number(record.correct) || 0;
    existing.incorrect += Number(record.incorrect) || 0;

    const difficultyKey = toDifficultyKey(record.difficulty || "");
    if (difficultyKey) {
      existing.difficultyBucket[difficultyKey] += Number(record.total) || 0;
    }

    summaryMap.set(key, existing);
  });

  return Array.from(summaryMap.values())
    .map((row) => ({
      key: row.key,
      label: row.label,
      subject: row.subject,
      topic: row.topic,
      subtopic: row.subtopic,
      testCount: row.testCount,
      totalQuestions: row.totalQuestions,
      correct: row.correct,
      incorrect: row.incorrect,
      accuracy:
        row.totalQuestions === 0
          ? 0
          : round2((row.correct / row.totalQuestions) * 100),
      difficultySummary: buildDifficultySummary(row.difficultyBucket),
    }))
    .sort((first, second) => {
      if (second.totalQuestions !== first.totalQuestions) {
        return second.totalQuestions - first.totalQuestions;
      }
      return first.label.localeCompare(second.label);
    });
}

export function summarizeRecordsBySubject(records: PracticeRecord[]): LedgerSummaryRow[] {
  return buildSummaryRows(records, (record) => record.subject, (record) => record.subject);
}

export function summarizeRecordsByTopic(
  records: PracticeRecord[],
  subject: string,
): LedgerSummaryRow[] {
  const safeSubject = subject.trim();
  const scopedRecords = records.filter((record) => record.subject === safeSubject);

  return buildSummaryRows(
    scopedRecords,
    (record) => `${record.subject}::${record.topic}`,
    (record) => record.topic,
  );
}

export function summarizeRecordsBySubtopic(
  records: PracticeRecord[],
  subject: string,
  topic: string,
): LedgerSummaryRow[] {
  const safeSubject = subject.trim();
  const safeTopic = topic.trim();
  const scopedRecords = records.filter(
    (record) => record.subject === safeSubject && record.topic === safeTopic,
  );

  return buildSummaryRows(
    scopedRecords,
    (record) => `${record.subject}::${record.topic}::${record.subtopic || record.topic}`,
    (record) => record.subtopic || record.topic,
  );
}

export function buildTopicReviewRecord(
  records: PracticeRecord[],
  subject: string,
  topic: string,
  subtopic?: string | null,
): PracticeRecord | null {
  // Single pass through records to compute aggregations
  let total = 0;
  let correct = 0;
  let incorrect = 0;
  let skipped = 0;
  const matchingRecords: PracticeRecord[] = [];
  
  const safeSubject = subject.trim();
  const safeTopic = topic.trim();
  const safeSubtopic = subtopic?.trim();
  
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    if (record.subject !== safeSubject || record.topic !== safeTopic) continue;
    if (safeSubtopic && (record.subtopic || record.topic) !== safeSubtopic) continue;
    
    matchingRecords.push(record);
    total += Number(record.total) || 0;
    correct += Number(record.correct) || 0;
    incorrect += Number(record.incorrect) || 0;
    skipped += Number(record.skipped) || 0;
  }

  if (matchingRecords.length === 0) return null;

  const accuracy = total === 0 ? 0 : round2((correct / total) * 100);

  const incorrectDetails: PracticeQuestionDetail[] = matchingRecords.flatMap((record) =>
    (record.incorrectDetails || []).map((detail) => ({
      ...detail,
      sourceRecordId: detail.sourceRecordId || record.id,
      sourceRecordDate: record.date,
      sourceRecordDateValue: record.dateValue,
      sourceRecordCreatedAt: record.createdAt,
    })),
  );

  return {
    id: `summary-${subject}-${topic}${subtopic ? `-${subtopic}` : ""}`,
    subject,
    topic,
    subtopic: subtopic || undefined,
    total,
    correct,
    incorrect,
    skipped,
    accuracy,
    difficulty: "Mixed",
    dateValue: "",
    date: "Aggregated",
    createdAt: matchingRecords[0]?.createdAt || "",
    incorrectDetails,
  };
}

export function groupRecordsByDate(records: PracticeRecord[]): AttemptLedgerDateGroup[] {
  // Single pass to group records by date
  const groups = new Map<string, { record: PracticeRecord; wrongCount: number }[]>();

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const dateKey = record.dateValue || "undated";
    const existing = groups.get(dateKey) || [];
    const wrongQuestionCount =
      Array.isArray(record.incorrectDetails) && record.incorrectDetails.length > 0
        ? record.incorrectDetails.length
        : (Number(record.incorrect) || 0) + (Number(record.skipped) || 0);
    existing.push({ record, wrongCount: wrongQuestionCount });
    groups.set(dateKey, existing);
  }

  const result: AttemptLedgerDateGroup[] = [];
  
  for (const [dateKey, dateRecords] of groups.entries()) {
    // Sort attempts within date group by createdAt
    const sortedRecords = [...dateRecords].sort(
      (first, second) => toTimestamp(first.record.createdAt) - toTimestamp(second.record.createdAt)
    );
    
    let totalQuestions = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalSkipped = 0;
    
    const attempts = sortedRecords.map((entry, index) => {
      totalQuestions += Number(entry.record.total) || 0;
      totalCorrect += Number(entry.record.correct) || 0;
      totalIncorrect += Number(entry.record.incorrect) || 0;
      totalSkipped += Number(entry.record.skipped) || 0;
      
      return {
        attemptNumber: index + 1,
        record: entry.record,
        wrongQuestionCount: entry.wrongCount,
      };
    });

    result.push({
      dateKey,
      dateLabel: sortedRecords[0]?.record?.date || "N/A",
      attemptCount: attempts.length,
      totalQuestions,
      totalCorrect,
      totalIncorrect,
      totalSkipped,
      attempts,
    });
  }

  // Sort by date descending
  return result.sort((first, second) => {
    const firstTime = toTimestamp(first.dateKey);
    const secondTime = toTimestamp(second.dateKey);
    return secondTime - firstTime;
  });
}
