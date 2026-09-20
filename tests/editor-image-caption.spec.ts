import { describe, it, expect, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApexEditor from '../src/components/ApexEditor.vue';
import { loadEngine } from '../src/core/editor/engine';

/**
 * The caption is an ATTRIBUTE, and the image is an atom — N/033.
 *
 * It was `content: 'inline*'`, which made the figure a textblock, and a
 * textblock is somewhere a caret goes. Clicking the picture put the
 * caret in its caption instead of selecting the node, so the alignment
 * buttons acted on whatever contained it — in a table cell, on the
 * CELL, which has an alignment of its own, so nothing appeared to
 * happen. Reported as "the caption is not allowing me to select the
 * image and align it in the table cell".
 *
 * As an attribute the caption is written in the image's own menu, and
 * the document can no longer be entered through it. Three specs went
 * with the change — the Enter/Down escape out of a caption, the plugin
 * that marked the figure the caret was in, and the "Add a caption…"
 * prompt — because all three existed to serve an editable caption.
 *
 * What must NOT change: a document written before this keeps its
 * caption.
 */

const ORIGINAL_RECT = Element.prototype.getBoundingClientRect;

afterEach(() => { Element.prototype.getBoundingClientRect = ORIGINAL_RECT; vi.restoreAllMocks(); });

function layout() {
  Element.prototype.getBoundingClientRect = function () {
    return { width: 400, height: 300, top: 0, left: 0, right: 400, bottom: 300,
      x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
  };
}

async function editorWith(html: string) {
  await loadEngine();
  const w = mount(ApexEditor, { props: { media: true, tables: true }, attachTo: document.body });
  await flushPromises();
  await flushPromises();

  (w.vm as never as { setHtml: (h: string) => void }).setHtml(html);
  await flushPromises();
  await w.vm.$nextTick();

  return w;
}

const api = (w: { vm: unknown }) => w.vm as {
  toHtml: () => string; getJSON: () => never; getView: () => never; run: (n: string) => boolean;
};

/** The image node's attributes, read from the document. */
function imageAttrs(w: { vm: unknown }): Record<string, unknown> | null {
  let found: Record<string, unknown> | null = null;
  const view = api(w).getView() as unknown as {
    state: { doc: { descendants: (f: (n: { type: { name: string }; attrs: Record<string, unknown> }) => void) => void } };
  };
  view.state.doc.descendants((node) => { if (node.type.name === 'image' && !found) found = node.attrs; });

  return found;
}

const CAPTIONED = '<figure><img src="/a.webp" alt="a"><figcaption>An old caption</figcaption></figure>';

describe('a caption written before this change', () => {
  it('is read off the figcaption and kept', async () => {
    const w = await editorWith(CAPTIONED);

    expect(imageAttrs(w)?.caption).toBe('An old caption');

    w.unmount();
  });

  it('is written back out as a figcaption', async () => {
    /* The stored shape does not change, so nothing downstream - the
       sanitiser, the public page, a feed - has to learn a new one. */
    const w = await editorWith(CAPTIONED);

    expect(api(w).toHtml()).toContain('<figcaption>An old caption</figcaption>');

    w.unmount();
  });

  it('is shown under the picture', async () => {
    layout();
    const w = await editorWith(CAPTIONED);

    expect(w.find('.apex-ed__host figcaption').text()).toBe('An old caption');

    w.unmount();
  });
});

describe('an image without one', () => {
  it('serialises no figcaption at all', async () => {
    /* An empty one is a gap under every picture, and an uncaptioned
       image is a different thing from one with an empty caption. */
    const w = await editorWith('<figure><img src="/a.webp" alt="a"></figure>');

    expect(api(w).toHtml()).not.toContain('figcaption');

    w.unmount();
  });

  it('hides the element rather than drawing an empty line', async () => {
    layout();
    const w = await editorWith('<figure><img src="/a.webp" alt="a"></figure>');

    expect((w.find('.apex-ed__host figcaption').element as HTMLElement).hidden).toBe(true);

    w.unmount();
  });
});

describe('the caret', () => {
  it('cannot be put inside the picture, because it is an atom', async () => {
    /* The whole point. A text position inside the figure no longer
       exists, so a click on it can only select it. */
    layout();
    const w = await editorWith(`<p>text</p>${CAPTIONED}`);
    const PM = await import('prosemirror-state');
    const view = api(w).getView() as unknown as {
      state: { doc: never; tr: never; selection: { $head: { parent: { type: { name: string } } } } };
      dispatch: (t: unknown) => void;
    };

    /* `near` is what a click resolves to: asked for the image's own
       position - `<p>text</p>` is six wide, so the figure opens at 6 -
       ProseMirror answers with the nearest selection it can have, and
       for an atom that is a selection OF it rather than a caret in it. */
    const near = PM.Selection.near((view.state.doc as unknown as {
      resolve: (p: number) => never }).resolve(6));
    view.dispatch((view.state.tr as unknown as { setSelection: (s: unknown) => unknown })
      .setSelection(near));
    await w.vm.$nextTick();

    expect(view.state.selection.$head.parent.type.name).not.toBe('image');

    w.unmount();
  });

  it('and the caption is not editable content', async () => {
    layout();
    const w = await editorWith(CAPTIONED);

    /* The PROPERTY, not the attribute: happy-dom does not reflect
       `contentEditable` into an attribute, and the property is what the
       browser acts on either way. */
    expect((w.find('.apex-ed__host figcaption').element as HTMLElement).contentEditable).toBe('false');

    w.unmount();
  });
});
