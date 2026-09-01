<script setup lang="ts">
/**
 * ApexKnob — a dial for number entry. Drag around it, scroll, or use the arrow
 * keys; the value is an ordinary v-model number.
 */
import { computed, ref } from 'vue';
import ApexField from './ApexField.vue';
import { pickFieldProps } from '../core/utils';
import type { ApexFieldProps } from '../types';

const props = withDefaults(defineProps<ApexFieldProps & {
  modelValue?: number | null;
  min?: number;
  max?: number;
  /** Size of each movement. */
  step?: number;
  /** Diameter in pixels. */
  diameter?: number;
  /** Arc thickness in pixels. */
  strokeWidth?: number;
  /** Filled arc colour. Defaults to the accent. */
  valueColor?: string;
  /** Track colour. */
  rangeColor?: string;
  /** Centre text colour. */
  textColor?: string;
  /** Hide the number in the middle. */
  hideValue?: boolean;
  /** Formats the centre text, e.g. (v) => v + '%'. */
  valueTemplate?: (v: number) => string;
}>(), {
  min: 0, max: 100, step: 1, diameter: 110, strokeWidth: 14, statusIcon: false,
});

const emit = defineEmits<{ (e: 'update:modelValue', v: number): void; (e: 'change', v: number): void }>();

const svg = ref<SVGSVGElement | null>(null);
const focused = ref(false);
/** Sweep runs from 7 o'clock round to 5 o'clock — 270°, gap at the bottom. */
const START = 135;
const SWEEP = 270;

const value = computed(() => {
  const v = Number(props.modelValue ?? props.min);
  return Math.min(props.max, Math.max(props.min, Number.isNaN(v) ? props.min : v));
});
const pct = computed(() => (props.max === props.min ? 0 : (value.value - props.min) / (props.max - props.min)));
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));
const centreText = computed(() => (props.valueTemplate ? props.valueTemplate(value.value) : String(value.value)));

const R = computed(() => 50 - props.strokeWidth / 2);
const CIRC = computed(() => 2 * Math.PI * R.value);
const arcLen = computed(() => (CIRC.value * SWEEP) / 360);

function commit(raw: number) {
  const stepped = Math.round((raw - props.min) / props.step) * props.step + props.min;
  const next = Number(Math.min(props.max, Math.max(props.min, stepped)).toFixed(6));
  if (next === value.value) return;
  emit('update:modelValue', next);
  emit('change', next);
}
function fromPointer(e: PointerEvent) {
  const el = svg.value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  const dx = e.clientX - (r.left + r.width / 2);
  const dy = e.clientY - (r.top + r.height / 2);
  // 0° at the top, clockwise; shift so the gap sits at the bottom
  let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
  if (deg < 0) deg += 360;
  const rel = (deg - 225 + 360) % 360;
  if (rel > SWEEP) return; // inside the bottom gap — ignore
  commit(props.min + (rel / SWEEP) * (props.max - props.min));
}
function onDown(e: PointerEvent) {
  if (props.disabled || props.readonly) return;
  e.preventDefault();
  const el = e.currentTarget as SVGElement;
  el.setPointerCapture(e.pointerId);
  el.focus();
  fromPointer(e);
}
function onMove(e: PointerEvent) { if (e.buttons === 1) fromPointer(e); }
function onWheel(e: WheelEvent) {
  if (props.disabled || props.readonly || !focused.value) return;
  e.preventDefault();
  commit(value.value + (e.deltaY < 0 ? props.step : -props.step));
}
function onKey(e: KeyboardEvent) {
  if (props.disabled || props.readonly) return;
  const big = (props.max - props.min) / 10;
  const map: Record<string, number> = {
    ArrowRight: props.step, ArrowUp: props.step, ArrowLeft: -props.step, ArrowDown: -props.step,
    PageUp: big, PageDown: -big,
  };
  if (e.key === 'Home') { e.preventDefault(); commit(props.min); return; }
  if (e.key === 'End') { e.preventDefault(); commit(props.max); return; }
  if (map[e.key] === undefined) return;
  e.preventDefault();
  commit(value.value + map[e.key]);
}
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" :filled="true" :focused="focused"
             v-slot="{ id, describedBy, invalid }">
    <div class="apex-knob" :data-disabled="disabled ? 'true' : 'false'"
         :style="{ '--knob-size': diameter + 'px', '--knob-value': valueColor, '--knob-range': rangeColor, '--knob-text': textColor }">
      <svg ref="svg" :id="id" viewBox="0 0 100 100" role="slider" :tabindex="disabled ? -1 : 0"
           :aria-valuemin="min" :aria-valuemax="max" :aria-valuenow="value" :aria-valuetext="centreText"
           :aria-label="label || 'Value'" :aria-describedby="describedBy" :aria-invalid="invalid || undefined"
           :aria-disabled="disabled || undefined"
           @pointerdown="onDown" @pointermove="onMove" @wheel="onWheel" @keydown="onKey"
           @focus="focused = true" @blur="focused = false">
        <circle class="apex-knob__range" cx="50" cy="50" :r="R" fill="none" :stroke-width="strokeWidth"
                stroke-linecap="round" :stroke-dasharray="`${arcLen} ${CIRC}`"
                transform="rotate(135 50 50)" />
        <circle class="apex-knob__value" cx="50" cy="50" :r="R" fill="none" :stroke-width="strokeWidth"
                stroke-linecap="round" :stroke-dasharray="`${arcLen * pct} ${CIRC}`"
                transform="rotate(135 50 50)" />
        <text v-if="!hideValue" class="apex-knob__text" x="50" y="50" text-anchor="middle"
              dominant-baseline="central">{{ centreText }}</text>
      </svg>
    </div>
  </ApexField>
</template>
