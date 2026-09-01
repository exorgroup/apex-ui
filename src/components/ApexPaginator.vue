<script setup lang="ts">
/**
 * ApexPaginator — page controls for ApexDataTable, usable on its own.
 * `first` is the zero-based index of the first visible row, so it maps
 * straight onto a server offset.
 */
import { computed } from 'vue';
import ApexIcon from './ApexIcon.vue';

const props = withDefaults(defineProps<{
  first?: number;
  rows?: number;
  totalRecords?: number;
  /** Page-size choices; omit to hide the selector. */
  rowsPerPageOptions?: number[];
  /** Page buttons either side of the current one. */
  pageLinks?: number;
  /** e.g. 'Showing {first} to {last} of {total}'. */
  template?: string;
  disabled?: boolean;
}>(), { first: 0, rows: 10, totalRecords: 0, pageLinks: 2, template: 'Showing {first}–{last} of {total}' });

const emit = defineEmits<{
  (e: 'update:first', v: number): void;
  (e: 'update:rows', v: number): void;
  (e: 'page', payload: { first: number; rows: number; page: number }): void;
}>();

const pageCount = computed(() => Math.max(1, Math.ceil(props.totalRecords / Math.max(1, props.rows))));
const page = computed(() => Math.floor(props.first / Math.max(1, props.rows)));
const from = computed(() => (props.totalRecords ? props.first + 1 : 0));
const to = computed(() => Math.min(props.first + props.rows, props.totalRecords));

const links = computed(() => {
  const span = props.pageLinks;
  let start = Math.max(0, page.value - span);
  const end = Math.min(pageCount.value - 1, start + span * 2);
  start = Math.max(0, end - span * 2);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});
const summary = computed(() => props.template
  .replace('{first}', String(from.value))
  .replace('{last}', String(to.value))
  .replace('{total}', props.totalRecords.toLocaleString())
  .replace('{page}', String(page.value + 1))
  .replace('{pageCount}', String(pageCount.value)));

function goTo(p: number) {
  if (props.disabled) return;
  const next = Math.min(Math.max(0, p), pageCount.value - 1);
  const first = next * props.rows;
  emit('update:first', first);
  emit('page', { first, rows: props.rows, page: next });
}
function setRows(n: number) {
  emit('update:rows', n);
  emit('update:first', 0);
  emit('page', { first: 0, rows: n, page: 0 });
}
</script>

<template>
  <div class="apex-pager" :data-disabled="disabled ? 'true' : 'false'">
    <p class="apex-pager__summary">{{ summary }}</p>

    <div class="apex-pager__nav" role="group" aria-label="Pagination">
      <button type="button" class="apex-pager__btn" :disabled="disabled || page === 0"
              aria-label="First page" @click="goTo(0)"><ApexIcon name="first_page" :size="19" /></button>
      <button type="button" class="apex-pager__btn" :disabled="disabled || page === 0"
              aria-label="Previous page" @click="goTo(page - 1)"><ApexIcon name="chevron_left" :size="19" /></button>
      <button v-for="p in links" :key="p" type="button" class="apex-pager__btn apex-pager__btn--page"
              :data-current="p === page ? 'true' : 'false'" :disabled="disabled"
              :aria-current="p === page ? 'page' : undefined" :aria-label="`Page ${p + 1}`"
              @click="goTo(p)">{{ p + 1 }}</button>
      <button type="button" class="apex-pager__btn" :disabled="disabled || page >= pageCount - 1"
              aria-label="Next page" @click="goTo(page + 1)"><ApexIcon name="chevron_right" :size="19" /></button>
      <button type="button" class="apex-pager__btn" :disabled="disabled || page >= pageCount - 1"
              aria-label="Last page" @click="goTo(pageCount - 1)"><ApexIcon name="last_page" :size="19" /></button>
    </div>

    <label v-if="rowsPerPageOptions && rowsPerPageOptions.length" class="apex-pager__size">
      <span>Rows</span>
      <select :value="rows" :disabled="disabled" aria-label="Rows per page"
              @change="setRows(Number(($event.target as HTMLSelectElement).value))">
        <option v-for="n in rowsPerPageOptions" :key="n" :value="n">{{ n }}</option>
      </select>
    </label>
  </div>
</template>
