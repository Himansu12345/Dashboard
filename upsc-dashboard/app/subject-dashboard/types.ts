import type React from "react";

export type SubjectPriority =
  | "high"
  | "mid"
  | "low"
  | "pm3"
  | "pm2"
  | "pm"
  | "ps"
  | "pu"
  | "psel";

export type RawSubjectNode = {
  id?: string;
  p?: SubjectPriority | string;
  label: string;
  children?: RawSubjectNode[];
};

export type SubjectNode = Omit<RawSubjectNode, "children"> & {
  uid: string;
  children?: SubjectNode[];
};

export type SubjectStorageKeys = {
  checked: string;
  starred: string;
  notes: string;
  theme: string;
  completion: string;
  statuses: string;
  collapsed: string;
  noteDocuments: string;
};

export type SubjectDashboardConfig = {
  title: string;
  subtitle: React.ReactNode;
  storageKeys: SubjectStorageKeys;
  quizSubjectName?: string;
  smartModeData?: SubjectNode[];
};

export type SubjectProgress = {
  checkedLeaves: number;
  totalLeaves: number;
  pct: number;
};

export type SubjectCompletionTime = {
  completedAt: number;
  revisedAt?: number;
  revisions?: number[];
};

// Completion times can be stored either as timestamp number or as completion object
export type SubjectCompletionTimes = Record<string, SubjectCompletionTime | number>;

export type SubjectNodeStatus = {
  isChecked: boolean;
  completedAt?: number;
  revisedAt?: number;
  revisions: number[];
} | "completed" | "in_progress" | "not_started" | string;

// For storing status, allow both structured object and string values
export type SubjectNodeStatusMap = Record<string, SubjectNodeStatus | string>;

export type SubjectNoteEntry = {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
};

export type SubjectNoteDocument = {
  active: SubjectNoteEntry[];
  trash: SubjectNoteEntry[];
};

export type ChapterAttemptHistoryEntry = {
  id: string;
  topic: string;
  scoreLabel: string;
  accuracy: number;
  percentage: number;
  createdAt: string;
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
};

export type ChapterWrongQuestionEntry = {
  attemptId: string;
  topic: string;
  createdAt: string;
  question: string;
  options: string[];
  correctAnswer: string;
  selectedAnswer: string;
  notes: string[];
  why: string;
};

export type ChapterAttemptSummary = {
  attempts: number;
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
  accuracy: number;
  percentage: number;
  latestAttemptAt: string | null;
  history: ChapterAttemptHistoryEntry[];
  wrongQuestions: ChapterWrongQuestionEntry[];
};
