import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexListbox from '../src/components/ApexListbox.vue';
import ApexCascadeSelect from '../src/components/ApexCascadeSelect.vue';

const OPTS = [
  { value: 'a', label: 'Alpha', help: 'first' },
  { value: 'b', label: 'Bravo' },
];

describe('ApexListbox — the ui map reaches it', () => {
  const ui = {
    control: 'x-box', list: 'x-list', option: 'x-opt', filter: 'x-filter',
    selectAll: 'x-all', checkbox: 'x-cb', empty: 'x-empty', optionHelp: 'x-help',
    tick: 'x-tick', button: 'x-btn',
  };

  it('the box, its list and its rows', () => {
    const w = mount(ApexListbox, { props: { label: 'Zones', options: OPTS, ui } });
    expect(w.find('.apex-listbox.x-box').exists()).toBe(true);
    expect(w.find('.apex-listbox__list.x-list').exists()).toBe(true);
    expect(w.findAll('.apex-listbox__opt.x-opt').length).toBe(2);
    expect(w.find('.apex-pop__help.x-help').exists()).toBe(true);
  });

  it('filter, select-all and the tick boxes when those are on', async () => {
    const w = mount(ApexListbox, {
      props: { label: 'Zones', options: OPTS, filter: true, checkbox: true, toggleAll: true, ui },
    });
    expect(w.find('.apex-pop__filter.x-filter').exists()).toBe(true);
    expect(w.find('.apex-pop__all.x-all').exists()).toBe(true);
    expect(w.findAll('.apex-cb__box.x-cb').length).toBeGreaterThan(0);
  });

  it('the empty state when the filter matches nothing', async () => {
    const w = mount(ApexListbox, {
      props: { label: 'Zones', options: OPTS, filter: true, ui },
    });
    await w.find('.apex-pop__filter input').setValue('zzzz');
    expect(w.find('.apex-pop__empty.x-empty').exists()).toBe(true);
  });

  it('an untouched listbox carries only its own classes', () => {
    const w = mount(ApexListbox, { props: { label: 'Zones', options: OPTS } });
    expect(w.find('.apex-listbox').attributes('class')).toBe('apex-listbox');
  });
});

describe('ApexCascadeSelect — the ui map reaches it', () => {
  const TREE = [
    { value: 'eu', label: 'Europe', children: [
      { value: 'mt', label: 'Malta', help: 'island' },
      { value: 'it', label: 'Italy' },
    ] },
    { value: 'as', label: 'Asia', children: [{ value: 'jp', label: 'Japan' }] },
  ];
  const ui = {
    control: 'x-ctl', value: 'x-val', placeholder: 'x-ph', chevron: 'x-chev',
    button: 'x-btn', icon: 'x-ico', cascade: 'x-cascade', column: 'x-col',
    option: 'x-opt', optionHelp: 'x-help', tick: 'x-tick',
  };

  it('the trigger and its placeholder', () => {
    const w = mount(ApexCascadeSelect, { props: { label: 'Region', options: TREE, ui } });
    expect(w.find('.apex-ctl.x-ctl').exists()).toBe(true);
    expect(w.find('.apex-ctl__ph.x-ph').exists()).toBe(true);
    expect(w.find('.apex-ctl__chev.x-chev').exists()).toBe(true);
  });

  it('the overlay, its columns and their rows', async () => {
    const w = mount(ApexCascadeSelect, { props: { label: 'Region', options: TREE, ui } });
    await w.find('.apex-ctl').trigger('click');
    expect(w.find('.apex-cascade.x-cascade').exists()).toBe(true);
    expect(w.findAll('.apex-cascade__panel.x-col').length).toBeGreaterThan(0);
    expect(w.findAll('.apex-pop__opt.x-opt').length).toBe(2);
  });

  it('an untouched cascade carries only its own classes', async () => {
    const w = mount(ApexCascadeSelect, { props: { label: 'Region', options: TREE } });
    await w.find('.apex-ctl').trigger('click');
    expect(w.find('.apex-cascade').attributes('class')).toBe('apex-cascade');
  });
});
