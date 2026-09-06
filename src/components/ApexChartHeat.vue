<script setup lang="ts">
/**
 * ApexChartHeat — the heatmap family, lifted out of ApexChart.
 *
 * Unlike the treemap, a heatmap lives INSIDE the cartesian layer: it has a
 * plot rect, and the chart's own axis code already knows to suppress its
 * ticks because the grid labels its own rows and columns. So this takes the
 * plot rect as a prop rather than the whole frame, and `hasHeatmap` stays in
 * ApexChart, where four other things read it — the entrance mode, the tooltip
 * path, the axis ticks and the data-family attribute.
 *
 * What moves is the grid geometry and its markup, which is what pulls
 * heatGrid, heatIntensity and heatBand out of a chart that draws none.
 *
 * Hovering emits rather than reaching for the chart's hit state: a cell is a
 * real element, so the parent turns the emit into the same tooltip entry a
 * pointer over the plot would have produced.
 */
import { computed } from 'vue';
import { seriesColor } from '../core/chart/layout';
import { heatGrid, heatIntensity, heatBand } from '../core/chart/special';
import type { ChartSeries } from '../core/chart/data';
import type { Rect } from '../core/chart/layout';

const props = defineProps<{
  /** The resolved series; the first heatmap in it is the one drawn. */
  series: ChartSeries[];
  /** The plot rect the grid fills — the chart measures it from the axes. */
  plot: Rect;
  locale?: string;
}>();

const emit = defineEmits<{
  (e: 'hover', cell: { cellLabel: string; value: number | null }): void;
  (e: 'leave'): void;
}>();

const view = computed(() => {
  const spec = props.series.find((s) => s.type === 'heatmap');
  if (!spec) return null;
  /* A key may be a name or a reader, and a row may be an object or a bare
     value — so one accessor covers every shape the data arrives in. */
  const get = (key: unknown, fallback: string) => (typeof key === 'function'
    ? key as (r: unknown, i: number) => unknown
    : (r: unknown) => (r && typeof r === 'object'
      ? (r as Record<string, unknown>)[(key as string) || fallback]
      : r));
  const grid = heatGrid(
    spec.data || [],
    get(spec.xKey, 'x'),
    get(spec.groupKey, 'group'),
    get(spec.yKey, 'value'),
  );
  const plot = props.plot;
  const gap = spec.cellGap ?? 2;
  const cw = plot.width / Math.max(1, grid.columns.length);
  const ch = plot.height / Math.max(1, grid.rows.length);
  const base = seriesColor(0, spec.color as string | undefined);
  const stops = spec.colorStops || [];
  const fmt = new Intl.NumberFormat(props.locale, { maximumFractionDigits: 1 });
  return {
    grid,
    columns: grid.columns.map((c, i) => ({ key: c, label: c, x: plot.x + cw * (i + 0.5) })),
    rows: grid.rows.map((r, i) => ({ key: r, label: r, y: plot.y + ch * (i + 0.5) })),
    cells: grid.cells.map((cell) => {
      const t = heatIntensity(cell.value, grid.extent);
      return {
        key: cell.key,
        x: plot.x + cw * cell.cx + gap / 2,
        y: plot.y + ch * cell.cy + gap / 2,
        width: Math.max(0, cw - gap),
        height: Math.max(0, ch - gap),
        /* Intensity as opacity on a token colour rather than an interpolated
           hue: parsing oklch out of a custom property to interpolate it would
           tie the heatmap to a colour format and break theming. */
        fill: stops.length ? (heatBand(t, stops) || base) : base,
        opacity: stops.length ? 1 : 0.12 + t * 0.88,
        label: cell.value === null ? '' : fmt.format(cell.value),
        value: cell.value,
        raw: cell.raw,
        cellLabel: `${grid.columns[cell.cx]} · ${grid.rows[cell.cy]}`,
      };
    }),
    radius: spec.cellRadius ?? 3,
    showLabels: !!spec.showCellLabels,
  };
});

defineExpose({ view });
</script>

<template>
  <g v-if="view" class="apex-cht__heat">
    <rect v-for="c in view.cells" :key="c.key" class="apex-cht__cell"
          :x="c.x" :y="c.y" :width="c.width" :height="c.height" :rx="view.radius"
          :fill="c.fill" :fill-opacity="c.opacity"
          @pointerenter="emit('hover', c)" @pointerleave="emit('leave')" />
    <text v-if="view.showLabels" v-for="c in view.cells" :key="c.key + '-l'"
          class="apex-cht__cell-label" :x="c.x + c.width / 2" :y="c.y + c.height / 2"
          text-anchor="middle" dominant-baseline="middle">{{ c.label }}</text>
    <text v-for="col in view.columns" :key="col.key" class="apex-cht__tick"
          :x="col.x" :y="plot.y + plot.height + 15"
          text-anchor="middle">{{ col.label }}</text>
    <text v-for="row in view.rows" :key="row.key" class="apex-cht__tick"
          :x="plot.x - 8" :y="row.y" text-anchor="end"
          dominant-baseline="middle">{{ row.label }}</text>
  </g>
</template>
