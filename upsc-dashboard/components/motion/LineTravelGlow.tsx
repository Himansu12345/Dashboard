"use client";

import { useEffect } from "react";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

let linePathIdCounter = 0;
const REFRESH_DEBOUNCE_MS = 90; // Debounce time for refreshing travelers after DOM mutations or resize
const POSITION_EPSILON = 0.08; // Threshold for updating Y position to avoid unnecessary DOM writes
const LOOKUP_MIN_SAMPLES = 72; // Minimum samples to take when building path progress lookup
const LOOKUP_MAX_SAMPLES = 220; // Maximum samples to take when building path progress lookup

const OVERLAY_RECHARTS_CLASSES = new Set([
  "recharts-line-travel-glow",
  "recharts-line-travel-glow-halo",
  "recharts-line-travel-glow-dot",
  "recharts-line-grid-dot",
  "recharts-line-grid-dot-halo",
  "recharts-line-grid-dot-core",
]);

const RELEVANT_RECHARTS_CLASSES = new Set([
  "recharts-surface",
  "recharts-line-curve",
  "recharts-dot",
  "recharts-active-dot",
  "recharts-cartesian-grid",
  "recharts-cartesian-axis",
  "recharts-xAxis",
  "recharts-wrapper",
  "recharts-responsive-container",
]);

interface VerticalMarker {
  element: SVGGElement;
  x: number;
  targetY: number;
  currentY: number;
  bottomY: number;
  arrivalNorm: number;
  arrivalFromStartNorm: number;
  touchWindowNorm: number;
  riseExponent: number;
}

interface TravelerRecord {
  pathId: string;
  path: SVGPathElement;
  traveler: SVGGElement;
  length: number;
  durationMs: number;
  phase: number;
  startNorm: number;
  markers: VerticalMarker[];
  activeMarkerIndex: number;
}

interface PathProgressLookup {
  signature: string;
  samples: Array<{ x: number; progress: number }>;
}

const pathProgressLookupCache = new WeakMap<
  SVGPathElement,
  PathProgressLookup
>();

function getPathId(path: SVGPathElement): string {
  if (path.id) return path.id;

  linePathIdCounter += 1;
  const generatedPathId = `recharts-line-path-${linePathIdCounter}`;
  path.id = generatedPathId;
  return generatedPathId;
}

function getPathLength(path: SVGPathElement): number {
  try {
    const length = path.getTotalLength();
    return Number.isFinite(length) ? length : 0;
  } catch {
    return 0;
  }
}

function createTraveler(pathId: string): SVGGElement {
  const traveler = document.createElementNS(SVG_NAMESPACE, "g");
  traveler.setAttribute("class", "recharts-line-travel-glow");
  traveler.setAttribute("data-path-id", pathId);
  traveler.setAttribute("pointer-events", "none");

  const halo = document.createElementNS(SVG_NAMESPACE, "circle");
  halo.setAttribute("class", "recharts-line-travel-glow-halo");
  halo.setAttribute("r", "10");

  const core = document.createElementNS(SVG_NAMESPACE, "circle");
  core.setAttribute("class", "recharts-line-travel-glow-dot");
  core.setAttribute("r", "4.4");

  traveler.appendChild(halo);
  traveler.appendChild(core);
  return traveler;
}

function createVerticalGridDot(
  pathId: string,
  markerIndex: number,
): SVGGElement {
  const marker = document.createElementNS(SVG_NAMESPACE, "g");
  marker.setAttribute("class", "recharts-line-grid-dot");
  marker.setAttribute("data-path-id", pathId);
  marker.setAttribute("data-marker-index", String(markerIndex));
  marker.setAttribute("pointer-events", "none");

  const halo = document.createElementNS(SVG_NAMESPACE, "circle");
  halo.setAttribute("class", "recharts-line-grid-dot-halo");
  halo.setAttribute("r", "5.8");

  const core = document.createElementNS(SVG_NAMESPACE, "circle");
  core.setAttribute("class", "recharts-line-grid-dot-core");
  core.setAttribute("r", "2.35");

  marker.appendChild(halo);
  marker.appendChild(core);
  return marker;
}

function mod1(value: number): number {
  const normalized = value % 1;
  return normalized < 0 ? normalized + 1 : normalized;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function parseNumericAttribute(
  element: Element,
  attribute: string,
): number | null {
  const parsed = Number.parseFloat(element.getAttribute(attribute) ?? "");
  return Number.isFinite(parsed) ? parsed : null;
}

function resolveChartBottomY(svg: SVGSVGElement, fallback: number): number {
  const xAxisLine = svg.querySelector<SVGLineElement>(
    ".recharts-cartesian-axis.recharts-xAxis .recharts-cartesian-axis-line",
  );
  if (xAxisLine) {
    const y1 = parseNumericAttribute(xAxisLine, "y1");
    const y2 = parseNumericAttribute(xAxisLine, "y2");
    if (y1 !== null && y2 !== null) return Math.max(y1, y2);
    if (y1 !== null) return y1;
    if (y2 !== null) return y2;
  }

  const verticalGridLines = Array.from(
    svg.querySelectorAll<SVGLineElement>(
      ".recharts-cartesian-grid-vertical line",
    ),
  );
  let detectedBottom = fallback;
  verticalGridLines.forEach((line) => {
    const y1 = parseNumericAttribute(line, "y1");
    const y2 = parseNumericAttribute(line, "y2");
    if (y1 !== null) detectedBottom = Math.max(detectedBottom, y1);
    if (y2 !== null) detectedBottom = Math.max(detectedBottom, y2);
  });

  return detectedBottom;
}

function getProgressLookup(
  path: SVGPathElement,
  length: number,
): PathProgressLookup {
  const pathD = path.getAttribute("d") ?? "";
  const signature = `${length.toFixed(2)}|${pathD}`;
  const cachedLookup = pathProgressLookupCache.get(path);
  if (cachedLookup && cachedLookup.signature === signature) return cachedLookup;

  const sampleCount = Math.max(
    LOOKUP_MIN_SAMPLES,
    Math.min(LOOKUP_MAX_SAMPLES, Math.round(length * 0.46)),
  );
  const samples: Array<{ x: number; progress: number }> = [];

  for (let sampleIndex = 0; sampleIndex <= sampleCount; sampleIndex += 1) {
    const progress = sampleIndex / sampleCount;
    const point = path.getPointAtLength(length * progress);
    samples.push({ x: point.x, progress });
  }

  const nextLookup: PathProgressLookup = {
    signature,
    samples,
  };
  pathProgressLookupCache.set(path, nextLookup);
  return nextLookup;
}

function findClosestProgressForX(
  path: SVGPathElement,
  length: number,
  targetX: number,
): number {
  const lookup = getProgressLookup(path, length);
  let bestProgress = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < lookup.samples.length; index += 1) {
    const sample = lookup.samples[index];
    const distance = Math.abs(sample.x - targetX);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestProgress = sample.progress;
    }
  }

  return bestProgress;
}

function collectLineDotAnchors(
  host: SVGElement,
  svg: SVGSVGElement,
): Array<{ x: number; y: number }> {
  const hostDotNodes = Array.from(
    host.querySelectorAll<SVGCircleElement>(
      "circle.recharts-dot, circle.recharts-active-dot",
    ),
  );
  const dotNodes =
    hostDotNodes.length > 0
      ? hostDotNodes
      : Array.from(
          svg.querySelectorAll<SVGCircleElement>(
            "circle.recharts-dot, circle.recharts-active-dot",
          ),
        );
  const seen = new Set<string>();
  const anchors: Array<{ x: number; y: number }> = [];

  dotNodes.forEach((dotNode) => {
    const x = Number.parseFloat(dotNode.getAttribute("cx") ?? "");
    const y = Number.parseFloat(dotNode.getAttribute("cy") ?? "");
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;

    const key = `${x.toFixed(2)}|${y.toFixed(2)}`;
    if (seen.has(key)) return;
    seen.add(key);
    anchors.push({ x, y });
  });

  anchors.sort((left, right) => left.x - right.x);
  return anchors;
}

function buildVerticalMarkersForPath(
  svg: SVGSVGElement,
  host: SVGElement,
  pathId: string,
  path: SVGPathElement,
  pathLength: number,
  cycleDurationMs: number,
  pathPhase: number,
): VerticalMarker[] {
  const anchors = collectLineDotAnchors(host, svg);
  if (anchors.length === 0) return [];

  const fallbackBottomY = Math.max(...anchors.map((anchor) => anchor.y));
  const chartBottomY = resolveChartBottomY(svg, fallbackBottomY);
  const topMostAnchorY = Math.min(...anchors.map((anchor) => anchor.y)); // Y-coordinate of the highest data point
  const maxTravelDistance = Math.max(24, chartBottomY - topMostAnchorY); // Max vertical distance a marker can travel
  const frameNorm = 20 / cycleDurationMs; // Normalized frame duration (20ms assumed frame time)
  const startNorm = mod1(-pathPhase); // Normalized start phase for the animation cycle
  const existingMarkers = new Map<number, SVGGElement>();
  const markerNodes = svg.querySelectorAll<SVGGElement>(
    `.recharts-line-grid-dot[data-path-id="${pathId}"]`,
  );
  markerNodes.forEach((markerNode) => {
    const markerIndex = Number.parseInt(
      markerNode.dataset.markerIndex ?? "",
      10,
    ); // Parse marker index from data attribute
    if (!Number.isFinite(markerIndex)) return;
    if (!existingMarkers.has(markerIndex))
      existingMarkers.set(markerIndex, markerNode);
    if (markerNode.parentNode !== host) host.appendChild(markerNode);
  });
  const usedMarkerIndexes = new Set<number>();

  const markers: VerticalMarker[] = [];
  anchors.forEach((anchor, markerIndex) => {
    const markerBottomY = Math.max(anchor.y + 4, chartBottomY);
    const pathProgress = findClosestProgressForX(path, pathLength, anchor.x);
    // Keep the final anchor near cycle end instead of wrapping to 0,
    // otherwise the last vertical dot looks "stuck" as an immediate-touch marker.
    const isLastAnchor = markerIndex === anchors.length - 1; // Check if this is the last data point
    const normalizedPathProgress =
      isLastAnchor && pathProgress >= 0.995 ? 0.9992 : pathProgress; // Adjust progress for the last anchor to prevent visual glitches
    const arrivalNorm = mod1(normalizedPathProgress - pathPhase); // Normalized arrival time within the animation cycle
    const arrivalFromStartNorm = mod1(arrivalNorm - startNorm); // Normalized arrival time relative to the animation start
    const travelDistance = Math.max(1, markerBottomY - anchor.y); // Vertical distance the marker travels
    const distanceRatio = clamp(travelDistance / maxTravelDistance, 0, 1); // Ratio of travel distance to max possible travel
    const riseExponent = clamp(0.76 + distanceRatio * 1.34, 0.76, 2.1); // Exponent for easing function, adjusted by travel distance
    const touchWindowNorm = clamp(
      Math.max(frameNorm * 1.6, 7 / Math.max(pathLength, 100)),
      0.007,
      0.026,
    );

    const marker =
      existingMarkers.get(markerIndex) ??
      createVerticalGridDot(pathId, markerIndex);
    marker.dataset.pathId = pathId;
    marker.dataset.markerIndex = String(markerIndex);
    if (!existingMarkers.has(markerIndex)) host.appendChild(marker);
    marker.setAttribute(
      "transform",
      `translate(${anchor.x.toFixed(2)} ${markerBottomY.toFixed(2)})`,
    );
    usedMarkerIndexes.add(markerIndex);

    markers.push({
      element: marker,
      x: anchor.x,
      targetY: anchor.y,
      currentY: markerBottomY,
      bottomY: markerBottomY,
      arrivalNorm,
      arrivalFromStartNorm,
      touchWindowNorm,
      riseExponent,
    });
  });

  existingMarkers.forEach((markerNode, markerIndex) => {
    if (!usedMarkerIndexes.has(markerIndex)) markerNode.remove();
  });

  return markers;
}

function positionTravelerAtStart(
  traveler: SVGGElement,
  path: SVGPathElement,
  length: number,
  phase: number,
) {
  if (length <= 0) return;
  const point = path.getPointAtLength(length * phase);
  traveler.setAttribute(
    "transform",
    `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`,
  );
}

function collectTravelersForSurface(svg: SVGSVGElement): TravelerRecord[] {
  const records: TravelerRecord[] = [];
  const linePaths = Array.from(
    svg.querySelectorAll<SVGPathElement>(".recharts-line-curve"),
  );
  const activePathIds = new Set<string>();

  linePaths.forEach((path, index) => {
    const length = getPathLength(path);
    if (length <= 60) return;

    const pathId = getPathId(path);
    activePathIds.add(pathId);
    const durationMs = Math.round(
      Math.min(7200, Math.max(3200, (length / 82) * 1000)), // Animation duration based on path length and a speed of 82px/s, clamped between 3.2s and 7.2s
    ); // Animation duration based on path length and speed (82px/s)
    const phase = ((index + 1) * 0.18) % 1;
    const startNorm = mod1(-phase);
    const host =
      path.parentElement instanceof SVGElement ? path.parentElement : svg;

    let traveler = svg.querySelector<SVGGElement>(
      `.recharts-line-travel-glow[data-path-id="${pathId}"]`,
    );
    if (!traveler) {
      traveler = createTraveler(pathId);
      host.appendChild(traveler);
    } else if (traveler.parentNode !== host) {
      host.appendChild(traveler);
    }

    positionTravelerAtStart(traveler, path, length, phase);
    const markers = buildVerticalMarkersForPath(
      svg,
      host,
      pathId,
      path,
      length,
      durationMs,
      phase,
    );

    records.push({
      pathId,
      path,
      traveler,
      length,
      durationMs,
      phase,
      startNorm,
      markers,
      activeMarkerIndex: -1,
    });
  });

  const travelers = svg.querySelectorAll<SVGGElement>(
    ".recharts-line-travel-glow",
  );
  travelers.forEach((traveler) => {
    const pathId = traveler.dataset.pathId;
    if (!pathId || !activePathIds.has(pathId)) traveler.remove();
  });

  const markers = svg.querySelectorAll<SVGGElement>(".recharts-line-grid-dot");
  markers.forEach((marker) => {
    const pathId = marker.dataset.pathId;
    if (!pathId || !activePathIds.has(pathId)) marker.remove();
  });

  return records;
}

function collectAllTravelers(): TravelerRecord[] {
  const chartSurfaces =
    document.querySelectorAll<SVGSVGElement>(".recharts-surface");
  const allRecords: TravelerRecord[] = [];

  chartSurfaces.forEach((surface) => {
    const records = collectTravelersForSurface(surface);
    allRecords.push(...records);
  });

  return allRecords;
}

function hasNonOverlayRechartsClass(element: Element): boolean {
  const classAttribute = element.getAttribute("class");
  if (!classAttribute) return false;

  return classAttribute.split(/\s+/).some((className) => {
    if (!className.startsWith("recharts")) return false;
    if (OVERLAY_RECHARTS_CLASSES.has(className)) return false;
    return RELEVANT_RECHARTS_CLASSES.has(className);
  });
}

function containsRechartsNode(node: Node): boolean {
  if (!(node instanceof Element)) return false;

  if (hasNonOverlayRechartsClass(node)) return true;

  const descendants = node.querySelectorAll<HTMLElement>('[class*="recharts"]');
  for (const descendant of Array.from(descendants)) {
    if (hasNonOverlayRechartsClass(descendant)) return true;
  }

  return false;
}

function mutationTouchesRecharts(mutations: MutationRecord[]): boolean {
  return mutations.some((mutation) => {
    for (const addedNode of Array.from(mutation.addedNodes)) {
      if (containsRechartsNode(addedNode)) return true;
    }

    for (const removedNode of Array.from(mutation.removedNodes)) {
      if (containsRechartsNode(removedNode)) return true;
    }

    return false;
  });
}

export default function LineTravelGlow() {
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    let frameId: number | null = null;
    let refreshTimeoutId: number | null = null;
    let travelerRecords: TravelerRecord[] = [];

    const animate = (time: number) => {
      travelerRecords.forEach((record) => {
        if (!record.path.isConnected || !record.traveler.isConnected) return;

        const cycleNorm = (time % record.durationMs) / record.durationMs;
        const progress = mod1(cycleNorm - record.startNorm);
        const point = record.path.getPointAtLength(record.length * progress);
        record.traveler.setAttribute(
          "transform",
          `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`,
        );

        let nextActiveMarkerIndex = -1;
        for (
          let markerIndex = 0;
          markerIndex < record.markers.length;
          markerIndex += 1
        ) {
          const marker = record.markers[markerIndex];
          const arrivalFromStartNorm = marker.arrivalFromStartNorm;
          const hasImmediateTouch = arrivalFromStartNorm <= 0.0001;
          let loopProgress = 1;

          if (!hasImmediateTouch) {
            if (progress >= arrivalFromStartNorm) {
              loopProgress = 1;
            } else {
              const riseProgress = progress / arrivalFromStartNorm;
              loopProgress = clamp(riseProgress, 0, 1);
            }
          }

          let markerY =
            marker.bottomY + (marker.targetY - marker.bottomY) * loopProgress;

          const dx = Math.abs(marker.x - point.x);
          const isTouchMoment =
            Math.abs(progress - arrivalFromStartNorm) <=
              marker.touchWindowNorm && dx <= 2.8; // Check if the traveler is very close to the marker horizontally
          if (isTouchMoment) markerY = point.y; // Snap marker to traveler's Y position during touch moment

          if (
            Math.abs(markerY - marker.currentY) > POSITION_EPSILON ||
            isTouchMoment
          ) {
            marker.currentY = markerY;
            marker.element.setAttribute(
              "transform",
              `translate(${marker.x.toFixed(2)} ${markerY.toFixed(2)})`,
            );
          }

          const dy = Math.abs(markerY - point.y); // Vertical distance between marker and traveler
          if (isTouchMoment || (dx <= 2.2 && dy <= 3.2)) {
            nextActiveMarkerIndex = markerIndex;
            break;
          }
        }

        if (record.activeMarkerIndex !== nextActiveMarkerIndex) {
          if (record.activeMarkerIndex >= 0) {
            record.markers[record.activeMarkerIndex]?.element.classList.remove(
              "is-touching-main-dot",
            );
          }
          if (nextActiveMarkerIndex >= 0) {
            record.markers[nextActiveMarkerIndex]?.element.classList.add(
              "is-touching-main-dot",
            );
          }
          record.activeMarkerIndex = nextActiveMarkerIndex;
        }
      });

      frameId = window.requestAnimationFrame(animate);
    };

    const refreshTravelers = () => {
      travelerRecords = collectAllTravelers();

      if (travelerRecords.length === 0) {
        if (frameId !== null) {
          window.cancelAnimationFrame(frameId);
          frameId = null;
        }
        return;
      }

      if (frameId === null) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    const scheduleRefresh = (immediate = false) => {
      if (refreshTimeoutId !== null) return;
      refreshTimeoutId = window.setTimeout(
        () => {
          refreshTimeoutId = null;
          refreshTravelers();
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
