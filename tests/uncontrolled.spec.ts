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

/**
 * ApexPanel rolls its content up like a garage door rather than swapping
 * `hidden`, which read as the content vanishing.
 *
 * The keyframes are built from a measured height, so the shape of the travel is
 * what can be checked here: it must lift 10px past the natural height before
 * running to zero, and overshoot the same amount on the way back. happy-dom has
 * no Web Animations, so `animate` is stubbed — which also proves the component
 * degrades to the instant swap wherever it is missing.
 */
describe('ApexPanel garage door', () => {
  const OVER = 10;
  const NATURAL = 100; // the height in the brief, so the numbers read directly

  /** Mount with a measurable region and a recording `animate`. */
  async function stage() {
    const w = mount(ApexPanel, {
      props: { header: 'Fees', toggleable: true },
      slots: { default: 'Body copy' },
      attachTo: document.body,
    });
    const el = w.find('.apex-pn__region').element as HTMLElement;
    Object.defineProperty(el, 'scrollHeight', { configurable: true, get: () => NATURAL });

    const frames: Keyframe[][] = [];
    (el as unknown as { animate: unknown }).animate = (kf: Keyframe[]) => {
      frames.push(kf);
      return { finished: Promise.resolve() };
    };
    return { w, frames, el };
  }

  const heights = (kf: Keyframe[]) => kf.map((f) => f.height);

  it('closing lifts past the natural height, then runs to zero', async () => {
    const { w, frames } = await stage();
    await w.find('.apex-pn__toggle').trigger('click');

    expect(frames).toHaveLength(1);
    expect(heights(frames[0])).toEqual([`${NATURAL}px`, `${NATURAL + OVER}px`, '0px']);
  });

  it('opening overshoots by the same amount, then settles back', async () => {
    const { w, frames } = await stage();
    await w.find('.apex-pn__toggle').trigger('click'); // shut
    frames.length = 0;
    await w.find('.apex-pn__toggle').trigger('click'); // open again

    expect(frames).toHaveLength(1);
    expect(heights(frames[0])).toEqual(['0px', `${NATURAL + OVER}px`, `${NATURAL}px`]);
  });

  it('leaves overflow clipped only while it travels', async () => {
    const { w, el } = await stage();
    expect(el.style.overflow).toBe('');

    await w.find('.apex-pn__toggle').trigger('click');
    await new Promise((r) => setTimeout(r, 0)); // let the finished promise settle
    /* A panel that stayed clipped would cut off a select or date picker
       opening out of its body, so this must come back off. */
    expect(el.style.overflow, 'overflow must not be left clipped').toBe('');
  });

  it('the body and footer share one region, so they move together', () => {
    const w = mount(ApexPanel, {
      props: { header: 'Fees', toggleable: true },
      slots: { default: 'Body copy', footer: 'Footer' },
    });
    const region = w.find('.apex-pn__region');
    expect(region.find('.apex-pn__body').exists()).toBe(true);
    expect(region.find('.apex-pn__foot').exists()).toBe(true);
  });
});
