import { createContext } from "react";
import type { ActivityCalendarContextValue } from "@/types/activityCalendar";

const ActivityCalendarContext = createContext<ActivityCalendarContextValue | null>(null);

export default ActivityCalendarContext;
