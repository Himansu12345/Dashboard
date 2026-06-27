"use client";

import { useCallback, useMemo, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { MotionSection } from "@/components/motion/MotionWrappers";
import DashboardPopups from "@/features/dashboard/components/DashboardPopups";
import RecordsTableSection from "@/features/dashboard/components/RecordsTableSection";
import {
  buildTopicReviewRecord,
  summarizeRecordsBySubtopic,
  summarizeRecordsByTopic,
  type LedgerSummaryRow,
} from "@/features/dashboard/recordLedgerUtils";
import type { PracticeRecord } from "@/types/records";

interface TableClientProps {
  records?: PracticeRecord[];
}

export default function TableClient({
  records: initialRecords,
}: TableClientProps) {
  const storeRecords = useAppSelector((state) => state.records.records);
  const records = initialRecords ?? storeRecords;

  // Loading states - we'll set them as false for initial render
  const isLoading = useMemo(() => false, []);
  const isRefreshing = useMemo(() => false, []);

  // Popup state management
  const [selectedLedgerSubject, setSelectedLedgerSubject] = useState<
    string | null
  >(null);
  const [selectedLedgerTopic, setSelectedLedgerTopic] = useState<string | null>(
    null,
  );
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [selectedReviewRecord, setSelectedReviewRecord] =
    useState<PracticeRecord | null>(null);

  // Computed data for popups
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

  // Click handlers for opening popups
  const handleOpenSubjectView = useCallback((subject: string) => {
    setSelectedLedgerSubject(subject);
  }, []);

  const handleCloseSubjectView = useCallback(() => {
    setSelectedLedgerSubject(null);
    setSelectedLedgerTopic(null);
  }, []);

  const handleCloseTopicLedger = useCallback(() => {
    setSelectedLedgerTopic(null);
  }, []);

  const handleOpenChapterReview = useCallback(
    (topic: string) => {
      if (!selectedLedgerSubject) return;
      setSelectedLedgerTopic(topic);
    },
    [selectedLedgerSubject],
  );

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
      setSelectedReviewRecord(summaryRecord);
    },
    [records, selectedLedgerSubject, selectedLedgerTopic],
  );

  const handleOpenRecycleBin = useCallback(() => {
    setIsRecycleBinOpen(true);
  }, []);

  const handleCloseRecycleBin = useCallback(() => {
    setIsRecycleBinOpen(false);
  }, []);

  const handleCloseReview = useCallback(() => {
    setSelectedReviewRecord(null);
  }, []);

  return (
    <section className="table-page">
      <MotionSection delayIndex={0}>
        <RecordsTableSection
          records={records}
          recycleBinCount={0}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          onOpenRecycleBin={handleOpenRecycleBin}
          onOpenSubjectView={handleOpenSubjectView}
        />
      </MotionSection>

      <DashboardPopups
        selectedSubject={null}
        filteredRecords={records}
        onCloseSubjectAnalytics={() => {}}
        isSubjectOutcomePopupOpen={false}
        selectedOutcomeSubject={null}
        onCloseSubjectOutcomePopup={() => {}}
        onSubjectOutcomeClick={() => {}}
        onCloseTopicOutcomePopup={() => {}}
        isSubjectAccuracyPopupOpen={false}
        selectedAccuracySubject={null}
        onCloseSubjectAccuracyPopup={() => {}}
        onAccuracySubjectClick={() => {}}
        onCloseTopicAccuracyPopup={() => {}}
        selectedReviewRecord={selectedReviewRecord}
        savingQuestionNoteKey={null}
        deletingAttemptIdSet={new Set<string>()}
        onCloseReview={handleCloseReview}
        onSaveQuestionNote={async () => {}}
        onSaveQuestionWhy={async () => {}}
        onDeleteAttempt={async () => {}}
        selectedLedgerSubject={selectedLedgerSubject}
        subjectTopicRows={subjectTopicRows}
        selectedLedgerTopic={selectedLedgerTopic}
        chapterSubtopicRows={chapterSubtopicRows}
        onCloseSubjectView={handleCloseSubjectView}
        onCloseTopicLedger={handleCloseTopicLedger}
        onOpenTopicLedger={handleOpenChapterReview}
        onOpenTopicReview={handleOpenTopicReview}
        isRecycleBinOpen={isRecycleBinOpen}
        recycleBinRecords={[]}
        restoringAttemptIdSet={new Set<string>()}
        permanentlyDeletingAttemptIdSet={new Set<string>()}
        isRecycleBinLoading={false}
        onCloseRecycleBin={handleCloseRecycleBin}
        onRestoreAttempt={async () => {}}
        onPermanentlyDeleteAttempt={async () => {}}
        isRevisionEngineOpen={false}
        revisionDashboard={null}
        isRevisionLoading={false}
        isRevisionRefreshing={false}
        reviewingRevisionTopicId={null}
        onReviewRevisionTopic={async () => {}}
        onCloseRevisionEngine={() => {}}
      />
    </section>
  );
}
