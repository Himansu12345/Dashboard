declare module "@/components/ReportExporter" {
  import React from "react";

  interface ReportData {
    data: {
      questionAttempts: Array<{
        timestamp: number;
        subject: string;
        topic: string;
        question: string;
        selectedOption: string;
        correctOption: string;
        result: string;
      }>;
      noteActions: Array<{
        timestamp: number;
        subject: string;
        action: string;
        note: string;
      }>;
      studySessions: Array<unknown>;
    };
    summary: {
      totalQuestionsAttempted: number;
      totalCorrect: number;
      totalWrong: number;
      accuracy: number;
    };
    analysis: {
      subjectAnalysis: Record<string, { total: number; correct: number }>;
    };
  }

  interface DateRange {
    startDate: Date;
    endDate: Date;
  }

  interface ReportExporterProps {
    reportData: ReportData;
    dateRange: DateRange;
  }

  export default function ReportExporter(props: ReportExporterProps): React.ReactElement;
}
