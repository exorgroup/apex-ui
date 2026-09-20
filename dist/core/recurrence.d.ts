/**
 * Recurrence — the RRULE subset, its exceptions, and the three write scopes.
 *
 * Extracted from `core/scheduler.ts` so ApexCalendar and ApexScheduler expand the
 * same rules. Two implementations of recurrence is the one duplication this
 * project cannot afford: an off-by-one in a week boundary that appears in the
 * calendar and not the timeline is nearly impossible to find.
 *
 * A deliberate SUBSET of RFC 5545 — FREQ, INTERVAL, BYDAY, COUNT, UNTIL — which
 * covers "every weekday" and "monthly on this date", and is small enough to read.
 * A full RRULE library brings timezone and BYSETPOS machinery nothing here asks
 * for.
 */
import { type ApexResolvedLocale } from './locale';
export declare const DAY_MS = 86400000;
export declare const DOW_CODES: string[];
export interface ParsedRule {
    freq?: string;
    interval: number;
    byday: number[] | null;
    count: number | null;
    until: number | null;
}
/**
 * A modified occurrence. `cancelled` deletes just that one.
 *
 * Anything else in it is a patch applied over the series — a title, a resource, a
 * type. The renderer merges it, so an override is not a second event to keep in
 * step with the first.
 */
export interface RecurrenceOverride {
    start?: number;
    end?: number;
    cancelled?: boolean;
    [key: string]: unknown;
}
export interface RecurringSource {
    start: number;
    end: number;
    rrule?: string | null;
    /** ORIGINAL starts that were deleted. Epoch ms, as the rule would have produced. */
    exdates?: number[];
    /**
     * Keyed by the occurrence's ORIGINAL start, stringified.
     *
     * By original start rather than by index: an index shifts the moment the rule
     * or the window changes, and every override then silently points at a
     * different occurrence. Stringified because that is what an object key is once
     * the record has been through JSON, and a number key that becomes a string on
     * the round trip is a lookup that works locally and fails in production.
     */
    overrides?: Record<string, RecurrenceOverride>;
}
export interface Occurrence {
    start: number;
    end: number;
    recurring: boolean;
    /** What the rule produced, before any override moved it. The override's key. */
    originalStart: number;
    overridden: boolean;
    override?: RecurrenceOverride;
}
export declare function parseRRule(s: string): ParsedRule;
/**
 * Every occurrence of an event that touches [from, to).
 *
 * A non-recurring event is returned as a single occurrence rather than handled
 * separately, so a caller has one code path — the branch that treated them
 * differently is where an off-by-one lives.
 *
 * COUNT counts what the RULE produced, exceptions included: deleting the third
 * of ten occurrences must not conjure an eleventh, which is what counting the
 * survivors would do.
 */
export declare function expandSeries(ev: RecurringSource, from: number, to: number): Occurrence[];
/**
 * The rule in words, because `FREQ=WEEKLY;BYDAY=MO,WE` is not an answer.
 *
 * Assembled from INTERPOLATED labels rather than concatenated fragments: German
 * and Arabic put the number and the day list in different places, and
 * `'Every ' + n + ' weeks'` cannot be translated at all.
 */
export declare function ruleText(rrule: string, locale?: ApexResolvedLocale | string): string;
export type RepeatPreset = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';
export declare function ruleToRepeat(rrule?: string | null): RepeatPreset;
export declare function repeatToRule(rep: RepeatPreset, startMs: number): string | null;
export type RecurrenceScope = 'this' | 'following' | 'all';
/**
 * What a scoped write does to the stored records.
 *
 * `update` is the existing record, patched. `create` is the new series that
 * "this and following" produces — absent for the other two scopes. A caller
 * persists both and nothing else.
 */
export interface ScopedWrite<T extends RecurringSource> {
    update: T;
    create?: T;
}
/**
 * Apply a patch to one occurrence, the following ones, or the whole series.
 *
 * `occurrenceStart` is the occurrence's ORIGINAL start — the override key — not
 * where a drag has just put it. The patch carries the new values.
 */
export declare function applyScope<T extends RecurringSource>(event: T, occurrenceStart: number, scope: RecurrenceScope, patch: RecurrenceOverride, newId?: string): ScopedWrite<T>;
/** Delete one occurrence, the following ones, or the series. */
export declare function deleteScope<T extends RecurringSource>(event: T, occurrenceStart: number, scope: RecurrenceScope): {
    update?: T;
    remove?: boolean;
};
/** The scope choices, labelled — one list so every surface offers the same three. */
export declare function scopeOptions(locale?: ApexResolvedLocale | string): {
    value: RecurrenceScope;
    label: string;
}[];
