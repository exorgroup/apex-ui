import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexTreeTable from '../src/components/ApexTreeTable.vue';

/**
 * The tree table's footer, and the totals it cannot compute itself.
 *
 * `aggregateTree` offers sum, avg, min, max, count and distinct. A RATIO is
 * none of them: the total of an attendance column is
 * `sum(attended) / sum(issued)`, and `avg` — the one that looks right —
 * averages the rows' own percentages instead. The two agree when there is
 * exactly one row, which is precisely the case somebody checks by hand.
 *
 * So a footer cell is slottable. The default is unchanged, which the first
 * test here pins.
 */

const ROWS = [
  {
    key: 'a',
    data: { label: 'Monday', issued: 100, attended: 90, rate: 90 },
    children: [
      { key: 'a1', data: { label: 'Stalls', issued: 60, attended: 54, rate: 90 } },
      { key: 'a2', data: { label: 'Circle', issued: 40, attended: 36, rate: 90 } },
    ],
  },
  /* Deliberately much bigger than Monday, and much worse attended. Without the
     size difference the weighted total and the average of the roots coincide,
     and a fixture where two wrong answers look right proves nothing. */
  { key: 'b', data: { label: 'Tuesday', issued: 300, attended: 30, rate: 10 } },
];

const COLS = [
  { field: 'label', header: 'Night', expander: true },
  { field: 'issued', header: 'Issued', aggregate: 'sum' as const },
  { field: 'attended', header: 'Attended', aggregate: 'sum' as const },
  { field: 'rate', header: 'Attendance' },
];

const footCells = (w: ReturnType<typeof mount>) =>
  w.findAll('tfoot td').map((c) => c.text());

describe('ApexTreeTable footer', () => {
  const mk = (options = {}) => mount(ApexTreeTable, {
    props: { value: ROWS, columns: COLS, showFooter: true },
    ...options,
  });

  it('sums the leaves and not the branches', () => {
    /* Issued: 60 + 40 + 300 = 400, NOT 100 + 60 + 40 + 300. A parent counted
       alongside its own children is the double count a tree total invites, and
       `aggregateTree` defaults to leaves only. */
    expect(footCells(mk())).toEqual(['Total', '400', '120', '']);
  });

  it('leaves a column with no aggregate empty by default', () => {
    /* The attendance column above. Empty is the honest default: the component
       has no way to know the total of a ratio. */
    expect(footCells(mk())[3]).toBe('');
  });

  it('lets the caller write a footer cell', () => {
    const w = mk({
      slots: {
        'footer:rate': `<template #footer:rate="{ nodes }">{{ nodes.length }} nights</template>`,
      },
    });

    expect(footCells(w)[3]).toBe('2 nights');
  });

  it('hands the slot the nodes, so a weighted total can be worked out', () => {
    /* The reason this slot exists, computed the correct way: 120 of 400 is
       30%. Averaging the three leaves' own rates (90, 90, 10) gives 63.3;
       averaging the two ROOTS (90, 10) gives 50. Three different answers, and
       only one of them is the attendance — the fixture is built so that no two
       of them agree. */
    const w = mk({
      slots: {
        'footer:rate': `
          <template #footer:rate="{ nodes }">
            {{ Math.round(
                 nodes.flatMap(n => n.children ?? [n]).reduce((s, n) => s + n.data.attended, 0) /
                 nodes.flatMap(n => n.children ?? [n]).reduce((s, n) => s + n.data.issued, 0) * 1000
               ) / 10 }}%
          </template>`,
      },
    });

    expect(footCells(w)[3]).toBe('30%');
  });

  it('still passes the computed aggregate to a slot that wants to reformat it', () => {
    const w = mk({
      slots: {
        'footer:issued': `<template #footer:issued="{ value }">{{ value }} seats</template>`,
      },
    });

    expect(footCells(w)[1]).toBe('400 seats');
  });
});
