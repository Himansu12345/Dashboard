import type { AttemptResponse } from "@/lib/api/attempts";
import type { PracticeRecord } from "@/types/records";

export function normalizeQuestionNotesValue(detail: {
  note?: string;
  notes?: string[];
}): string[] {
  const notes = Array.isArray(detail.notes)
    ? detail.notes
        .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
        .filter(Boolean)
    : [];

  if (notes.length > 0) return notes;

  const legacyNote = typeof detail.note === "string" ? detail.note.trim() : "";
  return legacyNote ? [legacyNote] : [];
}

export function normalizeQuestionWhyValue(detail: {
  why?: string;
}): string {
  return typeof detail.why === "string" ? detail.why.trim() : "";
}

export function areQuestionDetailsEquivalent(
  previousDetails: PracticeRecord["incorrectDetails"],
  nextDetails: PracticeRecord["incorrectDetails"],
): boolean {
  // Early reference equality check for performance
  if (previousDetails === nextDetails) return true;
  
  const previousSafe = Array.isArray(previousDetails) ? previousDetails : [];
  const nextSafe = Array.isArray(nextDetails) ? nextDetails : [];

  if (previousSafe.length !== nextSafe.length) return false;

  for (let index = 0; index < previousSafe.length; index += 1) {
    const previous = previousSafe[index];
    const next = nextSafe[index];

    if (!previous || !next) return false;

    if (
      (previous.questionId || "") !== (next.questionId || "") ||
      previous.question !== next.question ||
      previous.correctAnswer !== next.correctAnswer ||
      previous.selectedAnswer !== next.selectedAnswer ||
      (previous.note || "") !== (next.note || "") ||
      normalizeQuestionWhyValue(previous) !== normalizeQuestionWhyValue(next)
    ) {
      return false;
    }

    const previousOptions = Array.isArray(previous.options) ? previous.options : [];
    const nextOptions = Array.isArray(next.options) ? next.options : [];

    if (previousOptions.length !== nextOptions.length) return false;
    for (let optionIndex = 0; optionIndex < previousOptions.length; optionIndex += 1) {
      if (previousOptions[optionIndex] !== nextOptions[optionIndex]) {
        return false;
      }
    }

    const previousNotes = normalizeQuestionNotesValue(previous);
    const nextNotes = normalizeQuestionNotesValue(next);
    if (previousNotes.length !== nextNotes.length) return false;
    for (let noteIndex = 0; noteIndex < previousNotes.length; noteIndex += 1) {
      if (previousNotes[noteIndex] !== nextNotes[noteIndex]) {
        return false;
      }
    }
  }

  return true;
}

export function buildQuestionDetailKey({
  questionId,
  question,
  selectedAnswer,
  correctAnswer,
}: {
  questionId?: string;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
}): string {
  return questionId
    ? `id::${questionId}`
    : `${question}::${selectedAnswer}::${correctAnswer}`;
}

export function withUpdatedQuestionNote(
  attempt: AttemptResponse,
  payload: {
    questionId?: string;
    question: string;
    selectedAnswer: string;
    correctAnswer: string;
    note: string;
    field?: "note" | "why";
    mode?: "add" | "edit" | "replace" | "delete";
    noteIndex?: number;
  },
): AttemptResponse {
  const targetKey = buildQuestionDetailKey(payload);
  const field = payload.field || "note";

  const applyNote = (details: AttemptResponse["incorrectDetails"]) =>
    (Array.isArray(details) ? details : []).map((detail) => {
      const detailKey = buildQuestionDetailKey(detail);
      if (detailKey !== targetKey) return detail;

      if (field === "why") {
        const nextWhy = payload.mode === "delete" ? "" : payload.note.trim();
        return { ...detail, why: nextWhy };
      }

      const currentNotes = normalizeQuestionNotesValue(detail);
      const mode = payload.mode || "replace";
      let nextNotes = currentNotes;

      if (mode === "add") {
        nextNotes = Array.from(new Set([...currentNotes, payload.note])).slice(0, 50);
      } else if (mode === "edit" && Number.isInteger(payload.noteIndex)) {
        const targetIndex = payload.noteIndex as number;
        if (targetIndex >= 0 && targetIndex < currentNotes.length) {
          nextNotes = currentNotes.map((entry, index) =>
            index === targetIndex ? payload.note : entry,
          );
        }
      } else if (mode === "delete") {
        if (!Number.isInteger(payload.noteIndex)) {
          nextNotes = [];
        } else {
          const targetIndex = payload.noteIndex as number;
          nextNotes = currentNotes.filter((_entry, index) => index !== targetIndex);
        }
      } else {
        nextNotes = payload.note ? [payload.note] : [];
      }

      return { ...detail, notes: nextNotes, note: nextNotes[0] || "" };
    });

  return {
    ...attempt,
    incorrectDetails: applyNote(attempt.incorrectDetails),
    skippedDetails: applyNote(attempt.skippedDetails),
  };
}

export function areRecordsEquivalent(previous: PracticeRecord[], next: PracticeRecord[]): boolean {
  // Early reference equality check for performance
  if (previous === next) return true;
  
  if (previous.length !== next.length) return false;

  for (let index = 0; index < previous.length; index += 1) {
    const previousRecord = previous[index];
    const nextRecord = next[index];

    if (!previousRecord || !nextRecord) return false;

    if (
      previousRecord.id !== nextRecord.id ||
      previousRecord.subject !== nextRecord.subject ||
      previousRecord.topic !== nextRecord.topic ||
      previousRecord.total !== nextRecord.total ||
      previousRecord.correct !== nextRecord.correct ||
      previousRecord.incorrect !== nextRecord.incorrect ||
      previousRecord.skipped !== nextRecord.skipped ||
      previousRecord.accuracy !== nextRecord.accuracy ||
      previousRecord.difficulty !== nextRecord.difficulty ||
      previousRecord.dateValue !== nextRecord.dateValue ||
      previousRecord.date !== nextRecord.date ||
      !areQuestionDetailsEquivalent(previousRecord.incorrectDetails, nextRecord.incorrectDetails)
    ) {
      return false;
    }
  }

  return true;
}
