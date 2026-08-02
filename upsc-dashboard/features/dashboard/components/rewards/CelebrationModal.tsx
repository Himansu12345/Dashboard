"use client";

import React from "react";
import type { CelebrationData } from "./useCelebration";

interface CelebrationModalProps {
  celebration: CelebrationData;
  onClose: () => void;
}

export default function CelebrationModal({
  celebration,
  onClose,
}: CelebrationModalProps) {
  return (
    <div
      className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0B0B0B] p-8 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute right-5 top-5 text-white/40 transition hover:text-white"
      >
        ✕
      </button>

      {/* Success Icon */}
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-3xl text-emerald-400">
        ✓
      </div>

      {/* Title */}
      <h2 className="text-center text-2xl font-bold tracking-wide text-white">
        {celebration.title}
      </h2>

      {/* Subtitle */}
      <p className="mt-2 text-center text-sm text-gray-400">
        {celebration.subtitle}
      </p>

      {/* Divider */}
      <div className="my-6 h-px bg-white/10" />

      {/* Mission */}
      <div className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500">
            Mission
          </p>

          <p className="mt-1 text-lg font-semibold text-white">
            {celebration.missionName}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Topics" value={celebration.totalTopics} />

          <StatCard label="Points" value={celebration.totalPoints} />

          <StatCard label="Duration" value={celebration.duration} />

          <StatCard label="Status" value="Complete" />
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-gray-500">
        Another step toward your UPSC goal.
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: React.ReactNode;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-xs uppercase tracking-wider text-gray-500">
        {label}
      </div>

      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}
