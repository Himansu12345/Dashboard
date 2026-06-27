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
  buildDateAnalytics,
  buildDateCountMap,
  buildYearDays,
  clampSliderIndex,
  getInitialSliderIndex,
  groupDaysByMonth,
} from "./activityCalendarUtils";
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
  const safeRecords = useMemo<PracticeRecord[]>(() => (Array.isArray(records) ? records : []), [records]);
  const { currentYear, currentMonthIndex } = getCurrentDateMeta();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [sliderIndex, setSliderIndex] = useState<number>(getInitialSliderIndex(currentMonthIndex));
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const sliderViewportRef = useRef<HTMLDivElement | null>(null);
  const monthRefs = useRef<Array<HTMLDivElement | null>>([]);
  const sliderScrollFrameRef = useRef<number | null>(null);

  const dateCountMap = useMemo(
    () => buildDateCountMap(safeRecords, selectedYear),
    [safeRecords, selectedYear],
  );
  const allDays = useMemo(() => buildYearDays(selectedYear), [selectedYear]);
  const months = useMemo(() => groupDaysByMonth(allDays), [allDays]);
  const totalSubmissions = useMemo(
    () => Object.values(dateCountMap).reduce((sum, value) => sum + value, 0),
    [dateCountMap],
  );

  const selectedDateAnalytics = useMemo(() => {
    if (!selectedDateKey) return null;
    return buildDateAnalytics(safeRecords, selectedDateKey);
  }, [safeRecords, selectedDateKey]);

  const scrollToMonth = useCallback((nextIndex: number, behavior: ScrollBehavior = "smooth") => {
    const viewport = sliderViewportRef.current;
    const monthElement = monthRefs.current[nextIndex];
    if (!viewport || !monthElement) return;

    viewport.scrollTo({
      left: monthElement.offsetLeft,
      behavior,
    });
  }, []);

  useEffect(() => {
    const initialIndex = getInitialSliderIndex(currentMonthIndex);
    const frameId = window.requestAnimationFrame(() => {
      scrollToMonth(initialIndex, "auto");
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [currentMonthIndex, scrollToMonth, selectedYear]);

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

      const nearestIndex = clampSliderIndex(Math.round(viewport.scrollLeft / step));
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
      onDateSelect: setSelectedDateKey,
    }),
    [dateCountMap],
  );

  return (
    <section className="heatmap-card">
      <CalendarHeader
        totalSubmissions={totalSubmissions}
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
        <span className="legend-label">Less</span>
        <div className="legend-dot" style={{ background: "#141f35" }} />
        <div className="legend-dot" style={{ background: "#00d5ff" }} />
        <div className="legend-dot" style={{ background: "#00ff95" }} />
        <div className="legend-dot" style={{ background: "#ffd25a" }} />
        <div className="legend-dot" style={{ background: "#ff5f74" }} />
        <span className="legend-label">More</span>
      </div>

      <DateAnalyticsPopup
        key={selectedDateKey || "none"}
        dateKey={selectedDateKey}
        analytics={selectedDateAnalytics}
        records={safeRecords}
        onClose={closeDatePopup}
      />
    </section>
  );
}
