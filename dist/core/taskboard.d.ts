/**
 * Task board core — types, grouping, and an optional store.
 *
 * The board never owns its data: `items` is a flat array the app holds, and every
 * interaction emits a payload describing the change. A flat array is what makes
 * that cheap — a move changes one field on one object, where nested column arrays
 * would mean two splices and a rebuild of both columns. It also leaves filtering
 * and sorting entirely to the app, with no restructuring on the way in.
 */
import { type Ref } from 'vue';
export interface TaskBoardColumn {
    id: string;
    title: string;
    /** WIP limit. Over it, the column warns — or blocks, per the board's wipMode. */
    limit?: number;
    collapsed?: boolean;
    /** Cannot be reordered, and cards cannot be dragged out of it. */
    locked?: boolean;
    /** A colour strip above the column, for phase or status. */
    accent?: string;
    /** Columns a card may move to from here. Undefined means anywhere. */
    allowedTo?: string[];
    /** Sticks to an edge while the rest of the board scrolls under it. */
    pinned?: 'start' | 'end';
}
export interface TaskBoardColumnGroup {
    id: string;
    title: string;
    /** The columns under this phase header, in board order. */
    columnIds: string[];
    accent?: string;
}
export interface TaskBoardSwimlane {
    id: string;
    title: string;
    icon?: string;
    collapsed?: boolean;
}
export interface TaskBoardItem {
    id: string | number;
    columnId: string;
    swimlaneId?: string;
    /** Position within its cell. Absent means input order. */
    order?: number;
    [key: string]: unknown;
}
export interface TaskBoardCell {
    columnId: string;
    swimlaneId?: string;
    index: number;
}
export interface TaskBoardMove {
    items: TaskBoardItem[];
    from: TaskBoardCell;
    to: TaskBoardCell;
}
/**
 * Which item property feeds each part of the default card. A mapping rather than
 * a fixed shape: any dataset renders without writing a custom card, and a field
 * left out simply does not appear.
 */
export interface TaskCardFields {
    title?: string;
    labels?: string;
    priority?: string;
    assignees?: string;
    checklist?: string;
    due?: string;
    description?: string;
    /** Extra chips, in order: { key, icon?, label? }. */
    meta?: {
        key: string;
        icon?: string;
        label?: string;
    }[];
}
export declare const DEFAULT_CARD_FIELDS: TaskCardFields;
export declare function cellKey(columnId: string, swimlaneId?: string): string;
/**
 * Grouped once per data change, so rendering a column is a lookup rather than a
 * scan of every item — the difference that decides whether a large board is
 * usable at all.
 */
export declare function groupItems(items: TaskBoardItem[]): Map<string, TaskBoardItem[]>;
/**
 * Applies a move to a copy of the array and renumbers the two affected cells.
 * Exported so an app can reuse the same logic its own store needs, rather than
 * reimplementing index arithmetic that has to match the board's.
 */
export declare function applyMove(items: TaskBoardItem[], move: TaskBoardMove): TaskBoardItem[];
/**
 * Access rules. Functions rather than flags, because a real permission depends on
 * the row — this user's own cards, an archived column, a card someone else has
 * locked — and a boolean per board could only ever express the coarsest case.
 * Every rule is optional and defaults to permitted.
 */
export interface TaskBoardPermissions {
    /** Columns removed from the board entirely, not merely emptied. */
    hiddenColumns?: string[];
    canDrag?: (item: TaskBoardItem) => boolean;
    /** Asked per candidate drop, so a column can refuse specific cards. */
    canDrop?: (payload: {
        item: TaskBoardItem;
        columnId: string;
        swimlaneId?: string;
    }) => boolean;
    /** Hides the add control where creation is not allowed. */
    canCreate?: (cell: {
        columnId: string;
        swimlaneId?: string;
    }) => boolean;
    /** Gates activation, so a read-only card cannot open an editor. */
    canEdit?: (item: TaskBoardItem) => boolean;
    /** Not a board action — passed to your card and menu so there is one source of truth. */
    canDelete?: (item: TaskBoardItem) => boolean;
    canReorderColumns?: boolean;
}
/** True when the board's rules permit this move. */
export declare function canMove(columns: TaskBoardColumn[], from: string, to: string): boolean;
/**
 * Optional store. The board works without it — this is for callers who want a
 * working board immediately and will add persistence later. Undo lives here
 * rather than in the component because it is a stack of the payloads the
 * component already emits, and a component-owned history would fight an app
 * that has its own.
 */
export declare function useApexTaskBoard(initial?: TaskBoardItem[]): {
    items: Ref<TaskBoardItem[], TaskBoardItem[]>;
    canUndo: import("vue").ComputedRef<boolean>;
    canRedo: import("vue").ComputedRef<boolean>;
    move(payload: TaskBoardMove): void;
    add(item: TaskBoardItem): void;
    update(id: TaskBoardItem["id"], patch: Partial<TaskBoardItem>): void;
    remove(id: TaskBoardItem["id"]): void;
    undo(): void;
    redo(): void;
};
