export interface TotalsAnalytics {
  totalCorrect: number;
  totalIncorrect: number;
  totalAttempts: number;
  totalQuestions: number;
  overallAccuracy: number;
}

export interface SubjectChartRow {
  subject: string;
  accuracy: number;
  correct: number;
  incorrect: number;
  total: number;
}

export interface LineChartRow {
  name: string;
  accuracy: number;
  topic?: string;
}

export interface PieValueRow {
  name: string;
  value: number;
}

export interface DashboardAnalytics {
  lineChartData: LineChartRow[];
  subjectChartData: SubjectChartRow[];
  pieData: PieValueRow[];
  totals: TotalsAnalytics;
}

export interface TopicAnalytics {
  topicAccuracyData: Array<{
    topic: string;
    accuracy: number;
    correct: number;
    incorrect: number;
    total: number;
  }>;
  topicLineData: Array<{
    name: string;
    topic: string;
    accuracy: number;
  }>;
  topicShareData: Array<{
    name: string;
    value: number;
  }>;
}

export interface DateBreakdownRow {
  submissions: number;
  questions: number;
  correct: number;
  incorrect: number;
  skipped: number;
  accuracy: number;
  submissionShare: number;
  questionShare: number;
}

export interface SubjectBreakdownRow extends DateBreakdownRow {
  subject: string;
}

export interface TopicBreakdownRow extends DateBreakdownRow {
  topic: string;
}

export interface DifficultyBreakdownRow extends DateBreakdownRow {
  difficulty: string;
}

export interface DateAnalyticsResult {
  dateKey: string;
  totalSubmissions: number;
  totalQuestionsAttempted: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalSkipped: number;
  accuracy: number;
  subjectBreakdown: SubjectBreakdownRow[];
  topicBreakdown: TopicBreakdownRow[];
  difficultyBreakdown: DifficultyBreakdownRow[];
}
