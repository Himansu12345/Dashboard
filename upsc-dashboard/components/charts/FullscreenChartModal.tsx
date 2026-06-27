"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  MotionModalBackdrop,
  MotionModalPanel,
} from "@/components/motion/MotionWrappers";
import useBodyScrollLock from "@/hooks/useBodyScrollLock";
import useFocusTrap from "@/hooks/useFocusTrap";

interface FullscreenChartModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}

export default function FullscreenChartModal({
  isOpen,
  title,
  subtitle,
  onClose,
  children,
}: FullscreenChartModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement | null>(null);

  useBodyScrollLock(isOpen);
  useFocusTrap({
    isActive: isOpen,
    containerRef: panelRef,
    initialFocusSelector: "button, [tabindex]:not([tabindex='-1'])",
  });

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    let timeoutId: number | undefined;
    const frameId = window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
      timeoutId = window.setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 180);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <MotionModalBackdrop
      className="chart-fullscreen-backdrop"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        onClose();
      }}
    >
      <MotionModalPanel
        ref={panelRef}
        className="chart-fullscreen-panel glass-panel"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="chart-fullscreen-header">
          <div className="subject-popup-title-wrap">
            <p className="subject-popup-kicker">Fullscreen View</p>
            <h3 id={titleId} className="subject-popup-title">
              {title}
            </h3>
            {subtitle ? <p className="subject-popup-subtitle">{subtitle}</p> : null}
          </div>

          <button
            type="button"
            className="subject-popup-close chart-fullscreen-close ripple-btn"
            onClick={onClose}
            aria-label="Close fullscreen chart popup"
            title="Close"
          >
            X
          </button>
        </header>

        <div className="chart-fullscreen-body">{children}</div>
      </MotionModalPanel>
    </MotionModalBackdrop>,
    document.body,
  );
}
