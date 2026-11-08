import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexColumnFilter from '../src/components/ApexColumnFilter.vue';
import { matches } from '../src/core/table';

/**
 * "Any of" could never hold more than one value.
 *
 * The filter menu offers a select column three modes — `in` ("Any of"), `equals`, `notEquals` —
 * and drew the SAME single-value dropdown for all three. So "Any of" emitted a string, and
 * `matches()` reads:
 *
 *     case 'in': return Array.isArray(filter) ? ... : false;
 *
 * A non-array is FALSE for every row. On a client-side table "Any of" therefore emptied the
 * table; on a lazy one it arrived at the server as an ordinary scalar and behaved exactly like
 * Equals, which is how it was reported.
 *
 * `notEquals` had the matching fault one level up: a lazy consumer that reads only the VALUE out
 * of the model throws the mode away, so every mode becomes equality. That half is the host's to
 * fix, and `column-filter-shape.spec.ts` pins the shape it has to read.
 */

const SELECT = {
  field: 'pref',
  header: 'Preference',
  filter: true,
  filterType: 'select',
  filterMatchMode: 'equals',
  filterOptions: [
    { value: 'all_news', label: 'All news' },
    { value: 'events_only', label: 'Events only' },
    { value: 'similar_events', label: 'Similar events' },
  ],
};

const openMenu = async (props: Record<string, unknown> = {}) => {
  const w = mount(ApexColumnFilter, { props: { column: SELECT, mode: 'menu', ...props } });
  await w.find('button.apex-dtf__trigger').trigger('click');
  return w;
};

/** The match-mode select is the first control in a rule. */
const chooseMode = async (w: ReturnType<typeof mount>, mode: string) => {
  await w.findAll('.apex-dtf__rule select')[0].setValue(mode);
};

const applied = async (w: ReturnType<typeof mount>) => {
  await w.findAll('.apex-dtf__actions button')[1].trigger('click');
  return (w.emitted('update')?.at(-1)?.[0] as any);
};

describe('"Any of" holds a list', () => {
  it('draws a tick list, not a dropdown', async () => {
    const w = await openMenu();

    /* Equals first: one dropdown for the value. */
    expect(w.find('.apex-dtf__anyof').exists()).toBe(false);
    expect(w.findAll('.apex-dtf__rule select')).toHaveLength(2);

    await chooseMode(w, 'in');

    const list = w.find('.apex-dtf__anyof');
    expect(list.exists()).toBe(true);
    expect(list.findAll('input[type="checkbox"]')).toHaveLength(3);
    /* The value dropdown is gone — only the match-mode select is left. */
    expect(w.findAll('.apex-dtf__rule select')).toHaveLength(1);
  });

  it('emits an ARRAY, which is the only thing `matches` accepts for `in`', async () => {
    const w = await openMenu();
    await chooseMode(w, 'in');

    const boxes = w.findAll('.apex-dtf__anyof input[type="checkbox"]');
    await boxes[0].setValue(true);
    await boxes[2].setValue(true);

    const payload = await applied(w);
    expect(payload.constraints).toEqual([
      { value: ['all_news', 'similar_events'], matchMode: 'in' },
    ]);

    /* The point of the array: two of the three now match, the middle one does not. */
    const chosen = payload.constraints[0].value;
    expect(matches('all_news', chosen, 'in')).toBe(true);
    expect(matches('similar_events', chosen, 'in')).toBe(true);
    expect(matches('events_only', chosen, 'in')).toBe(false);

    /* And the fault this replaces: the same rule carrying a STRING matches nothing at all. */
    expect(matches('all_news', 'all_news', 'in')).toBe(false);
  });

  it('un-ticking removes just that one', async () => {
    const w = await openMenu();
    await chooseMode(w, 'in');

    const boxes = w.findAll('.apex-dtf__anyof input[type="checkbox"]');
    await boxes[0].setValue(true);
    await boxes[1].setValue(true);
    await boxes[0].setValue(false);

    expect((await applied(w)).constraints[0].value).toEqual(['events_only']);
  });

  it('carries a chosen value ACROSS a mode change rather than dropping it', async () => {
    const w = await openMenu();

    /* Pick a value under Equals... */
    await w.findAll('.apex-dtf__rule select')[1].setValue('events_only');
    /* ...then change your mind about the mode. */
    await chooseMode(w, 'in');

    expect((await applied(w)).constraints[0]).toEqual({ value: ['events_only'], matchMode: 'in' });
  });

  it('and back again, without leaving an array behind', async () => {
    const w = await openMenu();
    await chooseMode(w, 'in');
    await w.findAll('.apex-dtf__anyof input[type="checkbox"]')[1].setValue(true);
    await chooseMode(w, 'notEquals');

    /* A `notEquals` whose value is still `['events_only']` would compare a string against an
       array and never be equal, so the filter would match every row. */
    expect((await applied(w)).constraints[0]).toEqual({ value: 'events_only', matchMode: 'notEquals' });
  });
});

describe('an empty list is not a filter', () => {
  it('does not light the filter icon', async () => {
    const w = mount(ApexColumnFilter, {
      props: {
        column: SELECT,
        mode: 'menu',
        meta: { operator: 'and', constraints: [{ value: [], matchMode: 'in' }] },
      },
    });

    /* `[]` is neither null nor '', so this used to read as an active filter: a lit icon over
       unfiltered rows, and a Clear button that appeared to do nothing. */
    expect(w.find('button.apex-dtf__trigger').attributes('data-on')).toBe('false');
  });

  it('but a filled one does', async () => {
    const w = mount(ApexColumnFilter, {
      props: {
        column: SELECT,
        mode: 'menu',
        meta: { operator: 'and', constraints: [{ value: ['all_news'], matchMode: 'in' }] },
      },
    });

    expect(w.find('button.apex-dtf__trigger').attributes('data-on')).toBe('true');
  });
});
