"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchConsistencyDashboard } from "@/lib/api/consistency";
import { fetchSyllabusDashboard } from "@/lib/api/syllabus";
import { fetchAttempts, type AttemptResponse } from "@/lib/api/attempts";
import ConsistencyDashboard from "@/features/consistency/ConsistencyDashboard";
import SyllabusTrackerScreen from "@/features/syllabus/components/SyllabusTrackerScreen";
import { MotionSection } from "@/components/motion/MotionWrappers";
import type { ConsistencyTab } from "@/types/consistency";

const CONSISTENCY_DASHBOARD_QUERY_KEY = ["consistency-dashboard"] as const;
const SYLLABUS_DASHBOARD_QUERY_KEY = ["syllabus-dashboard"] as const;
const ATTEMPTS_QUERY_KEY = ["attempts"] as const;

type ActiveSection = "streaks" | "syllabus";

export default function StreakClient() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<ActiveSection>("streaks");
  const [consistencyTab, setConsistencyTab] =
    useState<ConsistencyTab>("streaks");

  const consistencyDashboardQuery = useQuery({
    queryKey: CONSISTENCY_DASHBOARD_QUERY_KEY,
    queryFn: fetchConsistencyDashboard,
    staleTime: 30000,
  });

  const syllabusDashboardQuery = useQuery({
    queryKey: SYLLABUS_DASHBOARD_QUERY_KEY,
    queryFn: fetchSyllabusDashboard,
    staleTime: 30000,
  });

  const attemptsQuery = useQuery({
    queryKey: ATTEMPTS_QUERY_KEY,
    queryFn: fetchAttempts,
    staleTime: 30000,
  });

  const attempts = attemptsQuery.data ?? [];

  const handleConsistencyTabChange = (tab: ConsistencyTab) => {
    setConsistencyTab(tab);
  };

  return (
    <section className="streak-page">
      <div className="streak-page-header">
        <h1 className="page-title">Streak & Syllabus</h1>
        <p className="page-subtitle">
          Track your practice consistency and syllabus mastery in one place.
        </p>
      </div>

      <div
        className="streak-section-tabs"
        role="tablist"
        aria-label="Streak sections"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeSection === "streaks"}
          className={`streak-section-tab ripple-btn ${activeSection === "streaks" ? "is-active" : ""}`}
          onClick={() => setActiveSection("streaks")}
        >
          Streaks
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeSection === "syllabus"}
          className={`streak-section-tab ripple-btn ${activeSection === "syllabus" ? "is-active" : ""}`}
          onClick={() => setActiveSection("syllabus")}
        >
          Syllabus Tracker
        </button>
      </div>

      {activeSection === "streaks" && (
        <MotionSection delayIndex={0}>
          <ConsistencyDashboard
            dashboard={consistencyDashboardQuery.data ?? null}
            isLoading={consistencyDashboardQuery.isLoading}
            isRefreshing={
              consistencyDashboardQuery.isFetching &&
              !consistencyDashboardQuery.isLoading
            }
            activeTab={consistencyTab}
            onTabChange={handleConsistencyTabChange}
          />
        </MotionSection>
      )}

      {activeSection === "syllabus" && (
        <MotionSection delayIndex={0}>
          <SyllabusTrackerScreen
            dashboard={syllabusDashboardQuery.data ?? null}
            attempts={attempts}
            isLoading={syllabusDashboardQuery.isLoading}
            isRefreshing={
              syllabusDashboardQuery.isFetching &&
              !syllabusDashboardQuery.isLoading
            }
            onBack={() => router.push("/")}
          />
        </MotionSection>
      )}
    </section>
  );
}
