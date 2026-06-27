"use client";

import { SubjectDashboard } from "../subject-dashboard/SubjectDashboard";
import { RAW_D } from "../subject-dashboard/data/internationalRelationsData";
import { initSubjectData } from "../subject-dashboard/utils";

const PROCESSED_DATA = initSubjectData(RAW_D, "root");

export default function UPSCInternationalRelationsDashboard() {
  return (
    <SubjectDashboard
      data={PROCESSED_DATA}
      title="UPSC International Relations Master Dashboard"
      subtitle={
        <>
          AIR‑1 Coverage &nbsp;·&nbsp; Complete Syllabus Expansion &nbsp;·&nbsp;
          Prelims Focused
        </>
      }
      quizSubjectName="InternationalRelations"
      storageKeys={{
        checked: "upsc_ir_checked",
        starred: "upsc_ir_starred",
        notes: "upsc_ir_notes",
        theme: "upsc_ir_theme",
        completion: "upsc_ir_completion",
        statuses: "upsc_ir_statuses",
        collapsed: "upsc_ir_collapsed",
        noteDocuments: "upsc_ir_notes_documents",
      }}
    />
  );
}
