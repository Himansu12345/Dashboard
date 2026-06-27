"use client";

import { SubjectDashboard } from "../subject-dashboard/SubjectDashboard";
import { RAW_D } from "../subject-dashboard/data/economicsData";
import { RAW_D as SMART_RAW_D } from "../subject-dashboard/data/economicsSmartData";
import { initSubjectData } from "../subject-dashboard/utils";

const PROCESSED_DATA = initSubjectData(RAW_D, "root");
const SMART_PROCESSED_DATA = initSubjectData(SMART_RAW_D, "root");

export default function UPSCEconomicsDashboard() {
  return (
    <SubjectDashboard
      data={PROCESSED_DATA}
      smartModeData={SMART_PROCESSED_DATA}
      title="UPSC Economics Master Dashboard"
      subtitle={
        <>
          AIR‑1 Coverage &nbsp;·&nbsp; Complete Syllabus Expansion &nbsp;·&nbsp;
          Prelims Focused
        </>
      }
      quizSubjectName="Economics"
      storageKeys={{
        checked: "upsc_economics_checked",
        starred: "upsc_economics_starred",
        notes: "upsc_economics_notes",
        theme: "upsc_economics_theme",
        completion: "upsc_economics_completion",
        statuses: "upsc_economics_statuses",
        collapsed: "upsc_economics_collapsed",
        noteDocuments: "upsc_economics_notes_documents",
      }}
    />
  );
}
