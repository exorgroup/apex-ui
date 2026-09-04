import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexPanel from '../src/components/ApexPanel.vue';
import ApexFieldset from '../src/components/ApexFieldset.vue';

/**
 * A container that can be driven from outside must still work when nobody
 * drives it.
 *
 * Vue casts an ABSENT boolean prop to `false`, never `undefined`. So a
 * component that decides "am I controlled?" with `props.x !== undefined` is
 * always controlled, its local state is dead, and clicking the toggle does
 * nothing — which is exactly what ApexPanel and ApexFieldset did. The prop has
 * to be declared `undefined` in withDefaults to stay genuinely tri-state.
 *
 * These mount without the prop, which is the case that was broken.
 */

/* Props are typed loosely on purpose: the two entries have different shapes,
   and a union of them narrows to neither at the mount call. */
interface Case {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  C: any;
  props: Record<string, unknown>;
  toggle: string;
  root: string;
}

const CASES: Case[] = [
  { name: 'ApexPanel', C: ApexPanel, props: { header: 'Fees', toggleable: true }, toggle: '.apex-pn__toggle', root: '.apex-pn' },
  { name: 'ApexFieldset', C: ApexFieldset, props: { legend: 'Billing', toggleable: true }, toggle: '.apex-fs__label', root: '.apex-fs' },
];

describe.each(CASES)('$name, uncontrolled', ({ C, props, toggle, root }) => {
  it('starts open, collapses on click, and expands again', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = mount(C as any, { props, slots: { default: 'Body copy' } });
    expect(w.find(root).attributes('data-collapsed')).toBe('false');

    await w.find(toggle).trigger('click');
    expect(w.find(root).attributes('data-collapsed'), 'first click must collapse').toBe('true');

    await w.find(toggle).trigger('click');
    expect(w.find(root).attributes('data-collapsed'), 'second click must expand').toBe('false');
  });

  it('reports each change, so a listener can follow an uncontrolled one', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = mount(C as any, { props });
    await w.find(toggle).trigger('click');
    expect(w.emitted('update:collapsed')?.[0]).toEqual([true]);
    expect(w.emitted('toggle')?.[0]).toEqual([{ collapsed: true }]);
  });

  it('a passed value still wins over the local state', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = mount(C as any, { props: { ...props, collapsed: true } });
    expect(w.find(root).attributes('data-collapsed')).toBe('true');

    /* The click asks to expand and says so, but the parent has not changed the
       prop, so the rendered state must not move on its own. */
    await w.find(toggle).trigger('click');
    expect(w.emitted('update:collapsed')?.[0]).toEqual([false]);
    expect(w.find(root).attributes('data-collapsed'), 'controlled must not self-update').toBe('true');

    await w.setProps({ collapsed: false });
    expect(w.find(root).attributes('data-collapsed')).toBe('false');
  });
});
