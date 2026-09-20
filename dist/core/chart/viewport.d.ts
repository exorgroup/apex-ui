/** A visible range on one axis: category indices, or numeric/time values. */
export type ZoomRange = [number, number];
/**
 * A visible window. `y` absent means "x only", so every caller written before
 * two-axis zoom keeps working unchanged — which is why this is one object rather
 * than a second zoomRangeY prop that has to be kept consistent with the first.
 */
export interface ZoomWindow {
    x: ZoomRange;
    y?: ZoomRange;
}
/** Accepts either shape on the way in; the emitted payload is always the object. */
export declare function toWindow(value: ZoomRange | ZoomWindow | null): ZoomWindow | null;
export interface ChartGroupState {
    /** null means "show everything". */
    zoom: ZoomWindow | null;
    /** The x key under the pointer, so synced charts share one crosshair. */
    hoverKey: string | number | null;
    /** Series hidden by a legend click, shared so one legend drives every chart. */
    hidden: string[];
}
export interface ChartGroup {
    state: ChartGroupState;
    setZoom(range: ZoomWindow | null): void;
    setHover(key: string | number | null): void;
    toggleSeries(id: string): void;
}
export declare function createChartGroup(): ChartGroup;
export declare const CHART_GROUP_KEY: unique symbol;
export declare function clampRange(range: ZoomRange, bounds: ZoomRange): ZoomRange;
/** Zooms about a fixed point, so the value under the cursor stays under it. */
export declare function zoomAbout(range: ZoomRange, center: number, factor: number, bounds: ZoomRange): ZoomRange;
export declare function panBy(range: ZoomRange, delta: number, bounds: ZoomRange): ZoomRange;
export declare function isFullyZoomedOut(range: ZoomRange | null, bounds: ZoomRange): boolean;
/**
 * Whole-window helpers. Each calls the single-axis function twice rather than
 * taking an axis parameter — two axes are independent, and threading a parameter
 * through would only move the branch inside.
 */
export declare function clampWindow(win: ZoomWindow, xb: ZoomRange, yb: ZoomRange): ZoomWindow;
export declare function zoomWindowAbout(win: ZoomWindow, center: {
    x: number;
    y: number;
}, factor: number, xb: ZoomRange, yb: ZoomRange): ZoomWindow;
export declare function panWindow(win: ZoomWindow, delta: {
    x: number;
    y: number;
}, xb: ZoomRange, yb: ZoomRange): ZoomWindow;
export declare function isWindowFullyOut(win: ZoomWindow | null, xb: ZoomRange, yb: ZoomRange): boolean;
