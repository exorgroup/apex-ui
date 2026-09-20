<script setup lang="ts">
/**
 * ApexEditorTableGrid — pick a table's size before inserting it.
 *
 * A grid rather than two number fields, because choosing a table size is a
 * gesture and not data entry — which is why every reference editor does it this
 * way. The live readout says what a click will produce, so the author is not
 * counting squares.
 *
 * Keyboard-operable, not hover-only: arrows move the size and Enter commits. A
 * picker reachable only by pointer would make Insert ▸ Table — an entry someone
 * got to with the keyboard — a dead end.
 */
import { computed, onUnmounted, ref, watch } from 'vue';
import type { ApexEditorClasses } from '../types';
import ApexIcon from './ApexIcon.vue';

const props = withDefaults(defineProps<{
  /**
   * A COUNTER, as with the link and image editors: the menu has to reopen this
   * after the author closed it, and an already-true boolean fires no watcher.
   */
  openRequest?: number;
  /** Called with (rows, cols) when a size is chosen. */
  insert?: ((rows: number, cols: number) => boolean) | null;
  disabled?: boolean;
  /**
   * Rendered as a PANEL rather than a button and popover — for a menu whose
   * submenu IS the grid, which is where an author looks for it after opening
   * Insert ▸ Table.
   */
  inline?: boolean;
  rows?: number;
  cols?: number;
  /** Class map — §4.3. Every part the template draws takes one key. */
  ui?: ApexEditorClasses;
}>(), { openRequest: 0, insert: null, rows: 8, cols: 10 });

const emit = defineEmits<{ (e: 'insert', payload: { rows: number; cols: number }): void }>();

const open = ref(false);
const r = ref(0);
const c = ref(0);

/* Columns first, matching how a size is spoken and written: 7 × 6 is seven
   across. Reading it the other way round is the classic off-by-transpose. */
const readout = computed(() => (c.value && r.value ? `${c.value} \u00d7 ${r.value}` : 'Pick a size'));
const shown = computed(() => props.inline || open.value);

function show() { r.value = 1; c.value = 1; open.value = true; }
function hide() { open.value = false; }
function toggle() { if (open.value) hide(); else show(); }
function over(row: number, col: number) { r.value = row; c.value = col; }
function commit(row: number, col: number) {
  hide();
  props.insert?.(row, col);
  emit('insert', { rows: row, cols: col });
}

function onKey(e: KeyboardEvent) {
  if (!open.value) return;
  if (e.key === 'Escape') { e.stopPropagation(); hide(); return; }
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault(); e.stopPropagation();
    commit(r.value, c.value);
    return;
  }
  const step: Record<string, [number, number]> = {
    ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowDown: [1, 0], ArrowUp: [-1, 0],
  };
  const move = step[e.key];
  if (!move) return;
  e.preventDefault(); e.stopPropagation();
  r.value = Math.min(props.rows, Math.max(1, r.value + move[0]));
  c.value = Math.min(props.cols, Math.max(1, c.value + move[1]));
}

watch(() => props.openRequest, () => { if (!props.disabled) show(); });
watch(open, (v) => {
  if (v) document.addEventListener('keydown', onKey, true);
  else document.removeEventListener('keydown', onKey, true);
});
onUnmounted(() => document.removeEventListener('keydown', onKey, true));
if (props.inline) { r.value = 1; c.value = 1; }

const rowOf = (cell: number) => Math.ceil(cell / props.cols);
const colOf = (cell: number) => ((cell - 1) % props.cols) + 1;
</script>

<template>
  <span class="apex-edgrid" :class="ui?.grid" :data-inline="inline ? 'true' : 'false'">
    <button v-if="!inline" type="button" class="apex-edbar__btn" :disabled="disabled" title="Table"
            aria-label="Table" aria-haspopup="true" :aria-expanded="open" @click="toggle">
      <ApexIcon name="table" :size="18" />
    </button>
    <div v-if="shown" class="apex-edgrid__pop" :class="ui?.gridPopover" role="dialog" aria-label="Table size"
         @mouseleave="r = 0; c = 0">
      <div class="apex-edgrid__grid" :class="ui?.gridBody" role="grid" :style="{ '--apex-ed-grid-cols': cols }">
        <button v-for="cell in rows * cols" :key="cell" type="button" class="apex-edgrid__cell" :class="ui?.gridCell"
                :data-on="rowOf(cell) <= r && colOf(cell) <= c ? 'true' : 'false'"
                :aria-label="`${colOf(cell)} by ${rowOf(cell)}`"
                @mouseenter="over(rowOf(cell), colOf(cell))"
                @click="commit(rowOf(cell), colOf(cell))"></button>
      </div>
      <!-- Only the READOUT is templatable: the grid IS the control, so replacing
           it would replace the component rather than customise it. -->
      <slot name="readout" :rows="r" :cols="c" :text="readout">
        <p class="apex-edgrid__readout" :class="ui?.gridReadout" aria-live="polite">{{ readout }}</p>
      </slot>
    </div>
  </span>
</template>
