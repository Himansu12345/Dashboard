import { useCallback, useRef, useState } from "react";
import { getRandomCelebrationMessage } from "./CelebrationMessages";

export interface CelebrationData {
  title: string;
  subtitle: string;

  missionName: string;

  totalTopics: number;
  totalPoints: number;

  duration: string;
}

export function useCelebration() {
  const [celebration, setCelebration] =
    useState<CelebrationData | null>(null);

  const timerRef = useRef<number | null>(null);

  const closeCelebration = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    setCelebration(null);
  }, []);

  const triggerCelebration = useCallback(
    ({
      missionName,
      totalTopics,
      totalPoints,
      duration,
    }: Omit<CelebrationData, "title" | "subtitle">) => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      setCelebration({
        title: "MISSION COMPLETE",
        subtitle: getRandomCelebrationMessage(),

        missionName,

        totalTopics,
        totalPoints,

        duration,
      });

      timerRef.current = window.setTimeout(() => {
        setCelebration(null);
      }, 2500);
    },
    [],
  );

  return {
    celebration,

    triggerCelebration,

    closeCelebration,
  };
}