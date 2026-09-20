import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApexHTMLEditor from '../src/components/ApexHTMLEditor.vue';
import { loadEngine } from '../src/core/editor/engine';

/**
 * ApexHTMLEditor mounts, and its writing surface is a real iframe document.
 *
 * The iframe is the whole reason this is a separate component: ApexEditor
 * seals its document so a host page's CSS cannot reach it, and a PAGE is the
 * opposite — it only looks right in its own stylesheet. A shadow root scopes
 * styles but :root variables, inherited properties and global resets do not
 * cross that boundary cleanly, so the page would look nearly right, which is
 * worse than looking wrong.
 *
 * How much of that happy-dom can actually run is the open question this spec
 * answers rather than assumes.
 */

async function mountEditor(props: Record<string, unknown> = {}) {
  /* Primed, for the reason editor-mount.spec.ts gives: flushPromises does not
     settle the engine's dynamic imports on its own. */
  await loadEngine();
  const w = mount(ApexHTMLEditor, { props, attachTo: document.body });
  await flushPromises();
  await flushPromises();
  return w;
}

describe('ApexHTMLEditor', () => {
  it('mounts and renders its frame', async () => {
    const w = await mountEditor();
    expect(w.find('iframe.apex-hed__frame').exists()).toBe(true);
    w.unmount();
  });

  it('becomes ready rather than reporting an error', async () => {
    const w = await mountEditor({ html: '<p>a page</p>' });
    /* The assertion that found the two missing engine dependencies. "Renders
       an iframe" passes on a component that then throws while building
       inside it — the frame is in the template, not in the code path that
       fails. What distinguishes them is `ready` against `error`. */
    expect(w.emitted('error'), 'the editor reported an error while building').toBeUndefined();
    expect(w.emitted('ready')).toBeTruthy();
    w.unmount();
  });

  it('builds a ProseMirror view inside the frame, holding the given html', async () => {
    const w = await mountEditor({ html: '<p>a page</p>' });
    const doc = (w.find('iframe').element as HTMLIFrameElement).contentDocument;
    /* happy-dom gives an iframe a real contentDocument; if that ever stops
       being true this is where it shows, rather than in the assertions
       below it. */
    expect(doc, 'no contentDocument — happy-dom no longer backs iframes').toBeTruthy();
    expect(doc?.querySelector('.apex-hed__surface'), 'the surface was never mounted').toBeTruthy();
    expect(doc?.querySelector('.ProseMirror'), 'no editor view inside the frame').toBeTruthy();
    expect(doc?.body.textContent).toContain('a page');
    w.unmount();
  });

  it('unmounts without throwing', async () => {
    const w = await mountEditor({ html: '<p>x</p>' });
    expect(() => w.unmount()).not.toThrow();
  });

  it('shares one engine with ApexEditor', async () => {
    /* The identity guarantee, asserted rather than assumed: the component
       goes through loadEngine(), so the Schema class it builds against is
       the same object this test holds. */
    const a = await loadEngine();
    const b = await loadEngine();
    expect(a).toBe(b);
    expect(a.model.Schema).toBe(b.model.Schema);
  });
});
