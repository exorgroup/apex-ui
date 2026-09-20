import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexSelect from '../src/components/ApexSelect.vue';
import ApexDatePicker from '../src/components/ApexDatePicker.vue';
import ApexColumnFilter from '../src/components/ApexColumnFilter.vue';

/**
 * Anchored panels float free of anything trying to clip them.
 *
 * AF2-320/321/322, found in a browser: a DataTable with one row cut its
 * column-filter popover in half. The cause is not the table — it is that
 * every anchored panel in the kit was `position: absolute` inside its own
 * trigger, and an `overflow: auto` ancestor clips absolutely positioned
 * descendants no matter what z-index they carry. The table's overflow is not
 * negotiable: horizontal scrolling and the sticky frozen column need it.
 *
 * `position: fixed` escapes, because its containing block is the viewport.
 * Deliberately NOT a Teleport: fixed keeps the node where it is in the DOM,
 * so the 113 existing assertions that reach into a panel through its parent
 * wrapper all still hold. Teleport would have moved every one of them.
 *
 * happy-dom does no layout, so COORDINATES cannot be asserted (§11.7) — every
 * rect is zeros and any `toBe(240)` would pass against any stylesheet. What
 * is assertable is the part that was actually broken: which positioning
 * scheme the panel uses, and that a width is stated rather than inherited.
 */

const ORIGINAL = Element.prototype.getBoundingClientRect;

/* Layout, since happy-dom has none. Without it every rect is 0 and the width
   assertions below would pass against a component computing nothing. */
function measure() {
  Element.prototype.getBoundingClientRect = function () {
    const cls = String((this as HTMLElement).className || '');
    const panel = /apex-pop|apex-cal|apex-dtf__pop/.test(cls);
    const width = panel ? 270 : 200;
    const height = panel ? 300 : 40;
    return {
      width, height, top: 100, left: 50, right: 50 + width, bottom: 100 + height,
      x: 50, y: 100, toJSON: () => ({}),
    } as DOMRect;
  };
}

beforeEach(measure);
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

const OPTIONS = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }];

async function openSelect() {
  const w = mount(ApexSelect, { props: { options: OPTIONS, label: 'Plan' }, attachTo: document.body });
  await w.find('[role="combobox"]').trigger('click');
  await w.vm.$nextTick();
  await w.vm.$nextTick();
  return w;
}

describe('a field dropdown is fixed, not absolute', () => {
  it('escapes any overflow ancestor by being fixed', async () => {
    const w = await openSelect();
    const pop = w.find('.apex-pop');
    expect(pop.exists(), 'the panel did not open').toBe(true);
    /* The whole fix in one assertion: absolute is clipped by an ancestor's
       overflow, fixed is not. */
    expect(styleOf(pop.element).position).toBe('fixed');
    w.unmount();
  });

  it('states its width instead of inheriting it', async () => {
    /* `.apex-pop` took the field width from `inset-inline: 0`. Under `fixed`
       that resolves against the VIEWPORT — a dropdown as wide as the window.
       The width has to be measured and stated. */
    const w = await openSelect();
    expect(styleOf(w.find('.apex-pop').element)['inline-size']).toBe('200px');
    w.unmount();
  });

  it('and is still in the DOM under its own field', async () => {
    /* Not a Teleport, on purpose. This is what keeps every existing
       assertion — and every consumer's :deep() rule — working. */
    const w = await openSelect();
    expect(w.find('.apex-pop').exists()).toBe(true);
    w.unmount();
  });

  it('measures before it paints', async () => {
    const w = await openSelect();
    const s = styleOf(w.find('.apex-pop').element);
    expect(s.visibility, 'a panel that never measured would stay hidden').toBe('visible');
    w.unmount();
  });
});

describe('the column filter popover', () => {
  const COLUMN = { field: 'events_count', header: 'Events', filter: true, filterType: 'number' as const };

  it('is fixed, because the table body it sits in must clip', async () => {
    const w = mount(ApexColumnFilter, { props: { column: COLUMN, mode: 'menu' as const }, attachTo: document.body });
    await w.find('.apex-dtf__trigger').trigger('click');
    await w.vm.$nextTick(); await w.vm.$nextTick();

    const pop = w.find('.apex-dtf__pop');
    expect(pop.exists(), 'the popover did not open').toBe(true);
    expect(styleOf(pop.element).position).toBe('fixed');
    w.unmount();
  });
});

describe('an inline calendar stays in the flow', () => {
  /* The one case fixed positioning must NOT apply to. `.apex-cal--inline`
     sets `position: static`, and an inline style outranks a stylesheet — so
     applying the anchor style regardless would rip an inline date picker out
     of the page and float it over the content. */
  it('gets no positioning style at all', async () => {
    const w = mount(ApexDatePicker, { props: { inline: true, label: 'When' }, attachTo: document.body });
    await w.vm.$nextTick();

    const cal = w.find('.apex-cal');
    expect(cal.exists()).toBe(true);
    expect(cal.classes()).toContain('apex-cal--inline');
    expect(styleOf(cal.element).position, 'an inline calendar was torn out of the flow').toBeUndefined();
    w.unmount();
  });

  it('while a popup calendar is fixed, and keeps its own width', async () => {
    const w = mount(ApexDatePicker, { props: { label: 'When', showIcon: true }, attachTo: document.body });
    await w.find('button[aria-label="Open calendar"]').trigger('click');
    await w.vm.$nextTick(); await w.vm.$nextTick();

    const cal = w.find('.apex-cal');
    expect(cal.exists(), 'the calendar did not open').toBe(true);
    const s = styleOf(cal.element);
    expect(s.position).toBe('fixed');
    /* min, not exact: a calendar is wider than a narrow date field, and the
       old CSS said so with `min-inline-size:100%; inline-size:max-content`. */
    expect(s['min-inline-size']).toBe('200px');
    expect(s['inline-size']).toBeUndefined();
    w.unmount();
  });
});

describe('it keeps up with the page', () => {
  it('listens for scroll and resize while open, and stops when closed', async () => {
    /* A fixed panel does not move with its anchor. Without these it sits
       still while the table scrolls underneath it. Capture phase, or a
       scroll inside the table itself is never heard. */
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');

    const w = mount(ApexSelect, { props: { options: OPTIONS, label: 'Plan' }, attachTo: document.body });
    await w.find('[role="combobox"]').trigger('click');
    await w.vm.$nextTick();

    const scroll = add.mock.calls.find((c) => c[0] === 'scroll');
    expect(scroll, 'nothing listens for scroll').toBeTruthy();
    expect(scroll![2], 'a non-capturing listener never hears a scroll inside the table').toBe(true);
    expect(add.mock.calls.some((c) => c[0] === 'resize')).toBe(true);

    await w.find('[role="combobox"]').trigger('click');
    await w.vm.$nextTick();
    expect(remove.mock.calls.some((c) => c[0] === 'scroll'), 'the listener outlived the panel').toBe(true);

    w.unmount();
  });

  it('and drops them on unmount', async () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const w = mount(ApexSelect, { props: { options: OPTIONS, label: 'Plan' }, attachTo: document.body });
    await w.find('[role="combobox"]').trigger('click');
    await w.vm.$nextTick();
    w.unmount();
    expect(remove.mock.calls.some((c) => c[0] === 'scroll')).toBe(true);
  });
});
