import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import ApexForm from '../src/components/ApexForm.vue';

/**
 * A section can carry an ASIDE beside its fields, and something at the end of its head.
 *
 * The Claude Design's settings screens put a live preview BESIDE a section's fields:
 * the share cards next to "Share defaults", the footer next to "Social profiles".
 * General, Payment and Social all do it (`gs-sec` in the design source) — so it is a
 * recurring shape, and the form had no way to say it. `field-*` slots live inside the
 * field grid, and the grid knows nothing about a column beside itself.
 *
 *   #section-aside-<id>   beside the grid; the section becomes a two-column row
 *   #section-head-<id>    at the end of the section's head, e.g. an "Unsaved" badge
 *
 * Neither changes a section that does not use it. That is the property most worth
 * a test, because every form in the product runs through this template.
 *
 * Phase AC/002b.
 */
const SCHEMA = {
  layout: 'long',
  sections: [
    { id: 'share', title: 'Share defaults', fields: [{ key: 'a', label: 'A', type: 'text' }] },
    { id: 'links', title: 'Social profiles', fields: [{ key: 'b', label: 'B', type: 'text' }] },
  ],
};

function form(slots: Record<string, () => unknown> = {}) {
  return mount(ApexForm, {
    props: { schema: SCHEMA, modelValue: { a: '', b: '' } },
    slots,
  });
}

describe('ApexForm — section slots', () => {
  it('renders the aside beside the fields of the section that asked', () => {
    const w = form({ 'section-aside-share': () => h('div', { class: 'preview' }, 'card') });
    const share = w.findAll('.apex-form__section')[0];

    expect(share.find('.apex-form__aside .preview').exists()).toBe(true);
    expect(share.find('.apex-form__withaside').exists()).toBe(true);
    // Beside the grid, not inside it: a preview is not a field.
    expect(share.find('.apex-form__grid .preview').exists()).toBe(false);
  });

  it('leaves every other section exactly as it was', () => {
    const w = form({ 'section-aside-share': () => h('div', 'card') });
    const links = w.findAll('.apex-form__section')[1];

    expect(links.find('.apex-form__aside').exists()).toBe(false);
    expect(links.find('.apex-form__withaside').exists()).toBe(false);
  });

  it('changes nothing at all on a form that uses neither slot', () => {
    const w = form();
    expect(w.find('.apex-form__aside').exists()).toBe(false);
    expect(w.find('.apex-form__withaside').exists()).toBe(false);
    expect(w.find('.apex-form__sectionend').exists()).toBe(false);
  });

  it('puts the head slot at the end of that section head', () => {
    const w = form({ 'section-head-links': () => h('span', { class: 'badge' }, 'Unsaved') });
    const links = w.findAll('.apex-form__section')[1];

    expect(links.find('.apex-form__sectionhead .apex-form__sectionend .badge').text()).toBe('Unsaved');
    expect(w.findAll('.apex-form__section')[0].find('.badge').exists()).toBe(false);
  });

  it('still renders every field of a section that has an aside', () => {
    const w = form({ 'section-aside-share': () => h('div', 'card') });
    expect(w.findAll('.apex-form__section')[0].findAll('.apex-form__cell')).toHaveLength(1);
  });
});
