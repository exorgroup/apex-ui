import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApexEditor from '../src/components/ApexEditor.vue';
import { loadEngine } from '../src/core/editor/engine';

/**
 * Loading a record is not an edit.
 *
 * `setHtml()` replaced the document with a transaction, and `dispatchTransaction`
 * emits `change` for any transaction where `docChanged` is true — so simply OPENING
 * a record fired `change` before the user had touched anything. A host that wires
 * `@change` to its form (the documented way to wire it) therefore had a dialog
 * announcing "Unsaved changes" the moment it appeared.
 *
 * Found in APEX TBX on the blog post dialog (Phase Z, screen 1 of 14). It was worse
 * there than it looks: the stored HTML came from Quill with `&nbsp;` between every
 * word, so `cleanPastedHtml` normalised it on the way in and the re-emitted HTML was
 * genuinely different from what was stored. Even a value-comparing host would have
 * called it dirty.
 *
 * `setHtml` already sets `addToHistory: false`, on the reasoning that loading a
 * record is not an undoable edit. This is the same reasoning one step on: it is not
 * a reportable one either.
 *
 * EVERY "does not emit" case below also asserts the document actually arrived. The
 * first draft of this spec did not, and two of its cases passed while `setHtml` was
 * returning early against an editor that had never mounted — proving nothing, in the
 * exact shape X/017 recorded. A test that an event did NOT fire has to show that the
 * thing which would have fired it did happen.
 */
async function editor() {
  await loadEngine();
  const w = mount(ApexEditor, { attachTo: document.body });
  await flushPromises();
  await flushPromises();
  return w;
}

const api = (w: { vm: unknown }) => w.vm as {
  setHtml: (h: string) => boolean;
  run: (n: string) => boolean;
  toHtml: () => string;
};

describe('ApexEditor — setHtml is a load, not a change', () => {
  it('does not emit change when a record is loaded', async () => {
    const w = await editor();
    expect(api(w).setHtml('<p>Stored copy</p>')).toBe(true);
    await flushPromises();

    expect(api(w).toHtml()).toContain('Stored copy');   // it really loaded
    expect(w.emitted('change')).toBeUndefined();        // and said nothing
  });

  it('normalising HTML on the way in does not report a change either', async () => {
    // The Quill shape that made this visible: a non-breaking space per word.
    const w = await editor();
    expect(api(w).setHtml('<p>one&nbsp;two&nbsp;three</p>')).toBe(true);
    await flushPromises();

    expect(api(w).toHtml()).toContain('two');
    expect(w.emitted('change')).toBeUndefined();
  });

  it('a second load does not emit either', async () => {
    const w = await editor();
    api(w).setHtml('<p>first</p>');
    await flushPromises();
    api(w).setHtml('<p>second</p>');
    await flushPromises();

    expect(api(w).toHtml()).toContain('second');
    expect(w.emitted('change')).toBeUndefined();
  });

  it('a REAL edit after a load still emits change', async () => {
    const w = await editor();
    api(w).setHtml('<p>Stored copy</p>');
    await flushPromises();
    expect(w.emitted('change')).toBeUndefined();

    // Wrapping the block in a quote changes the document the ordinary way.
    expect(api(w).run('blockquote')).toBe(true);
    await flushPromises();

    expect(w.emitted('change')).toHaveLength(1);
  });
});

/**
 * But a load still CHANGES what the editor holds, and the placeholder has to know.
 * Skipping `emitDoc` on a load also skipped the empty check inside it, so a reopened
 * blog post drew "Write the post…" over its own text (Phase AF, the blog editor).
 */
describe('ApexEditor — the placeholder after a load', () => {
  it('goes away when a record with text is loaded', async () => {
    const w = await editor();
    await w.setProps({ placeholder: 'Write the post…' });
    expect(w.find('.apex-ed__placeholder').exists()).toBe(true);   // empty to start

    api(w).setHtml('<p>Stored copy</p>');
    await flushPromises();

    expect(api(w).toHtml()).toContain('Stored copy');
    expect(w.find('.apex-ed__placeholder').exists()).toBe(false);
    expect(w.emitted('change')).toBeUndefined();                    // still not an edit
  });

  it('comes back when an empty record is loaded after a full one', async () => {
    const w = await editor();
    await w.setProps({ placeholder: 'Write the post…' });
    api(w).setHtml('<p>first</p>');
    await flushPromises();
    api(w).setHtml('');
    await flushPromises();

    expect(w.find('.apex-ed__placeholder').exists()).toBe(true);
  });
});
