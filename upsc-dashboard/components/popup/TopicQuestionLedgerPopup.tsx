"use client";

import { useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import useBodyScrollLock from "@/hooks/useBodyScrollLock";
import useFocusTrap from "@/hooks/useFocusTrap";
import {
  MotionButton,
  MotionTableBody,
  MotionTableRow,
} from "@/components/motion/MotionWrappers";
import type { LedgerSummaryRow } from "@/features/dashboard/recordLedgerUtils";

interface TopicQuestionLedgerPopupProps {
  subject: string | null;
  topic: string | null;
  rows: LedgerSummaryRow[];
  onClose: () => void;
  onOpenTopicReview: (topic: string) => void;
}

function formatAccuracy(value: number): string {
  return `${value}%`;
}

export default function TopicQuestionLedgerPopup({
  subject,
  topic,
  rows,
  onClose,
  onOpenTopicReview,
}: TopicQuestionLedgerPopupProps) {
  const isOpen = Boolean(subject && topic);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const safeSubject = subject || "";
  const safeTopic = topic || "";
  const safeRows = useMemo(() => rows, [rows]);

  useBodyScrollLock(isOpen);
  useFocusTrap({
    isActive: isOpen,
    containerRef: panelRef,
    initialFocusSelector: "button",
  });

  if (!isOpen) return null;

  return createPortal(
    <div className="subject-popup-backdrop topic-pie-popup-backdrop" onClick={onClose}>
      <div
        ref={panelRef}
        className="subject-popup-panel glass-panel fade-slide-in topic-pie-popup-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${safeSubject} ${safeTopic} topics ledger`}
        tabIndex={-1}
      >
        <header className="subject-popup-header">
          <div className="subject-popup-title-wrap">
            <p className="subject-popup-kicker">Topics Ledger</p>
            <h3 className="subject-popup-title">{safeTopic}</h3>
            <p className="subject-popup-subtitle">
              Attempted topics for this chapter with the same performance summary layout.
            </p>
          </div>
          <button
            type="button"
            className="subject-popup-close ripple-btn"
            onClick={onClose}
            aria-label="Close topics ledger popup"
          >
            X
          </button>
        </header>

        {safeRows.length === 0 ? (
          <p className="review-popup-empty">No attempted topics are available for this chapter.</p>
        ) : (
          <div className="table-wrap">
            <table className="record-table">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Test</th>
                  <th>Questions</th>
                  <th>Correct</th>
                  <th>Incorrect</th>
                  <th>Accuracy</th>
                  <th>Difficulty</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <MotionTableBody>
                {safeRows.map((row) => (
                  <MotionTableRow key={row.key}>
                    <td>{row.label}</td>
                    <td>{row.testCount}</td>
                    <td>{row.totalQuestions}</td>
                    <td>{row.correct}</td>
                    <td>{row.incorrect}</td>
                    <td>{formatAccuracy(row.accuracy)}</td>
                    <td>{row.difficultySummary}</td>
                    <td>
                      <div className="table-action-row">
                        <MotionButton
                          type="button"
                          className="review-btn ripple-btn"
                          onClick={() => onOpenTopicReview(row.label)}
                          title="View incorrect and skipped questions for this topic"
                          aria-label={`View ${safeSubject} ${safeTopic} ${row.label} topic review`}
                        >
                          View
                        </MotionButton>
                      </div>
                    </td>
                  </MotionTableRow>
                ))}
              </MotionTableBody>
            </table>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
