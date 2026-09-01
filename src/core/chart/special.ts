/**
 * Heatmap, candlestick and treemap — the three types whose layout is a real
 * algorithm rather than a mapping.
 */
import type { ChartPoint } from './data';

/* ─── heatmap ────────────────────────────────────────────── */

export interface HeatCell {
  key: string;
  /** Column and row indices. */
  cx: number;
  cy: number;
  value: number | null;
  raw: unknown;
}

export interface HeatGrid {
  columns: string[];
  rows: string[];
  cells: HeatCell[];
  extent: [number, number];
}

/**
 * Builds the grid from flat rows. Columns and rows come from the data in
 * first-seen order rather than being sorted: a heatmap's axes are usually
 * meaningful sequences — hours, weekdays, stages — and sorting them
 * alphabetically destroys the order the reader came for.
 */
export function heatGrid(
  data: unknown[],
  getColumn: (row: unknown, i: number) => unknown,
  getRow: (row: unknown, i: number) => unknown,
  getValue: (row: unknown, i: number) => unknown,
): HeatGrid {
  const columns: string[] = [];
  const rows: string[] = [];
  const cells: HeatCell[] = [];
  let lo = Infinity;
  let hi = -Infinity;

  data.forEach((row, i) => {
    const c = String(getColumn(row, i) ?? '');
    const r = String(getRow(row, i) ?? '');
    if (!columns.includes(c)) columns.push(c);
    if (!rows.includes(r)) rows.push(r);
    const n = Number(getValue(row, i));
    const value = Number.isFinite(n) ? n : null;
    if (value !== null) {
      if (value < lo) lo = value;
      if (value > hi) hi = value;
    }
    cells.push({
      key: `${c}|${r}`,
      cx: columns.indexOf(c),
      cy: rows.indexOf(r),
      value,
      raw: row,
    });
  });

  return { columns, rows, cells, extent: [lo, hi] };
}

/**
 * Intensity in 0..1. Returned as a fraction rather than a colour so the caller
 * can apply it as opacity on a design-token colour — parsing `oklch(...)` out of
 * a custom property to interpolate it would tie the heatmap to a colour format
 * and break theming.
 */
export function heatIntensity(value: number | null, extent: [number, number]) {
  if (value === null || !Number.isFinite(extent[0])) return 0;
  const span = extent[1] - extent[0];
  if (!span) return 1;
  return Math.max(0, Math.min(1, (value - extent[0]) / span));
}

/** Discrete bands when explicit stops are given: easier to read off a legend. */
export function heatBand(intensity: number, stops: string[]) {
  if (!stops.length) return undefined;
  const i = Math.min(stops.length - 1, Math.floor(intensity * stops.length));
  return stops[i];
}

/* ─── candlestick ────────────────────────────────────────── */

export type CandleTone = 'up' | 'down' | 'neutral';

export interface Candle {
  key: string;
  point: ChartPoint;
  open: number;
  high: number;
  low: number;
  close: number;
  up: boolean;
  /**
   * Which direction the COLOUR reports. In hollow mode that is close against the
   * PREVIOUS close, not the candle's own open — colour and fill answer different
   * questions there, and deriving both from the open would make the colour
   * redundant and lose the inter-period comparison entirely.
   */
  tone?: CandleTone;
  /** Whether the body is filled. Hollow mode leaves a bullish body open. */
  filled?: boolean;
}

/**
 * Resolves tone and fill across the ordered series.
 *
 * Runs over the FULL-RESOLUTION points, because a hollow candle's colour depends
 * on its neighbour and decimation may have dropped the one it is compared
 * against — the same reason hit testing never uses the drawn set.
 */
export function candleTones(
  points: { key: string | number; ohlc?: { open: number; close: number } | null }[],
  variant: 'candle' | 'hollow' | 'ohlc',
): Map<string | number, { tone: CandleTone; filled: boolean }> {
  const out = new Map<string | number, { tone: CandleTone; filled: boolean }>();
  let prevClose: number | null = null;
  points.forEach((p) => {
    const o = p.ohlc;
    if (!o) return;
    let tone: CandleTone;
    if (variant === 'hollow') {
      /* The first candle has no predecessor, so it is neutral rather than
         silently green: inventing a comparison against nothing is exactly the
         kind of quiet wrongness that survives review. */
      if (prevClose === null) tone = 'neutral';
      else if (o.close > prevClose) tone = 'up';
      else if (o.close < prevClose) tone = 'down';
      else tone = 'neutral';
    } else if (o.close > o.open) tone = 'up';
    else if (o.close < o.open) tone = 'down';
    else tone = 'neutral';
    /* Hollow leaves a bullish body open; every other variant fills. */
    out.set(p.key, { tone, filled: variant === 'hollow' ? o.close < o.open : true });
    prevClose = o.close;
  });
  return out;
}

export interface CandleGeometry extends Candle {
  /** Wick, from high to low. */
  wickX: number;
  wickY1: number;
  wickY2: number;
  /** Body between open and close. */
  bodyX: number;
  bodyY: number;
  bodyW: number;
  bodyH: number;
  /** OHLC bar variant: the two horizontal ticks. */
  openTick: { x1: number; x2: number; y: number };
  closeTick: { x1: number; x2: number; y: number };
}

export function candleGeometry(
  candles: Candle[],
  mapX: (x: number) => number,
  mapY: (v: number) => number,
  width: number,
): CandleGeometry[] {
  return candles.map((c) => {
    const cx = mapX(c.point.x);
    const yOpen = mapY(c.open);
    const yClose = mapY(c.close);
    const top = Math.min(yOpen, yClose);
    /* A doji has open and close equal, so its body would be invisible: it is
       given a minimum of one pixel rather than being dropped, since "no change"
       is information. */
    const height = Math.max(1, Math.abs(yClose - yOpen));
    return {
      ...c,
      wickX: cx,
      wickY1: mapY(c.high),
      wickY2: mapY(c.low),
      bodyX: cx - width / 2,
      bodyY: top,
      bodyW: width,
      bodyH: height,
      openTick: { x1: cx - width / 2, x2: cx, y: yOpen },
      closeTick: { x1: cx, x2: cx + width / 2, y: yClose },
    };
  });
}

/* ─── treemap ────────────────────────────────────────────── */

export interface TreeNode {
  name?: string;
  value?: number;
  children?: TreeNode[];
  color?: string;
  [key: string]: unknown;
}

export interface TreeTile {
  key: string;
  node: TreeNode;
  depth: number;
  value: number;
  x: number;
  y: number;
  width: number;
  height: number;
  /** True when the node has children that were not laid out. */
  drillable: boolean;
  /** True when this tile's children were laid out inside it. */
  nested?: boolean;
}

interface Rect { x: number; y: number; width: number; height: number }

function nodeValue(node: TreeNode): number {
  if (typeof node.value === 'number') return node.value;
  return (node.children || []).reduce((sum, c) => sum + nodeValue(c), 0);
}

/**
 * Squarified treemap.
 *
 * Squarify rather than slice-and-dice because aspect ratio is what makes a tile
 * comparable: a long thin sliver of the same area reads as smaller, so a layout
 * that ignores aspect ratio misreports the data it is drawing.
 */
function squarify(nodes: TreeNode[], rect: Rect, out: TreeTile[], depth: number, prefix: string) {
  const total = nodes.reduce((s, n) => s + nodeValue(n), 0);
  if (!total || rect.width <= 0 || rect.height <= 0) return;

  const scale = (rect.width * rect.height) / total;
  const queue = nodes
    .map((n, i) => ({ node: n, value: nodeValue(n), i }))
    .filter((n) => n.value > 0)
    .sort((a, b) => b.value - a.value);

  let area = { ...rect };
  let cursor = 0;

  while (cursor < queue.length) {
    const horizontal = area.width >= area.height;
    const side = horizontal ? area.height : area.width;
    const row: typeof queue = [];
    let rowSum = 0;
    let best = Infinity;

    /* Rows grow while the worst aspect ratio keeps improving, and stop the moment
       it worsens — that is the whole of the squarify heuristic. */
    while (cursor < queue.length) {
      const candidate = queue[cursor];
      const nextSum = rowSum + candidate.value;
      const thickness = (nextSum * scale) / side;
      const worst = row.concat([candidate]).reduce((w, item) => {
        const length = (item.value * scale) / thickness;
        return Math.max(w, Math.max(thickness / length, length / thickness));
      }, 0);
      if (row.length && worst > best) break;
      row.push(candidate);
      rowSum = nextSum;
      best = worst;
      cursor += 1;
    }

    const thickness = (rowSum * scale) / side;
    let offset = horizontal ? area.y : area.x;
    row.forEach((item) => {
      const length = (item.value * scale) / thickness;
      const tile: Rect = horizontal
        ? { x: area.x, y: offset, width: thickness, height: length }
        : { x: offset, y: area.y, width: length, height: thickness };
      offset += length;
      const key = `${prefix}/${item.node.name ?? item.i}`;
      const kids = item.node.children || [];
      out.push({
        key,
        node: item.node,
        depth,
        value: item.value,
        ...tile,
        drillable: kids.length > 0,
      });
    });

    if (horizontal) { area = { x: area.x + thickness, y: area.y, width: area.width - thickness, height: area.height }; }
    else { area = { x: area.x, y: area.y + thickness, width: area.width, height: area.height - thickness }; }
  }
}

export function treemapLayout(
  root: TreeNode[],
  rect: Rect,
  /** How many levels to lay out. Deeper levels are reached by drilling in. */
  depth = 1,
  padding = 2,
): TreeTile[] {
  const out: TreeTile[] = [];
  squarify(root, rect, out, 0, '');
  if (depth <= 1) return out;

  /*
   * Children are laid out inside their parent's tile, below a reserved header
   * band. The band is the point: children drawn over the parent's own label left
   * two labels bleeding through each other, since the child tiles are
   * translucent. Reserving the space means the parent's name has somewhere of its
   * own to live.
   */
  const BAND = 20;
  out.filter((t) => t.drillable).forEach((t) => {
    const inner = {
      x: t.x + padding,
      y: t.y + BAND,
      width: Math.max(0, t.width - padding * 2),
      height: Math.max(0, t.height - padding - BAND),
    };
    if (inner.width <= 0 || inner.height <= 0) return;
    const kids: TreeTile[] = [];
    squarify(t.node.children || [], inner, kids, t.depth + 1, t.key);
    if (kids.length) t.nested = true;
    out.push(...kids);
  });
  return out;
}
