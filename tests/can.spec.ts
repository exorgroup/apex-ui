import { describe, it, expect } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import ApexSelect from '../src/components/ApexSelect.vue';
import { useCan } from '../src/core/can';
import { APEX_UI_OPTIONS } from '../src/core/symbols';

/**
 * The permission seam.
 *
 * `useCan` generalises `useCanCreate` to any action, and `useCanCreate` now
 * calls through it. That delegation is the part worth guarding: six controls
 * depend on the older resolver, so a change in precedence here would quietly
 * either hide every "Add new" row or show every one that should be hidden —
 * neither of which any other test would notice.
 *
 * None of this is authorisation. It decides what a control offers, not what
 * the server permits.
 */

/** Reach a composable that needs an injection context, as a control would. */
function probe(options: Record<string, unknown>) {
  let can!: ReturnType<typeof useCan>;
  mount(
    defineComponent({
      setup() { can = useCan(); return () => h('i'); },
    }),
    { global: { provide: { [APEX_UI_OPTIONS as symbol]: options } } },
  );
  return can;
}

describe('useCan', () => {
  it('allows when nothing is registered', () => {
    /* The default has to be yes. Denying by default would blank out controls
       in every app that has not wired a resolver, including this suite. */
    expect(probe({})('delete', 'events')).toBe(true);
  });

  it('allows when there is no resource to ask about', () => {
    const can = probe({ can: () => false });
    expect(can('delete')).toBe(true);
  });

  it('asks the resolver with both the action and the resource', () => {
    const seen: Array<[string, string]> = [];
    const can = probe({ can: (a: string, r: string) => { seen.push([a, r]); return a === 'read'; } });

    expect(can('read', 'events')).toBe(true);
    expect(can('delete', 'events')).toBe(false);
    expect(seen).toEqual([['read', 'events'], ['delete', 'events']]);
  });

  it('lets an explicit answer win over the resolver, in both directions', () => {
    const deny = probe({ can: () => false });
    const allow = probe({ can: () => true });

    expect(deny('delete', 'events', true)).toBe(true);
    expect(allow('delete', 'events', false)).toBe(false);
  });

  it('gives canCreate the last word on creating', () => {
    /* An app may have registered only the older resolver. If the general one
       answered first, that app's gating would silently change behaviour. */
    const can = probe({ canCreate: () => false, can: () => true });

    expect(can('create', 'zones')).toBe(false);
    expect(can('delete', 'zones')).toBe(true);
  });

  it('falls back to the general resolver when canCreate is absent', () => {
    const can = probe({ can: (a: string) => a !== 'create' });
    expect(can('create', 'zones')).toBe(false);
  });
});

describe('useCanCreate delegates, so the six choosers honour either resolver', () => {
  const O = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Bravo' }];

  const row = async (options: Record<string, unknown>, props: Record<string, unknown> = {}) => {
    const w = mount(ApexSelect, {
      props: { label: 'Zone', options: O, addNew: true, resource: 'zones', ...props },
      global: { provide: { [APEX_UI_OPTIONS as symbol]: options } },
    });
    await w.find('.apex-ctl').trigger('click');
    return w.find('.apex-pop__add').exists();
  };

  it('hides the row for a general resolver that denies creating', async () => {
    /* Before the delegation this resolver was ignored entirely: the chooser
       only ever consulted canCreate. */
    expect(await row({ can: () => false })).toBe(false);
  });

  it('still hides it for the older canCreate resolver', async () => {
    expect(await row({ canCreate: () => false })).toBe(false);
  });

  it('shows it when either resolver allows', async () => {
    expect(await row({ can: () => true })).toBe(true);
    expect(await row({ canCreate: () => true })).toBe(true);
    expect(await row({})).toBe(true);
  });

  it('lets canAddNew override a denying resolver', async () => {
    expect(await row({ can: () => false }, { canAddNew: true })).toBe(true);
  });
});
