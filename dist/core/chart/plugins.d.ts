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
export type OverlayNode = {
    type: 'line';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    stroke?: string;
    width?: number;
    dash?: string;
    opacity?: number;
} | {
    type: 'rect';
    x: number;
    y: number;
    width: number;
    height: number;
    fill?: string;
    stroke?: string;
    radius?: number;
    opacity?: number;
} | {
    type: 'text';
    x: number;
    y: number;
    text: string;
    fill?: string;
    size?: number;
    weight?: number;
    anchor?: 'start' | 'middle' | 'end';
    baseline?: string;
    opacity?: number;
} | {
    type: 'path';
    d: string;
    fill?: string;
    stroke?: string;
    width?: number;
    dash?: string;
    opacity?: number;
} | {
    type: 'circle';
    cx: number;
    cy: number;
    r: number;
    fill?: string;
    stroke?: string;
    width?: number;
    opacity?: number;
};
export interface ChartPlugin {
    name: string;
    /** Painted under the series. */
    below?: (api: PluginApi) => OverlayNode[];
    /** Painted over the series. */
    above?: (api: PluginApi) => OverlayNode[];
    onHover?: (hit: HitResult | null) => void;
}
export declare function watermarkPlugin(text: string, options?: {
    opacity?: number;
    size?: number;
}): ChartPlugin;
/**
 * Least-squares fit over a series. Drawn from the regression rather than from
 * the first and last points, which is a chord and not a trend.
 */
export declare function trendlinePlugin(seriesId?: string, options?: {
    color?: string;
    dash?: string;
}): ChartPlugin;
/** Live figures for the hovered point, drawn in the plot's top corner. */
export declare function statsPlugin(options?: {
    align?: 'start' | 'end';
}): ChartPlugin;
/** Shades the plot where values sit outside a tolerance. */
export declare function thresholdPlugin(min: number, max: number, options?: {
    color?: string;
}): ChartPlugin;
