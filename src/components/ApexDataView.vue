<script setup lang="ts">
/**
 * ApexDataView — the same dataset as a list or a grid of cards, with the
 * paginator and sort pipeline ApexDataTable uses.
 *
 * Both layouts are built in: the grid is CSS grid driven by `gridMinWidth`, so
 * no utility framework is needed. Item markup comes from the `list` and `grid`
 * slots; `item` covers both when they'd be the same.
 */
import { computed, ref, watch } from 'vue';
import ApexIcon from './ApexIcon.vue';
import ApexPaginator from './ApexPaginator.vue';
import { getField, sortRows, type SortOrder } from '../core/table';
import type { ApexDataViewClasses } from '../types';

type Row = Record<string, unknown>;

const props = withDefaults(defineProps<{
  /** Your own class on any part. See ApexDataViewClasses. */
  ui?: ApexDataViewClasses;
  value?: Row[];
  dataKey?: string;
  layout?: 'list' | 'grid';
  /** Segmented control for switching layout. */
  showLayoutSwitcher?: boolean;

  /* sorting — bind these from your own UI, or pass sortOptions for the built-in select */
  sortField?: string;
  sortOrder?: SortOrder;
  sortOptions?: Array<{ label: string; field: string; order: SortOrder }>;
  sortPlaceholder?: string;

  /* paging */
  paginator?: boolean;
  rows?: number;
  first?: number;
  rowsPerPageOptions?: number[];
  paginatorTemplate?: string;
  lazy?: boolean;
  totalRecords?: number;

  /* grid shape */
  gridMinWidth?: string;
  gap?: string;

  /* chrome */
  bordered?: boolean;
  caption?: string;

  /* states */
  loading?: boolean;
  loadingMode?: 'overlay' | 'skeleton';
  skeletonCount?: number;
  emptyMessage?: string;
}>(), {
  layout: 'list', rows: 12, first: 0, gridMinWidth: '240px', gap: '0px',
  bordered: true, loadingMode: 'skeleton', skeletonCount: 6,
  paginatorTemplate: 'Showing {first}–{last} of {total}', sortPlaceholder: 'Sort by',
});

const emit = defineEmits<{
  (e: 'update:layout', v: 'list' | 'grid'): void;
  (e: 'update:first', v: number): void;
  (e: 'update:rows', v: number): void;
  (e: 'update:sortField', v: string | undefined): void;
  (e: 'update:sortOrder', v: SortOrder): void;
  (e: 'page', payload: { first: number; rows: number; page: number }): void;
  (e: 'sort', payload: { sortField?: string; sortOrder: SortOrder }): void;
}>();

const source = computed(() => props.value || []);
const sorted = computed(() => (props.lazy || !props.sortField
  ? source.value
  : sortRows(source.value, [{ field: props.sortField, order: props.sortOrder ?? 1 }], [])));
const total = computed(() => (props.lazy ? (props.totalRecords ?? sorted.value.length) : sorted.value.length));

const pageFirst = ref(props.first);
watch(() => props.first, (v) => { pageFirst.value = v; });
const pageRows = ref(props.rows);
watch(() => props.rows, (v) => { pageRows.value = v; });

const windowed = computed(() => {
  if (!props.paginator || props.lazy) return sorted.value;
  return sorted.value.slice(pageFirst.value, pageFirst.value + pageRows.value);
});
watch(total, (t) => {
  if (!props.paginator || props.lazy) return;
  if (pageFirst.value >= t) {
    const first = Math.max(0, (Math.ceil(t / pageRows.value) - 1) * pageRows.value);
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

/** The built-in sort select, when `sortOptions` is supplied. */
const sortValue = computed(() => {
  const hit = (props.sortOptions || []).findIndex(
    (o) => o.field === props.sortField && o.order === props.sortOrder,
  );
  return hit < 0 ? '' : String(hit);
});
function pickSort(index: string) {
  const o = (props.sortOptions || [])[Number(index)];
  emit('update:sortField', o?.field);
  emit('update:sortOrder', (o?.order ?? 0) as SortOrder);
  emit('sort', { sortField: o?.field, sortOrder: (o?.order ?? 0) as SortOrder });
}

const keyOf = (row: Row, i: number) => (props.dataKey ? String(getField(row, props.dataKey)) : String(i));
const rootStyle = computed(() => ({ '--apex-dv-min': props.gridMinWidth, '--apex-dv-gap': props.gap }));
const skeletons = computed(() => Array.from({ length: props.skeletonCount }, (_, i) => i));
</script>

<template>
  <div class="apex-dv" :class="ui?.root" :style="rootStyle" :data-layout="layout"
       :data-bordered="bordered ? 'true' : 'false'" :data-loading="loading ? 'true' : 'false'">
    <div v-if="caption || showLayoutSwitcher || sortOptions || $slots.header" class="apex-dv__bar" :class="ui?.bar">
      <slot name="header">
        <p v-if="caption" class="apex-dv__caption" :class="ui?.caption">{{ caption }}</p>

        <label v-if="sortOptions && sortOptions.length" class="apex-dv__sort" :class="ui?.sort">
          <span class="sr-only">{{ sortPlaceholder }}</span>
          <select :value="sortValue" :aria-label="sortPlaceholder"
                  @change="pickSort(($event.target as HTMLSelectElement).value)">
            <option value="" disabled>{{ sortPlaceholder }}</option>
            <option v-for="(o, i) in sortOptions" :key="o.label" :value="String(i)">{{ o.label }}</option>
          </select>
          <ApexIcon name="expand_more" :size="18" />
        </label>

        <div v-if="showLayoutSwitcher" class="apex-dv__switch" :class="ui?.layoutSwitch" role="radiogroup" aria-label="Layout">
          <button v-for="l in (['list', 'grid'] as const)" :key="l" type="button" role="radio"
                  :aria-checked="layout === l" :aria-label="l === 'list' ? 'List layout' : 'Grid layout'"
                  :data-on="layout === l" @click="emit('update:layout', l)">
            <ApexIcon :name="l === 'list' ? 'view_list' : 'grid_view'" :size="18" />
          </button>
        </div>
      </slot>
    </div>

    <div class="apex-dv__main" :class="ui?.main">
      <div v-if="loading && loadingMode === 'skeleton'" class="apex-dv__items" :class="ui?.items">
        <div v-for="n in skeletons" :key="'sk' + n" class="apex-dv__item apex-dv__item--skel" :class="ui?.item">
          <slot name="skeleton">
            <span class="apex-skel apex-dv__skelmedia"></span>
            <span class="apex-dv__skellines">
              <span class="apex-skel" style="width:38%"></span>
              <span class="apex-skel" style="width:70%;height:15px"></span>
              <span class="apex-skel" style="width:52%"></span>
            </span>
          </slot>
        </div>
      </div>

      <div v-else-if="windowed.length" class="apex-dv__items" :class="ui?.items">
        <div v-for="(row, i) in windowed" :key="keyOf(row, i)" class="apex-dv__item" :class="ui?.item">
          <slot v-if="layout === 'grid'" name="grid" :item="row" :index="i" :layout="layout">
            <slot name="item" :item="row" :index="i" :layout="layout" />
          </slot>
          <slot v-else name="list" :item="row" :index="i" :layout="layout">
            <slot name="item" :item="row" :index="i" :layout="layout" />
          </slot>
        </div>
      </div>

      <div v-else class="apex-dv__empty" :class="ui?.empty">
        <slot name="empty">
          <ApexIcon name="inbox" :size="26" />
          <span>{{ emptyMessage || 'No records found' }}</span>
        </slot>
      </div>

      <div v-if="loading && loadingMode === 'overlay'" class="apex-dv__overlay" :class="ui?.overlay">
        <slot name="loading"><ApexIcon name="progress_activity" spin :size="30" /></slot>
      </div>
    </div>

    <ApexPaginator v-if="paginator" :first="pageFirst" :rows="pageRows" :total-records="total"
                   :rows-per-page-options="rowsPerPageOptions" :template="paginatorTemplate"
                   :disabled="loading" @page="onPage" />
    <slot name="footer" />
  </div>
</template>
