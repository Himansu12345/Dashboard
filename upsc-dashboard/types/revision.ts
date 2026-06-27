export type RevisionPriority = "Critical" | "High" | "Medium" | "Stable";
export type RevisionReviewOutcome = "correct" | "wrong";

export interface RevisionReviewHistoryItem {
  reviewedAt: string | null;
  outcome: RevisionReviewOutcome;
  intervalDays: number;
  retentionScoreBefore: number;
  retentionScoreAfter: number;
  revisionStrengthAfter: number;
  nextReviewDate: string | null;
}

export interface RevisionTopic {
  id: string;
  topicKey: string;
  subject: string;
  topic: string;
  attemptsCount: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  accuracy: number;
  repeatedMistakeCount: number;
  lastAttemptAt: string | null;
  lastReviewedAt: string | null;
  nextReviewDate: string | null;
  revisionStrength: number;
  retentionScore: number;
  decayScore: number;
  overdueDays: number;
  priority: RevisionPriority;
  reviewHistory: RevisionReviewHistoryItem[];
  lastReviewOutcome: RevisionReviewOutcome | null;
  status: "active" | "archived";
  daysSinceReference: number;
}

export interface RevisionDashboardSummary {
  totalTrackedTopics: number;
  dueTodayCount: number;
  overdueCount: number;
  fadingCount: number;
  averageRetentionScore: number;
  priorityCounts: Record<RevisionPriority, number>;
}

export interface RevisionDashboardPayload {
  generatedAt: string;
  summary: RevisionDashboardSummary;
  queueTopics: RevisionTopic[];
  fadingTopics: RevisionTopic[];
  overdueTopics: RevisionTopic[];
  recentlyStrengthenedTopics: RevisionTopic[];
  allTopics: RevisionTopic[];
}
