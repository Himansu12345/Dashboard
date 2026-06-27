import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useBodyScrollLock from "@/hooks/useBodyScrollLock";
import useFocusTrap from "@/hooks/useFocusTrap";
import QuestionNotesModal from "@/components/popup/attempt-review/QuestionNotesModal";
import QuestionWhyModal from "@/components/popup/attempt-review/QuestionWhyModal";
import ReviewGroupedDetails from "@/components/popup/attempt-review/ReviewGroupedDetails";
import ReviewPopupFilters from "@/components/popup/attempt-review/ReviewPopupFilters";
import ReviewPopupHeader from "@/components/popup/attempt-review/ReviewPopupHeader";
import ReviewPopupStats from "@/components/popup/attempt-review/ReviewPopupStats";
import {
  buildDetailKey,
  normalizeDetail,
  normalizeDetailNotes,
} from "@/components/popup/attempt-review/helpers";
import {
  getGroupedDetails,
  getReviewDateOptions,
} from "@/components/popup/attempt-review/reviewPopupUtils";
import type { ReviewSortOrder } from "@/components/popup/attempt-review/reviewPopupTypes";
import type { PracticeQuestionDetail, PracticeRecord } from "@/types/records";

interface AttemptReviewPopupProps {
  record: PracticeRecord | null;
  savingQuestionNoteKey?: string | null;
  deletingAttemptIdSet?: Set<string>;
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
  onClose: () => void;
}

export default function AttemptReviewPopup({
  record,
  savingQuestionNoteKey = null,
  deletingAttemptIdSet = new Set<string>(),
  onSaveQuestionNote,
  onSaveQuestionWhy,
  onDeleteAttempt,
  onClose,
}: AttemptReviewPopupProps) {
  const isOpen = Boolean(record);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const notePanelRef = useRef<HTMLDivElement | null>(null);
  const whyPanelRef = useRef<HTMLDivElement | null>(null);

  const details = useMemo(
    () =>
      (record?.incorrectDetails || [])
        .filter(
          (detail) =>
            detail &&
            typeof detail.question === "string" &&
            detail.question.trim().length > 0,
        )
        .map((detail) => normalizeDetail(detail)),
    [record],
  );

  const getDetailRecordId = useCallback(
    (detail: Pick<PracticeQuestionDetail, "sourceRecordId">) =>
      detail.sourceRecordId || record?.id || "",
    [record?.id],
  );

  const getPopupDetailKey = useCallback(
    (detail: Pick<
      PracticeQuestionDetail,
      "question" | "selectedAnswer" | "correctAnswer" | "sourceRecordId"
    >) => `${getDetailRecordId(detail)}::${buildDetailKey(detail)}`,
    [getDetailRecordId],
  );

  const [noteValues, setNoteValues] = useState<Record<string, string[]>>(() => {
    const nextValues: Record<string, string[]> = {};
    details.forEach((detail) => {
      nextValues[getPopupDetailKey(detail)] = normalizeDetailNotes(detail);
    });
    return nextValues;
  });

  const [activeNoteDetail, setActiveNoteDetail] =
    useState<PracticeQuestionDetail | null>(null);
  const [activeNoteKey, setActiveNoteKey] = useState<string | null>(null);
  const [isNoteComposerOpen, setIsNoteComposerOpen] = useState(false);
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [activeNoteDraft, setActiveNoteDraft] = useState("");
  const [noteValidationError, setNoteValidationError] = useState("");
  const [whyValues, setWhyValues] = useState<Record<string, string>>(() => {
    const nextValues: Record<string, string> = {};
    details.forEach((detail) => {
      nextValues[getPopupDetailKey(detail)] =
        typeof detail.why === "string" ? detail.why.trim() : "";
    });
    return nextValues;
  });
  const [activeWhyDetail, setActiveWhyDetail] =
    useState<PracticeQuestionDetail | null>(null);
  const [activeWhyKey, setActiveWhyKey] = useState<string | null>(null);
  const [isWhyComposerOpen, setIsWhyComposerOpen] = useState(false);
  const [activeWhyDraft, setActiveWhyDraft] = useState("");
  const [whyValidationError, setWhyValidationError] = useState("");
  const [reviewDateFilter, setReviewDateFilter] = useState("all");
  const [reviewSortOrder, setReviewSortOrder] =
    useState<ReviewSortOrder>("date-desc");

  useEffect(() => {
    const nextValues: Record<string, string[]> = {};
    const nextWhyValues: Record<string, string> = {};
    details.forEach((detail) => {
      const detailKey = getPopupDetailKey(detail);
      nextValues[detailKey] = normalizeDetailNotes(detail);
      nextWhyValues[detailKey] =
        typeof detail.why === "string" ? detail.why.trim() : "";
    });
    setNoteValues(nextValues);
    setWhyValues(nextWhyValues);
    setActiveNoteDetail(null);
    setActiveNoteKey(null);
    setIsNoteComposerOpen(false);
    setEditingNoteIndex(null);
    setActiveNoteDraft("");
    setNoteValidationError("");
    setActiveWhyDetail(null);
    setActiveWhyKey(null);
    setIsWhyComposerOpen(false);
    setActiveWhyDraft("");
    setWhyValidationError("");
    setReviewDateFilter("all");
    setReviewSortOrder("date-desc");
  }, [details, getPopupDetailKey]);

  const handleUpdateNotes = useCallback(
    (detailKey: string, updater: (previousNotes: string[]) => string[]) => {
      setNoteValues((previous) => {
        const current = Array.isArray(previous[detailKey])
          ? previous[detailKey]
          : [];
        const next = updater(current);
        return { ...previous, [detailKey]: next };
      });
    },
    [],
  );

  const handleOpenNoteModal = useCallback((detail: PracticeQuestionDetail) => {
    const detailKey = getPopupDetailKey(detail);

    setNoteValues((previous) => {
      if (Array.isArray(previous[detailKey])) return previous;
      return {
        ...previous,
        [detailKey]: normalizeDetailNotes(detail),
      };
    });

    setActiveNoteDetail(detail);
    setActiveNoteKey(detailKey);
    setIsNoteComposerOpen(false);
    setEditingNoteIndex(null);
    setActiveNoteDraft("");
    setNoteValidationError("");
  }, [getPopupDetailKey]);

  const handleUpdateWhy = useCallback((detailKey: string, value: string) => {
    setWhyValues((previous) => ({ ...previous, [detailKey]: value }));
  }, []);

  const handleOpenWhyModal = useCallback(
    (detail: PracticeQuestionDetail) => {
      const detailKey = getPopupDetailKey(detail);
      const existingWhy =
        typeof whyValues[detailKey] === "string"
          ? whyValues[detailKey]
          : typeof detail.why === "string"
            ? detail.why.trim()
            : "";

      setWhyValues((previous) => {
        if (typeof previous[detailKey] === "string") return previous;
        return { ...previous, [detailKey]: existingWhy };
      });

      setActiveWhyDetail(detail);
      setActiveWhyKey(detailKey);
      setActiveWhyDraft(existingWhy);
      setIsWhyComposerOpen(existingWhy.length === 0);
      setWhyValidationError("");
    },
    [getPopupDetailKey, whyValues],
  );

  const handleCloseNoteComposer = useCallback(() => {
    setIsNoteComposerOpen(false);
    setEditingNoteIndex(null);
    setActiveNoteDraft("");
    setNoteValidationError("");
  }, []);

  const handleCloseNoteModal = useCallback(() => {
    handleCloseNoteComposer();
    setActiveNoteDetail(null);
    setActiveNoteKey(null);
  }, [handleCloseNoteComposer]);

  const handleCloseWhyComposer = useCallback(() => {
    const existingWhy =
      activeWhyKey && typeof whyValues[activeWhyKey] === "string"
        ? whyValues[activeWhyKey]
        : "";
    setIsWhyComposerOpen(false);
    setActiveWhyDraft(existingWhy);
    setWhyValidationError("");
  }, [activeWhyKey, whyValues]);

  const handleCloseWhyModal = useCallback(() => {
    setActiveWhyDetail(null);
    setActiveWhyKey(null);
    setIsWhyComposerOpen(false);
    setActiveWhyDraft("");
    setWhyValidationError("");
  }, []);

  const activeNotes = useMemo(() => {
    if (!activeNoteKey) return [];
    return Array.isArray(noteValues[activeNoteKey])
      ? noteValues[activeNoteKey]
      : [];
  }, [activeNoteKey, noteValues]);

  const activeWhyValue = useMemo(() => {
    if (!activeWhyKey) return "";
    return typeof whyValues[activeWhyKey] === "string" ? whyValues[activeWhyKey] : "";
  }, [activeWhyKey, whyValues]);

  const reviewDateOptions = useMemo(
    () => getReviewDateOptions(details, record),
    [details, record],
  );

  const groupedDetails = useMemo(
    () => getGroupedDetails(details, record, reviewDateFilter, reviewSortOrder),
    [details, record, reviewDateFilter, reviewSortOrder],
  );

  const handleStartAddNote = useCallback(() => {
    setIsNoteComposerOpen(true);
    setEditingNoteIndex(null);
    setActiveNoteDraft("");
    setNoteValidationError("");
  }, []);

  const handleStartEditNote = useCallback(
    (index: number) => {
      const targetNote = activeNotes[index];
      if (typeof targetNote !== "string") return;

      setIsNoteComposerOpen(true);
      setEditingNoteIndex(index);
      setActiveNoteDraft(targetNote);
      setNoteValidationError("");
    },
    [activeNotes],
  );

  const handleSaveActiveNote = useCallback(async () => {
    if (!record || !activeNoteDetail || !activeNoteKey) return;

    const nextNote = activeNoteDraft.trim();
    if (!nextNote) {
      setNoteValidationError("Note cannot be empty.");
      return;
    }

    const mode = editingNoteIndex === null ? "add" : "edit";
    const nextNoteIndex =
      editingNoteIndex === null ? undefined : editingNoteIndex;

    await onSaveQuestionNote({
      id: getDetailRecordId(activeNoteDetail),
      questionId: activeNoteDetail.questionId,
      question: activeNoteDetail.question,
      selectedAnswer: activeNoteDetail.selectedAnswer || "",
      correctAnswer: activeNoteDetail.correctAnswer || "",
      note: nextNote,
      mode,
      noteIndex: nextNoteIndex,
    });

    handleUpdateNotes(activeNoteKey, (previousNotes) => {
      if (mode === "add") {
        return Array.from(new Set([...previousNotes, nextNote])).slice(0, 50);
      }

      if (nextNoteIndex === undefined) return previousNotes;

      if (nextNoteIndex < 0 || nextNoteIndex >= previousNotes.length) {
        return previousNotes;
      }

      return previousNotes.map((entry, index) =>
        index === nextNoteIndex ? nextNote : entry,
      );
    });

    handleCloseNoteComposer();
  }, [
    activeNoteDetail,
    activeNoteDraft,
    activeNoteKey,
    editingNoteIndex,
    getDetailRecordId,
    handleCloseNoteComposer,
    handleUpdateNotes,
    onSaveQuestionNote,
    record,
  ]);

  const handleDeleteNote = useCallback(
    async (noteIndex: number) => {
      if (!record || !activeNoteDetail || !activeNoteKey) return;

      await onSaveQuestionNote({
        id: getDetailRecordId(activeNoteDetail),
        questionId: activeNoteDetail.questionId,
        question: activeNoteDetail.question,
        selectedAnswer: activeNoteDetail.selectedAnswer || "",
        correctAnswer: activeNoteDetail.correctAnswer || "",
        note: "",
        mode: "delete",
        noteIndex,
      });

      handleUpdateNotes(activeNoteKey, (previousNotes) =>
        previousNotes.filter((_entry, index) => index !== noteIndex),
      );

      if (editingNoteIndex === null) return;
      if (editingNoteIndex === noteIndex) {
        handleCloseNoteComposer();
        return;
      }
      if (editingNoteIndex > noteIndex) {
        setEditingNoteIndex(editingNoteIndex - 1);
      }
    },
    [
      activeNoteDetail,
      activeNoteKey,
      editingNoteIndex,
      getDetailRecordId,
      handleCloseNoteComposer,
      handleUpdateNotes,
      onSaveQuestionNote,
      record,
    ],
  );

  const handleDeleteAllNotes = useCallback(async () => {
    if (!record || !activeNoteDetail || !activeNoteKey) return;

    await onSaveQuestionNote({
      id: getDetailRecordId(activeNoteDetail),
      questionId: activeNoteDetail.questionId,
      question: activeNoteDetail.question,
      selectedAnswer: activeNoteDetail.selectedAnswer || "",
      correctAnswer: activeNoteDetail.correctAnswer || "",
      note: "",
      mode: "delete",
    });

    handleUpdateNotes(activeNoteKey, () => []);
    handleCloseNoteComposer();
  }, [
    activeNoteDetail,
    activeNoteKey,
    getDetailRecordId,
    handleCloseNoteComposer,
    handleUpdateNotes,
    onSaveQuestionNote,
    record,
  ]);

  const handleNoteDraftChange = useCallback(
    (value: string) => {
      setActiveNoteDraft(value);
      if (noteValidationError) setNoteValidationError("");
    },
    [noteValidationError],
  );

  const handleStartEditWhy = useCallback(() => {
    setIsWhyComposerOpen(true);
    setActiveWhyDraft(activeWhyValue);
    setWhyValidationError("");
  }, [activeWhyValue]);

  const handleWhyDraftChange = useCallback(
    (value: string) => {
      setActiveWhyDraft(value);
      if (whyValidationError) setWhyValidationError("");
    },
    [whyValidationError],
  );

  const handleSaveActiveWhy = useCallback(async () => {
    if (!record || !activeWhyDetail || !activeWhyKey) return;

    const nextWhy = activeWhyDraft.trim();
    if (!nextWhy) {
      setWhyValidationError("Reason cannot be empty.");
      return;
    }

    await onSaveQuestionWhy({
      id: getDetailRecordId(activeWhyDetail),
      questionId: activeWhyDetail.questionId,
      question: activeWhyDetail.question,
      selectedAnswer: activeWhyDetail.selectedAnswer || "",
      correctAnswer: activeWhyDetail.correctAnswer || "",
      why: nextWhy,
      mode: "replace",
    });

    handleUpdateWhy(activeWhyKey, nextWhy);
    setActiveWhyDetail((previous) =>
      previous ? { ...previous, why: nextWhy } : previous,
    );
    setIsWhyComposerOpen(false);
    setActiveWhyDraft(nextWhy);
    setWhyValidationError("");
  }, [
    activeWhyDetail,
    activeWhyDraft,
    activeWhyKey,
    getDetailRecordId,
    handleUpdateWhy,
    onSaveQuestionWhy,
    record,
  ]);

  const handleDeleteWhy = useCallback(async () => {
    if (!record || !activeWhyDetail || !activeWhyKey) return;

    await onSaveQuestionWhy({
      id: getDetailRecordId(activeWhyDetail),
      questionId: activeWhyDetail.questionId,
      question: activeWhyDetail.question,
      selectedAnswer: activeWhyDetail.selectedAnswer || "",
      correctAnswer: activeWhyDetail.correctAnswer || "",
      why: "",
      mode: "delete",
    });

    handleUpdateWhy(activeWhyKey, "");
    setActiveWhyDetail((previous) =>
      previous ? { ...previous, why: "" } : previous,
    );
    setIsWhyComposerOpen(false);
    setActiveWhyDraft("");
    setWhyValidationError("");
  }, [
    activeWhyDetail,
    activeWhyKey,
    getDetailRecordId,
    handleUpdateWhy,
    onSaveQuestionWhy,
    record,
  ]);

  const handleDeleteGroupedAttempt = useCallback(
    async (attemptId: string) => {
      if (!attemptId || deletingAttemptIdSet.has(attemptId)) return;
      const confirmed = window.confirm(
        "Delete this attempt? It will move to the recycle bin.",
      );
      if (!confirmed) return;

      await onDeleteAttempt(attemptId);
      onClose();
    },
    [deletingAttemptIdSet, onClose, onDeleteAttempt],
  );

  const handleDeleteGroupedDate = useCallback(
    async (dateLabel: string, attemptIds: string[]) => {
      const uniqueAttemptIds = Array.from(new Set(attemptIds.filter(Boolean)));
      if (uniqueAttemptIds.length === 0) return;

      const confirmed = window.confirm(
        `Delete all attempts on ${dateLabel}? They will move to the recycle bin.`,
      );
      if (!confirmed) return;

      for (const attemptId of uniqueAttemptIds) {
        if (!deletingAttemptIdSet.has(attemptId)) {
          await onDeleteAttempt(attemptId);
        }
      }

      onClose();
    },
    [deletingAttemptIdSet, onClose, onDeleteAttempt],
  );

  useBodyScrollLock(isOpen);

  useFocusTrap({
    isActive: isOpen,
    containerRef: panelRef,
    initialFocusSelector: "button",
  });

  useFocusTrap({
    isActive: Boolean(activeNoteDetail),
    containerRef: notePanelRef,
    initialFocusSelector: "textarea, button",
  });

  useFocusTrap({
    isActive: Boolean(activeWhyDetail),
    containerRef: whyPanelRef,
    initialFocusSelector: "textarea, button",
  });

  if (!record) return null;

  const isSavingActiveNote =
    Boolean(activeNoteKey) &&
    Boolean(activeNoteDetail) &&
    savingQuestionNoteKey ===
      `${getDetailRecordId(activeNoteDetail as PracticeQuestionDetail)}::${buildDetailKey(
        activeNoteDetail as PracticeQuestionDetail,
      )}`;
  const isSavingActiveWhy =
    Boolean(activeWhyKey) &&
    Boolean(activeWhyDetail) &&
    savingQuestionNoteKey ===
      `${getDetailRecordId(activeWhyDetail as PracticeQuestionDetail)}::${buildDetailKey(
        activeWhyDetail as PracticeQuestionDetail,
      )}`;

  return createPortal(
    <>
      <div
        className="subject-popup-backdrop review-popup-backdrop"
        onClick={onClose}
      >
        <div
          ref={panelRef}
          className="subject-popup-panel glass-panel fade-slide-in review-popup-panel"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Attempt review"
          tabIndex={-1}
        >
          <ReviewPopupHeader record={record} onClose={onClose} />

          <ReviewPopupStats record={record} />

          {details.length === 0 ? (
            <p className="review-popup-empty">
              No incorrect/skipped question details are available for this
              attempt.
            </p>
          ) : (
            <section aria-live="polite">
              <ReviewPopupFilters
                reviewDateFilter={reviewDateFilter}
                reviewDateOptions={reviewDateOptions}
                reviewSortOrder={reviewSortOrder}
                onDateFilterChange={setReviewDateFilter}
                onSortOrderChange={setReviewSortOrder}
              />

              <ReviewGroupedDetails
                groupedDetails={groupedDetails}
                deletingAttemptIdSet={deletingAttemptIdSet}
                onDeleteGroupedDate={handleDeleteGroupedDate}
                onDeleteGroupedAttempt={handleDeleteGroupedAttempt}
                onOpenNote={handleOpenNoteModal}
                onOpenWhy={handleOpenWhyModal}
              />
            </section>
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
        onDeleteAllNotes={() => void handleDeleteAllNotes()}
        onStartEditNote={handleStartEditNote}
        onDeleteNote={(noteIndex) => void handleDeleteNote(noteIndex)}
        onDraftChange={handleNoteDraftChange}
        onCloseComposer={handleCloseNoteComposer}
        onSaveNote={() => void handleSaveActiveNote()}
      />

      <QuestionWhyModal
        activeWhyDetail={activeWhyDetail}
        activeWhyValue={activeWhyValue}
        isWhyComposerOpen={isWhyComposerOpen}
        whyDraft={activeWhyDraft}
        whyValidationError={whyValidationError}
        isSavingActiveWhy={isSavingActiveWhy}
        whyPanelRef={whyPanelRef}
        onCloseModal={handleCloseWhyModal}
        onStartEditWhy={handleStartEditWhy}
        onDeleteWhy={() => void handleDeleteWhy()}
        onDraftChange={handleWhyDraftChange}
        onCloseComposer={handleCloseWhyComposer}
        onSaveWhy={() => void handleSaveActiveWhy()}
      />
    </>,
    document.body,
  );
}
