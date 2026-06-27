"use client";

import { useCallback, useMemo, useState } from "react";
import DateFilter from "./DateFilter";
import SubjectFilter from "./SubjectFilter";
import DifficultyFilter from "./DifficultyFilter";
import type { Dispatch, SetStateAction } from "react";
import { MotionButton } from "@/components/motion/MotionWrappers";
import type { DateBounds, DashboardFilters } from "@/types/filters";

interface FilterBarProps {
  filters: DashboardFilters;
  onFiltersChange: Dispatch<SetStateAction<DashboardFilters>>;
  onReset: () => void;
  subjectOptions: string[];
  difficultyOptions: string[];
  dateBounds: DateBounds;
  totalCount: number;
  filteredCount: number;
}

// Quick date range presets
const DATE_PRESETS = [
  { label: "Today", days: 0 },
  { label: "7 Days", days: 7 },
  { label: "30 Days", days: 30 },
  { label: "90 Days", days: 90 },
  { label: "This Year", days: 365 },
];

function getPresetDateRange(days: number): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return {
    start: days === 0 ? formatDate(end) : formatDate(start),
    end: formatDate(end),
  };
}

export default function FilterBar({
  filters,
  onFiltersChange,
  onReset,
  subjectOptions,
  difficultyOptions,
  totalCount,
  filteredCount,
}: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const safeFilters = useMemo(
    () =>
      filters || {
        startDate: "",
        endDate: "",
        subject: "",
        difficulty: "",
      },
    [filters],
  );
  const safeSubjectOptions = useMemo(
    () => (Array.isArray(subjectOptions) ? subjectOptions : []),
    [subjectOptions],
  );
  const safeDifficultyOptions = useMemo(
    () => (Array.isArray(difficultyOptions) ? difficultyOptions : []),
    [difficultyOptions],
  );

  const handleSubjectChange = useCallback(
    (value: string) => {
      onFiltersChange((previous) => ({ ...previous, subject: value }));
    },
    [onFiltersChange],
  );

  const handleDifficultyChange = useCallback(
    (value: string) => {
      onFiltersChange((previous) => ({ ...previous, difficulty: value }));
    },
    [onFiltersChange],
  );

  const handlePresetClick = useCallback(
    (days: number) => {
      const range = getPresetDateRange(days);
      onFiltersChange((previous) => ({
        ...previous,
        startDate: range.start,
        endDate: range.end,
      }));
    },
    [onFiltersChange],
  );

  const defaultSubject = safeSubjectOptions[0];
  const defaultDifficulty = safeDifficultyOptions[0];
  const hasActiveFilters =
    Boolean(safeFilters.startDate) ||
    Boolean(safeFilters.endDate) ||
    safeFilters.subject !== defaultSubject ||
    safeFilters.difficulty !== defaultDifficulty;

  const hasNonDefaultSubject =
    safeFilters.subject !== defaultSubject && safeFilters.subject !== "";
  const hasNonDefaultDifficulty =
    safeFilters.difficulty !== defaultDifficulty &&
    safeFilters.difficulty !== "";
  const hasDateFilters =
    Boolean(safeFilters.startDate) || Boolean(safeFilters.endDate);

  // Calculate filter summary
  const activeFilterCount = [
    hasNonDefaultSubject,
    hasNonDefaultDifficulty,
    hasDateFilters,
  ].filter(Boolean).length;

  return (
    <div className="filter-bar-modern">
      {/* Filter Header - Always Visible */}
      <div
        className="filter-bar-header"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
      >
        <div className="filter-bar-summary">
          <div className="filter-bar-title">
            <svg
              className="filter-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
            </svg>
            <h3 className="filter-heading">Filters</h3>
            {activeFilterCount > 0 && (
              <span className="filter-badge">{activeFilterCount}</span>
            )}
          </div>
          <p className="filter-note">
            <span className="filter-count">
              <strong>{filteredCount}</strong> / {totalCount}
            </span>
            {hasActiveFilters && (
              <span className="filter-active-indicator">Filtered</span>
            )}
          </p>
        </div>
        <svg
          className={`filter-chevron ${isExpanded ? "is-rotated" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {/* Filter Body - Collapsible */}
      <div className={`filter-bar-body ${isExpanded ? "is-open" : ""}`}>
        {/* Quick Filter Chips */}
        <div className="filter-chips-row">
          <div className="filter-chips">
            {/* Subject Quick Chip */}
            {hasNonDefaultSubject && (
              <button
                type="button"
                className="filter-chip is-active"
                onClick={() => handleSubjectChange("")}
              >
                {safeFilters.subject} ×
              </button>
            )}
            {/* Difficulty Quick Chip */}
            {hasNonDefaultDifficulty && (
              <button
                type="button"
                className="filter-chip is-active"
                onClick={() => handleDifficultyChange("")}
              >
                {safeFilters.difficulty} ×
              </button>
            )}
            {/* Date Quick Chip */}
            {hasDateFilters && (
              <button
                type="button"
                className="filter-chip is-active"
                onClick={() =>
                  onFiltersChange((prev) => ({
                    ...prev,
                    startDate: "",
                    endDate: "",
                  }))
                }
              >
                Date Range ×
              </button>
            )}
            {/* Reset All */}
            {hasActiveFilters && (
              <button
                type="button"
                className="filter-chip chip-reset"
                onClick={onReset}
              >
                Reset All
              </button>
            )}
          </div>
        </div>

        {/* Date Presets */}
        <div className="filter-section">
          <label className="filter-section-label">Quick Dates</label>
          <div className="filter-presets">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className={`filter-preset-btn ${
                  safeFilters.startDate && safeFilters.endDate
                    ? isCurrentPreset(
                        preset.days,
                        safeFilters.startDate,
                        safeFilters.endDate,
                      )
                      ? "is-active"
                      : ""
                    : ""
                }`}
                onClick={() => handlePresetClick(preset.days)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Filter Controls */}
        <div className="filter-controls-grid">
          <div className="filter-control-group full-width">
            <DateFilter
              value={{
                startDate: safeFilters.startDate ? new Date(safeFilters.startDate) : new Date(0),
                endDate: safeFilters.endDate ? new Date(safeFilters.endDate) : new Date(),
              }}
              onChange={(newRange) => {
                const formatDate = (date: Date): string => {
                  if (!date || isNaN(date.getTime())) return "";
                  return date.toISOString().split('T')[0];
                };
                onFiltersChange((prev) => ({
                  ...prev,
                  startDate: formatDate(newRange.startDate),
                  endDate: formatDate(newRange.endDate),
                }));
              }}
            />
          </div>

          <div className="filter-control-group">
            <SubjectFilter
              id="filter-subject"
              value={safeFilters.subject}
              options={safeSubjectOptions}
              onChange={handleSubjectChange}
            />
          </div>

          <div className="filter-control-group">
            <DifficultyFilter
              id="filter-difficulty"
              value={safeFilters.difficulty}
              options={safeDifficultyOptions}
              onChange={handleDifficultyChange}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="filter-actions">
          <MotionButton
            type="button"
            className="filter-action-btn primary"
            onClick={() => setIsExpanded(false)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Apply Filters
          </MotionButton>
          {hasActiveFilters && (
            <MotionButton
              type="button"
              className="filter-action-btn secondary"
              onClick={onReset}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Clear All
            </MotionButton>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to check if current preset is active
function isCurrentPreset(
  days: number,
  startDate: string,
  endDate: string,
): boolean {
  if (days === 0) {
    // Today - check if startDate equals endDate
    return startDate === endDate;
  }

  const range = getPresetDateRange(days);
  return startDate === range.start && endDate === range.end;
}
