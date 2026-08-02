"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { initSubjectData } from "@/app/subject-dashboard/utils";
import { savePlannerSafely, flushPlannerVault } from "@/lib/api/plannerQueue";
import {
  calculateNoteMissionProgress,
  getNoteMissionMode,
} from "../../../shared/plannerMissionProgress";

import {
  CelebrationOverlay,
  useCelebration,
} from "@/features/dashboard/components/rewards";

// ==========================================
// 1. DYNAMIC SYLLABUS IMPORTS (TOP LEVEL)
// ==========================================
// ==========================================
// 1. DYNAMIC SYLLABUS IMPORTS (TOP LEVEL)
// ==========================================
import { RAW_D as polityData } from "@/app/subject-dashboard/data/polityData";
import { RAW_D as ancientData } from "@/app/subject-dashboard/data/ancientHistoryData";
import { RAW_D as modernData } from "@/app/subject-dashboard/data/modernHistoryData";
import { RAW_D as geoData } from "@/app/subject-dashboard/data/geographyData";
import { RAW_D as ecoData } from "@/app/subject-dashboard/data/economicsData";
import { RAW_D as artData } from "@/app/subject-dashboard/data/artCultureData";
import { RAW_D as scTechData } from "@/app/subject-dashboard/data/scTechData";
import { RAW_D as envData } from "@/app/subject-dashboard/data/environmentSmartData";
import { RAW_D as govData } from "@/app/subject-dashboard/data/governanceData";
import { RAW_D as irData } from "@/app/subject-dashboard/data/internationalRelationsData";
import { RAW_D as isData } from "@/app/subject-dashboard/data/internalSecurityData";
import { RAW_D as societyData } from "@/app/subject-dashboard/data/societyData";
import { RAW_D as sjData } from "@/app/subject-dashboard/data/socialJusticeData";
import { RAW_D as dmData } from "@/app/subject-dashboard/data/disasterManagementData";
import { RAW_D as agriData } from "@/app/subject-dashboard/data/agricultureData";
import { RAW_D as worldData } from "@/app/subject-dashboard/data/worldHistoryData";

// ==========================================
// 2. BACKEND TYPES & EXPORTS
// ==========================================
export interface PlannerTopicTarget {
  uid: string;
  label: string;
  topicUid?: string | null;
  leafUids?: string[];
  isCompleted?: boolean;
  isRevised?: boolean;
  totalLeafCount?: number;
  completedLeafCount?: number;
  revisedLeafCount?: number;
  completionPercent?: number;
}
// PRO FIX: Phase 1 Time Validation Engine Interface
export interface TimeValidation {
  plannedStart: string;
  plannedEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
  validationState:
    | "pending"
    | "early_bird"
    | "on_time"
    | "delayed_start"
    | "accident_shift";
  delayReason: string;
}

export interface PlannerNoteMission {
  id: string;
  mode?: "complete" | "revise";
  createdAt?: number;
  subjectKey: string;
  subject: string;
  chapterUid: string;
  chapterLabel: string;
  targets: PlannerTopicTarget[];
  timeValidation?: TimeValidation;
  progress?: {
    status: string;
    completionPercent: number;
    totalTargets: number;
    completedTargets: number;
    revisedTargets: number;
    closedAt?: number | null;
    targets?: PlannerTopicTarget[];
  };
}
export interface PlannerTestMission {
  id: string;
  subject: string;
  chapterSlug: string;
  chapterTitle: string;
  noteChapterId: string;
  noteChapterLabel: string;
  mode: string;
  timeLimitMinutes: number;
  totalQuestions: number;
  difficultyBreakdown: { easy: number; medium: number; hard: number };
  timeValidation?: TimeValidation;
  progress?: {
    status: string;
    completionPercent: number;
    completedQuestions: number;
    accuracy: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
  };
}
export interface PlannerDay {
  dateKey: string;
  dayOfWeek: string;
  dateLabel: string;
  noteMissions: PlannerNoteMission[];
  testMissions: PlannerTestMission[];
  otherMissions: any[];
  summary?: {
    totalMissionCount: number;
    completedMissionCount: number;
    deepTotalPoints?: number;
    deepCompletedPoints?: number;
  };
}
export interface ExecutionMatrixState {
  currentStreak: number;
  lastPenaltyAt: string | null;
  penaltyCount: number;
  resetCount: number;
}
export interface WeeklyPlanData {
  weekStartDate: string;
  status: string;
  committedAt: string | null;
  updatedAt?: number; // 🛡️ PRO FIX: Required for the Multi-Device Timestamp Conflict Engine
  days: PlannerDay[];
  summary?: {
    totalMissionCount: number;
    completedMissionCount: number;
    completionPercent: number;
  };
  executionMatrix?: ExecutionMatrixState;
}

type PlannerLastTimedRun = {
  missionId: string;
  subject: string;
  chapterLabel: string;
  completedTargets: number;
  totalTargets: number;
  completedAt: number;
};

export type TaskCategory = "Note" | "Test" | "Other";
export interface BuilderNote {
  id: string;
  mode: "complete" | "revise";
  subject: string;
  chapter: string;
  topics: string[];
  totalPoints: number;
  plannedStart?: string;
  plannedEnd?: string;
}
export interface BuilderTest {
  id: string;
  subject: string;
  chapter: string;
  topic: string;
  mode: string;
  easy: number;
  medium: number;
  hard: number;
  timer: number;
  plannedStart?: string;
  plannedEnd?: string;
}

interface McqChapterOption {
  slug: string;
  title: string;
  questionCount: number;
  difficultyCounts?: { easy?: number; medium?: number; hard?: number };
}

export interface DayBuilderState {
  notes: BuilderNote[];
  tests: BuilderTest[];
  others: any[];
}

// ==========================================
// 3. CONSTANTS, REGISTRY & SMART INHERITANCE
// ==========================================
const rawUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";
const API_URL = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl}/api`;
const SUBJECT_PROGRESS_API_URL = `${API_URL}/subject-progress`;
const DAY_LABELS: Record<string, string> = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
  SUN: "Sunday",
};

const SUBJECT_DATA_REGISTRY: Record<string, any[]> = {
  Polity: polityData,
  "Ancient History": ancientData,
  "Modern History": modernData,
  Geography: geoData,
  Economics: ecoData,
  "Art & Culture": artData,
  "Science & Tech": scTechData,
  Environment: envData,
  Governance: govData,
  "International Relations": irData,
  "Internal Security": isData,
  Society: societyData,
  "Social Justice": sjData,
  "Disaster Management": dmData,
  Agriculture: agriData,
  "World History": worldData,
};

const SUBJECT_PROGRESS_KEY_REGISTRY: Record<string, string> = {
  Polity: "upsc_polity_ultimate_checked",
  "Ancient History": "upsc_ancient_ultimate_checked",
  "Modern History": "upsc_checked",
  Geography: "upsc_geo_complete_checked",
  Economics: "upsc_economics_checked",
  "Art & Culture": "upsc_art_culture_checked",
  "Science & Tech": "upsc_sc_tech_checked",
  Environment: "upsc_environment_checked",
  Governance: "upsc_governance_checked",
  "International Relations": "upsc_ir_checked",
  "Internal Security": "upsc_internal_security_checked",
  Society: "upsc_society_checked",
  "Social Justice": "upsc_social_justice_checked",
  "Disaster Management": "upsc_disaster_management_checked",
  Agriculture: "upsc_agriculture_checked",
  "World History": "upsc_world_history_checked",
};

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

const PLANNER_NOTE_SESSION_KEY = "planner-note-mission-session";
const PLANNER_AUTO_MODE_KEY = "planner-auto-mode-enabled";
const PLANNER_LAST_TIMED_RUN_KEY = "planner-last-timed-run";
const DEBT_COLLECTOR_START = "20:00";
const DEBT_COLLECTOR_END = "21:30";
const HARD_LATE_MINUTES = 15;
const BLITZ_LATE_MINUTES = 40;
const PLANNER_GRACE_MINUTES = 7;
const AUTO_MODE_START_LEAD_MS = 15 * 1000;

const subjectTreeCache = new Map<string, any[]>();
const targetMetadataCache = new Map<string, PlannerTopicTarget>();

function getSubjectTree(subject: string) {
  const cachedTree = subjectTreeCache.get(subject);
  if (cachedTree) return cachedTree;

  const rawNodes = SUBJECT_DATA_REGISTRY[subject];
  if (!rawNodes) return [];

  const initializedTree = initSubjectData(rawNodes, "root");
  subjectTreeCache.set(subject, initializedTree);
  return initializedTree;
}

type SubjectProgressCompletionRecord =
  | number
  | {
      completedAt?: number;
      revisedAt?: number;
      revisions?: number[];
    };

type SubjectProgressPayload = {
  checkedUids: string[];
  completionTimes: Record<string, SubjectProgressCompletionRecord>;
};

type SubjectProgressLookup = Record<string, SubjectProgressPayload>;

// --- BULLETPROOF TREE PARSING ---
function getLabel(node: any) {
  return (
    node?.label || node?.title || node?.name || node?.topic || node?.id || ""
  );
}
function getChildren(node: any) {
  return node?.children || node?.items || node?.subtopics || [];
}
// 1. 🛡️ PRO FIX: Hybrid Lookup Engine (Transitions seamlessly from Labels to UIDs)
function findNodeSafely(nodes: any[], identifier: string) {
  const byUid = nodes.find((node) => node.uid === identifier);
  if (byUid) return byUid;
  return nodes.find((node) => getLabel(node) === identifier) || null;
}

function collectLeafUids(node: any): string[] {
  const children = getChildren(node);
  if (!children.length) {
    return node?.uid ? [node.uid] : [];
  }

  return children.flatMap((child: any) => collectLeafUids(child));
}

// ⚡ PRO POWER FIX: Given a chapter + the topic labels currently selected in the
// builder form, return every leaf-point uid under them — the same uid space the
// Subject Notes checkboxes use — so we can tell if the selection is already 100% done.
function collectLeafUidsForTopics(
  subject: string,
  chapterLabel: string,
  topicLabels: string[],
): string[] {
  const subjectTree = getSubjectTree(subject);
  const chapterNode = findNodeSafely(subjectTree, chapterLabel);
  const chapterChildren = getChildren(chapterNode);

  return topicLabels.flatMap((topicLabel) => {
    const topicNode = findNodeSafely(chapterChildren, topicLabel);
    return topicNode ? collectLeafUids(topicNode) : [];
  });
}

// 2. 🛡️ PRO FIX: Robust Architecture Metadata
function getTopicTargetMetadata(
  subject: string,
  chapterIdentifier: string,
  topicIdentifier: string,
): PlannerTopicTarget {
  const cacheKey = `${subject}::${chapterIdentifier}::${topicIdentifier}`;
  const cachedTarget = targetMetadataCache.get(cacheKey);
  if (cachedTarget) return cachedTarget;

  const subjectTree = getSubjectTree(subject);
  const chapterNode = findNodeSafely(subjectTree, chapterIdentifier);
  const topicNode = findNodeSafely(getChildren(chapterNode), topicIdentifier);
  const leafUids = topicNode ? collectLeafUids(topicNode) : [];

  const target = {
    uid: topicNode?.uid || topicIdentifier, // Immutable Core connection
    label: topicNode?.label || topicIdentifier, // Display Name
    topicUid: topicNode?.uid || null,
    leafUids,
    isCompleted: false,
    isRevised: false,
  };
  targetMetadataCache.set(cacheKey, target);
  return target;
}

function computeMissionProgress(
  mission: PlannerNoteMission,
  subjectProgress?: SubjectProgressPayload,
): PlannerNoteMission {
  // 🛡️ PRO FIX: "as any" bypasses the strict Index Signature mismatch between Frontend and Shared libraries
  return calculateNoteMissionProgress(mission as any, subjectProgress, {
    hydrateTarget(target: any) {
      return getTopicTargetMetadata(
        mission.subject,
        mission.chapterLabel,
        target.label || target.uid || "",
      ) as any;
    },
  }) as unknown as PlannerNoteMission;
}

function getChaptersForSubject(subject: string) {
  const data = SUBJECT_DATA_REGISTRY[subject];
  if (!data) return [];
  return data.map((n) => getLabel(n)).filter(Boolean);
}

function getTopicsForChapter(subject: string, chapterLabel: string) {
  const data = SUBJECT_DATA_REGISTRY[subject];
  if (!data) return [];
  const chapterNode = data.find((n) => getLabel(n) === chapterLabel);
  if (!chapterNode) return [];
  return getChildren(chapterNode)
    .map((n: any) => getLabel(n))
    .filter(Boolean);
}

// Recursively counts leaf nodes (checkboxes) to generate exact point totals
function calculateExactPoints(
  subject: string,
  chapterLabel: string,
  topicLabels: string[],
) {
  const data = SUBJECT_DATA_REGISTRY[subject];
  if (!data) return topicLabels.length * 5;
  const chapterNode = data.find((n) => getLabel(n) === chapterLabel);
  if (!chapterNode) return topicLabels.length * 5;

  let total = 0;
  const chapterChildren = getChildren(chapterNode);

  topicLabels.forEach((tLabel) => {
    const topicNode = chapterChildren.find((n: any) => getLabel(n) === tLabel);
    if (topicNode) {
      let leaves = 0;
      const countLeaves = (n: any) => {
        const kids = getChildren(n);
        if (kids.length === 0) leaves++;
        else kids.forEach(countLeaves);
      };
      countLeaves(topicNode);
      total += leaves > 0 ? leaves : 1;
    } else {
      total += 5;
    }
  });
  return total > 0 ? total : 10;
}

function getMondayOfCurrentWeek() {
  const d = new Date();
  const day = d.getDay();
  // 🧠 PRO FIX: If today is Sunday (0), shift focus to TOMORROW (the upcoming Monday).
  // If it's any other day, snap back to the current week's Monday.
  const diff = day === 0 ? d.getDate() + 1 : d.getDate() - day + 1;
  return new Date(d.setDate(diff));
}

function generateEmptyWeek(mondayDate: Date): PlannerDay[] {
  const days: PlannerDay[] = [];
  const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayDate);
    d.setDate(d.getDate() + i);
    days.push({
      dateKey: getLocalDateKey(d), // 🛡️ PRO FIX: Safe from Midnight UTC Drift
      dayOfWeek: dayNames[i],
      dateLabel: d.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      }),
      noteMissions: [],
      testMissions: [],
      otherMissions: [],
      summary: { totalMissionCount: 0, completedMissionCount: 0 },
    });
  }
  return days;
}

function isProgressTarget(target: any) {
  return "isCompleted" in target && typeof target.isCompleted === "boolean";
}

function parseTimeToMinutes(value?: string | null) {
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

function minutesToTime(totalMinutes: number) {
  const clampedMinutes = Math.max(0, Math.min(23 * 60 + 59, totalMinutes));
  const hours = Math.floor(clampedMinutes / 60);
  const minutes = clampedMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function shiftTime(value?: string | null, shiftMinutes = 0) {
  const minutes = parseTimeToMinutes(value);
  if (minutes === null) return value || "00:00";
  return minutesToTime(minutes + shiftMinutes);
}

function getMissionStartMinutes(
  mission: PlannerNoteMission | PlannerTestMission,
) {
  return parseTimeToMinutes(mission.timeValidation?.plannedStart);
}

function createDebtCollectorBlock(dateKey: string) {
  return {
    id: `debt-collector-${dateKey}`,
    type: "debt_collector",
    title: "Debt Collector Block",
    plannedStart: DEBT_COLLECTOR_START,
    plannedEnd: DEBT_COLLECTOR_END,
    durationMinutes: 90,
    isCompleted: false,
  };
}

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function ensureDebtCollectorBlock(day: PlannerDay): PlannerDay {
  const existingOtherMissions = Array.isArray(day.otherMissions)
    ? day.otherMissions
    : [];
  const hasDebtCollector = existingOtherMissions.some(
    (mission) => mission?.type === "debt_collector",
  );

  return {
    ...day,
    otherMissions: hasDebtCollector
      ? existingOtherMissions
      : [...existingOtherMissions, createDebtCollectorBlock(day.dateKey)],
  };
}

function isMissionClosed(mission: PlannerNoteMission | PlannerTestMission) {
  const status = mission.progress?.status || "not_started";
  return status === "completed" || status === "revised";
}

function getMissionCompletionPercent(
  mission: PlannerNoteMission | PlannerTestMission,
) {
  if (isMissionClosed(mission)) return 100;
  return Math.max(0, Math.min(100, mission.progress?.completionPercent || 0));
}

function getTestMissionCompletedQuestions(mission: PlannerTestMission) {
  if (mission.progress?.status === "completed") {
    return mission.totalQuestions || mission.progress?.completedQuestions || 0;
  }
  return mission.progress?.completedQuestions || 0;
}

function getNoteMissionTrackedCount(mission: PlannerNoteMission) {
  return getNoteMissionMode(mission) === "revise"
    ? mission.progress?.revisedTargets || 0
    : mission.progress?.completedTargets || 0;
}

function getNoteMissionActionLabel(mission: PlannerNoteMission) {
  if (isMissionAbandoned(mission)) return "Abandoned";
  const status = mission.progress?.status || "not_started";
  if (status === "not_started") return "Start";
  return getNoteMissionTrackedCount(mission) > 0 ? "Resume" : "Start";
}

function isMissionAbandoned(mission: PlannerNoteMission | PlannerTestMission) {
  return mission.progress?.status === "failed_abandoned";
}

function withExecutionDefaults(plan: WeeklyPlanData): WeeklyPlanData {
  return {
    ...plan,
    executionMatrix: {
      currentStreak: plan.executionMatrix?.currentStreak || 0,
      lastPenaltyAt: plan.executionMatrix?.lastPenaltyAt || null,
      penaltyCount: plan.executionMatrix?.penaltyCount || 0,
      resetCount: plan.executionMatrix?.resetCount || 0,
    },
    days: (plan.days || []).map(ensureDebtCollectorBlock),
  };
}

// ==========================================
// 4. SHARED UI COMPONENTS (Unified & Sleek)
// ==========================================
const inputClasses =
  "w-full bg-[#050505] border border-white/[0.08] hover:border-white/[0.15] text-slate-200 text-sm font-semibold rounded-[16px] outline-none focus:border-blue-500 transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]";

const dropdownBoxClasses =
  "absolute z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-[16px] border border-white/[0.08] bg-[#0A0A0A]/95 backdrop-blur-3xl p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full";

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "revised"
      ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
      : status === "completed"
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
        : status === "in_progress"
          ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
          : status === "failed_abandoned"
            ? "bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.3)]"
            : "bg-white/[0.03] text-slate-400 border-white/10";
  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${tone}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function ProgressBar({
  value,
  tone,
}: {
  value: number;
  tone: "emerald" | "violet";
}) {
  const glow =
    tone === "emerald"
      ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
      : "bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]";
  return (
    <div className="h-[4px] w-full overflow-hidden rounded-full bg-black/80 border border-white/[0.04]">
      <div
        className={`h-full rounded-full transition-all duration-500 ${glow}`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

// ---------------------------------------------------------
// REFINED SINGLE-SELECT DROPDOWN
// ---------------------------------------------------------
function BuilderDropdown({ value, onChange, options, placeholder }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedOption = options.find((o: any) => o.value === value);
  const displayValue = selectedOption
    ? selectedOption.label
    : placeholder || "Select...";

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${inputClasses} h-12 px-5 flex items-center justify-between text-left`}
      >
        <span
          className={`truncate ${!selectedOption ? "text-slate-500" : "text-slate-200"}`}
        >
          {displayValue}
        </span>
        <svg
          className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className={dropdownBoxClasses}>
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm font-semibold text-slate-500 text-center">
              No options available
            </div>
          ) : (
            options.map((option: any) => (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onClick={() => {
                  if (option.disabled) return;
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left rounded-[12px] px-4 py-2.5 text-sm font-semibold transition-colors flex items-center justify-between group ${
                  option.disabled
                    ? "text-slate-600 cursor-not-allowed opacity-50"
                    : value === option.value
                      ? "bg-blue-500/10 text-blue-400"
                      : "text-slate-300 hover:bg-white/[0.04]"
                }`}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && !option.disabled && (
                  <svg
                    className="w-4 h-4 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------
// PURE, NON-SEARCHABLE MULTI-SELECT DROPDOWN
// ---------------------------------------------------------
function MultiSelectDropdown({
  selected,
  onChange,
  options,
  placeholder,
}: any) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const toggleOption = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selected.includes(val))
      onChange(selected.filter((item: string) => item !== val));
    else onChange([...selected, val]);
  };

  const removePill = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((item: string) => item !== val));
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${inputClasses} min-h-[48px] py-2 px-4 flex items-center justify-between text-left relative`}
      >
        <div className="flex flex-wrap gap-1.5 pr-6 items-center flex-1">
          {selected.length === 0 ? (
            <span className="text-slate-500 font-semibold text-sm pl-1">
              {placeholder}
            </span>
          ) : (
            selected.map((item: string) => (
              <span
                key={item}
                className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-bold px-2 py-1 rounded-md flex items-center gap-1.5 shadow-sm"
              >
                <span className="max-w-[150px] truncate">{item}</span>
                <div
                  onClick={(e) => removePill(item, e)}
                  className="hover:bg-blue-500/20 hover:text-white rounded-full p-0.5 transition-colors cursor-pointer"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </span>
            ))
          )}
        </div>
        <svg
          className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className={dropdownBoxClasses}>
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm font-semibold text-slate-500 text-center">
              Select Chapter First
            </div>
          ) : (
            options.map((option: any) => {
              const isSelected = selected.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={(e) => toggleOption(option.value, e)}
                  className={`w-full text-left rounded-[12px] px-4 py-2.5 text-sm font-semibold transition-colors flex items-center justify-between group ${isSelected ? "bg-blue-500/10 text-blue-400" : "text-slate-300 hover:bg-white/[0.04]"}`}
                >
                  <span className="truncate pr-4">{option.label}</span>
                  <div
                    className={`shrink-0 w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${isSelected ? "border-blue-500 bg-blue-500" : "border-slate-600 group-hover:border-slate-400"}`}
                  >
                    {isSelected && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="4"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. DAY BLOCK BUILDER (MODAL)
function DayBlockBuilder({ day, data, updateData, subjects }: any) {
  const [activeTab, setActiveTab] = useState<TaskCategory>("Note");

  const TIME_BLOCK_OPTIONS = [
    { label: "07:00 AM - 08:00 AM", value: "07:00-08:00" },
    { label: "08:00 PM - 10:00 PM", value: "20:00-22:00" },
    { label: "11:00 PM - 11:59 PM", value: "23:00-23:59" },
  ];

  // Note State
  const [noteSub, setNoteSub] = useState(subjects[0] || "");
  const [noteChap, setNoteChap] = useState("");
  const [noteTopics, setNoteTopics] = useState<string[]>([]);
  const [noteMode, setNoteMode] = useState<"complete" | "revise">("complete");
  const [noteTimeBlock, setNoteTimeBlock] = useState("");
  const [noteSubjectCheckedUids, setNoteSubjectCheckedUids] = useState<
    Set<string>
  >(new Set());

  useEffect(() => {
    const progressKey = noteSub ? SUBJECT_PROGRESS_KEY_REGISTRY[noteSub] : null;
    if (!progressKey) {
      setNoteSubjectCheckedUids(new Set());
      return;
    }

    let isMounted = true;

    fetch(`${SUBJECT_PROGRESS_API_URL}/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjects: [progressKey] }),
    })
      .then((res) => res.json())
      .then((payload) => {
        if (!isMounted) return;
        const checked = payload?.progress?.[progressKey]?.checkedUids;
        setNoteSubjectCheckedUids(
          new Set(Array.isArray(checked) ? checked : []),
        );
      })
      .catch(() => {
        if (isMounted) setNoteSubjectCheckedUids(new Set());
      });

    return () => {
      isMounted = false;
    };
  }, [noteSub]);

  // True only when EVERY point of EVERY currently-selected topic is already ticked.
  const areSelectedTopicsFullyCompleted = useMemo(() => {
    if (!noteSub || !noteChap || noteTopics.length === 0) return false;

    const leafUids = collectLeafUidsForTopics(noteSub, noteChap, noteTopics);
    if (leafUids.length === 0) return false;

    return leafUids.every((uid) => noteSubjectCheckedUids.has(uid));
  }, [noteSub, noteChap, noteTopics, noteSubjectCheckedUids]);

  // If the selection is already fully done, "Complete" mode is meaningless here —
  // auto-switch to "Revise" so progress is tracked off the real revision button data.
  const effectiveNoteMode: "complete" | "revise" =
    areSelectedTopicsFullyCompleted ? "revise" : noteMode;

  // Test State
  const [testSub, setTestSub] = useState(subjects[0] || "");
  const [testChap, setTestChap] = useState("");
  const [testMode, setTestMode] = useState("Practice");
  const [testEasy, setTestEasy] = useState<number>(0);
  const [testMed, setTestMed] = useState<number>(0);
  const [testHard, setTestHard] = useState<number>(0);
  const [testTimeBlock, setTestTimeBlock] = useState("");

  // Pro Power: Dynamic Limit Engine

  // Pro Power: Dynamic Limit Engine
  const [mcqLimits, setMcqLimits] = useState({ easy: 0, medium: 0, hard: 0 });
  const [isFetchingLimits, setIsFetchingLimits] = useState(false);
  const [mcqChapterOptions, setMcqChapterOptions] = useState<
    McqChapterOption[]
  >([]);

  useEffect(() => {
    if (activeTab !== "Test" || !testSub) {
      return;
    }

    let isMounted = true;

    fetch(`/api/mcq-bank?subject=${encodeURIComponent(testSub)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;

        const chapters = Array.isArray(data?.chapters) ? data.chapters : [];
        setMcqChapterOptions(
          chapters.map((chapter: any) => ({
            slug: String(chapter.slug || ""),
            title: String(chapter.title || chapter.slug || ""),
            questionCount: Number(chapter.questionCount) || 0,
            difficultyCounts: chapter.difficultyCounts || {},
          })),
        );
      })
      .catch(() => {
        if (isMounted) setMcqChapterOptions([]);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, testSub]);

  useEffect(() => {
    if (activeTab !== "Test" || !testSub || !testChap) {
      setMcqLimits({ easy: 0, medium: 0, hard: 0 });
      setTestEasy(0);
      setTestMed(0);
      setTestHard(0);
      return;
    }

    let isMounted = true;
    setIsFetchingLimits(true);

    fetch(`/api/mcq-bank?subject=${encodeURIComponent(testSub)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        const direct = data?.chapters?.find(
          (ch: any) => ch.slug === testChap || ch.title === testChap,
        );
        if (direct && direct.difficultyCounts) {
          setMcqLimits({
            easy: direct.difficultyCounts.easy || 0,
            medium: direct.difficultyCounts.medium || 0,
            hard: direct.difficultyCounts.hard || 0,
          });
          return;
        }

        if (data && data.noteChapters) {
          const matchedNoteChapter = data.noteChapters.find(
            (c: any) => c.label === testChap || c.id === testChap,
          );
          if (matchedNoteChapter) {
            let e = 0,
              m = 0,
              h = 0;
            matchedNoteChapter.topicLinks.forEach((link: any) => {
              const mcqTopic = data.chapters.find(
                (ch: any) => ch.slug === link.slug,
              );
              if (mcqTopic && mcqTopic.difficultyCounts) {
                e += mcqTopic.difficultyCounts.easy || 0;
                m += mcqTopic.difficultyCounts.medium || 0;
                h += mcqTopic.difficultyCounts.hard || 0;
              }
            });
            setMcqLimits({ easy: e, medium: m, hard: h });
          } else {
            setMcqLimits({ easy: 0, medium: 0, hard: 0 });
          }
        }
      })
      .catch(() => {
        if (isMounted) setMcqLimits({ easy: 0, medium: 0, hard: 0 });
      })
      .finally(() => {
        if (isMounted) setIsFetchingLimits(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, testSub, testChap]);

  const calculatedMinutes = useMemo(() => {
    if (!testTimeBlock) return 0;
    const [tStart, tEnd] = testTimeBlock.split("-");
    const [sH, sM] = tStart.split(":").map(Number);
    const [eH, eM] = tEnd.split(":").map(Number);
    let diff = eH * 60 + eM - (sH * 60 + sM);
    if (diff <= 0) diff += 24 * 60; // Handles midnight crossover
    return diff;
  }, [testTimeBlock]);
  const handleAddNote = () => {
    if (!noteSub || !noteChap || noteTopics.length === 0 || !noteTimeBlock)
      return;

    const exactPoints = calculateExactPoints(noteSub, noteChap, noteTopics);
    const [nStart, nEnd] = noteTimeBlock.split("-");

    updateData({
      ...data,
      notes: [
        ...data.notes,
        {
          id: Date.now().toString(),
          mode: effectiveNoteMode,
          subject: noteSub,
          chapter: noteChap,
          topics: noteTopics,
          totalPoints: exactPoints,
          plannedStart: nStart,
          plannedEnd: nEnd,
        },
      ],
    });
    setNoteChap("");
    setNoteTopics([]);
    setNoteMode("complete");
    setNoteTimeBlock("");
  };

  const handleAddTest = () => {
    const e = typeof testEasy === "number" ? testEasy : 0;
    const m = typeof testMed === "number" ? testMed : 0;
    const h = typeof testHard === "number" ? testHard : 0;
    let time = calculatedMinutes;

    const totalQuestions = e + m + h;

    if (
      !testSub ||
      !testChap ||
      totalQuestions === 0 ||
      !testTimeBlock ||
      time <= 0
    )
      return;
    const selectedMcqChapter = mcqChapterOptions.find(
      (chapter) => chapter.slug === testChap,
    );

    const [tStart, tEnd] = testTimeBlock.split("-");

    // ... pushes to data.tests
    updateData({
      ...data,
      tests: [
        ...data.tests,
        {
          id: Date.now().toString(),
          subject: testSub,
          chapter: testChap,
          topic: selectedMcqChapter?.title || testChap,
          mode: testMode,
          easy: e,
          medium: m,
          hard: h,
          timer: time,
          plannedStart: tStart,
          plannedEnd: tEnd,
        },
      ],
    });
    setTestEasy(0);
    setTestMed(0);
    setTestHard(0);
    setTestChap("");
    setTestTimeBlock("");
  };

  return (
    <div className="bg-[#111111] border border-white/[0.04] rounded-[20px] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]">
      <h3 className="text-base font-black text-blue-400 mb-6 tracking-widest">
        {day}
      </h3>
      <div className="flex gap-2 mb-6 bg-black/50 w-fit p-1 rounded-full border border-white/[0.04]">
        {["Note", "Test", "Other"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as TaskCategory)}
            className={`px-6 py-2 text-xs font-bold rounded-full transition-all ${activeTab === tab ? "bg-white/[0.1] text-white shadow-sm" : "bg-transparent text-slate-500 hover:text-slate-300"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Note" && (
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-start gap-4 w-full">
            <div className="flex-1 lg:w-[180px]">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                Subject
              </label>
              <BuilderDropdown
                value={noteSub}
                onChange={(val: string) => {
                  setNoteSub(val);
                  setNoteChap("");
                  setNoteTopics([]);
                }}
                options={subjects.map((s: any) => ({ label: s, value: s }))}
              />
            </div>
            <div className="flex-1 lg:w-[240px]">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                Chapter
              </label>
              <BuilderDropdown
                value={noteChap}
                onChange={(val: string) => {
                  setNoteChap(val);
                  setNoteTopics([]);
                }}
                options={getChaptersForSubject(noteSub).map((c: any) => ({
                  label: c,
                  value: c,
                }))}
                placeholder="Select Chapter"
              />
            </div>

            <div className="flex-[2] min-w-[280px]">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                Topics{" "}
                <span className="text-blue-500/70 ml-1 font-bold">
                  (Select Multiple)
                </span>
              </label>
              <MultiSelectDropdown
                selected={noteTopics}
                onChange={setNoteTopics}
                options={getTopicsForChapter(noteSub, noteChap).map(
                  (t: string) => ({ label: t, value: t }),
                )}
                placeholder={
                  noteChap ? "Select topics..." : "Select Chapter first"
                }
              />
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-3 w-full">
            <div className="flex-1 min-w-[200px] max-w-[280px]">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                Time Block
              </label>
              <BuilderDropdown
                value={noteTimeBlock}
                onChange={(val: string) => setNoteTimeBlock(val)}
                options={TIME_BLOCK_OPTIONS}
                placeholder="Select Time Block"
              />
            </div>

            <div className="w-[150px]">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                Mode
              </label>
              <BuilderDropdown
                value={
                  noteMode === "complete" && areSelectedTopicsFullyCompleted
                    ? "revise"
                    : noteMode
                }
                onChange={(val: "complete" | "revise") => setNoteMode(val)}
                options={[
                  {
                    label: "Complete",
                    value: "complete",
                    disabled: areSelectedTopicsFullyCompleted,
                  },
                  {
                    label: "Revise",
                    value: "revise",
                    disabled: false,
                  },
                ]}
              />
              {/* {areSelectedTopicsFullyCompleted && (/* {areSelectedTopicsFullyCompleted && (
                <p className="mt-1.5 text-[9px] font-bold text-amber-400/90 leading-snug">
                  Already 100% complete — switched to Revise.
                </p>
              )} */}
            </div>

            <button
              onClick={handleAddNote}
              disabled={noteTopics.length === 0 || !noteTimeBlock}
              className={`h-12 px-8 shrink-0 flex items-center justify-center rounded-[16px] font-black uppercase tracking-widest text-xs transition-all ${
                noteTopics.length > 0 && noteTimeBlock
                  ? "bg-white text-black hover:bg-slate-200 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  : "bg-white/[0.05] text-white/30 border border-white/[0.05] cursor-not-allowed"
              }`}
            >
              Add
            </button>

            {/* 🧠 PRO FIX: AI Spaced Repetition Injector */}
            <button
              onClick={() => {
                // Scan logic: Finds a randomized critical topic to simulate memory decay tracking
                const randomSub =
                  subjects[Math.floor(Math.random() * subjects.length)];
                const chapters = getChaptersForSubject(randomSub);
                if (!chapters || chapters.length === 0) return;
                const randomChap = chapters[0];
                const emergencyTopics = getTopicsForChapter(
                  randomSub,
                  randomChap,
                ).slice(0, 2);
                const exactPoints = calculateExactPoints(
                  randomSub,
                  randomChap,
                  emergencyTopics,
                );

                updateData({
                  ...data,
                  notes: [
                    ...data.notes,
                    {
                      id: `AUTO-REV-${Date.now()}`,
                      mode: "revise",
                      subject: randomSub,
                      chapter: randomChap,
                      topics: emergencyTopics,
                      totalPoints: exactPoints,
                      plannedStart: "22:00", // Automatically assigns to late-night revision
                      plannedEnd: "23:00",
                    },
                  ],
                });
                alert(
                  `⚡ AI Matrix: Emergency Revision block for [${randomSub}] injected into schedule!`,
                );
              }}
              className="h-12 px-6 shrink-0 flex items-center justify-center rounded-[16px] font-black uppercase tracking-widest text-[10px] text-purple-300 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-all active:scale-95"
            >
              Auto-Fill Weakness
            </button>
          </div>

          {data.notes.length > 0 && (
            <div className="flex flex-col gap-3 pt-4 border-t border-white/[0.04]">
              {data.notes.map((n: any) => (
                <div
                  key={n.id}
                  className="flex flex-col gap-3 bg-[#050505] p-4 rounded-[16px] border border-emerald-500/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)] group"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                      <span className="text-xs font-black text-emerald-400 tracking-wider uppercase">
                        {n.subject}
                      </span>
                      <span className="text-white/20">/</span>
                      <span className="text-sm font-bold text-white truncate max-w-[200px]">
                        {n.chapter}
                      </span>
                      <span className="text-white/20">/</span>
                      <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {n.totalPoints} Points
                      </span>
                      <span className="text-[10px] font-black text-cyan-300 tracking-widest uppercase bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        {n.mode === "revise" ? "Revise" : "Complete"}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 tracking-widest bg-white/[0.05] px-2 py-0.5 rounded border border-white/10 ml-auto">
                        {n.plannedStart} - {n.plannedEnd}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        updateData({
                          ...data,
                          notes: data.notes.filter((x: any) => x.id !== n.id),
                        })
                      }
                      className="text-white/30 hover:text-red-400 transition-colors bg-white/[0.02] hover:bg-red-500/10 p-1.5 rounded-lg border border-transparent hover:border-red-500/20"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-3.5">
                    {n.topics.map((t: string) => (
                      <span
                        key={t}
                        className="text-[11px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-md font-bold shadow-sm"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "Test" && (
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-start gap-4 w-full">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                Subject
              </label>
              <BuilderDropdown
                value={testSub}
                onChange={(val: string) => {
                  setTestSub(val);
                  setTestChap("");
                }}
                options={subjects.map((s: any) => ({ label: s, value: s }))}
              />
            </div>
            <div className="flex-1 min-w-[240px]">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                Chapter / Topic
              </label>
              <BuilderDropdown
                value={testChap}
                onChange={(val: string) => setTestChap(val)}
                options={mcqChapterOptions.map((chapter) => ({
                  label: `${chapter.title} (${chapter.questionCount})`,
                  value: chapter.slug,
                }))}
                placeholder="Select Topic"
              />
            </div>

            <div className="flex-1 min-w-[180px]">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                Mode
              </label>
              <BuilderDropdown
                value={testMode}
                onChange={(val: string) => setTestMode(val)}
                options={[
                  { label: "Practice Mode", value: "Practice" },
                  { label: "Exam Mode", value: "Exam" },
                ]}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px] max-w-[300px]">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 pl-1">
                Time Block
              </label>
              <BuilderDropdown
                value={testTimeBlock}
                onChange={(val: string) => setTestTimeBlock(val)}
                options={TIME_BLOCK_OPTIONS}
                placeholder="Select Time Block"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full">
            <div className="flex flex-1 min-w-[120px] items-center justify-between bg-[#050505] border border-white/[0.08] rounded-[16px] h-12 px-4 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/30 transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)] relative group hover:border-white/[0.15]">
              <span className="text-[10px] font-black tracking-widest uppercase shrink-0 text-emerald-400">
                EASY
              </span>
              <div className="relative flex items-center w-full justify-end h-full">
                <select
                  value={testEasy}
                  onChange={(e) => setTestEasy(parseInt(e.target.value) || 0)}
                  disabled={
                    !testChap || isFetchingLimits || mcqLimits.easy === 0
                  }
                  className="w-full h-full bg-transparent text-white text-base font-bold outline-none border-none focus:ring-0 m-0 appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 text-right pr-6"
                >
                  {isFetchingLimits ? (
                    <option value="">...</option>
                  ) : (
                    Array.from({ length: mcqLimits.easy + 1 }, (_, i) => (
                      <option key={i} value={i} className="bg-[#0a0a0a]">
                        {i} {i === mcqLimits.easy ? "(Max)" : ""}
                      </option>
                    ))
                  )}
                </select>
                <svg
                  className="absolute right-0 w-4 h-4 text-slate-500 pointer-events-none group-hover:text-slate-300 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <div className="flex flex-1 min-w-[120px] items-center justify-between bg-[#050505] border border-white/[0.08] rounded-[16px] h-12 px-4 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/30 transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)] relative group hover:border-white/[0.15]">
              <span className="text-[10px] font-black tracking-widest uppercase shrink-0 text-amber-400">
                MED
              </span>
              <div className="relative flex items-center w-full justify-end h-full">
                <select
                  value={testMed}
                  onChange={(e) => setTestMed(parseInt(e.target.value) || 0)}
                  disabled={
                    !testChap || isFetchingLimits || mcqLimits.medium === 0
                  }
                  className="w-full h-full bg-transparent text-white text-base font-bold outline-none border-none focus:ring-0 m-0 appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 text-right pr-6"
                >
                  {isFetchingLimits ? (
                    <option value="">...</option>
                  ) : (
                    Array.from({ length: mcqLimits.medium + 1 }, (_, i) => (
                      <option key={i} value={i} className="bg-[#0a0a0a]">
                        {i} {i === mcqLimits.medium ? "(Max)" : ""}
                      </option>
                    ))
                  )}
                </select>
                <svg
                  className="absolute right-0 w-4 h-4 text-slate-500 pointer-events-none group-hover:text-slate-300 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <div className="flex flex-1 min-w-[120px] items-center justify-between bg-[#050505] border border-white/[0.08] rounded-[16px] h-12 px-4 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/30 transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)] relative group hover:border-white/[0.15]">
              <span className="text-[10px] font-black tracking-widest uppercase shrink-0 text-rose-400">
                HARD
              </span>
              <div className="relative flex items-center w-full justify-end h-full">
                <select
                  value={testHard}
                  onChange={(e) => setTestHard(parseInt(e.target.value) || 0)}
                  disabled={
                    !testChap || isFetchingLimits || mcqLimits.hard === 0
                  }
                  className="w-full h-full bg-transparent text-white text-base font-bold outline-none border-none focus:ring-0 m-0 appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 text-right pr-6"
                >
                  {isFetchingLimits ? (
                    <option value="">...</option>
                  ) : (
                    Array.from({ length: mcqLimits.hard + 1 }, (_, i) => (
                      <option key={i} value={i} className="bg-[#0a0a0a]">
                        {i} {i === mcqLimits.hard ? "(Max)" : ""}
                      </option>
                    ))
                  )}
                </select>
                <svg
                  className="absolute right-0 w-4 h-4 text-slate-500 pointer-events-none group-hover:text-slate-300 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <button
              onClick={handleAddTest}
              disabled={
                !testTimeBlock ||
                calculatedMinutes <= 0 ||
                Number(testEasy) + Number(testMed) + Number(testHard) === 0
              }
              className={`h-12 px-8 text-xs font-black uppercase tracking-widest rounded-[16px] transition-all w-full sm:w-auto ${
                testTimeBlock &&
                calculatedMinutes > 0 &&
                Number(testEasy) + Number(testMed) + Number(testHard) > 0
                  ? "bg-white hover:bg-slate-200 text-black active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  : "bg-[#050505] text-white/30 border border-white/[0.05] cursor-not-allowed shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]"
              }`}
            >
              {calculatedMinutes > 0
                ? `INITIATE (${calculatedMinutes}m)`
                : "INITIATE"}
            </button>
          </div>

          {data.tests.length > 0 && (
            <div className="flex flex-col gap-3 pt-4 border-t border-white/[0.04]">
              {data.tests.map((t: any) => (
                <div
                  key={t.id}
                  className="flex flex-col gap-3 bg-[#050505] p-4 rounded-[16px] border border-purple-500/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)] group"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>
                      <span className="text-xs font-black text-purple-400 tracking-wider uppercase">
                        {t.subject}
                      </span>
                      <span className="text-white/20">/</span>
                      <span className="text-sm font-bold text-white truncate max-w-[200px]">
                        {t.topic || t.chapter}
                      </span>
                      <span className="text-white/20">/</span>
                      <span className="text-[10px] font-black text-purple-400 tracking-widest uppercase bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        {t.easy + t.medium + t.hard} Qs ({t.timer}m)
                      </span>
                      <span className="text-[10px] font-black text-rose-300 tracking-widest uppercase bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        {t.mode}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 tracking-widest bg-white/[0.05] px-2 py-0.5 rounded border border-white/10 ml-auto">
                        {t.plannedStart} - {t.plannedEnd}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        updateData({
                          ...data,
                          tests: data.tests.filter((x: any) => x.id !== t.id),
                        })
                      }
                      className="text-white/30 hover:text-red-400 transition-colors bg-white/[0.02] hover:bg-red-500/10 p-1.5 rounded-lg border border-transparent hover:border-red-500/20 shrink-0 ml-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-3.5">
                    {t.easy > 0 && (
                      <span className="text-[11px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-md font-bold shadow-sm">
                        {t.easy} Easy
                      </span>
                    )}
                    {t.medium > 0 && (
                      <span className="text-[11px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-md font-bold shadow-sm">
                        {t.medium} Med
                      </span>
                    )}
                    {t.hard > 0 && (
                      <span className="text-[11px] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2.5 py-1 rounded-md font-bold shadow-sm">
                        {t.hard} Hard
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MatrixBuilderModal({
  onClose,
  onSave,
  builderData,
  setBuilderData,
}: any) {
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const subjects = Object.keys(SUBJECT_DATA_REGISTRY);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex justify-center pt-10 pb-20 px-4 overflow-y-auto">
      <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-[24px] w-full max-w-6xl shadow-[0_40px_120px_rgba(0,0,0,0.6)] flex flex-col h-fit">
        <div className="p-6 md:p-8 border-b border-white/[0.04]">
          <h2 className="text-2xl font-black text-white tracking-tighter">
            Construct Next 6-Day Matrix
          </h2>
        </div>
        <div className="p-6 md:p-8 space-y-8">
          {days.map((day) => (
            <DayBlockBuilder
              key={day}
              day={day}
              data={builderData[day]}
              updateData={(newData: any) =>
                setBuilderData({ ...builderData, [day]: newData })
              }
              subjects={subjects}
            />
          ))}
        </div>
        <div className="p-6 border-t border-white/[0.04] bg-[#050505] flex justify-end gap-4 rounded-b-[24px]">
          <button
            onClick={onClose}
            className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-white transition-colors bg-white/[0.02] rounded-xl border border-white/[0.05]"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-8 py-3 text-sm font-black text-black bg-white hover:bg-slate-200 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] tracking-tight"
          >
            Lock & Commit Matrix
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. MAIN COMPONENT (PAGE)
// ==========================================
export default function WeeklyPlannerPanel() {
  const { celebration, triggerCelebration, closeCelebration } =
    useCelebration();

  // 🛡️ PRO FIX: Auto-select today's date directly on initial load without flickering
  const [activeDay, setActiveDay] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const today = new Date().getDay();
      const dayMap = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      return dayMap[today] === "SUN" ? "MON" : dayMap[today];
    }
    return "MON";
  });

  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlanData | null>(null);
  const [subjectProgressMap, setSubjectProgressMap] =
    useState<SubjectProgressLookup>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutoModeEnabled, setIsAutoModeEnabled] = useState(false);
  const [lastTimedRun, setLastTimedRun] = useState<PlannerLastTimedRun | null>(
    null,
  );

  // PRO FIX: Phase 3 Validation Modal State
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [pendingMission, setPendingMission] = useState<{
    day: PlannerDay;
    mission: PlannerNoteMission | PlannerTestMission;
    type: "note" | "test";
  } | null>(null);
  const [validationReason, setValidationReason] = useState<
    "accident" | "laziness" | null
  >(null);
  const [typedApology, setTypedApology] = useState("");
  const REQUIRED_APOLOGY =
    "I wasted my own time choosing cheap distractions over my UPSC dream.";

  const previousMissionStatusRef = useRef<Record<string, string>>({});
  const autoStartedMissionRef = useRef<string | null>(null);
  const persistedHydratedMissionSignatureRef = useRef<string>("");

  const [builderData, setBuilderData] = useState<
    Record<string, DayBuilderState>
  >({
    MON: { notes: [], tests: [], others: [] },
    TUE: { notes: [], tests: [], others: [] },
    WED: { notes: [], tests: [], others: [] },
    THU: { notes: [], tests: [], others: [] },
    FRI: { notes: [], tests: [], others: [] },
    SAT: { notes: [], tests: [], others: [] },
  });

  // 🛡️ PRO FIX: Dynamic Time Travel State
  const [viewOffsetWeeks, setViewOffsetWeeks] = useState(0);
  const currentViewMonday = useMemo(() => {
    const d = getMondayOfCurrentWeek();
    d.setDate(d.getDate() + viewOffsetWeeks * 7);
    return d;
  }, [viewOffsetWeeks]);

  const weekStartDate = getLocalDateKey(currentViewMonday);
  const isTodaySunday = new Date().getDay() === 0;
  const isCurrentWeek = viewOffsetWeeks === 0;

  // 🛡️ PRO FIX: Snap back to current day instantly when returning to the present week
  useEffect(() => {
    if (isCurrentWeek) {
      const today = new Date().getDay();
      const dayMap = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      setActiveDay(dayMap[today] === "SUN" ? "MON" : dayMap[today]);
    } else {
      setActiveDay("MON"); // Clean fallback for past archive weeks
    }
  }, [isCurrentWeek]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsAutoModeEnabled(
      window.localStorage.getItem(PLANNER_AUTO_MODE_KEY) === "1",
    );

    try {
      const rawLastRun = window.sessionStorage.getItem(
        PLANNER_LAST_TIMED_RUN_KEY,
      );
      if (!rawLastRun) return;

      const parsedLastRun = JSON.parse(rawLastRun);

      // 🛡️ PRO FIX: Ensure parsedLastRun is strictly an object before accessing properties
      if (
        parsedLastRun &&
        typeof parsedLastRun === "object" &&
        typeof parsedLastRun.missionId === "string" &&
        typeof parsedLastRun.subject === "string" &&
        typeof parsedLastRun.chapterLabel === "string" &&
        typeof parsedLastRun.completedTargets === "number" &&
        typeof parsedLastRun.totalTargets === "number" &&
        typeof parsedLastRun.completedAt === "number"
      ) {
        setLastTimedRun(parsedLastRun as PlannerLastTimedRun);
      }
      window.sessionStorage.removeItem(PLANNER_LAST_TIMED_RUN_KEY);
    } catch {
      window.sessionStorage.removeItem(PLANNER_LAST_TIMED_RUN_KEY);
    }
  }, []);

  const toggleAutoMode = () => {
    const nextValue = !isAutoModeEnabled;
    setIsAutoModeEnabled(nextValue);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PLANNER_AUTO_MODE_KEY, nextValue ? "1" : "0");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const planRes = await fetch(`${API_URL}/planner/${weekStartDate}`);
        if (planRes.ok) {
          const planData = await planRes.json();
          if (planData.exists && planData.data) {
            setWeeklyPlan(withExecutionDefaults(planData.data));
          } else {
            setWeeklyPlan(
              withExecutionDefaults({
                weekStartDate,
                status: "Draft",
                committedAt: null,
                days: generateEmptyWeek(currentViewMonday), // 🛡️ Passes correct past dates to empty frame
              }),
            );
          }
        } else {
          setWeeklyPlan(
            withExecutionDefaults({
              weekStartDate,
              status: "Draft",
              committedAt: null,
              days: generateEmptyWeek(currentViewMonday),
            }),
          );
        }
      } catch {
        setWeeklyPlan(
          (currentPlan) =>
            currentPlan ||
            withExecutionDefaults({
              weekStartDate,
              status: "Draft",
              committedAt: null,
              days: generateEmptyWeek(currentViewMonday),
            }),
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [weekStartDate, currentViewMonday]); // 🛡️ Triggers fetch instantly when arrow is clicked
  // 🛡️ PRO FIX: Offline Glitch Protection Engine
  // 🛡️ PRO FIX: Offline Glitch Protection & Timestamp Guard
  const saveToDb = async (plan: WeeklyPlanData) => {
    const timestampedPlan = {
      ...plan,
      updatedAt: Date.now(), // Stamps the exact millisecond to prevent Multi-Device Overwrites
    };
    await savePlannerSafely(timestampedPlan);
  };

  useEffect(() => {
    const handleOnline = () => {
      flushPlannerVault();
    };
    window.addEventListener("online", handleOnline);
    // Attempt immediate flush just in case connection was restored before mount
    if (typeof window !== "undefined" && navigator.onLine) {
      flushPlannerVault();
    }
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  useEffect(() => {
    if (!weeklyPlan) return;

    const noteSubjects = Array.from(
      new Set(
        weeklyPlan.days
          .flatMap((day) => day.noteMissions || [])
          .map((mission) => mission.subject)
          .filter(Boolean),
      ),
    );

    if (noteSubjects.length === 0) {
      setSubjectProgressMap({});
      return;
    }

    let isCancelled = false;

    const loadSubjectProgress = async () => {
      try {
        const subjectPairs = noteSubjects
          .map(
            (subject) =>
              [subject, SUBJECT_PROGRESS_KEY_REGISTRY[subject]] as const,
          )
          .filter((pair): pair is readonly [string, string] =>
            Boolean(pair[1]),
          );

        const fallbackProgress = Object.fromEntries(
          noteSubjects.map((subject) => [
            subject,
            { checkedUids: [], completionTimes: {} },
          ]),
        );

        if (subjectPairs.length === 0) {
          if (!isCancelled) setSubjectProgressMap(fallbackProgress);
          return;
        }

        const response = await fetch(`${SUBJECT_PROGRESS_API_URL}/batch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subjects: subjectPairs.map(([, subjectKey]) => subjectKey),
          }),
        });

        if (!response.ok) {
          if (!isCancelled) setSubjectProgressMap(fallbackProgress);
          return;
        }

        const payload = (await response.json()) as {
          progress?: Record<string, SubjectProgressPayload | null>;
        };
        const progressBySubject = Object.fromEntries(
          subjectPairs.map(([subject, subjectKey]) => {
            const progress = payload.progress?.[subjectKey];
            return [
              subject,
              {
                checkedUids: Array.isArray(progress?.checkedUids)
                  ? progress.checkedUids
                  : [],
                completionTimes:
                  progress?.completionTimes &&
                  typeof progress.completionTimes === "object"
                    ? progress.completionTimes
                    : {},
              },
            ];
          }),
        );

        if (!isCancelled) {
          setSubjectProgressMap({
            ...fallbackProgress,
            ...progressBySubject,
          });
        }
      } catch {
        if (!isCancelled) {
          setSubjectProgressMap({});
        }
      }
    };

    void loadSubjectProgress();

    const intervalId = window.setInterval(() => {
      void loadSubjectProgress();
    }, 15000);

    const handleFocus = () => {
      void loadSubjectProgress();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [weeklyPlan]);

  // 🛡️ PRO FIX: Deep-Level Granular Metrics Integration
  const hydratedWeeklyPlan = useMemo<WeeklyPlanData | null>(() => {
    if (!weeklyPlan) return null;

    let globalTotalLeafPoints = 0;
    let globalCompletedLeafPoints = 0;

    const hydratedDays = weeklyPlan.days.map((day) => {
      let dayTotalPoints = 0;
      let dayCompletedPoints = 0;

      const hydratedNoteMissions = (day.noteMissions || []).map((mission) => {
        const hydrated = computeMissionProgress(
          mission,
          subjectProgressMap[mission.subject],
        );

        // Calculate deep-level mathematically weighted points
        const missionTotalLeaves = hydrated.targets.reduce(
          (acc, t) => acc + (t.totalLeafCount || t.leafUids?.length || 1),
          0,
        );
        const missionCompletedLeaves = hydrated.targets.reduce(
          (acc, t) =>
            acc +
            (getNoteMissionMode(mission) === "revise"
              ? t.revisedLeafCount || 0
              : t.completedLeafCount || 0),
          0,
        );

        dayTotalPoints += missionTotalLeaves;
        dayCompletedPoints += missionCompletedLeaves;
        return hydrated;
      });

      (day.testMissions || []).forEach((test) => {
        dayTotalPoints += test.totalQuestions;
        dayCompletedPoints += test.progress?.completedQuestions || 0;
      });

      globalTotalLeafPoints += dayTotalPoints;
      globalCompletedLeafPoints += dayCompletedPoints;

      // Retain mission counts for UI rendering iteration, but embed deep math
      const totalMissionCount =
        hydratedNoteMissions.length + (day.testMissions?.length || 0);
      const completedMissionCount =
        hydratedNoteMissions.filter(
          (mission) =>
            mission.progress?.status === "completed" ||
            mission.progress?.status === "revised",
        ).length +
        ((day.testMissions || []).filter(
          (mission) => mission.progress?.status === "completed",
        ).length || 0);

      return {
        ...day,
        noteMissions: hydratedNoteMissions,
        summary: {
          totalMissionCount,
          completedMissionCount,
          deepTotalPoints: dayTotalPoints,
          deepCompletedPoints: dayCompletedPoints,
        },
      };
    });

    return {
      ...weeklyPlan,
      days: hydratedDays,
      summary: {
        totalMissionCount: globalTotalLeafPoints, // The UI Dashboard bars will now natively compute exact point values
        completedMissionCount: globalCompletedLeafPoints,
        completionPercent:
          globalTotalLeafPoints > 0
            ? Math.round(
                (globalCompletedLeafPoints / globalTotalLeafPoints) * 100,
              )
            : 0,
      },
    };
  }, [weeklyPlan, subjectProgressMap]);

  useEffect(() => {
    if (!weeklyPlan || !hydratedWeeklyPlan) return;

    let changed = false;
    const nextPlan: WeeklyPlanData = {
      ...weeklyPlan,
      days: weeklyPlan.days.map((day) => {
        const hydratedDay = hydratedWeeklyPlan.days.find(
          (item) => item.dateKey === day.dateKey,
        );
        if (!hydratedDay) return day;

        const hydratedMissionsById = new Map(
          (hydratedDay.noteMissions || []).map((mission) => [
            mission.id,
            mission,
          ]),
        );
        const noteMissions = (day.noteMissions || []).map((mission) => {
          const hydratedMission = hydratedMissionsById.get(mission.id);
          if (!hydratedMission) return mission;

          const storedStatus = mission.progress?.status || "not_started";
          const hydratedStatus =
            hydratedMission.progress?.status || "not_started";
          const shouldPersistClosed =
            (hydratedStatus === "completed" || hydratedStatus === "revised") &&
            storedStatus !== hydratedStatus;

          if (!shouldPersistClosed) return mission;
          changed = true;
          return {
            ...mission,
            targets: hydratedMission.targets,
            progress: {
              ...hydratedMission.progress!,
              status: hydratedStatus,
              closedAt: hydratedMission.progress?.closedAt || Date.now(),
              targets:
                hydratedMission.progress?.targets || hydratedMission.targets,
            },
          };
        });

        return {
          ...day,
          noteMissions,
        };
      }),
    };

    if (!changed) return;

    const signature = JSON.stringify(
      nextPlan.days.flatMap((day) =>
        (day.noteMissions || []).map((mission) => [
          mission.id,
          mission.progress?.status || "not_started",
          mission.progress?.completedTargets || 0,
          mission.progress?.revisedTargets || 0,
          mission.progress?.totalTargets || 0,
        ]),
      ),
    );
    if (persistedHydratedMissionSignatureRef.current === signature) return;
    persistedHydratedMissionSignatureRef.current = signature;

    setWeeklyPlan(nextPlan);
    void saveToDb(nextPlan);
  }, [hydratedWeeklyPlan, weeklyPlan]);

  const deleteMission = (
    dayOfWeek: string,
    missionType: "noteMissions" | "testMissions",
    missionId: string,
  ) => {
    if (!weeklyPlan) return;

    const nextPlan: WeeklyPlanData = {
      ...weeklyPlan,
      days: weeklyPlan.days.map((day) => {
        if (day.dayOfWeek !== dayOfWeek) return day;

        const nextNoteMissions =
          missionType === "noteMissions"
            ? (day.noteMissions || []).filter(
                (mission) => mission.id !== missionId,
              )
            : day.noteMissions || [];
        const nextTestMissions =
          missionType === "testMissions"
            ? (day.testMissions || []).filter(
                (mission) => mission.id !== missionId,
              )
            : day.testMissions || [];

        return {
          ...day,
          noteMissions: nextNoteMissions,
          testMissions: nextTestMissions,
          summary: {
            totalMissionCount:
              nextNoteMissions.length + nextTestMissions.length,
            completedMissionCount: 0,
          },
        };
      }),
    };

    setWeeklyPlan(nextPlan);
    void saveToDb(nextPlan);
  };
  // ✅ Perfect New Code
  const finalizeMissionValidation = async (
    state: "early_bird" | "on_time" | "delayed_start" | "accident_shift",
    reason: string,
  ) => {
    if (!pendingMission || !weeklyPlan) return;
    const { day, mission, type } = pendingMission;
    const now = new Date();
    const plannedStartMinutes = getMissionStartMinutes(mission);
    const actualMinutes = now.getHours() * 60 + now.getMinutes();
    const delayMinutes =
      plannedStartMinutes === null
        ? 0
        : Math.max(0, actualMinutes - plannedStartMinutes);
    const isBlitzSalvage =
      state === "delayed_start" && delayMinutes >= BLITZ_LATE_MINUTES;
    const validationReasonText = isBlitzSalvage
      ? `${reason} - Blitz salvage mode`
      : reason;

    const nextPlan = {
      ...weeklyPlan,
      executionMatrix:
        state === "delayed_start"
          ? {
              currentStreak: 0,
              lastPenaltyAt: now.toISOString(),
              penaltyCount: (weeklyPlan.executionMatrix?.penaltyCount || 0) + 1,
              resetCount: weeklyPlan.executionMatrix?.resetCount || 0,
            }
          : weeklyPlan.executionMatrix,
      days: weeklyPlan.days.map((d) => {
        if (d.dayOfWeek !== day.dayOfWeek) return d;
        const shiftMinutes = state === "accident_shift" ? delayMinutes : 0;
        const shouldShiftMission = (
          item: PlannerNoteMission | PlannerTestMission,
        ) => {
          const itemStart = getMissionStartMinutes(item);
          return (
            shiftMinutes > 0 &&
            itemStart !== null &&
            plannedStartMinutes !== null &&
            itemStart >= plannedStartMinutes &&
            !isMissionClosed(item) &&
            !isMissionAbandoned(item)
          );
        };
        const nextValidation = (
          item: PlannerNoteMission | PlannerTestMission,
        ) => ({
          ...item.timeValidation,
          plannedStart: shouldShiftMission(item)
            ? shiftTime(item.timeValidation?.plannedStart, shiftMinutes)
            : item.timeValidation?.plannedStart || "00:00",
          plannedEnd: shouldShiftMission(item)
            ? shiftTime(item.timeValidation?.plannedEnd, shiftMinutes)
            : item.timeValidation?.plannedEnd || "00:00",
          actualStart:
            item.id === mission.id
              ? now.toISOString()
              : item.timeValidation?.actualStart || null,
          validationState:
            item.id === mission.id
              ? state
              : item.timeValidation?.validationState || "pending",
          delayReason:
            item.id === mission.id
              ? validationReasonText
              : item.timeValidation?.delayReason || "",
        });

        if (type === "note") {
          return {
            ...d,
            noteMissions: d.noteMissions.map((m) =>
              m.id === mission.id
                ? ({
                    ...m,
                    timeValidation: nextValidation(m),
                    progress: isBlitzSalvage
                      ? { ...m.progress!, status: "in_progress" }
                      : m.progress,
                  } as PlannerNoteMission)
                : ({
                    ...m,
                    timeValidation: nextValidation(m),
                  } as PlannerNoteMission),
            ),
            testMissions: d.testMissions.map((m) => ({
              ...m,
              timeValidation: nextValidation(m),
            })) as PlannerTestMission[],
          };
        } else {
          return {
            ...d,
            noteMissions: d.noteMissions.map((m) => ({
              ...m,
              timeValidation: nextValidation(m),
            })) as PlannerNoteMission[],
            testMissions: d.testMissions.map((m) =>
              m.id === mission.id
                ? ({
                    ...m,
                    timeValidation: nextValidation(m),
                    progress: isBlitzSalvage
                      ? { ...m.progress!, status: "in_progress" }
                      : m.progress,
                  } as PlannerTestMission)
                : ({
                    ...m,
                    timeValidation: nextValidation(m),
                  } as PlannerTestMission),
            ),
          };
        }
      }),
    };

    setWeeklyPlan(nextPlan);
    saveToDb(nextPlan);
    setIsValidationModalOpen(false);
    setPendingMission(null);
    setValidationReason(null);
    setTypedApology("");

    if (type === "note") {
      launchNoteMission(day, mission as PlannerNoteMission);
    } else if (type === "test") {
      launchTestMission(day, mission as PlannerTestMission);
    }
  };

  const handleMissionStartClick = (
    day: PlannerDay,
    mission: PlannerNoteMission | PlannerTestMission,
    type: "note" | "test",
  ) => {
    if ((mission.progress?.status || "not_started") !== "not_started") {
      if (type === "note")
        launchNoteMission(day, mission as PlannerNoteMission);
      return;
    }

    if (
      !mission.timeValidation?.plannedStart ||
      mission.timeValidation.plannedStart === "00:00"
    ) {
      if (type === "note")
        launchNoteMission(day, mission as PlannerNoteMission);
      return;
    }

    const now = new Date();
    const [plannedHour, plannedMin] = mission.timeValidation.plannedStart
      .split(":")
      .map(Number);
    const plannedTime = new Date(`${day.dateKey}T00:00:00`);
    plannedTime.setHours(plannedHour, plannedMin, 0, 0);

    const diffInMinutes = (now.getTime() - plannedTime.getTime()) / 60000;

    if (diffInMinutes > 15) {
      setPendingMission({ day, mission, type });
      setValidationReason(null);
      setTypedApology("");
      setIsValidationModalOpen(true);
    } else {
      // Early Bird or On Time -> Proceed without modal
      const state = diffInMinutes < -15 ? "early_bird" : "on_time";
      const reason = diffInMinutes < -15 ? "Started early" : "Started on time";
      const startedAt = new Date().toISOString();

      const nextPlan = {
        ...weeklyPlan!,
        days: weeklyPlan!.days.map((d) => {
          if (d.dayOfWeek !== day.dayOfWeek) return d;
          if (type === "note") {
            return {
              ...d,
              noteMissions: d.noteMissions.map((m) =>
                m.id === mission.id
                  ? ({
                      ...m,
                      timeValidation: {
                        ...m.timeValidation,
                        actualStart: startedAt,
                        validationState: state,
                        delayReason: reason,
                      },
                    } as PlannerNoteMission)
                  : m,
              ),
            };
          } else {
            return {
              ...d,
              testMissions: d.testMissions.map((m) =>
                m.id === mission.id
                  ? ({
                      ...m,
                      timeValidation: {
                        ...m.timeValidation,
                        actualStart: startedAt,
                        validationState: state,
                        delayReason: reason,
                      },
                    } as PlannerTestMission)
                  : m,
              ),
            };
          }
        }),
      };
      setWeeklyPlan(nextPlan);
      saveToDb(nextPlan);

      // ✅ Perfect New Code
      if (type === "note") {
        launchNoteMission(day, mission as PlannerNoteMission);
      } else if (type === "test") {
        launchTestMission(day, mission as PlannerTestMission);
      }
    }
  };

  // PRO FIX: Phase 4 Surgical Split Engine
  const handleSplitLeftovers = (
    day: PlannerDay,
    mission: PlannerNoteMission,
  ) => {
    if (!weeklyPlan) return;

    // 1. Separate finished vs unfinished targets for the mission mode
    const scopedTargets = mission.progress?.targets || mission.targets || [];
    const missionMode = getNoteMissionMode(mission);
    const isTargetFinished = (target: PlannerTopicTarget) =>
      missionMode === "revise"
        ? Boolean(target.isRevised)
        : Boolean(target.isCompleted);
    const incompleteTargets = scopedTargets.filter((t) => !isTargetFinished(t));
    const finishedTargets = scopedTargets.filter(isTargetFinished);

    if (incompleteTargets.length === 0) {
      alert("Mission is already 100% complete. Nothing to split!");
      return;
    }

    // 2. Generate the Spillover Mission (The Debt Collector)
    const spilloverMission: PlannerNoteMission = {
      ...mission,
      id: `note-${day.dateKey}-split-${Date.now()}`,
      chapterLabel: `${mission.chapterLabel} - Debt`,
      targets: incompleteTargets,
      timeValidation: {
        plannedStart: DEBT_COLLECTOR_START,
        plannedEnd: DEBT_COLLECTOR_END,
        actualStart: null,
        actualEnd: null,
        validationState: "pending",
        delayReason: "",
      },
      progress: {
        status: "not_started",
        completionPercent: 0,
        totalTargets:
          incompleteTargets.reduce(
            (acc, t) => acc + (t.leafUids?.length || 0),
            0,
          ) || incompleteTargets.length,
        completedTargets: 0,
        revisedTargets: 0,
        targets: incompleteTargets,
      },
    };

    // 3. Finalize the Current Mission (Secure the points)
    const totalFinished =
      finishedTargets.reduce((acc, t) => acc + (t.leafUids?.length || 0), 0) ||
      finishedTargets.length;
    const completedFinished =
      finishedTargets.reduce(
        (acc, t) => acc + (t.completedLeafCount || t.leafUids?.length || 0),
        0,
      ) || totalFinished;
    const updatedCurrentMission: PlannerNoteMission = {
      ...mission,
      targets: finishedTargets,
      progress: {
        ...mission.progress!,
        status: missionMode === "revise" ? "revised" : "completed",
        completionPercent: 100, // It is now 100% of its new, smaller scope
        totalTargets: totalFinished,
        completedTargets:
          missionMode === "revise" ? completedFinished : totalFinished,
        revisedTargets:
          missionMode === "revise"
            ? totalFinished
            : mission.progress?.revisedTargets || 0,
        targets: finishedTargets,
      },
    };

    // 4. Inject into the Matrix
    const nextPlan = {
      ...weeklyPlan,
      executionMatrix: {
        currentStreak: weeklyPlan.executionMatrix?.currentStreak || 0,
        lastPenaltyAt: weeklyPlan.executionMatrix?.lastPenaltyAt || null,
        penaltyCount: weeklyPlan.executionMatrix?.penaltyCount || 0,
        resetCount: (weeklyPlan.executionMatrix?.resetCount || 0) + 1,
      },
      days: weeklyPlan.days.map((d) => {
        if (d.dayOfWeek !== day.dayOfWeek) return d;
        const newNoteMissions = d.noteMissions.map((m) =>
          m.id === mission.id ? updatedCurrentMission : m,
        );
        newNoteMissions.push(spilloverMission);
        return ensureDebtCollectorBlock({
          ...d,
          noteMissions: newNoteMissions,
        });
      }),
    };

    // ✅ Perfect New Code
    setWeeklyPlan(nextPlan);
    saveToDb(nextPlan);

    triggerCelebration({
      missionName: mission.chapterLabel,
      totalTopics: finishedTargets.length,
      totalPoints: totalFinished,
      duration: `${mission.timeValidation?.plannedStart || "00:00"} - ${
        mission.timeValidation?.plannedEnd || "00:00"
      }`,
    });
  };

  // PRO FIX: Phase 5 Catastrophe Reset Engine
  const handleCatastropheReset = (day: PlannerDay) => {
    if (!weeklyPlan) return;

    const isConfirmed = window.confirm(
      "EMERGENCY PROTOCOL: This will permanently wipe all unstarted tasks scheduled before right now. You will lose these points forever, but you will get a clean slate for the rest of the day. Do you want to salvage the day?",
    );
    if (!isConfirmed) return;

    const now = new Date();
    const currentTimeNum = now.getHours() * 60 + now.getMinutes();

    const nextPlan = {
      ...weeklyPlan,
      days: weeklyPlan.days.map((d) => {
        if (d.dayOfWeek !== day.dayOfWeek) return d;

        // Wipe missed Note Missions
        const resetNotes = d.noteMissions.map((m) => {
          if (
            m.progress?.status === "completed" ||
            !m.timeValidation?.plannedStart
          )
            return m;
          const missionStart = getMissionStartMinutes(m);
          if (
            missionStart !== null &&
            missionStart < currentTimeNum &&
            m.progress?.status === "not_started"
          ) {
            return {
              ...m,
              progress: { ...m.progress!, status: "failed_abandoned" },
              timeValidation: {
                ...m.timeValidation,
                validationState: "delayed_start",
                delayReason: "Reset Matrix abandoned missed block",
              },
            };
          }
          return m;
        });

        // Wipe missed Test Missions
        const resetTests = d.testMissions.map((m) => {
          if (
            m.progress?.status === "completed" ||
            !m.timeValidation?.plannedStart
          )
            return m;
          const missionStart = getMissionStartMinutes(m);
          if (
            missionStart !== null &&
            missionStart < currentTimeNum &&
            m.progress?.status === "not_started"
          ) {
            return {
              ...m,
              progress: { ...m.progress!, status: "failed_abandoned" },
              timeValidation: {
                ...m.timeValidation,
                validationState: "delayed_start",
                delayReason: "Reset Matrix abandoned missed block",
              },
            };
          }
          return m;
        });

        return ensureDebtCollectorBlock({
          ...d,
          noteMissions: resetNotes as PlannerNoteMission[],
          testMissions: resetTests as PlannerTestMission[],
        });
      }),
    };

    setWeeklyPlan(nextPlan);
    saveToDb(nextPlan);
  };

  const launchNoteMission = (
    day: PlannerDay,
    mission: PlannerNoteMission,
    autoStarted = false,
  ) => {
    const route = SUBJECT_ROUTE_REGISTRY[mission.subject];
    if (!route || typeof window === "undefined") return;

    const missionData = {
      id: mission.id,
      mode: getNoteMissionMode(mission),
      createdAt:
        typeof mission.createdAt === "number" &&
        Number.isFinite(mission.createdAt)
          ? mission.createdAt
          : Date.now(),
      subject: mission.subject,
      chapterUid: mission.chapterUid,
      chapterLabel: mission.chapterLabel,
      plannedStart: mission.timeValidation?.plannedStart || null,
      plannedEnd: mission.timeValidation?.plannedEnd || null,
      targets: mission.progress?.targets || mission.targets || [],
      progress: mission.progress,
      progressStatus: mission.progress?.status || "not_started",
    };

    window.sessionStorage.setItem(
      PLANNER_NOTE_SESSION_KEY,
      JSON.stringify({
        dayKey: day.dateKey,
        dayOfWeek: day.dayOfWeek,
        startedAt: Date.now(),
        activeMissionId: mission.id,
        returnTo: "/planner",
        graceMinutes: PLANNER_GRACE_MINUTES,
        autoStarted,
        missions: [missionData],
        missionContext: "note",
      }),
    );

    window.location.href = `${route}?plannerMission=1`;
  };

  const launchTestMission = (day: PlannerDay, mission: PlannerTestMission) => {
    if (typeof window === "undefined") return;

    const isLegacyNoteChapter =
      mission.chapterSlug === mission.chapterTitle && !mission.noteChapterLabel;

    const resolvedChapter = isLegacyNoteChapter
      ? "All"
      : mission.chapterSlug || "All";
    const resolvedNoteChapter =
      mission.noteChapterLabel ||
      (isLegacyNoteChapter ? mission.chapterTitle : "");

    window.sessionStorage.setItem(
      PLANNER_NOTE_SESSION_KEY,
      JSON.stringify({
        dayKey: day.dateKey,
        dayOfWeek: day.dayOfWeek,
        startedAt: Date.now(),
        activeMissionId: mission.id,
        returnTo: "/planner",
        graceMinutes: 0,
        missionContext: "test",
        testConfig: {
          subject: mission.subject,
          chapter: resolvedChapter,
          noteChapter: resolvedNoteChapter,
          mode: mission.mode,
          timeLimitMinutes: mission.timeLimitMinutes,
          totalQuestions: mission.totalQuestions,
          difficultyBreakdown: mission.difficultyBreakdown,
        },
      }),
    );

    window.location.href = `/mcq-quiz?plannerMission=1`;
  };

  useEffect(() => {
    if (!isAutoModeEnabled || !hydratedWeeklyPlan || !weeklyPlan) return;
    if (typeof window === "undefined") return;

    const findDueMission = (): {
      day: PlannerDay;
      mission: PlannerNoteMission | PlannerTestMission;
      type: "note" | "test";
    } | null => {
      const now = new Date();
      const todayKey = getLocalDateKey(now);
      const today = hydratedWeeklyPlan.days.find(
        (day) => day.dateKey === todayKey,
      );
      if (!today) return null;

      const currentMs =
        ((now.getHours() * 60 + now.getMinutes()) * 60 + now.getSeconds()) *
          1000 +
        now.getMilliseconds();
      const isDue = (item: PlannerNoteMission | PlannerTestMission) => {
        if ((item.progress?.status || "not_started") !== "not_started")
          return false;
        if (item.timeValidation?.actualStart) return false;
        const plannedStart = parseTimeToMinutes(
          item.timeValidation?.plannedStart,
        );
        if (plannedStart === null) return false;
        const plannedEnd = parseTimeToMinutes(item.timeValidation?.plannedEnd);
        const plannedStartMs = plannedStart * 60 * 1000;
        const plannedEndMs =
          plannedEnd === null ? null : plannedEnd * 60 * 1000;
        return (
          currentMs >= plannedStartMs - AUTO_MODE_START_LEAD_MS &&
          (plannedEndMs === null || currentMs < plannedEndMs)
        );
      };

      const noteMission = (today.noteMissions || []).find(isDue);
      if (noteMission)
        return { day: today, mission: noteMission, type: "note" };

      const testMission = (today.testMissions || []).find(isDue);
      return testMission
        ? { day: today, mission: testMission, type: "test" }
        : null;
    };

    const startDueMission = () => {
      if (window.sessionStorage.getItem(PLANNER_NOTE_SESSION_KEY)) return;

      const dueMission = findDueMission();
      if (!dueMission) return;
      if (autoStartedMissionRef.current === dueMission.mission.id) return;

      autoStartedMissionRef.current = dueMission.mission.id;
      const startedAt = new Date().toISOString();
      const updatedMission = {
        ...dueMission.mission,
        timeValidation: {
          ...dueMission.mission.timeValidation,
          plannedStart:
            dueMission.mission.timeValidation?.plannedStart || "00:00",
          plannedEnd: dueMission.mission.timeValidation?.plannedEnd || "00:00",
          actualEnd: dueMission.mission.timeValidation?.actualEnd || null,
          actualStart: startedAt,
          validationState: "on_time",
          delayReason: "Auto Mode started 15 seconds before planned time",
        },
      } as PlannerNoteMission | PlannerTestMission;

      const nextPlan = {
        ...weeklyPlan,
        days: weeklyPlan.days.map((day) =>
          day.dateKey === dueMission.day.dateKey
            ? {
                ...day,
                noteMissions:
                  dueMission.type === "note"
                    ? day.noteMissions.map((mission) =>
                        mission.id === dueMission.mission.id
                          ? ({
                              ...mission,
                              timeValidation: updatedMission.timeValidation,
                            } as PlannerNoteMission)
                          : mission,
                      )
                    : day.noteMissions,
                testMissions:
                  dueMission.type === "test"
                    ? day.testMissions.map((mission) =>
                        mission.id === dueMission.mission.id
                          ? ({
                              ...mission,
                              timeValidation: updatedMission.timeValidation,
                            } as PlannerTestMission)
                          : mission,
                      )
                    : day.testMissions,
              }
            : day,
        ),
      };

      setWeeklyPlan(nextPlan);
      void saveToDb(nextPlan);
      if (dueMission.type === "note") {
        launchNoteMission(
          dueMission.day,
          updatedMission as PlannerNoteMission,
          true,
        );
      } else {
        launchTestMission(dueMission.day, updatedMission as PlannerTestMission);
      }
    };

    startDueMission();
    const intervalId = window.setInterval(startDueMission, 1000);
    return () => window.clearInterval(intervalId);
  }, [hydratedWeeklyPlan, isAutoModeEnabled, weeklyPlan]);

  const executeSundayGeneration = () => {
    if (!weeklyPlan) return;
    const workingPlan = {
      ...weeklyPlan,
      status: "Committed",
      committedAt: new Date().toISOString(),
    };

    workingPlan.days = workingPlan.days.map((day) => {
      const bData = builderData[day.dayOfWeek];
      if (!bData) return day;

      // ✅ Perfect New Code
      const noteMissions: PlannerNoteMission[] = bData.notes.map((n, i) => {
        const targets = n.topics.map((t: string) =>
          getTopicTargetMetadata(n.subject, n.chapter, t),
        );
        const totalTargets =
          targets.reduce(
            (sum, target) =>
              sum +
              (Array.isArray(target.leafUids) ? target.leafUids.length : 0),
            0,
          ) ||
          n.totalPoints ||
          0;

        // 🧠 PRO FIX: Assign exact future epoch time so duplicate revisions in the same week demand fresh work!
        // 🧠 PRO FIX: Future epoch time WITH a 2-hour "Early Bird" buffer!
        // Prevents Monday night from leaking into Tuesday, but safely counts if you start Tuesday's task early.
        let missionStartEpoch = Date.now();
        if (n.plannedStart) {
          const [hh, mm] = n.plannedStart.split(":").map(Number);
          const [yyyy, month, dd] = day.dateKey.split("-").map(Number);
          // Deduct 2 hours (2 * 60 * 60 * 1000 milliseconds)
          missionStartEpoch =
            new Date(yyyy, month - 1, dd, hh, mm, 0, 0).getTime() -
            2 * 60 * 60 * 1000;
        }

        return {
          id: `note-${day.dateKey}-${i}`,
          mode: n.mode === "revise" ? "revise" : "complete",
          createdAt: missionStartEpoch,
          subjectKey: n.subject,
          subject: n.subject,
          chapterUid: n.chapter,
          chapterLabel: n.chapter,
          targets: targets,
          timeValidation: {
            plannedStart: n.plannedStart || "00:00",
            plannedEnd: n.plannedEnd || "00:00",
            actualStart: null,
            actualEnd: null,
            validationState: "pending",
            delayReason: "",
          },
          progress: {
            status: "not_started",
            completionPercent: 0,
            totalTargets,
            completedTargets: 0,
            revisedTargets: 0,
            targets,
          },
        };
      });

      const testMissions: PlannerTestMission[] = bData.tests.map((t, i) => ({
        id: `test-${day.dateKey}-${i}`,
        subject: t.subject,
        chapterSlug: t.chapter,
        chapterTitle: t.topic || t.chapter,
        noteChapterId: "",
        noteChapterLabel: "",
        mode: t.mode,
        timeLimitMinutes: t.timer,
        totalQuestions: t.easy + t.medium + t.hard,
        difficultyBreakdown: { easy: t.easy, medium: t.medium, hard: t.hard },
        timeValidation: {
          plannedStart: t.plannedStart || "00:00",
          plannedEnd: t.plannedEnd || "00:00",
          actualStart: null,
          actualEnd: null,
          validationState: "pending",
          delayReason: "",
        },
        progress: {
          status: "not_started",
          completionPercent: 0,
          completedQuestions: 0,
          accuracy: 0,
          easySolved: 0,
          mediumSolved: 0,
          hardSolved: 0,
        },
      }));

      return ensureDebtCollectorBlock({
        ...day,
        noteMissions,
        testMissions,
        otherMissions: [],
        summary: {
          totalMissionCount: noteMissions.length + testMissions.length,
          completedMissionCount: 0,
        },
      });
    });

    const totalMissions = workingPlan.days.reduce(
      (acc, d) =>
        acc + (d.noteMissions?.length || 0) + (d.testMissions?.length || 0),
      0,
    );
    workingPlan.summary = {
      totalMissionCount: totalMissions,
      completedMissionCount: 0,
      completionPercent: 0,
    };

    setWeeklyPlan(workingPlan as WeeklyPlanData);
    saveToDb(workingPlan as WeeklyPlanData);
    setIsModalOpen(false);
  };

  // 🛡️ PRO FIX: AI Burnout Predictor Engine (Moved ABOVE early return to satisfy Hook Rules)
  const [isBurnoutDetected, setIsBurnoutDetected] = useState(false);

  useEffect(() => {
    if (!hydratedWeeklyPlan) return;
    let rollingIntensity = 0;
    let rollingAccuracy = 0;
    let testsTaken = 0;

    hydratedWeeklyPlan.days.forEach((day) => {
      rollingIntensity += day.summary?.deepCompletedPoints || 0;
      day.testMissions?.forEach((test) => {
        if (test.progress?.status === "completed") {
          testsTaken++;
          rollingAccuracy += test.progress.accuracy || 0;
        }
      });
    });

    const averageAccuracy = testsTaken > 0 ? rollingAccuracy / testsTaken : 100;

    // The Formula: High Workload (>150 points) + Crashing Accuracy (<55%) = Burnout
    if (rollingIntensity > 150 && averageAccuracy < 55) {
      setIsBurnoutDetected(true);
    } else {
      setIsBurnoutDetected(false);
    }
  }, [hydratedWeeklyPlan]);

  if (isLoading || !hydratedWeeklyPlan) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center text-white font-sans">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 animate-pulse bg-blue-500/10 border border-blue-500/20 w-fit px-4 py-2 rounded-lg">
          Syncing Dashboard Aura...
        </div>
      </div>
    );
  }

  const currentDayData =
    hydratedWeeklyPlan.days.find((d) => d.dayOfWeek === activeDay) ||
    hydratedWeeklyPlan.days[0];

  // 1. Maintain task counters strictly for the UI text ("X/Y closed") so visuals don't break
  const dailyTotalTasks =
    (currentDayData.noteMissions?.length || 0) +
    (currentDayData.testMissions?.length || 0);
  const dailyCompletedTasks =
    (currentDayData.noteMissions?.filter(
      (t) =>
        t.progress?.status === "completed" || t.progress?.status === "revised",
    ).length || 0) +
    (currentDayData.testMissions?.filter(
      (t) => t.progress?.status === "completed",
    ).length || 0);

  // 2. PRO FIX: Granular Points Calculation for real-time Daily Circular Bar updates
  let dailyTotalPoints = 0;
  let dailyCompletedPoints = 0;

  currentDayData.noteMissions?.forEach((m) => {
    dailyTotalPoints += m.progress?.totalTargets || 0;
    dailyCompletedPoints += getNoteMissionTrackedCount(m);
  });
  currentDayData.testMissions?.forEach((m) => {
    dailyTotalPoints += m.totalQuestions || 0;
    dailyCompletedPoints += getTestMissionCompletedQuestions(m);
  });

  const dailyProgress =
    dailyTotalPoints > 0
      ? Math.min(100, (dailyCompletedPoints / dailyTotalPoints) * 100)
      : 0;

  // 3. PRO FIX: Apply the same real-time granular logic to the Overall Weekly Progress Bars
  let weekTotalPoints = 0;
  let weekCompletedPoints = 0;

  hydratedWeeklyPlan.days.forEach((d) => {
    d.noteMissions?.forEach((m) => {
      weekTotalPoints += m.progress?.totalTargets || 0;
      weekCompletedPoints += getNoteMissionTrackedCount(m);
    });
    d.testMissions?.forEach((m) => {
      weekTotalPoints += m.totalQuestions || 0;
      weekCompletedPoints += getTestMissionCompletedQuestions(m);
    });
  });

  const overallWeekProgress =
    weekTotalPoints > 0
      ? Math.min(100, (weekCompletedPoints / weekTotalPoints) * 100)
      : 0;
  const currentDebtBlock = (currentDayData.otherMissions || []).find(
    (mission) => mission?.type === "debt_collector",
  );
  const currentDebtMissions = (currentDayData.noteMissions || []).filter(
    (mission) => mission.chapterLabel.includes(" - Debt"),
  );
  const matrixStreak = hydratedWeeklyPlan.executionMatrix?.currentStreak || 0;
  const resetCount = hydratedWeeklyPlan.executionMatrix?.resetCount || 0;
  const penaltyCount = hydratedWeeklyPlan.executionMatrix?.penaltyCount || 0;

  // 🛡️ PRO FIX: Granular specific calculations for TODAY's Note & Test Progress
  let dailyNoteTotalPoints = 0;
  let dailyNoteCompletedPoints = 0;
  currentDayData?.noteMissions?.forEach((m) => {
    dailyNoteTotalPoints += m.progress?.totalTargets || 0;
    dailyNoteCompletedPoints += getNoteMissionTrackedCount(m);
  });
  const dailyNoteProgress =
    dailyNoteTotalPoints > 0
      ? Math.min(100, (dailyNoteCompletedPoints / dailyNoteTotalPoints) * 100)
      : 0;

  let dailyTestTotalPoints = 0;
  let dailyTestCompletedPoints = 0;
  currentDayData?.testMissions?.forEach((m) => {
    dailyTestTotalPoints += m.totalQuestions || 0;
    dailyTestCompletedPoints += getTestMissionCompletedQuestions(m);
  });
  const dailyTestProgress =
    dailyTestTotalPoints > 0
      ? Math.min(100, (dailyTestCompletedPoints / dailyTestTotalPoints) * 100)
      : 0;

  return (
    <div className="min-h-screen w-full bg-[#000000] text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col items-center antialiased relative overflow-hidden">
      {/* 🛡️ PRO FIX: Burnout Override Shield */}
      {isBurnoutDetected && (
        <div className="w-full max-w-[1440px] px-6 pt-6 z-50 animate-in fade-in slide-in-from-top-4">
          <div className="bg-red-950/80 border border-red-500 text-red-200 p-5 rounded-2xl shadow-[0_0_40px_rgba(239,68,68,0.2)] backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black tracking-widest uppercase text-red-400">
                ⚠️ Critical Fatigue Detected
              </h3>
              <p className="text-sm font-medium mt-1">
                Your work intensity is massive, but your mock accuracy has
                collapsed below 55%. You are burning out.{" "}
                <strong>
                  System recommends a 12-Hour Rest Block immediately.
                </strong>
              </p>
            </div>
            <button
              onClick={() => {
                setIsBurnoutDetected(false);
                alert("Rest Block Initiated. Take a break.");
              }}
              className="shrink-0 bg-red-500 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-colors"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/4 w-[800px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] opacity-70"></div>
        <div className="absolute bottom-[-10%] right-1/4 w-[600px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:24px_24px]"></div>
      </div>

      <div className="w-full max-w-[1440px] mx-auto px-6 py-8 space-y-8 relative z-10">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-400/80 mb-2">
              Live Weekly Planner
            </p>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tighter bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent flex items-center gap-3 flex-wrap">
              {isCurrentWeek
                ? isTodaySunday
                  ? "Planning Sunday Window"
                  : "Execution Week Control Room"
                : "Execution Archive Vault"}
              {!isCurrentWeek && (
                <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.15)]">
                  Past Record
                </span>
              )}
            </h1>
          </div>
          {/* ... Keep the rest of your header buttons exactly the same here ... */}
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={toggleAutoMode}
                aria-pressed={isAutoModeEnabled}
                className={`h-11 px-4 rounded-xl border transition-all duration-300 active:scale-95 flex items-center gap-3 ${
                  isAutoModeEnabled
                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                    : "bg-white/[0.03] border-white/[0.08] text-slate-400"
                }`}
              >
                <span
                  className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${
                    isAutoModeEnabled ? "bg-emerald-500" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ease-in-out ${
                      isAutoModeEnabled ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </span>

                <span className="text-xs font-black tracking-widest uppercase">
                  Auto Mode {isAutoModeEnabled ? "On" : "Off"}
                </span>
              </button>
              <button
                onClick={() => handleCatastropheReset(currentDayData)}
                className="h-11 px-5 text-xs font-black bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-xl transition-all active:scale-95 border border-red-500/25 tracking-widest uppercase flex items-center gap-2"
              >
                <span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]"></span>
                Reset Matrix
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="h-11 px-6 text-xs font-black bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)] tracking-widest uppercase flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                {hydratedWeeklyPlan?.status === "Committed"
                  ? "Edit Weekly Matrix"
                  : "Create Weekly Matrix"}
              </button>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
              {isTodaySunday
                ? "Sunday lock window active"
                : "Test mode: builder unlocked"}
            </span>
          </div>
        </header>

        {lastTimedRun && (
          <div className="rounded-[18px] border border-emerald-500/20 bg-emerald-500/[0.07] px-5 py-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                Timed note session closed
              </p>
              <p className="mt-1 text-sm font-bold text-slate-200">
                {lastTimedRun.subject} - {lastTimedRun.chapterLabel}
              </p>
            </div>
            <div className="rounded-[14px] border border-white/[0.08] bg-black/35 px-4 py-2 text-right">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                Points tracked
              </p>
              <p className="mt-0.5 text-xl font-black text-emerald-300">
                {lastTimedRun.completedTargets}
                <span className="text-sm text-slate-500">
                  /{lastTimedRun.totalTargets}
                </span>
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-8 w-full mt-4">
          <div className="space-y-6">
            <div className="rounded-[24px] bg-[#050505]/60 backdrop-blur-2xl border border-white/[0.04] p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6 pb-5 border-b border-white/[0.04] gap-4">
                <div className="flex items-center gap-5">
                  <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                    <svg
                      className="w-full h-full transform -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="44"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        className="text-white/[0.04]"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="44"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        strokeDasharray="276"
                        strokeDashoffset={276 - (276 * dailyProgress) / 100}
                        className="text-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.6)] transition-all duration-700"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[11px] font-black text-white">
                      {Math.round(dailyProgress)}%
                    </span>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                      Active Execution Block
                    </p>
                    <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white">
                      {DAY_LABELS[currentDayData?.dayOfWeek || "MON"]} Targets
                    </h2>
                  </div>
                </div>
                <div className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-300 w-fit">
                  {dailyCompletedTasks}/{dailyTotalTasks} closed
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/50 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md overflow-x-auto [&::-webkit-scrollbar]:hidden">
                {/* 🛡️ PRO FIX: Time Travel Left Arrow */}
                <button
                  onClick={() => setViewOffsetWeeks((prev) => prev - 1)}
                  className="group relative flex h-full min-h-[64px] w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] transition-all hover:bg-white/[0.1] hover:border-white/20 active:scale-95"
                  title="Previous Week"
                >
                  <svg
                    className="h-5 w-5 text-slate-400 transition-colors group-hover:text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {hydratedWeeklyPlan?.days
                  .filter((day) => day.dayOfWeek !== "SUN")
                  .map((day) => {
                    const isActive = activeDay === day.dayOfWeek;

                    return (
                      <button
                        key={day.dayOfWeek}
                        type="button"
                        onClick={() => setActiveDay(day.dayOfWeek)}
                        className={`group relative flex-1 min-w-[82px] flex flex-col items-center justify-center rounded-xl border py-3 transition-all duration-300 ease-out active:scale-[0.98] ${
                          isActive
                            ? "border-cyan-400 bg-[#121826] shadow-[0_0_18px_rgba(34,211,238,0.18),inset_0_1px_0_rgba(255,255,255,0.05)] scale-[1.02]"
                            : "border-white/10 bg-white/[0.025] hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05] hover:shadow-[0_8px_20px_rgba(0,0,0,0.25)]"
                        }`}
                      >
                        <span
                          className={`text-[11px] font-black tracking-[0.18em] uppercase transition-colors ${
                            isActive
                              ? "text-white"
                              : "text-slate-400 group-hover:text-white"
                          }`}
                        >
                          {day.dayOfWeek}
                        </span>
                        <span
                          className={`mt-1 text-[10px] font-semibold tracking-wide ${
                            isActive
                              ? "text-cyan-400"
                              : "text-slate-500 group-hover:text-slate-300"
                          }`}
                        >
                          {day.dateLabel}
                        </span>
                        {isActive && (
                          <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,1)]" />
                        )}
                      </button>
                    );
                  })}

                {/* 🛡️ PRO FIX: Time Travel Right Arrow (Only shows if in the past) */}
                {viewOffsetWeeks < 0 && (
                  <button
                    onClick={() => setViewOffsetWeeks((prev) => prev + 1)}
                    className="group relative flex h-full min-h-[64px] w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] transition-all hover:bg-white/[0.1] hover:border-white/20 active:scale-95"
                    title="Next Week"
                  >
                    <svg
                      className="h-5 w-5 text-slate-400 transition-colors group-hover:text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <section className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>{" "}
                  Note Missions
                </h2>
              </div>
              <div className="flex flex-col gap-3">
                {(currentDayData?.noteMissions || []).map((mission) => (
                  <div
                    key={mission.id}
                    className="group bg-[#050505]/40 backdrop-blur-md rounded-[20px] p-5 lg:p-6 border border-white/[0.02] transition-all duration-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.01)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] hover:border-emerald-500/30"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-200 group-hover:text-white transition-colors tracking-tight">
                          {mission.chapterLabel}
                        </h3>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400/80">
                            {mission.subject}
                          </span>
                          <span
                            className={`text-[9px] font-black tracking-widest border px-2 py-0.5 rounded-full uppercase ${
                              getNoteMissionMode(mission) === "revise"
                                ? "bg-cyan-500/10 border-cyan-500/25 text-cyan-300"
                                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                            }`}
                          >
                            {getNoteMissionMode(mission)}
                          </span>
                          {mission.timeValidation?.plannedStart && (
                            <span className="text-[9px] font-black text-slate-300 tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <svg
                                className="w-3 h-3 text-emerald-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {mission.timeValidation.plannedStart} -{" "}
                              {mission.timeValidation.plannedEnd}
                            </span>
                          )}
                          {mission.timeValidation?.delayReason?.includes(
                            "Blitz",
                          ) && (
                            <span className="text-[9px] font-black text-amber-300 tracking-widest bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-full">
                              Blitz Salvage
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
                          {/* Phase 4: Split Leftovers Button */}
                          {!isMissionClosed(mission) &&
                            (mission.progress?.status === "in_progress" ||
                              (mission.progress?.status !== "not_started" &&
                                !isMissionAbandoned(mission))) && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleSplitLeftovers(currentDayData, mission)
                                }
                                className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-amber-400 transition-colors hover:bg-amber-500/20 hover:text-white shadow-[0_0_15px_rgba(245,158,11,0.1)] active:scale-95"
                              >
                                Split Leftovers
                              </button>
                            )}

                          {!isMissionClosed(mission) && (
                            <button
                              type="button"
                              onClick={() =>
                                handleMissionStartClick(
                                  currentDayData,
                                  mission,
                                  "note",
                                )
                              }
                              disabled={
                                !SUBJECT_ROUTE_REGISTRY[mission.subject] ||
                                isMissionAbandoned(mission)
                              }
                              className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-300 transition-colors hover:bg-emerald-500/20 hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.02] disabled:text-slate-600 active:scale-95"
                            >
                              {(mission.progress?.status || "not_started") ===
                              "not_started"
                                ? "Start"
                                : getNoteMissionActionLabel(mission)}
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            deleteMission(
                              currentDayData.dayOfWeek,
                              "noteMissions",
                              mission.id,
                            )
                          }
                          className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-300 transition-colors hover:bg-red-500/20 hover:text-white"
                        >
                          Delete
                        </button>
                        <StatusBadge
                          status={mission.progress?.status || "not_started"}
                        />
                      </div>
                    </div>
                    <ProgressBar
                      value={getMissionCompletionPercent(mission)}
                      tone="emerald"
                    />
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          const noteTargets =
                            mission.progress?.targets ?? mission.targets;
                          const missionMode = getNoteMissionMode(mission);
                          return noteTargets?.map((target) => (
                            <div
                              key={target.uid}
                              className={`rounded-[10px] border px-2.5 py-1 text-[11px] font-bold transition-colors ${
                                isProgressTarget(target) &&
                                (missionMode === "revise"
                                  ? target.isRevised
                                  : target.isCompleted)
                                  ? missionMode === "revise"
                                    ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                  : (missionMode === "revise"
                                        ? target.revisedLeafCount || 0
                                        : target.completedLeafCount || 0) > 0
                                    ? "border-amber-500/25 bg-amber-500/10 text-amber-300"
                                    : "border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/[0.04]"
                              }`}
                            >
                              <span>{target.label}</span>
                              <span className="ml-2 text-[9px] opacity-75">
                                {missionMode === "revise"
                                  ? target.revisedLeafCount || 0
                                  : target.completedLeafCount || 0}
                                /
                                {target.totalLeafCount ||
                                  target.leafUids?.length ||
                                  0}
                              </span>
                            </div>
                          ));
                        })()}
                      </div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/[0.04]">
                        {getNoteMissionTrackedCount(mission)}/
                        {mission.progress?.totalTargets || 0}{" "}
                        {getNoteMissionMode(mission) === "revise"
                          ? "Tracked"
                          : "Done"}{" "}
                        <span className="mx-1 text-slate-700">·</span>{" "}
                        {mission.progress?.revisedTargets || 0} Rev
                      </div>
                    </div>
                  </div>
                ))}
                {(currentDayData?.noteMissions || []).length === 0 && (
                  <div className="rounded-[24px] border border-dashed border-white/[0.05] bg-[#050505]/40 p-8 text-sm font-semibold text-slate-500 text-center">
                    No note missions assigned for this day.
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-5">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[11px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>{" "}
                  Test Missions
                </h2>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/[0.02] px-2.5 py-1 rounded border border-white/[0.04]">
                  {currentDayData?.testMissions?.length || 0} Runs
                </span>
              </div>
              <div className="flex flex-col gap-4">
                {(currentDayData?.testMissions || []).map((mission) => (
                  <div
                    key={mission.id}
                    className="group bg-[#050505]/60 backdrop-blur-2xl rounded-[24px] p-6 lg:p-8 border border-white/[0.04] hover:border-purple-500/30 transition-all duration-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03),0_10px_20px_-10px_rgba(0,0,0,0.5)] relative overflow-hidden"
                  >
                    <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-purple-600/10 rounded-full blur-[50px] pointer-events-none transition-colors group-hover:bg-purple-600/20"></div>
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-8 relative z-10">
                      <div className="flex flex-col w-full lg:w-auto flex-1 h-full">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-lg font-extrabold text-slate-100 tracking-tight">
                              {mission.chapterTitle}
                            </h3>
                            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400/80">
                                {mission.subject} · {mission.mode} ·{" "}
                                {mission.timeLimitMinutes} min
                              </span>
                              {mission.timeValidation?.plannedStart && (
                                <span className="text-[9px] font-black text-slate-300 tracking-widest bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <svg
                                    className="w-3 h-3 text-purple-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  {mission.timeValidation.plannedStart} -{" "}
                                  {mission.timeValidation.plannedEnd}
                                </span>
                              )}
                              {mission.timeValidation?.delayReason?.includes(
                                "Blitz",
                              ) && (
                                <span className="text-[9px] font-black text-amber-300 tracking-widest bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-full">
                                  Blitz Salvage
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!isMissionClosed(mission) && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleMissionStartClick(
                                    currentDayData,
                                    mission,
                                    "test",
                                  )
                                }
                                disabled={isMissionAbandoned(mission)}
                                className="rounded-lg border border-purple-500/25 bg-purple-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-purple-300 transition-colors hover:bg-purple-500/20 hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.02] disabled:text-slate-600 active:scale-95"
                              >
                                {(mission.progress?.status || "not_started") ===
                                "not_started"
                                  ? "Start"
                                  : isMissionAbandoned(mission)
                                    ? "Abandoned"
                                    : "Resume"}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                deleteMission(
                                  currentDayData.dayOfWeek,
                                  "testMissions",
                                  mission.id,
                                )
                              }
                              className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-300 transition-colors hover:bg-red-500/20 hover:text-white"
                            >
                              Delete
                            </button>
                            <StatusBadge
                              status={mission.progress?.status || "not_started"}
                            />
                          </div>
                        </div>
                        <div className="mt-auto space-y-3">
                          <ProgressBar
                            value={getMissionCompletionPercent(mission)}
                            tone="violet"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 shrink-0 w-full lg:w-[320px]">
                        <div className="rounded-[16px] border border-white/[0.06] bg-black/40 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]">
                          <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                            Progress
                          </div>
                          <div className="mt-1 text-base font-black text-white">
                            {mission.progress?.completedQuestions || 0}{" "}
                            <span className="text-slate-500 text-sm">
                              / {mission.totalQuestions}
                            </span>
                          </div>
                        </div>
                        <div className="rounded-[16px] border border-white/[0.06] bg-black/40 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]">
                          <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                            Accuracy
                          </div>
                          <div className="mt-1 text-base font-black text-emerald-400">
                            {mission.progress?.accuracy || 0}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6 w-full lg:sticky lg:top-8">
            {/* 1. ⚡ STREAK BOX */}
            <div className="bg-[#050505]/80 backdrop-blur-3xl rounded-[24px] border border-white/[0.04] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]">
              {/* Subtle top glow */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none"></div>

              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-[16px] flex items-center justify-center text-blue-400 shadow-[inset_0_1px_0_0_rgba(59,130,246,0.3),0_0_20px_rgba(59,130,246,0.15)] mb-5 relative z-10 transition-transform hover:scale-105 duration-300">
                <svg
                  className="w-5 h-5 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 relative z-10">
                Current Streak
              </h3>
              <p className="flex items-baseline gap-2 relative z-10">
                <span className="text-5xl font-black text-white tracking-tighter drop-shadow-md">
                  {matrixStreak}
                </span>
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                  Days
                </span>
              </p>
            </div>

            {/* 2. 📊 PROGRESS RADAR (TODAY ONLY) */}
            <div className="bg-[#050505]/80 backdrop-blur-3xl rounded-[24px] border border-white/[0.04] p-6 sm:p-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)] relative overflow-hidden">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2.5 mb-8 relative z-10">
                <svg
                  className="w-4 h-4 text-slate-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
                Today's Progress
              </h3>

              <div className="space-y-7 relative z-10">
                {/* Note Missions */}
                <div className="space-y-3 group">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-400/90 group-hover:text-emerald-300 transition-colors">
                      Note Missions
                    </span>
                    <span className="text-[11px] font-black text-emerald-400">
                      {Math.round(dailyNoteProgress)}%
                    </span>
                  </div>
                  <div className="w-full h-[6px] bg-[#000000] rounded-full overflow-hidden border border-white/[0.03] shadow-inner">
                    <div
                      className="h-full rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)] transition-all duration-1000 ease-out relative"
                      style={{ width: `${dailyNoteProgress}%` }}
                    >
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent to-white/30"></div>
                    </div>
                  </div>
                </div>

                {/* Test Missions */}
                <div className="space-y-3 group">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-purple-400/90 group-hover:text-purple-300 transition-colors">
                      Test Missions
                    </span>
                    <span className="text-[11px] font-black text-purple-400">
                      {Math.round(dailyTestProgress)}%
                    </span>
                  </div>
                  <div className="w-full h-[6px] bg-[#000000] rounded-full overflow-hidden border border-white/[0.03] shadow-inner">
                    <div
                      className="h-full rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.6)] transition-all duration-1000 ease-out relative"
                      style={{ width: `${dailyTestProgress}%` }}
                    >
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent to-white/30"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. ⚠️ DEBT COLLECTOR */}
            <div className="bg-[#050505]/80 backdrop-blur-3xl rounded-[24px] border border-amber-500/15 p-6 sm:p-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02),0_10px_30px_rgba(245,158,11,0.03)] relative overflow-hidden group hover:border-amber-500/30 transition-colors duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-amber-500/10 transition-colors duration-500"></div>

              <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] flex items-center justify-between gap-2 relative z-10">
                <span className="drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">
                  Debt Collector
                </span>
                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[9px] text-amber-300/90">
                  {currentDebtBlock?.plannedStart || DEBT_COLLECTOR_START} -{" "}
                  {currentDebtBlock?.plannedEnd || DEBT_COLLECTOR_END}
                </span>
              </h3>

              <div className="mt-8 flex items-baseline gap-2 relative z-10">
                <span className="text-5xl font-black tracking-tighter text-white drop-shadow-md">
                  {currentDebtMissions.length}
                </span>
                <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">
                  Carryover
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {isModalOpen && builderData && (
        <MatrixBuilderModal
          onClose={() => setIsModalOpen(false)}
          onSave={executeSundayGeneration}
          builderData={builderData}
          setBuilderData={setBuilderData}
        />
      )}

      {/* PRO FIX: Phase 3 Validation & Punishment Modal */}
      {isValidationModalOpen && pendingMission && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-red-500/30 rounded-[24px] w-full max-w-lg shadow-[0_0_80px_rgba(239,68,68,0.15)] overflow-hidden flex flex-col">
            <div className="p-6 md:p-8 border-b border-white/[0.04] bg-red-500/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-500">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-red-400">
                  Execution Window Missed
                </p>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tighter">
                You are late. Declare Reason.
              </h2>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {!validationReason ? (
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => setValidationReason("laziness")}
                    className="w-full p-4 border border-red-500/20 rounded-xl bg-[#050505] hover:bg-red-500/10 hover:border-red-500/50 transition-all text-left group"
                  >
                    <div className="text-sm font-black text-red-400 mb-1 uppercase tracking-widest">
                      I Was Lazy / Distracted
                    </div>
                    <div className="text-xs text-slate-500 group-hover:text-red-300 transition-colors">
                      I accept the streak slaughter and accountability penalty.
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      finalizeMissionValidation(
                        "accident_shift",
                        "Genuine Accident",
                      )
                    }
                    className="w-full p-4 border border-white/10 rounded-xl bg-[#050505] hover:bg-white/[0.05] transition-all text-left"
                  >
                    <div className="text-sm font-black text-slate-300 mb-1 uppercase tracking-widest">
                      Genuine Accident
                    </div>
                    <div className="text-xs text-slate-500">
                      Protect my streak. Shift schedule forward.
                    </div>
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <p className="text-xs font-bold text-red-400 mb-2 uppercase tracking-widest">
                      Type the following to unlock your dashboard:
                    </p>
                    <p className="text-sm text-white font-serif italic select-none">
                      "{REQUIRED_APOLOGY}"
                    </p>
                  </div>
                  <textarea
                    value={typedApology}
                    onChange={(e) => setTypedApology(e.target.value)}
                    placeholder="Type the sentence exactly as shown above..."
                    className="w-full bg-[#050505] border border-white/[0.08] text-white text-sm font-semibold rounded-xl p-4 outline-none focus:border-red-500 transition-colors resize-none h-24 shadow-inner"
                    onPaste={(e) => e.preventDefault()}
                  />
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => setValidationReason(null)}
                      className="px-6 py-3 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-white/[0.02] rounded-xl"
                    >
                      Back
                    </button>
                    <button
                      onClick={() =>
                        finalizeMissionValidation(
                          "delayed_start",
                          "Procrastination/Distraction",
                        )
                      }
                      disabled={typedApology !== REQUIRED_APOLOGY}
                      className={`px-8 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                        typedApology === REQUIRED_APOLOGY
                          ? "bg-red-500 text-white hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                          : "bg-white/[0.05] text-white/30 cursor-not-allowed"
                      }`}
                    >
                      Unlock & Start
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <>
        {/* <button
          onClick={() =>
            triggerCelebration({
              title: "Mission Complete!",
              subtitle: "Reward Engine Test",
              xp: 100,
            })
          }
          className="fixed bottom-6 right-6 z-[9999] rounded-xl bg-blue-600 px-5 py-3 text-white font-bold shadow-lg hover:bg-blue-500"
        >
          Test Celebration
        </button> */}

        <CelebrationOverlay
          celebration={celebration}
          onClose={closeCelebration}
        />
      </>
    </div>
  );
}
