import { describe, it, expect, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import ApexEditor from '../src/components/ApexEditor.vue';
import { loadEngine } from '../src/core/editor/engine';

/**
 * What the editor tells an overlay — N/032.
 *
 * Asked for as "a context menu on the table, with merge, split, insert
 * row, delete row, insert column, delete column". All of those commands
 * exist, and so does the bar that shows them: `ApexEditorTableTools`,
 * placed by `ApexEditorObjectBar`. They could not be reached from this
 * editor, because a host had no way to learn WHAT the caret was in or
 * WHERE it is on screen — `ApexHTMLEditor` has published that since its
 * own object bar was built, and `ApexEditor` published nothing.
 *
 * So the overlay slot now carries `object` ({kind, rect}), `measure`
 * (re-read on scroll, because a rect is a snapshot), `cell` (what the
 * table bar reads) and `setCellStyle`.
 */

const ORIGINAL_RECT = Element.prototype.getBoundingClientRect;

afterEach(() => { Element.prototype.getBoundingClientRect = ORIGINAL_RECT; vi.restoreAllMocks(); });

/** happy-dom measures nothing, and a node with no box has no object. */
function layout() {
  Element.prototype.getBoundingClientRect = function () {
    return { width: 400, height: 120, top: 10, left: 20, right: 420, bottom: 130,
      x: 20, y: 10, toJSON: () => ({}) } as DOMRect;
  };
}

type Overlay = {
  object: { kind: string; rect: DOMRect } | null;
  measure: () => DOMRect | null;
  cell: { style: Record<string, string>; selectedCells?: number } | null;
  image: Record<string, unknown> | null;
  setCellStyle: (prop: string, value: string | null) => boolean;
  run: (name: string) => boolean;
};

/** Mounts, captures the overlay slot's props, and returns both. */
async function editorWith(html: string) {
  await loadEngine();
  let seen: Overlay | null = null;
  const w = mount(ApexEditor, {
    props: { media: true, tables: true },
    slots: { overlay: (props: Overlay) => { seen = props; return ''; } },
    attachTo: document.body,
  });
  await flushPromises();
  await flushPromises();

  (w.vm as never as { setHtml: (h: string) => void }).setHtml(html);
  await flushPromises();
  await w.vm.$nextTick();

  return { w, overlay: () => seen! };
}

async function caretAt(w: { vm: { $nextTick: () => Promise<void> } }, view: never, at: number) {
  const PM = await import('prosemirror-state');
  const v = view as unknown as { state: { doc: never; tr: never }; dispatch: (t: unknown) => void };
  v.dispatch((v.state.tr as unknown as { setSelection: (s: unknown) => unknown })
    .setSelection(PM.TextSelection.create(v.state.doc as never, at)));
  await w.vm.$nextTick();
}

const TABLE = '<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>';
const FIGURE = '<figure><img src="/a.webp" alt="a"></figure>';

async function selectImage(w: { vm: { $nextTick: () => Promise<void> } }, at = 0) {
  const PM = await import('prosemirror-state');
  const v = (w as unknown as { vm: { getView: () => never } }).vm.getView() as unknown as {
    state: { doc: never; tr: never }; dispatch: (t: unknown) => void;
  };
  v.dispatch((v.state.tr as unknown as { setSelection: (s: unknown) => unknown })
    .setSelection(PM.NodeSelection.create(v.state.doc as never, at)));
  await w.vm.$nextTick();
}

describe('the overlay slot', () => {
  it('reports no object when the caret is in ordinary text', async () => {
    layout();
    const { w, overlay } = await editorWith('<p>text</p>');

    expect(overlay().object).toBeNull();

    w.unmount();
  });

  it('reports the TABLE the caret is inside', async () => {
    layout();
    const { w, overlay } = await editorWith(TABLE);
    const view = (w.vm as never as { getView: () => never }).getView();
    await caretAt(w, view, 4);

    expect(overlay().object?.kind).toBe('table');
    expect(overlay().object?.rect.width).toBe(400);

    w.unmount();
  });

  it('reports the cell, which is what the table bar renders from', async () => {
    /* `cell` null is how that bar hides itself, so an absent cell is
       not a detail - it is the bar's visibility. */
    layout();
    const { w, overlay } = await editorWith(TABLE);
    const view = (w.vm as never as { getView: () => never }).getView();
    await caretAt(w, view, 4);

    expect(overlay().cell).not.toBeNull();
    expect(overlay().cell?.selectedCells).toBe(1);

    w.unmount();
  });

  it('offers a measure that re-reads the box rather than a stored rect', async () => {
    /* The dialog this editor lives in scrolls. A bar placed from the
       rect taken when the selection changed goes back where it already
       was. */
    layout();
    const { w, overlay } = await editorWith(TABLE);
    const view = (w.vm as never as { getView: () => never }).getView();
    await caretAt(w, view, 4);

    Element.prototype.getBoundingClientRect = function () {
      return { width: 400, height: 120, top: 999, left: 20, right: 420, bottom: 1119,
        x: 20, y: 999, toJSON: () => ({}) } as DOMRect;
    };

    expect(overlay().object?.rect.y, 'the snapshot changed').toBe(10);
    expect(overlay().measure()?.y, 'measure returned the snapshot').toBe(999);

    w.unmount();
  });

  it('translates the bar\'s one style into the command that stores it', async () => {
    /* The bar writes alignment as CSS, because the page editor it was
       built for keeps real CSS on a cell. A prose document keeps an
       `align` attribute instead - the one the stylesheet reads and the
       sanitiser allows - so the declaration is translated, and anything
       else is refused rather than written where it would not survive. */
    layout();
    const { w, overlay } = await editorWith(TABLE);
    const view = (w.vm as never as { getView: () => never }).getView();
    await caretAt(w, view, 4);

    expect(overlay().setCellStyle('text-align', 'right')).toBe(true);
    await w.vm.$nextTick();

    expect((w.vm as never as { toHtml: () => string }).toHtml()).toContain('data-align="right"');
    expect(overlay().setCellStyle('background-color', 'red')).toBe(false);

    w.unmount();
  });
});

describe('a selected picture', () => {
  it('is reported as the object', async () => {
    layout();
    const { w, overlay } = await editorWith(FIGURE);
    await selectImage(w);

    expect(overlay().object?.kind).toBe('image');

    w.unmount();
  });

  it('comes with its attributes, which is what makes the tools appear', async () => {
    /* `ApexEditorImageTools` hides itself when `image` is null - the
       same contract the table bar has with `cell`. The bar shipped
       mounted and without it, so the grips appeared on the picture and
       no tools came with them. Untested because the first version of
       this spec covered the TABLE branch only. */
    layout();
    const { w, overlay } = await editorWith(FIGURE);
    await selectImage(w);

    expect(overlay().image).not.toBeNull();
    expect(overlay().image?.src).toBe('/a.webp');

    w.unmount();
  });

  it('and nothing is reported once the selection is text again', async () => {
    layout();
    const { w, overlay } = await editorWith(`<p>text</p>${FIGURE}`);
    await selectImage(w, 6);
    expect(overlay().image, 'never reported at all').not.toBeNull();

    const view = (w.vm as never as { getView: () => never }).getView();
    await caretAt(w, view, 3);

    expect(overlay().image).toBeNull();

    w.unmount();
  });
});


describe('the object bar\'s layer', () => {
  it('is above a modal form, which is where this editor usually lives', () => {
    /* It was 700 and `.apex-form` is 900, so the bar was in the DOM,
       positioned, opaque - and painted behind the dialog. Asserted as a
       RELATIONSHIP: a future change to either number keeps this true
       or fails here. */
    const css = readFileSync(join('src', 'styles', 'apex-ui.css'), 'utf8');
    /* The form's own z-index is on its MODAL variant - the shell is
       only an overlay when it is one - so the selector carries the
       attribute. A bare `.apex-form` matches no rule, which the first
       version of this test reported as a missing z-index. */
    const z = (selector: string) => {
      /* Split on the closing brace and look for the literal selector
         rather than building a regex out of it: a selector carrying
         brackets and quotes needs escaping, and getting that wrong is
         how the first version of this reported a missing rule. */
      const block = css.split('}').find((b) => b.includes(selector) && /z-index:\s*\d+/.test(b));
      expect(block, `no z-index for ${selector}`).toBeTruthy();

      return Number(/z-index:\s*(\d+)/.exec(block!)![1]);
    };

    expect(z('.apex-objbar')).toBeGreaterThan(z('.apex-form[data-shell="modal"]'));
  });
});
