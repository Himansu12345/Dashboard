import { useEffect, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "a[href]",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((element) => {
    if (element.hasAttribute("disabled")) return false;
    if (element.getAttribute("aria-hidden") === "true") return false;
    if (element.offsetParent === null && element !== document.activeElement) return false;
    return true;
  });
}

interface UseFocusTrapOptions {
  isActive: boolean;
  containerRef: RefObject<HTMLElement | null>;
  initialFocusSelector?: string;
}

export default function useFocusTrap({
  isActive,
  containerRef,
  initialFocusSelector = "select, button, [tabindex]:not([tabindex='-1'])",
}: UseFocusTrapOptions): void {
  useEffect(() => {
    if (!isActive) return undefined;

    const containerNode = containerRef.current;
    if (!containerNode) return undefined;
    const trapContainer: HTMLElement = containerNode;
    const previousActiveElement = document.activeElement as HTMLElement | null;

    const activeElement = document.activeElement as HTMLElement | null;
    if (!activeElement || !trapContainer.contains(activeElement)) {
      const fallbackFocusables = getFocusableElements(trapContainer);
      const focusTarget =
        trapContainer.querySelector<HTMLElement>(initialFocusSelector) ||
        fallbackFocusables[0] ||
        trapContainer;
      focusTarget.focus();
    }

    function handleTabKey(event: KeyboardEvent) {
      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements(trapContainer);
      if (focusableElements.length === 0) {
        event.preventDefault();
        trapContainer.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const currentActive = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (!currentActive || currentActive === firstElement || !trapContainer.contains(currentActive)) {
          event.preventDefault();
          lastElement.focus();
        }
      } else if (!currentActive || currentActive === lastElement || !trapContainer.contains(currentActive)) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    trapContainer.addEventListener("keydown", handleTabKey);
    return () => {
      trapContainer.removeEventListener("keydown", handleTabKey);
      if (previousActiveElement && typeof previousActiveElement.focus === "function") {
        previousActiveElement.focus();
      }
    };
  }, [containerRef, initialFocusSelector, isActive]);
}
