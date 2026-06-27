"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type DateRange = {
  startDate: Date;
  endDate: Date;
};

type PresetKey =
  | "today"
  | "yesterday"
  | "last7"
  | "last30"
  | "thisMonth"
  | "previousMonth"
  | "custom";

interface DateFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

type PresetOption = {
  key: PresetKey;
  label: string;
};

const PRESETS: PresetOption[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last7", label: "Last 7 Days" },
  { key: "last30", label: "Last 30 Days" },
  { key: "thisMonth", label: "This Month" },
  { key: "previousMonth", label: "Previous Month" },
  { key: "custom", label: "Custom" },
];

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function formatInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameRange(a: DateRange, b: DateRange) {
  return (
    a.startDate.getTime() === b.startDate.getTime() &&
    a.endDate.getTime() === b.endDate.getTime()
  );
}

function getTodayRange(): DateRange {
  const now = new Date();
  return {
    startDate: startOfDay(now),
    endDate: endOfDay(now),
  };
}

function getYesterdayRange(): DateRange {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return {
    startDate: startOfDay(now),
    endDate: endOfDay(now),
  };
}

function getLast7DaysRange(): DateRange {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6); // includes today = 7 total days
  return {
    startDate: startOfDay(start),
    endDate: endOfDay(end),
  };
}

function getLast30DaysRange(): DateRange {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29); // includes today = 30 total days
  return {
    startDate: startOfDay(start),
    endDate: endOfDay(end),
  };
}

function getThisMonthRange(): DateRange {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date();
  return {
    startDate: startOfDay(start),
    endDate: endOfDay(end),
  };
}

function getPreviousMonthRange(): DateRange {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0);
  return {
    startDate: startOfDay(start),
    endDate: endOfDay(end),
  };
}

function getPresetRange(key: Exclude<PresetKey, "custom">): DateRange {
  switch (key) {
    case "today":
      return getTodayRange();
    case "yesterday":
      return getYesterdayRange();
    case "last7":
      return getLast7DaysRange();
    case "last30":
      return getLast30DaysRange();
    case "thisMonth":
      return getThisMonthRange();
    case "previousMonth":
      return getPreviousMonthRange();
    default:
      return getLast7DaysRange();
  }
}

function detectPreset(range: DateRange): PresetKey {
  const checks: Array<Exclude<PresetKey, "custom">> = [
    "today",
    "yesterday",
    "last7",
    "last30",
    "thisMonth",
    "previousMonth",
  ];

  for (const preset of checks) {
    const presetRange = getPresetRange(preset);
    if (isSameRange(range, presetRange)) {
      return preset;
    }
  }

  return "custom";
}

export default function DateFilter({ value, onChange }: DateFilterProps) {
  const [activePreset, setActivePreset] = useState<PresetKey>(() =>
    detectPreset(value),
  );

  const [customOpen, setCustomOpen] = useState(false);
  const [draftStart, setDraftStart] = useState(
    formatInputDate(value.startDate),
  );
  const [draftEnd, setDraftEnd] = useState(formatInputDate(value.endDate));

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActivePreset(detectPreset(value));
    setDraftStart(formatInputDate(value.startDate));
    setDraftEnd(formatInputDate(value.endDate));
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!customOpen) return;
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setCustomOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setCustomOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [customOpen]);

  const currentLabel = useMemo(() => {
    if (activePreset !== "custom") {
      return (
        PRESETS.find((p) => p.key === activePreset)?.label ?? "Date Filter"
      );
    }

    return `${formatInputDate(value.startDate)} → ${formatInputDate(value.endDate)}`;
  }, [activePreset, value]);

  const handlePresetClick = (preset: PresetKey) => {
    if (preset === "custom") {
      setActivePreset("custom");
      setDraftStart(formatInputDate(value.startDate));
      setDraftEnd(formatInputDate(value.endDate));
      setCustomOpen((prev) => !prev);
      return;
    }

    const nextRange = getPresetRange(preset);
    setActivePreset(preset);
    setCustomOpen(false);
    onChange(nextRange);
  };

  const applyCustomRange = () => {
    if (!draftStart || !draftEnd) return;

    const start = new Date(draftStart);
    const end = new Date(draftEnd);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;

    const normalizedStart = startOfDay(start);
    const normalizedEnd = endOfDay(end);

    if (normalizedStart.getTime() > normalizedEnd.getTime()) {
      window.alert("Start date cannot be after end date.");
      return;
    }

    setActivePreset("custom");
    setCustomOpen(false);
    onChange({
      startDate: normalizedStart,
      endDate: normalizedEnd,
    });
  };

  const cancelCustomRange = () => {
    setDraftStart(formatInputDate(value.startDate));
    setDraftEnd(formatInputDate(value.endDate));
    setCustomOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-full md:w-auto">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
              Report Range
            </div>
            <div className="mt-1 text-sm font-medium text-white/85">
              {currentLabel}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setActivePreset("custom");
              setDraftStart(formatInputDate(value.startDate));
              setDraftEnd(formatInputDate(value.endDate));
              setCustomOpen((prev) => !prev);
            }}
            className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
              activePreset === "custom"
                ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-200 shadow-[0_0_0_1px_rgba(34,211,238,0.15)]"
                : "border-white/10 bg-white/[0.04] text-white/80 hover:border-white/20 hover:bg-white/[0.08]"
            }`}
          >
            Custom
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESETS.filter((item) => item.key !== "custom").map((preset) => {
            const isActive = activePreset === preset.key;

            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => handlePresetClick(preset.key)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-200 shadow-[0_0_0_1px_rgba(34,211,238,0.15)]"
                    : "border-white/10 bg-white/[0.04] text-white/80 hover:border-white/20 hover:bg-white/[0.08]"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {customOpen && (
        <div className="absolute right-0 z-50 mt-3 w-full min-w-[320px] max-w-[420px] rounded-2xl border border-white/10 bg-[#0d1529]/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl md:w-[420px]">
          <div className="mb-4">
            <div className="text-sm font-semibold text-white">
              Custom Date Range
            </div>
            <div className="mt-1 text-xs text-white/55">
              Choose the exact report window you want to export or analyze.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/55">
                Start Date
              </label>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                <input
                  type="date"
                  value={draftStart}
                  onChange={(e) => setDraftStart(e.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none [color-scheme:dark]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/55">
                End Date
              </label>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                <input
                  type="date"
                  value={draftEnd}
                  onChange={(e) => setDraftEnd(e.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="text-xs text-white/45">
              Applied range will include the full start and end day.
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={cancelCustomRange}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/20 hover:bg-white/[0.08]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={applyCustomRange}
                className="rounded-xl border border-cyan-400/30 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
