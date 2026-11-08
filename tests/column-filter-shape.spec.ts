import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexColumnFilter from '../src/components/ApexColumnFilter.vue';

/**
 * The two display modes do NOT emit the same model, and a consumer that reads the wrong shape
 * gets a filter that applies, updates and changes nothing.
 *
 *   row     { value, matchMode }
 *   menu    { operator, constraints: [{ value, matchMode }] }   <- no top-level `value`
 *
 * That difference cost a real screen: a table was moved from `filter-display="row"` to `"menu"`
 * to match a sibling, and its `onFilter` went on reading `e.filters.status.value`. The panel
 * applied, the model updated, the request went out with the parameter MISSING, and the rows
 * never changed. Nothing failed anywhere — `undefined` is a legal filter value meaning "none".
 *
 * So the shapes are pinned here. They are a published contract, not an implementation detail:
 * every lazy table in every consuming app unwraps this by hand, because a lazy table filters
 * on the server and the model is the only thing it is given.
 */

const SELECT = {
  field: 'status',
  header: 'Status',
  filter: true,
  filterType: 'select',
  filterMatchMode: 'equals',
  filterOptions: [
    { value: 'active', label: 'Subscribed' },
    { value: 'unsubscribed', label: 'Unsubscribed' },
  ],
};

describe('the filter model has two shapes, and they are not interchangeable', () => {
  it('ROW mode emits a flat { value, matchMode }', async () => {
    const w = mount(ApexColumnFilter, { props: { column: SELECT, mode: 'row' } });

    await w.find('select').setValue('active');

    const payload = w.emitted('update')?.at(-1)?.[0] as Record<string, unknown>;
    expect(payload).toBeTruthy();
    expect(payload.value).toBe('active');
    expect(payload.matchMode).toBe('equals');
    /* No wrapper. A consumer written for the menu would find nothing here. */
    expect(payload.constraints).toBeUndefined();
  });

  it('MENU mode emits constraints, and NO top-level value', async () => {
    const w = mount(ApexColumnFilter, { props: { column: SELECT, mode: 'menu' } });

    /* Open the panel — the rules and the Apply button do not exist until it is open. */
    await w.find('button.apex-dtf__trigger').trigger('click');

    /* Two selects per rule: the match mode, then the value. */
    const selects = w.findAll('.apex-dtf__rule select');
    expect(selects).toHaveLength(2);
    await selects[1].setValue('active');

    await w.findAll('.apex-dtf__actions button')[1].trigger('click');

    const payload = w.emitted('update')?.at(-1)?.[0] as Record<string, any>;
    expect(payload).toBeTruthy();
    expect(payload.operator).toBe('and');
    expect(payload.constraints).toEqual([{ value: 'active', matchMode: 'equals' }]);

    /* The whole point. This is what a consumer reads, and it is undefined — which is
       indistinguishable from "the user cleared the filter". */
    expect(payload.value).toBeUndefined();
  });

  it('a menu payload survives the unwrapping every lazy consumer has to do', async () => {
    /* The reader a consuming screen needs: first non-empty rule, either shape. Kept here as
       the worked example, so the next person copies something that handles both. */
    const filterValue = (meta: any) => {
      if (!meta) return null;
      const rules = Array.isArray(meta.constraints) ? meta.constraints : [meta];
      const hit = rules.find((c: any) => c && c.value !== null && c.value !== undefined && c.value !== '');
      return hit ? hit.value : null;
    };

    expect(filterValue({ value: 'active', matchMode: 'equals' })).toBe('active');
    expect(filterValue({ operator: 'and', constraints: [{ value: 'active', matchMode: 'equals' }] })).toBe('active');

    /* An empty rule is not a filter. The menu emits one of these when Apply is pressed with
       the value left on the dash, and it must read as "no filter" rather than as the string. */
    expect(filterValue({ operator: 'and', constraints: [{ value: '', matchMode: 'equals' }] })).toBeNull();
    expect(filterValue({ operator: 'and', constraints: [{ value: null, matchMode: 'equals' }] })).toBeNull();
    expect(filterValue(undefined)).toBeNull();
  });

  it('Apply with nothing chosen emits an empty constraint rather than a filter', async () => {
    const w = mount(ApexColumnFilter, { props: { column: SELECT, mode: 'menu' } });

    await w.find('button.apex-dtf__trigger').trigger('click');
    await w.findAll('.apex-dtf__actions button')[1].trigger('click');

    const payload = w.emitted('update')?.at(-1)?.[0] as Record<string, any>;
    expect(payload.constraints).toEqual([{ value: null, matchMode: 'equals' }]);
  });
});
