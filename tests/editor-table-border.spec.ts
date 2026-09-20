import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApexEditor from '../src/components/ApexEditor.vue';
import { loadEngine } from '../src/core/editor/engine';

/**
 * A table carries its own border — N/048.
 *
 * Reported from a published article: the table rendered as bare rows of
 * words, and the contextual bar offered nothing to change that.
 *
 * The border belongs to the TABLE rather than to the selected cells —
 * decided with the author, and it is what the words "table border"
 * mean: it survives a row being added, and it is one value rather than
 * one per cell.
 *
 * It is written twice. `data-border-width` / `data-border-color` are the
 * RECORD, which a sanitiser on the far side of a database can keep while
 * dropping everything else; the `style` carries the same two values as
 * custom properties, which is what makes the markup render on a page
 * that has never heard of this editor. CSS cannot read an attribute into
 * a length or a colour.
 */

async function editorWith(html: string) {
  await loadEngine();
  const w = mount(ApexEditor, { props: { tables: true }, attachTo: document.body });
  await flushPromises();
  await flushPromises();

  (w.vm as never as { setHtml: (h: string) => void }).setHtml(html);
  await flushPromises();

  return w;
}

const api = (w: { vm: unknown }) => w.vm as {
  toHtml: () => string; run: (n: string, v?: unknown) => boolean; getView: () => never;
};

const TABLE = '<table><tbody><tr><td><p>a</p></td></tr></tbody></table>';

describe('setting the border', () => {
  it('writes the width as data AND as something that renders', async () => {
    const w = await editorWith(TABLE);

    expect(api(w).run('table_border_width', '2px')).toBe(true);
    await flushPromises();

    const out = api(w).toHtml();
    expect(out).toContain('data-border-width="2px"');
    /* The browser's CSSOM re-serialises a style attribute - `--apex-tbl-bw: 2px;`
       with its own spacing - so the assertion reads the declaration, not the
       string we happened to build. */
    expect(out).toMatch(/--apex-tbl-bw:\s*2px/);

    w.unmount();
  });

  it('and the colour the same way', async () => {
    const w = await editorWith(TABLE);

    expect(api(w).run('table_border_color', '#ffcc00')).toBe(true);
    await flushPromises();

    const out = api(w).toHtml();
    expect(out).toContain('data-border-color="#ffcc00"');
    expect(out).toMatch(/--apex-tbl-bc:\s*#ffcc00/);

    w.unmount();
  });

  it('keeps both when they are set one after the other', async () => {
    /* A plain SET, not a toggle: the media commands' toggle behaviour
       erased a typed value the second time it was written (N/034), and
       a width and a colour are set one after the other every time. */
    const w = await editorWith(TABLE);

    api(w).run('table_border_width', '3px');
    await flushPromises();
    api(w).run('table_border_color', '#fff');
    await flushPromises();

    const out = api(w).toHtml();
    expect(out).toContain('data-border-width="3px"');
    expect(out).toContain('data-border-color="#fff"');

    w.unmount();
  });

  it('writing the same width twice leaves it set', async () => {
    const w = await editorWith(TABLE);

    api(w).run('table_border_width', '2px');
    await flushPromises();
    api(w).run('table_border_width', '2px');
    await flushPromises();

    expect(api(w).toHtml()).toContain('data-border-width="2px"');

    w.unmount();
  });

  it('an empty value takes the border off again', async () => {
    const w = await editorWith(TABLE);

    api(w).run('table_border_width', '2px');
    await flushPromises();
    api(w).run('table_border_width', '');
    await flushPromises();

    expect(api(w).toHtml()).not.toContain('data-border-width');

    w.unmount();
  });

  it('and clears it to NULL, not to an empty string', async () => {
    /* The HTML looks the same either way - an empty width writes no
       attribute - so this asks the document itself. A node that carries
       `""` puts an empty string into every JSON export and every
       comparison of "has this changed"; absent means absent. */
    const w = await editorWith(TABLE);
    const vm = w.vm as never as { run: (n: string, v?: unknown) => boolean; getJSON: () => unknown };

    vm.run('table_border_width', '2px');
    await flushPromises();
    vm.run('table_border_width', '');
    await flushPromises();

    const json = JSON.stringify(vm.getJSON());
    expect(json).toContain('"borderWidth":null');
    expect(json).not.toContain('"borderWidth":""');

    w.unmount();
  });

  it('refuses when the caret is not in a table', async () => {
    const w = await editorWith('<p>just words</p>');

    expect(api(w).run('table_border_width', '2px')).toBe(false);

    w.unmount();
  });
});

describe('a stored border', () => {
  it('survives being reopened', async () => {
    /* The round trip that N/040 and N/046 were both about: an attribute
       the editor writes and cannot read back is an attribute the next
       save destroys. */
    const w = await editorWith(
      '<table data-border-width="2px" data-border-color="#ffcc00"><tbody><tr><td><p>a</p></td></tr></tbody></table>',
    );
    const out = api(w).toHtml();

    expect(out).toContain('data-border-width="2px"');
    expect(out).toContain('data-border-color="#ffcc00"');

    w.unmount();
  });

  it('is VISIBLE in the editor, not only in the export', async () => {
    /* `toDOM` is not enough here. With column resizing on, a table has
       prosemirror-tables' own node view, which builds the element itself
       and writes `min-width` onto its style - so the attributes this
       schema emits never reach the document being edited, and a border
       showed everywhere except where it was being set. A node
       decoration is the seam the library leaves for that, and custom
       properties inherit, so the cells read it from the wrapper. */
    const w = await editorWith(
      '<table data-border-width="2px" data-border-color="#ffcc00"><tbody><tr><td><p>a</p></td></tr></tbody></table>',
    );
    await w.vm.$nextTick();

    const painted = [...document.querySelectorAll('.ProseMirror *')]
      .map((el) => el.getAttribute('style') || '')
      .join(' ');

    expect(painted, 'nothing in the editor carries the border').toContain('--apex-tbl-bw');
    expect(painted).toContain('--apex-tbl-bc');

    w.unmount();
  });

  it('and a table with no border stays plain', async () => {
    /* Null is not zero: an untouched table is whatever the host
       stylesheet says, and writing `0` for it would be a decision
       nobody made. */
    const w = await editorWith(TABLE);

    const out = api(w).toHtml();
    expect(out).not.toContain('data-border');
    expect(out).not.toContain('style=');

    /* And nothing is painted in the editor either. This does NOT prove
       the plugin skips an unbordered table - prosemirror-view drops an
       empty style attribute, so it would look the same either way, and
       the mutation that removes the skip survives. What it does hold is
       that no stray property lands on a table nobody styled. */
    const wrapper = document.querySelector('.ProseMirror .tableWrapper');
    expect(wrapper?.getAttribute('style') ?? null).toBeNull();

    w.unmount();
  });
});
