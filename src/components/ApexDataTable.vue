<script setup lang="ts">
/**
 * ApexDataTable — slice 1: columns, density, gridlines, stripes, selection,
 * keyboard navigation, sorting, pagination, scrolling, frozen columns and rows,
 * formula columns, footer aggregates, conditional styling and the empty,
 * loading and skeleton states.
 *
 * Columns are declared as a `columns` array rather than child components, so
 * the whole pipeline (filter → sort → group → window) runs inside computeds
 * and only the visible rows are ever rendered. Per-column templating is
 * available through the `cell:<field>` and `header:<field>` slots.
 *
 * Slices to come: filters, row grouping with summaries, row expansion, cell and
 * row editing, column resize/reorder/toggle, export, lazy and virtual scroll.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import ApexIcon from './ApexIcon.vue';
import ApexPaginator from './ApexPaginator.vue';
import ApexColumnFilter from './ApexColumnFilter.vue';
import {
  aggregate, cellValue, filterRows, formatCell, getField, groupRows, nextOrder, setField, sortRows,
  type ColumnDef, type FilterMeta, type FilterModel, type RowGroup, type SortMeta, type SortOrder,
} from '../core/table';

export type { ColumnDef };
type Row = Record<string, unknown>;

const props = withDefaults(defineProps<{
  /** The rows. */
  value?: Row[];
  columns?: ColumnDef[];
  /** Field that uniquely identifies a row. Required for selection and editing. */
  dataKey?: string;

  /* density and chrome */
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

  /* selection */
  selection?: Row | Row[] | null;
  selectionMode?: 'single' | 'multiple' | 'checkbox' | 'radio' | null;
  selectionColor?: string;
  /** Metabar above the table with the selection count. */
  showSelectionCount?: boolean;
  /** Cmd/Ctrl needed to add to a multiple selection. */
  metaKeySelection?: boolean;

  /* sorting */
  sortMode?: 'single' | 'multiple';
  sortField?: string;
  sortOrder?: SortOrder;
  multiSortMeta?: SortMeta[];
  /** A third click clears the column's sort. */
  removableSort?: boolean;

  /* paging */
  paginator?: boolean;
  rows?: number;
  first?: number;
  rowsPerPageOptions?: number[];
  paginatorTemplate?: string;
  /** Server-side paging/sorting; the table renders `value` as-is. */
  lazy?: boolean;
  totalRecords?: number;

  /* scrolling */
  scrollable?: boolean;
  scrollHeight?: string;
  /** Grow and shrink with a flex parent. */
  flexible?: boolean;
  /** Minimum table width, so columns don't squeeze. */
  tableMinWidth?: string;

  /* editing */
  /** cell = click a cell to edit it, row = an editor column per row. */
  editMode?: 'cell' | 'row' | null;
  /** Rows currently in row-edit mode. Bindable. */
  editingRows?: Row[];
  /**
   * Write the edit into the row object as well as emitting. Leave it on for local
   * data; turn it off when the server owns the value and you patch `value` yourself.
   */
  commitEdits?: boolean;

  /* filtering */
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

  /* grouping */
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

  /* expansion */
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

  /* frozen */
  /** Rows pinned above the scrolling body. Bindable, so the lock column can edit it. */
  frozenValue?: Row[];
  /** Adds a padlock column that freezes and unfreezes a row on click. Needs dataKey. */
  rowFreeze?: boolean;
  freezeIcon?: string;
  unfreezeIcon?: string;

  /* footers */
  showFooter?: boolean;
  /** Whether footer aggregates cover everything, the selection, or both. */
  footerMode?: 'all' | 'selected' | 'both';

  /* states */
  loading?: boolean;
  loadingMode?: 'overlay' | 'skeleton';
  skeletonRows?: number;
  emptyMessage?: string;

  /* conditional styling */
  rowClass?: (row: Row, index: number) => string | undefined;
  rowStyle?: (row: Row, index: number) => Record<string, string> | undefined;

  /** Row hover highlight. */
  hoverable?: boolean;
  locale?: string;
  caption?: string;
}>(), {
  size: 'normal', gridLines: 'horizontal', gridLineSize: 1, striped: false,
  selectionMode: null, metaKeySelection: true, sortMode: 'single', removableSort: true,
  rows: 10, first: 0, footerMode: 'all', loadingMode: 'overlay', skeletonRows: 5,
  hoverable: true, bordered: true, paginatorTemplate: 'Showing {first}–{last} of {total}',
  freezeIcon: 'lock_open', unfreezeIcon: 'lock',
  expandIcon: 'chevron_right', collapseIcon: 'keyboard_arrow_down',
  filterDisplay: null, maxConstraints: 3, rowGroupMode: 'subheader',
  editMode: null, commitEdits: true,
  globalFilterPlaceholder: 'Search all columns',
});

const emit = defineEmits<{
  (e: 'update:selection', v: Row | Row[] | null): void;
  (e: 'update:first', v: number): void;
  (e: 'update:rows', v: number): void;
  (e: 'update:sortField', v: string | undefined): void;
  (e: 'update:sortOrder', v: SortOrder): void;
  (e: 'update:multiSortMeta', v: SortMeta[]): void;
  (e: 'row-select', payload: { data: Row; index: number }): void;
  (e: 'row-unselect', payload: { data: Row; index: number }): void;
  (e: 'row-click', payload: { data: Row; index: number; event: MouseEvent }): void;
  (e: 'sort', payload: { sortField?: string; sortOrder: SortOrder; multiSortMeta: SortMeta[] }): void;
  (e: 'page', payload: { first: number; rows: number; page: number }): void;
  (e: 'update:frozenValue', v: Row[]): void;
  (e: 'row-freeze' | 'row-unfreeze', payload: { data: Row }): void;
  (e: 'update:expandedRows', v: Row[]): void;
  (e: 'row-expand' | 'row-collapse', payload: { data: Row }): void;
  (e: 'update:filters', v: FilterModel): void;
  (e: 'filter', payload: { filters: FilterModel; filteredValue: Row[] }): void;
  (e: 'update:expandedRowGroups', v: string[]): void;
  (e: 'rowgroup-expand' | 'rowgroup-collapse', payload: { key: string }): void;
  (e: 'update:editingRows', v: Row[]): void;
  (e: 'cell-edit-init', payload: { data: Row; field: string; value: unknown }): void;
  (e: 'cell-edit-complete', payload: { data: Row; field: string; value: unknown; newValue: unknown }): void;
  (e: 'cell-edit-cancel', payload: { data: Row; field: string }): void;
  (e: 'row-edit-init' | 'row-edit-cancel', payload: { data: Row; index: number }): void;
  (e: 'row-edit-save', payload: { data: Row; newData: Row; index: number }): void;
}>();

/* ── columns ────────────────────────────────────────────── */
const cols = computed(() => (props.columns || []).filter((c) => !c.hidden));
const dataCols = computed(() => cols.value.filter((c) => (c.type ?? 'data') === 'data'));
const hasCheckbox = computed(() => props.selectionMode === 'checkbox');
const hasRadio = computed(() => props.selectionMode === 'radio');
const gutter = computed(() => (hasCheckbox.value || hasRadio.value ? 1 : 0));
const lockGutter = computed(() => (props.rowFreeze ? 1 : 0));
const expandGutter = computed(() => (props.rowExpansion ? 1 : 0));
const leading = computed(() => gutter.value + lockGutter.value + expandGutter.value + editorGutter.value);
const colCount = computed(() => cols.value.length + leading.value);

/**
 * Frozen offsets are MEASURED, not derived from the declared `width`/`minWidth`:
 * a column without a fixed width stretches, and guessing its size stacks every
 * pinned column at the same place. Same for pinned rows, whose height varies with
 * density and content. Re-measured whenever the layout could have changed.
 */
const tableEl = ref<HTMLTableElement | null>(null);
const frozenBodyEl = ref<HTMLElement | null>(null);
const frozenStart = ref<Record<number, string>>({});
const frozenEnd = ref<Record<number, string>>({});
const frozenRowTop = ref<string[]>([]);

function measureFrozen() {
  const table = tableEl.value;
  if (!table) return;
  const head = table.tHead?.rows[0];
  const cells = head ? Array.from(head.cells) : [];
  const startMap: Record<number, string> = {};
  const endMap: Record<number, string> = {};

  // leading gutters are always pinned, so they seed the accumulator
  let acc = 0;
  for (let g = 0; g < leading.value; g++) acc += cells[g]?.offsetWidth ?? 46;
  cols.value.forEach((col, i) => {
    // Parenthesised deliberately: `a ?? b || c` is a syntax error in JavaScript, and the
    // intent is "measured width, else the declared width, else 160" — so `|| 160` belongs to
    // the parseFloat as its NaN guard, not to the ?? chain.
    const w = cells[i + leading.value]?.offsetWidth ?? (parseFloat(col.width || col.minWidth || '160') || 160);
    if (col.frozen && col.alignFrozen !== 'right') { startMap[i] = acc + 'px'; acc += w; }
  });

  let tail = 0;
  for (let i = cols.value.length - 1; i >= 0; i--) {
    const col = cols.value[i];
    // Parenthesised deliberately: `a ?? b || c` is a syntax error in JavaScript, and the
    // intent is "measured width, else the declared width, else 160" — so `|| 160` belongs to
    // the parseFloat as its NaN guard, not to the ?? chain.
    const w = cells[i + leading.value]?.offsetWidth ?? (parseFloat(col.width || col.minWidth || '160') || 160);
    if (col.frozen && col.alignFrozen === 'right') { endMap[i] = tail + 'px'; tail += w; }
  }
  frozenStart.value = startMap;
  frozenEnd.value = endMap;

  // pinned rows stack under the header, each below the last
  const headH = head?.offsetHeight ?? 38;
  const tops: string[] = [];
  let rowAcc = headH;
  Array.from(frozenBodyEl.value?.rows || []).forEach((r) => {
    tops.push(rowAcc + 'px');
    rowAcc += r.offsetHeight;
  });
  frozenRowTop.value = tops;
}

const scheduleMeasure = () => nextTick(measureFrozen);
onMounted(() => {
  measureFrozen();
  if (typeof window !== 'undefined') window.addEventListener('resize', scheduleMeasure);
});
onBeforeUnmount(() => {
  if (typeof window !== 'undefined') window.removeEventListener('resize', scheduleMeasure);
});

/* ── sorting ────────────────────────────────────────────── */
const localSort = ref<SortMeta[]>([]);
const sortMeta = computed<SortMeta[]>(() => {
  if (props.sortMode === 'multiple') {
    return props.multiSortMeta ?? localSort.value;
  }
  if (props.sortField !== undefined) return [{ field: props.sortField, order: props.sortOrder ?? 1 }];
  return localSort.value.slice(0, 1);
});
watch(() => [props.sortField, props.sortOrder, props.multiSortMeta], () => {
  if (props.sortMode === 'multiple' && props.multiSortMeta) localSort.value = props.multiSortMeta;
  else if (props.sortField) localSort.value = [{ field: props.sortField, order: props.sortOrder ?? 1 }];
}, { immediate: true });

const orderOf = (field?: string): SortOrder => {
  if (!field) return 0;
  return (sortMeta.value.find((m) => m.field === field)?.order ?? 0) as SortOrder;
};
const rankOf = (field?: string) => {
  if (!field || props.sortMode !== 'multiple') return 0;
  const i = sortMeta.value.findIndex((m) => m.field === field && m.order);
  return i < 0 ? 0 : i + 1;
};

function toggleSort(col: ColumnDef, event: MouseEvent) {
  if (!col.sortable || !col.field) return;
  const field = col.field;
  const order = nextOrder(orderOf(field), props.removableSort);
  const additive = props.sortMode === 'multiple' && (event.metaKey || event.ctrlKey);

  let next: SortMeta[];
  if (props.sortMode === 'multiple' && additive) {
    next = sortMeta.value.filter((m) => m.field !== field);
    if (order) next.push({ field, order });
  } else if (props.sortMode === 'multiple') {
    next = order ? [{ field, order }] : [];
  } else {
    next = order ? [{ field, order }] : [];
  }
  localSort.value = next;
  emit('update:multiSortMeta', next);
  emit('update:sortField', next[0]?.field);
  emit('update:sortOrder', (next[0]?.order ?? 0) as SortOrder);
  emit('sort', { sortField: next[0]?.field, sortOrder: (next[0]?.order ?? 0) as SortOrder, multiSortMeta: next });
}

/* ── pipeline ───────────────────────────────────────────── */
const source = computed(() => props.value || []);

/* ── filtering ──────────────────────────────────────────── */
const localFilters = ref<FilterModel>({});
const activeFilters = computed<FilterModel>(() => props.filters ?? localFilters.value);
const filtered = computed(() => (props.lazy
  ? source.value
  : filterRows(source.value, activeFilters.value, cols.value, props.globalFilterFields)));

function pushFilters(next: FilterModel) {
  localFilters.value = next;
  emit('update:filters', next);
  emit('filter', { filters: next, filteredValue: props.lazy ? source.value : filterRows(source.value, next, cols.value, props.globalFilterFields) });
}
function setFilter(field: string, meta: FilterMeta) {
  pushFilters({ ...activeFilters.value, [field]: meta });
}
function clearFilter(field: string) {
  const next = { ...activeFilters.value };
  delete next[field];
  pushFilters(next);
}
function clearAllFilters() { pushFilters({}); }
const globalValue = computed(() => String(activeFilters.value.global?.value ?? ''));
const anyFilter = computed(() => Object.values(activeFilters.value).some((m) => {
  if (!m) return false;
  if (m.constraints) return m.constraints.some((x) => x.value != null && x.value !== '');
  return m.value != null && m.value !== '' && !(Array.isArray(m.value) && !m.value.length);
}));
const filterCols = computed(() => cols.value.filter((col) => col.filter));

const sorted = computed(() => {
  // grouping needs its field contiguous, so it leads the sort
  let meta = sortMeta.value;
  if (props.groupRowsBy && !props.lazy) {
    const rest = meta.filter((m) => m.field !== props.groupRowsBy);
    const own = meta.find((m) => m.field === props.groupRowsBy);
    meta = [{ field: props.groupRowsBy, order: own?.order ?? 1 }, ...rest];
  }
  const base = props.lazy ? filtered.value : sortRows(filtered.value, meta, cols.value);
  // an interactively frozen row moves out of the body, so it is not rendered twice
  if (!props.rowFreeze || !frozen.value.length) return base;
  return base.filter((r) => !isFrozen(r));
});
const total = computed(() => (props.lazy ? (props.totalRecords ?? sorted.value.length) : sorted.value.length));

const pageFirst = ref(props.first);
watch(() => props.first, (v) => { pageFirst.value = v; });
const pageRows = ref(props.rows);
watch(() => props.rows, (v) => { pageRows.value = v; });

const windowed = computed(() => {
  if (!props.paginator || props.lazy) return sorted.value;
  return sorted.value.slice(pageFirst.value, pageFirst.value + pageRows.value);
});

/* ── grouping ───────────────────────────────────────────── */
const localGroupsOpen = ref<string[] | null>(null);
const openGroups = computed(() => props.expandedRowGroups ?? localGroupsOpen.value);
const groups = computed<RowGroup[]>(() => (props.groupRowsBy ? groupRows(windowed.value, props.groupRowsBy) : []));
/** Collapsed only once a set has been supplied; otherwise everything is open. */
const isGroupOpen = (key: string) => (!props.expandableRowGroups || openGroups.value === null || openGroups.value.includes(key));

function toggleGroup(key: string) {
  const current = openGroups.value ?? groups.value.map((g) => g.key);
  const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
  localGroupsOpen.value = next;
  emit('update:expandedRowGroups', next);
  emit(current.includes(key) ? 'rowgroup-collapse' : 'rowgroup-expand', { key });
}
const groupAgg = (g: RowGroup, col: ColumnDef) => {
  const fn = col.groupAggregate || col.aggregate;
  return fn ? formatCell(aggregate(g.rows, col, fn), col, props.locale) : '';
};
/** rowspan mode: the group column renders once, spanning its rows. */
const spanFor = (row: Row, ci: number) => {
  if (props.rowGroupMode !== 'rowspan' || !props.groupRowsBy) return undefined;
  if (cols.value[ci]?.field !== props.groupRowsBy) return undefined;
  const g = groups.value.find((x) => x.rows.includes(row));
  return g && g.rows[0] === row ? g.rows.length : 0;
};

/**
 * One flat render list, so grouping, expansion and plain rows share a single
 * v-for and the DOM order stays predictable.
 */
type RenderItem =
  | { kind: 'group'; group: RowGroup }
  | { kind: 'row'; row: Row; index: number }
  | { kind: 'groupFooter'; group: RowGroup };

const renderItems = computed<RenderItem[]>(() => {
  if (!props.groupRowsBy || props.rowGroupMode === 'rowspan') {
    return windowed.value.map((row, index) => ({ kind: 'row', row, index }));
  }
  const out: RenderItem[] = [];
  groups.value.forEach((group) => {
    out.push({ kind: 'group', group });
    if (!isGroupOpen(group.key)) return;
    group.rows.forEach((row, i) => out.push({ kind: 'row', row, index: group.start + i }));
    if (props.showGroupFooter) out.push({ kind: 'groupFooter', group });
  });
  return out;
});

function onPage(payload: { first: number; rows: number; page: number }) {
  pageFirst.value = payload.first;
  pageRows.value = payload.rows;
  emit('update:first', payload.first);
  emit('update:rows', payload.rows);
  emit('page', payload);
}
// a narrowed dataset shouldn't leave the viewer on a page that no longer exists
watch(total, (t) => {
  if (!props.paginator || props.lazy) return;
  if (pageFirst.value >= t) {
    const first = Math.max(0, (Math.ceil(t / pageRows.value) - 1) * pageRows.value);
    pageFirst.value = first;
    emit('update:first', first);
  }
});

/* ── selection ──────────────────────────────────────────── */
const many = computed(() => props.selectionMode === 'multiple' || props.selectionMode === 'checkbox');
const selected = computed<Row[]>(() => {
  const s = props.selection;
  if (!s) return [];
  return Array.isArray(s) ? s : [s];
});
const keyOf = (row: Row) => (props.dataKey ? String(getField(row, props.dataKey)) : '');
const selectedKeys = computed(() => new Set(selected.value.map(keyOf)));
const isSelected = (row: Row) => (props.dataKey
  ? selectedKeys.value.has(keyOf(row))
  : selected.value.includes(row));

const allOnPageSelected = computed(() =>
  windowed.value.length > 0 && windowed.value.every((r) => isSelected(r)));
const someOnPageSelected = computed(() =>
  windowed.value.some((r) => isSelected(r)) && !allOnPageSelected.value);

function pushSelection(next: Row[], row: Row, index: number, added: boolean) {
  emit('update:selection', many.value ? next : (next[0] ?? null));
  emit(added ? 'row-select' : 'row-unselect', { data: row, index });
}
function selectRow(row: Row, index: number, event?: MouseEvent) {
  if (!props.selectionMode) return;
  const on = isSelected(row);
  if (!many.value) {
    pushSelection(on ? [] : [row], row, index, !on);
    return;
  }
  const additive = props.selectionMode === 'checkbox'
    || !props.metaKeySelection
    || !!(event && (event.metaKey || event.ctrlKey || event.shiftKey));
  if (!additive) { pushSelection(on && selected.value.length === 1 ? [] : [row], row, index, !on); return; }
  const next = on
    ? selected.value.filter((r) => (props.dataKey ? keyOf(r) !== keyOf(row) : r !== row))
    : [...selected.value, row];
  pushSelection(next, row, index, !on);
}
function toggleAllOnPage() {
  if (allOnPageSelected.value) {
    const keys = new Set(windowed.value.map(keyOf));
    emit('update:selection', selected.value.filter((r) => !keys.has(keyOf(r))));
  } else {
    const merged = [...selected.value];
    windowed.value.forEach((r) => { if (!isSelected(r)) merged.push(r); });
    emit('update:selection', merged);
  }
}

/* ── row freezing ───────────────────────────────────────── */
const frozen = computed(() => props.frozenValue || []);
const frozenKeys = computed(() => new Set(frozen.value.map(keyOf)));
const isFrozen = (row: Row) => (props.dataKey ? frozenKeys.value.has(keyOf(row)) : frozen.value.includes(row));

function toggleFreeze(row: Row) {
  const on = isFrozen(row);
  const next = on
    ? frozen.value.filter((r) => (props.dataKey ? keyOf(r) !== keyOf(row) : r !== row))
    : [...frozen.value, row];
  emit('update:frozenValue', next);
  emit(on ? 'row-unfreeze' : 'row-freeze', { data: row });
}

/* ── editing ────────────────────────────────────────────── */
const editorGutter = computed(() => (props.editMode === 'row' ? 1 : 0));
/**
 * The in-flight cell edit is captured as ONE record at start — row, column and the
 * value it began with. commitCell operates on that record rather than re-reading
 * live state, so opening another cell can never poison a pending commit.
 */
let editSeq = 0;
const editingCell = ref<{ id: number; key: string; row: Row; col: ColumnDef; original: unknown; draft: unknown } | null>(null);
/** One shallow draft per row in row-edit mode, keyed by dataKey. */
const rowDrafts = ref<Record<string, Row>>({});

const editRows = computed(() => props.editingRows || []);
const editKeys = computed(() => new Set(editRows.value.map(keyOf)));
const isRowEditing = (row: Row) => (props.dataKey ? editKeys.value.has(keyOf(row)) : editRows.value.includes(row));
const isCellEditing = (row: Row, col: ColumnDef) =>
  !!editingCell.value && editingCell.value.key === keyOf(row) && editingCell.value.col.field === col.field;
const canEdit = (col: ColumnDef) => !!col.editable && !col.formula && !!col.field;

function startCell(row: Row, col: ColumnDef) {
  if (props.editMode !== 'cell' || !canEdit(col) || props.disabled) return;
  if (isCellEditing(row, col)) return;
  // flush any cell still open, before its own blur gets the chance to fire late
  commitCell();
  const original = getField(row, col.field as string);
  editingCell.value = { id: ++editSeq, key: keyOf(row), row, col, original, draft: original };
  emit('cell-edit-init', { data: row, field: col.field as string, value: original });
}
/**
 * Commits the in-flight record.
 *
 * `only` scopes the commit to one cell. An editor's blur fires AFTER the click that
 * opened the next cell, so a blur handler must not commit whatever happens to be
 * open — it would consume the freshly opened edit and close it before it painted.
 * The scope is row + field rather than an id because an inline template handler is
 * evaluated at event time, when a live id already points at the new record.
 */
function commitCell(only?: { row: Row; col: ColumnDef }) {
  const edit = editingCell.value;
  if (!edit) return;
  if (only && (only.row !== edit.row || only.col.field !== edit.col.field)) return;
  editingCell.value = null;
  const field = edit.col.field as string;
  if (edit.draft === edit.original) return;
  if (props.commitEdits) setField(edit.row, field, edit.draft);
  emit('cell-edit-complete', { data: edit.row, field, value: edit.original, newValue: edit.draft });
}
function cancelCell() {
  const edit = editingCell.value;
  if (!edit) return;
  editingCell.value = null;
  emit('cell-edit-cancel', { data: edit.row, field: edit.col.field as string });
}

function startRowEdit(row: Row, index: number) {
  rowDrafts.value = { ...rowDrafts.value, [keyOf(row)]: { ...row } };
  emit('update:editingRows', [...editRows.value, row]);
  emit('row-edit-init', { data: row, index });
}
function draftOf(row: Row): Row {
  return rowDrafts.value[keyOf(row)] || row;
}
function setDraft(row: Row, field: string, v: unknown) {
  const key = keyOf(row);
  const next = { ...(rowDrafts.value[key] || row) };
  setField(next, field, v);
  rowDrafts.value = { ...rowDrafts.value, [key]: next };
}
function endRowEdit(row: Row) {
  const next = editRows.value.filter((r) => (props.dataKey ? keyOf(r) !== keyOf(row) : r !== row));
  emit('update:editingRows', next);
  const drafts = { ...rowDrafts.value };
  delete drafts[keyOf(row)];
  rowDrafts.value = drafts;
}
function saveRowEdit(row: Row, index: number) {
  const draft = draftOf(row);
  if (props.commitEdits) {
    cols.value.forEach((col) => {
      if (canEdit(col)) setField(row, col.field as string, getField(draft, col.field as string));
    });
  }
  emit('row-edit-save', { data: row, newData: draft, index });
  endRowEdit(row);
}
function cancelRowEdit(row: Row, index: number) {
  emit('row-edit-cancel', { data: row, index });
  endRowEdit(row);
}
/** The value an editor should show: the row draft in row mode, the cell draft in cell mode. */
const editorValue = (row: Row, col: ColumnDef) =>
  (props.editMode === 'row' ? getField(draftOf(row), col.field as string) : editingCell.value?.draft);
function onEditorInput(row: Row, col: ColumnDef, raw: unknown) {
  const v = col.editorType === 'number' ? (raw === '' ? null : Number(raw)) : raw;
  if (props.editMode === 'row') setDraft(row, col.field as string, v);
  else if (editingCell.value) editingCell.value = { ...editingCell.value, draft: v };
}
/** select and switch have no meaningful blur or Enter, so they commit on change. */
function onEditorChange(row: Row, col: ColumnDef, raw: unknown, index: number) {
  onEditorInput(row, col, raw);
  if (props.editMode === 'cell') commitCell();
  else if (col.editorType === 'switch') setDraft(row, col.field as string, raw);
  void index;
}

/* ── row expansion ──────────────────────────────────────── */
const expanded = computed(() => props.expandedRows || []);
const expandedKeys = computed(() => new Set(expanded.value.map(keyOf)));
const isExpanded = (row: Row) => (props.dataKey ? expandedKeys.value.has(keyOf(row)) : expanded.value.includes(row));

function toggleExpand(row: Row) {
  const on = isExpanded(row);
  let next: Row[];
  if (on) next = expanded.value.filter((r) => (props.dataKey ? keyOf(r) !== keyOf(row) : r !== row));
  else next = props.singleExpand ? [row] : [...expanded.value, row];
  emit('update:expandedRows', next);
  emit(on ? 'row-collapse' : 'row-expand', { data: row });
}

/* ── keyboard ───────────────────────────────────────────── */
const focusIndex = ref(-1);
const bodyEl = ref<HTMLElement | null>(null);
const anchor = ref(-1);

function focusRow(i: number) {
  const n = windowed.value.length;
  if (!n) return;
  focusIndex.value = Math.min(Math.max(0, i), n - 1);
  bodyEl.value?.querySelector<HTMLElement>(`[data-row="${focusIndex.value}"]`)?.focus();
}
function onRowClick(row: Row, ri: number, event: MouseEvent) {
  emit('row-click', { data: row, index: ri, event });
  if (props.rowExpansion && props.expandOnRowClick) toggleExpand(row);
  if (props.selectionMode && props.selectionMode !== 'checkbox' && props.selectionMode !== 'radio') {
    selectRow(row, ri, event);
  }
}
function onRowKey(i: number, row: Row, e: KeyboardEvent) {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const next = i + (e.key === 'ArrowDown' ? 1 : -1);
    focusRow(next);
    // shift extends a range from the anchor
    if (e.shiftKey && many.value) {
      if (anchor.value < 0) anchor.value = i;
      const lo = Math.min(anchor.value, focusIndex.value);
      const hi = Math.max(anchor.value, focusIndex.value);
      const range = windowed.value.slice(lo, hi + 1);
      const merged = [...selected.value];
      range.forEach((r) => { if (!isSelected(r)) merged.push(r); });
      emit('update:selection', many.value ? merged : (merged[0] ?? null));
    } else {
      anchor.value = focusIndex.value;
    }
    return;
  }
  if (e.key === 'Home') { e.preventDefault(); focusRow(0); return; }
  if (e.key === 'End') { e.preventDefault(); focusRow(windowed.value.length - 1); return; }
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    if (props.rowExpansion && (props.expandOnRowClick || !props.selectionMode)) toggleExpand(row);
    anchor.value = i;
    selectRow(row, i, e as unknown as MouseEvent);
  }
}

watch([cols, frozen, windowed, () => props.size, () => props.gridLines], scheduleMeasure);

/* ── footers ────────────────────────────────────────────── */
const footerRows = computed(() => {
  const out: Array<{ label: string; rows: Row[] }> = [];
  if (props.footerMode === 'all' || props.footerMode === 'both') out.push({ label: 'Total', rows: sorted.value });
  if ((props.footerMode === 'selected' || props.footerMode === 'both') && selected.value.length) {
    out.push({ label: `Selected (${selected.value.length})`, rows: selected.value });
  }
  return out;
});
const wantsFooter = computed(() => props.showFooter ?? cols.value.some((c) => c.aggregate));

/* ── presentation helpers ───────────────────────────────── */
const rootStyle = computed(() => {
  const s: Record<string, string> = { '--dt-grid-size': props.gridLineSize + 'px' };
  if (props.gridLineColor) s['--dt-grid'] = props.gridLineColor;
  if (props.borderColor) s['--dt-border'] = props.borderColor;
  if (props.stripeColor) s['--dt-stripe'] = props.stripeColor;
  if (props.selectionColor) s['--dt-sel'] = props.selectionColor;
  if (props.headerBackground) s['--dt-head-bg'] = props.headerBackground;
  if (props.scrollHeight) s['--dt-scroll-h'] = props.scrollHeight;
  if (props.tableMinWidth) s['--dt-min-w'] = props.tableMinWidth;
  return s;
});
function cellStyle(col: ColumnDef, index: number, header = false) {
  const s: Record<string, string> = {};
  if (col.width) { s.width = col.width; s.minWidth = col.width; }
  else if (col.minWidth) s.minWidth = col.minWidth;
  if (col.align) s.textAlign = col.align === 'start' ? 'start' : col.align === 'end' ? 'end' : 'center';
  if (col.color && !header) s.color = col.color;
  const bg = header ? (col.headerBackground || col.background) : col.background;
  if (bg) s.background = bg;
  if (col.frozen) {
    const start = frozenStart.value[index];
    const end = frozenEnd.value[index];
    if (start !== undefined) s.insetInlineStart = start;
    if (end !== undefined) s.insetInlineEnd = end;
  }
  return s;
}
function cellClasses(col: ColumnDef, row?: Row) {
  const extra = typeof col.cellClass === 'function' ? (row ? col.cellClass(row) : undefined) : col.cellClass;
  return extra;
}
const display = (row: Row, col: ColumnDef) => formatCell(cellValue(row, col), col, props.locale);
const imageAlt = (row: Row, col: ColumnDef) =>
  (col.imageAlt ? String(getField(row, col.imageAlt) ?? col.imageAlt) : '');
/** Focuses and selects a freshly opened cell editor. */
const vFocusCell = {
  mounted(el: HTMLInputElement, binding: { value: boolean }) {
    if (binding.value) { el.focus(); el.select?.(); }
  },
};
const badgeTone = (row: Row, col: ColumnDef) => {
  const v = String(cellValue(row, col) ?? '');
  return col.badgeTones?.[v] || 'neutral';
};

defineExpose({ focusRow, selectRow, toggleAllOnPage, setFilter, clearFilter, clearAllFilters, toggleGroup, toggleExpand, toggleFreeze });
</script>

<template>
  <div class="apex-dt" :style="rootStyle" :data-size="size" :data-grid="gridLines"
       :data-striped="striped ? 'true' : 'false'" :data-hover="hoverable ? 'true' : 'false'"
       :data-bordered="bordered ? 'true' : 'false'" :data-flexible="flexible ? 'true' : 'false'"
       :data-loading="loading ? 'true' : 'false'">
    <div v-if="caption || showSelectionCount || showGlobalFilter || $slots.header" class="apex-dt__bar">
      <slot name="header">
        <p v-if="caption" class="apex-dt__caption">{{ caption }}</p>
        <div v-if="showGlobalFilter" class="apex-dt__search">
          <ApexIcon name="search" :size="17" />
          <input type="text" :value="globalValue" :placeholder="globalFilterPlaceholder"
                 aria-label="Search all columns"
                 @input="setFilter('global', { value: ($event.target as HTMLInputElement).value, matchMode: 'contains' })" />
          <button v-if="globalValue" type="button" aria-label="Clear search" @click="clearFilter('global')">
            <ApexIcon name="close" :size="16" />
          </button>
        </div>
        <button v-if="anyFilter && filterDisplay" type="button" class="apex-dt__clearall" @click="clearAllFilters">
          <ApexIcon name="filter_alt_off" :size="16" />Clear filters
        </button>
        <span v-if="showSelectionCount && selected.length" class="apex-dt__count">
          {{ selected.length }} selected
        </span>
      </slot>
    </div>

    <div class="apex-dt__main">
    <div class="apex-dt__viewport" :data-scrollable="scrollable ? 'true' : 'false'">
      <table ref="tableEl" class="apex-dt__table" :data-frozen-head="scrollable ? 'true' : 'false'">
        <thead>
          <tr>
            <th v-if="editorGutter" class="apex-dt__gutter apex-dt__editcol" scope="col">
              <span class="sr-only">Edit</span>
            </th>
            <th v-if="expandGutter" class="apex-dt__gutter apex-dt__expcol" scope="col">
              <span class="sr-only">Expand</span>
            </th>
            <th v-if="lockGutter" class="apex-dt__gutter apex-dt__lockcol" scope="col">
              <ApexIcon name="lock" :size="16" :label="'Freeze row'" />
            </th>
            <th v-if="gutter" class="apex-dt__gutter" scope="col">
              <span v-if="hasCheckbox" class="apex-cb__box" :data-on="allOnPageSelected"
                    :data-partial="someOnPageSelected" role="checkbox"
                    :aria-checked="allOnPageSelected ? 'true' : someOnPageSelected ? 'mixed' : 'false'"
                    tabindex="0" aria-label="Select all rows on this page"
                    @click="toggleAllOnPage" @keydown.space.prevent="toggleAllOnPage">
                <ApexIcon v-if="allOnPageSelected" name="check" :size="14" />
                <ApexIcon v-else-if="someOnPageSelected" name="remove" :size="14" />
              </span>
            </th>
            <th v-for="(col, ci) in cols" :key="ci" scope="col" :style="cellStyle(col, ci, true)"
                :data-frozen="col.frozen ? (col.alignFrozen === 'right' ? 'end' : 'start') : undefined"
                :data-sortable="col.sortable ? 'true' : 'false'"
                :aria-sort="orderOf(col.field) === 1 ? 'ascending' : orderOf(col.field) === -1 ? 'descending' : undefined">
              <button v-if="col.sortable" type="button" class="apex-dt__sort" @click="toggleSort(col, $event)">
                <slot :name="`header:${col.field}`" :column="col">{{ col.header }}</slot>
                <ApexIcon class="apex-dt__arrow"
                          :name="orderOf(col.field) === 1 ? 'arrow_upward' : orderOf(col.field) === -1 ? 'arrow_downward' : 'unfold_more'"
                          :size="15" :data-active="!!orderOf(col.field)" />
                <span v-if="rankOf(col.field)" class="apex-dt__rank">{{ rankOf(col.field) }}</span>
              </button>
              <slot v-else :name="`header:${col.field}`" :column="col">{{ col.header }}</slot>
              <ApexColumnFilter v-if="filterDisplay === 'menu' && col.filter && col.field" mode="menu"
                                :column="col" :meta="activeFilters[col.field]" :max-constraints="maxConstraints"
                                @update="setFilter(col.field!, $event)" @clear="clearFilter(col.field!)" />
            </th>
          </tr>
          <tr v-if="filterDisplay === 'row' && filterCols.length" class="apex-dt__filterrow">
            <th v-for="n in leading" :key="'fg' + n" class="apex-dt__gutter"></th>
            <th v-for="(col, ci) in cols" :key="ci" :style="cellStyle(col, ci, true)"
                :data-frozen="col.frozen ? (col.alignFrozen === 'right' ? 'end' : 'start') : undefined">
              <ApexColumnFilter v-if="col.filter && col.field" mode="row" :column="col"
                                :meta="activeFilters[col.field]" :size="size"
                                @update="setFilter(col.field!, $event)" @clear="clearFilter(col.field!)" />
            </th>
          </tr>
          <slot name="filterRow" />
        </thead>

        <!-- frozen rows stay put while the body scrolls -->
        <tbody v-if="frozen.length" ref="frozenBodyEl" class="apex-dt__frozen-rows">
          <tr v-for="(row, ri) in frozen" :key="'f' + (dataKey ? keyOf(row) : ri)">
            <td v-if="editorGutter" class="apex-dt__gutter" :style="{ insetBlockStart: frozenRowTop[ri] }"></td>
            <td v-if="expandGutter" class="apex-dt__gutter" :style="{ insetBlockStart: frozenRowTop[ri] }"></td>
            <td v-if="lockGutter" class="apex-dt__gutter apex-dt__lockcol" :style="{ insetBlockStart: frozenRowTop[ri] }">
              <button type="button" class="apex-dt__lock" data-on="true" :aria-pressed="true"
                      aria-label="Unfreeze this row" @click.stop="toggleFreeze(row)">
                <ApexIcon :name="unfreezeIcon" :size="17" />
              </button>
            </td>
            <td v-if="gutter" class="apex-dt__gutter" :style="{ insetBlockStart: frozenRowTop[ri] }"></td>
            <td v-for="(col, ci) in cols" :key="ci"
                :style="{ ...cellStyle(col, ci), insetBlockStart: frozenRowTop[ri] }" :class="cellClasses(col, row)"
                :data-frozen="col.frozen ? (col.alignFrozen === 'right' ? 'end' : 'start') : undefined"
                :data-numeric="col.format === 'number' || col.format === 'currency' || col.format === 'percent' || !!col.formula">
              <slot :name="`cell:${col.field}`" :row="row" :column="col" :value="cellValue(row, col)">
                <span v-if="col.format === 'badge'" class="apex-dt__badge" :data-tone="badgeTone(row, col)">
                  {{ display(row, col) }}
                </span>
                <ApexIcon v-else-if="col.format === 'boolean'"
                          :name="cellValue(row, col) ? 'check_circle' : 'remove'" :size="18"
                          :style="{ color: cellValue(row, col) ? 'var(--accent-success)' : 'var(--fg-subtle)' }" />
                <template v-else>{{ display(row, col) }}</template>
              </slot>
            </td>
          </tr>
        </tbody>

        <tbody ref="bodyEl">
          <template v-if="loading && loadingMode === 'skeleton'">
            <tr v-for="n in skeletonRows" :key="'s' + n" class="apex-dt__skeleton">
              <td v-if="editorGutter" class="apex-dt__gutter"><span class="apex-skel" style="width:16px"></span></td>
              <td v-if="expandGutter" class="apex-dt__gutter"><span class="apex-skel" style="width:14px"></span></td>
              <td v-if="lockGutter" class="apex-dt__gutter"><span class="apex-skel" style="width:16px"></span></td>
              <td v-if="gutter" class="apex-dt__gutter"><span class="apex-skel" style="width:18px"></span></td>
              <td v-for="(col, ci) in cols" :key="ci" :style="cellStyle(col, ci)">
                <span class="apex-skel" :style="{ width: (45 + ((ci * 17) % 45)) + '%' }"></span>
              </td>
            </tr>
          </template>

          <template v-else-if="renderItems.length">
            <template v-for="(item, ii) in renderItems" :key="ii">
            <tr v-if="item.kind === 'group'" class="apex-dt__group">
              <td :colspan="colCount">
                <button v-if="expandableRowGroups" type="button" class="apex-dt__exp"
                        :data-on="isGroupOpen(item.group.key)" :aria-expanded="isGroupOpen(item.group.key)"
                        :aria-label="isGroupOpen(item.group.key) ? 'Collapse group' : 'Expand group'"
                        @click="toggleGroup(item.group.key)">
                  <ApexIcon :name="isGroupOpen(item.group.key) ? collapseIcon : expandIcon" :size="19" />
                </button>
                <slot name="groupheader" :value="item.group.value" :rows="item.group.rows" :key="item.group.key">
                  <span class="apex-dt__grouplabel">{{ item.group.value }}</span>
                  <span class="apex-dt__groupcount">{{ item.group.rows.length }}</span>
                </slot>
              </td>
            </tr>

            <tr v-else-if="item.kind === 'groupFooter'" class="apex-dt__groupfoot">
              <td v-for="n in leading" :key="'ggf' + n" class="apex-dt__gutter"></td>
              <td v-for="(col, ci) in cols" :key="ci" :style="cellStyle(col, ci)"
                  :data-frozen="col.frozen ? (col.alignFrozen === 'right' ? 'end' : 'start') : undefined"
                  :data-numeric="col.format === 'number' || col.format === 'currency' || col.format === 'percent' || !!col.formula">
                <slot name="groupfooter" :value="item.group.value" :rows="item.group.rows" :column="col">
                  <span v-if="ci === 0 && !(col.groupAggregate || col.aggregate)" class="apex-dt__footlabel">
                    {{ item.group.value }}
                  </span>
                  <template v-else>{{ groupAgg(item.group, col) }}</template>
                </slot>
              </td>
            </tr>

            <tr v-else-if="item.kind === 'row'" :key="(dataKey ? keyOf(item.row) : item.index) + '-r'"
                :data-row="item.index" :data-selected="isSelected(item.row) ? 'true' : 'false'"
                :class="rowClass ? rowClass(item.row, item.index) : undefined"
                :style="rowStyle ? rowStyle(item.row, item.index) : undefined"
                :tabindex="selectionMode ? 0 : -1"
                :aria-selected="selectionMode ? isSelected(item.row) : undefined"
                :data-expanded="rowExpansion && isExpanded(item.row) ? 'true' : undefined"
                @click="onRowClick(item.row, item.index, $event)"
                @keydown="onRowKey(item.index, item.row, $event)">
              <td v-if="editorGutter" class="apex-dt__gutter apex-dt__editcol">
                <template v-if="isRowEditing(item.row)">
                  <button type="button" class="apex-dt__rowbtn" data-tone="save" aria-label="Save row"
                          @click.stop="saveRowEdit(item.row, item.index)">
                    <ApexIcon name="check" :size="18" />
                  </button>
                  <button type="button" class="apex-dt__rowbtn" data-tone="cancel" aria-label="Cancel edit"
                          @click.stop="cancelRowEdit(item.row, item.index)">
                    <ApexIcon name="close" :size="18" />
                  </button>
                </template>
                <button v-else type="button" class="apex-dt__rowbtn" aria-label="Edit row"
                        @click.stop="startRowEdit(item.row, item.index)">
                  <ApexIcon name="edit" :size="17" />
                </button>
              </td>
              <td v-if="expandGutter" class="apex-dt__gutter apex-dt__expcol">
                <button type="button" class="apex-dt__exp" :data-on="isExpanded(item.row)"
                        :aria-expanded="isExpanded(item.row)"
                        :aria-label="isExpanded(item.row) ? 'Collapse row' : 'Expand row'"
                        @click.stop="toggleExpand(item.row)">
                  <ApexIcon :name="isExpanded(item.row) ? collapseIcon : expandIcon" :size="19" />
                </button>
              </td>
              <td v-if="lockGutter" class="apex-dt__gutter apex-dt__lockcol">
                <button type="button" class="apex-dt__lock" :data-on="isFrozen(item.row)"
                        :aria-pressed="isFrozen(item.row)" :aria-label="isFrozen(item.row) ? 'Unfreeze this row' : 'Freeze this row'"
                        @click.stop="toggleFreeze(item.row)">
                  <ApexIcon :name="isFrozen(item.row) ? unfreezeIcon : freezeIcon" :size="17" />
                </button>
              </td>
              <td v-if="gutter" class="apex-dt__gutter">
                <span v-if="hasCheckbox" class="apex-cb__box" :data-on="isSelected(item.row)" role="checkbox"
                      :aria-checked="isSelected(item.row)" :aria-label="`Select row ${item.index + 1}`"
                      @click.stop="selectRow(item.row, item.index)">
                  <ApexIcon v-if="isSelected(item.row)" name="check" :size="14" />
                </span>
                <span v-else class="apex-radio__dot" role="radio" :aria-checked="isSelected(item.row)"
                      :data-on="isSelected(item.row)" :aria-label="`Select row ${item.index + 1}`"
                      @click.stop="selectRow(item.row, item.index)"></span>
              </td>
              <td v-for="(col, ci) in cols" v-show="spanFor(item.row, ci) !== 0" :key="ci"
                  :rowspan="spanFor(item.row, ci)"
                  :style="cellStyle(col, ci)" :class="cellClasses(col, item.row)"
                  :data-span="spanFor(item.row, ci) ? 'true' : undefined"
                  :data-frozen="col.frozen ? (col.alignFrozen === 'right' ? 'end' : 'start') : undefined"
                  :data-numeric="col.format === 'number' || col.format === 'currency' || col.format === 'percent' || !!col.formula"
                  :data-editable="editMode === 'cell' && canEdit(col) ? 'true' : undefined"
                  @click="editMode === 'cell' && canEdit(col) ? startCell(item.row, col) : undefined">
                <!-- editor -->
                <div v-if="canEdit(col) && (isRowEditing(item.row) || isCellEditing(item.row, col))" class="apex-dte">
                  <slot :name="`editor:${col.field}`" :row="item.row" :column="col"
                        :value="editorValue(item.row, col)"
                        :update="(v: unknown) => onEditorInput(item.row, col, v)">
                    <select v-if="col.editorType === 'select'" class="apex-dte__ctl"
                            :value="editorValue(item.row, col) as string" :aria-label="col.header" @click.stop
                            @change="onEditorChange(item.row, col, ($event.target as HTMLSelectElement).value, item.index)">
                      <option v-for="o in col.editorOptions" :key="String(o.value)" :value="o.value">{{ o.label }}</option>
                    </select>
                    <input v-else-if="col.editorType === 'switch'" type="checkbox" class="apex-dte__box"
                           :checked="!!editorValue(item.row, col)" :aria-label="col.header" @click.stop
                           @change="onEditorChange(item.row, col, ($event.target as HTMLInputElement).checked, item.index)" />
                    <input v-else class="apex-dte__ctl"
                           :type="col.editorType === 'number' ? 'number' : col.editorType === 'date' ? 'date' : 'text'"
                           :value="editorValue(item.row, col) ?? ''" :aria-label="col.header"
                           v-focus-cell="editMode === 'cell'"
                           @click.stop @input="onEditorInput(item.row, col, ($event.target as HTMLInputElement).value)"
                           @keydown.enter.prevent="editMode === 'cell' ? commitCell() : saveRowEdit(item.row, item.index)"
                           @keydown.esc.prevent="editMode === 'cell' ? cancelCell() : cancelRowEdit(item.row, item.index)"
                           @blur="editMode === 'cell' && commitCell({ row: item.row, col })" />
                  </slot>
                </div>

                <slot v-else :name="`cell:${col.field}`" :row="item.row" :column="col" :value="cellValue(item.row, col)" :index="item.index">
                  <span v-if="col.format === 'badge'" class="apex-dt__badge" :data-tone="badgeTone(item.row, col)">
                    {{ display(item.row, col) }}
                  </span>
                  <ApexIcon v-else-if="col.format === 'boolean'"
                            :name="cellValue(item.row, col) ? 'check_circle' : 'remove'" :size="18"
                            :style="{ color: cellValue(item.row, col) ? 'var(--accent-success)' : 'var(--fg-subtle)' }" />
                  <span v-else-if="col.format === 'image'" class="apex-dt__media">
                    <img :src="String(cellValue(item.row, col) ?? '')" :alt="imageAlt(item.row, col)"
                         :style="{ width: (col.imageSize || 40) + 'px', height: (col.imageSize || 40) + 'px', borderRadius: col.imageRadius || 'var(--r-sm)' }" />
                    <span v-if="col.subField" class="apex-dt__sub">{{ getField(item.row, col.subField) }}</span>
                  </span>
                  <span v-else-if="col.subField" class="apex-dt__stack">
                    <span>{{ display(item.row, col) }}</span>
                    <span class="apex-dt__sub">{{ getField(item.row, col.subField) }}</span>
                  </span>
                  <template v-else>{{ display(item.row, col) }}</template>
                </slot>
              </td>
            </tr>
            <tr v-if="item.kind === 'row' && rowExpansion && isExpanded(item.row)"
                :key="(dataKey ? keyOf(item.row) : item.index) + '-detail'" class="apex-dt__detail">
              <td :colspan="colCount">
                <slot name="expansion" :row="item.row" :index="item.index">
                  <dl class="apex-dt__detailgrid">
                    <template v-for="col in cols" :key="col.field || col.header">
                      <dt>{{ col.header }}</dt>
                      <dd>{{ display(item.row, col) || '—' }}</dd>
                    </template>
                  </dl>
                </slot>
              </td>
            </tr>
            </template>
          </template>

          <tr v-else class="apex-dt__empty">
            <td :colspan="colCount">
              <slot name="empty">
                <ApexIcon name="inbox" :size="26" />
                <span>{{ emptyMessage || 'No records found' }}</span>
              </slot>
            </td>
          </tr>
        </tbody>

        <tfoot v-if="wantsFooter && renderItems.length">
          <tr v-for="f in footerRows" :key="f.label">
            <td v-if="editorGutter" class="apex-dt__gutter"></td>
            <td v-if="expandGutter" class="apex-dt__gutter"></td>
            <td v-if="lockGutter" class="apex-dt__gutter"></td>
            <td v-if="gutter" class="apex-dt__gutter"></td>
            <td v-for="(col, ci) in cols" :key="ci" :style="cellStyle(col, ci)"
                :data-frozen="col.frozen ? (col.alignFrozen === 'right' ? 'end' : 'start') : undefined">
              <span v-if="ci === 0 && !col.aggregate" class="apex-dt__footlabel">{{ f.label }}</span>
              <template v-else-if="col.aggregate">
                {{ formatCell(aggregate(f.rows, col), col, locale) }}
              </template>
            </td>
          </tr>
        </tfoot>
      </table>
      </div>
      <div v-if="loading && loadingMode === 'overlay'" class="apex-dt__overlay">
        <slot name="loading">
          <ApexIcon name="progress_activity" spin :size="30" />
        </slot>
      </div>
    </div>

    <ApexPaginator v-if="paginator" :first="pageFirst" :rows="pageRows" :total-records="total"
                   :rows-per-page-options="rowsPerPageOptions" :template="paginatorTemplate"
                   :disabled="loading" @page="onPage" />

    <slot name="footer" />
  </div>
</template>
