import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  MotionModalBackdrop,
  MotionModalPanel,
} from "@/components/motion/MotionWrappers";
import RevisionEngineSection from "@/features/dashboard/components/RevisionEngineSection";
import useBodyScrollLock from "@/hooks/useBodyScrollLock";
import useFocusTrap from "@/hooks/useFocusTrap";
import type {
  RevisionDashboardPayload,
  RevisionReviewOutcome,
} from "@/types/revision";

interface RevisionEnginePopupProps {
  isOpen: boolean;
  revisionDashboard: RevisionDashboardPayload | null;
  isLoading: boolean;
  isRefreshing: boolean;
  reviewingTopicId?: string | null;
  onReviewTopic: (payload: {
    id: string;
    outcome: RevisionReviewOutcome;
  }) => Promise<void>;
  onClose: () => void;
}

export default function RevisionEnginePopup({
  isOpen,
  revisionDashboard,
  isLoading,
  isRefreshing,
  reviewingTopicId = null,
  onReviewTopic,
  onClose,
}: RevisionEnginePopupProps) {
  const panelRef = useRef<HTMLElement | null>(null);

  useBodyScrollLock(isOpen);
  useFocusTrap({
    isActive: isOpen,
    containerRef: panelRef,
    initialFocusSelector: "button",
  });

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <MotionModalBackdrop
      className="subject-popup-backdrop review-popup-backdrop"
      onClick={onClose}
    >
      <MotionModalPanel
        ref={panelRef}
        className="subject-popup-panel glass-panel revision-popup-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Intelligent revision engine"
        tabIndex={-1}
      >
        <div className="revision-popup-actions">
          <button
            type="button"
            className="subject-popup-close ripple-btn"
            onClick={onClose}
            aria-label="Close revision engine popup"
          >
            X
          </button>
        </div>

        <RevisionEngineSection
          revisionDashboard={revisionDashboard}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          reviewingTopicId={reviewingTopicId}
          onReviewTopic={onReviewTopic}
        />
      </MotionModalPanel>
    </MotionModalBackdrop>,
    document.body,
  );
}
