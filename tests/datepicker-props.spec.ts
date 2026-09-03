import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexDatePicker from '../src/components/ApexDatePicker.vue';

/** The calendar rendered in place, so no click is needed to inspect it. */
const cal = (props: Record<string, unknown>) =>
  mount(ApexDatePicker, { props: { label: 'When', inline: true, ...props } });

describe('ApexDatePicker — the props the gallery exposes', () => {
  it('view: month and year render their grids instead of days', () => {
    expect(cal({ view: 'month' }).findAll('.apex-cal__pick button').length).toBe(12);
    expect(cal({ view: 'year' }).findAll('.apex-cal__pick button').length).toBe(12);
    expect(cal({ view: 'date' }).findAll('.apex-cal__pick').length).toBe(0);
  });

  it('numberOfMonths renders that many columns, each captioned', () => {
    const w = cal({ numberOfMonths: 3 });
    expect(w.findAll('.apex-cal__month').length).toBe(3);
    expect(w.findAll('.apex-cal__mlabel').length).toBe(3);
    // One caption per column, and they are consecutive months.
    const labels = w.findAll('.apex-cal__mlabel').map((p) => p.text());
    expect(new Set(labels).size).toBe(3);
  });

  it('showTime, showSeconds and hourFormat build the right spinner set', () => {
    expect(cal({ showTime: true }).findAll('.apex-cal__spin').length).toBe(2);
    expect(cal({ showTime: true, showSeconds: true }).findAll('.apex-cal__spin').length).toBe(3);
    expect(cal({ showTime: true, hourFormat: '12' }).find('.apex-cal__mer').exists()).toBe(true);
    expect(cal({ showTime: true, hourFormat: '24' }).find('.apex-cal__mer').exists()).toBe(false);
  });

  it('timeOnly drops the calendar and keeps the clock', () => {
    const w = cal({ timeOnly: true });
    expect(w.find('.apex-cal__grid').exists()).toBe(false);
    expect(w.find('.apex-cal__time').exists()).toBe(true);
  });

  it('showButtonBar adds Today and Clear', () => {
    expect(cal({ showButtonBar: true }).findAll('.apex-cal__bar button').length).toBe(2);
    expect(cal({}).find('.apex-cal__bar').exists()).toBe(false);
  });

  /** Click a day and feed the emitted value back, the way v-model does. */
  const pickDay = async (w: ReturnType<typeof cal>, i: number) => {
    await w.findAll('.apex-cal__day[data-outside="false"]')[i].trigger('click');
    const all = w.emitted('update:modelValue') as unknown[][];
    const v = all[all.length - 1][0];
    await w.setProps({ modelValue: v as never });
    return v;
  };

  it('selectionMode multiple keeps every pick; single replaces', async () => {
    const many = cal({ selectionMode: 'multiple' });
    await pickDay(many, 5);
    expect((await pickDay(many, 9) as unknown[]).length).toBe(2);

    const one = cal({ selectionMode: 'single' });
    await pickDay(one, 5);
    const v = await pickDay(one, 9);
    expect(Array.isArray(v)).toBe(false);
  });

  it('selectionMode range marks the days between the two ends', async () => {
    const w = cal({ selectionMode: 'range' });
    await pickDay(w, 5);
    const pair = await pickDay(w, 12) as unknown[];
    expect(pair.length).toBe(2);
    expect(w.findAll('.apex-cal__day[data-inrange="true"]').length).toBeGreaterThan(0);
  });

  it('modelType string emits a formatted string, date emits a Date', async () => {
    const asString = cal({ modelType: 'string', dateFormat: 'dd/mm/yy' });
    await asString.findAll('.apex-cal__day[data-outside="false"]')[3].trigger('click');
    const v = (asString.emitted('update:modelValue') as unknown[][])[0][0];
    expect(typeof v).toBe('string');
    expect(v).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);

    const asDate = cal({ modelType: 'date' });
    await asDate.findAll('.apex-cal__day[data-outside="false"]')[3].trigger('click');
    expect((asDate.emitted('update:modelValue') as unknown[][])[0][0]).toBeInstanceOf(Date);
  });

  it('minDate, maxDate, disabledDates and disabledDays each disable days', () => {
    const may = new Date(2026, 4, 15);
    const min = cal({ modelValue: may, minDate: new Date(2026, 4, 10) });
    expect(min.findAll('.apex-cal__day:disabled').length).toBeGreaterThan(0);

    const max = cal({ modelValue: may, maxDate: new Date(2026, 4, 20) });
    expect(max.findAll('.apex-cal__day:disabled').length).toBeGreaterThan(0);

    const specific = cal({ modelValue: may, disabledDates: [new Date(2026, 4, 14)] });
    expect(specific.findAll('.apex-cal__day:disabled').length).toBe(1);

    // Sundays only — five or six of them in any month, plus outside days.
    const weekly = cal({ modelValue: may, disabledDays: [0] });
    expect(weekly.findAll('.apex-cal__day:disabled').length).toBeGreaterThanOrEqual(4);
  });

  it('readonlyInput blocks typing but still opens the calendar', async () => {
    const w = mount(ApexDatePicker, { props: { label: 'When', readonlyInput: true } });
    const input = w.find('.apex-ctl__input');
    expect(input.attributes('readonly')).toBeDefined();
    await input.trigger('click');
    expect(w.find('.apex-cal').exists()).toBe(true);
  });

  it('month-change fires when the arrows move the cursor', async () => {
    const w = cal({});
    // The nav row is prev, the title's own buttons, then next.
    const navButtons = w.findAll('.apex-cal__nav > button');
    expect(navButtons.length).toBe(2);
    await navButtons[1].trigger('click');
    expect(w.emitted('month-change')).toBeTruthy();
  });

  it('the date slot replaces cell content', () => {
    const w = mount(ApexDatePicker, {
      props: { label: 'When', inline: true },
      slots: { date: '<em class="mine">{{ params.date.getDate() }}</em>' },
    });
    expect(w.findAll('.apex-cal__day .mine').length).toBeGreaterThan(27);
  });
});
