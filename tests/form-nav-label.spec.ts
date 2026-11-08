import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { readFileSync } from 'node:fs';
import ApexForm from '../src/components/ApexForm.vue';

/**
 * A nav label sits beside its icon — not in the middle of the button.
 *
 * `.apex-form__side span { flex: 1 }` was meant for the label. `ApexIcon` renders a
 * `<span>` too, so the icon also took `flex: 1`, the two split the button, and every
 * label started halfway across it. Visible on every sidebar form (the blog dialog's
 * Details / Content) and copied into the rail at AC/002. Worse on a narrow screen: the
 * collapse rule `.apex-form__side span { display: none }`, meant to leave the icons,
 * hid the icons too and left empty buttons.
 *
 * jsdom does not apply the stylesheet, so this pins both halves of the fix instead:
 * the label carries its own class, and no nav rule targets a bare `span` again.
 */
const schema = (layout: string) => ({
  layout,
  sections: [
    { id: 'a', title: 'Details', icon: 'description', fields: [{ key: 'x', label: 'X', type: 'text' }] },
    { id: 'b', title: 'Content', icon: 'edit_note', fields: [{ key: 'y', label: 'Y', type: 'text' }] },
  ],
});

beforeEach(() => {
  (globalThis as never as { IntersectionObserver: unknown }).IntersectionObserver =
    class { observe() {} unobserve() {} disconnect() {} } as never;
  Element.prototype.scrollIntoView = vi.fn();
});

describe('ApexForm nav — the label is the label', () => {
  for (const [layout, nav] of [['sidebar', '.apex-form__side'], ['rail', '.apex-form__rail']]) {
    it(`${layout}: the title carries the label class and the icon does not`, () => {
      const w = mount(ApexForm, { props: { schema: schema(layout), modelValue: { x: '', y: '' } } });
      const button = w.find(`${nav} button`);

      expect(button.find('.apex-form__navlabel').text()).toBe('Details');
      expect(button.find('.apex-icon').classes()).not.toContain('apex-form__navlabel');
    });
  }

  it('no nav rule in the stylesheet targets a bare span', () => {
    // Comments may name the old selector to explain the fix; only RULES count.
    const css = readFileSync('src/styles/apex-ui.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

    // A bare `span` here matches ApexIcon, which is exactly the defect.
    expect(css).not.toMatch(/\.apex-form__(side|rail)\s+span\b/);
  });
});
