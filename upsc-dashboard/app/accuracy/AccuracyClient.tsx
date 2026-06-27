"use client";

import { useCallback, useId, useMemo, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { MotionSection } from "@/components/motion/MotionWrappers";
import DashboardCharts from "@/features/dashboard/components/DashboardCharts";
import DashboardHero from "@/features/dashboard/components/DashboardHero";
import DashboardPopups from "@/features/dashboard/components/DashboardPopups";
import { buildDashboardAnalytics } from "@/utils/analyticsUtils";
import type { PracticeRecord } from "@/types/records";

interface AccuracyClientProps {
  records?: PracticeRecord[];
}

export default function AccuracyClient({
  records: initialRecords,
}: AccuracyClientProps) {
  const storeRecords = useAppSelector((state) => state.records.records);
  const records = initialRecords ?? storeRecords;

  const chartId = useId().replaceAll(":", "");
  const accuracyStrokeId = `accuracy-stroke-${chartId}`;
  const barFillId = `subject-bar-fill-${chartId}`;

  // Popup state management
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isSubjectOutcomePopupOpen, setIsSubjectOutcomePopupOpen] =
    useState(false);
  const [selectedOutcomeSubject, setSelectedOutcomeSubject] = useState<
    string | null
  >(null);
  const [isSubjectAccuracyPopupOpen, setIsSubjectAccuracyPopupOpen] =
    useState(false);
  const [selectedAccuracySubject, setSelectedAccuracySubject] = useState<
    string | null
  >(null);

  const dashboardAnalytics = useMemo(
    () => buildDashboardAnalytics(records),
    [records],
  );

  // Chart click handlers
  const handleSubjectBarClick = useCallback((barData: unknown) => {
    // Extract subject from barData - rechart provides data in different formats
    const data = barData as { subject?: string } | null;
    if (data?.subject) {
      setSelectedSubject(data.subject);
      setIsSubjectAccuracyPopupOpen(true);
    }
  }, []);

  const handleOverallPieClick = useCallback(() => {
    const hasSolvedQuestions = dashboardAnalytics.pieData.some(
      (row) => row.value > 0,
    );
    if (!hasSolvedQuestions) return;
    setIsSubjectOutcomePopupOpen(true);
  }, [dashboardAnalytics.pieData]);

  const handleAccuracyTrendClick = useCallback(() => {
    if (records.length === 0) return;
    setIsSubjectAccuracyPopupOpen(true);
  }, [records.length]);

  // Popup close handlers
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

  const isChartDataEmpty = records.length === 0;

  return (
    <section className="accuracy-page">
      <MotionSection delayIndex={0}>
        <DashboardHero
          totalCount={records.length}
          filteredCount={records.length}
          isRefreshing={false}
        />
      </MotionSection>

      <MotionSection delayIndex={1}>
        <DashboardCharts
          analytics={dashboardAnalytics}
          isChartDataEmpty={isChartDataEmpty}
          accuracyStrokeId={accuracyStrokeId}
          barFillId={barFillId}
          onSubjectBarClick={handleSubjectBarClick}
          onOverallPieClick={handleOverallPieClick}
          onAccuracyTrendClick={handleAccuracyTrendClick}
        />
      </MotionSection>

      <DashboardPopups
        selectedSubject={selectedSubject}
        filteredRecords={records}
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
        selectedReviewRecord={null}
        savingQuestionNoteKey={null}
        deletingAttemptIdSet={new Set<string>()}
        onCloseReview={() => {}}
        onSaveQuestionNote={async () => {}}
        onSaveQuestionWhy={async () => {}}
        onDeleteAttempt={async () => {}}
        selectedLedgerSubject={null}
        subjectTopicRows={[]}
        selectedLedgerTopic={null}
        chapterSubtopicRows={[]}
        onCloseSubjectView={() => {}}
        onCloseTopicLedger={() => {}}
        onOpenTopicLedger={() => {}}
        onOpenTopicReview={() => {}}
        isRecycleBinOpen={false}
        recycleBinRecords={[]}
        restoringAttemptIdSet={new Set<string>()}
        permanentlyDeletingAttemptIdSet={new Set<string>()}
        isRecycleBinLoading={false}
        onCloseRecycleBin={() => {}}
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
