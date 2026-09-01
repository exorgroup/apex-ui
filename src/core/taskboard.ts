/**
 * Task board core — types, grouping, and an optional store.
 *
 * The board never owns its data: `items` is a flat array the app holds, and every
 * interaction emits a payload describing the change. A flat array is what makes
 * that cheap — a move changes one field on one object, where nested column arrays
 * would mean two splices and a rebuild of both columns. It also leaves filtering
 * and sorting entirely to the app, with no restructuring on the way in.
 */
import { computed, ref, type Ref } from 'vue';

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
  meta?: { key: string; icon?: string; label?: string }[];
}

export const DEFAULT_CARD_FIELDS: TaskCardFields = {
  title: 'title',
  labels: 'labels',
  priority: 'priority',
  assignees: 'assignees',
  checklist: 'checklist',
  due: 'due',
  description: 'description',
};

export function cellKey(columnId: string, swimlaneId?: string) {
  return `${swimlaneId ?? '_'}::${columnId}`;
}

/**
 * Grouped once per data change, so rendering a column is a lookup rather than a
 * scan of every item — the difference that decides whether a large board is
 * usable at all.
 */
export function groupItems(items: TaskBoardItem[]) {
  const map = new Map<string, TaskBoardItem[]>();
  items.forEach((item) => {
    const key = cellKey(item.columnId, item.swimlaneId);
    const list = map.get(key);
    if (list) list.push(item);
    else map.set(key, [item]);
  });
  map.forEach((list) => list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
  return map;
}

/**
 * Applies a move to a copy of the array and renumbers the two affected cells.
 * Exported so an app can reuse the same logic its own store needs, rather than
 * reimplementing index arithmetic that has to match the board's.
 */
export function applyMove(items: TaskBoardItem[], move: TaskBoardMove): TaskBoardItem[] {
  const moving = new Set(move.items.map((i) => i.id));
  const next = items.map((i) => (moving.has(i.id)
    ? { ...i, columnId: move.to.columnId, swimlaneId: move.to.swimlaneId }
    : i));

  const target = next.filter((i) => i.columnId === move.to.columnId
    && (i.swimlaneId ?? undefined) === (move.to.swimlaneId ?? undefined));
  const dragged = target.filter((i) => moving.has(i.id));
  const rest = target.filter((i) => !moving.has(i.id));
  const at = Math.max(0, Math.min(move.to.index, rest.length));
  const ordered = [...rest.slice(0, at), ...dragged, ...rest.slice(at)];
  ordered.forEach((item, i) => { item.order = i; });

  /* the source cell is renumbered too, or its gaps outlive the move */
  if (move.from.columnId !== move.to.columnId
    || (move.from.swimlaneId ?? undefined) !== (move.to.swimlaneId ?? undefined)) {
    next.filter((i) => i.columnId === move.from.columnId
      && (i.swimlaneId ?? undefined) === (move.from.swimlaneId ?? undefined))
      .forEach((item, i) => { item.order = i; });
  }
  return next;
}

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
  canDrop?: (payload: { item: TaskBoardItem; columnId: string; swimlaneId?: string }) => boolean;
  /** Hides the add control where creation is not allowed. */
  canCreate?: (cell: { columnId: string; swimlaneId?: string }) => boolean;
  /** Gates activation, so a read-only card cannot open an editor. */
  canEdit?: (item: TaskBoardItem) => boolean;
  /** Not a board action — passed to your card and menu so there is one source of truth. */
  canDelete?: (item: TaskBoardItem) => boolean;
  canReorderColumns?: boolean;
}

/** True when the board's rules permit this move. */
export function canMove(columns: TaskBoardColumn[], from: string, to: string) {
  const source = columns.find((c) => c.id === from);
  if (!source) return true;
  if (source.locked && from !== to) return false;
  if (!source.allowedTo) return true;
  return from === to || source.allowedTo.includes(to);
}

/**
 * Optional store. The board works without it — this is for callers who want a
 * working board immediately and will add persistence later. Undo lives here
 * rather than in the component because it is a stack of the payloads the
 * component already emits, and a component-owned history would fight an app
 * that has its own.
 */
export function useApexTaskBoard(initial: TaskBoardItem[] = []) {
  const items = ref<TaskBoardItem[]>([...initial]) as Ref<TaskBoardItem[]>;
  const past = ref<TaskBoardItem[][]>([]);
  const future = ref<TaskBoardItem[][]>([]);

  function commit(next: TaskBoardItem[]) {
    past.value.push(items.value);
    future.value = [];
    items.value = next;
  }

  return {
    items,
    canUndo: computed(() => past.value.length > 0),
    canRedo: computed(() => future.value.length > 0),
    move(payload: TaskBoardMove) { commit(applyMove(items.value, payload)); },
    add(item: TaskBoardItem) { commit([...items.value, item]); },
    update(id: TaskBoardItem['id'], patch: Partial<TaskBoardItem>) {
      commit(items.value.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    },
    remove(id: TaskBoardItem['id']) { commit(items.value.filter((i) => i.id !== id)); },
    undo() {
      const prev = past.value.pop();
      if (!prev) return;
      future.value.push(items.value);
      items.value = prev;
    },
    redo() {
      const next = future.value.pop();
      if (!next) return;
      past.value.push(items.value);
      items.value = next;
    },
  };
}
