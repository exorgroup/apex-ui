import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApexEditor from '../src/components/ApexEditor.vue';
import { loadEngine } from '../src/core/editor/engine';

/**
 * Dragging a picture MOVES it — N/036c.
 *
 * Reported with a screenshot: "dragged the image to the new location, a
 * clone of it was generated with the original size instead of moved".
 * Both halves came from one cause.
 *
 * Dragging an `<img>` whose `src` is a real URL makes Chromium put the
 * image on the dataTransfer as a FILE, alongside the HTML. This
 * editor's drop handler exists to catch a picture dragged in from the
 * desktop, so it saw a file, uploaded it, and inserted a second copy —
 * at its natural size, because a fresh upload knows nothing about the
 * width the author had set — while the original stayed where it was,
 * since returning `true` told ProseMirror not to perform its move.
 *
 * A data URL hid it: the harness never offered a file, so the same
 * drag moved the node correctly there for weeks.
 *
 * `view.dragging` is set by ProseMirror on `dragstart` and only for a
 * drag out of THIS editor, which is exactly the question worth asking.
 */

const DROP_AT = { clientX: 10, clientY: 10 };

async function editorWith(html: string, onUpload = vi.fn()) {
  await loadEngine();
  const w = mount(ApexEditor, { props: { media: true, onUpload }, attachTo: document.body });
  await flushPromises();
  await flushPromises();

  (w.vm as never as { setHtml: (h: string) => void }).setHtml(html);
  await flushPromises();

  return { w, onUpload };
}

const view = (w: { vm: unknown }) => (w.vm as { getView: () => never }).getView() as unknown as {
  someProp: <T>(n: string, f: (prop: never) => T) => T | undefined;
  dragging: unknown;
  posAtCoords: (c: { left: number; top: number }) => { pos: number } | null;
  state: { selection: { from: number } };
};

/** A drop carrying a file, as a picture dragged from anywhere does. */
function dropEvent(type = 'image/png', name = 'photo.png') {
  const data = new DataTransfer();
  data.items.add(new File(['x'], name, { type }));

  return { ...DROP_AT, dataTransfer: data, preventDefault: () => {} } as unknown as DragEvent;
}

/** Calls the editor's own drop handler, as ProseMirror would. */
function drop(w: { vm: unknown }, event = dropEvent()) {
  const v = view(w);
  const handler = v.someProp('handleDrop', (f) => f) as unknown as
    ((view: unknown, event: DragEvent, slice: unknown, moved: boolean) => boolean) | undefined;
  expect(handler, 'the editor has no drop handler at all').toBeTypeOf('function');

  return handler!(v, event, null, false);
}

describe('a picture dragged within the editor', () => {
  it('is left to ProseMirror, which moves the node it already has', async () => {
    const { w, onUpload } = await editorWith('<figure data-width="200px"><img src="/a.webp"></figure><p>x</p>');
    const v = view(w);

    /* What ProseMirror sets on `dragstart` for a drag that began here. */
    v.dragging = { slice: null, move: true };

    expect(drop(w), 'the drop was claimed as an upload').toBe(false);
    await flushPromises();

    expect(onUpload, 'the picture was fetched and uploaded again').not.toHaveBeenCalled();

    w.unmount();
  });

  it('while a picture dragged in from OUTSIDE is still uploaded', async () => {
    /* The reason the handler exists. Nothing is dragging, so the file
       is a new picture arriving from the desktop. */
    const { w, onUpload } = await editorWith('<p>x</p>');
    view(w).dragging = null;

    expect(drop(w)).toBe(true);
    await flushPromises();

    expect(onUpload).toHaveBeenCalledTimes(1);

    w.unmount();
  });

  it('and a file that is not a picture is left alone', async () => {
    /* The MIME type decides, not the extension - the same check the
       paste path uses. A dropped PDF belongs to the page, not to the
       editor's image upload. */
    const { w, onUpload } = await editorWith('<p>x</p>');
    view(w).dragging = null;

    expect(drop(w, dropEvent('application/pdf', 'notes.pdf'))).toBe(false);
    await flushPromises();

    expect(onUpload).not.toHaveBeenCalled();

    w.unmount();
  });
});
