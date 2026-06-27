import { configureStore } from "@reduxjs/toolkit";
import quizReducer from "./slices/quizSlice";
import recordsReducer from "./slices/recordsSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    quiz: quizReducer,
    records: recordsReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
