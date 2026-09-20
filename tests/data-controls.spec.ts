import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexPaginator from '../src/components/ApexPaginator.vue';
import ApexProgressBar from '../src/components/ApexProgressBar.vue';
import ApexTimeline from '../src/components/ApexTimeline.vue';
import ApexOrgChart from '../src/components/ApexOrgChart.vue';
import ApexDataView from '../src/components/ApexDataView.vue';
import ApexPickList from '../src/components/ApexPickList.vue';

/**
 * Behaviour for the six light data controls.
 *
 * They arrived in the library with a variable layer and a class prefix and no
 * tests at all, which is why AF2-251 could rename sixty variables across them
 * and the suite could not tell anyone whether the controls still worked. The
 * `ui` map is covered separately in ui-map.spec.ts; this is what they DO.
 *
 * Where a control has no events — ProgressBar and Timeline emit nothing — the
 * assertions are on what it derives and renders, because that is the whole of
 * its contract.
 */

const ROWS = Array.from({ length: 12 }, (_, i) => ({
  id: 'r' + i, product: 'P' + (11 - i), qty: i, price: 100 + i,
}));

describe('ApexPaginator', () => {
  const mk = (props = {}) => mount(ApexPaginator, {
    props: { totalRecords: 84, rows: 10, ...props },
  });

  it('reports the offset, not the page number', async () => {
    const w = mk();
    /* Page 3 of 10-row pages is offset 20. `first` is what a server takes,
       which is the reason the control is modelled on it. */
    await w.findAll('.apex-pager__btn--page')[2].trigger('click');
    expect(w.emitted('update:first')?.[0]).toEqual([20]);
    expect(w.emitted('page')?.[0]).toEqual([{ first: 20, rows: 10, page: 2 }]);
  });

  it('clamps at the last page rather than running past the end', async () => {
    const w = mk();
    const btns = w.findAll('.apex-pager__btn');
    await btns[btns.length - 1].trigger('click');
    /* 84 rows at 10 a page is nine pages, so the final offset is 80. */
    expect(w.emitted('update:first')?.[0]).toEqual([80]);
  });

  it('returns to the first row when the page size changes', async () => {
    const w = mk({ rowsPerPageOptions: [10, 20, 50], first: 40 });
    await w.find('.apex-pager__size select').setValue('20');
    /* Staying on offset 40 with a new page size lands the reader somewhere
       they did not ask to be. */
    expect(w.emitted('update:rows')?.[0]).toEqual([20]);
    expect(w.emitted('update:first')?.[0]).toEqual([0]);
  });

  it('disabled emits nothing at all', async () => {
    const w = mk({ disabled: true, first: 30 });
    await w.findAll('.apex-pager__btn')[0].trigger('click');
    expect(w.emitted('update:first')).toBeUndefined();
  });

  it('fills the summary template from the current window', () => {
    const w = mk({ first: 20, template: '{first}-{last} of {total}, page {page}/{pageCount}' });
    expect(w.find('.apex-pager__summary').text()).toBe('21-30 of 84, page 3/9');
  });
});

describe('ApexProgressBar', () => {
  it('derives the readout from value and max', () => {
    const w = mount(ApexProgressBar, { props: { value: 25, max: 200, showValue: true } });
    expect(w.text()).toContain('13%');
  });

  it('auto severity moves through danger, warning and success', () => {
    const tone = (value: number) => mount(ApexProgressBar,
      { props: { value, severity: 'auto' } }).find('.apex-pb').attributes('data-tone');
    expect(tone(20)).toBe('danger');
    expect(tone(50)).toBe('warning');
    expect(tone(90)).toBe('success');
  });

  it('a step run states where it is instead of converting to a percentage', () => {
    const steps = ['One', 'Two', 'Three', 'Four'];
    const w = mount(ApexProgressBar, { props: { steps, step: 1, showValue: true } });
    /* Step 1 of four is the second of four done — 50%. */
    expect(w.text()).toContain('50%');
    expect(w.text()).toContain('Two');
  });

  it('the readout leaves the bar when the fill is too short to hold it', () => {
    const inside = (value: number) => mount(ApexProgressBar,
      { props: { value, showValue: true, valuePosition: 'inside', insideThreshold: 12 } });
    expect(inside(40).find('.apex-pb__inside').exists()).toBe(true);
    /* Below the threshold it would be white text on the empty track. */
    expect(inside(5).find('.apex-pb__inside').exists()).toBe(false);
    expect(inside(5).find('.apex-pb__readout').exists()).toBe(true);
  });

  it('indeterminate reports no value to assistive tech', () => {
    const w = mount(ApexProgressBar, { props: { mode: 'indeterminate', value: 40 } });
    expect(w.find('.apex-pb__track').attributes('aria-valuenow')).toBeUndefined();
    /* The deprecated boolean is still honoured — the docs promise it. */
    const legacy = mount(ApexProgressBar, { props: { indeterminate: true, value: 40 } });
    expect(legacy.find('.apex-pb__track').attributes('aria-valuenow')).toBeUndefined();
  });
});

describe('ApexTimeline', () => {
  const EVENTS = [{ status: 'a' }, { status: 'b' }, { status: 'c' }];

  it('renders one event per item and marks the ends', () => {
    const w = mount(ApexTimeline, { props: { value: EVENTS } });
    const events = w.findAll('.apex-tl__event');
    expect(events.length).toBe(3);
    expect(events[0].attributes('data-first')).toBe('true');
    expect(events[2].attributes('data-last')).toBe('true');
  });

  it('alternate puts consecutive events on opposite sides', () => {
    const w = mount(ApexTimeline, { props: { value: EVENTS, align: 'alternate' } });
    const sides = w.findAll('.apex-tl__event').map((e) => e.attributes('data-side'));
    expect(sides[0]).not.toBe(sides[1]);
    expect(sides[0]).toBe(sides[2]);
  });

  it('carries layout and align on the root, which is what the CSS reads', () => {
    const w = mount(ApexTimeline, { props: { value: EVENTS, layout: 'horizontal', align: 'end' } });
    expect(w.find('.apex-tl').attributes('data-layout')).toBe('horizontal');
    expect(w.find('.apex-tl').attributes('data-align')).toBe('end');
  });
});

describe('ApexOrgChart', () => {
  const TREE = {
    key: 'ceo', label: 'CEO',
    children: [
      { key: 'a', label: 'A', children: [{ key: 'a1', label: 'A1' }, { key: 'a2', label: 'A2' }] },
      { key: 'b', label: 'B' },
    ],
  };

  it('draws every node in the tree', () => {
    const w = mount(ApexOrgChart, { props: { value: TREE } });
    expect(w.findAll('.apex-oc__node').length).toBe(5);
  });

  it('collapsing removes the subtree and says so', async () => {
    const w = mount(ApexOrgChart, { props: { value: TREE, collapsible: true } });
    await w.findAll('.apex-oc__toggle')[1].trigger('click');
    expect(w.emitted('update:collapsedKeys')).toBeTruthy();
    await w.setProps({ collapsedKeys: { a: true } });
    expect(w.findAll('.apex-oc__node').length).toBe(3);
  });

  it('checkbox selection cascades to the descendants', async () => {
    const w = mount(ApexOrgChart, { props: { value: TREE, selectionMode: 'checkbox' } });
    await w.findAll('.apex-oc__node')[1].trigger('click');
    const keys = w.emitted('update:selectionKeys')?.[0][0] as Record<string, boolean>;
    /* Selecting a manager selects the reports; anything else lets a checkbox
       tree disagree with itself. */
    expect(keys.a).toBe(true);
    expect(keys.a1).toBe(true);
    expect(keys.a2).toBe(true);
  });
});

describe('ApexDataView', () => {
  it('shows one item per record, paged', () => {
    const w = mount(ApexDataView, { props: { value: ROWS, dataKey: 'id', paginator: true, rows: 5 } });
    expect(w.findAll('.apex-dv__item').length).toBe(5);
  });

  it('sorts by the named field and order', () => {
    const w = mount(ApexDataView, {
      props: { value: ROWS, dataKey: 'id', sortField: 'qty', sortOrder: -1 },
      slots: { item: '<span>{{ params.item.qty }}</span>' },
    });
    expect(w.findAll('.apex-dv__item')[0].text()).toContain('11');
  });

  it('the layout switcher reports the change rather than owning it', async () => {
    const w = mount(ApexDataView, {
      props: { value: ROWS, dataKey: 'id', showLayoutSwitcher: true, layout: 'list' },
    });
    const buttons = w.findAll('.apex-dv__switch button');
    await buttons[buttons.length - 1].trigger('click');
    expect(w.emitted('update:layout')?.[0]).toEqual(['grid']);
  });

  it('says so when there is nothing to show', () => {
    const w = mount(ApexDataView, { props: { value: [], dataKey: 'id' } });
    expect(w.find('.apex-dv__empty').exists()).toBe(true);
  });
});

/**
 * The last emission of an event.
 *
 * `Array.prototype.at` is ES2022 and this tsconfig's lib is ES2021, so `.at(-1)`
 * type-errors here even though it runs. It has now cost two tasks; use this.
 */
const last = <T>(a: T[] | undefined): T | undefined => (a ? a[a.length - 1] : undefined);

describe('ApexPickList', () => {
  const A = { id: 1, name: 'One' };
  const B = { id: 2, name: 'Two' };
  const C = { id: 3, name: 'Three' };
  const mk = (props = {}) => mount(ApexPickList, {
    props: { modelValue: [[A, B, C], []], dataKey: 'id', ...props },
  });

  it('moves the picked row across and names it in the payload', async () => {
    const w = mk();
    await w.findAll('.apex-pl__item')[1].trigger('click');
    await w.findAll('.apex-pl__transfer button')[1].trigger('click');
    const next = last(w.emitted('update:modelValue'))?.[0] as unknown[][];
    expect(next[0]).toHaveLength(2);
    expect(next[1]).toEqual([B]);
    expect(w.emitted('move-to-target')?.[0]).toEqual([{ items: [B] }]);
  });

  it('move-all takes the whole side without a selection', async () => {
    const w = mk();
    await w.findAll('.apex-pl__transfer button')[0].trigger('click');
    const next = last(w.emitted('update:modelValue'))?.[0] as unknown[][];
    expect(next[0]).toEqual([]);
    expect(next[1]).toHaveLength(3);
  });

  it('a filter narrows one side only', async () => {
    const w = mk({ filter: true, modelValue: [[A, B, C], [{ id: 9, name: 'Nine' }]] });
    await w.findAll('.apex-pl__filter input')[0].setValue('one');
    expect(w.findAll('.apex-pl__panel')[0].findAll('.apex-pl__item').length).toBe(1);
    expect(w.findAll('.apex-pl__panel')[1].findAll('.apex-pl__item').length).toBe(1);
  });
});
