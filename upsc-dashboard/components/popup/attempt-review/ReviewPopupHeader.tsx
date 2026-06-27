import type { PracticeRecord } from "@/types/records";

interface ReviewPopupHeaderProps {
  record: PracticeRecord;
  onClose: () => void;
}

export default function ReviewPopupHeader({
  record,
  onClose,
}: ReviewPopupHeaderProps) {
  return (
    <header className="subject-popup-header review-popup-header">
      <div className="subject-popup-title-wrap">
        <p className="subject-popup-kicker">Question Review</p>
        <h3 className="subject-popup-title">
          {record.subject} - {record.topic}
        </h3>
        <p className="subject-popup-subtitle">
          Incorrect + skipped questions with selected and correct answers.
        </p>
      </div>
      <button
        type="button"
        className="subject-popup-close ripple-btn"
        onClick={onClose}
        aria-label="Close review popup"
      >
        X
      </button>
    </header>
  );
}
