import { memo } from "react";
import type { LedgerSummaryRow } from "@/features/dashboard/recordLedgerUtils";

interface SubjectSummaryTableProps {
  rows: LedgerSummaryRow[];
  onSelectSubject: (subject: string) => void;
}

function SubjectSummaryTable({
  rows,
  onSelectSubject,
}: SubjectSummaryTableProps) {
  if (rows.length === 0) {
    return <p className="review-popup-empty">No attempted subjects are available yet.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="record-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Tests</th>
            <th>Questions</th>
            <th>Incorrect</th>
            <th>Accuracy</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td>{row.label}</td>
              <td>{row.testCount}</td>
              <td>{row.totalQuestions}</td>
              <td>{row.incorrect}</td>
              <td>{row.accuracy}%</td>
              <td>
                <div className="table-action-row">
                  <button
                    type="button"
                    className="review-btn ripple-btn"
                    onClick={() => onSelectSubject(row.label)}
                  >
                    View
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(SubjectSummaryTable);
