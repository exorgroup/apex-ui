import { describe, it, expect, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApexEditorObjectBar from '../src/components/ApexEditorObjectBar.vue';

/**
 * The object bar stays on screen — N/037b.
 *
 * A picture can be taller than the window. Anchored to its true rect,
 * the bar was placed under its bottom edge — correct, and off the
 * bottom of the screen, where it could be neither read nor pressed.
 * Reported as tools that "do not show"; it also stopped a Playwright
 * probe from clicking them, which is as good a demonstration as any
 * that a person could not either.
 *
 * So the bar anchors to the VISIBLE part of the object and is then
 * clamped into the window. happy-dom computes no layout, so the rects
 * are supplied — the arithmetic is the thing being tested, and it is
 * the thing that was wrong.
 */

const ORIGINAL_RECT = Element.prototype.getBoundingClientRect;
const WINDOW = { width: 1000, height: 800 };

afterEach(() => { Element.prototype.getBoundingClientRect = ORIGINAL_RECT; vi.restoreAllMocks(); });

function viewport() {
  Object.defineProperty(window, 'innerWidth', { value: WINDOW.width, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: WINDOW.height, configurable: true });
  /* The bar measures 300x40 whatever else is asked. */
  Element.prototype.getBoundingClientRect = function () {
    return { width: 300, height: 40, top: 0, left: 0, right: 300, bottom: 40,
      x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
  };
}

const rect = (x: number, y: number, w: number, h: number) =>
  ({ x, y, width: w, height: h, top: y, left: x, right: x + w, bottom: y + h,
    toJSON: () => ({}) }) as DOMRect;

/** Where the bar ended up, from the inline style it writes. */
function placedAt(): { x: number; y: number } {
  const bar = document.querySelector('.apex-objbar') as HTMLElement | null;
  expect(bar, 'the bar did not render').not.toBeNull();
  const style = bar!.getAttribute('style') || '';
  const read = (prop: string) => {
    const found = new RegExp(`${prop}:\\s*(-?[\\d.]+)px`).exec(style);

    return found ? Number(found[1]) : Number.NaN;
  };

  /* The bar writes LOGICAL properties — `inset-inline-start` and
     `inset-block-start`, as the whole kit does — so reading `left`
     and `top` finds nothing at all. */
  return { x: read('inset-inline-start'), y: read('inset-block-start') };
}

async function bar(anchor: DOMRect, bounds?: DOMRect) {
  const w = mount(ApexEditorObjectBar, {
    props: { rect: anchor, kind: 'image', bounds: bounds ? () => bounds : null },
    slots: { default: '<button>x</button>' },
    attachTo: document.body,
  });
  await flushPromises();
  await flushPromises();

  return w;
}

describe('placing the object bar', () => {
  it('keeps it inside the window under a picture taller than the screen', async () => {
    viewport();
    /* 2000px tall, running far past the bottom of an 800px window. */
    const w = await bar(rect(100, 120, 400, 2000));
    const at = placedAt();

    expect(at.y, 'the bar is below the window').toBeLessThanOrEqual(WINDOW.height - 40);
    expect(at.y).toBeGreaterThanOrEqual(0);

    w.unmount();
  });

  it('keeps it inside the window for a picture scrolled off the top', async () => {
    viewport();
    const w = await bar(rect(100, -900, 400, 1000));
    const at = placedAt();

    expect(at.y).toBeGreaterThanOrEqual(0);
    expect(at.y).toBeLessThanOrEqual(WINDOW.height - 40);

    w.unmount();
  });

  it('and inside it horizontally, for an object at the right edge', async () => {
    viewport();
    const w = await bar(rect(960, 200, 200, 150));
    const at = placedAt();

    expect(at.x).toBeLessThanOrEqual(WINDOW.width - 300);
    expect(at.x).toBeGreaterThanOrEqual(0);

    w.unmount();
  });

  it('stays inside the EDITOR, not merely inside the window', async () => {
    /* The reported case, and the one a window clamp does not answer:
       a picture taller than the dialog it sits in. The bar was on
       screen, below the dialog, pointing at nothing. */
    viewport();
    /* The geometry that actually happens: a picture whose visible part
       ends near the dialog's BOTTOM. There is room below it in the
       window, so nothing flips - the bar is placed just under the
       picture, a few pixels outside the dialog. A window clamp leaves
       it exactly there; only the editor's own box moves it back. */
    const editor = rect(200, 100, 600, 300);
    const w = await bar(rect(250, 360, 200, 30), editor);
    const at = placedAt();

    expect(at.y, 'below the editor').toBeLessThanOrEqual(editor.bottom - 40);
    expect(at.y, 'above the editor').toBeGreaterThanOrEqual(editor.top);
    expect(at.x).toBeGreaterThanOrEqual(editor.left);
    expect(at.x).toBeLessThanOrEqual(editor.right - 300);

    w.unmount();
  });

  it('leaves an ordinary object where the anchoring puts it', async () => {
    /* The clamp must not become the placement: a picture in the middle
       of the screen should get the bar beside it, not shoved to a
       margin. */
    viewport();
    const w = await bar(rect(300, 300, 200, 150));
    const at = placedAt();

    expect(at.y).toBeGreaterThan(300);
    expect(at.y).toBeLessThan(WINDOW.height - 40);

    w.unmount();
  });
});
