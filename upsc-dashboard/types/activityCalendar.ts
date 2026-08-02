export type DateCountMap = Record<string, number>;

export interface PlannerDayCompletion {
  totalMissions: number;
  completedMissions: number;
  completionPercent: number;
}

export type PlannerDayCompletionMap = Record<string, PlannerDayCompletion>;

export interface PlannerCalendarMission {
  id: string;
  type: "note" | "test" | "other";
  title: string;
  subject: string;
  chapter: string;
  mode?: string;
  status: string;
  plannedStart?: string;
  plannedEnd?: string;
  completedCount: number;
  totalCount: number;
  remainingCount: number;
  details: string[];
}

export interface PlannerCalendarDayDetails {
  dateKey: string;
  totalMissions: number;
  completedMissions: number;
  remainingMissions: number;
  missions: PlannerCalendarMission[];
}

export interface ActivityCalendarContextValue {
  dateCountMap: DateCountMap;
  plannerCompletionMap: PlannerDayCompletionMap;
  onDateSelect: (dateKey: string | null) => void;
}

export interface SubjectPopupFiltersState {
  startDate: string;
  endDate: string;
  difficulty: string;
}

export interface DatePopupFiltersState {
  subject: string;
  topic: string;
  difficulty: string;
}

export interface DatePopupFilterItem {
  key: "subject" | "topic" | "difficulty";
  label: string;
  onClear: () => void;
}

export interface DateAnalyticsPopupProps {
  dateKey: string | null;
  plannerDay?: PlannerCalendarDayDetails | null;
  onClose?: () => void;
}

export interface BlankDateCell {
  key: string;
  isBlank: true;
}

export interface FilledDateCell {
  key: string;
  isBlank: false;
  dateKey: string;
  count: number;
}

export type DateCell = BlankDateCell | FilledDateCell;
