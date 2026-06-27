import type {
  SyllabusDashboardPayload,
  SyllabusInsight,
  SyllabusNodeData,
  SyllabusRetentionStatus,
  SyllabusSummary,
  SyllabusTrendPoint,
} from "@/types/syllabus";
import {
  buildApiUrl,
  parseJsonSafely,
  toApiErrorMessage,
} from "@/lib/api/client";

function buildSyllabusUrl(path: string): string {
  return buildApiUrl(path);
}

function toFiniteNumber(value: unknown): number {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function normalizeRetentionStatus(value: unknown): SyllabusRetentionStatus {
  return ["Needs Revision", "Shaky", "Stabilizing", "Strong"].includes(String(value))
    ? (value as SyllabusRetentionStatus)
    : "Needs Revision";
}

function normalizeTrendPoint(input: unknown): SyllabusTrendPoint | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const label = typeof raw.label === "string" ? raw.label : "";
  if (!label) return null;
  return {
    label,
    value: toFiniteNumber(raw.value),
  };
}

function normalizeNode(input: unknown): SyllabusNodeData | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const id = typeof raw.id === "string" ? raw.id : "";
  if (!id) return null;
  const metrics =
    raw.metrics && typeof raw.metrics === "object"
      ? (raw.metrics as Record<string, unknown>)
      : {};

  return {
    id,
    parentId: typeof raw.parentId === "string" ? raw.parentId : null,
    label: typeof raw.label === "string" ? raw.label : "Unknown",
    subject: typeof raw.subject === "string" ? raw.subject : "Unknown",
    topic: typeof raw.topic === "string" ? raw.topic : null,
    level:
      raw.level === "root" || raw.level === "subject" || raw.level === "topic"
        ? raw.level
        : "topic",
    masteryState: ["untouched", "weak", "improving", "mastered"].includes(String(raw.masteryState))
      ? (raw.masteryState as SyllabusNodeData["masteryState"])
      : "untouched",
    retentionStatus: normalizeRetentionStatus(raw.retentionStatus),
    attempted: Boolean(raw.attempted),
    metrics: {
      masteryScore: toFiniteNumber(metrics.masteryScore),
      accuracy: toFiniteNumber(metrics.accuracy),
      retentionStrength: toFiniteNumber(metrics.retentionStrength),
      revisionHealth: toFiniteNumber(metrics.revisionHealth),
      consistencyImpact: toFiniteNumber(metrics.consistencyImpact),
      repeatedMistakes: toFiniteNumber(metrics.repeatedMistakes),
      revisionFrequency: toFiniteNumber(metrics.revisionFrequency),
      progressDelta: toFiniteNumber(metrics.progressDelta),
    },
    weakSubtopics: Array.isArray(raw.weakSubtopics)
      ? raw.weakSubtopics.filter((entry): entry is string => typeof entry === "string")
      : [],
    revisionHistory: Array.isArray(raw.revisionHistory)
      ? raw.revisionHistory
          .map((entry) => normalizeTrendPoint(entry))
          .filter((entry): entry is SyllabusTrendPoint => Boolean(entry))
      : [],
    recentlyMasteredAt: typeof raw.recentlyMasteredAt === "string" ? raw.recentlyMasteredAt : null,
  };
}

function normalizeInsight(input: unknown): SyllabusInsight | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const id = typeof raw.id === "string" ? raw.id : "";
  if (!id) return null;
  return {
    id,
    title: typeof raw.title === "string" ? raw.title : "Insight",
    description: typeof raw.description === "string" ? raw.description : "",
    tone: ["teal", "mint", "amber", "rose"].includes(String(raw.tone))
      ? (raw.tone as SyllabusInsight["tone"])
      : "teal",
  };
}

function normalizeSummary(input: unknown): SyllabusSummary {
  const raw = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  return {
    totalTopics: toFiniteNumber(raw.totalTopics),
    masteredTopics: toFiniteNumber(raw.masteredTopics),
    improvingTopics: toFiniteNumber(raw.improvingTopics),
    weakTopics: toFiniteNumber(raw.weakTopics),
    untouchedTopics: toFiniteNumber(raw.untouchedTopics),
    strongestSubject: typeof raw.strongestSubject === "string" ? raw.strongestSubject : "No subject yet",
    fastestImprovingTopic:
      typeof raw.fastestImprovingTopic === "string" ? raw.fastestImprovingTopic : "No topic yet",
    recentlyMasteredCount: toFiniteNumber(raw.recentlyMasteredCount),
    overallMasteryScore: toFiniteNumber(raw.overallMasteryScore),
  };
}

function normalizeSyllabusDashboardPayload(input: unknown): SyllabusDashboardPayload {
  const raw = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  return {
    generatedAt:
      typeof raw.generatedAt === "string" ? raw.generatedAt : new Date().toISOString(),
    summary: normalizeSummary(raw.summary),
    nodes: Array.isArray(raw.nodes)
      ? raw.nodes.map((entry) => normalizeNode(entry)).filter((entry): entry is SyllabusNodeData => Boolean(entry))
      : [],
    insights: Array.isArray(raw.insights)
      ? raw.insights
          .map((entry) => normalizeInsight(entry))
          .filter((entry): entry is SyllabusInsight => Boolean(entry))
      : [],
  };
}

export async function fetchSyllabusDashboard(): Promise<SyllabusDashboardPayload> {
  const response = await fetch(buildSyllabusUrl("/api/syllabus/tree"), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await toApiErrorMessage(response, "Unable to fetch syllabus dashboard"));
  }

  const payload = await parseJsonSafely<{ data?: unknown }>(response);
  return normalizeSyllabusDashboardPayload(payload?.data);
}
