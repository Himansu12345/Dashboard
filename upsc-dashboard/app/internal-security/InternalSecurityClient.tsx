"use client";

import { SubjectDashboard } from "../subject-dashboard/SubjectDashboard";
import { RAW_D } from "../subject-dashboard/data/internalSecurityData";
import { initSubjectData } from "../subject-dashboard/utils";

const PROCESSED_DATA = initSubjectData(RAW_D, "root");

export default function UPSCInternalSecurityDashboard() {
  return (
    <SubjectDashboard
      data={PROCESSED_DATA}
      title="UPSC Internal Security Master Dashboard"
      subtitle={
        <>
          AIR‑1 Coverage &nbsp;·&nbsp; Complete Syllabus Expansion &nbsp;·&nbsp;
          Prelims Focused
        </>
      }
      quizSubjectName="InternalSecurity"
      storageKeys={{
        checked: "upsc_internal_security_checked",
        starred: "upsc_internal_security_starred",
        notes: "upsc_internal_security_notes",
        theme: "upsc_internal_security_theme",
        completion: "upsc_internal_security_completion",
        statuses: "upsc_internal_security_statuses",
        collapsed: "upsc_internal_security_collapsed",
        noteDocuments: "upsc_internal_security_notes_documents",
      }}
    />
  );
}
