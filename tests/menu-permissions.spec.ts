import { describe, it, expect } from 'vitest';
import { allows, filterItems, filterMenu, type CanFn } from '../src/core/menuPermissions';
import type { MenuItem } from '../src/components/ApexMenuItem';

/**
 * The filter's easy half is dropping a denied row; the half that goes wrong is
 * everything the row was propping up. A submenu emptied of children, a heading
 * left over a gap, two rules that used to have a row between them — each of
 * those renders happily and looks like a bug in the component rather than in
 * the caller's menu, which is why they are all pinned here.
 */

/** A resolver that allows everything except the resources named. */
function denying(...denied: string[]): CanFn {
  return (_action, resource) => !resource || !denied.includes(resource);
}

/** A resolver that answers per action, so the long form can be told apart. */
const byAction: CanFn = (action, resource) => `${action}:${resource}` !== 'delete:events';

describe('allows', () => {
  it('lets an ungated item through', () => {
    expect(allows(undefined, denying('events'))).toBe(true);
  });

  it('takes a boolean at its word, without asking the resolver', () => {
    let asked = false;
    const spy: CanFn = () => { asked = true; return false; };
    expect(allows(true, spy)).toBe(true);
    expect(allows(false, spy)).toBe(false);
    expect(asked, 'a boolean is the answer, not a question').toBe(false);
  });

  it('reads a bare string as the resource, asked about with read', () => {
    const seen: Array<[string, string | undefined]> = [];
    const spy: CanFn = (a, r) => { seen.push([a, r]); return true; };
    allows('events', spy);
    expect(seen).toEqual([['read', 'events']]);
  });

  it('passes the long form through as written', () => {
    expect(allows({ action: 'delete', resource: 'events' }, byAction)).toBe(false);
    expect(allows({ action: 'update', resource: 'events' }, byAction)).toBe(true);
  });
});

describe('filterItems', () => {
  it('drops the denied ones', () => {
    const items = [{ label: 'A' }, { label: 'B', can: 'events' }, { label: 'C', can: 'venues' }];
    expect(filterItems(items, denying('events')).map((i) => i.label)).toEqual(['A', 'C']);
  });

  it('returns the same array when nothing is denied', () => {
    /* Identity matters: a menu that gates nothing must not hand the renderer a
       new array on every resolve and re-key every row. */
    const items = [{ label: 'A' }, { label: 'B', can: 'venues' }];
    expect(filterItems(items, denying('events'))).toBe(items);
  });
});

describe('filterMenu', () => {
  it('drops a branch whose children all go', () => {
    const items: MenuItem[] = [
      { label: 'Reports', items: [{ label: 'Sales', can: 'reports' }, { label: 'VAT', can: 'reports' }] },
      { label: 'Home' },
    ];
    expect(filterMenu(items, denying('reports')).map((i) => i.label)).toEqual(['Home']);
  });

  it('keeps a branch that has one child left', () => {
    const items: MenuItem[] = [
      { label: 'Reports', items: [{ label: 'Sales', can: 'reports' }, { label: 'VAT' }] },
    ];
    const out = filterMenu(items, denying('reports'));
    expect(out.map((i) => i.label)).toEqual(['Reports']);
    expect(out[0].items?.map((i) => i.label)).toEqual(['VAT']);
    expect(out[0], 'a changed branch is a copy, not a mutation').not.toBe(items[0]);
    expect(items[0].items, 'the caller’s array is untouched').toHaveLength(2);
  });

  it('drops a heading left labelling nothing', () => {
    const items: MenuItem[] = [
      { header: 'Admin' },
      { label: 'Users', can: 'users' },
      { header: 'General' },
      { label: 'Profile' },
    ];
    expect(filterMenu(items, denying('users')).map((i) => i.header || i.label))
      .toEqual(['General', 'Profile']);
  });

  it('keeps a heading that still has a row under it', () => {
    const items: MenuItem[] = [
      { header: 'Admin' },
      { label: 'Users', can: 'users' },
      { label: 'Groups' },
    ];
    expect(filterMenu(items, denying('users')).map((i) => i.header || i.label))
      .toEqual(['Admin', 'Groups']);
  });

  it('a rule between two headings does not count as content', () => {
    const items: MenuItem[] = [
      { header: 'Admin' },
      { label: 'Users', can: 'users' },
      { separator: true },
      { header: 'General' },
      { label: 'Profile' },
    ];
    expect(filterMenu(items, denying('users')).map((i) => i.header || i.label))
      .toEqual(['General', 'Profile']);
  });

  it('collapses the doubled rule a removed row leaves behind', () => {
    const items: MenuItem[] = [
      { label: 'Open' },
      { separator: true },
      { label: 'Delete', can: 'events' },
      { separator: true },
      { label: 'Close' },
    ];
    expect(filterMenu(items, denying('events')).map((i) => (i.separator ? '---' : i.label)))
      .toEqual(['Open', '---', 'Close']);
  });

  it('drops the leading and trailing rules', () => {
    const items: MenuItem[] = [
      { label: 'Open', can: 'events' },
      { separator: true },
      { label: 'Close' },
      { separator: true },
      { label: 'Delete', can: 'events' },
    ];
    expect(filterMenu(items, denying('events')).map((i) => (i.separator ? '---' : i.label)))
      .toEqual(['Close']);
  });

  it('tidies inside a submenu too', () => {
    const items: MenuItem[] = [
      {
        label: 'File',
        items: [{ label: 'New', can: 'events' }, { separator: true }, { label: 'Open' }],
      },
    ];
    const out = filterMenu(items, denying('events'));
    expect(out[0].items?.map((i) => (i.separator ? '---' : i.label))).toEqual(['Open']);
  });

  it('returns the same array when nothing is denied', () => {
    const items: MenuItem[] = [
      { label: 'File', items: [{ label: 'New' }, { separator: true }, { label: 'Open' }] },
      { label: 'Edit' },
    ];
    const out = filterMenu(items, denying('events'));
    expect(out).toBe(items);
    expect(out[0].items).toBe(items[0].items);
  });

  it('a menu emptied entirely comes back empty, not undefined', () => {
    const items: MenuItem[] = [{ label: 'Users', can: 'users' }];
    expect(filterMenu(items, denying('users'))).toEqual([]);
  });

  it('survives no items at all', () => {
    expect(filterMenu(undefined, denying())).toEqual([]);
  });
});
