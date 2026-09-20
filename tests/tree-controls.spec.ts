import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexTree from '../src/components/ApexTree.vue';
import ApexTreeTable from '../src/components/ApexTreeTable.vue';

/**
 * Expansion, selection and lazy loading for ApexTree and ApexTreeTable.
 *
 * Both hold their state in bindable key maps rather than owning it, which is
 * the part worth guarding: a control that quietly keeps its own copy looks
 * right in a demo and drifts from the app the first time the app sets a key
 * itself. `tree-order.spec.ts` covers ApexTreeSelect, which is a different
 * control on a similar-sounding name.
 */

/** ES2021 lib here: `Array.prototype.at` type-errors. See AF2-256. */
const last = <T>(a: T[] | undefined): T | undefined => (a ? a[a.length - 1] : undefined);

const NODES = [
  { key: 'docs', label: 'Documents', children: [
    { key: 'work', label: 'Work', children: [
      { key: 'x', label: 'Expenses.xlsx' },
      { key: 'c', label: 'Contract.pdf' },
    ] },
  ] },
  { key: 'media', label: 'Media' },
];

describe('ApexTree — expansion', () => {
  it('renders only what the key map says is open', async () => {
    const w = mount(ApexTree, { props: { value: NODES } });
    /* Collapsed: the two roots and nothing beneath them. */
    expect(w.findAll('.apex-tr__row').length).toBe(2);
    await w.setProps({ expandedKeys: { docs: true } });
    expect(w.findAll('.apex-tr__row').length).toBe(3);
    await w.setProps({ expandedKeys: { docs: true, work: true } });
    expect(w.findAll('.apex-tr__row').length).toBe(5);
  });

  it('reports a toggle rather than expanding on its own', async () => {
    const w = mount(ApexTree, { props: { value: NODES, expandedKeys: {} } });
    await w.findAll('.apex-tr__toggle')[0].trigger('click');
    const keys = w.emitted('update:expandedKeys')?.[0][0] as Record<string, boolean>;
    expect(keys.docs).toBe(true);
    /* The prop did not change, so the row count must not have either. */
    expect(w.findAll('.apex-tr__row').length).toBe(2);
  });

  it('indents by depth', async () => {
    const w = mount(ApexTree, {
      props: { value: NODES, expandedKeys: { docs: true }, indent: 30 },
    });
    const rows = w.findAll('.apex-tr__row');
    expect(rows[1].attributes('data-depth')).toBe('1');
  });
});

describe('ApexTree — selection', () => {
  it('single selection replaces, multiple accumulates', async () => {
    const one = mount(ApexTree, { props: { value: NODES, selectionMode: 'single' } });
    await one.findAll('.apex-tr__row')[0].trigger('click');
    await one.findAll('.apex-tr__row')[1].trigger('click');
    const latest = last(one.emitted('update:selectionKeys'))?.[0] as Record<string, unknown>;
    expect(Object.keys(latest).filter((k) => latest[k])).toEqual(['media']);
  });

  it('checkbox selection cascades down the branch', async () => {
    const w = mount(ApexTree, {
      props: { value: NODES, selectionMode: 'checkbox', expandedKeys: { docs: true, work: true } },
    });
    await w.findAll('.apex-tr__row')[0].trigger('click');
    const keys = w.emitted('update:selectionKeys')?.[0][0] as Record<string, { checked?: boolean }>;
    /* Ticking a folder ticks what is in it, or the tree disagrees with itself. */
    expect(keys.docs?.checked).toBe(true);
    expect(keys.x?.checked).toBe(true);
    expect(keys.c?.checked).toBe(true);
  });
});

describe('ApexTree — filtering and lazy loading', () => {
  it('a filter narrows the rows and keeps the branch that matched', async () => {
    const w = mount(ApexTree, {
      props: { value: NODES, filter: true, expandedKeys: { docs: true, work: true } },
    });
    await w.find('.apex-tr__filter input').setValue('contract');
    const labels = w.findAll('.apex-tr__label').map((l) => l.text());
    /* The match, and the folders it sits in — a match with no path to it is
       not something the reader can act on. */
    expect(labels.some((t) => t.includes('Contract'))).toBe(true);
    expect(labels.some((t) => t.includes('Expenses'))).toBe(false);
  });

  it('asks the host for children instead of inventing them', async () => {
    const LAZY = [{ key: 'l1', label: 'Region', leaf: false }];
    const w = mount(ApexTree, { props: { value: LAZY, lazy: true, expandedKeys: {} } });
    await w.findAll('.apex-tr__toggle')[0].trigger('click');
    expect(w.emitted('node-expand')?.[0][0]).toMatchObject({ key: 'l1' });
  });

  it('draws placeholder rows while loading in skeleton mode', () => {
    const w = mount(ApexTree, {
      props: { value: NODES, loading: true, loadingMode: 'skeleton', skeletonRows: 4 },
    });
    expect(w.findAll('.apex-tr__row--skel').length).toBe(4);
  });
});

const TT_ROWS = [
  { key: 'd', data: { name: 'Documents', type: 'Folder', size: 75 }, children: [
    { key: 'd1', data: { name: 'Expenses.xlsx', type: 'Spreadsheet', size: 30 } },
    { key: 'd2', data: { name: 'Contract.pdf', type: 'Document', size: 25 } },
  ] },
  { key: 'm', data: { name: 'Media', type: 'Folder', size: 90 } },
];
const TT_COLS = [
  { field: 'name', header: 'Name', expander: true, sortable: true },
  { field: 'size', header: 'Size', sortable: true, aggregate: 'sum' as const },
  { field: 'type', header: 'Type', sortable: true },
];

describe('ApexTreeTable', () => {
  const mk = (props = {}) => mount(ApexTreeTable, {
    props: { value: TT_ROWS, columns: TT_COLS, ...props },
  });

  it('shows a branch only when the key map opens it', async () => {
    const w = mk();
    expect(w.findAll('.apex-tt__cell').length).toBe(2);
    await w.setProps({ expandedKeys: { d: true } });
    expect(w.findAll('.apex-tt__cell').length).toBe(4);
  });

  it('indents a child row from the indent prop', async () => {
    const w = mk({ expandedKeys: { d: true }, indent: 40 });
    const cells = w.findAll('.apex-tt__cell');
    /* AF2-257 removed --apex-tt-indent, which nothing read. This is the
       behaviour that removal had to leave untouched. */
    expect(cells[1].attributes('style')).toContain('40px');
  });

  it('reports a sort rather than reordering behind the caller', async () => {
    const w = mk();
    /* The header is a <th> with a button inside; the button carries the
       handler, so clicking the cell does nothing. */
    await w.findAll('.apex-dt__sort')[1].trigger('click');
    expect(w.emitted('update:sortField')?.[0]).toEqual(['size']);
    expect(w.emitted('sort')).toBeTruthy();
  });

  it('sorts the rows it is given a field and order for', () => {
    const w = mk({ sortField: 'size', sortOrder: 1 });
    const first = w.findAll('.apex-tt__cell')[0].text();
    /* Media is 90, Documents 75 — ascending puts Documents first. */
    expect(first).toContain('Documents');
  });

  it('selection is reported as keys, not owned', async () => {
    const w = mk({ selectionMode: 'single' });
    await w.findAll('tbody tr')[0].trigger('click');
    const keys = w.emitted('update:selectionKeys')?.[0][0] as Record<string, unknown>;
    expect(Object.keys(keys).filter((k) => keys[k])).toEqual(['d']);
  });

  it('asks the host for children when a branch is opened lazily', async () => {
    const LAZY = [{ key: 'z1', data: { name: 'Region', type: 'Region', size: 0 }, leaf: false }];
    const w = mount(ApexTreeTable, {
      props: { value: LAZY, columns: TT_COLS, lazy: true, expandedKeys: {} },
    });
    await w.find('.apex-tr__toggle').trigger('click');
    expect(w.emitted('node-expand')?.[0][0]).toMatchObject({ key: 'z1' });
  });
});
