"use client";

import { SubjectDashboard } from "../subject-dashboard/SubjectDashboard";
import { RAW_D } from "../subject-dashboard/data/disasterManagementData";
import { initSubjectData } from "../subject-dashboard/utils";

const PROCESSED_DATA = initSubjectData(RAW_D, "root");

export default function UPSCDisasterManagementDashboard() {
  return (
    <SubjectDashboard
      data={PROCESSED_DATA}
      title="UPSC Disaster Management Master Dashboard"
      subtitle={
        <>
          AIR‑1 Coverage &nbsp;·&nbsp; Complete Syllabus Expansion &nbsp;·&nbsp;
          Prelims Focused
        </>
      }
      quizSubjectName="DisasterManagement"
      storageKeys={{
        checked: "upsc_disaster_management_checked",
        starred: "upsc_disaster_management_starred",
        notes: "upsc_disaster_management_notes",
        theme: "upsc_disaster_management_theme",
        completion: "upsc_disaster_management_completion",
        statuses: "upsc_disaster_management_statuses",
        collapsed: "upsc_disaster_management_collapsed",
        noteDocuments: "upsc_disaster_management_notes_documents",
      }}
    />
  );
}
