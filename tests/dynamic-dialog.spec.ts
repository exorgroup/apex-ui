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
 * only sees that nothing warned. Neither would notice a stack that never
 * stacked, and both would read as correct while showing the reader the
 * opposite of what the prose says.
 *
 * The demo opens ONE dialog and invites you to open another from inside it —
 * the gallery's shape, and a better one: a picker opening a picker is the real
 * case, and it exercises contentProps and per-instance options on the way. So
 * this drives it exactly as the reader would.
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

/** Click the page's nested trigger, then the picker's own one. */
async function openTwo(wrapper: Awaited<ReturnType<typeof openDynamicDialogPage>>) {
  const nested = wrapper.findAll('button').find((b) => b.text().includes('Open over a dialog'));
  expect(nested, 'the page offers the nested trigger').toBeTruthy();
  await nested!.trigger('click');

  /*
   * The second is opened from inside the first, which is the point: the picker
   * calls the service itself. findAllComponents walks the component tree, so
   * it reaches the loaded component even though ApexDialog teleports its DOM.
   */
  const picker = wrapper.findAllComponents({ name: 'CityPicker' })[0];
  expect(picker, 'the dialog loaded CityPicker').toBeTruthy();

  const again = picker.findAll('button').find((b) => b.text().includes('Open another over this one'));
  expect(again, 'the picker offers its own nesting trigger').toBeTruthy();
  await again!.trigger('click');
}

describe('the dialog service stacks', () => {
  it('gives each level its own z-index, ten apart', () => {
    expect(dialogZ(0)).toBe(DIALOG_BASE_Z);
    expect(dialogZ(1)).toBe(DIALOG_BASE_Z + 10);
    expect(dialogZ(2)).toBe(DIALOG_BASE_Z + 20);
  });

  it('the loaded component opens another over itself', async () => {
    reset();
    const wrapper = await openDynamicDialogPage();

    const nested = wrapper.findAll('button').find((b) => b.text().includes('Open over a dialog'));
    await nested!.trigger('click');
    expect(__dialogState.instances.length, 'one dialog so far').toBe(1);

    const picker = wrapper.findAllComponents({ name: 'CityPicker' })[0];
    const again = picker.findAll('button').find((b) => b.text().includes('Open another over this one'));
    await again!.trigger('click');

    expect(__dialogState.instances.length, 'now two are open').toBe(2);
    /* Index decides z-index, so the newer one must be last in the stack. */
    expect(dialogZ(1)).toBeGreaterThan(dialogZ(0));

    reset();
    wrapper.unmount();
  });

  it('each instance keeps its own options', async () => {
    reset();
    const wrapper = await openDynamicDialogPage();
    await openTwo(wrapper);

    const headers = __dialogState.instances.map(
      (i) => (i.options.props as { header?: string } | undefined)?.header,
    );
    expect(headers, 'the second carries its own header').toEqual(
      ['Pick a city', 'A dialog over a dialog'],
    );

    reset();
    wrapper.unmount();
  });

  it('closeAll() clears the stack', async () => {
    reset();
    const wrapper = await openDynamicDialogPage();

    await wrapper.findAll('button')
      .find((b) => b.text().includes('Open over a dialog'))!.trigger('click');
    expect(__dialogState.instances.length).toBe(1);

    await wrapper.findAll('button').find((b) => b.text().includes('closeAll()'))!.trigger('click');
    /* hide() only flips visible; the instance leaves on the transition end,
       so this is what closeAll can be held to synchronously. */
    expect(__dialogState.instances.every((i) => !i.visible), 'every dialog is closing').toBe(true);

    reset();
    wrapper.unmount();
  });
});
