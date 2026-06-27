import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  MotionModalBackdrop,
  MotionModalPanel,
} from "@/components/motion/MotionWrappers";
import PopupHeader from "./PopupHeader";
import PopupFilters from "./PopupFilters";
import TopicChartGroup from "./TopicChartGroup";
import { buildTopicAnalytics } from "@/utils/analyticsUtils";
import useBodyScrollLock from "@/hooks/useBodyScrollLock";
import useFocusTrap from "@/hooks/useFocusTrap";
import {
  ALL_DIFFICULTIES,
  ALL_SUBJECTS,
  filterRecords,
  getDateBounds,
  getDifficultyOptions,
} from "@/utils/filterUtils";
import type { PracticeRecord } from "@/types/records";
import type { SubjectPopupFiltersState } from "@/types/activityCalendar";

const NOOP = () => {};

function getDefaultPopupFilters(): SubjectPopupFiltersState {
  return {
    startDate: "",
    endDate: "",
    difficulty: ALL_DIFFICULTIES,
  };
}

interface SubjectAnalyticsPopupProps {
  subject: string | null;
  records: PracticeRecord[];
  onClose?: () => void;
}

interface SubjectAnalyticsPopupContentProps {
  subject: string;
  records: PracticeRecord[];
  onClose: () => void;
}

function SubjectAnalyticsPopupContent({
  subject,
  records,
  onClose,
}: SubjectAnalyticsPopupContentProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement | null>(null);
  const [popupFilters, setPopupFilters] = useState<SubjectPopupFiltersState>(getDefaultPopupFilters);
  const safeRecords = useMemo<PracticeRecord[]>(() => (Array.isArray(records) ? records : []), [records]);
  const isOpen = true;

  useBodyScrollLock(isOpen);
  useFocusTrap({
    isActive: isOpen,
    containerRef: panelRef,
    initialFocusSelector: "button, select, input",
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const subjectRecords = useMemo(
    () => safeRecords.filter((record) => record.subject === subject),
    [safeRecords, subject],
  );

  const dateBounds = useMemo(() => getDateBounds(subjectRecords), [subjectRecords]);
  const difficultyOptions = useMemo(() => getDifficultyOptions(subjectRecords), [subjectRecords]);

  const effectivePopupFilters = useMemo(
    () => ({
      ...popupFilters,
      difficulty: difficultyOptions.includes(popupFilters.difficulty)
        ? popupFilters.difficulty
        : difficultyOptions[0] || ALL_DIFFICULTIES,
    }),
    [difficultyOptions, popupFilters],
  );

  const filteredSubjectRecords = useMemo(
    () =>
      filterRecords(subjectRecords, {
        startDate: effectivePopupFilters.startDate,
        endDate: effectivePopupFilters.endDate,
        subject: ALL_SUBJECTS,
        difficulty: effectivePopupFilters.difficulty,
      }),
    [
      effectivePopupFilters.difficulty,
      effectivePopupFilters.endDate,
      effectivePopupFilters.startDate,
      subjectRecords,
    ],
  );

  const topicAnalytics = useMemo(
    () => buildTopicAnalytics(filteredSubjectRecords),
    [filteredSubjectRecords],
  );

  function handleResetPopupFilters() {
    setPopupFilters(getDefaultPopupFilters());
  }

  if (!isOpen) return null;

  return createPortal(
    <MotionModalBackdrop className="subject-popup-backdrop" onClick={onClose}>
      <MotionModalPanel
        ref={panelRef}
        className="subject-popup-panel glass-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${subject} topic analytics`}
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <PopupHeader
          titleId={titleId}
          subject={subject}
          recordCount={filteredSubjectRecords.length}
          onClose={onClose}
        />

        <PopupFilters
          filters={effectivePopupFilters}
          onFiltersChange={setPopupFilters}
          onReset={handleResetPopupFilters}
          difficultyOptions={difficultyOptions}
          dateBounds={dateBounds}
        />

        <TopicChartGroup topicAnalytics={topicAnalytics} />
      </MotionModalPanel>
    </MotionModalBackdrop>,
    document.body,
  );
}

export default function SubjectAnalyticsPopup({ subject, records, onClose }: SubjectAnalyticsPopupProps) {
  const isOpen = Boolean(subject);
  const safeSubject = subject || "";
  const safeOnClose = typeof onClose === "function" ? onClose : NOOP;

  if (!isOpen) return null;

  return (
    <SubjectAnalyticsPopupContent
      key={safeSubject}
      subject={safeSubject}
      records={records}
      onClose={safeOnClose}
    />
  );
}
