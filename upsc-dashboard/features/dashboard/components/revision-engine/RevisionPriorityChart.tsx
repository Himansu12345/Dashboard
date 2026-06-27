import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RevisionPriority } from "@/types/revision";
import { PRIORITY_COLOR_MAP } from "./revisionEngineUtils";

interface RevisionPriorityChartProps {
  data: Array<{ name: string; value: number }>;
}

export default function RevisionPriorityChart({
  data,
}: RevisionPriorityChartProps) {
  return (
    <div className="revision-chart-shell">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 6, left: -14, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,205,255,0.09)" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#9ac7ef" />
          <YAxis tickLine={false} axisLine={false} stroke="#9ac7ef" allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: "rgba(7, 14, 29, 0.96)",
              border: "1px solid rgba(110, 195, 255, 0.24)",
              borderRadius: "14px",
              color: "#eaf7ff",
            }}
          />
          <Bar dataKey="value" radius={[10, 10, 4, 4]}>
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={PRIORITY_COLOR_MAP[entry.name as RevisionPriority]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
