"use client";

import { SubjectDashboard } from "../subject-dashboard/SubjectDashboard";
import { RAW_D } from "../subject-dashboard/data/scTechData";
import { RAW_D as SMART_RAW_D } from "../subject-dashboard/data/scTechSmartData";
import { initSubjectData } from "../subject-dashboard/utils";

const PROCESSED_DATA = initSubjectData(RAW_D, "root");
const SMART_PROCESSED_DATA = initSubjectData(SMART_RAW_D, "root");

export default function UPSCScTechDashboard() {
  return (
    <SubjectDashboard
      data={PROCESSED_DATA}
      smartModeData={SMART_PROCESSED_DATA}
      title="UPSC Science & Technology Master Dashboard"
      subtitle={
        <>
          AIR‑1 Coverage &nbsp;·&nbsp; Complete Syllabus Expansion &nbsp;·&nbsp;
          Prelims Focused
        </>
      }
      quizSubjectName="Science&Tech"
      storageKeys={{
        checked: "upsc_sc_tech_checked",
        starred: "upsc_sc_tech_starred",
        notes: "upsc_sc_tech_notes",
        theme: "upsc_sc_tech_theme",
        completion: "upsc_sc_tech_completion",
        statuses: "upsc_sc_tech_statuses",
        collapsed: "upsc_sc_tech_collapsed",
        noteDocuments: "upsc_sc_tech_notes_documents",
      }}
    />
  );
}
