import { describe, it, expect, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import ApexDataTable from '../src/components/ApexDataTable.vue';

/**
 * Column layout: resize, reorder, visibility, groups and persistence.
 *
 * Ported in AF2-262a from the gallery's browser mirror, where all of this had
 * been implemented and had never reached a package build — our stylesheet
 * already carried every rule for it, so only the behaviour was missing. The
 * table owns width, order and visibility, and `columnState` is bindable for
 * callers who want to persist or drive it.
 *
 * Dragging itself is a browser interaction — happy-dom has no
 * elementsFromPoint (§11.7) — so the drop is driven through `columnState`
 * rather than a synthetic pointer path, and what is asserted here is that the
 * state produces the layout.
 */

const COLS = [
  { field: 'a', header: 'Alpha' },
  { field: 'b', header: 'Bravo' },
  { field: 'c', header: 'Charlie' },
];
const ROWS = [{ a: 1, b: 2, c: 3 }, { a: 4, b: 5, c: 6 }];
const mk = (props = {}) => mount(ApexDataTable, {
  props: { value: ROWS, columns: COLS, dataKey: 'a', ...props },
});
const headers = (w: ReturnType<typeof mk>) =>
  w.findAll('thead tr:last-child th').map((t) => t.text()).filter(Boolean);

describe('resize', () => {
  it('puts a grip on every boundary except the last column', () => {
    const w = mk({ resizableColumns: true });
    /* Three columns, two boundaries: the last has nothing to its right to
       take width from. */
    expect(w.findAll('.apex-dt__resizer').length).toBe(2);
  });

  it('none at all when the table is not resizable', () => {
    expect(mk().findAll('.apex-dt__resizer').length).toBe(0);
  });

  it('a stored width beats the declared one', () => {
    const w = mk({ columns: [{ field: 'a', header: 'Alpha', width: '80px' }],
                   columnState: { widths: { a: 260 } } });
    expect(w.find('thead tr:last-child th').attributes('style')).toContain('260px');
  });
});

describe('reorder', () => {
  it('renders the columns in the order the state names', () => {
    expect(headers(mk())).toEqual(['Alpha', 'Bravo', 'Charlie']);
    expect(headers(mk({ columnState: { order: ['c', 'a', 'b'] } })))
      .toEqual(['Charlie', 'Alpha', 'Bravo']);
  });

  it('a column the order does not mention still appears', () => {
    /* A partial order must not make a column vanish — it is what happens when
       a column is added after a layout was saved. */
    expect(headers(mk({ columnState: { order: ['c'] } })))
      .toEqual(['Charlie', 'Alpha', 'Bravo']);
  });
});

describe('visibility', () => {
  it('hidden columns leave the table but stay in the picker', async () => {
    const w = mk({ columnToggle: true, columnState: { hidden: ['b'] } });
    expect(headers(w)).toEqual(['Alpha', 'Charlie']);
    await w.find('.apex-dt__colbtn').trigger('click');
    /* The picker lists every declared column: a list of what is showing
       cannot bring back what is not. */
    expect(w.findAll('.apex-dt__colrow').length).toBe(3);
    expect(w.find('.apex-dt__colcount').text()).toBe('2/3');
  });

  it('ticking a row reports the change', async () => {
    const w = mk({ columnToggle: true });
    await w.find('.apex-dt__colbtn').trigger('click');
    await w.findAll('.apex-dt__colrow input')[1].setValue(false);
    expect(w.emitted('column-toggle')?.[0]).toEqual([{ field: 'b', hidden: true }]);
    const state = w.emitted('update:columnState')?.[0][0] as { hidden?: string[] };
    expect(state.hidden).toEqual(['b']);
  });
});

describe('groups', () => {
  it('spans the run of its own columns and blanks the rest', () => {
    const w = mk({ columnGroups: [{ header: 'Pair', columns: ['a', 'b'] }] });
    const cells = w.findAll('.apex-dt__grouprow th');
    expect(cells.length).toBe(2);
    expect(cells[0].text()).toBe('Pair');
    expect(cells[0].attributes('colspan')).toBe('2');
    expect(cells[1].attributes('data-blank')).toBe('true');
  });

  it('follows the current order rather than the declared one', () => {
    /* Reordering must not let a group header span columns it does not own. */
    const w = mk({
      columnGroups: [{ header: 'Pair', columns: ['a', 'b'] }],
      columnState: { order: ['a', 'c', 'b'] },
    });
    const cells = w.findAll('.apex-dt__grouprow th');
    expect(cells.map((c) => c.attributes('colspan'))).toEqual(['1', '1', '1']);
  });

  it('no row at all without groups', () => {
    expect(mk().find('.apex-dt__grouprow').exists()).toBe(false);
  });
});

describe('persistence', () => {
  beforeEach(() => localStorage.clear());

  it('writes the layout under the key it was given', async () => {
    const w = mk({ stateKey: 'k1', columnToggle: true });
    await w.find('.apex-dt__colbtn').trigger('click');
    await w.findAll('.apex-dt__colrow input')[0].setValue(false);
    const raw = localStorage.getItem('apex-dt-cols:k1');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw as string).hidden).toEqual(['a']);
  });

  it('reads it back on mount', async () => {
    localStorage.setItem('apex-dt-cols:k2', JSON.stringify({ order: ['c', 'b', 'a'] }));
    const w = mk({ stateKey: 'k2' });
    /* The restore happens in onMounted, so the layout it produces is one tick
       away — which is also what the reader sees: the table paints once. */
    await nextTick();
    expect(headers(w)).toEqual(['Charlie', 'Bravo', 'Alpha']);
  });

  it('stores nothing without a key', async () => {
    const w = mk({ columnToggle: true });
    await w.find('.apex-dt__colbtn').trigger('click');
    await w.findAll('.apex-dt__colrow input')[0].setValue(false);
    expect(localStorage.length).toBe(0);
  });
});
