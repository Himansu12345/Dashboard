import MissionHistoryClient from "./MissionHistoryClient";

export const metadata = {
  title: "Mission History | UPSC Dashboard",
  description: "Historical mission completion timeline and execution details.",
};

export default function MissionHistoryPage() {
  return <MissionHistoryClient />;
}
