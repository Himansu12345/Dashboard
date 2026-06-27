import { useMemo } from "react";
import type { PracticeRecord } from "@/types/records";
import {
  MotionButton,
  MotionTableBody,
  MotionTableRow,
} from "@/components/motion/MotionWrappers";
import { summarizeRecordsBySubject } from "@/features/dashboard/recordLedgerUtils";

interface RecordsTableSectionProps {
  records: PracticeRecord[];
  recycleBinCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  onOpenRecycleBin: () => void;
  onOpenSubjectView: (subject: string) => void;
}

export default function RecordsTableSection({
  records,
  recycleBinCount,
  isLoading,
  isRefreshing,
  onOpenRecycleBin,
  onOpenSubjectView,
}: RecordsTableSectionProps) {
  // Memoize subject rows computation to prevent recalculation on every render
  const subjectRows = useMemo(
    () => summarizeRecordsBySubject(records),
    [records],
  );

  const tableStatus = isLoading
    ? "Loading subjects..."
    : isRefreshing
      ? "Refreshing subjects..."
      : `${subjectRows.length} subjects ready for review`;

  return (
    <section className="table-card">
      <div className="table-header-row">
        <div className="table-heading-group">
          <h3 className="section-title">Attempt Ledger</h3>
          <p className="section-note">{tableStatus}</p>
        </div>
        <div className="table-header-actions">
          <span className="table-summary-pill">
            {subjectRows.length} visible
          </span>
          <MotionButton
            type="button"
            className="review-btn ripple-btn"
            onClick={onOpenRecycleBin}
            title="Open recycle bin"
            aria-label="Open recycle bin"
          >
            Recycle Bin ({recycleBinCount})
          </MotionButton>
        </div>
      </div>

      {subjectRows.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-copy">
            No data added yet. Add your first attempt to activate charts and
            filters.
          </p>
          <div className="skeleton-lines" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="record-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Test</th>
                <th>Questions</th>
                <th>Correct</th>
                <th>Incorrect</th>
                <th>Accuracy %</th>
                <th>Difficulty</th>
                <th>Actions</th>
              </tr>
            </thead>

            <MotionTableBody>
              {subjectRows.map((row) => (
                <MotionTableRow key={row.key}>
                  <td>{row.label}</td>
                  <td>{row.testCount}</td>
                  <td>{row.totalQuestions}</td>
                  <td>{row.correct}</td>
                  <td>{row.incorrect}</td>
                  <td>{row.accuracy}%</td>
                  <td>{row.difficultySummary}</td>
                  <td>
                    <div className="table-action-row">
                      <MotionButton
                        type="button"
                        className="review-btn ripple-btn"
                        onClick={() => onOpenSubjectView(row.subject)}
                        title="View topic-wise subject breakdown"
                        aria-label={`View ${row.subject} subject breakdown`}
                      >
                        View
                      </MotionButton>
                    </div>
                  </td>
                </MotionTableRow>
              ))}
            </MotionTableBody>
          </table>
        </div>
      )}
    </section>
  );
}
