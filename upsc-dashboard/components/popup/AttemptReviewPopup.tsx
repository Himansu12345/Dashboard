import { useMemo, useState, useRef, useEffect } from "react";
import type { PracticeQuestionDetail, PracticeRecord } from "@/types/records";
import ReviewPopupHeader from "./attempt-review/ReviewPopupHeader";
import ReviewPopupStats from "./attempt-review/ReviewPopupStats";
import ReviewPopupFilters from "./attempt-review/ReviewPopupFilters";
import ReviewGroupedDetails from "./attempt-review/ReviewGroupedDetails";
import QuestionNotesModal from "./attempt-review/QuestionNotesModal";
import QuestionWhyModal from "./attempt-review/QuestionWhyModal";
import {
  getReviewDateOptions,
  getGroupedDetails,
} from "./attempt-review/reviewPopupUtils";
import { buildDetailKey } from "./attempt-review/helpers";
import type { ReviewSortOrder } from "./attempt-review/reviewPopupTypes";

interface AttemptReviewPopupProps {
  record: PracticeRecord;
  isSolveMode?: boolean; // NEW PROP
  savingQuestionNoteKey: string | null;
  deletingAttemptIdSet: Set<string>;
  onClose: () => void;
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
}

export default function AttemptReviewPopup({
  record,
  isSolveMode = false,
  savingQuestionNoteKey,
  deletingAttemptIdSet,
  onClose,
  onSaveQuestionNote,
  onSaveQuestionWhy,
  onDeleteAttempt,
}: AttemptReviewPopupProps) {
  const [reviewDateFilter, setReviewDateFilter] = useState("all");
  const [reviewSortOrder, setReviewSortOrder] =
    useState<ReviewSortOrder>("date-desc");

  const [activeNoteDetail, setActiveNoteDetail] =
    useState<PracticeQuestionDetail | null>(null);
  const [activeWhyDetail, setActiveWhyDetail] =
    useState<PracticeQuestionDetail | null>(null);
  const [isNoteComposerOpen, setIsNoteComposerOpen] = useState(false);
  const [isWhyComposerOpen, setIsWhyComposerOpen] = useState(false);
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [activeNoteDraft, setActiveNoteDraft] = useState("");
  const [whyDraft, setWhyDraft] = useState("");
  const [noteValidationError, setNoteValidationError] = useState("");
  const [whyValidationError, setWhyValidationError] = useState("");

  const notePanelRef = useRef<HTMLDivElement>(null);
  const whyPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (activeNoteDetail && notePanelRef.current) {
        handleCloseNoteModal();
      } else if (activeWhyDetail && whyPanelRef.current) {
        handleCloseWhyModal();
      } else {
        onClose();
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [activeNoteDetail, activeWhyDetail, onClose]);

  // Combine incorrect and skipped details. If in solve mode, we only want these anyway.
  const reviewDetails = useMemo(() => {
    return (record.incorrectDetails || []).concat(record.skippedDetails || []);
  }, [record.incorrectDetails, record.skippedDetails]);

  const reviewDateOptions = useMemo(
    () => getReviewDateOptions(reviewDetails, record),
    [reviewDetails, record],
  );

  const groupedDetails = useMemo(
    () =>
      getGroupedDetails(
        reviewDetails,
        record,
        reviewDateFilter,
        reviewSortOrder,
      ),
    [reviewDetails, record, reviewDateFilter, reviewSortOrder],
  );

  const activeNotes = useMemo(() => {
    if (!activeNoteDetail) return [];
    return activeNoteDetail.notes && activeNoteDetail.notes.length > 0
      ? activeNoteDetail.notes
      : activeNoteDetail.note
        ? [activeNoteDetail.note]
        : [];
  }, [activeNoteDetail]);

  const activeWhyValue = useMemo(() => {
    if (!activeWhyDetail) return "";
    return typeof activeWhyDetail.why === "string"
      ? activeWhyDetail.why.trim()
      : "";
  }, [activeWhyDetail]);

  // --- Handlers for Note/Why UI (kept as-is) ---
  const handleOpenNoteModal = (detail: PracticeQuestionDetail) => {
    setActiveNoteDetail(detail);
    setIsNoteComposerOpen(false);
    setEditingNoteIndex(null);
    setActiveNoteDraft("");
    setNoteValidationError("");
  };

  const handleCloseNoteModal = () => {
    setActiveNoteDetail(null);
    setIsNoteComposerOpen(false);
    setEditingNoteIndex(null);
    setActiveNoteDraft("");
    setNoteValidationError("");
  };

  const handleStartAddNote = () => {
    setIsNoteComposerOpen(true);
    setEditingNoteIndex(null);
    setActiveNoteDraft("");
    setNoteValidationError("");
  };

  const handleStartEditNote = (noteIndex: number) => {
    setIsNoteComposerOpen(true);
    setEditingNoteIndex(noteIndex);
    setActiveNoteDraft(activeNotes[noteIndex] || "");
    setNoteValidationError("");
  };

  const handleDeleteAllNotes = async () => {
    if (!activeNoteDetail || !record.id) return;
    try {
      await onSaveQuestionNote({
        id: record.id,
        questionId: activeNoteDetail.questionId,
        question: activeNoteDetail.question,
        selectedAnswer: activeNoteDetail.selectedAnswer || "",
        correctAnswer: activeNoteDetail.correctAnswer || "",
        note: "",
        mode: "delete",
      });
      setActiveNoteDetail((prev) =>
        prev ? { ...prev, notes: [], note: "" } : null,
      );
    } catch (err) {
      console.error("Failed to delete all notes:", err);
    }
  };

  const handleDeleteNote = async (noteIndex: number) => {
    if (!activeNoteDetail || !record.id) return;
    try {
      await onSaveQuestionNote({
        id: record.id,
        questionId: activeNoteDetail.questionId,
        question: activeNoteDetail.question,
        selectedAnswer: activeNoteDetail.selectedAnswer || "",
        correctAnswer: activeNoteDetail.correctAnswer || "",
        note: "",
        mode: "delete",
        noteIndex,
      });
      setActiveNoteDetail((prev) => {
        if (!prev) return null;
        const nextNotes = [...(prev.notes || [])];
        nextNotes.splice(noteIndex, 1);
        return { ...prev, notes: nextNotes, note: nextNotes[0] || "" };
      });
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  const handleSaveNote = async () => {
    if (!activeNoteDetail || !record.id) return;
    const trimmed = activeNoteDraft.trim();
    if (!trimmed) {
      setNoteValidationError("Note cannot be empty.");
      return;
    }
    setNoteValidationError("");
    try {
      await onSaveQuestionNote({
        id: record.id,
        questionId: activeNoteDetail.questionId,
        question: activeNoteDetail.question,
        selectedAnswer: activeNoteDetail.selectedAnswer || "",
        correctAnswer: activeNoteDetail.correctAnswer || "",
        note: trimmed,
        mode: editingNoteIndex === null ? "add" : "edit",
        noteIndex: editingNoteIndex !== null ? editingNoteIndex : undefined,
      });
      setActiveNoteDetail((prev) => {
        if (!prev) return null;
        const nextNotes = [...(prev.notes || [])];
        if (editingNoteIndex === null) {
          nextNotes.push(trimmed);
        } else {
          nextNotes[editingNoteIndex] = trimmed;
        }
        return { ...prev, notes: nextNotes, note: nextNotes[0] || "" };
      });
      setIsNoteComposerOpen(false);
      setEditingNoteIndex(null);
      setActiveNoteDraft("");
    } catch (err) {
      console.error("Failed to save note:", err);
      setNoteValidationError("An error occurred while saving the note.");
    }
  };

  const handleOpenWhyModal = (detail: PracticeQuestionDetail) => {
    setActiveWhyDetail(detail);
    setIsWhyComposerOpen(false);
    setWhyDraft("");
    setWhyValidationError("");
  };

  const handleCloseWhyModal = () => {
    setActiveWhyDetail(null);
    setIsWhyComposerOpen(false);
    setWhyDraft("");
    setWhyValidationError("");
  };

  const handleStartEditWhy = () => {
    setIsWhyComposerOpen(true);
    setWhyDraft(activeWhyValue);
    setWhyValidationError("");
  };

  const handleDeleteWhy = async () => {
    if (!activeWhyDetail || !record.id) return;
    try {
      await onSaveQuestionWhy({
        id: record.id,
        questionId: activeWhyDetail.questionId,
        question: activeWhyDetail.question,
        selectedAnswer: activeWhyDetail.selectedAnswer || "",
        correctAnswer: activeWhyDetail.correctAnswer || "",
        why: "",
        mode: "delete",
      });
      setActiveWhyDetail((prev) => (prev ? { ...prev, why: "" } : null));
    } catch (err) {
      console.error("Failed to delete reason:", err);
    }
  };

  const handleSaveWhy = async () => {
    if (!activeWhyDetail || !record.id) return;
    const trimmed = whyDraft.trim();
    if (!trimmed) {
      setWhyValidationError("Reason cannot be empty.");
      return;
    }
    setWhyValidationError("");
    try {
      await onSaveQuestionWhy({
        id: record.id,
        questionId: activeWhyDetail.questionId,
        question: activeWhyDetail.question,
        selectedAnswer: activeWhyDetail.selectedAnswer || "",
        correctAnswer: activeWhyDetail.correctAnswer || "",
        why: trimmed,
        mode: "replace",
      });
      setActiveWhyDetail((prev) => (prev ? { ...prev, why: trimmed } : null));
      setIsWhyComposerOpen(false);
      setWhyDraft("");
    } catch (err) {
      console.error("Failed to save reason:", err);
      setWhyValidationError("An error occurred while saving the reason.");
    }
  };

  const handleDeleteGroupedDate = async (
    dateLabel: string,
    attemptIds: string[],
  ) => {
    if (
      !confirm(`Are you sure you want to delete all attempts for ${dateLabel}?`)
    )
      return;
    for (const attemptId of attemptIds) {
      await onDeleteAttempt(attemptId);
    }
  };

  const handleDeleteGroupedAttempt = async (attemptId: string) => {
    if (!confirm("Are you sure you want to delete this attempt?")) return;
    await onDeleteAttempt(attemptId);
  };

  const isSavingActiveNote = activeNoteDetail
    ? savingQuestionNoteKey === buildDetailKey(activeNoteDetail)
    : false;

  const isSavingActiveWhy = activeWhyDetail
    ? savingQuestionNoteKey === buildDetailKey(activeWhyDetail)
    : false;

  return (
    <div className="subject-popup-backdrop" onClick={onClose}>
      <div
        className="subject-popup-panel glass-panel fade-slide-in"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${record.subject} - ${record.topic} Review`}
      >
        <ReviewPopupHeader record={record} onClose={onClose} />

        <ReviewPopupStats record={record} />

        <ReviewPopupFilters
          reviewDateFilter={reviewDateFilter}
          reviewDateOptions={reviewDateOptions}
          reviewSortOrder={reviewSortOrder}
          onDateFilterChange={setReviewDateFilter}
          onSortOrderChange={setReviewSortOrder}
        />

        <div className="review-popup-content-area">
          {groupedDetails.length === 0 ? (
            <p className="empty-state-copy text-center py-8">
              No questions found for the selected date filter.
            </p>
          ) : (
            <ReviewGroupedDetails
              groupedDetails={groupedDetails}
              deletingAttemptIdSet={deletingAttemptIdSet}
              onDeleteGroupedDate={handleDeleteGroupedDate}
              onDeleteGroupedAttempt={handleDeleteGroupedAttempt}
              onOpenNote={handleOpenNoteModal}
              onOpenWhy={handleOpenWhyModal}
              isSolveMode={isSolveMode} // PASS SOLVE MODE DOWN
            />
          )}
        </div>
      </div>

      <QuestionNotesModal
        activeNoteDetail={activeNoteDetail}
        activeNotes={activeNotes}
        isNoteComposerOpen={isNoteComposerOpen}
        editingNoteIndex={editingNoteIndex}
        activeNoteDraft={activeNoteDraft}
        noteValidationError={noteValidationError}
        isSavingActiveNote={isSavingActiveNote}
        notePanelRef={notePanelRef}
        onCloseModal={handleCloseNoteModal}
        onStartAddNote={handleStartAddNote}
        onDeleteAllNotes={handleDeleteAllNotes}
        onStartEditNote={handleStartEditNote}
        onDeleteNote={handleDeleteNote}
        onDraftChange={setActiveNoteDraft}
        onCloseComposer={() => setIsNoteComposerOpen(false)}
        onSaveNote={handleSaveNote}
      />

      <QuestionWhyModal
        activeWhyDetail={activeWhyDetail}
        activeWhyValue={activeWhyValue}
        isWhyComposerOpen={isWhyComposerOpen}
        whyDraft={whyDraft}
        whyValidationError={whyValidationError}
        isSavingActiveWhy={isSavingActiveWhy}
        whyPanelRef={whyPanelRef}
        onCloseModal={handleCloseWhyModal}
        onStartEditWhy={handleStartEditWhy}
        onDeleteWhy={handleDeleteWhy}
        onDraftChange={setWhyDraft}
        onCloseComposer={() => setIsWhyComposerOpen(false)}
        onSaveWhy={handleSaveWhy}
      />
    </div>
  );
}
