import type { PracticeRecord } from "@/types/records";

interface ReviewPopupStatsProps {
  record: PracticeRecord;
}

export default function ReviewPopupStats({ record }: ReviewPopupStatsProps) {
  return (
    <section className="date-popup-card review-popup-stats">
      <div className="date-popup-badge-row">
        <span className="date-popup-badge is-accuracy">Total: {record.total}</span>
        <span className="date-popup-badge is-correct">Correct: {record.correct}</span>
        <span className="date-popup-badge is-incorrect">Incorrect: {record.incorrect}</span>
        <span className="date-popup-badge is-skipped">Skipped: {record.skipped}</span>
      </div>
    </section>
  );
}
