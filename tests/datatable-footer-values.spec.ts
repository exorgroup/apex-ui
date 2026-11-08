import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexDataTable from '../src/components/ApexDataTable.vue';

/**
 * A LAZY table's footer cannot be computed from its rows.
 *
 * The aggregating footer sums what the table HAS. On a client-side table that is everything,
 * and it is right. On a lazy one it is a single page, so "Total" under page two is the total
 * of page two — stated with the same confidence as the real one, and disagreeing with whatever
 * the server told the page the total was.
 *
 * There is no fix inside the table: the other pages are not here. So `footerValues` lets the
 * host, which asked the server for the totals, pass them in.
 */

const COLUMNS = [
  { field: 'name', header: 'Name' },
  { field: 'orders', header: 'Orders', aggregate: 'sum' as const },
  { field: 'amount', header: 'Amount', aggregate: 'sum' as const },
];

/** One page of a much larger set — which is the whole point. */
const PAGE = [
  { name: 'Alpha', orders: 2, amount: 10 },
  { name: 'Beta', orders: 3, amount: 20 },
];

const footerCells = (w: ReturnType<typeof mount>) =>
  w.findAll('tfoot tr').map((tr) => tr.findAll('td').map((td) => td.text()));

describe('a footer the host supplies', () => {
  it('shows the given values, not the sum of the page', () => {
    const w = mount(ApexDataTable, {
      props: {
        value: PAGE,
        columns: COLUMNS,
        dataKey: 'name',
        lazy: true,
        totalRecords: 400,
        footerValues: { orders: '390', amount: '€12,345.00' },
      } as any,
    });

    const rows = footerCells(w);
    expect(rows).toHaveLength(1);

    const [cells] = rows;
    /* The page sums to 5 orders and 30. Neither appears. */
    expect(cells).toContain('390');
    expect(cells).toContain('€12,345.00');
    expect(cells).not.toContain('5');
    expect(cells).not.toContain('30');
  });

  it('labels the first column when no value is given for it', () => {
    const w = mount(ApexDataTable, {
      props: {
        value: PAGE, columns: COLUMNS, dataKey: 'name', lazy: true, totalRecords: 400,
        footerValues: { orders: '390' },
      } as any,
    });

    expect(footerCells(w)[0][0]).toBe('Total');
  });

  it('takes a label of its own', () => {
    const w = mount(ApexDataTable, {
      props: {
        value: PAGE, columns: COLUMNS, dataKey: 'name', lazy: true, totalRecords: 400,
        footerValues: { orders: '390' }, footerLabel: 'All referrers',
      } as any,
    });

    expect(footerCells(w)[0][0]).toBe('All referrers');
  });

  it('a value for the FIRST column replaces the label', () => {
    const w = mount(ApexDataTable, {
      props: {
        value: PAGE, columns: COLUMNS, dataKey: 'name', lazy: true, totalRecords: 400,
        footerValues: { name: 'TOTAL', orders: '390' },
      } as any,
    });

    expect(footerCells(w)[0][0]).toBe('TOTAL');
  });

  it('suppresses the aggregating footer rather than showing both', () => {
    /* Two footers disagreeing with each other is worse than either alone, and the computed
       one would be the wrong one. */
    const w = mount(ApexDataTable, {
      props: {
        value: PAGE, columns: COLUMNS, dataKey: 'name', lazy: true, totalRecords: 400,
        footerMode: 'all',
        footerValues: { orders: '390' },
      } as any,
    });

    expect(footerCells(w)).toHaveLength(1);
  });

  it('and without it, the aggregate still sums the rows it has', () => {
    /* The client-side behaviour is untouched. */
    const w = mount(ApexDataTable, {
      props: { value: PAGE, columns: COLUMNS, dataKey: 'name' } as any,
    });

    const cells = footerCells(w)[0].join(' ');
    expect(cells).toContain('5');
    expect(cells).toContain('30');
  });

  it('no rows means no footer', () => {
    /* A total under an empty table is a number with nothing to be the total OF. */
    const w = mount(ApexDataTable, {
      props: {
        value: [], columns: COLUMNS, dataKey: 'name', lazy: true, totalRecords: 0,
        footerValues: { orders: '0' },
      } as any,
    });

    expect(w.findAll('tfoot tr')).toHaveLength(0);
  });
});
