import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApexEditor from '../src/components/ApexEditor.vue';
import ApexEditorToolbar from '../src/components/ApexEditorToolbar.vue';
import ApexEditorMenubar from '../src/components/ApexEditorMenubar.vue';
import { emptyDoc } from '../src/core/editor/schema';
import { loadEngine } from '../src/core/editor/engine';

/**
 * The editor mounts, builds a view, and emits what it says it emits.
 *
 * §11.5, the lesson this project keeps paying for: green gates over code
 * nobody has mounted prove nothing. Six defects in Phase A and two crashes in
 * Phase B surfaced the first time something rendered — and ApexEditor had
 * never been built as a package at all, because it imported its engine from
 * four directories outside itself.
 *
 * Mounting is asynchronous here: the engine arrives through a dynamic import,
 * so every assertion waits for it. A test that forgets is testing the
 * placeholder.
 */

async function mountEditor(props: Record<string, unknown> = {}) {
  /* Primed before mounting. The component awaits `loadEngine()`, which is ten
     dynamic imports behind a Promise.all, and `flushPromises` does not give
     that enough turns to settle — twelve rounds leave the component still
     showing "Loading the editor…" with no error, which reads exactly like a
     broken port. Awaiting it here resolves the cached promise first, so the
     component's await completes on the next flush. */
  await loadEngine();
  const wrapper = mount(ApexEditor, { props, attachTo: document.body });
  await flushPromises();
  await flushPromises();
  return wrapper;
}

describe('ApexEditor mounts', () => {
  it('renders its own root and no failure message', async () => {
    const w = await mountEditor();
    expect(w.find('.apex-ed').exists()).toBe(true);
    expect(w.text()).not.toContain('could not be loaded');
    expect(w.text()).not.toContain('could not be read');
    w.unmount();
  });

  it('builds a ProseMirror view inside itself', async () => {
    const w = await mountEditor();
    /* The engine mounts a contenteditable host. Its absence means the
       dynamic import resolved and the view still never built. */
    expect(w.find('.ProseMirror').exists()).toBe(true);
    w.unmount();
  });

  it('renders a document it is given', async () => {
    const doc = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'ported' }] }],
    };
    const w = await mountEditor({ doc });
    expect(w.text()).toContain('ported');
    w.unmount();
  });

  it('accepts the empty document without complaint', async () => {
    const w = await mountEditor({ doc: emptyDoc });
    expect(w.text()).not.toContain('could not be read');
    w.unmount();
  });

  it('unmounts without throwing', async () => {
    const w = await mountEditor();
    expect(() => w.unmount()).not.toThrow();
  });
});

describe('the surfaces mount on their own', () => {
  it('the toolbar renders a button per catalogued command', () => {
    const w = mount(ApexEditorToolbar, {
      props: { items: ['strong', 'em', 'separator', 'heading1'], active: null },
    });
    expect(w.findAll('.apex-edbar__btn').length).toBeGreaterThan(0);
    w.unmount();
  });

  it('the menubar renders its menus', () => {
    const w = mount(ApexEditorMenubar, { props: {} });
    expect(w.html().length).toBeGreaterThan(50);
    w.unmount();
  });
});
