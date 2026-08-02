import { useEffect, useId, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import {
  MotionModalBackdrop,
  MotionModalPanel,
} from "@/components/motion/MotionWrappers";
import useBodyScrollLock from "@/hooks/useBodyScrollLock";
import useFocusTrap from "@/hooks/useFocusTrap";
import type { DateAnalyticsPopupProps } from "@/types/activityCalendar";

const NOOP = () => {};

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

export default function DateAnalyticsPopup({
  dateKey,
  plannerDay,
  onClose,
}: DateAnalyticsPopupProps) {
  const isOpen = Boolean(dateKey);
  const titleId = useId();
  const panelRef = useRef<HTMLElement | null>(null);
  const safeOnClose = typeof onClose === "function" ? onClose : NOOP;
  const plannerMissions = useMemo(
    () => plannerDay?.missions || [],
    [plannerDay?.missions],
  );

  useBodyScrollLock(isOpen);
  useFocusTrap({
    isActive: isOpen,
    containerRef: panelRef,
    initialFocusSelector: "button",
  });

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") safeOnClose();
    }

    function handlePointerDown(event: PointerEvent) {
      const panel = panelRef.current;
      const target = event.target;
      if (!panel) return;
      if (target instanceof Node && !panel.contains(target)) safeOnClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen, safeOnClose]);

  if (!isOpen) return null;

  return createPortal(
    <MotionModalBackdrop className="date-analytics-backdrop">
      <MotionModalPanel
        ref={panelRef}
        className="date-analytics-panel glass-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`Planner missions for ${dateKey}`}
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="date-analytics-header">
          <div className="date-analytics-header-main">
            <div className="date-analytics-title-wrap">
              <p className="date-analytics-kicker">Planner</p>
              <h3 id={titleId} className="date-analytics-title">
                {dateKey}
              </h3>
              <p className="date-analytics-subtitle">
                {plannerDay?.completedMissions || 0}/
                {plannerDay?.totalMissions || 0} missions complete,{" "}
                {plannerDay?.remainingMissions || 0} left
              </p>
            </div>

            <button
              type="button"
              className="date-analytics-close ripple-btn"
              onClick={safeOnClose}
              aria-label="Close planner popup"
              title="Close"
            >
              X
            </button>
          </div>
        </header>

        <div className="date-analytics-content">
          {plannerMissions.length > 0 ? (
            <div className="date-planner-list clean">
              {plannerMissions.map((mission) => (
                <article
                  key={`${mission.type}-${mission.id}`}
                  className="date-planner-card"
                >
                  <div className="date-planner-card-head">
                    <div>
                      <p className="date-planner-meta">
                        {mission.type.toUpperCase()}
                        {mission.mode ? ` / ${mission.mode.toUpperCase()}` : ""}
                        {mission.plannedStart && mission.plannedEnd
                          ? ` / ${mission.plannedStart}-${mission.plannedEnd}`
                          : ""}
                      </p>
                      <h4 className="date-planner-mission-title">
                        {mission.title}
                      </h4>
                      <p className="date-planner-subtitle">
                        {mission.subject}
                      </p>
                    </div>
                    <span className={`date-planner-status status-${mission.status}`}>
                      {formatStatus(mission.status)}
                    </span>
                  </div>

                  <div className="date-planner-progress">
                    <span>
                      {mission.completedCount}/{mission.totalCount || 1} done
                    </span>
                    <span>{mission.remainingCount} left</span>
                  </div>

                  {mission.details.length > 0 ? (
                    <ul className="date-planner-targets">
                      {mission.details.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <p className="date-analytics-empty-note">
              No planner missions are set for this date.
            </p>
          )}
        </div>
      </MotionModalPanel>
    </MotionModalBackdrop>,
    document.body,
  );
}
