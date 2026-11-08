import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import ApexForm from '../src/components/ApexForm.vue';

/**
 * AF/011 and AF/012.
 *
 * `#aside` — one column beside the form's WHOLE body, the same on every tab. The Claude
 * Design's blog editor keeps a live preview and a checklist there while the author moves
 * between Details, Content and SEO. AC's `#section-aside-<id>` could not do it: that sits
 * inside one pane, so it would change with the tab and scroll with the fields.
 *
 * `railBadge` on the SIDEBAR layout — AD built it for the rail; the blog editor's sidebar
 * marks a tab that still needs work. Same prop, same rule: an error count outranks it.
 */
const schema = (sections = [
  { id: 'details', title: 'Details', railBadge: { text: '●', tone: 'danger' }, fields: [{ key: 'a', label: 'A', type: 'text', rules: 'required' }] },
  { id: 'content', title: 'Content', fields: [{ key: 'b', label: 'B', type: 'text' }] },
]) => ({ layout: 'sidebar', shell: 'modal', sections });

function form(slots: Record<string, () => unknown> = {}) {
  return mount(ApexForm, {
    props: { schema: schema(), modelValue: { a: '', b: '' } },
    slots,
    attachTo: document.body,
  });
}

describe('ApexForm — #aside', () => {
  it('renders beside the body, outside the section panes', () => {
    const w = form({ aside: () => h('div', { class: 'preview' }, 'card') });

    expect(w.find('.apex-form__body > .apex-form__formaside .preview').exists()).toBe(true);
    expect(w.find('.apex-form__main .preview').exists()).toBe(false);
  });

  it('stays the same when the tab changes', async () => {
    const w = form({ aside: () => h('div', { class: 'preview' }, 'card') });
    await w.findAll('.apex-form__side button')[1].trigger('click');

    expect(w.find('.apex-form__formaside .preview').text()).toBe('card');
  });

  it('adds nothing when not filled', () => {
    expect(form().find('.apex-form__formaside').exists()).toBe(false);
  });
});

describe('ApexForm sidebar — railBadge', () => {
  it('shows a section badge on the sidebar too', () => {
    const b = form().findAll('.apex-form__side button')[0].find('.apex-form__railbadge');
    expect(b.text()).toBe('●');
    expect(b.attributes('data-tone')).toBe('danger');
  });

  it('is absent on a section without one', () => {
    expect(form().findAll('.apex-form__side button')[1].find('.apex-form__railbadge').exists()).toBe(false);
  });

  it('gives way to an error count', async () => {
    const w = form();
    (w.vm as never as { submit: () => void }).submit();   // `a` is required and empty
    await w.vm.$nextTick();

    const details = w.findAll('.apex-form__side button')[0];
    expect(details.find('em').exists()).toBe(true);
    expect(details.find('.apex-form__railbadge').exists()).toBe(false);
  });
});
