import type { PracticeQuestionDetail } from "@/types/records";

export type ReviewSortOrder = "date-desc" | "date-asc";

export interface ReviewDateOption {
  value: string;
  label: string;
}

export interface ReviewGroupedAttempt {
  recordId: string;
  attemptNumber: number;
  details: PracticeQuestionDetail[];
}

export interface ReviewGroupedDate {
  dateKey: string;
  dateLabel: string;
  attempts: ReviewGroupedAttempt[];
}
