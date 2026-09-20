import { describe, it, expect, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApexEditor from '../src/components/ApexEditor.vue';
import ApexEditorImageTools from '../src/components/ApexEditorImageTools.vue';
import { loadEngine } from '../src/core/editor/engine';

/**
 * The image bar's controls, every one of which was dead — N/034.
 *
 * Reported one by one: "alternative description — there is a box but
 * cannot enter any text"; "original button does nothing"; "edit button
 * does nothing"; "delete button does not work". All five for the same
 * reason: the bar called commands that no registry had
 * (`image_width`, `image_delete`, `image_align_none`) or emitted events
 * the host does not answer (`edit`, twice).
 *
 * The fix is in the LIBRARY, not in the screen: the commands are in
 * `media.ts` and the controls are in this component, so every editor
 * gets them. These tests drive the bar and then read the DOCUMENT,
 * which is the only way to tell a button that works from a button that
 * merely lights up.
 */

const ORIGINAL_RECT = Element.prototype.getBoundingClientRect;

afterEach(() => { Element.prototype.getBoundingClientRect = ORIGINAL_RECT; vi.restoreAllMocks(); });

function layout(width = 400, height = 300) {
  Element.prototype.getBoundingClientRect = function () {
    return { width, height, top: 0, left: 0, right: width, bottom: height,
      x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
  };
}

const FIGURE = '<figure><img src="/a.webp" alt="a"></figure>';

/** An editor with a picture selected, and the bar mounted against it. */
async function barOverImage(html = FIGURE) {
  await loadEngine();
  const editor = mount(ApexEditor, { props: { media: true, tables: true }, attachTo: document.body });
  await flushPromises();
  await flushPromises();

  const api = editor.vm as never as {
    setHtml: (h: string) => void; toHtml: () => string; getView: () => never;
    run: (n: string, v?: string | null) => boolean; can: (n: string) => boolean;
  };
  api.setHtml(html);
  await flushPromises();

  const PM = await import('prosemirror-state');
  const view = api.getView() as unknown as {
    state: { doc: never; tr: never }; dispatch: (t: unknown) => void;
  };

  /* The picture's position is FOUND, not assumed to be zero: a document
     with a paragraph before it selected the paragraph, and a command
     that acts on the selected image then did nothing - which read as a
     broken delete button rather than a broken test. */
  let at = -1;
  (view.state.doc as unknown as { descendants: (f: (n: never, p: number) => void) => void })
    .descendants((node, pos) => {
      if ((node as unknown as { type: { name: string } }).type.name === 'image' && at < 0) at = pos;
    });
  expect(at, 'no image in the fixture').toBeGreaterThan(-1);

  view.dispatch((view.state.tr as unknown as { setSelection: (s: unknown) => unknown })
    .setSelection(PM.NodeSelection.create(view.state.doc as never, at)));
  await editor.vm.$nextTick();

  /* The bar reads the same state the screen passes it. */
  const image = () => {
    let attrs: Record<string, unknown> | null = null;
    (view.state.doc as unknown as { descendants: (f: (n: never) => void) => void })
      .descendants((node) => {
        const n = node as unknown as { type: { name: string }; attrs: Record<string, unknown> };
        if (n.type.name === 'image' && !attrs) attrs = { ...n.attrs, renderedWidth: 400, renderedHeight: 300 };
      });

    return attrs;
  };

  const bar = mount(ApexEditorImageTools, {
    props: { image: image(), run: (n: string, v?: string | null) => api.run(n, v) },
    attachTo: document.body,
  });

  return { editor, bar, api, image };
}

describe('the alternative description', () => {
  it('can be typed into, and reaches the document', async () => {
    /* It was a BUTTON that emitted `edit`: an author could read the
       description and never change it. */
    layout();
    const { editor, bar, api } = await barOverImage();
    const field = bar.find('input[aria-label="Alternative description"]');

    expect(field.exists(), 'there is no field to type in').toBe(true);

    await field.setValue('A red can of cola');
    await field.trigger('change');
    await editor.vm.$nextTick();

    expect(api.toHtml()).toContain('alt="A red can of cola"');

    bar.unmount();
    editor.unmount();
  });

  it('can be emptied, which is how a picture is marked decorative', async () => {
    /* '' and "no alt at all" are different statements, and a reader's
       software treats them differently. */
    layout();
    const { editor, bar, api } = await barOverImage();
    const field = bar.find('input[aria-label="Alternative description"]');

    await field.setValue('');
    await field.trigger('change');
    await editor.vm.$nextTick();

    expect(api.toHtml()).toContain('alt=""');

    bar.unmount();
    editor.unmount();
  });
});

describe('the size boxes', () => {
  it('show what the picture measures when it has no stated size', async () => {
    /* The select they replace read "Original", which is not something
       anyone can type over. */
    layout(640, 480);
    const { editor, bar } = await barOverImage();

    expect((bar.find('input[aria-label="Width in pixels"]').element as HTMLInputElement).value)
      .toBe('400');

    bar.unmount();
    editor.unmount();
  });

  it('write a width in pixels', async () => {
    layout();
    const { editor, bar, api } = await barOverImage();
    const w = bar.find('input[aria-label="Width in pixels"]');

    await w.setValue('320');
    await w.trigger('change');
    await editor.vm.$nextTick();

    expect(api.toHtml()).toContain('data-width="320px"');

    bar.unmount();
    editor.unmount();
  });

  it('write a height in pixels', async () => {
    layout();
    const { editor, bar, api } = await barOverImage();
    const h = bar.find('input[aria-label="Height in pixels"]');

    await h.setValue('180');
    await h.trigger('change');
    await editor.vm.$nextTick();

    expect(api.toHtml()).toContain('data-height="180px"');

    bar.unmount();
    editor.unmount();
  });

  it('clear the stored size when emptied', async () => {
    /* Back to the picture's own proportions, which is what an empty box
       means - not zero. */
    layout();
    const { editor, bar, api } = await barOverImage(
      '<figure data-width="320px"><img src="/a.webp" alt="a"></figure>',
    );
    const w = bar.find('input[aria-label="Width in pixels"]');

    await w.setValue('');
    await w.trigger('change');
    await editor.vm.$nextTick();

    expect(api.toHtml()).not.toContain('data-width');

    bar.unmount();
    editor.unmount();
  });
});

describe('the wrapping menu', () => {
  it('offers the four modes, all of which now render', async () => {
    /* "In line with text" was removed at N/037 and came back at
       N/039, when the inline image node gave it something to do. */
    layout();
    const { editor, bar } = await barOverImage();
    const items = (bar.vm as never as { wrapItems: { label: string }[] }).wrapItems;

    expect(items.map((i) => i.label)).toEqual([
      'In line with text',
      'Square — text on the right',
      'Square — text on the left',
      'Top and bottom',
    ]);

    bar.unmount();
    editor.unmount();
  });

  it('writes the chosen mode onto the picture', async () => {
    layout();
    const { editor, bar, api } = await barOverImage();
    const items = (bar.vm as never as { wrapItems: { command: () => void }[] }).wrapItems;

    items[1].command();
    await editor.vm.$nextTick();

    expect(api.toHtml()).toContain('data-wrap="left"');

    bar.unmount();
    editor.unmount();
  });

  it('marks the mode the picture is already in', async () => {
    layout();
    const { editor, bar } = await barOverImage(
      '<figure data-wrap="right"><img src="/a.webp" alt="a"></figure>',
    );
    const items = (bar.vm as never as { wrapItems: { label: string; hint?: string }[] }).wrapItems;

    expect(items.find((i) => i.hint === 'Current')?.label).toBe('Square — text on the left');

    bar.unmount();
    editor.unmount();
  });
});

describe('the rest of the bar', () => {
  it('deletes the picture', async () => {
    layout();
    const { editor, bar, api } = await barOverImage(`<p>before</p>${FIGURE}`);

    await bar.find('button[aria-label="Delete image"]').trigger('click');
    await editor.vm.$nextTick();

    expect(api.toHtml()).not.toContain('<img');
    expect(api.toHtml()).toContain('before');

    bar.unmount();
    editor.unmount();
  });

  it('and deletes nothing else', async () => {
    /* `deleteSelection` on whatever happens to be selected would make
       this button a hazard on every other node - the guard is the only
       thing between "delete image" and "delete table". */
    layout();
    const { editor, api } = await barOverImage(
      `${FIGURE}<table><tbody><tr><td>keep</td></tr></tbody></table>`,
    );
    const PM = await import('prosemirror-state');
    const view = api.getView() as unknown as {
      state: { doc: never; tr: never }; dispatch: (t: unknown) => void;
    };

    let table = -1;
    (view.state.doc as unknown as { descendants: (f: (n: never, p: number) => void) => void })
      .descendants((node, pos) => {
        if ((node as unknown as { type: { name: string } }).type.name === 'table' && table < 0) table = pos;
      });
    view.dispatch((view.state.tr as unknown as { setSelection: (s: unknown) => unknown })
      .setSelection(PM.NodeSelection.create(view.state.doc as never, table)));
    await editor.vm.$nextTick();

    expect(api.run('image_delete')).toBe(false);
    await editor.vm.$nextTick();

    expect(api.toHtml()).toContain('keep');

    editor.unmount();
  });

  it('has no Edit button left, and no justify', async () => {
    /* Both removed rather than wired: one emitted an event this host
       does not answer, the other ran a command that does not exist. */
    layout();
    const { editor, bar } = await barOverImage();
    const labels = bar.findAll('button').map((b) => b.attributes('aria-label'));

    expect(labels).not.toContain('Edit image');
    expect(labels).not.toContain('In line with text');
    expect(labels).toContain('Text wrapping');

    bar.unmount();
    editor.unmount();
  });

  it('still aligns, which was the one thing that worked', async () => {
    layout();
    const { editor, bar, api } = await barOverImage();

    await bar.find('button[data-cmd="image_align_right"]').trigger('click');
    await editor.vm.$nextTick();

    expect(api.toHtml()).toContain('data-align="right"');

    bar.unmount();
    editor.unmount();
  });
});
