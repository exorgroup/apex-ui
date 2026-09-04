<script setup lang="ts">
/**
 * ApexSplitter — resizable panels separated by draggable gutters.
 *
 * Panels are declared as a `panels` array and their content comes from
 * `panel-<n>` slots, so a layout is data rather than nested markup. Sizes are
 * percentages and always sum to 100, and can be bound, persisted, or left alone.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

export interface SplitterPanel {
  /** Percentage of the splitter this panel starts at. */
  size?: number;
  minSize?: number;
  maxSize?: number;
  /** Snap to `collapsedSize` when dragged past halfway to `minSize`. */
  collapsible?: boolean;
  collapsedSize?: number;
  key?: string | number;
}

const props = withDefaults(defineProps<{
  panels?: SplitterPanel[];
  /** Percentages, one per panel. Bindable. */
  sizes?: number[];
  layout?: 'horizontal' | 'vertical';
  /** How far the gutter travels per arrow-key press, in percent. */
  step?: number;
  gutterSize?: number;
  disabled?: boolean;
  /** Persist sizes under this key. */
  stateKey?: string;
  stateStorage?: 'local' | 'session';
  /* appearance */
  height?: string;
  bordered?: boolean;
  radius?: string;
  borderColor?: string;
  gutterColor?: string;
  gutterHoverColor?: string;
  /** Show a grip in the middle of each gutter. */
  showHandle?: boolean;
}>(), {
  layout: 'horizontal', step: 5, gutterSize: 6, bordered: true,
  stateStorage: 'local', showHandle: true,
});

const emit = defineEmits<{
  (e: 'update:sizes', v: number[]): void;
  (e: 'resizestart' | 'resize' | 'resizeend', payload: { sizes: number[]; index: number }): void;
  (e: 'collapse', payload: { index: number; collapsed: boolean; sizes: number[] }): void;
}>();

const list = computed(() => (props.panels && props.panels.length ? props.panels : [{}, {}]));
const count = computed(() => list.value.length);

/** Even split unless a panel declares its own size. */
function defaults(): number[] {
  const declared = list.value.map((p) => p.size);
  const known = declared.filter((v): v is number => typeof v === 'number');
  const rest = 100 - known.reduce((a, b) => a + b, 0);
  const unknownCount = declared.length - known.length;
  const each = unknownCount ? rest / unknownCount : 0;
  return declared.map((v) => (typeof v === 'number' ? v : each));
}

const store = computed(() => {
  if (!props.stateKey || typeof window === 'undefined') return null;
  return props.stateStorage === 'session' ? window.sessionStorage : window.localStorage;
});
function readState(): number[] | null {
  try {
    const raw = store.value?.getItem(props.stateKey as string);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length === count.value ? parsed : null;
  } catch { return null; }
}

const local = ref<number[]>(readState() || defaults());
const current = computed(() => {
  const v = props.sizes && props.sizes.length === count.value ? props.sizes : local.value;
  return v.length === count.value ? v : defaults();
});
watch(() => props.panels, () => { if (!props.sizes) local.value = readState() || defaults(); });

function commit(next: number[], index: number, phase: 'resize' | 'resizeend') {
  local.value = next;
  emit('update:sizes', next);
  emit(phase, { sizes: next, index });
  if (props.stateKey) {
    try { store.value?.setItem(props.stateKey, JSON.stringify(next)); } catch { /* quota */ }
  }
}

/* ── dragging a gutter ──────────────────────────────────── */
const root = ref<HTMLElement | null>(null);
const drag = ref<{ index: number; start: number; a: number; b: number; total: number } | null>(null);
const horizontal = computed(() => props.layout === 'horizontal');
/**
 * In RTL the inline axis runs the other way, so growing the first panel moves the
 * divider LEFT. Horizontal deltas — pointer and arrow keys alike — are negated so
 * the separator always follows the visual direction of travel. The block axis is
 * unaffected, so a vertical splitter needs no flip.
 */
function inlineSign(): number {
  if (!horizontal.value || !root.value || typeof getComputedStyle === 'undefined') return 1;
  return getComputedStyle(root.value).direction === 'rtl' ? -1 : 1;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Applies a delta between panels `i` and `i+1`, honouring both panels' bounds and
 * snapping a collapsible panel once it is dragged past halfway to its minimum.
 */
function apply(index: number, aRaw: number, bRaw: number): number[] {
  const next = current.value.slice();
  const A = list.value[index], B = list.value[index + 1];
  const pair = aRaw + bRaw;

  const aMin = A.minSize ?? 0, aMax = A.maxSize ?? 100;
  const bMin = B.minSize ?? 0, bMax = B.maxSize ?? 100;
  let a = clamp(aRaw, aMin, Math.min(aMax, pair - bMin));
  a = clamp(a, pair - bMax, a);

  if (A.collapsible) {
    const collapsed = A.collapsedSize ?? 0;
    if (aRaw < collapsed + (aMin - collapsed) / 2) a = collapsed;
  }
  if (B.collapsible) {
    const collapsed = B.collapsedSize ?? 0;
    if (pair - aRaw < collapsed + (bMin - collapsed) / 2) a = pair - collapsed;
  }
  next[index] = a;
  next[index + 1] = pair - a;
  return next;
}

function onDown(index: number, e: PointerEvent) {
  if (props.disabled) return;
  const el = root.value;
  if (!el) return;
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  const total = horizontal.value ? el.clientWidth : el.clientHeight;
  drag.value = {
    index,
    start: horizontal.value ? e.clientX : e.clientY,
    a: current.value[index],
    b: current.value[index + 1],
    total,
  };
  emit('resizestart', { sizes: current.value.slice(), index });
}
function onMove(e: PointerEvent) {
  const d = drag.value;
  if (!d || !d.total) return;
  const moved = ((horizontal.value ? e.clientX : e.clientY) - d.start) * inlineSign();
  const pct = (moved / d.total) * 100;
  commit(apply(d.index, d.a + pct, d.b - pct), d.index, 'resize');
}
function onUp() {
  const d = drag.value;
  drag.value = null;
  if (!d) return;
  emit('resizeend', { sizes: current.value.slice(), index: d.index });
  const A = list.value[d.index], B = list.value[d.index + 1];
  const collapsedA = A.collapsible && current.value[d.index] === (A.collapsedSize ?? 0);
  const collapsedB = B.collapsible && current.value[d.index + 1] === (B.collapsedSize ?? 0);
  if (collapsedA) emit('collapse', { index: d.index, collapsed: true, sizes: current.value.slice() });
  if (collapsedB) emit('collapse', { index: d.index + 1, collapsed: true, sizes: current.value.slice() });
}

/** Keyboard resize. A collapsible panel collapses as soon as it reaches its minimum. */
function onKey(index: number, e: KeyboardEvent) {
  if (props.disabled) return;
  const forward = horizontal.value ? 'ArrowRight' : 'ArrowDown';
  const back = horizontal.value ? 'ArrowLeft' : 'ArrowUp';
  const sign = inlineSign();
  let delta = 0;
  if (e.key === forward) delta = props.step * sign;
  else if (e.key === back) delta = -props.step * sign;
  else if (e.key === 'Home') delta = -100;
  else if (e.key === 'End') delta = 100;
  else return;
  e.preventDefault();

  const a = current.value[index], b = current.value[index + 1];
  const A = list.value[index];
  let nextA = a + delta;
  if (A.collapsible && delta < 0 && nextA <= (A.minSize ?? 0)) nextA = A.collapsedSize ?? 0;
  const next = apply(index, nextA, b - (nextA - a));
  commit(next, index, 'resizeend');
  if (A.collapsible && next[index] === (A.collapsedSize ?? 0)) {
    emit('collapse', { index, collapsed: true, sizes: next });
  }
}

const rootStyle = computed(() => {
  const s: Record<string, string> = { '--apex-splitter-gutter': props.gutterSize + 'px' };
  if (props.height) s['--apex-splitter-h'] = props.height;
  if (props.radius) s['--apex-splitter-radius'] = props.radius;
  if (props.borderColor) s['--apex-splitter-border'] = props.borderColor;
  if (props.gutterColor) s['--apex-splitter-gutter-bg'] = props.gutterColor;
  if (props.gutterHoverColor) s['--apex-splitter-gutter-hover'] = props.gutterHoverColor;
  return s;
});
const panelStyle = (i: number) => ({ flexBasis: current.value[i] + '%' });

onMounted(() => { if (!props.sizes) { const s = readState(); if (s) local.value = s; } });
onBeforeUnmount(() => { drag.value = null; });
defineExpose({ sizes: current, reset: () => commit(defaults(), 0, 'resizeend') });
</script>

<template>
  <div ref="root" class="apex-sp" :style="rootStyle" :data-layout="layout"
       :data-bordered="bordered ? 'true' : 'false'" :data-disabled="disabled ? 'true' : 'false'"
       :data-dragging="drag ? 'true' : 'false'">
    <template v-for="(panel, i) in list" :key="panel.key ?? i">
      <div class="apex-sp__panel" :style="panelStyle(i)" :data-index="i">
        <slot :name="`panel-${i + 1}`" :size="current[i]" :index="i">
          <slot :size="current[i]" :index="i" />
        </slot>
      </div>

      <div v-if="i < count - 1" class="apex-sp__gutter" role="separator" tabindex="0"
           :aria-orientation="horizontal ? 'vertical' : 'horizontal'"
           :aria-valuenow="Math.round(current[i])" :aria-valuemin="0" :aria-valuemax="100"
           :aria-label="`Resize panel ${i + 1}`" :aria-disabled="disabled || undefined"
           @pointerdown="onDown(i, $event)" @pointermove="onMove" @pointerup="onUp"
           @pointercancel="onUp" @keydown="onKey(i, $event)">
        <slot name="gutter" :index="i">
          <span v-if="showHandle" class="apex-sp__grip"></span>
        </slot>
      </div>
    </template>
  </div>
</template>
