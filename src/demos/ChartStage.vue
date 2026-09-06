<template>
  <div class="cfm-stage" style="width:100%">
    <ApexChart v-bind="bind" :series="series" :x-axis="{ type: 'category' }"
               :legend="{ position: 'bottom' }" style="width:100%"
               @hover="onHover" />
    <p class="cfm-log">{{ log || 'Hover the plot, or focus it and use the arrow keys.' }}</p>
  </div>
</template>

<script setup lang="ts">
/**
 * The playground stage for ApexChart.
 *
 * Two series over one category axis: enough for the rail's curve, stacking,
 * marker, label, zoom, navigator and orientation controls to have something to
 * act on. A chart with one series would leave stackMode and the legend inert,
 * which is the blank-stage failure this harness has shipped three times.
 *
 * The gallery's stage flexes its data for the animation section; that belongs
 * to the section, not the playground, so this keeps one fixed dataset.
 */
import { ref } from 'vue';
/* Imported rather than left to the global plugin registration: an unresolved
   component is a Vue warning, not an error, so the stage would render empty
   and the build would still pass. */
import { ApexChart } from '@exorgroup/apex-ui';
import { CHT_TRIAL } from '../registry';

defineProps<{
  /** Live props from the playground rail. */
  bind?: Record<string, unknown>;
}>();

const series = [
  {
    id: 'activated',
    name: 'Activated',
    xKey: 'month',
    yKey: 'value',
    fillOpacity: 0.16,
    data: CHT_TRIAL,
  },
  {
    id: 'invited',
    name: 'Invited',
    xKey: 'month',
    yKey: 'value',
    data: CHT_TRIAL.map((r, i) => ({ month: r.month, value: Math.round(r.value * 1.4 + i) })),
  },
];

const log = ref('');
function onHover(e: { entries?: { series: { name?: string }; point: { y: number | null } }[] } | null) {
  const first = e?.entries?.[0];
  log.value = first ? `${first.series.name ?? ''} ${first.point.y ?? ''}` : '';
}
</script>
