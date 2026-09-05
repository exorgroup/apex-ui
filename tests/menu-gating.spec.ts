import { describe, it, expect, beforeAll } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, type Plugin } from 'vue';
import ApexUI from '../src/index';
import ApexTieredMenu from '../src/components/ApexTieredMenu.vue';
import ApexMenubar from '../src/components/ApexMenubar.vue';
import ApexContextMenu from '../src/components/ApexContextMenu.vue';
import ApexSplitButton from '../src/components/ApexSplitButton.vue';
import ApexMenu from '../src/components/ApexMenu.vue';
import ApexDock from '../src/components/ApexDock.vue';
import type { MenuItem } from '../src/components/ApexMenuItem';

/**
 * The filter is unit-tested on its own; this proves each control is actually
 * wired to it.
 *
 * That is a separate failure. A component can import the filter, define the
 * computed, and still render `props.items` in its template — the build passes,
 * the unit tests pass, and every denied row is on screen. Only mounting with a
 * resolver that denies something shows the difference.
 *
 * Each control is mounted by name rather than through a shared helper: a
 * helper generic enough to take any of them loses the prop types on the way in
 * and the exposed methods on the way out.
 */

beforeAll(() => {
  if (!('ResizeObserver' in globalThis)) {
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      observe() {} unobserve() {} disconnect() {}
    };
  }
});

/** An app-level resolver that denies read on 'secret'. */
const DENY_SECRET = {
  can: (action: string, resource: string) => !(resource === 'secret' && action === 'read'),
};

const MODEL: MenuItem[] = [
  { label: 'Open' },
  { label: 'Hidden', can: 'secret' },
  { label: 'Branch', items: [{ label: 'Also hidden', can: 'secret' }] },
];

/* The tuple form of a plugin entry, spelled out: inferred as a plain array it
   widens to Plugin[] and no longer matches GlobalMountOptions. */
const gated = { plugins: [[ApexUI, DENY_SECRET] as [Plugin, unknown]] };

describe('the ApexMenuItem controls hide denied rows', () => {
  it('ApexTieredMenu', () => {
    const w = mount(ApexTieredMenu, {
      props: { items: MODEL }, global: gated, attachTo: document.body,
    });
    const text = w.text();
    expect(text, 'an allowed row still shows').toContain('Open');
    expect(text, 'the denied row is gone').not.toContain('Hidden');
    expect(text, 'the branch emptied by the filter goes too').not.toContain('Branch');
    w.unmount();
  });

  it('ApexContextMenu', async () => {
    const w = mount(ApexContextMenu, {
      props: { items: MODEL }, global: gated, attachTo: document.body,
    });
    /* A context menu renders nothing until it is opened on something, and it
       teleports its panel — so the assertion has to read the document, not the
       wrapper. */
    w.vm.show({ clientX: 10, clientY: 10, preventDefault() {} } as unknown as MouseEvent);
    await w.vm.$nextTick();
    const text = document.body.textContent || '';
    expect(text).toContain('Open');
    expect(text).not.toContain('Hidden');
    expect(text).not.toContain('Branch');
    w.unmount();
  });

  it('ApexMenubar hides a denied root item', () => {
    const w = mount(ApexMenubar, {
      props: { items: [{ label: 'File' }, { label: 'Admin', can: 'secret' }] },
      global: gated,
      attachTo: document.body,
    });
    expect(w.text()).toContain('File');
    expect(w.text()).not.toContain('Admin');
    w.unmount();
  });

  it('ApexMenubar hides a denied row inside an open dropdown', async () => {
    const w = mount(ApexMenubar, {
      props: {
        items: [{ label: 'File', items: [{ label: 'New' }, { label: 'Purge', can: 'secret' }] }],
        trigger: 'click' as const,
      },
      global: gated,
      attachTo: document.body,
    });
    await w.find('.apex-mbar__rootlink').trigger('click');
    expect(w.text()).toContain('New');
    expect(w.text()).not.toContain('Purge');
    w.unmount();
  });

  it('ApexSplitButton keeps its primary action when the whole menu is denied', async () => {
    const w = mount(ApexSplitButton, {
      props: { label: 'Save', model: [{ label: 'Save as', can: 'secret' }] },
      global: gated,
      attachTo: document.body,
    });
    expect(w.text(), 'the primary action is not part of the model').toContain('Save');
    /* Open the dropdown: the menu is empty, but nothing throws and the button
       still works. */
    const buttons = w.findAll('button');
    await buttons[buttons.length - 1].trigger('click');
    expect(w.text()).not.toContain('Save as');
    w.unmount();
  });
});

describe('with no resolver wired, nothing is hidden', () => {
  /*
   * The default is allow. An app that has not registered a resolver — which is
   * every app before it opts in, and this suite — must see the whole menu, or
   * adding `can` to a shared component would blank out menus everywhere.
   */
  it('ApexTieredMenu shows every row', () => {
    const w = mount(ApexTieredMenu, {
      props: { items: MODEL },
      global: { plugins: [ApexUI] },
      attachTo: document.body,
    });
    expect(w.text()).toContain('Hidden');
    expect(w.text()).toContain('Branch');
    w.unmount();
  });
});

describe('ApexMenu filters, and its expandedKeys follow', () => {
  /*
   * ApexMenu is the one control where hiding a row has a second consequence.
   * Its open state is a bindable map, and expandAll()/collapseAll() build that
   * map by walking the model — so walking the raw model would write keys for
   * groups this user cannot see, and a consumer persisting the map to restore
   * a sidebar would save and reload state for a menu it never showed.
   */
  const MENU: MenuItem[] = [
    { key: 'reports', label: 'Reports', toggleable: true, items: [{ label: 'Sales' }] },
    { key: 'admin', label: 'Admin', toggleable: true, can: 'secret', items: [{ label: 'Users' }] },
    {
      key: 'gone',
      label: 'Gone',
      toggleable: true,
      items: [{ label: 'Only child', can: 'secret' }],
    },
  ];

  it('hides a denied group, and one emptied by the filter', () => {
    const w = mount(ApexMenu, {
      props: { items: MENU }, global: gated, attachTo: document.body,
    });
    const text = w.text();
    expect(text).toContain('Reports');
    expect(text, 'denied outright').not.toContain('Admin');
    expect(text, 'a group with no children left is a doorway to nothing')
      .not.toContain('Gone');
    w.unmount();
  });

  it('expandAll writes keys only for groups that survived', async () => {
    const w = mount(ApexMenu, {
      props: { items: MENU }, global: gated, attachTo: document.body,
    });
    w.vm.expandAll();
    await w.vm.$nextTick();

    const emitted = w.emitted('update:expandedKeys');
    expect(emitted, 'expandAll emits the map').toBeTruthy();
    const map = emitted![emitted!.length - 1][0] as Record<string, boolean>;
    expect(Object.keys(map).sort(), 'only the visible group').toEqual(['reports']);
    w.unmount();
  });

  it('with no resolver, expandAll covers every group', async () => {
    const w = mount(ApexMenu, {
      props: { items: MENU },
      global: { plugins: [ApexUI] },
      attachTo: document.body,
    });
    w.vm.expandAll();
    await w.vm.$nextTick();

    const emitted = w.emitted('update:expandedKeys');
    const map = emitted![emitted!.length - 1][0] as Record<string, boolean>;
    expect(Object.keys(map).sort()).toEqual(['admin', 'gone', 'reports']);
    w.unmount();
  });
});

describe('ApexDock filters its strip', () => {
  /*
   * A dock slot is an icon with no text, so a denied one that stayed would be
   * an unlabelled button that does nothing — worse than a hidden row in a
   * menu, not better. A group is a fan: with no children left it opens onto
   * nothing, so it goes too.
   */
  const DOCK: MenuItem[] = [
    { icon: 'home', label: 'Home' },
    { icon: 'lock', label: 'Admin', can: 'secret' },
    { icon: 'folder', label: 'Files', items: [{ icon: 'delete', label: 'Purge', can: 'secret' }] },
    { icon: 'star', label: 'Tools', items: [{ icon: 'build', label: 'Build' }] },
  ];

  it('drops the denied slot and the group it emptied', () => {
    const w = mount(ApexDock, {
      props: { items: DOCK }, global: gated, attachTo: document.body,
    });
    const labels = w.findAll('.apex-dock__label').map((n) => n.text());
    expect(labels).toContain('Home');
    expect(labels, 'denied outright').not.toContain('Admin');
    expect(labels, 'its only child was denied').not.toContain('Files');
    expect(labels, 'a group that kept a child stays').toContain('Tools');
    expect(labels, 'and so does that child').toContain('Build');
    w.unmount();
  });

  it('closes an open fan when the filtered strip changes shape', async () => {
    /*
     * openGroup is an index into the RENDERED strip, so it has to be cleared
     * when that strip changes shape.
     *
     * The order here is deliberate. Denying 'Admin' shifts everything after it
     * one slot left, so the index of the open group — 'Tools' at 1 — becomes
     * the index of 'Extras'. Without the watch the fan does not merely close:
     * it reopens on a different slot, showing this user a menu they never
     * asked for. Checking "nothing is open" alone would not catch that, since
     * a shorter list makes most stale indices simply overshoot.
     */
    const denied = ref(false);
    const SHIFTING: MenuItem[] = [
      { icon: 'lock', label: 'Admin', can: 'secret' },
      { icon: 'star', label: 'Tools', items: [{ icon: 'build', label: 'Build' }] },
      { icon: 'more_horiz', label: 'Extras', items: [{ icon: 'science', label: 'Labs' }] },
    ];

    const w = mount(ApexDock, {
      props: { items: SHIFTING },
      global: {
        plugins: [[ApexUI, {
          can: (action: string, resource: string) =>
            !(denied.value && resource === 'secret' && action === 'read'),
        }] as [Plugin, unknown]],
      },
      attachTo: document.body,
    });

    const openIndex = () => w.findAll('.apex-dock__slot')
      .findIndex((n) => n.attributes('data-open') === 'true');

    /* Open 'Tools', which sits at index 1 while everything is allowed. */
    await w.findAll('.apex-dock__slot')[1]
      .find('.apex-dock__item[data-group="true"]').trigger('click');
    expect(openIndex(), 'the Tools fan is open').toBe(1);

    denied.value = true;
    await w.vm.$nextTick();

    expect(openIndex(), 'no fan is open after the strip changes').toBe(-1);
    /* Index 1 is now 'Extras' — the slot a stale index would have opened. */
    const labels = w.findAll('.apex-dock__slot')[1].findAll('.apex-dock__label')
      .map((n) => n.text());
    expect(labels, 'and index 1 is now a different group').toContain('Extras');
    w.unmount();
  });
});
