import type { PracticeQuestionDetail } from "@/types/records";

export function normalizeComparisonValue(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function buildDetailKey(detail: {
  questionId?: string;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
}): string {
  return detail.questionId
    ? `id::${detail.questionId}`
    : `${detail.question}::${detail.selectedAnswer}::${detail.correctAnswer}`;
}

export function normalizeDetailNotes(
  detail: Pick<PracticeQuestionDetail, "note" | "notes">,
): string[] {
  const notes = Array.isArray(detail.notes)
    ? detail.notes
        .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
        .filter(Boolean)
    : [];

  if (notes.length > 0) return notes;

  const legacyNote = typeof detail.note === "string" ? detail.note.trim() : "";
  return legacyNote ? [legacyNote] : [];
}

export function normalizeDetail(
  detail: PracticeQuestionDetail,
): PracticeQuestionDetail {
  const options = Array.from(
    new Set(
      (detail.options || []).map((option) => option.trim()).filter(Boolean),
    ),
  ).slice(0, 4);

  const notes = normalizeDetailNotes(detail);

  return {
    questionId: detail.questionId,
    question: detail.question,
    options,
    correctAnswer: detail.correctAnswer || "",
    selectedAnswer: detail.selectedAnswer || "",
    reviewKind: detail.reviewKind,
    notes,
    note: notes[0] || "",
    why: typeof detail.why === "string" ? detail.why.trim() : "",
    sourceRecordId: detail.sourceRecordId,
    sourceRecordDate: detail.sourceRecordDate,
    sourceRecordDateValue: detail.sourceRecordDateValue,
    sourceRecordCreatedAt: detail.sourceRecordCreatedAt,
    sourceSubject: detail.sourceSubject,
    sourceTopic: detail.sourceTopic,
    sourceSubtopic: detail.sourceSubtopic,
    sourceDifficulty: detail.sourceDifficulty,
  };
}
