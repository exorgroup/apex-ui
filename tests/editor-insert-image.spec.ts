import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApexEditor from '../src/components/ApexEditor.vue';
import { loadEngine } from '../src/core/editor/engine';

/**
 * The toolbar's image button inserts an image — N/019.
 *
 * It was in the CATALOGUE and in the `standard` toolbar preset, and in no
 * command registry at all: the button drew, reported itself available,
 * and did nothing when pressed. Reported from the blog screen, where it
 * is the only way to put a picture in an article that is not a drag or a
 * paste.
 *
 * It cannot be an ordinary command, for the reason `ApexHTMLEditor`
 * records beside its own image dialog: a command that needs INPUT cannot
 * dispatch when it is named. So this one opens a file picker, and the
 * picker feeds the same `uploadFile()` path a paste and a drop already
 * take — one implementation, so all three get the placeholder, the
 * application's URL, and the removal on failure.
 */

async function mountEditor(props: Record<string, unknown> = {}) {
  /* Primed before mounting, as `editor-mount.spec.ts` explains: the
     component awaits ten dynamic imports and flushPromises alone does not
     give them time. */
  await loadEngine();
  const wrapper = mount(ApexEditor, { props: { media: true, ...props }, attachTo: document.body });
  await flushPromises();
  await flushPromises();

  return wrapper;
}

describe('the image button', () => {
  it('is a command the editor knows, not only a catalogue entry', async () => {
    const w = await mountEditor();

    expect((w.vm as never as { commands: () => string[] }).commands())
      .toContain('insert_image');

    w.unmount();
  });

  it('reports itself available, so the toolbar enables it', async () => {
    const w = await mountEditor();

    expect((w.vm as never as { can: (n: string) => boolean }).can('insert_image')).toBe(true);

    w.unmount();
  });

  it('opens the file picker when it is run', async () => {
    const w = await mountEditor();
    const input = w.find('input[type="file"]');

    expect(input.exists(), 'there is no picker to open').toBe(true);

    const click = vi.spyOn(input.element as HTMLInputElement, 'click').mockImplementation(() => {});

    (w.vm as never as { run: (n: string) => boolean }).run('insert_image');

    expect(click).toHaveBeenCalled();

    w.unmount();
  });

  it('does not open it merely because the toolbar asked whether it could', async () => {
    /* `availability` runs EVERY registered command with no dispatch on
       every selection change. A picker that opened on that question
       would throw a file dialog in the author's face as they typed. */
    const w = await mountEditor();
    const input = w.find('input[type="file"]');
    const click = vi.spyOn(input.element as HTMLInputElement, 'click').mockImplementation(() => {});

    (w.vm as never as { can: (n: string) => boolean }).can('insert_image');

    expect(click).not.toHaveBeenCalled();

    w.unmount();
  });

  it('hands the chosen file to the application, like a paste or a drop', async () => {
    /* The seam: the editor uploads nothing itself. What it must do is
       ASK, with the same request shape every other path uses. */
    const onUpload = vi.fn();
    const w = await mountEditor({ onUpload });

    const input = w.find('input[type="file"]');
    const file = new File(['x'], 'photo.png', { type: 'image/png' });

    Object.defineProperty(input.element, 'files', { value: [file], configurable: true });
    await input.trigger('change');

    expect(onUpload).toHaveBeenCalledTimes(1);

    const request = onUpload.mock.calls[0][0];
    expect(request.file).toBe(file);
    expect(typeof request.resolve).toBe('function');
    expect(typeof request.reject).toBe('function');

    w.unmount();
  });

  it('ignores a file that is not an image', async () => {
    /* The MIME type decides, not the extension — `isImageFile`, the same
       check the drop handler uses. */
    const onUpload = vi.fn();
    const w = await mountEditor({ onUpload });

    const input = w.find('input[type="file"]');
    const file = new File(['x'], 'notes.pdf', { type: 'application/pdf' });

    Object.defineProperty(input.element, 'files', { value: [file], configurable: true });
    await input.trigger('change');

    expect(onUpload).not.toHaveBeenCalled();

    w.unmount();
  });

  it('clears the input, so the same picture can be chosen twice', async () => {
    /* Without this a second attempt at the same file fires no `change`
       and nothing happens — the kind of failure a user reads as "the
       button is broken again". */
    const onUpload = vi.fn();
    const w = await mountEditor({ onUpload });

    const input = w.find('input[type="file"]');
    const file = new File(['x'], 'photo.png', { type: 'image/png' });

    /* The ASSIGNMENT is what has to be observed, not the value read back:
       a file input in happy-dom reports '' whether or not anything
       cleared it, so reading it proves nothing and a mutation that
       deleted the line survived this test. */
    let cleared = false;
    Object.defineProperty(input.element, 'value', {
      configurable: true,
      get: () => 'photo.png',
      set: (v: string) => { cleared = v === ''; },
    });

    Object.defineProperty(input.element, 'files', { value: [file], configurable: true });
    await input.trigger('change');

    expect(cleared, 'the picker was left holding the file').toBe(true);

    w.unmount();
  });

  it('is not there at all without `media`', async () => {
    /* No image node in the schema means no image to insert, and a button
       that cannot work should not be offered. */
    const w = await mountEditor({ media: false });

    expect(w.find('input[type="file"]').exists()).toBe(false);
    expect((w.vm as never as { can: (n: string) => boolean }).can('insert_image')).toBe(false);

    w.unmount();
  });
});
