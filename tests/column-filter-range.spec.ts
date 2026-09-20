import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexColumnFilter from '../src/components/ApexColumnFilter.vue';
import ApexDatePicker from '../src/components/ApexDatePicker.vue';
import { matches } from '../src/core/table';

/**
 * A RANGE in the filter row.
 *
 * `between` existed, but only in the filter MENU and only as two number inputs. A date column
 * therefore offered "is / is not / before / after" and no way to say "that week" — which is the
 * commonest thing anyone wants from a date column, and it took two filters or none.
 *
 * Two halves, and both were broken in a way that looked fine:
 *
 *   the ROW    had no `between` branch at all, so a column asking for it fell through to the
 *              single input and the second bound had nowhere to go.
 *   `matches`  coerced both sides with `Number()`, which turns "2026-09-20" into NaN — every
 *              comparison false, so the filter returned TRUE for every row. A date range
 *              silently matched everything rather than failing where somebody would see it.
 */

const col = (extra: Record<string, unknown> = {}) => ({
  field: 'when', header: 'When', filter: true, filterType: 'date', ...extra,
});

describe('a DATE range is a calendar, not two boxes', () => {
  /* Two independent date inputs take a `from` after its `to` without complaint, and the only
     feedback is an empty table — which is what a screenshot of this screen showed:
     `from=2026-09-18&to=2026-09-13`, no rows, nothing saying why. A range picker cannot
     produce that state: it re-orders the pair on the second click. */

  it('uses the range picker, with two months', () => {
    const w = mount(ApexColumnFilter, {
      props: { column: col({ filterMatchMode: 'between' }), mode: 'row' },
    });

    const picker = w.findComponent(ApexDatePicker);
    expect(picker.exists()).toBe(true);
    expect(picker.props('selectionMode')).toBe('range');
    expect(picker.props('numberOfMonths')).toBe(2);
    expect(w.findAll('.apex-dtf__pair')).toHaveLength(0);
  });

  it('opens the calendar when the FIELD is clicked, not just the icon', async () => {
    /* Reported as "clicked on the date and it did not open the calendar". It was not broken —
       `ApexDatePicker` opens from its icon button, and clicking the text focuses it to TYPE.
       That is the right default for a single date and wrong for a range: nobody types
       "01/09/2026 - 30/09/2026", and in a filter cell the icon is small enough that hunting
       for it reads as a dead control. `readonly-input` makes the whole thing a button. */
    const w = mount(ApexColumnFilter, {
      props: { column: col({ filterMatchMode: 'between' }), mode: 'row' },
      attachTo: document.body,
    });

    expect(w.find('.apex-cal').exists()).toBe(false);

    await w.find('.apex-dtf__range input').trigger('click');

    expect(w.find('.apex-cal').exists()).toBe(true);
    w.unmount();
  });

  it('shows TWO months when it opens', async () => {
    /* A range that crosses a month is the ordinary case, and picking one across a single
       calendar means paging forward between the two clicks. */
    const w = mount(ApexColumnFilter, {
      props: { column: col({ filterMatchMode: 'between' }), mode: 'row' },
      attachTo: document.body,
    });

    await w.find('.apex-dtf__range input').trigger('click');

    expect(w.findAll('.apex-cal__grid').length).toBe(2);
    w.unmount();
  });

  it('seeds the picker from the filter already applied', () => {
    /* Or a shared link would draw filtered rows above an empty control. */
    const w = mount(ApexColumnFilter, {
      props: {
        column: col({ filterMatchMode: 'between' }),
        mode: 'row',
        meta: { value: ['2026-09-01', '2026-09-30'], matchMode: 'between' },
      },
    });

    const model = w.findComponent(ApexDatePicker).props('modelValue') as Date[];
    expect(model).toHaveLength(2);
    expect(model[0].getDate()).toBe(1);
    expect(model[1].getDate()).toBe(30);
  });

  it('emits ISO days built from LOCAL parts', () => {
    /* Never `toISOString()`. That converts to UTC first, so anyone east of Greenwich loses a
       day off the end of their range and anyone west gains one — a bug that appears for some
       users in some months, which is the worst kind to be told about.
       A late-evening Date is the case that exposes it. */
    const w = mount(ApexColumnFilter, {
      props: { column: col({ filterMatchMode: 'between' }), mode: 'row' },
    });

    w.findComponent(ApexDatePicker).vm.$emit('update:modelValue', [
      new Date(2026, 8, 1, 23, 30),
      new Date(2026, 8, 30, 23, 30),
    ]);

    const last = w.emitted('update')?.slice(-1)[0]?.[0] as { value: unknown; matchMode: string };
    expect(last.value).toEqual(['2026-09-01', '2026-09-30']);
    expect(last.matchMode).toBe('between');
  });

  it('a half-chosen range keeps the bound it has', () => {
    const w = mount(ApexColumnFilter, {
      props: { column: col({ filterMatchMode: 'between' }), mode: 'row' },
    });

    w.findComponent(ApexDatePicker).vm.$emit('update:modelValue', [new Date(2026, 8, 1), null]);

    expect((w.emitted('update')?.slice(-1)[0]?.[0] as { value: unknown }).value)
      .toEqual(['2026-09-01', '']);
  });

  it('clearing it clears the FILTER, not just the boxes', () => {
    /* Two empty strings would still count as an active filter, so the table's clear-all button
       would hang around with nothing left to clear. */
    const w = mount(ApexColumnFilter, {
      props: {
        column: col({ filterMatchMode: 'between' }),
        mode: 'row',
        meta: { value: ['2026-09-01', '2026-09-30'], matchMode: 'between' },
      },
    });

    w.findComponent(ApexDatePicker).vm.$emit('update:modelValue', [null, null]);

    expect((w.emitted('update')?.slice(-1)[0]?.[0] as { value: unknown }).value).toBe('');
  });
});

describe('the row still draws a pair for everything that is NOT a date', () => {
  it('a number column gets two number boxes', () => {
    const w = mount(ApexColumnFilter, {
      props: { column: col({ filterType: 'number', filterMatchMode: 'between' }), mode: 'row' },
    });

    const inputs = w.findAll('.apex-dtf__pair input');
    expect(inputs).toHaveLength(2);
    expect(inputs[0].attributes('type')).toBe('number');
    expect(w.findComponent(ApexDatePicker).exists()).toBe(false);
  });

  it('sends BOTH bounds, with the empty one kept', () => {
    const w = mount(ApexColumnFilter, {
      props: { column: col({ filterType: 'number', filterMatchMode: 'between' }), mode: 'row' },
    });

    w.findAll('.apex-dtf__pair input')[0].setValue('5');

    const first = w.emitted('update')?.[0]?.[0] as { value: unknown; matchMode: string };
    expect(first.matchMode).toBe('between');
    expect(first.value).toEqual(['5', '']);
  });

  it('still draws ONE input for the ordinary date modes', () => {
    /* `between` is opt-in. A date column that did not ask for it keeps the single box, so this
       change cannot alter a screen that was happy. */
    const w = mount(ApexColumnFilter, { props: { column: col(), mode: 'row' } });

    expect(w.findAll('.apex-dtf__pair input')).toHaveLength(0);
    expect(w.findComponent(ApexDatePicker).exists()).toBe(false);
    expect(w.findAll('input')).toHaveLength(1);
  });
});

describe('matches() understands a date range', () => {
  it('includes BOTH ends of the range', () => {
    /* Somebody typing two dates means those two days inclusive, not the gap between them. */
    expect(matches('2026-09-01', ['2026-09-01', '2026-09-30'], 'between')).toBe(true);
    expect(matches('2026-09-30', ['2026-09-01', '2026-09-30'], 'between')).toBe(true);
    expect(matches('2026-09-15', ['2026-09-01', '2026-09-30'], 'between')).toBe(true);
  });

  it('excludes what falls outside it', () => {
    expect(matches('2026-08-31', ['2026-09-01', '2026-09-30'], 'between')).toBe(false);
    expect(matches('2026-10-01', ['2026-09-01', '2026-09-30'], 'between')).toBe(false);
  });

  it('compares whole DAYS, so a time of day does not fall out of its own range', () => {
    expect(matches('2026-09-30T23:50:00', ['2026-09-01', '2026-09-30'], 'between')).toBe(true);
  });

  it('a one-sided range still bounds the side it has', () => {
    expect(matches('2026-09-15', ['2026-09-01', ''], 'between')).toBe(true);
    expect(matches('2026-08-15', ['2026-09-01', ''], 'between')).toBe(false);
    expect(matches('2026-09-15', ['', '2026-09-30'], 'between')).toBe(true);
    expect(matches('2026-10-15', ['', '2026-09-30'], 'between')).toBe(false);
  });

  it('NUMBERS still work exactly as they did', () => {
    /* The regression this change could have caused. Numbers are the shape `between` was built
       for and the only shape anything in the wild uses today. */
    expect(matches(5, [1, 10], 'between')).toBe(true);
    expect(matches(11, [1, 10], 'between')).toBe(false);
    expect(matches(0, [1, 10], 'between')).toBe(false);
    expect(matches(5, [1, ''], 'between')).toBe(true);
  });

  it('a value that is not a date at all is excluded from a date range', () => {
    /* Rather than being let through, which is what the old numeric-only code did with every
       row when the bounds were dates. */
    expect(matches('not a date', ['2026-09-01', '2026-09-30'], 'between')).toBe(false);
  });
});
