/**
 * Chart scales and ticks.
 *
 * A tick generator per scale type rather than one generic algorithm: "nice"
 * ticks for numbers and for time have nothing in common — one wants powers of
 * ten, the other wants calendar boundaries that are not uniform in length.
 */

export type ScaleType = 'linear' | 'log' | 'time' | 'category';
export type TickFormatter = (value: number, index: number) => string;

export interface Tick {
  value: number;
  label: string;
}

export interface AxisSpec {
  type?: ScaleType;
  /** Axis title, drawn outside the tick labels. */
  label?: string;
  min?: number | string | Date;
  max?: number | string | Date;
  /** Extend the domain to round tick boundaries. */
  nice?: boolean;
  /**
   * Force zero into the domain. Defaults false for lines — a line chart that
   * always starts at zero flattens the shape it exists to show — and true for
   * filled areas, where the fill implies magnitude from a baseline.
   */
  includeZero?: boolean;
  /** Fraction of the span added at each end. */
  padding?: number;
  reverse?: boolean;
  tickCount?: number;
  format?: TickFormatter | Intl.NumberFormatOptions;
  grid?: boolean;
  line?: boolean;
  ticks?: boolean;
  /** 'auto' rotates only when labels would collide. */
  rotate?: number | 'auto';
  /**
   * BCP 47 tag for tick formatting. Passed explicitly rather than read from the
   * document, so a chart can be formatted for its data's locale — a euro
   * revenue chart on an English page is a real case.
   */
  locale?: string;
  /** Category scales only: draw ticks between bands rather than under labels. */
  offsetTicks?: boolean;
  /**
   * Category scales only. A band scale gives each category a slot and maps to its
   * centre; a point scale maps to the boundary. Bars need bands or the first and
   * last would hang half off the plot, and a line sharing the axis has to use the
   * same centres or a combo chart would be misaligned by half a step.
   */
  band?: boolean;
}

export interface Scale {
  type: ScaleType;
  /** Numeric domain in scale space; for category, [0, count - 1]. */
  domain: [number, number];
  range: [number, number];
  categories: string[];
  step: number;
  map(value: number): number;
  invert(px: number): number;
  ticks: Tick[];
}

/* ─── text measurement ───────────────────────────────────── */
/* A real measurement, not a character-count guess: the plot rect depends on
   label width, and a guess wrong by 20% either clips labels or wastes a fifth
   of the plot. */
let measureCtx: CanvasRenderingContext2D | null = null;
export function measureText(text: string, font = '11px system-ui'): number {
  if (typeof document === 'undefined') return text.length * 6.2;
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
  if (!measureCtx) return text.length * 6.2;
  measureCtx.font = font;
  return measureCtx.measureText(text).width;
}

/* ─── numbers ────────────────────────────────────────────── */
function niceStep(raw: number): number {
  if (!(raw > 0)) return 1;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const mult = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
  return mult * mag;
}

/** Rounds away the float noise a repeated += step accumulates. */
function clean(v: number, step: number): number {
  const decimals = Math.max(0, -Math.floor(Math.log10(step)) + 1);
  return Number(v.toFixed(Math.min(12, decimals)));
}

export function numberTicks(min: number, max: number, target = 6) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { min: 0, max: 1, step: 1, values: [0, 1] };
  }
  if (min === max) {
    const pad = Math.abs(min) > 1 ? Math.abs(min) * 0.1 : 1;
    min -= pad; max += pad;
  }
  const step = niceStep((max - min) / Math.max(1, target));
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const values: number[] = [];
  for (let v = lo; v <= hi + step * 1e-9; v += step) values.push(clean(v, step));
  return { min: lo, max: hi, step, values };
}

export function logTicks(min: number, max: number) {
  /* 1/2/5 within each decade, not decades alone: a chart spanning 16k to 110k
     would otherwise be given a 10k-to-1M axis, and every body would collapse
     into a few pixels at the top of it. */
  const lo = Math.max(min, 1e-12);
  const hi = Math.max(max, lo * 1.0001);
  const from = Math.floor(Math.log10(lo)) - 1;
  const to = Math.ceil(Math.log10(hi)) + 1;
  const all: number[] = [];
  for (let e = from; e <= to; e += 1) {
    [1, 2, 5].forEach((mult) => all.push(mult * 10 ** e));
  }
  all.sort((a, b) => a - b);
  /* The domain closes on the nearest steps OUTSIDE the data, so the axis is
     labelled at round values without giving away a whole decade of room. */
  const belowList = all.filter((v) => v <= lo);
  const below = belowList.length ? belowList[belowList.length - 1] : all[0];
  const above = all.find((v) => v >= hi) ?? all[all.length - 1];
  return { min: below, max: above, step: 1, values: all.filter((v) => v >= below && v <= above) };
}

/* ─── time ───────────────────────────────────────────────── */
const SEC = 1000, MIN = 60e3, HOUR = 36e5, DAY = 864e5, WEEK = 6048e5;

type TimeUnit = 'ms' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
interface TimeStep { unit: TimeUnit; every: number; span: number }

const TIME_STEPS: TimeStep[] = [
  { unit: 'ms', every: 1, span: 1 },
  { unit: 'ms', every: 10, span: 10 },
  { unit: 'ms', every: 100, span: 100 },
  { unit: 'second', every: 1, span: SEC },
  { unit: 'second', every: 5, span: 5 * SEC },
  { unit: 'second', every: 15, span: 15 * SEC },
  { unit: 'second', every: 30, span: 30 * SEC },
  { unit: 'minute', every: 1, span: MIN },
  { unit: 'minute', every: 5, span: 5 * MIN },
  { unit: 'minute', every: 15, span: 15 * MIN },
  { unit: 'minute', every: 30, span: 30 * MIN },
  { unit: 'hour', every: 1, span: HOUR },
  { unit: 'hour', every: 3, span: 3 * HOUR },
  { unit: 'hour', every: 6, span: 6 * HOUR },
  { unit: 'hour', every: 12, span: 12 * HOUR },
  { unit: 'day', every: 1, span: DAY },
  { unit: 'day', every: 2, span: 2 * DAY },
  { unit: 'day', every: 3, span: 3 * DAY },
  { unit: 'week', every: 1, span: WEEK },
  { unit: 'week', every: 2, span: 2 * WEEK },
  { unit: 'month', every: 1, span: 30 * DAY },
  { unit: 'month', every: 3, span: 91 * DAY },
  { unit: 'year', every: 1, span: 365 * DAY },
];

function startOf(d: Date, unit: TimeUnit): Date {
  const out = new Date(d.getTime());
  /* Truncation walks down the calendar, so DST and uneven months are the
     platform's problem rather than ours. */
  switch (unit) {
    case 'year': out.setMonth(0);          // falls through
    case 'month': out.setDate(1);          // falls through
    case 'week': case 'day': out.setHours(0, 0, 0, 0); break;
    case 'hour': out.setMinutes(0, 0, 0); break;
    case 'minute': out.setSeconds(0, 0); break;
    case 'second': out.setMilliseconds(0); break;
    default: break;
  }
  if (unit === 'week') out.setDate(out.getDate() - out.getDay());
  return out;
}

function advance(d: Date, step: TimeStep): Date {
  const out = new Date(d.getTime());
  switch (step.unit) {
    case 'year': out.setFullYear(out.getFullYear() + step.every); break;
    case 'month': out.setMonth(out.getMonth() + step.every); break;
    case 'week': out.setDate(out.getDate() + 7 * step.every); break;
    case 'day': out.setDate(out.getDate() + step.every); break;
    case 'hour': out.setHours(out.getHours() + step.every); break;
    case 'minute': out.setMinutes(out.getMinutes() + step.every); break;
    case 'second': out.setSeconds(out.getSeconds() + step.every); break;
    default: out.setTime(out.getTime() + step.every); break;
  }
  return out;
}

const TIME_FORMATS: Record<TimeUnit, Intl.DateTimeFormatOptions> = {
  ms: { minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 },
  second: { hour: '2-digit', minute: '2-digit', second: '2-digit' },
  minute: { hour: '2-digit', minute: '2-digit' },
  hour: { hour: '2-digit', minute: '2-digit' },
  day: { month: 'short', day: 'numeric' },
  week: { month: 'short', day: 'numeric' },
  month: { month: 'short' },
  year: { year: 'numeric' },
};

export function timeTicks(min: number, max: number, target = 6) {
  const span = Math.max(1, max - min);

  /**
   * Scored by closeness to the target rather than "first step at least this
   * wide": the table is not uniform — week to month is a 4x jump — and taking
   * the first step over the target drops a two-month axis to a single label.
   * A log ratio treats 3 ticks and 12 as equally wrong either side of 6.
   */
  const candidates: TimeStep[] = [...TIME_STEPS];
  [2, 5, 10, 25, 50, 100].forEach((n) => {
    candidates.push({ unit: 'year', every: n, span: n * 365 * DAY });
  });
  let step = candidates[0];
  let bestScore = Infinity;
  candidates.forEach((c) => {
    const count = span / c.span;
    if (count < 1.2) return;
    const score = Math.abs(Math.log(count / Math.max(1, target)));
    if (score < bestScore) { bestScore = score; step = c; }
  });

  /* Boundaries are walked from the truncated start inclusive, and the domain is
     niced out to them — so a boundary sitting at the domain edge is kept rather
     than discarded for landing a few hours outside it, which is what local-time
     truncation against an epoch domain does. */
  const values: number[] = [];
  let cursor = startOf(new Date(min), step.unit);
  if (step.unit === 'year' && step.every > 1) {
    cursor.setFullYear(Math.floor(cursor.getFullYear() / step.every) * step.every);
  }
  let guard = 0;
  while (cursor.getTime() <= max && guard < 600) {
    values.push(cursor.getTime());
    cursor = advance(cursor, step);
    guard += 1;
  }
  values.push(cursor.getTime());
  return {
    values,
    unit: step.unit,
    options: TIME_FORMATS[step.unit],
    min: values[0],
    max: values[values.length - 1],
  };
}

/* ─── formatting ─────────────────────────────────────────── */
export function numberFormatter(options?: Intl.NumberFormatOptions, locale?: string): TickFormatter {
  const fmt = new Intl.NumberFormat(locale, options);
  return (v) => fmt.format(v);
}
export function compactFormatter(locale?: string): TickFormatter {
  const fmt = new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 });
  return (v) => fmt.format(v);
}
export function timeFormatter(options: Intl.DateTimeFormatOptions, locale?: string): TickFormatter {
  const fmt = new Intl.DateTimeFormat(locale, options);
  return (v) => fmt.format(new Date(v));
}

/* ─── scale construction ─────────────────────────────────── */
export interface ScaleInput {
  spec: AxisSpec;
  range: [number, number];
  /** Numeric extent of the data, ignored by category scales. */
  extent: [number, number];
  categories?: string[];
  includeZero?: boolean;
}

function coerce(v: unknown): number {
  if (v instanceof Date) return v.getTime();
  if (typeof v === 'string') { const t = Date.parse(v); return Number.isNaN(t) ? Number(v) : t; }
  return Number(v);
}

export function createScale(input: ScaleInput): Scale {
  const { spec, range } = input;
  const type = spec.type || (input.categories?.length ? 'category' : 'linear');
  const tickCount = spec.tickCount ?? 6;

  if (type === 'category') {
    const cats = input.categories || [];
    const n = Math.max(1, cats.length);
    const span = range[1] - range[0];
    const band = !!spec.band;
    /* Point scale by default: a line's vertices sit ON the category. Bands are
       requested by the presence of a bar series, and then everything on the axis
       uses band centres so a combo chart stays aligned. */
    const step = band ? span / n : (n > 1 ? span / (n - 1) : 0);
    const offset = band ? step / 2 : 0;
    const map = (i: number) => (spec.reverse
      ? range[1] - (i * step + offset)
      : range[0] + i * step + offset);
    const fmt = typeof spec.format === 'function' ? spec.format : undefined;
    return {
      type, domain: [0, n - 1], range, categories: cats, step: step || span,
      map,
      invert: (px) => {
        if (!step) return 0;
        const raw = spec.reverse ? (range[1] - px) / step : (px - range[0]) / step;
        const i = band ? Math.floor(raw) : Math.round(raw);
        return Math.max(0, Math.min(n - 1, i));
      },
      ticks: cats.map((c, i) => ({ value: i, label: fmt ? fmt(i, i) : c })),
    };
  }

  let lo = spec.min !== undefined ? coerce(spec.min) : input.extent[0];
  let hi = spec.max !== undefined ? coerce(spec.max) : input.extent[1];
  if (!Number.isFinite(lo)) lo = 0;
  if (!Number.isFinite(hi)) hi = 1;

  const wantZero = spec.includeZero ?? input.includeZero ?? false;
  if (wantZero && spec.min === undefined) lo = Math.min(0, lo);
  if (wantZero && spec.max === undefined) hi = Math.max(0, hi);

  if (spec.padding && spec.min === undefined && spec.max === undefined) {
    const pad = (hi - lo) * spec.padding;
    lo -= pad; hi += pad;
  }

  let ticks: Tick[] = [];
  if (type === 'time') {
    const t = timeTicks(lo, hi, tickCount);
    if (spec.nice !== false && spec.min === undefined) lo = t.min;
    if (spec.nice !== false && spec.max === undefined) hi = t.max;
    const fmt = typeof spec.format === 'function' ? spec.format : timeFormatter(t.options, spec.locale);
    ticks = t.values.filter((v) => v >= lo && v <= hi).map((v, i) => ({ value: v, label: fmt(v, i) }));
  } else if (type === 'log') {
    const t = logTicks(lo, hi);
    if (spec.nice !== false) { lo = t.min; hi = t.max; }
    const fmt = typeof spec.format === 'function' ? spec.format
      : numberFormatter(spec.format as Intl.NumberFormatOptions | undefined, spec.locale);
    ticks = t.values.filter((v) => v >= lo && v <= hi).map((v, i) => ({ value: v, label: fmt(v, i) }));
  } else {
    const t = numberTicks(lo, hi, tickCount);
    if (spec.nice !== false) { lo = t.min; hi = t.max; }
    const fmt = typeof spec.format === 'function' ? spec.format
      : numberFormatter(spec.format as Intl.NumberFormatOptions | undefined, spec.locale);
    ticks = t.values.filter((v) => v >= lo - 1e-9 && v <= hi + 1e-9)
      .map((v, i) => ({ value: v, label: fmt(v, i) }));
  }

  const project = type === 'log'
    ? (v: number) => Math.log10(Math.max(v, 1e-12))
    : (v: number) => v;
  const p0 = project(lo);
  const p1 = project(hi);
  const denom = p1 - p0 || 1;
  const [r0, r1] = spec.reverse ? [range[1], range[0]] : [range[0], range[1]];

  return {
    type, domain: [lo, hi], range, categories: [], step: 0,
    map: (v) => r0 + ((project(v) - p0) / denom) * (r1 - r0),
    invert: (px) => {
      const t = (px - r0) / ((r1 - r0) || 1);
      const p = p0 + t * denom;
      return type === 'log' ? 10 ** p : p;
    },
    ticks,
  };
}
