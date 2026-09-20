import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApexEditor from '../src/components/ApexEditor.vue';
import { loadEngine } from '../src/core/editor/engine';
import { uploadPlaceholderPlugin } from '../src/core/editor/media';

/**
 * The picture actually arrives — N/021.
 *
 * Reported from the blog screen as "tried to insert image and can see
 * nothing except that whitish box". The upload SUCCEEDED: the file was on
 * disk and served 200 over HTTP. What failed was the swap.
 *
 * `ApexEditor` reached for the placeholder plugin's key as `plugin.key`.
 * In ProseMirror that is the key's NAME — a string — and not the
 * `PluginKey`. `setMeta` takes either (it indexes by the same string), so
 * ADDING a placeholder worked and looked right; `getState` is not a
 * method on a string, so removing one threw inside the resolve callback.
 * The placeholder stayed for ever and no image was ever inserted, on
 * every path: the toolbar button, a paste, a drop, and the data-URL
 * default with no handler at all.
 *
 * The key now travels with the plugin, and the swap goes through
 * `placeholderPos()` — the helper written beside the plugin for exactly
 * this, and never wired up.
 */

async function editorWithUpload() {
  await loadEngine();

  let settle: { resolve: (r: { src: string }) => void; reject: (e?: unknown) => void } | null = null;
  const onUpload = vi.fn((req: never) => {
    settle = req as unknown as typeof settle;
  });

  const w = mount(ApexEditor, { props: { media: true, onUpload }, attachTo: document.body });
  await flushPromises();
  await flushPromises();

  return { w, onUpload, settled: () => settle! };
}

async function pick(w: Awaited<ReturnType<typeof editorWithUpload>>['w']) {
  const input = w.find('input[type="file"]');
  const file = new File(['x'], 'photo.png', { type: 'image/png' });
  Object.defineProperty(input.element, 'files', { value: [file], configurable: true });
  await input.trigger('change');
}

const html = (w: { vm: unknown }) => (w.vm as { toHtml: () => string }).toHtml();

describe('an upload that comes back', () => {
  it('puts the image in the document', async () => {
    const { w, settled } = await editorWithUpload();
    await pick(w);

    settled().resolve({ src: '/storage/images/blog/x.webp' });
    await flushPromises();

    expect(html(w)).toContain('<img src="/storage/images/blog/x.webp"');

    w.unmount();
  });

  it('takes the placeholder away with it', async () => {
    /* The reported symptom, asserted on its own: the grey box has to go
       whether or not anything replaced it. */
    const { w, settled } = await editorWithUpload();
    await pick(w);

    expect(w.find('.apex-ed__uploading').exists(), 'no placeholder while uploading').toBe(true);

    settled().resolve({ src: '/storage/images/blog/x.webp' });
    await flushPromises();
    await w.vm.$nextTick();

    expect(w.find('.apex-ed__uploading').exists()).toBe(false);

    w.unmount();
  });

  it('invents NO description, so the field is blank for the author', async () => {
    /* It used to take the file's own name, which reads as a
       description and is not one: an upload arrived carrying
       `716REunS42L._AC_UL450_SY400`, and an author had to notice that
       and clear it before writing anything - while a reader's software
       would have read it aloud. N/034c. */
    const { w, settled } = await editorWithUpload();
    await pick(w);

    settled().resolve({ src: '/x.webp' });
    await flushPromises();

    expect(html(w)).toContain('<img src="/x.webp">');
    expect(html(w)).not.toContain('alt=');

    w.unmount();
  });

  it('keeps a description the application DID supply', async () => {
    /* The seam still works both ways: an application that knows what
       the picture is - from a media library, say - can say so. */
    const { w, settled } = await editorWithUpload();
    await pick(w);

    settled().resolve({ src: '/x.webp', alt: 'A red can of cola' } as never);
    await flushPromises();

    expect(html(w)).toContain('alt="A red can of cola"');

    w.unmount();
  });
});

describe('an upload that fails', () => {
  it('removes the placeholder and inserts nothing', async () => {
    const { w, settled } = await editorWithUpload();
    await pick(w);

    settled().reject(new Error('413'));
    await flushPromises();
    await w.vm.$nextTick();

    expect(w.find('.apex-ed__uploading').exists()).toBe(false);
    expect(html(w)).not.toContain('<img');

    w.unmount();
  });

  it('says so, so the application can tell the author', async () => {
    const { w, settled } = await editorWithUpload();
    await pick(w);

    const reason = new Error('413');
    settled().reject(reason);
    await flushPromises();

    expect(w.emitted('upload-error')?.[0]?.[0]).toMatchObject({ reason });

    w.unmount();
  });
});

describe('an upload whose place in the document has gone', () => {
  it('drops the result rather than inserting it somewhere arbitrary', async () => {
    /* The author deleted the paragraph the placeholder sat in while the
       upload ran. The position the file was dropped at no longer means
       anything, and a picture appearing in the middle of an unrelated
       sentence is worse than one that never arrives. `placeholderPos`
       returns null and the caller is expected to honour it. */
    const { w, settled } = await editorWithUpload();
    await pick(w);

    (w.vm as never as { setHtml: (h: string) => void }).setHtml('<p>a different document</p>');
    await flushPromises();

    settled().resolve({ src: '/storage/images/blog/x.webp' });
    await flushPromises();

    expect(html(w)).not.toContain('<img');
    expect(html(w)).toContain('a different document');

    w.unmount();
  });
});

describe('the placeholder plugin', () => {
  it('hands back a usable key, not the name of one', async () => {
    /* The seam the bug lived in. A string has `.length` and no
       `getState`, and the failure was invisible because the ADD path
       tolerates both. */
    await loadEngine();
    const PM = await import('prosemirror-state');
    const PMView = await import('prosemirror-view');

    const plugin = uploadPlaceholderPlugin({ state: PM, view: PMView });

    expect(typeof plugin.uploadKey).not.toBe('string');
    expect(typeof plugin.uploadKey.getState).toBe('function');
  });
});
