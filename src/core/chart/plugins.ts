/**
 * Plugins.
 *
 * A plugin returns a list of overlay primitives rather than drawing directly.
 * Direct drawing would mean one implementation per renderer and a plugin that
 * only works in SVG; a declarative vocabulary paints identically through both,
 * and stays inspectable in the DOM.
 */
import type { Scale } from './scale';
import type { Rect } from './layout';
import type { HitResult, ResolvedSeries } from './data';

export interface PluginApi {
  plot: Rect;
  x: Scale;
  y: Scale;
  series: ResolvedSeries[];
  hit: HitResult | null;
  /** Elapsed ms since mount, for anything that animates. */
  time: number;
  color(index: number): string;
}

export type OverlayNode =
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number; stroke?: string; width?: number; dash?: string; opacity?: number }
  | { type: 'rect'; x: number; y: number; width: number; height: number; fill?: string; stroke?: string; radius?: number; opacity?: number }
  | { type: 'text'; x: number; y: number; text: string; fill?: string; size?: number; weight?: number; anchor?: 'start' | 'middle' | 'end'; baseline?: string; opacity?: number }
  | { type: 'path'; d: string; fill?: string; stroke?: string; width?: number; dash?: string; opacity?: number }
  | { type: 'circle'; cx: number; cy: number; r: number; fill?: string; stroke?: string; width?: number; opacity?: number };

export interface ChartPlugin {
  name: string;
  /** Painted under the series. */
  below?: (api: PluginApi) => OverlayNode[];
  /** Painted over the series. */
  above?: (api: PluginApi) => OverlayNode[];
  onHover?: (hit: HitResult | null) => void;
}

/* ─── built-ins ──────────────────────────────────────────── */

export function watermarkPlugin(text: string, options?: { opacity?: number; size?: number }): ChartPlugin {
  return {
    name: 'watermark',
    below: ({ plot }) => [{
      type: 'text',
      x: plot.x + plot.width / 2,
      y: plot.y + plot.height / 2,
      text,
      anchor: 'middle',
      baseline: 'middle',
      size: options?.size ?? Math.min(plot.width / 6, 64),
      weight: 700,
      fill: 'currentColor',
      opacity: options?.opacity ?? 0.06,
    }],
  };
}

/**
 * Least-squares fit over a series. Drawn from the regression rather than from
 * the first and last points, which is a chord and not a trend.
 */
export function trendlinePlugin(seriesId?: string, options?: { color?: string; dash?: string }): ChartPlugin {
  return {
    name: 'trendline',
    above: ({ plot, x, y, series, color }) => {
      const s = seriesId ? series.find((q) => q.id === seriesId) : series.find((q) => !q.hidden);
      if (!s || s.hidden) return [];
      const pts = s.points.filter((p) => p.y !== null);
      if (pts.length < 2) return [];
      const n = pts.length;
      let sx = 0; let sy = 0; let sxy = 0; let sxx = 0;
      pts.forEach((p) => {
        sx += p.x; sy += p.y as number;
        sxy += p.x * (p.y as number); sxx += p.x * p.x;
      });
      const denom = n * sxx - sx * sx;
      if (!denom) return [];
      const slope = (n * sxy - sx * sy) / denom;
      const intercept = (sy - slope * sx) / n;
      const x0 = pts[0].x;
      const x1 = pts[n - 1].x;
      return [{
        type: 'line',
        x1: x.map(x0), y1: y.map(slope * x0 + intercept),
        x2: x.map(x1), y2: y.map(slope * x1 + intercept),
        stroke: options?.color || color(series.indexOf(s)),
        width: 1.5,
        dash: options?.dash || '6 5',
        opacity: 0.85,
      }];
    },
  };
}

/** Live figures for the hovered point, drawn in the plot's top corner. */
export function statsPlugin(options?: { align?: 'start' | 'end' }): ChartPlugin {
  return {
    name: 'live-stats',
    above: ({ plot, hit, color, series }) => {
      if (!hit) return [];
      const align = options?.align || 'end';
      const x = align === 'end' ? plot.x + plot.width - 4 : plot.x + 4;
      return hit.entries.flatMap((e, i) => ([
        {
          type: 'circle' as const,
          cx: align === 'end' ? x - 96 : x + 6,
          cy: plot.y + 10 + i * 15,
          r: 3.5,
          fill: color(series.indexOf(e.series)),
        },
        {
          type: 'text' as const,
          x, y: plot.y + 14 + i * 15,
          text: `${e.series.name}  ${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(e.point.y as number)}`,
          anchor: align === 'end' ? 'end' : 'start',
          size: 11,
          weight: 600,
          fill: 'currentColor',
          opacity: 0.75,
        },
      ]));
    },
  };
}

/** Shades the plot where values sit outside a tolerance. */
export function thresholdPlugin(min: number, max: number, options?: { color?: string }): ChartPlugin {
  return {
    name: 'threshold-bands',
    below: ({ plot, y }) => {
      const fill = options?.color || 'var(--accent-danger)';
      const top = y.map(max);
      const bottom = y.map(min);
      const nodes: OverlayNode[] = [];
      if (top > plot.y) {
        nodes.push({ type: 'rect', x: plot.x, y: plot.y, width: plot.width, height: top - plot.y, fill, opacity: 0.07 });
      }
      if (bottom < plot.y + plot.height) {
        nodes.push({
          type: 'rect', x: plot.x, y: bottom, width: plot.width,
          height: plot.y + plot.height - bottom, fill, opacity: 0.07,
        });
      }
      return nodes;
    },
  };
}
