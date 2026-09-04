<script setup lang="ts">
/**
 * ApexSkeleton — a placeholder standing in for content that has not arrived.
 *
 * The shimmer is a background-position animation on a gradient, not a moving
 * child element: nothing to clip, nothing to position, and it costs one
 * compositor property per frame however many skeletons are on screen — which
 * matters, because a loading screen is made of dozens of them.
 *
 * `shape="circle"` takes its diameter from `size` rather than width and height,
 * so a round placeholder cannot end up an ellipse.
 */
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  shape?: 'rectangle' | 'rounded' | 'square' | 'circle' | 'text';
  /** Diameter for circle and square. */
  size?: string;
  width?: string;
  height?: string;
  borderRadius?: string;
  background?: string;
  /** The lighter band that travels across the base colour. */
  shimmerColor?: string;
  /** 'wave' travels left to right, 'pulse' fades, 'none' is static. */
  animation?: 'wave' | 'pulse' | 'none';
  duration?: string;
  /** Stagger the wave, so a stack of skeletons does not pulse in lockstep. */
  delay?: string;
  /** Number of stacked lines, for shape="text". The last is shortened. */
  lines?: number;
  lineGap?: string;
  /** How wide the last line of a text block is. */
  lastLineWidth?: string;
}>(), {
  shape: 'rectangle', animation: 'wave', duration: '1.4s', lines: 1,
  lastLineWidth: '65%',
});

const round = computed(() => props.shape === 'circle');
const rootStyle = computed(() => {
  const s: Record<string, string> = {};
  if (round.value || props.shape === 'square') {
    /* Diameter only: aspect-ratio sizes the axis that is NOT specified, so
       emitting a height here would defeat the ratio and flatten the circle. An
       oval is what shape="rounded" with a radius is for. */
    s.inlineSize = props.size || props.width || '2.5rem';
  } else {
    if (props.width) s.inlineSize = props.width;
    if (props.height) s.blockSize = props.height;
  }
  if (props.borderRadius) s['--apex-skeleton-radius'] = props.borderRadius;
  if (props.background) s['--apex-skeleton-bg'] = props.background;
  if (props.shimmerColor) s['--apex-skeleton-shimmer'] = props.shimmerColor;
  if (props.duration) s['--apex-skeleton-dur'] = props.duration;
  if (props.delay) s['--apex-skeleton-delay'] = props.delay;
  if (props.lineGap) s['--apex-skeleton-gap'] = props.lineGap;
  return s;
});
const lineStyle = (i: number) => (i === props.lines - 1 && props.lines > 1
  ? { inlineSize: props.lastLineWidth }
  : undefined);
</script>

<template>
  <div v-if="shape === 'text' && lines > 1" class="apex-skl-stack" :style="rootStyle" aria-hidden="true">
    <span v-for="i in lines" :key="i" class="apex-skl" data-shape="text"
          :data-anim="animation" :style="lineStyle(i - 1)"></span>
  </div>
  <span v-else class="apex-skl" :style="rootStyle" :data-shape="shape" :data-anim="animation"
        aria-hidden="true"></span>
</template>
