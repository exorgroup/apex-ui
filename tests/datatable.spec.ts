import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexDataTable from '../src/components/ApexDataTable.vue';

/**
 * ApexDataTable behaviour: sorting, filtering, selection, expansion, paging
 * and frozen columns.
 *
 * The library's largest control, and until AF2-261 it could not be mounted in
 * a test at all — `measureFrozen` indexed `tHead.rows`, which happy-dom does
 * not implement, so every mount died in onMounted. Column layout is covered
 * separately in datatable-columns.spec.ts.
 *
 * Frozen columns are asserted through the attributes the CSS reads, not
 * through pixel offsets: happy-dom returns zero from getBoundingClientRect
 * (§11.7), so the measured insets are meaningless here while the decision to
 * pin a column is not.
 */

const ROWS = [
  { id: 3, name: 'Cherry', qty: 30, country: 'Malta' },
  { id: 1, name: 'Apple', qty: 10, country: 'Italy' },
  { id: 2, name: 'Banana', qty: 20, country: 'Malta' },
];
const COLS = [
  { field: 'name', header: 'Name', sortable: true },
  { field: 'qty', header: 'Qty', sortable: true },
  { field: 'country', header: 'Country' },
];
const mk = (props = {}) => mount(ApexDataTable, {
  props: { value: ROWS, columns: COLS, dataKey: 'id', ...props },
});
const cellsIn = (w: ReturnType<typeof mk>, col = 0) =>
  w.findAll('tbody tr').map((r) => r.findAll('td')[col]?.text());

describe('sorting', () => {
  it('reports the field and order rather than sorting behind the caller', async () => {
    const w = mk();
    await w.findAll('.apex-dt__sort')[0].trigger('click');
    expect(w.emitted('update:sortField')?.[0]).toEqual(['name']);
    expect(w.emitted('update:sortOrder')?.[0]).toEqual([1]);
    expect(w.emitted('sort')).toBeTruthy();
  });

  it('sorts the rows when given a field and order', () => {
    expect(cellsIn(mk({ sortField: 'name', sortOrder: 1 }))).toEqual(['Apple', 'Banana', 'Cherry']);
    expect(cellsIn(mk({ sortField: 'name', sortOrder: -1 }))).toEqual(['Cherry', 'Banana', 'Apple']);
  });

  it('a third click clears the sort when removableSort is on', async () => {
    /* Controlled: the table reports, the caller applies. Feeding each
       emission back is what a host does, and without it every click is
       computed from the same starting order. */
    const w = mk({ removableSort: true, sortField: 'name', sortOrder: 1 });
    await w.findAll('.apex-dt__sort')[0].trigger('click');
    expect(w.emitted('update:sortOrder')?.[0]).toEqual([-1]);
    await w.setProps({ sortOrder: -1 });
    await w.findAll('.apex-dt__sort')[0].trigger('click');
    const last = w.emitted('update:sortField')?.slice(-1)[0];
    expect(last?.[0]).toBeUndefined();
  });

  it('multi-sort keeps both fields and ranks them', async () => {
    const w = mk({ sortMode: 'multiple',
      columns: [...COLS.slice(0, 2), { field: 'country', header: 'Country', sortable: true }],
      multiSortMeta: [{ field: 'country', order: 1 }, { field: 'qty', order: -1 }] });
    /* Malta's two rows are ordered by qty descending within the country. */
    expect(cellsIn(w)).toEqual(['Apple', 'Cherry', 'Banana']);
    expect(w.findAll('.apex-dt__rank').length).toBe(2);
  });
});

describe('filtering', () => {
  it('a global filter narrows the rows', () => {
    const w = mk({ showGlobalFilter: true, filters: { global: { value: 'mal', matchMode: 'contains' } } });
    expect(w.findAll('tbody tr').length).toBe(2);
  });

  it('a per-column filter narrows on that column only', () => {
    const w = mk({
      columns: [{ field: 'name', header: 'Name', filter: true, filterType: 'text' }, ...COLS.slice(1)],
      filterDisplay: 'row',
      filters: { name: { value: 'an', matchMode: 'contains' } },
    });
    expect(cellsIn(w)).toEqual(['Banana']);
  });

  it('says so when a filter matches nothing', () => {
    const w = mk({ showGlobalFilter: true, filters: { global: { value: 'zzz', matchMode: 'contains' } } });
    expect(w.find('.apex-dt__empty').exists()).toBe(true);
  });
});

describe('selection', () => {
  it('single selection replaces, and reports the row', async () => {
    const w = mk({ selectionMode: 'single' });
    await w.findAll('tbody tr')[0].trigger('click');
    expect(w.emitted('update:selection')?.[0][0]).toMatchObject({ id: 3 });
    expect(w.emitted('row-select')).toBeTruthy();
  });

  it('checkbox selection accumulates', async () => {
    const w = mk({ selectionMode: 'checkbox', selection: [] });
    await w.findAll('tbody .apex-cb__box')[0].trigger('click');
    const first = w.emitted('update:selection')?.[0][0] as Record<string, unknown>[];
    expect(first).toHaveLength(1);
    await w.setProps({ selection: first });
    await w.findAll('tbody .apex-cb__box')[1].trigger('click');
    expect(w.emitted('update:selection')?.slice(-1)[0][0]).toHaveLength(2);
  });

  it('the header box selects every row at once', async () => {
    const w = mk({ selectionMode: 'checkbox', selection: [] });
    await w.find('thead .apex-cb__box').trigger('click');
    expect(w.emitted('update:selection')?.slice(-1)[0][0]).toHaveLength(3);
  });
});

describe('row expansion', () => {
  it('reports the row rather than expanding on its own', async () => {
    const w = mk({ rowExpansion: true, expandedRows: [] });
    await w.find('.apex-dt__exp').trigger('click');
    expect(w.emitted('row-expand')).toBeTruthy();
    expect(w.emitted('update:expandedRows')?.[0][0]).toHaveLength(1);
  });

  it('renders the detail row for what the caller expanded', () => {
    const w = mount(ApexDataTable, {
      props: { value: ROWS, columns: COLS, dataKey: 'id', rowExpansion: true, expandedRows: [ROWS[0]] },
      slots: { expansion: '<p class="det">detail for {{ params.row.name }}</p>' },
    });
    expect(w.find('.det').text()).toContain('Cherry');
  });
});

describe('paging', () => {
  it('shows one page at a time and reports the next offset', async () => {
    const w = mk({ paginator: true, rows: 2, first: 0 });
    expect(w.findAll('tbody tr').length).toBe(2);
    await w.findAll('.apex-pager__btn--page')[1].trigger('click');
    expect(w.emitted('update:first')?.[0]).toEqual([2]);
  });

  it('lazy leaves the rows alone and trusts totalRecords', () => {
    /* The host has already paged and sorted; sorting locally would reorder
       the one page it sent. */
    const w = mk({ lazy: true, paginator: true, rows: 2, totalRecords: 99,
                   sortField: 'name', sortOrder: 1 });
    /* Every row it was handed, in the order it was handed them — the host
       has already paged and sorted, and re-doing either would reorder the
       single page it sent. */
    expect(cellsIn(w)).toEqual(['Cherry', 'Apple', 'Banana']);
    expect(w.find('.apex-pager__summary').text()).toContain('99');
  });
});

describe('frozen columns', () => {
  it('marks which side a column is pinned to', () => {
    const w = mk({ scrollable: true, columns: [
      { field: 'name', header: 'Name', frozen: true },
      { field: 'qty', header: 'Qty' },
      { field: 'country', header: 'Country', frozen: true, alignFrozen: 'right' },
    ] });
    const th = w.findAll('thead tr:last-child th');
    /* The attribute is what the CSS reads; the pixel insets it computes are
       zero under happy-dom and mean nothing here (§11.7). */
    expect(th[0].attributes('data-frozen')).toBe('start');
    expect(th[1].attributes('data-frozen')).toBeUndefined();
    expect(th[2].attributes('data-frozen')).toBe('end');
  });

  it('a frozen row leaves the body so it is not drawn twice', () => {
    const w = mk({ rowFreeze: true, frozenValue: [ROWS[0]] });
    /* The pinned copy lives in its OWN tbody above the scrolling one, so
       `tbody tr` counts both — the scrolling body is the last tbody. */
    expect(w.findAll('.apex-dt__frozen-rows tr').length).toBe(1);
    const body = w.findAll('tbody');
    const names = body[body.length - 1].findAll('tr')
      .map((r) => r.findAll('td')[1]?.text());   // [0] is the lock gutter
    expect(names).toEqual(['Apple', 'Banana']);
  });
});
