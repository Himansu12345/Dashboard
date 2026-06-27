"use client";

import { SubjectDashboard } from "../subject-dashboard/SubjectDashboard";
import { RAW_D } from "../subject-dashboard/data/societyData";
import { initSubjectData } from "../subject-dashboard/utils";

const PROCESSED_DATA = initSubjectData(RAW_D, "root");

export default function UPSCSocietyDashboard() {
  return (
    <SubjectDashboard
      data={PROCESSED_DATA}
      title="UPSC Society Master Dashboard"
      subtitle={
        <>
          AIR‑1 Coverage &nbsp;·&nbsp; Complete Syllabus Expansion &nbsp;·&nbsp;
          Prelims Focused
        </>
      }
      quizSubjectName="Society"
      storageKeys={{
        checked: "upsc_society_checked",
        starred: "upsc_society_starred",
        notes: "upsc_society_notes",
        theme: "upsc_society_theme",
        completion: "upsc_society_completion",
        statuses: "upsc_society_statuses",
        collapsed: "upsc_society_collapsed",
        noteDocuments: "upsc_society_notes_documents",
      }}
    />
  );
}
