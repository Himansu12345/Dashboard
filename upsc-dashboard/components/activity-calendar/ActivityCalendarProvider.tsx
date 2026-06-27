import ActivityCalendarContext from "./activityCalendarContext";
import type { ReactNode } from "react";
import type { ActivityCalendarContextValue } from "@/types/activityCalendar";

interface ActivityCalendarProviderProps {
  value: ActivityCalendarContextValue;
  children: ReactNode;
}

export default function ActivityCalendarProvider({ value, children }: ActivityCalendarProviderProps) {
  return <ActivityCalendarContext.Provider value={value}>{children}</ActivityCalendarContext.Provider>;
}
