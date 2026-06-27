"use client";

import { SubjectDashboard } from "../subject-dashboard/SubjectDashboard";
import { RAW_D } from "../subject-dashboard/data/ancientHistoryData";
import { RAW_D as SMART_RAW_D } from "../subject-dashboard/data/ancientHistorySmartData";
import { initSubjectData } from "../subject-dashboard/utils";

const PROCESSED_DATA = initSubjectData(RAW_D, "root");
const SMART_PROCESSED_DATA = initSubjectData(SMART_RAW_D, "root");

export default function UPSCAncientUltimateDashboard() {
  return (
    <SubjectDashboard
      data={PROCESSED_DATA}
      smartModeData={SMART_PROCESSED_DATA}
      title="UPSC Ancient History & Culture Dashboard (Ultimate)"
      subtitle={
        <>
          AIR‑1 Coverage &nbsp;·&nbsp; Deep 4-Level Extraction &nbsp;·&nbsp;
          Prelims Focused
        </>
      }
      quizSubjectName="Ancient History"
      storageKeys={{
        checked: "upsc_ancient_ultimate_checked",
        starred: "upsc_ancient_ultimate_starred",
        notes: "upsc_ancient_ultimate_notes",
        theme: "upsc_ancient_ultimate_theme",
        completion: "upsc_ancient_ultimate_completion",
        statuses: "upsc_ancient_ultimate_statuses",
        collapsed: "upsc_ancient_ultimate_collapsed",
        noteDocuments: "upsc_ancient_ultimate_notes_documents",
      }}
    />
  );
}
