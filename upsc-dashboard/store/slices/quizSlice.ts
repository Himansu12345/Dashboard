import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type QuizOptionId = "A" | "B" | "C" | "D";
export type QuizMode = "practice" | "exam";

const UPSC_CORRECT_MARKS = 2;
const UPSC_NEGATIVE_MARKS = 0.66;

export interface QuizSessionMeta {
  subject?: string;
  topic: string;
  noteChapter?: string;
  noteChapterId?: string;
  mode?: QuizMode;
  totalQuestions: number;
  totalTimeSeconds?: number;
  timeLimitPerMcqSeconds: number;
}

export interface QuizExplanation {
  coreConcept: string;
  trapUsed: string;
  laxmikanthCitation: string;
  visionIasCitation: string;
}

export interface QuizQuestion {
  id: string;
  questionType: string;
  stem: string;
  statements: string[];
  instruction?: string;
  options: Record<QuizOptionId, string>;
  correctOptionId: QuizOptionId;
  explanation: QuizExplanation;
}

export interface QuizApiPayload {
  sessionMeta: QuizSessionMeta;
  questions: QuizQuestion[];
}

interface QuizState {
  sessionMeta: QuizSessionMeta | null;
  questions: QuizQuestion[];
  answersByIndex: Record<number, QuizOptionId>;
  currentIndex: number;
  score: number;
  timeLeft: number;
  isLocked: boolean;
  isLoading: boolean;
  selectedOptionId: QuizOptionId | null;
  error: string | null;
  // --- PRO FEATURES STATE ---
  sessionPhase: "pass1" | "pass2";
  markedForReview: string[];
  eliminatedOptions: Record<string, QuizOptionId[]>;
}

const DEFAULT_TIME_LIMIT_SECONDS = 60;

const initialState: QuizState = {
  sessionMeta: null,
  questions: [],
  answersByIndex: {},
  currentIndex: 0,
  score: 0,
  timeLeft: DEFAULT_TIME_LIMIT_SECONDS,
  isLocked: false,
  isLoading: false,
  selectedOptionId: null,
  error: null,
  sessionPhase: "pass1",
  markedForReview: [],
  eliminatedOptions: {},
};

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    loadQuiz(state, action: PayloadAction<QuizApiPayload>) {
      state.sessionMeta = action.payload.sessionMeta;
      state.questions = action.payload.questions;
      state.answersByIndex = {};
      state.currentIndex = 0;
      state.score = 0;
      state.timeLeft =
        action.payload.sessionMeta.totalTimeSeconds ||
        action.payload.sessionMeta.timeLimitPerMcqSeconds ||
        DEFAULT_TIME_LIMIT_SECONDS;
      state.isLocked = false;
      state.isLoading = false;
      state.selectedOptionId = null;
      state.error = null;
      
      // Reset pro features on new quiz
      state.sessionPhase = "pass1";
      state.markedForReview = [];
      state.eliminatedOptions = {};
    },
    failLoading(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    decrementTime(state) {
      if (state.questions.length === 0) {
        return;
      }

      if (state.timeLeft <= 1) {
        state.timeLeft = 0;
        state.isLocked = true;
        return;
      }

      state.timeLeft -= 1;
    },
    submitAnswer(state, action: PayloadAction<QuizOptionId>) {
      if (state.isLocked) {
        return;
      }

      const currentQuestion = state.questions[state.currentIndex];
      if (!currentQuestion) {
        return;
      }

      state.selectedOptionId = action.payload;
      state.answersByIndex[state.currentIndex] = action.payload;
      
      if (state.sessionMeta?.mode === "exam") {
        return;
      }
      
      state.score +=
        action.payload === currentQuestion.correctOptionId
          ? UPSC_CORRECT_MARKS
          : -UPSC_NEGATIVE_MARKS;
      state.isLocked = true;
    },
    nextQuestion(state) {
      // Modified to safely handle multi-pass without zeroing out the timer at the end of the array
      if (state.currentIndex < state.questions.length - 1) {
        state.currentIndex += 1;
        state.isLocked = !!state.answersByIndex[state.currentIndex];
        state.selectedOptionId = state.answersByIndex[state.currentIndex] || null;
      }
    },
    resetQuiz() {
      return initialState;
    },
    
    // --- PRO FEATURE REDUCERS ---
    setQuestionIndex(state, action: PayloadAction<number>) {
      state.currentIndex = action.payload;
      state.selectedOptionId = state.answersByIndex[action.payload] || null;
      // Auto-lock in practice mode if returning to an already answered question
      state.isLocked = !!state.answersByIndex[action.payload];
    },
    setSessionPhase(state, action: PayloadAction<"pass1" | "pass2">) {
      state.sessionPhase = action.payload;
    },
    toggleMarkForReview(state, action: PayloadAction<string>) {
      const questionId = action.payload;
      if (state.markedForReview.includes(questionId)) {
        state.markedForReview = state.markedForReview.filter(id => id !== questionId);
      } else {
        state.markedForReview.push(questionId);
      }
    },
    toggleElimination(state, action: PayloadAction<{ questionId: string; optionId: QuizOptionId }>) {
      const { questionId, optionId } = action.payload;
      const current = state.eliminatedOptions[questionId] || [];
      if (current.includes(optionId)) {
        state.eliminatedOptions[questionId] = current.filter(id => id !== optionId);
      } else {
        state.eliminatedOptions[questionId] = [...current, optionId];
      }
    },
  },
});

export const {
  decrementTime,
  failLoading,
  loadQuiz,
  nextQuestion,
  resetQuiz,
  startLoading,
  submitAnswer,
  setQuestionIndex,
  setSessionPhase,
  toggleMarkForReview,
  toggleElimination,
} = quizSlice.actions;

export default quizSlice.reducer;