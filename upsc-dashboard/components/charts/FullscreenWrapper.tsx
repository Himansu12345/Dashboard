"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  memo,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import FullscreenChartModal from "@/components/charts/FullscreenChartModal";

interface FullscreenWrapperProps {
  title?: string;
  subtitle?: string;
  className?: string;
  buttonClassName?: string;
  children: ReactNode;
}

type ResponsiveLikeProps = {
  children?: ReactNode;
  height?: unknown;
  minHeight?: unknown;
};

interface ComponentTypeLike {
  displayName?: string;
  name?: string;
}

function parseNumericValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getFullscreenMinHeight(height: unknown, minHeight: unknown): number {
  const source = parseNumericValue(minHeight) ?? parseNumericValue(height);
  if (source === null) return 380;
  return Math.max(320, Math.round(source * 1.45));
}

function getTypeName(element: ReactElement<ResponsiveLikeProps>): string {
  const typeSource = element.type as ComponentTypeLike | string;
  if (typeof typeSource === "string") return typeSource;
  return typeSource.displayName || typeSource.name || "";
}

function upscaleResponsiveContainers(node: ReactNode): ReactNode {
  return Children.map(node, (child) => {
    if (!isValidElement<ResponsiveLikeProps>(child)) return child;

    const nextChildren =
      child.props.children !== undefined
        ? upscaleResponsiveContainers(child.props.children)
        : child.props.children;
    const typeName = getTypeName(child);

    if (typeName === "ResponsiveContainer") {
      const minHeight = getFullscreenMinHeight(child.props.height, child.props.minHeight);
      return cloneElement(child, {
        height: "90vh",
        minHeight,
        children: nextChildren,
      } as Partial<ResponsiveLikeProps>);
    }

    if (nextChildren === child.props.children) return child;
    return cloneElement(child, { children: nextChildren } as Partial<ResponsiveLikeProps>);
  });
}

const FullscreenWrapper = memo(function FullscreenWrapper({
  title = "Chart",
  subtitle,
  className = "",
  buttonClassName = "",
  children,
}: FullscreenWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const fullscreenContent = useMemo(() => upscaleResponsiveContainers(children), [children]);

  return (
    <div
      className={`chart-fullscreen-wrapper ${className}`.trim()}
      data-open={isOpen ? "true" : "false"}
    >
      <button
        type="button"
        className={`chart-fullscreen-trigger ripple-btn ${buttonClassName}`.trim()}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen(true);
        }}
        aria-label={`Open ${title} in fullscreen`}
        title="Open fullscreen"
      >
        <span className="chart-fullscreen-trigger-icon" aria-hidden="true">
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {children}

      <FullscreenChartModal
        isOpen={isOpen}
        title={title}
        subtitle={subtitle}
        onClose={() => setIsOpen(false)}
      >
        {fullscreenContent}
      </FullscreenChartModal>
    </div>
  );
});

export default FullscreenWrapper;
