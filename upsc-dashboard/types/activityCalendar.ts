import type { DateAnalyticsResult } from "@/types/analytics";
import type { PracticeRecord } from "@/types/records";

export type DateCountMap = Record<string, number>;

export interface ActivityCalendarContextValue {
  dateCountMap: DateCountMap;
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
  analytics: DateAnalyticsResult | null;
  records: PracticeRecord[];
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
