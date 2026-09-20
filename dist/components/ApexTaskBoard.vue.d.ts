import type { ApexBoardProps } from '../types';
import { type TaskBoardColumn, type TaskBoardItem, type TaskBoardMove, type TaskBoardColumnGroup, type TaskBoardPermissions, type TaskBoardSwimlane, type TaskCardFields } from '../core/taskboard';
type __VLS_Props = ApexBoardProps & {
    items?: TaskBoardItem[];
    columns?: TaskBoardColumn[];
    /** Omit for a plain column board; provide lanes for a grouped one. */
    swimlanes?: TaskBoardSwimlane[];
    /** Phase headers above the columns, for a larger delivery board. */
    columnGroups?: TaskBoardColumnGroup[];
    /** Let column headers be dragged to reorder. The app owns the columns array. */
    reorderableColumns?: boolean;
    /**
     * Asked before a move is emitted. Returning false — or a promise resolving to
     * false — abandons it. Async so a confirmation dialog or a server check can
     * answer, which a synchronous guard could not.
     */
    confirmMove?: (payload: TaskBoardMove) => boolean | Promise<boolean>;
    /** Access rules — see TaskBoardPermissions. Everything is permitted by default. */
    permissions?: TaskBoardPermissions;
    /**
     * Render only the cards near each cell's viewport. The cells become the
     * vertical scrollers, so this is a column-board feature: with swimlanes the
     * lanes need the board's own vertical scroll, and it is ignored.
     */
    virtualScroll?: boolean;
    /** Starting estimate. Real heights are measured once cards render. */
    virtualScrollItemHeight?: number;
    /** Rows kept beyond the viewport. Larger is smoother, smaller is less DOM. */
    virtualScrollBuffer?: number;
    /** Which item property feeds each part of the default card. */
    cardFields?: TaskCardFields;
    draggable?: boolean;
    selectionMode?: 'none' | 'single' | 'multiple';
    /** Over a column's limit: warn, or refuse the drop. */
    wipMode?: 'warn' | 'block';
    showCounts?: boolean;
    showAddCard?: boolean;
    collapsibleColumns?: boolean;
    columnWidth?: string;
    laneWidth?: string;
    gap?: string;
    height?: string;
    density?: 'compact' | 'normal' | 'roomy';
    background?: string;
    columnBackground?: string;
    cardBackground?: string;
    cardRadius?: string;
    accent?: string;
};
declare function selectAll(columnId: string, swimlaneId?: string): void;
declare function clearSelection(): void;
type __VLS_Slots = {
    card?: (props: {
        item: TaskBoardItem;
        selected: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canDrag: boolean;
    }) => unknown;
    'column-header'?: (props: {
        column: TaskBoardColumn;
        count: number;
        over: boolean;
    }) => unknown;
    'column-footer'?: (props: {
        column: TaskBoardColumn;
    }) => unknown;
    'swimlane-header'?: (props: {
        swimlane: TaskBoardSwimlane;
        count: number;
    }) => unknown;
    empty?: (props: {
        column: TaskBoardColumn;
        swimlane?: TaskBoardSwimlane;
    }) => unknown;
    'drag-preview'?: (props: {
        items: TaskBoardItem[];
        count: number;
    }) => unknown;
};
/**
 * State worth persisting and nothing more: collapse, lane closure, selection and
 * scroll offsets. Deliberately no rendered geometry or measured heights — those
 * belong to this session's DOM and restoring them into a different viewport
 * produces a board scrolled somewhere that no longer exists.
 */
declare function getState(): {
    collapsedColumns: string[];
    closedSwimlanes: string[];
    selection: (string | number)[];
    boardScroll: number;
    cellScroll: Record<string, number>;
};
declare function setState(state: ReturnType<typeof getState> | null | undefined): void;
/** Export reflects what the board is showing, columns and lanes resolved to titles. */
declare function exportRows(): {
    id: string | number;
    title: {};
    column: string;
    swimlane: string;
    order: number;
    priority: {};
    assignees: string;
    labels: string;
    due: {};
}[];
declare function exportJson(): string;
declare function exportCsv(): string;
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    clearSelection: typeof clearSelection;
    selectAll: typeof selectAll;
    getState: typeof getState;
    setState: typeof setState;
    exportJson: typeof exportJson;
    exportCsv: typeof exportCsv;
    exportRows: typeof exportRows;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    "column-reorder": (payload: {
        columnId: string;
        fromIndex: number;
        toIndex: number;
    }) => any;
    "selection-change": (payload: {
        items: TaskBoardItem[];
    }) => any;
    "card-move": (payload: TaskBoardMove) => any;
    "card-click": (payload: {
        item: TaskBoardItem;
        originalEvent: MouseEvent;
    }) => any;
    "card-activate": (payload: {
        item: TaskBoardItem;
    }) => any;
    "card-contextmenu": (payload: {
        item: TaskBoardItem;
        originalEvent: MouseEvent;
    }) => any;
    "add-card": (payload: {
        columnId: string;
        swimlaneId?: string;
    }) => any;
    "column-collapse": (payload: {
        columnId: string;
        collapsed: boolean;
    }) => any;
    "wip-blocked": (payload: {
        columnId: string;
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onColumn-reorder"?: ((payload: {
        columnId: string;
        fromIndex: number;
        toIndex: number;
    }) => any) | undefined;
    "onSelection-change"?: ((payload: {
        items: TaskBoardItem[];
    }) => any) | undefined;
    "onCard-move"?: ((payload: TaskBoardMove) => any) | undefined;
    "onCard-click"?: ((payload: {
        item: TaskBoardItem;
        originalEvent: MouseEvent;
    }) => any) | undefined;
    "onCard-activate"?: ((payload: {
        item: TaskBoardItem;
    }) => any) | undefined;
    "onCard-contextmenu"?: ((payload: {
        item: TaskBoardItem;
        originalEvent: MouseEvent;
    }) => any) | undefined;
    "onAdd-card"?: ((payload: {
        columnId: string;
        swimlaneId?: string;
    }) => any) | undefined;
    "onColumn-collapse"?: ((payload: {
        columnId: string;
        collapsed: boolean;
    }) => any) | undefined;
    "onWip-blocked"?: ((payload: {
        columnId: string;
    }) => any) | undefined;
}>, {
    selectionMode: "none" | "single" | "multiple";
    draggable: boolean;
    gap: string;
    columnWidth: string;
    virtualScrollItemHeight: number;
    virtualScrollBuffer: number;
    wipMode: "warn" | "block";
    showCounts: boolean;
    showAddCard: boolean;
    collapsibleColumns: boolean;
    laneWidth: string;
    density: "compact" | "normal" | "roomy";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
