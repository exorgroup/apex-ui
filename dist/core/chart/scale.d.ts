/**
 * Chart scales and ticks.
 *
 * A tick generator per scale type rather than one generic algorithm: "nice"
 * ticks for numbers and for time have nothing in common — one wants powers of
 * ten, the other wants calendar boundaries that are not uniform in length.
 */
export type ScaleType = 'linear' | 'log' | 'time' | 'category';
export type TickFormatter = (value: number, index: number) => string;
export interface Tick {
    value: number;
    label: string;
}
export interface AxisSpec {
    type?: ScaleType;
    /** Axis title, drawn outside the tick labels. */
    label?: string;
    min?: number | string | Date;
    max?: number | string | Date;
    /** Extend the domain to round tick boundaries. */
    nice?: boolean;
    /**
     * Force zero into the domain. Defaults false for lines — a line chart that
     * always starts at zero flattens the shape it exists to show — and true for
     * filled areas, where the fill implies magnitude from a baseline.
     */
    includeZero?: boolean;
    /** Fraction of the span added at each end. */
    padding?: number;
    reverse?: boolean;
    tickCount?: number;
    format?: TickFormatter | Intl.NumberFormatOptions;
    grid?: boolean;
    line?: boolean;
    ticks?: boolean;
    /** 'auto' rotates only when labels would collide. */
    rotate?: number | 'auto';
    /**
     * BCP 47 tag for tick formatting. Passed explicitly rather than read from the
     * document, so a chart can be formatted for its data's locale — a euro
     * revenue chart on an English page is a real case.
     */
    locale?: string;
    /** Category scales only: draw ticks between bands rather than under labels. */
    offsetTicks?: boolean;
    /**
     * Category scales only. A band scale gives each category a slot and maps to its
     * centre; a point scale maps to the boundary. Bars need bands or the first and
     * last would hang half off the plot, and a line sharing the axis has to use the
     * same centres or a combo chart would be misaligned by half a step.
     */
    band?: boolean;
}
export interface Scale {
    type: ScaleType;
    /** Numeric domain in scale space; for category, [0, count - 1]. */
    domain: [number, number];
    range: [number, number];
    categories: string[];
    step: number;
    map(value: number): number;
    invert(px: number): number;
    ticks: Tick[];
}
export declare function measureText(text: string, font?: string): number;
export declare function numberTicks(min: number, max: number, target?: number): {
    min: number;
    max: number;
    step: number;
    values: number[];
};
export declare function logTicks(min: number, max: number): {
    min: number;
    max: number;
    step: number;
    values: number[];
};
type TimeUnit = 'ms' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
export declare function timeTicks(min: number, max: number, target?: number): {
    values: number[];
    unit: TimeUnit;
    options: Intl.DateTimeFormatOptions;
    min: number;
    max: number;
};
export declare function numberFormatter(options?: Intl.NumberFormatOptions, locale?: string): TickFormatter;
export declare function compactFormatter(locale?: string): TickFormatter;
export declare function timeFormatter(options: Intl.DateTimeFormatOptions, locale?: string): TickFormatter;
export interface ScaleInput {
    spec: AxisSpec;
    range: [number, number];
    /** Numeric extent of the data, ignored by category scales. */
    extent: [number, number];
    categories?: string[];
    includeZero?: boolean;
}
export declare function createScale(input: ScaleInput): Scale;
export {};
