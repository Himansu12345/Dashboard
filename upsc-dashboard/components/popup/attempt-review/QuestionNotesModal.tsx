import type { RefObject } from "react";
import type { PracticeQuestionDetail } from "@/types/records";

interface QuestionNotesModalProps {
  activeNoteDetail: PracticeQuestionDetail | null;
  activeNotes: string[];
  isNoteComposerOpen: boolean;
  editingNoteIndex: number | null;
  activeNoteDraft: string;
  noteValidationError: string;
  isSavingActiveNote: boolean;
  notePanelRef: RefObject<HTMLDivElement | null>;
  onCloseModal: () => void;
  onStartAddNote: () => void;
  onDeleteAllNotes: () => void;
  onStartEditNote: (noteIndex: number) => void;
  onDeleteNote: (noteIndex: number) => void;
  onDraftChange: (value: string) => void;
  onCloseComposer: () => void;
  onSaveNote: () => void;
}

export default function QuestionNotesModal({
  activeNoteDetail,
  activeNotes,
  isNoteComposerOpen,
  editingNoteIndex,
  activeNoteDraft,
  noteValidationError,
  isSavingActiveNote,
  notePanelRef,
  onCloseModal,
  onStartAddNote,
  onDeleteAllNotes,
  onStartEditNote,
  onDeleteNote,
  onDraftChange,
  onCloseComposer,
  onSaveNote,
}: QuestionNotesModalProps) {
  if (!activeNoteDetail) return null;

  return (
    <div
      className="subject-popup-backdrop note-editor-backdrop"
      onClick={onCloseModal}
    >
      <div
        ref={notePanelRef}
        className="subject-popup-panel glass-panel fade-slide-in note-editor-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Question notes"
        tabIndex={-1}
      >
        <header className="subject-popup-header note-editor-header">
          <div className="subject-popup-title-wrap">
            <p className="subject-popup-kicker">Question Notes</p>
            <h3 className="subject-popup-title note-editor-title">View Notes</h3>
          </div>
          <button
            type="button"
            className="subject-popup-close ripple-btn"
            onClick={onCloseModal}
            aria-label="Close note editor"
          >
            X
          </button>
        </header>

        <section className="note-editor-content">
          <p className="note-viewer-question">{activeNoteDetail.question}</p>

          <div className="note-viewer-toolbar">
            <button
              type="button"
              className="review-btn ripple-btn review-note-btn"
              onClick={onStartAddNote}
              disabled={isSavingActiveNote}
            >
              Add Note
            </button>
            {activeNotes.length > 0 ? (
              <button
                type="button"
                className="delete-btn ripple-btn"
                onClick={onDeleteAllNotes}
                disabled={isSavingActiveNote}
              >
                Delete All
              </button>
            ) : null}
          </div>

          {activeNotes.length === 0 ? (
            <p className="note-viewer-empty">
              No notes saved for this question yet.
            </p>
          ) : (
            <ul className="note-viewer-list">
              {activeNotes.map((noteEntry, noteIndex) => (
                <li key={`note-${noteIndex}`} className="note-viewer-item">
                  <div className="note-viewer-item-head">
                    <span className="note-viewer-item-label">
                      Note {noteIndex + 1}
                    </span>
                    <div className="note-viewer-item-actions">
                      <button
                        type="button"
                        className="review-btn ripple-btn review-note-btn"
                        onClick={() => onStartEditNote(noteIndex)}
                        disabled={isSavingActiveNote}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="delete-btn ripple-btn"
                        onClick={() => onDeleteNote(noteIndex)}
                        disabled={isSavingActiveNote}
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

          {isNoteComposerOpen ? (
            <div className="note-editor-stage">
              <label className="review-note-label" htmlFor="active-note-input">
                {editingNoteIndex === null
                  ? "New Note"
                  : `Edit Note ${editingNoteIndex + 1}`}
              </label>
              <textarea
                id="active-note-input"
                className="review-note-input note-editor-input"
                rows={6}
                value={activeNoteDraft}
                onChange={(event) => onDraftChange(event.target.value)}
                placeholder="Write your learning note for this question..."
              />
              {noteValidationError ? (
                <p className="note-editor-error">{noteValidationError}</p>
              ) : null}
              <div className="note-editor-actions">
                <button
                  type="button"
                  className="action-btn action-btn-secondary ripple-btn"
                  onClick={onCloseComposer}
                  disabled={isSavingActiveNote}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="review-btn ripple-btn"
                  onClick={onSaveNote}
                  disabled={isSavingActiveNote}
                >
                  {isSavingActiveNote
                    ? "Saving..."
                    : editingNoteIndex === null
                      ? "Add Note"
                      : "Save Changes"}
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
