import { useState } from "react";
import type { PracticeQuestionDetail } from "@/types/records";
import { normalizeComparisonValue } from "@/components/popup/attempt-review/helpers";

interface ReviewQuestionCardProps {
  detail: PracticeQuestionDetail;
  index: number;
  onOpenNote: (detail: PracticeQuestionDetail) => void;
  onOpenWhy: (detail: PracticeQuestionDetail) => void;
  isSolveMode?: boolean; // NEW PROP
}

export default function ReviewQuestionCard({
  detail,
  index,
  onOpenNote,
  onOpenWhy,
  isSolveMode,
}: ReviewQuestionCardProps) {
  // Local state purely for this solve session
  const [localSelectedAnswer, setLocalSelectedAnswer] = useState<string | null>(
    null,
  );

  const normalizedCorrect = normalizeComparisonValue(detail.correctAnswer);

  // If in solve mode, use the local selection. Otherwise, use what's saved in the database.
  const normalizedSelected =
    isSolveMode && localSelectedAnswer
      ? normalizeComparisonValue(localSelectedAnswer)
      : normalizeComparisonValue(detail.selectedAnswer);

  // The answer is revealed instantly if we're not in solve mode, OR if we're in solve mode and the user clicked an option.
  const isAnswerRevealed = !isSolveMode || localSelectedAnswer !== null;

  return (
    <article className="review-question-card">
      <h4 className="review-question-title">
        <span>{index + 1}.</span>
        <div className="review-question-copy">
          {detail.question.split("\n").map((line, lineIndex) => (
            <span key={lineIndex} className="review-question-line">
              {line}
            </span>
          ))}
        </div>
      </h4>
      <ul className="review-option-list">
        {detail.options.map((option) => {
          const normalizedOption = normalizeComparisonValue(option);

          let statusClass = "cursor-pointer hover:bg-white/5"; // Make them look clickable in solve mode
          let isCorrect = false;
          let isSelected = false;

          if (isAnswerRevealed) {
            isCorrect =
              normalizedCorrect.length > 0 &&
              normalizedOption === normalizedCorrect;
            isSelected =
              normalizedSelected.length > 0 &&
              normalizedOption === normalizedSelected;

            if (isCorrect && isSelected)
              statusClass = "is-option-correct-selected";
            else if (isCorrect) statusClass = "is-option-correct";
            else if (isSelected) statusClass = "is-option-selected-wrong";
          } else if (isSolveMode && localSelectedAnswer === option) {
            // Intermediate state, though local state instantly reveals anyway
            statusClass = "is-option-selected";
          }

          return (
            <li
              key={`${detail.question}-${option}`}
              className={`review-option-item ${statusClass}`}
              onClick={() => {
                if (isSolveMode && !isAnswerRevealed) {
                  setLocalSelectedAnswer(option);
                }
              }}
            >
              <span className="review-option-text">{option}</span>
              {isCorrect ? (
                <span className="review-option-tag">Correct</span>
              ) : null}
              {isSelected && !isSolveMode ? (
                <span className="review-option-tag">Selected</span>
              ) : null}
              {isSelected && isSolveMode && !isCorrect ? (
                <span
                  className="review-option-tag"
                  style={{
                    background: "rgba(255, 107, 127, 0.2)",
                    color: "#ffc5ce",
                  }}
                >
                  Incorrect
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>

      {/* Hide the explanations/notes until the question is answered in solve mode */}
      {isAnswerRevealed && (
        <div className="review-question-actions mt-4">
          {isSolveMode && (
            <div className="mr-auto font-medium text-sm">
              {normalizedSelected === normalizedCorrect ? (
                <span style={{ color: "#4ade80" }}>
                  ✓ You got it right this time!
                </span>
              ) : (
                <span style={{ color: "#f87171" }}>
                  ✗ Still incorrect. Keep reviewing.
                </span>
              )}
            </div>
          )}
          <button
            type="button"
            className="review-btn ripple-btn review-note-btn"
            onClick={() => onOpenWhy(detail)}
          >
            Why?
          </button>
          <button
            type="button"
            className="review-btn ripple-btn review-note-btn"
            onClick={() => onOpenNote(detail)}
          >
            View Note
          </button>
        </div>
      )}
    </article>
  );
}
