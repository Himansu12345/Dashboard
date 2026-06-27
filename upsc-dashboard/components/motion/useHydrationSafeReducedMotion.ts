"use client";

import { useReducedMotion } from "framer-motion";
import { useSyncExternalStore } from "react";

let hasHydratedSnapshot = false;
const hydrationListeners = new Set<() => void>();

function subscribeToHydration(listener: () => void) {
  hydrationListeners.add(listener);

  if (!hasHydratedSnapshot) {
    hasHydratedSnapshot = true;
    queueMicrotask(() => {
      hydrationListeners.forEach((hydrationListener) => hydrationListener());
    });
  }

  return () => {
    hydrationListeners.delete(listener);
  };
}

function getHydrationSnapshot() {
  return hasHydratedSnapshot;
}

function getServerHydrationSnapshot() {
  return false;
}

export function useHasHydrated(): boolean {
  return useSyncExternalStore(
    subscribeToHydration,
    getHydrationSnapshot,
    getServerHydrationSnapshot,
  );
}

export function useHydrationSafeReducedMotion(): boolean {
  const hasHydrated = useHasHydrated();
  const reduceMotion = useReducedMotion();

  return hasHydrated && reduceMotion === true;
}
