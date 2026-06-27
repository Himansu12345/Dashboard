"use client";

import { useEffect } from "react";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

const REFRESH_DEBOUNCE_MS = 90;
const BAR_SPEED_PX_PER_SECOND = 82; // Speed at which the sweep line travels up the bar, in pixels per second
const BAR_DURATION_MIN_MS = 1200; // Minimum animation duration for a bar sweep, in milliseconds
const BAR_DURATION_MAX_MS = 7800; // Maximum animation duration for a bar sweep, in milliseconds
const POSITION_EPSILON = 0.02; // Threshold for updating Y position to avoid unnecessary DOM writes, in pixels
const AUTO_RESCAN_INTERVAL_MS = 240; // Interval to automatically rescan for bars if none are found, in milliseconds

let barShapeIdCounter = 0; // Global counter for unique bar shape IDs (client-side only)
let barClipIdCounter = 0;

const SWEEP_COLOR = "#000000";

const OVERLAY_RECHARTS_CLASSES = new Set([
  "recharts-bar-sweep-overlay",
  "recharts-bar-sweep-fill",
  "recharts-bar-sweep-line",
]);

const RELEVANT_RECHARTS_CLASSES = new Set([
  "recharts-surface",
  "recharts-bar",
  "recharts-bar-rectangle",
  "recharts-active-bar",
  "recharts-wrapper",
  "recharts-responsive-container",
]);

interface BarSweepRecord {
  shape: SVGGraphicsElement;
  overlay: SVGGElement;
  fillRect: SVGRectElement;
  line: SVGLineElement;
  bottomY: number;
  height: number;
  currentY: number;
}

function getSharedCycleDurationMs(records: BarSweepRecord[]): number {
  const tallestBarHeight = records.reduce(
    (currentMax, record) => Math.max(currentMax, record.height),
    0,
  );
  return Math.round(
    clamp(
      (tallestBarHeight / BAR_SPEED_PX_PER_SECOND) * 1000,
      BAR_DURATION_MIN_MS,
      BAR_DURATION_MAX_MS,
    ),
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function isFiniteBox(box: DOMRect): boolean {
  return (
    Number.isFinite(box.x) &&
    Number.isFinite(box.y) &&
    Number.isFinite(box.width) &&
    Number.isFinite(box.height)
  );
}

function getShapeRuntimeId(shape: SVGElement): string {
  const existingId = shape.dataset.barSweepId;
  if (existingId) return existingId;

  barShapeIdCounter += 1;
  const runtimeId = `recharts-bar-sweep-shape-${barShapeIdCounter}`;
  shape.dataset.barSweepId = runtimeId;
  return runtimeId;
}

function getShapeDomId(shape: SVGElement): string {
  if (shape.id) return shape.id;

  barShapeIdCounter += 1;
  const shapeId = `recharts-bar-shape-${barShapeIdCounter}`;
  shape.id = shapeId;
  return shapeId;
}

function ensureSurfaceDefs(svg: SVGSVGElement): SVGDefsElement {
  let defs = svg.querySelector<SVGDefsElement>(
    'defs[data-bar-sweep-defs="true"]',
  );
  if (!defs) {
    defs = document.createElementNS(SVG_NAMESPACE, "defs");
    defs.setAttribute("data-bar-sweep-defs", "true");
    svg.insertBefore(defs, svg.firstChild);
  }
  return defs;
}

function ensureClipPath(
  defs: SVGDefsElement,
  clipId: string,
  shapeDomId: string,
): SVGClipPathElement {
  let clipPath = defs.querySelector<SVGClipPathElement>(`#${clipId}`);
  if (!clipPath) {
    clipPath = document.createElementNS(SVG_NAMESPACE, "clipPath");
    clipPath.id = clipId;
    clipPath.setAttribute("data-bar-sweep-clip", "true");
    defs.appendChild(clipPath);
  }

  let useNode = clipPath.querySelector<SVGUseElement>("use");
  if (!useNode) {
    useNode = document.createElementNS(SVG_NAMESPACE, "use");
    clipPath.appendChild(useNode);
  }
  useNode.setAttribute("href", `#${shapeDomId}`);
  return clipPath;
}

function createOverlay(barId: string): {
  overlay: SVGGElement;
  fillRect: SVGRectElement;
  line: SVGLineElement;
} {
  const overlay = document.createElementNS(SVG_NAMESPACE, "g");
  overlay.setAttribute("class", "recharts-bar-sweep-overlay");
  overlay.setAttribute("data-bar-id", barId);
  overlay.setAttribute("pointer-events", "none");

  const fillRect = document.createElementNS(SVG_NAMESPACE, "rect");
  fillRect.setAttribute("class", "recharts-bar-sweep-fill");

  const line = document.createElementNS(SVG_NAMESPACE, "line");
  line.setAttribute("class", "recharts-bar-sweep-line");

  overlay.appendChild(fillRect);
  overlay.appendChild(line);
  return { overlay, fillRect, line };
}

function ensureOverlayForBar(
  svg: SVGSVGElement,
  host: SVGElement,
  barId: string,
): {
  overlay: SVGGElement;
  fillRect: SVGRectElement;
  line: SVGLineElement;
} {
  let overlay = svg.querySelector<SVGGElement>(
    `.recharts-bar-sweep-overlay[data-bar-id="${barId}"]`,
  );
  let fillRect: SVGRectElement | null = null;
  let line: SVGLineElement | null = null;

  if (!overlay) {
    const created = createOverlay(barId);
    overlay = created.overlay;
    fillRect = created.fillRect;
    line = created.line;
    host.appendChild(overlay);
  } else {
    if (overlay.parentNode !== host) host.appendChild(overlay);
    fillRect = overlay.querySelector<SVGRectElement>(
      ".recharts-bar-sweep-fill",
    );
    line = overlay.querySelector<SVGLineElement>(".recharts-bar-sweep-line");

    if (!fillRect || !line) {
      overlay.remove();
      const recreated = createOverlay(barId);
      overlay = recreated.overlay;
      fillRect = recreated.fillRect;
      line = recreated.line;
      host.appendChild(overlay);
    }
  }

  return {
    overlay,
    fillRect,
    line,
  };
}

function collectBarsForSurface(svg: SVGSVGElement): BarSweepRecord[] {
  const records: BarSweepRecord[] = [];
  const defs = ensureSurfaceDefs(svg);
  const activeBarIds = new Set<string>();
  const activeClipIds = new Set<string>();
  const barEntries: Array<{
    shape: SVGGraphicsElement;
    box: DOMRect;
  }> = [];
  const barShapes = Array.from(
    svg.querySelectorAll<SVGGraphicsElement>(
      ".recharts-bar-rectangle path, .recharts-bar-rectangle rect, .recharts-active-bar path, .recharts-active-bar rect",
    ),
  );

  const resolvedBarsByPosition = new Map<
    string,
    { shape: SVGGraphicsElement; box: DOMRect; priority: number }
  >();

  barShapes.forEach((shape) => {
    let box: DOMRect;
    try {
      box = shape.getBBox();
    } catch {
      return;
    }

    if (!isFiniteBox(box) || box.width <= 1.4 || box.height <= 1.8) return;
    // Use center X and bottom Y to uniquely identify a bar's position
    const centerX = box.x + box.width * 0.5;
    const bottomY = box.y + box.height;
    const positionKey = `${centerX.toFixed(2)}|${bottomY.toFixed(2)}`;
    const priority = shape.closest(".recharts-active-bar") ? 2 : 1;
    const existing = resolvedBarsByPosition.get(positionKey);

    if (!existing || priority >= existing.priority) {
      resolvedBarsByPosition.set(positionKey, { shape, box, priority });
    }
  });

  resolvedBarsByPosition.forEach((entry) => {
    barEntries.push({ shape: entry.shape, box: entry.box });
  });

  if (barEntries.length === 0) {
    const existingOverlays = svg.querySelectorAll<SVGGElement>(
      ".recharts-bar-sweep-overlay",
    );
    existingOverlays.forEach((overlay) => overlay.remove());

    const clipPaths = defs.querySelectorAll<SVGClipPathElement>(
      'clipPath[data-bar-sweep-clip="true"]',
    );
    clipPaths.forEach((clipPath) => clipPath.remove());
    return records;
  }

  const initialColor = SWEEP_COLOR;

  barEntries.forEach((entry) => {
    const { shape, box } = entry;

    const shapeElement = shape as SVGElement;
    const barId = getShapeRuntimeId(shapeElement);
    const shapeDomId = getShapeDomId(shapeElement);
    const existingClipId = shapeElement.dataset.barSweepClipId; // Reuse existing clip ID if available to prevent unnecessary DOM updates
    const clipId =
      existingClipId ||
      `recharts-bar-sweep-clip-${++barClipIdCounter}-${barId}`;
    if (!existingClipId) shapeElement.dataset.barSweepClipId = clipId;
    activeBarIds.add(barId);
    activeClipIds.add(clipId);

    ensureClipPath(defs, clipId, shapeDomId);

    const host =
      shape.parentElement instanceof SVGElement ? shape.parentElement : svg;
    const overlayNodes = ensureOverlayForBar(svg, host, barId);
    overlayNodes.overlay.setAttribute("clip-path", `url(#${clipId})`);

    const leftX = box.x;
    const bottomY = box.y + box.height;
    const rightX = box.x + box.width;

    overlayNodes.fillRect.setAttribute("x", leftX.toFixed(2));
    overlayNodes.fillRect.setAttribute("y", bottomY.toFixed(2));
    overlayNodes.fillRect.setAttribute("width", box.width.toFixed(2));
    overlayNodes.fillRect.setAttribute("height", "0");
    overlayNodes.fillRect.setAttribute("fill", initialColor);

    overlayNodes.line.setAttribute("x1", leftX.toFixed(2));
    overlayNodes.line.setAttribute("x2", rightX.toFixed(2));
    overlayNodes.line.setAttribute("y1", bottomY.toFixed(2));
    overlayNodes.line.setAttribute("y2", bottomY.toFixed(2));

    records.push({
      shape,
      overlay: overlayNodes.overlay,
      fillRect: overlayNodes.fillRect,
      line: overlayNodes.line,
      bottomY,
      height: box.height,
      currentY: bottomY,
    });
  });

  const existingOverlays = svg.querySelectorAll<SVGGElement>(
    ".recharts-bar-sweep-overlay",
  );
  existingOverlays.forEach((overlay) => {
    const barId = overlay.dataset.barId;
    if (!barId || !activeBarIds.has(barId)) overlay.remove();
  });

  const clipPaths = defs.querySelectorAll<SVGClipPathElement>(
    'clipPath[data-bar-sweep-clip="true"]',
  );
  clipPaths.forEach((clipPath) => {
    if (!activeClipIds.has(clipPath.id)) clipPath.remove();
  });

  return records;
}

function collectAllBars(): BarSweepRecord[] {
  const chartSurfaces =
    document.querySelectorAll<SVGSVGElement>(".recharts-surface");
  const allRecords: BarSweepRecord[] = [];

  chartSurfaces.forEach((surface) => {
    const records = collectBarsForSurface(surface);
    allRecords.push(...records);
  });

  return allRecords;
}

function hasRelevantRechartsClass(element: Element): boolean {
  const classAttribute = element.getAttribute("class");
  if (!classAttribute) return false;

  return classAttribute.split(/\s+/).some((className) => {
    if (!className.startsWith("recharts")) return false;
    if (OVERLAY_RECHARTS_CLASSES.has(className)) return false;
    return RELEVANT_RECHARTS_CLASSES.has(className);
  });
}

function containsRelevantRechartsNode(node: Node): boolean {
  if (!(node instanceof Element)) return false;

  if (hasRelevantRechartsClass(node)) return true;

  const descendants = node.querySelectorAll<HTMLElement>('[class*="recharts"]');
  for (const descendant of Array.from(descendants)) {
    if (hasRelevantRechartsClass(descendant)) return true;
  }

  return false;
}

function mutationTouchesRecharts(mutations: MutationRecord[]): boolean {
  return mutations.some((mutation) => {
    for (const addedNode of Array.from(mutation.addedNodes)) {
      if (containsRelevantRechartsNode(addedNode)) return true;
    }

    for (const removedNode of Array.from(mutation.removedNodes)) {
      if (containsRelevantRechartsNode(removedNode)) return true;
    }

    return false;
  });
}

export default function BarPollSweep() {
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    let frameId: number | null = null;
    let refreshTimeoutId: number | null = null;
    let animationStartTime: number | null = null;
    let lastAutoRescanTime = 0;
    let sharedCycleDurationMs = BAR_DURATION_MIN_MS;
    let barRecords: BarSweepRecord[] = [];

    const syncBars = () => {
      barRecords = collectAllBars();
      sharedCycleDurationMs =
        barRecords.length > 0
          ? getSharedCycleDurationMs(barRecords)
          : BAR_DURATION_MIN_MS;
    };

    const animate = (time: number) => {
      if (animationStartTime === null) animationStartTime = time;

      if (barRecords.length === 0) {
        if (time - lastAutoRescanTime >= AUTO_RESCAN_INTERVAL_MS) {
          lastAutoRescanTime = time;
          syncBars();
        }

        frameId = window.requestAnimationFrame(animate);
        return;
      }

      const elapsedMs = time - animationStartTime;
      const cycleProgress =
        (elapsedMs % sharedCycleDurationMs) / sharedCycleDurationMs;
      let connectedCount = 0; // Tracks how many bars are still connected to the DOM

      barRecords.forEach((record) => {
        if (!record.shape.isConnected || !record.overlay.isConnected) return;
        connectedCount += 1;

        const y = record.bottomY - record.height * cycleProgress;
        const fillHeight = Math.max(0, record.bottomY - y);
        // Only update DOM if position has changed significantly to avoid unnecessary reflows
        if (Math.abs(y - record.currentY) > POSITION_EPSILON) {
          record.fillRect.setAttribute("y", y.toFixed(2));
          record.fillRect.setAttribute("height", fillHeight.toFixed(2));
          record.line.setAttribute("y1", y.toFixed(2));
          record.line.setAttribute("y2", y.toFixed(2));
          record.currentY = y;
        }
      });

      // If no bars are connected and a certain interval has passed, rescan the DOM for new bars to handle dynamic chart changes
      if (
        connectedCount === 0 &&
        time - lastAutoRescanTime >= AUTO_RESCAN_INTERVAL_MS
      ) {
        lastAutoRescanTime = time;
        syncBars();
      }

      frameId = window.requestAnimationFrame(animate);
    };

    const refreshBars = () => {
      syncBars();
      lastAutoRescanTime = window.performance.now();
    };

    const scheduleRefresh = (immediate = false) => {
      if (refreshTimeoutId !== null) return;
      refreshTimeoutId = window.setTimeout(
        () => {
          refreshTimeoutId = null;
          refreshBars();
        },
        immediate ? 0 : REFRESH_DEBOUNCE_MS,
      );
    };

    const observer = new MutationObserver((mutations) => {
      if (!mutationTouchesRecharts(mutations)) return;
      scheduleRefresh(false);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const handleResize = () => scheduleRefresh(true);
    window.addEventListener("resize", handleResize);

    frameId = window.requestAnimationFrame(animate);
    scheduleRefresh(true);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      if (refreshTimeoutId !== null) window.clearTimeout(refreshTimeoutId);
    };
  }, []);

  return null;
}
