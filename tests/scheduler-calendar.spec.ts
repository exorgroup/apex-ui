import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexScheduler from '../src/components/ApexScheduler.vue';
import ApexCalendar from '../src/components/ApexCalendar.vue';
import { lanesFor, rowHeight } from '../src/core/scheduler';

/**
 * ApexScheduler and ApexCalendar.
 *
 * Recurrence is covered in recurrence.spec.ts — it is one engine shared by
 * both, and testing it twice through two components would cover it worse.
 * Here: lane packing, the edit gestures both controls report rather than
 * apply, and that each calendar view renders its own furniture.
 */

const H = 3600000;
const DAY = Date.UTC(2026, 0, 5);
const at = (h: number, m = 0) => DAY + h * H + m * 60000;

describe('lane packing', () => {
  it('two events that do not overlap share one lane', () => {
    const { placed, laneCount } = lanesFor([
      { start: at(9), end: at(10) },
      { start: at(10), end: at(11) },
    ]);
    expect(laneCount).toBe(1);
    expect(placed.map((p) => p.lane)).toEqual([0, 0]);
  });

  it('an overlap opens a second lane', () => {
    const { placed, laneCount } = lanesFor([
      { start: at(9), end: at(11) },
      { start: at(10), end: at(12) },
    ]);
    expect(laneCount).toBe(2);
    expect(placed.map((p) => p.lane)).toEqual([0, 1]);
  });

  it('a lane is reused as soon as it is free', () => {
    /* Three events, the first two overlapping and the third after both: two
       lanes, and the third takes lane 0 rather than opening a third. */
    const { placed, laneCount } = lanesFor([
      { start: at(9), end: at(11) },
      { start: at(10), end: at(12) },
      { start: at(13), end: at(14) },
    ]);
    expect(laneCount).toBe(2);
    expect(placed[2].lane).toBe(0);
  });

  it('touching at the boundary is not an overlap', () => {
    /* An event ending at 10:00 and one starting at 10:00 do not collide —
       otherwise a full day of back-to-back bookings would stack into as many
       lanes as there are bookings. */
    expect(lanesFor([{ start: at(9), end: at(10) }, { start: at(10), end: at(11) }]).laneCount).toBe(1);
  });

  it('the row grows with the lanes it has to hold', () => {
    expect(rowHeight(3)).toBeGreaterThan(rowHeight(1));
  });

  it('sorts by start, whatever order it is given', () => {
    const { placed } = lanesFor([
      { start: at(14), end: at(15) },
      { start: at(9), end: at(10) },
    ]);
    expect(placed[0].ev.start).toBe(at(9));
  });
});

const ROOMS = [{ id: 'r1', room: 'Main Hall', building: 'Aurora', cap: 100 }];
const EV = {
  id: 'e1', roomId: 'r1', type: 'event', title: 'Rehearsal',
  start: at(9), end: at(11),
};
const sched = (props = {}) => mount(ApexScheduler, {
  props: { resources: ROOMS, events: [EV], anchor: new Date(DAY), ...props },
});

describe('ApexScheduler', () => {
  it('draws a row per resource and a block per event', () => {
    const w = sched();
    expect(w.findAll('.apex-sched__rowhead').length).toBe(1);
    expect(w.findAll('.apex-sched__ev').length).toBeGreaterThan(0);
  });

  it('groups rows by the keys it is given', async () => {
    const w = sched({
      resources: [
        { id: 'r1', room: 'Main Hall', building: 'Aurora', cap: 100 },
        { id: 'r2', room: 'Studio A', building: 'Riverside', cap: 40 },
      ],
      groupFields: [{ key: 'building', label: 'Building' }],
      groupKeys: ['building'],
    });
    /* `__grouping` is the toolbar control, not a row: one of it, listing the
       fields the rows are nested by. The rows themselves are `__rowhead`. */
    expect(w.findAll('.apex-sched__grouping').length).toBe(1);
    expect(w.find('.apex-sched__glabel').exists()).toBe(true);
    expect(w.findAll('.apex-sched__rowhead').length).toBeGreaterThan(1);
  });

  it('reports a click rather than selecting anything itself', async () => {
    /* On a DISCRETE axis a block cannot be dragged, so pointerdown opens the
       popover and reports the click straight away. On a continuous axis the
       same handler starts a drag instead and the click is decided on pointerup
       — one gesture, two meanings, which is why the month mode is the honest
       one to assert a click against. */
    const w = sched({ mode: 'month' });
    /* A discrete axis draws chips, not blocks — the continuous one draws
       `__ev`. Same event, two renderings. */
    await w.find('.apex-sched__chip').trigger('click');
    const p = w.emitted('event-click')?.[0][0] as { instance?: { id?: string } };
    expect(p?.instance?.id).toBe('e1');
  });

  it('the mode is bindable, so the host owns the granularity', async () => {
    /* Mode is not reflected as an attribute; what changes is the axis it
       draws, which is the thing a reader actually sees. */
    const w = sched({ mode: 'day' });
    const day = w.findAll('.apex-sched__cell').length;
    await w.setProps({ mode: 'month' });
    expect(w.findAll('.apex-sched__cell').length).not.toBe(day);
  });
});

const CAL_EV = [
  { id: 'c1', title: 'Board meeting', type: 'event', start: at(9, 30), end: at(11) },
  { id: 'c2', title: 'Conference', type: 'event', allDay: true as const, startDate: '2026-01-05', endDate: '2026-01-07' },
];
const cal = (props = {}) => mount(ApexCalendar, {
  props: { events: CAL_EV, anchor: new Date(DAY), ...props },
});

describe('ApexCalendar — every view renders its own furniture', () => {
  it('month draws a day grid', () => {
    const w = cal({ view: 'month' });
    expect(w.findAll('.apex-calendar__cell').length).toBeGreaterThan(27);
    expect(w.find('.apex-calendar__tg').exists()).toBe(false);
  });

  it('week draws a time grid, not a day grid', () => {
    const w = cal({ view: 'week' });
    expect(w.find('.apex-calendar__tg').exists()).toBe(true);
    expect(w.findAll('.apex-calendar__col').length).toBe(7);
  });

  it('day is the same grid, one column wide', () => {
    const w = cal({ view: 'day' });
    expect(w.find('.apex-calendar__tg').exists()).toBe(true);
    expect(w.findAll('.apex-calendar__col').length).toBe(1);
  });

  it('list draws an agenda', () => {
    const w = cal({ view: 'list' });
    expect(w.find('.apex-calendar__list').exists()).toBe(true);
    expect(w.find('.apex-calendar__tg').exists()).toBe(false);
  });

  it('year draws twelve months', () => {
    const w = cal({ view: 'year' });
    expect(w.findAll('.apex-calendar__mini').length).toBe(12);
  });
});

describe('ApexCalendar — reporting, not applying', () => {
  it('a day click names the day it was on', async () => {
    const w = cal({ view: 'month' });
    await w.findAll('.apex-calendar__cell')[10].trigger('click');
    const p = w.emitted('date-click')?.[0][0] as { key?: string };
    expect(p?.key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('an all-day event spans its days as one bar per week it crosses', () => {
    const w = cal({ view: 'month' });
    /* One bar per week-row the span touches — not one per day. A three-day
       span inside one week is one bar; the month grid's leading and trailing
       weeks can each carry their own segment. */
    const bars = w.findAll('.apex-calendar__bar-ev');
    expect(bars.length).toBeLessThan(3);
    expect(bars.length).toBeGreaterThan(0);
  });
});
