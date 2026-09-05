import { describe, it, expect, beforeAll } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexUI from '../src/index';
import App from '../../apex-ui-docs/src/App.vue';
import { __alertState, __alertClose } from '../src/core/alert';

/**
 * The ApexConfirmPopup page's central claim is about routing:
 *
 *   "That target is also what routes the request here — the same call without
 *    one opens the alert instead."
 *
 * One service, two hosts, and the caller never picks a component. Nothing else
 * checks it. The section guard sees a heading; the render guard sees no
 * warning. A demo that forgot to pass `target`, or a groupless popup host that
 * was never mounted, would leave every button on the page opening the centred
 * alert — and the page would still pass everything, while showing the reader
 * the opposite of what it says.
 */

beforeAll(() => {
  if (!('ResizeObserver' in globalThis)) {
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      observe() {} unobserve() {} disconnect() {}
    };
  }
});

async function openConfirmPopupPage() {
  const wrapper = mount(App, { global: { plugins: [ApexUI] }, attachTo: document.body });
  const link = wrapper.findAll('.navitem').find((b) => b.text() === 'ApexConfirmPopup');
  if (!link) throw new Error('no ApexConfirmPopup sidebar link');
  await link.trigger('click');
  return wrapper;
}

describe('a confirm request routes by its target', () => {
  it("the page's requests all carry one", async () => {
    __alertClose();
    const wrapper = await openConfirmPopupPage();

    const save = wrapper.findAll('button').find((b) => b.text().includes('Save'));
    expect(save, 'the Basic section offers its trigger').toBeTruthy();
    await save!.trigger('click');

    expect(__alertState.open, 'the service was called').toBe(true);
    /*
     * `target` set is the whole routing decision: ApexConfirmPopup renders
     * when it is present, ApexAlert when it is not. Asserting on the state is
     * enough and is what both hosts read.
     */
    expect(__alertState.target, 'the request carries a target').toBeTruthy();

    __alertClose();
    wrapper.unmount();
  });

  it('the groupless popup host is mounted, so an ungrouped request has a home', async () => {
    __alertClose();
    const wrapper = await openConfirmPopupPage();

    /* The Basic and Placement sections send no group, so they rely on a
       groupless <ApexConfirmPopup /> existing at the app root. */
    const hosts = wrapper.findAllComponents({ name: 'ApexConfirmPopup' });
    expect(hosts.length, 'popup hosts on the page').toBeGreaterThan(0);
    expect(
      hosts.some((h) => !h.props('group')),
      'one host takes ungrouped requests',
    ).toBe(true);

    __alertClose();
    wrapper.unmount();
  });

  it('a grouped request carries its group, so it reaches that host', async () => {
    __alertClose();
    const wrapper = await openConfirmPopupPage();

    const custom = wrapper.findAll('button').find((b) => b.text().includes('Custom message'));
    await custom!.trigger('click');

    expect(__alertState.group, 'routed to the templated popup').toBe('tpl');
    expect(__alertState.target, 'still anchored').toBeTruthy();

    __alertClose();
    wrapper.unmount();
  });
});
