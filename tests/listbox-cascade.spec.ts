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

describe('ApexListbox — the props the gallery exposes', () => {
  const FLAT = [
    { value: 'a', label: 'Alpha' }, { value: 'b', label: 'Bravo' }, { value: 'c', label: 'Charlie' },
  ];
  const GROUPED = [
    { label: 'Malta', items: [{ value: 'sliema', label: 'Sliema' }, { value: 'msida', label: 'Msida' }] },
    { label: 'Gozo', items: [{ value: 'victoria', label: 'Victoria' }] },
  ];
  const lb = (p: Record<string, unknown> = {}) =>
    mount(ApexListbox, { props: { label: 'Where', options: FLAT, ...p } });

  it('a nested array renders group headings', () => {
    const w = lb({ options: GROUPED });
    expect(w.findAll('.apex-listbox__group').map((g) => g.text())).toEqual(['Malta', 'Gozo']);
    expect(w.findAll('.apex-listbox__opt').length).toBe(3);
  });

  it('single selection replaces; multiple accumulates', async () => {
    const one = lb({});
    await one.findAll('.apex-listbox__opt')[0].trigger('click');
    expect((one.emitted('update:modelValue') as unknown[][])[0][0]).toBe('a');

    const many = lb({ multiple: true, modelValue: ['a'] });
    await many.findAll('.apex-listbox__opt')[1].trigger('click');
    expect((many.emitted('update:modelValue') as unknown[][])[0][0]).toEqual(['a', 'b']);
  });

  it('checkbox implies multiple, and renders a box per row', () => {
    const w = lb({ checkbox: true });
    expect(w.findAll('.apex-cb__box').length).toBe(3);
  });

  it('max caps the selection', async () => {
    const w = lb({ checkbox: true, modelValue: ['a', 'b'], max: 2 });
    await w.findAll('.apex-listbox__opt')[2].trigger('click');
    expect(w.emitted('update:modelValue')).toBeFalsy();
  });

  it('toggleAll selects everything then clears it', async () => {
    const w = lb({ checkbox: true, toggleAll: true });
    await w.find('.apex-pop__all').trigger('click');
    expect(((w.emitted('update:modelValue') as unknown[][])[0][0] as unknown[]).length).toBe(3);
  });

  it('the filter narrows the list', async () => {
    const w = lb({ filter: true });
    await w.find('.apex-pop__filter input').setValue('brav');
    expect(w.findAll('.apex-listbox__opt').length).toBe(1);
  });

  it('scrollHeight caps the list', () => {
    const w = lb({ scrollHeight: 180 });
    expect(w.find('.apex-listbox__list').attributes('style')).toContain('180px');
  });
});

describe('ApexCascadeSelect — props that have never run outside the component', () => {
  const TREE = [
    { value: 'mt', label: 'Malta', children: [
      { value: 'mt-nh', label: 'Northern Harbour', children: [
        { value: 'mt-nh-sliema', label: 'Sliema' },
      ] },
    ] },
    { value: 'go', label: 'Gozo', children: [{ value: 'go-c', label: 'Central' }] },
  ];
  const cs = (p: Record<string, unknown> = {}) =>
    mount(ApexCascadeSelect, { props: { label: 'Region', options: TREE, ...p } });

  it('opens one column at a time as branches are chosen', async () => {
    const w = cs({});
    await w.find('.apex-ctl').trigger('click');
    expect(w.findAll('.apex-cascade__panel').length).toBe(1);
    // Choosing a branch opens the next column rather than committing.
    await w.findAll('.apex-pop__opt')[0].trigger('click');
    expect(w.findAll('.apex-cascade__panel').length).toBe(2);
    expect(w.emitted('update:modelValue')).toBeFalsy();
  });

  it('only a leaf commits a value', async () => {
    const w = cs({});
    await w.find('.apex-ctl').trigger('click');
    await w.findAll('.apex-pop__opt')[0].trigger('click');          // Malta
    await w.findAll('.apex-cascade__panel')[1]
      .findAll('.apex-pop__opt')[0].trigger('click');               // Northern Harbour
    expect(w.emitted('update:modelValue')).toBeFalsy();
    await w.findAll('.apex-cascade__panel')[2]
      .findAll('.apex-pop__opt')[0].trigger('click');               // Sliema — a leaf
    expect((w.emitted('update:modelValue') as unknown[][])[0][0]).toBe('mt-nh-sliema');
    expect(w.emitted('change')).toBeTruthy();
  });

  it('heading captions the first column', async () => {
    const w = cs({ heading: 'Country' });
    await w.find('.apex-ctl').trigger('click');
    expect(w.find('.apex-cascade__heading').text()).toBe('Country');
  });

  it('showPath puts the whole branch in the field, joined by pathSeparator', () => {
    const leaf = cs({ modelValue: 'mt-nh-sliema' });
    expect(leaf.find('.apex-ctl__value').text()).toBe('Sliema');

    const path = cs({ modelValue: 'mt-nh-sliema', showPath: true });
    expect(path.find('.apex-ctl__value').text()).toContain('Malta');
    expect(path.find('.apex-ctl__value').text()).toContain('Sliema');

    const custom = cs({ modelValue: 'mt-nh-sliema', showPath: true, pathSeparator: '/' });
    expect(custom.find('.apex-ctl__value').text()).toContain('/');
  });

  it('footerAction emits @action instead of selecting anything', async () => {
    const w = cs({ footerAction: { label: 'Manage regions', icon: 'settings' } });
    await w.find('.apex-ctl').trigger('click');
    const footer = w.find('.apex-cascade__footer');
    expect(footer.text()).toContain('Manage regions');
    await footer.trigger('click');
    expect(w.emitted('action')).toBeTruthy();
    expect(w.emitted('update:modelValue')).toBeFalsy();
  });

  it('clearable resets to null; disabled refuses to open', async () => {
    const w = cs({ modelValue: 'mt-nh-sliema', clearable: true });
    await w.find('.apex-ctl__btn').trigger('click');
    expect((w.emitted('update:modelValue') as unknown[][])[0][0]).toBe(null);

    const off = cs({ disabled: true });
    await off.find('.apex-ctl').trigger('click');
    expect(off.find('.apex-cascade').exists()).toBe(false);
  });
});
