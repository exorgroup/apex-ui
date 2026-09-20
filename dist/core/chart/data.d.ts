/**
 * Series normalization, decimation, hit testing and the animation clock.
 *
 * Every series becomes a flat array of points with a stable `key`, which is what
 * makes interpolation between two datasets possible: a point is matched to its
 * predecessor by key, so a removed point collapses and a new one grows instead
 * of the whole series being replaced.
 */
export type ChartSeriesType = 'line' | 'bar' | 'scatter' | 'bubble' | 'pie' | 'gauge' | 'radar' | 'polar' | 'heatmap' | 'candlestick' | 'treemap';
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
    /** Number rounds the value end only; an object addresses visual corners. */
    barRadius?: number | {
        tl?: number;
        tr?: number;
        br?: number;
        bl?: number;
    };
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
    /** Row accessor; xKey supplies the columns. */
    groupKey?: string | ((row: unknown, i: number) => unknown);
    /** Discrete colour bands. Without them, intensity is opacity on the series colour. */
    colorStops?: string[];
    cellRadius?: number;
    barWidthRatio?: number;
    neutralColor?: string;
    wickStrokeWidth?: number;
    cellGap?: number;
    showCellLabels?: boolean;
    openKey?: string | ((row: unknown, i: number) => unknown);
    highKey?: string | ((row: unknown, i: number) => unknown);
    lowKey?: string | ((row: unknown, i: number) => unknown);
    closeKey?: string | ((row: unknown, i: number) => unknown);
    candleVariant?: 'candle' | 'hollow' | 'ohlc';
    upColor?: string;
    downColor?: string;
    /** Hierarchical rows; each may carry children. */
    nodes?: unknown[];
    /** How many levels to lay out at once; deeper levels are reached by drilling. */
    depth?: number;
    tilePadding?: number;
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
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    stops: {
        offset: number;
        color: string;
        opacity?: number;
    }[];
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
    ohlc?: {
        open: number;
        high: number;
        low: number;
        close: number;
    };
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
export declare function resolveSeries(series: ChartSeries[], options: ResolveOptions): {
    resolved: ResolvedSeries[];
    categories: string[];
};
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
export declare function applyWaterfall(series: ResolvedSeries[]): void;
export declare function applyStacking(series: ResolvedSeries[], mode: StackMode): void;
export declare function extentOf(series: ResolvedSeries[], axis?: 'left' | 'right'): [number, number];
export declare function xExtentOf(series: ResolvedSeries[]): [number, number];
/**
 * Largest-triangle-three-buckets. Preserves visual shape including spikes,
 * which plain stride sampling and averaging both destroy — and shape is the
 * only reason to draw a line chart.
 *
 * Nulls end a run: a bucket spanning a gap would invent a segment across it.
 */
export declare function lttb(points: ChartPoint[], threshold: number): ChartPoint[];
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
    pointer: {
        x: number;
        y: number;
    };
    series: ResolvedSeries[];
    project: (s: ResolvedSeries, p: ChartPoint) => {
        px: number;
        py: number;
    };
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
export declare function findHit(input: HitInput): HitResult | null;
export type EaseFn = (t: number) => number;
export declare const easeOutCubic: EaseFn;
export interface TweenPair {
    y: number | null;
    y0: number | null | undefined;
}
export interface TweenFrame {
    /** seriesId → key → both edges, so a stacked or banded series tweens whole. */
    values: Map<string, Map<string | number, TweenPair>>;
}
/**
 * Interpolates between two datasets rather than playing an entrance effect.
 * Entrance is then the same code with a synthetic previous frame at the
 * baseline — and a data change becomes a movement rather than a flicker.
 */
export declare function snapshot(series: ResolvedSeries[]): TweenFrame;
export declare function baselineFrom(frame: TweenFrame, baseline: number): TweenFrame;
/** Applies an interpolated frame onto resolved series, in place. */
export declare function applyFrame(series: ResolvedSeries[], from: TweenFrame, to: TweenFrame, t: number, baseline: number): void;
