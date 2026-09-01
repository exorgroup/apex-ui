<script setup lang="ts">
/**
 * ApexProgressSpinner — a circular status indicator, determinate or not.
 *
 * One SVG circle in both modes, driven by stroke-dasharray: the determinate arc
 * is the same ring the indeterminate one spins, so switching between them never
 * changes the geometry — which is what lets a spinner become a percentage the
 * moment the total is known.
 */
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  /** A number makes it determinate; leave it out for the spin. */
  value?: number;
  max?: number;
  /** Diameter — a number is pixels. */
  size?: number | string;
  /** Ring thickness, in the same units as the diameter. */
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  /** Hide the track entirely, leaving a bare arc. */
  showTrack?: boolean;
  /** Percentage in the middle, determinate only. */
  showValue?: boolean;
  valueColor?: string;
  valueSize?: string;
  /** One rotation, or one indeterminate cycle. */
  duration?: string;
  /** How much of the ring the spinning arc covers. */
  arc?: number;
  /** Rounded or squared arc ends. */
  linecap?: 'round' | 'butt';
  /** Grow the arc as well as rotate it — the classic two-part spin. */
  pulse?: boolean;
  severity?: 'primary' | 'success' | 'warning' | 'danger' | 'auto';
  label?: string;
}>(), {
  max: 100, size: 48, strokeWidth: 4, showTrack: true, duration: '1.2s',
  arc: 25, linecap: 'round', severity: 'primary',
});

const determinate = computed(() => props.value !== undefined && props.value !== null);
const pct = computed(() => {
  if (!determinate.value) return 0;
  const v = Math.min(Math.max(0, props.value as number), props.max);
  return props.max ? (v / props.max) * 100 : 0;
});
const tone = computed(() => {
  if (props.severity !== 'auto') return props.severity;
  if (pct.value < 34) return 'danger';
  return pct.value < 67 ? 'warning' : 'success';
});

/* A 0-100 viewBox with the radius derived from the stroke, so the ring never
   clips no matter how thick it is. */
const RADIUS = computed(() => 50 - props.strokeWidth / 2);
const CIRC = computed(() => 2 * Math.PI * RADIUS.value);
const dash = computed(() => (determinate.value
  ? `${(pct.value / 100) * CIRC.value} ${CIRC.value}`
  : `${(props.arc / 100) * CIRC.value} ${CIRC.value}`));

const rootStyle = computed(() => {
  const s: Record<string, string> = {
    '--psp-size': typeof props.size === 'number' ? props.size + 'px' : props.size,
    '--psp-dur': props.duration,
  };
  if (props.color) s['--psp-fill'] = props.color;
  if (props.trackColor) s['--psp-track'] = props.trackColor;
  if (props.valueColor) s['--psp-value-fg'] = props.valueColor;
  if (props.valueSize) s['--psp-value-fs'] = props.valueSize;
  return s;
});
const readout = computed(() => Math.round(pct.value) + '%');
</script>

<template>
  <div class="apex-psp" :style="rootStyle" :data-tone="tone"
       :data-mode="determinate ? 'determinate' : 'indeterminate'"
       :data-pulse="pulse ? 'true' : 'false'"
       role="progressbar" :aria-label="label"
       :aria-valuemin="determinate ? 0 : undefined"
       :aria-valuemax="determinate ? max : undefined"
       :aria-valuenow="determinate ? value : undefined"
       :aria-valuetext="determinate ? readout : undefined">
    <svg class="apex-psp__svg" viewBox="0 0 100 100" aria-hidden="true">
      <circle v-if="showTrack" class="apex-psp__track" cx="50" cy="50" :r="RADIUS"
              fill="none" :stroke-width="strokeWidth" />
      <circle class="apex-psp__arc" cx="50" cy="50" :r="RADIUS" fill="none"
              :stroke-width="strokeWidth" :stroke-linecap="linecap" :stroke-dasharray="dash" />
    </svg>
    <span v-if="showValue && determinate" class="apex-psp__value">
      <slot :value="value" :percent="pct" :formatted="readout">{{ readout }}</slot>
    </span>
  </div>
</template>
