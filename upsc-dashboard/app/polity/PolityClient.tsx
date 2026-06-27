"use client";

import { SubjectDashboard } from "../subject-dashboard/SubjectDashboard";
import { RAW_D } from "../subject-dashboard/data/polityData";
import { RAW_D as SMART_RAW_D } from "../subject-dashboard/data/politySmartData";
import {
  applyPriorityOverrides,
  initSubjectData,
} from "../subject-dashboard/utils";

const POLITY_CHAPTER_PRIORITIES: Record<string, "high" | "mid" | "low"> = {
  I: "mid",
  II: "mid",
  III: "high",
  IV: "mid",
  V: "mid",
  VI: "high",
  VII: "high",
  VIII: "mid",
  IX: "mid",
  X: "mid",
  XI: "mid",
  XII: "mid",
  XIII: "high",
  XIV: "low",
  XV: "high",
  XVI: "high",
  XVII: "mid",
  XVIII: "mid",
  XIX: "mid",
  XX: "low",
  XXI: "high",
  XXII: "mid",
  XXIII: "high",
  XXIV: "mid",
  XXV: "high",
  XXVI: "mid",
  XXVII: "mid",
  XXVIII: "low",
  XXIX: "mid",
  XXX: "high",
  XXXI: "high",
  XXXII: "mid",
  XXXIII: "mid",
  XXXIV: "mid",
  XXXV: "low",
  XXXVI: "low",
  XXXVII: "low",
  XXXVIII: "low",
  XXXIX: "mid",
  XL: "low",
  XLI: "low",
  XLII: "mid",
  XLIII: "low",
  XLIV: "low",
  XLV: "mid",
  XLVI: "mid",
  XLVII: "mid",
  XLVIII: "low",
  XLIX: "low",
  L: "mid",
  LI: "low",
};

const PROCESSED_DATA = applyPriorityOverrides(
  initSubjectData(RAW_D, "root"),
  POLITY_CHAPTER_PRIORITIES,
);
const SMART_PROCESSED_DATA = applyPriorityOverrides(
  initSubjectData(SMART_RAW_D, "root"),
  POLITY_CHAPTER_PRIORITIES,
);

export default function UPSCPolityUltimateDashboard() {
  return (
    <SubjectDashboard
      data={PROCESSED_DATA}
      smartModeData={SMART_PROCESSED_DATA}
      title="UPSC Polity Master Dashboard (Ultimate)"
      subtitle={
        <>
          AIR‑1 Coverage &nbsp;·&nbsp; Complete 4-Level Expansion &nbsp;·&nbsp;
          Prelims Focused
        </>
      }
      quizSubjectName="Polity"
      storageKeys={{
        checked: "upsc_polity_ultimate_checked",
        starred: "upsc_polity_ultimate_starred",
        notes: "upsc_polity_ultimate_notes",
        theme: "upsc_polity_ultimate_theme",
        completion: "upsc_polity_ultimate_completion",
        statuses: "upsc_polity_ultimate_statuses",
        collapsed: "upsc_polity_ultimate_collapsed",
        noteDocuments: "upsc_polity_ultimate_notes_documents",
      }}
    />
  );
}
