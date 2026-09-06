<script setup lang="ts">
/**
 * ApexCompare — two items stacked and revealed by a draggable divider.
 *
 * The "before" item is clipped rather than resized, so both children keep their
 * natural layout at every position: an image never squashes, and a card inside
 * the comparison stays the size it would be on its own.
 *
 * The divider is a real slider — focusable, with arrow, Home and End keys — since
 * a control that only responds to a drag is unusable by keyboard.
 */
import { computed, provide, ref } from 'vue';
import type { ApexMediaProps } from '../types';

const props = withDefaults(defineProps<ApexMediaProps & {
  /** v-model — the divider position as a percentage. */
  modelValue?: number;
  orientation?: 'horizontal' | 'vertical';
  /** Follow the pointer without a press. */
  slideOnHover?: boolean;
  disabled?: boolean;
  /** Keyboard step, and the larger PageUp/PageDown step. */
  step?: number;
  pageStep?: number;
  /* frame */
  width?: string;
  height?: string;
  aspectRatio?: string;
  radius?: string;
  background?: string;
  /* divider */
  dividerWidth?: string;
  dividerColor?: string;
  /* handle */
  handle?: boolean;
  handleSize?: string;
  handleColor?: string;
  handleBackground?: string;
  handleBorderColor?: string;
  handleRadius?: string;
  handleShadow?: string;
  icon?: string;
}>(), {
  modelValue: 50, orientation: 'horizontal', step: 1, pageStep: 10,
  radius: 'var(--r-md)', dividerWidth: '2px', handle: true,
  handleSize: '34px', handleRadius: '999px',
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: number): void;
  (e: 'slide-start' | 'slide-end'): void;
}>();

const root = ref<HTMLElement | null>(null);
const dragging = ref(false);
const vertical = computed(() => props.orientation === 'vertical');
const pos = computed(() => Math.min(100, Math.max(0, props.modelValue)));

provide('apexComparePos', pos);

function set(v: number) {
  if (props.disabled) return;
  emit('update:modelValue', Math.min(100, Math.max(0, Math.round(v * 10) / 10)));
}
function fromEvent(e: PointerEvent | MouseEvent) {
  const el = root.value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  set(vertical.value
    ? ((e.clientY - r.top) / r.height) * 100
    : ((e.clientX - r.left) / r.width) * 100);
}

function onPointerDown(e: PointerEvent) {
  if (props.disabled) return;
  dragging.value = true;
  emit('slide-start');
  /* Apply the press first: setPointerCapture throws when the id is not an
     active pointer, and the throw took the press-to-jump with it. */
  fromEvent(e);
  try { (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); } catch { /* capture is an optimisation */ }
}
function onPointerMove(e: PointerEvent) {
  if (dragging.value) { fromEvent(e); return; }
  /* Hover tracking only while nothing is being dragged, so a drag that leaves
     the frame is not fought by the hover handler. */
  if (props.slideOnHover && !props.disabled) fromEvent(e);
}
function onPointerUp() {
  if (!dragging.value) return;
  dragging.value = false;
  emit('slide-end');
}

function onKey(e: KeyboardEvent) {
  const map: Record<string, number> = {
    ArrowLeft: -props.step, ArrowRight: props.step,
    ArrowUp: vertical.value ? -props.step : props.step,
    ArrowDown: vertical.value ? props.step : -props.step,
    PageUp: props.pageStep, PageDown: -props.pageStep,
  };
  if (e.key === 'Home') { e.preventDefault(); set(0); return; }
  if (e.key === 'End') { e.preventDefault(); set(100); return; }
  const d = map[e.key];
  if (d === undefined) return;
  e.preventDefault();
  set(pos.value + d);
}

const rootStyle = computed(() => {
  const s: Record<string, string> = { '--apex-cmp-pos': pos.value + '%' };
  if (props.width) s.inlineSize = props.width;
  if (props.height) s.blockSize = props.height;
  if (props.aspectRatio) s.aspectRatio = props.aspectRatio;
  if (props.radius) s['--apex-cmp-radius'] = props.radius;
  if (props.background) s['--apex-cmp-bg'] = props.background;
  if (props.dividerWidth) s['--apex-cmp-divider-w'] = props.dividerWidth;
  if (props.dividerColor) s['--apex-cmp-divider'] = props.dividerColor;
  if (props.handleSize) s['--apex-cmp-handle-size'] = props.handleSize;
  if (props.handleColor) s['--apex-cmp-handle-fg'] = props.handleColor;
  if (props.handleBackground) s['--apex-cmp-handle-bg'] = props.handleBackground;
  if (props.handleBorderColor) s['--apex-cmp-handle-border'] = props.handleBorderColor;
  if (props.handleRadius) s['--apex-cmp-handle-radius'] = props.handleRadius;
  if (props.handleShadow) s['--apex-cmp-handle-shadow'] = props.handleShadow;
  return s;
});
</script>

<template>
  <div ref="root" class="apex-cmp" :class="ui?.root" :style="rootStyle" :data-orientation="orientation"
       :data-disabled="disabled ? 'true' : 'false'" :data-dragging="dragging ? 'true' : 'false'"
       @pointermove="onPointerMove" @pointerdown="onPointerDown"
       @pointerup="onPointerUp" @pointercancel="onPointerUp">
    <slot />
    <div class="apex-cmp__divider" :class="ui?.divider" aria-hidden="true"></div>
    <div v-if="handle" class="apex-cmp__handle" :class="ui?.handle" role="slider" :tabindex="disabled ? -1 : 0"
         :aria-label="'Comparison position'" :aria-valuenow="Math.round(pos)"
         aria-valuemin="0" aria-valuemax="100" :aria-disabled="disabled || undefined"
         :aria-orientation="orientation" @keydown="onKey">
      <slot name="handle" :value="pos">
        <span class="apex-cmp__grip" :class="ui?.grip">
          <span class="apex-cmp__chev" :class="ui?.chev" :data-dir="vertical ? 'up' : 'left'"></span>
          <span class="apex-cmp__chev" :class="ui?.chev" :data-dir="vertical ? 'down' : 'right'"></span>
        </span>
      </slot>
    </div>
  </div>
</template>
