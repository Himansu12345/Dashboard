import { m } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useHydrationSafeReducedMotion } from "@/components/motion/useHydrationSafeReducedMotion";
import type {
  RevisionDashboardPayload,
  RevisionPriority,
  RevisionTopic,
} from "@/types/revision";

export const PRIORITY_COLOR_MAP: Record<RevisionPriority, string> = {
  Critical: "#ff6b7f",
  High: "#ffad66",
  Medium: "#f5d36b",
  Stable: "#63d7a3",
};

export type RetentionTone = "critical" | "warning" | "stable" | "strengthening";
export type MetricDirection = "up" | "down" | "steady";

export function formatDateTime(value: string | null): string {
  if (!value) return "Not scheduled";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not scheduled";
  return parsed.toLocaleDateString();
}

export function describeDueState(topic: RevisionTopic): string {
  if (topic.overdueDays > 0) return `${topic.overdueDays}d overdue`;
  if (!topic.nextReviewDate) return "Needs scheduling";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reviewDate = new Date(topic.nextReviewDate);
  reviewDate.setHours(0, 0, 0, 0);
  const difference = Math.round(
    (reviewDate.getTime() - today.getTime()) / 86_400_000,
  );
  if (difference <= 0) return "Due today";
  return `Due in ${difference}d`;
}

export function getRetentionState(
  score: number,
): { label: string; tone: RetentionTone; note: string } {
  if (score < 35) {
    return {
      label: "Fragile Memory",
      tone: "critical",
      note: "This topic needs quick reinforcement.",
    };
  }
  if (score < 55) {
    return {
      label: "Weak Retention",
      tone: "warning",
      note: "A short revision can prevent further decay.",
    };
  }
  if (score < 78) {
    return {
      label: "Stable Memory",
      tone: "stable",
      note: "The topic is holding, but still needs rhythm.",
    };
  }
  return {
    label: "Strengthening",
    tone: "strengthening",
    note: "Memory is consolidating well.",
  };
}

export function getMetricDirection(value: number, baseline: number): MetricDirection {
  if (value > baseline) return "up";
  if (value < baseline) return "down";
  return "steady";
}

export function buildSparklinePath(points: number[]): string {
  if (points.length === 0) return "";
  return points
    .map((point, index) => {
      const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
      const y = 100 - point;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export function buildMetricSparkline(
  value: number,
  direction: MetricDirection,
): number[] {
  const anchor = Math.max(12, Math.min(92, value));
  if (direction === "up") {
    return [anchor - 26, anchor - 16, anchor - 12, anchor - 7, anchor];
  }
  if (direction === "down") {
    return [anchor + 8, anchor + 4, anchor - 3, anchor - 12, anchor - 22];
  }
  return [anchor - 8, anchor - 6, anchor - 7, anchor - 5, anchor - 6];
}

export function getMetricMeta(
  label: string,
  dashboard: RevisionDashboardPayload,
): { direction: MetricDirection; label: string } {
  switch (label) {
    case "Revise Today": {
      const direction = getMetricDirection(
        dashboard.summary.dueTodayCount,
        Math.max(1, dashboard.summary.totalTrackedTopics * 0.2),
      );
      return {
        direction,
        label:
          direction === "up"
            ? "Queue active"
            : direction === "down"
              ? "Pressure easing"
              : "Queue steady",
      };
    }
    case "Overdue Topics": {
      const direction = getMetricDirection(
        dashboard.summary.overdueCount,
        Math.max(1, dashboard.summary.dueTodayCount * 0.5),
      );
      return {
        direction,
        label:
          direction === "up"
            ? "Needs attention"
            : direction === "down"
              ? "Recovering rhythm"
              : "Stable backlog",
      };
    }
    case "Topics Fading": {
      const direction = getMetricDirection(
        dashboard.summary.fadingCount,
        Math.max(1, dashboard.summary.totalTrackedTopics * 0.28),
      );
      return {
        direction,
        label:
          direction === "up"
            ? "More decay"
            : direction === "down"
              ? "Memory stabilizing"
              : "Decay holding",
      };
    }
    default: {
      const direction = getMetricDirection(
        dashboard.summary.averageRetentionScore,
        65,
      );
      return {
        direction,
        label:
          direction === "up"
            ? "Retention improving"
            : direction === "down"
              ? "Retention softening"
              : "Retention steady",
      };
    }
  }
}

export function renderRetentionTrack(
  score: number,
  color: string,
  tone: RetentionTone,
) {
  return (
    <div className={`revision-retention-track tone-${tone}`} aria-hidden="true">
      <m.div
        className="revision-retention-fill"
        initial={{ width: 0, opacity: 1 }}
        animate={{ width: `${Math.max(4, Math.min(100, score))}%`, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ background: color }}
      />
    </div>
  );
}

export function AnimatedNumber({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const reduceMotion = useHydrationSafeReducedMotion();
  const numericValue = Number.isFinite(value) ? value : 0;
  const [displayValue, setDisplayValue] = useState(() =>
    reduceMotion ? numericValue : 0,
  );
  const displayValueRef = useRef(displayValue);

  useEffect(() => {
    displayValueRef.current = displayValue;
  }, [displayValue]);

  useEffect(() => {
    let frameId = 0;

    if (reduceMotion) {
      frameId = window.requestAnimationFrame(() => {
        setDisplayValue(numericValue);
      });

      return () => {
        window.cancelAnimationFrame(frameId);
      };
    }

    const startedAt = performance.now();
    const fromValue = displayValueRef.current;
    const duration = 420;

    function tick(timestamp: number) {
      const progress = Math.min(1, (timestamp - startedAt) / duration);
      const eased = 1 - (1 - progress) * (1 - progress);
      const nextValue = fromValue + (numericValue - fromValue) * eased;
      setDisplayValue(nextValue);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    }

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [numericValue, reduceMotion]);

  const normalized =
    Number.isInteger(displayValue)
      ? displayValue
      : Number(displayValue).toFixed(Number.isInteger(numericValue) ? 0 : 1);

  return (
    <m.span initial={reduceMotion ? false : { opacity: 1, y: 3 }} animate={{ opacity: 1, y: 0 }}>
      {normalized}
      {suffix}
    </m.span>
  );
}
