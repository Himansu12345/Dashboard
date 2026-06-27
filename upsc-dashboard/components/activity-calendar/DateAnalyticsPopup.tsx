import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  MotionModalBackdrop,
  MotionModalPanel,
} from "@/components/motion/MotionWrappers";
import AccuracyStats from "./breakdown/AccuracyStats";
import DifficultyBreakdown from "./breakdown/DifficultyBreakdown";
import SubjectBreakdown from "./breakdown/SubjectBreakdown";
import TopicBreakdown from "./breakdown/TopicBreakdown";
import DateAnalyticsFilters from "./DateAnalyticsFilters";
import DateAnalyticsInsights from "./DateAnalyticsInsights";
import { buildDateAnalytics, getRecordDateKey } from "./activityCalendarUtils";
import useBodyScrollLock from "@/hooks/useBodyScrollLock";
import useFocusTrap from "@/hooks/useFocusTrap";
import type { DateAnalyticsResult } from "@/types/analytics";
import type {
  DateAnalyticsPopupProps,
  DatePopupFilterItem,
  DatePopupFiltersState,
} from "@/types/activityCalendar";

const ALL_SUBJECTS = "All Subjects";
const ALL_TOPICS = "All Topics";
const ALL_DIFFICULTIES = "All Difficulties";
const DIFFICULTY_ORDER = ["Easy", "Medium", "Hard"];
const NOOP = () => {};

function getFallbackAnalytics(dateKey: string | null): DateAnalyticsResult {
  return {
    dateKey: dateKey || "",
    totalSubmissions: 0,
    totalQuestionsAttempted: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    totalSkipped: 0,
    accuracy: 0,
    subjectBreakdown: [],
    topicBreakdown: [],
    difficultyBreakdown: [],
  };
}

function getDefaultFilters(): DatePopupFiltersState {
  return {
    subject: ALL_SUBJECTS,
    topic: ALL_TOPICS,
    difficulty: ALL_DIFFICULTIES,
  };
}

function toLabelValue(value: string | null | undefined): string {
  return value || "Unknown";
}

export default function DateAnalyticsPopup({ dateKey, analytics, records, onClose }: DateAnalyticsPopupProps) {
  const isOpen = Boolean(dateKey);
  const titleId = useId();
  const panelRef = useRef<HTMLElement | null>(null);
  const [filters, setFilters] = useState<DatePopupFiltersState>(getDefaultFilters);
  const safeOnClose = typeof onClose === "function" ? onClose : NOOP;

  useBodyScrollLock(isOpen);
  useFocusTrap({
    isActive: isOpen,
    containerRef: panelRef,
    initialFocusSelector: "button, select, input",
  });

  const safeRecords = useMemo(() => (Array.isArray(records) ? records : []), [records]);

  const dateRecords = useMemo(() => {
    if (!dateKey) return [];
    return safeRecords.filter((record) => getRecordDateKey(record) === dateKey);
  }, [dateKey, safeRecords]);

  const safeAnalytics = useMemo(() => {
    if (analytics) return analytics;
    if (!dateKey) return getFallbackAnalytics(dateKey);
    return buildDateAnalytics(dateRecords, dateKey);
  }, [analytics, dateKey, dateRecords]);

  const subjectOptions = useMemo(() => {
    const subjects = Array.from(new Set(dateRecords.map((record) => toLabelValue(record.subject)))).sort(
      (first, second) => first.localeCompare(second),
    );
    return [ALL_SUBJECTS, ...subjects];
  }, [dateRecords]);

  const difficultyOptions = useMemo(() => {
    const difficultySet = new Set(dateRecords.map((record) => toLabelValue(record.difficulty)));
    const orderedDifficulties = DIFFICULTY_ORDER.filter((difficulty) => difficultySet.has(difficulty));
    const extraDifficulties = Array.from(difficultySet)
      .filter((difficulty) => !DIFFICULTY_ORDER.includes(difficulty))
      .sort((first, second) => first.localeCompare(second));
    return [ALL_DIFFICULTIES, ...orderedDifficulties, ...extraDifficulties];
  }, [dateRecords]);

  const effectiveSubject = subjectOptions.includes(filters.subject) ? filters.subject : ALL_SUBJECTS;
  const effectiveDifficulty = difficultyOptions.includes(filters.difficulty)
    ? filters.difficulty
    : ALL_DIFFICULTIES;

  const topicOptions = useMemo(() => {
    const scopedRecords =
      effectiveSubject === ALL_SUBJECTS
        ? dateRecords
        : dateRecords.filter((record) => toLabelValue(record.subject) === effectiveSubject);
    const topics = Array.from(new Set(scopedRecords.map((record) => toLabelValue(record.topic)))).sort(
      (first, second) => first.localeCompare(second),
    );
    return [ALL_TOPICS, ...topics];
  }, [dateRecords, effectiveSubject]);

  const effectiveTopic = topicOptions.includes(filters.topic) ? filters.topic : ALL_TOPICS;

  const effectiveFilters = useMemo<DatePopupFiltersState>(
    () => ({
      subject: effectiveSubject,
      topic: effectiveTopic,
      difficulty: effectiveDifficulty,
    }),
    [effectiveDifficulty, effectiveSubject, effectiveTopic],
  );

  const hasActiveFilters = useMemo(
    () =>
      effectiveFilters.subject !== ALL_SUBJECTS ||
      effectiveFilters.topic !== ALL_TOPICS ||
      effectiveFilters.difficulty !== ALL_DIFFICULTIES,
    [effectiveFilters],
  );

  const filteredDateRecords = useMemo(
    () =>
      dateRecords.filter((record) => {
        const subject = toLabelValue(record.subject);
        const topic = toLabelValue(record.topic);
        const difficulty = toLabelValue(record.difficulty);

        if (effectiveFilters.subject !== ALL_SUBJECTS && subject !== effectiveFilters.subject) return false;
        if (effectiveFilters.topic !== ALL_TOPICS && topic !== effectiveFilters.topic) return false;
        if (effectiveFilters.difficulty !== ALL_DIFFICULTIES && difficulty !== effectiveFilters.difficulty) {
          return false;
        }
        return true;
      }),
    [dateRecords, effectiveFilters],
  );

  const filteredAnalytics = useMemo(() => {
    if (!dateKey) return getFallbackAnalytics(dateKey);
    return buildDateAnalytics(filteredDateRecords, dateKey);
  }, [dateKey, filteredDateRecords]);
  const totalSubmissionsForDate = Number(safeAnalytics.totalSubmissions) || 0;

  const subtitle = hasActiveFilters
    ? `${filteredAnalytics.totalSubmissions} of ${totalSubmissionsForDate} submissions match active filters`
    : `${totalSubmissionsForDate} submissions mapped to this date`;

  const handleSubjectChange = useCallback((subject: string) => {
    setFilters((previous) => ({
      ...previous,
      subject,
      topic: ALL_TOPICS,
    }));
  }, []);

  const handleTopicChange = useCallback((topic: string) => {
    setFilters((previous) => ({
      ...previous,
      topic,
    }));
  }, []);

  const handleDifficultyChange = useCallback((difficulty: string) => {
    setFilters((previous) => ({
      ...previous,
      difficulty,
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(getDefaultFilters());
  }, []);

  const activeFilterItems = useMemo<DatePopupFilterItem[]>(() => {
    const items: DatePopupFilterItem[] = [];

    if (effectiveFilters.subject !== ALL_SUBJECTS) {
      items.push({
        key: "subject",
        label: `Subject: ${effectiveFilters.subject}`,
        onClear: () => handleSubjectChange(ALL_SUBJECTS),
      });
    }

    if (effectiveFilters.topic !== ALL_TOPICS) {
      items.push({
        key: "topic",
        label: `Topic: ${effectiveFilters.topic}`,
        onClear: () => handleTopicChange(ALL_TOPICS),
      });
    }

    if (effectiveFilters.difficulty !== ALL_DIFFICULTIES) {
      items.push({
        key: "difficulty",
        label: `Difficulty: ${effectiveFilters.difficulty}`,
        onClear: () => handleDifficultyChange(ALL_DIFFICULTIES),
      });
    }

    return items;
  }, [
    effectiveFilters.difficulty,
    effectiveFilters.subject,
    effectiveFilters.topic,
    handleDifficultyChange,
    handleSubjectChange,
    handleTopicChange,
  ]);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        safeOnClose();
      }
    }

    function handlePointerDown(event: PointerEvent) {
      const panel = panelRef.current;
      const target = event.target;
      if (!panel) return;
      if (target instanceof Node && !panel.contains(target)) {
        safeOnClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen, safeOnClose]);

  if (!isOpen) return null;

  return createPortal(
    <MotionModalBackdrop className="date-analytics-backdrop">
      <MotionModalPanel
        ref={panelRef}
        className="date-analytics-panel glass-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`Date analytics for ${dateKey}`}
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="date-analytics-header">
          <div className="date-analytics-header-main">
            <div className="date-analytics-title-wrap">
              <p className="date-analytics-kicker">Date Insight</p>
              <h3 id={titleId} className="date-analytics-title">
                {dateKey}
              </h3>
              <p className="date-analytics-subtitle">{subtitle}</p>
            </div>

            <button
              type="button"
              className="date-analytics-close ripple-btn"
              onClick={safeOnClose}
              aria-label="Close date analytics popup"
              title="Close"
            >
              X
            </button>
          </div>

          <DateAnalyticsFilters
            filters={effectiveFilters}
            subjectOptions={subjectOptions}
            topicOptions={topicOptions}
            difficultyOptions={difficultyOptions}
            hasActiveFilters={hasActiveFilters}
            onSubjectChange={handleSubjectChange}
            onTopicChange={handleTopicChange}
            onDifficultyChange={handleDifficultyChange}
            onReset={handleResetFilters}
          />

          {activeFilterItems.length ? (
            <div className="date-analytics-active-filters" aria-label="Applied filters">
              {activeFilterItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className="date-analytics-filter-pill ripple-btn"
                  onClick={item.onClear}
                  title={`Clear ${item.key} filter`}
                >
                  <span>{item.label}</span>
                  <span className="date-analytics-filter-pill-x" aria-hidden="true">
                    X
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </header>

        <div className="date-analytics-content">
          {filteredAnalytics.totalSubmissions === 0 ? (
            <p className="date-analytics-empty-note">
              {totalSubmissionsForDate === 0
                ? "No submissions recorded on this date. Select another block to inspect activity."
                : "No submissions match active filters. Reset filters to view full analytics."}
            </p>
          ) : null}

          <DateAnalyticsInsights
            analytics={filteredAnalytics}
            totalForDate={totalSubmissionsForDate}
          />
          <AccuracyStats analytics={filteredAnalytics} />
          <SubjectBreakdown data={filteredAnalytics.subjectBreakdown} />
          <TopicBreakdown data={filteredAnalytics.topicBreakdown} />
          <DifficultyBreakdown data={filteredAnalytics.difficultyBreakdown} />
        </div>
      </MotionModalPanel>
    </MotionModalBackdrop>,
    document.body,
  );
}
