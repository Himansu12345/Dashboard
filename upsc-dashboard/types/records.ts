export interface PracticeQuestionDetail {
  questionId?: string;
  question: string;
  options: string[];
  correctAnswer: string;
  selectedAnswer: string;
  reviewKind?: "incorrect" | "skipped";
  notes?: string[];
  note?: string;
  why?: string;
  sourceRecordId?: string;
  sourceRecordDate?: string;
  sourceRecordDateValue?: string;
  sourceRecordCreatedAt?: string;
  sourceSubject?: string;
  sourceTopic?: string;
  sourceSubtopic?: string;
  sourceDifficulty?: string;
}

export interface PracticeRecord {
  id: string;
  subject: string;
  topic: string;
  subtopic?: string;
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
  accuracy: number;
  difficulty: string;
  dateValue: string;
  date: string;
  createdAt: string;
  deletedAt?: string | null;
  incorrectDetails?: PracticeQuestionDetail[];
}

export type RecordUpdater =
  | PracticeRecord[]
  | ((previousRecords: PracticeRecord[]) => PracticeRecord[]);
