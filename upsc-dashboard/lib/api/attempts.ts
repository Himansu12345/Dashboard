import type { PracticeRecord } from "@/types/records";
import {
  buildApiUrl,
  parseJsonSafely,
  toApiErrorMessage,
} from "@/lib/api/client";

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function buildAttemptsUrl(path: string): string {
  return buildApiUrl(path);
}

function toFiniteNumber(value: unknown): number {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function normalizeNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeIsoDateValue(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function parseDateInput(value: string | null): Date | null {
  if (!value) return null;
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

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function toIsoDateFromDateTime(value: string | null): string {
  const parsed = parseDateInput(value);
  if (!parsed) return "";
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDisplayDate(value: string | null): string {
  const parsed = parseDateInput(value);
  if (!parsed) return "N/A";
  return parsed.toLocaleDateString();
}

function normalizeOption(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.trim().replace(/\s+/g, " ");
  return cleaned.length > 0 ? cleaned : null;
}

function normalizeNoteValue(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n?/g, "\n").trim().slice(0, 2000);
}

function normalizeNoteValues(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const cleaned = value
    .map((entry) => normalizeNoteValue(entry))
    .filter(Boolean);

  return Array.from(new Set(cleaned)).slice(0, 50);
}

function normalizeQuestionText(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const cleaned = value
    .replace(/\u00a0/g, " ")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .trim();

  return cleaned.length > 0 ? cleaned : null;
}

function normalizeOptions(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const cleaned = value
    .map((option) => normalizeOption(option))
    .filter((option): option is string => Boolean(option));

  const deduped = Array.from(new Set(cleaned));
  return deduped.slice(0, 4);
}

export interface AttemptQuestionDetail {
  questionId?: string;
  question: string;
  options: string[];
  correctAnswer: string;
  selectedAnswer: string;
  reviewKind?: "incorrect" | "skipped";
  notes: string[];
  note: string;
  why: string;
}

function normalizeAttemptQuestionDetail(input: unknown): AttemptQuestionDetail | null {
  if (!input || typeof input !== "object") return null;

  const raw = input as Record<string, unknown>;
  const question = normalizeQuestionText(raw.question);
  if (!question) return null;
  const questionId = normalizeNullableString(raw.questionId) || undefined;

  const notes = normalizeNoteValues(raw.notes);
  const legacyNote = normalizeNoteValue(raw.note);
  const mergedNotes = notes.length > 0 ? notes : legacyNote ? [legacyNote] : [];

  return {
    questionId,
    question,
    options: normalizeOptions(raw.options),
    correctAnswer: normalizeOption(raw.correctAnswer) || "",
    selectedAnswer: normalizeOption(raw.selectedAnswer) || "",
    reviewKind:
      raw.reviewKind === "skipped"
        ? "skipped"
        : raw.reviewKind === "incorrect"
          ? "incorrect"
          : undefined,
    notes: mergedNotes,
    note: mergedNotes[0] || "",
    why: normalizeNoteValue(raw.why),
  };
}

function normalizeAttemptQuestionDetails(input: unknown): AttemptQuestionDetail[] {
  if (!Array.isArray(input)) return [];

  const map = new Map<string, AttemptQuestionDetail>();

  input
    .map((detail) => normalizeAttemptQuestionDetail(detail))
    .filter((detail): detail is AttemptQuestionDetail => Boolean(detail))
    .forEach((detail) => {
      const key = detail.questionId
        ? `id::${detail.questionId}`
        : `${detail.question}::${detail.selectedAnswer}::${detail.correctAnswer}`;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, detail);
        return;
      }

      const mergedNotes = Array.from(new Set([...(existing.notes || []), ...(detail.notes || [])])).slice(
        0,
        50,
      );
      const mergedWhy = existing.why || detail.why || "";
      const existingSignature = (existing.notes || []).join("::");
      const mergedSignature = mergedNotes.join("::");
      if (existingSignature !== mergedSignature || mergedWhy !== existing.why) {
        map.set(key, {
          ...existing,
          reviewKind: existing.reviewKind || detail.reviewKind,
          notes: mergedNotes,
          note: mergedNotes[0] || "",
          why: mergedWhy,
        });
      }
    });

  return Array.from(map.values());
}

export interface AttemptResponse {
  _id: string;
  subject: string | null;
  topic: string | null;
  subtopic?: string | null;
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
  difficulty: string;
  dateValue: string | null;
  accuracy: number;
  incorrectDetails: AttemptQuestionDetail[];
  correctDetails: AttemptQuestionDetail[];
  skippedDetails: AttemptQuestionDetail[];
  deletedAt?: string | null;
  createdAt: string;
}

export interface UpdateAttemptClassificationPayload {
  id: string;
  subject: string;
  topic: string;
  subtopic?: string | null;
  difficulty: string;
}

export interface UpdateAttemptQuestionNotePayload {
  id: string;
  questionId?: string;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  note: string;
  field?: "note" | "why";
  mode?: "add" | "edit" | "replace" | "delete";
  noteIndex?: number;
}

export interface CreateAttemptQuestionDetailPayload {
  questionId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  selectedAnswer: string;
}

export interface CreateAttemptPayload {
  subject: string;
  topic: string;
  subtopic?: string | null;
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
  difficulty: string;
  dateValue: string;
  attemptKey?: string;
  quizSignature?: string;
  correctDetails?: CreateAttemptQuestionDetailPayload[];
  incorrectDetails?: CreateAttemptQuestionDetailPayload[];
  skippedDetails?: CreateAttemptQuestionDetailPayload[];
}

export interface CreateAttemptResponse {
  message: string;
  id: string | null;
  duplicate: boolean;
  restored: boolean;
}

function normalizeAttempt(input: unknown): AttemptResponse | null {
  if (!input || typeof input !== "object") return null;

  const raw = input as Partial<AttemptResponse> & Record<string, unknown>;
  const id = typeof raw._id === "string" ? raw._id : "";
  if (!id) return null;

  const createdAt = typeof raw.createdAt === "string" ? raw.createdAt : "";
  const deletedAt = typeof raw.deletedAt === "string" ? raw.deletedAt : null;

  return {
    _id: id,
    subject: normalizeNullableString(raw.subject),
    topic: normalizeNullableString(raw.topic),
    subtopic: normalizeNullableString(raw.subtopic),
    total: toFiniteNumber(raw.total),
    correct: toFiniteNumber(raw.correct),
    incorrect: toFiniteNumber(raw.incorrect),
    skipped: toFiniteNumber(raw.skipped),
    difficulty: normalizeNullableString(raw.difficulty) || "Unknown",
    dateValue: normalizeIsoDateValue(raw.dateValue),
    accuracy: toFiniteNumber(raw.accuracy),
    incorrectDetails: normalizeAttemptQuestionDetails(raw.incorrectDetails),
    correctDetails: normalizeAttemptQuestionDetails(raw.correctDetails),
    skippedDetails: normalizeAttemptQuestionDetails(raw.skippedDetails),
    deletedAt,
    createdAt,
  };
}

function byCreatedAtDesc(a: AttemptResponse, b: AttemptResponse): number {
  const aTime = new Date(a.createdAt).getTime();
  const bTime = new Date(b.createdAt).getTime();
  const primary = (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0);
  if (primary !== 0) return primary;

  return b._id.localeCompare(a._id);
}

function byDeletedAtDesc(a: AttemptResponse, b: AttemptResponse): number {
  const aTime = a.deletedAt ? new Date(a.deletedAt).getTime() : 0;
  const bTime = b.deletedAt ? new Date(b.deletedAt).getTime() : 0;
  const primary = (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0);
  if (primary !== 0) return primary;
  return byCreatedAtDesc(a, b);
}

export function mapAttemptToPracticeRecord(attempt: AttemptResponse): PracticeRecord {
  const safeDateValue = attempt.dateValue || toIsoDateFromDateTime(attempt.createdAt);
  const displayDateSource = safeDateValue || attempt.createdAt || null;
  const reviewDetails = normalizeAttemptQuestionDetails([
    ...(attempt.incorrectDetails || []).map((detail) => ({
      ...detail,
      reviewKind: "incorrect" as const,
    })),
    ...(attempt.skippedDetails || []).map((detail) => ({
      ...detail,
      reviewKind: "skipped" as const,
    })),
  ]).map((detail) => ({
    ...detail,
    sourceRecordId: attempt._id,
    sourceRecordDate: toDisplayDate(displayDateSource),
    sourceRecordDateValue: safeDateValue,
    sourceRecordCreatedAt: attempt.createdAt,
    sourceSubject: attempt.subject || "Unknown",
    sourceTopic: attempt.topic || "Unknown",
    sourceSubtopic: attempt.subtopic || undefined,
    sourceDifficulty: attempt.difficulty || "Unknown",
  }));

  return {
    id: attempt._id,
    subject: attempt.subject || "Unknown",
    topic: attempt.topic || "Unknown",
    subtopic: attempt.subtopic || undefined,
    total: attempt.total,
    correct: attempt.correct,
    incorrect: attempt.incorrect,
    skipped: attempt.skipped,
    accuracy: toFiniteNumber(attempt.accuracy),
    difficulty: attempt.difficulty || "Unknown",
    dateValue: safeDateValue,
    date: toDisplayDate(displayDateSource),
    createdAt: attempt.createdAt,
    deletedAt: attempt.deletedAt || null,
    incorrectDetails: reviewDetails,
  };
}

export async function createAttempt(
  payload: CreateAttemptPayload,
): Promise<CreateAttemptResponse> {
  const response = await fetch(buildAttemptsUrl("/api/attempt"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await toApiErrorMessage(response, "Unable to save attempt"));
  }

  const parsed = await parseJsonSafely<Partial<CreateAttemptResponse>>(response);
  return {
    message: parsed?.message || "Attempt saved.",
    id: typeof parsed?.id === "string" ? parsed.id : null,
    duplicate: Boolean(parsed?.duplicate),
    restored: Boolean(parsed?.restored),
  };
}

export async function fetchAttempts(): Promise<AttemptResponse[]> {
  const response = await fetch(buildAttemptsUrl("/api/attempt"), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await toApiErrorMessage(response, "Unable to fetch attempts"));
  }

  const payload = await parseJsonSafely<unknown[]>(response);
  if (!Array.isArray(payload)) return [];

  return payload
    .map((item) => normalizeAttempt(item))
    .filter((item): item is AttemptResponse => Boolean(item))
    .sort(byDeletedAtDesc);
}

export async function fetchDeletedAttempts(): Promise<AttemptResponse[]> {
  const response = await fetch(buildAttemptsUrl("/api/attempt/recycle-bin"), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await toApiErrorMessage(response, "Unable to fetch recycle bin attempts"));
  }

  const payload = await parseJsonSafely<unknown[]>(response);
  if (!Array.isArray(payload)) return [];

  return payload
    .map((item) => normalizeAttempt(item))
    .filter((item): item is AttemptResponse => Boolean(item))
    .sort(byDeletedAtDesc);
}

export async function deleteAttempt(id: string): Promise<void> {
  const response = await fetch(buildAttemptsUrl(`/api/attempt/${encodeURIComponent(id)}`), {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(await toApiErrorMessage(response, "Unable to delete attempt"));
  }
}

export async function restoreAttempt(id: string): Promise<void> {
  const response = await fetch(buildAttemptsUrl(`/api/attempt/${encodeURIComponent(id)}/restore`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(await toApiErrorMessage(response, "Unable to restore attempt"));
  }
}

export async function permanentlyDeleteAttempt(id: string): Promise<void> {
  const encodedId = encodeURIComponent(id);
  const tryPermanentDelete = async (path: string, method: "DELETE" | "POST"): Promise<Response> =>
    fetch(buildAttemptsUrl(path), {
      method,
      headers: { "Content-Type": "application/json" },
    });

  let response = await tryPermanentDelete(`/api/attempt/${encodedId}/permanent`, "DELETE");
  if (response.status === 404) {
    response = await tryPermanentDelete(`/api/attempt/${encodedId}/permanent`, "POST");
  }
  if (response.status === 404) {
    response = await tryPermanentDelete(`/api/attempt/${encodedId}/permanent-delete`, "DELETE");
  }
  if (response.status === 404) {
    response = await tryPermanentDelete(`/api/attempt/${encodedId}/hard-delete`, "DELETE");
  }

  if (!response.ok) {
    throw new Error(await toApiErrorMessage(response, "Unable to permanently delete attempt"));
  }
}

export async function updateAttemptClassification(
  payload: UpdateAttemptClassificationPayload,
): Promise<AttemptResponse> {
  const response = await fetch(buildAttemptsUrl(`/api/attempt/${encodeURIComponent(payload.id)}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subject: payload.subject,
      topic: payload.topic,
      subtopic: payload.subtopic || null,
      difficulty: payload.difficulty,
    }),
  });

  if (!response.ok) {
    throw new Error(await toApiErrorMessage(response, "Unable to classify attempt"));
  }

  const parsed = await parseJsonSafely<{ data?: unknown }>(response);
  const normalized = normalizeAttempt(parsed?.data);
  if (!normalized) throw new Error("Updated attempt payload is invalid");
  return normalized;
}

export async function updateAttemptQuestionNote(
  payload: UpdateAttemptQuestionNotePayload,
): Promise<AttemptResponse> {
  const requestPayload: Record<string, unknown> = {
    questionId: payload.questionId,
    question: payload.question,
    selectedAnswer: payload.selectedAnswer,
    correctAnswer: payload.correctAnswer,
    note: payload.note,
    field: payload.field || "note",
    mode: payload.mode || "replace",
  };
  if (Number.isInteger(payload.noteIndex)) {
    requestPayload.noteIndex = payload.noteIndex;
  }

  const requestBody = JSON.stringify(requestPayload);

  const trySaveNote = async (path: string, method: "PATCH" | "POST"): Promise<Response> =>
    fetch(buildAttemptsUrl(path), {
      method,
      headers: { "Content-Type": "application/json" },
      body: requestBody,
    });

  const primaryPath = `/api/attempt/${encodeURIComponent(payload.id)}/question-note`;
  const legacyPath = `/api/attempt/${encodeURIComponent(payload.id)}/note`;

  let response = await trySaveNote(primaryPath, "PATCH");
  if (response.status === 404) {
    response = await trySaveNote(primaryPath, "POST");
  }
  if (response.status === 404) {
    response = await trySaveNote(legacyPath, "PATCH");
  }
  if (response.status === 404) {
    response = await trySaveNote(legacyPath, "POST");
  }

  if (!response.ok) {
    throw new Error(await toApiErrorMessage(response, "Unable to save question note"));
  }

  const parsed = await parseJsonSafely<{ data?: unknown }>(response);
  const normalized = normalizeAttempt(parsed?.data);
  if (!normalized) throw new Error("Updated attempt payload is invalid");
  return normalized;
}
