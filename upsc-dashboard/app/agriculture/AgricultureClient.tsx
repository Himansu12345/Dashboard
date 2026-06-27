"use client";

import { SubjectDashboard } from "../subject-dashboard/SubjectDashboard";
import { RAW_D } from "../subject-dashboard/data/agricultureData";
import { initSubjectData } from "../subject-dashboard/utils";

const PROCESSED_DATA = initSubjectData(RAW_D, "root");

export default function UPSCAgricultureDashboard() {
  return (
    <SubjectDashboard
      data={PROCESSED_DATA}
      title="UPSC Agriculture Master Dashboard"
      subtitle={
        <>
          AIR‑1 Coverage &nbsp;·&nbsp; Complete Syllabus Expansion &nbsp;·&nbsp;
          Prelims Focused
        </>
      }
      quizSubjectName="Agriculture"
      storageKeys={{
        checked: "upsc_agriculture_checked",
        starred: "upsc_agriculture_starred",
        notes: "upsc_agriculture_notes",
        theme: "upsc_agriculture_theme",
        completion: "upsc_agriculture_completion",
        statuses: "upsc_agriculture_statuses",
        collapsed: "upsc_agriculture_collapsed",
        noteDocuments: "upsc_agriculture_notes_documents",
      }}
    />
  );
}
