import type { ApexTreeTableClasses } from '../types';
import { type ColumnDef, type SortMeta, type SortOrder } from '../core/table';
import { type CheckState, type TreeNode } from '../core/tree';
export type { TreeNode };
/** A column may carry `expander` to host the toggle. */
export type TreeColumn = ColumnDef & {
    expander?: boolean;
};
type __VLS_Props = {
    /** Your own class on any part. See ApexTreeTableClasses. */
    ui?: ApexTreeTableClasses;
    value?: TreeNode[];
    columns?: TreeColumn[];
    expandedKeys?: Record<string, boolean>;
    size?: 'small' | 'normal' | 'large';
    gridLines?: 'none' | 'both' | 'horizontal' | 'vertical';
    striped?: boolean;
    bordered?: boolean;
    indent?: number;
    caption?: string;
    selectionMode?: 'single' | 'multiple' | 'checkbox' | null;
    selectionKeys?: Record<string, boolean | CheckState>;
    metaKeySelection?: boolean;
    sortMode?: 'single' | 'multiple';
    sortField?: string;
    sortOrder?: SortOrder;
    multiSortMeta?: SortMeta[];
    removableSort?: boolean;
    filters?: Record<string, {
        value?: unknown;
        matchMode?: string;
    }>;
    filterDisplay?: 'row' | null;
    filterMode?: 'lenient' | 'strict';
    showGlobalFilter?: boolean;
    paginator?: boolean;
    rows?: number;
    first?: number;
    rowsPerPageOptions?: number[];
    lazy?: boolean;
    totalRecords?: number;
    scrollable?: boolean;
    scrollHeight?: string;
    tableMinWidth?: string;
    loading?: boolean;
    loadingMode?: 'overlay' | 'skeleton';
    skeletonRows?: number;
    emptyMessage?: string;
    showFooter?: boolean;
};
declare function toggle(node: TreeNode): void;
declare function select(node: TreeNode, e?: MouseEvent | KeyboardEvent): void;
declare function selectAllVisible(): void;
declare function focusRow(i: number): void;
declare var __VLS_1: {}, __VLS_10: `header:${string}`, __VLS_11: {
    column: TreeColumn;
}, __VLS_17: `header:${string}`, __VLS_18: {
    column: TreeColumn;
}, __VLS_21: `filter:${string}`, __VLS_22: {
    column: TreeColumn;
}, __VLS_40: `cell:${string}`, __VLS_41: {
    node: TreeNode;
    column: TreeColumn;
    value: unknown;
    index: number;
}, __VLS_44: `cell:${string}`, __VLS_45: {
    node: TreeNode;
    column: TreeColumn;
    value: unknown;
    index: number;
}, __VLS_50: {}, __VLS_55: {}, __VLS_67: {};
type __VLS_Slots = {} & {
    [K in NonNullable<typeof __VLS_10>]?: (props: typeof __VLS_11) => any;
} & {
    [K in NonNullable<typeof __VLS_17>]?: (props: typeof __VLS_18) => any;
} & {
    [K in NonNullable<typeof __VLS_21>]?: (props: typeof __VLS_22) => any;
} & {
    [K in NonNullable<typeof __VLS_40>]?: (props: typeof __VLS_41) => any;
} & {
    [K in NonNullable<typeof __VLS_44>]?: (props: typeof __VLS_45) => any;
} & {
    header?: (props: typeof __VLS_1) => any;
} & {
    empty?: (props: typeof __VLS_50) => any;
} & {
    loading?: (props: typeof __VLS_55) => any;
} & {
    footer?: (props: typeof __VLS_67) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    focusRow: typeof focusRow;
    toggle: typeof toggle;
    select: typeof select;
    selectAllVisible: typeof selectAllVisible;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:expandedKeys": (v: Record<string, boolean>) => void;
    "update:selectionKeys": (v: Record<string, boolean | CheckState>) => void;
    "update:filters": (v: Record<string, {
        value?: unknown;
        matchMode?: string;
    }>) => void;
    "update:first": (v: number) => void;
    "update:rows": (v: number) => void;
    "update:sortField": (v: string | undefined) => void;
    "update:sortOrder": (v: SortOrder) => void;
    "update:multiSortMeta": (v: SortMeta[]) => void;
    "node-expand": (node: TreeNode) => void;
    "node-collapse": (node: TreeNode) => void;
    "node-select": (node: TreeNode) => void;
    "node-unselect": (node: TreeNode) => void;
    sort: (payload: {
        sortField?: string;
        sortOrder: SortOrder;
        multiSortMeta: SortMeta[];
    }) => void;
    page: (payload: {
        first: number;
        rows: number;
        page: number;
    }) => void;
    filter: (payload: {
        filters: Record<string, {
            value?: unknown;
            matchMode?: string;
        }>;
    }) => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onSort?: ((payload: {
        sortField?: string;
        sortOrder: SortOrder;
        multiSortMeta: SortMeta[];
    }) => any) | undefined;
    onFilter?: ((payload: {
        filters: Record<string, {
            value?: unknown;
            matchMode?: string;
        }>;
    }) => any) | undefined;
    "onNode-expand"?: ((node: TreeNode) => any) | undefined;
    "onNode-collapse"?: ((node: TreeNode) => any) | undefined;
    "onUpdate:first"?: ((v: number) => any) | undefined;
    "onUpdate:rows"?: ((v: number) => any) | undefined;
    onPage?: ((payload: {
        first: number;
        rows: number;
        page: number;
    }) => any) | undefined;
    "onUpdate:sortField"?: ((v: string | undefined) => any) | undefined;
    "onUpdate:sortOrder"?: ((v: SortOrder) => any) | undefined;
    "onUpdate:multiSortMeta"?: ((v: SortMeta[]) => any) | undefined;
    "onUpdate:filters"?: ((v: Record<string, {
        value?: unknown;
        matchMode?: string;
    }>) => any) | undefined;
    "onUpdate:selectionKeys"?: ((v: Record<string, boolean | CheckState>) => any) | undefined;
    "onNode-select"?: ((node: TreeNode) => any) | undefined;
    "onNode-unselect"?: ((node: TreeNode) => any) | undefined;
    "onUpdate:expandedKeys"?: ((v: Record<string, boolean>) => any) | undefined;
}>, {
    size: "small" | "normal" | "large";
    rows: number;
    selectionMode: "single" | "multiple" | "checkbox" | null;
    indent: number;
    first: number;
    gridLines: "none" | "both" | "horizontal" | "vertical";
    bordered: boolean;
    sortMode: "single" | "multiple";
    removableSort: boolean;
    loadingMode: "overlay" | "skeleton";
    skeletonRows: number;
    filterMode: "lenient" | "strict";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
