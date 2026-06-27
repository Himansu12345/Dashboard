import type {
  RevisionDashboardPayload,
  RevisionPriority,
  RevisionReviewOutcome,
  RevisionTopic,
} from "@/types/revision";
import {
  buildApiUrl,
  parseJsonSafely,
  toApiErrorMessage,
} from "@/lib/api/client";

function buildRevisionUrl(path: string): string {
  return buildApiUrl(path);
}

function toFiniteNumber(value: unknown): number {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function normalizePriority(value: unknown): RevisionPriority {
  return ["Critical", "High", "Medium", "Stable"].includes(String(value))
    ? (value as RevisionPriority)
    : "Medium";
}

function normalizeOutcome(value: unknown): RevisionReviewOutcome | null {
  return value === "correct" || value === "wrong" ? value : null;
}

function normalizeRevisionTopic(input: unknown): RevisionTopic | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const id = typeof raw.id === "string" ? raw.id : "";
  if (!id) return null;

  return {
    id,
    topicKey: typeof raw.topicKey === "string" ? raw.topicKey : "",
    subject: typeof raw.subject === "string" ? raw.subject : "Unknown",
    topic: typeof raw.topic === "string" ? raw.topic : "Unknown",
    attemptsCount: toFiniteNumber(raw.attemptsCount),
    totalQuestions: toFiniteNumber(raw.totalQuestions),
    correctCount: toFiniteNumber(raw.correctCount),
    incorrectCount: toFiniteNumber(raw.incorrectCount),
    skippedCount: toFiniteNumber(raw.skippedCount),
    accuracy: toFiniteNumber(raw.accuracy),
    repeatedMistakeCount: toFiniteNumber(raw.repeatedMistakeCount),
    lastAttemptAt: typeof raw.lastAttemptAt === "string" ? raw.lastAttemptAt : null,
    lastReviewedAt: typeof raw.lastReviewedAt === "string" ? raw.lastReviewedAt : null,
    nextReviewDate: typeof raw.nextReviewDate === "string" ? raw.nextReviewDate : null,
    revisionStrength: toFiniteNumber(raw.revisionStrength),
    retentionScore: toFiniteNumber(raw.retentionScore),
    decayScore: toFiniteNumber(raw.decayScore),
    overdueDays: toFiniteNumber(raw.overdueDays),
    priority: normalizePriority(raw.priority),
    reviewHistory: Array.isArray(raw.reviewHistory)
      ? raw.reviewHistory
          .map((entry) => {
            if (!entry || typeof entry !== "object") return null;
            const history = entry as Record<string, unknown>;
            const outcome = normalizeOutcome(history.outcome);
            if (!outcome) return null;
            return {
              reviewedAt:
                typeof history.reviewedAt === "string" ? history.reviewedAt : null,
              outcome,
              intervalDays: toFiniteNumber(history.intervalDays),
              retentionScoreBefore: toFiniteNumber(history.retentionScoreBefore),
              retentionScoreAfter: toFiniteNumber(history.retentionScoreAfter),
              revisionStrengthAfter: toFiniteNumber(history.revisionStrengthAfter),
              nextReviewDate:
                typeof history.nextReviewDate === "string"
                  ? history.nextReviewDate
                  : null,
            };
          })
          .filter((entry): entry is RevisionTopic["reviewHistory"][number] => Boolean(entry))
      : [],
    lastReviewOutcome: normalizeOutcome(raw.lastReviewOutcome),
    status: raw.status === "archived" ? "archived" : "active",
    daysSinceReference: toFiniteNumber(raw.daysSinceReference),
  };
}

function normalizeRevisionDashboardPayload(input: unknown): RevisionDashboardPayload {
  const raw = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const normalizeTopicList = (value: unknown): RevisionTopic[] =>
    Array.isArray(value)
      ? value
          .map((entry) => normalizeRevisionTopic(entry))
          .filter((entry): entry is RevisionTopic => Boolean(entry))
      : [];

  return {
    generatedAt:
      typeof raw.generatedAt === "string" ? raw.generatedAt : new Date().toISOString(),
    summary: {
      totalTrackedTopics: toFiniteNumber((raw.summary as Record<string, unknown>)?.totalTrackedTopics),
      dueTodayCount: toFiniteNumber((raw.summary as Record<string, unknown>)?.dueTodayCount),
      overdueCount: toFiniteNumber((raw.summary as Record<string, unknown>)?.overdueCount),
      fadingCount: toFiniteNumber((raw.summary as Record<string, unknown>)?.fadingCount),
      averageRetentionScore: toFiniteNumber(
        (raw.summary as Record<string, unknown>)?.averageRetentionScore,
      ),
      priorityCounts: {
        Critical: toFiniteNumber(
          ((raw.summary as Record<string, unknown>)?.priorityCounts as Record<string, unknown>)
            ?.Critical,
        ),
        High: toFiniteNumber(
          ((raw.summary as Record<string, unknown>)?.priorityCounts as Record<string, unknown>)
            ?.High,
        ),
        Medium: toFiniteNumber(
          ((raw.summary as Record<string, unknown>)?.priorityCounts as Record<string, unknown>)
            ?.Medium,
        ),
        Stable: toFiniteNumber(
          ((raw.summary as Record<string, unknown>)?.priorityCounts as Record<string, unknown>)
            ?.Stable,
        ),
      },
    },
    queueTopics: normalizeTopicList(raw.queueTopics),
    fadingTopics: normalizeTopicList(raw.fadingTopics),
    overdueTopics: normalizeTopicList(raw.overdueTopics),
    recentlyStrengthenedTopics: normalizeTopicList(raw.recentlyStrengthenedTopics),
    allTopics: normalizeTopicList(raw.allTopics),
  };
}

export async function fetchRevisionDashboard(): Promise<RevisionDashboardPayload> {
  const response = await fetch(buildRevisionUrl("/api/revision/dashboard"), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await toApiErrorMessage(response, "Unable to fetch revision dashboard"));
  }

  const payload = await parseJsonSafely<{ data?: unknown }>(response);
  return normalizeRevisionDashboardPayload(payload?.data);
}

export async function reviewRevisionTopic(payload: {
  id: string;
  outcome: RevisionReviewOutcome;
}): Promise<RevisionTopic> {
  const response = await fetch(
    buildRevisionUrl(`/api/revision/${encodeURIComponent(payload.id)}/review`),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcome: payload.outcome }),
    },
  );

  if (!response.ok) {
    throw new Error(await toApiErrorMessage(response, "Unable to review revision topic"));
  }

  const parsed = await parseJsonSafely<{ data?: unknown }>(response);
  const normalized = normalizeRevisionTopic(parsed?.data);
  if (!normalized) throw new Error("Updated revision payload is invalid");
  return normalized;
}
