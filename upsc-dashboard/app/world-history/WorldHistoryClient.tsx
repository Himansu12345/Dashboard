"use client";

import { SubjectDashboard } from "../subject-dashboard/SubjectDashboard";
import { RAW_D } from "../subject-dashboard/data/worldHistoryData";
import { initSubjectData } from "../subject-dashboard/utils";

const PROCESSED_DATA = initSubjectData(RAW_D, "root");

export default function UPSCWorldHistoryDashboard() {
  return (
    <SubjectDashboard
      data={PROCESSED_DATA}
      title="UPSC World History Master Dashboard"
      subtitle={
        <>
          AIR‑1 Coverage &nbsp;·&nbsp; Complete Syllabus Expansion &nbsp;·&nbsp;
          Prelims Focused
        </>
      }
      quizSubjectName="WorldHistory"
      storageKeys={{
        checked: "upsc_world_history_checked",
        starred: "upsc_world_history_starred",
        notes: "upsc_world_history_notes",
        theme: "upsc_world_history_theme",
        completion: "upsc_world_history_completion",
        statuses: "upsc_world_history_statuses",
        collapsed: "upsc_world_history_collapsed",
        noteDocuments: "upsc_world_history_notes_documents",
      }}
    />
  );
}
