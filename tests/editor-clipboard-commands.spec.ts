import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApexEditor from '../src/components/ApexEditor.vue';
import ApexEditorToolbar from '../src/components/ApexEditorToolbar.vue';
import { loadEngine } from '../src/core/editor/engine';
import { CATALOGUE } from '../src/core/editor/catalogue';

/**
 * Cut, copy and paste as buttons — N/036.
 *
 * Asked for alongside the paste fix. All three are keyboard gestures
 * the browser owns, so the commands reach for the platform rather than
 * building their own: `execCommand` raises a real cut/copy event, which
 * ProseMirror already serialises properly (HTML, plain text, and the
 * slice markers that keep structure when it is pasted back), and paste
 * hands the clipboard to the editor as a `paste` event so that a
 * button and a Ctrl+V travel the same road — the Word cleaner, the
 * markdown reader, the image upload, all of it.
 *
 * Reading the clipboard needs the reader's permission and is not
 * offered to a page by every browser. The button refuses honestly in
 * that case rather than doing nothing quietly.
 */

afterEach(() => { vi.restoreAllMocks(); });

/**
 * happy-dom has no `execCommand`, so it is DEFINED here rather than
 * spied on. The editor asks whether the method exists before calling
 * it - a missing one would otherwise be a TypeError in the middle of a
 * keystroke - so a test that could not define it would be asserting
 * the guard instead of the behaviour.
 */
function withExecCommand(result = true) {
  const calls: string[] = [];
  Object.defineProperty(document, 'execCommand', {
    configurable: true,
    value: (command: string) => { calls.push(command); return result; },
  });

  return calls;
}

async function editorWith(html: string) {
  await loadEngine();
  const w = mount(ApexEditor, { props: { media: true }, attachTo: document.body });
  await flushPromises();
  await flushPromises();

  (w.vm as never as { setHtml: (h: string) => void }).setHtml(html);
  await flushPromises();

  return w;
}

const api = (w: { vm: unknown }) => w.vm as {
  run: (n: string, v?: unknown) => boolean; can: (n: string) => boolean;
  getView: () => never; toHtml: () => string;
};

async function selectAll(w: { vm: { $nextTick: () => Promise<void> } }) {
  const PM = await import('prosemirror-state');
  const v = (w as unknown as { vm: { getView: () => never } }).vm.getView() as unknown as {
    state: { doc: never; tr: never }; dispatch: (t: unknown) => void;
  };
  v.dispatch((v.state.tr as unknown as { setSelection: (s: unknown) => unknown })
    .setSelection(new PM.AllSelection(v.state.doc as never)));
  await w.vm.$nextTick();
}

describe('cut and copy', () => {
  it('raise the platform command, so ProseMirror writes the clipboard', async () => {
    /* Not a hand-rolled serialisation: the editor already knows how to
       put itself on the clipboard, and a second implementation would
       be a worse copy of it. */
    const w = await editorWith('<p>some words</p>');
    const calls = withExecCommand();
    await selectAll(w);

    expect(api(w).run('copy')).toBe(true);
    expect(calls).toContain('copy');

    expect(api(w).run('cut')).toBe(true);
    expect(calls).toContain('cut');

    w.unmount();
  });

  it('refuse where the platform has no execCommand at all', async () => {
    /* An embedded webview without it must grey the button, not throw
       on the first press. */
    const w = await editorWith('<p>some words</p>');
    Object.defineProperty(document, 'execCommand', { configurable: true, value: undefined });
    await selectAll(w);

    expect(api(w).can('copy')).toBe(false);

    w.unmount();
  });

  it('refuse when nothing is selected', async () => {
    /* A cut with an empty selection would cut nothing and still claim
       to have worked, which greys the button wrongly. */
    const w = await editorWith('<p>some words</p>');
    const calls = withExecCommand();

    expect(api(w).can('copy')).toBe(false);
    expect(api(w).can('cut')).toBe(false);
    expect(calls).toEqual([]);

    w.unmount();
  });

  it('are available once there IS a selection', async () => {
    const w = await editorWith('<p>some words</p>');
    withExecCommand();
    await selectAll(w);

    expect(api(w).can('copy')).toBe(true);

    w.unmount();
  });
});

describe('paste', () => {
  it('hands the clipboard to the editor as a paste event', async () => {
    /* One road for a button and a Ctrl+V: everything a typed paste
       goes through happens here too. */
    const w = await editorWith('<p>before</p>');
    const view = api(w).getView() as unknown as { dom: HTMLElement };

    let sawPaste = false;
    view.dom.addEventListener('paste', () => { sawPaste = true; }, true);

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        read: async () => [{
          types: ['text/plain'],
          getType: async () => new Blob(['pasted words'], { type: 'text/plain' }),
        }],
      },
    });

    expect(api(w).run('paste')).toBe(true);
    await flushPromises();
    await flushPromises();

    expect(sawPaste, 'no paste event reached the editor').toBe(true);

    w.unmount();
  });

  it('says so when the clipboard refuses', async () => {
    /* Firefox does not offer `clipboard.read()` to a page at all, and
       Chromium asks the reader first - the answer can be no. */
    const w = await editorWith('<p>before</p>');

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { read: async () => { throw new Error('denied'); } },
    });

    api(w).run('paste');
    await flushPromises();
    await flushPromises();

    expect(w.emitted('clipboard-error')?.[0]?.[0]).toMatchObject({ action: 'paste' });

    w.unmount();
  });

  it('is unavailable where there is no clipboard to read', async () => {
    const w = await editorWith('<p>before</p>');

    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });

    expect(api(w).can('paste')).toBe(false);

    w.unmount();
  });
});

describe('the toolbar', () => {
  it('offers all three', async () => {
    const w = mount(ApexEditorToolbar, {
      props: { preset: 'standard', can: {}, active: null, run: () => true },
      attachTo: document.body,
    });

    const labels = w.findAll('button.apex-edbar__btn').map((b) => b.attributes('aria-label') || '');
    for (const name of ['cut', 'copy', 'paste']) {
      expect(labels, `${name} is not on the bar`).toContain(CATALOGUE[name].label);
    }

    w.unmount();
  });
});
