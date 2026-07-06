import { useMemo, useState } from "react";
import type { LedgerSummaryRow } from "@/features/dashboard/recordLedgerUtils";

interface SubjectTopicLedgerPopupProps {
  subject: string;
  rows: LedgerSummaryRow[];
  onClose: () => void;
  onOpenTopicReview: (topic: string, mode?: "view" | "solve") => void;
}

export default function SubjectTopicLedgerPopup({
  subject,
  rows,
  onClose,
  onOpenTopicReview,
}: SubjectTopicLedgerPopupProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return rows;
    return rows.filter((row) =>
      row.label.toLowerCase().includes(normalizedQuery),
    );
  }, [rows, searchQuery]);

  return (
    <div className="subject-popup-backdrop" onClick={onClose}>
      <div
        className="subject-popup-panel glass-panel fade-slide-in"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${subject} Topic Ledger`}
      >
        <header className="subject-popup-header">
          <div className="subject-popup-title-wrap">
            <p className="subject-popup-kicker">Topic Breakdown</p>
            <h3 className="subject-popup-title">{subject}</h3>
            <p className="subject-popup-subtitle">
              Performance grouped by specific topics.
            </p>
          </div>
          <button
            type="button"
            className="subject-popup-close ripple-btn"
            onClick={onClose}
            aria-label="Close topic ledger"
          >
            X
          </button>
        </header>

        <div className="ledger-filter-grid review-popup-filter-grid">
          <label
            className="ledger-filter-field"
            style={{ gridColumn: "1 / -1" }}
          >
            <span className="review-note-label">Search Topics</span>
            <input
              type="text"
              className="ledger-filter-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter topics by name..."
            />
          </label>
        </div>

        <div className="table-wrap subject-popup-table-wrap">
          <table className="record-table">
            <thead>
              <tr>
                <th>Topic</th>
                <th>Tests</th>
                <th>Questions</th>
                <th>Correct</th>
                <th>Incorrect</th>
                <th>Accuracy</th>
                <th>Difficulty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => (
                  <tr key={row.key}>
                    <td>{row.label}</td>
                    <td>{row.testCount}</td>
                    <td>{row.totalQuestions}</td>
                    <td>{row.correct}</td>
                    <td>{row.incorrect}</td>
                    <td>{row.accuracy}%</td>
                    <td>{row.difficultySummary}</td>
                    <td>
                      <div
                        className="table-action-row"
                        style={{ display: "flex", gap: "0.5rem" }}
                      >
                        <button
                          type="button"
                          className="review-btn ripple-btn"
                          onClick={() => onOpenTopicReview(row.label, "view")}
                        >
                          View
                        </button>
                        {row.incorrect > 0 && (
                          <button
                            type="button"
                            className="review-btn ripple-btn"
                            style={{
                              background: "transparent",
                              border: "1px solid #3b82f6",
                              color: "#3b82f6",
                            }}
                            onClick={() =>
                              onOpenTopicReview(row.label, "solve")
                            }
                          >
                            Solve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    No topics found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
