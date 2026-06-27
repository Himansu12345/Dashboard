import type { PracticeQuestionDetail } from "@/types/records";
import { normalizeComparisonValue } from "@/components/popup/attempt-review/helpers";

interface ReviewQuestionCardProps {
  detail: PracticeQuestionDetail;
  index: number;
  onOpenNote: (detail: PracticeQuestionDetail) => void;
  onOpenWhy: (detail: PracticeQuestionDetail) => void;
}

export default function ReviewQuestionCard({
  detail,
  index,
  onOpenNote,
  onOpenWhy,
}: ReviewQuestionCardProps) {
  const normalizedCorrect = normalizeComparisonValue(detail.correctAnswer);
  const normalizedSelected = normalizeComparisonValue(detail.selectedAnswer);

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
          const isCorrect =
            normalizedCorrect.length > 0 && normalizedOption === normalizedCorrect;
          const isSelected =
            normalizedSelected.length > 0 && normalizedOption === normalizedSelected;

          let statusClass = "";
          if (isCorrect && isSelected) statusClass = "is-option-correct-selected";
          else if (isCorrect) statusClass = "is-option-correct";
          else if (isSelected) statusClass = "is-option-selected-wrong";

          return (
            <li
              key={`${detail.question}-${option}`}
              className={`review-option-item ${statusClass}`}
            >
              <span className="review-option-text">{option}</span>
              {isCorrect ? (
                <span className="review-option-tag">Correct</span>
              ) : null}
              {isSelected ? (
                <span className="review-option-tag">Selected</span>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="review-question-actions">
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
    </article>
  );
}
