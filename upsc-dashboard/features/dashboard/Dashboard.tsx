import { useCallback, useMemo, useState } from "react";
import YearHeatmap from "@/components/YearHeatmap";
import { MotionSection } from "@/components/motion/MotionWrappers";
import DashboardHero from "@/features/dashboard/components/DashboardHero";
import DashboardPopups from "@/features/dashboard/components/DashboardPopups";
import {
  buildTopicReviewRecord,
  summarizeRecordsBySubtopic,
  summarizeRecordsByTopic,
} from "@/features/dashboard/recordLedgerUtils";
import {
  ALL_DIFFICULTIES,
  ALL_SUBJECTS,
  filterRecords,
  getDefaultFilters,
  getDifficultyOptions,
  getSubjectOptions,
} from "@/utils/filterUtils";
import type { PracticeRecord } from "@/types/records";
import type {
  RevisionDashboardPayload,
  RevisionReviewOutcome,
} from "@/types/revision";

interface DashboardProps {
  records: PracticeRecord[];
  onDeleteAttempt: (id: string) => Promise<void>;
  onRestoreAttempt: (id: string) => Promise<void>;
  onPermanentlyDeleteAttempt: (id: string) => Promise<void>;
  onSaveQuestionNote: (payload: {
    id: string;
    questionId?: string;
    question: string;
    selectedAnswer: string;
    correctAnswer: string;
    note: string;
    mode?: "add" | "edit" | "replace" | "delete";
    noteIndex?: number;
  }) => Promise<void>;
  onSaveQuestionWhy: (payload: {
    id: string;
    questionId?: string;
    question: string;
    selectedAnswer: string;
    correctAnswer: string;
    why: string;
    mode?: "replace" | "delete";
  }) => Promise<void>;
  deletingAttemptIds?: string[];
  restoringAttemptIds?: string[];
  permanentlyDeletingAttemptIds?: string[];
  savingQuestionNoteKey?: string | null;
  recycleBinRecords?: PracticeRecord[];
  revisionDashboard?: RevisionDashboardPayload | null;
  isRevisionLoading?: boolean;
  isRevisionRefreshing?: boolean;
  reviewingRevisionTopicId?: string | null;
  onReviewRevisionTopic: (payload: {
    id: string;
    outcome: RevisionReviewOutcome;
  }) => Promise<void>;
  isLoading?: boolean;
  isRecycleBinLoading?: boolean;
  isRefreshing?: boolean;
  consistencyDashboard?: unknown | null;
  isConsistencyLoading?: boolean;
  isConsistencyRefreshing?: boolean;
  consistencySummary?: unknown | null;
  onOpenConsistency?: () => void;
  onOpenSyllabus?: () => void;
  syllabusSummary?: unknown | null;
  syllabusDashboard?: unknown | null;
  isSyllabusLoading?: boolean;
  isSyllabusRefreshing?: boolean;
}

export default function Dashboard({
  records,
  onDeleteAttempt,
  onRestoreAttempt,
  onPermanentlyDeleteAttempt,
  onSaveQuestionNote,
  onSaveQuestionWhy,
  deletingAttemptIds = [],
  restoringAttemptIds = [],
  permanentlyDeletingAttemptIds = [],
  savingQuestionNoteKey = null,
  recycleBinRecords = [],
  revisionDashboard = null,
  isRevisionLoading = false,
  isRevisionRefreshing = false,
  reviewingRevisionTopicId = null,
  onReviewRevisionTopic,
  isRecycleBinLoading = false,
  isRefreshing = false,
  consistencyDashboard = null,
  isConsistencyLoading = false,
  isConsistencyRefreshing = false,
  consistencySummary = null,
  onOpenConsistency,
  onOpenSyllabus,
  syllabusSummary,
  syllabusDashboard = null,
  isSyllabusLoading = false,
  isSyllabusRefreshing = false,
}: DashboardProps) {
  // Consume unused optional props to avoid eslint warnings
  void onOpenConsistency;
  void onOpenSyllabus;
  void syllabusSummary;
  void consistencyDashboard;
  void isConsistencyLoading;
  void isConsistencyRefreshing;
  void consistencySummary;
  void syllabusDashboard;
  void isSyllabusLoading;
  void isSyllabusRefreshing;
  void onOpenSyllabus;
  void syllabusSummary;
  void consistencyDashboard;
  void isConsistencyLoading;
  void isConsistencyRefreshing;
  void consistencySummary;
  const filters = useMemo(() => getDefaultFilters(), []);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isSubjectOutcomePopupOpen, setIsSubjectOutcomePopupOpen] =
    useState(false);
  const [selectedOutcomeSubject, setSelectedOutcomeSubject] = useState<
    string | null
  >(null);
  const [selectedReviewRecord, setSelectedReviewRecord] =
    useState<PracticeRecord | null>(null);
  const [selectedLedgerSubject, setSelectedLedgerSubject] = useState<
    string | null
  >(null);
  const [selectedLedgerTopic, setSelectedLedgerTopic] = useState<string | null>(
    null,
  );
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [isRevisionEngineOpen, setIsRevisionEngineOpen] = useState(false);
  const [isSubjectAccuracyPopupOpen, setIsSubjectAccuracyPopupOpen] =
    useState(false);
  const [selectedAccuracySubject, setSelectedAccuracySubject] = useState<
    string | null
  >(null);
  const deletingAttemptIdSet = useMemo(
    () => new Set(deletingAttemptIds),
    [deletingAttemptIds],
  );
  const restoringAttemptIdSet = useMemo(
    () => new Set(restoringAttemptIds),
    [restoringAttemptIds],
  );
  const permanentlyDeletingAttemptIdSet = useMemo(
    () => new Set(permanentlyDeletingAttemptIds),
    [permanentlyDeletingAttemptIds],
  );

  const subjectOptions = useMemo(() => getSubjectOptions(records), [records]);
  const difficultyOptions = useMemo(
    () => getDifficultyOptions(records),
    [records],
  );
  const effectiveFilters = useMemo(
    () => ({
      ...filters,
      subject: subjectOptions.includes(filters.subject)
        ? filters.subject
        : subjectOptions[0] || ALL_SUBJECTS,
      difficulty: difficultyOptions.includes(filters.difficulty)
        ? filters.difficulty
        : difficultyOptions[0] || ALL_DIFFICULTIES,
    }),
    [difficultyOptions, filters, subjectOptions],
  );

  const filteredRecords = useMemo(
    () => filterRecords(records, effectiveFilters),
    [effectiveFilters, records],
  );
  const closePopup = useCallback(() => {
    setSelectedSubject(null);
  }, []);

  const handleCloseSubjectOutcomePopup = useCallback(() => {
    setSelectedOutcomeSubject(null);
    setIsSubjectOutcomePopupOpen(false);
  }, []);

  const handleSubjectOutcomeClick = useCallback((subject: string) => {
    setSelectedOutcomeSubject(subject);
  }, []);

  const handleCloseTopicOutcomePopup = useCallback(() => {
    setSelectedOutcomeSubject(null);
  }, []);

  const handleOpenReview = useCallback((record: PracticeRecord) => {
    setSelectedReviewRecord(record);
  }, []);

  const handleCloseReview = useCallback(() => {
    setSelectedReviewRecord(null);
  }, []);

  const handleCloseSubjectView = useCallback(() => {
    setSelectedLedgerSubject(null);
    setSelectedLedgerTopic(null);
  }, []);

  const handleCloseTopicLedger = useCallback(() => {
    setSelectedLedgerTopic(null);
  }, []);

  const handleOpenTopicReview = useCallback(
    (subtopic: string) => {
      if (!selectedLedgerSubject || !selectedLedgerTopic) return;

      const summaryRecord = buildTopicReviewRecord(
        records,
        selectedLedgerSubject,
        selectedLedgerTopic,
        subtopic,
      );
      if (!summaryRecord) return;

      setSelectedLedgerSubject(null);
      setSelectedLedgerTopic(null);
      handleOpenReview(summaryRecord);
    },
    [handleOpenReview, records, selectedLedgerSubject, selectedLedgerTopic],
  );

  const handleOpenChapterReview = useCallback(
    (topic: string) => {
      if (!selectedLedgerSubject) return;
      setSelectedLedgerTopic(topic);
    },
    [selectedLedgerSubject],
  );

  const handleCloseRecycleBin = useCallback(() => {
    setIsRecycleBinOpen(false);
  }, []);

  const handleCloseRevisionEngine = useCallback(() => {
    setIsRevisionEngineOpen(false);
  }, []);

  const handleCloseSubjectAccuracyPopup = useCallback(() => {
    setSelectedAccuracySubject(null);
    setIsSubjectAccuracyPopupOpen(false);
  }, []);

  const handleAccuracySubjectClick = useCallback((subject: string) => {
    setSelectedAccuracySubject(subject);
  }, []);

  const handleCloseTopicAccuracyPopup = useCallback(() => {
    setSelectedAccuracySubject(null);
  }, []);

  const subjectTopicRows = useMemo(
    () =>
      selectedLedgerSubject
        ? summarizeRecordsByTopic(records, selectedLedgerSubject)
        : [],
    [records, selectedLedgerSubject],
  );
  const chapterSubtopicRows = useMemo(
    () =>
      selectedLedgerSubject && selectedLedgerTopic
        ? summarizeRecordsBySubtopic(
            records,
            selectedLedgerSubject,
            selectedLedgerTopic,
          )
        : [],
    [records, selectedLedgerSubject, selectedLedgerTopic],
  );

  return (
    <section className="dashboard-page">
      <MotionSection delayIndex={0}>
        <DashboardHero
          totalCount={records.length}
          filteredCount={filteredRecords.length}
          isRefreshing={isRefreshing}
        />
      </MotionSection>

      <MotionSection delayIndex={1}>
        <YearHeatmap records={filteredRecords} />
      </MotionSection>

      <DashboardPopups
        selectedSubject={selectedSubject}
        filteredRecords={filteredRecords}
        onCloseSubjectAnalytics={closePopup}
        isSubjectOutcomePopupOpen={isSubjectOutcomePopupOpen}
        selectedOutcomeSubject={selectedOutcomeSubject}
        onCloseSubjectOutcomePopup={handleCloseSubjectOutcomePopup}
        onSubjectOutcomeClick={handleSubjectOutcomeClick}
        onCloseTopicOutcomePopup={handleCloseTopicOutcomePopup}
        isSubjectAccuracyPopupOpen={isSubjectAccuracyPopupOpen}
        selectedAccuracySubject={selectedAccuracySubject}
        onCloseSubjectAccuracyPopup={handleCloseSubjectAccuracyPopup}
        onAccuracySubjectClick={handleAccuracySubjectClick}
        onCloseTopicAccuracyPopup={handleCloseTopicAccuracyPopup}
        selectedReviewRecord={selectedReviewRecord}
        savingQuestionNoteKey={savingQuestionNoteKey}
        deletingAttemptIdSet={deletingAttemptIdSet}
        onCloseReview={handleCloseReview}
        onSaveQuestionNote={onSaveQuestionNote}
        onSaveQuestionWhy={onSaveQuestionWhy}
        onDeleteAttempt={onDeleteAttempt}
        selectedLedgerSubject={selectedLedgerSubject}
        subjectTopicRows={subjectTopicRows}
        selectedLedgerTopic={selectedLedgerTopic}
        chapterSubtopicRows={chapterSubtopicRows}
        onCloseSubjectView={handleCloseSubjectView}
        onCloseTopicLedger={handleCloseTopicLedger}
        onOpenTopicLedger={handleOpenChapterReview}
        onOpenTopicReview={handleOpenTopicReview}
        isRecycleBinOpen={isRecycleBinOpen}
        recycleBinRecords={recycleBinRecords}
        restoringAttemptIdSet={restoringAttemptIdSet}
        permanentlyDeletingAttemptIdSet={permanentlyDeletingAttemptIdSet}
        isRecycleBinLoading={isRecycleBinLoading}
        onCloseRecycleBin={handleCloseRecycleBin}
        onRestoreAttempt={onRestoreAttempt}
        onPermanentlyDeleteAttempt={onPermanentlyDeleteAttempt}
        isRevisionEngineOpen={isRevisionEngineOpen}
        revisionDashboard={revisionDashboard}
        isRevisionLoading={isRevisionLoading}
        isRevisionRefreshing={isRevisionRefreshing}
        reviewingRevisionTopicId={reviewingRevisionTopicId}
        onReviewRevisionTopic={onReviewRevisionTopic}
        onCloseRevisionEngine={handleCloseRevisionEngine}
      />
    </section>
  );
}
