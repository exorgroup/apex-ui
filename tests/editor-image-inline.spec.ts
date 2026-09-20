import { describe, it, expect, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApexEditor from '../src/components/ApexEditor.vue';
import { loadEngine } from '../src/core/editor/engine';

/**
 * A picture inside a line of text — N/039.
 *
 * Reported as "image is placed at beginning of paragraph, cannot place
 * image in middle of a paragraph". A block figure can sit BETWEEN
 * paragraphs and nowhere else, so a float placed before one wraps the
 * whole paragraph: there was no way to start the wrap partway down,
 * and no way to put a picture in the middle of a sentence at all.
 *
 * Two node types rather than one flag, because the difference is
 * structural: `image_inline` lives in a paragraph's content and
 * serialises to a bare `<img>`; `image` is a `<figure>` between
 * blocks and can carry a caption. Choosing a wrapping mode converts
 * between them, which is the only place the two meet.
 */

const ORIGINAL_RECT = Element.prototype.getBoundingClientRect;

afterEach(() => { Element.prototype.getBoundingClientRect = ORIGINAL_RECT; vi.restoreAllMocks(); });

function layout() {
  Element.prototype.getBoundingClientRect = function () {
    return { width: 200, height: 150, top: 0, left: 0, right: 200, bottom: 150,
      x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
  };
}

async function editorWith(html: string) {
  await loadEngine();
  const w = mount(ApexEditor, { props: { media: true }, attachTo: document.body });
  await flushPromises();
  await flushPromises();

  (w.vm as never as { setHtml: (h: string) => void }).setHtml(html);
  await flushPromises();
  await w.vm.$nextTick();

  return w;
}

const api = (w: { vm: unknown }) => w.vm as {
  toHtml: () => string; run: (n: string, v?: unknown) => boolean; getView: () => never;
};

/** Selects the first node of this type, wherever it is. */
async function select(w: { vm: { $nextTick: () => Promise<void> } }, typeName: string) {
  const PM = await import('prosemirror-state');
  const v = api(w as { vm: unknown }).getView() as unknown as {
    state: { doc: never; tr: never }; dispatch: (t: unknown) => void;
  };

  let at = -1;
  (v.state.doc as unknown as { descendants: (f: (n: never, p: number) => void) => void })
    .descendants((node, pos) => {
      if ((node as unknown as { type: { name: string } }).type.name === typeName && at < 0) at = pos;
    });
  expect(at, `no ${typeName} in the document`).toBeGreaterThan(-1);

  v.dispatch((v.state.tr as unknown as { setSelection: (s: unknown) => unknown })
    .setSelection(PM.NodeSelection.create(v.state.doc as never, at)));
  await w.vm.$nextTick();

  return at;
}

describe('a bare <img> in a paragraph', () => {
  it('parses as an inline picture, not a block one', async () => {
    /* It used to become a figure, which is what put every pasted
       picture on its own line. */
    const w = await editorWith('<p>before <img src="/a.webp" alt="a"> after</p>');

    expect(api(w).toHtml()).toBe('<p>before <img src="/a.webp" alt="a"> after</p>');

    w.unmount();
  });

  it('keeps its size and wrapping across a round trip', async () => {
    const w = await editorWith('<p>x <img src="/a.webp" data-width="120px" data-wrap="left"> y</p>');
    const out = api(w).toHtml();

    expect(out).toContain('data-width="120px"');
    expect(out).toContain('data-wrap="left"');

    w.unmount();
  });

  it('while a figure is still a block picture', async () => {
    const w = await editorWith('<figure><img src="/a.webp"><figcaption>cap</figcaption></figure>');

    expect(api(w).toHtml()).toContain('<figure>');
    expect(api(w).toHtml()).toContain('<figcaption>cap</figcaption>');

    w.unmount();
  });
});

describe('choosing a wrapping mode', () => {
  it('turns a block picture into an inline one', async () => {
    layout();
    const w = await editorWith('<figure><img src="/a.webp" alt="a"></figure>');
    await select(w, 'image');

    expect(api(w).run('image_wrap', 'left')).toBe(true);
    await w.vm.$nextTick();

    const out = api(w).toHtml();
    expect(out, 'still a figure').not.toContain('<figure');
    expect(out).toContain('data-wrap="left"');

    w.unmount();
  });

  it('and back again, splitting the paragraph to make room', async () => {
    /* A block node cannot land inside inline content: only a RANGE
       replacement will open the paragraph for it. */
    layout();
    const w = await editorWith('<p>before <img src="/a.webp" alt="a"> after</p>');
    await select(w, 'image_inline');

    expect(api(w).run('image_wrap', 'block')).toBe(true);
    await w.vm.$nextTick();

    const out = api(w).toHtml();
    expect(out).toContain('<figure>');
    expect(out).toContain('before');
    expect(out).toContain('after');

    w.unmount();
  });

  it('only changes the attribute when the type is already right', async () => {
    layout();
    const w = await editorWith('<p>x <img src="/a.webp" data-wrap="left"> y</p>');
    await select(w, 'image_inline');

    api(w).run('image_wrap', 'right');
    await w.vm.$nextTick();

    const out = api(w).toHtml();
    expect(out).toContain('data-wrap="right"');
    expect(out).toContain('<p>x ');

    w.unmount();
  });

  it('refuses when nothing is selected', async () => {
    layout();
    const w = await editorWith('<p>just words</p>');

    expect(api(w).run('image_wrap', 'left')).toBe(false);

    w.unmount();
  });
});

describe('the picture the editor inserts', () => {
  it('is inline when the caret is in a line of text', async () => {
    /* The reported need: a caret in the middle of a sentence means
       "here", and a figure cannot be here - it would split the
       sentence in two and land between the halves. */
    const onUpload = vi.fn();
    await loadEngine();
    const w = mount(ApexEditor, { props: { media: true, onUpload }, attachTo: document.body });
    await flushPromises();
    await flushPromises();

    const vm = w.vm as never as { setHtml: (h: string) => void; toHtml: () => string; getView: () => never };
    vm.setHtml('<p>before after</p>');
    await flushPromises();

    const PM = await import('prosemirror-state');
    const v = vm.getView() as unknown as { state: { doc: never; tr: never }; dispatch: (t: unknown) => void };
    v.dispatch((v.state.tr as unknown as { setSelection: (s: unknown) => unknown })
      .setSelection(PM.TextSelection.create(v.state.doc as never, 8)));
    await w.vm.$nextTick();

    /* Drive the upload the way the picker does. */
    const input = w.find('input[type="file"]');
    const file = new File(['x'], 'photo.png', { type: 'image/png' });
    Object.defineProperty(input.element, 'files', { value: [file], configurable: true });
    await input.trigger('change');

    const request = onUpload.mock.calls[0][0] as { resolve: (r: { src: string }) => void };
    request.resolve({ src: '/uploaded.webp' });
    await flushPromises();

    /* Position 8 is between the space and "after", so the picture
       lands there exactly - no space is invented around it. */
    expect(vm.toHtml()).toBe('<p>before <img src="/uploaded.webp">after</p>');

    w.unmount();
  });

  it('is a block figure when the paragraph is empty', async () => {
    /* A picture on its own line is a figure, which is what can carry
       a caption. */
    const onUpload = vi.fn();
    await loadEngine();
    const w = mount(ApexEditor, { props: { media: true, onUpload }, attachTo: document.body });
    await flushPromises();
    await flushPromises();

    const input = w.find('input[type="file"]');
    const file = new File(['x'], 'photo.png', { type: 'image/png' });
    Object.defineProperty(input.element, 'files', { value: [file], configurable: true });
    await input.trigger('change');

    const request = onUpload.mock.calls[0][0] as { resolve: (r: { src: string }) => void };
    request.resolve({ src: '/uploaded.webp' });
    await flushPromises();

    expect((w.vm as never as { toHtml: () => string }).toHtml()).toContain('<figure>');

    w.unmount();
  });
});
