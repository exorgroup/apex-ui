<script setup lang="ts">
/**
 * ApexCalendar — month view (slice 4 of the calendar plan).
 *
 * All the geometry is in `core/calendar`: the zone layer, the month matrix and
 * the row segment packing. This file renders it, and the mirror
 * (`web/apex-ui-calendar.js`) renders the same markup from the same core.
 *
 * Nothing here mutates `events`. Interactions emit payloads, the rule
 * ApexTaskBoard and ApexScheduler follow.
 *
 * The cell layer, the day numbers, the bars and the "+N more" row share ONE
 * column track, so a bar spanning Tue–Thu lines up with those cells instead of
 * being positioned in pixels — which is what makes the grid survive any width.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import ApexIcon from './ApexIcon.vue';
import ApexButton from './ApexButton.vue';
import ApexInput from './ApexInput.vue';
import ApexSelect from './ApexSelect.vue';
import ApexSwitch from './ApexSwitch.vue';
import ApexDatePicker from './ApexDatePicker.vue';
import ApexDialog from './ApexDialog.vue';
import {
  addZonedDays, addZonedMonths, dayKey, dayRange, expandCalendar, layoutBackground,
  checkConstraints, groupByDay, layoutDayColumn, minutesOfDay, monthMatrix, parseDayKey, segmentWeeks,
  shiftResolved, slotAxis, startOfZonedDay, zonedParts,
  type CalendarConstraint, type CalendarEvent, type ConstraintCandidate,
  type ConstraintResult, type DayCell,
  type ResolvedEvent, type Segment, type SegmentedWeek,
} from '../core/calendar';
import { inlineEndDistance, pointerAnchor } from '../core/anchor';
import { resolveApexLocale, toDateLocale, type ApexLocalePack } from '../core/locale';
import {
  applyScope, deleteScope, repeatToRule, ruleToRepeat,
  type RecurrenceOverride, type RecurrenceScope, type RepeatPreset,
} from '../core/recurrence';
import type { ApexCalendarClasses } from '../types';

export interface CalendarTypeMeta {
  label?: string;
  tone?: 'info' | 'success' | 'warn' | 'danger' | 'help' | 'neutral';
}

export type CalendarView = 'month' | 'week' | 'day' | 'list' | 'year';
export type YearLayout = 'grid' | 'stack' | 'continuous';

export interface CalendarResource {
  id: string;
  title?: string;
  [key: string]: unknown;
}

const props = withDefaults(defineProps<{
  /** Your own class on any part. See ApexCalendarClasses. */
  ui?: ApexCalendarClasses;
  view?: CalendarView;
  /** Which views the switcher offers. One view hides it. */
  views?: CalendarView[];
  events?: CalendarEvent[];
  /**
   * Resources as COLUMNS, for the day view.
   *
   * The transpose of ApexScheduler, which puts resources down the side and time
   * across. Only the day view uses them: a week of seven days times N resources
   * is a nested header the grid does not draw, and pretending otherwise would
   * show one resource's bookings under another's column.
   */
  resources?: CalendarResource[];
  /** Tinted regions. Kept separate from `events`: a background event is a
      RENDERING, a constraint is a rule, and an app often wants one without the
      other. */
  backgroundEvents?: CalendarEvent[];
  /** The month shown. Works controlled (bind it) or uncontrolled (pass one). */
  anchor?: Date | number;
  /** An IANA zone. Omitted: the browser's. */
  timeZone?: string;
  /** A locale-pack code, a pack, or an inline override. */
  locale?: string | Partial<ApexLocalePack>;
  /** Overrides the locale's own first day. 0 = Sunday. */
  firstDay?: number;
  /** The app's event types, each mapped to a design-system tone. */
  types?: Record<string, CalendarTypeMeta>;
  /**
   * How an event is PAINTED, not how it is structured.
   *
   * `soft` is a tone-tinted wash with a coloured inline-start edge and dark text;
   * `outline` is a bordered card with an accent rule. Both render the same two
   * lines as `solid`, so the common case of "we want the softer look" needs no
   * template — and therefore does not re-implement the compact rule, the
   * recurring icon, the clipped dashes or the invalid stripes.
   */
  eventVariant?: 'solid' | 'soft' | 'outline';
  /** Lanes drawn before a cell reads "+N more". */
  maxEventsPerDay?: number;
  /** Always six rows, so the grid does not resize as months change. */
  fixedWeeks?: boolean;
  showWeekNumbers?: boolean;
  /** The zone's short offset in the axis corner — "GMT+2". */
  showZoneLabel?: boolean;
  showToolbar?: boolean;
  /** Minutes per slot on the time grid. */
  slotDuration?: number;
  /** Minutes from midnight the grid starts and ends at. */
  slotMinTime?: number;
  slotMaxTime?: number;
  /** Pixels per slot — the axis is a fixed height, not a fraction of the box. */
  slotHeight?: number;
  /** Minutes from midnight the grid scrolls to on open. */
  scrollToTime?: number;
  /** Lanes in the all-day strip before it reports "+N more". */
  maxAllDay?: number;
  /** Days the agenda covers, and the step its nav takes. */
  listDays?: number;
  /**
   * How the twelve months are arranged: wrapped into a grid, one per row, or a
   * single continuous run of weeks.
   */
  yearLayout?: YearLayout;
  /** Drag an event to move it, and click empty space to create one. */
  editable?: boolean;
  /**
   * Render the built-in create/edit dialog. Off, the same gestures report and
   * draw nothing — for a host whose booking form already exists, and whose
   * validation and pricing belong to it rather than to a component.
   */
  inlineEditor?: boolean;
  /** Durations the editor offers, in minutes. */
  durations?: number[];
  /** Drag its trailing edge to change its length. Off with `editable` off. */
  resizable?: boolean;
  /**
   * The id given to the new series when a scoped write splits one.
   * "This and following" produces TWO records; the second needs an id, and only
   * the app knows what its ids look like.
   */
  newId?: (event: ResolvedEvent) => string;
  height?: string;
  /** Row height floor; rows grow past it when a week is busy. */
  rowHeight?: string;
  /**
   * Declarative rules a move or resize must satisfy. Checked before `validate`
   * because they are the cheap half and answer most refusals.
   *
   * Neither this nor `validate` was declared in the source — `constraints` had
   * a default in `withDefaults` for a prop that did not exist, and `validate`
   * was called and never mentioned. Declared at AF2-268.
   */
  constraints?: CalendarConstraint[];
  /**
   * The host's own last word on a candidate. Return `true`/`null` to allow, a
   * string to refuse with a reason, `false` to refuse without one.
   */
  validate?: (cand: ConstraintCandidate) => boolean | string | null | void;
}>(), {
  view: 'month', views: () => ['month', 'week', 'day', 'list', 'year'],
  listDays: 7, yearLayout: 'grid',
  events: () => [], backgroundEvents: () => [], resources: () => [], constraints: () => [],
  types: () => ({}),
  maxEventsPerDay: 3, showToolbar: true, showZoneLabel: true, fixedWeeks: false, showWeekNumbers: false,
  rowHeight: '96px',
  eventVariant: 'solid',
  slotDuration: 30, slotMinTime: 0, slotMaxTime: 1440, slotHeight: 24,
  scrollToTime: 480, maxAllDay: 3, editable: false, resizable: true, inlineEditor: true,
  durations: () => [15, 30, 45, 60, 90, 120, 180, 240],
});

const emit = defineEmits<{
  (e: 'update:anchor', v: Date): void;
  (e: 'update:view', v: CalendarView): void;
  (e: 'range-change', payload: { from: number; to: number; view: CalendarView }): void;
  (e: 'slot-click', payload: {
    start: number; end: number; date: Date; resourceId?: string; originalEvent: MouseEvent;
  }): void;
  (e: 'date-click', payload: { date: Date; key: string; originalEvent: MouseEvent }): void;
  (e: 'event-click', payload: { event: ResolvedEvent; originalEvent: MouseEvent }): void;
  (e: 'more-click', payload: { key: string; events: ResolvedEvent[] }): void;
  /**
   * A drag finished. `update` (and `create`, when the scope split the series)
   * are the records to persist: the split arithmetic is the core's job, not the
   * host's. Emitted separately from `event-resize` because an app routinely
   * permits one and refuses the other.
   */
  (e: 'event-move', payload: EditPayload): void;
  (e: 'event-resize', payload: EditPayload): void;
  /**
   * A gesture was refused. Emitted rather than swallowed: the host owns the
   * telling — a toast, a shake, a silence — and a component that only reverts
   * leaves the author guessing why.
   */
  (e: 'edit-refused', payload: {
    event?: ResolvedEvent; start: number; end: number; resourceId?: string; reason: string;
    constraint?: CalendarConstraint;
  }): void;
  /** A new record, or a scoped write to an existing one. */
  (e: 'event-save', payload: SavePayload): void;
  (e: 'event-delete', payload: DeletePayload): void;
}>();

export interface EditPayload {
  event: ResolvedEvent;
  start: number;
  end: number;
  scope: RecurrenceScope;
  occurrenceStart: number;
  update: Record<string, unknown>;
  create?: Record<string, unknown>;
}

export interface SavePayload {
  id?: string;
  /** Present for a NEW event: the record to insert. */
  record?: Record<string, unknown>;
  scope: RecurrenceScope;
  occurrenceStart?: number;
  update?: Record<string, unknown>;
  create?: Record<string, unknown>;
}
export interface DeletePayload {
  id: string;
  scope: RecurrenceScope;
  occurrenceStart?: number;
  /** Either the record to persist (an EXDATE or a closed series) … */
  update?: Record<string, unknown>;
  /** … or the instruction to drop it entirely. */
  remove?: boolean;
}

const localAnchor = ref<number>(props.anchor == null ? Date.now() : +props.anchor);
watch(() => props.anchor, (v) => { if (v != null) localAnchor.value = +v; });

const localView = ref<CalendarView>(props.view);
watch(() => props.view, (v) => { localView.value = v; });
const selectedKey = ref<string | null>(null);
const gridEl = ref<HTMLElement | null>(null);
const nowMs = ref(Date.now());
let clock: number | undefined;
const pop = ref<{ key: string; events: ResolvedEvent[]; x: number; y: number } | null>(null);

interface DragState {
  mode: 'move' | 'resize';
  event: ResolvedEvent;
  /** Set when the drop landed in another resource's column. */
  resourceId?: string;
  /** Where in the block the grab happened, so it does not jump to the pointer. */
  grabOffset: number;
  start: number;
  end: number;
  moved: boolean;
  invalid?: boolean;
  reason?: string;
  constraint?: CalendarConstraint;
}
let dragState: DragState | null = null;
const draft = ref<{ instanceId: string; start: number; end: number; invalid?: boolean } | null>(null);
/* One prompt for four writes. Move, resize, save and delete all have to answer
   "which occurrences?", and asking it in four places would be four dialogs that
   drift apart. */
type ScopeKind = 'move' | 'resize' | 'save' | 'delete';
const editorError = ref<string | null>(null);
const scopePrompt = ref<{
  kind: ScopeKind; event: ResolvedEvent; patch?: RecurrenceOverride;
  start?: number; end?: number; resourceId?: string; x: number; y: number;
} | null>(null);

interface EditorState {
  id?: string;
  event?: ResolvedEvent;
  title: string;
  type: string;
  allDay: boolean;
  start: Date;
  durMin: number;
  durDays: number;
  repeat: RepeatPreset;
  /** Carried through so a booking created in a resource column belongs to it. */
  resourceId?: string;
}
const editor = ref<EditorState | null>(null);

const loc = computed(() => resolveApexLocale(props.locale));
const firstDay = computed(() => (props.firstDay == null ? loc.value.firstDay : props.firstDay));
const tz = computed(() => props.timeZone);

const isTimeGrid = computed(() => localView.value === 'week' || localView.value === 'day');
const isList = computed(() => localView.value === 'list');
const isYear = computed(() => localView.value === 'year');
const yearOf = computed(() => zonedParts(localAnchor.value, tz.value).year);
const yearBounds = computed(() => ({
  from: parseDayKey(`${yearOf.value}-01-01`, tz.value),
  to: parseDayKey(`${yearOf.value + 1}-01-01`, tz.value),
}));
/* The agenda starts at the anchor's own day rather than the week's, so "next"
   moves a clean N days instead of snapping back to a boundary. */
const listSpan = computed(() => dayRange(localAnchor.value, props.listDays, { tz: tz.value, now: nowMs.value }));
/* week: a run of 7 from the locale's first day; day: the anchor alone. */
const days = computed<DayCell[]>(() => (localView.value === 'day'
  ? dayRange(localAnchor.value, 1, { tz: tz.value, now: nowMs.value })
  : dayRange(localAnchor.value, 7, { tz: tz.value, firstDay: firstDay.value, now: nowMs.value })));
const axis = computed(() => slotAxis({
  minTime: props.slotMinTime, maxTime: props.slotMaxTime, slotDuration: props.slotDuration,
}));
const axisHeight = computed(() => axis.value.slots.length * props.slotHeight);

const weeks = computed(() => monthMatrix(localAnchor.value, {
  tz: tz.value, firstDay: firstDay.value, fixedWeeks: props.fixedWeeks,
}));
const range = computed(() => {
  if (isYear.value) return yearBounds.value;
  const list = isList.value ? listSpan.value
    : (isTimeGrid.value ? days.value : weeks.value.flatMap((w) => w.days));
  const last = list[list.length - 1];
  return { from: list[0].start, to: last.start + last.hours * 3600000 };
});
const resolved = computed(() => expandCalendar(props.events, range.value.from, range.value.to, tz.value));
const backgrounds = computed(() => expandCalendar(
  props.backgroundEvents.map((e) => ({ ...e, background: true })),
  range.value.from, range.value.to, tz.value,
));
/* The drag preview is ONE substitution into the resolved list, so every layout
   below re-flows from it — including the overlap columns, which is the point:
   dragging a booking onto another shows both of them narrowing. */
const displayed = computed<ResolvedEvent[]>(() => {
  const d = draft.value;
  if (!d) return resolved.value;
  return resolved.value.map((e) => (e.instanceId === d.instanceId
    ? shiftResolved(e, d.start, d.end, tz.value) : e));
});

const rows = computed<SegmentedWeek[]>(() => segmentWeeks(displayed.value, weeks.value, {
  maxPerDay: props.maxEventsPerDay,
}));
/* Background spans are segmented too — a tinted region crossing a row boundary
   has the same two-piece problem a bar does. */
const bgRows = computed(() => segmentWeeks(backgrounds.value, weeks.value, { includeBackground: true }));

/* The all-day strip IS a one-row month matrix, so the same segment packing draws
   it — a second implementation would drift on exactly the multi-day case it
   exists for. */
const allDayRow = computed<SegmentedWeek>(() => segmentWeeks(
  displayed.value.filter((e) => e.allDay || e.dayCount > 1),
  [{ days: days.value, start: days.value[0].start }],
  { maxPerDay: props.maxAllDay },
)[0]);

/* Resources replace the day columns, in the day view only. */
const isResourceGrid = computed(() => localView.value === 'day' && props.resources.length > 0);

const resourceColumns = computed(() => {
  const day = days.value[0];
  return props.resources.map((r) => ({
    resource: r,
    day,
    /* Filtered per resource rather than laid out once and split: the overlap
       columns must be computed WITHIN a resource, or two bookings in different
       rooms would divide a width they do not share. */
    blocks: layoutDayColumn(displayed.value.filter((e) => e.resourceId === r.id), day, axis.value, tz.value),
    tints: layoutBackground(
      backgrounds.value.filter((e) => !e.resourceId || e.resourceId === r.id), day, axis.value, tz.value,
    ),
    allDay: displayed.value.filter((e) => (e.allDay || e.dayCount > 1)
      && e.resourceId === r.id && e.end > day.start && e.start < day.start + day.hours * 3600000),
  }));
});

const columns = computed(() => days.value.map((day) => ({
  day,
  blocks: layoutDayColumn(displayed.value, day, axis.value, tz.value),
  tints: layoutBackground(backgrounds.value, day, axis.value, tz.value),
})));

/* Only when now is inside a visible day AND inside the axis window: a line
   pinned to the top edge because the window starts at 08:00 is a lie. */
const nowLine = computed(() => {
  if (!isTimeGrid.value) return null;
  const key = dayKey(nowMs.value, tz.value);
  const index = days.value.findIndex((d) => d.key === key);
  if (index < 0) return null;
  const minutes = minutesOfDay(nowMs.value, tz.value);
  if (minutes < axis.value.minTime || minutes > axis.value.maxTime) return null;
  return { index, top: (minutes - axis.value.minTime) / axis.value.span };
});

/* Twelve month matrices, each segmented by the SAME packer the month view uses.
   A year view is the month view at a smaller scale, so it must not be a second
   implementation of bars-in-a-row: the "+N more" arithmetic and the lane order
   are exactly the things that would drift. */
const yearMonths = computed(() => {
  if (!isYear.value) return [];
  const y = yearOf.value;
  return Array.from({ length: 12 }, (_, m) => {
    const anchorMs = parseDayKey(`${y}-${String(m + 1).padStart(2, '0')}-01`, tz.value);
    const weeksOfMonth = monthMatrix(anchorMs, {
      tz: tz.value, firstDay: firstDay.value, now: nowMs.value,
    });
    return {
      month: m,
      label: loc.value.fmt(anchorMs, { month: 'long', timeZone: tz.value }),
      rows: segmentWeeks(displayed.value, weeksOfMonth, { maxPerDay: props.yearLayout === 'grid' ? 1 : 2 }),
    };
  });
});

const listGroups = computed(() => (isList.value
  ? groupByDay(displayed.value, range.value.from, range.value.to, tz.value)
  : []));

const weekdays = computed(() => {
  const names = loc.value.names.daysShort;
  const out: string[] = [];
  for (let i = 0; i < 7; i += 1) out.push(names[(i + firstDay.value) % 7]);
  return out;
});
const title = computed(() => {
  const f = (ms: number, o: Intl.DateTimeFormatOptions) => loc.value.fmt(ms, { ...o, timeZone: tz.value });
  if (localView.value === 'day') {
    return f(days.value[0].start, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  if (localView.value === 'week' || localView.value === 'list') {
    const span = localView.value === 'list' ? listSpan.value : days.value;
    const a = span[0];
    const b = span[span.length - 1];
    /* The month and year are said ONCE unless the week straddles them — "6 – 12
       September 2026", not "6 September 2026 – 12 September 2026". */
    const sameMonth = a.month === b.month && a.year === b.year;
    return sameMonth
      ? `${loc.value.num(a.dayOfMonth)} – ${f(b.start, { day: 'numeric', month: 'long', year: 'numeric' })}`
      : `${f(a.start, { day: 'numeric', month: 'short' })} – ${f(b.start, { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }
  if (localView.value === 'year') return f(yearBounds.value.from, { year: 'numeric' });
  return f(localAnchor.value, { month: 'long', year: 'numeric' });
});
/**
 * The zone, as a short offset — "GMT+2".
 *
 * The axis corner was empty, and a component that answers every date question
 * through an IANA zone should name the one it used: two viewers of the same data
 * in different zones otherwise see different grids with nothing to explain it.
 * Formatted by Intl rather than derived, so it is localised and DST-correct.
 */
const zoneLabel = computed(() => {
  try {
    const parts = new Intl.DateTimeFormat(loc.value.code, {
      timeZone: tz.value, timeZoneName: 'shortOffset',
    }).formatToParts(new Date(localAnchor.value));
    return parts.find((p) => p.type === 'timeZoneName')?.value || '';
  } catch { return ''; }
});

const ticks = computed(() => axis.value.slots.filter((sl) => sl.major).map((sl) => ({
  minutes: sl.minutes,
  top: ((sl.minutes - axis.value.minTime) / axis.value.span) * axisHeight.value,
  label: loc.value.fmt(days.value[0].start + sl.minutes * 60000, loc.value.hour12
    ? { hour: 'numeric', hour12: true, timeZone: tz.value }
    : { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz.value }),
})));
/* The slot lines are PAINTED, not drawn: one background per column instead of
   48 empty divs behind every day. */
const columnBackground = computed(() => {
  const slot = props.slotHeight;
  return `repeating-linear-gradient(180deg, var(--border-subtle) 0 1px, transparent 1px ${slot}px), `
    + `repeating-linear-gradient(180deg, var(--border-default) 0 1px, transparent 1px ${slot * Math.max(1, Math.round(60 / props.slotDuration))}px)`;
});
const rootStyle = computed(() => ({
  '--apex-cal-row': props.rowHeight,
  blockSize: props.height,
}));

function meta(type?: string) { return (type && props.types[type]) || {}; }
function tone(ev: ResolvedEvent) { return meta(ev.type).tone || 'info'; }
function timeLabel(ev: ResolvedEvent) {
  return loc.value.fmt(ev.start, {
    hour: 'numeric', minute: '2-digit', hour12: loc.value.hour12, timeZone: tz.value,
  });
}
/** A bar for anything spanning days or marked all-day; a dot for a moment. */
function isBar(ev: ResolvedEvent) { return ev.allDay || ev.dayCount > 1; }
function drawn(row: SegmentedWeek) { return row.segments.filter((s) => !s.hidden); }
function laneStyle(seg: Segment, offset: number) {
  return { gridColumn: `${seg.col + 1 + offset} / span ${seg.span}`, gridRow: String(seg.lane + 1) };
}
function cellStyle(index: number, offset: number) {
  return { gridColumn: String(index + 1 + offset), gridRow: '1' };
}
function weekNumberOf(week: { days: DayCell[] }) {
  /* Read from the day the locale considers the week to start on, so an ISO week
     number is not taken from a Sunday that belongs to the previous one. */
  return loc.value.num(loc.value.weekNumber(new Date(week.days[0].start)));
}

/** Two lines need about 34px; under that the block shows the title alone. */
/**
 * "Compact" has ONE definition — under two lines' worth of height — and three
 * places need it, so the threshold and the lane heights are named here rather
 * than restated.
 *
 * `LANE_H` and `MINI_LANE_H` must match `--apex-cal-lane` in the stylesheet. They are
 * both already under the threshold, so a bar is always compact; naming them keeps
 * that a DERIVATION rather than a `true` that would silently contradict
 * `blockCompact` if a lane were ever raised.
 */
const COMPACT_MIN = 34;
const LANE_H = 22;
const MINI_LANE_H = 13;
const BAR_COMPACT = LANE_H < COMPACT_MIN;
const MINI_BAR_COMPACT = MINI_LANE_H < COMPACT_MIN;

/**
 * The `#event` slot's bindings, declared ONCE.
 *
* Every site that renders event content goes through this — including the row
 * inside the "+N more" popover, which was missed once because this comment used
 * to ENUMERATE the sites, and the enumeration drifted the moment a new one
 * appeared. Do not count them here: route new event content through `eventCtx`
 * and the count stops mattering.
 *
 * The bindings are declared once because a site binding one fewer prop would be
 * invisible — the parity check unions bindings per slot name, so a gap at one
 * site is hidden by the others.
 *
 * Bound are the facts a host cannot derive: geometry state (`compact`,
 * `clipped`), the resolved tone, the view it is being drawn in, and the
 * locale-formatted time so a template does not re-derive it.
 */
function eventCtx(event: ResolvedEvent, over: {
  compact?: boolean; clippedStart?: boolean; clippedEnd?: boolean; view?: CalendarView;
} = {}) {
  return {
    event,
    compact: !!over.compact,
    clipped: { start: !!over.clippedStart, end: !!over.clippedEnd },
    tone: tone(event),
    view: over.view || localView.value,
    time: event.allDay ? loc.value.t('allDay') : blockTime(event),
  };
}

/**
 * The `#day-cell` slot's bindings, declared once for the same reason `eventCtx`
 * is: two sites render a day number, and a host adding a badge or a daily total
 * needs the day's own facts plus how many events it holds.
 */
function dayCtx(day: DayCell, row: SegmentedWeek, view?: CalendarView) {
  return {
    day,
    number: loc.value.num(day.dayOfMonth),
    today: day.today,
    outside: !day.inMonth,
    hidden: row.hiddenCounts[day.key] || 0,
    events: row.segments.filter((sg) => sg.event.startKey === day.key).map((sg) => sg.event),
    view: view || localView.value,
  };
}

function blockCompact(b: { height: number }) {
  return Math.max(16, b.height * axisHeight.value) < COMPACT_MIN;
}
function blockStyle(b: { top: number; height: number; left: number; width: number }) {
  return {
    insetBlockStart: `${b.top * axisHeight.value}px`,
    /* A floor of 16px: a 15-minute booking on a 24px slot would otherwise be four
       pixels tall and unreadable, and unclickable with it. */
    blockSize: `${Math.max(16, b.height * axisHeight.value)}px`,
    insetInlineStart: `calc(${b.left * 100}% + 1px)`,
    inlineSize: `calc(${b.width * 100}% - 3px)`,
  };
}
function tintStyle(t: { top: number; height: number }) {
  return {
    insetBlockStart: `${t.top * axisHeight.value}px`,
    blockSize: `${t.height * axisHeight.value}px`,
  };
}
function blockTime(ev: ResolvedEvent) {
  const f = (ms: number) => loc.value.fmt(ms, {
    hour: 'numeric', minute: '2-digit', hour12: loc.value.hour12, timeZone: tz.value,
  });
  return `${f(ev.start)} – ${f(ev.end)}`;
}
function groupHead(group: { start: number }) {
  return {
    weekday: loc.value.fmt(group.start, { weekday: 'long', timeZone: tz.value }),
    date: loc.value.fmt(group.start, { day: 'numeric', month: 'long', year: 'numeric', timeZone: tz.value }),
  };
}
/** An all-day entry has no time to show, and a dash would imply one. */
function listTime(ev: ResolvedEvent) {
  return ev.allDay ? loc.value.t('allDay') : blockTime(ev);
}
function dayHead(day: DayCell) {
  return {
    weekday: loc.value.names.daysShort[day.weekday],
    number: loc.value.num(day.dayOfMonth),
  };
}
/* ─── editing gestures ───────────────────────────────────────────
   One pointer session for both views. What differs is GRANULARITY: the time grid
   snaps to `slotDuration` and reads the column under the pointer; the month grid
   snaps to whole days. Both end in the same scoped write. */

const snapMinutes = (m: number) => Math.round(m / props.slotDuration) * props.slotDuration;

/** The day cell or time column under the pointer, whichever view is showing. */
function targetDay(e: PointerEvent): { day: DayCell; minutes: number; resourceId?: string } | null {
  const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
  const host = el?.closest('[data-day-key]') as HTMLElement | null;
  if (!host) return null;
  const key = host.getAttribute('data-day-key');
  const list = isTimeGrid.value ? days.value : weeks.value.flatMap((w) => w.days);
  const day = list.find((d) => d.key === key);
  if (!day) return null;
  const resourceId = host.getAttribute('data-resource-id') || undefined;
  if (!isTimeGrid.value) return { day, minutes: 0, resourceId };
  const box = host.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (e.clientY - box.top) / box.height));
  return { day, minutes: axis.value.minTime + ratio * axis.value.span, resourceId };
}

/**
 * Move or resize, decided by where in the block the pointer landed.
 *
 * A zone rather than a handle element: a 7px child on every event is a lot of
 * DOM for something only the pointer ever finds, and the CSS `::after` already
 * carries the cursor.
 */
function edgeMode(e: PointerEvent, axisName: 'x' | 'y'): 'move' | 'resize' {
  const el = e.currentTarget as HTMLElement;
  /* On a month bar the trailing edge is the INLINE-end one, which is on the left
     in RTL — `rect.right` would put the resize zone on the bar's start. */
  const near = axisName === 'y'
    ? el.getBoundingClientRect().bottom - e.clientY
    : inlineEndDistance(el, e.clientX);
  return near <= 7 ? 'resize' : 'move';
}

function onEventDown(e: PointerEvent, ev: ResolvedEvent, mode: 'move' | 'resize') {
  if (!props.editable || (mode === 'resize' && !props.resizable)) return;
  if (e.button !== 0) return;
  e.preventDefault();
  e.stopPropagation();
  const hit = targetDay(e);
  dragState = {
    mode,
    event: ev,
    /* Where in the event the grab happened, so it does not jump to the pointer. */
    grabOffset: hit && isTimeGrid.value
      ? hit.minutes - minutesOfDay(ev.start, tz.value)
      : (hit ? hit.day.start - startOfZonedDay(ev.start, tz.value) : 0),
    start: ev.start,
    end: ev.end,
    moved: false,
  };
  /* Set now rather than on the first move: the CSS it enables is what lets the
     first move see the cell under the pointer at all. */
  document.body.dataset.calDragging = mode;
  window.addEventListener('pointermove', onDragMove);
  window.addEventListener('pointerup', onDragUp);
}

function onDragMove(e: PointerEvent) {
  const d = dragState;
  if (!d) return;
  const hit = targetDay(e);
  if (!hit) return;
  const duration = d.event.end - d.event.start;
  if (isTimeGrid.value) {
    if (d.mode === 'move') {
      const minutes = snapMinutes(hit.minutes - d.grabOffset);
      d.start = hit.day.start + minutes * 60000;
      d.end = d.start + duration;
    } else {
      const minutes = snapMinutes(hit.minutes);
      /* A floor of one slot: a resize that could reach zero length would let a
         booking vanish from a gesture meant to shorten it. */
      d.end = Math.max(d.start + props.slotDuration * 60000, hit.day.start + minutes * 60000);
    }
  } else {
    const shift = hit.day.start - d.grabOffset - startOfZonedDay(d.event.start, tz.value);
    if (d.mode === 'move') {
      /* Whole days, and the time of day is carried across untouched — dropping a
         14:00 meeting on Thursday means Thursday at 14:00. */
      d.start = d.event.start + shift;
      d.end = d.event.end + shift;
    } else {
      const dayEnd = hit.day.start + hit.day.hours * 3600000;
      d.end = Math.max(startOfZonedDay(d.start, tz.value) + 60000, dayEnd);
    }
  }
  /* Dragging across resource columns REASSIGNS the booking, which is the whole
     point of the transpose: "move this to Room B" is one gesture. */
  if (d.mode === 'move' && hit.resourceId && hit.resourceId !== d.event.resourceId) {
    d.resourceId = hit.resourceId;
    d.moved = true;
  }
  if (d.start !== d.event.start || d.end !== d.event.end) d.moved = true;
  /* Checked DURING the drag, not only on drop: an author should see the position
     refuse before letting go, which is the difference between a rule and a
     surprise. */
  const verdict = permits({
    start: d.start, end: d.end, allDay: d.event.allDay,
    resourceId: d.resourceId || d.event.resourceId, type: d.event.type,
    id: d.event.id, event: d.event,
  });
  d.invalid = !verdict.ok;
  d.reason = verdict.reason;
  d.constraint = verdict.constraint;
  draft.value = { instanceId: d.event.instanceId, start: d.start, end: d.end, invalid: !verdict.ok };
}

function onDragUp(e: PointerEvent) {
  window.removeEventListener('pointermove', onDragMove);
  window.removeEventListener('pointerup', onDragUp);
  const d = dragState;
  dragState = null;
  delete document.body.dataset.calDragging;
  if (!d) return;
  if (!d.moved) { draft.value = null; return; }
  /* A refused drop reverts and SAYS SO. Reverting silently is how an author
     concludes the drag is broken rather than disallowed. */
  if (d.invalid) {
    draft.value = null;
    emit('edit-refused', {
      event: d.event, start: d.start, end: d.end,
      resourceId: d.resourceId || d.event.resourceId,
      reason: d.reason || 'not allowed', constraint: d.constraint,
    });
    return;
  }
  /* A recurring occurrence cannot be moved without answering WHICH occurrences
     the move applies to, so the gesture pauses on that question rather than
     guessing. The preview stays on screen while the author decides. */
  if (d.event.recurring) {
    scopePrompt.value = {
      kind: d.mode, event: d.event, start: d.start, end: d.end,
      resourceId: d.resourceId, x: e.clientX, y: e.clientY,
    };
    return;
  }
  commit(d.mode, d.event, d.start, d.end, 'all', d.resourceId);
}

/**
 * Declarative constraints, then `validate`, in that order.
 *
 * The declarative pass runs first because it is the cheap one and answers most
 * refusals; `validate` gets the last word, since only the host can express a rule
 * about the rest of its own data.
 */
function permits(cand: ConstraintCandidate & { event?: ResolvedEvent }): ConstraintResult {
  const res = checkConstraints(props.constraints, cand, tz.value);
  if (!res.ok) return res;
  if (!props.validate) return { ok: true };
  const v = props.validate(cand);
  if (v === true || v == null) return { ok: true };
  return { ok: false, reason: typeof v === 'string' ? v : 'not allowed' };
}

/** The patch, in the shape the stored record uses — dates for an all-day event. */
function patchFor(ev: ResolvedEvent, start: number, end: number): RecurrenceOverride {
  if (!ev.allDay) return { start, end };
  return {
    start,
    end,
    startDate: dayKey(start, tz.value),
    endDate: dayKey(end - 1, tz.value),
  } as RecurrenceOverride;
}

function commit(
  mode: 'move' | 'resize', ev: ResolvedEvent, start: number, end: number,
  scope: RecurrenceScope, resourceId?: string,
) {
  const patch = patchFor(ev, start, end);
  if (resourceId) patch.resourceId = resourceId;
  const source = ev.source as unknown as Record<string, unknown> & { start: number; end: number };
  const written = applyScope(
    { ...source, start: ev.allDay ? ev.start : source.start, end: ev.allDay ? ev.end : source.end },
    ev.originalStart, scope, patch,
    props.newId ? props.newId(ev) : `${ev.id}-${Date.now().toString(36)}`,
  );
  draft.value = null;
  scopePrompt.value = null;
  /* Two calls rather than a ternary event name: `emit(cond ? 'a' : 'b', p)`
     cannot resolve against a typed emits declaration (TS2769). */
  const payload = {
    event: ev, start, end, scope, occurrenceStart: ev.originalStart,
    update: written.update as unknown as Record<string, unknown>,
    create: written.create as unknown as Record<string, unknown> | undefined,
  };
  if (mode === 'move') emit('event-move', payload);
  else emit('event-resize', payload);
}

function chooseScope(scope: RecurrenceScope) {
  const p = scopePrompt.value;
  if (!p) return;
  if (p.kind === 'move' || p.kind === 'resize') {
    commit(p.kind, p.event, p.start as number, p.end as number, scope, p.resourceId);
    return;
  }
  if (p.kind === 'delete') { commitDelete(p.event, scope); return; }
  commitSave(p.event, p.patch as RecurrenceOverride, scope);
}

/** The source record with an all-day event's derived instants filled in. */
function sourceOf(ev: ResolvedEvent) {
  const source = ev.source as unknown as Record<string, unknown> & { start: number; end: number };
  return { ...source, start: ev.allDay ? ev.start : source.start, end: ev.allDay ? ev.end : source.end };
}

function commitSave(ev: ResolvedEvent, patch: RecurrenceOverride, scope: RecurrenceScope) {
  const written = applyScope(
    sourceOf(ev), ev.originalStart, scope, patch,
    props.newId ? props.newId(ev) : `${ev.id}-${Date.now().toString(36)}`,
  );
  scopePrompt.value = null;
  editor.value = null;
  emit('event-save', {
    id: ev.id, scope, occurrenceStart: ev.originalStart,
    update: written.update as unknown as Record<string, unknown>,
    create: written.create as unknown as Record<string, unknown> | undefined,
  });
}

function commitDelete(ev: ResolvedEvent, scope: RecurrenceScope) {
  const written = deleteScope(sourceOf(ev), ev.originalStart, scope);
  scopePrompt.value = null;
  editor.value = null;
  emit('event-delete', {
    id: ev.id, scope, occurrenceStart: ev.originalStart,
    update: written.update as unknown as Record<string, unknown> | undefined,
    remove: written.remove,
  });
}
function cancelScope() {
  scopePrompt.value = null;
  draft.value = null;
}
/**
 * The three write scopes as DATA, so the prompt's markup does not restate them
 * and a host template can render them its own way without knowing the scope
 * strings. The same shape ApexScheduler exposes — one question asked in two
 * places, so one definition of its options.
 */
const scopeOptions = computed(() => [
  { scope: 'this' as RecurrenceScope, label: loc.value.t('scopeThis') },
  { scope: 'following' as RecurrenceScope, label: loc.value.t('scopeFollowing') },
  { scope: 'all' as RecurrenceScope, label: loc.value.t('scopeAll') },
]);

const scopeStyle = computed(() => {
  const p = scopePrompt.value;
  return p ? pointerAnchor(p.x, p.y, 270, 230) : {};
});

/* ─── the create / edit dialog ───────────────────────────────────*/

const typeOptions = computed(() => Object.keys(props.types).map((k) => ({
  label: props.types[k].label || k, value: k,
})));
const durationOptions = computed(() => props.durations.map((d) => ({
  label: d < 60 ? `${loc.value.num(d)} min` : `${loc.value.num(d / 60)} hr${d >= 120 ? 's' : ''}`,
  value: d,
})));
const dayOptions = computed(() => [1, 2, 3, 4, 5, 7, 14].map((d) => ({
  label: `${loc.value.num(d)} ${loc.value.t(d === 1 ? 'day' : 'week').toLowerCase()}`.replace(/\s+$/, ''),
  value: d,
})));
const repeatOptions = computed(() => ([
  { label: loc.value.t('repeatNone'), value: 'none' },
  { label: loc.value.t('repeatDaily'), value: 'daily' },
  { label: loc.value.t('repeatWeekdays'), value: 'weekdays' },
  { label: loc.value.t('repeatWeekly'), value: 'weekly' },
  { label: loc.value.t('repeatMonthly'), value: 'monthly' },
]));

function openCreate(start: number, end?: number, allDay = false, resourceId?: string) {
  editorError.value = null;
  const durMin = end ? Math.max(15, Math.round((end - start) / 60000)) : 60;
  editor.value = {
    title: '', type: typeOptions.value[0]?.value || 'event', allDay,
    start: new Date(start), durMin, durDays: 1, repeat: 'none', resourceId,
  };
}
function openEdit(ev: ResolvedEvent) {
  editor.value = {
    id: ev.id,
    event: ev,
    title: ev.title,
    type: ev.type || typeOptions.value[0]?.value || 'event',
    allDay: ev.allDay,
    /* The OCCURRENCE's own start, because that is what the author clicked — the
       scope prompt is what decides whether editing it touches the series. */
    start: new Date(ev.start),
    durMin: Math.max(15, Math.round((ev.end - ev.start) / 60000)),
    durDays: ev.dayCount,
    repeat: ruleToRepeat((ev.source as { rrule?: string | null }).rrule),
    resourceId: ev.resourceId,
  };
}

/** The stored shape: dates for an all-day event, instants for a timed one. */
function editorPatch(ed: EditorState): RecurrenceOverride {
  const start = ed.start.getTime();
  if (ed.allDay) {
    const startKey = dayKey(start, tz.value);
    /* The core's own parser, in the DISPLAY zone. A local-time reimplementation
       drifted a day for any zone behind the browser's, which is precisely the
       "an all-day event is a DATE and is never zone-shifted" rule. */
    const from = parseDayKey(startKey, tz.value);
    const end = addZonedDays(from, ed.durDays, tz.value);
    return { start: from, end, startDate: startKey, endDate: dayKey(end - 1, tz.value) } as RecurrenceOverride;
  }
  return { start, end: start + ed.durMin * 60000 };
}

function saveEditor() {
  const ed = editor.value;
  if (!ed) return;
  const patch = editorPatch(ed);
  const rrule = repeatToRule(ed.repeat, patch.start as number);
  /* Checked BEFORE the dialog closes, and reported in it: refusing after the
     dialog has gone leaves nothing to correct. */
  const verdict = permits({
    start: patch.start as number, end: patch.end as number, allDay: ed.allDay,
    resourceId: ed.resourceId, type: ed.type, id: ed.event?.id, event: ed.event,
  });
  if (!verdict.ok) {
    editorError.value = verdict.reason || 'not allowed';
    emit('edit-refused', {
      event: ed.event, start: patch.start as number, end: patch.end as number,
      resourceId: ed.resourceId, reason: editorError.value, constraint: verdict.constraint,
    });
    return;
  }
  editorError.value = null;
  if (!ed.event) {
    /* A new record, not a patch: the app inserts it and owns its id. */
    const base: Record<string, unknown> = {
      id: props.newId ? props.newId({ id: 'new' } as ResolvedEvent) : `cal-${Date.now().toString(36)}`,
      title: ed.title || (props.types[ed.type]?.label || ed.type),
      type: ed.type, rrule,
    };
    if (ed.allDay) Object.assign(base, { allDay: true, startDate: patch.startDate, endDate: patch.endDate });
    else Object.assign(base, { start: patch.start, end: patch.end });
    if (ed.resourceId) base.resourceId = ed.resourceId;
    editor.value = null;
    emit('event-save', { scope: 'all', record: base });
    return;
  }
  const full = { ...patch, title: ed.title, type: ed.type } as RecurrenceOverride;
  /* A repeat change is a change to the SERIES by definition, so it never goes
     through the per-occurrence scopes — an override cannot hold a rule. */
  const ruleChanged = ruleToRepeat((ed.event.source as { rrule?: string | null }).rrule) !== ed.repeat;
  if (ed.event.recurring && !ruleChanged) {
    scopePrompt.value = {
      kind: 'save', event: ed.event, patch: full,
      x: window.innerWidth / 2 - 140, y: window.innerHeight / 2 - 110,
    };
    return;
  }
  commitSave(ed.event, { ...full, rrule } as RecurrenceOverride, 'all');
}

function deleteEditor() {
  const ed = editor.value;
  if (!ed || !ed.event) { editor.value = null; return; }
  if (ed.event.recurring) {
    scopePrompt.value = {
      kind: 'delete', event: ed.event,
      x: window.innerWidth / 2 - 140, y: window.innerHeight / 2 - 110,
    };
    return;
  }
  commitDelete(ed.event, 'all');
}
function onEditorVisible(v: boolean) { if (!v) editor.value = null; }

function setView(v: CalendarView) {
  localView.value = v;
  emit('update:view', v);
}
/** A click on empty grid resolves to the slot under the pointer. */
function onColumn(day: DayCell, e: MouseEvent, resourceId?: string) {
  const box = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (e.clientY - box.top) / box.height));
  const raw = axis.value.minTime + ratio * axis.value.span;
  const snapped = Math.floor(raw / props.slotDuration) * props.slotDuration;
  const start = day.start + snapped * 60000;
  const end = start + props.slotDuration * 60000;
  emit('slot-click', { start, end, date: new Date(start), resourceId, originalEvent: e });
  if (props.editable && props.inlineEditor) openCreate(start, end, false, resourceId);
}
function step(dir: number) {
  /* A view steps by its own unit: a month view by months, a week by seven
     calendar days, a day by one — and days, not 24-hour blocks. */
  const days = localView.value === 'week' ? 7
    : (localView.value === 'list' ? props.listDays : 1);
  if (localView.value === 'month' || localView.value === 'year') {
    localAnchor.value = addZonedMonths(localAnchor.value, dir * (localView.value === 'year' ? 12 : 1), tz.value);
  } else localAnchor.value = addZonedDays(localAnchor.value, dir * days, tz.value);
  emit('update:anchor', new Date(localAnchor.value));
}
function goToday() {
  localAnchor.value = Date.now();
  emit('update:anchor', new Date(localAnchor.value));
}
function onCell(day: DayCell, e: MouseEvent) {
  selectedKey.value = day.key;
  emit('date-click', { date: new Date(day.start), key: day.key, originalEvent: e });
  /* A month cell has no time, so a new booking starts at 09:00 rather than
     midnight — the same reasoning as the scheduler's midday guess, moved to the
     start of a working day because a calendar cell reads as "this day". */
  if (props.editable && props.inlineEditor) openCreate(day.start + 9 * 3600000);
}
function onEvent(ev: ResolvedEvent, e: MouseEvent) {
  e.stopPropagation();
  emit('event-click', { event: ev, originalEvent: e });
  if (props.editable && props.inlineEditor) openEdit(ev);
}
function onMore(key: string, events: ResolvedEvent[], e: MouseEvent) {
  e.stopPropagation();
  emit('more-click', { key, events });
  pop.value = { key, events, x: e.clientX, y: e.clientY };
}
const popStyle = computed(() => {
  const p = pop.value;
  return p ? pointerAnchor(p.x, p.y, 260, 320) : {};
});
function closePop() { pop.value = null; }
function popTitle() {
  const p = pop.value;
  if (!p) return '';
  return loc.value.fmt(startOfZonedDay(p.events[0]?.start ?? Date.now(), tz.value), {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: tz.value,
  });
}
function onKey(e: KeyboardEvent) {
  if (e.key !== 'Escape') return;
  pop.value = null;
  if (scopePrompt.value) cancelScope();
}

watch(range, (r) => emit('range-change', { from: r.from, to: r.to, view: localView.value }), { immediate: true });
/* Scrolled to the working day rather than to midnight, and re-scrolled when the
   view or the window changes — nobody opens a week view to look at 03:00. */
watch([isTimeGrid, () => props.scrollToTime, axisHeight], () => {
  nextTick(() => {
    const el = gridEl.value;
    if (!el || !isTimeGrid.value) return;
    const ratio = (props.scrollToTime - axis.value.minTime) / axis.value.span;
    el.scrollTop = Math.max(0, ratio * axisHeight.value);
  });
}, { immediate: true });

onMounted(() => {
  window.addEventListener('keydown', onKey);
  clock = window.setInterval(() => { nowMs.value = Date.now(); }, 60000);
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey);
  window.removeEventListener('pointermove', onDragMove);
  window.removeEventListener('pointerup', onDragUp);
  if (clock) window.clearInterval(clock);
  delete document.body.dataset.calDragging;
});

defineExpose({ step, goToday, setView, dayKeyAt: (ms: number) => dayKey(ms, tz.value) });
</script>

<template>
  <div class="apex-calendar" :class="ui?.root" :style="rootStyle" :dir="loc.rtl ? 'rtl' : undefined"
       :data-variant="eventVariant === 'solid' ? undefined : eventVariant"
       :data-week-numbers="showWeekNumbers ? 'true' : 'false'">
    <div v-if="showToolbar" class="apex-calendar__bar" :class="ui?.bar">
      <slot name="toolbar-start" :view="localView" :anchor="new Date(localAnchor)" />
      <div class="apex-calendar__nav" :class="ui?.nav">
        <button type="button" :aria-label="loc.t('previous')" @click="step(-1)">
          <ApexIcon :name="loc.rtl ? 'chevron_right' : 'chevron_left'" :size="18" />
        </button>
        <button type="button" data-today="true" @click="goToday">{{ loc.t('today') }}</button>
        <button type="button" :aria-label="loc.t('next')" @click="step(1)">
          <ApexIcon :name="loc.rtl ? 'chevron_left' : 'chevron_right'" :size="18" />
        </button>
      </div>
      <div class="apex-calendar__title" :class="ui?.title">{{ title }}</div>
      <div class="apex-calendar__spacer" :class="ui?.spacer"></div>
      <div v-if="views.length > 1" class="apex-calendar__views" :class="ui?.views" role="group">
        <button v-for="v in views" :key="v" type="button" :aria-pressed="localView === v"
                @click="setView(v)">{{ loc.t(v) }}</button>
      </div>
      <slot name="toolbar-end" />
    </div>

    <div v-if="localView === 'month'" class="apex-calendar__body" :class="ui?.body">
      <div class="apex-calendar__head" :class="ui?.head">
        <div v-if="showWeekNumbers" class="apex-calendar__wd" :class="ui?.weekday"></div>
        <div v-for="(w, i) in weekdays" :key="i" class="apex-calendar__wd" :class="ui?.weekday">
          <slot name="day-header" :label="w" :weekday="(i + firstDay) % 7" :index="i" :view="localView">{{ w }}</slot>
        </div>
      </div>
      <div v-for="(row, ri) in rows" :key="ri" class="apex-calendar__row" :class="ui?.row">
        <div class="apex-calendar__cells" :class="ui?.cells">
          <div v-if="showWeekNumbers" class="apex-calendar__weekno" :class="ui?.weekNumber">{{ weekNumberOf(row.week) }}</div>
          <div v-for="day in row.week.days" :key="day.key" class="apex-calendar__cell" :class="ui?.cell"
               :data-day-key="day.key"
               :data-outside="day.inMonth ? 'false' : 'true'" :data-today="day.today ? 'true' : 'false'"
               :data-selected="selectedKey === day.key ? 'true' : 'false'"
               role="button" :aria-label="day.key" @click="onCell(day, $event)"></div>
        </div>

        <div class="apex-calendar__bg" :class="ui?.background" aria-hidden="true">
          <div v-for="(seg, si) in bgRows[ri].segments" :key="si" class="apex-calendar__bgspan" :class="ui?.backgroundSpan"
               :data-tone="meta(seg.event.type).tone || 'success'"
               :style="laneStyle({ ...seg, lane: 0 }, showWeekNumbers ? 1 : 0)"></div>
        </div>

        <div class="apex-calendar__nums" :class="ui?.nums">
          <div v-if="showWeekNumbers" :style="cellStyle(-1, 1)"></div>
          <div v-for="(day, di) in row.week.days" :key="day.key" class="apex-calendar__num" :class="ui?.num"
               :data-outside="day.inMonth ? 'false' : 'true'" :data-today="day.today ? 'true' : 'false'"
               :style="cellStyle(di, showWeekNumbers ? 1 : 0)">
            <slot name="day-cell" v-bind="dayCtx(day, row)">{{ loc.num(day.dayOfMonth) }}</slot>
          </div>
        </div>

        <div class="apex-calendar__lanes" :class="ui?.lanes">
          <button v-for="seg in drawn(row)" :key="seg.event.instanceId + '-' + seg.col" type="button"
                  class="apex-calendar__bar-ev" :class="ui?.barEvent" :data-tone="tone(seg.event)"
                  :data-timed="isBar(seg.event) ? 'false' : 'true'"
                  :data-start="seg.isStart ? 'true' : 'false'" :data-end="seg.isEnd ? 'true' : 'false'"
                  :style="laneStyle(seg, showWeekNumbers ? 1 : 0)" :title="seg.event.title"
                  :data-editable="editable ? 'true' : 'false'" :data-apex-custom="$slots.event ? 'true' : 'false'"
                  :data-dragging="draft && draft.instanceId === seg.event.instanceId ? 'true' : 'false'"
                  :data-invalid="draft && draft.invalid && draft.instanceId === seg.event.instanceId ? 'true' : 'false'"
                  @pointerdown="onEventDown($event, seg.event, edgeMode($event, 'x'))"
                  @click="onEvent(seg.event, $event)">
            <slot name="event" v-bind="eventCtx(seg.event, { compact: BAR_COMPACT, clippedStart: !seg.isStart, clippedEnd: !seg.isEnd })">
              <span v-if="!isBar(seg.event)" class="apex-calendar__dot" :class="ui?.dot"></span>
              <ApexIcon v-if="seg.event.recurring" name="repeat" :size="11" />
              <span v-if="!isBar(seg.event)" class="apex-calendar__time" :class="ui?.time">{{ timeLabel(seg.event) }}</span>
              <span class="apex-calendar__evtitle" :class="ui?.eventTitle">{{ seg.event.title }}</span>
            </slot>
          </button>
        </div>

        <div class="apex-calendar__mores" :class="ui?.mores">
          <template v-for="(day, di) in row.week.days" :key="day.key">
            <button v-if="row.hiddenCounts[day.key]" type="button" class="apex-calendar__more" :class="ui?.more"
                    :style="cellStyle(di, showWeekNumbers ? 1 : 0)"
                    @click="onMore(day.key, row.hiddenEvents[day.key], $event)">
              {{ loc.t('more', { n: loc.num(row.hiddenCounts[day.key]) }) }}
            </button>
          </template>
        </div>
      </div>
    </div>

    <div v-else-if="isTimeGrid" ref="gridEl" class="apex-calendar__tg" :class="ui?.timeGrid"
         :style="{ '--apex-cal-cols': 'repeat(' + (isResourceGrid ? resources.length : days.length) + ',minmax(0,1fr))' }">
      <div class="apex-calendar__daybar" :class="ui?.dayBar">
        <div class="apex-calendar__zone" :class="ui?.zone">{{ showZoneLabel ? zoneLabel : '' }}</div>
        <template v-if="isResourceGrid">
          <div v-for="col in resourceColumns" :key="col.resource.id" class="apex-calendar__dayhead" :class="ui?.dayHead"
               data-resource="true">
            <b>{{ col.resource.title || col.resource.id }}</b>
          </div>
        </template>
        <template v-else>
          <div v-for="day in days" :key="day.key" class="apex-calendar__dayhead" :class="ui?.dayHead"
               :data-today="day.today ? 'true' : 'false'">
            <em>{{ dayHead(day).weekday }}</em><b>{{ dayHead(day).number }}</b>
          </div>
        </template>
      </div>

      <div class="apex-calendar__allday" :class="ui?.allDay">
        <div class="apex-calendar__alllabel" :class="ui?.allDayLabel">{{ loc.t('allDay') }}</div>
        <!-- Per resource it is a STACK, not a span: within one day there is
             nothing for a bar to span, so the segment packer has no work to do. -->
        <template v-if="isResourceGrid">
          <div v-for="col in resourceColumns" :key="col.resource.id" class="apex-calendar__allcell" :class="ui?.allDayCell">
            <button v-for="ev in col.allDay" :key="ev.instanceId" type="button"
                    class="apex-calendar__bar-ev" :class="ui?.barEvent" :data-tone="tone(ev)" data-timed="false"
                    data-start="true" data-end="true" :title="ev.title"
                    :data-apex-custom="$slots.event ? 'true' : 'false'"
                    @click="onEvent(ev, $event)">
              <slot name="event" v-bind="eventCtx(ev, { compact: BAR_COMPACT })">
                <span class="apex-calendar__evtitle" :class="ui?.eventTitle">{{ ev.title }}</span>
              </slot>
            </button>
          </div>
        </template>
        <div v-else class="apex-calendar__allrow" :class="ui?.allDayRow">
          <button v-for="seg in drawn(allDayRow)" :key="seg.event.instanceId + '-' + seg.col" type="button"
                  class="apex-calendar__bar-ev" :class="ui?.barEvent" :data-tone="tone(seg.event)" data-timed="false"
                  :data-start="seg.isStart ? 'true' : 'false'" :data-end="seg.isEnd ? 'true' : 'false'"
                  :style="laneStyle(seg, 0)" :title="seg.event.title"
                  :data-editable="editable ? 'true' : 'false'" :data-apex-custom="$slots.event ? 'true' : 'false'"
                  :data-dragging="draft && draft.instanceId === seg.event.instanceId ? 'true' : 'false'"
                  :data-invalid="draft && draft.invalid && draft.instanceId === seg.event.instanceId ? 'true' : 'false'"
                  @pointerdown="onEventDown($event, seg.event, edgeMode($event, 'x'))"
                  @click="onEvent(seg.event, $event)">
            <slot name="event" v-bind="eventCtx(seg.event, { compact: BAR_COMPACT, clippedStart: !seg.isStart, clippedEnd: !seg.isEnd })">
              <ApexIcon v-if="seg.event.recurring" name="repeat" :size="11" />
              <span class="apex-calendar__evtitle" :class="ui?.eventTitle">{{ seg.event.title }}</span>
            </slot>
          </button>
        </div>
      </div>

      <div class="apex-calendar__slots" :class="ui?.slots" :style="{ blockSize: axisHeight + 'px' }">
        <div class="apex-calendar__axis" :class="ui?.axis">
          <span v-for="t in ticks" :key="t.minutes" class="apex-calendar__tick" :class="ui?.tick"
                :style="{ insetBlockStart: t.top + 'px' }">{{ t.label }}</span>
        </div>
        <template v-if="isResourceGrid">
          <div v-for="col in resourceColumns" :key="col.resource.id" class="apex-calendar__col" :class="ui?.column"
               :data-day-key="col.day.key" :data-resource-id="col.resource.id"
               :style="{ backgroundImage: columnBackground }"
               @click="onColumn(col.day, $event, col.resource.id)">
            <div v-for="(t, ti) in col.tints" :key="ti" class="apex-calendar__tgbg" :class="ui?.timeGridBg"
                 :data-tone="meta(t.event.type).tone || 'success'" :style="tintStyle(t)"></div>
            <button v-for="b in col.blocks" :key="b.event.instanceId" type="button" class="apex-calendar__block" :class="ui?.block"
                    :data-tone="tone(b.event)" :data-clip-start="b.clippedStart ? 'true' : 'false'"
                    :data-clip-end="b.clippedEnd ? 'true' : 'false'"
                    :data-compact="blockCompact(b) ? 'true' : 'false'" :style="blockStyle(b)"
                    :title="b.event.title + ' · ' + blockTime(b.event)"
                    :data-editable="editable ? 'true' : 'false'" :data-apex-custom="$slots.event ? 'true' : 'false'"
                    :data-dragging="draft && draft.instanceId === b.event.instanceId ? 'true' : 'false'"
                    @pointerdown="onEventDown($event, b.event, edgeMode($event, 'y'))"
                    @click.stop="onEvent(b.event, $event)">
              <slot name="event" v-bind="eventCtx(b.event, { compact: blockCompact(b),
                    clippedStart: b.clippedStart, clippedEnd: b.clippedEnd })">
                <b>{{ blockTime(b.event) }}</b>
                <span>{{ b.event.title }}</span>
              </slot>
            </button>
            <div v-if="nowLine" class="apex-calendar__now" :class="ui?.now"
                 :style="{ insetBlockStart: nowLine.top * axisHeight + 'px' }"></div>
          </div>
        </template>
        <div v-for="(col, ci) in (isResourceGrid ? [] : columns)" :key="col.day.key" class="apex-calendar__col" :class="ui?.column"
             :data-day-key="col.day.key" :data-today="col.day.today ? 'true' : 'false'"
             :style="{ backgroundImage: columnBackground }" @click="onColumn(col.day, $event)">
          <div v-for="(t, ti) in col.tints" :key="ti" class="apex-calendar__tgbg" :class="ui?.timeGridBg"
               :data-tone="meta(t.event.type).tone || 'success'" :style="tintStyle(t)"></div>
          <button v-for="b in col.blocks" :key="b.event.instanceId" type="button" class="apex-calendar__block" :class="ui?.block"
                  :data-tone="tone(b.event)" :data-clip-start="b.clippedStart ? 'true' : 'false'"
                  :data-clip-end="b.clippedEnd ? 'true' : 'false'"
                    :data-compact="blockCompact(b) ? 'true' : 'false'" :style="blockStyle(b)"
                  :title="b.event.title + ' · ' + blockTime(b.event)"
                  :data-editable="editable ? 'true' : 'false'" :data-apex-custom="$slots.event ? 'true' : 'false'"
                  :data-dragging="draft && draft.instanceId === b.event.instanceId ? 'true' : 'false'"
                  :data-invalid="draft && draft.invalid && draft.instanceId === b.event.instanceId ? 'true' : 'false'"
                  @pointerdown="onEventDown($event, b.event, edgeMode($event, 'y'))"
                  @click.stop="onEvent(b.event, $event)">
            <slot name="event" v-bind="eventCtx(b.event, { compact: blockCompact(b),
                  clippedStart: b.clippedStart, clippedEnd: b.clippedEnd })">
              <b>{{ blockTime(b.event) }}</b>
              <span>{{ b.event.title }}</span>
            </slot>
          </button>
          <div v-if="nowLine && nowLine.index === ci" class="apex-calendar__now" :class="ui?.now"
               :style="{ insetBlockStart: nowLine.top * axisHeight + 'px' }"></div>
        </div>
      </div>
    </div>

    <div v-else-if="isList" class="apex-calendar__list" :class="ui?.list">
      <template v-for="group in listGroups" :key="group.key">
        <div class="apex-calendar__lday" :class="ui?.listDay">
          {{ groupHead(group).weekday }}<span>{{ groupHead(group).date }}</span>
        </div>
        <button v-for="ev in group.events" :key="ev.instanceId + group.key" type="button"
                class="apex-calendar__litem" :class="ui?.listItem" :data-apex-custom="$slots['list-item'] ? 'true' : 'false'"
                @click="onEvent(ev, $event)">
          <slot name="list-item" v-bind="eventCtx(ev, { view: 'list' })" :day="group.key">
            <span class="apex-calendar__ltime" :class="ui?.listTime">{{ listTime(ev) }}</span>
            <span class="apex-calendar__ldot" :class="ui?.listDot" :data-tone="tone(ev)"></span>
            <span class="apex-calendar__ltitle" :class="ui?.listTitle">
              <ApexIcon v-if="ev.recurring" name="repeat" :size="13" />{{ ev.title }}
            </span>
          </slot>
        </button>
      </template>
      <p v-if="!listGroups.length" class="apex-calendar__empty" :class="ui?.empty">{{ loc.t('noEvents') }}</p>
    </div>

    <div v-else-if="isYear" class="apex-calendar__year" :class="ui?.year" :data-layout="yearLayout">
      <section v-for="mo in yearMonths" :key="mo.month" class="apex-calendar__mini" :class="ui?.mini">
        <h5 class="apex-calendar__minihead" :class="ui?.miniHead">{{ mo.label }}</h5>
        <div class="apex-calendar__head" :class="ui?.head">
          <div v-for="(w, i) in weekdays" :key="i" class="apex-calendar__wd" :class="ui?.weekday">
            <slot name="day-header" :label="w.slice(0, 1)" :weekday="(i + firstDay) % 7" :index="i" view="year">{{ w.slice(0, 1) }}</slot>
          </div>
        </div>
        <div v-for="(row, ri) in mo.rows" :key="ri" class="apex-calendar__row" :class="ui?.row">
          <div class="apex-calendar__cells" :class="ui?.cells">
            <div v-for="day in row.week.days" :key="day.key" class="apex-calendar__cell" :class="ui?.cell"
                 :data-day-key="day.key" :data-outside="day.inMonth ? 'false' : 'true'"
                 :data-today="day.today ? 'true' : 'false'"
                 role="button" :aria-label="day.key" @click="onCell(day, $event)"></div>
          </div>
          <div class="apex-calendar__nums" :class="ui?.nums">
            <div v-for="(day, di) in row.week.days" :key="day.key" class="apex-calendar__num" :class="ui?.num"
                 :data-outside="day.inMonth ? 'false' : 'true'" :data-today="day.today ? 'true' : 'false'"
                 :style="cellStyle(di, 0)">
              <slot name="day-cell" v-bind="dayCtx(day, row, 'year')">{{ loc.num(day.dayOfMonth) }}</slot>
            </div>
          </div>
          <div class="apex-calendar__lanes" :class="ui?.lanes">
            <button v-for="seg in drawn(row)" :key="seg.event.instanceId + '-' + seg.col" type="button"
                    class="apex-calendar__bar-ev" :class="ui?.barEvent" :data-tone="tone(seg.event)"
                    :data-timed="isBar(seg.event) ? 'false' : 'true'"
                    :data-start="seg.isStart ? 'true' : 'false'" :data-end="seg.isEnd ? 'true' : 'false'"
                    :style="laneStyle(seg, 0)" :title="seg.event.title"
                    :data-apex-custom="$slots.event ? 'true' : 'false'"
                    @click="onEvent(seg.event, $event)">
              <slot name="event" v-bind="eventCtx(seg.event, { view: 'year', compact: MINI_BAR_COMPACT,
                    clippedStart: !seg.isStart, clippedEnd: !seg.isEnd })">
                <span v-if="!isBar(seg.event)" class="apex-calendar__dot" :class="ui?.dot"></span>
                <span class="apex-calendar__evtitle" :class="ui?.eventTitle">{{ seg.event.title }}</span>
              </slot>
            </button>
          </div>
          <div class="apex-calendar__mores" :class="ui?.mores">
            <template v-for="(day, di) in row.week.days" :key="day.key">
              <button v-if="row.hiddenCounts[day.key]" type="button" class="apex-calendar__more" :class="ui?.more"
                      :style="cellStyle(di, 0)"
                      @click="onMore(day.key, row.hiddenEvents[day.key], $event)">
                +{{ loc.num(row.hiddenCounts[day.key]) }}
              </button>
            </template>
          </div>
        </div>
      </section>
    </div>

    <Teleport to="body">
      <template v-if="scopePrompt">
        <div class="apex-scope-catch" @click="cancelScope"></div>
        <div class="apex-scope" :style="scopeStyle" role="dialog">
<slot name="scope-prompt" :event="scopePrompt.event" :title="scopePrompt.event.title"
                :choose="chooseScope" :cancel="cancelScope" :options="scopeOptions">
            <h4>{{ scopePrompt.event.title }}</h4>
            <p>{{ loc.t('recurring') }}</p>
            <button v-for="o in scopeOptions" :key="o.scope" type="button"
                    @click="chooseScope(o.scope)">{{ o.label }}</button>
            <button type="button" data-cancel="true" @click="cancelScope">{{ loc.t('cancel') }}</button>
          </slot>
        </div>
      </template>
      <template v-if="pop">
        <div class="apex-scope-catch" @click="pop = null"></div>
        <div class="apex-calendar__pop" :class="ui?.popover" :style="popStyle" role="dialog">
          <slot name="more-popover" :events="pop.events" :day="pop.key" :title="popTitle()"
                :close="closePop">
            <h4>{{ popTitle() }}</h4>
            <button v-for="ev in pop.events" :key="ev.instanceId" type="button"
                    class="apex-calendar__bar-ev" :class="ui?.barEvent" :data-tone="tone(ev)"
                    :data-timed="isBar(ev) ? 'false' : 'true'" data-start="true" data-end="true"
                    :data-apex-custom="$slots.event ? 'true' : 'false'"
                    @click="onEvent(ev, $event); pop = null">
              <slot name="event" v-bind="eventCtx(ev)">
                <span v-if="!isBar(ev)" class="apex-calendar__dot" :class="ui?.dot"></span>
                <span v-if="!isBar(ev)" class="apex-calendar__time" :class="ui?.time">{{ timeLabel(ev) }}</span>
                <span class="apex-calendar__evtitle" :class="ui?.eventTitle">{{ ev.title }}</span>
              </slot>
            </button>
          </slot>
        </div>
      </template>
    </Teleport>

    <ApexDialog v-if="inlineEditor" :visible="!!editor" width="470px"
                :header="editor && editor.id ? loc.t('edit') : loc.t('create')"
                icon="event" @update:visible="onEditorVisible">
      <div v-if="editor" class="apex-calendar__grid" :class="ui?.grid">
        <div data-span="2"><ApexInput v-model="editor.title" :label="loc.t('fieldTitle')" /></div>
        <div><ApexSelect v-model="editor.type" :label="loc.t('fieldType')" :options="typeOptions" /></div>
        <div style="display:flex;align-items:flex-end;padding-block-end:6px">
          <ApexSwitch v-model="editor.allDay" :label="loc.t('allDay')" />
        </div>
        <div data-span="2">
          <ApexDatePicker v-model="editor.start" :label="loc.t('fieldStarts')" :show-time="!editor.allDay"
                          :step-minute="15" :locale="toDateLocale(loc)" />
        </div>
        <div data-span="2">
          <ApexSelect v-if="!editor.allDay" v-model="editor.durMin" :label="loc.t('fieldDuration')" :options="durationOptions" />
          <ApexSelect v-else v-model="editor.durDays" :label="loc.t('fieldLength')" :options="dayOptions" />
        </div>
        <div data-span="2">
          <ApexSelect v-model="editor.repeat" :label="loc.t('fieldRepeat')" :options="repeatOptions" />
        </div>
      </div>
      <p v-if="editorError" class="apex-calendar__refusal" :class="ui?.refusal" role="alert">{{ editorError }}</p>
      <template #footer>
        <ApexButton v-if="editor && editor.id" icon="delete" severity="secondary" variant="text"
                    :label="loc.t('delete')" style="margin-inline-end:auto" @click="deleteEditor" />
        <ApexButton severity="secondary" variant="text" :label="loc.t('cancel')" @click="editor = null" />
        <ApexButton icon="check" :label="loc.t('save')" @click="saveEditor" />
      </template>
    </ApexDialog>
  </div>
</template>
