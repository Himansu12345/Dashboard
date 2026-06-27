"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useBodyScrollLock from "@/hooks/useBodyScrollLock";
import useFocusTrap from "@/hooks/useFocusTrap";
import {
  summarizeRecordsBySubject,
  summarizeRecordsByTopic,
} from "@/features/dashboard/recordLedgerUtils";
import TopicNotesEditor from "@/components/popup/topic-notes/TopicNotesEditor";
import SubjectSummaryTable from "@/components/popup/topic-notes/SubjectSummaryTable";
import TopicSummaryTable from "@/components/popup/topic-notes/TopicSummaryTable";
import {
  buildTopicSources,
} from "@/components/popup/topic-notes/topicNotesUtils";
import type { PracticeRecord } from "@/types/records";

interface TopicNotesPopupProps {
  isOpen: boolean;
  records: PracticeRecord[];
  isSaving: boolean;
  onClose: () => void;
  onSaveTopicNotes: (
    actions: Array<{
      id: string;
      question: string;
      selectedAnswer: string;
      correctAnswer: string;
      note: string;
      mode?: "add" | "edit" | "delete";
      noteIndex?: number;
    }>,
  ) => Promise<void>;
}

export default function TopicNotesPopup({
  isOpen,
  records,
  isSaving,
  onClose,
  onSaveTopicNotes,
}: TopicNotesPopupProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const subjectRows = useMemo(() => summarizeRecordsBySubject(records), [records]);
  const topicRows = useMemo(
    () =>
      selectedSubject ? summarizeRecordsByTopic(records, selectedSubject) : [],
    [records, selectedSubject],
  );

  const { detailSources: topicDetailSources, noteSources: topicNoteSources } =
    useMemo(
    () =>
      selectedSubject && selectedTopic
        ? buildTopicSources(records, selectedSubject, selectedTopic)
        : { detailSources: [], noteSources: [] },
    [records, selectedSubject, selectedTopic],
  );

  const currentTopicNotes = useMemo(
    () => topicNoteSources.map((entry) => entry.text),
    [topicNoteSources],
  );
  const editorKey = useMemo(
    () =>
      selectedSubject && selectedTopic
        ? `${selectedSubject}::${selectedTopic}::${topicNoteSources
            .map((entry) => `${entry.id}:${entry.noteIndex}:${entry.text}`)
            .join("\u0001")}`
        : "topic-notes-editor",
    [selectedSubject, selectedTopic, topicNoteSources],
  );
  const hasTopicQuestionBank = topicDetailSources.length > 0;
  const canSaveTopicNotes = hasTopicQuestionBank && !isSaving;

  useBodyScrollLock(isOpen);
  useFocusTrap({
    isActive: isOpen,
    containerRef: panelRef,
    initialFocusSelector: "button, textarea",
  });

  const handleBack = useCallback(() => {
    if (selectedTopic) {
      setSelectedTopic(null);
      return;
    }

    if (selectedSubject) {
      setSelectedSubject(null);
    }
  }, [selectedSubject, selectedTopic]);

  const handleClose = useCallback(() => {
    setSelectedSubject(null);
    setSelectedTopic(null);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="subject-popup-backdrop review-popup-backdrop" onClick={handleClose}>
      <div
        ref={panelRef}
        className="subject-popup-panel glass-panel fade-slide-in review-popup-panel notes-hub-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Topic notes library"
        tabIndex={-1}
      >
        <header className="subject-popup-header review-popup-header">
          <div className="subject-popup-title-wrap">
            <p className="subject-popup-kicker">Notes Library</p>
            <h3 className="subject-popup-title">
              {selectedTopic
                ? `${selectedSubject} - ${selectedTopic}`
                : selectedSubject || "Subjects"}
            </h3>
            <p className="subject-popup-subtitle">
              {selectedTopic
                ? "Edit one combined note sheet for everything you saved earlier in this topic."
                : selectedSubject
                  ? `Showing only topics you attempted under ${selectedSubject}.`
                  : "Open any subject you have attempted before, then drill into attempted topics and edit saved learning notes for wrong questions."}
            </p>
          </div>
          <div className="notes-hub-header-actions">
            {selectedSubject ? (
              <button
                type="button"
                className="action-btn action-btn-secondary ripple-btn"
                onClick={handleBack}
              >
                Back
              </button>
            ) : null}
            <button
              type="button"
              className="subject-popup-close ripple-btn"
              onClick={handleClose}
              aria-label="Close notes popup"
            >
              X
            </button>
          </div>
        </header>

        {!selectedSubject ? (
          <SubjectSummaryTable
            rows={subjectRows}
            onSelectSubject={setSelectedSubject}
          />
        ) : null}
        {selectedSubject && !selectedTopic ? (
          <TopicSummaryTable rows={topicRows} onSelectTopic={setSelectedTopic} />
        ) : null}
        {selectedTopic && selectedSubject ? (
          <TopicNotesEditor
            key={editorKey}
            selectedSubject={selectedSubject}
            selectedTopic={selectedTopic}
            testCount={topicRows.find((row) => row.label === selectedTopic)?.testCount || 0}
            topicDetailSources={topicDetailSources}
            currentTopicNotes={currentTopicNotes}
            topicNoteSources={topicNoteSources}
            hasTopicQuestionBank={hasTopicQuestionBank}
            isSaving={isSaving}
            canSaveTopicNotes={canSaveTopicNotes}
            onBack={handleBack}
            onSaveTopicNotes={onSaveTopicNotes}
          />
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
