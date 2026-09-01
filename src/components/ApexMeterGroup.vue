<script setup lang="ts">
/**
 * ApexMeterGroup — several measurements sharing one track.
 *
 * Segments are sized as percentages of `max - min` and laid out in a flex track,
 * so the bar is honest about the remainder: what is unaccounted for stays as
 * visible empty track rather than the segments stretching to fill it. That is
 * the whole point of a meter as opposed to a stacked bar chart.
 */
import { computed } from 'vue';
import ApexIcon from './ApexIcon.vue';

export interface MeterItem {
  label?: string;
  value: number;
  color?: string;
  icon?: string;
}

const DEFAULT_COLORS = [
  'var(--accent-primary)',
  'var(--accent-success)',
  'var(--accent-warning)',
  'var(--accent-danger)',
  'oklch(0.58 0.16 300)',
  'oklch(0.62 0.13 200)',
];

const props = withDefaults(defineProps<{
  value?: MeterItem[];
  min?: number;
  max?: number;
  orientation?: 'horizontal' | 'vertical';
  /** Where the labels sit relative to the track. */
  labelPosition?: 'start' | 'end';
  labelOrientation?: 'horizontal' | 'vertical';
  /** Hide the labels entirely. */
  showLabels?: boolean;
  /** Show each item's percentage after its label. */
  showValues?: boolean;
  /** Icons next to the labels instead of the default marker. */
  showMarkers?: boolean;
  /* chrome */
  size?: string;
  length?: string;
  radius?: string;
  /** Round each segment separately, so the meters read as separate quantities. */
  segmentRadius?: string;
  gap?: string;
  trackBackground?: string;
  labelColor?: string;
  labelSize?: string;
  /** Lift a segment and dim the rest on hover. */
  hoverable?: boolean;
  /** Animate segments from zero on mount. */
  animated?: boolean;
}>(), {
  min: 0, max: 100, orientation: 'horizontal',
  labelPosition: 'end', labelOrientation: 'horizontal',
  showLabels: true, showValues: true, showMarkers: true,
});

const emit = defineEmits<{
  (e: 'item-click', payload: { item: MeterItem; index: number }): void;
}>();

const items = computed(() => props.value || []);
const span = computed(() => Math.max(1, props.max - props.min));

function percent(v: number) {
  return Math.max(0, Math.min(100, ((v - 0) / span.value) * 100));
}
const totalPercent = computed(() => Math.min(100, items.value.reduce((sum, i) => sum + percent(i.value), 0)));
function colorOf(item: MeterItem, i: number) {
  return item.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
}

const rootStyle = computed(() => {
  const s: Record<string, string> = {};
  if (props.size) s['--mtr-size'] = props.size;
  if (props.length) s['--mtr-length'] = props.length;
  if (props.radius) s['--mtr-radius'] = props.radius;
  if (props.segmentRadius) s['--mtr-seg-radius'] = props.segmentRadius;
  if (props.gap) s['--mtr-gap'] = props.gap;
  if (props.trackBackground) s['--mtr-track'] = props.trackBackground;
  if (props.labelColor) s['--mtr-label-fg'] = props.labelColor;
  if (props.labelSize) s['--mtr-label-fs'] = props.labelSize;
  return s;
});

defineSlots<{
  start?: (props: { total: number }) => unknown;
  end?: (props: { total: number }) => unknown;
  label?: (props: { items: MeterItem[]; total: number }) => unknown;
  meter?: (props: { item: MeterItem; index: number; percent: number; color: string }) => unknown;
}>();
</script>

<template>
  <div class="apex-mtr" :style="rootStyle" :data-orientation="orientation"
       :data-labels="labelPosition" :data-label-orientation="labelOrientation"
       :data-hoverable="hoverable ? 'true' : 'false'"
       role="meter" :aria-valuemin="min" :aria-valuemax="max" :aria-valuenow="totalPercent">
    <slot name="start" :total="totalPercent" />
    <div class="apex-mtr__track">
      <template v-for="(item, i) in items" :key="i">
        <slot name="meter" :item="item" :index="i" :percent="percent(item.value)" :color="colorOf(item, i)">
          <div class="apex-mtr__seg" :data-animated="animated ? 'true' : 'false'"
               :style="{ '--mtr-fill': colorOf(item, i), '--mtr-pct': percent(item.value) + '%' }"
               :title="item.label" @click="emit('item-click', { item, index: i })"></div>
        </slot>
      </template>
    </div>
    <!-- the label region is always an element of ours, so labelPosition applies
         to custom label content as much as to the built-in list -->
    <div v-if="showLabels" class="apex-mtr__labelregion">
    <slot name="label" :items="items" :total="totalPercent">
      <ul class="apex-mtr__labels">
        <li v-for="(item, i) in items" :key="i" class="apex-mtr__label">
          <ApexIcon v-if="item.icon" :name="item.icon" class="apex-mtr__licon"
                    :style="{ color: colorOf(item, i) }" />
          <span v-else-if="showMarkers" class="apex-mtr__marker" :style="{ background: colorOf(item, i) }"></span>
          <span>{{ item.label }}</span>
          <span v-if="showValues" class="apex-mtr__pct">({{ Math.round(percent(item.value)) }}%)</span>
        </li>
      </ul>
    </slot>
    </div>
    <slot name="end" :total="totalPercent" />
  </div>
</template>
