import { useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import useBodyScrollLock from "@/hooks/useBodyScrollLock";
import useFocusTrap from "@/hooks/useFocusTrap";
import type { PracticeRecord } from "@/types/records";
import { groupRecordsByDate } from "@/features/dashboard/recordLedgerUtils";

interface RecycleBinPopupProps {
  isOpen: boolean;
  records: PracticeRecord[];
  restoringAttemptIdSet: Set<string>;
  permanentlyDeletingAttemptIdSet: Set<string>;
  isLoading?: boolean;
  onClose: () => void;
  onRestoreAttempt: (id: string) => Promise<void>;
  onPermanentlyDeleteAttempt: (id: string) => Promise<void>;
}

export default function RecycleBinPopup({
  isOpen,
  records,
  restoringAttemptIdSet,
  permanentlyDeletingAttemptIdSet,
  isLoading = false,
  onClose,
  onRestoreAttempt,
  onPermanentlyDeleteAttempt,
}: RecycleBinPopupProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const safeRecords = useMemo(
    () => (Array.isArray(records) ? records : []),
    [records],
  );
  const groupedRecords = useMemo(() => groupRecordsByDate(safeRecords), [safeRecords]);

  const handleRestoreDateGroup = useCallback(
    async (dateLabel: string, attemptIds: string[]) => {
      const uniqueAttemptIds = Array.from(new Set(attemptIds.filter(Boolean)));
      if (uniqueAttemptIds.length === 0) return;

      const confirmed = window.confirm(
        `Restore all deleted attempts for ${dateLabel}?`,
      );
      if (!confirmed) return;

      for (const attemptId of uniqueAttemptIds) {
        if (!restoringAttemptIdSet.has(attemptId)) {
          await onRestoreAttempt(attemptId);
        }
      }
    },
    [onRestoreAttempt, restoringAttemptIdSet],
  );

  const handleDeleteDateGroupPermanently = useCallback(
    async (dateLabel: string, attemptIds: string[]) => {
      const uniqueAttemptIds = Array.from(new Set(attemptIds.filter(Boolean)));
      if (uniqueAttemptIds.length === 0) return;

      const confirmed = window.confirm(
        `Delete all recycle bin attempts for ${dateLabel} permanently? This cannot be undone.`,
      );
      if (!confirmed) return;

      for (const attemptId of uniqueAttemptIds) {
        if (!permanentlyDeletingAttemptIdSet.has(attemptId)) {
          await onPermanentlyDeleteAttempt(attemptId);
        }
      }
    },
    [onPermanentlyDeleteAttempt, permanentlyDeletingAttemptIdSet],
  );

  useBodyScrollLock(isOpen);
  useFocusTrap({
    isActive: isOpen,
    containerRef: panelRef,
    initialFocusSelector: "button",
  });

  if (!isOpen) return null;

  return createPortal(
    <div className="subject-popup-backdrop review-popup-backdrop" onClick={onClose}>
      <div
        ref={panelRef}
        className="subject-popup-panel glass-panel fade-slide-in review-popup-panel recycle-popup-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Recycle bin"
        tabIndex={-1}
      >
        <header className="subject-popup-header review-popup-header">
          <div className="subject-popup-title-wrap">
            <p className="subject-popup-kicker">Recycle Bin</p>
            <h3 className="subject-popup-title">Deleted Attempts And Date Groups</h3>
            <p className="subject-popup-subtitle">
              Restore or permanently delete deleted submissions.
            </p>
          </div>

          <button
            type="button"
            className="subject-popup-close ripple-btn"
            onClick={onClose}
            aria-label="Close recycle bin popup"
          >
            X
          </button>
        </header>

        {isLoading ? <p className="section-note">Loading recycle bin...</p> : null}

        {safeRecords.length === 0 ? (
          <p className="review-popup-empty">Recycle bin is empty.</p>
        ) : (
          <section className="recycle-popup-list" aria-live="polite">
            {groupedRecords.map((group) => {
              const attemptIds = group.attempts.map((attempt) => attempt.record.id);
              const isGroupRestoring =
                attemptIds.length > 0 &&
                attemptIds.every((attemptId) => restoringAttemptIdSet.has(attemptId));
              const isGroupDeleting =
                attemptIds.length > 0 &&
                attemptIds.every((attemptId) =>
                  permanentlyDeletingAttemptIdSet.has(attemptId),
                );

              return (
                <section key={group.dateKey} className="ledger-date-group">
                  <div className="ledger-date-header">
                    <div className="ledger-date-title-wrap">
                      <p className="ledger-date-title">{group.dateLabel}</p>
                      <div className="date-popup-badge-row">
                        <span className="date-popup-badge is-accuracy">
                          Attempts: {group.attemptCount}
                        </span>
                        <span className="date-popup-badge">Questions: {group.totalQuestions}</span>
                        <span className="date-popup-badge is-correct">
                          Correct: {group.totalCorrect}
                        </span>
                        <span className="date-popup-badge is-incorrect">
                          Incorrect: {group.totalIncorrect}
                        </span>
                        <span className="date-popup-badge is-skipped">
                          Skipped: {group.totalSkipped}
                        </span>
                      </div>
                    </div>

                    <div className="table-action-row">
                      <button
                        type="button"
                        className="review-btn ripple-btn"
                        onClick={() => void handleRestoreDateGroup(group.dateLabel, attemptIds)}
                        disabled={isGroupRestoring || isGroupDeleting}
                      >
                        {isGroupRestoring ? "Restoring..." : "Restore Date"}
                      </button>
                      <button
                        type="button"
                        className="delete-btn ripple-btn"
                        onClick={() =>
                          void handleDeleteDateGroupPermanently(group.dateLabel, attemptIds)
                        }
                        disabled={isGroupRestoring || isGroupDeleting}
                      >
                        {isGroupDeleting ? "Deleting..." : "Delete Date Permanently"}
                      </button>
                    </div>
                  </div>

                  <div className="ledger-attempt-list">
                    {group.attempts.map(({ attemptNumber, record }) => {
                      const isRestoring = restoringAttemptIdSet.has(record.id);
                      const isDeletingPermanently = permanentlyDeletingAttemptIdSet.has(record.id);

                      return (
                        <article
                          key={record.id}
                          className="review-question-card recycle-popup-item"
                        >
                          <div className="recycle-popup-main">
                            <p className="recycle-popup-title">
                              Attempt {attemptNumber}: {record.subject} - {record.topic}
                            </p>
                            <p className="recycle-popup-meta">
                              {record.date} | {record.difficulty} | Total {record.total} | Accuracy{" "}
                              {record.accuracy}%
                            </p>
                            <div className="date-popup-badge-row">
                              <span className="date-popup-badge is-correct">
                                Correct {record.correct}
                              </span>
                              <span className="date-popup-badge is-incorrect">
                                Incorrect {record.incorrect}
                              </span>
                              <span className="date-popup-badge is-skipped">
                                Skipped {record.skipped}
                              </span>
                            </div>
                          </div>

                          <div className="table-action-row">
                            <button
                              type="button"
                              className="review-btn ripple-btn"
                              onClick={() => void onRestoreAttempt(record.id)}
                              disabled={isRestoring || isDeletingPermanently}
                              aria-label={`Restore ${record.subject} ${record.topic} record`}
                            >
                              {isRestoring ? "Restoring..." : "Restore Attempt"}
                            </button>
                            <button
                              type="button"
                              className="delete-btn ripple-btn"
                              onClick={() => void onPermanentlyDeleteAttempt(record.id)}
                              disabled={isRestoring || isDeletingPermanently}
                              aria-label={`Delete ${record.subject} ${record.topic} record permanently`}
                            >
                              {isDeletingPermanently
                                ? "Deleting..."
                                : "Delete Permanently"}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </section>
        )}
      </div>
    </div>,
    document.body,
  );
}
