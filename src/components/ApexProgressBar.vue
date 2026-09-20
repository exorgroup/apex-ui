<script setup lang="ts">
/**
 * ApexProgressBar — determinate, indeterminate, or a run of named steps.
 *
 * The indeterminate sweep animates a margin rather than a transform, so it
 * always travels the track's own width — a translate would have to know how wide
 * the container is, and gets it wrong the moment the bar is resized.
 *
 * `steps` derives the percentage from the current step, so the caller states
 * where it is in a sequence instead of converting that to a number itself.
 */
import { computed } from 'vue';
import type { ApexProgressBarClasses } from '../types';

const props = withDefaults(defineProps<{
  /** Your own class on any part. See ApexProgressBarClasses. */
  ui?: ApexProgressBarClasses;
  value?: number;
  max?: number;
  /** `indeterminate` sweeps for work of unknown length; `value` is ignored. */
  mode?: 'determinate' | 'indeterminate';
  /** Kept for existing callers; the same as mode="indeterminate". */
  indeterminate?: boolean;
  /** Named stages. The percentage comes from `step`, not from `value`. */
  steps?: string[];
  /** Which step is current, zero-based. */
  step?: number;
  /** Show the current step's name above the bar. */
  showStepLabel?: boolean;
  /** Percentage readout inside or beside the bar. */
  showValue?: boolean;
  valuePosition?: 'inside' | 'end';
  /** Below this percentage the inside readout moves out, where it stays legible. */
  insideThreshold?: number;
  /** Bar thickness — a number is pixels. */
  height?: number | string;
  color?: string;
  trackColor?: string;
  radius?: string;
  /** Round the fill separately from the track. */
  fillRadius?: string;
  valueColor?: string;
  valueSize?: string;
  /** Diagonal stripes over the fill, optionally travelling. */
  striped?: boolean;
  animatedStripes?: boolean;
  /** How long one indeterminate sweep takes. */
  sweepDuration?: string;
  /** Tint by threshold: danger under 34%, warning under 67%, success above. */
  severity?: 'primary' | 'success' | 'warning' | 'danger' | 'auto';
  label?: string;
}>(), {
  value: 0, max: 100, height: 8, valuePosition: 'inside', severity: 'primary',
  insideThreshold: 12, showStepLabel: true, step: 0,
});

const isIndeterminate = computed(() => props.indeterminate || props.mode === 'indeterminate');
const stepList = computed(() => props.steps || []);

const pct = computed(() => {
  if (stepList.value.length) {
    return ((Math.min(props.step + 1, stepList.value.length)) / stepList.value.length) * 100;
  }
  const v = Math.min(Math.max(0, props.value), props.max);
  return props.max ? (v / props.max) * 100 : 0;
});
const tone = computed(() => {
  if (props.severity !== 'auto') return props.severity;
  if (pct.value < 34) return 'danger';
  return pct.value < 67 ? 'warning' : 'success';
});
const rootStyle = computed(() => {
  const s: Record<string, string> = {
    '--apex-pb-h': typeof props.height === 'number' ? props.height + 'px' : props.height,
  };
  if (props.color) s['--apex-pb-fill'] = props.color;
  if (props.trackColor) s['--apex-pb-track'] = props.trackColor;
  if (props.radius) s['--apex-pb-radius'] = props.radius;
  if (props.fillRadius) s['--apex-pb-fill-radius'] = props.fillRadius;
  if (props.valueColor) s['--apex-pb-value-fg'] = props.valueColor;
  if (props.valueSize) s['--apex-pb-value-fs'] = props.valueSize;
  if (props.sweepDuration) s['--apex-pb-sweep'] = props.sweepDuration;
  return s;
});
const readout = computed(() => Math.round(pct.value) + '%');
const stepLabel = computed(() => stepList.value[Math.min(props.step, stepList.value.length - 1)] || '');
const inside = computed(() => props.showValue && props.valuePosition === 'inside'
  && !isIndeterminate.value && pct.value > props.insideThreshold);
const beside = computed(() => props.showValue && !isIndeterminate.value
  && (props.valuePosition === 'end' || pct.value <= props.insideThreshold));

defineSlots<{
  label?: (props: { value: number; percent: number; formatted: string; step: string }) => unknown;
  value?: (props: { value: number; percent: number; formatted: string }) => unknown;
}>();
</script>

<template>
  <div class="apex-pb" :class="ui?.root" :style="rootStyle" :data-tone="tone"
       :data-value-pos="showValue ? valuePosition : undefined"
       :data-striped="striped ? 'true' : 'false'"
       :data-stripe-anim="animatedStripes ? 'true' : 'false'"
       :data-stacked="(stepList.length && showStepLabel) || $slots.label ? 'true' : 'false'">
    <div v-if="$slots.label || (stepList.length && showStepLabel)" class="apex-pb__label" :class="ui?.label">
      <slot name="label" :value="value" :percent="pct" :formatted="readout" :step="stepLabel">
        <span>{{ stepLabel }}</span>
      </slot>
    </div>
    <div class="apex-pb__row" :class="ui?.row">
      <div class="apex-pb__track" :class="ui?.track" role="progressbar" :aria-label="label || stepLabel || undefined"
           :aria-valuemin="isIndeterminate ? undefined : 0"
           :aria-valuemax="isIndeterminate ? undefined : max"
           :aria-valuenow="isIndeterminate ? undefined : value"
           :aria-valuetext="isIndeterminate ? undefined : readout">
        <div class="apex-pb__fill" :class="ui?.fill" :data-indeterminate="isIndeterminate ? 'true' : 'false'"
             :style="isIndeterminate ? undefined : { inlineSize: pct + '%' }">
          <span v-if="inside" class="apex-pb__inside" :class="ui?.inside">
            <slot name="value" :value="value" :percent="pct" :formatted="readout">{{ readout }}</slot>
          </span>
        </div>
      </div>
      <span v-if="beside" class="apex-pb__readout" :class="ui?.readout">
        <slot name="value" :value="value" :percent="pct" :formatted="readout">{{ readout }}</slot>
      </span>
    </div>
  </div>
</template>
