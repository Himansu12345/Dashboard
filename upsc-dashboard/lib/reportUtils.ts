import type {
  StarAction,
  StudySession,
  DataAvailability,
  ActivityTimelineItem,
} from "@/types/report";

const PRELIMS_SUBJECTS = [
  "polity",
  "geography",
  "economics",
  "ancient-history",
  "modern-history",
  "art-culture",
  "sc-tech",
  "society",
  "world-history",
  "social-justice",
  "governance",
  "international-relations",
  "agriculture",
  "internal-security",
  "disaster-management",
] as const;

/**
 * Canonical dashboard progress keys used by the subject-progress API.
 * Keep these aligned with your subject dashboard storageKeys.checked values.
 */
export const SUBJECT_PROGRESS_KEYS: Record<string, string> = {
  polity: "upsc_polity_ultimate_checked",
  geography: "upsc_geography_ultimate_checked",
  economics: "upsc_economics_ultimate_checked",
  "ancient-history": "upsc_ancient_history_ultimate_checked",
  "modern-history": "upsc_modern_history_ultimate_checked",
  "art-culture": "upsc_art_culture_ultimate_checked",
  "sc-tech": "upsc_sc_tech_ultimate_checked",
  society: "upsc_society_ultimate_checked",
  "world-history": "upsc_world_history_ultimate_checked",
  "social-justice": "upsc_social_justice_ultimate_checked",
  governance: "upsc_governance_ultimate_checked",
  "international-relations": "upsc_international_relations_ultimate_checked",
  agriculture: "upsc_agriculture_ultimate_checked",
  "internal-security": "upsc_internal_security_ultimate_checked",
  "disaster-management": "upsc_disaster_management_ultimate_checked",
};

export type SubjectProgressTimelineRecord = {
  uid: string;
  subject: string;
  completedAt: number;
  revisedAt?: number;
  revisions?: number[];
};

// -----------------------------------------------------------------------------
// Star Actions Storage
// -----------------------------------------------------------------------------

export function getStarActionsStorageKey(subject: string): string {
  return `star_actions_${subject}`;
}

export function readStarActions(subject: string): StarAction[] {
  try {
    const key = getStarActionsStorageKey(subject);
    const item = localStorage.getItem(key);
    if (!item) return [];

    const parsed = JSON.parse(item);
    if (!Array.isArray(parsed)) return [];

    return parsed as StarAction[];
  } catch {
    return [];
  }
}

export function saveStarActions(subject: string, actions: StarAction[]): void {
  try {
    const key = getStarActionsStorageKey(subject);
    localStorage.setItem(key, JSON.stringify(actions));
  } catch (e) {
    console.error("Failed to save star actions:", e);
  }
}

export function addStarAction(
  subject: string,
  uid: string,
  action: "star" | "unstar",
): StarAction {
  const now = Date.now();

  const starAction: StarAction = {
    id: `star_${now}_${Math.random().toString(36).slice(2, 9)}`,
    uid,
    subject,
    action,
    timestamp: now,
    date: new Date(now).toISOString().split("T")[0],
    time: new Date(now).toTimeString().slice(0, 8),
  };

  const existing = readStarActions(subject);
  existing.push(starAction);
  saveStarActions(subject, existing);

  return starAction;
}

// -----------------------------------------------------------------------------
// Study Sessions Storage
// -----------------------------------------------------------------------------

const STUDY_SESSIONS_KEY = "study_sessions";

export function readStudySessions(): StudySession[] {
  try {
    const item = localStorage.getItem(STUDY_SESSIONS_KEY);
    if (!item) return [];

    const parsed = JSON.parse(item);
    if (!Array.isArray(parsed)) return [];

    return parsed as StudySession[];
  } catch {
    return [];
  }
}

export function saveStudySessions(sessions: StudySession[]): void {
  try {
    localStorage.setItem(STUDY_SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error("Failed to save study sessions:", e);
  }
}

export function startStudySession(): StudySession {
  const now = Date.now();

  const session: StudySession = {
    id: `session_${now}_${Math.random().toString(36).slice(2, 9)}`,
    startTime: now,
    questionsAttempted: 0,
    correct: 0,
    incorrect: 0,
    skipped: 0,
    subjectsStudied: [],
    chaptersStudied: [],
    topicsStudied: [],
  };

  const sessions = readStudySessions();
  sessions.push(session);
  saveStudySessions(sessions);

  return session;
}

export function endStudySession(
  sessionId: string,
  questionsAttempted: number,
  correct: number,
  incorrect: number,
  skipped: number,
  subjectsStudied: string[],
  chaptersStudied: string[],
  topicsStudied: string[],
): void {
  const sessions = readStudySessions();
  const sessionIndex = sessions.findIndex((s) => s.id === sessionId);
  if (sessionIndex === -1) return;

  const now = Date.now();
  const session = sessions[sessionIndex];

  session.endTime = now;
  session.endDate = new Date(now).toISOString().split("T")[0];
  session.endTimeStr = new Date(now).toTimeString().slice(0, 8);
  session.duration = now - session.startTime;
  session.questionsAttempted = questionsAttempted;
  session.correct = correct;
  session.incorrect = incorrect;
  session.skipped = skipped;
  session.subjectsStudied = subjectsStudied;
  session.chaptersStudied = chaptersStudied;
  session.topicsStudied = topicsStudied;

  sessions[sessionIndex] = session;
  saveStudySessions(sessions);
}

// -----------------------------------------------------------------------------
// Active Session (sessionStorage)
// -----------------------------------------------------------------------------

const ACTIVE_SESSION_KEY = "active_study_session";

export function getActiveSession(): StudySession | null {
  try {
    const item = sessionStorage.getItem(ACTIVE_SESSION_KEY);
    if (!item) return null;
    return JSON.parse(item) as StudySession;
  } catch {
    return null;
  }
}

export function setActiveSession(session: StudySession | null): void {
  try {
    if (session) {
      sessionStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  } catch (e) {
    console.error("Failed to set active session:", e);
  }
}

export function updateActiveSessionProgress(
  subject?: string,
  chapter?: string,
  topic?: string,
  isCorrect?: boolean,
): void {
  const session = getActiveSession();
  if (!session) return;

  if (subject && !session.subjectsStudied.includes(subject)) {
    session.subjectsStudied.push(subject);
  }
  if (chapter && !session.chaptersStudied.includes(chapter)) {
    session.chaptersStudied.push(chapter);
  }
  if (topic && !session.topicsStudied.includes(topic)) {
    session.topicsStudied.push(topic);
  }

  if (isCorrect !== undefined) {
    session.questionsAttempted += 1;
    if (isCorrect) {
      session.correct += 1;
    } else {
      session.incorrect += 1;
    }
  }

  setActiveSession(session);
}

// -----------------------------------------------------------------------------
// Subject Progress Helpers
// -----------------------------------------------------------------------------

/**
 * Converts backend/API subject progress completionTimes into a flat list
 * that can be used by report timeline generators.
 *
 * Input shape expected:
 * {
 *   "uid-1": { completedAt: 123, revisedAt?: 456, revisions?: [789] },
 *   ...
 * }
 */
export function flattenSubjectProgressCompletionTimes(
  subject: string,
  completionTimes: Record<string, unknown> | null | undefined,
): SubjectProgressTimelineRecord[] {
  if (
    !completionTimes ||
    typeof completionTimes !== "object" ||
    Array.isArray(completionTimes)
  ) {
    return [];
  }

  const output: SubjectProgressTimelineRecord[] = [];

  for (const [uid, rawValue] of Object.entries(completionTimes)) {
    if (!uid || typeof uid !== "string") continue;
    if (!rawValue || typeof rawValue !== "object" || Array.isArray(rawValue)) {
      continue;
    }

    const record = rawValue as {
      completedAt?: unknown;
      revisedAt?: unknown;
      revisions?: unknown;
    };

    if (
      typeof record.completedAt !== "number" ||
      !Number.isFinite(record.completedAt)
    ) {
      continue;
    }

    const revisions = Array.isArray(record.revisions)
      ? record.revisions.filter(
          (time): time is number =>
            typeof time === "number" && Number.isFinite(time),
        )
      : [];

    output.push({
      uid,
      subject,
      completedAt: record.completedAt,
      ...(typeof record.revisedAt === "number" &&
      Number.isFinite(record.revisedAt)
        ? { revisedAt: record.revisedAt }
        : {}),
      ...(revisions.length ? { revisions } : {}),
    });
  }

  return output;
}

// -----------------------------------------------------------------------------
// Data Availability
// -----------------------------------------------------------------------------

const IMPLEMENTATION_DATE = new Date().toISOString();

export function getDataAvailability(): DataAvailability[] {
  return [
    {
      field: "quiz_attempts",
      historicallyAvailable: true,
      availableFrom: null,
      notes: "Historical quiz attempts are available via backend/API data.",
    },
    {
      field: "syllabus_completion",
      historicallyAvailable: true,
      availableFrom: null,
      notes:
        "Completion timestamps are sourced from canonical subject progress data (subject-progress API / persisted subject progress store).",
    },
    {
      field: "syllabus_revision",
      historicallyAvailable: true,
      availableFrom: null,
      notes:
        "Revision timestamps are sourced from canonical subject progress data (completionTimes.revisions).",
    },
    {
      field: "star_actions",
      historicallyAvailable: false,
      availableFrom: IMPLEMENTATION_DATE,
      notes:
        "Star/unstar timestamps are tracked from this implementation forward.",
    },
    {
      field: "study_sessions",
      historicallyAvailable: false,
      availableFrom: IMPLEMENTATION_DATE,
      notes:
        "Session start/end tracking is stored locally from this implementation forward.",
    },
    {
      field: "question_time_taken",
      historicallyAvailable: false,
      availableFrom: IMPLEMENTATION_DATE,
      notes: "Per-question time tracking is not yet implemented.",
    },
    {
      field: "answer_change_history",
      historicallyAvailable: false,
      availableFrom: IMPLEMENTATION_DATE,
      notes: "Answer change tracking is not yet implemented.",
    },
  ];
}

// -----------------------------------------------------------------------------
// Timeline Generation
// -----------------------------------------------------------------------------

export function generateTimeline(
  quizAttempts: Record<string, unknown>[],
  completionTimes: SubjectProgressTimelineRecord[],
  starActions: StarAction[],
  sessions: StudySession[],
): ActivityTimelineItem[] {
  const items: ActivityTimelineItem[] = [];

  // ---------------------------------------------------------------------------
  // Quiz attempts
  // ---------------------------------------------------------------------------
  for (const attempt of quizAttempts as any[]) {
    const timestamp = attempt.createdAt
      ? new Date(attempt.createdAt).getTime()
      : attempt.timestamp || 0;

    const date =
      attempt.dateValue ||
      (attempt.createdAt ? attempt.createdAt.split("T")[0] : "");

    const time = attempt.createdAt
      ? new Date(attempt.createdAt).toTimeString().slice(0, 8)
      : attempt.time || "";

    items.push({
      id: `quiz_${attempt.id ?? timestamp}`,
      type: "quiz_attempt",
      timestamp,
      date,
      time,
      details: {
        recordId: attempt.id,
        subject: attempt.subject,
        topic: attempt.topic,
        total: attempt.total,
        correct: attempt.correct,
        incorrect: attempt.incorrect,
        accuracy: attempt.accuracy,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Completion actions
  // ---------------------------------------------------------------------------
  for (const completion of completionTimes) {
    const timestamp = completion.completedAt || 0;
    if (!timestamp) continue;

    const date = new Date(timestamp).toISOString().split("T")[0];
    const time = new Date(timestamp).toTimeString().slice(0, 8);

    items.push({
      id: `complete_${completion.uid}_${timestamp}`,
      type: "complete",
      timestamp,
      date,
      time,
      details: {
        uid: completion.uid,
        subject: completion.subject,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Revision actions
  // ---------------------------------------------------------------------------
  for (const completion of completionTimes) {
    if (!Array.isArray(completion.revisions)) continue;

    for (const revTime of completion.revisions) {
      if (typeof revTime !== "number" || !Number.isFinite(revTime)) continue;

      const date = new Date(revTime).toISOString().split("T")[0];
      const time = new Date(revTime).toTimeString().slice(0, 8);

      items.push({
        id: `revise_${completion.uid}_${revTime}`,
        type: "revise",
        timestamp: revTime,
        date,
        time,
        details: {
          uid: completion.uid,
          subject: completion.subject,
        },
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Star actions
  // ---------------------------------------------------------------------------
  for (const star of starActions) {
    items.push({
      id: star.id,
      type: star.action === "star" ? "star" : "unstar",
      timestamp: star.timestamp,
      date: star.date,
      time: star.time,
      details: {
        uid: star.uid,
        subject: star.subject,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Session start/end
  // ---------------------------------------------------------------------------
  for (const session of sessions) {
    const startDate = new Date(session.startTime).toISOString().split("T")[0];
    const startTime = new Date(session.startTime).toTimeString().slice(0, 8);

    items.push({
      id: `${session.id}_start`,
      type: "session_start",
      timestamp: session.startTime,
      date: startDate,
      time: startTime,
      details: {
        sessionId: session.id,
        subjectsStudied: session.subjectsStudied,
      },
    });

    if (session.endTime) {
      const endDate = new Date(session.endTime).toISOString().split("T")[0];
      const endTime = new Date(session.endTime).toTimeString().slice(0, 8);

      items.push({
        id: `${session.id}_end`,
        type: "session_end",
        timestamp: session.endTime,
        date: endDate,
        time: endTime,
        details: {
          sessionId: session.id,
          duration: session.duration,
          questionsAttempted: session.questionsAttempted,
          correct: session.correct,
          incorrect: session.incorrect,
        },
      });
    }
  }

  // Most recent first
  items.sort((a, b) => b.timestamp - a.timestamp);

  return items;
}

// -----------------------------------------------------------------------------
// Date Filter Helpers
// -----------------------------------------------------------------------------

export function getDateFilterPreset(
  preset: string,
): { start: Date | null; end: Date | null } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  switch (preset) {
    case "today":
      return { start: today, end: tomorrow };

    case "yesterday":
      return { start: yesterday, end: today };

    case "last7days": {
      const last7 = new Date(today);
      last7.setDate(last7.getDate() - 7);
      return { start: last7, end: tomorrow };
    }

    case "last30days": {
      const last30 = new Date(today);
      last30.setDate(last30.getDate() - 30);
      return { start: last30, end: tomorrow };
    }

    case "thismonth": {
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return { start: thisMonthStart, end: thisMonthEnd };
    }

    case "previousmonth": {
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: prevMonthStart, end: prevMonthEnd };
    }

    default:
      return { start: null, end: null };
  }
}

export function filterByDateRange<
  T extends { timestamp?: number; date?: string },
>(items: T[], startDate: Date | null, endDate: Date | null): T[] {
  if (!startDate && !endDate) return items;

  return items.filter((item) => {
    const itemTime = item.timestamp
      ? new Date(item.timestamp)
      : item.date
        ? new Date(item.date)
        : null;

    if (!itemTime) return false;
    if (startDate && itemTime < startDate) return false;
    if (endDate && itemTime >= endDate) return false;

    return true;
  });
}

// -----------------------------------------------------------------------------
// Export Helpers
// -----------------------------------------------------------------------------

export function downloadJSON(data: unknown, filename: string): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

export { PRELIMS_SUBJECTS };