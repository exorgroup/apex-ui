/**
 * Radial geometry: pie, donut, gauge, radar and polar.
 *
 * Angles are measured from twelve o'clock, clockwise, in radians — the way
 * people read a dial. Mathematical convention (zero at three o'clock, counter-
 * clockwise) would put every caller's `startAngle` at −90.
 */
export const TAU = Math.PI * 2;

export interface RadialFrame {
  cx: number;
  cy: number;
  /** Outer radius. */
  r: number;
  /** Inner radius; 0 for a full pie. */
  r0: number;
  start: number;
  end: number;
}

export function polar(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.sin(angle), y: cy - r * Math.cos(angle) };
}

/**
 * An annular sector. A full circle cannot be drawn as one arc — the start and
 * end points coincide and the renderer draws nothing — so a complete ring is
 * split into two halves.
 */
export function arcPath(
  cx: number, cy: number, r0: number, r1: number, a0: number, a1: number,
): string {
  const sweep = a1 - a0;
  if (Math.abs(sweep) < 1e-6) return '';
  if (Math.abs(sweep) >= TAU - 1e-6) {
    const mid = a0 + Math.PI;
    return `${arcPath(cx, cy, r0, r1, a0, mid)} ${arcPath(cx, cy, r0, r1, mid, a0 + TAU)}`;
  }
  const large = Math.abs(sweep) > Math.PI ? 1 : 0;
  const dir = sweep > 0 ? 1 : 0;
  const o0 = polar(cx, cy, r1, a0);
  const o1 = polar(cx, cy, r1, a1);
  if (r0 <= 0) {
    return `M${cx} ${cy}L${o0.x} ${o0.y}A${r1} ${r1} 0 ${large} ${dir} ${o1.x} ${o1.y}Z`;
  }
  const i1 = polar(cx, cy, r0, a1);
  const i0 = polar(cx, cy, r0, a0);
  return `M${o0.x} ${o0.y}A${r1} ${r1} 0 ${large} ${dir} ${o1.x} ${o1.y}`
    + `L${i1.x} ${i1.y}A${r0} ${r0} 0 ${large} ${dir ? 0 : 1} ${i0.x} ${i0.y}Z`;
}

export interface PieSlice {
  index: number;
  value: number;
  fraction: number;
  a0: number;
  a1: number;
  /** Mid-angle, for a label or a leader line. */
  mid: number;
}

/**
 * Lays out values around a ring. Zero and negative values are dropped rather
 * than drawn as slivers: a part-to-whole chart has no way to show a negative
 * part, and a zero slice is a line the reader cannot hover.
 */
export function pieLayout(
  values: (number | null)[],
  start = 0,
  end = TAU,
  padAngle = 0,
): PieSlice[] {
  const usable = values.map((v) => (v === null || v === undefined || v <= 0 ? 0 : v));
  const total = usable.reduce((a, b) => a + b, 0);
  if (!total) return [];
  const drawn = usable.filter((v) => v > 0).length;
  const span = (end - start) - padAngle * Math.max(0, drawn - 1);
  const out: PieSlice[] = [];
  let cursor = start;
  usable.forEach((v, i) => {
    if (!v) return;
    const sweep = (v / total) * span;
    out.push({
      index: i,
      value: v,
      fraction: v / total,
      a0: cursor,
      a1: cursor + sweep,
      mid: cursor + sweep / 2,
    });
    cursor += sweep + padAngle;
  });
  return out;
}

/* ─── radar ──────────────────────────────────────────────── */

/** One spoke per category, the first pointing straight up. */
export function spokeAngles(count: number, start = 0): number[] {
  return Array.from({ length: Math.max(1, count) }, (_, i) => start + (i / Math.max(1, count)) * TAU);
}

export function radarPath(
  cx: number, cy: number,
  radii: (number | null)[],
  angles: number[],
  close = true,
): string {
  const pts: string[] = [];
  radii.forEach((r, i) => {
    /* A missing value collapses to the centre rather than breaking the polygon:
       an open radar shape reads as a different profile, not as missing data. */
    const p = polar(cx, cy, r === null || r === undefined ? 0 : r, angles[i] ?? 0);
    pts.push(`${p.x} ${p.y}`);
  });
  if (!pts.length) return '';
  return `M${pts.join('L')}${close ? 'Z' : ''}`;
}

/* ─── gauge ──────────────────────────────────────────────── */

export interface GaugeGeometry {
  track: string;
  value: string;
  /** Where the needle tip sits, for a marker. */
  tip: { x: number; y: number };
  fraction: number;
}

export function gaugeGeometry(
  frame: RadialFrame,
  value: number,
  min: number,
  max: number,
): GaugeGeometry {
  const range = max - min || 1;
  const fraction = Math.max(0, Math.min(1, (value - min) / range));
  const angle = frame.start + (frame.end - frame.start) * fraction;
  return {
    track: arcPath(frame.cx, frame.cy, frame.r0, frame.r, frame.start, frame.end),
    value: arcPath(frame.cx, frame.cy, frame.r0, frame.r, frame.start, angle),
    tip: polar(frame.cx, frame.cy, (frame.r + frame.r0) / 2, angle),
    fraction,
  };
}

/* ─── hit testing ────────────────────────────────────────── */

/** Normalizes to [0, TAU) so a comparison never straddles the seam. */
export function normalizeAngle(a: number) {
  const t = a % TAU;
  return t < 0 ? t + TAU : t;
}

export function angleAt(cx: number, cy: number, x: number, y: number) {
  return normalizeAngle(Math.atan2(x - cx, cy - y));
}

export function sliceAt(slices: PieSlice[], angle: number, start: number) {
  const a = normalizeAngle(angle - start);
  return slices.find((s) => {
    const s0 = normalizeAngle(s.a0 - start);
    const s1 = s0 + (s.a1 - s.a0);
    return a >= s0 && a <= s1;
  }) || null;
}
