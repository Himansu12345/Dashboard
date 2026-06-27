"use client";

import { SubjectDashboard } from "../subject-dashboard/SubjectDashboard";
import { RAW_D } from "../subject-dashboard/data/geographyData";
import { RAW_D as SMART_RAW_D } from "../subject-dashboard/data/geographySmartData";
import { initSubjectData } from "../subject-dashboard/utils";

const PROCESSED_DATA = initSubjectData(RAW_D, "root");
const SMART_PROCESSED_DATA = initSubjectData(SMART_RAW_D, "root");

export default function UPSCGeographyCompleteDashboard() {
  return (
    <SubjectDashboard
      data={PROCESSED_DATA}
      smartModeData={SMART_PROCESSED_DATA}
      title="UPSC Geography Master Dashboard (Complete)"
      subtitle={
        <>
          AIR‑1 Coverage &nbsp;·&nbsp; Complete Syllabus Expansion &nbsp;·&nbsp;
          Prelims Focused
        </>
      }
      quizSubjectName="Geography"
      storageKeys={{
        checked: "upsc_geo_complete_checked",
        starred: "upsc_geo_complete_starred",
        notes: "upsc_geo_complete_notes",
        theme: "upsc_geo_complete_theme",
        completion: "upsc_geo_complete_completion",
        statuses: "upsc_geo_complete_statuses",
        collapsed: "upsc_geo_complete_collapsed",
        noteDocuments: "upsc_geo_complete_notes_documents",
      }}
    />
  );
}
