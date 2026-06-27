import type { CSSProperties, ReactNode } from "react";
import FullscreenWrapper from "@/components/charts/FullscreenWrapper";
import { MotionCard } from "@/components/motion/MotionWrappers";

interface ChartCardProps {
  title: string;
  note?: string;
  delay?: number;
  isEmpty?: boolean;
  emptyText?: string;
  children: ReactNode;
}

export default function ChartCard({
  title,
  note,
  delay = 0,
  isEmpty = false,
  emptyText = "No data available for the selected filters.",
  children,
}: ChartCardProps) {
  const animatedStyle = { "--delay": delay } as CSSProperties;

  return (
    <MotionCard className="chart-card" style={animatedStyle} disableReveal>
      <div className="chart-card-head">
        <div>
          <p className="chart-card-kicker">Insight Module</p>
          <h3 className="section-title">{title}</h3>
          {note ? <p className="section-note">{note}</p> : null}
        </div>
      </div>

      {isEmpty ? (
        <div className="chart-empty-state">
          <p>{emptyText}</p>
        </div>
      ) : (
        <FullscreenWrapper title={title} subtitle={note}>
          {children}
        </FullscreenWrapper>
      )}
    </MotionCard>
  );
}
