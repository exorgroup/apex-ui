<script setup lang="ts">
/**
 * ApexRating — star selection. Half stars, any star count, horizontal or
 * vertical, plus an optional cancel control and read-only display mode.
 */
import { computed, ref } from 'vue';
import ApexField from './ApexField.vue';
import ApexIcon from './ApexIcon.vue';
import { pickFieldProps } from '../core/utils';
import type { ApexFieldProps } from '../types';

const props = withDefaults(defineProps<ApexFieldProps & {
  modelValue?: number | null;
  /** Number of stars. */
  stars?: number;
  /** Allow half-star selection. */
  allowHalf?: boolean;
  /** Stack the stars instead of laying them out in a row. */
  orientation?: 'horizontal' | 'vertical';
  /** Star size in pixels. Defaults to the field size. */
  starSize?: number;
  /** Preset shape. Ignored when `icon` is given. */
  shape?: 'star' | 'triangle' | 'dot' | 'square';
  /** Outlined glyphs, or solid ones. */
  variant?: 'filled' | 'outline';
  /** Glyphs for the filled and empty states, overriding `shape`. */
  icon?: string;
  emptyIcon?: string;
  /** Filled colour. Defaults to the warning accent. */
  color?: string;
  /** A × button that clears the value. */
  cancel?: boolean;
  /** Text beside the stars, e.g. "3.5 of 5". */
  showValue?: boolean;
}>(), {
  stars: 5, orientation: 'horizontal', shape: 'star', variant: 'filled',
  statusIcon: false,
});

const SHAPE_GLYPH: Record<string, string> = {
  star: 'star', triangle: 'change_history', dot: 'circle', square: 'square',
};
const glyph = computed(() => props.icon || SHAPE_GLYPH[props.shape] || 'star');
const emptyGlyph = computed(() => props.emptyIcon || glyph.value);
const solid = computed(() => props.variant === 'filled');

const emit = defineEmits<{
  (e: 'update:modelValue', v: number | null): void;
  (e: 'change', v: number | null): void;
}>();

const hover = ref<number | null>(null);
const focused = ref(false);
const value = computed(() => Number(props.modelValue ?? 0));
const shown = computed(() => hover.value ?? value.value);
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));
const locked = computed(() => props.disabled || props.readonly);
const rootStyle = computed(() => ({
  '--rating-size': (props.starSize ? props.starSize + 'px' : undefined),
  '--rating-color': props.color,
}));

/** 0 = empty, 1 = half, 2 = full. */
function state(i: number) {
  const v = shown.value;
  if (v >= i) return 2;
  if (props.allowHalf && v >= i - 0.5) return 1;
  return 0;
}
function commit(v: number | null) {
  if (locked.value) return;
  const next = v === value.value && props.cancel ? null : v;
  emit('update:modelValue', next);
  emit('change', next);
}
function fromPointer(i: number, e: PointerEvent | MouseEvent) {
  if (!props.allowHalf) return i;
  const el = e.currentTarget as HTMLElement;
  const r = el.getBoundingClientRect();
  const along = props.orientation === 'vertical'
    ? (e.clientY - r.top) / r.height
    : (e.clientX - r.left) / r.width;
  return along <= 0.5 ? i - 0.5 : i;
}
function onKey(e: KeyboardEvent) {
  if (locked.value) return;
  const step = props.allowHalf ? 0.5 : 1;
  const map: Record<string, number> = {
    ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step,
  };
  if (e.key === 'Home') { e.preventDefault(); commit(props.cancel ? null : step); return; }
  if (e.key === 'End') { e.preventDefault(); commit(props.stars); return; }
  if (map[e.key] === undefined) return;
  e.preventDefault();
  const next = Math.min(props.stars, Math.max(0, value.value + map[e.key]));
  emit('update:modelValue', next === 0 ? (props.cancel ? null : 0) : next);
  emit('change', next);
}
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" :filled="true" :focused="focused"
             v-slot="{ id, describedBy, invalid, size }">
    <div class="apex-rating" :id="id" :data-size="size" :data-orientation="orientation"
         :data-disabled="disabled ? 'true' : 'false'" :data-readonly="readonly ? 'true' : 'false'"
         :style="rootStyle" role="slider" :tabindex="locked ? -1 : 0"
         :aria-valuemin="0" :aria-valuemax="stars" :aria-valuenow="value"
         :aria-valuetext="`${value} of ${stars}`" :aria-label="label || 'Rating'"
         :aria-describedby="describedBy" :aria-invalid="invalid || undefined"
         :aria-readonly="readonly || undefined"
         @keydown="onKey" @focus="focused = true" @blur="focused = false"
         @pointerleave="hover = null">
      <button v-if="cancel && !locked" type="button" class="apex-rating__cancel" aria-label="Clear rating"
              @click="commit(null)">
        <ApexIcon name="close" :size="16" />
      </button>
      <span v-for="i in stars" :key="i" class="apex-rating__star" :data-state="state(i)"
            :aria-hidden="true" @pointermove="hover = fromPointer(i, $event)"
            @click="commit(fromPointer(i, $event))">
        <ApexIcon class="apex-rating__bg" :name="emptyGlyph" />
        <span class="apex-rating__fill"><ApexIcon :name="glyph" :fill="solid" /></span>
      </span>
      <span v-if="showValue" class="apex-rating__value">{{ value }} / {{ stars }}</span>
    </div>
  </ApexField>
</template>
