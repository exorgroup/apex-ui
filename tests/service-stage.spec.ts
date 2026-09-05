import { describe, it, expect, beforeAll } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexUI from '../src/index';
import App from '../../apex-ui-docs/src/App.vue';
import { __toastState } from '../src/core/toast';

/**
 * The service entry kind actually calls the service.
 *
 * A service page has nothing to render until something is fired, so the
 * page-render guard passes on a stage whose button is wired to nothing at
 * all — the page is legitimately near-empty either way. This is the part that
 * guard cannot see: click the trigger, and something must reach the singleton
 * host.
 */

beforeAll(() => {
  if (!('ResizeObserver' in globalThis)) {
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      observe() {} unobserve() {} disconnect() {}
    };
  }
});

async function openToast() {
  const wrapper = mount(App, { global: { plugins: [ApexUI] }, attachTo: document.body });
  const link = wrapper.findAll('.navitem').find((b) => b.text() === 'ApexToast');
  if (!link) throw new Error('no ApexToast sidebar link');
  await link.trigger('click');
  return wrapper;
}

/** The queue is module state, so it survives between mounts and must be reset. */
function clearQueue() {
  __toastState.messages.splice(0, __toastState.messages.length);
}

describe('a service page fires its service', () => {
  it('the trigger queues a toast, and it reaches the host', async () => {
    clearQueue();
    const wrapper = await openToast();

    const trigger = wrapper.findAll('.svc-buttons button').find((b) => b.text() === 'Add toast');
    expect(trigger, 'the stage offers the documented trigger').toBeTruthy();

    await trigger!.trigger('click');

    expect(__toastState.messages.length, 'the service was called').toBe(1);
    /* Not just the store: the singleton host has to be mounted, or an app
       following the docs would call add() and see nothing. */
    expect(document.body.textContent).toContain('Saved');

    clearQueue();
    wrapper.unmount();
  });

  it('the rail feeds the call, rather than a fixed payload', async () => {
    clearQueue();
    const wrapper = await openToast();

    const summary = wrapper.findAll('.rail-row').find((r) => r.text().startsWith('summary'));
    await summary!.find('input').setValue('Deleted');
    await wrapper.findAll('.svc-buttons button').find((b) => b.text() === 'Add toast')!.trigger('click');

    expect(__toastState.messages[0].summary).toBe('Deleted');

    clearQueue();
    wrapper.unmount();
  });

  it('an extra button calls its own method', async () => {
    clearQueue();
    const wrapper = await openToast();
    const btns = () => wrapper.findAll('.svc-buttons button');

    await btns().find((b) => b.text() === 'Add toast')!.trigger('click');
    await btns().find((b) => b.text() === 'Add toast')!.trigger('click');
    expect(__toastState.messages.length).toBe(2);

    await btns().find((b) => b.text() === 'Clear all')!.trigger('click');
    expect(__toastState.messages.length, 'removeAll() ran').toBe(0);

    wrapper.unmount();
  });

  it('the usage snippet shows the call and the host mount', async () => {
    const wrapper = await openToast();
    const snippet = wrapper.find('.usage').text();

    /* Both halves matter. Someone who copies only the call and never mounts
       the host gets a working service and a silent page. */
    expect(snippet, 'names the composable').toContain('useApexToast()');
    expect(snippet, 'shows the method call').toContain('toast.add(');
    expect(snippet, 'shows the host to mount').toContain('<ApexToast />');
    expect(snippet, 'is not shown as a placed component').not.toContain('<ApexToast v-model');

    wrapper.unmount();
  });
});
