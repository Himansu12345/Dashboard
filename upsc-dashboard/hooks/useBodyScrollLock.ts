import { useEffect } from "react";

const LOCK_COUNT_KEY = "scrollLockCount";
const PREV_OVERFLOW_KEY = "scrollLockPrevOverflow";
const PREV_PADDING_RIGHT_KEY = "scrollLockPrevPaddingRight";

function toCount(value: string | undefined): number {
  const count = Number(value);
  return Number.isFinite(count) && count > 0 ? count : 0;
}

export default function useBodyScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return undefined;

    const { body } = document;
    const currentCount = toCount(body.dataset[LOCK_COUNT_KEY]);

    if (currentCount === 0) {
      body.dataset[PREV_OVERFLOW_KEY] = body.style.overflow || "";
      body.dataset[PREV_PADDING_RIGHT_KEY] = body.style.paddingRight || "";
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }
    }

    body.dataset[LOCK_COUNT_KEY] = String(currentCount + 1);

    return () => {
      const latestCount = toCount(body.dataset[LOCK_COUNT_KEY]);
      const nextCount = Math.max(0, latestCount - 1);

      if (nextCount === 0) {
        body.style.overflow = body.dataset[PREV_OVERFLOW_KEY] || "";
        body.style.paddingRight = body.dataset[PREV_PADDING_RIGHT_KEY] || "";
        delete body.dataset[PREV_OVERFLOW_KEY];
        delete body.dataset[PREV_PADDING_RIGHT_KEY];
        delete body.dataset[LOCK_COUNT_KEY];
      } else {
        body.dataset[LOCK_COUNT_KEY] = String(nextCount);
      }
    };
  }, [isLocked]);
}
