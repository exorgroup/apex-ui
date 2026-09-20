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
import { resolveApexLocale, type ApexResolvedLocale } from './locale';

export const DAY_MS = 86400000;
export const DOW_CODES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

export interface ParsedRule {
  freq?: string; interval: number; byday: number[] | null;
  count: number | null; until: number | null;
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

/**
 * UNTIL, in RFC 5545 BASIC format.
 *
 * `new Date('20260914')` is invalid, so parsing it with the Date constructor made
 * every bounded rule unbounded — and `applyScope('following')` writes exactly
 * that format. An unparseable value returns null rather than NaN: NaN is not
 * null, so it would pass the "is there an UNTIL?" test and then poison every
 * comparison it touched.
 */
function parseUntil(v: string): number | null {
  const basic = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/.exec(v.trim());
  if (basic) {
    const [, y, m, d, hh, mm, ss, z] = basic;
    const parts = [Number(y), Number(m) - 1, Number(d), Number(hh || 23), Number(mm || 59), Number(ss || 59)] as const;
    return z
      ? Date.UTC(parts[0], parts[1], parts[2], parts[3], parts[4], parts[5])
      : new Date(parts[0], parts[1], parts[2], parts[3], parts[4], parts[5]).getTime();
  }
  const t = new Date(v).getTime();
  return Number.isNaN(t) ? null : t;
}

export function parseRRule(s: string): ParsedRule {
  const o: ParsedRule = { interval: 1, byday: null, count: null, until: null };
  s.split(';').forEach((part) => {
    const [k, v] = part.split('=');
    if (!k || v == null) return;
    if (k === 'FREQ') o.freq = v;
    else if (k === 'INTERVAL') o.interval = parseInt(v, 10) || 1;
    else if (k === 'BYDAY') o.byday = v.split(',').map((c) => DOW_CODES.indexOf(c)).filter((i) => i >= 0);
    else if (k === 'COUNT') o.count = parseInt(v, 10);
    else if (k === 'UNTIL') o.until = parseUntil(v);
  });
  return o;
}

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
export function expandSeries(ev: RecurringSource, from: number, to: number): Occurrence[] {
  const overrides = ev.overrides || {};
  const exdates = ev.exdates || [];
  const decorate = (originalStart: number, start: number, end: number, recurring: boolean): Occurrence | null => {
    if (exdates.indexOf(originalStart) > -1) return null;
    const patch = overrides[String(originalStart)];
    if (patch && patch.cancelled) return null;
    const s = patch && patch.start != null ? patch.start : start;
    const e = patch && patch.end != null ? patch.end : end;
    /* Windowed AFTER the override is applied: an occurrence dragged into view
       must appear, and one dragged out of it must not. */
    if (!(e > from && s < to)) return null;
    return { start: s, end: e, recurring, originalStart, overridden: !!patch, override: patch };
  };

  if (!ev.rrule) {
    const one = decorate(ev.start, ev.start, ev.end, false);
    return one ? [one] : [];
  }

  const r = parseRRule(ev.rrule);
  const dur = ev.end - ev.start;
  const out: Occurrence[] = [];
  const limit = r.until != null ? Math.min(to, r.until) : to;
  let n = 0;
  const cursor = new Date(ev.start);
  /* Guarded by a step count as well as by the window: a malformed rule with a
     zero interval would otherwise spin forever. */
  for (let guard = 0; guard < 4000; guard += 1) {
    const t = cursor.getTime();
    if (t > limit) break;
    if (r.count != null && n >= r.count) break;
    const dayOk = !r.byday || r.byday.includes(cursor.getDay());
    if (dayOk) {
      n += 1;
      const occ = decorate(t, t, t + dur, true);
      if (occ) out.push(occ);
    }
    if (r.freq === 'DAILY') cursor.setDate(cursor.getDate() + r.interval);
    else if (r.freq === 'WEEKLY') {
      /* BYDAY means the rule steps a DAY at a time and filters, or "every Monday
         and Wednesday" would only ever produce one of them. */
      if (r.byday) cursor.setDate(cursor.getDate() + 1);
      else cursor.setDate(cursor.getDate() + 7 * r.interval);
    } else if (r.freq === 'MONTHLY') cursor.setMonth(cursor.getMonth() + r.interval);
    else if (r.freq === 'YEARLY') cursor.setFullYear(cursor.getFullYear() + r.interval);
    else break;
  }
  return out;
}

const FREQ_UNIT: Record<string, string> = {
  DAILY: 'unitDay', WEEKLY: 'unitWeek', MONTHLY: 'unitMonth', YEARLY: 'unitYear',
};

/**
 * The rule in words, because `FREQ=WEEKLY;BYDAY=MO,WE` is not an answer.
 *
 * Assembled from INTERPOLATED labels rather than concatenated fragments: German
 * and Arabic put the number and the day list in different places, and
 * `'Every ' + n + ' weeks'` cannot be translated at all.
 */
export function ruleText(rrule: string, locale?: ApexResolvedLocale | string): string {
  const l = typeof locale === 'object' && locale ? locale : resolveApexLocale(locale as string | undefined);
  const r = parseRRule(rrule);
  const unit = l.t(FREQ_UNIT[r.freq || ''] || 'unitDay');
  let text = r.interval > 1
    ? l.t('ruleEveryN', { n: l.num(r.interval), unit })
    : l.t('ruleEvery', { unit });
  if (r.byday && r.byday.length) {
    text = l.t('ruleOnDays', { rule: text, days: r.byday.map((i) => l.names.daysShort[i]).join(', ') });
  }
  if (r.count != null) text = l.t('ruleCount', { rule: text, n: l.num(r.count) });
  else if (r.until != null) {
    text = l.t('ruleUntil', {
      rule: text,
      date: l.fmt(r.until, { weekday: 'short', day: 'numeric', month: 'short' }),
    });
  }
  return text;
}

export type RepeatPreset = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';

/* Presets in both directions, so an editor's dropdown and the stored rule stay
   one vocabulary. A rule the presets cannot express reads as 'none' and must not
   be overwritten silently — see the editor. */
export function ruleToRepeat(rrule?: string | null): RepeatPreset {
  if (!rrule) return 'none';
  const r = parseRRule(rrule);
  if (r.freq === 'DAILY') return 'daily';
  if (r.freq === 'WEEKLY' && r.byday && r.byday.length === 5) return 'weekdays';
  if (r.freq === 'WEEKLY') return 'weekly';
  if (r.freq === 'MONTHLY') return 'monthly';
  return 'none';
}

export function repeatToRule(rep: RepeatPreset, startMs: number) {
  if (rep === 'daily') return 'FREQ=DAILY';
  if (rep === 'weekdays') return 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR';
  if (rep === 'weekly') return `FREQ=WEEKLY;BYDAY=${DOW_CODES[new Date(startMs).getDay()]}`;
  if (rep === 'monthly') return 'FREQ=MONTHLY';
  return null;
}

/* ─── the three write scopes ─────────────────────────────────────
   Editing a repeating booking is three different operations, not one flag. They
   live here because "this and following" SPLITS one record into two, and a host
   reimplementing that arithmetic is how two calendars disagree about where a
   series ends. */

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
 * The calendar day before an occurrence.
 *
 * NOT `ms - DAY_MS`: on the spring-forward Sunday a day is 23 hours, so
 * subtracting 24 lands on the previous DATE at 23:30 — and `UNTIL` then stamps
 * the wrong day and loses an occurrence. Twice a year, in one direction only,
 * which is exactly the asymmetry that ships. `setDate` is calendar arithmetic and
 * is DST-safe.
 */
function previousDay(ms: number) {
  const d = new Date(ms);
  d.setDate(d.getDate() - 1);
  return d.getTime();
}

const untilStamp = (ms: number) => {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
};

function withUntil(rrule: string, lastMs: number) {
  const kept = rrule.split(';').filter((part) => !/^(UNTIL|COUNT)=/.test(part));
  return [...kept, `UNTIL=${untilStamp(lastMs)}`].join(';');
}

/**
 * Apply a patch to one occurrence, the following ones, or the whole series.
 *
 * `occurrenceStart` is the occurrence's ORIGINAL start — the override key — not
 * where a drag has just put it. The patch carries the new values.
 */
export function applyScope<T extends RecurringSource>(
  event: T,
  occurrenceStart: number,
  scope: RecurrenceScope,
  patch: RecurrenceOverride,
  newId?: string,
): ScopedWrite<T> {
  if (!event.rrule || scope === 'all') {
    /* A single event has one occurrence, so every scope means the same thing. */
    const next = { ...event, ...patch } as T;
    /* The series keeps its own anchor unless the patch moves it, and a moved
       anchor must move the END by the same amount or the duration changes for
       every occurrence at once. */
    if (patch.start != null && patch.end == null) {
      (next as RecurringSource).end = patch.start + (event.end - event.start);
    }
    return { update: next };
  }

  if (scope === 'this') {
    const overrides = { ...(event.overrides || {}) };
    overrides[String(occurrenceStart)] = { ...(overrides[String(occurrenceStart)] || {}), ...patch };
    return { update: { ...event, overrides } as T };
  }

  /* 'following': close the original the day before this occurrence and start a
     new series here. Two records, which is why this cannot be a host's job. */
  const closed = {
    ...event,
    rrule: withUntil(event.rrule, previousDay(occurrenceStart)),
    overrides: pruneFrom(event.overrides, occurrenceStart),
    exdates: (event.exdates || []).filter((d) => d < occurrenceStart),
  } as T;
  const start = patch.start != null ? patch.start : occurrenceStart;
  const end = patch.end != null ? patch.end
    : start + (event.end - event.start);
  const created = {
    ...event,
    ...patch,
    id: newId,
    start,
    end,
    rrule: stripBounds(event.rrule),
    exdates: (event.exdates || []).filter((d) => d >= occurrenceStart),
    overrides: keepFrom(event.overrides, occurrenceStart, start - occurrenceStart),
  } as unknown as T;
  return { update: closed, create: created };
}

/** Delete one occurrence, the following ones, or the series. */
export function deleteScope<T extends RecurringSource>(
  event: T,
  occurrenceStart: number,
  scope: RecurrenceScope,
): { update?: T; remove?: boolean } {
  if (!event.rrule || scope === 'all') return { remove: true };
  if (scope === 'this') {
    /* An EXDATE rather than a cancelled override: the occurrence is gone, and a
       record saying "this one is deleted, and here is its title" invites a
       renderer to draw it. */
    const exdates = [...(event.exdates || []), occurrenceStart];
    return { update: { ...event, exdates } as T };
  }
  if (occurrenceStart <= event.start) return { remove: true };
  return {
    update: {
      ...event,
      rrule: withUntil(event.rrule, previousDay(occurrenceStart)),
      exdates: (event.exdates || []).filter((d) => d < occurrenceStart),
      overrides: pruneFrom(event.overrides, occurrenceStart),
    } as T,
  };
}

function pruneFrom(overrides: Record<string, RecurrenceOverride> | undefined, cut: number) {
  if (!overrides) return undefined;
  const out: Record<string, RecurrenceOverride> = {};
  Object.keys(overrides).forEach((k) => { if (Number(k) < cut) out[k] = overrides[k]; });
  return out;
}
/**
 * The overrides at or after the split, RE-KEYED by however far the anchor moved.
 *
 * Keys are original starts, so a split that also changes the time of day (the
 * common "move this and everything after it to 13:00") would leave every key
 * pointing at an occurrence the new rule can never produce: the customisations
 * survive in the record and silently stop applying. Shifting them keeps them
 * attached. A shift of zero leaves the keys untouched.
 *
 * Not a complete answer: a split that also changes the RULE can still leave keys
 * with no matching occurrence. Those expand to nothing and are harmless, and
 * guessing a mapping for them would be inventing data.
 */
function keepFrom(
  overrides: Record<string, RecurrenceOverride> | undefined, cut: number, shift = 0,
) {
  if (!overrides) return undefined;
  const out: Record<string, RecurrenceOverride> = {};
  Object.keys(overrides).forEach((k) => {
    if (Number(k) >= cut) out[String(Number(k) + shift)] = overrides[k];
  });
  return out;
}
/** COUNT and UNTIL belong to the original series, not to the split-off one. */
function stripBounds(rrule: string) {
  return rrule.split(';').filter((part) => !/^(UNTIL|COUNT)=/.test(part)).join(';');
}

/** The scope choices, labelled — one list so every surface offers the same three. */
export function scopeOptions(locale?: ApexResolvedLocale | string) {
  const l = typeof locale === 'object' && locale ? locale : resolveApexLocale(locale as string | undefined);
  return [
    { value: 'this' as RecurrenceScope, label: l.t('scopeThis') },
    { value: 'following' as RecurrenceScope, label: l.t('scopeFollowing') },
    { value: 'all' as RecurrenceScope, label: l.t('scopeAll') },
  ];
}
