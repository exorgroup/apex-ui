/**
 * Calendar core — the geometry, zone-aware, with no framework in it.
 *
 * Three layers, in order of how much the rest depends on them:
 *
 * 1. **The zone layer.** Nothing above it calls `getHours()`. "Which day does
 *    this instant belong to?" is a zone question, and month segmentation, the
 *    all-day strip, week boundaries and the list grouping all rest on the answer.
 * 2. **One internal event shape.** All-day and timed events are DIFFERENT things
 *    (a date versus an instant), so the public type is a union and
 *    `resolveEvent` collapses it once at the boundary. Everything inside sees one
 *    shape, and the distinction cannot be forgotten halfway through.
 * 3. **The geometry.** Month row segments, time-grid overlap columns, list
 *    grouping. Pure functions over the resolved shape.
 */
/* DAY_MS and HOUR_MS are re-exported from the modules that own them rather
   than declared again here. All three modules defined identical copies in the
   source, which is harmless inside a module and ambiguous the moment the
   package re-exports all three (TS2308). One definition each: recurrence owns
   the day, scheduler the hour. AF2-267b. */
import { DAY_MS } from './recurrence';
import { HOUR_MS } from './scheduler';
export { DAY_MS, HOUR_MS };
import { expandSeries, type Occurrence, type RecurringSource } from './recurrence';

export const MIN_MS = 60000;

/* ─── the zone layer ─────────────────────────────────────────────
   Built on Intl.DateTimeFormat.formatToParts, which is the only zone database a
   browser exposes. Cached: a month grid asks these questions hundreds of times
   per render. */

const partsCache = new Map<string, Intl.DateTimeFormat>();
function zoneFmt(tz?: string) {
  const key = tz || 'local';
  let f = partsCache.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz || undefined, hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'short',
    });
    partsCache.set(key, f);
  }
  return f;
}

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export interface ZonedParts {
  year: number; month: number; day: number;
  hour: number; minute: number; second: number;
  /** 0 = Sunday. */
  weekday: number;
}

/** An instant, as wall-clock parts in a zone. `month` is 0-based, like Date. */
export function zonedParts(ms: number, tz?: string): ZonedParts {
  const out: Record<string, string> = {};
  zoneFmt(tz).formatToParts(new Date(ms)).forEach((p) => { out[p.type] = p.value; });
  return {
    year: Number(out.year), month: Number(out.month) - 1, day: Number(out.day),
    hour: Number(out.hour) % 24, minute: Number(out.minute), second: Number(out.second),
    weekday: WEEKDAY_INDEX[out.weekday] ?? 0,
  };
}

/** The zone's offset from UTC at an instant, in minutes. East is positive. */
export function tzOffsetMinutes(ms: number, tz?: string) {
  const p = zonedParts(ms, tz);
  const asUtc = Date.UTC(p.year, p.month, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(ms / 1000) * 1000) / MIN_MS);
}

/**
 * A wall-clock time in a zone, as an instant.
 *
 * Guess, measure the offset there, correct, and measure again — one refinement,
 * because the first guess can land on the wrong side of a transition and the
 * offset it read would then be the wrong one. A wall-clock time that does not
 * exist (the spring-forward hour) resolves to the instant the clock jumps to,
 * which is what every calendar does with it.
 */
export function fromZonedParts(p: Partial<ZonedParts> & { year: number; month: number; day: number }, tz?: string) {
  const wall = Date.UTC(p.year, p.month, p.day, p.hour || 0, p.minute || 0, p.second || 0);
  let ms = wall - tzOffsetMinutes(wall, tz) * MIN_MS;
  ms = wall - tzOffsetMinutes(ms, tz) * MIN_MS;
  return ms;
}

/** Midnight of the day an instant falls in, in the zone. */
export function startOfZonedDay(ms: number, tz?: string) {
  const p = zonedParts(ms, tz);
  return fromZonedParts({ year: p.year, month: p.month, day: p.day }, tz);
}

/**
 * Calendar-day arithmetic, not `ms + n * DAY_MS`.
 *
 * A day is 23 or 25 hours twice a year, so adding a fixed 24 drifts across a
 * transition — the same class of bug that lost an occurrence in
 * `core/recurrence`. Going through the parts means the answer is always midnight
 * of the day asked for.
 */
export function addZonedDays(ms: number, n: number, tz?: string) {
  const p = zonedParts(ms, tz);
  return fromZonedParts({ year: p.year, month: p.month, day: p.day + n }, tz);
}

export function addZonedMonths(ms: number, n: number, tz?: string) {
  const p = zonedParts(ms, tz);
  return fromZonedParts({ year: p.year, month: p.month + n, day: 1 }, tz);
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * A day's identity, `YYYY-MM-DD`.
 *
 * The key everything joins on, and the storage format for an all-day event. A
 * string rather than a timestamp because a DATE has no instant: "the 5th" is the
 * 5th in Auckland and in Lisbon, and the moment it starts is not the same one.
 */
export function dayKey(ms: number, tz?: string) {
  const p = zonedParts(ms, tz);
  return `${p.year}-${pad(p.month + 1)}-${pad(p.day)}`;
}

export function parseDayKey(key: string, tz?: string) {
  const [y, m, d] = key.split('-').map(Number);
  return fromZonedParts({ year: y, month: (m || 1) - 1, day: d || 1 }, tz);
}

export function sameZonedDay(a: number, b: number, tz?: string) {
  return dayKey(a, tz) === dayKey(b, tz);
}

/** 23, 24 or 25. The time grid needs it; nothing else should assume 24. */
export function dayLengthHours(ms: number, tz?: string) {
  const start = startOfZonedDay(ms, tz);
  return Math.round((addZonedDays(start, 1, tz) - start) / HOUR_MS);
}

/** Minutes from midnight, by the WALL CLOCK — which is what the axis shows. */
export function minutesOfDay(ms: number, tz?: string) {
  const p = zonedParts(ms, tz);
  return p.hour * 60 + p.minute + p.second / 60;
}

/* ─── events ─────────────────────────────────────────────────────
   The union is the public shape; `resolveEvent` is the only place that reads it. */

/**
 * `start` and `end` are omitted from the recurrence source deliberately.
 *
 * A timed event has both as epoch milliseconds; an all-day event has neither —
 * it carries `startDate`/`endDate` as `YYYY-MM-DD`, because "the 3rd" is a date
 * and not an instant. The source declares them required on RecurringSource and
 * then re-declares them optional on AllDayCalendarEvent, which TypeScript
 * rejects outright (TS2430): an interface cannot widen an inherited property.
 * Each variant states its own instead. Fixed at AF2-267b.
 */
export interface CalendarEventBase extends Omit<RecurringSource, 'start' | 'end'> {
  id: string;
  title?: string;
  /** The app's own vocabulary, mapped to a design-system tone by the component. */
  type?: string;
  /** Renders as a tinted region rather than a block. */
  background?: boolean;
  resourceId?: string;
  [key: string]: unknown;
}

export interface TimedCalendarEvent extends CalendarEventBase {
  allDay?: false;
  /** Epoch milliseconds. */
  start: number;
  end: number;
}

export interface AllDayCalendarEvent extends CalendarEventBase {
  allDay: true;
  /** `YYYY-MM-DD`. */
  startDate: string;
  /** `YYYY-MM-DD`, INCLUSIVE — the last day the event covers. */
  endDate?: string;
  start?: number;
  end?: number;
}

export type CalendarEvent = TimedCalendarEvent | AllDayCalendarEvent;

/** One shape for everything above the boundary. */
export interface ResolvedEvent {
  source: CalendarEvent;
  id: string;
  instanceId: string;
  title: string;
  type?: string;
  allDay: boolean;
  background: boolean;
  resourceId?: string;
  /** Instants, always \u2014 an all-day event's are midnight to the next midnight. */
  start: number;
  /** EXCLUSIVE. An all-day event on the 5th ends at midnight on the 6th. */
  end: number;
  startKey: string;
  /** INCLUSIVE, so it names the last day a bar is drawn on. */
  endKey: string;
  /** Days the event covers, at least 1. */
  dayCount: number;
  recurring: boolean;
  originalStart: number;
  overridden: boolean;
}

const isAllDay = (ev: CalendarEvent): ev is AllDayCalendarEvent => (ev as AllDayCalendarEvent).allDay === true;

/**
 * One event, resolved into instants and day keys.
 *
 * An all-day event is NOT zone-shifted: it is a date, and pushing it through the
 * timed conversion is how an all-day booking made in Auckland shows on the
 * previous day in Europe. Its instants are derived from its own date strings, in
 * the viewer's zone, so it always covers the days it says it does.
 */
export function resolveEvent(ev: CalendarEvent, tz?: string, occ?: Occurrence, index = 0): ResolvedEvent {
  const allDay = isAllDay(ev);
  let start: number;
  let end: number;
  if (allDay) {
    const startKey = ev.startDate;
    const endKey = ev.endDate || ev.startDate;
    start = parseDayKey(startKey, tz);
    end = addZonedDays(parseDayKey(endKey, tz), 1, tz);
  } else {
    start = occ ? occ.start : (ev as TimedCalendarEvent).start;
    end = occ ? occ.end : (ev as TimedCalendarEvent).end;
  }
  if (!(end > start)) end = allDay ? addZonedDays(start, 1, tz) : start + 30 * MIN_MS;
  const startKey = dayKey(start, tz);
  /* One millisecond back, so an event ending exactly at midnight does not claim
     the next day — a 23:00–00:00 booking belongs to the day it started. */
  const endKey = dayKey(end - 1, tz);
  const startDay = startOfZonedDay(start, tz);
  const lastDay = startOfZonedDay(end - 1, tz);
  const dayCount = Math.max(1, Math.round((lastDay - startDay) / DAY_MS) + 1);
  return {
    source: ev,
    id: ev.id,
    instanceId: occ ? `${ev.id}#${index}` : ev.id,
    title: String(ev.title || ''),
    type: ev.type,
    allDay,
    background: !!ev.background,
    resourceId: ev.resourceId,
    start,
    end,
    startKey,
    endKey,
    dayCount,
    recurring: occ ? occ.recurring : false,
    originalStart: occ ? occ.originalStart : start,
    overridden: occ ? occ.overridden : false,
  };
}

/**
 * Every occurrence touching [from, to), resolved.
 *
 * Recurrence goes through `core/recurrence` \u2014 the same expansion the scheduler
 * uses, exceptions and overrides included. An all-day event does not recur
 * through the timed path: its rule steps whole days, so it is expanded on its own
 * midnight instants and re-resolved from the resulting date.
 */
export function expandCalendar(events: CalendarEvent[], from: number, to: number, tz?: string): ResolvedEvent[] {
  const out: ResolvedEvent[] = [];
  events.forEach((ev) => {
    if (!ev.rrule) {
      const r = resolveEvent(ev, tz);
      if (r.end > from && r.start < to) out.push(r);
      return;
    }
    const anchor = resolveEvent(ev, tz);
    const spanned = { ...ev, start: anchor.start, end: anchor.end } as RecurringSource;
    expandSeries(spanned, from, to).forEach((occ, i) => {
      if (isAllDay(ev)) {
        const days = anchor.dayCount - 1;
        const startKey = dayKey(occ.start, tz);
        const patched = {
          ...ev,
          startDate: startKey,
          endDate: dayKey(addZonedDays(parseDayKey(startKey, tz), days, tz), tz),
        } as AllDayCalendarEvent;
        out.push({ ...resolveEvent(patched, tz), instanceId: `${ev.id}#${i}`, recurring: occ.recurring,
          originalStart: occ.originalStart, overridden: occ.overridden, source: ev });
      } else {
        out.push(resolveEvent({ ...ev, ...(occ.override || {}) } as CalendarEvent, tz, occ, i));
      }
    });
  });
  return out;
}

/**
 * The same event at new instants, with its day keys and span recomputed.
 *
 * A drag preview substitutes this into the resolved list, so the month segments,
 * the overlap columns and the agenda all re-lay out from one change rather than
 * each guessing where the pointer is. An all-day event keeps its all-day nature:
 * dragging it moves DATES, and turning it into a timed event mid-drag is a
 * different operation from moving it.
 */
export function shiftResolved(ev: ResolvedEvent, start: number, end: number, tz?: string): ResolvedEvent {
  const startKey = dayKey(start, tz);
  const endKey = dayKey(end - 1, tz);
  const startDay = startOfZonedDay(start, tz);
  const lastDay = startOfZonedDay(end - 1, tz);
  return {
    ...ev,
    start,
    end,
    startKey,
    endKey,
    dayCount: Math.max(1, Math.round((lastDay - startDay) / DAY_MS) + 1),
  };
}

/* ─── constraints ────────────────────────────────────────────────
   A constraint is a RULE, and deliberately not the same prop as a background
   event, which is a RENDERING. An app routinely wants one without the other: a
   tinted "school holidays" band that is still bookable, or an invisible rule that
   refuses a booking with no band at all. Fusing them forces every rule to be
   visible and every tint to be binding. */

export interface CalendarConstraint {
  id?: string;
  /**
   * `allow` names a window bookings must fall INSIDE; `deny` names one they must
   * not touch. Allows are OR-ed — an event satisfies the set by fitting any one
   * of them — because "weekdays 9–5 or Saturday mornings" is one rule, not two
   * competing ones.
   */
  mode?: 'allow' | 'deny';
  start?: number;
  end?: number;
  /** `YYYY-MM-DD`, inclusive, for whole-day rules. */
  startDate?: string;
  endDate?: string;
  /** Minutes from midnight, applied to every day in range. Business hours. */
  minTime?: number;
  maxTime?: number;
  /** 0 = Sunday. Omitted: every day. */
  weekdays?: number[];
  rrule?: string;
  /** Scoped to some resources or event types; omitted means all. */
  resourceIds?: string[];
  eventTypes?: string[];
  /** Shown when this constraint is the one that refused. */
  message?: string;
}

export interface ConstraintCandidate {
  start: number;
  end: number;
  allDay?: boolean;
  resourceId?: string;
  type?: string;
  /** Excluded from its own overlap checks. */
  id?: string;
}

export interface ConstraintResult {
  ok: boolean;
  /** The constraint that refused, when one did. */
  constraint?: CalendarConstraint;
  reason?: string;
}

function appliesTo(c: CalendarConstraint, cand: ConstraintCandidate) {
  if (c.resourceIds && !c.resourceIds.includes(cand.resourceId || '')) return false;
  if (c.eventTypes && !c.eventTypes.includes(cand.type || '')) return false;
  return true;
}

/** The instants a constraint covers inside a window, one span per day it touches. */
function constraintSpans(c: CalendarConstraint, from: number, to: number, tz?: string) {
  const spans: { start: number; end: number }[] = [];
  const hasClock = c.minTime != null || c.maxTime != null;
  const explicitStart = c.start != null ? c.start
    : (c.startDate ? parseDayKey(c.startDate, tz) : undefined);
  const explicitEnd = c.end != null ? c.end
    : (c.endDate ? addZonedDays(parseDayKey(c.endDate, tz), 1, tz) : undefined);

  /* A plain window with no clock or weekday filter IS one span. */
  if (!hasClock && !c.weekdays && !c.rrule) {
    if (explicitStart == null && explicitEnd == null) return spans;
    spans.push({ start: explicitStart ?? from, end: explicitEnd ?? to });
    return spans;
  }
  /* Otherwise it repeats per day across the window, which is how business hours
     and "Saturdays only" are expressed without writing a rule per day. */
  const lo = Math.max(from, explicitStart ?? from);
  const hi = Math.min(to, explicitEnd ?? to);
  let day = startOfZonedDay(lo, tz);
  while (day < hi) {
    const parts = zonedParts(day, tz);
    const next = addZonedDays(day, 1, tz);
    if (!c.weekdays || c.weekdays.includes(parts.weekday)) {
      const s = day + (c.minTime ?? 0) * MIN_MS;
      const e = c.maxTime != null ? day + c.maxTime * MIN_MS : next;
      if (e > s) spans.push({ start: s, end: e });
    }
    day = next;
  }
  return spans;
}

/**
 * Is a candidate position permitted?
 *
 * Allows must CONTAIN the candidate; denies must not OVERLAP it. An all-day
 * candidate ignores clock-based rules — "no bookings before 09:00" says nothing
 * about an event that has no time — because refusing it would be answering a
 * question the rule never asked.
 */
export function checkConstraints(
  constraints: CalendarConstraint[],
  cand: ConstraintCandidate,
  tz?: string,
): ConstraintResult {
  if (!constraints || !constraints.length) return { ok: true };
  const relevant = constraints.filter((c) => appliesTo(c, cand));
  const window = { from: cand.start - DAY_MS, to: cand.end + DAY_MS };

  for (const c of relevant) {
    if ((c.mode || 'allow') !== 'deny') continue;
    if (cand.allDay && (c.minTime != null || c.maxTime != null)) continue;
    const hit = constraintSpans(c, window.from, window.to, tz)
      .some((s) => s.start < cand.end && s.end > cand.start);
    if (hit) return { ok: false, constraint: c, reason: c.message || 'blocked' };
  }

  const allows = relevant.filter((c) => (c.mode || 'allow') === 'allow'
    && !(cand.allDay && (c.minTime != null || c.maxTime != null)));
  if (!allows.length) return { ok: true };
  /* OR-ed: fitting any one allow window is enough. */
  const fits = allows.some((c) => constraintSpans(c, window.from, window.to, tz)
    .some((s) => s.start <= cand.start && s.end >= cand.end));
  if (fits) return { ok: true };
  const named = allows.find((c) => c.message);
  return { ok: false, constraint: named || allows[0], reason: (named || allows[0]).message || 'outside allowed hours' };
}

/* ─── the month matrix ───────────────────────────────────────────*/

export interface DayCell {
  key: string;
  /** Midnight, in the zone. */
  start: number;
  /** 0 = Sunday. */
  weekday: number;
  dayOfMonth: number;
  month: number;
  year: number;
  inMonth: boolean;
  today: boolean;
  /** 23, 24 or 25 — the grid does not need it, the time grid does. */
  hours: number;
}

export interface CalendarWeek {
  days: DayCell[];
  start: number;
  /** Set by the component from the locale's own scheme. */
  weekNumber?: number;
}

export interface MonthMatrixOptions {
  tz?: string;
  /** 0 = Sunday. From the locale pack. */
  firstDay?: number;
  /** Fixed six rows, or as many as the month needs. */
  fixedWeeks?: boolean;
  /** How many days each row holds. 7 for a month, 1–7 for a week or day view. */
  daysPerRow?: number;
  /** Overridden in tests; otherwise now. */
  now?: number;
}

/**
 * The grid a month view draws.
 *
 * Also the week and day views' day list, with `daysPerRow` — the all-day strip of
 * a week grid IS a one-row month matrix, and building it here means the segment
 * packing below serves both without a second implementation.
 */
export function monthMatrix(anchorMs: number, options: MonthMatrixOptions = {}): CalendarWeek[] {
  const { tz, firstDay = 0, fixedWeeks = false, daysPerRow = 7 } = options;
  const now = options.now == null ? Date.now() : options.now;
  const anchor = zonedParts(anchorMs, tz);
  const firstOfMonth = fromZonedParts({ year: anchor.year, month: anchor.month, day: 1 }, tz);
  const lead = (zonedParts(firstOfMonth, tz).weekday - firstDay + 7) % 7;
  const gridStart = addZonedDays(firstOfMonth, -lead, tz);
  const daysInMonth = Math.round(
    (fromZonedParts({ year: anchor.year, month: anchor.month + 1, day: 1 }, tz) - firstOfMonth) / DAY_MS,
  );
  const rows = fixedWeeks ? 6 : Math.ceil((lead + daysInMonth) / daysPerRow);
  const todayKey = dayKey(now, tz);
  const weeks: CalendarWeek[] = [];
  let cursor = gridStart;
  for (let w = 0; w < rows; w += 1) {
    const days: DayCell[] = [];
    for (let d = 0; d < daysPerRow; d += 1) {
      const p = zonedParts(cursor, tz);
      const key = dayKey(cursor, tz);
      days.push({
        key,
        start: cursor,
        weekday: p.weekday,
        dayOfMonth: p.day,
        month: p.month,
        year: p.year,
        inMonth: p.month === anchor.month && p.year === anchor.year,
        today: key === todayKey,
        hours: dayLengthHours(cursor, tz),
      });
      cursor = addZonedDays(cursor, 1, tz);
    }
    weeks.push({ days, start: days[0].start });
  }
  return weeks;
}

/** A run of days, for a week or day view. `days` may be 1. */
export function dayRange(anchorMs: number, days: number, options: MonthMatrixOptions = {}): DayCell[] {
  const { tz, firstDay } = options;
  const now = options.now == null ? Date.now() : options.now;
  const start = firstDay == null
    ? startOfZonedDay(anchorMs, tz)
    : addZonedDays(startOfZonedDay(anchorMs, tz),
      -((zonedParts(anchorMs, tz).weekday - firstDay + 7) % 7), tz);
  const todayKey = dayKey(now, tz);
  const out: DayCell[] = [];
  let cursor = start;
  for (let i = 0; i < days; i += 1) {
    const p = zonedParts(cursor, tz);
    const key = dayKey(cursor, tz);
    out.push({
      key, start: cursor, weekday: p.weekday, dayOfMonth: p.day, month: p.month, year: p.year,
      inMonth: true, today: key === todayKey, hours: dayLengthHours(cursor, tz),
    });
    cursor = addZonedDays(cursor, 1, tz);
  }
  return out;
}

/* ─── month row segments ─────────────────────────────────────────
   The largest piece of geometry here, and the one FullCalendar's own complexity
   lives in. A multi-day event becomes ONE BAR PER ROW, ordered so bars never
   cross, with the overflow reported per cell rather than dropped. */

export interface Segment {
  event: ResolvedEvent;
  /** Index of the first column the bar covers, within its row. */
  col: number;
  span: number;
  lane: number;
  /** False when the event began before this row — the bar is drawn open-ended. */
  isStart: boolean;
  isEnd: boolean;
  /** Hidden by `maxPerDay`. Kept, not dropped, so a cell can count it. */
  hidden: boolean;
}

export interface SegmentedWeek {
  week: CalendarWeek;
  segments: Segment[];
  /** Lanes actually drawn, so a row can be sized. */
  laneCount: number;
  /** Per day key: how many events that cell is not showing. */
  hiddenCounts: Record<string, number>;
  /** Per day key, the events hidden there — for a "+N more" popover. */
  hiddenEvents: Record<string, ResolvedEvent[]>;
}

export interface SegmentOptions {
  /** Lanes drawn before a cell reports "+N more". Omitted: no limit. */
  maxPerDay?: number;
  /** Background events are laid out separately; they never take a lane. */
  includeBackground?: boolean;
}

/**
 * Ordering, which is the whole trick.
 *
 * All-day and multi-day bars first, longest first, then by start: a long bar that
 * sorted after a short one would have to jump lanes mid-row, and bars that cross
 * are unreadable. Timed events come last, in time order, because they render as
 * rows of text under the bars.
 */
function segmentOrder(a: ResolvedEvent, b: ResolvedEvent) {
  const aBar = a.allDay || a.dayCount > 1;
  const bBar = b.allDay || b.dayCount > 1;
  if (aBar !== bBar) return aBar ? -1 : 1;
  if (aBar && bBar) {
    if (b.dayCount !== a.dayCount) return b.dayCount - a.dayCount;
    return a.start - b.start;
  }
  if (a.start !== b.start) return a.start - b.start;
  return b.end - a.end;
}

export function segmentWeeks(
  events: ResolvedEvent[],
  weeks: CalendarWeek[],
  options: SegmentOptions = {},
): SegmentedWeek[] {
  const { maxPerDay, includeBackground = false } = options;
  const usable = events.filter((e) => includeBackground || !e.background);
  const sorted = [...usable].sort(segmentOrder);
  return weeks.map((week) => {
    const keyIndex = new Map<string, number>();
    week.days.forEach((d, i) => keyIndex.set(d.key, i));
    const rowStart = week.days[0].start;
    const rowEnd = week.days[week.days.length - 1].start + week.days[week.days.length - 1].hours * HOUR_MS;
    /* One boolean grid per lane: first-fit over the columns a bar needs, which is
       what keeps a lane a straight horizontal line across the row. */
    const lanes: boolean[][] = [];
    const segments: Segment[] = [];
    const hiddenEvents: Record<string, ResolvedEvent[]> = {};
    sorted.forEach((ev) => {
      if (ev.end <= rowStart || ev.start >= rowEnd) return;
      const from = keyIndex.has(ev.startKey) ? keyIndex.get(ev.startKey)! : 0;
      const to = keyIndex.has(ev.endKey) ? keyIndex.get(ev.endKey)! : week.days.length - 1;
      const col = Math.max(0, from);
      const span = Math.max(1, Math.min(week.days.length - col, to - col + 1));
      let lane = 0;
      for (;; lane += 1) {
        if (!lanes[lane]) { lanes[lane] = []; break; }
        let free = true;
        for (let c = col; c < col + span; c += 1) if (lanes[lane][c]) { free = false; break; }
        if (free) break;
      }
      for (let c = col; c < col + span; c += 1) lanes[lane][c] = true;
      const hidden = maxPerDay != null && lane >= maxPerDay;
      if (hidden) {
        for (let c = col; c < col + span; c += 1) {
          const key = week.days[c].key;
          (hiddenEvents[key] = hiddenEvents[key] || []).push(ev);
        }
      }
      segments.push({
        event: ev, col, span, lane, hidden,
        isStart: keyIndex.has(ev.startKey),
        isEnd: keyIndex.has(ev.endKey),
      });
    });
    const hiddenCounts: Record<string, number> = {};
    Object.keys(hiddenEvents).forEach((k) => { hiddenCounts[k] = hiddenEvents[k].length; });
    const drawn = segments.filter((s) => !s.hidden);
    return {
      week,
      segments,
      laneCount: drawn.reduce((n, s) => Math.max(n, s.lane + 1), 0),
      hiddenCounts,
      hiddenEvents,
    };
  });
}

/* ─── the time grid ──────────────────────────────────────────────*/

export interface SlotAxisOptions {
  /** Minutes from midnight. Default 0. */
  minTime?: number;
  /** Minutes from midnight; 1440 is the whole day. */
  maxTime?: number;
  /** Minutes per slot. 30 by default. */
  slotDuration?: number;
  /** Slots per label. 2 gives an hourly label over 30-minute slots. */
  labelInterval?: number;
}

export interface SlotAxis {
  minTime: number;
  maxTime: number;
  slotDuration: number;
  slots: { minutes: number; major: boolean }[];
  /** Total minutes shown, which is what a height is a fraction of. */
  span: number;
}

export function slotAxis(options: SlotAxisOptions = {}): SlotAxis {
  const minTime = options.minTime ?? 0;
  const maxTime = options.maxTime ?? 1440;
  const slotDuration = options.slotDuration ?? 30;
  const labelInterval = options.labelInterval ?? Math.max(1, Math.round(60 / slotDuration));
  const slots: { minutes: number; major: boolean }[] = [];
  for (let m = minTime, i = 0; m < maxTime; m += slotDuration, i += 1) {
    slots.push({ minutes: m, major: i % labelInterval === 0 });
  }
  return { minTime, maxTime, slotDuration, slots, span: Math.max(1, maxTime - minTime) };
}

export interface PositionedEvent {
  event: ResolvedEvent;
  /** Fractions of the axis span, 0–1. */
  top: number;
  height: number;
  /** Fractions of the column width. */
  left: number;
  width: number;
  /** True when the event started before the visible window. */
  clippedStart: boolean;
  clippedEnd: boolean;
}

/**
 * One day column's timed events, positioned.
 *
 * Position is measured in WALL-CLOCK minutes, not elapsed milliseconds. The axis
 * is a clock, so on the spring-forward day an event at 09:00 must sit against the
 * 09:00 label whatever the elapsed time since midnight was — measuring elapsed ms
 * puts it an hour out for exactly one day a year.
 *
 * Overlaps divide the column: events are grouped into collision clusters, given a
 * column each within their cluster, and share the width. Stacking them would hide
 * a double booking, which is the one thing a calendar must not do.
 */
export function layoutDayColumn(
  events: ResolvedEvent[],
  day: DayCell,
  axis: SlotAxis,
  tz?: string,
): PositionedEvent[] {
  const dayEnd = day.start + day.hours * HOUR_MS;
  const relevant = events
    .filter((e) => !e.allDay && !e.background && e.end > day.start && e.start < dayEnd)
    .sort((a, b) => a.start - b.start || b.end - a.end);
  if (!relevant.length) return [];

  const bounds = relevant.map((e) => {
    /* An event running in from yesterday starts at the top of the axis, and one
       running out ends at the bottom — clipped, not shrunk to nothing. */
    const rawStart = e.start < day.start ? axis.minTime : minutesOfDay(e.start, tz);
    const rawEnd = e.end > dayEnd ? axis.maxTime : (minutesOfDay(e.end, tz) || axis.maxTime);
    return { event: e, rawStart, rawEnd, clippedStart: e.start < day.start, clippedEnd: e.end > dayEnd };
  })
    /* Visibility is decided on the RAW interval, BEFORE any minimum length. The
       floor used to run first and manufactured one: an overnight 22:00–00:30
       booking read on the following day has rawStart clamped to minTime and a
       rawEnd of 30, so `max(30, start + 1)` invented a 361-minute end that then
       passed the filter — a 16px sliver pinned to the top of every column, for an
       event that ran the night before. */
    .filter((b) => b.rawEnd > axis.minTime && b.rawStart < axis.maxTime && b.rawEnd > b.rawStart)
    .map((b) => {
      const startMin = Math.max(axis.minTime, Math.min(b.rawStart, axis.maxTime));
      const endMin = Math.max(axis.minTime, Math.min(b.rawEnd, axis.maxTime));
      return {
        ...b,
        startMin,
        /* Only now: a visible event that would round to nothing gets one minute,
           so it stays clickable. */
        endMin: Math.max(endMin, startMin + 1),
      };
    });

  /* Clusters, then columns within a cluster: a chain of overlaps shares a width
     so that A|B and B|C do not disagree about how wide B is. */
  const out: PositionedEvent[] = [];
  let cluster: typeof bounds = [];
  let clusterEnd = -Infinity;
  const flush = () => {
    if (!cluster.length) return;
    const columns: number[] = [];
    const placed = cluster.map((b) => {
      let c = columns.findIndex((end) => end <= b.startMin);
      if (c === -1) { c = columns.length; columns.push(b.endMin); } else columns[c] = b.endMin;
      return { b, c };
    });
    const total = Math.max(1, columns.length);
    placed.forEach(({ b, c }) => {
      out.push({
        event: b.event,
        top: (b.startMin - axis.minTime) / axis.span,
        height: (b.endMin - b.startMin) / axis.span,
        left: c / total,
        width: 1 / total,
        clippedStart: b.clippedStart,
        clippedEnd: b.clippedEnd,
      });
    });
    cluster = [];
    clusterEnd = -Infinity;
  };
  bounds.forEach((b) => {
    if (b.startMin >= clusterEnd) flush();
    cluster.push(b);
    clusterEnd = Math.max(clusterEnd, b.endMin);
  });
  flush();
  return out;
}

/** Background events as tinted spans, positioned but taking no lane or column. */
export function layoutBackground(events: ResolvedEvent[], day: DayCell, axis: SlotAxis, tz?: string) {
  const dayEnd = day.start + day.hours * HOUR_MS;
  return events
    .filter((e) => e.background && e.end > day.start && e.start < dayEnd)
    .map((e) => {
      const startMin = e.allDay || e.start < day.start ? axis.minTime : minutesOfDay(e.start, tz);
      const endMin = e.allDay || e.end > dayEnd ? axis.maxTime : (minutesOfDay(e.end, tz) || axis.maxTime);
      return {
        event: e,
        top: (Math.max(axis.minTime, startMin) - axis.minTime) / axis.span,
        height: (Math.min(axis.maxTime, endMin) - Math.max(axis.minTime, startMin)) / axis.span,
      };
    })
    .filter((s) => s.height > 0);
}

/* ─── the agenda list ────────────────────────────────────────────*/

export interface DayGroup {
  key: string;
  start: number;
  events: ResolvedEvent[];
}

/**
 * Events grouped by the day they appear on.
 *
 * A multi-day event appears under EVERY day it covers, because a list answers
 * "what is happening on this day" — listing a week-long conference once, under
 * the Monday, hides it from someone reading Thursday. Days with nothing are
 * omitted: an agenda of empty headings is noise.
 */
export function groupByDay(events: ResolvedEvent[], from: number, to: number, tz?: string): DayGroup[] {
  const groups = new Map<string, DayGroup>();
  let cursor = startOfZonedDay(from, tz);
  while (cursor < to) {
    groups.set(dayKey(cursor, tz), { key: dayKey(cursor, tz), start: cursor, events: [] });
    cursor = addZonedDays(cursor, 1, tz);
  }
  events.forEach((ev) => {
    let day = startOfZonedDay(Math.max(ev.start, from), tz);
    const last = ev.end - 1;
    while (day <= last && day < to) {
      const g = groups.get(dayKey(day, tz));
      if (g) g.events.push(ev);
      day = addZonedDays(day, 1, tz);
    }
  });
  return [...groups.values()]
    .filter((g) => g.events.length)
    .map((g) => ({
      ...g,
      /* All-day first, then by start: an all-day event has no time, and sorting it
         by its midnight instant would bury it among the 00:xx bookings. */
      events: g.events.sort((a, b) => (a.allDay === b.allDay
        ? a.start - b.start
        : (a.allDay ? -1 : 1))),
    }));
}
