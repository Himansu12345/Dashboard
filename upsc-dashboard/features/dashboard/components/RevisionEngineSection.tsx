"use client";

import { useMemo } from "react";
import { MotionCard, MotionList, MotionListItem } from "@/components/motion/MotionWrappers";
import type {
  RevisionDashboardPayload,
  RevisionReviewOutcome,
} from "@/types/revision";
import MomentumBanner from "@/features/dashboard/components/revision-engine/MomentumBanner";
import RevisionOverdueBanner from "@/features/dashboard/components/revision-engine/RevisionOverdueBanner";
import RevisionPriorityChart from "@/features/dashboard/components/revision-engine/RevisionPriorityChart";
import RevisionTopicCard from "@/features/dashboard/components/revision-engine/RevisionTopicCard";
import SummaryCard from "@/features/dashboard/components/revision-engine/SummaryCard";
import TopicMiniList from "@/features/dashboard/components/revision-engine/TopicMiniList";

interface RevisionEngineSectionProps {
  revisionDashboard: RevisionDashboardPayload | null;
  isLoading: boolean;
  isRefreshing: boolean;
  reviewingTopicId?: string | null;
  onReviewTopic: (payload: {
    id: string;
    outcome: RevisionReviewOutcome;
  }) => Promise<void>;
}

export default function RevisionEngineSection({
  revisionDashboard,
  isLoading,
  isRefreshing,
  reviewingTopicId = null,
  onReviewTopic,
}: RevisionEngineSectionProps) {
  const priorityChartData = useMemo(
    () =>
      revisionDashboard
        ? [
            {
              name: "Critical",
              value: revisionDashboard.summary.priorityCounts.Critical,
            },
            { name: "High", value: revisionDashboard.summary.priorityCounts.High },
            { name: "Medium", value: revisionDashboard.summary.priorityCounts.Medium },
            { name: "Stable", value: revisionDashboard.summary.priorityCounts.Stable },
          ]
        : [],
    [revisionDashboard],
  );

  const summaryCards = useMemo(
    () =>
      revisionDashboard
        ? [
            {
              label: "Revise Today",
              value: revisionDashboard.summary.dueTodayCount,
              tone: "critical",
            },
            {
              label: "Overdue Topics",
              value: revisionDashboard.summary.overdueCount,
              tone: "high",
            },
            {
              label: "Topics Fading",
              value: revisionDashboard.summary.fadingCount,
              tone: "medium",
            },
            {
              label: "Average Retention",
              value: revisionDashboard.summary.averageRetentionScore,
              tone: "stable",
            },
          ]
        : [],
    [revisionDashboard],
  );

  return (
    <section className="revision-engine-shell">
      <div className="table-header-row revision-engine-header">
        <div className="table-heading-group">
          <h3 className="section-title">Intelligent Revision Engine</h3>
          <p className="section-note">
            Premium spaced-repetition queue that schedules revision pressure by decay, mistakes,
            and review momentum.
          </p>
        </div>
        <div className="table-header-actions">
          <span className="table-summary-pill">
            {isLoading
              ? "Loading revision graph..."
              : `${revisionDashboard?.summary.totalTrackedTopics || 0} tracked topics`}
          </span>
          {isRefreshing ? <span className="hero-chip is-live">Refreshing queue</span> : null}
        </div>
      </div>

      {isLoading || !revisionDashboard ? (
        <div className="revision-empty-state glass-panel">
          <p className="empty-state-copy">
            Preparing your AI-powered revision operating system...
          </p>
        </div>
      ) : (
        <>
          <MotionList className="revision-summary-grid">
            {summaryCards.map((card) => (
              <SummaryCard
                key={card.label}
                label={card.label}
                value={card.value}
                tone={card.tone}
                dashboard={revisionDashboard}
              />
            ))}
          </MotionList>

          <div className="revision-main-grid">
            <MotionCard className="revision-panel revision-queue-panel">
              <MomentumBanner dashboard={revisionDashboard} />

              <div className="revision-panel-head revision-queue-head">
                <div>
                  <p className="revision-panel-kicker">Today&apos;s Revision Queue</p>
                  <h4 className="revision-panel-title revision-hero-title">
                    What to revise next
                  </h4>
                  <p className="revision-panel-subcopy">
                    Focus here first. This queue combines retention decay, repeated mistakes,
                    overdue pressure, and review momentum.
                  </p>
                </div>
              </div>
              {revisionDashboard.queueTopics.length === 0 ? (
                <p className="review-popup-empty">No topics need attention right now.</p>
              ) : (
                <MotionList className="revision-topic-list">
                  {revisionDashboard.queueTopics.map((topic) => (
                    <MotionListItem key={topic.id}>
                      <RevisionTopicCard
                        topic={topic}
                        isReviewing={reviewingTopicId === topic.id}
                        onReviewTopic={onReviewTopic}
                      />
                    </MotionListItem>
                  ))}
                </MotionList>
              )}
            </MotionCard>

            <MotionCard className="revision-side-panel">
              <div className="revision-panel-head">
                <div>
                  <p className="revision-panel-kicker">Priority Map</p>
                  <h4 className="revision-panel-title">Revision urgency</h4>
                  <p className="revision-panel-subcopy">
                    Supporting intelligence for decay, backlog, and strengthening signals.
                  </p>
                </div>
              </div>

              <div className="revision-chart-shell">
                <RevisionPriorityChart data={priorityChartData} />
              </div>

              <div className="revision-support-grid">
                <section className="revision-support-card">
                  <p className="revision-panel-kicker">Topics Fading From Memory</p>
                  <TopicMiniList items={revisionDashboard.fadingTopics} mode="fading" />
                </section>

                <section className="revision-support-card">
                  <p className="revision-panel-kicker">Recently Strengthened Topics</p>
                  <TopicMiniList
                    items={revisionDashboard.recentlyStrengthenedTopics}
                    mode="strengthened"
                  />
                </section>
              </div>

              <RevisionOverdueBanner overdueTopics={revisionDashboard.overdueTopics} />
            </MotionCard>
          </div>
        </>
      )}
    </section>
  );
}
