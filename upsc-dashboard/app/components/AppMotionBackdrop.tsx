import AmbientMotionLayer from "@/components/motion/AmbientMotionLayer";
import BarPollSweep from "@/components/motion/BarPollSweep";
import LineTravelGlow from "@/components/motion/LineTravelGlow";

export function AppMotionBackdrop() {
  return (
    <>
      <AmbientMotionLayer />
      <LineTravelGlow />
      <BarPollSweep />
    </>
  );
}
