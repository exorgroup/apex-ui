import type { ApexChartProps } from '../types';
import type { ChartSeries } from '../core/chart/data';
import type { Rect } from '../core/chart/layout';
type __VLS_Props = ApexChartProps & {
    /** The resolved series; the first heatmap in it is the one drawn. */
    series: ChartSeries[];
    /** The plot rect the grid fills — the chart measures it from the axes. */
    plot: Rect;
    locale?: string;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {
    view: import("vue").ComputedRef<{
        grid: import("..").HeatGrid;
        columns: {
            key: string;
            label: string;
            x: number;
        }[];
        rows: {
            key: string;
            label: string;
            y: number;
        }[];
        cells: {
            key: string;
            x: number;
            y: number;
            width: number;
            height: number;
            fill: string;
            opacity: number;
            label: string;
            value: number | null;
            raw: unknown;
            cellLabel: string;
        }[];
        radius: number;
        showLabels: boolean;
    } | null>;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    hover: (cell: {
        cellLabel: string;
        value: number | null;
    }) => any;
    leave: () => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onHover?: ((cell: {
        cellLabel: string;
        value: number | null;
    }) => any) | undefined;
    onLeave?: (() => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
