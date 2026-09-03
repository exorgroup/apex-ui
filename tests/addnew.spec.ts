import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexSelect from '../src/components/ApexSelect.vue';
import ApexMultiselect from '../src/components/ApexMultiselect.vue';
import ApexListbox from '../src/components/ApexListbox.vue';
import ApexCascadeSelect from '../src/components/ApexCascadeSelect.vue';
import { APEX_UI_OPTIONS } from '../src/core/symbols';

const O = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Bravo' }];

/** Mount with an app-level canCreate resolver, as app.use(ApexUI, {...}) would. */
const withResolver = (resolver: (r: string) => boolean, props: Record<string, unknown>) =>
  mount(ApexSelect, {
    props: { label: 'Zone', options: O, ...props },
    global: { provide: { [APEX_UI_OPTIONS as symbol]: { canCreate: resolver } } },
  });

const sel = (p: Record<string, unknown> = {}) =>
  mount(ApexSelect, { props: { label: 'Zone', options: O, ...p } });

/** The row's text, past the icon — ApexIcon renders its ligature as text. */
const rowLabel = (w: ReturnType<typeof sel>) => {
  const spans = w.findAll('.apex-pop__add span');
  return spans[spans.length - 1].text();
};

describe('ApexSelect — the Add New row', () => {
  it('is absent unless asked for, and present when it is', async () => {
    const off = sel();
    await off.find('.apex-ctl').trigger('click');
    expect(off.find('.apex-pop__add').exists()).toBe(false);

    const on = sel({ addNew: true });
    await on.find('.apex-ctl').trigger('click');
    expect(on.find('.apex-pop__add').exists()).toBe(true);
  });

  it('sits after the options, at the foot of the list', async () => {
    const w = sel({ addNew: true });
    await w.find('.apex-ctl').trigger('click');
    const kids = Array.from(w.find('.apex-pop').element.children).map((n) => n.className);
    expect(kids[kids.length - 1]).toContain('apex-pop__add');
  });

  it('names what was typed once the filter has a query', async () => {
    const w = sel({ addNew: true, filter: true });
    await w.find('.apex-ctl').trigger('click');
    expect(rowLabel(w)).toBe('Add new…');
    await w.find('.apex-pop__filter input').setValue('Sliema');
    expect(rowLabel(w)).toBe('Add “Sliema”');
  });

  it('addNewLabel replaces the resting text but not the query form', async () => {
    const w = sel({ addNew: true, filter: true, addNewLabel: 'New locality' });
    await w.find('.apex-ctl').trigger('click');
    expect(rowLabel(w)).toBe('New locality');
    await w.find('.apex-pop__filter input').setValue('Sliema');
    expect(rowLabel(w)).toBe('Add “Sliema”');
  });

  it('emits the query and closes the overlay, so a dialog can take over', async () => {
    const w = sel({ addNew: true, filter: true });
    await w.find('.apex-ctl').trigger('click');
    await w.find('.apex-pop__filter input').setValue('Sliema');
    await w.find('.apex-pop__add').trigger('click');
    expect(w.emitted('add-new')).toEqual([[{ query: 'Sliema' }]]);
    expect(w.find('.apex-pop').exists()).toBe(false);
  });

  it('does not change the value — the app owns that', async () => {
    const w = sel({ addNew: true });
    await w.find('.apex-ctl').trigger('click');
    await w.find('.apex-pop__add').trigger('click');
    expect(w.emitted('update:modelValue')).toBeFalsy();
  });

  it('is reachable by keyboard, one past the last option', async () => {
    const w = sel({ addNew: true });
    const trigger = w.find('.apex-ctl');
    await trigger.trigger('click');
    // Two options, so a third ArrowDown lands on the row.
    await trigger.trigger('keydown', { key: 'ArrowDown' });
    await trigger.trigger('keydown', { key: 'ArrowDown' });
    expect(w.find('.apex-pop__add').attributes('data-active')).toBe('true');
    await trigger.trigger('keydown', { key: 'Enter' });
    expect(w.emitted('add-new')).toBeTruthy();
  });

  it('End jumps to the row when it is shown, and to the last option when not', async () => {
    const on = sel({ addNew: true });
    await on.find('.apex-ctl').trigger('click');
    await on.find('.apex-ctl').trigger('keydown', { key: 'End' });
    expect(on.find('.apex-pop__add').attributes('data-active')).toBe('true');

    const off = sel({});
    await off.find('.apex-ctl').trigger('click');
    await off.find('.apex-ctl').trigger('keydown', { key: 'End' });
    expect(off.findAll('.apex-pop__opt')[1].attributes('data-active')).toBe('true');
  });

  it('shows even when the filter matches nothing — that is when it is wanted most', async () => {
    const w = sel({ addNew: true, filter: true });
    await w.find('.apex-ctl').trigger('click');
    await w.find('.apex-pop__filter input').setValue('zzzz');
    expect(w.find('.apex-pop__empty').exists()).toBe(true);
    expect(w.find('.apex-pop__add').exists()).toBe(true);
  });
});

describe('ApexSelect — who decides the row is allowed', () => {
  it('canAddNew wins outright, in both directions', async () => {
    const denied = withResolver(() => true, { addNew: true, resource: 'localities', canAddNew: false });
    await denied.find('.apex-ctl').trigger('click');
    expect(denied.find('.apex-pop__add').exists()).toBe(false);

    const allowed = withResolver(() => false, { addNew: true, resource: 'localities', canAddNew: true });
    await allowed.find('.apex-ctl').trigger('click');
    expect(allowed.find('.apex-pop__add').exists()).toBe(true);
  });

  it('otherwise the app-level resolver is asked about this resource', async () => {
    const seen: string[] = [];
    const w = withResolver((r) => { seen.push(r); return r === 'localities'; },
      { addNew: true, resource: 'localities' });
    await w.find('.apex-ctl').trigger('click');
    expect(seen).toContain('localities');
    expect(w.find('.apex-pop__add').exists()).toBe(true);

    const no = withResolver((r) => r === 'localities', { addNew: true, resource: 'countries' });
    await no.find('.apex-ctl').trigger('click');
    expect(no.find('.apex-pop__add').exists()).toBe(false);
  });

  it('with no resolver registered the row simply shows', async () => {
    const w = sel({ addNew: true, resource: 'localities' });
    await w.find('.apex-ctl').trigger('click');
    expect(w.find('.apex-pop__add').exists()).toBe(true);
  });

  it('a resolver with no resource on the control is not consulted', async () => {
    let called = false;
    const w = withResolver(() => { called = true; return false; }, { addNew: true });
    await w.find('.apex-ctl').trigger('click');
    expect(called).toBe(false);
    expect(w.find('.apex-pop__add').exists()).toBe(true);
  });
});

describe('ApexMultiselect — the Add New row', () => {
  const ms = (p: Record<string, unknown> = {}) =>
    mount(ApexMultiselect, { props: { label: 'Roles', options: O, ...p } });
  const msLabel = (w: ReturnType<typeof ms>) => {
    const spans = w.findAll('.apex-pop__add span');
    return spans[spans.length - 1].text();
  };

  it('appears at the foot, names the query, emits and closes', async () => {
    const w = ms({ addNew: true, filter: true });
    await w.find('.apex-ctl').trigger('click');
    expect(msLabel(w)).toBe('Add new…');
    await w.find('.apex-pop__filter input').setValue('Auditor');
    expect(msLabel(w)).toBe('Add “Auditor”');
    await w.find('.apex-pop__add').trigger('click');
    expect(w.emitted('add-new')).toEqual([[{ query: 'Auditor' }]]);
    expect(w.find('.apex-pop').exists()).toBe(false);
  });

  it('is not an option: it never toggles the selection', async () => {
    const w = ms({ addNew: true, modelValue: ['a'] });
    await w.find('.apex-ctl').trigger('click');
    await w.find('.apex-pop__add').trigger('click');
    expect(w.emitted('update:modelValue')).toBeFalsy();
    expect(w.emitted('change')).toBeFalsy();
  });

  it('is offered even at max, since creating is not selecting', async () => {
    // max caps the selection; it must not hide the way to add a record.
    const w = ms({ addNew: true, modelValue: ['a', 'b'], max: 2 });
    await w.find('.apex-ctl').trigger('click');
    expect(w.find('.apex-pop__add').exists()).toBe(true);
    await w.find('.apex-pop__add').trigger('click');
    expect(w.emitted('add-new')).toBeTruthy();
  });

  it('carries no tick box — it is not selectable', async () => {
    const w = ms({ addNew: true });
    await w.find('.apex-ctl').trigger('click');
    expect(w.find('.apex-pop__add .apex-pop__box').exists()).toBe(false);
  });

  it('is keyboard-reachable past the last option', async () => {
    const w = ms({ addNew: true });
    const trigger = w.find('.apex-ctl');
    await trigger.trigger('click');
    await trigger.trigger('keydown', { key: 'End' });
    expect(w.find('.apex-pop__add').attributes('data-active')).toBe('true');
    await trigger.trigger('keydown', { key: 'Enter' });
    expect(w.emitted('add-new')).toBeTruthy();
    expect(w.emitted('update:modelValue')).toBeFalsy();
  });

  it('honours the same permission rule', async () => {
    const denied = mount(ApexMultiselect, {
      props: { label: 'Roles', options: O, addNew: true, resource: 'roles' },
      global: { provide: { [APEX_UI_OPTIONS as symbol]: { canCreate: () => false } } },
    });
    await denied.find('.apex-ctl').trigger('click');
    expect(denied.find('.apex-pop__add').exists()).toBe(false);
  });
});

describe('the row takes a class of its own', () => {
  it('ui.addNew lands on it, in both controls', async () => {
    const s = mount(ApexSelect, {
      props: { label: 'Zone', options: O, addNew: true, ui: { addNew: 'my-add' } },
    });
    await s.find('.apex-ctl').trigger('click');
    expect(s.find('.apex-pop__add.my-add').exists()).toBe(true);

    const m = mount(ApexMultiselect, {
      props: { label: 'Roles', options: O, addNew: true, ui: { addNew: 'my-add' } },
    });
    await m.find('.apex-ctl').trigger('click');
    expect(m.find('.apex-pop__add.my-add').exists()).toBe(true);
  });

  it('an untouched row carries only its own class', async () => {
    const w = mount(ApexSelect, { props: { label: 'Zone', options: O, addNew: true } });
    await w.find('.apex-ctl').trigger('click');
    expect(w.find('.apex-pop__add').attributes('class')).toBe('apex-pop__add');
  });
});

describe('ApexListbox — the Add New row', () => {
  const lb = (p: Record<string, unknown> = {}) =>
    mount(ApexListbox, { props: { label: 'Where', options: O, ...p } });
  const lbLabel = (w: ReturnType<typeof lb>) => {
    const spans = w.findAll('.apex-pop__add span');
    return spans[spans.length - 1].text();
  };

  it('sits at the foot of the always-visible list', () => {
    expect(lb().find('.apex-pop__add').exists()).toBe(false);
    const w = lb({ addNew: true });
    const kids = Array.from(w.find('.apex-listbox__list').element.children);
    expect(kids[kids.length - 1].querySelector('.apex-pop__add')).toBeTruthy();
  });

  it('names the query, and emits it', async () => {
    const w = lb({ addNew: true, filter: true });
    expect(lbLabel(w)).toBe('Add new…');
    await w.find('.apex-pop__filter input').setValue('Xaghra');
    expect(lbLabel(w)).toBe('Add “Xaghra”');
    await w.find('.apex-pop__add').trigger('click');
    expect(w.emitted('add-new')).toEqual([[{ query: 'Xaghra' }]]);
  });

  it('changes nothing else — no selection, and the list stays put', async () => {
    const w = lb({ addNew: true, modelValue: 'a' });
    await w.find('.apex-pop__add').trigger('click');
    expect(w.emitted('update:modelValue')).toBeFalsy();
    expect(w.find('.apex-listbox__list').exists()).toBe(true);
  });

  it('is keyboard-reachable past the last option', async () => {
    const w = lb({ addNew: true });
    const list = w.find('.apex-listbox__list');
    await list.trigger('keydown', { key: 'End' });
    expect(w.find('.apex-pop__add').attributes('data-active')).toBe('true');
    await list.trigger('keydown', { key: 'Enter' });
    expect(w.emitted('add-new')).toBeTruthy();
    expect(w.emitted('update:modelValue')).toBeFalsy();
  });

  it('honours the same permission rule', async () => {
    const denied = mount(ApexListbox, {
      props: { label: 'Where', options: O, addNew: true, resource: 'places' },
      global: { provide: { [APEX_UI_OPTIONS as symbol]: { canCreate: () => false } } },
    });
    expect(denied.find('.apex-pop__add').exists()).toBe(false);
  });
});

describe('ApexCascadeSelect — Add New knows which level it is on', () => {
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

  it('every open column carries its own row', async () => {
    const w = cs({ addNew: true });
    await w.find('.apex-ctl').trigger('click');
    expect(w.findAll('.apex-cascade__panel').length).toBe(1);
    expect(w.findAll('.apex-pop__add').length).toBe(1);

    await w.findAll('.apex-pop__opt')[0].trigger('click');   // open Malta
    expect(w.findAll('.apex-cascade__panel').length).toBe(2);
    expect(w.findAll('.apex-pop__add').length).toBe(2);
  });

  it('the first column reports an empty path — the root', async () => {
    const w = cs({ addNew: true });
    await w.find('.apex-ctl').trigger('click');
    await w.find('.apex-pop__add').trigger('click');
    const p = (w.emitted('add-new') as Array<[{ query: string; path: Array<{ label: string }> }]>)[0][0];
    expect(p.path).toEqual([]);
    expect(p.query).toBe('');
  });

  it('a deeper column reports the branch above it', async () => {
    const w = cs({ addNew: true });
    await w.find('.apex-ctl').trigger('click');
    await w.findAll('.apex-pop__opt')[0].trigger('click');            // Malta
    await w.findAll('.apex-cascade__panel')[1]
      .findAll('.apex-pop__opt')[0].trigger('click');                 // Northern Harbour

    // The third column creates under Malta > Northern Harbour.
    const rows = w.findAll('.apex-pop__add');
    await rows[rows.length - 1].trigger('click');
    const p = (w.emitted('add-new') as Array<[{ path: Array<{ label: string }> }]>)[0][0];
    expect(p.path.map((o) => o.label)).toEqual(['Malta', 'Northern Harbour']);
  });

  it('it closes the overlay and selects nothing', async () => {
    const w = cs({ addNew: true });
    await w.find('.apex-ctl').trigger('click');
    await w.find('.apex-pop__add').trigger('click');
    expect(w.find('.apex-cascade').exists()).toBe(false);
    expect(w.emitted('update:modelValue')).toBeFalsy();
  });

  it('sits alongside footerAction rather than replacing it', async () => {
    const w = cs({ addNew: true, footerAction: { label: 'Manage regions' } });
    await w.find('.apex-ctl').trigger('click');
    expect(w.find('.apex-pop__add').exists()).toBe(true);
    expect(w.find('.apex-cascade__footer').exists()).toBe(true);
    await w.find('.apex-cascade__footer').trigger('click');
    expect(w.emitted('action')).toBeTruthy();
    expect(w.emitted('add-new')).toBeFalsy();
  });

  it('honours the same permission rule', async () => {
    const denied = mount(ApexCascadeSelect, {
      props: { label: 'Region', options: TREE, addNew: true, resource: 'regions' },
      global: { provide: { [APEX_UI_OPTIONS as symbol]: { canCreate: () => false } } },
    });
    await denied.find('.apex-ctl').trigger('click');
    expect(denied.find('.apex-pop__add').exists()).toBe(false);
  });
});
