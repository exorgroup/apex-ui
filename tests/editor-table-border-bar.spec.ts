import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApexEditor from '../src/components/ApexEditor.vue';
import ApexEditorTableTools from '../src/components/ApexEditorTableTools.vue';
import { loadEngine } from '../src/core/editor/engine';

/**
 * The border controls in the table bar — N/049.
 *
 * Reported from a published article: "we have no controls — at least we
 * need to add border width and border colour". Decided with the author:
 * the whole table rather than the selected cells, a number box in pixels
 * and the library's colour picker.
 *
 * The bar is driven and then the DOCUMENT is read, which is the only way
 * to tell a control that works from one that merely lights up — the
 * lesson of N/034, where five buttons in the image bar drew perfectly
 * and did nothing.
 */

const TABLE = '<table><tbody><tr><td><p>a</p></td></tr></tbody></table>';

/** An editor with the caret in a table, and the bar mounted against it. */
async function barOverTable(html = TABLE) {
  await loadEngine();
  const editor = mount(ApexEditor, { props: { tables: true }, attachTo: document.body });
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

  /* The caret goes INSIDE a cell: the commands walk up from the
     selection to find the table, so a selection at the document start
     would find nothing and every assertion would pass for the wrong
     reason. */
  let at = -1;
  (view.state.doc as unknown as { descendants: (f: (n: never, p: number) => void) => void })
    .descendants((node, pos) => {
      if ((node as unknown as { type: { name: string } }).type.name === 'paragraph' && at < 0) at = pos + 1;
    });
  expect(at, 'no paragraph inside the table').toBeGreaterThan(-1);

  view.dispatch((view.state.tr as unknown as { setSelection: (s: unknown) => unknown })
    .setSelection(PM.TextSelection.create(view.state.doc as never, at)));
  await editor.vm.$nextTick();

  /* The state the screen passes the bar, read from the document. */
  const cell = () => {
    let border: { width: string | null; color: string | null } = { width: null, color: null };
    (view.state.doc as unknown as { descendants: (f: (n: never) => void) => void })
      .descendants((node) => {
        const n = node as unknown as { type: { name: string }; attrs: Record<string, unknown> };
        if (n.type.name === 'table') {
          border = {
            width: (n.attrs.borderWidth as string | null) ?? null,
            color: (n.attrs.borderColor as string | null) ?? null,
          };
        }
      });

    return { style: {}, selectedCells: 1, border };
  };

  const bar = mount(ApexEditorTableTools, {
    props: { cell: cell(), run: (n: string, v?: string | null) => api.run(n, v) },
    attachTo: document.body,
  });

  return { editor, bar, api, cell };
}

const widthBox = (bar: { find: (s: string) => never }) => bar.find('input[type="number"]') as unknown as
  { exists: () => boolean; setValue: (v: string) => Promise<void>; trigger: (e: string) => Promise<void>;
    element: HTMLInputElement };

describe('the border width box', () => {
  it('writes a pixel length onto the table', async () => {
    const { bar, api, editor } = await barOverTable();
    const box = widthBox(bar as never);

    expect(box.exists(), 'the bar has no border width box').toBe(true);

    await box.setValue('3');
    await box.trigger('change');
    await flushPromises();

    expect(api.toHtml()).toContain('data-border-width="3px"');

    bar.unmount();
    editor.unmount();
  });

  it('and Enter commits it too, for somebody who types and does not tab away', async () => {
    /* `setValue` fires a change of its own, so a test that used it would
       pass with the Enter handler deleted - it did, and the mutation
       survived. The value is typed here the way a person types it: an
       `input` per keystroke, no change event, then Enter. */
    const { bar, api, editor } = await barOverTable();
    const box = widthBox(bar as never);

    box.element.value = '2';
    await box.trigger('input');
    await box.trigger('keydown.enter');
    await flushPromises();

    expect(api.toHtml()).toContain('data-border-width="2px"');

    bar.unmount();
    editor.unmount();
  });

  it('shows what the table already carries', async () => {
    const { bar, editor } = await barOverTable(
      '<table data-border-width="4px"><tbody><tr><td><p>a</p></td></tr></tbody></table>',
    );

    expect(widthBox(bar as never).element.value).toBe('4');

    bar.unmount();
    editor.unmount();
  });

  it('emptied, it takes the border off rather than setting it to zero', async () => {
    /* No border and a zero-width border are different things: one wears
       whatever the page gives it, the other is a table somebody took the
       lines off. */
    const { bar, api, editor } = await barOverTable(
      '<table data-border-width="4px"><tbody><tr><td><p>a</p></td></tr></tbody></table>',
    );
    const box = widthBox(bar as never);

    await box.setValue('');
    await box.trigger('change');
    await flushPromises();

    expect(api.toHtml()).not.toContain('data-border-width');

    bar.unmount();
    editor.unmount();
  });
});

describe('the border colour', () => {
  it('is a colour picker, and what it picks lands on the table', async () => {
    const { bar, api, editor } = await barOverTable();
    const picker = bar.findComponent({ name: 'ApexColorPicker' });

    expect(picker.exists(), 'the bar has no colour picker').toBe(true);

    await picker.setValue('#ffcc00', 'modelValue');
    picker.vm.$emit('change', '#ffcc00');
    await flushPromises();

    expect(api.toHtml()).toContain('data-border-color="#ffcc00"');

    bar.unmount();
    editor.unmount();
  });
});

describe('the bar itself', () => {
  it('renders neither control when the caret is not in a table', async () => {
    /* A null cell is what hides the bar - the contract it has had since
       it was written, and the reason no `visible` prop exists. */
    const bar = mount(ApexEditorTableTools, { props: { cell: null }, attachTo: document.body });

    expect(bar.find('input[type="number"]').exists()).toBe(false);
    expect(bar.findComponent({ name: 'ApexColorPicker' }).exists()).toBe(false);

    bar.unmount();
  });

  it('greys them with the rest when the editor is not accepting input', async () => {
    const bar = mount(ApexEditorTableTools, {
      props: { cell: { style: {}, border: { width: null, color: null } }, disabled: true },
      attachTo: document.body,
    });

    expect((bar.find('input[type="number"]').element as HTMLInputElement).disabled).toBe(true);

    bar.unmount();
  });
});
