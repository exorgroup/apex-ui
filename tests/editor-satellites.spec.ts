import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApexEditorImage from '../src/components/ApexEditorImage.vue';
import ApexEditorLink from '../src/components/ApexEditorLink.vue';
import ApexEditorTableTools from '../src/components/ApexEditorTableTools.vue';
import ApexEditorObjectBar from '../src/components/ApexEditorObjectBar.vue';
import ApexEditorWordCount from '../src/components/ApexEditorWordCount.vue';
import ApexEditorSlash from '../src/components/ApexEditorSlash.vue';
import { DEFAULT_SLASH_ITEMS } from '../src/core/editor/slash';

/**
 * The six satellites mount, and each one opens.
 *
 * They compiled without a single error, which is exactly the state ApexEditor
 * was in before it was first mounted and found to be unmountable. Four of
 * these are dialogs driven by an `openRequest` counter rather than a boolean
 * — a prop that only DOES anything when it changes — so mounting alone
 * exercises the closed path and nothing else. Each test bumps the counter.
 *
 * Two of them <Teleport to="body">, so the wrapper's own tree stays empty
 * once they open and `w.find()` reports nothing. Asserting through the
 * wrapper there is a test that cannot pass no matter how well the dialog
 * works — the assertions for those two read `document.body`.
 */

describe('the editor satellites mount', () => {
  it('the image dialog mounts closed and opens on request', async () => {
    const w = mount(ApexEditorImage, { props: { openRequest: 0 }, attachTo: document.body });
    expect(w.html()).toBeTruthy();
    await w.setProps({ openRequest: 1 });
    await flushPromises();
    expect(document.body.querySelector('input,textarea,button')).toBeTruthy();
    w.unmount();
  });

  it('the link dialog opens and reports what it was given', async () => {
    const w = mount(ApexEditorLink, {
      props: { openRequest: 0, href: 'https://example.com' },
      attachTo: document.body,
    });
    await w.setProps({ openRequest: 1 });
    await flushPromises();
    const field = w.find('input');
    expect(field.exists()).toBe(true);
    expect((field.element as HTMLInputElement).value).toContain('example.com');
    w.unmount();
  });

  it('the word count opens and asks for its numbers', async () => {
    let asked = 0;
    const stats = () => {
      asked += 1;
      return {
        doc: { words: 4, characters: 20, charactersNoSpaces: 17, paragraphs: 1, readingTime: 1 },
        selection: null,
      };
    };
    const w = mount(ApexEditorWordCount, {
      props: { openRequest: 0, stats } as never,
      attachTo: document.body,
    });
    await w.setProps({ openRequest: 1 } as never);
    await flushPromises();
    /* A FUNCTION, not a value: the count has to be read when the dialog
       opens, or it reports whatever the document was when the component was
       created. */
    expect(asked).toBeGreaterThan(0);
    expect(document.body.textContent).toContain('4');
    w.unmount();
  });

  it('the table tools render only what applies', () => {
    const w = mount(ApexEditorTableTools, {
      props: { cell: null, can: { table_delete_row: true }, run: () => true },
    });
    expect(w.html()).toBeTruthy();
    w.unmount();
  });

  it('a disabled table bar disables every button, alignment included', async () => {
    /* `style`, not `styles` — CellStyleState.style is read directly. */
    const cell = { style: {}, selectedCells: 1 };
    const w = mount(ApexEditorTableTools, { props: { cell, run: () => true } as never });
    const live = w.findAll('button').filter((b) => !b.attributes('disabled'));
    expect(live.length, 'nothing enabled to begin with').toBeGreaterThan(0);

    await w.setProps({ disabled: true } as never);
    /* Every one, not just the command buttons. The alignment pair writes a
       style rather than running a named command, so `can` never reached them
       — which is why the prop had to come back rather than being folded into
       the permission map. */
    expect(w.findAll('button').every((b) => b.attributes('disabled') !== undefined)).toBe(true);
    w.unmount();
  });

  it('the object bar draws only when something is selected', async () => {
    const w = mount(ApexEditorObjectBar, { props: { rect: null } });
    /* Two traps in one assertion. The class is `.apex-objbar` and the first
       draft looked for `.apex-edobj`, which the component has never had; and
       the bar is teleported to body, so the wrapper's tree is empty whether
       it draws or not. Either mistake alone makes the negative unfailable.
       No selected object means no bar, not a bar positioned at 0,0. */
    expect(document.body.querySelector('.apex-objbar')).toBeNull();

    await w.setProps({ rect: new DOMRect(10, 20, 100, 40) });
    await flushPromises();
    expect(document.body.querySelector('.apex-objbar')).toBeTruthy();
    w.unmount();
  });

  it('the slash menu is closed until its state says otherwise', async () => {
    const w = mount(ApexEditorSlash, {
      props: { state: null, items: DEFAULT_SLASH_ITEMS, coords: null },
      attachTo: document.body,
    });
    expect(w.text()).not.toContain('Heading 1');

    await w.setProps({
      state: { active: true, from: 1, to: 2, query: '' },
      coords: { x: 10, y: 10 },
    });
    await flushPromises();
    expect(w.text()).toContain('Heading 1');
    w.unmount();
  });

  it('the slash menu filters as the query narrows', async () => {
    const w = mount(ApexEditorSlash, {
      props: {
        state: { active: true, from: 1, to: 2, query: 'quote' },
        items: DEFAULT_SLASH_ITEMS,
        coords: { x: 10, y: 10 },
      },
      attachTo: document.body,
    });
    await flushPromises();
    expect(w.text()).toContain('Quote');
    expect(w.text()).not.toContain('Heading 1');
    w.unmount();
  });
});
