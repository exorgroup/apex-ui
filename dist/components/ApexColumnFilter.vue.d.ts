import type { ApexDataTableClasses } from '../types';
import type { ColumnDef, FilterMeta } from '../core/table';
type __VLS_Props = {
    /** Your own class on any part. See ApexDataTableClasses. */
    ui?: ApexDataTableClasses;
    column: ColumnDef;
    meta?: FilterMeta;
    mode?: 'row' | 'menu';
    /** Rules a menu filter may stack. */
    maxConstraints?: number;
    size?: 'small' | 'normal' | 'large';
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    clear: () => any;
    update: (v: FilterMeta) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onClear?: (() => any) | undefined;
    onUpdate?: ((v: FilterMeta) => any) | undefined;
}>, {
    mode: "row" | "menu";
    maxConstraints: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
