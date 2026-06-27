import { normalizeQuestionNotesValue } from "@/app/appClientUtils";
import type { PracticeRecord } from "@/types/records";
import type { TopicDetailSource, TopicNoteSource } from "./topicNotesTypes";

export function splitTopicNotes(value: string): string[] {
  return value
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function stripTopicNoteNumbering(value: string): string {
  return value.replace(/^\s*\d+\.\s*/, "").trim();
}

export function normalizeTopicNoteBlocks(value: string): string[] {
  return splitTopicNotes(value)
    .map((entry) => stripTopicNoteNumbering(entry))
    .filter(Boolean);
}

export function formatTopicNotesWithNumbering(notes: string[]): string {
  return notes
    .map((note, index) => `${index + 1}. ${stripTopicNoteNumbering(note)}`)
    .join("\n\n");
}

export function areArraysEqual(first: string[], second: string[]): boolean {
  if (first === second) return true;
  if (first.length !== second.length) return false;
  for (let index = 0; index < first.length; index += 1) {
    if (first[index] !== second[index]) return false;
  }
  return true;
}

export function buildTopicSources(
  records: PracticeRecord[],
  subject: string,
  topic: string,
): {
  detailSources: TopicDetailSource[];
  noteSources: TopicNoteSource[];
} {
  const detailSources: TopicDetailSource[] = [];
  const noteSources: TopicNoteSource[] = [];

  for (let recordIndex = 0; recordIndex < records.length; recordIndex += 1) {
    const record = records[recordIndex];
    if (record.subject !== subject || record.topic !== topic) continue;

    const incorrectDetails = Array.isArray(record.incorrectDetails)
      ? record.incorrectDetails
      : [];

    for (
      let detailIndex = 0;
      detailIndex < incorrectDetails.length;
      detailIndex += 1
    ) {
      const detail = incorrectDetails[detailIndex];
      const question = detail.question?.trim();
      if (!question) continue;

      const baseSource = {
        id: detail.sourceRecordId || record.id,
        question: detail.question,
        selectedAnswer: detail.selectedAnswer || "",
        correctAnswer: detail.correctAnswer || "",
      };

      detailSources.push(baseSource);

      const notes = normalizeQuestionNotesValue(detail);
      for (let noteIndex = 0; noteIndex < notes.length; noteIndex += 1) {
        const text = notes[noteIndex];
        if (!text.trim()) continue;
        noteSources.push({
          ...baseSource,
          noteIndex,
          text,
        });
      }
    }
  }

  return { detailSources, noteSources };
}

export function buildTopicSaveActions(
  noteSources: TopicNoteSource[],
  detailSources: TopicDetailSource[],
  draft: string,
): Array<{
  id: string;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  note: string;
  mode?: "add" | "edit" | "delete";
  noteIndex?: number;
}> {
  const nextNotes = normalizeTopicNoteBlocks(draft);
  const actions: Array<{
    id: string;
    question: string;
    selectedAnswer: string;
    correctAnswer: string;
    note: string;
    mode?: "add" | "edit" | "delete";
    noteIndex?: number;
  }> = [];

  const overlappingCount = Math.min(noteSources.length, nextNotes.length);

  for (let index = 0; index < overlappingCount; index += 1) {
    const source = noteSources[index];
    const nextNote = nextNotes[index];
    if (source.text === nextNote) continue;

    actions.push({
      id: source.id,
      question: source.question,
      selectedAnswer: source.selectedAnswer,
      correctAnswer: source.correctAnswer,
      note: nextNote,
      mode: "edit",
      noteIndex: source.noteIndex,
    });
  }

  for (let index = noteSources.length - 1; index >= nextNotes.length; index -= 1) {
    const source = noteSources[index];
    actions.push({
      id: source.id,
      question: source.question,
      selectedAnswer: source.selectedAnswer,
      correctAnswer: source.correctAnswer,
      note: "",
      mode: "delete",
      noteIndex: source.noteIndex,
    });
  }

  const addTarget = detailSources[0];
  if (!addTarget) return actions;

  for (let index = noteSources.length; index < nextNotes.length; index += 1) {
    actions.push({
      id: addTarget.id,
      question: addTarget.question,
      selectedAnswer: addTarget.selectedAnswer,
      correctAnswer: addTarget.correctAnswer,
      note: nextNotes[index],
      mode: "add",
    });
  }

  return actions;
}
