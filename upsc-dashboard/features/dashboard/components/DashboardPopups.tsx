import dynamic from "next/dynamic";
import type { PracticeRecord } from "@/types/records";
import type { RevisionDashboardPayload, RevisionReviewOutcome } from "@/types/revision";
import type { LedgerSummaryRow } from "@/features/dashboard/recordLedgerUtils";

const SubjectAnalyticsPopup = dynamic(
  () => import("@/components/popup/SubjectAnalyticsPopup"),
  { ssr: false },
);
const SubjectOutcomeDrilldownPopup = dynamic(
  () => import("@/components/popup/SubjectOutcomeDrilldownPopup"),
  { ssr: false },
);
const TopicOutcomeDrilldownPopup = dynamic(
  () => import("@/components/popup/TopicOutcomeDrilldownPopup"),
  { ssr: false },
);
const SubjectAccuracyDrilldownPopup = dynamic(
  () => import("@/components/popup/SubjectAccuracyDrilldownPopup"),
  { ssr: false },
);
const TopicAccuracyDrilldownPopup = dynamic(
  () => import("@/components/popup/TopicAccuracyDrilldownPopup"),
  { ssr: false },
);
const AttemptReviewPopup = dynamic(
  () => import("@/components/popup/AttemptReviewPopup"),
  { ssr: false },
);
const SubjectTopicLedgerPopup = dynamic(
  () => import("@/components/popup/SubjectTopicLedgerPopup"),
  { ssr: false },
);
const TopicQuestionLedgerPopup = dynamic(
  () => import("@/components/popup/TopicQuestionLedgerPopup"),
  { ssr: false },
);
const RecycleBinPopup = dynamic(
  () => import("@/components/popup/RecycleBinPopup"),
  { ssr: false },
);
const RevisionEnginePopup = dynamic(
  () => import("@/components/popup/RevisionEnginePopup"),
  { ssr: false },
);

interface DashboardPopupsProps {
  selectedSubject: string | null;
  filteredRecords: PracticeRecord[];
  onCloseSubjectAnalytics: () => void;
  isSubjectOutcomePopupOpen: boolean;
  selectedOutcomeSubject: string | null;
  onCloseSubjectOutcomePopup: () => void;
  onSubjectOutcomeClick: (subject: string) => void;
  onCloseTopicOutcomePopup: () => void;
  isSubjectAccuracyPopupOpen: boolean;
  selectedAccuracySubject: string | null;
  onCloseSubjectAccuracyPopup: () => void;
  onAccuracySubjectClick: (subject: string) => void;
  onCloseTopicAccuracyPopup: () => void;
  selectedReviewRecord: PracticeRecord | null;
  savingQuestionNoteKey: string | null;
  deletingAttemptIdSet: Set<string>;
  onCloseReview: () => void;
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
  onDeleteAttempt: (id: string) => Promise<void>;
  selectedLedgerSubject: string | null;
  subjectTopicRows: LedgerSummaryRow[];
  selectedLedgerTopic: string | null;
  chapterSubtopicRows: LedgerSummaryRow[];
  onCloseSubjectView: () => void;
  onCloseTopicLedger: () => void;
  onOpenTopicLedger: (topic: string) => void;
  onOpenTopicReview: (topic: string) => void;
  isRecycleBinOpen: boolean;
  recycleBinRecords: PracticeRecord[];
  restoringAttemptIdSet: Set<string>;
  permanentlyDeletingAttemptIdSet: Set<string>;
  isRecycleBinLoading: boolean;
  onCloseRecycleBin: () => void;
  onRestoreAttempt: (id: string) => Promise<void>;
  onPermanentlyDeleteAttempt: (id: string) => Promise<void>;
  isRevisionEngineOpen: boolean;
  revisionDashboard: RevisionDashboardPayload | null;
  isRevisionLoading: boolean;
  isRevisionRefreshing: boolean;
  reviewingRevisionTopicId: string | null;
  onReviewRevisionTopic: (payload: {
    id: string;
    outcome: RevisionReviewOutcome;
  }) => Promise<void>;
  onCloseRevisionEngine: () => void;
}

export default function DashboardPopups({
  selectedSubject,
  filteredRecords,
  onCloseSubjectAnalytics,
  isSubjectOutcomePopupOpen,
  selectedOutcomeSubject,
  onCloseSubjectOutcomePopup,
  onSubjectOutcomeClick,
  onCloseTopicOutcomePopup,
  isSubjectAccuracyPopupOpen,
  selectedAccuracySubject,
  onCloseSubjectAccuracyPopup,
  onAccuracySubjectClick,
  onCloseTopicAccuracyPopup,
  selectedReviewRecord,
  savingQuestionNoteKey,
  deletingAttemptIdSet,
  onCloseReview,
  onSaveQuestionNote,
  onSaveQuestionWhy,
  onDeleteAttempt,
  selectedLedgerSubject,
  subjectTopicRows,
  selectedLedgerTopic,
  chapterSubtopicRows,
  onCloseSubjectView,
  onCloseTopicLedger,
  onOpenTopicLedger,
  onOpenTopicReview,
  isRecycleBinOpen,
  recycleBinRecords,
  restoringAttemptIdSet,
  permanentlyDeletingAttemptIdSet,
  isRecycleBinLoading,
  onCloseRecycleBin,
  onRestoreAttempt,
  onPermanentlyDeleteAttempt,
  isRevisionEngineOpen,
  revisionDashboard,
  isRevisionLoading,
  isRevisionRefreshing,
  reviewingRevisionTopicId,
  onReviewRevisionTopic,
  onCloseRevisionEngine,
}: DashboardPopupsProps) {
  return (
    <>
      {selectedSubject ? (
        <SubjectAnalyticsPopup
          subject={selectedSubject}
          records={filteredRecords}
          onClose={onCloseSubjectAnalytics}
        />
      ) : null}

      {isSubjectOutcomePopupOpen ? (
        <SubjectOutcomeDrilldownPopup
          isOpen={isSubjectOutcomePopupOpen}
          records={filteredRecords}
          onClose={onCloseSubjectOutcomePopup}
          onSubjectClick={onSubjectOutcomeClick}
        />
      ) : null}

      {selectedOutcomeSubject ? (
        <TopicOutcomeDrilldownPopup
          subject={selectedOutcomeSubject}
          records={filteredRecords}
          onClose={onCloseTopicOutcomePopup}
        />
      ) : null}

      {isSubjectAccuracyPopupOpen ? (
        <SubjectAccuracyDrilldownPopup
          isOpen={isSubjectAccuracyPopupOpen}
          records={filteredRecords}
          onClose={onCloseSubjectAccuracyPopup}
          onSubjectClick={onAccuracySubjectClick}
        />
      ) : null}

      {selectedAccuracySubject ? (
        <TopicAccuracyDrilldownPopup
          subject={selectedAccuracySubject}
          records={filteredRecords}
          onClose={onCloseTopicAccuracyPopup}
        />
      ) : null}

      {selectedReviewRecord ? (
        <AttemptReviewPopup
          record={selectedReviewRecord}
          savingQuestionNoteKey={savingQuestionNoteKey}
          deletingAttemptIdSet={deletingAttemptIdSet}
          onClose={onCloseReview}
          onSaveQuestionNote={onSaveQuestionNote}
          onSaveQuestionWhy={onSaveQuestionWhy}
          onDeleteAttempt={onDeleteAttempt}
        />
      ) : null}

      {selectedLedgerSubject && !selectedLedgerTopic ? (
        <SubjectTopicLedgerPopup
          subject={selectedLedgerSubject}
          rows={subjectTopicRows}
          onClose={onCloseSubjectView}
          onOpenTopicReview={onOpenTopicLedger}
        />
      ) : null}

      {selectedLedgerSubject && selectedLedgerTopic ? (
        <TopicQuestionLedgerPopup
          subject={selectedLedgerSubject}
          topic={selectedLedgerTopic}
          rows={chapterSubtopicRows}
          onClose={onCloseTopicLedger}
          onOpenTopicReview={onOpenTopicReview}
        />
      ) : null}

      {isRecycleBinOpen ? (
        <RecycleBinPopup
          isOpen={isRecycleBinOpen}
          records={recycleBinRecords}
          restoringAttemptIdSet={restoringAttemptIdSet}
          permanentlyDeletingAttemptIdSet={permanentlyDeletingAttemptIdSet}
          isLoading={isRecycleBinLoading}
          onClose={onCloseRecycleBin}
          onRestoreAttempt={onRestoreAttempt}
          onPermanentlyDeleteAttempt={onPermanentlyDeleteAttempt}
        />
      ) : null}

      {isRevisionEngineOpen ? (
        <RevisionEnginePopup
          isOpen={isRevisionEngineOpen}
          revisionDashboard={revisionDashboard}
          isLoading={isRevisionLoading}
          isRefreshing={isRevisionRefreshing}
          reviewingTopicId={reviewingRevisionTopicId}
          onReviewTopic={onReviewRevisionTopic}
          onClose={onCloseRevisionEngine}
        />
      ) : null}
    </>
  );
}
