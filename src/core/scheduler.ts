/**
 * Scheduler core — the resource-timeline logic, with no framework in it.
 *
 * Ported from the React `apex-scheduler.jsx`. The axis, the grouping, the lane
 * packing and the recurrence are all pure functions over dates and plain
 * objects, so they live here and BOTH implementations render them. Porting the
 * maths twice is how the two would drift on something no test would catch — a
 * lane index, a rounding, a week boundary.
 */

/* DAY_MS and HOUR_MS are re-exported from the modules that own them rather
   than declared again here. All three modules defined identical copies in the
   source, which is harmless inside a module and ambiguous the moment the
   package re-exports all three (TS2308). One definition each: recurrence owns
   the day, scheduler the hour. AF2-267b. */
import { DAY_MS } from './recurrence';
export { DAY_MS };
import { expandSeries, type RecurringSource, type RecurrenceOverride } from './recurrence';

export type SchedulerMode = 'year' | 'month' | 'day' | 'quarter';

export interface SchedulerResource {
  id: string;
  /** The leaf label — the thing being scheduled. */
  room: string;
  /** Any number of grouping fields; `groupKeys` names which ones to nest by. */
  [key: string]: unknown;
}

export interface SchedulerEvent extends RecurringSource {
  id: string;
  roomId: string;
  type: string;
  title: string;
  start: number;
  end: number;
  /** An RRULE fragment, e.g. `FREQ=WEEKLY;BYDAY=MO,WE`. */
  rrule?: string | null;
}

/** One occurrence of an event, which for a recurring one is not the event. */
export interface SchedulerInstance extends SchedulerEvent {
  recurring: boolean;
  instanceId: string;
  /** What the rule produced, before an override moved it — the override's key. */
  originalStart: number;
  overridden: boolean;
}

export const MIN15 = 900000;
export const HOUR_MS = 3600000;

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTHS_F = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];
export const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WD_F = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const pad = (n: number) => String(n).padStart(2, '0');
export const startOfDay = (d: Date | number) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
export const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
export const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear()
  && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export const fmtTime = (ms: number) => { const d = new Date(ms); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
export const fmtDateShort = (ms: number) => {
  const d = new Date(ms);
  return `${WD[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};
export const toDateInput = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
export const toTimeInput = (ms: number) => fmtTime(ms);

/* ─── the axis ───────────────────────────────────────────────────
   Two SHAPES, not four. A year and a month are DISCRETE — a column is a unit
   and an event belongs to one — while a day and a quarter-hour view are
   CONTINUOUS, where an event's position is a fraction of the span. The flag is
   what every consumer branches on, so it is computed once here rather than
   inferred from the mode in each of them. */

export interface AxisColumn {
  start: number; end: number; label: string; sub?: string; today?: boolean;
}
export interface AxisTier { label: string; width?: number; sub?: string; today?: boolean }
export interface SchedulerAxis {
  mode: SchedulerMode;
  continuous: boolean;
  colWidth: number;
  timelineW: number;
  cols?: AxisColumn[];
  rangeStart?: number;
  span?: number;
  tier1: AxisTier[];
  tier2: AxisTier[];
}

export function buildAxis(mode: SchedulerMode, anchor: Date): SchedulerAxis {
  const now = new Date();
  if (mode === 'year') {
    const y = anchor.getFullYear();
    const colWidth = 152;
    const cols: AxisColumn[] = [];
    for (let mm = 0; mm < 12; mm += 1) {
      cols.push({
        start: new Date(y, mm, 1).getTime(),
        end: new Date(y, mm + 1, 1).getTime(),
        label: MONTHS[mm],
        today: now.getFullYear() === y && now.getMonth() === mm,
      });
    }
    return {
      mode, continuous: false, colWidth, cols, timelineW: colWidth * 12,
      tier1: [{ label: String(y), width: colWidth * 12 }],
      tier2: cols.map((c) => ({ label: c.label, today: c.today })),
    };
  }
  if (mode === 'month') {
    const y = anchor.getFullYear();
    const m = anchor.getMonth();
    const dim = daysInMonth(y, m);
    const colWidth = 120;
    const cols: AxisColumn[] = [];
    for (let d = 1; d <= dim; d += 1) {
      const s = new Date(y, m, d);
      cols.push({
        start: s.getTime(), end: new Date(y, m, d + 1).getTime(),
        label: String(d), sub: WD[s.getDay()], today: sameDay(s, now),
      });
    }
    return {
      mode, continuous: false, colWidth, cols, timelineW: colWidth * dim,
      tier1: [{ label: `${MONTHS_F[m]} ${y}`, width: colWidth * dim }],
      tier2: cols.map((c) => ({ label: c.label, sub: c.sub, today: c.today })),
    };
  }
  if (mode === 'day') {
    const base = startOfDay(anchor);
    const colWidth = 132;
    const tier2: AxisTier[] = [];
    for (let h = 0; h < 24; h += 1) {
      tier2.push({ label: `${pad(h)}:00`, today: sameDay(base, now) && now.getHours() === h });
    }
    return {
      mode, continuous: true, colWidth, timelineW: colWidth * 24,
      rangeStart: base.getTime(), span: DAY_MS,
      tier1: [{
        label: `${WD_F[base.getDay()]}, ${base.getDate()} ${MONTHS_F[base.getMonth()]} ${base.getFullYear()}`,
        width: colWidth * 24,
      }],
      tier2,
    };
  }
  /* The 15-minute view: 96 columns, labelled by the minute within the hour, with
     the hour carried on the tier above — 96 timestamps in a row is unreadable. */
  const base = startOfDay(anchor);
  const colWidth = 64;
  const tier1: AxisTier[] = [];
  const tier2: AxisTier[] = [];
  for (let h = 0; h < 24; h += 1) tier1.push({ label: `${pad(h)}:00`, width: colWidth * 4 });
  for (let i = 0; i < 96; i += 1) tier2.push({ label: `:${pad((i % 4) * 15)}` });
  return {
    mode, continuous: true, colWidth, timelineW: colWidth * 96,
    rangeStart: base.getTime(), span: DAY_MS, tier1, tier2,
  };
}

/** Where a timestamp sits along a continuous axis, in pixels. */
export function axisOffset(axis: SchedulerAxis, t: number) {
  if (!axis.continuous) return 0;
  return ((t - (axis.rangeStart || 0)) / (axis.span || 1)) * axis.timelineW;
}

/** The visible window, whichever shape the axis is. */
export function axisWindow(axis: SchedulerAxis) {
  if (axis.continuous) {
    const from = axis.rangeStart || 0;
    return { from, to: from + (axis.span || 0) };
  }
  const cols = axis.cols || [];
  return { from: cols.length ? cols[0].start : 0, to: cols.length ? cols[cols.length - 1].end : 0 };
}

/* ─── recurrence ─────────────────────────────────────────────────
   Moved to core/recurrence.ts, which ApexCalendar reads too, and re-exported so
   nothing importing it from here breaks. The exception model (EXDATE, overrides,
   the three write scopes) lives there with it. */
export {
  parseRRule, expandSeries, ruleText, ruleToRepeat, repeatToRule,
  applyScope, deleteScope, scopeOptions, DOW_CODES,
} from './recurrence';
export type {
  ParsedRule, RepeatPreset, RecurrenceOverride, RecurrenceScope, RecurringSource, Occurrence,
} from './recurrence';

/* ─── grouping ───────────────────────────────────────────────────
   A TREE built from a list of keys, so "group by building, then floor" is a
   configuration rather than a code path. */

export interface GroupNode {
  leaf: false; id: string; type: string; name: string; count: number; children: SchedulerNode[];
}
export interface LeafNode { leaf: true; id: string; room: SchedulerResource }
export type SchedulerNode = GroupNode | LeafNode;

export function groupRooms(rooms: SchedulerResource[], keys: string[]): SchedulerNode[] {
  const rec = (list: SchedulerResource[], depth: number, prefix: string): SchedulerNode[] => {
    if (depth >= keys.length) return list.map((r) => ({ leaf: true as const, id: `room-${r.id}`, room: r }));
    const key = keys[depth];
    const seen: string[] = [];
    const byValue = new Map<string, SchedulerResource[]>();
    list.forEach((r) => {
      const v = String(r[key] ?? '');
      if (!byValue.has(v)) { byValue.set(v, []); seen.push(v); }
      byValue.get(v)!.push(r);
    });
    /* Insertion order, not sorted: the caller's order of resources is a decision
       (floors run bottom to top, not alphabetically). */
    return seen.map((v, i) => {
      const members = byValue.get(v)!;
      return {
        leaf: false as const,
        id: `${prefix}-${depth}-${i}`,
        type: key,
        name: v,
        count: members.length,
        children: rec(members, depth + 1, `${prefix}-${depth}-${i}`),
      };
    });
  };
  return rec(rooms, 0, 'g');
}

/**
 * The tree as a flat row list, honouring collapse.
 *
 * `expanded[id] === false` collapses; anything else is open. Absence means OPEN
 * so a newly grouped tree arrives expanded rather than needing every id seeded.
 */
export function flattenNodes(
  nodes: SchedulerNode[],
  expanded: Record<string, boolean>,
  depth = 0,
  out: { node: SchedulerNode; depth: number }[] = [],
) {
  nodes.forEach((n) => {
    out.push({ node: n, depth });
    if (!n.leaf && expanded[n.id] !== false) flattenNodes(n.children, expanded, depth + 1, out);
  });
  return out;
}

export function allGroupIds(nodes: SchedulerNode[], out: string[] = []) {
  nodes.forEach((n) => { if (!n.leaf) { out.push(n.id); allGroupIds(n.children, out); } });
  return out;
}

/* ─── lane packing ───────────────────────────────────────────────
   Overlapping bookings are stacked rather than drawn on top of each other: a
   double booking is information, and hiding it behind the one drawn last is the
   one thing a scheduler must not do. */
export function lanesFor<T extends { start: number; end: number }>(evs: T[]) {
  const sorted = [...evs].sort((a, b) => a.start - b.start);
  const laneEnds: number[] = [];
  const placed: { ev: T; lane: number }[] = [];
  sorted.forEach((ev) => {
    let lane = laneEnds.findIndex((end) => end <= ev.start);
    if (lane === -1) { lane = laneEnds.length; laneEnds.push(ev.end); } else laneEnds[lane] = ev.end;
    placed.push({ ev, lane });
  });
  return { placed, laneCount: Math.max(1, laneEnds.length) };
}

/** Row metrics, shared so a track's height and its events cannot disagree. */
export const LANE = 40;
export const LANE_GAP = 6;
export const LANE_PAD = 8;
export const GROUP_H = 44;
export const DISCRETE_H = 76;

export function rowHeight(laneCount: number) {
  return Math.max(54, LANE_PAD * 2 + laneCount * LANE + (laneCount - 1) * LANE_GAP);
}

/**
 * Expands every event into instances, bucketed by resource.
 *
 * Bucketed rather than filtered per row: a row filtering the whole event list is
 * O(rooms × events), which a hundred rooms makes visible.
 */
export function instancesByResource(
  events: SchedulerEvent[],
  axis: SchedulerAxis,
): Record<string, SchedulerInstance[]> {
  const { from, to } = axisWindow(axis);
  const out: Record<string, SchedulerInstance[]> = {};
  events.forEach((ev) => {
    expandSeries(ev, from, to).forEach((o, i) => {
      /* An override is a PATCH over the series, so it is merged before the
         occurrence's own start and end — and it may move the booking to another
         resource, which decides the bucket. */
      const patch = (o.override || {}) as RecurrenceOverride;
      const inst = {
        ...ev, ...patch,
        start: o.start, end: o.end, recurring: o.recurring,
        originalStart: o.originalStart, overridden: o.overridden,
        instanceId: `${ev.id}#${i}`,
      } as SchedulerInstance;
      const key = inst.roomId;
      (out[key] = out[key] || []).push(inst);
    });
  });
  return out;
}

/** Snapped to the quarter hour, and kept inside the axis. */
export function snapToAxis(axis: SchedulerAxis, t: number, duration = 0) {
  const start = axis.rangeStart || 0;
  const span = axis.span || 0;
  const snapped = Math.round(t / MIN15) * MIN15;
  return Math.max(start, Math.min(snapped, start + span - duration));
}

let eventSeq = 0;
/** Ids for events the user creates. Sequence, not a timestamp: two clicks in the
    same millisecond are not the same event. */
export function nextEventId() { eventSeq += 1; return `ev-new-${eventSeq}`; }

/* ── event types ───────────────────────────────────────────────
   Here rather than in ApexScheduler.vue, where the source had them.
   `defineProps()` is hoisted out of setup, so it cannot reference a local
   const — `types: () => DEFAULT_TYPES` in withDefaults made the SFC fail to
   compile outright. An import can be hoisted; a local cannot. AF2-268. */

export interface SchedulerTypeMeta {
  label: string;
  icon?: string;
  tone?: 'info' | 'success' | 'warn' | 'danger' | 'help' | 'neutral';
  /** The context-menu wording. Defaults to "Create <label>". */
  createLabel?: string;
}

export const DEFAULT_TYPES: Record<string, SchedulerTypeMeta> = {
  event: { label: 'Event', icon: 'event', tone: 'info' },
  private: { label: 'Private hire', icon: 'group', tone: 'success' },
  maintenance: { label: 'Maintenance', icon: 'build', tone: 'warn', createLabel: 'Schedule maintenance' },
  blocked: { label: 'Blocked', icon: 'lock', tone: 'neutral', createLabel: 'Block time' },
};

