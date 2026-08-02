import { memo } from "react";
import type { SubjectDashboardConfig } from "../types";

type DashboardHeaderProps = Pick<SubjectDashboardConfig, "title" | "subtitle">;

export const DashboardHeader = memo(function DashboardHeader({
  title,
  subtitle,
}: DashboardHeaderProps) {
  return (
    <header className="dashboard-hero">
      {/* <div className="dashboard-hero-copy">
        <p className="dashboard-eyebrow hide-in-zen">UPSC Learning Dashboard</p>
        <h2 className="mh-title">{title}</h2>
        <p className="mh-sub hide-in-zen">{subtitle}</p>
      </div> */}
    </header>
  );
});
