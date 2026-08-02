declare module "@/trackingService" {
  export interface QuestionAttemptData {
    questionId: string;
    question: {
      stem: string;
      statements: string[];
      instruction?: string;
      options: Record<string, string>;
      correctOption: string;
    };
    selectedOption: string;
    selectedOptionId: string | null;
    isCorrect: boolean;
    result: "Correct" | "Incorrect" | "Skipped";
    subject?: string;
    topic?: string;
    subtopic?: string | null;
    difficulty?: string;
    timeLimit?: number;
    timeTaken?: number;
    confidence?: string | null;
  }

  export interface NoteActionData {
    subject: string;
    action: string;
    note: string;
  }

   
  export function trackQuestionAttempt(attemptData: QuestionAttemptData): Promise<{
    timestamp: number;
    sessionId: string;
  } | void>;

  export function trackNoteAction(actionData: NoteActionData): Promise<{
    timestamp: number;
    sessionId: string;
  }>;

  export function getReportData(startDate: Date, endDate: Date): Promise<{
    questionAttempts: Array<{
      id?: string;
      timestamp: number;
      sessionId: string;
      questionId?: string;
      subject: string;
      topic: string;
      question?: string;
      questionText?: string;
      selectedOption: string;
      correctOption: string;
      result: "Correct" | "Incorrect" | "Skipped" | string;
      timeTaken?: number | null;
    }>;
    noteActions: Array<{
      timestamp: number;
      sessionId: string;
      subject: string;
      action: string;
      note: string;
    }>;
    studySessions: Array<{
      id: string;
      startTime: number;
      endTime?: number;
      duration?: number;
    }>;
  }>;
}
