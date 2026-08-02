import type { PracticeRecord } from "@/types/records";

interface ReviewPopupStatsProps {
  record: PracticeRecord;
}

export default function ReviewPopupStats({ record }: ReviewPopupStatsProps) {
  const totalMarks = (record.correct * 2 - record.incorrect * 0.66).toFixed(2);

  return (
    <div className="mb-4 rounded-xl border border-white/10 bg-[#0C1016] px-5 py-3">
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-slate-300">
        <StatItem
          icon="📄"
          label="Questions"
          value={record.total}
          valueClass="text-white"
        />

        <Divider />

        <StatItem
          icon="✓"
          label="Correct"
          value={record.correct}
          valueClass="text-emerald-400"
        />

        <Divider />

        <StatItem
          icon="✕"
          label="Wrong"
          value={record.incorrect}
          valueClass="text-rose-400"
        />

        <Divider />

        <StatItem
          icon="⏭"
          label="Skipped"
          value={record.skipped}
          valueClass="text-amber-400"
        />

        <Divider />

        <StatItem
          icon="★"
          label="Score"
          value={totalMarks}
          valueClass="text-indigo-400"
        />
      </div>
    </div>
  );
}

interface StatItemProps {
  icon: string;
  label: string;
  value: React.ReactNode;
  valueClass: string;
}

function StatItem({ icon, label, value, valueClass }: StatItemProps) {
  return (
    <div className="flex items-center gap-1.5 whitespace-nowrap">
      <span className="text-base">{icon}</span>

      <span className="text-slate-500">{label}</span>

      <span className={`font-bold ${valueClass}`}>{value}</span>
    </div>
  );
}

function Divider() {
  return <span className="select-none text-slate-700">│</span>;
}
