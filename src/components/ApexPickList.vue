<script setup lang="ts">
/**
 * ApexPickList — move items between two lists, and reorder within either.
 *
 * Controlled with a two-element model: `[source, target]`. Item markup comes from
 * the `option` slot; `sourceheader` and `targetheader` replace the headers.
 * Checkbox mode adds a box per row and a select-all in the header, and works
 * alongside drag-and-drop.
 */
import { computed, ref, watch } from 'vue';
import ApexIcon from './ApexIcon.vue';
import { getField } from '../core/table';
import type { ApexPickListClasses } from '../types';

type Item = Record<string, unknown>;
type Side = 0 | 1;

const props = withDefaults(defineProps<{
  /** Your own class on any part. See ApexPickListClasses. */
  ui?: ApexPickListClasses;
  /** [source, target] */
  modelValue?: [Item[], Item[]] | Item[][];
  dataKey?: string;
  sourceHeader?: string;
  targetHeader?: string;
  /** A checkbox per row plus a select-all in each header. */
  checkbox?: boolean;
  /** Search box under each header. */
  filter?: boolean;
  filterPlaceholder?: string;
  /** Which reorder controls to show. */
  showSourceControls?: boolean;
  showTargetControls?: boolean;
  /**
   * Where each list's reorder stack sits. 'outside' keeps them clear of the centre —
   * source on the left, target on the right; 'start' or 'end' puts both on one side.
   */
  controlsPosition?: 'outside' | 'start' | 'end';
  /** Where the transfer controls sit. */
  transferPosition?: 'middle' | 'end';
  /** Stack the two lists vertically. */
  stacked?: boolean;
  scrollHeight?: number;
  noDrag?: boolean;
  emptyMessage?: string;
  disabled?: boolean;

  /* appearance */
  borderColor?: string;
  borderWidth?: number;
  radius?: string;
  headerBackground?: string;
  headerColor?: string;
  listBackground?: string;
  itemColor?: string;
  selectedBackground?: string;
  selectedColor?: string;
  selectedBorderColor?: string;
  gap?: string;
}>(), {
  showSourceControls: false, showTargetControls: false,
  controlsPosition: 'outside', transferPosition: 'middle',
  scrollHeight: 300, sourceHeader: 'Available', targetHeader: 'Selected',
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: Item[][]): void;
  (e: 'reorder', payload: { side: Side; from: number; to: number }): void;
  (e: 'move-to-target' | 'move-to-source', payload: { items: Item[] }): void;
  (e: 'move-all-to-target' | 'move-all-to-source', payload: { items: Item[] }): void;
  (e: 'selection-change', payload: { side: Side; items: Item[] }): void;
}>();

/**
 * Uncontrolled usage works: the component keeps its own copy and prefers it once an
 * edit has been made, so a one-way `:model-value` still moves items instead of
 * silently no-opping. A bound `v-model` overwrites the copy on every change.
 */
const localLists = ref<Item[][] | null>(null);
const lists = computed<Item[][]>(() => {
  const v = localLists.value ?? props.modelValue;
  return [(v && v[0]) || [], (v && v[1]) || []];
});
watch(() => props.modelValue, () => { localLists.value = null; });
const keyOf = (item: Item, i: number) => (props.dataKey ? String(getField(item, props.dataKey)) : String(i));

/* ── selection, one set per side ─────────────────────────── */
const picked = ref<[Item[], Item[]]>([[], []]);
const isPicked = (side: Side, item: Item) => picked.value[side].includes(item);

function setPicked(side: Side, items: Item[]) {
  const next: [Item[], Item[]] = [picked.value[0], picked.value[1]];
  next[side] = items;
  // a pick on one side clears the other, so the transfer controls are unambiguous
  next[side === 0 ? 1 : 0] = [];
  picked.value = next;
  emit('selection-change', { side, items });
}
function togglePick(side: Side, item: Item, e?: MouseEvent) {
  if (props.disabled) return;
  const cur = picked.value[side];
  const on = cur.includes(item);
  const additive = props.checkbox || !!(e && (e.metaKey || e.ctrlKey || e.shiftKey));
  if (!additive) { setPicked(side, on && cur.length === 1 ? [] : [item]); return; }
  setPicked(side, on ? cur.filter((x) => x !== item) : [...cur, item]);
}

/* ── filtering ──────────────────────────────────────────── */
const query = ref<[string, string]>(['', '']);
const visible = (side: Side) => {
  const q = query.value[side].toLowerCase().trim();
  if (!q) return lists.value[side];
  return lists.value[side].filter((it) => JSON.stringify(Object.values(it)).toLowerCase().includes(q));
};
const allPicked = (side: Side) => {
  const v = visible(side);
  return v.length > 0 && v.every((it) => isPicked(side, it));
};
function toggleAll(side: Side) {
  setPicked(side, allPicked(side) ? [] : visible(side).slice());
}

/* ── moving ─────────────────────────────────────────────── */
function push(next: Item[][]) {
  localLists.value = next;
  emit('update:modelValue', next);
}

function move(from: Side, all = false) {
  if (props.disabled) return;
  const to: Side = from === 0 ? 1 : 0;
  const items = all ? lists.value[from].slice() : picked.value[from].slice();
  if (!items.length) return;
  const next: Item[][] = [lists.value[0].slice(), lists.value[1].slice()];
  next[from] = next[from].filter((x) => !items.includes(x));
  next[to] = [...next[to], ...items];
  push(next);
  setPicked(from, []);
  const evt = all
    ? (from === 0 ? 'move-all-to-target' : 'move-all-to-source')
    : (from === 0 ? 'move-to-target' : 'move-to-source');
  emit(evt as 'move-to-target', { items });
}

/* ── reordering within a list ───────────────────────────── */
function shift(side: Side, delta: number, toEdge = false) {
  if (props.disabled) return;
  const list = lists.value[side];
  const sel = picked.value[side];
  if (!sel.length) return;
  const order = list.slice();
  // walk in the direction of travel so a block of selected rows keeps its order
  const indexes = sel.map((x) => order.indexOf(x)).sort((a, b) => (delta > 0 ? b - a : a - b));
  if (toEdge) {
    const rest = order.filter((x) => !sel.includes(x));
    const block = order.filter((x) => sel.includes(x));
    const next: Item[][] = [lists.value[0].slice(), lists.value[1].slice()];
    next[side] = delta > 0 ? [...rest, ...block] : [...block, ...rest];
    push(next);
    emit('reorder', { side, from: indexes[0], to: delta > 0 ? next[side].length - 1 : 0 });
    return;
  }
  let moved = false;
  indexes.forEach((i) => {
    const j = i + delta;
    if (j < 0 || j >= order.length || sel.includes(order[j])) return;
    [order[i], order[j]] = [order[j], order[i]];
    moved = true;
  });
  if (!moved) return;
  const next: Item[][] = [lists.value[0].slice(), lists.value[1].slice()];
  next[side] = order;
  push(next);
  emit('reorder', { side, from: indexes[0], to: indexes[0] + delta });
}

/* ── drag and drop, within and across lists ─────────────── */
const drag = ref<{ side: Side; index: number } | null>(null);
const over = ref<{ side: Side; index: number } | null>(null);

function onDragStart(side: Side, index: number, e: DragEvent) {
  if (props.noDrag || props.disabled) return;
  drag.value = { side, index };
  e.dataTransfer?.setData('text/plain', String(index));
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
}
function onDragOver(side: Side, index: number, e: DragEvent) {
  if (!drag.value) return;
  e.preventDefault();
  over.value = { side, index };
}
function onDrop(side: Side, index: number) {
  const from = drag.value;
  drag.value = null;
  over.value = null;
  if (!from) return;
  const next: Item[][] = [lists.value[0].slice(), lists.value[1].slice()];
  const [item] = next[from.side].splice(from.index, 1);
  if (!item) return;
  const at = from.side === side && from.index < index ? index - 1 : index;
  next[side].splice(Math.max(0, at), 0, item);
  push(next);
  if (from.side === side) emit('reorder', { side, from: from.index, to: at });
  else emit(side === 1 ? 'move-to-target' : 'move-to-source', { items: [item] });
}

const rootStyle = computed(() => {
  const s: Record<string, string> = {};
  if (props.borderColor) s['--apex-pl-border'] = props.borderColor;
  if (props.borderWidth != null) s['--apex-pl-border-w'] = props.borderWidth + 'px';
  if (props.radius) s['--apex-pl-radius'] = props.radius;
  if (props.headerBackground) s['--apex-pl-head-bg'] = props.headerBackground;
  if (props.headerColor) s['--apex-pl-head-fg'] = props.headerColor;
  if (props.listBackground) s['--apex-pl-list-bg'] = props.listBackground;
  if (props.itemColor) s['--apex-pl-item-fg'] = props.itemColor;
  if (props.selectedBackground) s['--apex-pl-sel-bg'] = props.selectedBackground;
  if (props.selectedColor) s['--apex-pl-sel-fg'] = props.selectedColor;
  if (props.selectedBorderColor) s['--apex-pl-sel-border'] = props.selectedBorderColor;
  if (props.gap) s['--apex-pl-gap'] = props.gap;
  return s;
});

const showControls = (side: Side) => (side === 0 ? props.showSourceControls : props.showTargetControls);
/** Each list occupies two order slots, so its controls can sit on either side of it. */
const ctrlsFirst = (side: Side) => (props.controlsPosition === 'outside'
  ? side === 0
  : props.controlsPosition !== 'end');
const ctrlOrder = (side: Side) => side * 3 + (ctrlsFirst(side) ? 1 : 2);
const panelOrder = (side: Side) => side * 3 + (ctrlsFirst(side) ? 2 : 1);
const headerText = (side: Side) => (side === 0 ? props.sourceHeader : props.targetHeader);
const sides: Side[] = [0, 1];
</script>

<template>
  <div class="apex-pl" :class="ui?.root" :style="rootStyle" :data-stacked="stacked ? 'true' : 'false'"
       :data-transfer="transferPosition" :data-controls="controlsPosition"
       :data-disabled="disabled ? 'true' : 'false'">
    <template v-for="side in sides" :key="side">
      <div v-if="showControls(side)" class="apex-pl__ctrls" :class="ui?.controls" :style="{ order: ctrlOrder(side) }"
           role="group" :aria-label="`Reorder ${headerText(side)}`">
        <button type="button" :disabled="disabled || !picked[side].length" aria-label="Move to top"
                @click="shift(side, -1, true)"><ApexIcon name="keyboard_double_arrow_up" :size="18" /></button>
        <button type="button" :disabled="disabled || !picked[side].length" aria-label="Move up"
                @click="shift(side, -1)"><ApexIcon name="keyboard_arrow_up" :size="18" /></button>
        <button type="button" :disabled="disabled || !picked[side].length" aria-label="Move down"
                @click="shift(side, 1)"><ApexIcon name="keyboard_arrow_down" :size="18" /></button>
        <button type="button" :disabled="disabled || !picked[side].length" aria-label="Move to bottom"
                @click="shift(side, 1, true)"><ApexIcon name="keyboard_double_arrow_down" :size="18" /></button>
      </div>

      <div class="apex-pl__panel" :class="ui?.panel" :style="{ order: panelOrder(side) }" :data-side="side">
        <div class="apex-pl__head" :class="ui?.head">
          <slot :name="side === 0 ? 'sourceheader' : 'targetheader'">
            <span class="apex-pl__title" :class="ui?.title">{{ headerText(side) }}</span>
            <span class="apex-pl__count" :class="ui?.count">{{ lists[side].length }}</span>
          </slot>
          <button v-if="checkbox" type="button" class="apex-cb__box apex-pl__all" :class="ui?.all"
                  :data-on="allPicked(side)" role="checkbox" :aria-checked="allPicked(side)"
                  :aria-label="`Select all in ${headerText(side)}`" :disabled="disabled"
                  @click="toggleAll(side)">
            <ApexIcon v-if="allPicked(side)" name="check" :size="14" />
          </button>
        </div>

        <div v-if="filter" class="apex-pop__filter apex-pl__filter" :class="ui?.filter">
          <ApexIcon name="search" />
          <input type="text" :value="query[side]" :placeholder="filterPlaceholder || 'Search'"
                 :aria-label="`Search ${headerText(side)}`" autocomplete="off" :disabled="disabled"
                 @input="query[side] = ($event.target as HTMLInputElement).value" />
          <button v-if="query[side]" type="button" class="apex-ctl__btn" aria-label="Clear"
                  @click="query[side] = ''"><ApexIcon name="close" :size="16" /></button>
        </div>

        <ul class="apex-pl__list" :class="ui?.list" :style="{ maxHeight: scrollHeight + 'px' }" role="listbox"
            :aria-multiselectable="checkbox || undefined" :aria-label="headerText(side)"
            @dragover.prevent @drop="onDrop(side, lists[side].length)">
          <li v-for="(item, i) in visible(side)" :key="keyOf(item, i)" class="apex-pl__item" :class="ui?.item"
              role="option" :aria-selected="isPicked(side, item)"
              :data-selected="isPicked(side, item) ? 'true' : 'false'"
              :data-over="over && over.side === side && over.index === i ? 'true' : 'false'"
              :draggable="!noDrag && !disabled" :tabindex="disabled ? -1 : 0"
              @click="togglePick(side, item, $event)"
              @keydown.enter.prevent="togglePick(side, item)"
              @keydown.space.prevent="togglePick(side, item)"
              @dragstart="onDragStart(side, lists[side].indexOf(item), $event)"
              @dragover="onDragOver(side, i, $event)"
              @drop.stop="onDrop(side, i)"
              @dragend="drag = null; over = null">
            <span v-if="checkbox" class="apex-cb__box" :data-on="isPicked(side, item)" aria-hidden="true">
              <ApexIcon v-if="isPicked(side, item)" name="check" :size="14" />
            </span>
            <ApexIcon v-if="!noDrag && !checkbox" name="drag_indicator" class="apex-pl__grip" :class="ui?.grip" :size="18" />
            <span class="apex-pl__body" :class="ui?.body">
              <slot name="option" :item="item" :index="i" :side="side">{{ item.label ?? item.name }}</slot>
            </span>
          </li>
          <li v-if="!visible(side).length" class="apex-pl__empty" :class="ui?.empty">
            {{ query[side] ? 'No matches' : (emptyMessage || 'No items') }}
          </li>
        </ul>
      </div>
    </template>

    <!-- one transfer group; CSS order puts it between the panels or after both -->
    <div class="apex-pl__transfer" :class="ui?.transfer" :style="{ order: transferPosition === 'end' ? 9 : 3 }"
         role="group" aria-label="Move items between lists">
<button type="button" :disabled="disabled || !lists[0].length" aria-label="Move all to target"
              @click="move(0, true)"><ApexIcon name="keyboard_double_arrow_right" :size="19" /></button>
      <button type="button" :disabled="disabled || !picked[0].length" aria-label="Move selected to target"
              @click="move(0)"><ApexIcon name="chevron_right" :size="19" /></button>
      <button type="button" :disabled="disabled || !picked[1].length" aria-label="Move selected to source"
              @click="move(1)"><ApexIcon name="chevron_left" :size="19" /></button>
      <button type="button" :disabled="disabled || !lists[1].length" aria-label="Move all to source"
              @click="move(1, true)"><ApexIcon name="keyboard_double_arrow_left" :size="19" /></button>
    </div>
  </div>
</template>
