// Type definitions for Report System

export interface StarAction {
  id: string;
  uid: string;
  subject: string;
  action: "star" | "unstar";
  timestamp: number;
  date: string;
  time: string;
}

export interface StudySession {
  id: string;
  startTime: number;
  endTime?: number;
  endDate?: string;
  endTimeStr?: string;
  duration?: number; // in milliseconds
  questionsAttempted: number;
  correct: number;
  incorrect: number;
  skipped: number;
  subjectsStudied: string[];
  chaptersStudied: string[];
  topicsStudied: string[];
}

export interface DateFilterPreset {
  label: string;
  value: string;
  startDate: Date | null;
  endDate: Date | null;
}

export type DatePresetOption = 
  | "today" 
  | "yesterday" 
  | "last7days" 
  | "last30days" 
  | "thismonth" 
  | "previousmonth" 
  | "custom";

export interface DataAvailability {
  field: string;
  historicallyAvailable: boolean;
  availableFrom: string | null;
  notes?: string;
}

export interface ReportMetadata {
  generatedAt: string;
  generatedBy: string;
  selectedDateRange: {
    preset: string;
    startDate: string | null;
    endDate: string | null;
  };
  appVersion: string;
}

export interface ReportSummary {
  totalActivities: number;
  totalQuestionsAttempted: number;
  totalCorrect: number;
  totalWrong: number;
  accuracy: number;
  totalCompleteActions: number;
  totalReviseActions: number;
  totalStarActions: number;
  sessionCount: number;
}

export interface SubjectAnalysis {
  subject: string;
  totalAttempted: number;
  correct: number;
  incorrect: number;
  accuracy: number;
}

export interface ChapterAnalysis {
  subject: string;
  chapter: string;
  totalAttempted: number;
  correct: number;
  incorrect: number;
  accuracy: number;
}

export interface TopicAnalysis {
  subject: string;
  chapter: string;
  topic: string;
  totalAttempted: number;
  correct: number;
  incorrect: number;
  accuracy: number;
}

export interface DifficultyAnalysis {
  difficulty: string;
  totalAttempted: number;
  correct: number;
  incorrect: number;
  accuracy: number;
}

export interface TimeAnalysis {
  hour: number;
  label: string;
  totalAttempted: number;
  correct: number;
  incorrect: number;
  accuracy: number;
}

export interface AIAnalysisHelpers {
  weakTopics: TopicAnalysis[];
  strongTopics: TopicAnalysis[];
  mostWrongChapters: ChapterAnalysis[];
  mostWrongSubjects: SubjectAnalysis[];
  repeatedMistakePatterns: string[];
  revisionGaps: string[];
  completionGaps: string[];
  accuracyTrend: "improving" | "declining" | "stable" | "insufficient_data";
  speedTrend: "improving" | "declining" | "stable" | "insufficient_data";
}

export interface ActivityTimelineItem {
  id: string;
  type: "quiz_attempt" | "complete" | "revise" | "star" | "unstar" | "session_start" | "session_end";
  timestamp: number;
  date: string;
  time: string;
  details: Record<string, unknown>;
}

export interface FullReportExport {
  metadata: ReportMetadata;
  dataAvailability: DataAvailability[];
  summary: ReportSummary;
  questionAttempts: Record<string, unknown>[];
  noteActions: Record<string, unknown>[];
  timeline: ActivityTimelineItem[];
  sessions: StudySession[];
  subjectAnalysis: SubjectAnalysis[];
  chapterAnalysis: ChapterAnalysis[];
  topicAnalysis: TopicAnalysis[];
  difficultyAnalysis: DifficultyAnalysis[];
  timeAnalysis: TimeAnalysis[];
  aiHelpers: AIAnalysisHelpers;
}
