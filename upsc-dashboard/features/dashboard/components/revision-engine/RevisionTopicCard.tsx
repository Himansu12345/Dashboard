import { MotionButton, MotionCard } from "@/components/motion/MotionWrappers";
import type { RevisionReviewOutcome, RevisionTopic } from "@/types/revision";
import {
  describeDueState,
  formatDateTime,
  getRetentionState,
  PRIORITY_COLOR_MAP,
  renderRetentionTrack,
} from "./revisionEngineUtils";

interface RevisionTopicCardProps {
  topic: RevisionTopic;
  isReviewing: boolean;
  onReviewTopic: (payload: {
    id: string;
    outcome: RevisionReviewOutcome;
  }) => Promise<void>;
}

export default function RevisionTopicCard({
  topic,
  isReviewing,
  onReviewTopic,
}: RevisionTopicCardProps) {
  const priorityColor = PRIORITY_COLOR_MAP[topic.priority];
  const retentionState = getRetentionState(topic.retentionScore);

  return (
    <MotionCard
      className={`revision-topic-card priority-${topic.priority.toLowerCase()}`}
      disableReveal
    >
      <div className="revision-topic-glow" aria-hidden="true" />
      <div className="revision-topic-head">
        <div className="revision-topic-copy">
          <p className="revision-topic-kicker">{topic.subject}</p>
          <h4 className="revision-topic-title">{topic.topic}</h4>
          <p className="revision-topic-meta">
            {describeDueState(topic)} | Next review {formatDateTime(topic.nextReviewDate)}
          </p>
        </div>
        <div className="revision-topic-badges">
          <span
            className="revision-priority-badge"
            style={{ borderColor: `${priorityColor}80`, color: priorityColor }}
          >
            {topic.priority}
          </span>
          <span className={`revision-memory-badge tone-${retentionState.tone}`}>
            {retentionState.label}
          </span>
        </div>
      </div>

      <div className="revision-stat-grid">
        <div className="revision-stat-pill">
          <span className="revision-stat-label">Accuracy</span>
          <strong>{topic.accuracy}%</strong>
        </div>
        <div className="revision-stat-pill">
          <span className="revision-stat-label">Retention</span>
          <strong>{topic.retentionScore}%</strong>
        </div>
        <div className="revision-stat-pill">
          <span className="revision-stat-label">Repeated Mistakes</span>
          <strong>{topic.repeatedMistakeCount}</strong>
        </div>
        <div className="revision-stat-pill">
          <span className="revision-stat-label">SRS Stage</span>
          <strong>{topic.revisionStrength + 1}</strong>
        </div>
      </div>

      <div className="revision-retention-block">
        <div className="revision-retention-head">
          <div>
            <span>Memory health</span>
            <p className="revision-retention-note">{retentionState.note}</p>
          </div>
          <strong>{topic.retentionScore}%</strong>
        </div>
        {renderRetentionTrack(topic.retentionScore, priorityColor, retentionState.tone)}
      </div>

      <div className="revision-topic-footer">
        <div className="revision-topic-footnote">
          <span>{topic.attemptsCount} attempts tracked</span>
          <span>{topic.incorrectCount + topic.skippedCount} fragile responses</span>
        </div>
        <div className="table-action-row revision-topic-actions">
          <MotionButton
            type="button"
            className="delete-btn ripple-btn revision-danger-btn"
            onClick={() => void onReviewTopic({ id: topic.id, outcome: "wrong" })}
            disabled={isReviewing}
          >
            {isReviewing ? "Updating..." : "Still Wrong"}
          </MotionButton>
          <MotionButton
            type="button"
            className="review-btn ripple-btn revision-success-btn"
            onClick={() => void onReviewTopic({ id: topic.id, outcome: "correct" })}
            disabled={isReviewing}
          >
            {isReviewing ? "Updating..." : "Reviewed Correct"}
          </MotionButton>
        </div>
      </div>
    </MotionCard>
  );
}
