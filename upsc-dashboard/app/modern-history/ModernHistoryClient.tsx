"use client";

import { SubjectDashboard } from "../subject-dashboard/SubjectDashboard";
import { RAW_D } from "../subject-dashboard/data/modernHistoryData";
import { RAW_D as SMART_RAW_D } from "../subject-dashboard/data/modernHistorySmartData";
import { initSubjectData } from "../subject-dashboard/utils";

const PROCESSED_DATA = initSubjectData(RAW_D, "root");
const SMART_PROCESSED_DATA = initSubjectData(SMART_RAW_D, "root");

export default function UPSCDashboard() {
  return (
    <SubjectDashboard
      data={PROCESSED_DATA}
      smartModeData={SMART_PROCESSED_DATA}
      title="UPSC Modern History Topic Tree"
      subtitle={
        <>
          AIR-1 Coverage &nbsp;·&nbsp; 24 Sections &nbsp;·&nbsp; Prelims + Mains
        </>
      }
      quizSubjectName="Modern History"
      storageKeys={{
        checked: "upsc_checked",
        starred: "upsc_starred",
        notes: "upsc_notes",
        theme: "upsc_theme",
        completion: "upsc_modern_history_completion",
        statuses: "upsc_modern_history_statuses",
        collapsed: "upsc_modern_history_collapsed",
        noteDocuments: "upsc_modern_history_notes_documents",
      }}
    />
  );
}
