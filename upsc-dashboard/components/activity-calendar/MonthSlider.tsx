import { useMemo, type KeyboardEvent, type MutableRefObject, type UIEvent } from "react";
import MonthCard from "./MonthCard";
import { MONTH_NAMES, VISIBLE_MONTHS } from "./activityCalendarUtils";

interface MonthSliderProps {
  months: Date[][];
  monthRefs: MutableRefObject<Array<HTMLDivElement | null>>;
  sliderViewportRef: MutableRefObject<HTMLDivElement | null>;
  sliderIndex: number;
  onMoveSlider: (direction: number) => void;
  onSliderScroll: (event: UIEvent<HTMLDivElement>) => void;
  onSliderKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
}

export default function MonthSlider({
  months,
  monthRefs,
  sliderViewportRef,
  sliderIndex,
  onMoveSlider,
  onSliderScroll,
  onSliderKeyDown,
}: MonthSliderProps) {
  const safeMonths = useMemo(() => (Array.isArray(months) ? months : []), [months]);

  const monthCards = useMemo(
    () =>
      safeMonths.map((monthDates, monthIndex) => (
        <div
          key={MONTH_NAMES[monthIndex]}
          className="month-slide"
          ref={(element) => {
            monthRefs.current[monthIndex] = element;
          }}
        >
          <MonthCard monthName={MONTH_NAMES[monthIndex]} monthDates={monthDates} />
        </div>
      )),
    [monthRefs, safeMonths],
  );

  return (
    <div className="month-slider-shell">
      <button
        type="button"
        className="month-slider-btn ripple-btn"
        onClick={() => onMoveSlider(-1)}
        disabled={sliderIndex <= 0}
        aria-label="Show previous month"
      >
        {"<"}
      </button>

      <div
        className="month-slider-viewport"
        ref={sliderViewportRef}
        onScroll={onSliderScroll}
        onKeyDown={onSliderKeyDown}
        tabIndex={0}
        aria-label="Monthly activity slider"
      >
        <div className="month-slider-track">{monthCards}</div>
      </div>

      <button
        type="button"
        className="month-slider-btn ripple-btn"
        onClick={() => onMoveSlider(1)}
        disabled={sliderIndex >= MONTH_NAMES.length - VISIBLE_MONTHS}
        aria-label="Show next month"
      >
        {">"}
      </button>
    </div>
  );
}
