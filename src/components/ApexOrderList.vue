<script setup lang="ts">
/**
 * ApexOrderList — reorder a collection by dragging, or with the move controls.
 *
 * `v-model` is the array itself, in its current order. `v-model:selection`
 * holds the chosen values; `checkbox` renders a box per row for a visual
 * multi-select alongside the reordering. `filter` adds a search box — dragging
 * is suspended while a query is active, since the visible order is partial.
 */
import { computed, nextTick, ref } from 'vue';
import ApexField from './ApexField.vue';
import ApexIcon from './ApexIcon.vue';
import { normaliseOptions, pickFieldProps } from '../core/utils';
import { useApexI18n } from '../core/i18n';
import type { ApexFieldProps, ApexOption, ApexOptionsInput } from '../types';

const props = withDefaults(defineProps<ApexFieldProps & {
  /** The collection, in order. */
  modelValue?: ApexOptionsInput;
  /** Chosen values. */
  selection?: unknown[];
  /** A checkbox per row. */
  checkbox?: boolean;
  /** Allow more than one row to be selected. Implied by `checkbox`. */
  multiple?: boolean;
  /** Search box above the list. */
  filter?: boolean;
  filterPlaceholder?: string;
  /** List height cap in pixels. */
  scrollHeight?: number;
  /** Which side the move controls sit on. */
  controls?: 'start' | 'end' | 'top' | 'none';
  /** How the controls align along the list — top, centre or bottom. */
  controlsAlign?: 'start' | 'center' | 'end';
  /** Include the jump-to-top and jump-to-bottom buttons. */
  extremes?: boolean;
  /** Turn off drag-and-drop, leaving only the buttons. */
  noDrag?: boolean;
  emptyMessage?: string;
}>(), { scrollHeight: 280, controls: 'start', controlsAlign: 'start', extremes: true, statusIcon: false });

const emit = defineEmits<{
  (e: 'update:modelValue', v: unknown[]): void;
  (e: 'update:selection', v: unknown[]): void;
  (e: 'reorder', payload: { from: number; to: number }): void;
  (e: 'change'): void;
}>();

const t = useApexI18n();
const query = ref('');
const listEl = ref<HTMLElement | null>(null);
const dragFrom = ref<number | null>(null);
const dragOver = ref<number | null>(null);

const items = computed<ApexOption[]>(() => normaliseOptions(props.modelValue));
const many = computed(() => props.checkbox || props.multiple);
const chosen = computed<unknown[]>(() => props.selection || []);
const filtering = computed(() => !!query.value.trim());
const canDrag = computed(() => !props.noDrag && !filtering.value && !props.disabled && !props.readonly);
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));

const visible = computed(() => {
  const q = query.value.toLowerCase().trim();
  return q ? items.value.filter((o) => o.label.toLowerCase().includes(q)) : items.value;
});
/** Indexes of the chosen rows in the full array, ascending. */
const chosenIndexes = computed(() =>
  items.value.reduce<number[]>((acc, o, i) => (chosen.value.includes(o.value) ? [...acc, i] : acc), []));

const isChosen = (o: ApexOption) => chosen.value.includes(o.value);
const canUp = computed(() => chosenIndexes.value.length > 0 && chosenIndexes.value[0] > 0);
const canDown = computed(() => {
  const idx = chosenIndexes.value;
  return idx.length > 0 && idx[idx.length - 1] < items.value.length - 1;
});

function toggle(o: ApexOption, event: MouseEvent) {
  if (props.disabled || props.readonly || o.disabled) return;
  if (!many.value) {
    emit('update:selection', isChosen(o) ? [] : [o.value]);
    return;
  }
  const cur = [...chosen.value];
  const i = cur.indexOf(o.value);
  // plain click replaces the selection unless a modifier or checkbox mode says otherwise
  if (!props.checkbox && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
    emit('update:selection', i >= 0 && cur.length === 1 ? [] : [o.value]);
    return;
  }
  if (i >= 0) cur.splice(i, 1);
  else cur.push(o.value);
  emit('update:selection', cur);
}

/** Emits the reordered collection in the same shape it arrived in. */
function apply(order: number[], from: number, to: number, refocus?: number) {
  const src = (props.modelValue || []) as unknown[];
  emit('update:modelValue', order.map((i) => src[i]));
  emit('reorder', { from, to });
  emit('change');
  // the list re-renders around the moved row, so put focus back on it —
  // otherwise alt+arrow only works once per selection
  if (refocus != null) {
    nextTick(() => {
      listEl.value?.querySelector<HTMLElement>(`[data-index="${refocus}"]`)?.focus();
    });
  }
}
const identity = () => items.value.map((_, i) => i);
const chosenAt = (order: number[], pos: number) => chosen.value.includes(items.value[order[pos]]?.value);

function move(delta: number) {
  const idx = chosenIndexes.value;
  if (!idx.length) return;
  const order = identity();
  // walk from the edge we're moving toward, so a run of rows shifts as a block
  const positions = delta < 0 ? order.map((_, i) => i) : order.map((_, i) => order.length - 1 - i);
  let moved = false;
  positions.forEach((pos) => {
    if (!chosenAt(order, pos)) return;
    const j = pos + delta;
    if (j < 0 || j >= order.length || chosenAt(order, j)) return;
    [order[pos], order[j]] = [order[j], order[pos]];
    moved = true;
  });
  if (moved) apply(order, idx[0], idx[0] + delta);
}
function moveToEdge(end: boolean) {
  const idx = chosenIndexes.value;
  if (!idx.length) return;
  const rest = identity().filter((i) => !idx.includes(i));
  const order = end ? [...rest, ...idx] : [...idx, ...rest];
  apply(order, idx[0], end ? order.length - 1 : 0);
}

/* ── drag and drop ──────────────────────────────────────── */
function onDragStart(i: number, e: DragEvent) {
  if (!canDrag.value) { e.preventDefault(); return; }
  dragFrom.value = i;
  e.dataTransfer?.setData('text/plain', String(i));
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
}
function onDragOver(i: number, e: DragEvent) {
  if (dragFrom.value === null) return;
  e.preventDefault();
  dragOver.value = i;
}
function onDrop(i: number) {
  const from = dragFrom.value;
  dragFrom.value = null;
  dragOver.value = null;
  if (from === null || from === i) return;
  const order = identity();
  order.splice(i, 0, ...order.splice(from, 1));
  apply(order, from, i);
}
function onDragEnd() { dragFrom.value = null; dragOver.value = null; }

/** Keyboard reordering: alt+arrows move the focused row. */
function onRowKey(i: number, o: ApexOption, e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(o, e as unknown as MouseEvent); return; }
  if (!e.altKey || props.disabled || filtering.value) return;
  const delta = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
  if (!delta) return;
  e.preventDefault();
  const j = i + delta;
  if (j < 0 || j >= items.value.length) return;
  const order = identity();
  [order[i], order[j]] = [order[j], order[i]];
  apply(order, i, j, j);
}
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" v-slot="{ id, describedBy, invalid }">
    <div class="apex-order" :data-controls="controls" :data-controls-align="controlsAlign"
         :data-disabled="disabled ? 'true' : 'false'">
      <div v-if="controls !== 'none'" class="apex-order__controls">
        <button type="button" class="apex-order__btn" :disabled="disabled || !canUp || filtering"
                :aria-label="'Move up'" @click="move(-1)"><ApexIcon name="keyboard_arrow_up" :size="19" /></button>
        <button v-if="extremes" type="button" class="apex-order__btn" :disabled="disabled || !canUp || filtering"
                :aria-label="'Move to top'" @click="moveToEdge(false)"><ApexIcon name="keyboard_double_arrow_up" :size="19" /></button>
        <button v-if="extremes" type="button" class="apex-order__btn" :disabled="disabled || !canDown || filtering"
                :aria-label="'Move to bottom'" @click="moveToEdge(true)"><ApexIcon name="keyboard_double_arrow_down" :size="19" /></button>
        <button type="button" class="apex-order__btn" :disabled="disabled || !canDown || filtering"
                :aria-label="'Move down'" @click="move(1)"><ApexIcon name="keyboard_arrow_down" :size="19" /></button>
      </div>

      <div class="apex-order__panel">
        <div v-if="filter" class="apex-pop__filter">
          <ApexIcon name="search" />
          <input type="text" :value="query" :placeholder="filterPlaceholder || t('apexui.search')"
                 :aria-label="t('apexui.search')" autocomplete="off" :disabled="disabled"
                 @input="query = ($event.target as HTMLInputElement).value" />
          <button v-if="query" type="button" class="apex-ctl__btn" :aria-label="t('apexui.clear')" @click="query = ''">
            <ApexIcon name="close" :size="16" />
          </button>
        </div>

        <ul ref="listEl" class="apex-order__list" :id="id" role="listbox" :aria-multiselectable="many || undefined"
            :aria-describedby="describedBy" :aria-invalid="invalid || undefined"
            :aria-label="labelPlacement === 'hidden' ? label : undefined"
            :style="{ maxHeight: scrollHeight + 'px' }">
          <li v-for="(o, vi) in visible" :key="String(o.value)" class="apex-order__row" role="option"
              :aria-selected="isChosen(o)" :aria-disabled="o.disabled || undefined"
              :tabindex="disabled ? -1 : 0" :data-index="items.indexOf(o)"
              :data-selected="isChosen(o) ? 'true' : 'false'"
              :data-disabled="o.disabled ? 'true' : 'false'"
              :data-dragging="dragFrom === items.indexOf(o) ? 'true' : 'false'"
              :data-dragover="dragOver === items.indexOf(o) ? 'true' : 'false'"
              :draggable="canDrag && !o.disabled"
              @click="toggle(o, $event)"
              @keydown="onRowKey(items.indexOf(o), o, $event)"
              @dragstart="onDragStart(items.indexOf(o), $event)"
              @dragover="onDragOver(items.indexOf(o), $event)"
              @drop.prevent="onDrop(items.indexOf(o))"
              @dragend="onDragEnd">
            <ApexIcon v-if="canDrag" name="drag_indicator" class="apex-order__grip" :size="18" />
            <span v-if="checkbox" class="apex-cb__box" :data-on="isChosen(o)" aria-hidden="true">
              <ApexIcon v-if="isChosen(o)" name="check" :size="14" />
            </span>
            <img v-if="o.image" class="apex-pop__img" :src="o.image" alt="" />
            <ApexIcon v-else-if="o.icon" :name="o.icon" :size="18" />
            <span class="apex-order__txt">
              <slot name="item" :item="o" :index="items.indexOf(o)">{{ o.label }}</slot>
              <span v-if="o.help" class="apex-pop__help">{{ o.help }}</span>
            </span>
            <span class="apex-order__num">{{ items.indexOf(o) + 1 }}</span>
          </li>
          <li v-if="!visible.length" class="apex-pop__empty" role="presentation">
            {{ emptyMessage || t('apexui.noResults') }}
          </li>
        </ul>
      </div>
    </div>
  </ApexField>
</template>
