"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppMotionBackdrop } from "@/app/components/AppMotionBackdrop";
import { AppPopups } from "@/app/components/AppPopups";
import { AppToast } from "@/app/components/AppToast";
import { DashboardStage } from "@/app/components/DashboardStage";
import { fetchConsistencyDashboard } from "@/lib/api/consistency";
import { fetchSyllabusDashboard } from "@/lib/api/syllabus";
import {
  deleteAttempt,
  fetchDeletedAttempts,
  fetchAttempts,
  mapAttemptToPracticeRecord,
  permanentlyDeleteAttempt,
  restoreAttempt,
  updateAttemptClassification,
  updateAttemptQuestionNote,
  type AttemptResponse,
} from "@/lib/api/attempts";
import {
  fetchRevisionDashboard,
  reviewRevisionTopic,
} from "@/lib/api/revision";
import { flushPendingAttemptQueue } from "@/lib/quiz/attemptQueue";
import {
  areRecordsEquivalent,
  buildQuestionDetailKey,
  withUpdatedQuestionNote,
} from "@/app/appClientUtils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setRecords as setRecordsAction } from "@/store/slices/recordsSlice";
import {
  closeConsistencyPopup,
  closeSyllabusPopup,
  openConsistencyPopup,
  openSyllabusPopup,
  setConsistencyPopupTab,
  setSyllabusPopupTab,
  setNotesPopupOpen,
} from "@/store/slices/uiSlice";
import { topicsBySubject } from "@/lib/data/topics";
import type { ConsistencyTab } from "@/types/consistency";
import type { SyllabusTab } from "@/types/syllabus";
import type {
  RevisionDashboardPayload,
  RevisionReviewOutcome,
} from "@/types/revision";

const ATTEMPTS_QUERY_KEY = ["attempts"] as const;
const RECYCLE_BIN_QUERY_KEY = ["attempts", "recycle-bin"] as const;
const REVISION_DASHBOARD_QUERY_KEY = ["revision-dashboard"] as const;
const CONSISTENCY_DASHBOARD_QUERY_KEY = ["consistency-dashboard"] as const;
const SYLLABUS_DASHBOARD_QUERY_KEY = ["syllabus-dashboard"] as const;
const PLACEHOLDER_CLASSIFICATION_VALUES = new Set([
  "",
  "unknown",
  "unknown subject",
  "unknown topic",
  "unclassified",
  "uncategorized",
  "n/a",
  "na",
  "none",
  "null",
]);

function normalizeClassificationValue(
  value: string | null | undefined,
): string {
  return String(value || "").trim();
}

function isPlaceholderClassificationValue(
  value: string | null | undefined,
): boolean {
  return PLACEHOLDER_CLASSIFICATION_VALUES.has(
    normalizeClassificationValue(value).toLowerCase(),
  );
}

function isAttemptMissingClassification(attempt: AttemptResponse): boolean {
  const subject = normalizeClassificationValue(attempt.subject);
  const topic = normalizeClassificationValue(attempt.topic);

  if (
    isPlaceholderClassificationValue(subject) ||
    isPlaceholderClassificationValue(topic)
  ) {
    return true;
  }

  const topicOptions = topicsBySubject[subject];
  if (!Array.isArray(topicOptions) || topicOptions.length === 0) {
    return true;
  }

  return !topicOptions.includes(topic);
}

type ToastState = {
  id: number;
  type: "success" | "error";
  message: string;
};

export default function AppClient() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const records = useAppSelector((state) => state.records.records);
  const isNotesPopupOpen = useAppSelector((state) => state.ui.isNotesPopupOpen);
  const isConsistencyPopupOpen = useAppSelector(
    (state) => state.ui.isConsistencyPopupOpen,
  );
  const consistencyPopupTab = useAppSelector(
    (state) => state.ui.consistencyPopupTab,
  );
  const isSyllabusPopupOpen = useAppSelector(
    (state) => state.ui.isSyllabusPopupOpen,
  );
  const syllabusPopupTab = useAppSelector((state) => state.ui.syllabusPopupTab);
  const [lastProcessedAttemptId, setLastProcessedAttemptId] = useState<
    string | null
  >(null);
  const [classificationTargetId, setClassificationTargetId] = useState<
    string | null
  >(null);
  const [classificationError, setClassificationError] = useState("");
  const [toast, setToast] = useState<ToastState | null>(null);
  const deletingAttemptIdsRef = useRef<Set<string>>(new Set());
  const [deletingAttemptIds, setDeletingAttemptIds] = useState<string[]>([]);
  const restoringAttemptIdsRef = useRef<Set<string>>(new Set());
  const [restoringAttemptIds, setRestoringAttemptIds] = useState<string[]>([]);
  const permanentlyDeletingAttemptIdsRef = useRef<Set<string>>(new Set());
  const [permanentlyDeletingAttemptIds, setPermanentlyDeletingAttemptIds] =
    useState<string[]>([]);
  const [savingQuestionNoteKey, setSavingQuestionNoteKey] = useState<
    string | null
  >(null);
  const [isTopicNotesSaving, setIsTopicNotesSaving] = useState(false);
  const [reviewingRevisionTopicId, setReviewingRevisionTopicId] = useState<
    string | null
  >(null);
  const lastFetchErrorRef = useRef("");

  const deleteAttemptMutation = useMutation({
    mutationFn: deleteAttempt,
  });

  const restoreAttemptMutation = useMutation({
    mutationFn: restoreAttempt,
  });

  const permanentlyDeleteAttemptMutation = useMutation({
    mutationFn: permanentlyDeleteAttempt,
  });

  const classifyAttemptMutation = useMutation({
    mutationFn: updateAttemptClassification,
  });

  const updateQuestionNoteMutation = useMutation({
    mutationFn: updateAttemptQuestionNote,
  });

  const reviewRevisionTopicMutation = useMutation({
    mutationFn: reviewRevisionTopic,
  });

  const attemptsQuery = useQuery({
    queryKey: ATTEMPTS_QUERY_KEY,
    queryFn: fetchAttempts,
    staleTime: 30000,
  });

  const recycleBinQuery = useQuery({
    queryKey: RECYCLE_BIN_QUERY_KEY,
    queryFn: fetchDeletedAttempts,
    staleTime: 30000,
  });

  const revisionDashboardQuery = useQuery({
    queryKey: REVISION_DASHBOARD_QUERY_KEY,
    queryFn: fetchRevisionDashboard,
    staleTime: 30000,
  });

  const consistencyDashboardQuery = useQuery({
    queryKey: CONSISTENCY_DASHBOARD_QUERY_KEY,
    queryFn: fetchConsistencyDashboard,
    staleTime: 30000,
  });

  const syllabusDashboardQuery = useQuery({
    queryKey: SYLLABUS_DASHBOARD_QUERY_KEY,
    queryFn: fetchSyllabusDashboard,
    staleTime: 30000,
  });

  const attempts = useMemo(
    () => attemptsQuery.data ?? [],
    [attemptsQuery.data],
  );
  const recycleBinAttempts = useMemo(
    () => recycleBinQuery.data ?? [],
    [recycleBinQuery.data],
  );

  const mappedRecords = useMemo(
    () => attempts.map((attempt) => mapAttemptToPracticeRecord(attempt)),
    [attempts],
  );
  const mappedDeletedRecords = useMemo(
    () =>
      recycleBinAttempts.map((attempt) => mapAttemptToPracticeRecord(attempt)),
    [recycleBinAttempts],
  );

  const showToast = useCallback((type: ToastState["type"], message: string) => {
    setToast({ id: Date.now(), type, message });
  }, []);

  const refreshQueries = useCallback(
    async (
      queryKeys: ReadonlyArray<readonly string[]>,
      refetchType: "active" | "all" = "active",
    ) => {
      await Promise.all(
        queryKeys.map((queryKey) =>
          queryClient.invalidateQueries({
            queryKey: [...queryKey],
            refetchType,
          }),
        ),
      );
    },
    [queryClient],
  );

  const refreshPracticeQueries = useCallback(
    async () =>
      refreshQueries([
        ATTEMPTS_QUERY_KEY,
        RECYCLE_BIN_QUERY_KEY,
        REVISION_DASHBOARD_QUERY_KEY,
        CONSISTENCY_DASHBOARD_QUERY_KEY,
        SYLLABUS_DASHBOARD_QUERY_KEY,
      ]),
    [refreshQueries],
  );

  const refreshDerivedDashboardQueries = useCallback(
    async () =>
      refreshQueries([
        REVISION_DASHBOARD_QUERY_KEY,
        CONSISTENCY_DASHBOARD_QUERY_KEY,
        SYLLABUS_DASHBOARD_QUERY_KEY,
      ]),
    [refreshQueries],
  );

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => {
      setToast((previous) => (previous?.id === toast.id ? null : previous));
    }, 3200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

  useEffect(() => {
    const queryError = attemptsQuery.error;
    if (!queryError) {
      lastFetchErrorRef.current = "";
      return;
    }

    const message =
      queryError instanceof Error
        ? queryError.message
        : "Unable to fetch attempts";
    if (lastFetchErrorRef.current === message) return;

    lastFetchErrorRef.current = message;
    showToast("error", message);
  }, [attemptsQuery.error, showToast]);

  useEffect(() => {
    const queryError = recycleBinQuery.error;
    if (!queryError) return;

    const message =
      queryError instanceof Error
        ? queryError.message
        : "Unable to fetch recycle bin attempts";
    if (lastFetchErrorRef.current === message) return;

    lastFetchErrorRef.current = message;
    showToast("error", message);
  }, [recycleBinQuery.error, showToast]);

  useEffect(() => {
    const queryError = revisionDashboardQuery.error;
    if (!queryError) return;

    const message =
      queryError instanceof Error
        ? queryError.message
        : "Unable to fetch revision dashboard";
    if (lastFetchErrorRef.current === message) return;

    lastFetchErrorRef.current = message;
    showToast("error", message);
  }, [revisionDashboardQuery.error, showToast]);

  useEffect(() => {
    const queryError = consistencyDashboardQuery.error;
    if (!queryError) return;

    const message =
      queryError instanceof Error
        ? queryError.message
        : "Unable to fetch consistency dashboard";
    if (lastFetchErrorRef.current === message) return;

    lastFetchErrorRef.current = message;
    showToast("error", message);
  }, [consistencyDashboardQuery.error, showToast]);

  useEffect(() => {
    const queryError = syllabusDashboardQuery.error;
    if (!queryError) return;

    const message =
      queryError instanceof Error
        ? queryError.message
        : "Unable to fetch syllabus dashboard";
    if (lastFetchErrorRef.current === message) return;

    lastFetchErrorRef.current = message;
    showToast("error", message);
  }, [showToast, syllabusDashboardQuery.error]);

  // useEffect(() => {
  //   if (areRecordsEquivalent(records, mappedRecords)) return;
  //   dispatch(setRecordsAction(mappedRecords));
  // }, [dispatch, mappedRecords, records]);

  useEffect(() => {
    let isDisposed = false;

    async function syncPendingAttempts() {
      const result = await flushPendingAttemptQueue();
      if (isDisposed || result.syncedCount === 0) return;
      await refreshPracticeQueries();
      showToast(
        "success",
        result.syncedCount === 1
          ? "1 queued attempt synced."
          : `${result.syncedCount} queued attempts synced.`,
      );
    }

    void syncPendingAttempts();
    window.addEventListener("online", syncPendingAttempts);

    return () => {
      isDisposed = true;
      window.removeEventListener("online", syncPendingAttempts);
    };
  }, [refreshPracticeQueries, showToast]);

  const unclassifiedAttempt = useMemo(() => {
    if (!Array.isArray(attempts) || attempts.length === 0) return null;

    if (classificationTargetId) {
      const inFlightAttempt = attempts.find(
        (attempt) => attempt._id === classificationTargetId,
      );
      if (inFlightAttempt && isAttemptMissingClassification(inFlightAttempt)) {
        return inFlightAttempt;
      }
      return null;
    }

    const newestUnclassifiedAttempt = attempts.find((attempt) =>
      isAttemptMissingClassification(attempt),
    );
    if (!newestUnclassifiedAttempt) return null;

    if (newestUnclassifiedAttempt._id === lastProcessedAttemptId) {
      return null;
    }

    return newestUnclassifiedAttempt;
  }, [attempts, classificationTargetId, lastProcessedAttemptId]);

  useEffect(() => {
    setClassificationError((previous) => (previous ? "" : previous));
  }, [unclassifiedAttempt?._id]);

  const handleDeleteAttempt = useCallback(
    async (id: string) => {
      if (!id) return;
      if (deletingAttemptIdsRef.current.has(id)) return;

      deletingAttemptIdsRef.current.add(id);
      setDeletingAttemptIds(Array.from(deletingAttemptIdsRef.current));

      await queryClient.cancelQueries({ queryKey: ATTEMPTS_QUERY_KEY });

      const previousAttempts =
        queryClient.getQueryData<AttemptResponse[]>(ATTEMPTS_QUERY_KEY) || [];

      queryClient.setQueryData<AttemptResponse[]>(
        ATTEMPTS_QUERY_KEY,
        previousAttempts.filter((attempt) => attempt._id !== id),
      );

      try {
        await deleteAttemptMutation.mutateAsync(id);
        showToast("success", "Attempt moved to recycle bin.");
      } catch (error) {
        queryClient.setQueryData(ATTEMPTS_QUERY_KEY, previousAttempts);
        showToast(
          "error",
          error instanceof Error ? error.message : "Unable to delete attempt.",
        );
      } finally {
        deletingAttemptIdsRef.current.delete(id);
        setDeletingAttemptIds(Array.from(deletingAttemptIdsRef.current));
        await refreshPracticeQueries();
      }
    },
    [deleteAttemptMutation, queryClient, refreshPracticeQueries, showToast],
  );

  const handleRestoreAttempt = useCallback(
    async (id: string) => {
      if (!id) return;
      if (restoringAttemptIdsRef.current.has(id)) return;

      restoringAttemptIdsRef.current.add(id);
      setRestoringAttemptIds(Array.from(restoringAttemptIdsRef.current));

      try {
        await restoreAttemptMutation.mutateAsync(id);
        showToast("success", "Attempt restored from recycle bin.");
      } catch (error) {
        showToast(
          "error",
          error instanceof Error ? error.message : "Unable to restore attempt.",
        );
      } finally {
        restoringAttemptIdsRef.current.delete(id);
        setRestoringAttemptIds(Array.from(restoringAttemptIdsRef.current));
        await refreshPracticeQueries();
      }
    },
    [refreshPracticeQueries, restoreAttemptMutation, showToast],
  );

  const handlePermanentlyDeleteAttempt = useCallback(
    async (id: string) => {
      if (!id) return;
      if (permanentlyDeletingAttemptIdsRef.current.has(id)) return;

      permanentlyDeletingAttemptIdsRef.current.add(id);
      setPermanentlyDeletingAttemptIds(
        Array.from(permanentlyDeletingAttemptIdsRef.current),
      );

      await queryClient.cancelQueries({
        queryKey: RECYCLE_BIN_QUERY_KEY,
      });
      const previousRecycleBinAttempts =
        queryClient.getQueryData<AttemptResponse[]>(RECYCLE_BIN_QUERY_KEY) ||
        [];

      queryClient.setQueryData<AttemptResponse[]>(
        RECYCLE_BIN_QUERY_KEY,
        previousRecycleBinAttempts.filter((attempt) => attempt._id !== id),
      );

      try {
        await permanentlyDeleteAttemptMutation.mutateAsync(id);
        showToast("success", "Attempt permanently deleted from recycle bin.");
      } catch (error) {
        queryClient.setQueryData(
          RECYCLE_BIN_QUERY_KEY,
          previousRecycleBinAttempts,
        );
        showToast(
          "error",
          error instanceof Error
            ? error.message
            : "Unable to permanently delete attempt.",
        );
      } finally {
        permanentlyDeletingAttemptIdsRef.current.delete(id);
        setPermanentlyDeletingAttemptIds(
          Array.from(permanentlyDeletingAttemptIdsRef.current),
        );
        await refreshPracticeQueries();
      }
    },
    [
      permanentlyDeleteAttemptMutation,
      queryClient,
      refreshPracticeQueries,
      showToast,
    ],
  );

  const handleSaveQuestionNote = useCallback(
    async ({
      id,
      questionId,
      question,
      selectedAnswer,
      correctAnswer,
      note,
      mode = "replace",
      noteIndex,
    }: {
      id: string;
      questionId?: string;
      question: string;
      selectedAnswer: string;
      correctAnswer: string;
      note: string;
      mode?: "add" | "edit" | "replace" | "delete";
      noteIndex?: number;
    }) => {
      const noteKey = buildQuestionDetailKey({
        questionId,
        question,
        selectedAnswer,
        correctAnswer,
      });
      setSavingQuestionNoteKey(`${id}::${noteKey}`);

      await queryClient.cancelQueries({ queryKey: ATTEMPTS_QUERY_KEY });
      const previousAttempts =
        queryClient.getQueryData<AttemptResponse[]>(ATTEMPTS_QUERY_KEY) || [];

      queryClient.setQueryData<AttemptResponse[]>(
        ATTEMPTS_QUERY_KEY,
        previousAttempts.map((attempt) =>
          attempt._id === id
            ? withUpdatedQuestionNote(attempt, {
                questionId,
                question,
                selectedAnswer,
                correctAnswer,
                note,
                mode,
                noteIndex,
              })
            : attempt,
        ),
      );

      try {
        const updatedAttempt = await updateQuestionNoteMutation.mutateAsync({
          id,
          questionId,
          question,
          selectedAnswer,
          correctAnswer,
          note,
          mode,
          noteIndex,
        });

        queryClient.setQueryData<AttemptResponse[]>(
          ATTEMPTS_QUERY_KEY,
          (currentAttempts = []) =>
            currentAttempts.map((attempt) =>
              attempt._id === updatedAttempt._id ? updatedAttempt : attempt,
            ),
        );

        showToast("success", "Question note saved.");
      } catch (error) {
        queryClient.setQueryData(ATTEMPTS_QUERY_KEY, previousAttempts);
        showToast(
          "error",
          error instanceof Error
            ? error.message
            : "Unable to save question note.",
        );
      } finally {
        setSavingQuestionNoteKey(null);
        await refreshQueries([
          ATTEMPTS_QUERY_KEY,
          REVISION_DASHBOARD_QUERY_KEY,
        ]);
      }
    },
    [queryClient, refreshQueries, showToast, updateQuestionNoteMutation],
  );

  const handleCloseNotesPopup = useCallback(() => {
    dispatch(setNotesPopupOpen(false));
  }, [dispatch]);

  const handleSaveQuestionWhy = useCallback(
    async ({
      id,
      questionId,
      question,
      selectedAnswer,
      correctAnswer,
      why,
      mode = "replace",
    }: {
      id: string;
      questionId?: string;
      question: string;
      selectedAnswer: string;
      correctAnswer: string;
      why: string;
      mode?: "replace" | "delete";
    }) => {
      const noteKey = buildQuestionDetailKey({
        questionId,
        question,
        selectedAnswer,
        correctAnswer,
      });
      setSavingQuestionNoteKey(`${id}::${noteKey}`);

      await queryClient.cancelQueries({ queryKey: ATTEMPTS_QUERY_KEY });
      const previousAttempts =
        queryClient.getQueryData<AttemptResponse[]>(ATTEMPTS_QUERY_KEY) || [];

      queryClient.setQueryData<AttemptResponse[]>(
        ATTEMPTS_QUERY_KEY,
        previousAttempts.map((attempt) =>
          attempt._id === id
            ? withUpdatedQuestionNote(attempt, {
                questionId,
                question,
                selectedAnswer,
                correctAnswer,
                note: why,
                field: "why",
                mode,
              })
            : attempt,
        ),
      );

      try {
        const updatedAttempt = await updateQuestionNoteMutation.mutateAsync({
          id,
          questionId,
          question,
          selectedAnswer,
          correctAnswer,
          note: why,
          field: "why",
          mode,
        });

        queryClient.setQueryData<AttemptResponse[]>(
          ATTEMPTS_QUERY_KEY,
          (currentAttempts = []) =>
            currentAttempts.map((attempt) =>
              attempt._id === updatedAttempt._id ? updatedAttempt : attempt,
            ),
        );

        showToast(
          "success",
          mode === "delete" ? "Why reason deleted." : "Why reason saved.",
        );
      } catch (error) {
        queryClient.setQueryData(ATTEMPTS_QUERY_KEY, previousAttempts);
        showToast(
          "error",
          error instanceof Error ? error.message : "Unable to save why reason.",
        );
      } finally {
        setSavingQuestionNoteKey(null);
        await refreshQueries([
          ATTEMPTS_QUERY_KEY,
          REVISION_DASHBOARD_QUERY_KEY,
        ]);
      }
    },
    [queryClient, refreshQueries, showToast, updateQuestionNoteMutation],
  );

  const handleSaveTopicNotes = useCallback(
    async (
      actions: Array<{
        id: string;
        question: string;
        selectedAnswer: string;
        correctAnswer: string;
        note: string;
        mode?: "add" | "edit" | "delete";
        noteIndex?: number;
      }>,
    ) => {
      setIsTopicNotesSaving(true);

      try {
        for (const action of actions) {
          await updateQuestionNoteMutation.mutateAsync({
            id: action.id,
            question: action.question,
            selectedAnswer: action.selectedAnswer,
            correctAnswer: action.correctAnswer,
            note: action.note,
            mode: action.mode,
            noteIndex: action.noteIndex,
          });
        }

        showToast("success", "Topic notes saved.");
      } catch (error) {
        showToast(
          "error",
          error instanceof Error
            ? error.message
            : "Unable to save topic notes.",
        );
        throw error;
      } finally {
        setIsTopicNotesSaving(false);
        await refreshQueries([
          ATTEMPTS_QUERY_KEY,
          REVISION_DASHBOARD_QUERY_KEY,
        ]);
      }
    },
    [refreshQueries, showToast, updateQuestionNoteMutation],
  );

  const handleConfirmClassification = useCallback(
    async ({
      id,
      subject,
      topic,
      subtopic,
      difficulty,
    }: {
      id: string;
      subject: string;
      topic: string;
      subtopic: string | null;
      difficulty: string;
    }) => {
      if (classifyAttemptMutation.isPending) return;
      setClassificationError("");
      setClassificationTargetId(id);

      try {
        await classifyAttemptMutation.mutateAsync({
          id,
          subject,
          topic,
          subtopic,
          difficulty,
        });
        setLastProcessedAttemptId(id);
        showToast("success", "Attempt classification saved.");
        await refreshQueries([
          ATTEMPTS_QUERY_KEY,
          REVISION_DASHBOARD_QUERY_KEY,
          CONSISTENCY_DASHBOARD_QUERY_KEY,
          SYLLABUS_DASHBOARD_QUERY_KEY,
        ]);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to classify attempt.";
        setClassificationError(message);
        showToast("error", message);
        throw error;
      } finally {
        setClassificationTargetId(null);
      }
    },
    [classifyAttemptMutation, refreshQueries, showToast],
  );

  const handleReviewRevisionTopic = useCallback(
    async ({ id, outcome }: { id: string; outcome: RevisionReviewOutcome }) => {
      if (!id) return;
      setReviewingRevisionTopicId(id);

      await queryClient.cancelQueries({
        queryKey: REVISION_DASHBOARD_QUERY_KEY,
      });
      const previousDashboard =
        queryClient.getQueryData<RevisionDashboardPayload>(
          REVISION_DASHBOARD_QUERY_KEY,
        );

      try {
        const updatedTopic = await reviewRevisionTopicMutation.mutateAsync({
          id,
          outcome,
        });
        queryClient.setQueryData<RevisionDashboardPayload | undefined>(
          REVISION_DASHBOARD_QUERY_KEY,
          (currentDashboard) => {
            if (!currentDashboard) return currentDashboard;
            const replaceTopic = (
              topics: RevisionDashboardPayload["queueTopics"],
            ) =>
              topics.map((topic) =>
                topic.id === updatedTopic.id ? updatedTopic : topic,
              );

            return {
              ...currentDashboard,
              queueTopics: replaceTopic(currentDashboard.queueTopics),
              fadingTopics: replaceTopic(currentDashboard.fadingTopics),
              overdueTopics: replaceTopic(currentDashboard.overdueTopics),
              recentlyStrengthenedTopics: replaceTopic(
                currentDashboard.recentlyStrengthenedTopics,
              ),
              allTopics: replaceTopic(currentDashboard.allTopics),
            };
          },
        );
        showToast(
          "success",
          outcome === "correct"
            ? "Revision topic strengthened."
            : "Revision topic re-queued urgently.",
        );
        await refreshDerivedDashboardQueries();
      } catch (error) {
        queryClient.setQueryData(
          REVISION_DASHBOARD_QUERY_KEY,
          previousDashboard,
        );
        showToast(
          "error",
          error instanceof Error
            ? error.message
            : "Unable to record revision review.",
        );
      } finally {
        setReviewingRevisionTopicId(null);
      }
    },
    [
      queryClient,
      refreshDerivedDashboardQueries,
      reviewRevisionTopicMutation,
      showToast,
    ],
  );

  const handleOpenConsistency = useCallback(
    (tab: ConsistencyTab) => {
      dispatch(openConsistencyPopup(tab));
    },
    [dispatch],
  );

  const handleCloseConsistency = useCallback(() => {
    dispatch(closeConsistencyPopup());
  }, [dispatch]);

  const handleConsistencyTabChange = useCallback(
    (tab: ConsistencyTab) => {
      dispatch(setConsistencyPopupTab(tab));
    },
    [dispatch],
  );

  const handleOpenSyllabus = useCallback(
    (tab: SyllabusTab) => {
      dispatch(openSyllabusPopup(tab));
    },
    [dispatch],
  );

  const handleCloseSyllabus = useCallback(() => {
    dispatch(closeSyllabusPopup());
  }, [dispatch]);

  const handleSyllabusTabChange = useCallback(
    (tab: SyllabusTab) => {
      dispatch(setSyllabusPopupTab(tab));
    },
    [dispatch],
  );

  return (
    <div className="app-shell">
      <AppMotionBackdrop />
      <AppToast toast={toast} />

      <DashboardStage
        records={records}
        onDeleteAttempt={handleDeleteAttempt}
        onRestoreAttempt={handleRestoreAttempt}
        onPermanentlyDeleteAttempt={handlePermanentlyDeleteAttempt}
        onSaveQuestionNote={handleSaveQuestionNote}
        onSaveQuestionWhy={handleSaveQuestionWhy}
        deletingAttemptIds={deletingAttemptIds}
        restoringAttemptIds={restoringAttemptIds}
        permanentlyDeletingAttemptIds={permanentlyDeletingAttemptIds}
        savingQuestionNoteKey={savingQuestionNoteKey}
        recycleBinRecords={mappedDeletedRecords}
        revisionDashboard={revisionDashboardQuery.data ?? null}
        isRevisionLoading={revisionDashboardQuery.isLoading}
        isRevisionRefreshing={
          revisionDashboardQuery.isFetching && !revisionDashboardQuery.isLoading
        }
        reviewingRevisionTopicId={reviewingRevisionTopicId}
        onReviewRevisionTopic={handleReviewRevisionTopic}
        consistencySummary={consistencyDashboardQuery.data?.summary ?? null}
        consistencyDashboard={consistencyDashboardQuery.data ?? null}
        isConsistencyLoading={consistencyDashboardQuery.isLoading}
        isConsistencyRefreshing={
          consistencyDashboardQuery.isFetching &&
          !consistencyDashboardQuery.isLoading
        }
        onOpenConsistency={() => handleOpenConsistency("overview")}
        onOpenSyllabus={() => handleOpenSyllabus("overview")}
        syllabusSummary={syllabusDashboardQuery.data?.summary ?? null}
        syllabusDashboard={syllabusDashboardQuery.data ?? null}
        isSyllabusLoading={syllabusDashboardQuery.isLoading}
        isSyllabusRefreshing={
          syllabusDashboardQuery.isFetching && !syllabusDashboardQuery.isLoading
        }
        isLoading={attemptsQuery.isLoading}
        isRecycleBinLoading={recycleBinQuery.isLoading}
        isRefreshing={attemptsQuery.isFetching && !attemptsQuery.isLoading}
      />

      <AppPopups
        classificationKey={unclassifiedAttempt?._id || "classified"}
        classification={{
          attempt: unclassifiedAttempt,
          isSubmitting: classifyAttemptMutation.isPending,
          errorMessage: classificationError,
          onConfirm: handleConfirmClassification,
        }}
        topicNotes={{
          isOpen: isNotesPopupOpen,
          records,
          isSaving: isTopicNotesSaving,
          onClose: handleCloseNotesPopup,
          onSaveTopicNotes: handleSaveTopicNotes,
        }}
        consistency={{
          isOpen: isConsistencyPopupOpen,
          dashboard: consistencyDashboardQuery.data ?? null,
          isLoading: consistencyDashboardQuery.isLoading,
          isRefreshing:
            consistencyDashboardQuery.isFetching &&
            !consistencyDashboardQuery.isLoading,
          activeTab: consistencyPopupTab,
          onTabChange: handleConsistencyTabChange,
          onClose: handleCloseConsistency,
        }}
        syllabus={{
          isOpen: isSyllabusPopupOpen,
          dashboard: syllabusDashboardQuery.data ?? null,
          attempts,
          isLoading: syllabusDashboardQuery.isLoading,
          isRefreshing:
            syllabusDashboardQuery.isFetching &&
            !syllabusDashboardQuery.isLoading,
          activeTab: syllabusPopupTab,
          onTabChange: handleSyllabusTabChange,
          onClose: handleCloseSyllabus,
        }}
      />
    </div>
  );
}
