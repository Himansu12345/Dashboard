import React, { useState } from "react";
import useReportData from "../hooks/useReportData";
import ReportExporter from "../components/report/ReportExporter";

// Assume a simple Date filter component exists
// import DateFilter from '../components/report/DateFilter';

export default function ReportPage() {
  const [dateRange] = useState(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6); // Default to Last 7 Days
    endDate.setHours(23, 59, 59, 999);
    startDate.setHours(0, 0, 0, 0);
    return { startDate, endDate };
  });

  const { data, summary, analysis, loading } = useReportData(
    dateRange.startDate,
    dateRange.endDate,
  );

  return (
    <div style={{ padding: "2rem" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Activity Report</h1>
        {/* Placeholder for DateFilter component */}
        {/* <DateFilter value={dateRange} onChange={handleDateChange} /> */}
      </header>

      {loading ? (
        <p>Loading report...</p>
      ) : (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              margin: "1rem 0",
            }}
          >
            <ReportExporter
              reportData={{ data, summary, analysis }}
              dateRange={dateRange}
            />
          </div>
          <h2>Summary</h2>
          <p>Total Questions Attempted: {summary.totalQuestionsAttempted}</p>
          <p>Accuracy: {summary.accuracy.toFixed(2)}%</p>
          {/* Add more summary cards here */}
        </div>
      )}
    </div>
  );
}
