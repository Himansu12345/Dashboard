import type {
  SyllabusTopicNoteDocument,
  SyllabusTopicNoteTarget,
} from "@/types/syllabus";
import {
  buildApiUrl,
  parseJsonSafely,
  toApiErrorMessage,
} from "@/lib/api/client";

function buildSyllabusTopicNotesUrl(path: string): string {
  return buildApiUrl(path);
}

function normalizeString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ");
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const cleaned = value
    .map((entry) => normalizeString(entry))
    .filter(Boolean);

  return Array.from(new Set(cleaned)).slice(0, 50);
}

function normalizeSyllabusTopicNoteDocument(input: unknown): SyllabusTopicNoteDocument | null {
  if (!input || typeof input !== "object") return null;

  const raw = input as Record<string, unknown>;
  const subject = normalizeString(raw.subject);
  const topicKey = normalizeString(raw.topicKey);
  const topicLabel = normalizeString(raw.topicLabel);
  const path = normalizeStringArray(raw.path);

  if (!subject || !topicKey || !topicLabel) return null;

  return {
    subject,
    topicKey,
    topicLabel,
    path,
    notes: normalizeStringArray(raw.notes),
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : null,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
  };
}

export async function fetchSyllabusTopicNotes(
  target: Pick<SyllabusTopicNoteTarget, "subject" | "topicKey">,
): Promise<SyllabusTopicNoteDocument> {
  const searchParams = new URLSearchParams({
    subject: target.subject,
    topicKey: target.topicKey,
  });
  const response = await fetch(
    buildSyllabusTopicNotesUrl(`/api/syllabus/topic-notes?${searchParams.toString()}`),
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(await toApiErrorMessage(response, "Unable to fetch syllabus topic notes."));
  }

  const payload = await parseJsonSafely<{ data?: unknown }>(response);
  const normalized = normalizeSyllabusTopicNoteDocument(payload?.data);
  if (!normalized) {
    return {
      subject: normalizeString(target.subject),
      topicKey: normalizeString(target.topicKey),
      topicLabel: "",
      path: [],
      notes: [],
      createdAt: null,
      updatedAt: null,
    };
  }
  return normalized;
}

export async function saveSyllabusTopicNotes(
  payload: SyllabusTopicNoteTarget & { notes: string[] },
): Promise<SyllabusTopicNoteDocument> {
  const response = await fetch(buildSyllabusTopicNotesUrl("/api/syllabus/topic-notes"), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subject: payload.subject,
      topicKey: payload.topicKey,
      topicLabel: payload.topicLabel,
      path: payload.path,
      notes: payload.notes,
    }),
  });

  if (!response.ok) {
    throw new Error(await toApiErrorMessage(response, "Unable to save syllabus topic notes."));
  }

  const parsed = await parseJsonSafely<{ data?: unknown }>(response);
  const normalized = normalizeSyllabusTopicNoteDocument(parsed?.data);
  if (!normalized) throw new Error("Saved syllabus topic note payload is invalid.");
  return normalized;
}
