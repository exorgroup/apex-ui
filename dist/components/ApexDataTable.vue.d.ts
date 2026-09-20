import type { ApexDataTableClasses } from '../types';
import { type ColumnDef, type FilterMeta, type FilterModel, type SortMeta, type SortOrder } from '../core/table';
export type { ColumnDef };
/** A column's identity for layout purposes, and the layout itself. */
export interface ColumnState {
    /** Column keys in display order. Written out in full, never as a diff. */
    order?: string[];
    /** Key → pixel width. */
    widths?: Record<string, number>;
    /** Keys the reader has hidden. */
    hidden?: string[];
}
export interface ColumnGroup {
    header: string;
    /** The column keys this group spans. */
    columns: string[];
    align?: 'start' | 'center' | 'end';
}
/** A column with the stable identity width, order and visibility hang off. */
type KeyedColumn = ColumnDef & {
    __key: string;
};
type Row = Record<string, unknown>;
type __VLS_Props = {
    /** Your own class on any part. See ApexDataTableClasses. */
    ui?: ApexDataTableClasses;
    /** The rows. */
    value?: Row[];
    columns?: ColumnDef[];
    /** Field that uniquely identifies a row. Required for selection and editing. */
    dataKey?: string;
    size?: 'small' | 'normal' | 'large';
    /** none | both | horizontal | vertical */
    gridLines?: 'none' | 'both' | 'horizontal' | 'vertical';
    gridLineSize?: number;
    gridLineColor?: string;
    striped?: boolean;
    stripeColor?: string;
    borderColor?: string;
    headerBackground?: string;
    /** Rounded, bordered card around the table. */
    bordered?: boolean;
    selection?: Row | Row[] | null;
    selectionMode?: 'single' | 'multiple' | 'checkbox' | 'radio' | null;
    selectionColor?: string;
    /** Metabar above the table with the selection count. */
    showSelectionCount?: boolean;
    /** Cmd/Ctrl needed to add to a multiple selection. */
    metaKeySelection?: boolean;
    sortMode?: 'single' | 'multiple';
    sortField?: string;
    sortOrder?: SortOrder;
    multiSortMeta?: SortMeta[];
    /** A third click clears the column's sort. */
    removableSort?: boolean;
    paginator?: boolean;
    rows?: number;
    first?: number;
    rowsPerPageOptions?: number[];
    paginatorTemplate?: string;
    /** Server-side paging/sorting; the table renders `value` as-is. */
    lazy?: boolean;
    totalRecords?: number;
    scrollable?: boolean;
    scrollHeight?: string;
    /** Grow and shrink with a flex parent. */
    flexible?: boolean;
    /** Minimum table width, so columns don't squeeze. */
    tableMinWidth?: string;
    /** cell = click a cell to edit it, row = an editor column per row. */
    editMode?: 'cell' | 'row' | null;
    /** Rows currently in row-edit mode. Bindable. */
    editingRows?: Row[];
    /**
     * Write the edit into the row object as well as emitting. Leave it on for local
     * data; turn it off when the server owns the value and you patch `value` yourself.
     */
    commitEdits?: boolean;
    /** Filter model, keyed by field, plus an optional `global` entry. Bindable. */
    filters?: FilterModel;
    /** row = inline editors under the headers, menu = a popover per column. */
    filterDisplay?: 'row' | 'menu' | null;
    /** Fields the `global` filter searches. Defaults to every non-formula field. */
    globalFilterFields?: string[];
    /** Search box in the metabar, bound to `filters.global`. */
    showGlobalFilter?: boolean;
    globalFilterPlaceholder?: string;
    /** Rules a menu filter may stack. */
    maxConstraints?: number;
    /** Field to group contiguous rows by. */
    groupRowsBy?: string;
    /** subheader = a header row per group, rowspan = the group column spans its rows. */
    rowGroupMode?: 'subheader' | 'rowspan';
    /** Groups can be collapsed. */
    expandableRowGroups?: boolean;
    /** Group keys currently open. Bindable. */
    expandedRowGroups?: string[];
    /** Aggregate row under each group. */
    showGroupFooter?: boolean;
    /** Rows whose detail panel is open. Bindable. */
    expandedRows?: Row[];
    /** Adds a chevron column that opens a detail row. Needs `dataKey`. */
    rowExpansion?: boolean;
    /** Clicking anywhere on the row toggles it, not just the chevron. */
    expandOnRowClick?: boolean;
    /** Only one row open at a time. */
    singleExpand?: boolean;
    expandIcon?: string;
    collapseIcon?: string;
    /** Rows pinned above the scrolling body. Bindable, so the lock column can edit it. */
    frozenValue?: Row[];
    /** Adds a padlock column that freezes and unfreezes a row on click. Needs dataKey. */
    rowFreeze?: boolean;
    freezeIcon?: string;
    unfreezeIcon?: string;
    showFooter?: boolean;
    /** Whether footer aggregates cover everything, the selection, or both. */
    footerMode?: 'all' | 'selected' | 'both';
    loading?: boolean;
    loadingMode?: 'overlay' | 'skeleton';
    skeletonRows?: number;
    emptyMessage?: string;
    rowClass?: (row: Row, index: number) => string | undefined;
    rowStyle?: (row: Row, index: number) => Record<string, string> | undefined;
    /** Row hover highlight. */
    hoverable?: boolean;
    /**
     * Ripple a row from the point of contact.
     *
     * NOT wired to the plugin's app-wide `ripple` option, on purpose: that
     * option is about the buttons the kit draws for itself, and a rippling
     * table row is a far larger visual statement than a rippling button. An
     * app that opted into one should not silently get the other. Per table,
     * explicitly. AF2-325.
     */
    rowRipple?: boolean;
    locale?: string;
    caption?: string;
    /** Bindable `{ order, widths, hidden }`. Omit and the table keeps its own. */
    columnState?: ColumnState;
    resizableColumns?: boolean;
    /** 'fit' takes the width from the next column; 'expand' widens the table. */
    columnResizeMode?: 'fit' | 'expand';
    reorderableColumns?: boolean;
    /** Adds the show/hide picker to the toolbar. */
    columnToggle?: boolean;
    columnToggleLabel?: string;
    /** Header groups above the columns: `{ header, columns: [field], align? }`. */
    columnGroups?: ColumnGroup[];
    /** Persist the layout under this key; omit and nothing is stored. */
    stateKey?: string;
    stateStorage?: 'local' | 'session';
};
declare function setFilter(field: string, meta: FilterMeta): void;
declare function clearFilter(field: string): void;
declare function clearAllFilters(): void;
declare function toggleGroup(key: string): void;
declare function selectRow(row: Row, index: number, event?: MouseEvent): void;
declare function toggleAllOnPage(): void;
declare function toggleFreeze(row: Row): void;
declare function toggleExpand(row: Row): void;
declare function focusRow(i: number): void;
declare var __VLS_1: {}, __VLS_25: `header:${string}`, __VLS_26: {
    column: KeyedColumn;
}, __VLS_32: `header:${string}`, __VLS_33: {
    column: KeyedColumn;
}, __VLS_51: {}, __VLS_57: `cell:${string}`, __VLS_58: {
    row: Row;
    column: KeyedColumn;
    value: unknown;
}, __VLS_66: {
    value: unknown;
    rows: Record<string, unknown>[];
    key: string;
}, __VLS_68: {
    value: unknown;
    rows: Record<string, unknown>[];
    column: KeyedColumn;
}, __VLS_89: `editor:${string}`, __VLS_90: {
    row: Row;
    column: KeyedColumn;
    value: unknown;
    update: (v: unknown) => void;
}, __VLS_93: `cell:${string}`, __VLS_94: {
    row: Row;
    column: KeyedColumn;
    value: unknown;
    index: number;
}, __VLS_99: {
    row: Row;
    index: number;
}, __VLS_101: {}, __VLS_106: {}, __VLS_118: {};
type __VLS_Slots = {} & {
    [K in NonNullable<typeof __VLS_25>]?: (props: typeof __VLS_26) => any;
} & {
    [K in NonNullable<typeof __VLS_32>]?: (props: typeof __VLS_33) => any;
} & {
    [K in NonNullable<typeof __VLS_57>]?: (props: typeof __VLS_58) => any;
} & {
    [K in NonNullable<typeof __VLS_89>]?: (props: typeof __VLS_90) => any;
} & {
    [K in NonNullable<typeof __VLS_93>]?: (props: typeof __VLS_94) => any;
} & {
    header?: (props: typeof __VLS_1) => any;
} & {
    filterRow?: (props: typeof __VLS_51) => any;
} & {
    groupheader?: (props: typeof __VLS_66) => any;
} & {
    groupfooter?: (props: typeof __VLS_68) => any;
} & {
    expansion?: (props: typeof __VLS_99) => any;
} & {
    empty?: (props: typeof __VLS_101) => any;
} & {
    loading?: (props: typeof __VLS_106) => any;
} & {
    footer?: (props: typeof __VLS_118) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    focusRow: typeof focusRow;
    selectRow: typeof selectRow;
    toggleAllOnPage: typeof toggleAllOnPage;
    setFilter: typeof setFilter;
    clearFilter: typeof clearFilter;
    clearAllFilters: typeof clearAllFilters;
    toggleGroup: typeof toggleGroup;
    toggleExpand: typeof toggleExpand;
    toggleFreeze: typeof toggleFreeze;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:columnState": (v: ColumnState) => void;
    "column-resize": (payload: {
        field: string;
        width?: number;
    }) => void;
    "column-reorder": (payload: {
        field: string;
        fromIndex: number;
        toIndex: number;
    }) => void;
    "column-toggle": (payload: {
        field: string;
        hidden: boolean;
    }) => void;
    "update:selection": (v: Row | Row[] | null) => void;
    "update:first": (v: number) => void;
    "update:rows": (v: number) => void;
    "update:sortField": (v: string | undefined) => void;
    "update:sortOrder": (v: SortOrder) => void;
    "update:multiSortMeta": (v: SortMeta[]) => void;
    "row-select": (payload: {
        data: Row;
        index: number;
    }) => void;
    "row-unselect": (payload: {
        data: Row;
        index: number;
    }) => void;
    "row-click": (payload: {
        data: Row;
        index: number;
        event: MouseEvent;
    }) => void;
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
    "update:frozenValue": (v: Row[]) => void;
    "row-freeze": (payload: {
        data: Row;
    }) => void;
    "row-unfreeze": (payload: {
        data: Row;
    }) => void;
    "update:expandedRows": (v: Row[]) => void;
    "row-expand": (payload: {
        data: Row;
    }) => void;
    "row-collapse": (payload: {
        data: Row;
    }) => void;
    "update:filters": (v: FilterModel) => void;
    filter: (payload: {
        filters: FilterModel;
        filteredValue: Row[];
    }) => void;
    "update:expandedRowGroups": (v: string[]) => void;
    "rowgroup-expand": (payload: {
        key: string;
    }) => void;
    "rowgroup-collapse": (payload: {
        key: string;
    }) => void;
    "update:editingRows": (v: Row[]) => void;
    "cell-edit-init": (payload: {
        data: Row;
        field: string;
        value: unknown;
    }) => void;
    "cell-edit-complete": (payload: {
        data: Row;
        field: string;
        value: unknown;
        newValue: unknown;
    }) => void;
    "cell-edit-cancel": (payload: {
        data: Row;
        field: string;
    }) => void;
    "row-edit-init": (payload: {
        data: Row;
        index: number;
    }) => void;
    "row-edit-cancel": (payload: {
        data: Row;
        index: number;
    }) => void;
    "row-edit-save": (payload: {
        data: Row;
        newData: Row;
        index: number;
    }) => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onSort?: ((payload: {
        sortField?: string;
        sortOrder: SortOrder;
        multiSortMeta: SortMeta[];
    }) => any) | undefined;
    onFilter?: ((payload: {
        filters: FilterModel;
        filteredValue: Row[];
    }) => any) | undefined;
    "onUpdate:selection"?: ((v: Row | Row[] | null) => any) | undefined;
    "onUpdate:first"?: ((v: number) => any) | undefined;
    "onUpdate:rows"?: ((v: number) => any) | undefined;
    onPage?: ((payload: {
        first: number;
        rows: number;
        page: number;
    }) => any) | undefined;
    "onUpdate:columnState"?: ((v: ColumnState) => any) | undefined;
    "onColumn-resize"?: ((payload: {
        field: string;
        width?: number;
    }) => any) | undefined;
    "onColumn-reorder"?: ((payload: {
        field: string;
        fromIndex: number;
        toIndex: number;
    }) => any) | undefined;
    "onColumn-toggle"?: ((payload: {
        field: string;
        hidden: boolean;
    }) => any) | undefined;
    "onUpdate:sortField"?: ((v: string | undefined) => any) | undefined;
    "onUpdate:sortOrder"?: ((v: SortOrder) => any) | undefined;
    "onUpdate:multiSortMeta"?: ((v: SortMeta[]) => any) | undefined;
    "onRow-select"?: ((payload: {
        data: Row;
        index: number;
    }) => any) | undefined;
    "onRow-unselect"?: ((payload: {
        data: Row;
        index: number;
    }) => any) | undefined;
    "onRow-click"?: ((payload: {
        data: Row;
        index: number;
        event: MouseEvent;
    }) => any) | undefined;
    "onUpdate:frozenValue"?: ((v: Row[]) => any) | undefined;
    "onRow-freeze"?: ((payload: {
        data: Row;
    }) => any) | undefined;
    "onRow-unfreeze"?: ((payload: {
        data: Row;
    }) => any) | undefined;
    "onUpdate:expandedRows"?: ((v: Row[]) => any) | undefined;
    "onRow-expand"?: ((payload: {
        data: Row;
    }) => any) | undefined;
    "onRow-collapse"?: ((payload: {
        data: Row;
    }) => any) | undefined;
    "onUpdate:filters"?: ((v: FilterModel) => any) | undefined;
    "onUpdate:expandedRowGroups"?: ((v: string[]) => any) | undefined;
    "onRowgroup-expand"?: ((payload: {
        key: string;
    }) => any) | undefined;
    "onRowgroup-collapse"?: ((payload: {
        key: string;
    }) => any) | undefined;
    "onUpdate:editingRows"?: ((v: Row[]) => any) | undefined;
    "onCell-edit-init"?: ((payload: {
        data: Row;
        field: string;
        value: unknown;
    }) => any) | undefined;
    "onCell-edit-complete"?: ((payload: {
        data: Row;
        field: string;
        value: unknown;
        newValue: unknown;
    }) => any) | undefined;
    "onCell-edit-cancel"?: ((payload: {
        data: Row;
        field: string;
    }) => any) | undefined;
    "onRow-edit-init"?: ((payload: {
        data: Row;
        index: number;
    }) => any) | undefined;
    "onRow-edit-cancel"?: ((payload: {
        data: Row;
        index: number;
    }) => any) | undefined;
    "onRow-edit-save"?: ((payload: {
        data: Row;
        newData: Row;
        index: number;
    }) => any) | undefined;
}>, {
    size: "small" | "normal" | "large";
    rows: number;
    selectionMode: "single" | "multiple" | "checkbox" | "radio" | null;
    first: number;
    maxConstraints: number;
    gridLines: "none" | "both" | "horizontal" | "vertical";
    gridLineSize: number;
    striped: boolean;
    bordered: boolean;
    metaKeySelection: boolean;
    sortMode: "single" | "multiple";
    removableSort: boolean;
    paginatorTemplate: string;
    editMode: "cell" | "row" | null;
    commitEdits: boolean;
    filterDisplay: "row" | "menu" | null;
    globalFilterPlaceholder: string;
    rowGroupMode: "subheader" | "rowspan";
    expandIcon: string;
    collapseIcon: string;
    freezeIcon: string;
    unfreezeIcon: string;
    footerMode: "all" | "selected" | "both";
    loadingMode: "overlay" | "skeleton";
    skeletonRows: number;
    hoverable: boolean;
    columnResizeMode: "fit" | "expand";
    columnToggleLabel: string;
    stateStorage: "local" | "session";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
