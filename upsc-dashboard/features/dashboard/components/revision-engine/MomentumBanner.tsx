import { MotionCard } from "@/components/motion/MotionWrappers";
import type { RevisionDashboardPayload } from "@/types/revision";
import { AnimatedNumber } from "./revisionEngineUtils";

interface MomentumBannerProps {
  dashboard: RevisionDashboardPayload;
}

export default function MomentumBanner({ dashboard }: MomentumBannerProps) {
  const insights = [
    {
      label: "recovering",
      value: dashboard.recentlyStrengthenedTopics.length,
      note: "topics recovering",
      tone: "strengthening",
    },
    {
      label: "fading",
      value: dashboard.fadingTopics.length,
      note: "topics fading",
      tone: "warning",
    },
    {
      label: "retention",
      value: dashboard.summary.averageRetentionScore,
      note:
        dashboard.summary.averageRetentionScore >= 65
          ? "retention improving"
          : "retention needs rhythm",
      tone: dashboard.summary.averageRetentionScore >= 65 ? "stable" : "critical",
    },
  ];

  return (
    <MotionCard className="revision-momentum-banner" disableReveal>
      <div className="revision-momentum-copy">
        <p className="revision-panel-kicker">Revision Momentum</p>
        <h4 className="revision-panel-title">Memory pressure and recovery</h4>
      </div>
      <div className="revision-momentum-grid">
        {insights.map((insight) => (
          <div
            key={insight.label}
            className={`revision-momentum-pill tone-${insight.tone}`}
          >
            <strong>
              <AnimatedNumber
                value={insight.value}
                suffix={insight.label === "retention" ? "%" : ""}
              />
            </strong>
            <span>{insight.note}</span>
          </div>
        ))}
      </div>
    </MotionCard>
  );
}
