declare module "@/hooks/useReportData" {
  export default function useReportData(startDate: Date, endDate: Date): {
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
    loading: boolean;
  };
}
