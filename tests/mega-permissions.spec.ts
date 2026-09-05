import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import type { Plugin } from 'vue';
import ApexUI from '../src/index';
import ApexMegaMenu from '../src/components/ApexMegaMenu.vue';
import type { MegaItem } from '../src/components/ApexMegaMenu.vue';
import { filterMega, type CanFn } from '../src/core/menuPermissions';

/**
 * A mega panel hides at three levels, and they cascade upward.
 *
 * A link goes on its own `can`. A column goes on its own, or because the links
 * it was holding all went — a heading over blank space is worse than no column.
 * A root item goes on its own, or because its columns all went, since the
 * dropdown would then open onto nothing.
 *
 * The cascade is the part that is easy to get half right: filtering all three
 * levels but never re-judging the parents leaves empty columns and empty
 * panels, which look like a rendering bug rather than a permissions one.
 */

const denying = (...denied: string[]): CanFn =>
  (_action, resource) => !resource || !denied.includes(resource);

const gated = {
  plugins: [[ApexUI, {
    can: (action: string, resource: string) => denying('secret')(action, resource),
  }] as [Plugin, unknown]],
};
const open = { plugins: [ApexUI] };

describe('filterMega, level by level', () => {
  it('drops a denied link but keeps its column', () => {
    const items: MegaItem[] = [{
      label: 'Shop',
      columns: [{ header: 'Gear', items: [{ label: 'Tents' }, { label: 'Secret', can: 'secret' }] }],
    }];
    const out = filterMega(items, denying('secret'));
    expect(out[0].columns![0].items!.map((l) => l.label)).toEqual(['Tents']);
  });

  it('drops a denied column outright', () => {
    const items: MegaItem[] = [{
      label: 'Shop',
      columns: [
        { header: 'Gear', items: [{ label: 'Tents' }] },
        { header: 'Staff', can: 'secret', items: [{ label: 'Rotas' }] },
      ],
    }];
    const out = filterMega(items, denying('secret'));
    expect(out[0].columns!.map((c) => c.header)).toEqual(['Gear']);
  });

  it('drops a column its links emptied', () => {
    const items: MegaItem[] = [{
      label: 'Shop',
      columns: [
        { header: 'Gear', items: [{ label: 'Tents' }] },
        { header: 'Staff', items: [{ label: 'Rotas', can: 'secret' }] },
      ],
    }];
    const out = filterMega(items, denying('secret'));
    expect(out[0].columns!.map((c) => c.header), 'a heading over blank space goes')
      .toEqual(['Gear']);
  });

  it('keeps a column that never had links', () => {
    /* A heading and an image is a column with content; it is not empty just
       because it holds no links, so it stands on its own `can`. */
    const items: MegaItem[] = [{
      label: 'Shop',
      columns: [{ header: 'Featured', image: '/hero.jpg' }],
    }];
    const out = filterMega(items, denying('secret'));
    expect(out[0].columns!.length).toBe(1);
  });

  it('a column kept by its footer alone survives', () => {
    const items: MegaItem[] = [{
      label: 'Shop',
      columns: [{ header: 'Gear', items: [{ label: 'Tents', can: 'secret' }], footer: { label: 'Shop all' } }],
    }];
    const out = filterMega(items, denying('secret'));
    expect(out[0].columns!.length).toBe(1);
    expect(out[0].columns![0].items).toEqual([]);
    expect(out[0].columns![0].footer!.label).toBe('Shop all');
  });

  it('a denied footer goes on its own', () => {
    const items: MegaItem[] = [{
      label: 'Shop',
      columns: [{ header: 'Gear', items: [{ label: 'Tents' }], footer: { label: 'All', can: 'secret' } }],
    }];
    const out = filterMega(items, denying('secret'));
    expect(out[0].columns![0].footer).toBeUndefined();
  });

  it('drops a root item its columns emptied', () => {
    const items: MegaItem[] = [
      { label: 'Shop', columns: [{ header: 'Gear', items: [{ label: 'Tents' }] }] },
      { label: 'Admin', columns: [{ header: 'Staff', items: [{ label: 'Rotas', can: 'secret' }] }] },
    ];
    const out = filterMega(items, denying('secret'));
    expect(out.map((i) => i.label), 'a dropdown onto nothing goes').toEqual(['Shop']);
  });

  it('keeps a root item whose promo panel still has something', () => {
    /* The columns are gone but the panel is not, so opening it still shows
       the reader something. */
    const items: MegaItem[] = [{
      label: 'Admin',
      columns: [{ header: 'Staff', items: [{ label: 'Rotas', can: 'secret' }] }],
      panel: { title: 'New season', text: 'Out now' },
    }];
    const out = filterMega(items, denying('secret'));
    expect(out.map((i) => i.label)).toEqual(['Admin']);
    expect(out[0].columns).toEqual([]);
  });

  it('keeps a plain root link that never had columns', () => {
    const items: MegaItem[] = [{ label: 'Contact', href: '/contact' }];
    expect(filterMega(items, denying('secret')).length).toBe(1);
  });

  it('filters the panel’s own cards', () => {
    const items: MegaItem[] = [{
      label: 'Shop',
      columns: [{ header: 'Gear', items: [{ label: 'Tents' }] }],
      panel: { cards: [{ label: 'Brand A' }, { label: 'Brand B', can: 'secret' }] },
    }];
    const out = filterMega(items, denying('secret'));
    expect(out[0].panel!.cards!.map((c) => c.label)).toEqual(['Brand A']);
  });

  it('returns the same array when nothing is denied', () => {
    const items: MegaItem[] = [{
      label: 'Shop',
      columns: [{ header: 'Gear', items: [{ label: 'Tents' }] }],
    }];
    const out = filterMega(items, denying('secret'));
    expect(out, 'identity, so a menu that gates nothing does not re-key').toBe(items);
    expect(out[0].columns).toBe(items[0].columns);
  });
});

describe('ApexMegaMenu is wired to it', () => {
  const MODEL: MegaItem[] = [
    {
      label: 'Shop',
      columns: [
        { header: 'Gear', items: [{ label: 'Tents' }, { label: 'Rotas', can: 'secret' }] },
        { header: 'Staff', items: [{ label: 'Payroll', can: 'secret' }] },
      ],
    },
    { label: 'Admin', columns: [{ header: 'Users', items: [{ label: 'Roles', can: 'secret' }] }] },
  ];

  it('hides the denied link, the column it emptied, and the item that emptied', async () => {
    const w = mount(ApexMegaMenu, {
      props: { items: MODEL, trigger: 'click' as const }, global: gated, attachTo: document.body,
    });
    expect(w.text(), 'the root item with nothing left').not.toContain('Admin');

    await w.find('.apex-mega__rootlink').trigger('click');
    const text = w.text();
    expect(text).toContain('Tents');
    expect(text, 'the denied link').not.toContain('Rotas');
    expect(text, 'the column it emptied').not.toContain('Staff');
    expect(text, 'the column that kept a link').toContain('Gear');
    w.unmount();
  });

  it('shows all of it when nothing is denied', async () => {
    const w = mount(ApexMegaMenu, {
      props: { items: MODEL, trigger: 'click' as const }, global: open, attachTo: document.body,
    });
    expect(w.text()).toContain('Admin');
    await w.findAll('.apex-mega__rootlink')[0].trigger('click');
    const text = w.text();
    expect(text).toContain('Rotas');
    expect(text).toContain('Staff');
    w.unmount();
  });
});
