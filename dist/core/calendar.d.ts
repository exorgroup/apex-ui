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
import { DAY_MS } from './recurrence';
import { HOUR_MS } from './scheduler';
export { DAY_MS, HOUR_MS };
import { type Occurrence, type RecurringSource } from './recurrence';
export declare const MIN_MS = 60000;
export interface ZonedParts {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    /** 0 = Sunday. */
    weekday: number;
}
/** An instant, as wall-clock parts in a zone. `month` is 0-based, like Date. */
export declare function zonedParts(ms: number, tz?: string): ZonedParts;
/** The zone's offset from UTC at an instant, in minutes. East is positive. */
export declare function tzOffsetMinutes(ms: number, tz?: string): number;
/**
 * A wall-clock time in a zone, as an instant.
 *
 * Guess, measure the offset there, correct, and measure again — one refinement,
 * because the first guess can land on the wrong side of a transition and the
 * offset it read would then be the wrong one. A wall-clock time that does not
 * exist (the spring-forward hour) resolves to the instant the clock jumps to,
 * which is what every calendar does with it.
 */
export declare function fromZonedParts(p: Partial<ZonedParts> & {
    year: number;
    month: number;
    day: number;
}, tz?: string): number;
/** Midnight of the day an instant falls in, in the zone. */
export declare function startOfZonedDay(ms: number, tz?: string): number;
/**
 * Calendar-day arithmetic, not `ms + n * DAY_MS`.
 *
 * A day is 23 or 25 hours twice a year, so adding a fixed 24 drifts across a
 * transition — the same class of bug that lost an occurrence in
 * `core/recurrence`. Going through the parts means the answer is always midnight
 * of the day asked for.
 */
export declare function addZonedDays(ms: number, n: number, tz?: string): number;
export declare function addZonedMonths(ms: number, n: number, tz?: string): number;
/**
 * A day's identity, `YYYY-MM-DD`.
 *
 * The key everything joins on, and the storage format for an all-day event. A
 * string rather than a timestamp because a DATE has no instant: "the 5th" is the
 * 5th in Auckland and in Lisbon, and the moment it starts is not the same one.
 */
export declare function dayKey(ms: number, tz?: string): string;
export declare function parseDayKey(key: string, tz?: string): number;
export declare function sameZonedDay(a: number, b: number, tz?: string): boolean;
/** 23, 24 or 25. The time grid needs it; nothing else should assume 24. */
export declare function dayLengthHours(ms: number, tz?: string): number;
/** Minutes from midnight, by the WALL CLOCK — which is what the axis shows. */
export declare function minutesOfDay(ms: number, tz?: string): number;
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
/**
 * One event, resolved into instants and day keys.
 *
 * An all-day event is NOT zone-shifted: it is a date, and pushing it through the
 * timed conversion is how an all-day booking made in Auckland shows on the
 * previous day in Europe. Its instants are derived from its own date strings, in
 * the viewer's zone, so it always covers the days it says it does.
 */
export declare function resolveEvent(ev: CalendarEvent, tz?: string, occ?: Occurrence, index?: number): ResolvedEvent;
/**
 * Every occurrence touching [from, to), resolved.
 *
 * Recurrence goes through `core/recurrence` \u2014 the same expansion the scheduler
 * uses, exceptions and overrides included. An all-day event does not recur
 * through the timed path: its rule steps whole days, so it is expanded on its own
 * midnight instants and re-resolved from the resulting date.
 */
export declare function expandCalendar(events: CalendarEvent[], from: number, to: number, tz?: string): ResolvedEvent[];
/**
 * The same event at new instants, with its day keys and span recomputed.
 *
 * A drag preview substitutes this into the resolved list, so the month segments,
 * the overlap columns and the agenda all re-lay out from one change rather than
 * each guessing where the pointer is. An all-day event keeps its all-day nature:
 * dragging it moves DATES, and turning it into a timed event mid-drag is a
 * different operation from moving it.
 */
export declare function shiftResolved(ev: ResolvedEvent, start: number, end: number, tz?: string): ResolvedEvent;
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
/**
 * Is a candidate position permitted?
 *
 * Allows must CONTAIN the candidate; denies must not OVERLAP it. An all-day
 * candidate ignores clock-based rules — "no bookings before 09:00" says nothing
 * about an event that has no time — because refusing it would be answering a
 * question the rule never asked.
 */
export declare function checkConstraints(constraints: CalendarConstraint[], cand: ConstraintCandidate, tz?: string): ConstraintResult;
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
export declare function monthMatrix(anchorMs: number, options?: MonthMatrixOptions): CalendarWeek[];
/** A run of days, for a week or day view. `days` may be 1. */
export declare function dayRange(anchorMs: number, days: number, options?: MonthMatrixOptions): DayCell[];
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
export declare function segmentWeeks(events: ResolvedEvent[], weeks: CalendarWeek[], options?: SegmentOptions): SegmentedWeek[];
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
    slots: {
        minutes: number;
        major: boolean;
    }[];
    /** Total minutes shown, which is what a height is a fraction of. */
    span: number;
}
export declare function slotAxis(options?: SlotAxisOptions): SlotAxis;
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
export declare function layoutDayColumn(events: ResolvedEvent[], day: DayCell, axis: SlotAxis, tz?: string): PositionedEvent[];
/** Background events as tinted spans, positioned but taking no lane or column. */
export declare function layoutBackground(events: ResolvedEvent[], day: DayCell, axis: SlotAxis, tz?: string): {
    event: ResolvedEvent;
    top: number;
    height: number;
}[];
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
export declare function groupByDay(events: ResolvedEvent[], from: number, to: number, tz?: string): DayGroup[];
