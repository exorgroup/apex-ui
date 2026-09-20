import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexDatePicker from '../src/components/ApexDatePicker.vue';

describe('ApexDatePicker — shared ui keys', () => {
  const ui = { control: 'my-ctl', input: 'my-in', icon: 'my-ico', button: 'my-btn' };

  it('the control box, input, icon and buttons take the shared keys', () => {
    // showIcon renders the trailing calendar button; clearable + a value
    // renders the clear button. Both are .apex-ctl__btn.
    const w = mount(ApexDatePicker, {
      props: { label: 'When', modelValue: '2026-09-03', clearable: true, showIcon: true, ui },
    });
    expect(w.find('.apex-ctl.my-ctl').exists()).toBe(true);
    expect(w.find('.apex-ctl__input.my-in').exists()).toBe(true);
    expect(w.findAll('.apex-ctl__btn.my-btn').length).toBe(2);
  });

  it('the leading icon takes ui.icon when showIcon is off', () => {
    const w = mount(ApexDatePicker, { props: { label: 'When', showIcon: false, ui } });
    expect(w.find('.apex-ctl__icon.my-ico').exists()).toBe(true);
  });

  it('the shared field parts still work — they always did', () => {
    const w = mount(ApexDatePicker, {
      props: { label: 'When', help: 'pick one', ui: { root: 'r', label: 'l', message: 'm' } },
    });
    expect(w.find('.apex-field.r').exists()).toBe(true);
    expect(w.find('.apex-field__label.l').exists()).toBe(true);
    expect(w.find('.apex-field__msg.m').exists()).toBe(true);
  });

  it('an untouched picker carries none of them', () => {
    const w = mount(ApexDatePicker, { props: { label: 'When' } });
    expect(w.find('.apex-ctl').attributes('class')).toBe('apex-ctl');
  });
});

describe('ApexDatePicker — appearance props', () => {
  const PROPS = {
    calendarBackground: '#101820', calendarBorderColor: '#243040',
    calendarRadius: '14px', calendarShadow: '0 8px 30px #0008',
    dayColor: '#E8EEF7', dayRadius: '10px', dayHoverBackground: '#1D2735',
    daySelectedBackground: '#7AA2F7', daySelectedColor: '#0B0F14',
    dayTodayRing: '#3B4A61', dayOutsideColor: '#5A6B7D', dayRangeBackground: '#16202C',
  };

  it('each of the twelve reaches its variable', () => {
    const w = mount(ApexDatePicker, { props: { label: 'When', inline: true, ...PROPS } });
    const style = w.find('.apex-cal').element.parentElement!.getAttribute('style') || '';
    for (const v of ['--apex-dp-bg', '--apex-dp-border', '--apex-dp-radius', '--apex-dp-shadow',
      '--apex-dp-day-fg', '--apex-dp-day-radius', '--apex-dp-day-hover-bg',
      '--apex-dp-day-selected-bg', '--apex-dp-day-selected-fg', '--apex-dp-day-today-ring',
      '--apex-dp-day-outside-fg', '--apex-dp-day-range-bg']) {
      expect(style, v).toContain(v);
    }
  });

  it('the calendar is a descendant, so the variables cascade to it', () => {
    const w = mount(ApexDatePicker, {
      props: { label: 'When', inline: true, daySelectedBackground: '#7AA2F7' },
    });
    const wrap = w.find('.apex-cal').element.parentElement!;
    expect(wrap.getAttribute('style')).toContain('--apex-dp-day-selected-bg');
  });

  it('positioning survives — the popover still anchors to the box', () => {
    const w = mount(ApexDatePicker, { props: { label: 'When' } });
    expect(w.find('.apex-ctl').element.parentElement!.getAttribute('style'))
      .toContain('position: relative');
  });

  it('an untouched picker sets no variables at all', () => {
    const w = mount(ApexDatePicker, { props: { label: 'When' } });
    const style = w.find('.apex-ctl').element.parentElement!.getAttribute('style') || '';
    expect(style).not.toContain('--apex-cal');
  });

  it('the appearance props do not leak onto ApexField', () => {
    const w = mount(ApexDatePicker, { props: { label: 'When', dayColor: '#E8EEF7' } });
    expect(w.find('.apex-field').attributes('daycolor')).toBeUndefined();
    expect(w.find('.apex-field').attributes('style') || '').not.toContain('--apex-cal');
  });
});

describe('ApexDatePicker — the calendar class map', () => {
  const ui = {
    calendar: 'c-cal', nav: 'c-nav', title: 'c-title', months: 'c-months',
    month: 'c-month', monthLabel: 'c-mlabel', grid: 'c-grid', weekday: 'c-wd',
    day: 'c-day', pick: 'c-pick', time: 'c-time', spin: 'c-spin',
    meridiem: 'c-mer', bar: 'c-bar',
  };

  it('the date view, with two months, a time row and a button bar', () => {
    const w = mount(ApexDatePicker, {
      props: {
        label: 'When', inline: true, numberOfMonths: 2, showTime: true,
        showSeconds: true, hourFormat: '12', showButtonBar: true, ui,
      },
    });
    expect(w.find('.apex-cal.c-cal').exists()).toBe(true);
    expect(w.find('.apex-cal__nav.c-nav').exists()).toBe(true);
    expect(w.find('.apex-cal__title.c-title').exists()).toBe(true);
    expect(w.find('.apex-cal__months.c-months').exists()).toBe(true);
    // Two columns, each with its caption and its own grid.
    expect(w.findAll('.apex-cal__month.c-month').length).toBe(2);
    expect(w.findAll('.apex-cal__mlabel.c-mlabel').length).toBe(2);
    expect(w.findAll('.apex-cal__grid.c-grid').length).toBe(2);
    expect(w.findAll('.apex-cal__wd.c-wd').length).toBe(14);
    expect(w.findAll('.apex-cal__day.c-day').length).toBeGreaterThan(50);
    // Hours, minutes and seconds are three separate spinners.
    expect(w.find('.apex-cal__time.c-time').exists()).toBe(true);
    expect(w.findAll('.apex-cal__spin.c-spin').length).toBe(3);
    expect(w.find('.apex-cal__mer.c-mer').exists()).toBe(true);
    expect(w.find('.apex-cal__bar.c-bar').exists()).toBe(true);
  });

  it('the month and the year grid both take pick', async () => {
    const w = mount(ApexDatePicker, { props: { label: 'When', inline: true, view: 'month', ui } });
    expect(w.find('.apex-cal__pick.c-pick').exists()).toBe(true);
    const w2 = mount(ApexDatePicker, { props: { label: 'When', inline: true, view: 'year', ui } });
    expect(w2.find('.apex-cal__pick.c-pick').exists()).toBe(true);
  });

  it('the inline modifier still applies alongside a custom class', () => {
    const w = mount(ApexDatePicker, { props: { label: 'When', inline: true, ui } });
    const cls = w.find('.apex-cal').attributes('class') || '';
    expect(cls).toContain('apex-cal--inline');
    expect(cls).toContain('c-cal');
  });

  it('an untouched calendar carries only its own classes', () => {
    const w = mount(ApexDatePicker, { props: { label: 'When', inline: true } });
    expect(w.find('.apex-cal__nav').attributes('class')).toBe('apex-cal__nav');
    expect(w.find('.apex-cal__day').attributes('class')).toBe('apex-cal__day');
  });
});
