"use client";

import { SubjectDashboard } from "../subject-dashboard/SubjectDashboard";
import { RAW_D } from "../subject-dashboard/data/governanceData";
import { initSubjectData } from "../subject-dashboard/utils";

const PROCESSED_DATA = initSubjectData(RAW_D, "root");

export default function UPSCGovernanceDashboard() {
  return (
    <SubjectDashboard
      data={PROCESSED_DATA}
      title="UPSC Governance Master Dashboard"
      subtitle={
        <>
          AIR‑1 Coverage &nbsp;·&nbsp; Complete Syllabus Expansion &nbsp;·&nbsp;
          Prelims Focused
        </>
      }
      quizSubjectName="Governance"
      storageKeys={{
        checked: "upsc_governance_checked",
        starred: "upsc_governance_starred",
        notes: "upsc_governance_notes",
        theme: "upsc_governance_theme",
        completion: "upsc_governance_completion",
        statuses: "upsc_governance_statuses",
        collapsed: "upsc_governance_collapsed",
        noteDocuments: "upsc_governance_notes_documents",
      }}
    />
  );
}
