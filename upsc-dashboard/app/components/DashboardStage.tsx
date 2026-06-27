import type { ComponentProps } from "react";
import Dashboard from "@/features/dashboard/Dashboard";
import { MotionPage } from "@/components/motion/MotionWrappers";

type DashboardStageProps = ComponentProps<typeof Dashboard>;

export function DashboardStage(props: DashboardStageProps) {
  return (
    <main className="page-stage">
      <MotionPage>
        <Dashboard {...props} />
      </MotionPage>
    </main>
  );
}
