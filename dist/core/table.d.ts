/**
 * Data pipeline for ApexDataTable: field access, formula columns, comparison,
 * sorting, filtering, grouping and aggregation.
 *
 * Everything here is a pure function over plain arrays, so the component can
 * run the whole pipeline inside computeds. The order is always
 * filter → sort → group → window, which keeps large sets to one pass each.
 */
export type SortOrder = 1 | -1 | 0;
export type ColumnAlign = 'start' | 'center' | 'end';
export type FilterMatchMode = 'startsWith' | 'contains' | 'notContains' | 'endsWith' | 'equals' | 'notEquals' | 'in' | 'lt' | 'lte' | 'gt' | 'gte' | 'between' | 'dateIs' | 'dateIsNot' | 'dateBefore' | 'dateAfter';
export interface FilterConstraint {
    value: unknown;
    matchMode: FilterMatchMode;
}
export interface FilterMeta {
    /** A single constraint, or several joined by `operator`. */
    value?: unknown;
    matchMode?: FilterMatchMode;
    operator?: 'and' | 'or';
    constraints?: FilterConstraint[];
}
export type FilterModel = Record<string, FilterMeta>;
export type AggregateFn = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'distinct';
export interface ColumnDef {
    field?: string;
    header?: string;
    /** Fixed width, e.g. '180px' or '14rem'. */
    width?: string;
    minWidth?: string;
    align?: ColumnAlign;
    sortable?: boolean;
    /** Column is filterable, and how its editor should behave. */
    filter?: boolean;
    filterType?: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'boolean';
    filterOptions?: Array<{
        value: unknown;
        label: string;
    }>;
    filterMatchMode?: FilterMatchMode;
    /** Pin during horizontal scroll. */
    frozen?: boolean;
    alignFrozen?: 'left' | 'right';
    /** Hide without removing from the model — drives the column toggle. */
    hidden?: boolean;
    /** Never offered in the column toggle. */
    fixed?: boolean;
    resizable?: boolean;
    reorderable?: boolean;
    editable?: boolean;
    editorType?: 'text' | 'number' | 'select' | 'date' | 'switch' | 'textarea';
    editorOptions?: Array<{
        value: unknown;
        label: string;
    }>;
    /** For format: 'image' — the rendered thumbnail. */
    imageSize?: number;
    imageRadius?: string;
    /** Field holding the alt text, or a literal. */
    imageAlt?: string;
    /** Second line under an image or text cell, e.g. a SKU. */
    subField?: string;
    /** Cell display format. */
    format?: 'text' | 'number' | 'currency' | 'percent' | 'date' | 'datetime' | 'badge' | 'rating' | 'boolean' | 'image';
    currency?: string;
    precision?: number;
    dateFormat?: string;
    /** Spreadsheet-style formula over sibling fields, e.g. '=qty*price/1.5'. */
    formula?: string;
    /** Footer aggregate for this column. */
    aggregate?: AggregateFn;
    /** Per-group aggregate when grouping is on. Defaults to `aggregate`. */
    groupAggregate?: AggregateFn;
    /** Column-level colours. */
    color?: string;
    background?: string;
    headerBackground?: string;
    /** Extra class on every body cell. */
    cellClass?: string | ((row: Record<string, unknown>) => string | undefined);
    /** Column type flags used by the shell. */
    type?: 'data' | 'selection' | 'expander' | 'rowEditor' | 'reorder';
    /** Badge tone map, for format: 'badge'. */
    badgeTones?: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'>;
}
export interface SortMeta {
    field: string;
    order: SortOrder;
}
/** Dotted-path read. */
export declare function getField(row: Record<string, unknown> | undefined, path?: string): unknown;
/** Dotted-path write, creating intermediate objects. */
export declare function setField(row: Record<string, unknown>, path: string, value: unknown): void;
export declare function evalFormula(formula: string, row: Record<string, unknown>): number | null;
/** The displayed value for a cell, formula columns included. */
export declare function cellValue(row: Record<string, unknown>, col: ColumnDef): unknown;
export declare function sortRows(rows: Record<string, unknown>[], meta: SortMeta[], columns: ColumnDef[]): Record<string, unknown>[];
/** Cycles a header through ascending → descending → unsorted (or back to ascending). */
export declare function nextOrder(current: SortOrder, removable: boolean): SortOrder;
export declare function matches(value: unknown, filter: unknown, mode: FilterMatchMode): boolean;
export declare function filterRows(rows: Record<string, unknown>[], filters: FilterModel, columns: ColumnDef[], globalFields?: string[]): Record<string, unknown>[];
export declare function aggregate(rows: Record<string, unknown>[], col: ColumnDef, fn?: AggregateFn): number | null;
export interface RowGroup {
    key: string;
    value: unknown;
    rows: Record<string, unknown>[];
    /** Index of this group's first row in the flat, sorted list. */
    start: number;
}
export declare function groupRows(rows: Record<string, unknown>[], field?: string): RowGroup[];
export declare function formatCell(value: unknown, col: ColumnDef, locale?: string): string;
