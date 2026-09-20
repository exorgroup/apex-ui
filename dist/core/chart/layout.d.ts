/**
 * Plot-rect layout and path building.
 *
 * Label widths decide the plot rect, and the plot rect decides label rotation
 * and culling — a circular dependency resolved by measuring, laying out, and
 * re-measuring only if the result changed. Guessing instead is why charts clip
 * their own axis labels.
 */
import { type AxisSpec, type Tick } from './scale';
import type { ChartGradient, ChartPoint } from './data';
export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}
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
export declare function computeLayout(input: LayoutInput): LayoutResult;
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
export declare function toSegments(input: PathInput): PlotPoint[][];
/**
 * One command per adjacent pair, so a styled segment can be drawn on its own
 * without losing the curve: the tangents are computed from the whole run, then
 * the run is cut into pieces, rather than each pair being curved in isolation.
 */
export declare function curveCommands(pts: PlotPoint[], curve: CurveType, tension?: number): string[];
export declare function runPath(pts: PlotPoint[], curve: CurveType, tension?: number): string;
export declare function linePath(input: PathInput): string;
/**
 * Fills between each point's own lower edge and its value, so a stacked series
 * and a range band are the same path — a fill to zero is just the case where
 * every lower edge is the baseline.
 */
export declare function areaPath(input: PathInput, baseline: number): string;
/** One pair of the run, styled on its own. */
export interface SegmentPiece {
    index: number;
    p0: ChartPoint;
    p1: ChartPoint;
    line: string;
    area: string;
}
export declare function segmentPieces(input: PathInput, baselineY: number): SegmentPiece[];
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
export declare function barSlots(keys: (string | undefined)[], step: number, options?: BarSlotOptions): Map<string, BarSlot>;
export interface Corners {
    tl: number;
    tr: number;
    br: number;
    bl: number;
}
export type BorderRadiusSpec = number | Partial<Corners>;
export type BorderSkipped = 'start' | 'end' | 'middle' | false;
/**
 * Which two corners sit at the bar's VALUE end, as an explicit table rather than
 * arithmetic: the mapping depends on orientation and sign together, and a turned
 * chart rounding the wrong edge is the exact bug arithmetic would hide.
 */
export declare function valueCorners(horizontal: boolean, negative: boolean): (keyof Corners)[];
export declare function resolveCorners(spec: BorderRadiusSpec | undefined, horizontal: boolean, negative: boolean): Corners;
/**
 * The bar as two paths: a closed one to fill, and an open one to stroke.
 *
 * They differ because borderSkipped drops the stroke on one edge — usually the
 * baseline, so the bar reads as continuous with the axis — and a single closed
 * path cannot express a missing edge.
 */
export declare function barOutline(x: number, y: number, width: number, height: number, corners: Corners, skipped?: BorderSkipped, horizontal?: boolean, negative?: boolean): {
    fill: string;
    stroke: string;
};
/** Kept for callers that only want the filled shape. */
export declare function barPath(x: number, y: number, width: number, height: number, radius?: BorderRadiusSpec, horizontal?: boolean, negative?: boolean): string;
/**
 * Scales AREA, not radius: the eye reads a circle by its area, so mapping value
 * to radius exaggerates large values by their square.
 */
export declare function bubbleRadius(value: number | null | undefined, extent: [number, number], min: number, max: number): number;
export declare function markerPath(shape: string, r: number): string;
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
export declare function barLabelAnchor(rect: {
    x: number;
    y: number;
    width: number;
    height: number;
}, placement: BarLabelPlacement, horizontal: boolean, negative: boolean, offset?: number): LabelAnchor;
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
export declare function placeLabels(candidates: LabelCandidate[], font: string, height?: number, padding?: number): LabelCandidate[];
/**
 * Series colours come from tokens, never a per-chart array: a hundred charts
 * restyle at once and dark mode costs nothing.
 */
export declare const PALETTE_SIZE = 8;
export declare function seriesColor(index: number, override?: string | ChartGradient): string;
/**
 * A gradient's default direction differs by what it paints: along a stroke a
 * gradient usually means progression through time, under a fill it usually
 * means fading toward the baseline.
 */
export declare function gradientCoords(g: ChartGradient, vertical: boolean): {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};
