import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PracticeRecord } from "@/types/records";

interface RecordsState {
  records: PracticeRecord[];
}

const initialState: RecordsState = {
  records: [],
};

const recordsSlice = createSlice({
  name: "records",
  initialState,
  reducers: {
    setRecords(state, action: PayloadAction<PracticeRecord[]>) {
      state.records = action.payload;
    },
  },
});

export const { setRecords } = recordsSlice.actions;
export default recordsSlice.reducer;
