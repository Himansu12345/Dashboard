"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useBodyScrollLock from "@/hooks/useBodyScrollLock";
import useFocusTrap from "@/hooks/useFocusTrap";
import {
  fetchSyllabusTopicNotes,
  saveSyllabusTopicNotes,
} from "@/lib/api/syllabusTopicNotes";
import type {
  SyllabusTopicNoteDocument,
  SyllabusTopicNoteTarget,
} from "@/types/syllabus";

interface SyllabusTopicNotesPopupProps {
  target: SyllabusTopicNoteTarget | null;
  onClose: () => void;
}

export default function SyllabusTopicNotesPopup({
  target,
  onClose,
}: SyllabusTopicNotesPopupProps) {
  const isOpen = Boolean(target);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [documentState, setDocumentState] = useState<SyllabusTopicNoteDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

  useBodyScrollLock(isOpen);
  useFocusTrap({
    isActive: isOpen,
    containerRef: panelRef,
    initialFocusSelector: "button, textarea",
  });

  useEffect(() => {
    if (!target) return;

    let isCancelled = false;
    setIsLoading(true);
    setErrorMessage("");
    setIsComposerOpen(false);
    setEditingNoteIndex(null);
    setDraft("");

    void fetchSyllabusTopicNotes(target)
      .then((response) => {
        if (isCancelled) return;
        setDocumentState({
          ...response,
          topicLabel: response.topicLabel || target.topicLabel,
          path: response.path.length > 0 ? response.path : target.path,
        });
      })
      .catch((error) => {
        if (isCancelled) return;
        setDocumentState({
          ...target,
          notes: [],
          createdAt: null,
          updatedAt: null,
        });
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load syllabus topic notes.",
        );
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [target]);

  const activeNotes = documentState?.notes || [];
  const breadcrumb = useMemo(() => {
    if (!documentState) return "";
    const safePath = documentState.path.length > 0 ? documentState.path : [documentState.subject, documentState.topicLabel];
    return safePath.join(" > ");
  }, [documentState]);

  async function persistNotes(nextNotes: string[]) {
    if (!documentState) return;

    setIsSaving(true);
    setErrorMessage("");
    try {
      const saved = await saveSyllabusTopicNotes({
        subject: documentState.subject,
        topicKey: documentState.topicKey,
        topicLabel: documentState.topicLabel,
        path: documentState.path,
        notes: nextNotes,
      });
      setDocumentState(saved);
      setIsComposerOpen(false);
      setEditingNoteIndex(null);
      setDraft("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save syllabus topic notes.",
      );
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  function handleStartAddNote() {
    setEditingNoteIndex(null);
    setDraft("");
    setErrorMessage("");
    setIsComposerOpen(true);
  }

  function handleStartEditNote(noteIndex: number) {
    setEditingNoteIndex(noteIndex);
    setDraft(activeNotes[noteIndex] || "");
    setErrorMessage("");
    setIsComposerOpen(true);
  }

  async function handleDeleteNote(noteIndex: number) {
    const nextNotes = activeNotes.filter((_entry, index) => index !== noteIndex);
    await persistNotes(nextNotes);
  }

  async function handleDeleteAllNotes() {
    await persistNotes([]);
  }

  async function handleSaveNote() {
    const normalizedDraft = draft.replace(/\r\n?/g, "\n").trim();
    if (!normalizedDraft) {
      setErrorMessage("Note is required.");
      return;
    }

    const nextNotes =
      editingNoteIndex === null
        ? [...activeNotes, normalizedDraft]
        : activeNotes.map((entry, index) =>
            index === editingNoteIndex ? normalizedDraft : entry,
          );

    await persistNotes(nextNotes);
  }

  function handleCloseComposer() {
    setIsComposerOpen(false);
    setEditingNoteIndex(null);
    setDraft("");
    setErrorMessage("");
  }

  if (!target) return null;

  return createPortal(
    <div
      className="subject-popup-backdrop note-editor-backdrop"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className="subject-popup-panel glass-panel fade-slide-in note-editor-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Syllabus topic notes"
        tabIndex={-1}
      >
        <header className="subject-popup-header note-editor-header">
          <div className="subject-popup-title-wrap">
            <p className="subject-popup-kicker">Topic Notes</p>
            <h3 className="subject-popup-title note-editor-title">
              {documentState?.topicLabel || target.topicLabel}
            </h3>
          </div>
          <button
            type="button"
            className="subject-popup-close ripple-btn"
            onClick={onClose}
            aria-label="Close topic note editor"
          >
            X
          </button>
        </header>

        <section className="note-editor-content">
          <p className="note-viewer-question">{breadcrumb}</p>

          <div className="note-viewer-toolbar">
            <button
              type="button"
              className="review-btn ripple-btn review-note-btn"
              onClick={handleStartAddNote}
              disabled={isLoading || isSaving}
            >
              Add Note
            </button>
            {activeNotes.length > 0 ? (
              <button
                type="button"
                className="delete-btn ripple-btn"
                onClick={() => void handleDeleteAllNotes()}
                disabled={isLoading || isSaving}
              >
                Delete All
              </button>
            ) : null}
          </div>

          {isLoading ? (
            <p className="note-viewer-empty">Loading saved notes...</p>
          ) : activeNotes.length === 0 ? (
            <p className="note-viewer-empty">
              No notes saved for this topic yet.
            </p>
          ) : (
            <ul className="note-viewer-list">
              {activeNotes.map((noteEntry, noteIndex) => (
                <li key={`topic-note-${noteIndex}`} className="note-viewer-item">
                  <div className="note-viewer-item-head">
                    <span className="note-viewer-item-label">
                      Note {noteIndex + 1}
                    </span>
                    <div className="note-viewer-item-actions">
                      <button
                        type="button"
                        className="review-btn ripple-btn review-note-btn"
                        onClick={() => handleStartEditNote(noteIndex)}
                        disabled={isSaving}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="delete-btn ripple-btn"
                        onClick={() => void handleDeleteNote(noteIndex)}
                        disabled={isSaving}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="note-viewer-item-copy">{noteEntry}</p>
                </li>
              ))}
            </ul>
          )}

          {isComposerOpen ? (
            <div className="note-editor-stage">
              <label className="review-note-label" htmlFor="syllabus-topic-note-input">
                {editingNoteIndex === null
                  ? "New Note"
                  : `Edit Note ${editingNoteIndex + 1}`}
              </label>
              <textarea
                id="syllabus-topic-note-input"
                className="review-note-input note-editor-input"
                rows={6}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Write your learning note for this topic..."
              />
              {errorMessage ? (
                <p className="note-editor-error">{errorMessage}</p>
              ) : null}
              <div className="note-editor-actions">
                <button
                  type="button"
                  className="action-btn action-btn-secondary ripple-btn"
                  onClick={handleCloseComposer}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="review-btn ripple-btn"
                  onClick={() => void handleSaveNote()}
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : editingNoteIndex === null
                      ? "Add Note"
                      : "Save Changes"}
                </button>
              </div>
            </div>
          ) : errorMessage ? (
            <p className="note-editor-error">{errorMessage}</p>
          ) : null}
        </section>
      </div>
    </div>,
    document.body,
  );
}
