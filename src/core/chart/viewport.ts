/**
 * Viewport, zoom maths, and the shared store a chart group owns.
 *
 * The x domain lives here rather than inside the chart, which is what makes
 * cross-chart sync a matter of sharing one object instead of wiring events
 * between components — and what lets a navigator drive a chart it does not own.
 */
import { reactive } from 'vue';

/** A visible range on one axis: category indices, or numeric/time values. */
export type ZoomRange = [number, number];

/**
 * A visible window. `y` absent means "x only", so every caller written before
 * two-axis zoom keeps working unchanged — which is why this is one object rather
 * than a second zoomRangeY prop that has to be kept consistent with the first.
 */
export interface ZoomWindow {
  x: ZoomRange;
  y?: ZoomRange;
}

/** Accepts either shape on the way in; the emitted payload is always the object. */
export function toWindow(value: ZoomRange | ZoomWindow | null): ZoomWindow | null {
  if (!value) return null;
  return Array.isArray(value) ? { x: value } : value;
}

export interface ChartGroupState {
  /** null means "show everything". */
  zoom: ZoomWindow | null;
  /** The x key under the pointer, so synced charts share one crosshair. */
  hoverKey: string | number | null;
  /** Series hidden by a legend click, shared so one legend drives every chart. */
  hidden: string[];
}

export interface ChartGroup {
  state: ChartGroupState;
  setZoom(range: ZoomWindow | null): void;
  setHover(key: string | number | null): void;
  toggleSeries(id: string): void;
}

export function createChartGroup(): ChartGroup {
  const state = reactive<ChartGroupState>({ zoom: null, hoverKey: null, hidden: [] });
  return {
    state,
    setZoom(range) { state.zoom = range; },
    setHover(key) { state.hoverKey = key; },
    toggleSeries(id) {
      const i = state.hidden.indexOf(id);
      if (i > -1) state.hidden.splice(i, 1);
      else state.hidden.push(id);
    },
  };
}

export const CHART_GROUP_KEY = Symbol('apex-chart-group');

/* ─── zoom maths ─────────────────────────────────────────── */

/**
 * A minimum span, expressed as a fraction of the full extent, so a wheel cannot
 * zoom past the point where the axis has nothing left to label.
 */
const MIN_FRACTION = 0.002;

export function clampRange(range: ZoomRange, bounds: ZoomRange): ZoomRange {
  const full = bounds[1] - bounds[0] || 1;
  const minSpan = full * MIN_FRACTION;
  let [lo, hi] = range;
  if (hi - lo < minSpan) {
    const mid = (lo + hi) / 2;
    lo = mid - minSpan / 2;
    hi = mid + minSpan / 2;
  }
  /* Shifted back inside rather than truncated: clamping each edge on its own
     shrinks the window when you pan against the end, which reads as the chart
     zooming in by itself. */
  const span = Math.min(hi - lo, full);
  if (lo < bounds[0]) { lo = bounds[0]; hi = lo + span; }
  if (hi > bounds[1]) { hi = bounds[1]; lo = hi - span; }
  return [Math.max(bounds[0], lo), Math.min(bounds[1], hi)];
}

/** Zooms about a fixed point, so the value under the cursor stays under it. */
export function zoomAbout(range: ZoomRange, center: number, factor: number, bounds: ZoomRange): ZoomRange {
  const lo = center - (center - range[0]) * factor;
  const hi = center + (range[1] - center) * factor;
  return clampRange([lo, hi], bounds);
}

export function panBy(range: ZoomRange, delta: number, bounds: ZoomRange): ZoomRange {
  return clampRange([range[0] + delta, range[1] + delta], bounds);
}

export function isFullyZoomedOut(range: ZoomRange | null, bounds: ZoomRange) {
  if (!range) return true;
  const full = bounds[1] - bounds[0] || 1;
  return (range[1] - range[0]) >= full - full * 1e-6;
}

/**
 * Whole-window helpers. Each calls the single-axis function twice rather than
 * taking an axis parameter — two axes are independent, and threading a parameter
 * through would only move the branch inside.
 */
export function clampWindow(win: ZoomWindow, xb: ZoomRange, yb: ZoomRange): ZoomWindow {
  const out: ZoomWindow = { x: clampRange(win.x, xb) };
  if (win.y) out.y = clampRange(win.y, yb);
  return out;
}

export function zoomWindowAbout(
  win: ZoomWindow,
  center: { x: number; y: number },
  factor: number,
  xb: ZoomRange,
  yb: ZoomRange,
): ZoomWindow {
  const out: ZoomWindow = { x: zoomAbout(win.x, center.x, factor, xb) };
  if (win.y) out.y = zoomAbout(win.y, center.y, factor, yb);
  return out;
}

export function panWindow(
  win: ZoomWindow,
  delta: { x: number; y: number },
  xb: ZoomRange,
  yb: ZoomRange,
): ZoomWindow {
  const out: ZoomWindow = { x: panBy(win.x, delta.x, xb) };
  if (win.y) out.y = panBy(win.y, delta.y, yb);
  return out;
}

export function isWindowFullyOut(win: ZoomWindow | null, xb: ZoomRange, yb: ZoomRange) {
  if (!win) return true;
  if (!isFullyZoomedOut(win.x, xb)) return false;
  return !win.y || isFullyZoomedOut(win.y, yb);
}
