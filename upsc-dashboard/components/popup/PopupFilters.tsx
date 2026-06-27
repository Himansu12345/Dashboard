import DateFilter from "../filters/DateFilter";
import DifficultyFilter from "../filters/DifficultyFilter";
import type { Dispatch, SetStateAction } from "react";
import { MotionButton } from "@/components/motion/MotionWrappers";
import type { DateBounds } from "@/types/filters";
import type { SubjectPopupFiltersState } from "@/types/activityCalendar";

interface PopupFiltersProps {
  filters: SubjectPopupFiltersState;
  onFiltersChange: Dispatch<SetStateAction<SubjectPopupFiltersState>>;
  onReset: () => void;
  difficultyOptions: string[];
  dateBounds: DateBounds;
}

export default function PopupFilters({
  filters,
  onFiltersChange,
  onReset,
  difficultyOptions,
  dateBounds,
}: PopupFiltersProps) {
  const safeFilters = filters || {
    startDate: "",
    endDate: "",
    difficulty: "",
  };
  const safeDifficultyOptions = Array.isArray(difficultyOptions) ? difficultyOptions : [];

  function updateValue(key: keyof SubjectPopupFiltersState, value: string) {
    onFiltersChange((previous) => ({ ...previous, [key]: value }));
  }

  const defaultDifficulty = safeDifficultyOptions[0];
  const hasActiveFilters =
    Boolean(safeFilters.startDate) ||
    Boolean(safeFilters.endDate) ||
    safeFilters.difficulty !== defaultDifficulty;

  return (
    <section className="subject-popup-filters">
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

      <DifficultyFilter
        id="popup-difficulty-filter"
        value={safeFilters.difficulty}
        options={safeDifficultyOptions}
        onChange={(value) => updateValue("difficulty", value)}
      />

      <div className="dashboard-filter-actions">
        <MotionButton
          type="button"
          className="action-btn action-btn-secondary ripple-btn"
          onClick={onReset}
          disabled={!hasActiveFilters}
          title="Reset popup filters"
        >
          Reset Popup Filters
        </MotionButton>
      </div>
    </section>
  );
}
