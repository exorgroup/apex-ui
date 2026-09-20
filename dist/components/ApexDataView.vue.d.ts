import { type SortOrder } from '../core/table';
import type { ApexDataViewClasses } from '../types';
type Row = Record<string, unknown>;
type __VLS_Props = {
    /** Your own class on any part. See ApexDataViewClasses. */
    ui?: ApexDataViewClasses;
    value?: Row[];
    dataKey?: string;
    layout?: 'list' | 'grid';
    /** Segmented control for switching layout. */
    showLayoutSwitcher?: boolean;
    sortField?: string;
    sortOrder?: SortOrder;
    sortOptions?: Array<{
        label: string;
        field: string;
        order: SortOrder;
    }>;
    sortPlaceholder?: string;
    paginator?: boolean;
    rows?: number;
    first?: number;
    rowsPerPageOptions?: number[];
    paginatorTemplate?: string;
    lazy?: boolean;
    totalRecords?: number;
    gridMinWidth?: string;
    gap?: string;
    bordered?: boolean;
    caption?: string;
    loading?: boolean;
    loadingMode?: 'overlay' | 'skeleton';
    skeletonCount?: number;
    emptyMessage?: string;
};
declare var __VLS_1: {}, __VLS_9: {}, __VLS_11: {
    item: Record<string, unknown>;
    index: number;
    layout: "grid";
}, __VLS_13: {
    item: Record<string, unknown>;
    index: number;
    layout: "grid";
}, __VLS_15: {
    item: Record<string, unknown>;
    index: number;
    layout: "list";
}, __VLS_17: {
    item: Record<string, unknown>;
    index: number;
    layout: "list";
}, __VLS_19: {}, __VLS_24: {}, __VLS_36: {};
type __VLS_Slots = {} & {
    header?: (props: typeof __VLS_1) => any;
} & {
    skeleton?: (props: typeof __VLS_9) => any;
} & {
    grid?: (props: typeof __VLS_11) => any;
} & {
    item?: (props: typeof __VLS_13) => any;
} & {
    list?: (props: typeof __VLS_15) => any;
} & {
    item?: (props: typeof __VLS_17) => any;
} & {
    empty?: (props: typeof __VLS_19) => any;
} & {
    loading?: (props: typeof __VLS_24) => any;
} & {
    footer?: (props: typeof __VLS_36) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    sort: (payload: {
        sortField?: string;
        sortOrder: SortOrder;
    }) => any;
    "update:first": (v: number) => any;
    "update:rows": (v: number) => any;
    page: (payload: {
        first: number;
        rows: number;
        page: number;
    }) => any;
    "update:sortField": (v: string | undefined) => any;
    "update:sortOrder": (v: SortOrder) => any;
    "update:layout": (v: "list" | "grid") => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onSort?: ((payload: {
        sortField?: string;
        sortOrder: SortOrder;
    }) => any) | undefined;
    "onUpdate:first"?: ((v: number) => any) | undefined;
    "onUpdate:rows"?: ((v: number) => any) | undefined;
    onPage?: ((payload: {
        first: number;
        rows: number;
        page: number;
    }) => any) | undefined;
    "onUpdate:sortField"?: ((v: string | undefined) => any) | undefined;
    "onUpdate:sortOrder"?: ((v: SortOrder) => any) | undefined;
    "onUpdate:layout"?: ((v: "list" | "grid") => any) | undefined;
}>, {
    rows: number;
    gap: string;
    first: number;
    bordered: boolean;
    paginatorTemplate: string;
    loadingMode: "overlay" | "skeleton";
    layout: "list" | "grid";
    sortPlaceholder: string;
    gridMinWidth: string;
    skeletonCount: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
