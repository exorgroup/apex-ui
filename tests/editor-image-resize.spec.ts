import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApexEditor from '../src/components/ApexEditor.vue';
import { loadEngine } from '../src/core/editor/engine';
import { dragWidth, MIN_IMAGE_WIDTH } from '../src/core/editor/media';

/**
 * Resizing an image by dragging a corner — N/022.
 *
 * Asked for with a screenshot of a Coca-Cola can filling the column:
 * "need to be able to resize it - have drag handles".
 *
 * The width is a RATIO of the column, which the schema decided long
 * before this: a document read at 400px and at 1200px should show the
 * same proportion, where a pixel width is either tiny or overflowing. So
 * every handle does the same thing — set a percentage — and the height
 * follows the aspect ratio for free. That is also why there are no edge
 * handles: they would promise a free-form resize the model cannot store.
 *
 * happy-dom does no layout, so the DRAG is asserted through the geometry
 * the node view reads (`getBoundingClientRect`, mocked) and the attribute
 * it writes, not through pixels on a screen. The arithmetic itself is a
 * pure function, tested as one.
 */

const ORIGINAL_RECT = Element.prototype.getBoundingClientRect;

afterEach(() => { Element.prototype.getBoundingClientRect = ORIGINAL_RECT; vi.restoreAllMocks(); });

/** A column 800px wide holding an image currently drawn at 800px. */
function layout(imageWidth = 800, columnWidth = 800) {
  Element.prototype.getBoundingClientRect = function () {
    const el = this as HTMLElement;
    const width = el.tagName === 'IMG' ? imageWidth : columnWidth;

    return { width, height: 200, top: 0, left: 0, right: width, bottom: 200,
      x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
  };
}

const FIGURE = '<figure><img src="/a.webp" alt="a"><figcaption></figcaption></figure>';

/* Content goes in through `setHtml` and never through a prop: the
   document is ProseMirror JSON, and the bridge only exists once the view
   does - which is why the other editor specs prime the engine and flush
   twice before touching it. */
async function editorWith(html: string, props: Record<string, unknown> = {}) {
  await loadEngine();
  const w = mount(ApexEditor, { props: { media: true, ...props }, attachTo: document.body });
  await flushPromises();
  await flushPromises();

  (w.vm as never as { setHtml: (h: string) => void }).setHtml(html);
  await flushPromises();
  await w.vm.$nextTick();

  return w;
}

const editorWithImage = () => editorWith(FIGURE);

const figure = (w: { find: (s: string) => { element: Element } }) =>
  w.find('.apex-ed__host figure').element as HTMLElement;

/** A drag from x=`from` to x=`to` on one corner. */
async function dragCorner(w: never, corner: string, from: number, to: number) {
  const wrapper = w as unknown as { find: (s: string) => { element: Element } };
  const handle = wrapper.find(`.apex-ed__img-handle[data-corner="${corner}"]`).element;

  handle.dispatchEvent(new MouseEvent('mousedown', { clientX: from, bubbles: true, cancelable: true }));
  window.dispatchEvent(new MouseEvent('mousemove', { clientX: to }));
  window.dispatchEvent(new MouseEvent('mouseup', { clientX: to }));
  await (w as unknown as { vm: { $nextTick: () => Promise<void> } }).vm.$nextTick();
}

describe('the width a drag produces', () => {
  it('is a whole number of PIXELS', () => {
    /* Pixels since N/034: an author asked to type a width expects the
       number they see in every other editor, and the drag has to agree
       with the box they type it into. */
    expect(dragWidth(800, -400, 800)).toBe(400);
    expect(dragWidth(800, -200, 800)).toBe(600);
    expect(dragWidth(400, 0, 800)).toBe(400);
  });

  it('never exceeds the column', () => {
    /* `max-inline-size` would overrule a wider value anyway, leaving a
       stored number that does not match what is on screen. */
    expect(dragWidth(800, 900, 800)).toBe(800);
  });

  it('never shrinks to nothing', () => {
    /* A picture dragged to zero cannot be grabbed again. */
    expect(dragWidth(800, -5000, 800)).toBe(MIN_IMAGE_WIDTH);
    expect(MIN_IMAGE_WIDTH).toBeGreaterThan(0);
  });

  it('keeps the drag when the column cannot be measured', () => {
    /* A detached or `display:none` editor measures zero, and clamping
       to it would collapse the picture. With no column there is simply
       nothing to clamp to, so the pointer's own answer stands. */
    expect(dragWidth(800, -100, 0), 'no column').toBe(700);
    expect(dragWidth(800, -100, Number.NaN), 'an unmeasured column').toBe(700);
  });

  it('keeps the picture as it was when the MOVEMENT cannot be measured', () => {
    /* A pointer event without coordinates gives NaN, and falling
       through to the minimum would shrink an image to a thumbnail
       because of one bad event. */
    expect(dragWidth(800, Number.NaN, 1200)).toBe(800);
  });
});

describe('the handles', () => {
  it('are four corners on the image', async () => {
    layout();
    const w = await editorWithImage();

    const corners = w.findAll('.apex-ed__img-handle')
      .map((h) => h.attributes('data-corner'));

    expect(corners).toEqual(['nw', 'ne', 'sw', 'se']);

    w.unmount();
  });

  it('are hidden from assistive technology, being a pointer affordance', async () => {
    /* The width commands are the keyboard path; four unlabelled grips
       announced around every picture would be noise. */
    layout();
    const w = await editorWithImage();

    expect(w.find('.apex-ed__img-handles').attributes('aria-hidden')).toBe('true');

    w.unmount();
  });

  it('do not disturb the caption, which is real document content', async () => {
    layout();
    const w = await editorWithImage();

    expect(w.find('.apex-ed__host figure figcaption').exists()).toBe(true);

    w.unmount();
  });
});

describe('clicking the picture', () => {
  it('selects it, which is what shows the grips', async () => {
    /* Reported after the handles shipped: "clicked it but no handles".
       They were in the DOM, correct, and invisible - `selectNode` is what
       reveals them, and ProseMirror does not select a node whose content
       is a caption when the click lands on its image. For a leaf node it
       would; this one is not a leaf. */
    layout();
    /* A paragraph FIRST, and the caret left in it: since the image
       became an atom (N/033) a document that ends with one opens with
       it selected, because there is no text position after it for the
       caret to take. */
    const w = await editorWith(`<p>text</p>${FIGURE}`);
    const PM = await import('prosemirror-state');
    const v = (w.vm as never as { getView: () => never }).getView() as unknown as {
      state: { doc: never; tr: never }; dispatch: (t: unknown) => void;
    };
    v.dispatch((v.state.tr as unknown as { setSelection: (s: unknown) => unknown })
      .setSelection(PM.TextSelection.create(v.state.doc as never, 3)));
    await w.vm.$nextTick();

    expect(figure(w as never).hasAttribute('data-selected'), 'selected before any click').toBe(false);

    w.find('.apex-ed__host figure img').element
      .dispatchEvent(new MouseEvent('mousedown', { clientX: 10, bubbles: true, cancelable: true }));
    await w.vm.$nextTick();

    expect(figure(w as never).getAttribute('data-selected')).toBe('true');

    w.unmount();
  });

  it('makes a node selection, not a text selection near it', async () => {
    /* The attribute is the symptom; the selection is the thing. A width
       command run from the toolbar acts on the SELECTED node, so a text
       selection beside the image would leave those buttons dead too. */
    layout();
    const w = await editorWithImage();

    w.find('.apex-ed__host figure img').element
      .dispatchEvent(new MouseEvent('mousedown', { clientX: 10, bubbles: true, cancelable: true }));
    await w.vm.$nextTick();

    const view = (w.vm as never as { getView: () => { state: { selection: { node?: { type: { name: string } } } } } }).getView();

    expect(view.state.selection.node?.type.name).toBe('image');

    w.unmount();
  });

  it('and the grips go away again when the selection moves off', async () => {
    /* Otherwise every picture the author has ever clicked keeps its
       grips, and a long article ends up covered in them. */
    layout();
    const w = await editorWithImage();
    const img = w.find('.apex-ed__host figure img').element;

    img.dispatchEvent(new MouseEvent('mousedown', { clientX: 10, bubbles: true, cancelable: true }));
    await w.vm.$nextTick();
    expect(figure(w as never).getAttribute('data-selected'), 'never selected').toBe('true');

    const PM = await import('prosemirror-state');
    const view = (w.vm as never as { getView: () => never }).getView() as unknown as {
      state: { doc: never; tr: never }; dispatch: (tr: unknown) => void;
    };
    view.dispatch((view.state.tr as unknown as { setSelection: (s: unknown) => unknown })
      .setSelection(PM.TextSelection.create(view.state.doc as never, 1)));
    await w.vm.$nextTick();

    expect(figure(w as never).hasAttribute('data-selected')).toBe(false);

    w.unmount();
  });
});

describe('dragging a corner', () => {
  it('writes the new width onto the image', async () => {
    layout();
    const w = await editorWithImage();

    await dragCorner(w as never, 'se', 800, 400);

    expect((w.vm as never as { toHtml: () => string }).toHtml())
      .toContain('data-width="400px"');

    w.unmount();
  });

  it('grows the image when a WEST handle moves left', async () => {
    /* The direction is per corner, or the left grips would work backwards
       — push the pointer out and watch the picture shrink. */
    layout(400, 800);
    const w = await editorWithImage();

    await dragCorner(w as never, 'sw', 400, 200);

    expect(figure(w as never).getAttribute('data-width')).toBe('600px');

    w.unmount();
  });

  it('is ONE undo step, however far the pointer travelled', async () => {
    /* The reason the drag writes CSS and not transactions. A dispatch per
       mousemove is an undo per pixel. */
    layout();
    const w = await editorWithImage();
    const handle = w.find('.apex-ed__img-handle[data-corner="se"]').element;

    handle.dispatchEvent(new MouseEvent('mousedown', { clientX: 800, bubbles: true, cancelable: true }));
    for (let x = 790; x >= 400; x -= 10) window.dispatchEvent(new MouseEvent('mousemove', { clientX: x }));
    window.dispatchEvent(new MouseEvent('mouseup', { clientX: 400 }));
    await w.vm.$nextTick();

    const api = w.vm as never as { toHtml: () => string; undo: () => boolean };
    expect(api.toHtml()).toContain('data-width="400px"');

    api.undo();
    await w.vm.$nextTick();

    expect(api.toHtml()).not.toContain('data-width');

    w.unmount();
  });

  it('shows the size while the pointer is down, and stops when it is up', async () => {
    layout();
    const w = await editorWithImage();
    const handle = w.find('.apex-ed__img-handle[data-corner="se"]').element;

    handle.dispatchEvent(new MouseEvent('mousedown', { clientX: 800, bubbles: true, cancelable: true }));
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 600 }));

    expect(figure(w as never).getAttribute('data-resizing')).toBe('600');

    window.dispatchEvent(new MouseEvent('mouseup', { clientX: 600 }));
    await w.vm.$nextTick();

    expect(figure(w as never).hasAttribute('data-resizing')).toBe(false);

    w.unmount();
  });

  it('writes nothing when the pointer did not move', async () => {
    /* A click on a grip is a click, not a resize, and it must not put an
       undo step on the stack or dirty the document. */
    layout();
    const w = await editorWithImage();
    const before = (w.vm as never as { toHtml: () => string }).toHtml();

    await dragCorner(w as never, 'se', 800, 800);

    expect((w.vm as never as { toHtml: () => string }).toHtml()).toBe(before);

    w.unmount();
  });

  it('does not start a drag in a readonly editor', async () => {
    layout();
    const w = await editorWith(FIGURE, { readonly: true });

    await dragCorner(w as never, 'se', 800, 400);

    expect((w.vm as never as { toHtml: () => string }).toHtml()).not.toContain('data-width');

    w.unmount();
  });
});

describe('an image that already has a width', () => {
  it('renders at it, as a custom property the stylesheet can use', async () => {
    /* Every value a drag can produce has to arrive inline: a stylesheet
       cannot carry a rule per pixel. */
    layout();
    const w = await editorWith(
      '<figure data-width="42%"><img src="/a.webp"><figcaption></figcaption></figure>',
    );

    expect(figure(w as never).style.getPropertyValue('--apex-ed-fig-w')).toBe('42%');

    w.unmount();
  });
});
