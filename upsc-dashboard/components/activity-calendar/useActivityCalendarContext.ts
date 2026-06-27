import { useContext } from "react";
import ActivityCalendarContext from "./activityCalendarContext";
import type { ActivityCalendarContextValue } from "@/types/activityCalendar";

export default function useActivityCalendarContext(): ActivityCalendarContextValue {
  const context = useContext(ActivityCalendarContext);
  if (!context) {
    throw new Error("useActivityCalendarContext must be used inside ActivityCalendarProvider");
  }
  return context;
}
