import type { RefObject } from "react";
import type { PracticeQuestionDetail } from "@/types/records";

interface QuestionWhyModalProps {
  activeWhyDetail: PracticeQuestionDetail | null;
  activeWhyValue: string;
  isWhyComposerOpen: boolean;
  whyDraft: string;
  whyValidationError: string;
  isSavingActiveWhy: boolean;
  whyPanelRef: RefObject<HTMLDivElement | null>;
  onCloseModal: () => void;
  onStartEditWhy: () => void;
  onDeleteWhy: () => void;
  onDraftChange: (value: string) => void;
  onCloseComposer: () => void;
  onSaveWhy: () => void;
}

export default function QuestionWhyModal({
  activeWhyDetail,
  activeWhyValue,
  isWhyComposerOpen,
  whyDraft,
  whyValidationError,
  isSavingActiveWhy,
  whyPanelRef,
  onCloseModal,
  onStartEditWhy,
  onDeleteWhy,
  onDraftChange,
  onCloseComposer,
  onSaveWhy,
}: QuestionWhyModalProps) {
  if (!activeWhyDetail) return null;

  const hasWhy = activeWhyValue.trim().length > 0;

  return (
    <div
      className="subject-popup-backdrop note-editor-backdrop"
      onClick={onCloseModal}
    >
      <div
        ref={whyPanelRef}
        className="subject-popup-panel glass-panel fade-slide-in note-editor-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Question reason"
        tabIndex={-1}
      >
        <header className="subject-popup-header note-editor-header">
          <div className="subject-popup-title-wrap">
            <p className="subject-popup-kicker">Why Analysis</p>
            <h3 className="subject-popup-title note-editor-title">Why did this go wrong?</h3>
          </div>
          <button
            type="button"
            className="subject-popup-close ripple-btn"
            onClick={onCloseModal}
            aria-label="Close why editor"
          >
            X
          </button>
        </header>

        <section className="note-editor-content">
          <p className="note-viewer-question">{activeWhyDetail.question}</p>

          {isWhyComposerOpen ? (
            <div className="note-editor-stage">
              <label className="review-note-label" htmlFor="active-why-input">
                {hasWhy ? "Edit Reason" : "Add Reason"}
              </label>
              <textarea
                id="active-why-input"
                className="review-note-input note-editor-input"
                rows={6}
                value={whyDraft}
                onChange={(event) => onDraftChange(event.target.value)}
                placeholder="Write why you got this question wrong..."
              />
              {whyValidationError ? (
                <p className="note-editor-error">{whyValidationError}</p>
              ) : null}
              <div className="note-editor-actions">
                <button
                  type="button"
                  className="action-btn action-btn-secondary ripple-btn"
                  onClick={onCloseComposer}
                  disabled={isSavingActiveWhy}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="review-btn ripple-btn"
                  onClick={onSaveWhy}
                  disabled={isSavingActiveWhy}
                >
                  {isSavingActiveWhy ? "Saving..." : hasWhy ? "Save Changes" : "Save Reason"}
                </button>
              </div>
            </div>
          ) : hasWhy ? (
            <>
              <div className="note-viewer-item">
                <div className="note-viewer-item-head">
                  <span className="note-viewer-item-label">Saved Reason</span>
                  <div className="note-viewer-item-actions">
                    <button
                      type="button"
                      className="review-btn ripple-btn review-note-btn"
                      onClick={onStartEditWhy}
                      disabled={isSavingActiveWhy}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="delete-btn ripple-btn"
                      onClick={onDeleteWhy}
                      disabled={isSavingActiveWhy}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="note-viewer-item-copy">{activeWhyValue}</p>
              </div>
            </>
          ) : (
            <>
              <p className="note-viewer-empty">
                No reason saved for this question yet.
              </p>
              <div className="note-editor-actions">
                <button
                  type="button"
                  className="review-btn ripple-btn"
                  onClick={onStartEditWhy}
                  disabled={isSavingActiveWhy}
                >
                  Add Reason
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
