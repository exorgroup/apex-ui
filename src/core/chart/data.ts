/**
 * Series normalization, decimation, hit testing and the animation clock.
 *
 * Every series becomes a flat array of points with a stable `key`, which is what
 * makes interpolation between two datasets possible: a point is matched to its
 * predecessor by key, so a removed point collapses and a new one grows instead
 * of the whole series being replaced.
 */

export type ChartSeriesType = 'line' | 'bar' | 'scatter' | 'bubble'
  | 'pie' | 'gauge' | 'radar' | 'polar'
  | 'heatmap' | 'candlestick' | 'treemap';

export interface ChartSeries {
  /** Stable identity. Required for interpolation to match across updates. */
  id?: string;
  name?: string;
  type?: ChartSeriesType;
  data?: unknown[];
  /** Property name or accessor for the category / x value. */
  xKey?: string | ((row: unknown, i: number) => unknown);
  yKey?: string | ((row: unknown, i: number) => unknown);
  /**
   * A CSS colour, a gradient spec in normalized plot coordinates, an array cycled
   * by index, or a callback per item. The callback returning undefined falls back
   * to the series colour — the same contract as segmentColor, so conditional paint
   * has one rule across the library.
   */
  color?: string | ChartGradient | string[] | ((ctx: BarColorContext) => string | undefined);
  /** 0 draws only the line; anything above it fills to the baseline. */
  fillOpacity?: number;
  /** Lower edge accessor — turns the fill into a band rather than a fill to zero. */
  y0Key?: string | ((row: unknown, i: number) => unknown);
  /** Stack group. Series sharing an id stack together when stackMode is set. */
  stack?: string;
  /* ── bar ── */
  /** Number rounds the value end only; an object addresses visual corners. */
  barRadius?: number | { tl?: number; tr?: number; br?: number; bl?: number };
  barBorderColor?: string;
  barBorderWidth?: number;
  barBorderDash?: number[] | string;
  /** Which edge omits the stroke. 'start' (the baseline) by default. */
  borderSkipped?: 'start' | 'end' | 'middle' | false;
  /** Floor in pixels, so a tiny value stays visible. Off unless set. */
  minBarLength?: number;
  /**
   * Each bar starts where the previous one ended. A row marked with totalKey
   * resets to the baseline, which is how a waterfall shows a subtotal.
   */
  waterfall?: boolean;
  totalKey?: string;
  /** Replaces the bar's shape; receives the rect it would have filled. */
  renderBar?: (ctx: BarContext) => string;
  /* ── heatmap ── */
  /** Row accessor; xKey supplies the columns. */
  groupKey?: string | ((row: unknown, i: number) => unknown);
  /** Discrete colour bands. Without them, intensity is opacity on the series colour. */
  colorStops?: string[];
  cellRadius?: number;
  /* The candle's own width knob, as a fraction of the band. ApexChart reads
     `s.spec.barWidthRatio` and falls back to the prop; without it here the
     per-series override was untyped and undiscoverable. */
  barWidthRatio?: number;
  /* Read as per-series overrides beside barWidthRatio, and undeclared for the
     same reason: the component prop existed, the series-level one did not. */
  neutralColor?: string;
  wickStrokeWidth?: number;
  cellGap?: number;
  showCellLabels?: boolean;
  /* ── candlestick ── */
  openKey?: string | ((row: unknown, i: number) => unknown);
  highKey?: string | ((row: unknown, i: number) => unknown);
  lowKey?: string | ((row: unknown, i: number) => unknown);
  closeKey?: string | ((row: unknown, i: number) => unknown);
  candleVariant?: 'candle' | 'hollow' | 'ohlc';
  upColor?: string;
  downColor?: string;
  /* ── treemap ── */
  /** Hierarchical rows; each may carry children. */
  nodes?: unknown[];
  /** How many levels to lay out at once; deeper levels are reached by drilling. */
  depth?: number;
  tilePadding?: number;
  /* ── radial ── */
  /**
   * Fraction of the outer radius left hollow: 0 is a pie, 0.6 a donut. A
   * fraction rather than pixels, so a chart stays a donut at any size.
   */
  innerRadius?: number;
  /** Gap between slices, in radians. */
  padAngle?: number;
  /** Where the ring starts and ends, from twelve o'clock, clockwise. */
  startAngle?: number;
  endAngle?: number;
  /** Gauge bounds. */
  min?: number;
  max?: number;
  /** Radar and polar: fill strength of the polygon or sector. */
  radiusKey?: string | ((row: unknown, i: number) => unknown);
  /* ── points ── */
  /** Radius accessor. Area is scaled, not radius, so the eye reads it honestly. */
  rKey?: string | ((row: unknown, i: number) => unknown);
  minSize?: number;
  maxSize?: number;
  /** A white border is what separates overlapping points. */
  pointBorderColor?: string;
  pointBorderStrokeWidth?: number;
  /** Replaces the marker's shape; the chart keeps the translation. */
  renderMarker?: (ctx: MarkerContext) => string;
  /** Per-series override of the chart's curve. */
  curve?: string;
  tension?: number;
  lineStrokeWidth?: number;
  lineDash?: number[] | string;
  lineDashOffset?: number;
  lineCap?: 'butt' | 'round' | 'square';
  lineJoin?: 'miter' | 'round' | 'bevel';
  /**
   * A halo painted behind the line, wider than the line itself, which keeps a
   * series readable where it crosses area fills or other series.
   */
  borderColor?: string;
  borderStrokeWidth?: number;
  borderDash?: number[] | string;
  borderCap?: 'butt' | 'round' | 'square';
  /* Segment styling. Each takes a static value or a callback on the two
     endpoints; returning undefined falls back to the series default, so only
     what you mean to override is overridden. */
  segmentColor?: string | ((ctx: SegmentContext) => string | undefined);
  segmentStrokeWidth?: number | ((ctx: SegmentContext) => number | undefined);
  segmentDash?: string | ((ctx: SegmentContext) => string | undefined);
  segmentFillColor?: string | ((ctx: SegmentContext) => string | undefined);
  showMarkers?: boolean;
  markerSize?: number;
  markerShape?: MarkerShape;
  pointRotation?: number;
  /** Which y axis this series reads — 'left' or 'right'. */
  axis?: 'left' | 'right';
  hidden?: boolean;
}

export type MarkerShape = 'circle' | 'square' | 'triangle' | 'cross' | 'star' | 'diamond';

export interface ChartGradient {
  /**
   * 'linear' spans the plot; 'radial' is centred on each point and sized to it.
   *
   * A plot-wide linear gradient gives thirty bubbles a flat slice of the ramp
   * each, which reads as noise rather than as depth. A radial one sized to the
   * point is what makes a bubble look round.
   */
  type?: 'linear' | 'radial';
  /** Normalized plot coordinates. Strokes default horizontal, fills vertical. */
  x1?: number; y1?: number; x2?: number; y2?: number;
  stops: { offset: number; color: string; opacity?: number }[];
}

export interface MarkerContext {
  /** Origin-relative: the chart has already translated to the point. */
  r: number;
  point: ChartPoint;
  index: number;
  series: string;
  color: string;
}

export interface PointColorContext {
  point: ChartPoint;
  index: number;
  value: number;
  category: string | number;
  series: string;
}

export interface BarColorContext {
  point: ChartPoint;
  index: number;
  value: number;
  category: string | number;
  negative: boolean;
  series: string;
}

export interface BarContext {
  x: number;
  y: number;
  width: number;
  height: number;
  point: ChartPoint;
  series: string;
  index: number;
}

export interface SegmentContext {
  p0: ChartPoint;
  p1: ChartPoint;
  index: number;
  series: string;
}

export interface ChartPoint {
  /** Bubble radius in data units, before scaling. */
  r?: number | null;
  /** Candlestick values, when the series carries them. */
  ohlc?: { open: number; high: number; low: number; close: number };
  /** Matching key across datasets: the raw x value. */
  key: string | number;
  /** x in scale space — the category index, or the numeric/time value. */
  x: number;
  y: number | null;
  /**
   * Lower edge of this point's band. Stacking and range areas are the same
   * primitive — a fill between two values — so one field serves both, and a
   * confidence interval needs no third code path.
   */
  y0?: number | null;
  raw: unknown;
  index: number;
}

export interface ResolvedSeries {
  id: string;
  name: string;
  type: ChartSeriesType;
  color?: string;
  axis: 'left' | 'right';
  hidden: boolean;
  spec: ChartSeries;
  /** Full-resolution points, kept for hit testing even when drawing decimated. */
  points: ChartPoint[];
  /** What actually gets drawn. */
  drawn: ChartPoint[];
}

function accessor(key: ChartSeries['xKey'], fallback: string) {
  if (typeof key === 'function') return key;
  const name = key || fallback;
  return (row: unknown) => (row && typeof row === 'object'
    ? (row as Record<string, unknown>)[name]
    : row);
}

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  if (v instanceof Date) return v.getTime();
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export interface ResolveOptions {
  /** Category order, when the x axis is categorical. */
  categorical: boolean;
  hidden?: Set<string>;
}

/**
 * Resolves series into points and, for a categorical x axis, the union of
 * categories in first-seen order — so a series missing a category leaves a gap
 * rather than shifting every later point.
 */
export function resolveSeries(series: ChartSeries[], options: ResolveOptions) {
  const categories: string[] = [];
  const catIndex = new Map<string, number>();
  if (options.categorical) {
    series.forEach((s) => {
      const getX = accessor(s.xKey, 'x');
      (s.data || []).forEach((row, i) => {
        const raw = getX(row, i);
        const key = String(raw ?? i);
        if (!catIndex.has(key)) { catIndex.set(key, categories.length); categories.push(key); }
      });
    });
  }

  const resolved: ResolvedSeries[] = series.map((s, si) => {
    const getX = accessor(s.xKey, 'x');
    const getY = accessor(s.yKey, 'y');
    const id = s.id || s.name || `series-${si}`;
    const points: ChartPoint[] = (s.data || []).map((row, i) => {
      const rawX = getX(row, i);
      const key = options.categorical ? String(rawX ?? i) : (toNumber(rawX) ?? i);
      const x = options.categorical ? (catIndex.get(String(rawX ?? i)) ?? i) : (toNumber(rawX) ?? i);
      const point: ChartPoint = { key, x, y: toNumber(getY(row, i)), raw: row, index: i };
      if (s.rKey) point.r = toNumber(accessor(s.rKey, 'r')(row, i));
      if (s.openKey || s.closeKey) {
        const o = toNumber(accessor(s.openKey, 'open')(row, i));
        const h = toNumber(accessor(s.highKey, 'high')(row, i));
        const l = toNumber(accessor(s.lowKey, 'low')(row, i));
        const c = toNumber(accessor(s.closeKey, 'close')(row, i));
        if (o !== null && c !== null) {
          point.ohlc = { open: o, high: h ?? Math.max(o, c), low: l ?? Math.min(o, c), close: c };
          /* y is the close, so hit testing, tooltips and the shared crosshair all
             work on a candlestick without knowing it is one. */
          point.y = c;
        }
      }
      return point;
    });
    if (!options.categorical) points.sort((a, b) => a.x - b.x);
    return {
      id,
      name: s.name || id,
      type: s.type || 'line',
      color: s.color,
      axis: s.axis || 'left',
      hidden: !!s.hidden || !!options.hidden?.has(id),
      spec: s,
      points,
      drawn: points,
    };
  });

  return { resolved, categories };
}

export type StackMode = 'none' | 'normal' | 'percent';

/**
 * Resolves each point's lower edge, then stacks.
 *
 * Stacking is computed across the series list rather than per series — it is a
 * relationship between series, not a property of one — which is also why the
 * same function will serve stacked bars without change.
 */
/**
 * Waterfall: each bar spans from where the previous one ended to its own value.
 * Run before stacking, since a waterfall is already a cumulative form and
 * stacking it again would be meaningless.
 */
export function applyWaterfall(series: ResolvedSeries[]) {
  series.forEach((s) => {
    if (!s.spec.waterfall) return;
    let running = 0;
    s.points.forEach((p) => {
      if (p.y === null) return;
      const row = p.raw as Record<string, unknown> | null;
      const isTotal = !!(s.spec.totalKey && row && row[s.spec.totalKey]);
      if (isTotal) {
        /* A subtotal is measured from zero, not from the running balance — that
           is what makes it a subtotal rather than another step. */
        p.y0 = 0;
        running = p.y;
      } else {
        p.y0 = running;
        running += p.y;
        p.y = running;
      }
    });
  });
}

export function applyStacking(series: ResolvedSeries[], mode: StackMode) {
  series.forEach((s) => {
    if (!s.spec.y0Key) return;
    const get = accessor(s.spec.y0Key, 'y0');
    s.points.forEach((p) => { p.y0 = toNumber(get(p.raw, p.index)); });
  });
  if (mode === 'none') return;

  const groups = new Map<string, ResolvedSeries[]>();
  series.forEach((s) => {
    if (s.hidden) return;
    const key = s.spec.stack || '_';
    const list = groups.get(key);
    if (list) list.push(s);
    else groups.set(key, [s]);
  });

  groups.forEach((list) => {
    if (list.some((s) => s.spec.waterfall)) return;
    const grand = new Map<string | number, number>();
    if (mode === 'percent') {
      list.forEach((s) => s.points.forEach((p) => {
        if (p.y === null) return;
        grand.set(p.key, (grand.get(p.key) || 0) + Math.abs(p.y));
      }));
    }
    /* Positives and negatives accumulate separately, so a negative value stacks
       downward from zero instead of eating into the positive stack. */
    const pos = new Map<string | number, number>();
    const neg = new Map<string | number, number>();
    list.forEach((s) => {
      s.points.forEach((p) => {
        if (p.y === null) { p.y0 = null; return; }
        let v = p.y;
        if (mode === 'percent') v = (v / (grand.get(p.key) || 1)) * 100;
        const totals = v >= 0 ? pos : neg;
        const base = totals.get(p.key) || 0;
        p.y0 = base;
        p.y = base + v;
        totals.set(p.key, p.y);
      });
    });
  });
}

export function extentOf(series: ResolvedSeries[], axis?: 'left' | 'right') {
  let lo = Infinity;
  let hi = -Infinity;
  series.forEach((s) => {
    if (s.hidden) return;
    if (axis && s.axis !== axis) return;
    s.points.forEach((p) => {
      if (p.y === null) return;
      if (p.y < lo) lo = p.y;
      if (p.y > hi) hi = p.y;
      /* The wick is part of the data: a domain sized to the close alone would
         clip every high and low. */
      if (p.ohlc) {
        if (p.ohlc.low < lo) lo = p.ohlc.low;
        if (p.ohlc.high > hi) hi = p.ohlc.high;
      }
      /* the band's lower edge is part of the data, or a range area clips */
      if (p.y0 !== null && p.y0 !== undefined) {
        if (p.y0 < lo) lo = p.y0;
        if (p.y0 > hi) hi = p.y0;
      }
    });
  });
  return [lo, hi] as [number, number];
}

export function xExtentOf(series: ResolvedSeries[]) {
  let lo = Infinity;
  let hi = -Infinity;
  series.forEach((s) => {
    if (s.hidden) return;
    s.points.forEach((p) => {
      if (p.x < lo) lo = p.x;
      if (p.x > hi) hi = p.x;
    });
  });
  return [lo, hi] as [number, number];
}

/* ─── decimation ─────────────────────────────────────────── */
/**
 * Largest-triangle-three-buckets. Preserves visual shape including spikes,
 * which plain stride sampling and averaging both destroy — and shape is the
 * only reason to draw a line chart.
 *
 * Nulls end a run: a bucket spanning a gap would invent a segment across it.
 */
export function lttb(points: ChartPoint[], threshold: number): ChartPoint[] {
  if (threshold >= points.length || threshold < 3) return points;

  const out: ChartPoint[] = [points[0]];
  const every = (points.length - 2) / (threshold - 2);
  let a = 0;

  for (let i = 0; i < threshold - 2; i += 1) {
    const rangeStart = Math.floor((i + 1) * every) + 1;
    const rangeEnd = Math.min(Math.floor((i + 2) * every) + 1, points.length);
    let avgX = 0;
    let avgY = 0;
    let count = 0;
    for (let j = rangeStart; j < rangeEnd; j += 1) {
      if (points[j].y === null) continue;
      avgX += points[j].x;
      avgY += points[j].y as number;
      count += 1;
    }
    if (count) { avgX /= count; avgY /= count; }

    const bucketStart = Math.floor(i * every) + 1;
    const bucketEnd = Math.min(Math.floor((i + 1) * every) + 1, points.length);
    const pa = points[a];
    let best = points[bucketStart] || points[a];
    let bestArea = -1;
    for (let j = bucketStart; j < bucketEnd; j += 1) {
      const p = points[j];
      if (p.y === null) { best = p; bestArea = Infinity; break; }
      if (pa.y === null) { best = p; break; }
      const area = Math.abs((pa.x - avgX) * (p.y - pa.y) - (pa.x - p.x) * (avgY - pa.y)) / 2;
      if (area > bestArea) { bestArea = area; best = p; }
    }
    out.push(best);
    a = points.indexOf(best);
  }
  out.push(points[points.length - 1]);
  return out;
}

/* ─── hit testing ────────────────────────────────────────── */
export type HitMode = 'nearest' | 'shared-x' | 'series';
/** 'y' is the horizontal chart's equivalent of 'x': snap along the category axis. */
/** 'band' resolves the category the pointer is inside — the only right answer for bars. */
export type HitSnap = 'x' | 'y' | 'xy' | 'none' | 'band';

export interface HitEntry {
  series: ResolvedSeries;
  point: ChartPoint;
  px: number;
  py: number;
}

export interface HitResult {
  /** Plot-space x the crosshair should sit on. */
  x: number;
  entries: HitEntry[];
}

export interface HitInput {
  pointer: { x: number; y: number };
  series: ResolvedSeries[];
  project: (s: ResolvedSeries, p: ChartPoint) => { px: number; py: number };
  mode: HitMode;
  snap: HitSnap;
  radius: number;
  /** Required by snap 'band': the category index under the pointer. */
  bandIndex?: number | null;
}

/**
 * One service for tooltip, crosshair and hover. Per-series hit logic is the
 * reliable way to get a combo chart that snaps inconsistently between its
 * layers, which is the single most common charting bug.
 *
 * Hit testing always runs against full-resolution points, never the decimated
 * set, or the tooltip reports a neighbour of the point under the cursor.
 */
export function findHit(input: HitInput): HitResult | null {
  const { pointer, mode, snap, radius } = input;
  const visible = input.series.filter((s) => !s.hidden);
  if (!visible.length) return null;

  /* Band mode asks the scale which category the pointer is INSIDE, rather than
     which point is nearest. For bars that is the only correct answer: at a band
     edge the nearest centre belongs to the neighbour. */
  if (snap === 'band' && input.bandIndex !== undefined) {
    const index = input.bandIndex;
    if (index === null || index < 0) return null;
    const entries: HitEntry[] = [];
    let anchorX = 0;
    visible.forEach((s) => {
      const p = s.points.find((q) => q.x === index);
      if (!p || p.y === null) return;
      const pos = input.project(s, p);
      anchorX = pos.px;
      entries.push({ series: s, point: p, px: pos.px, py: pos.py });
    });
    return entries.length ? { x: anchorX, entries } : null;
  }

  let best: HitEntry | null = null;
  let bestDist = Infinity;

  visible.forEach((s) => {
    s.points.forEach((p) => {
      if (p.y === null) return;
      const { px, py } = input.project(s, p);
      const dx = px - pointer.x;
      const dy = py - pointer.y;
      const dist = snap === 'x' ? Math.abs(dx) : snap === 'y' ? Math.abs(dy) : Math.hypot(dx, dy);
      if (dist < bestDist) { bestDist = dist; best = { series: s, point: p, px, py }; }
    });
  });

  if (!best) return null;
  if ((snap === 'none' || snap === 'xy') && bestDist > radius) return null;

  const anchor = best as HitEntry;
  if (mode === 'series' || mode === 'nearest') {
    return { x: anchor.px, entries: [anchor] };
  }

  /* Shared-x gathers every series at the anchor's key, so a multi-series
     tooltip reads as one row per series at one moment. */
  const entries: HitEntry[] = [];
  visible.forEach((s) => {
    const p = s.points.find((q) => q.key === anchor.point.key);
    if (!p || p.y === null) return;
    const { px, py } = input.project(s, p);
    entries.push({ series: s, point: p, px, py });
  });
  return { x: anchor.px, entries: entries.length ? entries : [anchor] };
}

/* ─── animation ──────────────────────────────────────────── */
export type EaseFn = (t: number) => number;
export const easeOutCubic: EaseFn = (t) => 1 - (1 - t) ** 3;

export interface TweenPair { y: number | null; y0: number | null | undefined }

export interface TweenFrame {
  /** seriesId → key → both edges, so a stacked or banded series tweens whole. */
  values: Map<string, Map<string | number, TweenPair>>;
}

/**
 * Interpolates between two datasets rather than playing an entrance effect.
 * Entrance is then the same code with a synthetic previous frame at the
 * baseline — and a data change becomes a movement rather than a flicker.
 */
export function snapshot(series: ResolvedSeries[]): TweenFrame {
  const values = new Map<string, Map<string | number, TweenPair>>();
  series.forEach((s) => {
    const m = new Map<string | number, TweenPair>();
    s.points.forEach((p) => m.set(p.key, { y: p.y, y0: p.y0 }));
    values.set(s.id, m);
  });
  return { values };
}

export function baselineFrom(frame: TweenFrame, baseline: number): TweenFrame {
  const values = new Map<string, Map<string | number, TweenPair>>();
  frame.values.forEach((m, id) => {
    const out = new Map<string | number, TweenPair>();
    m.forEach((pair, key) => out.set(key, {
      y: pair.y === null ? null : baseline,
      y0: pair.y0 === null || pair.y0 === undefined ? pair.y0 : baseline,
    }));
    values.set(id, out);
  });
  return { values };
}

/** Applies an interpolated frame onto resolved series, in place. */
export function applyFrame(
  series: ResolvedSeries[],
  from: TweenFrame,
  to: TweenFrame,
  t: number,
  baseline: number,
) {
  const lerp = (
    start: number | null | undefined,
    target: number | null | undefined,
    fallback: number,
  ) => {
    if (target === null || target === undefined) return target;
    /* A key with no predecessor grows from the baseline: it is new, so it has
       nowhere else to come from. */
    const s0 = start === null || start === undefined ? fallback : start;
    return s0 + (target - s0) * t;
  };
  series.forEach((s) => {
    const a = from.values.get(s.id);
    const b = to.values.get(s.id);
    s.points.forEach((p) => {
      const target = b?.get(p.key);
      if (!target) return;
      const start = a?.get(p.key);
      p.y = lerp(start?.y, target.y, baseline) ?? null;
      p.y0 = lerp(start?.y0, target.y0, baseline);
    });
  });
}
