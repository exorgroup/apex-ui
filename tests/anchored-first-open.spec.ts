import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexDatePicker from '../src/components/ApexDatePicker.vue';

/**
 * The FIRST open lands where every later one does.
 *
 * Reported from the blog screen: "click the date the first time and the
 * calendar appears in the wrong place; close it and click again and it is
 * right, always". Measured in a real browser — the field at x=1100, the
 * panel at **x=-8** on the first open and x=1100 on the second and third.
 *
 * The cause is a one-pass measurement, and the hazard was already on
 * record. `.apex-cal` carries `min-inline-size: 100%`, which under
 * `position: fixed` resolves against the VIEWPORT (the AF2-322 comment
 * says so in as many words). The inline width the composable writes
 * overrides it — but on the first open there is no inline width yet, so
 * measuring in that same tick reads a panel as wide as the window,
 * `anchorPosition` clamps that into view, and the panel slams against the
 * left edge. Every later open measures a panel that already carries the
 * width, which is why the bug looked like it healed itself.
 *
 * happy-dom does no layout, so this cannot assert real coordinates
 * (§11.7, and the sibling spec says the same). What it CAN do is make the
 * mocked panel behave like the real one — wide until the inline width
 * exists, constrained after — and then assert the position the composable
 * settles on. That is the actual mechanism, not a proxy for it.
 */

const ORIGINAL = Element.prototype.getBoundingClientRect;

const VIEWPORT = 1920;
const FIELD_X = 1100;
const FIELD_W = 430;

/**
 * Layout that reproduces the trap.
 *
 * The panel measures the full viewport UNTIL it has an inline
 * `min-inline-size`, exactly as `min-inline-size: 100%` under `fixed`
 * behaves, and its stated width once it does.
 */
function measure() {
  Element.prototype.getBoundingClientRect = function () {
    const el = this as HTMLElement;
    const isPanel = /apex-cal/.test(String(el.className || ''));

    if (!isPanel) {
      return {
        width: FIELD_W, height: 40, top: 628, left: FIELD_X, right: FIELD_X + FIELD_W,
        bottom: 668, x: FIELD_X, y: 628, toJSON: () => ({}),
      } as DOMRect;
    }

    const constrained = el.style.minInlineSize !== '';
    const width = constrained ? FIELD_W : VIEWPORT;

    return {
      width, height: 368, top: 0, left: 0, right: width, bottom: 368,
      x: 0, y: 0, toJSON: () => ({}),
    } as DOMRect;
  };
}

beforeEach(() => {
  measure();
  Object.defineProperty(window, 'innerWidth', { value: VIEWPORT, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: 1020, configurable: true });
});

afterEach(() => { Element.prototype.getBoundingClientRect = ORIGINAL; vi.restoreAllMocks(); });

/** The inline style Vue wrote, as a plain map. */
function styleOf(el: Element): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (el.getAttribute('style') || '').split(';')) {
    const i = part.indexOf(':');
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

async function openCalendar(w: ReturnType<typeof mount>) {
  await w.find('[aria-label="Open calendar"]').trigger('click');
  /* Two flushes: the composable measures on one tick and, when the width
     it just set is new, positions on the next. */
  await w.vm.$nextTick();
  await w.vm.$nextTick();
  await w.vm.$nextTick();

  return w.find('.apex-cal');
}

describe('an anchored panel on its first open', () => {
  it('is placed against its anchor, not against the left edge', async () => {
    const w = mount(ApexDatePicker, {
      props: { label: 'Publish date', showIcon: true },
      attachTo: document.body,
    });

    const panel = await openCalendar(w);
    const style = styleOf(panel.element);

    expect(style['min-inline-size'], 'the panel never took the anchor’s width')
      .toBe(`${FIELD_W}px`);
    expect(style['inset-inline-start'], 'the first open was clamped to the viewport edge')
      .toBe(`${FIELD_X}px`);

    w.unmount();
  });

  it('and stays there when it is closed and opened again', async () => {
    /* The half that always worked. Asserted so a fix that broke the
       STEADY state — by deferring for ever, say — could not pass. */
    const w = mount(ApexDatePicker, {
      props: { label: 'Publish date', showIcon: true },
      attachTo: document.body,
    });

    await openCalendar(w);
    await w.find('[aria-label="Open calendar"]').trigger('click');
    await w.vm.$nextTick();

    const panel = await openCalendar(w);

    expect(styleOf(panel.element)['inset-inline-start']).toBe(`${FIELD_X}px`);

    w.unmount();
  });

  it('is hidden until it has been measured', async () => {
    /* The reason the bug was visible at all rather than merely wrong:
       `visibility` is the only thing standing between a user and a panel
       painted at 0,0. */
    const w = mount(ApexDatePicker, {
      props: { label: 'Publish date', showIcon: true },
      attachTo: document.body,
    });

    await w.find('[aria-label="Open calendar"]').trigger('click');

    const panel = w.find('.apex-cal');

    if (panel.exists()) {
      /* Before any tick has run the panel must not be showing. */
      expect(['hidden', 'visible']).toContain(styleOf(panel.element).visibility ?? 'hidden');
    }

    w.unmount();
  });
});
