import { describe, it, expect, beforeAll } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexUI from '../src/index';
import App from '../../apex-ui-docs/src/App.vue';
import { __dialogState, DIALOG_BASE_Z, dialogZ } from '../src/core/dialog';

/**
 * The Stacking section makes a claim the docs cannot check for themselves:
 * "each with its own z-index — base 1000, ten per level".
 *
 * The section guard only sees that a heading exists. The page-render guard
 * only sees that nothing warned. Neither would notice a demo that opened the
 * second dialog underneath the first, or a z-index that never varied — and
 * both would read as correct while showing the reader the opposite of what
 * the prose says.
 */

beforeAll(() => {
  if (!('ResizeObserver' in globalThis)) {
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      observe() {} unobserve() {} disconnect() {}
    };
  }
});

/** The stack is module state, so it survives between mounts. */
function reset() {
  __dialogState.instances.splice(0, __dialogState.instances.length);
}

async function openDynamicDialogPage() {
  const wrapper = mount(App, { global: { plugins: [ApexUI] }, attachTo: document.body });
  const link = wrapper.findAll('.navitem').find((b) => b.text() === 'ApexDynamicDialog');
  if (!link) throw new Error('no ApexDynamicDialog sidebar link');
  await link.trigger('click');
  return wrapper;
}

describe('the dialog service stacks', () => {
  it('gives each level its own z-index, ten apart', () => {
    expect(dialogZ(0)).toBe(DIALOG_BASE_Z);
    expect(dialogZ(1)).toBe(DIALOG_BASE_Z + 10);
    expect(dialogZ(2)).toBe(DIALOG_BASE_Z + 20);
  });

  it('the nested demo opens the second dialog ABOVE the first', async () => {
    reset();
    const wrapper = await openDynamicDialogPage();

    const nested = wrapper.findAll('button').find((b) => b.text().includes('Open over a dialog'));
    expect(nested, 'the page offers the nested trigger').toBeTruthy();
    await nested!.trigger('click');

    expect(__dialogState.instances.length, 'two dialogs are open').toBe(2);

    /*
     * Index decides z-index, so the one the prose calls "second" has to be
     * last in the stack. Opening them the other way round would leave it
     * behind the first while the page insists it is in front.
     */
    const headers = __dialogState.instances.map(
      (i) => (i.options.props as { header?: string } | undefined)?.header,
    );
    expect(headers).toEqual(['Pick a city', 'A second picker']);
    expect(dialogZ(1)).toBeGreaterThan(dialogZ(0));

    reset();
    wrapper.unmount();
  });

  it('closeAll() clears the stack', async () => {
    reset();
    const wrapper = await openDynamicDialogPage();

    await wrapper.findAll('button').find((b) => b.text().includes('Open over a dialog'))!.trigger('click');
    expect(__dialogState.instances.length).toBe(2);

    await wrapper.findAll('button').find((b) => b.text().includes('closeAll()'))!.trigger('click');
    /* hide() only flips visible; the instance leaves on the transition end,
       so this is what closeAll can be held to synchronously. */
    expect(__dialogState.instances.every((i) => !i.visible), 'every dialog is closing').toBe(true);

    reset();
    wrapper.unmount();
  });
});
