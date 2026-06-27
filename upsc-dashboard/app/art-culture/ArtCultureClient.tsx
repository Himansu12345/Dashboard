"use client";

import { SubjectDashboard } from "../subject-dashboard/SubjectDashboard";
import { RAW_D } from "../subject-dashboard/data/artCultureData";
import { initSubjectData } from "../subject-dashboard/utils";

const PROCESSED_DATA = initSubjectData(RAW_D, "root");

export default function UPSCArtCultureDashboard() {
  return (
    <SubjectDashboard
      data={PROCESSED_DATA}
      title="UPSC Art & Culture Master Dashboard"
      subtitle={
        <>
          AIR‑1 Coverage &nbsp;·&nbsp; Complete Syllabus Expansion &nbsp;·&nbsp;
          Prelims Focused
        </>
      }
      quizSubjectName="Art&Culture"
      storageKeys={{
        checked: "upsc_art_culture_checked",
        starred: "upsc_art_culture_starred",
        notes: "upsc_art_culture_notes",
        theme: "upsc_art_culture_theme",
        completion: "upsc_art_culture_completion",
        statuses: "upsc_art_culture_statuses",
        collapsed: "upsc_art_culture_collapsed",
        noteDocuments: "upsc_art_culture_notes_documents",
      }}
    />
  );
}
