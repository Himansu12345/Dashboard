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
    selectedOptionId: string;
    isCorrect: boolean;
    result: "Correct" | "Incorrect";
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
      timestamp: number;
      sessionId: string;
      subject: string;
      topic: string;
      question: string;
      selectedOption: string;
      correctOption: string;
      result: string;
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
