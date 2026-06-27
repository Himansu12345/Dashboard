"use client";

import React from "react";

function downloadJson(filename, data) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function formatDateForFilename(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime()))
    return "unknown-date";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function ReportExporter({ reportData, dateRange }) {
  const handleExport = () => {
    if (!reportData) {
      window.alert("No report data available to export.");
      return;
    }

    const startLabel = formatDateForFilename(dateRange?.startDate);
    const endLabel = formatDateForFilename(dateRange?.endDate);

    const filename = `upsc-report-${startLabel}-to-${endLabel}.json`;

    downloadJson(filename, reportData);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="rounded-lg border border-white/10 bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
    >
      Export JSON
    </button>
  );
}
