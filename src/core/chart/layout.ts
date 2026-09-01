/**
 * Plot-rect layout and path building.
 *
 * Label widths decide the plot rect, and the plot rect decides label rotation
 * and culling — a circular dependency resolved by measuring, laying out, and
 * re-measuring only if the result changed. Guessing instead is why charts clip
 * their own axis labels.
 */
import { measureText, type AxisSpec, type Scale, type Tick } from './scale';
import type { ChartGradient, ChartPoint } from './data';

export interface Rect { x: number; y: number; width: number; height: number }

export interface LayoutInput {
  width: number;
  height: number;
  xTicks: Tick[];
  leftTicks: Tick[];
  rightTicks: Tick[];
  xSpec: AxisSpec;
  ySpec: AxisSpec;
  y2Spec?: AxisSpec;
  tickFont: string;
  titleFont: string;
  /**
   * Right-to-left. The value axis moves to the right edge, so the margins swap
   * rather than the whole chart being mirrored with a transform — a transform
   * would reverse the text too.
   */
  rtl?: boolean;
}

export interface LayoutResult {
  plot: Rect;
  /** Degrees; 0 when labels fit. */
  xRotate: number;
  /** Indices of x ticks to draw — collisions are dropped, not overlapped. */
  xVisible: number[];
}

const TICK_LEN = 5;
const LABEL_GAP = 7;
const AXIS_TITLE_GAP = 6;

function widestLabel(ticks: Tick[], font: string) {
  return ticks.reduce((w, t) => Math.max(w, measureText(t.label, font)), 0);
}

export function computeLayout(input: LayoutInput): LayoutResult {
  const { width, height, tickFont, titleFont } = input;
  const lineHeight = 13;

  const leftLabelW = input.ySpec.ticks === false ? 0 : widestLabel(input.leftTicks, tickFont);
  const rightLabelW = input.rightTicks.length && input.y2Spec?.ticks !== false
    ? widestLabel(input.rightTicks, tickFont) : 0;

  let left = (input.ySpec.ticks === false ? 0 : leftLabelW + LABEL_GAP + TICK_LEN);
  if (input.ySpec.label) left += lineHeight + AXIS_TITLE_GAP;
  let right = rightLabelW ? rightLabelW + LABEL_GAP + TICK_LEN : 4;
  if (input.y2Spec?.label && rightLabelW) right += lineHeight + AXIS_TITLE_GAP;

  const top = 8;
  let bottom = input.xSpec.ticks === false ? 4 : lineHeight + LABEL_GAP + TICK_LEN;
  if (input.xSpec.label) bottom += lineHeight + AXIS_TITLE_GAP;

  /* First pass: assume no rotation, then check whether the widest label fits its
     share of the plot. Rotation costs vertical room, so the rect is recomputed
     once rather than iterated to a fixed point. */
  const plotW0 = Math.max(10, width - left - right);
  const xLabelW = widestLabel(input.xTicks, tickFont);
  const perTick = input.xTicks.length > 1 ? plotW0 / input.xTicks.length : plotW0;
  const requested = input.xSpec.rotate;
  let rotate = typeof requested === 'number' ? requested : 0;
  if (requested === 'auto' || requested === undefined) {
    rotate = xLabelW > perTick - 6 ? -35 : 0;
  }
  if (rotate) {
    const rad = Math.abs(rotate) * Math.PI / 180;
    const extra = Math.ceil(xLabelW * Math.sin(rad) + lineHeight * Math.cos(rad)) - lineHeight;
    bottom += Math.max(0, extra);
  }

  if (input.rtl) { const swap = left; left = right; right = swap; }

  const plot: Rect = {
    x: left,
    y: top,
    width: Math.max(10, width - left - right),
    height: Math.max(10, height - top - bottom),
  };

  /* Culling rather than overlapping: an unreadable label is worse than a
     missing one, and the first and last carry the most meaning. */
  const xVisible: number[] = [];
  if (input.xTicks.length) {
    const need = rotate ? lineHeight + 2 : xLabelW + 8;
    const stride = Math.max(1, Math.ceil((need * input.xTicks.length) / plot.width));
    for (let i = 0; i < input.xTicks.length; i += stride) xVisible.push(i);
    const last = input.xTicks.length - 1;
    if (xVisible[xVisible.length - 1] !== last) {
      if (last - (xVisible[xVisible.length - 1] ?? 0) < stride * 0.6) xVisible.pop();
      xVisible.push(last);
    }
  }

  return { plot, xRotate: rotate, xVisible };
}

/* ─── path building ──────────────────────────────────────── */
export type CurveType = 'linear' | 'smooth' | 'spline' | 'step' | 'step-before' | 'step-after';

export interface PlotPoint {
  x: number;
  y: number;
  /** The band's other edge, in screen units along the VALUE axis. */
  base?: number;
  src: ChartPoint;
}

export interface PathInput {
  points: ChartPoint[];
  mapX: (x: number) => number;
  mapY: (y: number) => number;
  curve?: CurveType;
  tension?: number;
  /** 'gap' breaks the line at nulls; 'connect' bridges; 'zero' reads them as 0. */
  connectNulls?: 'gap' | 'connect' | 'zero' | boolean;
  /**
   * Turned chart. mapX always maps the CATEGORY and mapY the VALUE; this decides
   * which screen axis each lands on. Swapping the two mappers instead would
   * transpose every emitted coordinate, which is the bug this replaced.
   */
  horizontal?: boolean;
}

/** Nulls split the line into runs, so a gap is a gap rather than a straight lie. */
export function toSegments(input: PathInput): PlotPoint[][] {
  const mode = input.connectNulls === true ? 'connect'
    : input.connectNulls === false ? 'gap'
      : (input.connectNulls || 'gap');
  const runs: PlotPoint[][] = [];
  let current: PlotPoint[] = [];
  const h = !!input.horizontal;
  const push = (p: ChartPoint, value: number) => {
    const cat = input.mapX(p.x);
    const val = input.mapY(value);
    current.push({
      x: h ? val : cat,
      y: h ? cat : val,
      base: p.y0 === null || p.y0 === undefined ? undefined : input.mapY(p.y0),
      src: p,
    });
  };
  input.points.forEach((p) => {
    if (p.y === null) {
      if (mode === 'zero') { push(p, 0); return; }
      if (mode === 'connect') return;
      if (current.length) { runs.push(current); current = []; }
      return;
    }
    push(p, p.y);
  });
  if (current.length) runs.push(current);
  return runs;
}

/**
 * One command per adjacent pair, so a styled segment can be drawn on its own
 * without losing the curve: the tangents are computed from the whole run, then
 * the run is cut into pieces, rather than each pair being curved in isolation.
 */
export function curveCommands(pts: PlotPoint[], curve: CurveType, tension = 0.5): string[] {
  const n = pts.length;
  if (n < 2) return [];
  const out: string[] = [];

  if (curve === 'smooth' && n >= 3) {
    /* Monotone cubic, not Catmull-Rom: it never overshoots, so it cannot invent
       a peak that is not in the data. */
    const dx: number[] = [];
    const dy: number[] = [];
    const slope: number[] = [];
    for (let i = 0; i < n - 1; i += 1) {
      dx[i] = pts[i + 1].x - pts[i].x;
      dy[i] = pts[i + 1].y - pts[i].y;
      slope[i] = dx[i] ? dy[i] / dx[i] : 0;
    }
    const m: number[] = [slope[0]];
    for (let i = 1; i < n - 1; i += 1) {
      if (slope[i - 1] * slope[i] <= 0) m[i] = 0;
      else {
        const w1 = 2 * dx[i] + dx[i - 1];
        const w2 = dx[i] + 2 * dx[i - 1];
        m[i] = (w1 + w2) / (w1 / slope[i - 1] + w2 / slope[i]);
      }
    }
    m[n - 1] = slope[n - 2];
    for (let i = 0; i < n - 1; i += 1) {
      const t = dx[i] / 3;
      out.push(`C${pts[i].x + t} ${pts[i].y + m[i] * t} ${pts[i + 1].x - t} ${pts[i + 1].y - m[i + 1] * t} ${pts[i + 1].x} ${pts[i + 1].y}`);
    }
    return out;
  }

  if (curve === 'spline' && n >= 3) {
    const k = Math.max(0, Math.min(1, tension)) / 3;
    for (let i = 0; i < n - 1; i += 1) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      out.push(`C${p1.x + (p2.x - p0.x) * k} ${p1.y + (p2.y - p0.y) * k} ${p2.x - (p3.x - p1.x) * k} ${p2.y - (p3.y - p1.y) * k} ${p2.x} ${p2.y}`);
    }
    return out;
  }

  for (let i = 1; i < n; i += 1) {
    const a = pts[i - 1];
    const b = pts[i];
    if (curve === 'step-before') out.push(`L${a.x} ${b.y} L${b.x} ${b.y}`);
    else if (curve === 'step-after') out.push(`L${b.x} ${a.y} L${b.x} ${b.y}`);
    else if (curve === 'step') {
      const mid = (a.x + b.x) / 2;
      out.push(`L${mid} ${a.y} L${mid} ${b.y} L${b.x} ${b.y}`);
    } else out.push(`L${b.x} ${b.y}`);
  }
  return out;
}

export function runPath(pts: PlotPoint[], curve: CurveType, tension = 0.5): string {
  if (!pts.length) return '';
  const head = `M${pts[0].x} ${pts[0].y}`;
  return pts.length === 1 ? head : `${head} ${curveCommands(pts, curve, tension).join(' ')}`;
}

export function linePath(input: PathInput): string {
  return toSegments(input)
    .map((run) => runPath(run, input.curve || 'linear', input.tension))
    .join(' ');
}

/**
 * Fills between each point's own lower edge and its value, so a stacked series
 * and a range band are the same path — a fill to zero is just the case where
 * every lower edge is the baseline.
 */
export function areaPath(input: PathInput, baseline: number): string {
  const curve = input.curve || 'linear';
  const h = !!input.horizontal;
  return toSegments(input).map((run) => {
    if (run.length < 2) return '';
    const top = runPath(run, curve, input.tension);
    /* The return edge runs along the VALUE axis, whichever screen axis that is:
       closing along y on a turned chart is what left the fill misplaced. */
    const lower = [...run].reverse().map((p) => (h
      ? { ...p, x: p.base === undefined ? baseline : p.base }
      : { ...p, y: p.base === undefined ? baseline : p.base }));
    const back = runPath(lower, curve, input.tension).replace(/^M/, 'L');
    return `${top} ${back} Z`;
  }).filter(Boolean).join(' ');
}

/** One pair of the run, styled on its own. */
export interface SegmentPiece {
  index: number;
  p0: ChartPoint;
  p1: ChartPoint;
  line: string;
  area: string;
}

export function segmentPieces(input: PathInput, baselineY: number): SegmentPiece[] {
  const curve = input.curve || 'linear';
  const out: SegmentPiece[] = [];
  toSegments(input).forEach((run) => {
    const cmds = curveCommands(run, curve, input.tension);
    for (let i = 0; i < cmds.length; i += 1) {
      const a = run[i];
      const b = run[i + 1];
      const a0 = a.base === undefined ? baselineY : a.base;
      const b0 = b.base === undefined ? baselineY : b.base;
      out.push({
        index: a.src.index,
        p0: a.src,
        p1: b.src,
        line: `M${a.x} ${a.y} ${cmds[i]}`,
        /* A quad rather than a re-curved edge: one segment's fill only has to
           meet its neighbours, and a curve here would not line up with them. */
        area: `M${a.x} ${a.y} ${cmds[i]} L${b.x} ${b0} L${a.x} ${a0} Z`,
      });
    }
  });
  return out;
}

/* ─── bars ───────────────────────────────────────────────── */
export interface BarSlot {
  /** Offset of this bar's centre from the band centre. */
  offset: number;
  width: number;
  /** Paint order: lower is further back. Only meaningful in overlap mode. */
  depth: number;
}

export interface BarSlotOptions {
  /** Fraction of the band left empty between categories. */
  categoryGap?: number;
  /** Fraction of each slot left empty between bars within a group. */
  barGap?: number;
  /** Fixed width in pixels, overriding the computed one. */
  barThickness?: number;
  /** Cap on the computed width, for wide charts with few categories. */
  maxBarThickness?: number;
  mode?: 'group' | 'overlap';
  /** Each successive overlap bar is this fraction of the previous width. */
  overlapRatio?: number;
}

/**
 * Divides a category band between the bars that share it.
 *
 * In group mode the keys are STACK ids, not series ids: stacked series occupy the
 * same ground by definition, so the divisor is the number of stacks. That is also
 * what makes a grouped-stacked layout fall out for free — two stack ids give two
 * side-by-side stacks with no extra concept.
 *
 * In overlap mode every key gets the full band at a decreasing width, painted
 * back to front, which is how a target reads behind an actual without the two
 * being placed side by side.
 */
export function barSlots(
  keys: (string | undefined)[],
  step: number,
  options: BarSlotOptions = {},
): Map<string, BarSlot> {
  const categoryGap = Math.max(0, Math.min(0.9, options.categoryGap ?? 0.28));
  const barGap = Math.max(0, Math.min(0.9, options.barGap ?? 0.1));
  const mode = options.mode || 'group';
  const usable = step * (1 - categoryGap);
  const out = new Map<string, BarSlot>();

  const unique: string[] = [];
  keys.forEach((k) => {
    const key = k || '_';
    if (!unique.includes(key)) unique.push(key);
  });

  const clamp = (w: number) => {
    let width = options.barThickness ?? w;
    if (options.maxBarThickness) width = Math.min(width, options.maxBarThickness);
    return Math.max(1, width);
  };

  if (mode === 'overlap') {
    const ratio = Math.max(0.1, Math.min(1, options.overlapRatio ?? 0.6));
    unique.forEach((key, i) => {
      out.set(key, { offset: 0, width: clamp(usable * ratio ** i), depth: i });
    });
    return out;
  }

  const slot = usable / Math.max(1, unique.length);
  const width = clamp(slot * (1 - barGap));
  unique.forEach((key, i) => {
    /* Centred inside its own slot, so the group stays centred on the category
       whatever the bar width is. */
    out.set(key, { offset: -usable / 2 + slot * i + slot / 2, width, depth: i });
  });
  return out;
}

export interface Corners { tl: number; tr: number; br: number; bl: number }
export type BorderRadiusSpec = number | Partial<Corners>;
export type BorderSkipped = 'start' | 'end' | 'middle' | false;

/**
 * Which two corners sit at the bar's VALUE end, as an explicit table rather than
 * arithmetic: the mapping depends on orientation and sign together, and a turned
 * chart rounding the wrong edge is the exact bug arithmetic would hide.
 */
export function valueCorners(horizontal: boolean, negative: boolean): (keyof Corners)[] {
  if (!horizontal) return negative ? ['bl', 'br'] : ['tl', 'tr'];
  return negative ? ['tl', 'bl'] : ['tr', 'br'];
}

export function resolveCorners(
  spec: BorderRadiusSpec | undefined,
  horizontal: boolean,
  negative: boolean,
): Corners {
  const zero: Corners = { tl: 0, tr: 0, br: 0, bl: 0 };
  if (spec === undefined) return zero;
  if (typeof spec === 'object') return { ...zero, ...spec };
  /* A plain number rounds the value end only: a bar rounded at the axis reads as
     floating above it rather than standing on it. */
  const corners = { ...zero };
  valueCorners(horizontal, negative).forEach((c) => { corners[c] = spec; });
  return corners;
}

type EdgeName = 'top' | 'right' | 'bottom' | 'left';

/**
 * The bar as two paths: a closed one to fill, and an open one to stroke.
 *
 * They differ because borderSkipped drops the stroke on one edge — usually the
 * baseline, so the bar reads as continuous with the axis — and a single closed
 * path cannot express a missing edge.
 */
export function barOutline(
  x: number, y: number, width: number, height: number,
  corners: Corners,
  skipped: BorderSkipped = 'start',
  horizontal = false,
  negative = false,
): { fill: string; stroke: string } {
  const w = Math.max(0, width);
  const h = Math.max(0, height);
  const lim = Math.min(w, h) / 2;
  const cap = (v: number) => Math.max(0, Math.min(v, lim));
  const r = { tl: cap(corners.tl), tr: cap(corners.tr), br: cap(corners.br), bl: cap(corners.bl) };
  const x1 = x + w;
  const y1 = y + h;

  const fill = [
    "M" + (x + r.tl) + " " + y,
    "H" + (x1 - r.tr),
    r.tr ? "A" + r.tr + " " + r.tr + " 0 0 1 " + x1 + " " + (y + r.tr) : "",
    "V" + (y1 - r.br),
    r.br ? "A" + r.br + " " + r.br + " 0 0 1 " + (x1 - r.br) + " " + y1 : "",
    "H" + (x + r.bl),
    r.bl ? "A" + r.bl + " " + r.bl + " 0 0 1 " + x + " " + (y1 - r.bl) : "",
    "V" + (y + r.tl),
    r.tl ? "A" + r.tl + " " + r.tl + " 0 0 1 " + (x + r.tl) + " " + y : "",
    "Z",
  ].filter(Boolean).join(" ");

  if (skipped === false) return { fill, stroke: fill };

  /* Which physical edge is the base depends on orientation and sign — the same
     table the corners use. */
  const baseEdge: EdgeName = horizontal
    ? (negative ? 'right' : 'left')
    : (negative ? 'top' : 'bottom');
  const valueEdge: EdgeName = horizontal
    ? (negative ? 'left' : 'right')
    : (negative ? 'bottom' : 'top');
  const drop = skipped === 'start' ? baseEdge : skipped === 'end' ? valueEdge : null;
  if (!drop) return { fill, stroke: fill };

  const edges: Record<EdgeName, { from: number[]; to: number[] }> = {
    top: { from: [x, y], to: [x1, y] },
    right: { from: [x1, y], to: [x1, y1] },
    bottom: { from: [x1, y1], to: [x, y1] },
    left: { from: [x, y1], to: [x, y] },
  };
  const order: EdgeName[] = ['top', 'right', 'bottom', 'left'];
  const start = order.indexOf(drop);
  /* Rotated so the run begins after the dropped edge, giving one open polyline
     rather than two disconnected pieces. */
  const run = order.slice(start + 1).concat(order.slice(0, start));
  const first = edges[run[0]];
  const stroke = ["M" + first.from[0] + " " + first.from[1]]
    .concat(run.map((e) => "L" + edges[e].to[0] + " " + edges[e].to[1]))
    .join(" ");
  return { fill, stroke };
}

/** Kept for callers that only want the filled shape. */
export function barPath(
  x: number, y: number, width: number, height: number,
  radius: BorderRadiusSpec = 0, horizontal = false, negative = false,
): string {
  return barOutline(x, y, width, height, resolveCorners(radius, horizontal, negative),
    false, horizontal, negative).fill;
}

/* ─── bubbles ────────────────────────────────────────────── */
/**
 * Scales AREA, not radius: the eye reads a circle by its area, so mapping value
 * to radius exaggerates large values by their square.
 */
export function bubbleRadius(
  value: number | null | undefined,
  extent: [number, number],
  min: number,
  max: number,
): number {
  if (value === null || value === undefined) return min;
  const [lo, hi] = extent;
  if (!Number.isFinite(lo) || hi === lo) return (min + max) / 2;
  const t = Math.max(0, Math.min(1, (value - lo) / (hi - lo)));
  const a0 = min * min;
  const a1 = max * max;
  return Math.sqrt(a0 + (a1 - a0) * t);
}

/* ─── markers ────────────────────────────────────────────── */
export function markerPath(shape: string, r: number): string {
  const t = r / 3;
  switch (shape) {
    case 'square': return `M${-r} ${-r}H${r}V${r}H${-r}Z`;
    case 'diamond': return `M0 ${-r * 1.25}L${r * 1.25} 0L0 ${r * 1.25}L${-r * 1.25} 0Z`;
    case 'triangle': return `M0 ${-r * 1.2}L${r * 1.1} ${r * 0.8}H${-r * 1.1}Z`;
    case 'cross': return `M${-r} ${-t}H${-t}V${-r}H${t}V${-t}H${r}V${t}H${t}V${r}H${-t}V${t}H${-r}Z`;
    case 'star': {
      const pts: string[] = [];
      for (let i = 0; i < 10; i += 1) {
        const rad = (Math.PI / 5) * i - Math.PI / 2;
        const rr = i % 2 ? r * 0.5 : r * 1.35;
        pts.push(`${(Math.cos(rad) * rr).toFixed(2)} ${(Math.sin(rad) * rr).toFixed(2)}`);
      }
      return `M${pts.join('L')}Z`;
    }
    default: return '';
  }
}

/* ─── bar labels ─────────────────────────────────────────── */
export type BarLabelPlacement = 'outside-end' | 'inside-end' | 'inside-center' | 'inside-base';

export interface LabelAnchor {
  x: number;
  y: number;
  anchor: 'start' | 'middle' | 'end';
  baseline: string;
  inside: boolean;
}

/**
 * Where a bar's label sits.
 *
 * Placement has to know orientation AND sign together: an outside-end label on a
 * negative bar goes past the baseline in the opposite direction, and on a turned
 * chart the offset moves along x rather than y. Deriving it from the drawn rect
 * rather than from the value means a floor-adjusted or stacked bar labels its
 * actual geometry.
 */
export function barLabelAnchor(
  rect: { x: number; y: number; width: number; height: number },
  placement: BarLabelPlacement,
  horizontal: boolean,
  negative: boolean,
  offset = 6,
): LabelAnchor {
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  /* The value end is the edge away from the baseline; the base end is the one on it. */
  const valueEdge = horizontal
    ? (negative ? rect.x : rect.x + rect.width)
    : (negative ? rect.y + rect.height : rect.y);
  const baseEdge = horizontal
    ? (negative ? rect.x + rect.width : rect.x)
    : (negative ? rect.y : rect.y + rect.height);
  const away = negative ? 1 : -1;

  if (horizontal) {
    const dir = negative ? -1 : 1;
    switch (placement) {
      case 'inside-end':
        return { x: valueEdge - dir * offset, y: cy, anchor: negative ? 'start' : 'end', baseline: 'middle', inside: true };
      case 'inside-center':
        return { x: cx, y: cy, anchor: 'middle', baseline: 'middle', inside: true };
      case 'inside-base':
        return { x: baseEdge + dir * offset, y: cy, anchor: negative ? 'end' : 'start', baseline: 'middle', inside: true };
      default:
        return { x: valueEdge + dir * offset, y: cy, anchor: negative ? 'end' : 'start', baseline: 'middle', inside: false };
    }
  }

  switch (placement) {
    case 'inside-end':
      return { x: cx, y: valueEdge - away * offset, anchor: 'middle', baseline: 'hanging', inside: true };
    case 'inside-center':
      return { x: cx, y: cy, anchor: 'middle', baseline: 'middle', inside: true };
    case 'inside-base':
      return { x: cx, y: baseEdge + away * offset, anchor: 'middle', baseline: negative ? 'hanging' : 'auto', inside: true };
    default:
      return { x: cx, y: valueEdge + away * offset, anchor: 'middle', baseline: negative ? 'hanging' : 'auto', inside: false };
  }
}

/* ─── data labels ────────────────────────────────────────── */
export interface LabelCandidate {
  x: number;
  y: number;
  text: string;
  /** Lower sorts first, so endpoints and extremes survive a collision. */
  priority: number;
  anchor?: 'start' | 'middle' | 'end';
  baseline?: string;
  /** Sitting on the bar rather than beside it, so it needs its own contrast. */
  inside?: boolean;
}

/**
 * Drops colliding labels rather than overlapping them. Advice to "label
 * sparsely" puts the burden on the caller for something the component can see:
 * an unreadable label is worse than a missing one.
 */
export function placeLabels(
  candidates: LabelCandidate[],
  font: string,
  height = 13,
  padding = 3,
): LabelCandidate[] {
  const taken: { x0: number; x1: number; y0: number; y1: number }[] = [];
  const kept: LabelCandidate[] = [];
  [...candidates].sort((a, b) => a.priority - b.priority).forEach((c) => {
    const w = measureText(c.text, font) + padding * 2;
    const box = {
      x0: c.x - w / 2, x1: c.x + w / 2,
      y0: c.y - height / 2, y1: c.y + height / 2,
    };
    const clash = taken.some((t) => !(box.x1 < t.x0 || box.x0 > t.x1 || box.y1 < t.y0 || box.y0 > t.y1));
    if (clash) return;
    taken.push(box);
    kept.push(c);
  });
  return kept;
}

/* ─── palette ────────────────────────────────────────────── */
/**
 * Series colours come from tokens, never a per-chart array: a hundred charts
 * restyle at once and dark mode costs nothing.
 */
export const PALETTE_SIZE = 8;
export function seriesColor(index: number, override?: string | ChartGradient) {
  if (override && typeof override === 'object') return `var(--cht-series-${(index % PALETTE_SIZE) + 1})`;
  return override || `var(--cht-series-${(index % PALETTE_SIZE) + 1})`;
}

/**
 * A gradient's default direction differs by what it paints: along a stroke a
 * gradient usually means progression through time, under a fill it usually
 * means fading toward the baseline.
 */
export function gradientCoords(g: ChartGradient, vertical: boolean) {
  return {
    x1: g.x1 ?? 0,
    y1: g.y1 ?? (vertical ? 0 : 0),
    x2: g.x2 ?? (vertical ? 0 : 1),
    y2: g.y2 ?? (vertical ? 1 : 0),
  };
}
