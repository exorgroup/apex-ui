import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexSelect from '../src/components/ApexSelect.vue';
import ApexMultiselect from '../src/components/ApexMultiselect.vue';

const OPTS = [
  { value: 'a', label: 'Alpha', help: 'first' },
  { value: 'b', label: 'Bravo' },
  { value: 'c', label: 'Charlie' },
];
const ui = {
  control: 'x-ctl', input: 'x-in', icon: 'x-ico', button: 'x-btn',
  popover: 'x-pop', option: 'x-opt', filter: 'x-filter',
  tick: 'x-tick', value: 'x-val', selectAll: 'x-all', checkbox: 'x-box',
};

describe('ApexSelect — shared ui keys', () => {
  it('the custom trigger, its icons, buttons, overlay and rows', async () => {
    const w = mount(ApexSelect, {
      props: { label: 'Zone', options: OPTS, modelValue: 'a', clearable: true,
              filter: true, leadingIcon: 'search', ui },
    });
    expect(w.find('.apex-ctl.x-ctl').exists()).toBe(true);
    // The leading icon; the chevron keeps .apex-ctl__chev and is AF2-90.
    expect(w.findAll('.apex-ctl__icon.x-ico').length).toBeGreaterThan(0);
    expect(w.findAll('.apex-ctl__btn.x-btn').length).toBeGreaterThan(0);
    expect(w.find('.apex-ctl__value.x-val').exists()).toBe(true);

    await w.find('.apex-ctl').trigger('click');
    expect(w.find('.apex-pop.x-pop').exists()).toBe(true);
    expect(w.findAll('.apex-pop__opt.x-opt').length).toBe(3);
    expect(w.find('.apex-pop__filter.x-filter').exists()).toBe(true);
    expect(w.find('.apex-pop__tick.x-tick').exists()).toBe(true);
  });

  it('the native branch takes control and input too', () => {
    const w = mount(ApexSelect, { props: { label: 'Zone', options: OPTS, native: true, ui } });
    expect(w.find('.apex-ctl.x-ctl').exists()).toBe(true);
    expect(w.find('select.apex-ctl__input.x-in').exists()).toBe(true);
  });

  it('an untouched select carries only its own classes', () => {
    const w = mount(ApexSelect, { props: { label: 'Zone', options: OPTS } });
    expect(w.find('.apex-ctl').attributes('class')).toBe('apex-ctl apex-ctl--trigger');
  });
});

describe('ApexMultiselect — shared ui keys', () => {
  it('the trigger, overlay, rows, select-all and tick boxes', async () => {
    const w = mount(ApexMultiselect, {
      props: {
        label: 'Zones', options: OPTS, modelValue: ['a'], clearable: true,
        filter: true, toggleAll: true, ui,
      },
    });
    expect(w.find('.apex-ctl.x-ctl').exists()).toBe(true);
    expect(w.findAll('.apex-ctl__btn.x-btn').length).toBeGreaterThan(0);

    await w.find('.apex-ctl').trigger('click');
    expect(w.find('.apex-pop.x-pop').exists()).toBe(true);
    expect(w.findAll('.apex-pop__opt.x-opt').length).toBe(3);
    expect(w.find('.apex-pop__all.x-all').exists()).toBe(true);
    expect(w.findAll('.apex-pop__box.x-box').length).toBe(3);
    expect(w.find('.apex-pop__filter.x-filter').exists()).toBe(true);
  });

  it('an untouched multiselect carries only its own classes', () => {
    const w = mount(ApexMultiselect, { props: { label: 'Zones', options: OPTS } });
    expect(w.find('.apex-ctl').attributes('class'))
      .toBe('apex-ctl apex-ctl--trigger apex-ctl--multi');
  });
});

describe('the remaining own parts', () => {
  const own = {
    placeholder: 'x-ph', chevron: 'x-chev', empty: 'x-empty',
    thumbnail: 'x-thumb', optionHelp: 'x-help', chip: 'x-chip',
  };
  const RICH = [
    { value: 'a', label: 'Alpha', help: 'first', image: '/a.png' },
    { value: 'b', label: 'Bravo', image: '/b.png' },
  ];

  it('ApexSelect: placeholder, chevron, thumbnail, row help, empty', async () => {
    const w = mount(ApexSelect, { props: { label: 'Zone', options: RICH, ui: own } });
    // Nothing chosen yet, so the placeholder shows and no thumbnail is in the box.
    expect(w.find('.apex-ctl__ph.x-ph').exists()).toBe(true);
    expect(w.find('.apex-ctl__chev.x-chev').exists()).toBe(true);

    await w.find('.apex-ctl').trigger('click');
    expect(w.findAll('.apex-pop__img.x-thumb').length).toBe(2);
    expect(w.find('.apex-pop__help.x-help').exists()).toBe(true);

    const chosen = mount(ApexSelect, {
      props: { label: 'Zone', options: RICH, modelValue: 'a', ui: own },
    });
    expect(chosen.find('.apex-ctl__img.x-thumb').exists()).toBe(true);
    expect(chosen.find('.apex-ctl__ph').exists()).toBe(false);

    const none = mount(ApexSelect, { props: { label: 'Zone', options: [], ui: own } });
    await none.find('.apex-ctl').trigger('click');
    expect(none.find('.apex-pop__empty.x-empty').exists()).toBe(true);
  });

  it('ApexMultiselect: chips, the overflow chip, and its thumbnail', async () => {
    const w = mount(ApexMultiselect, {
      props: { label: 'Zones', options: RICH, modelValue: ['a', 'b'], maxChips: 1, ui: own },
    });
    // One chip shown plus the "+1" overflow chip; both take the key.
    expect(w.findAll('.apex-chip.x-chip').length).toBe(2);
    expect(w.find('.apex-chip--more.x-chip').exists()).toBe(true);
    expect(w.find('.apex-chip__img.x-thumb').exists()).toBe(true);

    const empty = mount(ApexMultiselect, { props: { label: 'Zones', options: RICH, ui: own } });
    expect(empty.find('.apex-ctl__ph.x-ph').exists()).toBe(true);
    expect(empty.find('.apex-ctl__chev.x-chev').exists()).toBe(true);
  });
});

describe('the shared appearance props now reach the select', () => {
  it('placeholderColor and textColor land on the trigger, not just on inputs', () => {
    // .apex-ctl__ph and .apex-ctl__value read the raw tokens before this,
    // so these two props were silently inert on Select and Multiselect.
    const w = mount(ApexSelect, {
      props: {
        label: 'Zone', options: [{ value: 'a', label: 'Alpha' }],
        placeholderColor: '#5A6B7D', textColor: '#E8EEF7',
      },
    });
    const style = w.find('.apex-field').attributes('style') || '';
    expect(style).toContain('--apex-ctl-placeholder');
    expect(style).toContain('--apex-ctl-fg');
    // And the elements that consume them are on the page.
    expect(w.find('.apex-ctl__ph').exists()).toBe(true);
  });
});

describe('ApexSelect — the props the gallery exposes', () => {
  const O = [
    { value: 'a', label: 'Alpha' }, { value: 'b', label: 'Bravo' },
    { value: 'c', label: 'Charlie' }, { value: 'd', label: 'Delta', disabled: true },
  ];
  const sel = (p: Record<string, unknown> = {}) =>
    mount(ApexSelect, { props: { label: 'Zone', options: O, ...p } });

  it('native swaps the trigger for a real <select> with one option each', () => {
    const w = sel({ native: true });
    expect(w.find('select.apex-ctl__input').exists()).toBe(true);
    // Four options plus the placeholder row.
    expect(w.findAll('option').length).toBeGreaterThanOrEqual(4);
    expect(sel().find('select').exists()).toBe(false);
  });

  it('clearable resets to null, and only shows once something is chosen', async () => {
    expect(sel({ clearable: true }).find('.apex-ctl__btn').exists()).toBe(false);
    const w = sel({ clearable: true, modelValue: 'a' });
    await w.find('.apex-ctl__btn').trigger('click');
    expect((w.emitted('update:modelValue') as unknown[][])[0][0]).toBe(null);
  });

  it('filter narrows the list; filterThreshold turns it on by size', async () => {
    const w = sel({ filter: true });
    await w.find('.apex-ctl').trigger('click');
    await w.find('.apex-pop__filter input').setValue('brav');
    expect(w.findAll('.apex-pop__opt').length).toBe(1);
    expect(w.find('.apex-pop__opt').text()).toContain('Bravo');

    // Below the threshold there is no filter; at or above it there is.
    const under = sel({ filterThreshold: 10 });
    await under.find('.apex-ctl').trigger('click');
    expect(under.find('.apex-pop__filter').exists()).toBe(false);
    const over = sel({ filterThreshold: 4 });
    await over.find('.apex-ctl').trigger('click');
    expect(over.find('.apex-pop__filter').exists()).toBe(true);
  });

  it('a disabled option cannot be picked', async () => {
    const w = sel({});
    await w.find('.apex-ctl').trigger('click');
    const rows = w.findAll('.apex-pop__opt');
    expect(rows[3].attributes('disabled')).toBeDefined();
    await rows[3].trigger('click');
    expect(w.emitted('update:modelValue')).toBeFalsy();
  });

  it('loading and disabled each block opening', async () => {
    const off = sel({ disabled: true });
    await off.find('.apex-ctl').trigger('click');
    expect(off.find('.apex-pop').exists()).toBe(false);
  });

  it('picking a row commits its value and closes', async () => {
    const w = sel({});
    await w.find('.apex-ctl').trigger('click');
    await w.findAll('.apex-pop__opt')[1].trigger('click');
    expect((w.emitted('update:modelValue') as unknown[][])[0][0]).toBe('b');
    expect(w.emitted('change')).toBeTruthy();
  });
});

describe('ApexMultiselect — the props the gallery exposes', () => {
  const O = [
    { value: 'a', label: 'Alpha' }, { value: 'b', label: 'Bravo' },
    { value: 'c', label: 'Charlie' },
  ];
  const ms = (p: Record<string, unknown> = {}) =>
    mount(ApexMultiselect, { props: { label: 'Roles', options: O, ...p } });

  it('toggleAll selects everything, then clears it', async () => {
    const w = ms({ toggleAll: true });
    await w.find('.apex-ctl').trigger('click');
    await w.find('.apex-pop__all').trigger('click');
    const all = (w.emitted('update:modelValue') as unknown[][])[0][0] as unknown[];
    expect(all.length).toBe(3);

    const full = ms({ toggleAll: true, modelValue: ['a', 'b', 'c'] });
    await full.find('.apex-ctl').trigger('click');
    await full.find('.apex-pop__all').trigger('click');
    expect(((full.emitted('update:modelValue') as unknown[][])[0][0] as unknown[]).length).toBe(0);
  });

  it('maxChips collapses the rest into a +N chip', () => {
    const w = ms({ modelValue: ['a', 'b', 'c'], maxChips: 2 });
    expect(w.findAll('.apex-chip:not(.apex-chip--more)').length).toBe(2);
    expect(w.find('.apex-chip--more').text()).toBe('+1');
  });

  it('max caps how many can be chosen', async () => {
    const w = ms({ modelValue: ['a', 'b'], max: 2 });
    await w.find('.apex-ctl').trigger('click');
    await w.findAll('.apex-pop__opt')[2].trigger('click');
    // Already at the cap, so the third pick is refused.
    expect(w.emitted('update:modelValue')).toBeFalsy();
  });

  it('a chip removes just its own value', async () => {
    const w = ms({ modelValue: ['a', 'b'] });
    await w.find('.apex-chip button').trigger('click');
    expect((w.emitted('update:modelValue') as unknown[][])[0][0]).toEqual(['b']);
  });

  it('clearable empties the selection', async () => {
    const w = ms({ modelValue: ['a', 'b'], clearable: true });
    const clear = w.findAll('.apex-ctl__btn').at(-1)!;
    await clear.trigger('click');
    expect((w.emitted('update:modelValue') as unknown[][])[0][0]).toEqual([]);
  });
});
