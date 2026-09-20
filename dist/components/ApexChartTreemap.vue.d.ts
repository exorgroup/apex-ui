import type { ApexChartProps } from '../types';
import { type TreeNode, type TreeTile } from '../core/chart/special';
import type { ChartSeries } from '../core/chart/data';
type __VLS_Props = ApexChartProps & {
    /** The resolved series; the first treemap in it is the one drawn. */
    series: ChartSeries[];
    /** How far the user has drilled — an empty path is the top level. */
    drillPath: TreeNode[];
    width: number;
    height: number;
    locale?: string;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    drill: (tile: TreeTile) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onDrill?: ((tile: TreeTile) => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
