<script setup lang="ts">
/**
 * ApexSlider — drag a handle along a track. Single value, or `range` for two
 * handles bound to an array. Horizontal or vertical, with a configurable step,
 * a minimum gap between handles, and full colour control.
 *
 * Pairs with ApexNumber through ordinary two-way binding.
 */
import { computed, ref } from 'vue';
import ApexField from './ApexField.vue';
import { pickFieldProps } from '../core/utils';
import type { ApexFieldProps } from '../types';

const props = withDefaults(defineProps<ApexFieldProps & {
  modelValue?: number | number[] | null;
  min?: number;
  max?: number;
  /** Size of each movement. */
  step?: number;
  /** Two handles; the value becomes an array. */
  range?: boolean;
  /** Minimum number of steps between the handles in range mode. */
  minStepsBetweenHandles?: number;
  orientation?: 'horizontal' | 'vertical';
  /** Track length in pixels: the vertical track's length, and the horizontal track's minimum width. */
  length?: number;
  /** Diameter of a handle, in pixels. */
  handleSize?: number;
  /** The value bubble, which otherwise sits on the sidebar surface. */
  tooltipBackground?: string;
  tooltipColor?: string;
  /** Bubble showing the value while dragging. */
  showTooltip?: boolean;
  /** Track thickness in pixels. */
  trackSize?: number;
  /** Filled range colour. */
  color?: string;
  /** Empty track colour. */
  trackColor?: string;
  /** Handle fill. */
  handleColor?: string;
}>(), {
  min: 0, max: 100, step: 1, minStepsBetweenHandles: 0,
  orientation: 'horizontal', length: 180, trackSize: 6, statusIcon: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: number | number[]): void;
  /** Fired continuously during the drag. */
  (e: 'change', v: number | number[]): void;
  /** Fired once the drag finishes. */
  (e: 'slideend', v: number | number[]): void;
}>();

const track = ref<HTMLElement | null>(null);
const dragging = ref<number | null>(null);
const focused = ref(false);
const vertical = computed(() => props.orientation === 'vertical');
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));
const locked = computed(() => props.disabled || props.readonly);

const values = computed<number[]>(() => {
  const v = props.modelValue;
  if (props.range) {
    const arr = Array.isArray(v) ? v : [props.min, props.max];
    return [clamp(Number(arr[0] ?? props.min)), clamp(Number(arr[1] ?? props.max))];
  }
  return [clamp(Number((Array.isArray(v) ? v[0] : v) ?? props.min))];
});
function clamp(n: number) {
  if (Number.isNaN(n)) return props.min;
  return Math.min(props.max, Math.max(props.min, n));
}
const span = computed(() => props.max - props.min || 1);
const percents = computed(() => values.value.map((v) => ((v - props.min) / span.value) * 100));
const fillStyle = computed(() => {
  const [a, b] = props.range ? percents.value : [0, percents.value[0]];
  const size = Math.abs(b - a) + '%';
  const from = Math.min(a, b) + '%';
  return vertical.value
    ? { bottom: from, height: size }
    : { insetInlineStart: from, width: size };
});
/**
 * Only what is actually set. The earlier version emitted every key, so a plain
 * slider still carried an inline style attribute listing undefined values —
 * harmless, since Vue drops them, but it left every instance looking customised.
 */
const rootStyle = computed(() => {
  const out: Record<string, string> = {
    '--apex-slider-size': props.trackSize + 'px',
    '--apex-slider-length': props.length + 'px',
  };
  const optional: Array<[string | undefined, string]> = [
    [props.trackColor, '--apex-slider-track'],
    [props.color, '--apex-slider-color'],
    [props.handleColor, '--apex-slider-handle'],
    [props.tooltipBackground, '--apex-slider-tip-bg'],
    [props.tooltipColor, '--apex-slider-tip-fg'],
  ];
  optional.forEach(([v, name]) => { if (v) out[name] = v; });
  if (props.handleSize) out['--apex-slider-handle-size'] = props.handleSize + 'px';
  return out;
});

function snap(raw: number) {
  const stepped = Math.round((raw - props.min) / props.step) * props.step + props.min;
  return Number(clamp(stepped).toFixed(6));
}
function emitValues(next: number[], end = false) {
  const out = props.range ? next : next[0];
  emit('update:modelValue', out);
  emit('change', out);
  if (end) emit('slideend', out);
}
function setHandle(i: number, raw: number, end = false) {
  const next = [...values.value];
  let v = snap(raw);
  if (props.range) {
    const gap = props.minStepsBetweenHandles * props.step;
    if (i === 0) v = Math.min(v, next[1] - gap);
    else v = Math.max(v, next[0] + gap);
    v = clamp(v);
  }
  next[i] = v;
  emitValues(next, end);
}
function fromPointer(e: PointerEvent) {
  const el = track.value;
  if (!el) return props.min;
  const r = el.getBoundingClientRect();
  const ratio = vertical.value
    ? 1 - (e.clientY - r.top) / r.height
    : (e.clientX - r.left) / r.width;
  return props.min + Math.min(1, Math.max(0, ratio)) * span.value;
}
function nearestHandle(v: number) {
  if (!props.range) return 0;
  return Math.abs(v - values.value[0]) <= Math.abs(v - values.value[1]) ? 0 : 1;
}
function onDown(e: PointerEvent) {
  if (locked.value) return;
  e.preventDefault();
  const el = e.currentTarget as HTMLElement;
  el.setPointerCapture(e.pointerId);
  const raw = fromPointer(e);
  const i = nearestHandle(raw);
  dragging.value = i;
  setHandle(i, raw);
}
function onMove(e: PointerEvent) {
  if (dragging.value === null || e.buttons !== 1) return;
  setHandle(dragging.value, fromPointer(e));
}
function onUp() {
  if (dragging.value === null) return;
  dragging.value = null;
  emitValues(values.value, true);
}
function onKey(i: number, e: KeyboardEvent) {
  if (locked.value) return;
  const big = Math.max(props.step, span.value / 10);
  const map: Record<string, number> = {
    ArrowRight: props.step, ArrowUp: props.step, ArrowLeft: -props.step, ArrowDown: -props.step,
    PageUp: big, PageDown: -big,
  };
  if (e.key === 'Home') { e.preventDefault(); setHandle(i, props.min, true); return; }
  if (e.key === 'End') { e.preventDefault(); setHandle(i, props.max, true); return; }
  if (map[e.key] === undefined) return;
  e.preventDefault();
  setHandle(i, values.value[i] + map[e.key], true);
}
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" :filled="true" :focused="focused"
             v-slot="{ id, describedBy, invalid }">
    <div class="apex-slider" :id="id" :style="rootStyle" :data-orientation="orientation"
         :data-disabled="disabled ? 'true' : 'false'">
      <div ref="track" class="apex-slider__track" :class="ui?.track" @pointerdown="onDown" @pointermove="onMove"
           @pointerup="onUp" @pointercancel="onUp">
        <span class="apex-slider__fill" :class="ui?.fill" :style="fillStyle"></span>
        <span v-for="(p, i) in percents" :key="i" class="apex-slider__handle" :class="ui?.handle"
              :style="vertical ? { bottom: p + '%' } : { insetInlineStart: p + '%' }"
              role="slider" :tabindex="locked ? -1 : 0"
              :aria-valuemin="range && i === 1 ? values[0] : min"
              :aria-valuemax="range && i === 0 ? values[1] : max"
              :aria-valuenow="values[i]" :aria-orientation="orientation"
              :aria-label="range ? `${label || 'Range'} ${i === 0 ? 'start' : 'end'}` : (label || 'Value')"
              :aria-describedby="describedBy" :aria-invalid="invalid || undefined"
              :aria-disabled="disabled || undefined"
              @keydown="onKey(i, $event)" @focus="focused = true" @blur="focused = false">
          <em v-if="showTooltip" class="apex-slider__tip" :class="ui?.tooltip" :data-open="dragging === i">{{ values[i] }}</em>
        </span>
      </div>
    </div>
  </ApexField>
</template>
