/**
 * Scheduler core — the resource-timeline logic, with no framework in it.
 *
 * Ported from the React `apex-scheduler.jsx`. The axis, the grouping, the lane
 * packing and the recurrence are all pure functions over dates and plain
 * objects, so they live here and BOTH implementations render them. Porting the
 * maths twice is how the two would drift on something no test would catch — a
 * lane index, a rounding, a week boundary.
 */
import { DAY_MS } from './recurrence';
export { DAY_MS };
import { type RecurringSource } from './recurrence';
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
export declare const MIN15 = 900000;
export declare const HOUR_MS = 3600000;
export declare const MONTHS: string[];
export declare const MONTHS_F: string[];
export declare const WD: string[];
export declare const WD_F: string[];
export declare const pad: (n: number) => string;
export declare const startOfDay: (d: Date | number) => Date;
export declare const daysInMonth: (y: number, m: number) => number;
export declare const sameDay: (a: Date, b: Date) => boolean;
export declare const fmtTime: (ms: number) => string;
export declare const fmtDateShort: (ms: number) => string;
export declare const toDateInput: (ms: number) => string;
export declare const toTimeInput: (ms: number) => string;
export interface AxisColumn {
    start: number;
    end: number;
    label: string;
    sub?: string;
    today?: boolean;
}
export interface AxisTier {
    label: string;
    width?: number;
    sub?: string;
    today?: boolean;
}
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
export declare function buildAxis(mode: SchedulerMode, anchor: Date): SchedulerAxis;
/** Where a timestamp sits along a continuous axis, in pixels. */
export declare function axisOffset(axis: SchedulerAxis, t: number): number;
/** The visible window, whichever shape the axis is. */
export declare function axisWindow(axis: SchedulerAxis): {
    from: number;
    to: number;
};
export { parseRRule, expandSeries, ruleText, ruleToRepeat, repeatToRule, applyScope, deleteScope, scopeOptions, DOW_CODES, } from './recurrence';
export type { ParsedRule, RepeatPreset, RecurrenceOverride, RecurrenceScope, RecurringSource, Occurrence, } from './recurrence';
export interface GroupNode {
    leaf: false;
    id: string;
    type: string;
    name: string;
    count: number;
    children: SchedulerNode[];
}
export interface LeafNode {
    leaf: true;
    id: string;
    room: SchedulerResource;
}
export type SchedulerNode = GroupNode | LeafNode;
export declare function groupRooms(rooms: SchedulerResource[], keys: string[]): SchedulerNode[];
/**
 * The tree as a flat row list, honouring collapse.
 *
 * `expanded[id] === false` collapses; anything else is open. Absence means OPEN
 * so a newly grouped tree arrives expanded rather than needing every id seeded.
 */
export declare function flattenNodes(nodes: SchedulerNode[], expanded: Record<string, boolean>, depth?: number, out?: {
    node: SchedulerNode;
    depth: number;
}[]): {
    node: SchedulerNode;
    depth: number;
}[];
export declare function allGroupIds(nodes: SchedulerNode[], out?: string[]): string[];
export declare function lanesFor<T extends {
    start: number;
    end: number;
}>(evs: T[]): {
    placed: {
        ev: T;
        lane: number;
    }[];
    laneCount: number;
};
/** Row metrics, shared so a track's height and its events cannot disagree. */
export declare const LANE = 40;
export declare const LANE_GAP = 6;
export declare const LANE_PAD = 8;
export declare const GROUP_H = 44;
export declare const DISCRETE_H = 76;
export declare function rowHeight(laneCount: number): number;
/**
 * Expands every event into instances, bucketed by resource.
 *
 * Bucketed rather than filtered per row: a row filtering the whole event list is
 * O(rooms × events), which a hundred rooms makes visible.
 */
export declare function instancesByResource(events: SchedulerEvent[], axis: SchedulerAxis): Record<string, SchedulerInstance[]>;
/** Snapped to the quarter hour, and kept inside the axis. */
export declare function snapToAxis(axis: SchedulerAxis, t: number, duration?: number): number;
/** Ids for events the user creates. Sequence, not a timestamp: two clicks in the
    same millisecond are not the same event. */
export declare function nextEventId(): string;
export interface SchedulerTypeMeta {
    label: string;
    icon?: string;
    tone?: 'info' | 'success' | 'warn' | 'danger' | 'help' | 'neutral';
    /** The context-menu wording. Defaults to "Create <label>". */
    createLabel?: string;
}
export declare const DEFAULT_TYPES: Record<string, SchedulerTypeMeta>;
