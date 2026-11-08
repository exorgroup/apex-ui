import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApexForm from '../src/components/ApexForm.vue';

/**
 * `layout: 'rail'` — every section on the page, with a rail that says where you are.
 *
 * The three layouts that existed answered two different questions and neither answered
 * this one. `tabs` and `sidebar` CHOOSE which section you see; `long` shows them all and
 * offers no way to move. The Claude Design's settings screens want both at once: the
 * whole form scrolls, and a sticky rail marks the section under the viewport and scrolls
 * to one when clicked.
 *
 * That difference is not cosmetic, it is an ARIA difference. A tablist owns what is
 * visible, so its buttons are `role="tab"` with `aria-selected`. A rail owns nothing —
 * every pane is already there — so it is `<nav>` with `aria-current`. Calling it a
 * tablist would promise a keyboard user that arrow keys change what is shown, and they
 * do not.
 *
 * Phase AC/002.
 */
const SCHEMA = {
  layout: 'rail',
  sections: [
    { id: 'share', title: 'Share defaults', icon: 'link', fields: [{ key: 'a', label: 'A', type: 'text' }] },
    { id: 'handles', title: 'Platform settings', icon: 'users', fields: [{ key: 'b', label: 'B', type: 'text' }] },
    { id: 'links', title: 'Social profiles', icon: 'grid', fields: [{ key: 'c', label: 'C', type: 'text' }] },
  ],
};

function form(schema: unknown = SCHEMA) {
  return mount(ApexForm, {
    props: { schema, modelValue: { a: '', b: '', c: '' } },
    attachTo: document.body,
  });
}

beforeEach(() => {
  // jsdom has neither, and the component must not depend on them existing.
  (globalThis as never as { IntersectionObserver: unknown }).IntersectionObserver =
    class { observe() {} unobserve() {} disconnect() {} } as never;
  Element.prototype.scrollIntoView = vi.fn();
});

describe("ApexForm — layout: 'rail'", () => {
  it('renders every section at once, like long and unlike sidebar', () => {
    const w = form();
    expect(w.findAll('.apex-form__section')).toHaveLength(3);
  });

  it('renders the rail', () => {
    const w = form();
    expect(w.find('.apex-form__rail').exists()).toBe(true);
    expect(w.findAll('.apex-form__rail button')).toHaveLength(3);
  });

  it('is navigation, not a tablist', () => {
    const w = form();
    const rail = w.find('.apex-form__rail');

    expect(rail.attributes('role')).toBe(undefined);   // it is a <nav>
    expect(rail.element.tagName).toBe('NAV');
    expect(w.find('.apex-form__rail [role="tab"]').exists()).toBe(false);
    expect(w.find('[role="tabpanel"]').exists()).toBe(false);
  });

  it('marks the current section with aria-current, not aria-selected', () => {
    const w = form();
    const buttons = w.findAll('.apex-form__rail button');

    expect(buttons[0].attributes('aria-current')).toBe('true');
    expect(buttons[1].attributes('aria-current')).toBe(undefined);
    expect(buttons[0].attributes('aria-selected')).toBe(undefined);
  });

  it('keeps every section visible after the rail is clicked', async () => {
    const w = form();
    await w.findAll('.apex-form__rail button')[2].trigger('click');

    // The point of the layout: clicking moves you, it does not hide anything.
    expect(w.findAll('.apex-form__section')).toHaveLength(3);
    expect(w.findAll('.apex-form__rail button')[2].attributes('aria-current')).toBe('true');
  });

  it('scrolls to the section it was asked for', async () => {
    const w = form();
    await w.findAll('.apex-form__rail button')[1].trigger('click');

    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it('shows each section its own heading, like long', () => {
    const w = form();
    const headings = w.findAll('.apex-form__section h3').map((h) => h.text());

    expect(headings.join(' | ')).toContain('Share defaults');
    expect(headings.join(' | ')).toContain('Social profiles');
  });

  it('survives an environment with no IntersectionObserver', () => {
    delete (globalThis as never as { IntersectionObserver?: unknown }).IntersectionObserver;

    // SSR and older test environments have none. The rail must still render and
    // still navigate; only the spying is lost.
    expect(() => form()).not.toThrow();
  });

  it('a single section renders no rail, matching tabs and sidebar', () => {
    const w = form({ ...SCHEMA, sections: [SCHEMA.sections[0]] });
    expect(w.find('.apex-form__rail').exists()).toBe(false);
    expect(w.findAll('.apex-form__section')).toHaveLength(1);
  });

  it('does not disturb the other layouts', async () => {
    const tabs = form({ ...SCHEMA, layout: 'tabs' });
    await flushPromises();
    expect(tabs.findAll('.apex-form__section')).toHaveLength(1);
    expect(tabs.find('[role="tablist"]').exists()).toBe(true);

    const long = form({ ...SCHEMA, layout: 'long' });
    expect(long.findAll('.apex-form__section')).toHaveLength(3);
    expect(long.find('.apex-form__rail').exists()).toBe(false);
  });
});
