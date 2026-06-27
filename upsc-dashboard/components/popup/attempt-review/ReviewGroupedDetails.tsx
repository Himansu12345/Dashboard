import ReviewQuestionCard from "@/components/popup/attempt-review/ReviewQuestionCard";
import type { PracticeQuestionDetail } from "@/types/records";
import type { ReviewGroupedDate } from "./reviewPopupTypes";

interface ReviewGroupedDetailsProps {
  groupedDetails: ReviewGroupedDate[];
  deletingAttemptIdSet: Set<string>;
  onDeleteGroupedDate: (dateLabel: string, attemptIds: string[]) => Promise<void>;
  onDeleteGroupedAttempt: (attemptId: string) => Promise<void>;
  onOpenNote: (detail: PracticeQuestionDetail) => void;
  onOpenWhy: (detail: PracticeQuestionDetail) => void;
}

export default function ReviewGroupedDetails({
  groupedDetails,
  deletingAttemptIdSet,
  onDeleteGroupedDate,
  onDeleteGroupedAttempt,
  onOpenNote,
  onOpenWhy,
}: ReviewGroupedDetailsProps) {
  return (
    <div className="review-group-list">
      {groupedDetails.map((group) => (
        <section key={group.dateKey} className="ledger-date-group">
          <div className="ledger-date-header">
            <div className="ledger-date-title-wrap">
              <p className="ledger-date-title">{group.dateLabel}</p>
              <div className="date-popup-badge-row">
                <span className="date-popup-badge is-accuracy">
                  Attempts: {group.attempts.length}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="delete-btn ripple-btn"
              onClick={() =>
                void onDeleteGroupedDate(
                  group.dateLabel,
                  group.attempts.map((attempt) => attempt.recordId),
                )
              }
              disabled={
                group.attempts.length > 0 &&
                group.attempts.every((attempt) => deletingAttemptIdSet.has(attempt.recordId))
              }
            >
              {group.attempts.length > 0 &&
              group.attempts.every((attempt) => deletingAttemptIdSet.has(attempt.recordId))
                ? "Deleting..."
                : "Delete Date"}
            </button>
          </div>

          <div className="ledger-attempt-list">
            {group.attempts.map((attempt) => (
              <section
                key={`${group.dateKey}-${attempt.attemptNumber}`}
                className="ledger-attempt-card"
              >
                <div className="ledger-attempt-head">
                  <div>
                    <p className="ledger-attempt-title">Attempt {attempt.attemptNumber}</p>
                    <p className="ledger-attempt-subtitle">
                      {attempt.details.length} wrong/skipped questions
                    </p>
                  </div>
                  <div className="table-action-row">
                    <button
                      type="button"
                      className="delete-btn ripple-btn"
                      onClick={() => void onDeleteGroupedAttempt(attempt.recordId)}
                      disabled={deletingAttemptIdSet.has(attempt.recordId)}
                    >
                      {deletingAttemptIdSet.has(attempt.recordId)
                        ? "Deleting..."
                        : "Delete Attempt"}
                    </button>
                  </div>
                </div>

                <div className="review-popup-list">
                  {attempt.details.map((detail, index) => (
                    <ReviewQuestionCard
                      key={`${group.dateKey}-${attempt.attemptNumber}-${detail.question}-${index}`}
                      detail={detail}
                      index={index}
                      onOpenNote={onOpenNote}
                      onOpenWhy={onOpenWhy}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
