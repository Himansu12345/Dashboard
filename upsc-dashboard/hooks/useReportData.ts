"use client";

import { useEffect, useState } from "react";
import { getReportData } from "@/trackingService";
import {
  buildReportData,
  type AiReadyReport,
} from "@/lib/report/buildReportData";
import type { SubjectCompletionTimes } from "@/app/subject-dashboard/types";

type LegacyNoteAction = {
  id?: string;
  timestamp: number;
  sessionId?: string | null;
  subject: string;
  action:
    | "completed"
    | "revised"
    | "starred"
    | "uncompleted"
    | "unrevised"
    | "unstarred";
  note: string;
  chapter?: string;
  topic?: string;
  subtopic?: string;
  point?: string;
  path?: string[];
  previousStatus?: Record<string, boolean>;
  newStatus?: Record<string, boolean>;
};

type SubjectProgressApiResponse = {
  progress: {
    checkedUids?: string[];
    completionTimes?: SubjectCompletionTimes;
    updatedAt?: number;
  } | null;
};

type PlannerApiResponse = {
  exists?: boolean;
  data?: Record<string, unknown> | null;
};

type RawWeeklyPlan = Record<string, unknown>;

const PLANNER_API_URL = "http://localhost:5000/api/planner";

const prelimsSubjects = [
  { label: "Polity", subject: "polity" },
  { label: "Geography", subject: "geography" },
  { label: "Economics", subject: "economics" },
  { label: "Ancient", subject: "ancient-history" },
  { label: "Modern History", subject: "modern-history" },
  { label: "Art&Culture", subject: "art-culture" },
  { label: "Sc&tech", subject: "sc-tech" },
  { label: "Society", subject: "society" },
  { label: "World History", subject: "world-history" },
  { label: "Social Justice", subject: "social-justice" },
  { label: "Governance", subject: "governance" },
  { label: "IR", subject: "international-relations" },
  { label: "Agriculture", subject: "agriculture" },
  { label: "Internal Security", subject: "internal-security" },
  { label: "Disaster Mgmt", subject: "disaster-management" },
];

function isClient() {
  return typeof window !== "undefined";
}

function safeParseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function normalizeTimestamp(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readStoredCompletionTimes(key: string): SubjectCompletionTimes {
  if (!isClient()) return {};
  const parsed = safeParseJson<Record<string, unknown>>(
    localStorage.getItem(key),
    {},
  );
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  return parsed as SubjectCompletionTimes;
}

function readStoredStringArray(key: string): string[] {
  if (!isClient()) return [];
  const parsed = safeParseJson<unknown>(localStorage.getItem(key), []);
  return Array.isArray(parsed)
    ? parsed.filter((v) => typeof v === "string")
    : [];
}

function toDateKey(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

function getPlannerWeekStartDatesInRange(startDate: Date, endDate: Date) {
  const weeks: string[] = [];
  const cursor = getMonday(startDate);
  const finalMonday = getMonday(endDate);

  while (cursor.getTime() <= finalMonday.getTime()) {
    weeks.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 7);
  }

  return weeks;
}

/* ------------------------------------------------------------------ */
/*  LOCALSTORAGE LEGACY FALLBACK                                      */
/* ------------------------------------------------------------------ */

function buildLegacyLocalStorageNoteActionsForSubject(
  subject: string,
): LegacyNoteAction[] {
  if (!isClient()) return [];

  const storageKeys = {
    checked: `checked_uids_${subject}`,
    starred: `starred_uids_${subject}`,
    times: `completion_times_${subject}`,
  };

  const completionTimes = readStoredCompletionTimes(storageKeys.times);
  const starredUids = readStoredStringArray(storageKeys.starred);

  const actions: LegacyNoteAction[] = [];

  for (const uid of Object.keys(completionTimes)) {
    const item = completionTimes[uid];

    if (typeof item === "number") {
      const completedAt = normalizeTimestamp(item);
      if (completedAt != null) {
        actions.push({
          id: `legacy-ls-${subject}-${uid}-completed-${completedAt}`,
          timestamp: completedAt,
          subject,
          action: "completed",
          note: uid,
          previousStatus: { completed: false },
          newStatus: { completed: true },
        });
      }
      continue;
    }

    if (!item || typeof item !== "object") continue;

    const completedAt =
      "completedAt" in item ? normalizeTimestamp((item as any).completedAt) : null;

    if (completedAt != null) {
      actions.push({
        id: `legacy-ls-${subject}-${uid}-completed-${completedAt}`,
        timestamp: completedAt,
        subject,
        action: "completed",
        note: uid,
        previousStatus: { completed: false },
        newStatus: { completed: true },
      });
    }

    const revisions =
      "revisions" in item && Array.isArray((item as any).revisions)
        ? ((item as any).revisions as unknown[])
            .map(normalizeTimestamp)
            .filter((v): v is number => v != null)
        : [];

    revisions.forEach((revisionTime, index) => {
      actions.push({
        id: `legacy-ls-${subject}-${uid}-revised-${revisionTime}-${index}`,
        timestamp: revisionTime,
        subject,
        action: "revised",
        note: uid,
        previousStatus: { revised: false },
        newStatus: { revised: true },
      });
    });
  }

  // no fake historical star timestamps
  // old localStorage only knows current starred state, not when it happened
  for (const uid of starredUids) {
    actions.push({
      id: `legacy-ls-${subject}-${uid}-starred-current-state`,
      timestamp: 0,
      subject,
      action: "starred",
      note: uid,
      previousStatus: { starred: false },
      newStatus: { starred: true },
    });
  }

  return actions;
}

function readLegacyLocalStorageNoteActions(): LegacyNoteAction[] {
  const actions: LegacyNoteAction[] = [];

  for (const { subject } of prelimsSubjects) {
    actions.push(...buildLegacyLocalStorageNoteActionsForSubject(subject));
  }

  return actions;
}

/* ------------------------------------------------------------------ */
/*  BACKEND SUBJECT PROGRESS                                           */
/* ------------------------------------------------------------------ */

async function fetchSubjectProgress(subject: string) {
  const res = await fetch(
    `/api/subject-progress?subject=${encodeURIComponent(`upsc_${subject}checked`)}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch subject progress for ${subject}`);
  }

  const data = (await res.json()) as SubjectProgressApiResponse;
  return data.progress ?? null;
}

function buildBackendProgressNoteActionsForSubject(
  subject: string,
  progress: SubjectProgressApiResponse["progress"],
): LegacyNoteAction[] {
  if (!progress) return [];

  const completionTimes = progress.completionTimes ?? {};
  const actions: LegacyNoteAction[] = [];

  for (const uid of Object.keys(completionTimes)) {
    const item = completionTimes[uid];

    if (typeof item === "number") {
      const completedAt = normalizeTimestamp(item);
      if (completedAt != null) {
        actions.push({
          id: `backend-${subject}-${uid}-completed-${completedAt}`,
          timestamp: completedAt,
          subject,
          action: "completed",
          note: uid,
          previousStatus: { completed: false },
          newStatus: { completed: true },
        });
      }
      continue;
    }

    if (!item || typeof item !== "object") continue;

    const completedAt =
      "completedAt" in item ? normalizeTimestamp((item as any).completedAt) : null;

    if (completedAt != null) {
      actions.push({
        id: `backend-${subject}-${uid}-completed-${completedAt}`,
        timestamp: completedAt,
        subject,
        action: "completed",
        note: uid,
        previousStatus: { completed: false },
        newStatus: { completed: true },
      });
    }

    const revisions =
      "revisions" in item && Array.isArray((item as any).revisions)
        ? ((item as any).revisions as unknown[])
            .map(normalizeTimestamp)
            .filter((v): v is number => v != null)
        : [];

    revisions.forEach((revisionTime, index) => {
      actions.push({
        id: `backend-${subject}-${uid}-revised-${revisionTime}-${index}`,
        timestamp: revisionTime,
        subject,
        action: "revised",
        note: uid,
        previousStatus: { revised: false },
        newStatus: { revised: true },
      });
    });
  }

  return actions;
}

async function readBackendProgressNoteActions(): Promise<LegacyNoteAction[]> {
  const results = await Promise.all(
    prelimsSubjects.map(async ({ subject }) => {
      try {
        const progress = await fetchSubjectProgress(subject);
        return buildBackendProgressNoteActionsForSubject(subject, progress);
      } catch (error) {
        console.error(`Failed to load backend subject progress for ${subject}`, error);
        return [];
      }
    }),
  );

  return results.flat();
}

/* ------------------------------------------------------------------ */
/*  BACKEND PLANNER                                                    */
/* ------------------------------------------------------------------ */

async function fetchPlannerWeek(weekStartDate: string): Promise<RawWeeklyPlan | null> {
  const res = await fetch(
    `${PLANNER_API_URL}/${encodeURIComponent(weekStartDate)}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch planner week ${weekStartDate}`);
  }

  const payload = (await res.json()) as PlannerApiResponse;
  return payload.exists && payload.data ? payload.data : null;
}

async function readPlannerPlansInRange(
  startDate: Date,
  endDate: Date,
): Promise<RawWeeklyPlan[]> {
  const weekStartDates = getPlannerWeekStartDatesInRange(startDate, endDate);
  const results = await Promise.all(
    weekStartDates.map(async (weekStartDate) => {
      try {
        return await fetchPlannerWeek(weekStartDate);
      } catch (error) {
        console.error(`Failed to load planner week ${weekStartDate}`, error);
        return null;
      }
    }),
  );

  return results.filter((plan): plan is RawWeeklyPlan => plan !== null);
}

/* ------------------------------------------------------------------ */
/*  MERGE / DEDUP                                                     */
/* ------------------------------------------------------------------ */

function buildNoteActionDedupKey(action: any): string {
  const subject = String(action?.subject ?? "");
  const uid = String(action?.note ?? action?.pointUid ?? "");
  const actionType = String(action?.action ?? action?.actionType ?? "");
  const timestamp =
    typeof action?.timestamp === "number" && Number.isFinite(action.timestamp)
      ? action.timestamp
      : 0;

  return `${subject}__${uid}__${actionType}__${timestamp}`;
}

function mergeAndDeduplicateNoteActions(
  indexedDbNoteActions: any[],
  backendNoteActions: LegacyNoteAction[],
  localStorageLegacyNoteActions: LegacyNoteAction[],
) {
  const seen = new Set<string>();
  const merged: any[] = [];

  // 1) IndexedDB tracked note actions = highest priority
  for (const action of indexedDbNoteActions) {
    const key = buildNoteActionDedupKey(action);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(action);
    }
  }

  // 2) Backend subject-progress note actions
  for (const action of backendNoteActions) {
    if (!action.timestamp || action.timestamp <= 0) continue;
    const key = buildNoteActionDedupKey(action);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(action);
    }
  }

  // 3) Old localStorage fallback
  for (const action of localStorageLegacyNoteActions) {
    if (!action.timestamp || action.timestamp <= 0) continue;
    const key = buildNoteActionDedupKey(action);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(action);
    }
  }

  return merged;
}

/* ------------------------------------------------------------------ */
/*  HOOK                                                              */
/* ------------------------------------------------------------------ */

export default function useReportData(startDate: Date, endDate: Date) {
  const [data, setData] = useState<AiReadyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // A) IndexedDB report data
        const raw = await getReportData(startDate, endDate);

        const indexedDbQuestionAttempts = Array.isArray(raw?.questionAttempts)
          ? raw.questionAttempts
          : [];

        const indexedDbNoteActions = Array.isArray(raw?.noteActions)
          ? raw.noteActions
          : [];

        const indexedDbStudySessions = Array.isArray(raw?.studySessions)
          ? raw.studySessions
          : [];

        // B) backend subject-progress data
        const backendNoteActions = await readBackendProgressNoteActions();

        // C) localStorage fallback
        const localStorageLegacyNoteActions = readLegacyLocalStorageNoteActions();

        // D) planner weekly plans for every week touched by the selected range
        const plannerPlans = await readPlannerPlansInRange(startDate, endDate);

        // E) merge note actions from all sources
        const mergedNoteActions = mergeAndDeduplicateNoteActions(
          indexedDbNoteActions,
          backendNoteActions,
          localStorageLegacyNoteActions,
        );

        // F) build final report
        const report = buildReportData({
          startDate,
          endDate,
          questionAttempts: indexedDbQuestionAttempts,
          noteActions: mergedNoteActions,
          studySessions: indexedDbStudySessions,
          plannerPlans,
        });

        if (!cancelled) {
          setData(report);
        }
      } catch (err) {
        console.error("Failed to load report data:", err);

        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load report data",
          );
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  return {
    data,
    report: data,
    loading,
    error,
    summary: data?.summary ?? null,
    timeline: data?.activityTimeline ?? [],
    sessions: data?.sessionBreakdown ?? [],
    analysis: data
      ? {
          subjectAnalysis: data.subjectAnalysis,
          chapterAnalysis: data.chapterAnalysis,
          topicAnalysis: data.topicAnalysis,
          subtopicAnalysis: data.subtopicAnalysis,
          difficultyAnalysis: data.difficultyAnalysis,
          timeAnalysis: data.timeAnalysis,
          aiAnalysisHelpers: data.aiAnalysisHelpers,
          sessionBreakdown: data.sessionBreakdown,
          activityTimeline: data.activityTimeline,
          plannerPlans: data.plannerPlans,
          plannerMissions: data.plannerMissions,
          plannerSummary: data.plannerSummary,
        }
      : null,
  };
}
