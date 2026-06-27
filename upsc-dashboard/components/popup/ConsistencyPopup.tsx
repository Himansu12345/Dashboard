import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  MotionModalBackdrop,
  MotionModalPanel,
} from "@/components/motion/MotionWrappers";
import DailyTestStreakScreen from "@/features/consistency/components/DailyTestStreakScreen";
import useBodyScrollLock from "@/hooks/useBodyScrollLock";
import useFocusTrap from "@/hooks/useFocusTrap";
import type { ConsistencyDashboardPayload, ConsistencyTab } from "@/types/consistency";

interface ConsistencyPopupProps {
  isOpen: boolean;
  dashboard: ConsistencyDashboardPayload | null;
  isLoading: boolean;
  isRefreshing: boolean;
  activeTab: ConsistencyTab;
  onTabChange: (tab: ConsistencyTab) => void;
  onClose: () => void;
}

export default function ConsistencyPopup({
  isOpen,
  dashboard,
  isLoading,
  isRefreshing,
  onClose,
}: ConsistencyPopupProps) {
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
        className="subject-popup-panel glass-panel consistency-popup-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Consistency and streak system"
        tabIndex={-1}
      >
        <DailyTestStreakScreen
          dashboard={dashboard}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          onBack={onClose}
        />
      </MotionModalPanel>
    </MotionModalBackdrop>,
    document.body,
  );
}
