"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchAttempts, updateAttemptQuestionNote } from "@/lib/api/attempts";
import { buildApiUrl } from "@/lib/api/client";
import { AppToast } from "@/app/components/AppToast";
import { DashboardControls } from "./components/DashboardControls";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardStyles } from "./components/DashboardStyles";
import { DashboardHeaderStyles } from "./components/DashboardHeaderStyles";
import { MasteryLegend } from "./components/MasteryLegend";
import { ProgressBar } from "./components/ProgressBar";
import { TopBar } from "./components/TopBar";
import { TreeView } from "./components/TreeView";
import { useSubjectDashboardState } from "./hooks/useSubjectDashboardState";
import {
  buildSubjectNotesExport,
  buildSubjectNotesExportFilename,
  buildSubjectQuizExport,
  buildSubjectQuizExportFilename,
  type SubjectQuizExportSource,
} from "./utils/exportSubjectNotes";
import { useInsightsVault, InsightsModal } from "./components/InsightsVault";
// PERFECT NEW CODE
import type {
  ChapterAttemptSummary,
  ChapterWrongQuestionEntry,
  SubjectCompletionTimes,
  SubjectDashboardConfig,
  SubjectNode,
  SubjectNoteDocument,
} from "./types";

type SubjectDashboardProps = SubjectDashboardConfig & {
  data: SubjectNode[];
};

function downloadTextFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], {
    type: `${mimeType};charset=utf-8`,
  });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(downloadUrl);
}

async function savePlannerRunProgress(
  subjectKey: string,
  checkedUids: Set<string>,
  completionTimes: Record<string, unknown>,
) {
  await fetch(
    buildApiUrl(
      `/api/subject-progress?subject=${encodeURIComponent(subjectKey)}`,
    ),
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checkedUids: Array.from(checkedUids),
        completionTimes,
      }),
    },
  );
}

function formatPercent(value: number) {
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
}

function formatDateTime(value: string | number | null) {
  if (!value) return "Unknown time";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown time";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function flattenNodes(nodes: SubjectNode[]): SubjectNode[] {
  return nodes.flatMap((node) => [
    node,
    ...(node.children ? flattenNodes(node.children) : []),
  ]);
}

function buildChapterAttemptSummaries(
  chapterNodes: SubjectNode[],
  attempts: Awaited<ReturnType<typeof fetchAttempts>>,
  quizSubjectName: string | undefined,
) {
  if (!quizSubjectName) return {} as Record<string, ChapterAttemptSummary>;

  const chapterByLabel = new Map(
    chapterNodes.map((node) => [node.label, node.uid] as const),
  );
  const grouped = new Map<string, Awaited<ReturnType<typeof fetchAttempts>>>();

  attempts.forEach((attempt) => {
    if ((attempt.subject || "Unknown") !== quizSubjectName) return;
    if (attempt.deletedAt) return;
    const chapterLabel = attempt.subtopic || "";
    const chapterUid = chapterByLabel.get(chapterLabel);
    if (!chapterUid) return;
    const existing = grouped.get(chapterUid) || [];
    existing.push(attempt);
    grouped.set(chapterUid, existing);
  });

  const summaries: Record<string, ChapterAttemptSummary> = {};

  chapterNodes.forEach((node) => {
    const chapterAttempts = (grouped.get(node.uid) || []).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const totals = chapterAttempts.reduce(
      (result, attempt) => {
        result.total += attempt.total;
        result.correct += attempt.correct;
        result.incorrect += attempt.incorrect;
        result.skipped += attempt.skipped;
        return result;
      },
      { total: 0, correct: 0, incorrect: 0, skipped: 0 },
    );

    const attempted = totals.correct + totals.incorrect;
    const accuracy = attempted > 0 ? (totals.correct / attempted) * 100 : 0;
    const percentage =
      totals.total > 0 ? (totals.correct / totals.total) * 100 : 0;

    summaries[node.uid] = {
      attempts: chapterAttempts.length,
      total: totals.total,
      correct: totals.correct,
      incorrect: totals.incorrect,
      skipped: totals.skipped,
      accuracy,
      percentage,
      latestAttemptAt: chapterAttempts[0]?.createdAt || null,
      history: chapterAttempts.map((attempt) => ({
        id: attempt._id,
        topic: attempt.topic || "Unknown topic",
        scoreLabel: `${attempt.correct}/${attempt.total}`,
        accuracy: attempt.accuracy,
        percentage:
          attempt.total > 0 ? (attempt.correct / attempt.total) * 100 : 0,
        createdAt: attempt.createdAt,
        total: attempt.total,
        correct: attempt.correct,
        incorrect: attempt.incorrect,
        skipped: attempt.skipped,
      })),
      wrongQuestions: chapterAttempts.flatMap((attempt) =>
        (attempt.incorrectDetails || []).map((detail) => ({
          attemptId: attempt._id,
          topic: attempt.topic || "Unknown topic",
          createdAt: attempt.createdAt,
          question: detail.question,
          options: detail.options || [],
          correctAnswer: detail.correctAnswer,
          selectedAnswer: detail.selectedAnswer,
          notes: detail.notes || (detail.note ? [detail.note] : []),
          why: detail.why || "",
        })),
      ),
    };
  });

  return summaries;
}

const PLANNER_NOTE_SESSION_KEY = "planner-note-mission-session";
const PLANNER_LAST_TIMED_RUN_KEY = "planner-last-timed-run";
const PLANNER_GRACE_MINUTES = 7;

const SUBJECT_ROUTE_REGISTRY: Record<string, string> = {
  Polity: "/polity",
  "Ancient History": "/ancient-history",
  "Modern History": "/modern-history",
  Geography: "/geography",
  Economics: "/economics",
  "Art & Culture": "/art-culture",
  "Science & Tech": "/sc-tech",
  Governance: "/governance",
  "International Relations": "/international-relations",
  "Internal Security": "/internal-security",
  Society: "/society",
  "Social Justice": "/social-justice",
  "Disaster Management": "/disaster-management",
  Agriculture: "/agriculture",
  "World History": "/world-history",
};

const STORAGE_KEY_TO_SUBJECT: Record<string, string> = {
  upsc_polity_ultimate_checked: "Polity",
  upsc_ancient_ultimate_checked: "Ancient History",
  upsc_checked: "Modern History",
  upsc_geo_complete_checked: "Geography",
  upsc_economics_checked: "Economics",
  upsc_art_culture_checked: "Art & Culture",
  upsc_sc_tech_checked: "Science & Tech",
  upsc_environment_checked: "Environment",
  upsc_governance_checked: "Governance",
  upsc_ir_checked: "International Relations",
  upsc_internal_security_checked: "Internal Security",
  upsc_society_checked: "Society",
  upsc_social_justice_checked: "Social Justice",
  upsc_disaster_management_checked: "Disaster Management",
  upsc_agriculture_checked: "Agriculture",
  upsc_world_history_checked: "World History",
};

type PlannerMissionTarget = {
  uid: string;
  label: string;
  topicUid?: string | null;
  leafUids?: string[];
};
// PERFECT NEW CODE
type PlannerMissionSessionMission = {
  id: string;
  subject: string;
  mode?: string;
  createdAt?: number;
  chapterUid?: string;
  chapterLabel: string;
  plannedStart?: string | null;
  plannedEnd?: string | null;
  targets: PlannerMissionTarget[];
  progressStatus?: string;
};

type PlannerMissionSession = {
  dayKey: string;
  dayOfWeek: string;
  activeMissionId?: string;
  startedAt: number;
  returnTo?: string;
  graceMinutes?: number;
  autoStarted?: boolean;
  missions: PlannerMissionSessionMission[];
};

type PlannerTimerPhase = "study" | "grace" | "expired";

function parsePlannerTimeToMinutes(value?: string | null) {
  if (!value || value === "00:00") return null;
  const [hours, minutes] = value.split(":").map(Number);
  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }
  return hours * 60 + minutes;
}

function getPlannerMissionStudyEndAt(
  session: PlannerMissionSession,
  mission: PlannerMissionSessionMission,
) {
  const startedAt = session.startedAt || Date.now();
  const endMinutes = parsePlannerTimeToMinutes(mission.plannedEnd);
  if (endMinutes === null) return startedAt + 60 * 60 * 1000;

  const startDate = new Date(startedAt);
  const endAt = new Date(startDate);
  endAt.setHours(Math.floor(endMinutes / 60), endMinutes % 60, 0, 0);

  if (endAt.getTime() <= startedAt) {
    return startedAt + 60 * 1000;
  }

  return endAt.getTime();
}

function formatPlannerTimer(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function normalizePlannerSession(value: unknown): PlannerMissionSession | null {
  if (!value || typeof value !== "object") return null;
  const session = value as Partial<PlannerMissionSession>;
  if (!Array.isArray(session.missions) || session.missions.length === 0) {
    return null;
  }

  return {
    dayKey: String(session.dayKey || ""),
    dayOfWeek: String(session.dayOfWeek || ""),
    activeMissionId:
      typeof session.activeMissionId === "string"
        ? session.activeMissionId
        : undefined,
    startedAt:
      typeof session.startedAt === "number" &&
      Number.isFinite(session.startedAt)
        ? session.startedAt
        : Date.now(),
    returnTo:
      typeof session.returnTo === "string" ? session.returnTo : "/planner",
    graceMinutes:
      typeof session.graceMinutes === "number" &&
      Number.isFinite(session.graceMinutes)
        ? session.graceMinutes
        : PLANNER_GRACE_MINUTES,
    autoStarted: Boolean(session.autoStarted),
    missions: session.missions
      .filter((mission): mission is PlannerMissionSessionMission => {
        return Boolean(
          mission &&
          typeof mission === "object" &&
          typeof mission.id === "string" &&
          typeof mission.subject === "string" &&
          typeof mission.chapterLabel === "string",
        );
      })
      .map((mission) => ({
        ...mission,
        plannedStart:
          typeof mission.plannedStart === "string"
            ? mission.plannedStart
            : null,
        plannedEnd:
          typeof mission.plannedEnd === "string" ? mission.plannedEnd : null,
        targets: Array.isArray(mission.targets) ? mission.targets : [],
      })),
  };
}

function buildParentUidMap(nodes: SubjectNode[]) {
  const parentMap = new Map<string, string | null>();

  const visit = (items: SubjectNode[], parentUid: string | null) => {
    items.forEach((node) => {
      parentMap.set(node.uid, parentUid);
      if (node.children) visit(node.children, node.uid);
    });
  };

  visit(nodes, null);
  return parentMap;
}

function collectAncestorUids(
  uid: string,
  parentMap: Map<string, string | null>,
) {
  const ancestors = new Set<string>();
  let cursor = parentMap.get(uid);

  while (cursor) {
    ancestors.add(cursor);
    cursor = parentMap.get(cursor) || null;
  }

  return ancestors;
}

function findChapterNode(
  chapterNodes: SubjectNode[],
  mission: PlannerMissionSessionMission,
) {
  return (
    chapterNodes.find((node) => node.uid === mission.chapterUid) ||
    chapterNodes.find((node) => node.label === mission.chapterLabel) ||
    null
  );
}
// PERFECT NEW CODE
function hasFreshRevision(
  uid: string,
  completionTimes: SubjectCompletionTimes,
  sinceTimestamp: number,
) {
  const raw = completionTimes[uid];
  if (!raw || typeof raw !== "object") return false;
  const revisedAt = typeof raw.revisedAt === "number" ? raw.revisedAt : null;
  const revisions = Array.isArray(raw.revisions)
    ? raw.revisions.filter((t): t is number => typeof t === "number")
    : [];
  return (
    (revisedAt !== null && revisedAt >= sinceTimestamp) ||
    revisions.some((t) => t >= sinceTimestamp)
  );
}

function isMissionComplete(
  mission: PlannerMissionSessionMission,
  checkedUids: Set<string>,
  completionTimes: SubjectCompletionTimes,
) {
  const targetLeafUids = mission.targets.flatMap((target) =>
    Array.isArray(target.leafUids) ? target.leafUids : [],
  );

  if (targetLeafUids.length === 0) {
    return (
      mission.progressStatus === "completed" ||
      mission.progressStatus === "revised"
    );
  }

  // ⚡ PRO FIX: revise-mode missions must be judged on fresh revisions made
  // SINCE this mission was created — not on the leaf's lifetime checked/revised
  // state. This is what lets the same topic be revised multiple times: each
  // new revise-task gets its own createdAt and starts its own clean 0% count.
  if (mission.mode === "revise") {
    const missionCreatedAt =
      typeof mission.createdAt === "number" ? mission.createdAt : Date.now();
    return targetLeafUids.every(
      (uid) =>
        checkedUids.has(uid) &&
        hasFreshRevision(uid, completionTimes, missionCreatedAt),
    );
  }

  return targetLeafUids.every((uid) => checkedUids.has(uid));
}

function findFirstIncompleteMission(
  session: PlannerMissionSession,
  checkedUids: Set<string>,
  completionTimes: SubjectCompletionTimes,
) {
  return (
    session.missions.find(
      (mission) => !isMissionComplete(mission, checkedUids, completionTimes),
    ) || null
  );
}

function AppreciationPopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="chapter-stats-overlay" onClick={onClose}>
      <div
        className="chapter-stats-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="chapter-stats-head">
          <div>
            <p className="chapter-stats-kicker">Mission Complete</p>
            <h3 className="chapter-stats-title">Excellent work</h3>
            <p className="chapter-stats-subtitle">
              Every planned note target for this mission run is complete. Take a
              short reset, then lock the next block with the same focus.
            </p>
          </div>
          <button
            type="button"
            className="chapter-stats-close"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div
          aria-hidden="true"
          style={{
            margin: "18px auto 0",
            width: 76,
            height: 76,
            borderRadius: "999px",
            display: "grid",
            placeItems: "center",
            color: "#34d399",
            background:
              "radial-gradient(circle, rgba(52,211,153,0.22), rgba(52,211,153,0.05))",
            border: "1px solid rgba(52,211,153,0.32)",
            boxShadow: "0 0 36px rgba(52,211,153,0.22)",
            animation: "pulse 1.6s ease-in-out infinite",
          }}
        >
          <svg viewBox="0 0 24 24" width="42" height="42" fill="none">
            <path
              d="M5 12.5l4.2 4.2L19.5 6.5"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function PlannerMissionTimerBanner({
  timerState,
  autoStarted,
}: {
  timerState: {
    phase: PlannerTimerPhase;
    remainingMs: number;
    graceMinutes: number;
    totalTargets: number;
    completedTargets: number;
    mission: PlannerMissionSessionMission;
  };
  autoStarted?: boolean;
}) {
  const isGrace = timerState.phase === "grace";
  const progressText = `${timerState.completedTargets}/${timerState.totalTargets}`;
  const missionMode =
    timerState.mission.mode === "revise" ? "revise" : "complete";

  return (
    <div
      style={{
        margin: "0 24px 18px",
        padding: "14px 16px",
        borderRadius: 18,
        border: `1px solid ${isGrace ? "rgba(245,158,11,0.32)" : "rgba(52,211,153,0.28)"}`,
        background: isGrace
          ? "linear-gradient(135deg, rgba(245,158,11,0.14), rgba(10,10,10,0.9))"
          : "linear-gradient(135deg, rgba(16,185,129,0.14), rgba(10,10,10,0.9))",
        color: "#e5e7eb",
        boxShadow: "0 18px 40px rgba(0,0,0,0.26)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        flexWrap: "wrap",
      }}
    >
      <div style={{ minWidth: 220, flex: "1 1 280px" }}>
        <p
          style={{
            margin: 0,
            color: isGrace ? "#fbbf24" : "#34d399",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          {isGrace ? "Grace countdown" : "Study countdown"}
          {autoStarted ? " - Auto mode" : ""}
        </p>
        <h2
          style={{
            margin: "5px 0 0",
            color: "#ffffff",
            fontSize: 18,
            lineHeight: 1.2,
            fontWeight: 900,
          }}
        >
          {timerState.mission.chapterLabel}
        </h2>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            minWidth: 112,
            padding: "10px 14px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(0,0,0,0.34)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#94a3b8",
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Time left
          </p>
          <p
            style={{
              margin: "2px 0 0",
              color: "#ffffff",
              fontSize: 24,
              lineHeight: 1,
              fontWeight: 900,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatPlannerTimer(timerState.remainingMs)}
          </p>
        </div>

        <div
          style={{
            minWidth: 96,
            padding: "10px 14px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(0,0,0,0.34)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#94a3b8",
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            {missionMode === "revise" ? "Revised" : "Done"}
          </p>
          <p
            style={{
              margin: "2px 0 0",
              color: isGrace ? "#fbbf24" : "#34d399",
              fontSize: 22,
              lineHeight: 1,
              fontWeight: 900,
            }}
          >
            {progressText}
          </p>
        </div>
      </div>
    </div>
  );
}

function SubjectNotesPopup({
  nodeLabel,
  documentState,
  onClose,
  onAddNote,
  onEditNote,
  onTrashNote,
  onRestoreNote,
  onDeleteForever,
}: {
  nodeLabel: string;
  documentState: SubjectNoteDocument;
  onClose: () => void;
  onAddNote: (content: string) => void;
  onEditNote: (noteId: string, content: string) => void;
  onTrashNote: (noteId: string) => void;
  onRestoreNote: (noteId: string) => void;
  onDeleteForever: (noteId: string) => void;
}) {
  const [tab, setTab] = useState<"active" | "trash">("active");
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const notes = tab === "active" ? documentState.active : documentState.trash;

  return (
    <div className="chapter-stats-overlay" onClick={onClose}>
      <div
        className="chapter-stats-modal note-manager-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="chapter-stats-head">
          <div>
            <p className="chapter-stats-kicker">Node Notes</p>
            <h3 className="chapter-stats-title">{nodeLabel}</h3>
            <p className="chapter-stats-subtitle">
              Add, edit, delete, restore, and manage your notes smartly.
            </p>
          </div>
          <button
            type="button"
            className="chapter-stats-close"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="note-manager-tabs">
          <button
            type="button"
            className={`note-manager-tab ${tab === "active" ? "active" : ""}`}
            onClick={() => setTab("active")}
          >
            Active Notes ({documentState.active.length})
          </button>
          <button
            type="button"
            className={`note-manager-tab ${tab === "trash" ? "active" : ""}`}
            onClick={() => setTab("trash")}
          >
            Recycle Bin ({documentState.trash.length})
          </button>
        </div>

        {tab === "active" && (
          <div className="note-manager-composer">
            <textarea
              className="note-manager-textarea"
              rows={5}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Write a sharp note, mnemonic, trap, or revision insight..."
            />
            <div className="note-manager-actions">
              {editingId ? (
                <button
                  type="button"
                  className="chapter-stats-close"
                  onClick={() => {
                    setEditingId(null);
                    setDraft("");
                  }}
                >
                  Cancel Edit
                </button>
              ) : null}
              <button
                type="button"
                className="note-manager-primary"
                onClick={() => {
                  const content = draft.trim();
                  if (!content) return;
                  if (editingId) onEditNote(editingId, content);
                  else onAddNote(content);
                  setEditingId(null);
                  setDraft("");
                }}
              >
                {editingId ? "Save Changes" : "Add Note"}
              </button>
            </div>
          </div>
        )}

        {notes.length === 0 ? (
          <div className="chapter-stats-empty">
            {tab === "active"
              ? "No active notes yet for this node."
              : "Recycle bin is empty."}
          </div>
        ) : (
          <div className="note-manager-list">
            {notes.map((entry, index) => (
              <div key={entry.id} className="note-manager-item">
                <div className="note-manager-item-head">
                  <div>
                    <strong>Note {index + 1}</strong>
                    <span>Updated {formatDateTime(entry.updatedAt)}</span>
                  </div>
                  <div className="note-manager-inline-actions">
                    {tab === "active" ? (
                      <>
                        <button
                          type="button"
                          className="note-manager-inline-btn"
                          onClick={() => {
                            setEditingId(entry.id);
                            setDraft(entry.content);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="note-manager-inline-btn danger"
                          onClick={() => onTrashNote(entry.id)}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="note-manager-inline-btn"
                          onClick={() => onRestoreNote(entry.id)}
                        >
                          Restore
                        </button>
                        <button
                          type="button"
                          className="note-manager-inline-btn danger"
                          onClick={() => onDeleteForever(entry.id)}
                        >
                          Delete Forever
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <p className="note-manager-copy">{entry.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WrongQuestionNotesPopup({
  chapterLabel,
  entries,
  onClose,
  onSaveQuestionNote,
  onDeleteQuestionNote,
}: {
  chapterLabel: string;
  entries: ChapterWrongQuestionEntry[];
  onClose: () => void;
  onSaveQuestionNote: (
    entry: ChapterWrongQuestionEntry,
    note: string,
    noteIndex?: number,
  ) => Promise<void>;
  onDeleteQuestionNote: (
    entry: ChapterWrongQuestionEntry,
    noteIndex: number,
  ) => Promise<void>;
}) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const buildEntryKey = (entry: ChapterWrongQuestionEntry) =>
    `${entry.attemptId}::${entry.question}::${entry.selectedAnswer}`;

  return (
    <div className="chapter-stats-overlay" onClick={onClose}>
      <div
        className="chapter-stats-modal wrong-questions-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="chapter-stats-head">
          <div>
            <p className="chapter-stats-kicker">View Wrongs</p>
            <h3 className="chapter-stats-title">{chapterLabel}</h3>
            <p className="chapter-stats-subtitle">
              Review incorrect questions and attach notes to each one.
            </p>
          </div>
          <button
            type="button"
            className="chapter-stats-close"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {entries.length === 0 ? (
          <div className="chapter-stats-empty">
            No incorrect questions recorded for this chapter yet.
          </div>
        ) : (
          <div className="wrong-question-list">
            {entries.map((entry, index) => {
              const entryKey = buildEntryKey(entry);
              return (
                <div
                  key={`${entryKey}-${index}`}
                  className="wrong-question-card"
                >
                  <div className="wrong-question-head">
                    <div>
                      <strong>{entry.topic}</strong>
                      <span>{formatDateTime(entry.createdAt)}</span>
                    </div>
                    <div className="wrong-question-badges">
                      <span className="wrong-badge wrong">
                        Selected: {entry.selectedAnswer || "Skipped"}
                      </span>
                      <span className="wrong-badge correct">
                        Correct: {entry.correctAnswer}
                      </span>
                    </div>
                  </div>

                  <p className="wrong-question-copy">{entry.question}</p>

                  <div className="wrong-question-options">
                    {entry.options.map((option) => {
                      const isCorrect = option === entry.correctAnswer;
                      const isSelected = option === entry.selectedAnswer;
                      return (
                        <div
                          key={`${entryKey}-${option}`}
                          className={`wrong-question-option ${
                            isCorrect ? "correct" : isSelected ? "selected" : ""
                          }`}
                        >
                          {option}
                        </div>
                      );
                    })}
                  </div>

                  <div className="wrong-question-notes">
                    <div className="wrong-question-notes-head">
                      <span>Notes</span>
                      <button
                        type="button"
                        className="note-manager-inline-btn"
                        onClick={() => {
                          setEditingKey(`${entryKey}::new`);
                          setDraft("");
                        }}
                      >
                        Add Note
                      </button>
                    </div>

                    {(entry.notes || []).length === 0 ? (
                      <div className="chapter-stats-empty compact">
                        No notes on this wrong question yet.
                      </div>
                    ) : (
                      <div className="wrong-question-note-list">
                        {entry.notes.map((note, noteIndex) => (
                          <div
                            key={`${entryKey}-note-${noteIndex}`}
                            className="wrong-question-note-item"
                          >
                            <p>{note}</p>
                            <div className="note-manager-inline-actions">
                              <button
                                type="button"
                                className="note-manager-inline-btn"
                                onClick={() => {
                                  setEditingKey(`${entryKey}::${noteIndex}`);
                                  setDraft(note);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="note-manager-inline-btn danger"
                                onClick={() =>
                                  void onDeleteQuestionNote(entry, noteIndex)
                                }
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {editingKey?.startsWith(entryKey) ? (
                      <div className="note-manager-composer compact">
                        <textarea
                          className="note-manager-textarea"
                          rows={4}
                          value={draft}
                          onChange={(event) => setDraft(event.target.value)}
                          placeholder="Write a mistake note, trap, or correction insight..."
                        />
                        <div className="note-manager-actions">
                          <button
                            type="button"
                            className="chapter-stats-close"
                            onClick={() => {
                              setEditingKey(null);
                              setDraft("");
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="note-manager-primary"
                            onClick={async () => {
                              const normalized = draft.trim();
                              if (!normalized) return;
                              const parts = editingKey.split("::");
                              const noteIndex =
                                parts.at(-1) === "new"
                                  ? undefined
                                  : Number(parts.at(-1));
                              await onSaveQuestionNote(
                                entry,
                                normalized,
                                Number.isInteger(noteIndex)
                                  ? noteIndex
                                  : undefined,
                              );
                              setEditingKey(null);
                              setDraft("");
                            }}
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ChapterStatsPopup({
  chapterLabel,
  summary,
  onClose,
  onViewWrongs,
}: {
  chapterLabel: string;
  summary: ChapterAttemptSummary;
  onClose: () => void;
  onViewWrongs: () => void;
}) {
  return (
    <div className="chapter-stats-overlay" onClick={onClose}>
      <div
        className="chapter-stats-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="chapter-stats-head">
          <div>
            <p className="chapter-stats-kicker">Chapter Test Intelligence</p>
            <h3 className="chapter-stats-title">{chapterLabel}</h3>
            <p className="chapter-stats-subtitle">
              All linked quiz attempts for this note chapter.
            </p>
          </div>
          <div className="chapter-stats-head-actions">
            <button
              type="button"
              className="note-manager-primary"
              onClick={onViewWrongs}
            >
              View Wrongs
            </button>
            <button
              type="button"
              className="chapter-stats-close"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>

        <div className="chapter-stats-grid">
          <div className="chapter-stats-tile">
            <span>Attempts</span>
            <strong>{summary.attempts}</strong>
          </div>
          <div className="chapter-stats-tile">
            <span>Score</span>
            <strong>
              {summary.correct}/{summary.total}
            </strong>
          </div>
          <div className="chapter-stats-tile">
            <span>Accuracy</span>
            <strong>{formatPercent(summary.accuracy)}</strong>
          </div>
          <div className="chapter-stats-tile">
            <span>Percentage</span>
            <strong>{formatPercent(summary.percentage)}</strong>
          </div>
        </div>

        <div className="chapter-stats-band">
          <div
            className="chapter-stats-band-fill correct"
            style={{
              width: `${summary.total ? (summary.correct / summary.total) * 100 : 0}%`,
            }}
          />
          <div
            className="chapter-stats-band-fill incorrect"
            style={{
              width: `${summary.total ? (summary.incorrect / summary.total) * 100 : 0}%`,
            }}
          />
          <div
            className="chapter-stats-band-fill skipped"
            style={{
              width: `${summary.total ? (summary.skipped / summary.total) * 100 : 0}%`,
            }}
          />
        </div>

        <div className="chapter-stats-meta">
          <span>Correct: {summary.correct}</span>
          <span>Incorrect: {summary.incorrect}</span>
          <span>Skipped: {summary.skipped}</span>
        </div>

        <div className="chapter-stats-history">
          <div className="chapter-stats-history-head">
            <span>Test History</span>
            <span>
              {summary.latestAttemptAt
                ? `Latest: ${formatDateTime(summary.latestAttemptAt)}`
                : "No attempts yet"}
            </span>
          </div>

          {summary.history.length === 0 ? (
            <div className="chapter-stats-empty">
              No quiz attempts are linked to this chapter yet.
            </div>
          ) : (
            <div className="chapter-stats-history-list">
              {summary.history.map((entry) => (
                <div key={entry.id} className="chapter-stats-history-item">
                  <div>
                    <strong>{entry.topic}</strong>
                    <span>{formatDateTime(entry.createdAt)}</span>
                  </div>
                  <div>
                    <strong>{entry.scoreLabel}</strong>
                    <span>
                      {formatPercent(entry.accuracy)} accuracy •{" "}
                      {formatPercent(entry.percentage)} score
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SubjectDashboard({
  data,
  storageKeys,
  subtitle,
  title,
  quizSubjectName,
  smartModeData,
}: SubjectDashboardProps) {
  const [isSmartModeEnabled, setIsSmartModeEnabled] = useState(false);
  const [isPlannerMissionRoute] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("plannerMission") === "1",
  );
  const activeData = useMemo(
    () =>
      !isPlannerMissionRoute &&
      isSmartModeEnabled &&
      smartModeData &&
      smartModeData.length > 0
        ? smartModeData
        : data,
    [data, isPlannerMissionRoute, isSmartModeEnabled, smartModeData],
  );
  const dashboard = useSubjectDashboardState(
    activeData,
    storageKeys,
    quizSubjectName,
  );
  const chapterNodes = useMemo(() => activeData, [activeData]);
  const allNodes = useMemo(() => flattenNodes(activeData), [activeData]);
  const chapterUids = useMemo(
    () => new Set(chapterNodes.map((node) => node.uid)),
    [chapterNodes],
  );
  const [chapterAttemptSummaries, setChapterAttemptSummaries] = useState<
    Record<string, ChapterAttemptSummary>
  >({});
  const [activeChapterUid, setActiveChapterUid] = useState<string | null>(null);
  const [isWrongsOpen, setIsWrongsOpen] = useState(false);
  const [plannerSession, setPlannerSession] =
    useState<PlannerMissionSession | null>(null);
  const [activePlannerMissionId, setActivePlannerMissionId] = useState<
    string | null
  >(null);
  const [plannerTimerNow, setPlannerTimerNow] = useState(() => Date.now());
  const hasPlannerTimerExpiredRef = useRef(false);
  const [isAppreciationOpen, setIsAppreciationOpen] = useState(false);
  const currentSubject =
    STORAGE_KEY_TO_SUBJECT[storageKeys.checked] || quizSubjectName || title;
  const collapseToExpandedUids = dashboard.collapseToExpandedUids;

  const { insightsMap, addInsight, deleteInsight } = useInsightsVault(
    storageKeys.checked,
  );
  const [activeInsightNode, setActiveInsightNode] = useState<{
    uid: string;
    label: string;
  } | null>(null);

  const parentUidMap = useMemo(
    () => buildParentUidMap(activeData),
    [activeData],
  );

  const handleOpenChapterStats = useCallback(
    (uid: string) => {
      if (activeChapterUid === uid) return; // Avoid re-renders if already active
      setActiveChapterUid(uid);
      setIsWrongsOpen(false);
    },
    [activeChapterUid],
  );

  const refreshAttemptSummaries = useCallback(async () => {
    try {
      const attempts = await fetchAttempts();
      setChapterAttemptSummaries(
        buildChapterAttemptSummaries(chapterNodes, attempts, quizSubjectName),
      );
    } catch {
      setChapterAttemptSummaries({});
    }
  }, [chapterNodes, quizSubjectName]);

  useEffect(() => {
    let isCurrent = true;
    if (quizSubjectName) {
      window.setTimeout(() => {
        if (!isCurrent) return;
        refreshAttemptSummaries().catch(() => {
          /* Optionally handle error */
        });
      }, 0);
    }
    return () => {
      isCurrent = false;
    };
  }, [quizSubjectName, refreshAttemptSummaries]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("plannerMission") !== "1") return;

    try {
      const rawSession = window.sessionStorage.getItem(
        PLANNER_NOTE_SESSION_KEY,
      );
      const parsedSession = normalizePlannerSession(
        rawSession ? JSON.parse(rawSession) : null,
      );
      if (!parsedSession) return;

      window.setTimeout(() => {
        setPlannerSession(parsedSession);
        setActivePlannerMissionId(parsedSession.activeMissionId || null);
      }, 0);
    } catch {
      window.setTimeout(() => {
        setPlannerSession(null);
        setActivePlannerMissionId(null);
      }, 0);
    }
  }, []);

  const activePlannerMission = useMemo(() => {
    if (!plannerSession) return null;
    if (activePlannerMissionId) {
      const selectedMission =
        plannerSession.missions.find(
          (mission) => mission.id === activePlannerMissionId,
        ) || null;
      if (selectedMission) return selectedMission;
    }
    // PERFECT NEW CODE
    return findFirstIncompleteMission(
      plannerSession,
      dashboard.checkedUids,
      dashboard.completionTimes,
    );
  }, [
    activePlannerMissionId,
    dashboard.checkedUids,
    dashboard.completionTimes,
    plannerSession,
  ]);

  const timedPlannerMission = useMemo(() => {
    if (!plannerSession) return null;
    if (activePlannerMission) return activePlannerMission;
    if (!activePlannerMissionId) return null;
    return (
      plannerSession.missions.find(
        (mission) => mission.id === activePlannerMissionId,
      ) || null
    );
  }, [activePlannerMission, activePlannerMissionId, plannerSession]);

  const plannerTimerState = useMemo(() => {
    if (!plannerSession || !timedPlannerMission) return null;

    const studyEndAt = getPlannerMissionStudyEndAt(
      plannerSession,
      timedPlannerMission,
    );
    const graceMinutes = Math.max(
      1,
      plannerSession.graceMinutes || PLANNER_GRACE_MINUTES,
    );
    const graceEndAt = studyEndAt + graceMinutes * 60 * 1000;
    const phase: PlannerTimerPhase =
      plannerTimerNow < studyEndAt
        ? "study"
        : plannerTimerNow < graceEndAt
          ? "grace"
          : "expired";
    const remainingMs =
      phase === "study"
        ? studyEndAt - plannerTimerNow
        : phase === "grace"
          ? graceEndAt - plannerTimerNow
          : 0;
    const targetLeafUids = timedPlannerMission.targets.flatMap((target) =>
      Array.isArray(target.leafUids) ? target.leafUids : [],
    );
    const completedTargets =
      timedPlannerMission.mode === "revise"
        ? targetLeafUids.filter(
            (uid) =>
              dashboard.checkedUids.has(uid) &&
              hasFreshRevision(
                uid,
                dashboard.completionTimes,
                typeof timedPlannerMission.createdAt === "number"
                  ? timedPlannerMission.createdAt
                  : plannerSession.startedAt,
              ),
          ).length
        : targetLeafUids.filter((uid) => dashboard.checkedUids.has(uid)).length;

    return {
      phase,
      remainingMs,
      graceMinutes,
      totalTargets: targetLeafUids.length,
      completedTargets,
      mission: timedPlannerMission,
    };
  }, [
    dashboard.checkedUids,
    dashboard.completionTimes,
    plannerSession,
    plannerTimerNow,
    timedPlannerMission,
  ]);

  useEffect(() => {
    if (!plannerSession || !timedPlannerMission) return;

    const intervalId = window.setInterval(() => {
      setPlannerTimerNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [plannerSession, timedPlannerMission]);

  useEffect(() => {
    hasPlannerTimerExpiredRef.current = false;
  }, [plannerSession?.startedAt, activePlannerMissionId]);

  useEffect(() => {
    if (!plannerSession || !plannerTimerState) return;
    if (plannerTimerState.phase !== "expired") return;
    if (hasPlannerTimerExpiredRef.current) return;

    hasPlannerTimerExpiredRef.current = true;
    const completedAt = Date.now();
    window.sessionStorage.setItem(
      PLANNER_LAST_TIMED_RUN_KEY,
      JSON.stringify({
        missionId: plannerTimerState.mission.id,
        subject: plannerTimerState.mission.subject,
        chapterLabel: plannerTimerState.mission.chapterLabel,
        completedTargets: plannerTimerState.completedTargets,
        totalTargets: plannerTimerState.totalTargets,
        completedAt,
      }),
    );
    window.sessionStorage.removeItem(PLANNER_NOTE_SESSION_KEY);
    window.location.href = plannerSession.returnTo || "/planner";
  }, [plannerSession, plannerTimerState]);

  const missionVisibleUids = useMemo(() => {
    if (!timedPlannerMission) return null;
    if (timedPlannerMission.subject !== currentSubject) return null;

    const visible = new Set<string>();

    [timedPlannerMission].forEach((mission) => {
      const chapterNode = findChapterNode(chapterNodes, mission);
      if (chapterNode) {
        visible.add(chapterNode.uid);
        collectAncestorUids(chapterNode.uid, parentUidMap).forEach((uid) =>
          visible.add(uid),
        );
      }

      mission.targets.forEach((target) => {
        if (target.uid) {
          visible.add(target.uid);
          collectAncestorUids(target.uid, parentUidMap).forEach((uid) =>
            visible.add(uid),
          );
        }

        if (target.topicUid) {
          visible.add(target.topicUid);
          collectAncestorUids(target.topicUid, parentUidMap).forEach((uid) =>
            visible.add(uid),
          );
        }

        (target.leafUids || []).forEach((leafUid) => {
          visible.add(leafUid);
          collectAncestorUids(leafUid, parentUidMap).forEach((uid) =>
            visible.add(uid),
          );
        });
      });
    });

    return visible.size > 0 ? visible : new Set(["__planner_empty_scope__"]);
  }, [chapterNodes, currentSubject, parentUidMap, timedPlannerMission]);

  const activeVisibleUids = useMemo(() => {
    if (!missionVisibleUids) return dashboard.visibleUids;
    return missionVisibleUids;
  }, [dashboard.visibleUids, missionVisibleUids]);

  const missionVisibleVersion = useMemo(() => {
    if (!missionVisibleUids) return 0;
    return Array.from(missionVisibleUids).sort().join("|").length;
  }, [missionVisibleUids]);

  const focusPlannerMission = useCallback(
    (mission: PlannerMissionSessionMission) => {
      const expandedUids = new Set<string>();

      [mission]
        .filter((item) => item.subject === currentSubject)
        .forEach((item) => {
          const chapterNode = findChapterNode(chapterNodes, item);
          if (chapterNode) {
            expandedUids.add(chapterNode.uid);
            collectAncestorUids(chapterNode.uid, parentUidMap).forEach((uid) =>
              expandedUids.add(uid),
            );
          }

          item.targets.forEach((target) => {
            if (target.topicUid) {
              expandedUids.add(target.topicUid);
              collectAncestorUids(target.topicUid, parentUidMap).forEach(
                (uid) => expandedUids.add(uid),
              );
            }

            (target.leafUids || []).forEach((leafUid) => {
              collectAncestorUids(leafUid, parentUidMap).forEach((uid) =>
                expandedUids.add(uid),
              );
            });
          });
        });

      collapseToExpandedUids(expandedUids);

      window.setTimeout(() => {
        const chapterNode = findChapterNode(chapterNodes, mission);
        const targetUid =
          chapterNode?.uid ||
          mission.targets[0]?.topicUid ||
          mission.targets[0]?.uid;
        if (!targetUid) return;

        document
          .getElementById(`subject-node-${targetUid}`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    },
    [chapterNodes, collapseToExpandedUids, currentSubject, parentUidMap],
  );

  useEffect(() => {
    if (!plannerSession || !activePlannerMission) return;
    if (activePlannerMission.subject !== currentSubject) return;
    focusPlannerMission(activePlannerMission);
  }, [
    activePlannerMission,
    currentSubject,
    focusPlannerMission,
    plannerSession,
  ]);

  useEffect(() => {
    if (!plannerSession) return;
    // PERFECT NEW CODE
    const nextMission = findFirstIncompleteMission(
      plannerSession,
      dashboard.checkedUids,
      dashboard.completionTimes,
    );

    const activeMissionFinished =
      activePlannerMissionId &&
      plannerTimerState &&
      isMissionComplete(
        plannerTimerState.mission,
        dashboard.checkedUids,
        dashboard.completionTimes,
      );

    if (activeMissionFinished && plannerTimerState) {
      if (hasPlannerTimerExpiredRef.current) return;
      hasPlannerTimerExpiredRef.current = true;
      const completedAt = Date.now();
      window.sessionStorage.setItem(
        PLANNER_LAST_TIMED_RUN_KEY,
        JSON.stringify({
          missionId: plannerTimerState.mission.id,
          subject: plannerTimerState.mission.subject,
          chapterLabel: plannerTimerState.mission.chapterLabel,
          completedTargets: plannerTimerState.totalTargets,
          totalTargets: plannerTimerState.totalTargets,
          completedAt,
        }),
      );
      void (async () => {
        try {
          await savePlannerRunProgress(
            storageKeys.checked,
            dashboard.checkedUids,
            dashboard.completionTimes,
          );
        } catch (error) {
          console.warn("Failed to flush planner run progress:", error);
        } finally {
          window.sessionStorage.removeItem(PLANNER_NOTE_SESSION_KEY);
          window.location.href = plannerSession.returnTo || "/planner";
        }
      })();
      return;
    }

    if (
      activePlannerMissionId &&
      plannerTimerState &&
      plannerTimerState.phase !== "expired" &&
      !activeMissionFinished
    ) {
      return;
    }

    if (!nextMission) {
      if (
        plannerTimerState &&
        plannerTimerState.phase !== "expired" &&
        activePlannerMissionId &&
        !activeMissionFinished
      ) {
        return;
      }
      window.sessionStorage.removeItem(PLANNER_NOTE_SESSION_KEY);
      window.setTimeout(() => {
        setActivePlannerMissionId(null);
        setIsAppreciationOpen(true);
      }, 0);
      return;
    }

    if (nextMission.id === activePlannerMissionId) return;

    const nextSession = {
      ...plannerSession,
      activeMissionId: nextMission.id,
    };
    window.sessionStorage.setItem(
      PLANNER_NOTE_SESSION_KEY,
      JSON.stringify(nextSession),
    );
    window.setTimeout(() => {
      setPlannerSession(nextSession);
      setActivePlannerMissionId(nextMission.id);
    }, 0);

    if (nextMission.subject !== currentSubject) {
      const nextRoute = SUBJECT_ROUTE_REGISTRY[nextMission.subject];
      if (nextRoute) {
        window.location.href = `${nextRoute}?plannerMission=1`;
      }
      return;
    }

    focusPlannerMission(nextMission);
  }, [
    activePlannerMissionId,
    currentSubject,
    dashboard.checkedUids,
    dashboard.completionTimes,
    focusPlannerMission,
    plannerSession,
    plannerTimerState,
    storageKeys.checked,
  ]);

  const activeChapterNode = activeChapterUid
    ? chapterNodes.find((node) => node.uid === activeChapterUid) || null
    : null;
  const activeChapterSummary = activeChapterUid
    ? chapterAttemptSummaries[activeChapterUid]
    : null;
  const activeNoteNode = dashboard.activeNoteUid
    ? allNodes.find((node) => node.uid === dashboard.activeNoteUid) || null
    : null;
  const activeNoteDocument = dashboard.activeNoteUid
    ? dashboard.noteDocuments[dashboard.activeNoteUid] || {
        active: [],
        trash: [],
      }
    : null;

  // ⚡ PRO POWER FIX: Memoize TreeView so opening popups/modals doesn't freeze the app by re-rendering the massive tree
  const handleDownloadSubjectNotes = useCallback(() => {
    const exportText = buildSubjectNotesExport(activeData, {
      title,
      modeLabel: isSmartModeEnabled ? "Smart Notes" : "Structured Notes",
      generatedAt: new Date(),
    });
    downloadTextFile(
      exportText,
      buildSubjectNotesExportFilename(title),
      "text/plain",
    );
  }, [activeData, isSmartModeEnabled, title]);

  const handleDownloadSubjectQuiz = useCallback(async () => {
    if (!quizSubjectName) {
      window.alert("No quiz bank is linked to this subject.");
      return;
    }

    const response = await fetch(
      `/api/mcq-bank?subject=${encodeURIComponent(quizSubjectName)}`,
    );
    const payload = (await response.json()) as
      | SubjectQuizExportSource
      | { error?: string };

    if (!response.ok) {
      window.alert(
        "error" in payload && payload.error
          ? payload.error
          : "Unable to download quiz structure.",
      );
      return;
    }

    downloadTextFile(
      buildSubjectQuizExport(payload as SubjectQuizExportSource),
      buildSubjectQuizExportFilename(quizSubjectName),
      "application/json",
    );
  }, [quizSubjectName]);

  const memoizedTreeView = useMemo(
    () => (
      <TreeView
        data={activeData}
        isSmartModeEnabled={isSmartModeEnabled}
        checkedUids={dashboard.checkedUids}
        completionTimes={dashboard.completionTimes}
        nodeStatuses={dashboard.nodeStatuses}
        effectiveCollapsed={dashboard.effectiveCollapsed}
        indeterminateUids={dashboard.indeterminateUids}
        starredUids={dashboard.starredUids}
        notes={dashboard.notes}
        visibleUids={activeVisibleUids}
        chapterUids={chapterUids}
        chapterAttemptSummaries={chapterAttemptSummaries}
        nodeRenderVersions={dashboard.nodeRenderVersions}
        treeRenderVersion={dashboard.treeRenderVersion + missionVisibleVersion}
        onCheck={dashboard.handleCheck}
        onLogRevision={dashboard.logRevision}
        onOpenChapterStats={handleOpenChapterStats}
        onToggleCollapse={dashboard.toggleCollapse}
        onToggleNote={dashboard.toggleNote}
        onToggleStar={dashboard.toggleStar}
        insightsMap={insightsMap}
        onOpenInsight={(uid: string, label: string) =>
          setActiveInsightNode({ uid, label })
        }
      />
    ),
    [
      activeData,
      isSmartModeEnabled,
      dashboard.checkedUids,
      dashboard.completionTimes,
      dashboard.nodeStatuses,
      dashboard.effectiveCollapsed,
      dashboard.indeterminateUids,
      dashboard.starredUids,
      dashboard.notes,
      activeVisibleUids,
      chapterUids,
      chapterAttemptSummaries,
      dashboard.nodeRenderVersions,
      dashboard.treeRenderVersion,
      missionVisibleVersion,
      dashboard.handleCheck,
      dashboard.logRevision,
      handleOpenChapterStats,
      dashboard.toggleCollapse,
      dashboard.toggleNote,
      dashboard.toggleStar,
      insightsMap,
    ],
  );

  return (
    <>
      <TopBar
        theme={dashboard.theme}
        onToggleTheme={dashboard.toggleTheme}
        onToggleZen={() => dashboard.setIsZen(!dashboard.isZen)}
      />

      <div
        id="mainWrap"
        className={`mh-wrap ${dashboard.isRecall ? "active-recall" : ""}`}
      >
        <DashboardHeader title={title} subtitle={subtitle} />
        <ProgressBar progress={dashboard.progress} />
        <MasteryLegend />
        <DashboardControls
          searchQuery={dashboard.searchQuery}
          isRecall={dashboard.isRecall}
          isSmartModeEnabled={isSmartModeEnabled}
          canToggleSmartMode={Boolean(smartModeData?.length)}
          starFilter={dashboard.starFilter}
          onSearch={dashboard.handleSearch}
          onExpandAll={dashboard.expandAll}
          onCollapseAll={dashboard.collapseAll}
          onDownloadNotes={handleDownloadSubjectNotes}
          onDownloadQuiz={handleDownloadSubjectQuiz}
          onToggleRecall={() => dashboard.setIsRecall(!dashboard.isRecall)}
          onToggleSmartMode={() => setIsSmartModeEnabled((value) => !value)}
          onToggleStarFilter={() =>
            dashboard.setStarFilter(!dashboard.starFilter)
          }
        />
        {plannerTimerState && (
          <PlannerMissionTimerBanner
            timerState={plannerTimerState}
            autoStarted={plannerSession?.autoStarted}
          />
        )}
        {memoizedTreeView}
      </div>

      {activeNoteNode && activeNoteDocument && (
        <SubjectNotesPopup
          key={activeNoteNode.uid}
          nodeLabel={activeNoteNode.label}
          documentState={activeNoteDocument}
          onClose={dashboard.closeNoteManager}
          onAddNote={(content) =>
            dashboard.addNoteEntry(activeNoteNode.uid, content)
          }
          onEditNote={(noteId, content) =>
            dashboard.editNoteEntry(activeNoteNode.uid, noteId, content)
          }
          onTrashNote={(noteId) =>
            dashboard.trashNoteEntry(activeNoteNode.uid, noteId)
          }
          onRestoreNote={(noteId) =>
            dashboard.restoreNoteEntry(activeNoteNode.uid, noteId)
          }
          onDeleteForever={(noteId) =>
            dashboard.permanentlyDeleteNoteEntry(activeNoteNode.uid, noteId)
          }
        />
      )}

      {activeChapterNode && activeChapterSummary && !isWrongsOpen && (
        <ChapterStatsPopup
          chapterLabel={activeChapterNode.label}
          summary={activeChapterSummary}
          onClose={() => setActiveChapterUid(null)}
          onViewWrongs={() => setIsWrongsOpen(true)}
        />
      )}

      {activeChapterNode && activeChapterSummary && isWrongsOpen && (
        <WrongQuestionNotesPopup
          chapterLabel={activeChapterNode.label}
          entries={activeChapterSummary.wrongQuestions}
          onClose={() => setIsWrongsOpen(false)}
          onSaveQuestionNote={async (entry, note, noteIndex) => {
            await updateAttemptQuestionNote({
              id: entry.attemptId,
              question: entry.question,
              selectedAnswer: entry.selectedAnswer,
              correctAnswer: entry.correctAnswer,
              note,
              mode: typeof noteIndex === "number" ? "edit" : "add",
              noteIndex,
            });
            await refreshAttemptSummaries();
          }}
          onDeleteQuestionNote={async (entry, noteIndex) => {
            await updateAttemptQuestionNote({
              id: entry.attemptId,
              question: entry.question,
              selectedAnswer: entry.selectedAnswer,
              correctAnswer: entry.correctAnswer,
              note: "",
              mode: "delete",
              noteIndex,
            });
            await refreshAttemptSummaries();
          }}
        />
      )}

      {isAppreciationOpen && (
        <AppreciationPopup onClose={() => setIsAppreciationOpen(false)} />
      )}
      <AppToast toast={dashboard.subjectProgressToast} />
      <DashboardHeaderStyles />

      <DashboardStyles />

      <InsightsModal
        isOpen={!!activeInsightNode}
        onClose={() => setActiveInsightNode(null)}
        nodeUid={activeInsightNode?.uid || ""}
        nodeLabel={activeInsightNode?.label || ""}
        insights={ 
          activeInsightNode ? insightsMap[activeInsightNode.uid] || [] : []
        } 
        allInsights={insightsMap}
        onAdd={addInsight}
        onDelete={deleteInsight}
      />
    </>
  );
}
