import type { DatePopupFiltersState } from "@/types/activityCalendar";

interface DateAnalyticsFiltersProps {
  filters: DatePopupFiltersState;
  subjectOptions: string[];
  topicOptions: string[];
  difficultyOptions: string[];
  hasActiveFilters: boolean;
  onSubjectChange: (value: string) => void;
  onTopicChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onReset: () => void;
}

export default function DateAnalyticsFilters({
  filters,
  subjectOptions,
  topicOptions,
  difficultyOptions,
  hasActiveFilters,
  onSubjectChange,
  onTopicChange,
  onDifficultyChange,
  onReset,
}: DateAnalyticsFiltersProps) {
  const safeFilters = filters || {
    subject: "",
    topic: "",
    difficulty: "",
  };
  const safeSubjectOptions = Array.isArray(subjectOptions) ? subjectOptions : [];
  const safeTopicOptions = Array.isArray(topicOptions) ? topicOptions : [];
  const safeDifficultyOptions = Array.isArray(difficultyOptions) ? difficultyOptions : [];

  return (
    <div className="date-analytics-filter-grid">
      <label className="field date-analytics-filter-field">
        <span className="field-label">Subject</span>
        <select
          className="field-control date-analytics-filter-control"
          value={safeFilters.subject || safeSubjectOptions[0] || ""}
          onChange={(event) => onSubjectChange(event.target.value)}
          title="Filter charts by subject"
        >
          {safeSubjectOptions.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </label>

      <label className="field date-analytics-filter-field">
        <span className="field-label">Topic</span>
        <select
          className="field-control date-analytics-filter-control"
          value={safeFilters.topic || safeTopicOptions[0] || ""}
          onChange={(event) => onTopicChange(event.target.value)}
          title="Filter charts by topic"
        >
          {safeTopicOptions.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </label>

      <label className="field date-analytics-filter-field">
        <span className="field-label">Difficulty</span>
        <select
          className="field-control date-analytics-filter-control"
          value={safeFilters.difficulty || safeDifficultyOptions[0] || ""}
          onChange={(event) => onDifficultyChange(event.target.value)}
          title="Filter charts by difficulty"
        >
          {safeDifficultyOptions.map((difficulty) => (
            <option key={difficulty} value={difficulty}>
              {difficulty}
            </option>
          ))}
        </select>
      </label>

      <div className="date-analytics-filter-actions">
        <button
          type="button"
          className="action-btn action-btn-secondary ripple-btn"
          onClick={onReset}
          disabled={!hasActiveFilters}
          title="Reset popup chart filters"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
