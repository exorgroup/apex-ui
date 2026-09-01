/**
 * External pie labels with leader lines.
 *
 * Labels cluster wherever slices are thin, and radial placement overlaps them. So
 * they are split by side, sorted by y, then pushed apart — DISPLACED rather than
 * culled, because on a pie the collisions *are* the small slices and those are the
 * ones most needing a label. Culling belongs to `minPercentage`, which drops a
 * label whose slice is too small to sit near it at any spacing.
 *
 * The anchor stays on the slice's own rim and only the text end moves, so the
 * connector always originates at the correct slice however far the text travels.
 */
import { polar } from './radial';

export interface LeaderLabel {
  key: string;
  /** On the slice's own rim, at its mid-angle. */
  ax: number;
  ay: number;
  /** The elbow, just outside the rim. */
  ex: number;
  ey: number;
  /** Where the text sits, after displacement. */
  tx: number;
  ty: number;
  anchor: 'start' | 'end';
  side: 'left' | 'right';
  text: string;
}

export interface LeaderInput {
  cx: number;
  cy: number;
  /** Rim radius the connector starts from. */
  r: number;
  /** How far past the rim the elbow sits. */
  elbow?: number;
  /** Horizontal run from elbow to text. */
  run?: number;
  /** Minimum vertical gap between two labels on the same side. */
  gap?: number;
  /** Clamp box, so a displaced label cannot leave the plot. */
  bounds?: { top: number; bottom: number };
  /** Keeps the radial elbow instead of levelling it with the text. */
  straight?: boolean;
}

export function leaderLabels(
  items: { key: string; mid: number; text: string }[],
  input: LeaderInput,
): LeaderLabel[] {
  const elbow = input.elbow ?? 14;
  const run = input.run ?? 18;
  const gap = input.gap ?? 15;

  const placed: LeaderLabel[] = items.map((item) => {
    const a = polar(input.cx, input.cy, input.r, item.mid);
    const e = polar(input.cx, input.cy, input.r + elbow, item.mid);
    /* Sine of the mid-angle decides the side, so text always reads away from the
       circle rather than back across it. */
    const right = Math.sin(item.mid) >= 0;
    return {
      key: item.key,
      ax: a.x, ay: a.y,
      ex: e.x, ey: e.y,
      tx: e.x + (right ? run : -run),
      ty: e.y,
      anchor: right ? 'start' : 'end',
      side: right ? 'right' : 'left',
      text: item.text,
    };
  });

  (['left', 'right'] as const).forEach((side) => {
    const column = placed.filter((l) => l.side === side).sort((a, b) => a.ty - b.ty);
    if (column.length < 2) return;
    /* One downward pass opens the gaps, then an upward pass pulls the column back
       inside the box — without the second pass a crowded side drifts off the
       bottom, which is worse than the overlap it was fixing. */
    for (let i = 1; i < column.length; i += 1) {
      const min = column[i - 1].ty + gap;
      if (column[i].ty < min) column[i].ty = min;
    }
    const bottom = input.bounds?.bottom;
    const top = input.bounds?.top;
    if (bottom !== undefined && column[column.length - 1].ty > bottom) {
      column[column.length - 1].ty = bottom;
      for (let i = column.length - 2; i >= 0; i -= 1) {
        const max = column[i + 1].ty - gap;
        if (column[i].ty > max) column[i].ty = max;
      }
    }
    if (top !== undefined && column[0].ty < top) {
      column[0].ty = top;
      for (let i = 1; i < column.length; i += 1) {
        const min = column[i - 1].ty + gap;
        if (column[i].ty < min) column[i].ty = min;
      }
    }
    /* The elbow follows the text vertically, or a displaced label is connected by
       a line that visibly misses it. Straight mode keeps the radial elbow. */
    if (!input.straight) column.forEach((l) => { l.ey = l.ty; });
  });

  return placed;
}
