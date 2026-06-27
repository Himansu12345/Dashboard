"use client";

import { SubjectDashboard } from "../subject-dashboard/SubjectDashboard";
import { RAW_D } from "../subject-dashboard/data/socialJusticeData";
import { initSubjectData } from "../subject-dashboard/utils";

const PROCESSED_DATA = initSubjectData(RAW_D, "root");

export default function UPSCSocialJusticeDashboard() {
  return (
    <SubjectDashboard
      data={PROCESSED_DATA}
      title="UPSC Social Justice Master Dashboard"
      subtitle={
        <>
          AIR‑1 Coverage &nbsp;·&nbsp; Complete Syllabus Expansion &nbsp;·&nbsp;
          Prelims Focused
        </>
      }
      quizSubjectName="SocialJustice"
      storageKeys={{
        checked: "upsc_social_justice_checked",
        starred: "upsc_social_justice_starred",
        notes: "upsc_social_justice_notes",
        theme: "upsc_social_justice_theme",
        completion: "upsc_social_justice_completion",
        statuses: "upsc_social_justice_statuses",
        collapsed: "upsc_social_justice_collapsed",
        noteDocuments: "upsc_social_justice_notes_documents",
      }}
    />
  );
}
