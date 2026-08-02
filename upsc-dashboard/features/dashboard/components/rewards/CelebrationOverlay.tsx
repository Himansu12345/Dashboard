"use client";

import React from "react";
import CelebrationModal from "./CelebrationModal";
import type { CelebrationData } from "./useCelebration";

interface CelebrationOverlayProps {
  celebration: CelebrationData | null;
  onClose: () => void;
}

export default function CelebrationOverlay({
  celebration,
  onClose,
}: CelebrationOverlayProps) {
  if (!celebration) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        bg-black/60
        backdrop-blur-sm
        animate-fade-in
      "
      onClick={onClose}
    >
      <CelebrationModal celebration={celebration} onClose={onClose} />
    </div>
  );
}
