import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexPaginator from '../src/components/ApexPaginator.vue';
import ApexDataTable from '../src/components/ApexDataTable.vue';

/**
 * A page size of `0` is "All" — every row on one page. TBX's Sales report offers 25 / 50 / 100 /
 * All (Phase AQ); the kit printed each option as a raw number and had no way to say "all".
 */
describe('ApexPaginator — rows: 0 is All', () => {
  it('labels the 0 option "All"', () => {
    const w = mount(ApexPaginator, { props: { rows: 25, totalRecords: 120, rowsPerPageOptions: [25, 50, 0] } });
    const labels = w.findAll('option').map((o) => o.text());

    expect(labels).toEqual(['25', '50', 'All']);
  });

  it('is one page showing every row, with no division by zero', () => {
    const w = mount(ApexPaginator, { props: { rows: 0, totalRecords: 120, template: '{first}-{last} of {total} · {pageCount}' } });

    expect(w.find('.apex-pager__summary').text()).toBe('1-120 of 120 · 1');
    expect(w.findAll('.apex-pager__btn--page')).toHaveLength(1);
  });
});

describe('ApexDataTable — rows: 0 shows every row', () => {
  const value = Array.from({ length: 40 }, (_, i) => ({ id: i + 1, name: `Row ${i + 1}` }));

  it('renders all rows on one page', () => {
    const w = mount(ApexDataTable, {
      props: { value, columns: [{ field: 'name', header: 'Name' }], dataKey: 'id', paginator: true, rows: 0 },
    });

    expect(w.findAll('tbody tr')).toHaveLength(40);
  });

  it('still pages at a real size', () => {
    const w = mount(ApexDataTable, {
      props: { value, columns: [{ field: 'name', header: 'Name' }], dataKey: 'id', paginator: true, rows: 10 },
    });

    expect(w.findAll('tbody tr')).toHaveLength(10);
  });
});
