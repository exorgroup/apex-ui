import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ApexTreeSelect from '../src/components/ApexTreeSelect.vue';
import ApexOrderList from '../src/components/ApexOrderList.vue';
import { APEX_UI_OPTIONS } from '../src/core/symbols';

const NODES = [
  { key: 'mt', label: 'Malta', children: [
    { key: 'mt-nh', label: 'Northern Harbour', children: [
      { key: 'sliema', label: 'Sliema' },
      { key: 'msida', label: 'Msida' },
    ] },
    { key: 'mt-se', label: 'South Eastern', children: [{ key: 'zejtun', label: 'Żejtun' }] },
  ] },
  { key: 'go', label: 'Gozo', children: [{ key: 'victoria', label: 'Victoria' }] },
];

const tree = (props: Record<string, unknown> = {}, options?: Record<string, unknown>) =>
  mount(ApexTreeSelect, {
    props: { label: 'Locality', nodes: NODES, ...props },
    global: options ? { provide: { [APEX_UI_OPTIONS as symbol]: options } } : {},
  });

/** Opens the overlay by clicking the trigger. */
async function open(w: ReturnType<typeof tree>) {
  await w.find('.apex-ctl--trigger').trigger('click');
  await nextTick();
  return w;
}
const rowLabels = (w: ReturnType<typeof tree>) =>
  w.findAll('.apex-tree__row').map((r) => r.find('.apex-tree__label').text());

describe('ApexTreeSelect — the tree itself', () => {
  it('shows only the roots until a branch is expanded', async () => {
    const w = await open(tree());
    expect(rowLabels(w)).toEqual(['Malta', 'Gozo']);

    await w.findAll('.apex-tree__twisty')[0].trigger('click');
    expect(rowLabels(w)).toEqual(['Malta', 'Northern Harbour', 'South Eastern', 'Gozo']);
  });

  it('expandAll opens every branch without a click', async () => {
    const w = await open(tree({ expandAll: true }));
    expect(rowLabels(w)).toContain('Sliema');
    expect(rowLabels(w)).toContain('Victoria');
  });

  it('a filter keeps the branch a match sits under', async () => {
    const w = await open(tree({ filter: true }));
    await w.find('.apex-pop__filter input').setValue('sliema');
    // The leaf alone would be unplaceable; its ancestors come with it.
    expect(rowLabels(w)).toEqual(['Malta', 'Northern Harbour', 'Sliema']);
  });

  it('showPath puts the whole branch in the field', async () => {
    const w = tree({ modelValue: 'sliema', showPath: true });
    expect(w.find('.apex-ctl__value').text()).toBe('Malta › Northern Harbour › Sliema');
  });

  it('leafOnly expands a branch instead of selecting it', async () => {
    const w = await open(tree({ leafOnly: true, expandAll: true }));
    const malta = w.findAll('.apex-tree__row')[0];
    await malta.trigger('click');
    expect(w.emitted('update:modelValue')).toBeUndefined();

    const sliema = w.findAll('.apex-tree__row').find((r) => r.text().includes('Sliema'))!;
    await sliema.trigger('click');
    expect(w.emitted('update:modelValue')![0]).toEqual(['sliema']);
  });

  it('checkbox mode ticks a branch and all its descendants at once', async () => {
    const w = await open(tree({ checkbox: true, expandAll: true, modelValue: [] }));
    const nh = w.findAll('.apex-tree__row').find((r) => r.text().includes('Northern Harbour'))!;
    await nh.trigger('click');
    expect(w.emitted('update:modelValue')![0][0]).toEqual(['mt-nh', 'sliema', 'msida']);
  });

  it('a partly-ticked branch reads partial, not on', async () => {
    const w = await open(tree({ checkbox: true, expandAll: true, modelValue: ['sliema'] }));
    const nh = w.findAll('.apex-tree__row').find((r) => r.text().includes('Northern Harbour'))!;
    expect(nh.attributes('data-state')).toBe('partial');

    const w2 = await open(tree({ checkbox: true, expandAll: true, modelValue: ['sliema', 'msida'] }));
    const nh2 = w2.findAll('.apex-tree__row').find((r) => r.text().includes('Northern Harbour'))!;
    expect(nh2.attributes('data-state')).toBe('on');
  });
});

describe('ApexTreeSelect — Add New, one row per branch', () => {
  it('is absent unless asked for', async () => {
    const w = await open(tree({ expandAll: true }));
    expect(w.findAll('.apex-pop__add').length).toBe(0);
  });

  it('gives every open branch its own row, plus one for the root', async () => {
    const w = await open(tree({ addNew: true, expandAll: true }));
    // 4 branches (Malta, Northern Harbour, South Eastern, Gozo) + the root.
    expect(w.findAll('.apex-pop__add').length).toBe(5);
  });

  it('a collapsed branch contributes no row', async () => {
    const w = await open(tree({ addNew: true }));
    expect(w.findAll('.apex-pop__add').length).toBe(1); // the root's only
  });

  it('reports the branch the row sat under, root first', async () => {
    const w = await open(tree({ addNew: true, expandAll: true }));
    /* A branch renders [its row, its children, its own Add New], so a parent's
       row comes after every descendant's — address them by branch, not index. */
    const rowIn = (key: string) => w.findAll('.apex-tree__branch')
      .find((b) => b.find('.apex-tree__row').attributes('aria-selected') !== undefined
        && b.find('.apex-tree__label').text() === key)!
      .find('.apex-pop__add');

    await rowIn('Northern Harbour').trigger('click');
    const payload = w.emitted('add-new')![0][0] as { path: Array<{ key: string }> };
    expect(payload.path.map((n) => n.key)).toEqual(['mt', 'mt-nh']);
  });

  it('a deeper branch reports the full chain down to it', async () => {
    const w = await open(tree({ addNew: true, expandAll: true }));
    // Document order: the innermost branch's row comes first.
    await w.findAll('.apex-pop__add')[0].trigger('click');
    const payload = w.emitted('add-new')![0][0] as { path: Array<{ key: string }> };
    expect(payload.path.map((n) => n.key)).toEqual(['mt', 'mt-nh']);
  });

  it('the root row reports an empty path', async () => {
    const w = await open(tree({ addNew: true, expandAll: true }));
    const rows = w.findAll('.apex-pop__add');
    await rows[rows.length - 1].trigger('click');
    expect((w.emitted('add-new')![0][0] as { path: unknown[] }).path).toEqual([]);
  });

  it('carries the filter query, and names it in the row', async () => {
    const w = await open(tree({ addNew: true, filter: true }));
    await w.find('.apex-pop__filter input').setValue('Xewkija');
    expect(w.find('.apex-pop__add').text()).toContain('Xewkija');
    await w.find('.apex-pop__add').trigger('click');
    expect((w.emitted('add-new')![0][0] as { query: string }).query).toBe('Xewkija');
  });

  it('closes the overlay, since a form or route is about to take over', async () => {
    const w = await open(tree({ addNew: true }));
    await w.find('.apex-pop__add').trigger('click');
    expect(w.find('.apex-pop').exists()).toBe(false);
  });

  it('the resolver can hide it, and an explicit prop overrules the resolver', async () => {
    const deny = { canCreate: () => false };
    expect((await open(tree({ addNew: true, resource: 'localities' }, deny)))
      .findAll('.apex-pop__add').length).toBe(0);
    expect((await open(tree({ addNew: true, resource: 'localities', canAddNew: true }, deny)))
      .findAll('.apex-pop__add').length).toBe(1);
  });

  it('an absent canAddNew leaves the resolver in charge', async () => {
    // Vue casts a missing boolean prop to false; if that read as a denial the
    // resolver would never be consulted and the row would never appear.
    const allow = { canCreate: () => true };
    const w = await open(tree({ addNew: true, resource: 'localities' }, allow));
    expect(w.findAll('.apex-pop__add').length).toBe(1);
  });
});

/* ── ApexOrderList ──────────────────────────────────────── */

const ITEMS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Bravo' },
  { value: 'c', label: 'Charlie' },
  { value: 'd', label: 'Delta' },
];
const order = (props: Record<string, unknown> = {}, options?: Record<string, unknown>) =>
  mount(ApexOrderList, {
    props: { label: 'Running order', modelValue: ITEMS, ...props },
    global: options ? { provide: { [APEX_UI_OPTIONS as symbol]: options } } : {},
  });
const labelsOf = (v: unknown[]) => (v as Array<{ label: string }>).map((o) => o.label);
const btn = (w: ReturnType<typeof order>, name: string) =>
  w.findAll('.apex-order__btn').find((b) => b.attributes('aria-label') === name)!;

describe('ApexOrderList — reordering', () => {
  it('numbers rows by their place in the whole collection', () => {
    const w = order();
    expect(w.findAll('.apex-order__num').map((n) => n.text())).toEqual(['1', '2', '3', '4']);
  });

  it('moves the chosen row up, and emits the collection in its new order', async () => {
    const w = order({ selection: ['c'] });
    await btn(w, 'Move up').trigger('click');
    expect(labelsOf(w.emitted('update:modelValue')![0][0] as unknown[]))
      .toEqual(['Alpha', 'Charlie', 'Bravo', 'Delta']);
  });

  it('shifts a run of adjacent rows as one block', async () => {
    const w = order({ selection: ['b', 'c'] });
    await btn(w, 'Move down').trigger('click');
    expect(labelsOf(w.emitted('update:modelValue')![0][0] as unknown[]))
      .toEqual(['Alpha', 'Delta', 'Bravo', 'Charlie']);
  });

  it('will not move past an edge', async () => {
    const w = order({ selection: ['a'] });
    expect(btn(w, 'Move up').attributes('disabled')).toBeDefined();
    expect(btn(w, 'Move down').attributes('disabled')).toBeUndefined();
  });

  it('jumps to the extremes', async () => {
    const w = order({ selection: ['d'] });
    await btn(w, 'Move to top').trigger('click');
    expect(labelsOf(w.emitted('update:modelValue')![0][0] as unknown[]))
      .toEqual(['Delta', 'Alpha', 'Bravo', 'Charlie']);
  });

  it('alt+arrow moves the focused row without needing a selection', async () => {
    const w = order();
    await w.findAll('.apex-order__row')[0].trigger('keydown', { key: 'ArrowDown', altKey: true });
    expect(labelsOf(w.emitted('update:modelValue')![0][0] as unknown[]))
      .toEqual(['Bravo', 'Alpha', 'Charlie', 'Delta']);
  });

  it('a drop reinserts the dragged row at the target index', async () => {
    const w = order();
    const rows = w.findAll('.apex-order__row');
    await rows[3].trigger('dragstart');
    await rows[0].trigger('dragover');
    await rows[0].trigger('drop');
    expect(labelsOf(w.emitted('update:modelValue')![0][0] as unknown[]))
      .toEqual(['Delta', 'Alpha', 'Bravo', 'Charlie']);
  });

  it('a live filter suspends dragging and the move buttons', async () => {
    const w = order({ filter: true, selection: ['c'] });
    await w.find('.apex-pop__filter input').setValue('a');
    expect(w.findAll('.apex-order__grip').length).toBe(0);
    expect(btn(w, 'Move up').attributes('disabled')).toBeDefined();
  });

  it('a plain click replaces the selection; checkbox mode accumulates', async () => {
    const w = order({ multiple: true, selection: ['a'] });
    await w.findAll('.apex-order__row')[2].trigger('click');
    expect(w.emitted('update:selection')![0][0]).toEqual(['c']);

    const w2 = order({ checkbox: true, selection: ['a'] });
    await w2.findAll('.apex-order__row')[2].trigger('click');
    expect(w2.emitted('update:selection')![0][0]).toEqual(['a', 'c']);
  });
});

describe('ApexOrderList — Add New', () => {
  it('is absent unless asked for, and sits at the foot when it is', async () => {
    expect(order().findAll('.apex-pop__add').length).toBe(0);
    const w = order({ addNew: true });
    expect(w.findAll('.apex-pop__add').length).toBe(1);
  });

  it('carries the filter query and leaves the list open', async () => {
    const w = order({ addNew: true, filter: true });
    await w.find('.apex-pop__filter input').setValue('Echo');
    expect(w.find('.apex-pop__add').text()).toContain('Echo');
    await w.find('.apex-pop__add').trigger('click');
    expect((w.emitted('add-new')![0][0] as { query: string }).query).toBe('Echo');
    expect(w.find('.apex-order__list').exists()).toBe(true);
  });

  it('honours the resolver, and the explicit prop overrules it', async () => {
    const deny = { canCreate: () => false };
    expect(order({ addNew: true, resource: 'acts' }, deny).findAll('.apex-pop__add').length).toBe(0);
    expect(order({ addNew: true, resource: 'acts', canAddNew: true }, deny)
      .findAll('.apex-pop__add').length).toBe(1);
  });
});

describe('both controls take the ui class map', () => {
  it('ApexTreeSelect puts classes on its own parts', async () => {
    const w = await open(tree({
      expandAll: true, addNew: true,
      ui: { control: 'x-ctl', option: 'x-row', twisty: 'x-tw', branch: 'x-br', addNew: 'x-add' },
    }));
    expect(w.find('.apex-ctl--trigger').classes()).toContain('x-ctl');
    expect(w.find('.apex-tree__row').classes()).toContain('x-row');
    expect(w.find('.apex-tree__twisty').classes()).toContain('x-tw');
    expect(w.find('.apex-tree__branch').classes()).toContain('x-br');
    expect(w.find('.apex-pop__add').classes()).toContain('x-add');
  });

  it('ApexOrderList puts classes on its own parts', () => {
    const w = order({
      filter: true,
      ui: { panel: 'x-panel', controls: 'x-ctrls', moveButton: 'x-btn', grip: 'x-grip',
        index: 'x-num', option: 'x-row', list: 'x-list' },
    });
    expect(w.find('.apex-order__panel').classes()).toContain('x-panel');
    expect(w.find('.apex-order__controls').classes()).toContain('x-ctrls');
    expect(w.find('.apex-order__btn').classes()).toContain('x-btn');
    expect(w.find('.apex-order__grip').classes()).toContain('x-grip');
    expect(w.find('.apex-order__num').classes()).toContain('x-num');
    expect(w.find('.apex-order__row').classes()).toContain('x-row');
    expect(w.find('.apex-order__list').classes()).toContain('x-list');
  });

  it('the appearance props reach the element as CSS variables', async () => {
    const w = tree({ nodeSelectedBackground: '#123456', indent: '30px' });
    const style = w.find('.apex-ctl--trigger').element.parentElement!.getAttribute('style') || '';
    expect(style).toContain('--apex-tree-row-selected-bg: #123456');
    expect(style).toContain('--apex-tree-indent: 30px');

    const o = order({ rowSelectedColor: '#abcdef', moveButtonSize: '44px' });
    const os = o.find('.apex-order').attributes('style') || '';
    expect(os).toContain('--apex-order-row-selected-fg: #abcdef');
    expect(os).toContain('--apex-order-btn-size: 44px');
  });
});
