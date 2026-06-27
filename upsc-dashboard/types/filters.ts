export interface DashboardFilters {
  startDate: string;
  endDate: string;
  subject: string;
  difficulty: string;
}

export interface DateBounds {
  minDate: string;
  maxDate: string;
}

export interface DateRange {
  from?: string;
  to?: string;
  startDate?: string;
  endDate?: string;
}
