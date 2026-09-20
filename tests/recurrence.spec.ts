import { describe, it, expect } from 'vitest';
import {
  parseRRule, expandSeries, ruleText, ruleToRepeat, repeatToRule,
  applyScope, deleteScope, scopeOptions, DAY_MS,
  type RecurringSource,
} from '../src/core/recurrence';

/**
 * Recurrence — the engine ApexScheduler and ApexCalendar share.
 *
 * One implementation, one set of tests: a bug here is a bug in both controls,
 * and the two would otherwise each grow their own half-covering suite.
 *
 * The thing worth guarding is the identity of an occurrence. Overrides are
 * keyed by the ORIGINAL start rather than by index, because an index shifts
 * the moment the rule or the window changes and every override then silently
 * points at a different occurrence.
 */

const H = 3600000;
/** Monday 2026-01-05, 09:00 UTC. */
const MON = Date.UTC(2026, 0, 5, 9);
const series = (extra: Record<string, unknown> = {}): RecurringSource & { id: string } => ({
  id: 'e1', start: MON, end: MON + H, rrule: 'FREQ=DAILY', ...extra,
});

describe('parsing', () => {
  it('reads frequency, interval and weekdays', () => {
    const r = parseRRule('FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE');
    expect(r.freq).toBe('WEEKLY');
    expect(r.interval).toBe(2);
    /* Day INDICES, not the codes: BYDAY is resolved through DOW_CODES on the
       way in, so everything downstream compares numbers against getDay(). */
    expect(r.byday).toEqual([1, 3]);
  });

  it('an empty rule parses to defaults rather than to null', () => {
    /* `parseRRule` always returns a shape; it is `rrule` being absent on the
       EVENT that makes something a one-off, which `expansion` covers. */
    const r = parseRRule('');
    expect(r.freq).toBeUndefined();
    expect(r.interval).toBe(1);
    expect(r.byday).toBeNull();
  });
});

describe('expansion', () => {
  it('produces one occurrence per day within the window', () => {
    const out = expandSeries(series(), MON, MON + 5 * DAY_MS);
    expect(out.length).toBe(5);
    expect(out[0].start).toBe(MON);
    expect(out[1].start).toBe(MON + DAY_MS);
  });

  it('a non-recurring event yields itself, once', () => {
    const out = expandSeries(series({ rrule: null }), MON - DAY_MS, MON + 5 * DAY_MS);
    expect(out.length).toBe(1);
    expect(out[0].start).toBe(MON);
  });

  it('honours INTERVAL and COUNT', () => {
    const out = expandSeries(series({ rrule: 'FREQ=DAILY;INTERVAL=2;COUNT=3' }), MON, MON + 30 * DAY_MS);
    expect(out.map((o) => o.start)).toEqual([MON, MON + 2 * DAY_MS, MON + 4 * DAY_MS]);
  });

  it('BYDAY picks weekdays rather than counting days', () => {
    const out = expandSeries(series({ rrule: 'FREQ=WEEKLY;BYDAY=MO,WE' }), MON, MON + 14 * DAY_MS);
    /* Mon, Wed, Mon, Wed over a fortnight. */
    expect(out.length).toBe(4);
    expect(out[1].start).toBe(MON + 2 * DAY_MS);
  });

  it('an exdate removes exactly its own occurrence', () => {
    const out = expandSeries(series({ exdates: [MON + DAY_MS] }), MON, MON + 3 * DAY_MS);
    expect(out.map((o) => o.start)).toEqual([MON, MON + 2 * DAY_MS]);
  });
});

describe('overrides', () => {
  it('are keyed by the original start, and move only that occurrence', () => {
    const out = expandSeries(series({
      overrides: { [String(MON + DAY_MS)]: { start: MON + DAY_MS + 2 * H, end: MON + DAY_MS + 3 * H } },
    }), MON, MON + 3 * DAY_MS);
    expect(out[1].start).toBe(MON + DAY_MS + 2 * H);
    /* The key it was filed under, so the next edit finds it again. */
    expect(out[1].originalStart).toBe(MON + DAY_MS);
    expect(out[0].start).toBe(MON);
  });

  it('a cancelled override drops the occurrence', () => {
    const out = expandSeries(series({
      overrides: { [String(MON + DAY_MS)]: { cancelled: true } },
    }), MON, MON + 3 * DAY_MS);
    expect(out.map((o) => o.start)).toEqual([MON, MON + 2 * DAY_MS]);
  });
});

describe('scoped writes — the reason overrides are keyed by original start', () => {
  it('"this" writes an override and leaves the series alone', () => {
    const w = applyScope(series(), MON + DAY_MS, 'this', { start: MON + DAY_MS + H });
    expect(w.update.rrule).toBe('FREQ=DAILY');
    expect(w.update.overrides?.[String(MON + DAY_MS)]?.start).toBe(MON + DAY_MS + H);
    expect(w.create).toBeUndefined();
  });

  it('"all" edits the series itself', () => {
    const w = applyScope(series(), MON + DAY_MS, 'all', { start: MON + H });
    expect(w.update.start).toBe(MON + H);
    expect(w.create).toBeUndefined();
  });

  it('"following" splits one record into two', () => {
    const w = applyScope(series(), MON + 2 * DAY_MS, 'following', { start: MON + 2 * DAY_MS + H }, 'e1-b');
    /* The original is closed off and a NEW series carries the change — which
       is why every caller has to apply `create` as well as `update`, and why
       the components emit both. */
    expect(w.create).toBeDefined();
    expect(w.create?.id).toBe('e1-b');
    expect(w.update.rrule).toContain('UNTIL');
  });

  it('deleting one occurrence adds an exdate, not a gap in the rule', () => {
    const w = deleteScope(series(), MON + DAY_MS, 'this');
    /* `update` is optional on a delete: removing the whole series returns
       `remove` and nothing to write. */
    expect(w.update?.exdates).toContain(MON + DAY_MS);
    expect(w.remove).toBeFalsy();
  });

  it('deleting the whole series removes the record', () => {
    const w = deleteScope(series(), MON + DAY_MS, 'all');
    expect(w.remove).toBe(true);
  });

  it('offers the three scopes, labelled through the locale', () => {
    /* It takes a LOCALE, not an event — whether to ASK is the component's
       decision, and both only prompt when the event has a rule. */
    const opts = scopeOptions('en');
    expect(opts.map((o) => o.value)).toEqual(['this', 'following', 'all']);
    expect(opts.every((o) => !!o.label)).toBe(true);
  });
});

describe('round-tripping a rule through the editor', () => {
  it('a preset survives rule -> preset -> rule', () => {
    /* The vocabulary is none | daily | weekdays | weekly | monthly. Yearly is
       not in it, so it is not round-trippable — the same limitation the
       BYDAY case below shows, at the other end of the scale. */
    for (const rule of ['FREQ=DAILY', 'FREQ=MONTHLY']) {
      expect(repeatToRule(ruleToRepeat(rule), MON)).toBe(rule);
    }
    expect(ruleToRepeat('FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR')).toBe('weekdays');
  });

  it('the preset vocabulary cannot hold a multi-day BYDAY, and says so by not', () => {
    /* `FREQ=WEEKLY;BYDAY=MO,WE,FR` has no preset: the editor's weekly option
       means "weekly on this day". Round-tripping collapses it to the anchor's
       day, so a caller offering the preset editor over an arbitrary rule has
       to keep the original and only write back when the preset changed. */
    expect(repeatToRule(ruleToRepeat('FREQ=WEEKLY;BYDAY=MO,WE,FR'), MON))
      .toBe('FREQ=WEEKLY;BYDAY=MO');
  });

  it('describes a rule in words', () => {
    /* Takes a string, not `string | null`; both call sites guard on the event
       having a rule before asking. */
    expect(ruleText('FREQ=DAILY')).toMatch(/day/i);
    expect(ruleText('FREQ=WEEKLY;INTERVAL=2')).toMatch(/2/);
  });
});
