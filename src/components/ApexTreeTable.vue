<script setup lang="ts">
/**
 * ApexTreeTable — hierarchical data in tabular form: the data table's column
 * model over the tree's row model.
 *
 * Rows come from a flattened list, so keyboard navigation is index-based and
 * only visible rows exist in the DOM. Sorting reorders siblings at every level
 * rather than flattening the hierarchy, and paging applies to root nodes.
 */
import { computed, ref, watch } from 'vue';
import ApexIcon from './ApexIcon.vue';
import type { ApexTreeTableClasses } from '../types';
import ApexPaginator from './ApexPaginator.vue';
import { useApexI18n } from '../core/i18n';
import { cellValue, formatCell, nextOrder, type ColumnDef, type SortMeta, type SortOrder } from '../core/table';
import {
  aggregateTree, cascadeChecks, filterTreeRows, flattenTree, rowOf, setBranchChecked, sortTree,
  type CheckState, type FlatNode, type TreeNode,
} from '../core/tree';

export type { TreeNode };
/** A column may carry `expander` to host the toggle. */
export type TreeColumn = ColumnDef & { expander?: boolean };

const props = withDefaults(defineProps<{
  /** Your own class on any part. See ApexTreeTableClasses. */
  ui?: ApexTreeTableClasses;
  value?: TreeNode[];
  columns?: TreeColumn[];
  expandedKeys?: Record<string, boolean>;

  /* chrome */
  size?: 'small' | 'normal' | 'large';
  gridLines?: 'none' | 'both' | 'horizontal' | 'vertical';
  striped?: boolean;
  bordered?: boolean;
  indent?: number;
  caption?: string;

  /* selection */
  selectionMode?: 'single' | 'multiple' | 'checkbox' | null;
  selectionKeys?: Record<string, boolean | CheckState>;
  metaKeySelection?: boolean;

  /* sorting */
  sortMode?: 'single' | 'multiple';
  sortField?: string;
  sortOrder?: SortOrder;
  multiSortMeta?: SortMeta[];
  removableSort?: boolean;

  /* filtering */
  filters?: Record<string, { value?: unknown; matchMode?: string }>;
  filterDisplay?: 'row' | null;
  filterMode?: 'lenient' | 'strict';
  showGlobalFilter?: boolean;

  /* paging */
  paginator?: boolean;
  rows?: number;
  first?: number;
  rowsPerPageOptions?: number[];
  lazy?: boolean;
  totalRecords?: number;

  /* scrolling */
  scrollable?: boolean;
  scrollHeight?: string;
  tableMinWidth?: string;

  /* states */
  loading?: boolean;
  loadingMode?: 'overlay' | 'skeleton';
  skeletonRows?: number;
  emptyMessage?: string;

  showFooter?: boolean;
}>(), {
  size: 'normal', gridLines: 'horizontal', bordered: true, indent: 18,
  selectionMode: null, sortMode: 'single', removableSort: true,
  filterMode: 'lenient', rows: 10, first: 0,
  loadingMode: 'overlay', skeletonRows: 5,
});

const emit = defineEmits<{
  (e: 'update:expandedKeys', v: Record<string, boolean>): void;
  (e: 'update:selectionKeys', v: Record<string, boolean | CheckState>): void;
  (e: 'update:filters', v: Record<string, { value?: unknown; matchMode?: string }>): void;
  (e: 'update:first', v: number): void;
  (e: 'update:rows', v: number): void;
  (e: 'update:sortField', v: string | undefined): void;
  (e: 'update:sortOrder', v: SortOrder): void;
  (e: 'update:multiSortMeta', v: SortMeta[]): void;
  (e: 'node-expand' | 'node-collapse', node: TreeNode): void;
  (e: 'node-select' | 'node-unselect', node: TreeNode): void;
  (e: 'sort', payload: { sortField?: string; sortOrder: SortOrder; multiSortMeta: SortMeta[] }): void;
  (e: 'page', payload: { first: number; rows: number; page: number }): void;
  (e: 'filter', payload: { filters: Record<string, { value?: unknown; matchMode?: string }> }): void;
}>();

const t = useApexI18n();
const source = computed(() => props.value || []);
const cols = computed<TreeColumn[]>(() => (props.columns || []).filter((c) => !c.hidden));
const expanderIndex = computed(() => {
  const i = cols.value.findIndex((c) => c.expander);
  return i < 0 ? 0 : i;
});

/* ── expansion ──────────────────────────────────────────── */
const localExpanded = ref<Record<string, boolean>>({});
const expanded = computed(() => props.expandedKeys ?? localExpanded.value);
function setExpanded(next: Record<string, boolean>) {
  localExpanded.value = next;
  emit('update:expandedKeys', next);
}
function toggle(node: TreeNode) {
  const next = { ...expanded.value };
  if (next[node.key]) { delete next[node.key]; setExpanded(next); emit('node-collapse', node); return; }
  next[node.key] = true;
  setExpanded(next);
  emit('node-expand', node);
}

/* ── filter → sort → page ───────────────────────────────── */
const localFilters = ref<Record<string, { value?: unknown; matchMode?: string }>>({});
const filterModel = computed(() => props.filters ?? localFilters.value);
function setFilter(field: string, value: unknown, matchMode?: string) {
  const next = { ...filterModel.value, [field]: { value, matchMode: matchMode ?? filterModel.value[field]?.matchMode } };
  localFilters.value = next;
  emit('update:filters', next);
  emit('filter', { filters: next });
  pageFirst.value = 0;
}
const filterActive = computed(() => Object.values(filterModel.value)
  .some((m) => m && m.value != null && m.value !== '' && !(Array.isArray(m.value) && !m.value.length)));
function clearFilters() {
  localFilters.value = {};
  emit('update:filters', {});
  emit('filter', { filters: {} });
}

const localSort = ref<SortMeta[]>([]);
const sortMeta = computed<SortMeta[]>(() => {
  if (props.sortMode === 'multiple') return props.multiSortMeta ?? localSort.value;
  if (props.sortField) return [{ field: props.sortField, order: props.sortOrder ?? 1 }];
  return localSort.value.slice(0, 1);
});
watch(() => [props.sortField, props.multiSortMeta], () => {
  if (props.sortMode === 'multiple' && props.multiSortMeta) localSort.value = props.multiSortMeta;
  else if (props.sortField) localSort.value = [{ field: props.sortField, order: props.sortOrder ?? 1 }];
}, { immediate: true });

const orderOf = (field?: string): SortOrder =>
  (field ? ((sortMeta.value.find((m) => m.field === field)?.order ?? 0) as SortOrder) : 0);
const rankOf = (field?: string) => {
  if (!field || props.sortMode !== 'multiple') return 0;
  const i = sortMeta.value.findIndex((m) => m.field === field && m.order);
  return i < 0 ? 0 : i + 1;
};
function toggleSort(col: TreeColumn, event: MouseEvent) {
  if (!col.sortable || !col.field) return;
  const order = nextOrder(orderOf(col.field), props.removableSort);
  const additive = props.sortMode === 'multiple' && (event.metaKey || event.ctrlKey);
  let next: SortMeta[];
  if (additive) {
    next = sortMeta.value.filter((m) => m.field !== col.field);
    if (order) next.push({ field: col.field, order });
  } else next = order ? [{ field: col.field, order }] : [];
  localSort.value = next;
  emit('update:multiSortMeta', next);
  emit('update:sortField', next[0]?.field);
  emit('update:sortOrder', (next[0]?.order ?? 0) as SortOrder);
  emit('sort', { sortField: next[0]?.field, sortOrder: (next[0]?.order ?? 0) as SortOrder, multiSortMeta: next });
}

const filtered = computed(() => (props.lazy
  ? source.value
  : filterTreeRows(source.value, filterModel.value, cols.value, props.filterMode)));
const sorted = computed(() => (props.lazy ? filtered.value : sortTree(filtered.value, sortMeta.value, cols.value)));

const pageFirst = ref(props.first);
watch(() => props.first, (v) => { pageFirst.value = v; });
const pageRows = ref(props.rows);
watch(() => props.rows, (v) => { pageRows.value = v; });
const total = computed(() => (props.lazy ? (props.totalRecords ?? sorted.value.length) : sorted.value.length));
/** Paging applies to root nodes; a page carries whole branches. */
const paged = computed(() => (!props.paginator || props.lazy
  ? sorted.value
  : sorted.value.slice(pageFirst.value, pageFirst.value + pageRows.value)));
watch(total, (n) => {
  if (!props.paginator || props.lazy) return;
  if (pageFirst.value >= n) {
    const first = Math.max(0, (Math.ceil(n / pageRows.value) - 1) * pageRows.value);
    pageFirst.value = first;
    emit('update:first', first);
  }
});
function onPage(payload: { first: number; rows: number; page: number }) {
  pageFirst.value = payload.first;
  pageRows.value = payload.rows;
  emit('update:first', payload.first);
  emit('update:rows', payload.rows);
  emit('page', payload);
}

const flat = computed<FlatNode[]>(() => flattenTree(paged.value, expanded.value, props.lazy));

/* ── selection ──────────────────────────────────────────── */
const localSelection = ref<Record<string, boolean | CheckState>>({});
const selection = computed(() => props.selectionKeys ?? localSelection.value);
const isCheckbox = computed(() => props.selectionMode === 'checkbox');
function setSelection(next: Record<string, boolean | CheckState>) {
  localSelection.value = next;
  emit('update:selectionKeys', next);
}
const stateOf = (node: TreeNode): 'on' | 'off' | 'partial' => {
  const v = selection.value[node.key];
  if (isCheckbox.value) {
    const s = (v || {}) as CheckState;
    return s.checked ? 'on' : (s.partialChecked ? 'partial' : 'off');
  }
  return v ? 'on' : 'off';
};
function select(node: TreeNode, e?: MouseEvent | KeyboardEvent) {
  if (!props.selectionMode || node.selectable === false) return;
  const on = stateOf(node) === 'on';
  if (isCheckbox.value) {
    setSelection(setBranchChecked(source.value, node, !on, selection.value as Record<string, CheckState>));
  } else if (props.selectionMode === 'single') {
    setSelection(on ? {} : { [node.key]: true });
  } else {
    const additive = !props.metaKeySelection
      || !!(e && ((e as MouseEvent).metaKey || (e as MouseEvent).ctrlKey || (e as MouseEvent).shiftKey));
    if (!additive) setSelection(on && Object.keys(selection.value).length === 1 ? {} : { [node.key]: true });
    else {
      const next = { ...selection.value };
      if (on) delete next[node.key]; else next[node.key] = true;
      setSelection(next);
    }
  }
  emit(on ? 'node-unselect' : 'node-select', node);
}
function selectAllVisible() {
  if (!isCheckbox.value) return;
  const draft: Record<string, CheckState> = {};
  flat.value.forEach((r) => { if (!r.hasChildren) draft[r.node.key] = { checked: true, partialChecked: false }; });
  setSelection(cascadeChecks(source.value, draft));
}

/* ── keyboard ───────────────────────────────────────────── */
const focusIndex = ref(-1);
const anchor = ref(-1);
const bodyEl = ref<HTMLElement | null>(null);
function focusRow(i: number) {
  const n = flat.value.length;
  if (!n) return;
  focusIndex.value = Math.min(Math.max(0, i), n - 1);
  bodyEl.value?.querySelector<HTMLElement>(`[data-row="${focusIndex.value}"]`)?.focus();
}
function onKey(i: number, row: FlatNode, e: KeyboardEvent) {
  const many = props.selectionMode === 'multiple' || isCheckbox.value;
  switch (e.key) {
    case 'ArrowDown':
    case 'ArrowUp': {
      e.preventDefault();
      const to = i + (e.key === 'ArrowDown' ? 1 : -1);
      focusRow(to);
      if (e.shiftKey && many) {
        if (anchor.value < 0) anchor.value = i;
        const lo = Math.min(anchor.value, focusIndex.value);
        const hi = Math.max(anchor.value, focusIndex.value);
        if (isCheckbox.value) {
          const draft: Record<string, CheckState> = { ...(selection.value as Record<string, CheckState>) };
          flat.value.slice(lo, hi + 1).forEach((r) => { draft[r.node.key] = { checked: true, partialChecked: false }; });
          setSelection(cascadeChecks(source.value, draft));
        } else {
          const draft = { ...selection.value };
          flat.value.slice(lo, hi + 1).forEach((r) => { draft[r.node.key] = true; });
          setSelection(draft);
        }
      } else anchor.value = focusIndex.value;
      break;
    }
    case 'Home': e.preventDefault(); focusRow(0); break;
    case 'End': e.preventDefault(); focusRow(flat.value.length - 1); break;
    case 'ArrowRight':
      e.preventDefault();
      if (row.hasChildren && !expanded.value[row.node.key]) toggle(row.node); else focusRow(i + 1);
      break;
    case 'ArrowLeft':
      e.preventDefault();
      if (row.hasChildren && expanded.value[row.node.key]) toggle(row.node);
      else {
        const up = flat.value.slice(0, i).reverse().findIndex((r) => r.depth < row.depth);
        if (up >= 0) focusRow(i - 1 - up);
      }
      break;
    case ' ':
    case 'Enter': e.preventDefault(); anchor.value = i; select(row.node, e); break;
    default: break;
  }
}

/* ── presentation ───────────────────────────────────────── */
const rootStyle = computed(() => {
  /* No --apex-tt-indent here. It was declared on .apex-tt and written from
     this line, and nothing ever read either: the rows are indented by an
     inline style computed from the `indent` prop — `row.depth * indent` — so
     overriding the variable moved nothing. Removed in AF2-257 rather than
     documented as themable in AF2-258. `indent` is the real API. */
  const s: Record<string, string> = {};
  if (props.scrollHeight) s['--apex-dt-scroll-h'] = props.scrollHeight;
  if (props.tableMinWidth) s['--apex-dt-min-w'] = props.tableMinWidth;
  return s;
});
function cellStyle(col: TreeColumn) {
  const s: Record<string, string> = {};
  if (col.width) { s.width = col.width; s.minWidth = col.width; }
  else if (col.minWidth) s.minWidth = col.minWidth;
  if (col.align) s.textAlign = col.align === 'start' ? 'start' : col.align === 'end' ? 'end' : 'center';
  if (col.background) s.background = col.background;
  if (col.color) s.color = col.color;
  return s;
}
const display = (node: TreeNode, col: TreeColumn) => formatCell(cellValue(rowOf(node), col), col);
const badgeTone = (node: TreeNode, col: TreeColumn) => {
  const v = String(cellValue(rowOf(node), col) ?? '');
  return col.badgeTones?.[v] || 'neutral';
};
const isNumeric = (col: TreeColumn) => col.format === 'number' || col.format === 'currency'
  || col.format === 'percent' || !!col.formula;
const wantsFooter = computed(() => props.showFooter ?? cols.value.some((c) => c.aggregate));
const gutter = computed(() => (isCheckbox.value ? 1 : 0));
const colCount = computed(() => cols.value.length + gutter.value);
defineExpose({ focusRow, toggle, select, selectAllVisible });
</script>

<template>
  <div class="apex-dt apex-tt" :class="ui?.root" :style="rootStyle" :data-size="size" :data-grid="gridLines"
       :data-striped="striped ? 'true' : 'false'" :data-bordered="bordered ? 'true' : 'false'"
       :data-hover="true" :data-loading="loading ? 'true' : 'false'">
    <div v-if="caption || showGlobalFilter || $slots.header" class="apex-dt__bar" :class="ui?.bar">
      <slot name="header">
        <p v-if="caption" class="apex-dt__caption" :class="ui?.caption">{{ caption }}</p>
        <div v-if="showGlobalFilter" class="apex-pop__filter apex-dt__global">
          <ApexIcon name="search" />
          <input type="text" :value="(filterModel.global && filterModel.global.value) || ''"
                 :placeholder="t('apexui.search')" :aria-label="t('apexui.search')"
                 @input="setFilter('global', ($event.target as HTMLInputElement).value, 'contains')" />
        </div>
        <button v-if="filterActive" type="button" class="apex-dt__clear" @click="clearFilters">
          <ApexIcon name="filter_alt_off" :size="16" /> {{ t('apexui.clear') }}
        </button>
      </slot>
    </div>

    <div class="apex-dt__main" :class="ui?.main">
      <div class="apex-dt__viewport" :class="ui?.viewport" :data-scrollable="scrollable ? 'true' : 'false'">
        <table class="apex-dt__table" :class="ui?.table" :data-frozen-head="scrollable ? 'true' : 'false'">
          <thead>
            <tr>
              <th v-if="gutter" class="apex-dt__gutter" scope="col"></th>
              <th v-for="(col, ci) in cols" :key="ci" scope="col" :style="cellStyle(col)"
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
              </th>
            </tr>
            <tr v-if="filterDisplay === 'row'" class="apex-dt__filterrow" :class="ui?.filterRow">
              <th v-if="gutter" class="apex-dt__gutter"></th>
              <th v-for="(col, ci) in cols" :key="ci" :style="cellStyle(col)">
                <slot v-if="col.filter" :name="`filter:${col.field}`" :column="col">
                  <select v-if="col.filterType === 'select'" class="apex-dtf__ctl"
                          :value="(filterModel[col.field!] && filterModel[col.field!].value) || ''"
                          :aria-label="`Filter ${col.header}`"
                          @change="setFilter(col.field!, ($event.target as HTMLSelectElement).value, 'equals')">
                    <option value="">{{ t('apexui.select') }}</option>
                    <option v-for="o in col.filterOptions" :key="String(o.value)" :value="o.value">{{ o.label }}</option>
                  </select>
                  <input v-else class="apex-dtf__ctl" :type="col.filterType === 'number' ? 'number' : 'text'"
                         :value="(filterModel[col.field!] && filterModel[col.field!].value) || ''"
                         :placeholder="t('apexui.search')" :aria-label="`Filter ${col.header}`"
                         @input="setFilter(col.field!, ($event.target as HTMLInputElement).value, col.filterMatchMode || 'contains')" />
                </slot>
              </th>
            </tr>
          </thead>

          <tbody ref="bodyEl">
            <template v-if="loading && loadingMode === 'skeleton'">
              <tr v-for="n in skeletonRows" :key="'sk' + n" class="apex-dt__skeleton">
                <td v-if="gutter" class="apex-dt__gutter"><span class="apex-skel" style="width:18px"></span></td>
                <td v-for="(col, ci) in cols" :key="ci" :style="cellStyle(col)">
                  <span class="apex-skel" :style="{ width: (40 + ((ci * 17) % 45)) + '%',
                        marginInlineStart: ci === expanderIndex ? ((n % 3) * indent) + 'px' : undefined }"></span>
                </td>
              </tr>
            </template>

            <template v-else-if="flat.length">
              <tr v-for="(row, i) in flat" :key="row.node.key" :data-row="i"
                  :class="[row.node.styleClass, ui?.row]" :data-selected="stateOf(row.node) === 'on' ? 'true' : 'false'"
                  :data-depth="row.depth"
                  :aria-expanded="row.hasChildren ? !!expanded[row.node.key] : undefined"
                  :aria-selected="selectionMode ? stateOf(row.node) === 'on' : undefined"
                  :tabindex="selectionMode || true ? 0 : -1"
                  @click="select(row.node, $event)" @keydown="onKey(i, row, $event)"
                  @focus="focusIndex = i">
                <td v-if="gutter" class="apex-dt__gutter">
                  <span class="apex-cb__box" :data-on="stateOf(row.node) === 'on'"
                        :data-partial="stateOf(row.node) === 'partial'" role="checkbox"
                        :aria-checked="stateOf(row.node) === 'on'" @click.stop="select(row.node)">
                    <ApexIcon v-if="stateOf(row.node) === 'on'" name="check" :size="14" />
                    <ApexIcon v-else-if="stateOf(row.node) === 'partial'" name="remove" :size="14" />
                  </span>
                </td>
                <td v-for="(col, ci) in cols" :key="ci" :style="cellStyle(col)"
                    :data-numeric="isNumeric(col)">
                  <span v-if="ci === expanderIndex" class="apex-tt__cell" :class="ui?.cell"
                        :style="{ paddingInlineStart: (row.depth * indent) + 'px' }">
                    <button v-if="row.hasChildren" type="button" class="apex-tr__toggle" :class="ui?.toggle"
                            :aria-label="expanded[row.node.key] ? 'Collapse' : 'Expand'"
                            @click.stop="toggle(row.node)">
                      <ApexIcon v-if="row.node.loading" name="progress_activity" spin :size="17" />
                      <ApexIcon v-else :name="expanded[row.node.key] ? 'keyboard_arrow_down' : 'chevron_right'" :size="18" />
                    </button>
                    <span v-else class="apex-tr__spacer"></span>
                    <ApexIcon v-if="row.node.icon" :name="row.node.icon" class="apex-tr__icon" :size="18" />
                    <slot :name="`cell:${col.field}`" :node="row.node" :column="col"
                          :value="cellValue(rowOf(row.node), col)" :index="i">
                      <span class="apex-tt__label" :class="ui?.label">{{ display(row.node, col) || row.node.label }}</span>
                    </slot>
                  </span>
                  <slot v-else :name="`cell:${col.field}`" :node="row.node" :column="col"
                        :value="cellValue(rowOf(row.node), col)" :index="i">
                    <span v-if="col.format === 'badge'" class="apex-dt__badge" :data-tone="badgeTone(row.node, col)">
                      {{ display(row.node, col) }}
                    </span>
                    <ApexIcon v-else-if="col.format === 'boolean'"
                              :name="cellValue(rowOf(row.node), col) ? 'check_circle' : 'remove'" :size="18"
                              :style="{ color: cellValue(rowOf(row.node), col) ? 'var(--accent-success)' : 'var(--fg-subtle)' }" />
                    <template v-else>{{ display(row.node, col) }}</template>
                  </slot>
                </td>
              </tr>
            </template>

            <tr v-else class="apex-dt__empty" :class="ui?.empty">
              <td :colspan="colCount">
                <slot name="empty">
                  <ApexIcon name="folder_open" :size="26" />
                  <span>{{ emptyMessage || 'No records found' }}</span>
                </slot>
              </td>
            </tr>
          </tbody>

          <tfoot v-if="wantsFooter && flat.length">
            <tr>
              <td v-if="gutter" class="apex-dt__gutter"></td>
              <td v-for="(col, ci) in cols" :key="ci" :style="cellStyle(col)">
                <span v-if="ci === 0 && !col.aggregate" class="apex-dt__footlabel">Total</span>
                <template v-else-if="col.aggregate">
                  {{ formatCell(aggregateTree(sorted, col, col.aggregate), col) }}
                </template>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div v-if="loading && loadingMode === 'overlay'" class="apex-dt__overlay" :class="ui?.overlay">
        <slot name="loading"><ApexIcon name="progress_activity" spin :size="30" /></slot>
      </div>
    </div>

    <ApexPaginator v-if="paginator" :first="pageFirst" :rows="pageRows" :total-records="total"
                   :rows-per-page-options="rowsPerPageOptions" :disabled="loading" @page="onPage" />
    <slot name="footer" />
  </div>
</template>
