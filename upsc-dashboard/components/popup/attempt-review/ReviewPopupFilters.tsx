import type { ReviewDateOption, ReviewSortOrder } from "./reviewPopupTypes";

interface ReviewPopupFiltersProps {
  reviewDateFilter: string;
  reviewDateOptions: ReviewDateOption[];
  reviewSortOrder: ReviewSortOrder;
  onDateFilterChange: (value: string) => void;
  onSortOrderChange: (value: ReviewSortOrder) => void;
}

export default function ReviewPopupFilters({
  reviewDateFilter,
  reviewDateOptions,
  reviewSortOrder,
  onDateFilterChange,
  onSortOrderChange,
}: ReviewPopupFiltersProps) {
  return (
    <div className="ledger-filter-grid review-popup-filter-grid">
      <label className="ledger-filter-field">
        <span className="review-note-label">Date Filter</span>
        <select
          className="ledger-filter-input"
          value={reviewDateFilter}
          onChange={(event) => onDateFilterChange(event.target.value)}
        >
          <option value="all">All Dates</option>
          {reviewDateOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="ledger-filter-field">
        <span className="review-note-label">Sort</span>
        <select
          className="ledger-filter-input"
          value={reviewSortOrder}
          onChange={(event) => onSortOrderChange(event.target.value as ReviewSortOrder)}
        >
          <option value="date-desc">Newest Date First</option>
          <option value="date-asc">Oldest Date First</option>
        </select>
      </label>
    </div>
  );
}
