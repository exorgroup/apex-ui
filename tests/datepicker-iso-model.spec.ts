import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexDatePicker from '../src/components/ApexDatePicker.vue';

/**
 * An ISO-8601 model value must not be read through `dateFormat`.
 *
 * `toDate()` used to hand ANY non-Date straight to `parseDate(v, props.dateFormat)`,
 * and `dateFormat` describes what the INPUT SHOWS, not what the model holds. Every
 * server that speaks JSON sends ISO-8601, so the default `dd/mm/yy` chewed through
 * `2026-05-22T17:10:33.000000Z` as:
 *
 *     dd -> "20"        day 20
 *     /  -> skip one    (eats the '2' of 2026)
 *     mm -> "6"         month 6, because the next char is '-'
 *     /  -> skip one
 *     yy -> "05"        year 5, which JS maps into the 1900s
 *
 * and produced **20/06/1905**. Found in APEX TBX on a blog post whose real
 * `published_at` was 2026-05-22 (Phase Z, screen 1 of 14).
 *
 * It also made the form dirty the moment it opened: the mangled date was emitted
 * straight back through `out()`, so a dialog nobody had touched said "Unsaved
 * changes".
 */
describe('ApexDatePicker — an ISO model value', () => {
  const shown = (w: ReturnType<typeof mount>) =>
    (w.find('.apex-ctl__input').element as HTMLInputElement).value;

  it('reads a full ISO-8601 timestamp, not dateFormat', () => {
    const w = mount(ApexDatePicker, {
      props: { label: 'When', modelValue: '2026-05-22T17:10:33.000000Z' },
    });
    expect(shown(w)).toContain('22/05/2026');
  });

  it('does not produce the 1905 date that started this', () => {
    const w = mount(ApexDatePicker, {
      props: { label: 'When', modelValue: '2026-05-22T17:10:33.000000Z' },
    });
    expect(shown(w)).not.toContain('1905');
  });

  it('reads a date-only ISO string', () => {
    const w = mount(ApexDatePicker, { props: { label: 'When', modelValue: '2026-09-03' } });
    expect(shown(w)).toContain('03/09/2026');
  });

  it('reads a space-separated SQL datetime', () => {
    const w = mount(ApexDatePicker, {
      props: { label: 'When', modelValue: '2026-05-22 17:10:33' },
    });
    expect(shown(w)).toContain('22/05/2026');
  });

  it('still reads a string in the display format', () => {
    const w = mount(ApexDatePicker, { props: { label: 'When', modelValue: '22/05/2026' } });
    expect(shown(w)).toContain('22/05/2026');
  });

  it('still honours a NON-default dateFormat for a display-format string', () => {
    const w = mount(ApexDatePicker, {
      props: { label: 'When', modelValue: '05/22/2026', dateFormat: 'mm/dd/yy' },
    });
    expect(shown(w)).toContain('05/22/2026');
  });

  it('a Date still passes through untouched', () => {
    const w = mount(ApexDatePicker, {
      props: { label: 'When', modelValue: new Date(2026, 4, 22) },
    });
    expect(shown(w)).toContain('22/05/2026');
  });

  it('an unparseable string is still nothing, not a wrong date', () => {
    const w = mount(ApexDatePicker, { props: { label: 'When', modelValue: 'not a date' } });
    expect(shown(w)).toBe('');
  });
});
