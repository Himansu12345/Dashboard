import type { ReactNode } from "react";
import { MotionList } from "@/components/motion/MotionWrappers";

interface ChartContainerProps {
  children: ReactNode;
}

export default function ChartContainer({ children }: ChartContainerProps) {
  return (
    <MotionList className="chart-grid" viewport={{ once: true, amount: 0.08 }}>
      {children}
    </MotionList>
  );
}
