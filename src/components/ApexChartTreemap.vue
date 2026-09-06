<script setup lang="ts">
/**
 * ApexChartTreemap — the treemap family, lifted out of ApexChart.
 *
 * A treemap owns the whole frame: no scales, no axes, no plot rect, and none
 * of the cartesian machinery. That is what makes it separable at all, and it
 * is why this is the first of the three extractions — the seam is obvious
 * here, so the pattern can be proved on 60 lines before the radial family's
 * 300.
 *
 * The tile layout lives here, with treemapLayout and the TreeNode/TreeTile
 * types it needs, so a chart that never draws a treemap does not reach
 * core/chart/special at all.
 *
 * Drill state stays with the parent. It is one ref and three one-line
 * functions, and the breadcrumb it feeds renders OUTSIDE the svg, above the
 * figure caption — a child cannot render into two places, and duplicating the
 * path here so both could read it would be two sources of truth for the same
 * navigation.
 */
import { computed } from 'vue';
import type { ApexChartProps } from '../types';
import { seriesColor } from '../core/chart/layout';
import { treemapLayout, type TreeNode, type TreeTile } from '../core/chart/special';
import type { ChartSeries } from '../core/chart/data';

const props = defineProps<ApexChartProps & {
  /** The resolved series; the first treemap in it is the one drawn. */
  series: ChartSeries[];
  /** How far the user has drilled — an empty path is the top level. */
  drillPath: TreeNode[];
  width: number;
  height: number;
  locale?: string;
}>();

const emit = defineEmits<{ (e: 'drill', tile: TreeTile): void }>();

const view = computed(() => {
  const spec = props.series.find((s) => s.type === 'treemap');
  if (!spec) return null;
  const roots = (props.drillPath.length
    ? (props.drillPath[props.drillPath.length - 1].children || [])
    : (spec.nodes || [])) as TreeNode[];
  const tiles = treemapLayout(roots, { x: 0, y: 0, width: props.width, height: props.height },
    spec.depth ?? 1, spec.tilePadding ?? 2);
  const fmt = new Intl.NumberFormat(props.locale, { notation: 'compact', maximumFractionDigits: 1 });
  return tiles.map((t, i) => ({
    ...t,
    /* Top-level tiles take palette colours in layout order; children inherit
       their parent's so the hierarchy is legible without a legend. */
    fill: t.depth === 0
      ? seriesColor(i, t.node.color)
      : (t.node.color || 'var(--bg-surface)'),
    /* A nested parent is a frame with a header, so it stays quiet behind its
       children; children are near-opaque so nothing bleeds through. */
    opacity: t.nested ? 0.22 : (t.depth === 0 ? 0.9 : 0.95),
    label: t.node.name ?? '',
    valueLabel: fmt.format(t.value),
    showLabel: t.width > 54 && (t.nested ? t.height > 24 : t.height > 26),
    showValue: !t.nested,
    labelY: t.nested ? t.y + 14 : t.y + 17,
  }));
});
</script>

<template>
  <g v-if="view" class="apex-cht__tree">
    <g v-for="t in view" :key="t.key" class="apex-cht__tile" :class="props.ui?.tile"
       :data-drillable="t.drillable ? 'true' : 'false'"
       @click="emit('drill', t)">
      <rect :x="t.x" :y="t.y" :width="Math.max(0, t.width - 2)"
            :height="Math.max(0, t.height - 2)" :fill="t.fill" :fill-opacity="t.opacity" rx="3" />
      <text v-if="t.showLabel" class="apex-cht__tile-name" :x="t.x + 8" :y="t.labelY"
            :data-band="t.nested ? 'true' : 'false'">{{ t.label }}</text>
      <text v-if="t.showLabel && t.showValue" class="apex-cht__tile-value"
            :x="t.x + 8" :y="t.labelY + 14">{{ t.valueLabel }}</text>
    </g>
  </g>
</template>
