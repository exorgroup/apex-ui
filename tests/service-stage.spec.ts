import { describe, it, expect, beforeAll } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexUI from '../src/index';
import App from '../../apex-ui-docs/src/App.vue';
import { __alertState, __alertClose } from '../src/core/alert';
import { __toastState } from '../src/core/toast';

/**
 * The service entry kind actually calls the service.
 *
 * A service page has nothing to render until something is fired, so the
 * page-render guard passes on a stage whose button is wired to nothing at
 * all — the page is legitimately near-empty either way. This is the part that
 * guard cannot see: click the trigger, and something must reach the singleton
 * host.
 *
 * These were written against ApexToast, which was then a service entry.
 * AF2-192 rebuilt that page on the gallery's model — ApexToast is a container
 * with real props, and its service surface is documented rather than driven
 * from the rail — so the checks moved to ApexAlert, the remaining service
 * entry. The toast case did not go uncovered: the last test here holds it,
 * against the trigger its new stage offers.
 */

beforeAll(() => {
  if (!('ResizeObserver' in globalThis)) {
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      observe() {} unobserve() {} disconnect() {}
    };
  }
});

async function openPage(name: string) {
  const wrapper = mount(App, { global: { plugins: [ApexUI] }, attachTo: document.body });
  const link = wrapper.findAll('.navitem').find((b) => b.text() === name);
  if (!link) throw new Error(`no ${name} sidebar link`);
  await link.trigger('click');
  return wrapper;
}

/** Both stores are module state, so they survive between mounts. */
function reset() {
  __alertClose();
  __toastState.messages.splice(0, __toastState.messages.length);
}

describe('a service page fires its service', () => {
  it('the trigger opens the alert, and it reaches the host', async () => {
    reset();
    const wrapper = await openPage('ApexAlert');

    const trigger = wrapper.findAll('.svc-buttons button').find((b) => b.text() === 'Ask');
    expect(trigger, 'the stage offers the documented trigger').toBeTruthy();

    await trigger!.trigger('click');

    expect(__alertState.open, 'the service was called').toBe(true);
    /* Not just the store: the singleton host has to be mounted, or an app
       following the docs would call confirm() and see nothing. */
    expect(document.body.textContent).toContain('Delete area?');

    reset();
    wrapper.unmount();
  });

  it('the rail feeds the call, rather than a fixed payload', async () => {
    reset();
    const wrapper = await openPage('ApexAlert');

    const title = wrapper.findAll('.rail-row').find((r) => r.text().startsWith('title'));
    await title!.find('input').setValue('Remove seat?');
    await wrapper.findAll('.svc-buttons button').find((b) => b.text() === 'Ask')!.trigger('click');

    expect(__alertState.title).toBe('Remove seat?');

    reset();
    wrapper.unmount();
  });

  it('an extra button calls its own method', async () => {
    reset();
    const wrapper = await openPage('ApexAlert');
    const btns = () => wrapper.findAll('.svc-buttons button');

    await btns().find((b) => b.text() === 'Ask')!.trigger('click');
    expect(__alertState.open).toBe(true);

    await btns().find((b) => b.text() === 'Close')!.trigger('click');
    expect(__alertState.open, 'close() ran').toBe(false);

    reset();
    wrapper.unmount();
  });

  it('the usage snippet shows the call and the host mount', async () => {
    const wrapper = await openPage('ApexAlert');
    const snippet = wrapper.find('.usage').text();

    /* Both halves matter. Someone who copies only the call and never mounts
       the host gets a working service and a silent page. */
    expect(snippet, 'names the composable').toContain('useApexAlert()');
    expect(snippet, 'shows the method call').toContain('alert.confirm(');
    expect(snippet, 'shows the host to mount').toContain('<ApexAlert />');
    expect(snippet, 'is not shown as a placed component').not.toContain('<ApexAlert v-model');

    wrapper.unmount();
  });

  it("the toast page's stage trigger queues into its own container", async () => {
    reset();
    const wrapper = await openPage('ApexToast');

    const trigger = wrapper.findAll('.ovl-stage__row button').find((b) => b.text() === 'Add toast');
    expect(trigger, 'the stage offers a trigger').toBeTruthy();

    await trigger!.trigger('click');

    expect(__toastState.messages.length, 'add() ran').toBe(1);
    /*
     * The group is the point. The stage mounts its own container so the rail's
     * position and mode are visible; without a group its toasts would land in
     * the app-root host as well, and the page would show each one twice.
     */
    expect(__toastState.messages[0].group, 'routed to the stage container').toBe('stage');
    expect(document.body.textContent, 'the container rendered it').toContain('Toast 1');

    await wrapper.findAll('.ovl-stage__row button').find((b) => b.text() === 'Clear all')!.trigger('click');
    expect(__toastState.messages.length, 'removeAll ran').toBe(0);

    reset();
    wrapper.unmount();
  });
});
