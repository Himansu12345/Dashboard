"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buildApiUrl } from "@/lib/api/client";

type Subject = {
  label: string;
  href?: string;
};

type SubjectSectionKey = "pre" | "mains" | "preMains";

type SubjectSection = {
  key: SubjectSectionKey;
  label: string;
  subjects: Subject[];
};

const subjectSections: SubjectSection[] = [
  {
    key: "pre",
    label: "Pre",
    subjects: [
      { label: "Ancient", href: "/ancient-history" },
      { label: "Medival" },
      { label: "Sc&tech", href: "/sc-tech" },
      { label: "Environment" },
    ],
  },
  {
    key: "mains",
    label: "Mains",
    subjects: [
      { label: "Society", href: "/society" },
      { label: "World History", href: "/world-history" },
      { label: "Social Justice", href: "/social-justice" },
      { label: "Governance", href: "/governance" },
      { label: "IR", href: "/international-relations" },
      { label: "Internal Security", href: "/internal-security" },
      { label: "Disaster Mgmt", href: "/disaster-management" },
    ],
  },
  {
    key: "preMains",
    label: "Pre+Mains",
    subjects: [
      { label: "Polity", href: "/polity" },
      { label: "Geography", href: "/geography" },
      { label: "Economics", href: "/economics" },
      { label: "Modern History", href: "/modern-history" },
      { label: "Art&Culture", href: "/art-culture" },
      { label: "Agriculture", href: "/agriculture" },
    ],
  },
];

const allSubjects = subjectSections.flatMap((section) => section.subjects);
const PLANNER_AUTO_MODE_KEY = "planner-auto-mode-enabled";
const PLANNER_AUTO_LAUNCHED_KEY = "planner-auto-launched-missions";
const PLANNER_NOTE_SESSION_KEY = "planner-note-mission-session";
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

const getSectionForPath = (pathname: string): SubjectSectionKey =>
  subjectSections.find((section) =>
    section.subjects.some((subject) => subject.href === pathname),
  )?.key ?? "pre";

const getSubjectsForSection = (sectionKey: SubjectSectionKey) =>
  subjectSections.find((section) => section.key === sectionKey)?.subjects ??
  subjectSections[0].subjects;

function getMondayDateKey() {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().split("T")[0];
}

function getTodayDateKey() {
  return new Date().toISOString().split("T")[0];
}

function parseTimeToMinutes(value?: string | null) {
  if (!value || value === "00:00") return null;
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  return hours * 60 + minutes;
}

function readLaunchedMissionKeys() {
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(PLANNER_AUTO_LAUNCHED_KEY) || "[]",
    );
    return new Set(Array.isArray(parsed) ? parsed.filter(Boolean) : []);
  } catch {
    return new Set<string>();
  }
}

function writeLaunchedMissionKeys(keys: Set<string>) {
  window.localStorage.setItem(
    PLANNER_AUTO_LAUNCHED_KEY,
    JSON.stringify(Array.from(keys).slice(-100)),
  );
}

function isMissionClosed(mission: any) {
  const status = mission?.progress?.status || "not_started";
  return (
    status === "completed" ||
    status === "revised" ||
    status === "failed_abandoned"
  );
}

export default function Navbar() {
  const pathname = usePathname();

  const [isSubjectsOpen, setIsSubjectsOpen] = useState(false);
  const [selectedSection, setSelectedSection] =
    useState<SubjectSectionKey>("pre");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const visibleSubjects = getSubjectsForSection(selectedSection);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsSubjectsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setSelectedSection(getSectionForPath(pathname));
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let isCancelled = false;

    const checkAutoPlanner = async () => {
      if (window.localStorage.getItem(PLANNER_AUTO_MODE_KEY) !== "1") return;
      if (window.location.search.includes("plannerMission=1")) return;

      try {
        const weekStart = getMondayDateKey();
        const response = await fetch(buildApiUrl(`/planner/${weekStart}`));
        if (!response.ok || isCancelled) return;

        const payload = await response.json();
        const plan = payload?.data;
        if (!payload?.exists || plan?.status !== "Committed") return;

        const today = getTodayDateKey();
        const dayPlan = Array.isArray(plan.days)
          ? plan.days.find((day: any) => day.dateKey === today)
          : null;
        if (!dayPlan) return;

        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const launchedKeys = readLaunchedMissionKeys();

        const dueMission = (dayPlan.noteMissions || []).find((mission: any) => {
          if (!mission?.id || !mission?.subject) return false;
          if (!SUBJECT_ROUTE_REGISTRY[mission.subject]) return false;
          if (isMissionClosed(mission)) return false;
          const plannedStart = parseTimeToMinutes(
            mission.timeValidation?.plannedStart,
          );
          if (plannedStart === null) return false;
          const launchKey = `${today}:${mission.id}`;
          if (launchedKeys.has(launchKey)) return false;
          return nowMinutes >= plannedStart && nowMinutes <= plannedStart + 1;
        });

        if (!dueMission || isCancelled) return;

        const launchKey = `${today}:${dueMission.id}`;
        const startedAt = new Date().toISOString();
        const nextPlan = {
          ...plan,
          days: plan.days.map((day: any) => {
            if (day.dateKey !== today) return day;

            return {
              ...day,
              noteMissions: (day.noteMissions || []).map((mission: any) =>
                mission.id === dueMission.id
                  ? {
                      ...mission,
                      timeValidation: {
                        ...mission.timeValidation,
                        actualStart: startedAt,
                        validationState: "on_time",
                        delayReason: "Auto mode started on time",
                      },
                    }
                  : mission,
              ),
            };
          }),
        };

        await fetch(buildApiUrl("/planner"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nextPlan),
        });

        launchedKeys.add(launchKey);
        writeLaunchedMissionKeys(launchedKeys);

        const noteMissions = Array.isArray(dayPlan.noteMissions)
          ? dayPlan.noteMissions
          : [];
        const startIndex = Math.max(
          0,
          noteMissions.findIndex(
            (mission: any) => mission.id === dueMission.id,
          ),
        );
        const orderedMissions = [
          ...noteMissions.slice(startIndex),
          ...noteMissions.slice(0, startIndex),
        ].map((mission: any) => ({
          id: mission.id,
          subject: mission.subject,
          chapterUid: mission.chapterUid,
          chapterLabel: mission.chapterLabel,
          plannedStart: mission.timeValidation?.plannedStart || null,
          plannedEnd: mission.timeValidation?.plannedEnd || null,
          targets: (mission.progress?.targets || mission.targets || []).map(
            (target: any) => ({
              uid: target.uid,
              label: target.label,
              topicUid: target.topicUid || null,
              leafUids: Array.isArray(target.leafUids) ? target.leafUids : [],
            }),
          ),
          progressStatus: mission.progress?.status || "not_started",
        }));

        window.sessionStorage.setItem(
          PLANNER_NOTE_SESSION_KEY,
          JSON.stringify({
            dayKey: dayPlan.dateKey,
            dayOfWeek: dayPlan.dayOfWeek,
            startedAt: Date.now(),
            activeMissionId: dueMission.id,
            returnTo: "/planner",
            graceMinutes: PLANNER_GRACE_MINUTES,
            autoStarted: true,
            missions: orderedMissions,
          }),
        );

        window.location.href = `${SUBJECT_ROUTE_REGISTRY[dueMission.subject]}?plannerMission=1&autoStart=1`;
      } catch {
        /* Auto mode should never interrupt normal navigation on fetch errors. */
      }
    };

    void checkAutoPlanner();
    const intervalId = window.setInterval(checkAutoPlanner, 15000);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <header className="app-nav glass-panel">
      {/* <div className="app-title-wrap">
        <p className="app-eyebrow">Adaptive Practice Intelligence</p>
        <h1 className="app-title">UPSC Dashboard</h1>
      </div> */}

      <nav className="app-nav-links" aria-label="Primary">
        <Link
          href="/"
          className={`nav-pill ripple-btn ${pathname === "/" ? "is-active" : ""}`}
        >
          Dashboard
        </Link>
        <Link
          href="/accuracy"
          className={`nav-pill ripple-btn ${pathname === "/accuracy" ? "is-active" : ""}`}
        >
          Accuracy
        </Link>
        <Link
          href="/table"
          className={`nav-pill ripple-btn ${pathname === "/table" ? "is-active" : ""}`}
        >
          Table
        </Link>
        <Link
          href="/planner"
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-slate-400 hover:text-white hover:bg-white/[0.04] group"
        >
          {/* Tactical Target Icon */}
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/[0.02] border border-white/[0.05] group-hover:border-blue-500/50 group-hover:bg-blue-500/10 transition-colors">
            <svg
              className="w-4 h-4 group-hover:text-blue-400 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <span className="font-semibold text-sm tracking-wide">
            Mission Control
          </span>
        </Link>
        <Link
          href="/mission-history"
          className={`nav-pill ripple-btn ${pathname === "/mission-history" ? "is-active" : ""}`}
        >
          Mission History
        </Link>
        <Link
          href="/mcq-quiz"
          className={`nav-pill ripple-btn ${pathname === "/mcq-quiz" ? "is-active" : ""}`}
        >
          MCQ Quiz
        </Link>
        <Link
          href="/report"
          className={`nav-pill ripple-btn ${pathname === "/report" ? "is-active" : ""}`}
        >
          Report
        </Link>
        {/* <Link
          href="/streak"
          className={`nav-pill ripple-btn ${pathname === "/streak" ? "is-active" : ""}`}
        >
          Streak
        </Link> */}

        <div className="relative flex flex-1 flex-col" ref={dropdownRef}>
          <button
            type="button"
            className={`nav-pill ripple-btn w-full ${isSubjectsOpen || allSubjects.some((s) => s.href === pathname) ? "is-active" : ""}`}
            onClick={() => setIsSubjectsOpen(!isSubjectsOpen)}
          >
            Subjects
          </button>

          {isSubjectsOpen && (
            <div className="subjects-dropdown glass-panel">
              <div
                className="subject-section-switch"
                role="tablist"
                aria-label="Subject sections"
              >
                {subjectSections.map((section) => (
                  <button
                    key={section.key}
                    type="button"
                    role="tab"
                    aria-selected={selectedSection === section.key}
                    className={`subject-section-tab ripple-btn ${selectedSection === section.key ? "is-active" : ""}`}
                    onClick={() => setSelectedSection(section.key)}
                  >
                    {section.label}
                  </button>
                ))}
              </div>

              <div className="subject-dropdown-list">
                {visibleSubjects.map((subject) => {
                  const isActive = Boolean(
                    subject.href && pathname === subject.href,
                  );
                  if (subject.href) {
                    return (
                      <Link
                        key={subject.label}
                        href={subject.href}
                        onClick={() => setIsSubjectsOpen(false)}
                        className={`prelims-subject-pill ripple-btn ${isActive ? "is-active" : ""}`}
                      >
                        {subject.label}
                      </Link>
                    );
                  }
                  return (
                    <span
                      key={subject.label}
                      className="prelims-subject-pill is-static"
                    >
                      {subject.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* <button
          type="button"
          className={`nav-pill ripple-btn ${isConsistencyPopupOpen ? "is-active" : ""}`}
          onClick={() => dispatch(openConsistencyPopup("overview"))}
        >
          Consistency
        </button> */}
        {/* <button
          type="button"
          className={`nav-pill ripple-btn ${isNotesPopupOpen ? "is-active" : ""}`}
          onClick={() => dispatch(setNotesPopupOpen(true))}
        >
          Note
        </button> */}
      </nav>
    </header>
  );
}
