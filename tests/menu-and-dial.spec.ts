// AF2-67/68 — the parts that only exist once the control is opened.
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexSplitButton from '../src/components/ApexSplitButton.vue';
import ApexSpeedDial from '../src/components/ApexSpeedDial.vue';

describe('split button menu', () => {
  const model = [
    { header: 'Section' },
    { label: 'Rename', icon: 'edit', hint: 'F2' },
    { separator: true },
    { label: 'More', items: [{ label: 'Nested' }] },
  ];

  it('menu props reach the overlay, and ui classes reach every part', async () => {
    const w = mount(ApexSplitButton, {
      props: {
        label: 'Save', model,
        menuBackground: '#101820', menuColor: '#e8eef7',
        menuHoverBackground: '#1d2735', menuHoverColor: '#fff',
        menuIconColor: '#7aa2f7', menuHeaderColor: '#8b98ad',
        menuHintColor: '#6b7789', menuSeparatorColor: '#243040',
        menuBorderColor: '#243040', menuRadius: '12px',
        ui: {
          menu: 'my-menu', menuItem: 'my-row', menuHeader: 'my-head',
          menuHint: 'my-hint', menuSeparator: 'my-sep',
        },
      },
    });
    await w.find('.apex-split__toggle').trigger('click');

    const style = w.find('.apex-split').attributes('style') || '';
    for (const v of ['--apex-menu-bg', '--apex-menu-fg', '--apex-menu-hover-bg',
      '--apex-menu-hover-fg', '--apex-menu-icon', '--apex-menu-header-fg',
      '--apex-menu-hint-fg', '--apex-menu-sep', '--apex-menu-border', '--apex-menu-radius']) {
      expect(style, v).toContain(v);
    }
    // The overlay is a descendant of .apex-split, so it inherits them.
    expect(w.find('.apex-menu').exists()).toBe(true);

    expect(w.find('.apex-menu.my-menu').exists()).toBe(true);
    expect(w.find('.apex-menu__row.my-row').exists()).toBe(true);
    expect(w.find('.apex-menu__header.my-head').exists()).toBe(true);
    expect(w.find('.apex-menu__hint.my-hint').exists()).toBe(true);
    expect(w.find('.apex-menu__sep.my-sep').exists()).toBe(true);
  });

  it('the class map follows the recursion into a submenu', async () => {
    const w = mount(ApexSplitButton, {
      props: { label: 'Save', model, ui: { menuItem: 'my-row' } },
    });
    await w.find('.apex-split__toggle').trigger('click');
    // The submenu renders eagerly, so the nested row is reachable without
    // opening the branch — and it carries the class too.
    // Parent rows plus the nested one.
    expect(w.findAll('.apex-menu__sub .apex-menu__row.my-row').length).toBe(1);
  });

  it('an untouched split button carries no menu variables', async () => {
    const w = mount(ApexSplitButton, { props: { label: 'Save', model } });
    expect(w.find('.apex-split').attributes('style')).toBeUndefined();
  });
});

describe('speed dial actions', () => {
  const model = [{ label: 'Add', icon: 'add' }, { label: 'Edit', icon: 'edit' }];

  it('action props reach the buttons, and ui.action lands on them', () => {
    const w = mount(ApexSpeedDial, {
      props: {
        items: model,
        actionBackground: '#101820', actionColor: '#e8eef7',
        actionBorderColor: '#243040', actionRadius: '10px',
        actionHoverColor: '#7aa2f7', actionHoverBorderColor: '#7aa2f7',
        actionSize: '64px',
        ui: { action: 'my-action', item: 'my-pos' },
      },
    });
    const style = w.find('.apex-dial').attributes('style') || '';
    for (const v of ['--apex-dial-action-bg', '--apex-dial-action-fg',
      '--apex-dial-action-border', '--apex-dial-action-radius',
      '--apex-dial-action-hover-fg', '--apex-dial-action-hover-border',
      '--apex-dial-btn']) {
      expect(style, v).toContain(v);
    }
    // ui.action is the visible button; ui.item stays on the positioner it
    // was always on, so neither displaces the other.
    expect(w.findAll('.apex-dial__btn.my-action').length).toBe(2);
    expect(w.findAll('.apex-dial__item.my-pos').length).toBe(2);
  });

  it('the trigger still takes the shared button props', () => {
    const w = mount(ApexSpeedDial, { props: { items: model, color: '#c0392b' } });
    expect(w.find('.apex-dial').attributes('style')).toContain('--apex-btn-color');
  });
});
