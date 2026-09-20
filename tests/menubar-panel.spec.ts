import { describe, it, expect } from 'vitest';
import { h } from 'vue';
import { mount } from '@vue/test-utils';
import ApexMenubar from '../src/components/ApexMenubar.vue';

/**
 * A menu row can BE a control.
 *
 * AF2-286, found by the user opening Insert ▸ Table on the ApexHTMLEditor
 * page: the row showed a submenu arrow and the submenu was empty. The size
 * grid it should draw is a `custom` item, and our ApexMenubar had no `panel`
 * slot to draw one with — the reference tree's has, and the editor menubar
 * was written against it. Nothing failed: an item with no command and no
 * label simply rendered an empty row.
 */
describe('the panel slot', () => {
  const items = [{
    label: 'Insert',
    items: [{ label: 'Link' }, { custom: 'size_grid', command: 'table_insert' }],
  }];

  it('renders a control in place of the row', async () => {
    const w = mount(ApexMenubar, {
      props: { items, trigger: 'click' },
      slots: { panel: (ctx: { item: { custom?: string } }) => h('div', { class: 'probe-grid' }, ctx.item.custom) },
      attachTo: document.body,
    });
    await w.findAll('[role="menuitem"]')[0].trigger('click');

    expect(w.find('.apex-menu__custom').exists(), 'no li for the custom item').toBe(true);
    expect(w.find('.probe-grid').exists(), 'the panel slot never rendered').toBe(true);
    expect(w.find('.probe-grid').text()).toBe('size_grid');
    w.unmount();
  });

  it('a custom item draws nothing rather than an empty row when no slot is given', async () => {
    const w = mount(ApexMenubar, { props: { items, trigger: 'click' }, attachTo: document.body });
    await w.findAll('[role="menuitem"]')[0].trigger('click');
    expect(w.find('.apex-menu__custom').exists()).toBe(true);
    expect(w.find('.apex-menu__custom').text()).toBe('');
    w.unmount();
  });
});
