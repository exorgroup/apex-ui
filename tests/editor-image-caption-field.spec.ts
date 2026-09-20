import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApexEditor from '../src/components/ApexEditor.vue';
import ApexEditorImageTools from '../src/components/ApexEditorImageTools.vue';
import { loadEngine } from '../src/core/editor/engine';

/**
 * Writing a caption — N/037, the half that was missing.
 *
 * N/033 turned the caption from editable CONTENT into an attribute, so
 * that clicking a picture selects the picture rather than dropping the
 * caret into a caption nobody meant to edit. That was asked for. What
 * came with it and was not noticed: a caption could be READ and never
 * written — stored ones still rendered, new ones were impossible.
 *
 * So the bar gets a caption field beside the description. They are
 * different things and both are here: alt is read INSTEAD of the
 * picture, a caption is read WITH it.
 */

const FIGURE = '<figure><img src="/a.webp" alt="a"></figure>';

async function barOverImage(html = FIGURE, typeName = 'image') {
  await loadEngine();
  const editor = mount(ApexEditor, { props: { media: true }, attachTo: document.body });
  await flushPromises();
  await flushPromises();

  const api = editor.vm as never as {
    setHtml: (h: string) => void; toHtml: () => string; getView: () => never;
    run: (n: string, v?: string | null) => boolean;
  };
  api.setHtml(html);
  await flushPromises();

  const PM = await import('prosemirror-state');
  const view = api.getView() as unknown as {
    state: { doc: never; tr: never }; dispatch: (t: unknown) => void;
  };

  let at = -1;
  (view.state.doc as unknown as { descendants: (f: (n: never, p: number) => void) => void })
    .descendants((node, pos) => {
      if ((node as unknown as { type: { name: string } }).type.name === typeName && at < 0) at = pos;
    });
  expect(at, `no ${typeName} in the fixture`).toBeGreaterThan(-1);

  view.dispatch((view.state.tr as unknown as { setSelection: (s: unknown) => unknown })
    .setSelection(PM.NodeSelection.create(view.state.doc as never, at)));
  await editor.vm.$nextTick();

  const state = () => {
    let found: Record<string, unknown> | null = null;
    (view.state.doc as unknown as { descendants: (f: (n: never) => void) => void })
      .descendants((node) => {
        const n = node as unknown as { type: { name: string }; attrs: Record<string, unknown> };
        if (n.type.name === typeName && !found) found = { type: n.type.name, ...n.attrs };
      });

    return found;
  };

  const bar = mount(ApexEditorImageTools, {
    props: { image: state(), run: (n: string, v?: string | null) => api.run(n, v) },
    attachTo: document.body,
  });

  return { editor, bar, api, state };
}

const captionBox = (bar: { find: (s: string) => never }) =>
  bar.find('input[aria-label="Caption"]') as unknown as {
    exists: () => boolean; setValue: (v: string) => Promise<void>;
    trigger: (e: string) => Promise<void>; element: HTMLInputElement;
  };

describe('the caption field', () => {
  it('writes a caption onto the figure', async () => {
    const { bar, api, editor } = await barOverImage();
    const box = captionBox(bar as never);

    expect(box.exists(), 'the bar has no caption field').toBe(true);

    await box.setValue('The doors, 1974');
    await box.trigger('change');
    await flushPromises();

    expect(api.toHtml()).toContain('<figcaption>The doors, 1974</figcaption>');

    bar.unmount();
    editor.unmount();
  });

  it('shows the caption the picture already has', async () => {
    const { bar, editor } = await barOverImage(
      '<figure><img src="/a.webp"><figcaption>Already written</figcaption></figure>',
    );

    expect(captionBox(bar as never).element.value).toBe('Already written');

    bar.unmount();
    editor.unmount();
  });

  it('emptied, it takes the caption away', async () => {
    const { bar, api, editor } = await barOverImage(
      '<figure><img src="/a.webp"><figcaption>Remove me</figcaption></figure>',
    );
    const box = captionBox(bar as never);

    await box.setValue('');
    await box.trigger('change');
    await flushPromises();

    expect(api.toHtml()).not.toContain('figcaption');

    bar.unmount();
    editor.unmount();
  });

  it('is not offered for a picture inside a line of text', async () => {
    /* A `<figcaption>` is a block and cannot live in a paragraph, so an
       inline picture has no caption to write. Offering the field would
       be offering to store something nothing can render. */
    const { bar, editor } = await barOverImage('<p>x <img src="/a.webp"> y</p>', 'image_inline');

    expect(captionBox(bar as never).exists()).toBe(false);
    /* The description is still there: alt belongs to both. */
    expect(bar.find('input[aria-label="Alternative description"]').exists()).toBe(true);

    bar.unmount();
    editor.unmount();
  });

  it('and the editor tells the bar WHICH picture it is', async () => {
    /* The bar decides whether to offer a caption from `image.type`, and
       the state it reads is the editor's. A test that builds that state
       itself proves the bar and nothing about the editor - which is how
       the mutation removing this line survived the first pass. */
    await loadEngine();
    const seen: Record<string, unknown>[] = [];
    const editor = mount(ApexEditor, {
      props: { media: true },
      slots: { overlay: (props: { image?: Record<string, unknown> | null }) => {
        if (props.image) seen.push(props.image);

        return '';
      } },
      attachTo: document.body,
    });
    await flushPromises();
    await flushPromises();

    const api = editor.vm as never as {
      setHtml: (h: string) => void; getView: () => never;
    };
    api.setHtml(FIGURE);
    await flushPromises();

    const PM = await import('prosemirror-state');
    const view = api.getView() as unknown as {
      state: { doc: never; tr: never }; dispatch: (t: unknown) => void;
    };
    let at = -1;
    (view.state.doc as unknown as { descendants: (f: (n: never, p: number) => void) => void })
      .descendants((node, pos) => {
        if ((node as unknown as { type: { name: string } }).type.name === 'image' && at < 0) at = pos;
      });
    view.dispatch((view.state.tr as unknown as { setSelection: (s: unknown) => unknown })
      .setSelection(PM.NodeSelection.create(view.state.doc as never, at)));
    await editor.vm.$nextTick();
    await flushPromises();

    expect(seen.length, 'the overlay was never told about the picture').toBeGreaterThan(0);
    expect(seen[seen.length - 1].type).toBe('image');

    editor.unmount();
  });

  it('and is a different field from the description', async () => {
    /* They were one thing in an earlier draft. Alt is read INSTEAD of
       the picture and a caption is read WITH it; writing one must not
       write the other. */
    const { bar, api, editor } = await barOverImage();

    await captionBox(bar as never).setValue('A caption');
    await captionBox(bar as never).trigger('change');
    await flushPromises();

    const out = api.toHtml();
    expect(out).toContain('alt="a"');
    expect(out).toContain('<figcaption>A caption</figcaption>');

    bar.unmount();
    editor.unmount();
  });
});
