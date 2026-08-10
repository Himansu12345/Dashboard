import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type UIEvent,
} from "react";
import ActivityCalendarProvider from "./ActivityCalendarProvider";
import CalendarHeader from "./CalendarHeader";
import DateAnalyticsPopup from "./DateAnalyticsPopup";
import MonthSlider from "./MonthSlider";
import {
  buildDateCountMap,
  buildPlannerDayDetailsMap,
  buildPlannerCompletionMap,
  buildYearDays,
  clampSliderIndex,
  getInitialSliderIndex,
  groupDaysByMonth,
} from "./activityCalendarUtils";
import { buildApiUrl } from "@/lib/api/client";
import type { PracticeRecord } from "@/types/records";
import type { ActivityCalendarContextValue } from "@/types/activityCalendar";

function getCurrentDateMeta() {
  const currentDate = new Date();
  return {
    currentYear: currentDate.getFullYear(),
    currentMonthIndex: currentDate.getMonth(),
  };
}

interface ActivityCalendarProps {
  records: PracticeRecord[];
}

export default function ActivityCalendar({ records }: ActivityCalendarProps) {
  const safeRecords = useMemo<PracticeRecord[]>(
    () => (Array.isArray(records) ? records : []),
    [records],
  );
  const { currentYear, currentMonthIndex } = getCurrentDateMeta();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [sliderIndex, setSliderIndex] = useState<number>(
    getInitialSliderIndex(currentMonthIndex),
  );
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [plannerDays, setPlannerDays] = useState<unknown[]>([]);
  const sliderViewportRef = useRef<HTMLDivElement | null>(null);
  const monthRefs = useRef<Array<HTMLDivElement | null>>([]);
  const sliderScrollFrameRef = useRef<number | null>(null);

  const dateCountMap = useMemo(
    () => buildDateCountMap(safeRecords, selectedYear),
    [safeRecords, selectedYear],
  );
  const plannerCompletionMap = useMemo(
    () => buildPlannerCompletionMap(plannerDays),
    [plannerDays],
  );
  const plannerDayDetailsMap = useMemo(
    () => buildPlannerDayDetailsMap(plannerDays),
    [plannerDays],
  );
  const allDays = useMemo(() => buildYearDays(selectedYear), [selectedYear]);
  const months = useMemo(() => groupDaysByMonth(allDays), [allDays]);
  const totalSubmissions = useMemo(
    () => Object.values(dateCountMap).reduce((sum, value) => sum + value, 0),
    [dateCountMap],
  );
  const totalCompletedMissions = useMemo(
    () =>
      Object.values(plannerCompletionMap).reduce(
        (sum, day) => sum + day.completedMissions,
        0,
      ),
    [plannerCompletionMap],
  );
  const totalPlannedMissions = useMemo(
    () =>
      Object.values(plannerCompletionMap).reduce(
        (sum, day) => sum + day.totalMissions,
        0,
      ),
    [plannerCompletionMap],
  );

  const scrollToMonth = useCallback(
    (nextIndex: number, behavior: ScrollBehavior = "smooth") => {
      const viewport = sliderViewportRef.current;
      const monthElement = monthRefs.current[nextIndex];
      if (!viewport || !monthElement) return;

      viewport.scrollTo({
        left: monthElement.offsetLeft,
        behavior,
      });
    },
    [],
  );

  useEffect(() => {
    const initialIndex = getInitialSliderIndex(currentMonthIndex);
    const frameId = window.requestAnimationFrame(() => {
      scrollToMonth(initialIndex, "auto");
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [currentMonthIndex, scrollToMonth, selectedYear]);

  const loadPlannerDays = useCallback(
    async (isCancelled: () => boolean) => {
      try {
        const response = await fetch(buildApiUrl(`/planner/year/${selectedYear}`));
        if (!response.ok) throw new Error("Planner year fetch failed.");
        const payload = await response.json();
        if (!isCancelled()) {
          setPlannerDays(Array.isArray(payload?.data) ? payload.data : []);
        }
      } catch {
        if (!isCancelled()) setPlannerDays([]);
      }
    },
    [selectedYear],
  );

  useEffect(() => {
    let isCancelled = false;

    void loadPlannerDays(() => isCancelled);

    const handleFocus = () => {
      void loadPlannerDays(() => isCancelled);
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      isCancelled = true;
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadPlannerDays]);

  useEffect(
    () => () => {
      if (sliderScrollFrameRef.current !== null) {
        window.cancelAnimationFrame(sliderScrollFrameRef.current);
      }
    },
    [],
  );

  const handleSliderScroll = useCallback((_event: UIEvent<HTMLDivElement>) => {
    const viewport = sliderViewportRef.current;
    if (!viewport) return;

    if (sliderScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(sliderScrollFrameRef.current);
    }

    sliderScrollFrameRef.current = window.requestAnimationFrame(() => {
      const firstSlide = monthRefs.current[0];
      const secondSlide = monthRefs.current[1];
      if (!firstSlide || !secondSlide) return;

      const step = secondSlide.offsetLeft - firstSlide.offsetLeft;
      if (step <= 0) return;

      const nearestIndex = clampSliderIndex(
        Math.round(viewport.scrollLeft / step),
      );
      setSliderIndex((previousIndex) =>
        previousIndex === nearestIndex ? previousIndex : nearestIndex,
      );
    });
  }, []);

  const handleMoveSlider = useCallback(
    (direction: number) => {
      setSliderIndex((previousIndex) => {
        const nextIndex = clampSliderIndex(previousIndex + direction);
        if (nextIndex !== previousIndex) {
          scrollToMonth(nextIndex, "smooth");
        }
        return nextIndex;
      });
    },
    [scrollToMonth],
  );

  const handleSliderKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handleMoveSlider(-1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleMoveSlider(1);
      }
    },
    [handleMoveSlider],
  );

  const closeDatePopup = useCallback(() => {
    setSelectedDateKey(null);
  }, []);

  function handleYearChange(event: ChangeEvent<HTMLSelectElement>) {
    const year = Number(event.target.value);
    if (!Number.isFinite(year)) return;

    const nextIndex = getInitialSliderIndex(currentMonthIndex);

    setSelectedYear(year);
    setSliderIndex(nextIndex);
    setSelectedDateKey(null);

    window.requestAnimationFrame(() => {
      scrollToMonth(nextIndex, "auto");
    });
  }

  const contextValue = useMemo<ActivityCalendarContextValue>(
    () => ({
      dateCountMap,
      plannerCompletionMap,
      onDateSelect: setSelectedDateKey,
    }),
    [dateCountMap, plannerCompletionMap],
  );

  return (
    <section className="heatmap-card">
      <CalendarHeader
        totalSubmissions={totalSubmissions}
        totalCompletedMissions={totalCompletedMissions}
        totalPlannedMissions={totalPlannedMissions}
        selectedYear={selectedYear}
        currentYear={currentYear}
        onYearChange={handleYearChange}
      />

      <ActivityCalendarProvider value={contextValue}>
        <MonthSlider
          months={months}
          monthRefs={monthRefs}
          sliderViewportRef={sliderViewportRef}
          sliderIndex={sliderIndex}
          onMoveSlider={handleMoveSlider}
          onSliderScroll={handleSliderScroll}
          onSliderKeyDown={handleSliderKeyDown}
        />
      </ActivityCalendarProvider>

      <div className="legend-row">
        <span className="legend-label">No missions</span>
        <div className="legend-dot" style={{ background: "#141f35" }} />
        <div className="legend-dot" style={{ background: "#ef4444" }} />
        <div className="legend-dot" style={{ background: "#f59e0b" }} />
        <div className="legend-dot" style={{ background: "#22c55e" }} />
        <span className="legend-label">Mission completion</span>
      </div>

      <DateAnalyticsPopup
        key={selectedDateKey || "none"}
        dateKey={selectedDateKey}
        plannerDay={
          selectedDateKey ? plannerDayDetailsMap[selectedDateKey] || null : null
        }
        onClose={closeDatePopup}
      />
    </section>
  );
}
