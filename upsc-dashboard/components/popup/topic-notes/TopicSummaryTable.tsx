import { memo } from "react";
import type { LedgerSummaryRow } from "@/features/dashboard/recordLedgerUtils";

interface TopicSummaryTableProps {
  rows: LedgerSummaryRow[];
  onSelectTopic: (topic: string) => void;
}

function TopicSummaryTable({
  rows,
  onSelectTopic,
}: TopicSummaryTableProps) {
  if (rows.length === 0) {
    return <p className="review-popup-empty">No attempted topics are available for this subject.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="record-table">
        <thead>
          <tr>
            <th>Topic</th>
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
                    onClick={() => onSelectTopic(row.label)}
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

export default memo(TopicSummaryTable);
