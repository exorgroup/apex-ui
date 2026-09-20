import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApexEditor from '../src/components/ApexEditor.vue';
import { loadEngine } from '../src/core/editor/engine';

/**
 * A table of a chosen size — N/021.
 *
 * `ApexHTMLEditor` has had `insertTable(rows, cols)` since its table
 * picker was built; `ApexEditor` had nothing, so its `#table` toolbar
 * slot had no way to drive `ApexEditorTableGrid` and a caller that
 * mounted the picker got a control that could not insert anything. The
 * two editors' slots take the same control, so they need the same seam.
 *
 * The registry's own `table_insert` stays a fixed 3x3: right for a
 * keystroke, wrong for a toolbar, where the shape is the first thing an
 * author decides.
 */

async function editor(props: Record<string, unknown> = {}) {
  await loadEngine();
  const w = mount(ApexEditor, { props: { tables: true, ...props }, attachTo: document.body });
  await flushPromises();
  await flushPromises();

  return w;
}

const api = (w: { vm: unknown }) => w.vm as {
  insertTable: (r: number, c: number) => boolean;
  toHtml: () => string;
};

describe('inserting a table at a chosen size', () => {
  it('makes the shape it was asked for', async () => {
    const w = await editor();

    expect(api(w).insertTable(2, 3)).toBe(true);
    await w.vm.$nextTick();

    const html = api(w).toHtml();
    expect((html.match(/<tr>/g) || []).length).toBe(2);
    expect((html.match(/<t[hd][ >]/g) || []).length).toBe(6);

    w.unmount();
  });

  it('gives it a header row, like the registry default does', async () => {
    /* Both paths go through the shared `createTable`, so a picked size
       and a 3x3 from the keyboard cannot produce different structures. */
    const w = await editor();

    api(w).insertTable(2, 2);
    await w.vm.$nextTick();

    expect(api(w).toHtml()).toContain('<th');

    w.unmount();
  });

  it('refuses a nonsense size rather than making an empty table', async () => {
    const w = await editor();

    api(w).insertTable(0, 0);
    await w.vm.$nextTick();

    const html = api(w).toHtml();
    expect((html.match(/<tr>/g) || []).length).toBe(1);
    expect((html.match(/<t[hd][ >]/g) || []).length).toBe(1);

    w.unmount();
  });

  it('is offered to the toolbar slot, which is where the picker lives', async () => {
    /* The slot is the only place a `#table` control can reach it. */
    let seen: unknown = 'never rendered';
    const w = await editor({}, );
    w.unmount();

    const w2 = mount(ApexEditor, {
      props: { tables: true },
      slots: { toolbar: (p: { insertTable: unknown }) => { seen = p.insertTable; return ''; } },
      attachTo: document.body,
    });
    await flushPromises();

    expect(typeof seen).toBe('function');

    w2.unmount();
  });

  it('does nothing without the tables schema', async () => {
    const w = await editor({ tables: false });

    expect(api(w).insertTable(2, 2)).toBe(false);
    expect(api(w).toHtml()).not.toContain('<table');

    w.unmount();
  });
});
