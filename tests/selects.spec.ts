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
