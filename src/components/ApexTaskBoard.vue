<script setup lang="ts">
/**
 * ApexTaskBoard — a kanban board over data the application owns.
 *
 * Nothing here mutates `items`. Every interaction emits a payload describing the
 * change, so optimistic update, rollback, undo and multi-user sync stay where
 * they belong. `useApexTaskBoard()` applies those payloads for callers who want a
 * working board today.
 *
 * Dragging is pointer-based rather than HTML5 drag-and-drop. HTML5 DnD gives a
 * free ghost image and nothing else: no touch, no control over the preview, no
 * edge auto-scroll, and inconsistent geometry across browsers. Pointer events
 * cost more code and buy multi-card drag, a real preview, auto-scroll and touch.
 *
 * Keyboard movement emits the same payloads as a drag, so persistence never
 * learns how a card moved — and a drag-only board is unusable without a mouse.
 */
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import ApexIcon from './ApexIcon.vue';
import ApexTaskCard from './ApexTaskCard.vue';
import type { ApexBoardProps } from '../types';
import {
  canMove, cellKey, groupItems, DEFAULT_CARD_FIELDS as DEFAULT_CARD_FIELDS_LOCAL,
  type TaskBoardColumn, type TaskBoardItem, type TaskBoardMove,
  type TaskBoardColumnGroup, type TaskBoardPermissions, type TaskBoardSwimlane, type TaskCardFields,
} from '../core/taskboard';

const props = withDefaults(defineProps<ApexBoardProps & {
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
  /* metrics */
  columnWidth?: string;
  laneWidth?: string;
  gap?: string;
  height?: string;
  density?: 'compact' | 'normal' | 'roomy';
  /* chrome */
  background?: string;
  columnBackground?: string;
  cardBackground?: string;
  cardRadius?: string;
  accent?: string;
}>(), {
  draggable: true, selectionMode: 'single', wipMode: 'warn',
  showCounts: true, showAddCard: true, collapsibleColumns: true,
  columnWidth: '280px', laneWidth: '160px', gap: '14px', density: 'normal',
  virtualScrollItemHeight: 96, virtualScrollBuffer: 4,
});

const emit = defineEmits<{
  (e: 'card-move', payload: TaskBoardMove): void;
  (e: 'card-click', payload: { item: TaskBoardItem; originalEvent: MouseEvent }): void;
  (e: 'card-activate', payload: { item: TaskBoardItem }): void;
  (e: 'card-contextmenu', payload: { item: TaskBoardItem; originalEvent: MouseEvent }): void;
  (e: 'selection-change', payload: { items: TaskBoardItem[] }): void;
  (e: 'add-card', payload: { columnId: string; swimlaneId?: string }): void;
  (e: 'column-collapse', payload: { columnId: string; collapsed: boolean }): void;
  (e: 'wip-blocked', payload: { columnId: string }): void;
  (e: 'column-reorder', payload: { columnId: string; fromIndex: number; toIndex: number }): void;
}>();

const root = ref<HTMLElement | null>(null);
const grouped = computed(() => groupItems(props.items || []));
/* Hidden columns are removed rather than emptied: a column a user may not see
   should not advertise its existence with a count of zero. */
const cols = computed(() => {
  const hidden = props.permissions?.hiddenColumns;
  return hidden?.length
    ? (props.columns || []).filter((c) => !hidden.includes(c.id))
    : (props.columns || []);
});

const may = {
  drag: (item: TaskBoardItem) => props.permissions?.canDrag?.(item) ?? true,
  drop: (item: TaskBoardItem, columnId: string, swimlaneId?: string) =>
    props.permissions?.canDrop?.({ item, columnId, swimlaneId }) ?? true,
  create: (columnId: string, swimlaneId?: string) =>
    props.permissions?.canCreate?.({ columnId, swimlaneId }) ?? true,
  edit: (item: TaskBoardItem) => props.permissions?.canEdit?.(item) ?? true,
  del: (item: TaskBoardItem) => props.permissions?.canDelete?.(item) ?? true,
};
const lanes = computed<(TaskBoardSwimlane | undefined)[]>(() => (props.swimlanes?.length
  ? props.swimlanes : [undefined]));

/* Walked in board order so a phase header spans exactly its columns and any
   ungrouped column keeps a track of its own. A pinned column breaks the run and
   takes a cell of its own, which then pins with it — otherwise the column stays
   put while its label scrolls away and it appears filed under another phase. */
const groupCells = computed(() => {
  const groups = props.columnGroups || [];
  const out: { group?: TaskBoardColumnGroup; span: number; col?: TaskBoardColumn }[] = [];
  let i = 0;
  while (i < cols.value.length) {
    const col = cols.value[i];
    const group = groups.find((g) => g.columnIds.includes(col.id));
    if (col.pinned) { out.push({ group, span: 1, col }); i += 1; continue; }
    if (!group) { out.push({ span: 1 }); i += 1; continue; }
    let span = 0;
    while (i + span < cols.value.length) {
      const next = cols.value[i + span];
      if (next.pinned || !group.columnIds.includes(next.id)) break;
      span += 1;
    }
    out.push({ group, span });
    i += span;
  }
  return out;
});

/* A pinned column needs a resolved inset, since sticky cannot know how wide the
   tracks before it are. */
const pinOffsets = computed(() => {
  const map = new Map<string, string>();
  const inset = (parts: string[]) => (parts.length
    ? `calc(${parts.join(' + ')} + ${props.gap} * ${parts.length})`
    : '0px');
  const width = (c: TaskBoardColumn) => (collapsed.value.has(c.id) ? '46px' : props.columnWidth);

  const starts: string[] = props.swimlanes?.length ? [props.laneWidth] : [];
  cols.value.forEach((c) => {
    if (c.pinned !== 'start') return;
    map.set(c.id, inset(starts));
    starts.push(width(c));
  });
  const ends: string[] = [];
  [...cols.value].reverse().forEach((c) => {
    if (c.pinned !== 'end') return;
    map.set(c.id, inset(ends));
    ends.push(width(c));
  });
  return map;
});
function pinStyle(col: TaskBoardColumn) {
  const inset = pinOffsets.value.get(col.id);
  if (!inset) return undefined;
  return col.pinned === 'end'
    ? { position: 'sticky', insetInlineEnd: inset, zIndex: '2' }
    : { position: 'sticky', insetInlineStart: inset, zIndex: '2' };
}

/* ── header reorder: the app owns the array, so this only reports ── */
const headDrag = ref<{ columnId: string; fromIndex: number } | null>(null);
const headOver = ref<number | null>(null);
function onHeadDown(e: PointerEvent, col: TaskBoardColumn, index: number) {
  if (!props.reorderableColumns || col.locked || e.button !== 0) return;
  if (props.permissions?.canReorderColumns === false) return;
  if ((e.target as HTMLElement).closest('button')) return;
  headDrag.value = { columnId: col.id, fromIndex: index };
  window.addEventListener('pointermove', onHeadMove);
  window.addEventListener('pointerup', onHeadUp);
}
function onHeadMove(e: PointerEvent) {
  const head = (document.elementsFromPoint(e.clientX, e.clientY) as HTMLElement[])
    .find((el) => el.dataset && el.dataset.kbHead);
  headOver.value = head ? Number(head.dataset.kbHead) : null;
}
function onHeadUp() {
  const from = headDrag.value;
  const to = headOver.value;
  if (from && to !== null && to !== from.fromIndex) {
    emit('column-reorder', { columnId: from.columnId, fromIndex: from.fromIndex, toIndex: to });
  }
  headDrag.value = null;
  headOver.value = null;
  window.removeEventListener('pointermove', onHeadMove);
  window.removeEventListener('pointerup', onHeadUp);
}

const collapsed = ref(new Set<string>((props.columns || []).filter((c) => c.collapsed).map((c) => c.id)));
const laneClosed = ref(new Set<string>((props.swimlanes || []).filter((l) => l.collapsed).map((l) => l.id)));

function cards(columnId: string, swimlaneId?: string) {
  return grouped.value.get(cellKey(columnId, swimlaneId)) || [];
}
function columnCount(columnId: string) {
  return (props.items || []).filter((i) => i.columnId === columnId).length;
}
function over(col: TaskBoardColumn) {
  return col.limit !== undefined && columnCount(col.id) > col.limit;
}

/* ─── virtual scroll ────────────────────────────────────── */
/**
 * Windowed per cell rather than per board: each cell is its own scroller, and a
 * board-wide window would have to assume every column scrolls together.
 *
 * The estimate is replaced by a real measurement as soon as one card has
 * rendered, since a guessed height that is wrong by a third makes the window
 * either short (blank gaps) or wasteful.
 */
const virtual = computed(() => props.virtualScroll && !props.swimlanes?.length);
const cellView = ref(new Map<string, { top: number; height: number }>());
const measured = ref(0);
const rowHeight = computed(() => measured.value || props.virtualScrollItemHeight);

function onCellScroll(e: Event, key: string) {
  if (!virtual.value) return;
  const el = e.currentTarget as HTMLElement;
  const next = new Map(cellView.value);
  next.set(key, { top: el.scrollTop, height: el.clientHeight });
  cellView.value = next;
}

function measureOnce() {
  if (measured.value || !virtual.value) return;
  const card = root.value?.querySelector<HTMLElement>('[data-kb-card]');
  if (!card) return;
  const gap = parseFloat(getComputedStyle(card.parentElement as HTMLElement).rowGap) || 9;
  measured.value = card.offsetHeight + gap;
}
onMounted(() => nextTick(measureOnce));
watch(() => props.items, () => nextTick(measureOnce));

/** The slice to render, plus the padding that keeps the scrollbar honest. */
function windowFor(key: string, total: number) {
  if (!virtual.value) return { start: 0, end: total, padTop: 0, padBottom: 0 };
  const view = cellView.value.get(key) || { top: 0, height: 480 };
  const h = rowHeight.value;
  const buffer = props.virtualScrollBuffer;
  const start = Math.max(0, Math.floor(view.top / h) - buffer);
  const end = Math.min(total, Math.ceil((view.top + view.height) / h) + buffer);
  return { start, end, padTop: start * h, padBottom: Math.max(0, (total - end) * h) };
}

/* ─── selection ─────────────────────────────────────────── */
const selected = ref<(string | number)[]>([]);
const isSelected = (item: TaskBoardItem) => selected.value.includes(item.id);
/** The last click, so Shift can extend from it rather than from the array's start. */
const anchor = ref<TaskBoardItem | null>(null);

function emitSelection() {
  emit('selection-change', { items: (props.items || []).filter((i) => selected.value.includes(i.id)) });
}

function select(item: TaskBoardItem, e: MouseEvent) {
  if (props.selectionMode === 'none') return;
  const multi = props.selectionMode === 'multiple';
  if (multi && e.shiftKey && anchor.value) {
    /* A range runs down the anchor's own cell: a board has no single sequence, so
       extending across columns would select cards the user cannot see between. */
    const list = cards(anchor.value.columnId, anchor.value.swimlaneId);
    const a = list.findIndex((i) => i.id === anchor.value!.id);
    const b = list.findIndex((i) => i.id === item.id);
    if (a > -1 && b > -1) {
      const [lo, hi] = a < b ? [a, b] : [b, a];
      selected.value = list.slice(lo, hi + 1).map((i) => i.id);
      emitSelection();
      return;
    }
  }
  if (multi && (e.metaKey || e.ctrlKey)) {
    selected.value = isSelected(item)
      ? selected.value.filter((id) => id !== item.id)
      : [...selected.value, item.id];
  } else {
    selected.value = isSelected(item) && selected.value.length === 1 ? [] : [item.id];
  }
  anchor.value = item;
  emitSelection();
}

function selectAll(columnId: string, swimlaneId?: string) {
  if (props.selectionMode !== 'multiple') return;
  selected.value = cards(columnId, swimlaneId).map((i) => i.id);
  emitSelection();
}
function clearSelection() {
  selected.value = [];
  anchor.value = null;
  emitSelection();
}

/* ─── dragging ──────────────────────────────────────────── */
interface DragState {
  items: TaskBoardItem[];
  from: { columnId: string; swimlaneId?: string; index: number };
  width: number;
  offsetX: number;
  offsetY: number;
  html: string;
}
const drag = ref<DragState | null>(null);
const pointer = ref({ x: 0, y: 0 });
const target = ref<{ columnId: string; swimlaneId?: string; index: number; blocked: boolean } | null>(null);
let pending: { item: TaskBoardItem; el: HTMLElement; x: number; y: number } | null = null;
let scrollRaf: number | null = null;

function onPointerDown(e: PointerEvent, item: TaskBoardItem, index: number) {
  if (!props.draggable || e.button !== 0) return;
  if (!may.drag(item)) return;
  if ((e.target as HTMLElement).closest('button,a,input,select,textarea')) return;
  pending = { item, el: e.currentTarget as HTMLElement, x: e.clientX, y: e.clientY };
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('keydown', onDragKey, true);
}

function beginDrag(e: PointerEvent) {
  if (!pending) return;
  const { item, el } = pending;
  const rect = el.getBoundingClientRect();
  /* a selected card drags its whole selection; an unselected one drags alone */
  const group = isSelected(item) && selected.value.length > 1
    ? (props.items || []).filter((i) => selected.value.includes(i.id))
    : [item];
  drag.value = {
    items: group,
    from: { columnId: item.columnId, swimlaneId: item.swimlaneId, index },
    width: rect.width,
    offsetX: pending.x - rect.left,
    offsetY: pending.y - rect.top,
    html: el.innerHTML,
  };
  document.body.style.userSelect = 'none';
  scrollRaf = requestAnimationFrame(autoScroll);
}

function onPointerMove(e: PointerEvent) {
  pointer.value = { x: e.clientX, y: e.clientY };
  if (!drag.value) {
    if (!pending) return;
    if (Math.hypot(e.clientX - pending.x, e.clientY - pending.y) < 5) return;
    beginDrag(e);
  }
  measureTarget(e.clientX, e.clientY);
}

/** The drop cell and index, read from live rects — the only source that is right. */
function measureTarget(x: number, y: number) {
  const cell = (document.elementsFromPoint(x, y) as HTMLElement[])
    .find((el) => el.dataset && el.dataset.kbCell);
  if (!cell) { target.value = null; return; }
  const columnId = cell.dataset.kbColumn as string;
  const swimlaneId = cell.dataset.kbLane || undefined;
  const moving = new Set(drag.value?.items.map((i) => i.id));
  const nodes = (Array.from(cell.querySelectorAll('[data-kb-card]')) as HTMLElement[])
    .filter((n) => !moving.has(n.dataset.kbCard as string) && !moving.has(Number(n.dataset.kbCard)));
  let index = nodes.length;
  for (let i = 0; i < nodes.length; i += 1) {
    const r = nodes[i].getBoundingClientRect();
    if (y < r.top + r.height / 2) { index = i; break; }
  }
  const from = drag.value?.from.columnId || columnId;
  const col = (props.columns || []).find((c) => c.id === columnId);
  const wipFull = props.wipMode === 'block' && col?.limit !== undefined
    && columnId !== from && columnCount(columnId) >= col.limit;
  const denied = drag.value?.items.some((i) => !may.drop(i, columnId, swimlaneId));
  const blocked = !canMove(props.columns || [], from, columnId) || !!wipFull || !!denied;
  target.value = { columnId, swimlaneId, index, blocked };
}

/** Nudges the board horizontally and the cell vertically near the edges. */
function autoScroll() {
  const el = root.value;
  if (drag.value && el) {
    const r = el.getBoundingClientRect();
    const { x, y } = pointer.value;
    const edge = 56;
    if (x - r.left < edge) el.scrollLeft -= 14;
    else if (r.right - x < edge) el.scrollLeft += 14;
    const cell = (document.elementsFromPoint(x, y) as HTMLElement[])
      .find((n) => n.dataset && n.dataset.kbCell);
    if (cell) {
      const cr = cell.getBoundingClientRect();
      if (y - cr.top < edge) cell.scrollTop -= 10;
      else if (cr.bottom - y < edge) cell.scrollTop += 10;
    }
    scrollRaf = requestAnimationFrame(autoScroll);
  } else if (scrollRaf) {
    cancelAnimationFrame(scrollRaf);
    scrollRaf = null;
  }
}

/**
 * Every move leaves through here, so a guard, a rule and the payload shape are
 * stated once rather than in each input path.
 */
async function requestMove(payload: TaskBoardMove) {
  if (!canMove(props.columns || [], payload.from.columnId, payload.to.columnId)) return;
  if (props.confirmMove) {
    const ok = await props.confirmMove(payload);
    if (!ok) return;
  }
  emit('card-move', payload);
}

function endDrag(commit: boolean) {
  const state = drag.value;
  const to = target.value;
  if (commit && state && to && !to.blocked) {
    const same = to.columnId === state.from.columnId
      && (to.swimlaneId ?? undefined) === (state.from.swimlaneId ?? undefined);
    if (!same || to.index !== state.from.index) {
      requestMove({
        items: state.items,
        from: state.from,
        to: { columnId: to.columnId, swimlaneId: to.swimlaneId, index: to.index },
      });
    }
  } else if (commit && to?.blocked) {
    emit('wip-blocked', { columnId: to.columnId });
  }
  drag.value = null;
  target.value = null;
  pending = null;
  document.body.style.userSelect = '';
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerup', onPointerUp);
  window.removeEventListener('keydown', onDragKey, true);
}
function onPointerUp() { endDrag(true); }
function onDragKey(e: KeyboardEvent) {
  if (e.key === 'Escape') { e.stopPropagation(); endDrag(false); }
}

const previewStyle = computed(() => (drag.value
  ? {
    inlineSize: drag.value.width + 'px',
    insetInlineStart: pointer.value.x - drag.value.offsetX + 'px',
    insetBlockStart: pointer.value.y - drag.value.offsetY + 'px',
  }
  : undefined));

/* ─── keyboard movement ─────────────────────────────────── */
/** Moves focus without moving the card — plain arrows read, Ctrl moves. */
function rove(from: HTMLElement, dx: number, dy: number) {
  const all = Array.from(root.value?.querySelectorAll<HTMLElement>('[data-kb-card]') || []);
  if (!all.length) return;
  const r = from.getBoundingClientRect();
  const best = all
    .filter((el) => el !== from)
    .map((el) => ({ el, b: el.getBoundingClientRect() }))
    .filter(({ b }) => (dx ? Math.sign(b.left - r.left) === dx : Math.sign(b.top - r.top) === dy))
    .sort((p, q) => (Math.abs(p.b.left - r.left) + Math.abs(p.b.top - r.top))
      - (Math.abs(q.b.left - r.left) + Math.abs(q.b.top - r.top)))[0];
  best?.el.focus();
}

function onCardKey(e: KeyboardEvent, item: TaskBoardItem, index: number) {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (may.edit(item)) emit('card-activate', { item }); return; }
  if (e.key === 'Escape') { clearSelection(); return; }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
    e.preventDefault();
    selectAll(item.columnId, item.swimlaneId);
    return;
  }
  if (!e.ctrlKey && !e.metaKey) {
    const dirs: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
    };
    const d = dirs[e.key];
    if (d) { e.preventDefault(); rove(e.currentTarget as HTMLElement, d[0], d[1]); }
    return;
  }
  const list = props.columns || [];
  const ci = list.findIndex((c) => c.id === item.columnId);
  const laneList = props.swimlanes || [];
  const li = laneList.findIndex((l) => l.id === item.swimlaneId);
  let to: { columnId: string; swimlaneId?: string; index: number } | null = null;

  if (e.key === 'ArrowRight' && ci < list.length - 1) {
    to = { columnId: list[ci + 1].id, swimlaneId: item.swimlaneId, index: cards(list[ci + 1].id, item.swimlaneId).length };
  } else if (e.key === 'ArrowLeft' && ci > 0) {
    to = { columnId: list[ci - 1].id, swimlaneId: item.swimlaneId, index: cards(list[ci - 1].id, item.swimlaneId).length };
  } else if (e.shiftKey && e.key === 'ArrowDown' && li > -1 && li < laneList.length - 1) {
    to = { columnId: item.columnId, swimlaneId: laneList[li + 1].id, index: 0 };
  } else if (e.shiftKey && e.key === 'ArrowUp' && li > 0) {
    to = { columnId: item.columnId, swimlaneId: laneList[li - 1].id, index: 0 };
  } else if (e.key === 'ArrowDown') {
    to = { columnId: item.columnId, swimlaneId: item.swimlaneId, index: index + 2 };
  } else if (e.key === 'ArrowUp' && index > 0) {
    to = { columnId: item.columnId, swimlaneId: item.swimlaneId, index: index - 1 };
  }
  if (!to) return;
  e.preventDefault();
  requestMove({ items: [item], from: { columnId: item.columnId, swimlaneId: item.swimlaneId, index }, to });
}

/* ─── chrome ────────────────────────────────────────────── */
function toggleColumn(col: TaskBoardColumn) {
  const set = new Set(collapsed.value);
  if (set.has(col.id)) set.delete(col.id);
  else set.add(col.id);
  collapsed.value = set;
  emit('column-collapse', { columnId: col.id, collapsed: set.has(col.id) });
}
function toggleLane(lane: TaskBoardSwimlane) {
  const set = new Set(laneClosed.value);
  if (set.has(lane.id)) set.delete(lane.id);
  else set.add(lane.id);
  laneClosed.value = set;
}

const template = computed(() => {
  const tracks = cols.value.map((c) => (collapsed.value.has(c.id) ? '46px' : props.columnWidth));
  return (props.swimlanes?.length ? [props.laneWidth, ...tracks] : tracks).join(' ');
});

const rootStyle = computed(() => {
  const s: Record<string, string> = {
    '--apex-kb-col-w': props.columnWidth,
    '--apex-kb-lane-w': props.laneWidth,
    '--apex-kb-gap': props.gap,
    '--apex-kb-template': template.value,
  };
  if (props.height) s.blockSize = props.height;
  if (props.background) s['--apex-kb-bg'] = props.background;
  if (props.columnBackground) s['--apex-kb-col-bg'] = props.columnBackground;
  if (props.cardBackground) s['--apex-kb-card-bg'] = props.cardBackground;
  if (props.cardRadius) s['--apex-kb-card-radius'] = props.cardRadius;
  if (props.accent) s['--apex-kb-accent'] = props.accent;
  return s;
});

const slots = defineSlots<{
  card?: (props: { item: TaskBoardItem; selected: boolean; canEdit: boolean; canDelete: boolean; canDrag: boolean }) => unknown;
  'column-header'?: (props: { column: TaskBoardColumn; count: number; over: boolean }) => unknown;
  'column-footer'?: (props: { column: TaskBoardColumn }) => unknown;
  'swimlane-header'?: (props: { swimlane: TaskBoardSwimlane; count: number }) => unknown;
  empty?: (props: { column: TaskBoardColumn; swimlane?: TaskBoardSwimlane }) => unknown;
  'drag-preview'?: (props: { items: TaskBoardItem[]; count: number }) => unknown;
}>();

/**
 * State worth persisting and nothing more: collapse, lane closure, selection and
 * scroll offsets. Deliberately no rendered geometry or measured heights — those
 * belong to this session's DOM and restoring them into a different viewport
 * produces a board scrolled somewhere that no longer exists.
 */
function getState() {
  const scroll: Record<string, number> = {};
  root.value?.querySelectorAll<HTMLElement>('[data-kb-cell]').forEach((el) => {
    if (el.scrollTop) scroll[el.dataset.kbCell as string] = el.scrollTop;
  });
  return {
    collapsedColumns: [...collapsed.value],
    closedSwimlanes: [...laneClosed.value],
    selection: [...selected.value],
    boardScroll: root.value?.scrollLeft || 0,
    cellScroll: scroll,
  };
}
function setState(state: ReturnType<typeof getState> | null | undefined) {
  if (!state) return;
  collapsed.value = new Set(state.collapsedColumns || []);
  laneClosed.value = new Set(state.closedSwimlanes || []);
  selected.value = [...(state.selection || [])];
  nextTick(() => {
    if (!root.value) return;
    root.value.scrollLeft = state.boardScroll || 0;
    Object.entries(state.cellScroll || {}).forEach(([key, top]) => {
      const el = root.value?.querySelector<HTMLElement>(`[data-kb-cell="${key}"]`);
      if (el) el.scrollTop = top as number;
    });
    emitSelection();
  });
}

/** Export reflects what the board is showing, columns and lanes resolved to titles. */
function exportRows() {
  const columnTitle = new Map(cols.value.map((c) => [c.id, c.title]));
  const laneTitle = new Map((props.swimlanes || []).map((l) => [l.id, l.title]));
  const fields = { ...DEFAULT_CARD_FIELDS_LOCAL, ...(props.cardFields || {}) };
  return (props.items || [])
    .filter((i) => columnTitle.has(i.columnId))
    .map((i) => ({
      id: i.id,
      title: (fields.title ? i[fields.title] : '') ?? '',
      column: columnTitle.get(i.columnId) ?? i.columnId,
      swimlane: i.swimlaneId ? (laneTitle.get(i.swimlaneId) ?? i.swimlaneId) : '',
      order: i.order ?? 0,
      priority: (fields.priority ? i[fields.priority] : '') ?? '',
      assignees: Array.isArray(i[fields.assignees || '']) ? (i[fields.assignees!] as unknown[]).join('; ') : '',
      labels: Array.isArray(i[fields.labels || '']) ? (i[fields.labels!] as unknown[]).join('; ') : '',
      due: (fields.due ? i[fields.due] : '') ?? '',
    }));
}
function exportJson() { return JSON.stringify(exportRows(), null, 2); }
function exportCsv() {
  const rows = exportRows();
  const head = Object.keys(rows[0] || { id: '', title: '', column: '' });
  /* quotes doubled and every field wrapped: a title with a comma is normal */
  const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [head.join(','), ...rows.map((r) => head.map((k) => cell((r as Record<string, unknown>)[k])).join(','))]
    .join('\n');
}

defineExpose({ clearSelection, selectAll, getState, setState, exportJson, exportCsv, exportRows });
</script>

<template>
  <div ref="root" class="apex-kb" :style="rootStyle" :class="ui?.root" :data-density="density"
       :data-lanes="swimlanes?.length ? 'true' : 'false'"
       :data-dragging="drag ? 'true' : 'false'"
       :data-reorder="reorderableColumns ? 'true' : 'false'"
       :data-virtual="virtual ? 'true' : 'false'">
    <div class="apex-kb__grid" :class="ui?.grid">
      <!-- phase headers, each spanning exactly its own columns -->
      <div v-if="columnGroups?.length" class="apex-kb__groups" :class="ui?.head">
        <div v-if="swimlanes?.length" class="apex-kb__corner"></div>
        <div v-for="(cellSpan, gi) in groupCells" :key="gi" class="apex-kb__group" :class="ui?.group"
             :style="{ gridColumn: 'span ' + cellSpan.span,
                       ...(cellSpan.group?.accent ? { '--apex-kb-accent': cellSpan.group.accent } : {}),
                       ...(cellSpan.col ? pinStyle(cellSpan.col) || {} : {}) }"
             :data-pinned="cellSpan.col?.pinned || 'false'"
             :data-empty="cellSpan.group ? 'false' : 'true'">
          <span v-if="cellSpan.group">{{ cellSpan.group.title }}</span>
        </div>
      </div>
      <!-- column headers, sticky so they survive a tall board -->
      <div class="apex-kb__head" :class="ui?.head">
        <div v-if="swimlanes?.length" class="apex-kb__corner"></div>
        <div v-for="(col, ci) in cols" :key="col.id" class="apex-kb__col-head" :class="ui?.column"
             :data-kb-head="ci"
             :data-collapsed="collapsed.has(col.id) ? 'true' : 'false'"
             :data-pinned="col.pinned || 'false'"
             :data-drag="headDrag?.columnId === col.id ? 'true' : 'false'"
             :data-drop="headOver === ci && headDrag && headDrag.fromIndex !== ci ? 'true' : 'false'"
             :style="{ ...(col.accent ? { '--apex-kb-accent': col.accent } : {}), ...(pinStyle(col) || {}) }"
             @pointerdown="onHeadDown($event, col, ci)">
          <slot name="column-header" :column="col" :count="columnCount(col.id)" :over="over(col)">
            <button v-if="collapsibleColumns" type="button" class="apex-kb__chev"
                    :aria-label="collapsed.has(col.id) ? 'Expand ' + col.title : 'Collapse ' + col.title"
                    @click="toggleColumn(col)">
              <ApexIcon :name="collapsed.has(col.id) ? 'chevron_right' : 'expand_more'" :size="18" />
            </button>
            <span class="apex-kb__col-title" :class="ui?.columnTitle">{{ col.title }}</span>
            <span v-if="showCounts" class="apex-kb__count" :class="ui?.count" :data-over="over(col) ? 'true' : 'false'">
              {{ columnCount(col.id) }}<template v-if="col.limit !== undefined">/{{ col.limit }}</template>
            </span>
            <ApexIcon v-if="over(col)" name="warning" :size="16" class="apex-kb__warn" />
            <ApexIcon v-if="col.locked" name="lock" :size="15" class="apex-kb__lock" />
          </slot>
        </div>
      </div>

      <template v-for="(lane, li) in lanes" :key="lane?.id || li">
        <div class="apex-kb__row" :data-closed="lane && laneClosed.has(lane.id) ? 'true' : 'false'">
          <div v-if="lane" class="apex-kb__lane-head" :class="ui?.lane">
            <slot name="swimlane-header" :swimlane="lane"
                  :count="(items || []).filter((i) => i.swimlaneId === lane.id).length">
              <button type="button" class="apex-kb__chev" :aria-label="'Toggle ' + lane.title"
                      @click="toggleLane(lane)">
                <ApexIcon :name="laneClosed.has(lane.id) ? 'chevron_right' : 'expand_more'" :size="18" />
              </button>
              <ApexIcon v-if="lane.icon" :name="lane.icon" :size="17" class="apex-kb__lane-icon" />
              <span class="apex-kb__lane-title" :class="ui?.laneTitle">{{ lane.title }}</span>
              <span class="apex-kb__count" :class="ui?.count">{{ (items || []).filter((i) => i.swimlaneId === lane.id).length }}</span>
            </slot>
          </div>

          <div v-for="col in cols" :key="col.id" class="apex-kb__cell" :class="ui?.cell"
               :data-kb-cell="cellKey(col.id, lane?.id)" :data-kb-column="col.id" :data-kb-lane="lane?.id || ''"
               @scroll="onCellScroll($event, cellKey(col.id, lane?.id))"
               :data-collapsed="collapsed.has(col.id) ? 'true' : 'false'"
               :data-pinned="col.pinned || 'false'"
               :style="pinStyle(col)"
               :data-target="target && target.columnId === col.id
                 && (target.swimlaneId ?? undefined) === (lane?.id ?? undefined) ? 'true' : 'false'"
               :data-blocked="target?.blocked && target.columnId === col.id ? 'true' : 'false'">
            <template v-if="!collapsed.has(col.id)">
              <div v-if="windowFor(cellKey(col.id, lane?.id), cards(col.id, lane?.id).length).padTop"
                   class="apex-kb__pad"
                   :style="{ blockSize: windowFor(cellKey(col.id, lane?.id), cards(col.id, lane?.id).length).padTop + 'px' }"
                   aria-hidden="true"></div>
              <template v-for="(item, i) in cards(col.id, lane?.id)" :key="item.id">
                <div v-if="target && target.columnId === col.id
                       && (target.swimlaneId ?? undefined) === (lane?.id ?? undefined) && target.index === i"
                     class="apex-kb__ind" :class="ui?.indicator"></div>
                <div v-if="i >= windowFor(cellKey(col.id, lane?.id), cards(col.id, lane?.id).length).start
                       && i < windowFor(cellKey(col.id, lane?.id), cards(col.id, lane?.id).length).end"
                     class="apex-kb__card" :class="ui?.card" :data-kb-card="item.id" tabindex="0"
                     :data-selected="isSelected(item) ? 'true' : 'false'"
                     :data-ghost="drag?.items.some((d) => d.id === item.id) ? 'true' : 'false'"
                     :data-locked="may.drag(item) ? 'false' : 'true'"
                     :data-readonly="may.edit(item) ? 'false' : 'true'"
                     @pointerdown="onPointerDown($event, item, i)"
                     @click="select(item, $event); emit('card-click', { item, originalEvent: $event })"
                     @dblclick="may.edit(item) && emit('card-activate', { item })"
                     @contextmenu="emit('card-contextmenu', { item, originalEvent: $event })"
                     @keydown="onCardKey($event, item, i)">
                  <slot name="card" :item="item" :selected="isSelected(item)"
                        :can-edit="may.edit(item)" :can-delete="may.del(item)" :can-drag="may.drag(item)">
                    <ApexTaskCard :item="item" :fields="cardFields" :selected="isSelected(item)" :ui="ui" />
                  </slot>
                </div>
              </template>
              <div v-if="windowFor(cellKey(col.id, lane?.id), cards(col.id, lane?.id).length).padBottom"
                   class="apex-kb__pad"
                   :style="{ blockSize: windowFor(cellKey(col.id, lane?.id), cards(col.id, lane?.id).length).padBottom + 'px' }"
                   aria-hidden="true"></div>
              <div v-if="target && target.columnId === col.id
                     && (target.swimlaneId ?? undefined) === (lane?.id ?? undefined)
                     && target.index >= cards(col.id, lane?.id).length"
                   class="apex-kb__ind" :class="ui?.indicator"></div>
              <slot v-if="!cards(col.id, lane?.id).length" name="empty" :column="col" :swimlane="lane">
                <p class="apex-kb__empty" :class="ui?.empty">No cards</p>
              </slot>
              <slot name="column-footer" :column="col" />
              <button v-if="showAddCard && may.create(col.id, lane?.id)" type="button" class="apex-kb__add" :class="ui?.add"
                      @click="emit('add-card', { columnId: col.id, swimlaneId: lane?.id })">
                <ApexIcon name="add" :size="16" />Add card
              </button>
            </template>
          </div>
        </div>
      </template>
    </div>

    <!-- the preview is a clone under the pointer: the real card stays in place as
         a ghost, so the board's own layout never shifts mid-drag. The slot replaces
         its contents; the positioning stays with the board, since a consumer
         cannot know the pointer offset the drag started from. -->
    <div v-if="drag" class="apex-kb__preview" :class="ui?.preview" :style="previewStyle" aria-hidden="true">
      <slot name="drag-preview" :items="drag.items" :count="drag.items.length">
        <div class="apex-kb__card" data-preview="true" v-html="drag.html"></div>
      </slot>
      <span v-if="drag.items.length > 1" class="apex-kb__badge">{{ drag.items.length }}</span>
    </div>
  </div>
</template>
