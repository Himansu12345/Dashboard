"use client";

import { useEffect, useMemo, useState } from "react";

const rawUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";
const API_URL = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl}/api`;

type MissionHistoryEntry = {
  id: string;
  missionId: string;
  type: "note" | "test";
  weekStartDate: string;
  dateKey: string;
  dayOfWeek: string;
  title: string;
  subject: string;
  chapter: string;
  mode: string;
  status: string;
  completionPercent: number;
  completedUnits: number;
  totalUnits: number;
  accuracy: number | null;
  plannedStart: string | null;
  plannedEnd: string | null;
  validationState: string;
  delayReason: string;
  firstProgressAt: number | null;
  latestProgressAt: number | null;
  startedAt: number | null;
  endedAt: number | null;
  durationMinutes: number | null;
  durationSource: "actual" | "estimated" | "planned" | "unknown";
  targetCount: number;
};

type MissionHistorySummary = {
  totalMissions: number;
  completedMissions: number;
  abandonedMissions: number;
  averageCompletion: number;
  totalDurationMinutes: number;
};

type MissionHistoryPayload = {
  entries: MissionHistoryEntry[];
  summary: MissionHistorySummary;
};

const statusLabels: Record<string, string> = {
  completed: "Completed",
  revised: "Revised",
  in_progress: "In Progress",
  not_started: "Not Started",
  failed_abandoned: "Abandoned",
};

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: number | null) {
  if (!value) return "Not captured";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

function formatMinutes(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "Unknown";
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  if (hours <= 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
}

function getDurationLabel(source: MissionHistoryEntry["durationSource"]) {
  if (source === "actual") return "Actual";
  if (source === "estimated") return "Estimated";
  if (source === "planned") return "Planned";
  return "Unknown";
}

function getStatusClass(status: string) {
  if (status === "completed" || status === "revised") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  }
  if (status === "in_progress") {
    return "border-amber-400/30 bg-amber-400/10 text-amber-200";
  }
  if (status === "failed_abandoned") {
    return "border-red-400/30 bg-red-400/10 text-red-200";
  }
  return "border-slate-400/20 bg-slate-400/10 text-slate-300";
}

export default function MissionHistoryClient() {
  const [payload, setPayload] = useState<MissionHistoryPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    let isCancelled = false;

    async function loadHistory() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`${API_URL}/planner/history?limit=800`);
        if (!response.ok) throw new Error("Mission history request failed.");
        const result = await response.json();
        if (!isCancelled) {
          setPayload(result.data);
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load mission history.",
          );
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    void loadHistory();
    return () => {
      isCancelled = true;
    };
  }, []);

  const entries = useMemo(() => payload?.entries || [], [payload?.entries]);
  const summary = payload?.summary || {
    totalMissions: 0,
    completedMissions: 0,
    abandonedMissions: 0,
    averageCompletion: 0,
    totalDurationMinutes: 0,
  };

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesQuery =
        !normalizedQuery ||
        [entry.subject, entry.chapter, entry.title, entry.dateKey]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesStatus =
        statusFilter === "all" || entry.status === statusFilter;
      const matchesType = typeFilter === "all" || entry.type === typeFilter;
      return matchesQuery && matchesStatus && matchesType;
    });
  }, [entries, query, statusFilter, typeFilter]);

  const bestDay = useMemo(() => {
    const totals = new Map<string, { completed: number; total: number }>();
    for (const entry of entries) {
      const current = totals.get(entry.dateKey) || { completed: 0, total: 0 };
      current.total += 1;
      if (entry.status === "completed" || entry.status === "revised") {
        current.completed += 1;
      }
      totals.set(entry.dateKey, current);
    }

    return Array.from(totals.entries())
      .map(([dateKey, value]) => ({
        dateKey,
        completed: value.completed,
        total: value.total,
      }))
      .sort((first, second) => second.completed - first.completed)[0];
  }, [entries]);

  return (
    <main className="min-h-screen rounded-[24px] border border-white/[0.06] bg-[#030712]/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:p-6">
      <section className="flex flex-col gap-5 border-b border-white/[0.06] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">
            Execution Archive
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
            Mission History
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-medium text-slate-400">
            Every planned mission, completion snapshot, timing window, and
            progress record from Mission Control.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-[16px] border border-white/[0.06] bg-black/35 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Missions
            </p>
            <p className="mt-1 text-2xl font-black text-white">
              {summary.totalMissions}
            </p>
          </div>
          <div className="rounded-[16px] border border-emerald-400/15 bg-emerald-400/10 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300/80">
              Done
            </p>
            <p className="mt-1 text-2xl font-black text-emerald-200">
              {summary.completedMissions}
            </p>
          </div>
          <div className="rounded-[16px] border border-cyan-400/15 bg-cyan-400/10 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-300/80">
              Avg
            </p>
            <p className="mt-1 text-2xl font-black text-cyan-100">
              {summary.averageCompletion}%
            </p>
          </div>
          <div className="rounded-[16px] border border-amber-400/15 bg-amber-400/10 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-300/80">
              Time
            </p>
            <p className="mt-1 text-2xl font-black text-amber-100">
              {formatMinutes(summary.totalDurationMinutes)}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 py-5 lg:grid-cols-[1fr_280px]">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_160px]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search subject, chapter, or date"
            className="h-11 rounded-[14px] border border-white/[0.08] bg-black/35 px-4 text-sm font-semibold text-white outline-none transition focus:border-cyan-400/50"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 rounded-[14px] border border-white/[0.08] bg-black/35 px-3 text-sm font-bold text-white outline-none transition focus:border-cyan-400/50"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="revised">Revised</option>
            <option value="in_progress">In Progress</option>
            <option value="not_started">Not Started</option>
            <option value="failed_abandoned">Abandoned</option>
          </select>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="h-11 rounded-[14px] border border-white/[0.08] bg-black/35 px-3 text-sm font-bold text-white outline-none transition focus:border-cyan-400/50"
          >
            <option value="all">All Types</option>
            <option value="note">Note</option>
            <option value="test">Test</option>
          </select>
        </div>

        <div className="rounded-[16px] border border-white/[0.06] bg-black/30 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Strongest Day
          </p>
          <p className="mt-1 text-sm font-black text-white">
            {bestDay ? formatDate(bestDay.dateKey) : "No history yet"}
          </p>
          {bestDay && (
            <p className="mt-1 text-xs font-semibold text-slate-400">
              {bestDay.completed}/{bestDay.total} missions completed
            </p>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-[20px] border border-white/[0.06] bg-black/25">
        <div className="grid grid-cols-[140px_1.4fr_110px_140px_120px] gap-4 border-b border-white/[0.06] bg-white/[0.03] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 max-xl:hidden">
          <span>Date</span>
          <span>Mission</span>
          <span>Progress</span>
          <span>Time Taken</span>
          <span>Status</span>
        </div>

        {isLoading && (
          <div className="p-8 text-sm font-bold text-slate-400">
            Loading mission history...
          </div>
        )}

        {error && !isLoading && (
          <div className="p-8 text-sm font-bold text-red-300">{error}</div>
        )}

        {!isLoading && !error && filteredEntries.length === 0 && (
          <div className="p-8 text-sm font-bold text-slate-400">
            No missions match the current filters.
          </div>
        )}

        {!isLoading &&
          !error &&
          filteredEntries.map((entry) => (
            <article
              key={entry.id}
              className="grid gap-4 border-b border-white/[0.05] px-5 py-4 last:border-b-0 xl:grid-cols-[140px_1.4fr_110px_140px_120px] xl:items-center"
            >
              <div>
                <p className="text-sm font-black text-white">
                  {formatDate(entry.dateKey)}
                </p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  {entry.dayOfWeek} {entry.plannedStart || "--:--"}-
                  {entry.plannedEnd || "--:--"}
                </p>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-cyan-200">
                    {entry.type}
                  </span>
                  <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-300">
                    {entry.mode}
                  </span>
                </div>
                <h2 className="mt-2 text-base font-black text-white">
                  {entry.subject} - {entry.chapter}
                </h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  First progress: {formatDateTime(entry.firstProgressAt)} |
                  Latest progress: {formatDateTime(entry.latestProgressAt)}
                </p>
                {entry.delayReason && (
                  <p className="mt-2 text-xs font-semibold text-amber-200/80">
                    {entry.delayReason}
                  </p>
                )}
              </div>

              <div>
                <p className="text-lg font-black text-white">
                  {entry.completionPercent}%
                </p>
                <p className="text-xs font-semibold text-slate-500">
                  {entry.completedUnits}/{entry.totalUnits}{" "}
                  {entry.type === "test" ? "questions" : "points"}
                </p>
                {entry.accuracy !== null && (
                  <p className="mt-1 text-xs font-bold text-emerald-300">
                    {entry.accuracy}% accuracy
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm font-black text-white">
                  {formatMinutes(entry.durationMinutes)}
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {getDurationLabel(entry.durationSource)}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  End: {formatDateTime(entry.endedAt)}
                </p>
              </div>

              <div>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${getStatusClass(entry.status)}`}
                >
                  {statusLabels[entry.status] || entry.status}
                </span>
              </div>
            </article>
          ))}
      </section>
    </main>
  );
}
