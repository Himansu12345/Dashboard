import type { PracticeQuestionDetail } from "@/types/records";

export interface TopicNoteSource {
  id: string;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  noteIndex: number;
  text: string;
}

export interface TopicDetailSource extends Pick<
  PracticeQuestionDetail,
  "question" | "selectedAnswer" | "correctAnswer"
> {
  id: string;
}
