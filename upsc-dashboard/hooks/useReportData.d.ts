declare module "@/hooks/useReportData" {
  export default function useReportData(startDate: Date, endDate: Date): {
    data: Record<string, unknown> | null;
    report: Record<string, unknown> | null;
    summary: Record<string, unknown> | null;
    analysis: Record<string, unknown> | null;
    timeline: Array<Record<string, unknown>>;
    sessions: Array<Record<string, unknown>>;
    loading: boolean;
    error: string | null;
  };
}
