import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApexEditor from '../src/components/ApexEditor.vue';
import { loadEngine } from '../src/core/editor/engine';
import { cleanPastedHtml } from '../src/core/editor/paste';

/**
 * A blank line the author typed stays — N/040.
 *
 * Reported with two screenshots: "entered some paragraph spacing by pressing
 * enter twice on the keyboard and saved … the empty space was stripped".
 *
 * Nothing in the save was at fault. Loading a record cleans its HTML through
 * the same path a paste takes, and that path removes `<p></p>` on purpose:
 * Word emits one between every block, and keeping them doubles the length of a
 * pasted document. The rule is right for a paste and wrong for a record, where
 * an empty paragraph is spacing somebody chose — so the cleaner is now asked
 * which of the two it is doing.
 *
 * ProseMirror's own parser was never the problem: it preserves empty
 * paragraphs, which is why the loss only showed up through the editor.
 */

async function editor() {
  await loadEngine();
  const w = mount(ApexEditor, { attachTo: document.body });
  await flushPromises();
  await flushPromises();

  return w;
}

const api = (w: { vm: unknown }) => w.vm as { setHtml: (h: string) => void; toHtml: () => string };

describe('loading a record', () => {
  it('keeps an empty paragraph between two paragraphs', async () => {
    const w = await editor();
    api(w).setHtml('<p>one</p><p></p><p>two</p>');
    await flushPromises();

    expect(api(w).toHtml()).toBe('<p>one</p><p></p><p>two</p>');

    w.unmount();
  });

  it('keeps several of them, so two blank lines do not become one', async () => {
    const w = await editor();
    api(w).setHtml('<p>one</p><p></p><p></p><p>two</p>');
    await flushPromises();

    expect(api(w).toHtml()).toBe('<p>one</p><p></p><p></p><p>two</p>');

    w.unmount();
  });

  it('and one written as <p><br></p>, which is what some editors store', async () => {
    const w = await editor();
    api(w).setHtml('<p>one</p><p><br></p><p>two</p>');
    await flushPromises();

    expect(api(w).toHtml()).toContain('<br>');

    w.unmount();
  });

  it('survives a second round trip, as reopening a record twice does', async () => {
    const w = await editor();
    api(w).setHtml('<p>one</p><p></p><p>two</p>');
    await flushPromises();
    api(w).setHtml(api(w).toHtml());
    await flushPromises();

    expect(api(w).toHtml()).toBe('<p>one</p><p></p><p>two</p>');

    w.unmount();
  });

  it('still drops the rest of what a paste would drop', async () => {
    /* The option is about blank lines only: a handler attribute in stored HTML
       is no more welcome than one on the clipboard. */
    const w = await editor();
    api(w).setHtml('<p onclick="alert(1)">one</p><p></p><p>two</p>');
    await flushPromises();

    const out = api(w).toHtml();
    expect(out).not.toContain('onclick');
    expect(out, 'the blank line went with it').toBe('<p>one</p><p></p><p>two</p>');

    w.unmount();
  });
});

describe('the cleaner itself', () => {
  it('drops an empty paragraph by default, as a paste needs', async () => {
    expect(cleanPastedHtml('<p>one</p><p></p><p>two</p>')).toBe('<p>one</p><p>two</p>');
  });

  it('keeps one when asked', async () => {
    expect(cleanPastedHtml('<p>one</p><p></p><p>two</p>', { keepEmptyParagraphs: true }))
      .toBe('<p>one</p><p></p><p>two</p>');
  });

  it('never dropped a paragraph holding a picture', async () => {
    /* The old rule already made this exception; keeping the test so the new
       option cannot quietly take it away. */
    expect(cleanPastedHtml('<p><img src="/a.webp"></p>')).toContain('<img');
  });
});
