import { MotionButton } from "@/components/motion/MotionWrappers";

interface PopupHeaderProps {
  titleId?: string;
  subject: string;
  recordCount: number;
  onClose: () => void;
}

export default function PopupHeader({ titleId, subject, recordCount, onClose }: PopupHeaderProps) {
  return (
    <header className="subject-popup-header">
      <div className="subject-popup-title-wrap">
        <p className="subject-popup-kicker">Subject Drilldown</p>
        <h3 id={titleId} className="subject-popup-title">
          {subject}
        </h3>
        <p className="subject-popup-subtitle">{recordCount} matching records for topic-level analysis</p>
      </div>

      <MotionButton
        type="button"
        className="subject-popup-close ripple-btn"
        onClick={onClose}
        aria-label="Close subject analytics popup"
        title="Close"
      >
        X
      </MotionButton>
    </header>
  );
}
