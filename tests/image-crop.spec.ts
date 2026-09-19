import { describe, it, expect, beforeAll, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApexImageCrop from '../src/components/ApexImageCrop.vue';

/**
 * ApexImageCrop — M/002.
 *
 * The geometry, which is the whole of the component: where the box starts, what
 * the four gestures do to it, when it snaps, and what it warns about.
 *
 * ## What is faked, and why only this much
 *
 * jsdom has no image decoder and no layout. Two things are stubbed and nothing
 * else:
 *
 *   `createImageBitmap`  returns a fixed size, so `natural` is known.
 *   `clientWidth`        returns the frame's width, so `scale` is 1:1 and a
 *                        pointer at clientX 100 is image pixel 100. Every
 *                        assertion below is then in the units the component
 *                        stores, with no arithmetic in the test to get them
 *                        wrong.
 *
 * `render()` is NOT tested here: it is `canvas.drawImage` + `toBlob`, neither of
 * which jsdom implements, and a mock of both would assert that the mock was
 * called rather than that an image was cropped. What it depends on — the rect
 * and the output size — IS tested, and those are the parts that can be wrong.
 */

const NAT = { width: 2000, height: 1000 };

beforeAll(() => {
  // @ts-expect-error — jsdom has no decoder
  window.createImageBitmap = vi.fn(async () => ({
    width: NAT.width,
    height: NAT.height,
    close: () => {},
  }));

  /* jsdom has no object URLs either, and the preview depends on one. */
  let n = 0;
  // @ts-expect-error
  URL.createObjectURL = () => `blob:stub/${++n}`;
  // @ts-expect-error
  URL.revokeObjectURL = () => {};

  if (!('setPointerCapture' in Element.prototype)) {
    Element.prototype.setPointerCapture = () => {};
    Element.prototype.releasePointerCapture = () => {};
  }

  // @ts-expect-error — jsdom lays nothing out; 1:1 keeps the test in image pixels
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: NAT.width });
  HTMLElement.prototype.getBoundingClientRect = function () {
    return { left: 0, top: 0, right: NAT.width, bottom: NAT.height, width: NAT.width, height: NAT.height, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
  };
});

const file = () => new File(['x'], 'photo.jpg', { type: 'image/jpeg' });

async function crop(props: Record<string, unknown> = {}) {
  const w = mount(ApexImageCrop, { props: { src: file(), ...props }, attachTo: document.body });
  await flushPromises();

  return w;
}

const rect = (w: ReturnType<typeof mount>) => (w.vm as unknown as { rect: { x: number; y: number; w: number; h: number } }).rect;

/** One drag, in image pixels because the scale is 1:1. */
async function drag(w: ReturnType<typeof mount>, from: [number, number], to: [number, number]) {
  const frame = w.find('.apex-ic__frame');
  await frame.trigger('pointerdown', { clientX: from[0], clientY: from[1], pointerId: 1 });
  await frame.trigger('pointermove', { clientX: to[0], clientY: to[1], pointerId: 1 });
  await frame.trigger('pointerup', { clientX: to[0], clientY: to[1], pointerId: 1 });
}

/** The same drag with the RIGHT button held. */
async function rightDrag(w: ReturnType<typeof mount>, from: [number, number], to: [number, number]) {
  const frame = w.find('.apex-ic__frame');
  await frame.trigger('pointerdown', { clientX: from[0], clientY: from[1], pointerId: 1, button: 2 });
  await frame.trigger('pointermove', { clientX: to[0], clientY: to[1], pointerId: 1, button: 2 });
  await frame.trigger('pointerup', { clientX: to[0], clientY: to[1], pointerId: 1, button: 2 });
}

describe('where the box starts', () => {
  it('auto centres the largest box of the target ratio', async () => {
    /* A 2000×1000 image and a 1:1 target: the box can only be 1000×1000, and
       centring it means trimming 500 from each side. */
    const w = await crop({ target: { width: 400, height: 400 } });

    expect(rect(w)).toEqual({ x: 500, y: 0, w: 1000, h: 1000 });
    w.unmount();
  });

  it('a wider target trims top and bottom instead', async () => {
    /* 4:1 against a 2:1 image — the width is the limit this time. */
    const w = await crop({ target: { width: 800, height: 200 } });

    expect(rect(w)).toEqual({ x: 0, y: 250, w: 2000, h: 500 });
    w.unmount();
  });

  it('NO TARGET means no crop — the whole image is kept', async () => {
    /* The user's rule, and the reason `auto` is unavailable without a target:
       there is no ratio to centre ON. */
    const w = await crop({ target: null });

    expect(rect(w)).toEqual({ x: 0, y: 0, w: NAT.width, h: NAT.height });
    w.unmount();
  });

  it('manual mode starts on the whole image even when a target is given', async () => {
    const w = await crop({ target: { width: 400, height: 400 }, mode: 'manual' });

    expect(rect(w)).toEqual({ x: 0, y: 0, w: NAT.width, h: NAT.height });
    w.unmount();
  });
});

describe('the preview', () => {
  it('has a src — the image is actually SHOWN', async () => {
    /* The bug this exists for: the object URL was created only in the `<img>`
       FALLBACK path, so on every browser that has `createImageBitmap` — which is
       all of them — `previewSrc` stayed null, the `<img>` never rendered, the
       frame collapsed to zero height, and the dialog opened EMPTY.

       The bitmap is what `render()` draws from; this is what the operator looks
       at. Two jobs, and conflating them cost a screen. */
    const w = await crop({ target: { width: 400, height: 400 } });

    const img = w.find('.apex-ic__img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toMatch(/^blob:/);
    w.unmount();
  });

  it('shows a plain url straight through', async () => {
    const w = mount(ApexImageCrop, { props: { src: 'https://x.test/a.webp' }, attachTo: document.body });
    await flushPromises();

    expect(w.find('.apex-ic__img').attributes('src')).toBe('https://x.test/a.webp');
    w.unmount();
  });
});

describe('drawing a box', () => {
  it('a drag outside the box draws a new one', async () => {
    const w = await crop({ target: null, mode: 'manual' });
    await drag(w, [1000, 400], [1300, 700]);

    expect(rect(w)).toMatchObject({ x: 1000, y: 400, w: 300, h: 300 });
    w.unmount();
  });

  it('draws upwards and leftwards too', async () => {
    /* The anchor is where the pointer went DOWN, so dragging back past it must
       move the box's origin rather than produce a negative width. */
    const w = await crop({ target: null, mode: 'manual' });
    await drag(w, [1300, 700], [1000, 400]);

    expect(rect(w)).toMatchObject({ x: 1000, y: 400, w: 300, h: 300 });
    w.unmount();
  });

  it('SNAPS to the target ratio while the ratio is locked', async () => {
    /* The decision this proves: drawing and locking must not contradict each
       other. A 600×200 drag against a 2:1 target — the width is dragged
       further, so it wins and the height follows to 300. */
    const w = await crop({ target: { width: 600, height: 300 }, lockRatio: true, mode: 'manual' });
    await drag(w, [100, 100], [700, 300]);

    const r = rect(w);
    expect(r.w / r.h).toBeCloseTo(2, 5);
    expect(r.w).toBe(600);
    expect(r.h).toBe(300);
    w.unmount();
  });

  it('does not snap when the ratio is unlocked', async () => {
    const w = await crop({ target: { width: 600, height: 300 }, lockRatio: false, mode: 'manual' });
    await drag(w, [100, 100], [700, 300]);

    expect(rect(w)).toMatchObject({ w: 600, h: 200 });
    w.unmount();
  });

  it('keeps the box inside the image', async () => {
    const w = await crop({ target: null, mode: 'manual' });
    await drag(w, [1900, 900], [2600, 1400]);

    const r = rect(w);
    expect(r.x + r.w).toBeLessThanOrEqual(NAT.width);
    expect(r.y + r.h).toBeLessThanOrEqual(NAT.height);
    w.unmount();
  });
});

describe('moving the box', () => {
  it('a drag INSIDE the box moves it and keeps its size', async () => {
    const w = await crop({ target: { width: 400, height: 400 } });
    const before = { ...rect(w) };

    await drag(w, [1000, 500], [1100, 400]);

    const after = rect(w);
    expect(after.w).toBe(before.w);
    expect(after.h).toBe(before.h);
    expect(after.x).toBe(before.x + 100);
    w.unmount();
  });

  it('cannot be moved off the edge', async () => {
    const w = await crop({ target: { width: 400, height: 400 } });
    await drag(w, [1000, 500], [-5000, 500]);

    expect(rect(w).x).toBe(0);
    w.unmount();
  });
});

describe('the two warnings', () => {
  it('warns when the SOURCE is smaller than the target, on load', async () => {
    const w = await crop({ target: { width: 4000, height: 3000 } });

    const warnings = (w.emitted('warning') ?? []).map((e) => (e[0] as { code: string }).code);
    expect(warnings).toContain('source-below-target');
    w.unmount();
  });

  it('warns when the BOX is smaller than the target', async () => {
    const w = await crop({ target: { width: 900, height: 900 }, mode: 'manual' });
    await drag(w, [100, 100], [300, 300]);

    const warnings = (w.emitted('warning') ?? []).map((e) => (e[0] as { code: string }).code);
    expect(warnings).toContain('below-target');
    w.unmount();
  });

  it('warns ONCE per crossing, not on every pointer move', async () => {
    /* A host showing these as alerts would otherwise stack one per move. */
    const w = await crop({ target: { width: 900, height: 900 }, mode: 'manual' });
    await drag(w, [100, 100], [300, 300]);
    await drag(w, [150, 150], [320, 320]);

    const below = (w.emitted('warning') ?? [])
      .filter((e) => (e[0] as { code: string }).code === 'below-target');
    expect(below).toHaveLength(1);
    w.unmount();
  });

  it('neither warning REFUSES anything — the box is still what was drawn', async () => {
    /* The user's decision: warn, and save if accepted. */
    const w = await crop({ target: { width: 900, height: 900 }, mode: 'manual' });
    await drag(w, [100, 100], [300, 300]);

    expect(rect(w).w).toBeGreaterThan(0);
    expect(w.emitted('warning')).toBeTruthy();
    w.unmount();
  });
});

describe('the output size', () => {
  const output = (w: ReturnType<typeof mount>) => (w.vm as unknown as { output: { width: number; height: number } }).output;

  it('is the target when there is one, whatever the box', async () => {
    const w = await crop({ target: { width: 480, height: 300 } });

    expect(output(w)).toEqual({ width: 480, height: 300 });
    w.unmount();
  });

  it('is the box itself when there is no target', async () => {
    const w = await crop({ target: null, mode: 'manual', maxDim: null });
    await drag(w, [0, 0], [640, 480]);

    expect(output(w)).toEqual({ width: 640, height: 480 });
    w.unmount();
  });

  it('is capped by maxDim when there is no target, keeping the ratio', async () => {
    /* "No crop" must not mean "keep 6500 pixels". The whole 2000×1000 image
       capped at 800 is 800×400. */
    const w = await crop({ target: null, maxDim: 800 });

    expect(output(w)).toEqual({ width: 800, height: 400 });
    w.unmount();
  });
});

describe('moving the box WITHOUT changing it', () => {
  /* Both gestures match the ticket designer, where the right button and
     Ctrl+arrows move the view. A picture that always fits its frame has no view
     to move, so what moves is the box — in both places the gesture means
     "reposition without changing". */

  it('a RIGHT drag moves the box even when it starts outside it', async () => {
    /* The left button cannot do this: outside the box it has to mean "draw",
       which leaves no way to nudge a box you have just drawn without starting
       over. */
    const w = await crop({ target: { width: 400, height: 400 } });
    const before = { ...rect(w) };

    /* x 100 is outside a box that starts at 500 — a left drag here would draw. */
    await rightDrag(w, [100, 500], [200, 500]);

    const after = rect(w);
    expect(after.w).toBe(before.w);
    expect(after.h).toBe(before.h);
    expect(after.x).toBe(before.x + 100);
    w.unmount();
  });

  it('a LEFT drag in the same place still DRAWS', async () => {
    /* The pair to the test above: the right button adding a meaning must not
       take one away from the left. */
    const w = await crop({ target: { width: 400, height: 400 }, mode: 'manual' });
    await drag(w, [100, 500], [200, 600]);

    expect(rect(w)).toMatchObject({ x: 100, y: 500, w: 100, h: 100 });
    w.unmount();
  });

  it('a right drag cannot push the box off the image', async () => {
    const w = await crop({ target: { width: 400, height: 400 } });
    await rightDrag(w, [1000, 500], [-5000, 500]);

    expect(rect(w).x).toBe(0);
    w.unmount();
  });

  it('Ctrl + arrow nudges the box', async () => {
    const w = await crop({ target: { width: 400, height: 400 } });
    const before = { ...rect(w) };

    await w.find('.apex-ic__frame').trigger('keydown', { key: 'ArrowRight', ctrlKey: true });

    const after = rect(w);
    expect(after.x).toBeGreaterThan(before.x);
    expect(after.w).toBe(before.w);
    w.unmount();
  });

  it('the step is in SCREEN pixels, so it does not depend on the image size', async () => {
    /* An image-pixel step would crawl on a 6500px photograph and leap on a
       400px one. The frame is 1:1 here, so ten screen pixels IS ten image
       pixels — which is the whole point of the conversion. */
    const w = await crop({ target: { width: 400, height: 400 } });
    const before = rect(w).x;

    await w.find('.apex-ic__frame').trigger('keydown', { key: 'ArrowRight', ctrlKey: true });

    expect(rect(w).x).toBe(before + 10);
    w.unmount();
  });

  it('shift makes the nudge as fine as the image allows', async () => {
    const w = await crop({ target: { width: 400, height: 400 } });
    const before = rect(w).x;

    await w.find('.apex-ic__frame').trigger('keydown', { key: 'ArrowRight', ctrlKey: true, shiftKey: true });

    expect(rect(w).x).toBe(before + 1);
    w.unmount();
  });

  it('a BARE arrow does nothing — the modifier is the gesture', async () => {
    const w = await crop({ target: { width: 400, height: 400 } });
    const before = { ...rect(w) };

    await w.find('.apex-ic__frame').trigger('keydown', { key: 'ArrowRight' });

    expect(rect(w)).toEqual(before);
    w.unmount();
  });

  it('a nudge cannot push the box off the image either', async () => {
    const w = await crop({ target: { width: 400, height: 400 } });

    for (let i = 0; i < 200; i++) {
      await w.find('.apex-ic__frame').trigger('keydown', { key: 'ArrowLeft', ctrlKey: true });
    }

    expect(rect(w).x).toBe(0);
    w.unmount();
  });
});

describe('the locked box offers no handles', () => {
  it('hides them when the ratio is locked', async () => {
    const w = await crop({ target: { width: 400, height: 400 }, lockRatio: true });

    expect(w.findAll('.apex-ic__handle[data-hidden="true"]')).toHaveLength(8);
    w.unmount();
  });

  it('shows them when it is not', async () => {
    const w = await crop({ target: { width: 400, height: 400 }, lockRatio: false });

    expect(w.findAll('.apex-ic__handle[data-hidden="false"]')).toHaveLength(8);
    w.unmount();
  });

  it('a target with lockRatio and NO target cannot be locked', async () => {
    /* `lockRatio` without a target has no ratio to lock to; the component must
       not pretend otherwise. */
    const w = await crop({ target: null, lockRatio: true });

    expect(w.find('.apex-ic').attributes('data-locked')).toBe('false');
    w.unmount();
  });
});
