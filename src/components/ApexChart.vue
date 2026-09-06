<script setup lang="ts">
/**
 * ApexChart — the chart root: series, scales, plot rect, layers, animation clock.
 *
 * Slice 1 is the engine plus the line series. Everything shared lives here —
 * scales, axes, legend, tooltip, crosshair, hover, the animation clock — which
 * is what will later make a combo chart behave as one chart rather than three
 * overlaid, and cross-chart sync a matter of sharing one store.
 *
 * SVG by default: DOM hit testing, CSS-variable theming, real accessibility, and
 * annotations that are ordinary elements. A canvas series layer takes over past
 * a density threshold, where SVG node count starts to cost more than it returns.
 */
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import {
  createScale, measureText, type AxisSpec, type Scale,
} from '../core/chart/scale';
import {
  applyFrame, applyStacking, applyWaterfall, baselineFrom, easeOutCubic, extentOf, findHit, lttb, resolveSeries,
  snapshot, xExtentOf, type ChartGradient, type ChartPoint, type ChartSeries, type HitMode,
  type HitResult, type HitSnap, type MarkerShape, type ResolvedSeries, type SegmentContext,
  type StackMode, type TweenFrame,
} from '../core/chart/data';
import {
  areaPath, barLabelAnchor, barOutline, barSlots, bubbleRadius, computeLayout, gradientCoords,
  linePath, markerPath, placeLabels, resolveCorners, seriesColor, segmentPieces,
  type BarLabelPlacement, type CurveType, type LabelCandidate,
} from '../core/chart/layout';
import { exportCsv, exportRaster, exportRows, exportSvg, type RasterOptions } from '../core/chart/export';
import {
  angleAt, arcPath, gaugeGeometry, pieLayout, polar, radarPath, sliceAt, spokeAngles, TAU,
  type PieSlice, type RadialFrame,
} from '../core/chart/radial';
import { leaderLabels } from '../core/chart/leaders';
import {
  CHART_GROUP_KEY, clampWindow, isWindowFullyOut, panWindow, toWindow, zoomWindowAbout,
  type ChartGroup, type ZoomRange, type ZoomWindow,
} from '../core/chart/viewport';
import type { ChartPlugin, OverlayNode, PluginApi } from '../core/chart/plugins';
import {
  createChartRegistry, partList, partOne, provideChartRegistry,
} from '../core/chart/registry';
import {
  candleGeometry, candleTones,
  type Candle, type TreeNode, type TreeTile,
} from '../core/chart/special';
import ApexChartTreemap from './ApexChartTreemap.vue';
import ApexChartHeat from './ApexChartHeat.vue';
import type { ApexChartProps } from '../types';

export interface ChartLegendSpec {
  show?: boolean;
  position?: 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
  /** Click a legend entry to hide that series. */
  interactive?: boolean;
}
export interface ChartTooltipSpec {
  show?: boolean;
  mode?: HitMode;
  snap?: HitSnap;
  crosshair?: boolean;
  format?: (value: number, series: string) => string;
}
export interface ChartHoverSpec {
  brightness?: number;
  /** Fades the series you are not on. 1 leaves them alone. */
  dimOpacity?: number;
  radiusMultiplier?: number;
  color?: string;
  borderColor?: string;
  borderWidth?: number;
}

export interface ChartZoomSpec {
  wheel?: boolean;
  /** Drag a range to zoom into it. */
  drag?: boolean;
  /** Shift-drag, or two-finger drag, to pan. */
  pan?: boolean;
  touch?: boolean;
  /**
   * Which axes a drag selects. Defaults to 'xy' for a point chart and 'x'
   * otherwise: a scatter cluster is two-dimensional, so narrowing x alone gives a
   * vertical slab containing everything rather than isolating the group.
   */
  mode?: 'x' | 'y' | 'xy';
}

export interface ChartNavigatorSpec {
  height?: number;
  /** Which series the overview draws. Defaults to the first visible one. */
  series?: string;
  curve?: CurveType;
}

export interface ChartReferenceLine {
  axis?: 'x' | 'y';
  value: number | string | Date;
  label?: string;
  /** Which end the label sits at. 'end' keeps it out of rising data. */
  labelPosition?: 'start' | 'end';
  color?: string;
  dash?: string;
  width?: number;
}

export interface ChartReferenceBand {
  axis?: 'x' | 'y';
  from: number | string | Date;
  to: number | string | Date;
  label?: string;
  color?: string;
  opacity?: number;
}

export interface ChartDataLabelSpec {
  show?: boolean;
  /** Radial only. 'outside' adds leader lines; 'inside' keeps the centroid. */
  position?: 'inside' | 'outside';
  /** What the label says. */
  display?: 'value' | 'percentage' | 'both' | 'label' | 'label-percentage';
  /**
   * Which property names the point, for display 'label'.
   *
   * A numeric x axis has no category to fall back on, so without this the label
   * would silently be the x value — which is already on the axis.
   */
  labelKey?: string;
  /** Slices under this share carry no label at all — see minPercentage. */
  minPercentage?: number;
  /** 'straight' keeps the radial elbow rather than levelling it with the text. */
  lineStyle?: 'angled' | 'straight';
  /**
   * Bars only. Outside-end never covers the data, which is why it is the default;
   * dense charts want inside-end, and a stacked segment can only carry
   * inside-center, so stacked series default to that rather than inheriting.
   */
  placement?: BarLabelPlacement;
  format?: (value: number, point: ChartPoint) => string;
  /** Distance above the point. */
  offset?: number;
  /** false draws every label, collisions and all. */
  collision?: boolean;
  /** Label only the ends and the extremes, which is what dense series can carry. */
  sparse?: boolean;
}

const props = withDefaults(defineProps<ApexChartProps & {
  series?: ChartSeries[];
  xAxis?: AxisSpec;
  yAxis?: AxisSpec;
  /** A second y axis, for a series whose units would hide it on the first. */
  y2Axis?: AxisSpec;
  title?: string;
  caption?: string;
  legend?: ChartLegendSpec;
  tooltip?: ChartTooltipSpec;
  hover?: ChartHoverSpec;
  curve?: CurveType;
  tension?: number;
  connectNulls?: 'gap' | 'connect' | 'zero' | boolean;
  /** Stacks series sharing a stack id; 'percent' normalizes each category to 100. */
  stackMode?: StackMode;
  /**
   * Swaps the axes: categories run down the left and values across. It is a
   * chart-level choice rather than per series, because two series cannot share a
   * category axis pointing in different directions.
   */
  orientation?: 'vertical' | 'horizontal';
  /** Fraction of the band left empty between categories. */
  categoryGap?: number;
  /** Fraction of each slot left empty between bars in a group. */
  barGap?: number;
  /** Kept as an alias for categoryGap. */
  barPadding?: number;
  barThickness?: number;
  maxBarThickness?: number;
  /** 'overlap' layers bars at one position, back to front, rather than grouping. */
  barMode?: 'group' | 'overlap';
  overlapRatio?: number;
  barRadius?: number | { tl?: number; tr?: number; br?: number; bl?: number };
  barBorderColor?: string;
  barBorderWidth?: number;
  barBorderDash?: number[] | string;
  borderSkipped?: 'start' | 'end' | 'middle' | false;
  minBarLength?: number;
  /* ── radial ── */
  innerRadius?: number;
  padAngle?: number;
  startAngle?: number;
  endAngle?: number;
  /**
   * Fraction of the fitted radius the ring occupies. Below 1 it leaves room for
   * external labels, which is why the two arrived together — labels outside a
   * ring sized to fill the box would run off the edge.
   */
  outerRadius?: number;
  /** Rings behind a radar, for reading values off. */
  radarRings?: number;
  /** Text in the middle of a donut or gauge. */
  centerLabel?: string;
  centerValue?: string;
  dataLabels?: boolean | ChartDataLabelSpec;
  zoom?: boolean | ChartZoomSpec;
  /** Bindable visible window; an [lo, hi] pair still means "x only". */
  zoomRange?: ZoomRange | ZoomWindow | null;
  navigator?: boolean | ChartNavigatorSpec;
  referenceLines?: ChartReferenceLine[];
  referenceBands?: ChartReferenceBand[];
  plugins?: ChartPlugin[];
  /**
   * A download menu on the chart. Off by default: it is the first piece of
   * application chrome inside a chart, and a dashboard tile usually does not want
   * it. When on, it calls the same export methods the ref exposes.
   */
  toolbar?: boolean | { items?: ('png' | 'svg' | 'csv' | 'reset-zoom')[] };
  /** Default label placement for reference lines. */
  referenceLabelPosition?: 'start' | 'end';
  showMarkers?: boolean;
  markerSize?: number;
  markerShape?: MarkerShape;
  /**
   * Stacked plot areas sharing one x axis.
   *
   * Weights rather than pixels, so the split survives a resize. A series names
   * its pane with `pane`; anything unnamed lands in the first, which is what keeps
   * every existing chart working unchanged.
   */
  panes?: { id: string; weight?: number; label?: string }[];
  /** Vertical gap between panes, in pixels. */
  paneGap?: number;
  /** Doji colour — open equals close. Indecision is not a tiny up candle. */
  neutralColor?: string;
  /** Candle body width as a fraction of the category band. */
  barWidthRatio?: number;
  wickStrokeWidth?: number;
  /** Chart-wide point border. A white one is what separates overlapping points. */
  pointBorderColor?: string;
  pointBorderStrokeWidth?: number;
  lineStrokeWidth?: number;
  /** Hit area around a point, independent of its drawn size. */
  pointHitRadius?: number;
  height?: string | number;
  /** 'auto' hands the series layer to canvas past decimationThreshold points. */
  renderer?: 'svg' | 'canvas' | 'auto';
  /** false disables downsampling; a number sets the target point count. */
  decimation?: boolean | number;
  decimationThreshold?: number;
  animation?: boolean;
  animationDuration?: number;
  /**
   * How a line or area arrives.
   *
   * 'draw' sweeps a reveal along the category axis so the series looks drawn;
   * 'grow' interpolates from the baseline; 'auto' draws when every series is a
   * line and grows otherwise, since a sweep says nothing about a pie.
   *
   * A reveal rather than a value interpolation, because a drawn line has to show
   * its real shape as it appears — interpolating toward it would move the whole
   * curve, which is a different gesture.
   */
  entrance?: 'auto' | 'draw' | 'sweep' | 'scale' | 'grow' | 'none';
  entranceDuration?: number;
  /** Play once the chart is actually on screen, and only once. */
  entranceOnVisible?: boolean;
  /** Free: our angles already run clockwise, so ccw is the cursor reversed. */
  entranceDirection?: 'cw' | 'ccw';
  /** A screen-reader table of the plotted values. */
  dataTable?: boolean;
  ariaLabel?: string;
  /** BCP 47 tag for every number and date the chart formats. */
  locale?: string;
  /** 'auto' reads the document's direction. */
  direction?: 'ltr' | 'rtl' | 'auto';
  /**
   * Width-keyed overrides, narrowest match last. A chart cannot know that its
   * legend has stopped fitting from a media query — the query measures the
   * viewport, and the chart is in a column of unknown width.
   */
  responsive?: { maxWidth: number; [key: string]: unknown }[];
}>(), {
  curve: 'linear', tension: 0.5, connectNulls: 'gap', stackMode: 'none',
  orientation: 'vertical', barPadding: 0.28, barGap: 0.1, barRadius: 3,
  barMode: 'group', overlapRatio: 0.6, borderSkipped: 'start',
  innerRadius: 0, padAngle: 0, startAngle: 0, outerRadius: 1, radarRings: 4, direction: 'auto',
  barWidthRatio: 0.7, wickStrokeWidth: 1, paneGap: 26,
  lineStrokeWidth: 2, markerSize: 3.5, markerShape: 'circle', pointHitRadius: 12,
  height: 320, renderer: 'auto', decimation: true, decimationThreshold: 2000,
  animation: true, animationDuration: 620,
  entrance: 'auto', entranceDuration: 900, entranceOnVisible: true, entranceDirection: 'cw',
  referenceLabelPosition: 'end',
});

const emit = defineEmits<{
  (e: 'point-click', payload: { series: string; point: ChartPoint; originalEvent: MouseEvent }): void;
  (e: 'hover-change', payload: HitResult | null): void;
  (e: 'legend-toggle', payload: { series: string; hidden: boolean }): void;
  /* Emits what the prop accepts. It declared ZoomRange while setZoom sends a
     ZoomWindow, so the two halves of v-model:zoomRange disagreed on their own
     payload type. */
  (e: 'update:zoomRange', payload: ZoomRange | ZoomWindow | null): void;
  (e: 'zoom-change', payload: { range: ZoomRange | null; full: boolean }): void;
}>();

/* A group, when one is above us, owns the window, the crosshair key and the
   hidden set — so sync is shared state rather than events between siblings. */
const group = inject<ChartGroup | null>(CHART_GROUP_KEY, null);

/*
 * Compound children register into this and render nothing, so the markup form
 * and the props form arrive at exactly the same inputs — one engine, two ways of
 * writing the same chart. A registered part wins over the equivalent prop,
 * because it is the more specific declaration; series are all-or-nothing rather
 * than merged, since mixing two sources would make paint order ambiguous.
 */
const registry = createChartRegistry();
provideChartRegistry(registry);

/**
 * The responsive rule in force, if any. Keyed on the chart's own measured width
 * rather than a media query, because the viewport says nothing about how much
 * room this chart was given.
 */
const responsiveOverride = computed<Record<string, unknown>>(() => {
  const rules = (props.responsive || [])
    .filter((r) => size.value.width <= r.maxWidth)
    .sort((a, b) => b.maxWidth - a.maxWidth);
  return rules.reduce((acc, r) => ({ ...acc, ...r }), {} as Record<string, unknown>);
});
function withResponsive<T>(key: string, base: T): T {
  const over = responsiveOverride.value[key];
  if (over === undefined) return base;
  if (base && typeof base === 'object' && typeof over === 'object') {
    return { ...(base as object), ...(over as object) } as T;
  }
  return over as T;
}

const merged = {
  series: computed(() => {
    const declared = partList<ChartSeries>(registry, 'series');
    return declared.length ? declared : (props.series || []);
  }),
  xAxis: computed(() => withResponsive('xAxis', {
    locale: props.locale,
    ...(props.xAxis || {}),
    ...(partOne<AxisSpec>(registry, 'xAxis') || {}),
  })),
  yAxis: computed(() => withResponsive('yAxis', {
    locale: props.locale,
    ...(props.yAxis || {}),
    ...(partOne<AxisSpec>(registry, 'yAxis') || {}),
  })),
  y2Axis: computed(() => {
    const part = partOne<AxisSpec>(registry, 'y2Axis');
    if (!props.y2Axis && !part) return undefined;
    return withResponsive('y2Axis', { locale: props.locale, ...(props.y2Axis || {}), ...(part || {}) });
  }),
  legend: computed(() => withResponsive('legend', { ...(props.legend || {}), ...(partOne(registry, 'legend') || {}) })),
  tooltip: computed(() => withResponsive('tooltip', { ...(props.tooltip || {}), ...(partOne(registry, 'tooltip') || {}) })),
  hover: computed(() => ({ ...(props.hover || {}), ...(partOne(registry, 'hover') || {}) })),
  title: computed(() => partOne<{ text?: string }>(registry, 'title')?.text ?? props.title),
  caption: computed(() => partOne<{ text?: string }>(registry, 'caption')?.text ?? props.caption),
  dataLabels: computed(() => withResponsive('dataLabels', partOne(registry, 'dataLabels') ?? props.dataLabels)),
  zoom: computed(() => partOne(registry, 'zoom') ?? props.zoom),
  navigator: computed(() => withResponsive('navigator', partOne(registry, 'navigator') ?? props.navigator)),
  referenceLines: computed(() => {
    const declared = partList<ChartReferenceLine>(registry, 'referenceLine');
    return declared.length ? declared : (props.referenceLines || []);
  }),
  referenceBands: computed(() => {
    const declared = partList<ChartReferenceBand>(registry, 'referenceBand');
    return declared.length ? declared : (props.referenceBands || []);
  }),
};

const TICK_FONT = '11px var(--font-sans, system-ui)';
const root = ref<HTMLElement | null>(null);
/* One projector, so hit testing, the crosshair and the tooltip cannot disagree
   about where a point is. */
function projectPoint(s: ResolvedSeries, p: ChartPoint) {
  const cat = catScale();
  const val = valScale(s);
  return horizontal.value
    ? { px: val.map(p.y as number), py: cat.map(p.x) }
    : { px: cat.map(p.x), py: val.map(p.y as number) };
}
const plotBox = ref<HTMLElement | null>(null);
const canvasEl = ref<HTMLCanvasElement | null>(null);
const size = ref({ width: 640, height: 320 });
const hidden = ref(new Set<string>());
const hit = shallowRef<HitResult | null>(null);
const focusIndex = ref(-1);
const pointer = ref({ x: 0, y: 0 });

/* ─── resolve ────────────────────────────────────────────── */
const categorical = computed(() => (merged.xAxis.value?.type || 'category') === 'category');

/** The tween writes into these, so they are rebuilt rather than derived. */
const live = shallowRef<ResolvedSeries[]>([]);
const categories = ref<string[]>([]);

function rebuild(): { resolved: ResolvedSeries[]; categories: string[] } {
  const out = resolveSeries(merged.series.value || [], {
    categorical: categorical.value,
    hidden: hidden.value,
  });
  /* Stacking is a relationship between series, so it is computed once on the
     whole list — and the tween then interpolates the stacked values, rather
     than re-stacking on every frame. */
  applyWaterfall(out.resolved);
  applyStacking(out.resolved, props.stackMode);
  return out;
}

/* Bars need band centres, and everything else on the axis has to use the same
   centres or a combo chart would be misaligned by half a step. */
const hasBars = computed(() => (merged.series.value || []).some((s) => s.type === 'bar'));

/**
 * A radial chart has no plot rect, gridlines or axes, so the whole cartesian
 * layout is skipped rather than being drawn and hidden. The family is decided by
 * the series, not a separate mode prop — the type already says it.
 */
const RADIAL_TYPES = ['pie', 'gauge', 'radar', 'polar'];
/* A treemap has no scales at all, and a heatmap's y axis is categorical rather
   than numeric, so both bypass the cartesian value scale. */
const hasHeatmap = computed(() => merged.series.value.some((s) => s.type === 'heatmap'));
const hasTreemap = computed(() => merged.series.value.some((s) => s.type === 'treemap'));
const hasCandles = computed(() => merged.series.value.some((s) => s.type === 'candlestick'));
const radial = computed(() => (merged.series.value || []).some((s) => RADIAL_TYPES.includes(s.type || '')));
const radialKind = computed(() => (merged.series.value || [])
  .find((s) => RADIAL_TYPES.includes(s.type || ''))?.type || 'pie');
const horizontal = computed(() => props.orientation === 'horizontal');

/* Read once from the rendered element rather than assumed, so a chart inside an
   [dir=rtl] subtree follows it without being told. */
const rtl = ref(false);
/**
 * Reads the rendered direction and reports whether it changed.
 *
 * It must run after layout: a mount-time read happens before the computed
 * direction has resolved, so an inherited [dir=rtl] latched to false and nothing
 * ever looked again. The ResizeObserver tick is the reliable moment — it is
 * post-layout by definition and already rebuilds the scales.
 */
function detectDirection(): boolean {
  const next = props.direction !== 'auto'
    ? props.direction === 'rtl'
    : !!root.value && getComputedStyle(root.value).direction === 'rtl';
  if (next === rtl.value) return false;
  rtl.value = next;
  return true;
}
/* The flag alone is not enough: buildScales re-reads catSpec.reverse and
   computeLayout takes rtl, so a change has to run that work or the axis flips
   without the margins following. */
watch(() => props.direction, () => { if (detectDirection()) commit(false); });

/* ─── scales ─────────────────────────────────────────────── */
/**
 * An area fill implies magnitude from a baseline, so it earns a zero.
 *
 * AF2-236: this was `anyFill`, and the two places that read it call it
 * needsZeroBaseline — so it was both "declared but never read" and "cannot
 * find name" at once. The name the callers use wins; the rule is unchanged.
 */
const needsZeroBaseline = computed(() => (merged.series.value || []).some((s) => (s.fillOpacity ?? 0) > 0)
  || props.stackMode !== 'none'
  /* 'zero' turns every null into a real zero on screen, so zero has to be inside
     the domain or those points plot outside the plot area entirely. */
  || props.connectNulls === 'zero');

/**
 * Every visible series is a cloud of points rather than a trace.
 *
 * AF2-236: derived, not invented. `entranceMode` computes the identical
 * expression under the local name `pointy`, and the three readers here want
 * the same thing \u2014 a scatter has no shared x to snap a tooltip to, and a drag
 * over one means a box rather than a span.
 */
const pointsOnly = computed(() => live.value.length > 0
  && live.value.every((s) => s.type === 'scatter' || s.type === 'bubble'));

/* ─── zoom ───────────────────────────────────────────────── */
const localZoom = ref<ZoomRange | ZoomWindow | null>(null);

/**
 * The zoom as stored: a window, with an x range and optionally a y one.
 *
 * AF2-236: derived from what writes and reads it. setZoom stores the result of
 * clampWindow, which is a ZoomWindow; currentWindow reads `.x` and `.y` off
 * this. The stored value was typed ZoomRange, which is why assigning to it was
 * also a type error \u2014 one wrong type and two missing names, all the same
 * mistake. toWindow normalises either shape, and it was already imported for
 * setZoom.
 */
const zoomWindow = computed<ZoomWindow | null>(() =>
  toWindow(group ? group.state.zoom : localZoom.value));

/** The x half \u2014 what windowing and decimation mean by "the zoom". */
const zoomRange = computed<ZoomRange | null>(() => zoomWindow.value?.x ?? null);

/** The y half, which exists only for a 2-D zoom; it is what clips the plot. */
const zoomY = computed<ZoomRange | null>(() => zoomWindow.value?.y ?? null);

/** The full extent, which every zoom operation is clamped against. */
const xBounds = computed<ZoomRange>(() => {
  if (categorical.value) return [0, Math.max(0, categories.value.length - 1)];
  const e = xExtentOf(live.value);
  return Number.isFinite(e[0]) ? e : [0, 1];
});
/** The full y extent, so a y zoom clamps against the data rather than the view. */
const yBounds = computed<ZoomRange>(() => {
  const e = extentOf(live.value);
  return Number.isFinite(e[0]) ? e : [0, 1];
});
const dragMode = computed<'x' | 'y' | 'xy'>(() => zoomSpec.value.mode
  || (pointsOnly.value ? 'xy' : 'x'));

const zoomSpec = computed<ChartZoomSpec>(() => (typeof merged.zoom.value === 'object'
  ? merged.zoom.value
  : { wheel: !!merged.zoom.value, drag: !!merged.zoom.value, pan: !!merged.zoom.value, touch: !!merged.zoom.value }));
const zoomOn = computed(() => !!(zoomSpec.value.wheel || zoomSpec.value.drag
  || zoomSpec.value.pan || zoomSpec.value.touch));

function setZoom(range: ZoomRange | ZoomWindow | null) {
  const win = toWindow(range);
  const next = win ? clampWindow(win, xBounds.value, yBounds.value) : null;
  if (group) group.setZoom(next);
  else localZoom.value = next;
  emit('update:zoomRange', next);
  emit('zoom-change', {
    range: next,
    full: isWindowFullyOut(next, xBounds.value, yBounds.value),
  });
  /* Rebuilding rather than only rescaling: the visible window decides which
     points survive decimation, which is what makes zooming into a large series
     reveal detail instead of magnifying an approximation. */
  buildScales();
  decimate();
  paint();
}
/*
 * The input half of `v-model:zoomRange`.
 *
 * This watched `merged.zoom.valueRange` — no `.value`, and no such field on
 * anything. It read undefined on every evaluation, so the watcher never fired
 * and a caller-supplied range was silently ignored while the emit half kept
 * working. A one-way v-model that reports but never accepts.
 */
watch(() => props.zoomRange, (v) => { if (!group) localZoom.value = toWindow(v ?? null); });

/**
 * The pane rects, split from the plot by weight.
 *
 * `plot` remains the UNION of every pane, so the x axis, navigator, brush and
 * crosshair keep working against it untouched — the split only concerns what is
 * drawn inside.
 */
const paneList = computed(() => (props.panes?.length ? props.panes : [{ id: '_', weight: 1 }]));
function paneIndexOf(s: ResolvedSeries) {
  const id = (s.spec as { pane?: string }).pane;
  if (!id) return 0;
  const i = paneList.value.findIndex((p) => p.id === id);
  return i < 0 ? 0 : i;
}
/** What the template draws per pane: its rect, its scale, its ticks, its title. */
const paneViews = computed(() => {
  const rects = paneRects.value;
  const per = scales.value?.paneY;
  if (!per || rects.length < 2) {
    return [{ index: 0, rect: rects[0] || layoutState.value.plot, scale: scales.value?.left, ticks: [], label: '' }];
  }
  return rects.map((rect, i) => ({
    index: i,
    rect,
    scale: per[i],
    ticks: per[i]?.ticks || [],
    label: paneList.value[i]?.label || (i === 0 ? (merged.yAxis.value?.label || '') : ''),
  }));
});

const paneRects = computed(() => {
  const plot = layoutState.value.plot;
  const list = paneList.value;
  if (list.length < 2) return [plot];
  const gap = props.paneGap;
  const total = list.reduce((n, p) => n + (p.weight ?? 1), 0) || 1;
  const usable = Math.max(20, plot.height - gap * (list.length - 1));
  let y = plot.y;
  return list.map((p) => {
    const h = usable * ((p.weight ?? 1) / total);
    const rect = { x: plot.x, y, width: plot.width, height: h };
    y += h + gap;
    return rect;
  });
});
function paneRectOf(s: ResolvedSeries) { return paneRects.value[paneIndexOf(s)] || layoutState.value.plot; }

const layoutState = shallowRef({
  plot: { x: 40, y: 8, width: 560, height: 260 },
  xRotate: 0,
  xVisible: [] as number[],
});
/*
 * paneY is part of this shape, not an extra bolted on.
 *
 * buildScales writes it and two readers consume it, but the type never named
 * it — so the compiler could neither check the writers nor warn a reader that
 * it might be absent. A field the type does not describe is exactly how
 * `index` and `pointer` survived: the checker had nothing to check against.
 */
const scales = shallowRef<{
  x: Scale; left: Scale; right: Scale | null;
  /** One y scale per pane. Single-pane charts get `[left]`. */
  paneY?: Scale[];
}>();

/**
 * The series restricted to the visible window, for deriving the y domain. A
 * zoomed line otherwise sits in a domain sized by data that is off screen, so
 * zooming in makes the trace flatter rather than more legible.
 */
function windowed(series: ResolvedSeries[]): ResolvedSeries[] {
  const win = zoomRange.value;
  if (!win) return series;
  return series.map((s) => ({
    ...s,
    points: s.points.filter((p) => p.x >= win[0] && p.x <= win[1]),
  }));
}

function buildScales() {
  const series = live.value;
  /* AF2-236: paneScales reads `inWindow` and nothing declared it. windowed()
     directly above is what it means — the same restriction the x scale applies
     — so a pane's y domain comes from the points actually on screen. */
  const inWindow = windowed(series);
  const hasRight = series.some((s) => !s.hidden && s.axis === 'right');

  /* Scales are built against a provisional rect, the rect is measured from the
     resulting tick labels, then the scales are rebuilt into the real rect. */
  const provisional = { x: 0, y: 0, width: size.value.width, height: size.value.height };
  const make = (w: Rectish) => {
    /* The window overrides the axis extent, and nice is off inside a zoom: a
       niced domain would snap the edges outward and the view would not match
       what was selected. */
    const win = zoomRange.value;
    /* RTL reverses the category axis rather than mirroring the chart: a
       transform would reverse the labels too. */
    const catSpec = { ...(merged.xAxis.value || {}), band: hasBars.value, reverse: rtl.value };
    /* Horizontal swaps which physical scale carries the categories. Everything
       downstream reads catScale/valScale rather than x/y, so the swap lives in
       one place instead of in every renderer. */
    const x = horizontal.value
      ? createScale({
        spec: merged.yAxis.value || {},
        range: [w.x, w.x + w.width],
        extent: extentOf(windowed(series), hasRight ? 'left' : undefined),
        includeZero: merged.yAxis.value?.includeZero ?? needsZeroBaseline.value,
      })
      : createScale({
        spec: win
          ? { ...catSpec, min: win[0], max: win[1], nice: false }
          : catSpec,
        range: [w.x, w.x + w.width],
        extent: win || xExtentOf(series),
        categories: categorical.value ? categories.value : undefined,
      });
    const left = horizontal.value
      ? createScale({
        spec: { ...catSpec, reverse: false },
        range: [w.y, w.y + w.height],
        extent: win || xExtentOf(series),
        categories: categorical.value ? categories.value : undefined,
      })
      : createScale({
        spec: merged.yAxis.value || {},
        range: [w.y + w.height, w.y],
        extent: extentOf(windowed(series), hasRight ? 'left' : undefined),
        includeZero: merged.yAxis.value?.includeZero ?? needsZeroBaseline.value,
      });
    const right = hasRight ? createScale({
      spec: merged.y2Axis.value || {},
      range: [w.y + w.height, w.y],
      extent: extentOf(windowed(series), 'right'),
      includeZero: merged.y2Axis.value?.includeZero ?? false,
    }) : null;
    return { x, left, right };
  };

  /**
   * A y scale per pane, from the extent of THAT pane's series only. That is the
   * whole point of a pane: volume in millions must not flatten a price axis.
   */
  const paneScales = (rects: { x: number; y: number; width: number; height: number }[]) =>
    rects.map((rect, pi) => {
      const own = inWindow.filter((s) => paneIndexOf(s) === pi);
      const e = extentOf(own.length ? own : inWindow);
      const mine = own.length ? own : inWindow;
      /* Per pane: a bar's length means magnitude from zero, a candle's body means
         a range between two prices. */
      const paneZero = (merged.yAxis.value || {}).type === 'log'
        ? false
        : mine.some((s) => s.type === 'bar' || (s.spec.fillOpacity ?? 0) > 0);
      return createScale({
        spec: pi === 0 && zoomY.value
          ? { ...(merged.yAxis.value || {}), min: zoomY.value[0], max: zoomY.value[1], nice: false }
          : (pi === 0 ? (merged.yAxis.value || {}) : {}),
        range: [rect.y + rect.height, rect.y],
        extent: (pi === 0 && zoomY.value) || Number.isFinite(e[0]) ? (pi === 0 && zoomY.value ? zoomY.value : e) : [0, 1],
        includeZero: pi === 0 && zoomY.value ? false : paneZero,
      });
    });

  const first = make(provisional);
  const layout = computeLayout({
    width: size.value.width,
    height: size.value.height,
    xTicks: first.x.ticks,
    leftTicks: first.left.ticks,
    rightTicks: first.right?.ticks || [],
    xSpec: merged.xAxis.value || {},
    ySpec: merged.yAxis.value || {},
    y2Spec: merged.y2Axis.value,
    tickFont: TICK_FONT,
    titleFont: TICK_FONT,
    rtl: rtl.value,
  });
  layoutState.value = layout;
  const built = make(layout.plot);
  /* paneY[0] is the same scale as `left`, so a single-pane chart is unchanged and
     nothing downstream has to know whether panes were asked for. */
  const rects = paneRects.value;
  scales.value = {
    ...built,
    paneY: rects.length > 1 ? paneScales(rects) : [built.left],
  };
}

interface Rectish { x: number; y: number; width: number; height: number }

/* ─── decimation ─────────────────────────────────────────── */
/**
 * Runs before the renderer chooses SVG or canvas, which is why most "too many
 * points" cases never need canvas at all: 50k points into 800px cannot show
 * 50k points whichever way they are drawn.
 */
function decimate() {
  if (props.decimation === false) {
    live.value.forEach((s) => { s.drawn = s.points; });
    return;
  }
  const target = typeof props.decimation === 'number'
    ? props.decimation
    : Math.max(64, Math.round(layoutState.value.plot.width * 2));
  const win = zoomRange.value;
  live.value.forEach((s) => {
    /* One point either side of the window is kept, so the line still enters and
       leaves the plot rather than starting at the first visible vertex. */
    const pool = win ? clipToWindow(s.points, win) : s.points;
    s.drawn = pool.length > props.decimationThreshold ? lttb(pool, target) : pool;
  });
}

function clipToWindow(points: ChartPoint[], win: ZoomRange): ChartPoint[] {
  const out: ChartPoint[] = [];
  for (let i = 0; i < points.length; i += 1) {
    const p = points[i];
    if (p.x >= win[0] && p.x <= win[1]) out.push(p);
    else if (out.length) { out.push(p); break; }
  }
  const firstIn = points.findIndex((p) => p.x >= win[0]);
  if (firstIn > 0 && out[0] !== points[firstIn - 1]) out.unshift(points[firstIn - 1]);
  return out;
}

const decimated = computed(() => live.value.some((s) => s.drawn.length < s.points.length));
/**
 * The canvas layer draws line and area only. Anything else — bars, candles,
 * slices, cells, tiles — stays in SVG, because a request for canvas must not
 * silently produce an empty chart.
 */
const canvasCapable = computed(() => {
  if (radial.value || hasHeatmap.value || hasTreemap.value) return false;
  return live.value.every((s) => s.hidden || s.type === 'line');
});
const useCanvas = computed(() => {
  if (!canvasCapable.value) return false;
  if (props.renderer === 'canvas') return true;
  if (props.renderer === 'svg') return false;
  const drawn = live.value.reduce((n, s) => n + (s.hidden ? 0 : s.drawn.length), 0);
  return drawn > props.decimationThreshold;
});

/* ─── entrance reveal ────────────────────────────────────── */
/**
 * One clip that sweeps along the category axis. A clip rather than a stroke
 * dash offset: it reveals the fill, the markers and the labels with the line
 * instead of only the stroke, needs no per-path length measurement, and the
 * canvas layer can apply the same rectangle.
 */
const revealMode = computed<'draw' | 'sweep' | 'scale' | 'grow' | 'none'>(() => {
  if (!props.animation) return 'none';
  if (props.entrance === 'none') return 'none';
  /* A radar cannot sweep: an angular cursor across a polygon distorts the shape
     as it crosses. Asking for one anyway must fall back to grow rather than
     resolve to a mode no renderer implements, which shows no animation at all. */
  if (props.entrance === 'sweep' && radial.value && radialKind.value === 'radar') return 'grow';
  if (props.entrance !== 'auto') return props.entrance;
  /* Points scale in place from zero radius: lifting them from the baseline reads
     as the data moving rather than the chart arriving. */
  const pointy = live.value.length
    && live.value.every((s) => s.type === 'scatter' || s.type === 'bubble');
  if (pointy) return 'scale';
  /* 'auto' has to answer per family: a sweep along an axis says nothing about a
     pie, and an angular sweep across a radar would distort the polygon as it
     crossed — triangle to quadrilateral — which reads as the data changing
     rather than the chart arriving. */
  if (radial.value) {
    if (radialKind.value === 'radar') return 'grow';
    return 'sweep';
  }
  const drawable = live.value.length && live.value.every((s) => s.type === 'line');
  return drawable ? 'draw' : 'grow';
});

/**
 * How far round the reveal has travelled, 0–1. Slices are CLAMPED to it rather
 * than covered by a rotating clip: nothing exists ahead of the cursor, so an
 * unrevealed slice cannot be hovered, where a clip would leave every slice
 * full-size and invisible-but-hoverable.
 */
const sweep = computed(() => (revealMode.value === 'sweep' ? reveal.value : 1));
const ccw = computed(() => props.entranceDirection === 'ccw');
/* A total sitting in an empty ring before its slices arrive is odd, so it comes
   in over the sweep's second half rather than being present from the start. */
const centerOpacity = computed(() => Math.max(0, Math.min(1, (sweep.value - 0.5) * 2)));
/**
 * Clamps a wedge to the cursor, working in PROGRESS along the ring rather than in
 * angles — so counter-clockwise is the same arithmetic with the ends read the
 * other way round, instead of a second branch flipping signs.
 *
 * Returns null when the cursor has not reached the wedge at all.
 */
function clampWedge(a0: number, a1: number, from: number, to: number): [number, number] | null {
  if (sweep.value >= 1) return [a0, a1];
  const span = to - from;
  const cursor = span * sweep.value;
  /* How far into the ring each edge sits, measured from whichever end leads. */
  const lead = ccw.value ? to - a1 : a0 - from;
  const trail = ccw.value ? to - a0 : a1 - from;
  if (lead >= cursor) return null;
  const capped = Math.min(trail, cursor);
  return ccw.value ? [to - capped, a1] : [a0, from + capped];
}

const reveal = ref(1);
const revealPlayed = ref(false);
let revealRaf: number | null = null;
let visibility: IntersectionObserver | null = null;

function prefersStill() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function playReveal() {
  const mode = revealMode.value;
  if (revealPlayed.value || (mode !== 'draw' && mode !== 'sweep' && mode !== 'scale')) return;
  revealPlayed.value = true;
  if (prefersStill()) { reveal.value = 1; return; }
  const began = performance.now();
  /* A 90° gauge animating for the same duration as a full pie reads sluggish, so
     the clock scales with the angle actually swept — floored, or a thin arc
     would flash rather than move. */
  const frame = radialFrame.value;
  const swept = Math.abs((frame.end ?? TAU) - (frame.start ?? 0)) || TAU;
  const scale = mode === 'sweep' ? Math.max(0.45, Math.min(1, swept / TAU)) : 1;
  const dur = Math.max(1, props.entranceDuration * scale);
  /* Linear for a sweep: easeOutCubic over 360° spends most of its time crawling
     through the last few degrees, and a radar sweep is a constant-speed hand. */
  const ease = mode === 'sweep' ? (t: number) => t : easeOutCubic;
  reveal.value = 0;
  const step = () => {
    const t = Math.min(1, (performance.now() - began) / dur);
    reveal.value = ease(t);
    if (t < 1) revealRaf = requestAnimationFrame(step);
    else revealRaf = null;
  };
  revealRaf = requestAnimationFrame(step);
}

/** The revealed rectangle, growing along whichever axis carries the categories. */
const clipRect = computed(() => {
  const plot = layoutState.value.plot;
  const t = reveal.value;
  /* A little slack, so a marker or a halo sitting on the leading edge is not
     sliced in half as the sweep passes it. */
  const pad = 3;
  if (horizontal.value) {
    return {
      x: plot.x - pad,
      y: plot.y - pad,
      width: plot.width + pad * 2,
      height: Math.max(0, plot.height * t + pad * 2),
    };
  }
  return {
    x: plot.x - pad,
    y: plot.y - pad,
    width: Math.max(0, plot.width * t + pad * 2),
    height: plot.height + pad * 2,
  };
});
const clipping = computed(() => revealMode.value === 'draw' && reveal.value < 1);
/**
 * A y window puts data outside the plot rect, so the series layer is clipped to
 * it. Filtering those points out instead would silently reduce the rendered count
 * — which looks exactly like a working zoom, and is the failure this avoids.
 */
/*
 * AF2-236: declared HERE, not eighty lines below.
 *
 * plotClipId reads uid, and const is in its temporal dead zone until its
 * own line runs — so setup threw "Cannot access 'uid' before
 * initialization" and the chart could not mount at all. The original has
 * the same order; nothing caught it because nothing had ever mounted an
 * ApexChart, in the suite or in the docs.
 */
const uid = Math.random().toString(36).slice(2, 8);
const uidClip = `cht-clip-${uid}`;

const plotClipId = `cht-plot-${uid}`;
const clipToPlot = computed(() => !!zoomY.value);
const seriesClip = computed(() => {
  if (clipping.value) return `url(#${uidClip})`;
  if (clipToPlot.value) return `url(#${plotClipId})`;
  return undefined;
});

/* ─── animation ──────────────────────────────────────────── */
let raf: number | null = null;
let prevFrame: TweenFrame | null = null;
/**
 * The values the tween is heading for.
 *
 * A radar normalises radius against the maximum, so reading that maximum from
 * the LIVE points makes it move with them and the ratio stays constant — the
 * polygon would be identical at every frame, which is a tween that cancels
 * itself exactly.
 */
const targetFrame = ref<TweenFrame | null>(null);

function stopAnim() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

function commit(animate: boolean) {
  const built = rebuild();
  categories.value = built.categories;
  live.value = built.resolved;
  buildScales();
  decimate();

  const target = snapshot(live.value);
  targetFrame.value = target;
  const baseline = scales.value ? clampBaseline(scales.value.left) : 0;

  /* A draw reveal shows the real shape immediately and uncovers it, so the
     baseline interpolation is skipped on that first pass — running both would
     move the curve while it was being revealed. */
  const drawing = animate && !revealPlayed.value
    && ['draw', 'sweep', 'scale'].includes(revealMode.value);
  if (!animate || !props.animation || drawing) {
    prevFrame = target;
    paint();
    return;
  }
  /* Entrance is the same interpolation with a synthetic previous frame at the
     baseline: a line grows out of the axis, and no separate entrance animation
     needs to exist. */
  const from = prevFrame || baselineFrom(target, baseline);
  const began = performance.now();
  const dur = Math.max(1, props.animationDuration);
  stopAnim();
  const tick = () => {
    const t = Math.min(1, (performance.now() - began) / dur);
    applyFrame(live.value, from, target, easeOutCubic(t), baseline);
    live.value = [...live.value];
    decimate();
    paint();
    if (t < 1) raf = requestAnimationFrame(tick);
    else { prevFrame = target; raf = null; }
  };
  raf = requestAnimationFrame(tick);
}

function clampBaseline(scale: Scale) {
  const [lo, hi] = scale.domain;
  return Math.min(hi, Math.max(lo, 0));
}

/* ─── geometry ───────────────────────────────────────────── */
/** The scale carrying categories, and the one carrying values. */
function catScale() { return horizontal.value ? scales.value!.left : scales.value!.x; }
function valScale(s: ResolvedSeries) {
  if (horizontal.value) return scales.value!.x;
  if (s.axis === 'right' && scales.value?.right) return scales.value.right;
  /* Every per-series y read goes through here, which is why panes needed one
     change rather than twenty. */
  const per = scales.value?.paneY;
  if (per && per.length > 1) return per[paneIndexOf(s)] || scales.value!.left;
  return scales.value!.left;
}
function yScaleFor(s: ResolvedSeries) { return valScale(s); }

function resolveSegmentStyle<T>(
  value: T | ((ctx: SegmentContext) => T | undefined) | undefined,
  ctx: SegmentContext,
  fallback: T,
): T {
  if (typeof value === 'function') {
    const out = (value as (c: SegmentContext) => T | undefined)(ctx);
    return out === undefined ? fallback : out;
  }
  return value === undefined ? fallback : value;
}

const labelSpec = computed<ChartDataLabelSpec>(() => (typeof merged.dataLabels.value === 'object'
  ? merged.dataLabels.value
  : { show: !!merged.dataLabels.value }));

const paths = computed(() => {
  if (!scales.value) return [];
  const { x } = scales.value;
  const plot = layoutState.value.plot;
  const dim = merged.hover.value?.dimOpacity ?? 1;
  const active = new Set(hit.value?.entries.map((e) => e.series.id) || []);

  /* Slots are allocated once for the whole chart, from the bar series only, so a
     line in a combo chart does not steal a share of the band. */
  const bars = live.value.filter((s) => (s.type === 'bar' || s.type === 'candlestick') && !s.hidden);
  /* Overlap keys by SERIES, group keys by STACK: the two modes are asking a
     different question of the band. */
  const overlap = props.barMode === 'overlap';
  const slots = bars.length
    ? barSlots(bars.map((s) => (overlap ? s.id : s.spec.stack)), catScale().step, {
      categoryGap: props.categoryGap ?? props.barPadding,
      barGap: props.barGap,
      barThickness: props.barThickness,
      maxBarThickness: props.maxBarThickness,
      mode: props.barMode,
      overlapRatio: props.overlapRatio,
    })
    : new Map();

  return live.value.map((s, i) => {
    const y = yScaleFor(s);
    const baseY = y.map(clampBaseline(y));
    const curve = (s.spec.curve || props.curve) as CurveType;
    const tension = s.spec.tension ?? props.tension;
    /* toSegments always takes (mapX, mapY) as screen mappers, so a horizontal
       chart swaps which scale each one consults rather than transposing paths
       afterwards. */
    /* mapX is always the CATEGORY mapper and mapY the VALUE mapper; the flag
       decides which screen axis each lands on. */
    const input = {
      points: s.drawn,
      mapX: (v: number) => catScale().map(v),
      mapY: (v: number) => valScale(s).map(v),
      curve,
      tension,
      connectNulls: props.connectNulls,
      horizontal: horizontal.value,
    };
    const fillOpacity = s.spec.fillOpacity ?? 0;
    /* Clamped to the series' OWN pane: a volume bar's baseline is its pane floor,
       not the bottom of the chart. */
    const own = paneRectOf(s);
    const flat = horizontal.value
      ? Math.max(plot.x, Math.min(baseY, plot.x + plot.width))
      : Math.min(baseY, own.y + own.height);

    /* A gradient needs two defs, not one: along a stroke it reads as progression
       through time, under a fill as fading toward the baseline, so the default
       directions differ and one def cannot serve both. */
    const grad = (s.color && typeof s.color === 'object') ? s.color as ChartGradient : null;
    const strokeId = grad ? `cht-${uid}-s${i}` : '';
    const fillId = grad ? `cht-${uid}-f${i}` : '';
    const flatColor = seriesColor(i, grad ? undefined : (s.color as string | undefined));
    const strokePaint = grad ? `url(#${strokeId})` : flatColor;
    const fillPaint = grad ? `url(#${fillId})` : flatColor;

    const width = s.spec.lineStrokeWidth ?? props.lineStrokeWidth;
    const dash = Array.isArray(s.spec.lineDash) ? s.spec.lineDash.join(' ') : s.spec.lineDash;

    /* Per-segment paths only when something actually varies by segment: one path
       per series is far cheaper, and most series do not need the split. */
    const styled = !!(s.spec.segmentColor || s.spec.segmentStrokeWidth
      || s.spec.segmentDash || s.spec.segmentFillColor);
    const pieces = styled ? segmentPieces(input, flat).map((piece) => {
      const ctx: SegmentContext = {
        p0: piece.p0, p1: piece.p1, index: piece.index, series: s.id,
      };
      return {
        key: `${s.id}-${piece.index}`,
        line: piece.line,
        area: piece.area,
        color: resolveSegmentStyle(s.spec.segmentColor, ctx, strokePaint),
        width: resolveSegmentStyle(s.spec.segmentStrokeWidth, ctx, width),
        dash: resolveSegmentStyle(s.spec.segmentDash, ctx, dash),
        fill: resolveSegmentStyle(s.spec.segmentFillColor, ctx, fillPaint),
      };
    }) : [];

    const shape = s.spec.markerShape || props.markerShape;
    const markerSize = s.spec.markerSize ?? props.markerSize;
    /* A series with no stroke is a fill, not a line: default markers there read
       as an unrelated scatter series sitting on the fill's edge. An explicit
       showMarkers still wins. */
    const showMarkers = s.spec.showMarkers
      ?? (width === 0 ? false : (props.showMarkers ?? s.drawn.length <= 40));
    const markers = (showMarkers && s.type === 'line')
      ? s.drawn.filter((p) => p.y !== null).map((p) => {
        const at = projectPoint(s, p);
        return { p, cx: at.px, cy: at.py };
      })
      : [];

    /* Labels are candidates, not placements: the chart culls collisions, so a
       dense series degrades to its readable points instead of a smear. */
    /* Bar geometry is computed BEFORE the labels that read it: the bar-label
       branch maps over barRects, and with the declaration below it that was a
       TDZ throw — const, same scope — for every bar series with labels on. No
       test drew a bar until the docs page did.
       Nothing here depends on the label pass, so moving it up is the whole fix. */
    const cat = catScale();
    const val = valScale(s);
    const slot = slots.get((overlap ? s.id : s.spec.stack) || '_');
    const barBase = val.map(clampBaseline(val));
    /* Per-bar paint: an array cycles by index, a callback answers per item, and
       undefined falls through to the series colour. */
    const palette = Array.isArray(s.color) ? (s.color as string[]) : null;
    const colorFn = typeof s.color === 'function'
      ? (s.color as (c: unknown) => string | undefined)
      : null;
    const floor = s.spec.minBarLength ?? props.minBarLength ?? 0;

    const barRects = (s.type === 'bar' && slot) ? s.drawn.filter((p) => p.y !== null).map((p) => {
      const centre = cat.map(p.x) + slot.offset;
      const from = p.y0 === null || p.y0 === undefined ? barBase : val.map(p.y0);
      const to = val.map(p.y as number);
      const negative = (p.y as number) < (p.y0 ?? 0);
      /* The floor grows AWAY from the baseline, so a tiny negative bar still hangs
         below zero rather than being nudged across it. */
      const raw = Math.abs(to - from);
      const size = floor ? Math.max(raw, floor) : raw;
      const end = from + (to >= from ? size : -size);
      const lo = Math.min(from, end);
      const rect = horizontal.value
        ? { x: lo, y: centre - slot.width / 2, width: size, height: slot.width }
        : { x: centre - slot.width / 2, y: lo, width: slot.width, height: size };

      const corners = resolveCorners(
        s.spec.barRadius ?? props.barRadius,
        horizontal.value,
        negative,
      );
      const skipped = s.spec.borderSkipped ?? props.borderSkipped;
      const outline = barOutline(rect.x, rect.y, rect.width, rect.height,
        corners, skipped, horizontal.value, negative);
      const custom = s.spec.renderBar
        ? s.spec.renderBar({ ...rect, point: p, series: s.id, index: p.index })
        : null;

      const own = palette
        ? palette[p.index % palette.length]
        : (colorFn
          ? colorFn({
            point: p,
            index: p.index,
            value: p.y as number,
            category: categorical.value ? (categories.value[p.x] ?? p.key) : p.key,
            negative,
            series: s.id,
          })
          : undefined);

      return {
        key: `${s.id}-${p.key}`,
        point: p,
        rect,
        d: custom || outline.fill,
        stroke: custom || outline.stroke,
        fill: own || fillPaint,
        negative,
      };
    }) : [];

    /* Candle geometry moves up for the same reason the bar geometry did: the
       candle-label branch maps over candleParts, and the declaration sat
       below it. Two families, one mistake, and neither could be hit until
       something drew them. Both are now covered by chart-families.spec. */
    const candleVariantResolved = (s.spec.candleVariant || 'candle') as 'candle' | 'hollow' | 'ohlc';
    const tones = s.type === 'candlestick' ? candleTones(s.points, candleVariantResolved) : null;
    const candleWidth = slot
      ? slot.width
      : Math.max(2, cat.step * (s.spec.barWidthRatio ?? props.barWidthRatio));
    const candles = s.type === 'candlestick'
      ? candleGeometry(
        s.drawn.filter((p) => p.ohlc).map((p): Candle => ({
          key: `${s.id}-${p.key}`,
          point: p,
          open: p.ohlc!.open,
          high: p.ohlc!.high,
          low: p.ohlc!.low,
          close: p.ohlc!.close,
          /* Direction, not the palette, colours a candle: the reader is looking
             for up or down, and a palette hue would say nothing. */
          up: p.ohlc!.close >= p.ohlc!.open,
        })),
        (v) => cat.map(v),
        (v) => val.map(v),
        Math.max(2, candleWidth),
      )
      : [];
    const candleParts = candles.map((c) => {
      const t = tones?.get(c.point.key);
      return { ...c, tone: t?.tone || (c.up ? 'up' : 'down'), filled: t?.filled ?? true };
    });

    let labels: LabelCandidate[] = [];
    if (labelSpec.value.show && s.type === 'candlestick') {
      /* A candle has FOUR values, so "the value" is meaningless — the field is
         stated rather than assumed, and close is the conventional default. */
      const field = (labelSpec.value.display || 'close') as 'open' | 'high' | 'low' | 'close';
      const nf = new Intl.NumberFormat(props.locale, { maximumFractionDigits: 2 });
      const offset = labelSpec.value.offset ?? 8;
      const font = '600 10.5px var(--font-sans, system-ui)';
      const pool = candleParts.map((c) => {
        const value = field === 'open' ? c.open : field === 'high' ? c.high
          : field === 'low' ? c.low : c.close;
        return {
          /* Clear of the HIGH WICK, not the body top: a long upper wick would
             otherwise run through the label. */
          x: c.wickX,
          y: c.wickY1 - offset,
          text: labelSpec.value.format ? labelSpec.value.format(value, c.point) : nf.format(value),
          priority: 1,
          width: c.bodyW,
        };
      }).filter((l) => {
        /* Hidden when the text is wider than its own candle. Two neighbours can
           fail to overlap and still be unreadable, so this is a width test per
           label rather than the collision pass. */
        if (labelSpec.value.collision === false) return true;
        return measureText(l.text, font) <= l.width + 2;
      });
      labels = labelSpec.value.collision === false ? pool : placeLabels(pool, font);
    } else if (labelSpec.value.show && s.type === 'bar') {
      const fmt = labelSpec.value.format
        || ((v: number) => new Intl.NumberFormat(props.locale, { maximumFractionDigits: 2 }).format(v));
      /* A stacked segment has nowhere outside itself to put a label, so stacking
         changes the default rather than the caller having to remember. */
      const stacked = props.stackMode !== 'none' && !!s.spec.stack;
      const placement = labelSpec.value.placement
        || (stacked ? 'inside-center' : 'outside-end');
      const offset = labelSpec.value.offset ?? 6;
      const pool = barRects.map((b) => {
        const at = barLabelAnchor(b.rect, placement, horizontal.value, b.negative, offset);
        return {
          x: at.x,
          y: at.y,
          text: fmt(b.point.y as number, b.point),
          priority: 1,
          anchor: at.anchor,
          baseline: at.baseline,
          inside: at.inside,
        };
      });
      labels = labelSpec.value.collision === false
        ? pool
        : placeLabels(pool, '600 10.5px var(--font-sans, system-ui)');
    } else if (labelSpec.value.show) {
      const pts = s.drawn.filter((p) => p.y !== null);
      const offset = labelSpec.value.offset ?? 12;
      const nf = new Intl.NumberFormat(props.locale, { maximumFractionDigits: 2 });
      const mode = labelSpec.value.display;
      /* A point's own category, not just its value — an airport code beside a dot
         is what makes a scatter readable without a tooltip. */
      const nameKey = labelSpec.value.labelKey;
      const naming = (p: ChartPoint) => {
        const row = p.raw as Record<string, unknown> | null;
        if (nameKey && row && row[nameKey] !== undefined) return String(row[nameKey]);
        return categorical.value ? String(categories.value[p.x] ?? p.key) : String(p.key);
      };
      const fmt = labelSpec.value.format
        || ((v: number, p: ChartPoint) => (mode === 'label' ? naming(p)
          : mode === 'label-percentage' ? `${naming(p)} ${nf.format(v)}`
            : nf.format(v)));
      const candidates = pts.map((p, pi) => {
        const prev = pts[pi - 1];
        const next = pts[pi + 1];
        const ends = pi === 0 || pi === pts.length - 1;
        const peak = prev && next
          && ((p.y! > prev.y! && p.y! > next.y!) || (p.y! < prev.y! && p.y! < next.y!));
        return {
          x: x.map(p.x),
          y: y.map(p.y as number) - offset,
          text: fmt(p.y as number, p),
          priority: ends ? 0 : (peak ? 1 : 2),
        };
      });
      const pool = labelSpec.value.sparse
        ? candidates.filter((c) => c.priority < 2)
        : candidates;
      labels = labelSpec.value.collision === false
        ? pool
        : placeLabels(pool, '600 10.5px var(--font-sans, system-ui)');
    }

    /* ── bars ── */

    /* ── candlesticks ── */
    /* barWidthRatio is the candle's own knob: a fraction of the band, so it stays
       proportional as the chart resizes. */
    const candleVariant = candleVariantResolved;
    const upColor = s.spec.upColor || 'var(--accent-success)';
    const downColor = s.spec.downColor || 'var(--accent-danger)';

    /* ── scatter and bubble ── */
    const rExtent = s.type === 'bubble'
      ? s.points.reduce<[number, number]>((acc, p) => {
        if (p.r === null || p.r === undefined) return acc;
        return [Math.min(acc[0], p.r), Math.max(acc[1], p.r)];
      }, [Infinity, -Infinity])
      : ([0, 0] as [number, number]);
    const pointFill = s.spec.renderMarker;
    const points = (s.type === 'scatter' || s.type === 'bubble')
      ? s.drawn.filter((p) => p.y !== null).map((p) => {
        const r = s.type === 'bubble'
          ? bubbleRadius(p.r, rExtent, s.spec.minSize ?? 4, s.spec.maxSize ?? 22)
          : (s.spec.markerSize ?? props.markerSize ?? 4);
        /* Scaled in place from zero radius: lifting a point from the baseline
           reads as the data moving rather than the chart arriving. */
        const shown = revealMode.value === 'scale' ? r * reveal.value : r;
        const own = palette
          ? palette[p.index % palette.length]
          : (colorFn
            ? colorFn({
              point: p,
              index: p.index,
              value: p.y as number,
              category: categorical.value ? (categories.value[p.x] ?? p.key) : p.key,
              series: s.id,
            })
            : undefined);
        const cx = horizontal.value ? val.map(p.y as number) : cat.map(p.x);
        const cy = horizontal.value ? cat.map(p.x) : val.map(p.y as number);
        return {
          key: `${s.id}-${p.key}-${p.index}`,
          cx,
          cy,
          r: shown,
          point: p,
          fill: own || fillPaint,
          /* The chart keeps the translation, so a custom marker draws at origin —
             the same division as renderBar: chart owns geometry, caller owns shape. */
          d: pointFill
            ? pointFill({ r: shown, point: p, index: p.index, series: s.id, color: own || flatColor })
            : '',
        };
      })
      : [];
    return {
      series: s,
      index: i,
      type: s.type,
      candles: candleParts,
      candleVariant,
      upColor,
      downColor,
      neutralColor: s.spec.neutralColor || props.neutralColor || 'var(--fg-subtle)',
      wickWidth: s.spec.wickStrokeWidth ?? props.wickStrokeWidth,
      barRects,
      barBorder: (s.spec.barBorderColor || props.barBorderColor) ? {
        color: s.spec.barBorderColor || props.barBorderColor,
        width: s.spec.barBorderWidth ?? props.barBorderWidth ?? 1,
        dash: Array.isArray(s.spec.barBorderDash || props.barBorderDash)
          ? (s.spec.barBorderDash || props.barBorderDash as number[]).join(' ')
          : (s.spec.barBorderDash || props.barBorderDash),
      } : null,
      barDepth: slot ? slot.depth : 0,
      points,
      pointBorder: {
        color: s.spec.pointBorderColor ?? props.pointBorderColor,
        width: s.spec.pointBorderStrokeWidth ?? props.pointBorderStrokeWidth,
      },
      strokePaint,
      fillPaint,
      flatColor,
      grad,
      strokeId,
      fillId,
      radial: !!grad && grad.type === 'radial',
      strokeCoords: grad ? gradientCoords(grad, false) : null,
      fillCoords: grad ? gradientCoords(grad, true) : null,
      line: (s.type === 'line' && !styled) ? linePath(input) : '',
      area: (s.type === 'line' && fillOpacity > 0 && !styled) ? areaPath(input, flat) : '',
      pieces,
      fillOpacity,
      width,
      dash,
      dashOffset: s.spec.lineDashOffset,
      cap: s.spec.lineCap || 'round',
      join: s.spec.lineJoin || 'round',
      /* The halo is painted first and wider, which is what keeps a line legible
         where it crosses a fill or another series. */
      border: s.spec.borderColor ? {
        color: s.spec.borderColor,
        width: (s.spec.borderStrokeWidth ?? width + 3),
        dash: Array.isArray(s.spec.borderDash) ? s.spec.borderDash.join(' ') : s.spec.borderDash,
        cap: s.spec.borderCap || 'round',
      } : null,
      markers,
      markerSize,
      markerShape: shape,
      markerGeometry: shape === 'circle' ? '' : markerPath(shape, markerSize),
      rotation: s.spec.pointRotation || 0,
      labels,
      opacity: (hit.value && dim < 1 && !active.has(s.id)) ? dim : 1,
    };
  });
});

function gradX(coord: number) {
  const plot = layoutState.value.plot;
  return plot.x + coord * plot.width;
}
function gradY(coord: number) {
  const plot = layoutState.value.plot;
  return plot.y + coord * plot.height;
}

/* ─── canvas layer ───────────────────────────────────────── */
function paint() {
  if (!useCanvas.value) return;
  const el = canvasEl.value;
  if (!el || !scales.value) return;
  const dpr = window.devicePixelRatio || 1;
  const { width, height } = size.value;
  if (el.width !== width * dpr || el.height !== height * dpr) {
    el.width = width * dpr;
    el.height = height * dpr;
  }
  const ctx = el.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const clipRegion = clipping.value ? clipRect.value
    : (clipToPlot.value ? layoutState.value.plot : null);
  if (clipRegion) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(clipRegion.x, clipRegion.y, clipRegion.width, clipRegion.height);
    ctx.clip();
  }
  const cs = getComputedStyle(el);
  /* Canvas has no cascade, so a token has to be resolved to a literal here.
     Anything unresolvable falls back rather than painting nothing. */
  const resolve = (paintValue?: string) => {
    if (!paintValue) return '#888';
    if (!paintValue.startsWith('var(')) return paintValue;
    const name = paintValue.slice(4, paintValue.indexOf(')')).trim();
    return cs.getPropertyValue(name).trim() || '#888';
  };
  paths.value.forEach((entry) => {
    if (entry.series.hidden || !entry.line) return;
    /* The same geometry the SVG layer uses, replayed through Path2D — one source
       of truth for the shape, two ways of putting it on screen. */
    if (entry.area) {
      ctx.globalAlpha = entry.fillOpacity;
      ctx.fillStyle = resolve(entry.fillPaint);
      ctx.fill(new Path2D(entry.area));
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = resolve(entry.strokePaint);
    ctx.lineWidth = entry.width;
    ctx.lineJoin = entry.join || 'round';
    ctx.lineCap = entry.cap || 'round';
    ctx.setLineDash(entry.dash ? String(entry.dash).split(/[\s,]+/).map(Number) : []);
    ctx.stroke(new Path2D(entry.line));
  });
  if (clipRegion) ctx.restore();
}

/* ─── interaction ────────────────────────────────────────── */
function pointerToPlot(e: PointerEvent | MouseEvent) {
  const box = plotBox.value?.getBoundingClientRect();
  if (!box) return null;
  return { x: e.clientX - box.left, y: e.clientY - box.top };
}

function onMove(e: PointerEvent) {
  if (merged.tooltip.value?.show === false) return;
  if (radial.value || hasHeatmap.value || hasTreemap.value) {
    const p = pointerToPlot(e);
    if (p) pointer.value = p;
    return;
  /*
   * Named plotPoint, not pointer, because a `const pointer` here shadowed the
   * module-scope `pointer` ref for the WHOLE function — including the radial /
   * heatmap / treemap branch above, which assigns to the ref and runs before
   * this line. Reading it there was a TDZ throw, so hovering a pie, gauge,
   * radar, polar, heatmap or treemap crashed.
   *
   * The original had no such collision: under the Options API the ref is
   * `this.pointer` and the local is `pointer`. Dropping `this.` in the
   * conversion to <script setup> silently merged the two names.
   */
  }
  const plotPoint = pointerToPlot(e);
  if (!plotPoint || !scales.value) return;
  const plot = layoutState.value.plot;
  if (plotPoint.x < plot.x - 4 || plotPoint.x > plot.x + plot.width + 4) { clearHit(); return; }
  const result = findHit({
    pointer: plotPoint,
    series: live.value,
    project: projectPoint,
    mode: merged.tooltip.value?.mode || (pointsOnly.value ? 'nearest' : 'shared-x'),
    /* Horizontal snaps on the other axis: "same x" means "same category", and
       the category runs vertically once the chart is turned. */
    /* Bars snap to the BAND the plotPoint is inside; a line snaps along the category
       axis, which flips when the chart is turned. At a band edge the nearest
       centre belongs to the neighbour, which is the bug this replaces. */
    /* A point chart snaps in 2D: picking by horizontal distance alone makes two
       points at the same x and far apart in y indistinguishable. */
    snap: merged.tooltip.value?.snap
      || (pointsOnly.value ? 'xy' as HitSnap
        : hasBars.value ? 'band' as HitSnap
          : (horizontal.value ? 'y' as HitSnap : 'x')),
    bandIndex: hasBars.value && scales.value
      ? Math.round(catScale().invert(horizontal.value ? plotPoint.y : plotPoint.x))
      : undefined,
    radius: props.pointHitRadius,
  });
  hit.value = result;
  group?.setHover(result?.entries[0]?.point.key ?? null);
  emit('hover-change', result);
}
function clearHit() {
  if (!hit.value) return;
  hit.value = null;
  group?.setHover(null);
  emit('hover-change', null);
}

/* A synced chart follows the group's key rather than its own pointer, so every
   chart in the group reads the same moment. */
watch(() => group?.state.hoverKey, (key) => {
  if (!group || !scales.value) return;
  if (key === null || key === undefined) { hit.value = null; return; }
  const first = live.value.find((s) => !s.hidden);
  const point = first?.points.find((p) => p.key === key);
  if (!point) { hit.value = null; return; }
  hit.value = findHit({
    pointer: { x: scales.value.x.map(point.x), y: 0 },
    series: live.value,
    project: projectPoint,
    mode: merged.tooltip.value?.mode || (pointsOnly.value ? 'nearest' : 'shared-x'),
    snap: 'x',
    radius: Infinity,
  });
});
watch(() => group?.state.zoom, () => { buildScales(); decimate(); paint(); });
watch(() => group?.state.hidden.length, () => {
  if (group) { hidden.value = new Set(group.state.hidden); commit(false); }
});

/* ─── zoom interaction ───────────────────────────────────── */
const brush = ref<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
let panFrom: { px: number; py: number; win: ZoomWindow } | null = null;
let pinch: { dist: number; win: ZoomWindow } | null = null;

/** The window in force, filled out to whichever axes the drag mode zooms. */
function currentWindow(): ZoomWindow {
  const win = zoomWindow.value;
  const out: ZoomWindow = { x: win?.x || xBounds.value };
  if (dragMode.value !== 'x') out.y = win?.y || yBounds.value;
  else if (win?.y) out.y = win.y;
  return out;
}

function onWheel(e: WheelEvent) {
  if (!zoomSpec.value.wheel || !scales.value) return;
  e.preventDefault();
  const pointer = pointerToPlot(e);
  if (!pointer) return;
  /* Zooming about the cursor rather than the centre: the value under the pointer
     is the one you are interested in, so it is the one that should stay put — on
     both axes when both are zoomable. */
  const center = {
    x: scales.value.x.invert(pointer.x),
    y: scales.value.left.invert(pointer.y),
  };
  setZoom(zoomWindowAbout(currentWindow(), center, e.deltaY > 0 ? 1.25 : 0.8,
    xBounds.value, yBounds.value));
}

function onDown(e: PointerEvent) {
  if (!scales.value || e.button !== 0) return;
  const pointer = pointerToPlot(e);
  if (!pointer) return;
  const plot = layoutState.value.plot;
  if (pointer.x < plot.x || pointer.x > plot.x + plot.width) return;

  if (e.shiftKey && zoomSpec.value.pan) {
    panFrom = { px: pointer.x, py: pointer.y, win: currentWindow() };
  } else if (zoomSpec.value.drag) {
    brush.value = { x0: pointer.x, y0: pointer.y, x1: pointer.x, y1: pointer.y };
  } else return;
  (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  window.addEventListener('pointermove', onDrag);
  window.addEventListener('pointerup', onUp);
}

function onDrag(e: PointerEvent) {
  const pointer = pointerToPlot(e);
  if (!pointer || !scales.value) return;
  if (panFrom) {
    const delta = {
      x: scales.value.x.invert(panFrom.px) - scales.value.x.invert(pointer.x),
      y: scales.value.left.invert(panFrom.py) - scales.value.left.invert(pointer.y),
    };
    setZoom(panWindow(panFrom.win, delta, xBounds.value, yBounds.value));
    return;
  }
  if (brush.value) brush.value = { ...brush.value, x1: pointer.x, y1: pointer.y };
}

function onUp() {
  window.removeEventListener('pointermove', onDrag);
  window.removeEventListener('pointerup', onUp);
  panFrom = null;
  const b = brush.value;
  brush.value = null;
  if (!b || !scales.value) return;
  const mode = dragMode.value;
  const dx = Math.abs(b.x1 - b.x0);
  const dy = Math.abs(b.y1 - b.y0);
  /* A stray click is not a zoom to nothing: below a few pixels in the axis the
     mode actually selects, the drag was a click, and zooming to it would leave a
     chart nobody can get out of. */
  const moved = mode === 'y' ? dy : mode === 'x' ? dx : Math.max(dx, dy);
  if (moved < 6) return;
  const next: ZoomWindow = { x: currentWindow().x };
  if (mode !== 'y') {
    next.x = [
      scales.value.x.invert(Math.min(b.x0, b.x1)),
      scales.value.x.invert(Math.max(b.x0, b.x1)),
    ];
  }
  if (mode !== 'x') {
    /* The y scale's range runs top-down, so the LOWER pixel is the HIGHER value. */
    next.y = [
      scales.value.left.invert(Math.max(b.y0, b.y1)),
      scales.value.left.invert(Math.min(b.y0, b.y1)),
    ];
  }
  setZoom(next);
}

function onTouchStart(e: TouchEvent) {
  if (!zoomSpec.value.touch || e.touches.length !== 2) return;
  pinch = {
    dist: Math.abs(e.touches[0].clientX - e.touches[1].clientX),
    win: currentWindow(),
  };
}
function onTouchMove(e: TouchEvent) {
  if (!pinch || e.touches.length !== 2 || !scales.value) return;
  e.preventDefault();
  const dist = Math.abs(e.touches[0].clientX - e.touches[1].clientX) || 1;
  const mid = (e.touches[0].clientX + e.touches[1].clientX) / 2;
  const box = plotBox.value?.getBoundingClientRect();
  const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
  const center = box
    ? { x: scales.value.x.invert(mid - box.left), y: scales.value.left.invert(midY - box.top) }
    : { x: (pinch.win.x[0] + pinch.win.x[1]) / 2, y: 0 };
  setZoom(zoomWindowAbout(pinch.win, center, pinch.dist / dist, xBounds.value, yBounds.value));
}
function onTouchEnd() { pinch = null; }

const brushRect = computed(() => {
  const b = brush.value;
  if (!b) return null;
  const plot = layoutState.value.plot;
  const mode = dragMode.value;
  const x0 = Math.max(plot.x, Math.min(b.x0, b.x1));
  const x1 = Math.min(plot.x + plot.width, Math.max(b.x0, b.x1));
  const y0 = Math.max(plot.y, Math.min(b.y0, b.y1));
  const y1 = Math.min(plot.y + plot.height, Math.max(b.y0, b.y1));
  /* The band spans the full plot on any axis the mode does not select, so the
     marquee shows exactly what will be kept. */
  return {
    x: mode === 'y' ? plot.x : x0,
    width: mode === 'y' ? plot.width : Math.max(0, x1 - x0),
    y: mode === 'x' ? plot.y : y0,
    height: mode === 'x' ? plot.height : Math.max(0, y1 - y0),
  };
});

function onClick(e: MouseEvent) {
  const entry = hit.value?.entries[0];
  if (!entry) return;
  emit('point-click', { series: entry.series.id, point: entry.point, originalEvent: e });
}

function toggleSeries(s: ResolvedSeries) {
  if (merged.legend.value?.interactive === false) return;
  if (group) { group.toggleSeries(s.id); return; }
  const next = new Set(hidden.value);
  if (next.has(s.id)) next.delete(s.id);
  else next.add(s.id);
  hidden.value = next;
  emit('legend-toggle', { series: s.id, hidden: next.has(s.id) });
  commit(false);
}

/* Keyboard point navigation: a chart nobody can read without a mouse is not
   finished, and retrofitting this into a chart is miserable. */
function onKey(e: KeyboardEvent) {
  const first = live.value.find((s) => !s.hidden);
  if (!first || !scales.value) return;
  const last = first.points.length - 1;
  let next = focusIndex.value;
  if (e.key === 'ArrowRight') next = Math.min(last, focusIndex.value + 1);
  else if (e.key === 'ArrowLeft') next = Math.max(0, focusIndex.value - 1);
  else if (e.key === 'Home') next = 0;
  else if (e.key === 'End') next = last;
  else if (e.key === 'Escape') { focusIndex.value = -1; clearHit(); return; }
  else return;
  e.preventDefault();
  focusIndex.value = next;
  const point = first.points[next];
  if (!point) return;
  const result = findHit({
    pointer: { x: scales.value.x.map(point.x), y: yScaleFor(first).map(point.y ?? 0) },
    series: live.value,
    project: projectPoint,
    mode: merged.tooltip.value?.mode || (pointsOnly.value ? 'nearest' : 'shared-x'),
    snap: 'x',
    radius: Infinity,
  });
  hit.value = result;
  emit('hover-change', result);
}

/* ─── tooltip placement ──────────────────────────────────── */
/** Where the crosshair sits on the category axis, whichever way it points. */
const crossPos = computed(() => (hit.value?.entries[0] ? hit.value.entries[0].py : 0));

const tooltipStyle = computed(() => {
  if (!hit.value) return undefined;
  /* A radial tooltip follows the pointer: there is no x position to anchor to,
     and a slice's centroid can sit under the pointer's own hand. */
  if (radial.value || hasHeatmap.value) {
    return {
      insetInlineStart: `${pointer.value.x}px`,
      insetBlockStart: `${pointer.value.y}px`,
      transform: 'translate(12px, -50%)',
    };
  }
  const plot = layoutState.value.plot;
  const flip = hit.value.x > plot.x + plot.width * 0.6;
  const y = hit.value.entries.reduce((m, e) => Math.min(m, e.py), Infinity);
  return {
    insetInlineStart: `${hit.value.x}px`,
    insetBlockStart: `${Number.isFinite(y) ? y : plot.y}px`,
    transform: `translate(${flip ? '-100%' : '0'}, -50%) translateX(${flip ? -12 : 12}px)`,
  };
});

/* A candle needs four numbers, not one, so the tooltip lists them rather than
   reporting the close and hiding the rest. */
const ohlcRows = computed(() => {
  const e = hit.value?.entries.find((x) => x.point.ohlc);
  if (!e || !e.point.ohlc) return null;
  const fmt = new Intl.NumberFormat(props.locale, { maximumFractionDigits: 2 });
  const o = e.point.ohlc;
  return {
    name: e.series.name,
    up: o.close >= o.open,
    rows: [
      { label: 'Open', value: fmt.format(o.open) },
      { label: 'High', value: fmt.format(o.high) },
      { label: 'Low', value: fmt.format(o.low) },
      { label: 'Close', value: fmt.format(o.close) },
    ],
  };
});

const tooltipRows = computed(() => (hit.value?.entries || []).map((e, i) => ({
  name: e.series.name,
  color: seriesColor(live.value.indexOf(e.series), e.series.color),
  value: merged.tooltip.value?.format
    ? merged.tooltip.value.format(e.point.y as number, e.series.name)
    : formatValue(e.point.y as number),
  key: `${e.series.id}-${i}`,
  /* The OHLC block already reports this series' four numbers, so its single-value
     row would be a duplicate — but every OTHER series still needs its row, which
     is what replacing the whole list destroyed. */
  isOhlc: !!e.point.ohlc,
})));

/** Rows the OHLC block does not already cover. */
const otherRows = computed(() => tooltipRows.value.filter((r) => r.isOhlc !== true));

function formatValue(v: number) {
  return new Intl.NumberFormat(props.locale, { maximumFractionDigits: 2 }).format(v);
}
const tooltipTitle = computed(() => {
  if (radial.value || hasHeatmap.value) return radialLabel.value;
  const p = hit.value?.entries[0]?.point;
  if (!p || !scales.value) return '';
  if (categorical.value) return categories.value[p.x] ?? String(p.key);
  const tick = scales.value.x.ticks[0];
  return tick ? new Intl.DateTimeFormat(props.locale, merged.xAxis.value?.type === 'time'
    ? { month: 'short', day: 'numeric', year: 'numeric' }
    : {}).format(new Date(p.x)) : String(p.key);
});

/* ─── heatmap ────────────────────────────────────────────── */
/* ─── treemap ────────────────────────────────────────────── */
const drillPath = ref<TreeNode[]>([]);

/**
 * The breadcrumb, from the drill path alone.
 *
 * The tiles moved to ApexChartTreemap; this did not. It renders outside the
 * svg, above the caption, and a child cannot render into two places \u2014 so the
 * path stays here, where both the nav and the renderer can read it.
 */
const crumbs = computed(() =>
  drillPath.value.map((n, i2) => ({ key: `${n.name}-${i2}`, name: n.name ?? '', index: i2 })));

/** The unfiltered series, for the renderer that has to find its own spec. */
const allSeries = computed(() => merged.series.value);

function drillInto(tile: TreeTile) {
  if (!tile.drillable) return;
  drillPath.value = [...drillPath.value, tile.node];
}
function drillTo(index: number) {
  drillPath.value = drillPath.value.slice(0, index + 1);
}
function drillOut() { drillPath.value = drillPath.value.slice(0, -1); }

/* ─── radial layout ──────────────────────────────────────── */
const radialFrame = computed<RadialFrame>(() => {
  const w = size.value.width;
  const h = size.value.height;
  const start = props.startAngle;
  const end = props.endAngle ?? TAU;
  const gauge = radialKind.value === 'gauge';
  /* A gauge that sweeps less than a full turn is wider than it is tall, so it is
     centred on the arc it actually occupies rather than on the box. */
  const pad = 18;
  const r = gauge
    ? Math.min((w - pad * 2) / 2, (h - pad) * (Math.abs(end - start) < Math.PI * 1.2 ? 1 : 0.5))
    : Math.min(w - pad * 2, h - pad * 2) / 2;
  /* An explicit reservation hook: the hover pop-out will need room outside the
     ring too, and hard-coding the fit here would make that a second change. */
  const reserve = 1;
  return {
    cx: w / 2,
    cy: gauge && Math.abs(end - start) < Math.PI * 1.2 ? h - pad - 8 : h / 2,
    r: Math.max(10, r * Math.max(0.2, Math.min(1, props.outerRadius)) * reserve),
    r0: Math.max(0, r * Math.min(0.95, props.innerRadius)),
    start,
    end,
  };
});

interface RadialSlice extends PieSlice {
  key: string;
  d: string;
  color: string;
  label: string;
  seriesId: string;
  point: ChartPoint;
}

/** Concentric rings when several pie series are given: rings, not overlays. */
const pieRings = computed(() => {
  if (radialKind.value !== 'pie') return [];
  const frame = radialFrame.value;
  const list = live.value.filter((s) => s.type === 'pie' && !s.hidden);
  const band = list.length ? (frame.r - frame.r0) / list.length : 0;
  return list.map((s, ri) => {
    const r1 = frame.r - band * ri;
    const r0 = Math.max(frame.r0, r1 - band * 0.86);
    const ringStart = s.spec.startAngle ?? frame.start;
    const ringEnd = s.spec.endAngle ?? frame.end;
    const slices = pieLayout(s.drawn.map((p) => p.y), ringStart, ringEnd,
      s.spec.padAngle ?? props.padAngle);
    return {
      seriesId: s.id,
      r0,
      r1,
      slices: slices.map((sl): RadialSlice | null => {
        const point = s.drawn[sl.index];
        const wedge = clampWedge(sl.a0, sl.a1, ringStart, ringEnd);
        if (!wedge) return null;
        return {
          ...sl,
          key: `${s.id}-${point.key}`,
          seriesId: s.id,
          point,
          d: arcPath(frame.cx, frame.cy, r0, r1, wedge[0], wedge[1]),
          /* Slices are coloured from the palette by POSITION IN THE SERIES, not
             by series index: a pie's parts are the thing being compared. */
          color: seriesColor(sl.index, s.color as string | undefined),
          label: categorical.value ? (categories.value[point.x] ?? String(point.key)) : String(point.key),
        };
      }).filter(Boolean) as RadialSlice[],
    };
  });
});

const gaugeView = computed(() => {
  if (radialKind.value !== 'gauge') return null;
  const s = live.value.find((q) => q.type === 'gauge' && !q.hidden);
  if (!s) return null;
  const value = s.drawn.find((p) => p.y !== null)?.y ?? 0;
  const frame = {
    ...radialFrame.value,
    start: s.spec.startAngle ?? radialFrame.value.start,
    end: s.spec.endAngle ?? radialFrame.value.end,
    r0: radialFrame.value.r0 || radialFrame.value.r * 0.72,
  };
  const g = gaugeGeometry(frame, value, s.spec.min ?? 0, s.spec.max ?? 100);
  /* The dial FILLS from its start angle rather than the arc appearing at full
     length and shrinking, which is what a baseline grow would do to a gauge. */
  const filled = (frame.end - frame.start) * g.fraction * sweep.value;
  return {
    ...g,
    value: ccw.value
      ? arcPath(frame.cx, frame.cy, frame.r0, frame.r, frame.end - filled, frame.end)
      : arcPath(frame.cx, frame.cy, frame.r0, frame.r, frame.start, frame.start + filled),
    color: seriesColor(live.value.indexOf(s), s.color as string | undefined),
  };
});

const radarView = computed(() => {
  if (radialKind.value !== 'radar' && radialKind.value !== 'polar') return null;
  const frame = radialFrame.value;
  const list = live.value.filter((s) => (s.type === 'radar' || s.type === 'polar') && !s.hidden);
  if (!list.length) return null;
  const spokes = spokeAngles(categories.value.length || 1, frame.start);
  /* From the target frame, so the scale is fixed while the values travel toward
     it — normalising against the live points would cancel the tween. */
  const max = list.reduce((m, s) => {
    const targets = targetFrame.value?.values.get(s.id);
    if (!targets) return s.points.reduce((n, p) => Math.max(n, p.y ?? 0), m);
    let hi = m;
    targets.forEach((pair) => { if ((pair.y ?? 0) > hi) hi = pair.y as number; });
    return hi;
  }, 0) || 1;
  const scale = (v: number) => frame.r0 + (frame.r - frame.r0) * (v / max);

  const rings = Array.from({ length: props.radarRings }, (_, i) => {
    const t = (i + 1) / props.radarRings;
    /* Polygon rings, not circles: a value is read along a spoke, and a circular
       ring crosses the spokes between them where there is nothing to read. */
    return {
      key: `ring-${i}`,
      d: radarPath(frame.cx, frame.cy, spokes.map(() => frame.r0 + (frame.r - frame.r0) * t), spokes),
      label: new Intl.NumberFormat(props.locale, { maximumFractionDigits: 1 }).format(max * t),
      y: frame.cy - (frame.r0 + (frame.r - frame.r0) * t),
    };
  });

  return {
    frame,
    spokes: spokes.map((a, i) => {
      const outer = polar(frame.cx, frame.cy, frame.r, a);
      const label = polar(frame.cx, frame.cy, frame.r + 15, a);
      return {
        key: `spoke-${i}`,
        x2: outer.x, y2: outer.y,
        lx: label.x, ly: label.y,
        anchor: Math.abs(Math.sin(a)) < 0.2 ? 'middle' : (Math.sin(a) > 0 ? 'start' : 'end'),
        text: categories.value[i] ?? '',
      };
    }),
    rings,
    shapes: list.map((s) => {
      const byIndex = categories.value.map((_, ci) => {
        const p = s.points.find((q) => q.x === ci);
        return p && p.y !== null ? scale(p.y) : null;
      });
      const color = seriesColor(live.value.indexOf(s), s.color as string | undefined);
      if (s.type === 'polar') {
        /* A rose sector spans its own share of the circle, so the angular width
           carries no meaning and only the radius does. */
        const step = TAU / Math.max(1, categories.value.length);
        return {
          id: s.id, color,
          polygon: '',
          sectors: byIndex.map((r, ci) => {
            const a0 = spokes[ci] - step / 2 + props.padAngle / 2;
            const a1 = spokes[ci] + step / 2 - props.padAngle / 2;
            const wedge = clampWedge(a0, a1, frame.start, frame.start + TAU);
            return {
            key: `${s.id}-${ci}`,
            d: (r === null || !wedge) ? '' : arcPath(frame.cx, frame.cy, frame.r0, r, wedge[0], wedge[1]),
            point: s.points.find((q) => q.x === ci) || null,
            label: categories.value[ci] ?? '',
            };
          }).filter((x) => x.d),
          fillOpacity: s.spec.fillOpacity ?? 0.75,
          points: [],
        };
      }
      return {
        id: s.id, color,
        polygon: radarPath(frame.cx, frame.cy, byIndex, spokes),
        sectors: [],
        fillOpacity: s.spec.fillOpacity ?? 0.18,
        points: byIndex.map((r, ci) => {
          if (r === null) return null;
          const p = polar(frame.cx, frame.cy, r, spokes[ci]);
          return { key: `${s.id}-d-${ci}`, cx: p.x, cy: p.y };
        }).filter(Boolean) as { key: string; cx: number; cy: number }[],
      };
    }),
  };
});

/**
 * External labels for the outermost pie ring.
 *
 * Derived from the same clamped slice list as the arcs, so a slice the sweep has
 * not reached has no label by construction — a label beside an absent slice is
 * worse than no label, and this needs no extra timing code.
 */
const pieLabels = computed(() => {
  const spec = labelSpec.value;
  if (!spec.show || spec.position !== 'outside') return [];
  const ring = pieRings.value[0];
  if (!ring || !ring.slices.length) return [];
  const frame = radialFrame.value;
  const plot = layoutState.value.plot;
  const min = spec.minPercentage ?? 0;
  const nf = new Intl.NumberFormat(props.locale, { maximumFractionDigits: 2 });
  const pf = new Intl.NumberFormat(props.locale, { style: 'percent', maximumFractionDigits: 0 });

  const items = ring.slices
    /* A slice too small to sit near its own label is dropped outright: displacing
       it would put the text a long way from the wedge it describes. */
    .filter((sl) => sl.fraction * 100 >= min)
    .map((sl) => {
      const mode = spec.display || 'percentage';
      const value = nf.format(sl.value);
      const pct = pf.format(sl.fraction);
      const text = spec.format
        ? spec.format(sl.value, sl.point)
        : mode === 'value' ? value
          : mode === 'label' ? sl.label
            : mode === 'both' ? `${sl.label} ${pct}`
              : pct;
      return { key: sl.key, mid: sl.mid, text };
    });

  return leaderLabels(items, {
    cx: frame.cx,
    cy: frame.cy,
    r: ring.r1,
    straight: spec.lineStyle === 'straight',
    bounds: { top: plot.y + 6, bottom: plot.y + plot.height - 6 },
  });
});

/** Radial hover is per shape: each arc is a real element, so hover is native. */
function radialHover(seriesId: string, point: ChartPoint | null, label: string) {
  if (!point) { hit.value = null; return; }
  const s = live.value.find((q) => q.id === seriesId);
  if (!s) return;
  hit.value = {
    x: 0,
    entries: [{ series: s, point, px: 0, py: 0 }],
  };
  radialLabel.value = label;
}
const radialLabel = ref('');

/**
 * A cell is a real element, so its hover needs no grid maths.
 *
 * AF2-236c: the grid moved to ApexChartHeat, this did not. Turning a cell into
 * a tooltip entry needs `live` and `hit`, which are the chart's, so the
 * renderer emits the cell and the chart decides what a hover means.
 */
function heatHover(cell: { cellLabel: string; value: number | null }) {
  const s = live.value[0];
  if (!s || cell.value === null) return;
  hit.value = {
    x: 0,
    entries: [{ series: { ...s, name: s.name }, point: { key: cell.cellLabel, x: 0, y: cell.value, raw: null, index: 0 }, px: 0, py: 0 }],
  };
  radialLabel.value = cell.cellLabel;
}

/* ─── references ─────────────────────────────────────────── */
function toScaleValue(v: number | string | Date, axis: 'x' | 'y'): number {
  if (v instanceof Date) return v.getTime();
  if (typeof v === 'number') return v;
  /* A category is named, not numbered: a reference line on "Mar" should follow
     Mar wherever it sits, rather than being pinned to an index. */
  if (axis === 'x' && categorical.value) {
    const i = categories.value.indexOf(v);
    if (i > -1) return i;
  }
  const t = Date.parse(v);
  return Number.isNaN(t) ? Number(v) : t;
}

const refLines = computed(() => {
  if (!scales.value) return [];
  const plot = layoutState.value.plot;
  return (merged.referenceLines.value || []).map((r, i) => {
    const axis = r.axis || 'y';
    const value = toScaleValue(r.value, axis);
    const scale = axis === 'x' ? scales.value!.x : scales.value!.left;
    const pos = scale.map(value);
    return {
      key: `rl-${i}`,
      axis,
      x1: axis === 'x' ? pos : plot.x,
      x2: axis === 'x' ? pos : plot.x + plot.width,
      y1: axis === 'x' ? plot.y : pos,
      y2: axis === 'x' ? plot.y + plot.height : pos,
      color: r.color || 'var(--accent-warning)',
      dash: r.dash || '5 4',
      width: r.width ?? 1.5,
      label: r.label,
      /* 'end' keeps the label out of rising data; 'start' reads as a named
         threshold you scan down to. Neither is universally right, so it is a
         choice rather than a default we hide. */
      ...(() => {
        const side = r.labelPosition || props.referenceLabelPosition;
        if (axis === 'x') {
          return {
            lx: pos + (side === 'start' ? -5 : 5),
            ly: side === 'start' ? plot.y + plot.height - 6 : plot.y + 11,
            anchor: side === 'start' ? 'end' : 'start',
          };
        }
        return {
          lx: side === 'start' ? plot.x + 4 : plot.x + plot.width - 4,
          ly: pos - 6,
          anchor: side === 'start' ? 'start' : 'end',
        };
      })(),
    };
  });
});

const refBands = computed(() => {
  if (!scales.value) return [];
  const plot = layoutState.value.plot;
  return (merged.referenceBands.value || []).map((b, i) => {
    const axis = b.axis || 'y';
    const scale = axis === 'x' ? scales.value!.x : scales.value!.left;
    const a = scale.map(toScaleValue(b.from, axis));
    const c = scale.map(toScaleValue(b.to, axis));
    const lo = Math.min(a, c);
    const hi = Math.max(a, c);
    return {
      key: `rb-${i}`,
      x: axis === 'x' ? lo : plot.x,
      width: axis === 'x' ? hi - lo : plot.width,
      y: axis === 'x' ? plot.y : lo,
      height: axis === 'x' ? plot.height : hi - lo,
      color: b.color || 'var(--accent-success)',
      opacity: b.opacity ?? 0.09,
      label: b.label,
      lx: plot.x + 6,
      ly: axis === 'x' ? plot.y + 12 : lo + 12,
    };
  });
});

/* ─── navigator ──────────────────────────────────────────── */
const navSpec = computed<ChartNavigatorSpec>(() => (typeof merged.navigator.value === 'object'
  ? merged.navigator.value
  : {}));
const navHeight = computed(() => (merged.navigator.value ? (navSpec.value.height ?? 54) : 0));

const navigator = computed(() => {
  if (!merged.navigator.value || !live.value.length) return null;
  const bounds = xBounds.value;
  const width = size.value.width;
  const plot = layoutState.value.plot;
  const inner = { x: plot.x, width: plot.width, y: 4, height: navHeight.value - 12 };
  const s = navSpec.value.series
    ? live.value.find((q) => q.id === navSpec.value.series)
    : live.value.find((q) => !q.hidden);
  if (!s) return null;

  /* The overview is always the full extent — that is its whole job — so it gets
     its own scales rather than the zoomed ones. */
  const nx = createScale({
    spec: { type: merged.xAxis.value?.type, nice: false, min: bounds[0], max: bounds[1] },
    range: [inner.x, inner.x + inner.width],
    extent: bounds,
    categories: categorical.value ? categories.value : undefined,
  });
  const e = extentOf([s]);
  const ny = createScale({
    spec: { nice: false, includeZero: true },
    range: [inner.y + inner.height, inner.y],
    extent: Number.isFinite(e[0]) ? e : [0, 1],
    includeZero: true,
  });
  const pool = s.points.length > 900 ? lttb(s.points, 900) : s.points;
  const input = {
    points: pool,
    mapX: (v: number) => nx.map(v),
    mapY: (v: number) => ny.map(v),
    curve: (navSpec.value.curve || 'linear') as CurveType,
    connectNulls: props.connectNulls,
  };
  /* A point series gets mini points and a rect handle: a horizontal strip can only
     express one axis, so under a 2D zoom it would misreport the view. */
  const navPoints = (s.type === 'scatter' || s.type === 'bubble')
    ? pool.filter((p) => p.y !== null).map((p) => ({
      key: String(p.key) + '-' + p.index,
      cx: nx.map(p.x),
      cy: ny.map(p.y as number),
    }))
    : [];

  /* A bar series gets mini bars: an area overview under a bar chart misrepresents
     what you are panning across. */
  const base = ny.map(0);
  const bw = Math.max(1, (inner.width / Math.max(1, pool.length)) * 0.7);
  const navBars = s.type === 'bar'
    ? pool.filter((p) => p.y !== null).map((p) => {
      const top = ny.map(p.y as number);
      return {
        key: String(p.key),
        x: nx.map(p.x) - bw / 2,
        y: Math.min(top, base),
        width: bw,
        height: Math.max(1, Math.abs(base - top)),
      };
    })
    : [];
  const win = zoomRange.value || bounds;
  const wy = zoomY.value;
  return {
    navBars,
    navPoints,
    /* The y edges of the handle, present only when y is actually windowed. */
    y0: wy ? ny.map(wy[1]) : inner.y,
    y1: wy ? ny.map(wy[0]) : inner.y + inner.height,
    twoAxis: navPoints.length > 0,
    yScale: ny,
    inner,
    width,
    scale: nx,
    area: areaPath(input, inner.y + inner.height),
    line: linePath(input),
    color: seriesColor(live.value.indexOf(s), undefined),
    x0: nx.map(win[0]),
    x1: nx.map(win[1]),
  };
});

let navDrag: {
  mode: 'move' | 'start' | 'end';
  px: number;
  py: number;
  win: ZoomWindow;
} | null = null;
function onNavDown(e: PointerEvent, mode: 'move' | 'start' | 'end') {
  if (!navigator.value) return;
  e.stopPropagation();
  navDrag = {
    mode,
    px: e.clientX,
    py: e.clientY,
    win: {
      x: zoomRange.value || xBounds.value,
      ...(navigator.value.twoAxis ? { y: zoomY.value || yBounds.value } : {}),
    },
  };
  window.addEventListener('pointermove', onNavDrag);
  window.addEventListener('pointerup', onNavUp);
}
function onNavDrag(e: PointerEvent) {
  const nav = navigator.value;
  if (!navDrag || !nav) return;
  const box = navBox.value?.getBoundingClientRect();
  if (!box) return;
  const value = nav.scale.invert(e.clientX - box.left);
  if (navDrag.mode === 'move') {
    const from = nav.scale.invert(navDrag.px - box.left);
    /* A 2D handle pans both axes together, which is the whole reason it is a rect
       rather than a strip. */
    const dy = nav.twoAxis
      ? nav.yScale.invert(navDrag.py - box.top) - nav.yScale.invert(e.clientY - box.top)
      : 0;
    setZoom(panWindow(navDrag.win, { x: value - from, y: -dy }, xBounds.value, yBounds.value));
  } else if (navDrag.mode === 'start') {
    setZoom({ ...navDrag.win, x: [Math.min(value, navDrag.win.x[1]), navDrag.win.x[1]] });
  } else {
    setZoom({ ...navDrag.win, x: [navDrag.win.x[0], Math.max(value, navDrag.win.x[0])] });
  }
}
function onNavUp() {
  navDrag = null;
  window.removeEventListener('pointermove', onNavDrag);
  window.removeEventListener('pointerup', onNavUp);
}
const navBox = ref<HTMLElement | null>(null);

/* ─── plugins ────────────────────────────────────────────── */
const mountedAt = ref(0);
const pluginApi = computed<PluginApi | null>(() => {
  if (!scales.value) return null;
  return {
    plot: layoutState.value.plot,
    x: scales.value.x,
    y: scales.value.left,
    series: live.value,
    hit: hit.value,
    time: mountedAt.value ? performance.now() - mountedAt.value : 0,
    color: (i: number) => seriesColor(i, live.value[i]?.color as string | undefined),
  };
});
function pluginNodes(where: 'below' | 'above'): OverlayNode[] {
  const api = pluginApi.value;
  if (!api) return [];
  return (props.plugins || []).flatMap((p) => (p[where] ? p[where]!(api) : []));
}
const belowNodes = computed(() => pluginNodes('below'));
const aboveNodes = computed(() => pluginNodes('above'));
watch(hit, (h) => (props.plugins || []).forEach((p) => p.onHover?.(h)));

/* ─── toolbar ────────────────────────────────────────────── */
const toolbarOpen = ref(false);
const toolbarItems = computed(() => {
  if (!props.toolbar) return [];
  const asked = typeof props.toolbar === 'object' && props.toolbar.items
    ? props.toolbar.items
    : (['png', 'svg', 'csv', 'reset-zoom'] as const);
  /* Reset-zoom is dropped when zoom is off rather than shown disabled: a menu of
     things that cannot happen is worse than a shorter menu. */
  return asked.filter((i) => i !== 'reset-zoom' || zoomOn.value);
});

async function runToolbar(item: string) {
  toolbarOpen.value = false;
  if (item === 'reset-zoom') { setZoom(null); return; }
  if (item === 'csv') { download(exportCsvString(), 'chart.csv', 'text/csv'); return; }
  if (item === 'svg') { download(exportSvgString(), 'chart.svg', 'image/svg+xml'); return; }
  if (!svgEl.value) return;
  const blob = await exportRaster(svgEl.value, { scale: 2 });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, 'chart.png');
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function exportCsvString() { return exportCsv(live.value, categories.value, categorical.value); }
function exportSvgString() { return svgEl.value ? exportSvg(svgEl.value) : ''; }
function download(text: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  triggerDownload(url, name);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function triggerDownload(url: string, name: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* ─── accessibility ──────────────────────────────────────── */
const summary = computed(() => {
  if (props.ariaLabel) return props.ariaLabel;
  const names = live.value.filter((s) => !s.hidden).map((s) => s.name);
  const n = live.value[0]?.points.length || 0;
  return `${props.title || 'Line chart'}. ${names.length} series (${names.join(', ')}), ${n} points each.`;
});
const liveMessage = computed(() => {
  if (!hit.value) return '';
  return `${tooltipTitle.value}: ${tooltipRows.value.map((r) => `${r.name} ${r.value}`).join(', ')}`;
});

/* ─── lifecycle ──────────────────────────────────────────── */
let observer: ResizeObserver | null = null;
onMounted(() => {
  mountedAt.value = performance.now();
  const el = plotBox.value;
  if (el && typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      size.value = { width: Math.round(r.width), height: Math.round(r.height) };
      detectDirection();
      buildScales();
      decimate();
      paint();
    });
    observer.observe(el);
    const r = el.getBoundingClientRect();
    size.value = { width: Math.round(r.width) || 640, height: Math.round(r.height) || 320 };
  }
  commit(true);
  /* A second read once the first frame has laid out, for the case where no
     ResizeObserver tick follows the initial one. */
  nextTick(() => { if (detectDirection()) commit(false); });

  /* On screen, and once. A chart three screens down that has already finished
     animating by the time it is scrolled to has not been seen to animate. */
  if (!props.entranceOnVisible || typeof IntersectionObserver === 'undefined') {
    nextTick(playReveal);
    return;
  }
  visibility = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    playReveal();
    visibility?.disconnect();
    visibility = null;
  }, { threshold: 0.25 });
  if (root.value) visibility.observe(root.value);
});
onBeforeUnmount(() => {
  observer?.disconnect();
  visibility?.disconnect();
  if (revealRaf) cancelAnimationFrame(revealRaf);
  stopAnim();
});
/* the canvas layer has to be repainted as the sweep advances, since its clip is
   applied at draw time rather than by an element */
watch(reveal, () => { if (useCanvas.value) paint(); });
/*
 * Watchers are grouped by what a prop actually invalidates, because getting that
 * wrong makes a prop silently inert:
 *  - the data or the stacking changes what the points ARE, so the frame is
 *    rebuilt and the domain re-derived;
 *  - an axis spec changes the scales but not the points;
 *  - decimation changes only which points are drawn;
 *  - the renderer changes only where they are drawn.
 * Everything else — curve, tension, connectNulls, markers, labels, hover — is
 * read inside the paths computed and needs no watcher at all.
 */
watch(() => merged.series.value, () => commit(true), { deep: true });
watch(() => [props.stackMode, props.orientation, props.barPadding, props.categoryGap,
  props.barGap, props.barThickness, props.maxBarThickness, props.barMode, props.overlapRatio,
  props.barRadius, props.borderSkipped, props.minBarLength,
  props.innerRadius, props.padAngle, props.startAngle, props.endAngle], () => commit(false));
watch([merged.xAxis, merged.yAxis, merged.y2Axis], () => commit(false), { deep: true });
watch(() => [props.decimation, props.decimationThreshold], () => { decimate(); paint(); });
/* One watcher on the geometry rather than a paint call at every call site: a
   missed site is a blank canvas, and nothing in the DOM says so. */
watch(paths, () => { if (useCanvas.value) nextTick(paint); });
watch(useCanvas, () => nextTick(paint));

/* A bare "300" is invalid CSS, and a String|Number height that emits it silently
   is a component defect rather than a caller's mistake: an attribute always
   arrives as a string, so a numeric one means pixels. Anything non-numeric —
   "60vh", "100%" — passes through untouched. */
function toLength(v: string | number): string {
  const s = String(v ?? '').trim();
  return s && Number.isFinite(Number(s)) ? `${Number(s)}px` : s;
}
/* The template reads these rather than the props, so markup-declared parts are
   visible to it too. */
const cfgXAxis = merged.xAxis;
const cfgYAxis = merged.yAxis;
const cfgY2Axis = merged.y2Axis;
const cfgLegend = merged.legend;
const cfgTooltip = merged.tooltip;
const cfgHover = merged.hover;
const cfgTitle = merged.title;
const cfgCaption = merged.caption;
const cfgNavigator = merged.navigator;

const rootStyle = computed(() => ({
  '--apex-cht-h': toLength(props.height),
  '--apex-cht-nav-h': `${navHeight.value}px`,
}));

const svgEl = ref<SVGSVGElement | null>(null);

/* Plain functions rather than inline arrows: a template expression cannot carry
   type annotations, and the slot needs both mappers. */
function mapAnnX(v: number) { return scales.value ? scales.value.x.map(v) : 0; }
function mapAnnY(v: number) { return scales.value ? scales.value.left.map(v) : 0; }

defineExpose({
  /** Plot geometry, for annotations and plugins in later slices. */
  geometry: () => ({ plot: layoutState.value.plot, scales: scales.value }),
  clearHover: clearHit,
  /* Strings and blobs, not downloads: the filename and destination are the
     application's business. */
  exportSvg: () => (svgEl.value ? exportSvg(svgEl.value) : ''),
  exportImage: (options?: RasterOptions) => (svgEl.value
    ? exportRaster(svgEl.value, options)
    : Promise.reject(new Error('not mounted'))),
  exportCsv: () => exportCsv(live.value, categories.value, categorical.value),
  exportRows: () => exportRows(live.value, categories.value, categorical.value),
  /* Programmatic zoom, so a toolbar or a URL can drive the window. */
  zoomTo: (range: ZoomRange | null) => setZoom(range),
  resetZoom: () => setZoom(null),
  zoomRange: () => zoomRange.value,
});
</script>

<template>
  <figure ref="root" class="apex-cht" :style="rootStyle" :class="ui?.root"
          :data-decimated="decimated ? 'true' : 'false'"
          :data-family="radial ? 'radial' : (hasTreemap ? 'treemap' : (hasHeatmap ? 'heatmap' : 'cartesian'))"
          :data-orientation="orientation" :data-dir="rtl ? 'rtl' : 'ltr'"
          :data-zoomed="zoomRange ? 'true' : 'false'"
          :data-renderer="useCanvas ? 'canvas' : 'svg'"
          :data-hovered="hit ? 'true' : 'false'">
    <nav v-if="hasTreemap && crumbs.length" class="apex-cht__crumbs">
      <button type="button" @click="drillPath = []">All</button>
      <button v-for="c in crumbs" :key="c.key" type="button" @click="drillTo(c.index)">{{ c.name }}</button>
      <button type="button" class="apex-cht__crumb-up" @click="drillOut()">Back</button>
    </nav>

    <figcaption v-if="cfgTitle || cfgCaption" class="apex-cht__head" :class="ui?.head">
      <span v-if="cfgTitle" class="apex-cht__title" :class="ui?.title">{{ cfgTitle }}</span>
      <span v-if="cfgCaption" class="apex-cht__caption" :class="ui?.caption">{{ cfgCaption }}</span>
    </figcaption>

    <div v-if="!radial && cfgLegend?.show !== false && live.length > 1 && cfgLegend?.position === 'top'"
         class="apex-cht__legend" :class="ui?.legend" :data-align="cfgLegend?.align || 'center'">
      <slot v-if="$slots.legend" name="legend" :series="live" :colors="live.map((s, i) => seriesColor(i, s.color))"
            :hidden="live.filter((s) => s.hidden).map((s) => s.id)" :toggle="toggleSeries" />
      <template v-else>
        <button v-for="(s, i) in live" :key="s.id" type="button" class="apex-cht__key" :class="ui?.key"
                :data-off="s.hidden ? 'true' : 'false'" @click="toggleSeries(s)">
          <span class="apex-cht__swatch" :class="ui?.swatch" :style="{ background: seriesColor(i, s.color) }"></span>{{ s.name }}
        </button>
      </template>
    </div>

    <div v-if="toolbarItems.length" class="apex-cht__toolbar" :class="ui?.toolbar">
      <button type="button" class="apex-cht__tool" :class="ui?.tool" :aria-expanded="toolbarOpen"
              aria-label="Chart menu" @click="toolbarOpen = !toolbarOpen">
        <span></span><span></span><span></span>
      </button>
      <div v-if="toolbarOpen" class="apex-cht__toolmenu">
        <button v-for="i in toolbarItems" :key="i" type="button" @click="runToolbar(i)">
          {{ i === 'png' ? 'Download PNG' : i === 'svg' ? 'Download SVG'
            : i === 'csv' ? 'Download CSV' : 'Reset zoom' }}
        </button>
      </div>
    </div>

    <!--
      Every pointer entry point the chart has.

      The port kept onWheel, onDown and the three touch handlers and bound none
      of them, so wheel zoom, rubber-band zoom, shift-drag pan, 2D zoom and
      pinch were all dead while the code for them sat right there. vue-tsc said
      so — five TS6133 "declared but never read" — but an unread *handler* is an
      unbound interaction, not an untidy import, and the class was waved through
      as cosmetic.

      data-zoom belongs here too: the registry documents it as a state hook.
    -->
    <div ref="plotBox" class="apex-cht__plot" :class="ui?.plot"
         :data-zoom="zoomOn ? 'true' : 'false'"
         @pointermove="onMove" @pointerleave="clearHit" @click="onClick"
         @pointerdown="onDown" @wheel="onWheel"
         @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
      <svg ref="svgEl" class="apex-cht__svg" :class="ui?.svg" :viewBox="`0 0 ${size.width} ${size.height}`" role="img"
           :aria-label="summary" tabindex="0" @keydown="onKey" @blur="clearHit">
        <defs>
          <clipPath :id="uidClip">
            <rect :x="clipRect.x" :y="clipRect.y" :width="clipRect.width" :height="clipRect.height" />
          </clipPath>
          <clipPath :id="plotClipId">
            <rect :x="layoutState.plot.x - 1" :y="layoutState.plot.y - 1"
                  :width="layoutState.plot.width + 2" :height="layoutState.plot.height + 2" />
          </clipPath>
          <template v-for="entry in paths" :key="`d-${entry.series.id}`">
            <linearGradient v-if="entry.grad" :id="entry.strokeId" gradientUnits="userSpaceOnUse"
                            :x1="gradX(entry.strokeCoords!.x1)" :y1="gradY(entry.strokeCoords!.y1)"
                            :x2="gradX(entry.strokeCoords!.x2)" :y2="gradY(entry.strokeCoords!.y2)">
              <stop v-for="(st, si) in entry.grad.stops" :key="si" :offset="st.offset"
                    :stop-color="st.color" :stop-opacity="st.opacity" />
            </linearGradient>
            <!-- objectBoundingBox sizes the gradient to each shape, so ONE def
                 serves every point at its own radius rather than N defs -->
            <radialGradient v-if="entry.grad && entry.radial" :id="entry.fillId"
                            cx="0.4" cy="0.35" r="0.75">
              <stop v-for="(st, si) in entry.grad.stops" :key="si" :offset="st.offset"
                    :stop-color="st.color" :stop-opacity="st.opacity" />
            </radialGradient>
            <linearGradient v-if="entry.grad && !entry.radial" :id="entry.fillId" gradientUnits="userSpaceOnUse"
                            :x1="gradX(entry.fillCoords!.x1)" :y1="gradY(entry.fillCoords!.y1)"
                            :x2="gradX(entry.fillCoords!.x2)" :y2="gradY(entry.fillCoords!.y2)">
              <stop v-for="(st, si) in entry.grad.stops" :key="si" :offset="st.offset"
                    :stop-color="st.color" :stop-opacity="st.opacity" />
            </linearGradient>
          </template>
        </defs>
        <!-- radial: no plot rect, no axes, so the cartesian layer is skipped
             entirely rather than drawn and hidden -->
        <!-- a treemap owns the whole frame: no scales, no axes, no plot rect -->
        <ApexChartTreemap v-if="hasTreemap" :ui="ui" :series="allSeries" :drill-path="drillPath"
                          :width="size.width" :height="size.height" :locale="locale"
                          @drill="drillInto" />

        <g v-else-if="radial" class="apex-cht__radial">
          <template v-if="radialKind === 'pie'">
            <g v-for="ring in pieRings" :key="ring.seriesId">
              <path v-for="sl in ring.slices" :key="sl.key" class="apex-cht__slice" :class="ui?.slice" :d="sl.d"
                    :fill="sl.color"
                    :data-on="hit && hit.entries[0].point === sl.point ? 'true' : 'false'"
                    @pointerenter="radialHover(sl.seriesId, sl.point, sl.label)"
                    @pointerleave="clearHit" />
            </g>
          </template>

          <template v-else-if="radialKind === 'gauge' && gaugeView">
            <path class="apex-cht__gauge-track" :d="gaugeView.track" />
            <path class="apex-cht__gauge-value" :d="gaugeView.value" :fill="gaugeView.color" />
          </template>

          <template v-else-if="radarView">
            <g class="apex-cht__radar-grid">
              <path v-for="r in radarView.rings" :key="r.key" :d="r.d" />
              <line v-for="sp in radarView.spokes" :key="sp.key" :x1="radarView.frame.cx"
                    :y1="radarView.frame.cy" :x2="sp.x2" :y2="sp.y2" />
            </g>
            <text v-for="sp in radarView.spokes" :key="sp.key + '-t'" class="apex-cht__tick" :class="ui?.tick"
                  :x="sp.lx" :y="sp.ly" :text-anchor="sp.anchor" dominant-baseline="middle">{{ sp.text }}</text>
            <template v-for="shape in radarView.shapes" :key="shape.id">
              <path v-if="shape.polygon" class="apex-cht__radar-shape" :d="shape.polygon"
                    :fill="shape.color" :fill-opacity="shape.fillOpacity" :stroke="shape.color" />
              <path v-for="sec in shape.sectors" :key="sec.key" class="apex-cht__slice" :class="ui?.slice" :d="sec.d"
                    :fill="shape.color" :fill-opacity="shape.fillOpacity"
                    @pointerenter="radialHover(shape.id, sec.point, sec.label)"
                    @pointerleave="clearHit" />
              <circle v-for="pt in shape.points" :key="pt.key" class="apex-cht__dot"
                      :cx="pt.cx" :cy="pt.cy" r="3" :fill="shape.color" />
            </template>
          </template>

          <g v-if="pieLabels.length" class="apex-cht__leaders">
            <path v-for="l in pieLabels" :key="`ld-${l.key}`"
                  :d="`M${l.ax} ${l.ay}L${l.ex} ${l.ey}L${l.tx} ${l.ty}`" />
            <text v-for="l in pieLabels" :key="`lt-${l.key}`" class="apex-cht__leader-text"
                  :x="l.tx + (l.side === 'right' ? 4 : -4)" :y="l.ty"
                  :text-anchor="l.anchor" dominant-baseline="middle">{{ l.text }}</text>
          </g>

          <text v-if="centerValue" class="apex-cht__center-value" :opacity="centerOpacity" :x="radialFrame.cx"
                :y="radialKind === 'gauge' ? radialFrame.cy - 6 : radialFrame.cy"
                text-anchor="middle" dominant-baseline="middle">{{ centerValue }}</text>
          <text v-if="centerLabel" class="apex-cht__center-label" :opacity="centerOpacity" :x="radialFrame.cx"
                :y="(radialKind === 'gauge' ? radialFrame.cy - 6 : radialFrame.cy) + 18"
                text-anchor="middle" dominant-baseline="middle">{{ centerLabel }}</text>
        </g>

        <g v-else-if="scales">
          <!-- horizontal gridlines only: vertical ones fight the series for attention -->
          <!-- per pane: gridlines and y ticks. The x axis is drawn ONCE below the
               last pane, since the panes share it by construction and repeating it
               between them is noise. -->
          <template v-if="paneViews.length > 1">
            <g v-for="pv in paneViews" :key="`pane-${pv.index}`">
              <g v-if="(cfgYAxis?.grid ?? true)" class="apex-cht__grid" :class="ui?.grid">
                <line v-for="t in pv.ticks" :key="`pg${pv.index}-${t.value}`"
                      :x1="pv.rect.x" :x2="pv.rect.x + pv.rect.width"
                      :y1="pv.scale.map(t.value)" :y2="pv.scale.map(t.value)" />
              </g>
              <text v-for="t in pv.ticks" :key="`pt${pv.index}-${t.value}`" class="apex-cht__tick" :class="ui?.tick"
                    :x="rtl ? pv.rect.x + pv.rect.width + 8 : pv.rect.x - 8"
                    :y="pv.scale.map(t.value)"
                    :text-anchor="rtl ? 'start' : 'end'" dominant-baseline="middle">{{ t.label }}</text>
              <text v-if="pv.label" class="apex-cht__axis-title" :class="ui?.axisTitle" text-anchor="middle"
                    :transform="`translate(11 ${pv.rect.y + pv.rect.height / 2}) rotate(-90)`">{{ pv.label }}</text>
            </g>
          </template>

          <!-- gridlines follow the VALUE axis, so turning the chart turns them:
               a gridline exists to read a value against, not to divide categories -->
          <g v-if="paneViews.length === 1 && (cfgYAxis?.grid ?? true)" class="apex-cht__grid" :class="ui?.grid">
            <line v-for="t in (horizontal ? scales.x.ticks : scales.left.ticks)" :key="`g${t.value}`"
                  :x1="horizontal ? scales.x.map(t.value) : layoutState.plot.x"
                  :x2="horizontal ? scales.x.map(t.value) : layoutState.plot.x + layoutState.plot.width"
                  :y1="horizontal ? layoutState.plot.y : scales.left.map(t.value)"
                  :y2="horizontal ? layoutState.plot.y + layoutState.plot.height : scales.left.map(t.value)" />
          </g>

          <!-- bands under the grid, lines over it: a band is background, a
               threshold line is a statement about the data -->
          <g class="apex-cht__bands">
            <rect v-for="b in refBands" :key="b.key" :x="b.x" :y="b.y" :width="b.width"
                  :height="b.height" :fill="b.color" :opacity="b.opacity" />
            <text v-for="b in refBands" :key="b.key + '-t'" v-show="b.label" class="apex-cht__ref-label"
                  :x="b.lx" :y="b.ly" :fill="b.color">{{ b.label }}</text>
          </g>
          <g v-if="belowNodes.length" class="apex-cht__plugin">
            <template v-for="(n, ni) in belowNodes" :key="'pb-' + ni">
              <line v-if="n.type === 'line'" :x1="n.x1" :y1="n.y1" :x2="n.x2" :y2="n.y2"
                    :stroke="n.stroke" :stroke-width="n.width || 1" :stroke-dasharray="n.dash"
                    :opacity="n.opacity" />
              <rect v-else-if="n.type === 'rect'" :x="n.x" :y="n.y" :width="n.width" :height="n.height"
                    :fill="n.fill" :stroke="n.stroke" :rx="n.radius" :opacity="n.opacity" />
              <text v-else-if="n.type === 'text'" :x="n.x" :y="n.y" :fill="n.fill"
                    :font-size="n.size" :font-weight="n.weight" :text-anchor="n.anchor"
                    :dominant-baseline="n.baseline" :opacity="n.opacity">{{ n.text }}</text>
              <path v-else-if="n.type === 'path'" :d="n.d" :fill="n.fill || 'none'" :stroke="n.stroke"
                    :stroke-width="n.width" :stroke-dasharray="n.dash" :opacity="n.opacity" />
              <circle v-else :cx="n.cx" :cy="n.cy" :r="n.r" :fill="n.fill" :stroke="n.stroke"
                      :stroke-width="n.width" :opacity="n.opacity" />
            </template>
          </g>
          <g class="apex-cht__axis" :class="ui?.axis">
            <line v-if="(cfgXAxis?.line ?? true)" :x1="layoutState.plot.x"
                  :x2="layoutState.plot.x + layoutState.plot.width"
                  :y1="layoutState.plot.y + layoutState.plot.height"
                  :y2="layoutState.plot.y + layoutState.plot.height" />
            <template v-if="(cfgXAxis?.ticks ?? true) && !hasHeatmap">
              <text v-for="i in layoutState.xVisible" :key="`x${i}`"
                    class="apex-cht__tick" :class="ui?.tick"
                    :x="scales.x.map(scales.x.ticks[i].value)"
                    :y="layoutState.plot.y + layoutState.plot.height + 17"
                    :text-anchor="layoutState.xRotate ? 'end' : 'middle'"
                    :transform="layoutState.xRotate
                      ? `rotate(${layoutState.xRotate} ${scales.x.map(scales.x.ticks[i].value)} ${layoutState.plot.y + layoutState.plot.height + 17})`
                      : undefined">{{ scales.x.ticks[i].label }}</text>
            </template>
            <!-- the heatmap labels its own rows and columns; drawing the value
                 scale's ticks as well is what doubled them up -->
            <template v-if="paneViews.length === 1 && (cfgYAxis?.ticks ?? true) && !hasHeatmap">
              <text v-for="t in scales.left.ticks" :key="`y${t.value}`" class="apex-cht__tick" :class="ui?.tick"
                    :x="rtl ? layoutState.plot.x + layoutState.plot.width + 8 : layoutState.plot.x - 8"
                    :y="scales.left.map(t.value)"
                    :text-anchor="rtl ? 'start' : 'end'" dominant-baseline="middle">{{ t.label }}</text>
            </template>
            <template v-if="scales.right && (cfgY2Axis?.ticks ?? true)">
              <text v-for="t in scales.right.ticks" :key="`y2${t.value}`" class="apex-cht__tick" :class="ui?.tick"
                    :x="layoutState.plot.x + layoutState.plot.width + 8" :y="scales.right.map(t.value)"
                    text-anchor="start" dominant-baseline="middle">{{ t.label }}</text>
            </template>
            <text v-if="cfgXAxis?.label" class="apex-cht__axis-title" :class="ui?.axisTitle" :x="layoutState.plot.x + layoutState.plot.width / 2"
                  :y="size.height - 2" text-anchor="middle">{{ cfgXAxis.label }}</text>
            <text v-if="cfgYAxis?.label" class="apex-cht__axis-title" :class="ui?.axisTitle" text-anchor="middle"
                  :transform="`translate(11 ${layoutState.plot.y + layoutState.plot.height / 2}) rotate(-90)`">{{ cfgYAxis.label }}</text>
            <text v-if="cfgY2Axis?.label && scales.right" class="apex-cht__axis-title" :class="ui?.axisTitle" text-anchor="middle"
                  :transform="`translate(${size.width - 5} ${layoutState.plot.y + layoutState.plot.height / 2}) rotate(90)`">{{ cfgY2Axis.label }}</text>
          </g>

          <g class="apex-cht__refs">
            <line v-for="r in refLines" :key="r.key" :x1="r.x1" :y1="r.y1" :x2="r.x2" :y2="r.y2"
                  :stroke="r.color" :stroke-width="r.width" :stroke-dasharray="r.dash" />
            <text v-for="r in refLines" :key="r.key + '-t'" v-show="r.label" class="apex-cht__ref-label"
                  :x="r.lx" :y="r.ly" :text-anchor="r.anchor" :fill="r.color">{{ r.label }}</text>
          </g>

          <line v-if="hit && (cfgTooltip?.crosshair ?? true)" class="apex-cht__cross"
                :x1="horizontal ? layoutState.plot.x : hit.x"
                :x2="horizontal ? layoutState.plot.x + layoutState.plot.width : hit.x"
                :y1="horizontal ? crossPos : layoutState.plot.y"
                :y2="horizontal ? crossPos : layoutState.plot.y + layoutState.plot.height" />

          <!-- heatmap: both axes categorical, so the value scale is unused -->
          <ApexChartHeat v-if="hasHeatmap" :ui="ui" :series="allSeries" :plot="layoutState.plot"
                         :locale="locale" @hover="heatHover" @leave="clearHit" />

          <g v-else-if="!useCanvas" class="apex-cht__series" :class="ui?.series" :clip-path="seriesClip">
            <g v-for="entry in paths" :key="entry.series.id" :opacity="entry.opacity"
               :style="{ transition: 'opacity 120ms' }">
              <template v-if="!entry.series.hidden">
                <!-- fills first, then halos, then strokes: a later series' halo
                     must sit over an earlier series' fill but under its own line -->
                <path v-if="entry.area" class="apex-cht__area" :class="ui?.area" :d="entry.area"
                      :fill="entry.fillPaint" :opacity="entry.fillOpacity" />
                <template v-if="entry.fillOpacity > 0">
                  <path v-for="p in entry.pieces" :key="`a-${p.key}`" class="apex-cht__area" :class="ui?.area"
                        :d="p.area" :fill="p.fill" :opacity="entry.fillOpacity" />
                </template>
                <path v-if="entry.border && entry.line" class="apex-cht__border" :d="entry.line"
                      :stroke="entry.border.color" :stroke-width="entry.border.width"
                      :stroke-dasharray="entry.border.dash" :stroke-linecap="entry.border.cap" />
                <template v-if="entry.border">
                  <path v-for="p in entry.pieces" :key="`b-${p.key}`" class="apex-cht__border"
                        :d="p.line" :stroke="entry.border.color"
                        :stroke-width="entry.border.width" :stroke-dasharray="entry.border.dash" />
                </template>
                <template v-for="c in entry.candles" :key="c.key">
                  <line class="apex-cht__wick" :x1="c.wickX" :x2="c.wickX" :y1="c.wickY1" :y2="c.wickY2"
                        :stroke="c.tone === 'neutral' ? entry.neutralColor : (c.tone === 'up' ? entry.upColor : entry.downColor)"
                        :stroke-width="entry.wickWidth" />
                  <line v-if="entry.candleVariant === 'ohlc'" :x1="c.openTick.x1" :x2="c.openTick.x2"
                        :y1="c.openTick.y" :y2="c.openTick.y" class="apex-cht__wick"
                        :stroke="c.tone === 'neutral' ? entry.neutralColor : (c.tone === 'up' ? entry.upColor : entry.downColor)"
                        :stroke-width="entry.wickWidth" />
                  <line v-if="entry.candleVariant === 'ohlc'" :x1="c.closeTick.x1" :x2="c.closeTick.x2"
                        :y1="c.closeTick.y" :y2="c.closeTick.y" class="apex-cht__wick"
                        :stroke="c.tone === 'neutral' ? entry.neutralColor : (c.tone === 'up' ? entry.upColor : entry.downColor)"
                        :stroke-width="entry.wickWidth" />
                  <rect v-if="entry.candleVariant !== 'ohlc'" class="apex-cht__candle"
                        :x="c.bodyX" :y="c.bodyY" :width="c.bodyW" :height="c.bodyH"
                        :fill="c.filled
                          ? (c.tone === 'neutral' ? entry.neutralColor : (c.tone === 'up' ? entry.upColor : entry.downColor))
                          : 'none'"
                        :stroke="c.tone === 'neutral' ? entry.neutralColor : (c.tone === 'up' ? entry.upColor : entry.downColor)" />
                </template>
                <path v-for="b in entry.barRects" :key="`bar-${b.key}`" class="apex-cht__bar" :class="ui?.bar"
                      :d="b.d" :fill="b.fill" />
                <template v-if="entry.barBorder">
                  <path v-for="b in entry.barRects" :key="`bb-${b.key}`" class="apex-cht__bar-border"
                        :d="b.stroke" :stroke="entry.barBorder.color"
                        :stroke-width="entry.barBorder.width" :stroke-dasharray="entry.barBorder.dash" />
                </template>
                <template v-for="pt in entry.points" :key="`pt-${pt.key}`">
                  <path v-if="pt.d" class="apex-cht__point" :class="ui?.point" :d="pt.d" :fill="pt.fill"
                        :fill-opacity="entry.type === 'bubble' ? (entry.fillOpacity || 0.55) : 1"
                        :stroke="entry.pointBorder.color || entry.strokePaint"
                        :stroke-width="entry.pointBorder.width"
                        :transform="`translate(${pt.cx} ${pt.cy})`" />
                  <circle v-else class="apex-cht__point" :class="ui?.point" :cx="pt.cx" :cy="pt.cy" :r="pt.r"
                          :fill="entry.radial ? entry.fillPaint : pt.fill"
                          :fill-opacity="entry.type === 'bubble' ? (entry.fillOpacity || 0.55) : 1"
                          :stroke="entry.pointBorder.color || entry.strokePaint"
                          :stroke-width="entry.pointBorder.width" />
                </template>
                <path v-if="entry.line" class="apex-cht__line" :class="ui?.line" :d="entry.line"
                      :stroke="entry.strokePaint" :stroke-width="entry.width"
                      :stroke-dasharray="entry.dash" :stroke-dashoffset="entry.dashOffset"
                      :stroke-linecap="entry.cap" :stroke-linejoin="entry.join" />
                <path v-for="p in entry.pieces" :key="`l-${p.key}`" class="apex-cht__line" :class="ui?.line"
                      :d="p.line" :stroke="p.color" :stroke-width="p.width"
                      :stroke-dasharray="p.dash" :stroke-linecap="entry.cap" />
                <template v-for="m in entry.markers" :key="`m-${entry.series.id}-${m.p.key}`">
                  <circle v-if="!entry.markerGeometry" class="apex-cht__dot"
                          :cx="m.cx" :cy="m.cy" :r="entry.markerSize" :fill="entry.strokePaint" />
                  <path v-else class="apex-cht__dot" :d="entry.markerGeometry" :fill="entry.strokePaint"
                        :transform="`translate(${m.cx} ${m.cy})${entry.rotation ? ` rotate(${entry.rotation})` : ''}`" />
                </template>
                <text v-for="(l, li) in entry.labels" :key="`t-${entry.series.id}-${li}`"
                      class="apex-cht__label" :x="l.x" :y="l.y"
                      :text-anchor="l.anchor || 'middle'" :dominant-baseline="l.baseline"
                      :data-inside="l.inside ? 'true' : 'false'">{{ l.text }}</text>
              </template>
            </g>
          </g>

          <g v-if="aboveNodes.length" class="apex-cht__plugin">
            <template v-for="(n, ni) in aboveNodes" :key="'pa-' + ni">
              <line v-if="n.type === 'line'" :x1="n.x1" :y1="n.y1" :x2="n.x2" :y2="n.y2"
                    :stroke="n.stroke" :stroke-width="n.width || 1" :stroke-dasharray="n.dash"
                    :opacity="n.opacity" />
              <rect v-else-if="n.type === 'rect'" :x="n.x" :y="n.y" :width="n.width" :height="n.height"
                    :fill="n.fill" :stroke="n.stroke" :rx="n.radius" :opacity="n.opacity" />
              <text v-else-if="n.type === 'text'" :x="n.x" :y="n.y" :fill="n.fill"
                    :font-size="n.size" :font-weight="n.weight" :text-anchor="n.anchor"
                    :dominant-baseline="n.baseline" :opacity="n.opacity">{{ n.text }}</text>
              <path v-else-if="n.type === 'path'" :d="n.d" :fill="n.fill || 'none'" :stroke="n.stroke"
                    :stroke-width="n.width" :stroke-dasharray="n.dash" :opacity="n.opacity" />
              <circle v-else :cx="n.cx" :cy="n.cy" :r="n.r" :fill="n.fill" :stroke="n.stroke"
                      :stroke-width="n.width" :opacity="n.opacity" />
            </template>
          </g>

          <!-- the annotation slot gets the scales, so custom content is placed in
               data coordinates rather than pixels the caller has to guess -->
          <g v-if="scales" class="apex-cht__annotations">
            <slot name="annotation" :plot="layoutState.plot" :scales="scales"
                  :x="mapAnnX" :y="mapAnnY" />
          </g>

          <rect v-if="brushRect" class="apex-cht__brush" :x="brushRect.x" :y="brushRect.y"
                :width="brushRect.width" :height="brushRect.height" />

          <g v-if="hit" class="apex-cht__active">
            <circle v-for="e in hit.entries" :key="`a-${e.series.id}`" :cx="e.px" :cy="e.py"
                    :r="markerSize * (cfgHover?.radiusMultiplier ?? 1.9)"
                    :fill="cfgHover?.color || paths[live.indexOf(e.series)]?.flatColor"
                    :stroke="cfgHover?.borderColor" :stroke-width="cfgHover?.borderWidth"
                    :style="cfgHover?.brightness ? { filter: `brightness(${cfgHover.brightness})` } : undefined" />
          </g>
        </g>
      </svg>

      <canvas v-if="useCanvas" ref="canvasEl" class="apex-cht__canvas"
              :style="{ width: size.width + 'px', height: size.height + 'px' }"></canvas>

      <div v-if="hit && cfgTooltip?.show !== false" class="apex-cht__tip" :class="ui?.tip" :style="tooltipStyle">
        <!-- the slot replaces the rows entirely: a computed total or a delta
             against a threshold cannot come out of a value formatter -->
        <slot v-if="$slots.tooltip" name="tooltip" :entries="hit.entries"
              :category="tooltipTitle" :rows="tooltipRows" :hit="hit" />
        <template v-else>
        <span class="apex-cht__tip-title" :class="ui?.tipTitle">{{ tooltipTitle }}</span>
        <template v-if="ohlcRows">
          <span v-for="r in ohlcRows.rows" :key="r.label" class="apex-cht__tip-row" :class="ui?.tipRow">
            <span class="apex-cht__tip-name">{{ r.label }}</span><b>{{ r.value }}</b>
          </span>
        </template>
        <span v-for="r in (ohlcRows ? otherRows : tooltipRows)" :key="r.key" class="apex-cht__tip-row" :class="ui?.tipRow">
          <span class="apex-cht__swatch" :class="ui?.swatch" :style="{ background: r.color }"></span>
          <span class="apex-cht__tip-name">{{ r.name }}</span>
          <b>{{ r.value }}</b>
        </span>
        </template>
      </div>
    </div>

    <!-- a pie's legend names its SLICES: the parts are what is being compared,
         and one series would make a legend of one entry -->
    <div v-if="radial && radialKind === 'pie' && cfgLegend?.show !== false && pieRings.length"
         class="apex-cht__legend" :class="ui?.legend" :data-align="cfgLegend?.align || 'center'">
      <span v-for="sl in pieRings[0].slices" :key="sl.key" class="apex-cht__key" :class="ui?.key">
        <span class="apex-cht__swatch" :class="ui?.swatch" :style="{ background: sl.color, blockSize: '9px', inlineSize: '9px', borderRadius: '3px' }"></span>{{ sl.label }}
      </span>
    </div>

    <div v-if="cfgNavigator && navigator" ref="navBox" class="apex-cht__nav" :class="ui?.nav">
      <svg class="apex-cht__nav-svg" :viewBox="`0 0 ${size.width} ${navHeight}`">
        <!-- the overview draws what it is an overview OF: an area under a bar or
             point chart misrepresents what you are panning across -->
        <template v-if="navigator.navPoints.length">
          <circle v-for="p in navigator.navPoints" :key="p.key" class="apex-cht__nav-point"
                  :cx="p.cx" :cy="p.cy" r="1.6" :fill="navigator.color" />
        </template>
        <template v-else-if="navigator.navBars.length">
          <rect v-for="b in navigator.navBars" :key="b.key" class="apex-cht__nav-bar"
                :x="b.x" :y="b.y" :width="b.width" :height="b.height" :fill="navigator.color" />
        </template>
        <template v-else>
          <path class="apex-cht__nav-area" :d="navigator.area" :fill="navigator.color" />
          <path class="apex-cht__nav-line" :d="navigator.line" :stroke="navigator.color" />
        </template>
        <!-- the mask is outside the window, not inside: what is dimmed is what
             you are not looking at -->
        <rect class="apex-cht__nav-mask" :x="navigator.inner.x" :y="navigator.inner.y"
              :width="Math.max(0, navigator.x0 - navigator.inner.x)" :height="navigator.inner.height" />
        <rect class="apex-cht__nav-mask" :x="navigator.x1" :y="navigator.inner.y"
              :width="Math.max(0, navigator.inner.x + navigator.inner.width - navigator.x1)"
              :height="navigator.inner.height" />
        <!-- a 2D window is masked above and below too, or the dimming would claim
             the whole column is in view -->
        <template v-if="navigator.twoAxis">
          <rect class="apex-cht__nav-mask" :x="navigator.x0" :y="navigator.inner.y"
                :width="Math.max(0, navigator.x1 - navigator.x0)"
                :height="Math.max(0, navigator.y0 - navigator.inner.y)" />
          <rect class="apex-cht__nav-mask" :x="navigator.x0" :y="navigator.y1"
                :width="Math.max(0, navigator.x1 - navigator.x0)"
                :height="Math.max(0, navigator.inner.y + navigator.inner.height - navigator.y1)" />
        </template>
        <rect class="apex-cht__nav-win" :x="navigator.x0" :y="navigator.y0"
              :width="Math.max(1, navigator.x1 - navigator.x0)"
              :height="Math.max(1, navigator.y1 - navigator.y0)"
              @pointerdown="onNavDown($event, 'move')" />
        <rect class="apex-cht__nav-grip" :x="navigator.x0 - 3" :y="navigator.y0"
              width="6" :height="Math.max(1, navigator.y1 - navigator.y0)"
              @pointerdown="onNavDown($event, 'start')" />
        <rect class="apex-cht__nav-grip" :x="navigator.x1 - 3" :y="navigator.y0"
              width="6" :height="Math.max(1, navigator.y1 - navigator.y0)"
              @pointerdown="onNavDown($event, 'end')" />
      </svg>
    </div>

    <div v-if="!radial && cfgLegend?.show !== false && live.length > 1 && cfgLegend?.position !== 'top'"
         class="apex-cht__legend" :class="ui?.legend" :data-align="cfgLegend?.align || 'center'">
      <slot v-if="$slots.legend" name="legend" :series="live" :colors="live.map((s, i) => seriesColor(i, s.color))"
            :hidden="live.filter((s) => s.hidden).map((s) => s.id)" :toggle="toggleSeries" />
      <template v-else>
        <button v-for="(s, i) in live" :key="s.id" type="button" class="apex-cht__key" :class="ui?.key"
                :data-off="s.hidden ? 'true' : 'false'" @click="toggleSeries(s)">
          <span class="apex-cht__swatch" :class="ui?.swatch" :style="{ background: seriesColor(i, s.color) }"></span>{{ s.name }}
        </button>
      </template>
    </div>

    <!-- compound children mount here and render nothing; they exist to register -->
    <slot />

    <span class="apex-cht__sr" aria-live="polite">{{ liveMessage }}</span>
    <table v-if="dataTable" class="apex-cht__sr">
      <caption>{{ title || 'Chart data' }}</caption>
      <thead>
        <tr><th scope="col">Category</th><th v-for="s in live" :key="s.id" scope="col">{{ s.name }}</th></tr>
      </thead>
      <tbody>
        <tr v-for="(p, i) in (live[0]?.points || [])" :key="String(p.key)">
          <th scope="row">{{ categorical ? categories[p.x] : p.key }}</th>
          <td v-for="s in live" :key="s.id">{{ s.points[i]?.y ?? '—' }}</td>
        </tr>
      </tbody>
    </table>
  </figure>
</template>
