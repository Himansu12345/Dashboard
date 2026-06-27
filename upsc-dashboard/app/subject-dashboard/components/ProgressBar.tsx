import type { SubjectProgress } from "../types";

type ProgressBarProps = {
  progress: SubjectProgress;
};

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="progress-container">
      <div className="progress-text">
        <span>Fact Mastery Progress</span>
        <span id="pCount">
          {progress.checkedLeaves} / {progress.totalLeaves} ({progress.pct}%)
        </span>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${progress.pct}%` }}
        />
      </div>
    </div>
  );
}
