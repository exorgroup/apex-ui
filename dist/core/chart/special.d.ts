/**
 * Heatmap, candlestick and treemap — the three types whose layout is a real
 * algorithm rather than a mapping.
 */
import type { ChartPoint } from './data';
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
export declare function heatGrid(data: unknown[], getColumn: (row: unknown, i: number) => unknown, getRow: (row: unknown, i: number) => unknown, getValue: (row: unknown, i: number) => unknown): HeatGrid;
/**
 * Intensity in 0..1. Returned as a fraction rather than a colour so the caller
 * can apply it as opacity on a design-token colour — parsing `oklch(...)` out of
 * a custom property to interpolate it would tie the heatmap to a colour format
 * and break theming.
 */
export declare function heatIntensity(value: number | null, extent: [number, number]): number;
/** Discrete bands when explicit stops are given: easier to read off a legend. */
export declare function heatBand(intensity: number, stops: string[]): string | undefined;
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
export declare function candleTones(points: {
    key: string | number;
    ohlc?: {
        open: number;
        close: number;
    } | null;
}[], variant: 'candle' | 'hollow' | 'ohlc'): Map<string | number, {
    tone: CandleTone;
    filled: boolean;
}>;
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
    openTick: {
        x1: number;
        x2: number;
        y: number;
    };
    closeTick: {
        x1: number;
        x2: number;
        y: number;
    };
}
export declare function candleGeometry(candles: Candle[], mapX: (x: number) => number, mapY: (v: number) => number, width: number): CandleGeometry[];
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
interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}
export declare function treemapLayout(root: TreeNode[], rect: Rect, 
/** How many levels to lay out. Deeper levels are reached by drilling in. */
depth?: number, padding?: number): TreeTile[];
export {};
