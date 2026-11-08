import { describe, it, expect } from 'vitest';
import { filterRows } from '../src/core/table';

/**
 * A CLIENT-SIDE table honours every match mode the menu offers.
 *
 * A lazy table reports its filter model and the server does the work, so the host is what has
 * to understand `matchMode` — and two screens shipped with it dropped, which is recorded in
 * `column-filter-shape.spec.ts`. A client-side table is the other half: nothing leaves the
 * browser, `filterRows` is the whole implementation, and if it ignored the mode there would be
 * no server to blame and no request to inspect.
 *
 * So the six text modes are pinned here against one set of rows whose names differ at the
 * START, the MIDDLE and the END. A mode that quietly behaves like another cannot return the
 * right rows by luck on this data.
 */

const COLUMNS = [{ field: 'promoter', header: 'Promoter' }];

const ROWS = [
  { promoter: 'Alpha Productions' },  // starts with Alpha
  { promoter: 'Beta Alpha' },         // ends with Alpha
  { promoter: 'Gamma Limited' },      // neither
];

/** The model the filter MENU emits, which is the shape a host actually receives. */
const menu = (value: unknown, matchMode: string) => ({
  promoter: { operator: 'and', constraints: [{ value, matchMode }] },
}) as any;

const names = (model: any) => filterRows(ROWS, model, COLUMNS as any).map((r) => r.promoter);

describe('filterRows honours the mode on a menu constraint', () => {
  it('startsWith anchors at the beginning', () => {
    expect(names(menu('Alpha', 'startsWith'))).toEqual(['Alpha Productions']);
  });

  it('contains matches the middle, where startsWith does not', () => {
    expect(names(menu('Alpha', 'contains'))).toEqual(['Alpha Productions', 'Beta Alpha']);
  });

  it('endsWith anchors at the end', () => {
    expect(names(menu('Alpha', 'endsWith'))).toEqual(['Beta Alpha']);
  });

  it('notContains is the complement of contains', () => {
    expect(names(menu('Alpha', 'notContains'))).toEqual(['Gamma Limited']);
  });

  it('equals is the whole value, not a fragment', () => {
    expect(names(menu('Alpha Productions', 'equals'))).toEqual(['Alpha Productions']);
    expect(names(menu('Alpha', 'equals'))).toEqual([]);
  });

  it('notEquals keeps a row that merely CONTAINS the text', () => {
    /* The assertion that separates the two negatives from each other. */
    expect(names(menu('Alpha Productions', 'notEquals'))).toEqual(['Beta Alpha', 'Gamma Limited']);
  });

  it('the six modes do not all agree, which is the whole point', () => {
    const results = ['startsWith', 'contains', 'endsWith', 'notContains', 'equals', 'notEquals']
      .map((mode) => JSON.stringify(names(menu('Alpha', mode))));

    /* Five distinct answers from six modes: `equals` and an unmatched fragment both return
       nothing on this data, and that is correct rather than a collision worth hiding. */
    expect(new Set(results).size).toBeGreaterThanOrEqual(4);
  });
});

describe('an empty rule is not a filter', () => {
  it('Apply with nothing typed returns every row', () => {
    /* The menu emits a constraint with a null value when Apply is pressed on an empty box.
       Treated as a filter it would match nothing and read as "your search found nothing". */
    expect(names(menu(null, 'startsWith'))).toHaveLength(3);
    expect(names(menu('', 'contains'))).toHaveLength(3);
  });
});

describe('stacked rules', () => {
  it('AND narrows', () => {
    const model = {
      promoter: {
        operator: 'and',
        constraints: [
          { value: 'Alpha', matchMode: 'contains' },
          { value: 'Beta', matchMode: 'startsWith' },
        ],
      },
    } as any;

    expect(filterRows(ROWS, model, COLUMNS as any).map((r) => r.promoter)).toEqual(['Beta Alpha']);
  });

  it('OR widens', () => {
    const model = {
      promoter: {
        operator: 'or',
        constraints: [
          { value: 'Gamma', matchMode: 'startsWith' },
          { value: 'Alpha Productions', matchMode: 'equals' },
        ],
      },
    } as any;

    expect(filterRows(ROWS, model, COLUMNS as any).map((r) => r.promoter))
      .toEqual(['Alpha Productions', 'Gamma Limited']);
  });
});
