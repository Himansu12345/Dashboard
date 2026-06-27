"use client";

import { m, useAnimationControls } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ambientFloatLeftVariants,
  ambientFloatRightVariants,
  ambientPulseVariants,
} from "@/components/motion/variants";
import {
  useHasHydrated,
  useHydrationSafeReducedMotion,
} from "@/components/motion/useHydrationSafeReducedMotion";

function useDocumentVisible(): boolean {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    function handleVisibilityChange() {
      setIsVisible(document.visibilityState !== "hidden");
    }

    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return isVisible;
}

export default function AmbientMotionLayer() {
  const hasMounted = useHasHydrated();
  const reduceMotion = useHydrationSafeReducedMotion();
  const isVisible = useDocumentVisible();
  const controls = useAnimationControls();

  // FIXED: Added proper dependency tracking and early return handling
  useEffect(() => {
    if (!hasMounted) return undefined;

    if (reduceMotion || !isVisible) {
      controls.stop();
      return () => {
        // Cleanup on unmount or dependency change
        controls.stop();
      };
    }
    const animationId = controls.start("idle");
    return () => {
      // Prevent memory leak - cancel animation on cleanup
      animationId?.then?.(() => {})?.catch?.(() => {});
      controls.stop();
    };
  }, [controls, hasMounted, isVisible, reduceMotion]);

  if (!hasMounted || reduceMotion) return null;

  return (
    <div className="ambient-motion-layer" aria-hidden="true">
      <m.span
        className="ambient-orb ambient-orb-left"
        variants={ambientFloatLeftVariants}
        animate={controls}
      />
      <m.span
        className="ambient-orb ambient-orb-right"
        variants={ambientFloatRightVariants}
        animate={controls}
      />
      <m.span
        className="ambient-orb ambient-orb-center"
        variants={ambientPulseVariants}
        animate={controls}
      />
    </div>
  );
}
