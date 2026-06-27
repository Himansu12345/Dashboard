import { memo, useCallback, useState } from "react";
import {
  areArraysEqual,
  buildTopicSaveActions,
  formatTopicNotesWithNumbering,
  normalizeTopicNoteBlocks,
} from "./topicNotesUtils";
import type { TopicDetailSource, TopicNoteSource } from "./topicNotesTypes";

interface TopicNotesEditorProps {
  selectedSubject: string;
  selectedTopic: string;
  testCount: number;
  topicDetailSources: TopicDetailSource[];
  currentTopicNotes: string[];
  topicNoteSources: TopicNoteSource[];
  hasTopicQuestionBank: boolean;
  isSaving: boolean;
  canSaveTopicNotes: boolean;
  onBack: () => void;
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

function TopicNotesEditor({
  selectedSubject,
  selectedTopic,
  testCount,
  topicDetailSources,
  currentTopicNotes,
  topicNoteSources,
  hasTopicQuestionBank,
  isSaving,
  canSaveTopicNotes,
  onBack,
  onSaveTopicNotes,
}: TopicNotesEditorProps) {
  const [editorDraft, setEditorDraft] = useState(() =>
    formatTopicNotesWithNumbering(currentTopicNotes),
  );
  const [validationError, setValidationError] = useState("");

  const handleSave = useCallback(async () => {
    if (!hasTopicQuestionBank) {
      setValidationError("No wrong-question records are available for this topic.");
      return;
    }

    const nextNotes = normalizeTopicNoteBlocks(editorDraft);
    if (editorDraft.trim().length > 0 && nextNotes.length === 0) {
      setValidationError("Write notes as text blocks separated by blank lines.");
      return;
    }

    if (areArraysEqual(currentTopicNotes, nextNotes)) {
      setValidationError("No note changes to save.");
      return;
    }

    setValidationError("");

    const actions = buildTopicSaveActions(
      topicNoteSources,
      topicDetailSources,
      editorDraft,
    );

    await onSaveTopicNotes(actions);
  }, [
    currentTopicNotes,
    editorDraft,
    hasTopicQuestionBank,
    onSaveTopicNotes,
    topicDetailSources,
    topicNoteSources,
  ]);

  return (
    <section className="note-editor-content notes-hub-editor">
      <div className="notes-hub-summary">
        <span className="hero-chip muted">{testCount} tests</span>
        <span className="hero-chip muted">{topicDetailSources.length} wrong/skipped questions</span>
        <span className="hero-chip muted">{currentTopicNotes.length} saved note blocks</span>
      </div>

      <p className="note-viewer-empty notes-hub-helper">
        This editor shows only the notes you previously saved for wrong or skipped questions in this topic. Separate individual note blocks with a blank line.
      </p>

      {!hasTopicQuestionBank ? (
        <p className="review-popup-empty">
          No wrong-question records are available for this topic yet, so there is nothing to attach notes to.
        </p>
      ) : null}

      <label className="review-note-label" htmlFor="topic-notes-editor">
        {selectedSubject} - {selectedTopic}
      </label>
      <textarea
        id="topic-notes-editor"
        className="review-note-input note-editor-input notes-hub-textarea"
        rows={16}
        value={editorDraft}
        onChange={(event) => {
          setEditorDraft(event.target.value);
          if (validationError) setValidationError("");
        }}
        placeholder="Saved topic notes will appear here. Add or remove note blocks and save."
      />
      {validationError ? <p className="note-editor-error">{validationError}</p> : null}
      <div className="note-editor-actions">
        <button
          type="button"
          className="action-btn action-btn-secondary ripple-btn"
          onClick={onBack}
          disabled={isSaving}
        >
          Back
        </button>
        <button
          type="button"
          className="review-btn ripple-btn"
          onClick={() => void handleSave()}
          disabled={!canSaveTopicNotes}
        >
          {isSaving ? "Saving..." : "Save Notes"}
        </button>
      </div>
    </section>
  );
}

export default memo(TopicNotesEditor);
