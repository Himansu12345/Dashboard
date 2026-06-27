import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  MotionModalBackdrop,
  MotionModalPanel,
} from "@/components/motion/MotionWrappers";
import SyllabusTrackerScreen from "@/features/syllabus/components/SyllabusTrackerScreen";
import useBodyScrollLock from "@/hooks/useBodyScrollLock";
import useFocusTrap from "@/hooks/useFocusTrap";
import type { AttemptResponse } from "@/lib/api/attempts";
import type { SyllabusDashboardPayload, SyllabusTab } from "@/types/syllabus";

interface SyllabusTreePopupProps {
  isOpen: boolean;
  dashboard: SyllabusDashboardPayload | null;
  attempts: AttemptResponse[];
  isLoading: boolean;
  isRefreshing: boolean;
  activeTab: SyllabusTab;
  onTabChange: (tab: SyllabusTab) => void;
  onClose: () => void;
}

export default function SyllabusTreePopup({
  isOpen,
  dashboard,
  attempts,
  isLoading,
  isRefreshing,
  onClose,
}: SyllabusTreePopupProps) {
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
        className="subject-popup-panel glass-panel syllabus-popup-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="UPSC syllabus progress tree"
        tabIndex={-1}
      >
        <SyllabusTrackerScreen
          dashboard={dashboard}
          attempts={attempts}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          onBack={onClose}
        />
      </MotionModalPanel>
    </MotionModalBackdrop>,
    document.body,
  );
}
