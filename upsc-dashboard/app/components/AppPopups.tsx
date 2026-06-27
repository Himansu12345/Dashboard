import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type AttemptClassificationPopup from "@/components/popup/AttemptClassificationPopup";
import type ConsistencyPopup from "@/components/popup/ConsistencyPopup";
import type SyllabusTreePopup from "@/components/popup/SyllabusTreePopup";
import type TopicNotesPopup from "@/components/popup/TopicNotesPopup";

const TopicNotesPopupLazy = dynamic(
  () => import("@/components/popup/TopicNotesPopup"),
  { ssr: false },
);
const ConsistencyPopupLazy = dynamic(
  () => import("@/components/popup/ConsistencyPopup"),
  { ssr: false },
);
const SyllabusTreePopupLazy = dynamic(
  () => import("@/components/popup/SyllabusTreePopup"),
  { ssr: false },
);

type AppPopupsProps = {
  classificationKey: string;
  classification: ComponentProps<typeof AttemptClassificationPopup>;
  topicNotes: ComponentProps<typeof TopicNotesPopup>;
  consistency: ComponentProps<typeof ConsistencyPopup>;
  syllabus: ComponentProps<typeof SyllabusTreePopup>;
};

export function AppPopups({
  topicNotes,
  consistency,
  syllabus,
}: AppPopupsProps) {
  return (
    <>
      {topicNotes.isOpen ? <TopicNotesPopupLazy {...topicNotes} /> : null}
      {consistency.isOpen ? <ConsistencyPopupLazy {...consistency} /> : null}
      {syllabus.isOpen ? <SyllabusTreePopupLazy {...syllabus} /> : null}
    </>
  );
}
