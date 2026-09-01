/**
 * Compound chart parts.
 *
 * Every one is renderless — it registers configuration and returns null — so the
 * markup form and the props form compile to exactly the same inputs. Defined in
 * one file because they share one shape: a prop list, and a call registering it.
 */
import { defineComponent, type PropType } from 'vue';
import { useChartPart, type ChartPartKind } from './registry';
import type { ChartGradient, ChartSeriesType, MarkerShape, SegmentContext } from './data';
import type { CurveType } from './layout';

/** Everything the part declares, minus the keys the caller left undefined. */
function pruned(source: Record<string, unknown>, keys: string[]) {
  const out: Record<string, unknown> = {};
  keys.forEach((k) => { if (source[k] !== undefined) out[k] = source[k]; });
  return out;
}

function part(name: string, kind: ChartPartKind, props: Record<string, unknown>) {
  const keys = Object.keys(props);
  return defineComponent({
    name,
    props: props as never,
    setup(p) {
      useChartPart(kind, () => pruned(p as Record<string, unknown>, keys));
      return () => null;
    },
  });
}

const AXIS_PROPS = {
  type: String as PropType<'linear' | 'log' | 'time' | 'category'>,
  label: String,
  min: [Number, String, Date] as PropType<number | string | Date>,
  max: [Number, String, Date] as PropType<number | string | Date>,
  nice: { type: Boolean, default: undefined },
  includeZero: { type: Boolean, default: undefined },
  padding: Number,
  reverse: { type: Boolean, default: undefined },
  tickCount: Number,
  format: [Function, Object] as PropType<((v: number, i: number) => string) | Intl.NumberFormatOptions>,
  grid: { type: Boolean, default: undefined },
  line: { type: Boolean, default: undefined },
  ticks: { type: Boolean, default: undefined },
  rotate: [Number, String] as PropType<number | 'auto'>,
};

export const ApexChartSeries = part('ApexChartSeries', 'series', {
  id: String,
  name: String,
  type: String as PropType<ChartSeriesType>,
  data: Array as PropType<unknown[]>,
  xKey: [String, Function] as PropType<string | ((row: unknown, i: number) => unknown)>,
  yKey: [String, Function] as PropType<string | ((row: unknown, i: number) => unknown)>,
  y0Key: [String, Function] as PropType<string | ((row: unknown, i: number) => unknown)>,
  rKey: [String, Function] as PropType<string | ((row: unknown, i: number) => unknown)>,
  color: [String, Object] as PropType<string | ChartGradient>,
  fillOpacity: Number,
  stack: String,
  axis: String as PropType<'left' | 'right'>,
  hidden: { type: Boolean, default: undefined },
  curve: String as PropType<CurveType>,
  tension: Number,
  lineStrokeWidth: Number,
  lineDash: [String, Array] as PropType<string | number[]>,
  lineDashOffset: Number,
  lineCap: String,
  lineJoin: String,
  borderColor: String,
  borderStrokeWidth: Number,
  borderDash: [String, Array] as PropType<string | number[]>,
  borderCap: String,
  segmentColor: [String, Function] as PropType<string | ((c: SegmentContext) => string | undefined)>,
  segmentStrokeWidth: [Number, Function] as PropType<number | ((c: SegmentContext) => number | undefined)>,
  segmentDash: [String, Function] as PropType<string | ((c: SegmentContext) => string | undefined)>,
  segmentFillColor: [String, Function] as PropType<string | ((c: SegmentContext) => string | undefined)>,
  showMarkers: { type: Boolean, default: undefined },
  markerSize: Number,
  markerShape: String as PropType<MarkerShape>,
  pointRotation: Number,
  barRadius: Number,
  waterfall: { type: Boolean, default: undefined },
  totalKey: String,
  renderBar: Function as PropType<(ctx: unknown) => string>,
  innerRadius: Number,
  padAngle: Number,
  startAngle: Number,
  endAngle: Number,
  min: Number,
  max: Number,
  minSize: Number,
  maxSize: Number,
});

export const ApexChartXAxis = part('ApexChartXAxis', 'xAxis', AXIS_PROPS);
export const ApexChartYAxis = part('ApexChartYAxis', 'yAxis', AXIS_PROPS);
export const ApexChartY2Axis = part('ApexChartY2Axis', 'y2Axis', AXIS_PROPS);

export const ApexChartLegend = part('ApexChartLegend', 'legend', {
  show: { type: Boolean, default: undefined },
  position: String as PropType<'top' | 'bottom'>,
  align: String as PropType<'start' | 'center' | 'end'>,
  interactive: { type: Boolean, default: undefined },
});

export const ApexChartTooltip = part('ApexChartTooltip', 'tooltip', {
  show: { type: Boolean, default: undefined },
  mode: String as PropType<'nearest' | 'shared-x' | 'series'>,
  snap: String as PropType<'x' | 'y' | 'xy' | 'none'>,
  crosshair: { type: Boolean, default: undefined },
  format: Function as PropType<(value: number, series: string) => string>,
});

export const ApexChartHover = part('ApexChartHover', 'hover', {
  brightness: Number,
  dimOpacity: Number,
  radiusMultiplier: Number,
  color: String,
  borderColor: String,
  borderWidth: Number,
});

export const ApexChartDataLabels = part('ApexChartDataLabels', 'dataLabels', {
  show: { type: Boolean, default: true },
  format: Function as PropType<(v: number, p: unknown) => string>,
  offset: Number,
  collision: { type: Boolean, default: undefined },
  sparse: { type: Boolean, default: undefined },
});

export const ApexChartZoom = part('ApexChartZoom', 'zoom', {
  wheel: { type: Boolean, default: true },
  drag: { type: Boolean, default: true },
  pan: { type: Boolean, default: true },
  touch: { type: Boolean, default: true },
});

export const ApexChartNavigator = part('ApexChartNavigator', 'navigator', {
  height: Number,
  series: String,
  curve: String as PropType<CurveType>,
});

export const ApexChartReferenceLine = part('ApexChartReferenceLine', 'referenceLine', {
  axis: String as PropType<'x' | 'y'>,
  value: [Number, String, Date] as PropType<number | string | Date>,
  label: String,
  color: String,
  dash: String,
  width: Number,
});

export const ApexChartReferenceBand = part('ApexChartReferenceBand', 'referenceBand', {
  axis: String as PropType<'x' | 'y'>,
  from: [Number, String, Date] as PropType<number | string | Date>,
  to: [Number, String, Date] as PropType<number | string | Date>,
  label: String,
  color: String,
  opacity: Number,
});

/** Title and caption are single strings, so they take one anonymous prop. */
export const ApexChartTitle = part('ApexChartTitle', 'title', { text: String });
export const ApexChartCaption = part('ApexChartCaption', 'caption', { text: String });
