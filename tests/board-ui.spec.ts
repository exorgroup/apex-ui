import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexTaskBoard from '../src/components/ApexTaskBoard.vue';

/*
 * ApexTaskBoard's ui map, checked where each class has to land.
 *
 * The board is the widest map in the library — fifteen parts on the board and
 * six more inside the default card — and every one of them is optional, so a
 * key that the template never reads satisfies the interface, typechecks, and
 * documents a customisation that silently does nothing.
 *
 * The card keys are worth the extra mount: they reach ApexTaskCard by being
 * handed down, so a board that forgot to pass `:ui` would still class its own
 * fifteen parts perfectly and leave the card untouched. Proved by dropping
 * that one binding: the five card cases fail, the fifteen board cases do not.
 *
 * Two keys are NOT covered here — `indicator` and `preview`. Both exist only
 * mid-drag, which needs a pointer sequence over measured geometry that
 * happy-dom does not provide. Saying so beats a test that mounts them into
 * nothing and reports a pass.
 */

const COLUMNS = [
  { id: 'todo', title: 'To do', limit: 2 },
  { id: 'doing', title: 'Doing' },
];
const LANES = [{ id: 'team-a', title: 'Team A' }];
const GROUPS = [{ id: 'phase', title: 'Phase one', columnIds: ['todo', 'doing'] }];
const ITEMS = [
  { id: '1', columnId: 'todo', swimlaneId: 'team-a', title: 'Wire the printer', labels: ['ops'], priority: 'High' },
];

/** Every key at once, so one mount covers the board's whole surface. */
const UI = {
  root: 'x-root', grid: 'x-grid', head: 'x-head', column: 'x-column', group: 'x-group',
  columnTitle: 'x-coltitle', count: 'x-count', lane: 'x-lane', laneTitle: 'x-lanetitle',
  cell: 'x-cell', empty: 'x-empty', add: 'x-add', card: 'x-card',
  body: 'x-body', cardTitle: 'x-cardtitle', labels: 'x-labels', label: 'x-label',
  meta: 'x-meta', chip: 'x-chip',
};

describe('ApexTaskBoard accepts the ui class map', () => {
  const w = mount(ApexTaskBoard, {
    props: { columns: COLUMNS, swimlanes: LANES, columnGroups: GROUPS, items: ITEMS, ui: UI },
  });

  it.each([
    ['.apex-kb', 'x-root'],
    ['.apex-kb__grid', 'x-grid'],
    ['.apex-kb__head', 'x-head'],
    ['.apex-kb__groups', 'x-head'],
    ['.apex-kb__group', 'x-group'],
    ['.apex-kb__col-head', 'x-column'],
    ['.apex-kb__col-title', 'x-coltitle'],
    ['.apex-kb__count', 'x-count'],
    ['.apex-kb__lane-head', 'x-lane'],
    ['.apex-kb__lane-title', 'x-lanetitle'],
    ['.apex-kb__cell', 'x-cell'],
    ['.apex-kb__empty', 'x-empty'],
    ['.apex-kb__add', 'x-add'],
    ['.apex-kb__card', 'x-card'],
  ])('%s carries %s', (selector, cls) => {
    const found = w.findAll(selector);
    expect(found.length, `nothing matched ${selector}`).toBeGreaterThan(0);
    expect(found.every((e) => e.classes().includes(cls)), `${selector} is missing ${cls}`).toBe(true);
  });

  it.each([
    ['.apex-kb__body', 'x-body'],
    ['.apex-kb__title', 'x-cardtitle'],
    ['.apex-kb__labels', 'x-labels'],
    ['.apex-kb__label', 'x-label'],
    ['.apex-kb__meta', 'x-meta'],
  ])('the default card passes %s down', (selector, cls) => {
    const found = w.findAll(selector);
    expect(found.length, `nothing matched ${selector} — is :ui reaching ApexTaskCard?`).toBeGreaterThan(0);
    expect(found.every((e) => e.classes().includes(cls))).toBe(true);
  });
});

describe('ApexTaskBoard writes its metrics as --apex-kb-* variables', () => {
  /*
   * Ten props reach the stylesheet only as inline variables, so a misspelling
   * renders identically to a correct one. This is the AF2-131/141/170 rename's
   * proof for the board.
   */
  it('every one is prefixed and reaches the root', () => {
    const w = mount(ApexTaskBoard, {
      props: {
        columns: COLUMNS, items: ITEMS,
        columnWidth: '300px', laneWidth: '180px', gap: '20px',
        background: '#111', columnBackground: '#222', cardBackground: '#333',
        cardRadius: '9px', accent: '#0f0',
      },
    });
    const style = w.find('.apex-kb').attributes('style') || '';
    expect(style).toContain('--apex-kb-col-w: 300px');
    expect(style).toContain('--apex-kb-gap: 20px');
    expect(style).toContain('--apex-kb-accent: #0f0');
    /* No survivor of the old prefix. `--kb-gap` is a substring of
       `--apex-kb-gap`, so this has to be matched to its start. */
    expect(/(^|[^-])--kb-/.test(style)).toBe(false);
  });
});
