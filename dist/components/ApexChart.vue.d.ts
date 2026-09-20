import { type AxisSpec, type Scale } from '../core/chart/scale';
import { type ChartPoint, type ChartSeries, type HitMode, type HitResult, type HitSnap, type MarkerShape, type ResolvedSeries, type StackMode } from '../core/chart/data';
import { type BarLabelPlacement, type CurveType } from '../core/chart/layout';
import { type RasterOptions } from '../core/chart/export';
import { type ZoomRange, type ZoomWindow } from '../core/chart/viewport';
import type { ChartPlugin } from '../core/chart/plugins';
import type { ApexChartProps } from '../types';
export interface ChartLegendSpec {
    show?: boolean;
    position?: 'top' | 'bottom';
    align?: 'start' | 'center' | 'end';
    /** Click a legend entry to hide that series. */
    interactive?: boolean;
}
export interface ChartTooltipSpec {
    show?: boolean;
    mode?: HitMode;
    snap?: HitSnap;
    crosshair?: boolean;
    format?: (value: number, series: string) => string;
}
export interface ChartHoverSpec {
    brightness?: number;
    /** Fades the series you are not on. 1 leaves them alone. */
    dimOpacity?: number;
    radiusMultiplier?: number;
    color?: string;
    borderColor?: string;
    borderWidth?: number;
}
export interface ChartZoomSpec {
    wheel?: boolean;
    /** Drag a range to zoom into it. */
    drag?: boolean;
    /** Shift-drag, or two-finger drag, to pan. */
    pan?: boolean;
    touch?: boolean;
    /**
     * Which axes a drag selects. Defaults to 'xy' for a point chart and 'x'
     * otherwise: a scatter cluster is two-dimensional, so narrowing x alone gives a
     * vertical slab containing everything rather than isolating the group.
     */
    mode?: 'x' | 'y' | 'xy';
}
export interface ChartNavigatorSpec {
    height?: number;
    /** Which series the overview draws. Defaults to the first visible one. */
    series?: string;
    curve?: CurveType;
}
export interface ChartReferenceLine {
    axis?: 'x' | 'y';
    value: number | string | Date;
    label?: string;
    /** Which end the label sits at. 'end' keeps it out of rising data. */
    labelPosition?: 'start' | 'end';
    color?: string;
    dash?: string;
    width?: number;
}
export interface ChartReferenceBand {
    axis?: 'x' | 'y';
    from: number | string | Date;
    to: number | string | Date;
    label?: string;
    color?: string;
    opacity?: number;
}
export interface ChartDataLabelSpec {
    show?: boolean;
    /** Radial only. 'outside' adds leader lines; 'inside' keeps the centroid. */
    position?: 'inside' | 'outside';
    /** What the label says. */
    display?: 'value' | 'percentage' | 'both' | 'label' | 'label-percentage';
    /**
     * Which property names the point, for display 'label'.
     *
     * A numeric x axis has no category to fall back on, so without this the label
     * would silently be the x value — which is already on the axis.
     */
    labelKey?: string;
    /** Slices under this share carry no label at all — see minPercentage. */
    minPercentage?: number;
    /** 'straight' keeps the radial elbow rather than levelling it with the text. */
    lineStyle?: 'angled' | 'straight';
    /**
     * Bars only. Outside-end never covers the data, which is why it is the default;
     * dense charts want inside-end, and a stacked segment can only carry
     * inside-center, so stacked series default to that rather than inheriting.
     */
    placement?: BarLabelPlacement;
    format?: (value: number, point: ChartPoint) => string;
    /** Distance above the point. */
    offset?: number;
    /** false draws every label, collisions and all. */
    collision?: boolean;
    /** Label only the ends and the extremes, which is what dense series can carry. */
    sparse?: boolean;
}
type __VLS_Props = ApexChartProps & {
    series?: ChartSeries[];
    xAxis?: AxisSpec;
    yAxis?: AxisSpec;
    /** A second y axis, for a series whose units would hide it on the first. */
    y2Axis?: AxisSpec;
    title?: string;
    caption?: string;
    legend?: ChartLegendSpec;
    tooltip?: ChartTooltipSpec;
    hover?: ChartHoverSpec;
    curve?: CurveType;
    tension?: number;
    connectNulls?: 'gap' | 'connect' | 'zero' | boolean;
    /** Stacks series sharing a stack id; 'percent' normalizes each category to 100. */
    stackMode?: StackMode;
    /**
     * Swaps the axes: categories run down the left and values across. It is a
     * chart-level choice rather than per series, because two series cannot share a
     * category axis pointing in different directions.
     */
    orientation?: 'vertical' | 'horizontal';
    /** Fraction of the band left empty between categories. */
    categoryGap?: number;
    /** Fraction of each slot left empty between bars in a group. */
    barGap?: number;
    /** Kept as an alias for categoryGap. */
    barPadding?: number;
    barThickness?: number;
    maxBarThickness?: number;
    /** 'overlap' layers bars at one position, back to front, rather than grouping. */
    barMode?: 'group' | 'overlap';
    overlapRatio?: number;
    barRadius?: number | {
        tl?: number;
        tr?: number;
        br?: number;
        bl?: number;
    };
    barBorderColor?: string;
    barBorderWidth?: number;
    barBorderDash?: number[] | string;
    borderSkipped?: 'start' | 'end' | 'middle' | false;
    minBarLength?: number;
    innerRadius?: number;
    padAngle?: number;
    startAngle?: number;
    endAngle?: number;
    /**
     * Fraction of the fitted radius the ring occupies. Below 1 it leaves room for
     * external labels, which is why the two arrived together — labels outside a
     * ring sized to fill the box would run off the edge.
     */
    outerRadius?: number;
    /** Rings behind a radar, for reading values off. */
    radarRings?: number;
    /** Text in the middle of a donut or gauge. */
    centerLabel?: string;
    centerValue?: string;
    dataLabels?: boolean | ChartDataLabelSpec;
    zoom?: boolean | ChartZoomSpec;
    /** Bindable visible window; an [lo, hi] pair still means "x only". */
    zoomRange?: ZoomRange | ZoomWindow | null;
    navigator?: boolean | ChartNavigatorSpec;
    referenceLines?: ChartReferenceLine[];
    referenceBands?: ChartReferenceBand[];
    plugins?: ChartPlugin[];
    /**
     * A download menu on the chart. Off by default: it is the first piece of
     * application chrome inside a chart, and a dashboard tile usually does not want
     * it. When on, it calls the same export methods the ref exposes.
     */
    toolbar?: boolean | {
        items?: ('png' | 'svg' | 'csv' | 'reset-zoom')[];
    };
    /** Default label placement for reference lines. */
    referenceLabelPosition?: 'start' | 'end';
    showMarkers?: boolean;
    markerSize?: number;
    markerShape?: MarkerShape;
    /**
     * Stacked plot areas sharing one x axis.
     *
     * Weights rather than pixels, so the split survives a resize. A series names
     * its pane with `pane`; anything unnamed lands in the first, which is what keeps
     * every existing chart working unchanged.
     */
    panes?: {
        id: string;
        weight?: number;
        label?: string;
    }[];
    /** Vertical gap between panes, in pixels. */
    paneGap?: number;
    /** Doji colour — open equals close. Indecision is not a tiny up candle. */
    neutralColor?: string;
    /** Candle body width as a fraction of the category band. */
    barWidthRatio?: number;
    wickStrokeWidth?: number;
    /** Chart-wide point border. A white one is what separates overlapping points. */
    pointBorderColor?: string;
    pointBorderStrokeWidth?: number;
    lineStrokeWidth?: number;
    /** Hit area around a point, independent of its drawn size. */
    pointHitRadius?: number;
    height?: string | number;
    /** 'auto' hands the series layer to canvas past decimationThreshold points. */
    renderer?: 'svg' | 'canvas' | 'auto';
    /** false disables downsampling; a number sets the target point count. */
    decimation?: boolean | number;
    decimationThreshold?: number;
    animation?: boolean;
    animationDuration?: number;
    /**
     * How a line or area arrives.
     *
     * 'draw' sweeps a reveal along the category axis so the series looks drawn;
     * 'grow' interpolates from the baseline; 'auto' draws when every series is a
     * line and grows otherwise, since a sweep says nothing about a pie.
     *
     * A reveal rather than a value interpolation, because a drawn line has to show
     * its real shape as it appears — interpolating toward it would move the whole
     * curve, which is a different gesture.
     */
    entrance?: 'auto' | 'draw' | 'sweep' | 'scale' | 'grow' | 'none';
    entranceDuration?: number;
    /** Play once the chart is actually on screen, and only once. */
    entranceOnVisible?: boolean;
    /** Free: our angles already run clockwise, so ccw is the cursor reversed. */
    entranceDirection?: 'cw' | 'ccw';
    /** A screen-reader table of the plotted values. */
    dataTable?: boolean;
    ariaLabel?: string;
    /** BCP 47 tag for every number and date the chart formats. */
    locale?: string;
    /** 'auto' reads the document's direction. */
    direction?: 'ltr' | 'rtl' | 'auto';
    /**
     * Width-keyed overrides, narrowest match last. A chart cannot know that its
     * legend has stopped fitting from a media query — the query measures the
     * viewport, and the chart is in a column of unknown width.
     */
    responsive?: {
        maxWidth: number;
        [key: string]: unknown;
    }[];
};
declare function clearHit(): void;
declare function toggleSeries(s: ResolvedSeries): void;
declare function mapAnnX(v: number): number;
declare function mapAnnY(v: number): number;
declare var __VLS_1: {
    series: ResolvedSeries[];
    colors: string[];
    hidden: string[];
    toggle: typeof toggleSeries;
}, __VLS_18: {
    plot: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    scales: {
        x: Scale;
        left: Scale;
        right: Scale | null;
        /** One y scale per pane. Single-pane charts get `[left]`. */
        paneY?: Scale[];
    };
    x: typeof mapAnnX;
    y: typeof mapAnnY;
}, __VLS_20: {
    entries: import("../core/chart/data").HitEntry[];
    category: string;
    rows: {
        name: string;
        color: string;
        value: string;
        key: string;
        isOhlc: boolean;
    }[];
    hit: HitResult;
}, __VLS_22: {
    series: ResolvedSeries[];
    colors: string[];
    hidden: string[];
    toggle: typeof toggleSeries;
}, __VLS_24: {};
type __VLS_Slots = {} & {
    legend?: (props: typeof __VLS_1) => any;
} & {
    annotation?: (props: typeof __VLS_18) => any;
} & {
    tooltip?: (props: typeof __VLS_20) => any;
} & {
    legend?: (props: typeof __VLS_22) => any;
} & {
    default?: (props: typeof __VLS_24) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    /** Plot geometry, for annotations and plugins in later slices. */
    geometry: () => {
        plot: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        scales: {
            x: Scale;
            left: Scale;
            right: Scale | null;
            /** One y scale per pane. Single-pane charts get `[left]`. */
            paneY?: Scale[];
        } | undefined;
    };
    clearHover: typeof clearHit;
    exportSvg: () => string;
    exportImage: (options?: RasterOptions) => Promise<Blob>;
    exportCsv: () => string;
    exportRows: () => Record<string, unknown>[];
    zoomTo: (range: ZoomRange | null) => void;
    resetZoom: () => void;
    zoomRange: () => ZoomRange | null;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    "point-click": (payload: {
        series: string;
        point: ChartPoint;
        originalEvent: MouseEvent;
    }) => any;
    "hover-change": (payload: HitResult | null) => any;
    "legend-toggle": (payload: {
        series: string;
        hidden: boolean;
    }) => any;
    "update:zoomRange": (payload: ZoomRange | ZoomWindow | null) => any;
    "zoom-change": (payload: {
        range: ZoomRange | null;
        full: boolean;
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onPoint-click"?: ((payload: {
        series: string;
        point: ChartPoint;
        originalEvent: MouseEvent;
    }) => any) | undefined;
    "onHover-change"?: ((payload: HitResult | null) => any) | undefined;
    "onLegend-toggle"?: ((payload: {
        series: string;
        hidden: boolean;
    }) => any) | undefined;
    "onUpdate:zoomRange"?: ((payload: ZoomRange | ZoomWindow | null) => any) | undefined;
    "onZoom-change"?: ((payload: {
        range: ZoomRange | null;
        full: boolean;
    }) => any) | undefined;
}>, {
    orientation: "vertical" | "horizontal";
    barRadius: number | {
        tl?: number;
        tr?: number;
        br?: number;
        bl?: number;
    };
    height: string | number;
    direction: "ltr" | "rtl" | "auto";
    markerSize: number;
    animation: boolean;
    animationDuration: number;
    curve: CurveType;
    tension: number;
    connectNulls: "gap" | "connect" | "zero" | boolean;
    stackMode: StackMode;
    barGap: number;
    barPadding: number;
    barMode: "group" | "overlap";
    overlapRatio: number;
    borderSkipped: "start" | "end" | "middle" | false;
    innerRadius: number;
    padAngle: number;
    startAngle: number;
    outerRadius: number;
    radarRings: number;
    referenceLabelPosition: "start" | "end";
    markerShape: MarkerShape;
    paneGap: number;
    barWidthRatio: number;
    wickStrokeWidth: number;
    lineStrokeWidth: number;
    pointHitRadius: number;
    renderer: "svg" | "canvas" | "auto";
    decimation: boolean | number;
    decimationThreshold: number;
    entrance: "auto" | "draw" | "sweep" | "scale" | "grow" | "none";
    entranceDuration: number;
    entranceOnVisible: boolean;
    entranceDirection: "cw" | "ccw";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
