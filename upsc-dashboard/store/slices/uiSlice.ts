import type { ConsistencyTab } from "@/types/consistency";
import type { SyllabusTab } from "@/types/syllabus";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  isNotesPopupOpen: boolean;
  isConsistencyPopupOpen: boolean;
  consistencyPopupTab: ConsistencyTab;
  isSyllabusPopupOpen: boolean;
  syllabusPopupTab: SyllabusTab;
}

const initialState: UiState = {
  isNotesPopupOpen: false,
  isConsistencyPopupOpen: false,
  consistencyPopupTab: "overview",
  isSyllabusPopupOpen: false,
  syllabusPopupTab: "overview",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setNotesPopupOpen(state, action: PayloadAction<boolean>) {
      state.isNotesPopupOpen = action.payload;
    },
    openConsistencyPopup(state, action: PayloadAction<ConsistencyTab | undefined>) {
      state.isConsistencyPopupOpen = true;
      state.consistencyPopupTab = action.payload || "overview";
    },
    closeConsistencyPopup(state) {
      state.isConsistencyPopupOpen = false;
    },
    setConsistencyPopupTab(state, action: PayloadAction<ConsistencyTab>) {
      state.consistencyPopupTab = action.payload;
    },
    openSyllabusPopup(state, action: PayloadAction<SyllabusTab | undefined>) {
      state.isSyllabusPopupOpen = true;
      state.syllabusPopupTab = action.payload || "overview";
    },
    closeSyllabusPopup(state) {
      state.isSyllabusPopupOpen = false;
    },
    setSyllabusPopupTab(state, action: PayloadAction<SyllabusTab>) {
      state.syllabusPopupTab = action.payload;
    },
  },
});

export const {
  setNotesPopupOpen,
  openConsistencyPopup,
  closeConsistencyPopup,
  setConsistencyPopupTab,
  openSyllabusPopup,
  closeSyllabusPopup,
  setSyllabusPopupTab,
} = uiSlice.actions;
export default uiSlice.reducer;
