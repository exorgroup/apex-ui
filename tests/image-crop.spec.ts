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

  /* jsdom lays nothing out. Both are stubbed to the image's own size so the
     contain-fit is exactly 1 and every assertion below stays in image pixels
     with no arithmetic in the test to get wrong. The HEIGHT is new: `fit` is
     `min(fw/nw, fh/nh)` now, so a frame with no height would fit to zero. */
  // @ts-expect-error
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: NAT.width });
  // @ts-expect-error
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: NAT.height });
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

const zoom = (w: ReturnType<typeof mount>) => (w.vm as unknown as { zoom: number }).zoom;
const pan = (w: ReturnType<typeof mount>) => (w.vm as unknown as { pan: { x: number; y: number } }).pan;

describe('zoom', () => {
  /* 100% is FIT, not 1:1 — there is no useful 1:1 between a 6500px photograph
     and a 900px dialog, and a percentage against the frame is what an operator
     can reason about. */

  it('starts fitted, showing the whole image', async () => {
    const w = await crop({ target: { width: 400, height: 400 } });

    expect(zoom(w)).toBe(1);
    expect(pan(w)).toEqual({ x: 0, y: 0 });
    w.unmount();
  });

  it('the buttons zoom in and out', async () => {
    const w = await crop({ target: { width: 400, height: 400 } });
    const vm = w.vm as unknown as { zoomIn: () => void; zoomOut: () => void };

    vm.zoomIn();
    expect(zoom(w)).toBeGreaterThan(1);

    vm.zoomOut();
    expect(zoom(w)).toBeCloseTo(1, 5);
    w.unmount();
  });

  it('stops at both ends rather than running away', async () => {
    const w = await crop({ target: { width: 400, height: 400 } });
    const vm = w.vm as unknown as { zoomIn: () => void; zoomOut: () => void };

    for (let i = 0; i < 40; i++) vm.zoomIn();
    expect(zoom(w)).toBe(8);

    for (let i = 0; i < 80; i++) vm.zoomOut();
    expect(zoom(w)).toBe(0.25);
    w.unmount();
  });

  it('a wheel notch zooms, and keeps what is under the cursor under it', async () => {
    /* The anchor is the point of the whole exercise: without it the image
       lurches away from whatever the operator was looking at on every notch,
       which on a crop tool is the one thing they were doing.

       The cursor is at 500,250 in frame pixels. Whatever image pixel was there
       before has to still be there after. */
    const w = await crop({ target: { width: 400, height: 400 } });
    const at = { x: 500, y: 250 };

    const under = (at.x - pan(w).x) / (w.vm as unknown as { scale: number }).scale;

    await w.find('.apex-ic__frame').trigger('wheel', { deltaY: -100, clientX: at.x, clientY: at.y });

    const after = (at.x - pan(w).x) / (w.vm as unknown as { scale: number }).scale;
    expect(zoom(w)).toBeGreaterThan(1);
    expect(after).toBeCloseTo(under, 4);
    w.unmount();
  });

  it('the percentage button goes back to fit', async () => {
    const w = await crop({ target: { width: 400, height: 400 } });
    const vm = w.vm as unknown as { zoomIn: () => void; fitView: () => void };

    vm.zoomIn();
    vm.zoomIn();
    vm.fitView();

    expect(zoom(w)).toBe(1);
    expect(pan(w)).toEqual({ x: 0, y: 0 });
    w.unmount();
  });

  it('zooming does not move the BOX — it is stored in image pixels', async () => {
    /* The reason `scale` stayed the single conversion: the box, the handles,
       the four gestures and render() all went on working untouched. */
    const w = await crop({ target: { width: 400, height: 400 } });
    const before = { ...rect(w) };

    (w.vm as unknown as { zoomIn: () => void }).zoomIn();

    expect(rect(w)).toEqual(before);
    w.unmount();
  });
});

describe('panning', () => {
  const vmOf = (w: ReturnType<typeof mount>) =>
    w.vm as unknown as { zoomIn: () => void; panBy: (x: number, y: number) => void };

  it('does nothing while the image fits — it stays centred', async () => {
    /* A fitted image has nowhere to go, and a pan that shunted it into a
       corner would be worse than one that did nothing. */
    const w = await crop({ target: { width: 400, height: 400 } });

    vmOf(w).panBy(-200, -100);

    expect(pan(w)).toEqual({ x: 0, y: 0 });
    w.unmount();
  });

  it('moves the view once the image is bigger than the frame', async () => {
    const w = await crop({ target: { width: 400, height: 400 } });
    vmOf(w).zoomIn();

    vmOf(w).panBy(-100, 0);

    expect(pan(w).x).toBeLessThan(0);
    w.unmount();
  });

  it('cannot pan the image out of its own window', async () => {
    /* Both edges, because a clamp with its bounds the wrong way round passes a
       one-sided test and jams the image into a corner on the other. */
    const w = await crop({ target: { width: 400, height: 400 } });
    vmOf(w).zoomIn();

    vmOf(w).panBy(99999, 99999);
    expect(pan(w)).toEqual({ x: 0, y: 0 });

    vmOf(w).panBy(-99999, -99999);
    const shownW = NAT.width * (w.vm as unknown as { scale: number }).scale;
    expect(pan(w).x).toBeCloseTo(NAT.width - shownW, 4);
    w.unmount();
  });

  it('Ctrl + arrow pans; a BARE arrow nudges the box', async () => {
    /* Two things can move here, and the modifier is what says which — the same
       division as the ticket designer. */
    const w = await crop({ target: { width: 400, height: 400 } });
    vmOf(w).zoomIn();
    const boxBefore = { ...rect(w) };

    await w.find('.apex-ic__frame').trigger('keydown', { key: 'ArrowLeft', ctrlKey: true });
    expect(pan(w).x).toBeLessThan(0);
    expect(rect(w)).toEqual(boxBefore);

    const panAfter = { ...pan(w) };
    await w.find('.apex-ic__frame').trigger('keydown', { key: 'ArrowRight' });
    expect(rect(w).x).toBeGreaterThan(boxBefore.x);
    expect(pan(w)).toEqual(panAfter);
    w.unmount();
  });

  it('a RIGHT drag does not draw, move or resize the box', async () => {
    /* The right button belongs to the view. Before this it fell through to
       `onDown` and drew a box at the same time as panning. */
    const w = await crop({ target: { width: 400, height: 400 } });
    const before = { ...rect(w) };

    const frame = w.find('.apex-ic__frame');
    await frame.trigger('pointerdown', { clientX: 100, clientY: 500, pointerId: 1, button: 2 });
    await frame.trigger('pointermove', { clientX: 300, clientY: 700, pointerId: 1, button: 2 });
    await frame.trigger('pointerup', { clientX: 300, clientY: 700, pointerId: 1, button: 2 });

    expect(rect(w)).toEqual(before);
    w.unmount();
  });

  it('a LEFT drag in the same place still DRAWS', async () => {
    /* The pair to the test above: the right button taking a meaning must not
       take one away from the left. */
    const w = await crop({ target: { width: 400, height: 400 }, mode: 'manual' });
    await drag(w, [100, 500], [200, 600]);

    expect(rect(w)).toMatchObject({ x: 100, y: 500, w: 100, h: 100 });
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
