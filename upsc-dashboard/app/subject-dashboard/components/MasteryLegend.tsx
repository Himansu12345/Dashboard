import { memo } from "react";
import { PRIORITY_LABELS } from "../priority";

const LEGEND_ITEMS = [
  ["high", PRIORITY_LABELS.high],
  ["mid", PRIORITY_LABELS.mid],
  ["low", PRIORITY_LABELS.low],
] as const;

export const MasteryLegend = memo(function MasteryLegend() {
  return (
    <div className="legend hide-in-zen">
      {LEGEND_ITEMS.map(([className, label]) => (
        <span key={className} className={`pbadge ${className}`}>
          {label}
        </span>
      ))}
    </div>
  );
});
