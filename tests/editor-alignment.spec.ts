import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApexEditor from '../src/components/ApexEditor.vue';
import ApexEditorToolbar from '../src/components/ApexEditorToolbar.vue';
import { loadEngine } from '../src/core/editor/engine';
import { CATALOGUE } from '../src/core/editor/catalogue';

/**
 * Alignment, for text and for pictures — N/028.
 *
 * Reported as "we do not have any alignment buttons". They existed: four
 * of them, in the overflow menu behind the three dots, unlabelled until
 * opened. A control one click away and out of sight is, for the person
 * using it, a control that is not there — so they are on the bar now.
 *
 * The same four act on an image. `setAlign` writes to every node in the
 * selection whose TYPE carries an `align` attribute, and the figure
 * does, so selecting a picture and pressing "centre" centres the
 * picture. That is worth a test rather than a note: it holds only while
 * the image node keeps that attribute, and nothing else would notice if
 * it lost it.
 */

const FIGURE = '<figure><img src="/a.webp" alt="a"><figcaption></figcaption></figure>';

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

const api = (w: { vm: unknown }) => w.vm as {
  run: (n: string) => boolean;
  can: (n: string) => boolean;
  toHtml: () => string;
  getView: () => never;
};

async function selectAll(w: Awaited<ReturnType<typeof editorWith>>) {
  const PM = await import('prosemirror-state');
  const v = api(w).getView() as unknown as { state: { doc: never; tr: never }; dispatch: (t: unknown) => void };
  v.dispatch((v.state.tr as unknown as { setSelection: (s: unknown) => unknown })
    .setSelection(new PM.AllSelection(v.state.doc as never)));
  await w.vm.$nextTick();
}

async function selectImage(w: Awaited<ReturnType<typeof editorWith>>, at = 0) {
  const PM = await import('prosemirror-state');
  const v = api(w).getView() as unknown as { state: { doc: never; tr: never }; dispatch: (t: unknown) => void };
  v.dispatch((v.state.tr as unknown as { setSelection: (s: unknown) => unknown })
    .setSelection(PM.NodeSelection.create(v.state.doc as never, at)));
  await w.vm.$nextTick();
}

describe('the alignment buttons', () => {
  it('are on the standard bar, not hidden in the overflow', async () => {
    const w = mount(ApexEditorToolbar, {
      props: { preset: 'standard', can: {}, active: null, run: () => true },
      attachTo: document.body,
    });

    const labels = w.findAll('button.apex-edbar__btn').map((b) => b.attributes('aria-label') || '');
    for (const command of ['align_left', 'align_center', 'align_right', 'align_justify']) {
      expect(labels, `${command} is not on the bar`).toContain(CATALOGUE[command].label);
    }

    w.unmount();
  });

  it('are not ALSO in the overflow, which would list them twice', async () => {
    const w = mount(ApexEditorToolbar, {
      props: { preset: 'standard', can: {}, active: null, run: () => true },
      attachTo: document.body,
    });

    const rows = (w.vm as never as { overflowMenuItems: { label?: string }[] }).overflowMenuItems;

    expect(rows.some((r) => r.label === CATALOGUE.align_center.label)).toBe(false);
    expect(rows.length, 'the overflow is now empty and should not draw').toBeGreaterThan(0);

    w.unmount();
  });
});

describe('aligning text', () => {
  it('writes the alignment onto the paragraph', async () => {
    const w = await editorWith('<p>text</p>');
    await selectAll(w);

    expect(api(w).run('align_center')).toBe(true);
    await w.vm.$nextTick();

    expect(api(w).toHtml()).toBe('<p data-align="center">text</p>');

    w.unmount();
  });

  it('toggles off when the same alignment is asked for twice', async () => {
    /* The button reads as a toggle rather than a one-way switch. */
    const w = await editorWith('<p>text</p>');
    await selectAll(w);

    api(w).run('align_right');
    await w.vm.$nextTick();
    api(w).run('align_right');
    await w.vm.$nextTick();

    expect(api(w).toHtml()).toBe('<p>text</p>');

    w.unmount();
  });

  it('reaches a heading too', async () => {
    const w = await editorWith('<h2>title</h2>');
    await selectAll(w);

    api(w).run('align_center');
    await w.vm.$nextTick();

    expect(api(w).toHtml()).toContain('data-align="center"');

    w.unmount();
  });
});

describe('aligning a picture', () => {
  it('centres the figure when the image is selected', async () => {
    /* One set of buttons for both, because `setAlign` asks the node
       whether it has an `align` attribute rather than asking what it
       is. The figure has one. */
    const w = await editorWith(FIGURE);
    await selectImage(w);

    expect(api(w).run('align_center')).toBe(true);
    await w.vm.$nextTick();

    expect(api(w).toHtml()).toContain('<figure data-align="center">');

    w.unmount();
  });

  it('aligns the picture and not the paragraph beside it', async () => {
    const w = await editorWith(`<p>before</p>${FIGURE}`);
    /* The figure opens where the paragraph ends: nodeSize 8 for
       `<p>before</p>`. */
    await selectImage(w, 8);

    api(w).run('align_right');
    await w.vm.$nextTick();

    const out = api(w).toHtml();
    expect(out).toContain('<figure data-align="right">');
    expect(out).toContain('<p>before</p>');

    w.unmount();
  });

  it('aligns a picture INSIDE a table cell, not the cell', async () => {
    /* The reported failure. A cell carries an `align` attribute too,
       and `nodesBetween` walks downwards and stops at the first node
       that takes one - so the cell was aligned and the picture was
       never reached. A cell's text alignment does nothing to a block
       image with automatic margins, so the button appeared dead. */
    const w = await editorWith(
      `<table><tbody><tr><td>${FIGURE}</td><td>b</td></tr></tbody></table>`,
      { tables: true },
    );

    const v = api(w).getView() as unknown as { state: { doc: never } };
    /* The figure's position inside the first cell, found rather than
       counted: table positions are not obvious arithmetic. */
    let at = -1;
    (v.state.doc as unknown as { descendants: (f: (n: { type: { name: string } }, p: number) => void) => void })
      .descendants((node, pos) => { if (node.type.name === 'image' && at < 0) at = pos; });
    expect(at, 'no image parsed inside the cell').toBeGreaterThan(-1);

    await selectImage(w, at);
    expect(api(w).run('align_right')).toBe(true);
    await w.vm.$nextTick();

    const out = api(w).toHtml();
    expect(out).toContain('<figure data-align="right">');
    expect(out, 'the cell took the alignment instead').not.toContain('<td data-align');

    w.unmount();
  });

  it('clears it again on a second press', async () => {
    const w = await editorWith(FIGURE);
    await selectImage(w);

    api(w).run('align_center');
    await w.vm.$nextTick();
    api(w).run('align_center');
    await w.vm.$nextTick();

    expect(api(w).toHtml()).not.toContain('data-align');

    w.unmount();
  });

  it('clears it with the picture STILL selected, which is the other path', async () => {
    /* After the first press the selection is no longer a node
       selection, so the test above leaves through `nodesBetween` and a
       broken toggle on the node path survived it. Re-selecting the
       picture keeps both presses on that path. */
    const w = await editorWith(FIGURE);

    await selectImage(w);
    api(w).run('align_center');
    await w.vm.$nextTick();
    expect(api(w).toHtml(), 'the first press did nothing').toContain('data-align="center"');

    await selectImage(w);
    api(w).run('align_center');
    await w.vm.$nextTick();

    expect(api(w).toHtml()).not.toContain('data-align');

    w.unmount();
  });
});
