"use client";

import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import type { ReactNode } from "react";
import { useHasHydrated } from "@/components/motion/useHydrationSafeReducedMotion";

interface MotionProviderProps {
  children: ReactNode;
}

export default function MotionProvider({ children }: MotionProviderProps) {
  const hasHydrated = useHasHydrated();
  const reducedMotion = hasHydrated ? "user" : "never";

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion={reducedMotion}>{children}</MotionConfig>
    </LazyMotion>
  );
}
