import WeeklyPlannerPanel from "@/features/dashboard/components/WeeklyPlannerPanel";

export const metadata = {
  title: "Mission Control | Planner",
  description: "Your weekly execution matrix.",
};

export default function PlannerPage() {
  return (
    <main className="min-h-screen bg-[#000000]">
      <WeeklyPlannerPanel />
    </main>
  );
}
