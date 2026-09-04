import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexAccordion from '../src/components/ApexAccordion.vue';

/**
 * The accordion rolls each panel the way ApexPanel rolls its body, from the
 * same core/collapseDoor.
 *
 * What is different here, and worth its own file: there are N doors rather than
 * one, and a single-open accordion moves TWO of them per click — the panel
 * being opened and the panel it displaces. That second one is easy to forget,
 * and it is the one that looks wrong: content vanishing on the left while the
 * right rolls open.
 *
 * happy-dom has no Web Animations, so `animate` is stubbed per body — which
 * also proves the component degrades to the instant swap wherever it is missing.
 */

const PANELS = [
  { value: 'a', header: 'One' },
  { value: 'b', header: 'Two' },
  { value: 'c', header: 'Three' },
];

const OVER = 10;
const NATURAL = 100;

/** Mount, then make every panel body measurable and recording. */
function stage(props: Record<string, unknown> = {}) {
  const w = mount(ApexAccordion, {
    props: { items: PANELS, ...props },
    attachTo: document.body,
  });

  /** keyframes recorded per panel, in DOM order */
  const frames: Record<number, Keyframe[][]> = {};
  w.findAll('.apex-ac__body').forEach((body, i) => {
    const el = body.element as HTMLElement;
    Object.defineProperty(el, 'scrollHeight', { configurable: true, get: () => NATURAL });
    frames[i] = [];
    (el as unknown as { animate: unknown }).animate = (kf: Keyframe[]) => {
      frames[i].push(kf);
      return { finished: Promise.resolve(), cancel: () => {} };
    };
  });

  /* Opening measures after a tick — it has to wait for `hidden` to come off —
     so the keyframes are not recorded until one render later than the action.
     Every action here settles before anything is read. */
  const settle = async () => { await w.vm.$nextTick(); await w.vm.$nextTick(); };
  const click = async (i: number) => {
    await w.findAll('.apex-ac__header')[i].trigger('click');
    await settle();
  };
  return { w, frames, click, settle };
}

const heights = (kf: Keyframe[]) => kf.map((f) => f.height);
const OPENING = ['0px', `${NATURAL + OVER}px`, `${NATURAL}px`];
const CLOSING = [`${NATURAL}px`, `${NATURAL + OVER}px`, '0px'];

describe('ApexAccordion door', () => {
  it('opens a panel with the overshoot, and closes it the same way', async () => {
    const { frames, click } = await stage();

    await click(0);
    expect(frames[0]).toHaveLength(1);
    expect(heights(frames[0][0])).toEqual(OPENING);

    await click(0);
    expect(frames[0]).toHaveLength(2);
    expect(heights(frames[0][1])).toEqual(CLOSING);
  });

  it('animates the displaced panel too, when only one may be open', async () => {
    const { frames, click } = await stage();

    await click(0);
    await click(1);

    /* The click was on the second header, but the first has to travel as well —
       otherwise its content just disappears while the other rolls open. */
    expect(heights(frames[1][0]), 'the panel being opened').toEqual(OPENING);
    expect(frames[0], 'the displaced panel must animate, not vanish').toHaveLength(2);
    expect(heights(frames[0][1])).toEqual(CLOSING);
  });

  it('leaves the others alone when several may be open at once', async () => {
    /* Uncontrolled: passing `value` would make the parent the owner, and a
       click that the parent never answers must NOT move the panel — which is
       the controlled contract, not what this case is about. */
    const { frames, click } = await stage({ multiple: true });

    await click(0);
    await click(1);

    expect(frames[0]).toHaveLength(1); // opened, never displaced
    expect(frames[1]).toHaveLength(1);
    expect(frames[2]).toHaveLength(0); // untouched
  });

  it('a panel opened from outside animates like a clicked one', async () => {
    const { w, frames, settle } = await stage({ value: null });

    await w.setProps({ value: 'b' });
    await settle();
    expect(frames[1]).toHaveLength(1);
    expect(heights(frames[1][0])).toEqual(OPENING);
  });

  it('keeps the body hidden once shut, so it cannot be tabbed into', async () => {
    const { w, click } = await stage();
    const body = () => w.findAll('.apex-ac__body')[0];

    expect(body().attributes('hidden')).toBeDefined();
    await click(0);
    expect(body().attributes('hidden')).toBeUndefined();

    await click(0);
    await new Promise((r) => setTimeout(r, 0)); // the finished promise
    await w.vm.$nextTick();                     // the render that re-applies it
    expect(body().attributes('hidden'), 'must end up hidden again').toBeDefined();
  });
});
