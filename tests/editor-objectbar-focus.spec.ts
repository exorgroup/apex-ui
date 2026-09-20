import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexEditorObjectBar from '../src/components/ApexEditorObjectBar.vue';

/**
 * A field on the object bar can take the caret — N/034b.
 *
 * Reported twice: "there is a box but cannot enter any text", and then
 * again after the box became a real input. The input was real; the
 * pointer never reached it.
 *
 * The bar carried a blanket `@pointerdown.prevent`, and for a good
 * reason — a press on it would otherwise move focus out of the editor,
 * drop the selection, and take the bar with it. But preventing the
 * default on a pointerdown is precisely what stops focus moving, so
 * every BUTTON worked (a click still fires) and the one field could
 * never be typed into. The same shape as the image's own
 * `preventDefault`, which blocked dragging at N/027.
 *
 * Both halves are asserted here, because a fix that let everything
 * through would restore the original bug silently.
 */

const RECT = { width: 300, height: 40, top: 100, left: 50, right: 350, bottom: 140,
  x: 50, y: 100, toJSON: () => ({}) } as DOMRect;

function bar() {
  return mount(ApexEditorObjectBar, {
    props: { rect: RECT, kind: 'image' },
    slots: {
      default: '<div><input class="probe-field" /><textarea class="probe-area"></textarea>'
        + '<select class="probe-select"><option>a</option></select>'
        + '<button class="probe-button">Go</button></div>',
    },
    attachTo: document.body,
  });
}

/** A pointerdown that reports whether anything prevented it. */
function press(el: Element) {
  const event = new MouseEvent('pointerdown', { bubbles: true, cancelable: true });
  el.dispatchEvent(event);

  return event.defaultPrevented;
}

describe('pressing the object bar', () => {
  it('lets a field take focus', async () => {
    const w = bar();
    const field = document.querySelector('.probe-field')!;

    expect(press(field), 'the press was cancelled, so no caret can land').toBe(false);

    w.unmount();
  });

  it('lets any other control take focus too', async () => {
    /* The guard names four kinds of control, and a test that pressed
       only an <input> let three of them be dropped silently. */
    const w = bar();

    expect(press(document.querySelector('.probe-area')!), 'a textarea').toBe(false);
    expect(press(document.querySelector('.probe-select')!), 'a select').toBe(false);

    w.unmount();
  });

  it('still holds the selection when the bar itself is pressed', async () => {
    /* The reason the guard exists. Without it a press on the bar's
       background blurs the editor, the selection goes, and the bar
       disappears mid-click. */
    const w = bar();
    const root = document.querySelector('.apex-objbar')!;

    expect(press(root)).toBe(true);

    w.unmount();
  });

  it('and when a button is pressed', async () => {
    const w = bar();
    const button = document.querySelector('.probe-button')!;

    expect(press(button)).toBe(true);

    w.unmount();
  });
});
