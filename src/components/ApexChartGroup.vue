<script setup lang="ts">
/**
 * ApexChartGroup — coordinates independent charts.
 *
 * It provides one store rather than relaying events between siblings: a shared
 * object means a chart added later joins automatically, and there is no order in
 * which the charts have to be declared. Charts inside inject it and read their
 * window, crosshair key and hidden series from it instead of their own state.
 */
import { provide } from 'vue';
import { CHART_GROUP_KEY, createChartGroup, type ZoomWindow } from '../core/chart/viewport';

const props = withDefaults(defineProps<{
  /** Share the visible x window across the group. */
  zoom?: boolean;
  /** Share the crosshair, so every chart reads the same moment. */
  crosshair?: boolean;
  /** Share legend visibility, so one legend drives every chart. */
  legend?: boolean;
  /*
   * Share the y window as well as x.
   *
   * setZoom already reads props.syncY, and the registry documents it — but it
   * was never declared, so it read undefined and the group always dropped the
   * y window. A documented option that behaved as one fixed value.
   *
   * Off by default because two charts in a group usually plot different
   * quantities, and forcing one y window onto both zooms a range that means
   * nothing on the other.
   */
  syncY?: boolean;
}>(), { zoom: true, crosshair: true, legend: true, syncY: false });

const emit = defineEmits<{
  (e: 'zoom-change', payload: { range: ZoomWindow | null }): void;
}>();

const group = createChartGroup();

/* Each channel is opted out by making its setter a no-op rather than by the
   charts checking flags: the charts stay unaware of what the group shares. */
const gated = {
  state: group.state,
  setZoom: (range: ZoomWindow | null) => {
    if (!props.zoom) return;
    /* The y window is dropped rather than the whole change refused: a 2D zoom on
       one chart should still pan the group in x, which is the axis they share. */
    const shared = range && !props.syncY ? { x: range.x } : range;
    group.setZoom(shared);
    emit('zoom-change', { range: shared });
  },
  setHover: (key: string | number | null) => { if (props.crosshair) group.setHover(key); },
  toggleSeries: (id: string) => { if (props.legend) group.toggleSeries(id); },
};

provide(CHART_GROUP_KEY, gated);

defineExpose({
  state: group.state,
  zoomTo: (range: ZoomWindow | null) => gated.setZoom(range),
  resetZoom: () => gated.setZoom(null),
});
</script>

<template>
  <div class="apex-cht-group">
    <slot />
  </div>
</template>
