import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexEditorToolbar from '../src/components/ApexEditorToolbar.vue';
import { CATALOGUE } from '../src/core/editor/catalogue';

/**
 * Leaving a button out of a preset — N/020.
 *
 * Asked for from the blog screen: the standard bar, without inline `code`
 * and without the source view. A blog author has no use for either, and
 * the source view hands them raw HTML to break.
 *
 * The alternative was a hand-copied sixteen-entry `items` list in the
 * application. That is a fork: it stops tracking the preset the day
 * anything is added to one, and nobody notices, because a bar that is
 * merely out of date still renders.
 *
 * The buttons carry no command attribute, so they are read here the way a
 * user finds them — by their accessible name, taken from the catalogue so
 * the assertions do not hard-code a label that may be reworded.
 */

const SLOTS = { link: '<span class="probe-link"></span>', table: '<span class="probe-table"></span>' };

function bar(props: Record<string, unknown> = {}) {
  return mount(ApexEditorToolbar, {
    props: { can: {}, active: null, run: () => true, ...props },
    slots: SLOTS,
    attachTo: document.body,
  });
}

/** The accessible name of every button in the bar, in order. */
function labels(w: ReturnType<typeof bar>): string[] {
  return w.findAll('button.apex-edbar__btn').map((n) => n.attributes('aria-label') || '');
}

const nameOf = (command: string) => {
  const label = CATALOGUE[command]?.label;
  expect(label, `no catalogue entry for ${command}`).toBeTruthy();
  return label as string;
};

describe('excluding items from a toolbar', () => {
  it('takes the named buttons out', () => {
    const plain = bar({ preset: 'standard' });
    /* Vacuity: they have to BE there, or removing them proves nothing. */
    expect(labels(plain)).toContain(nameOf('code'));
    expect(labels(plain)).toContain(nameOf('source_code'));
    plain.unmount();

    const w = bar({ preset: 'standard', exclude: ['code', 'source_code'] });

    expect(labels(w)).not.toContain(nameOf('code'));
    expect(labels(w)).not.toContain(nameOf('source_code'));

    w.unmount();
  });

  it('leaves the rest of the preset alone, in order', () => {
    /* The point of excluding rather than re-listing: everything else is
       still whatever the preset says it is, today and after it grows. */
    const plain = bar({ preset: 'standard' });
    const expected = labels(plain).filter((l) => l !== nameOf('code') && l !== nameOf('source_code'));
    plain.unmount();

    expect(expected.length, 'nothing left to compare').toBeGreaterThan(5);

    const w = bar({ preset: 'standard', exclude: ['code', 'source_code'] });

    expect(labels(w)).toEqual(expected);

    w.unmount();
  });

  it('changes nothing when nothing is excluded', () => {
    /* `prune` runs on every path, so this asserts the tidy pass is a
       no-op on a well-formed preset rather than quietly reshaping it. */
    const plain = bar({ preset: 'standard' });
    const before = labels(plain);
    const separators = plain.findAll('.apex-edbar__sep').length;
    plain.unmount();

    expect(separators, 'no separators in the bar at all').toBeGreaterThan(0);

    const w = bar({ preset: 'standard', exclude: [] });

    expect(labels(w)).toEqual(before);
    expect(w.findAll('.apex-edbar__sep').length).toBe(separators);

    w.unmount();
  });

  it('does not leave a stray divider where the group used to be', () => {
    /* `source_code` is last in the preset, behind a separator. Removing it
       and nothing else leaves the bar ending on a divider. */
    const plain = bar({ preset: 'standard' });
    const before = plain.findAll('.apex-edbar__sep').length;
    plain.unmount();

    const w = bar({ preset: 'standard', exclude: ['source_code'] });

    expect(w.findAll('.apex-edbar__sep').length).toBe(before - 1);

    w.unmount();
  });

  it('does not leave two dividers together when a whole group goes', () => {
    /* The other half of the tidy pass, and the one a mutation survived:
       the marks sit BETWEEN two separators, so removing all five leaves
       them adjacent - a double line down the middle of the bar. */
    const MARKS = ['strong', 'em', 'underline', 'strike', 'code'];

    const plain = bar({ preset: 'standard' });
    const before = plain.findAll('.apex-edbar__sep').length;
    MARKS.forEach((m) => expect(labels(plain), `${m} is not in the bar`).toContain(nameOf(m)));
    plain.unmount();

    const w = bar({ preset: 'standard', exclude: MARKS });

    MARKS.forEach((m) => expect(labels(w)).not.toContain(nameOf(m)));

    /* Read in document order: a count alone cannot tell a collapsed pair
       from a separator lost somewhere else. */
    const kinds = Array.from(w.find('.apex-edbar').element.children)
      .map((el) => (el.classList.contains('apex-edbar__sep') ? 'sep' : 'item'));

    expect(kinds.some((k, i) => k === 'sep' && kinds[i + 1] === 'sep')).toBe(false);
    expect(w.findAll('.apex-edbar__sep').length).toBe(before - 1);

    w.unmount();
  });

  it('reaches the overflow menu too', () => {
    /* A button one click behind the ⋮ is still on the bar. */
    const plain = bar({ preset: 'standard' });
    const rowsBefore = (plain.vm as never as { overflowMenuItems: { label?: string }[] }).overflowMenuItems;
    expect(rowsBefore.some((r) => r.label === nameOf('horizontal_rule'))).toBe(true);
    plain.unmount();

    const w = bar({ preset: 'standard', exclude: ['horizontal_rule'] });
    const rows = (w.vm as never as { overflowMenuItems: { label?: string }[] }).overflowMenuItems;

    expect(rows.some((r) => r.label === nameOf('horizontal_rule'))).toBe(false);

    w.unmount();
  });

  it('reaches an option of the block select, not only the bar', () => {
    const plain = bar({ preset: 'standard' });
    const all = plain.findAll('option').map((o) => o.text());
    plain.unmount();

    expect(all).toContain(nameOf('code_block'));

    const w = bar({ preset: 'standard', exclude: ['code_block'] });

    expect(w.findAll('option').map((o) => o.text())).not.toContain(nameOf('code_block'));

    w.unmount();
  });

  it('matches a custom control by its slot name', () => {
    /* `link` and `table` are slots, not commands; excluding by the name
       the preset uses is the only thing a caller can be expected to know. */
    const plain = bar({ preset: 'standard' });
    expect(plain.find('.probe-table').exists(), 'no table control to remove').toBe(true);
    plain.unmount();

    const w = bar({ preset: 'standard', exclude: ['table'] });

    expect(w.find('.probe-table').exists()).toBe(false);
    expect(w.find('.probe-link').exists(), 'it took the link control with it').toBe(true);

    w.unmount();
  });

  it('applies to an explicit items list as well as to a preset', () => {
    const w = bar({ items: ['strong', 'em', 'code'], overflowItems: [], exclude: ['code'] });

    expect(labels(w)).toEqual([nameOf('strong'), nameOf('em')]);

    w.unmount();
  });
});
