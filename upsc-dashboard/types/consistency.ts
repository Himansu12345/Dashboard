export type ConsistencyState =
  | "Weak"
  | "Improving"
  | "Disciplined"
  | "Elite Consistency";

export type MomentumState =
  | "Momentum Rising"
  | "Momentum Stable"
  | "Momentum Falling";

export type ConsistencyTab = "overview" | "heatmap" | "streaks" | "momentum";

export interface ConsistencyDayActivity {
  date: string;
  monthKey: string;
  dayOfWeek: number;
  isToday: boolean;
  isActive: boolean;
  activityLevel: number;
  intensityScore: number;
  attemptCount: number;
  revisionCount: number;
  revisedTopicsCount: number;
  studyDurationMinutes: number;
  qualityScore: number;
  consistencyImpact: number;
  retentionImpact: number;
  accuracyAverage: number;
  reviewSuccessRate: number;
  streakContinued: boolean;
  topics: string[];
}

export interface ConsistencyMonth {
  key: string;
  label: string;
  year: number;
  month: number;
  days: ConsistencyDayActivity[];
}

export interface ConsistencyAchievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt: string | null;
  tone: "teal" | "mint" | "amber" | "rose";
}

export interface ConsistencyTrendPoint {
  date: string;
  intensityScore: number;
  consistencyScore: number;
  active: boolean;
}

export interface StreakHistoryItem {
  streakKey: string;
  startDate: string;
  endDate: string;
  length: number;
  status: "active" | "completed";
  type: "standard" | "comeback";
}

export interface StrongestWeekSummary {
  label: string;
  startDate: string;
  endDate: string;
  intensityScore: number;
  activeDays: number;
}

export interface ConsistencySummary {
  currentStreak: number;
  bestStreak: number;
  comebackStreak: number;
  activeDays: number;
  missedDays: number;
  activeThisMonth: number;
  totalRevisionMinutes: number;
  consistencyScore: number;
  consistencyState: ConsistencyState;
  momentumState: MomentumState;
  momentumDelta: number;
  strongestWeek: StrongestWeekSummary;
}

export interface ConsistencyDashboardPayload {
  generatedAt: string;
  summary: ConsistencySummary;
  months: ConsistencyMonth[];
  achievements: ConsistencyAchievement[];
  recentTrend: ConsistencyTrendPoint[];
  streakHistory: StreakHistoryItem[];
}
