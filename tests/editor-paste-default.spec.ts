import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApexEditor from '../src/components/ApexEditor.vue';
import { loadEngine } from '../src/core/editor/engine';

/**
 * Paste works unless someone turns it off — N/036.
 *
 * Reported as "cut and copy seem to work but no paste". It was not
 * ProseMirror and not the clipboard: **Vue casts an absent Boolean prop
 * to `false`**, and this component reads `paste === false` as "plain
 * text only". With no default, every editor ever mounted ran
 * `transformPastedHTML` → `''`.
 *
 * And an empty transform does not fall back to the text, because
 * ProseMirror chooses between the HTML and text branches BEFORE the
 * transform runs: `asText = !!text && (plain || inCode || !html)` is
 * computed while the HTML is still there. So the parse produced an
 * empty slice, `doPaste` called `preventDefault`, and the document was
 * left exactly as it was. Paste had never worked for any consumer of
 * this component.
 *
 * `inputRules` carried the identical trap one prop along
 * (`props.inputRules !== false`), so no `# ` heading, no `- ` list and
 * no smart quotes either. Found only because the first one was
 * understood and its siblings were looked for.
 *
 * These assertions go through `someProp`, which is the path ProseMirror
 * itself takes, rather than reading the props back.
 */

async function editor(props: Record<string, unknown> = {}) {
  await loadEngine();
  const w = mount(ApexEditor, { props, attachTo: document.body });
  await flushPromises();
  await flushPromises();

  return w;
}

const view = (w: { vm: unknown }) => (w.vm as { getView: () => never }).getView() as unknown as {
  someProp: <T>(name: string, f: (prop: never) => T) => T | undefined;
  state: { plugins: unknown[] };
};

/**
 * What the editor would hand ProseMirror for this clipboard HTML.
 *
 * The FUNCTION is fetched and then called, rather than calling it
 * inside `someProp`: someProp returns only a truthy result, so an
 * empty string - the very case this file is about - comes back as
 * `undefined` and cannot be told from a missing prop.
 */
function transformed(w: { vm: unknown }, html: string): string {
  const fn = view(w).someProp('transformPastedHTML', (f) => f) as unknown as
    ((h: string, v: unknown) => string) | undefined;
  expect(fn, 'the editor exposes no paste transform at all').toBeTypeOf('function');

  return fn!(html, view(w));
}

describe('pasting HTML', () => {
  it('survives the transform when nothing was said about pasting', async () => {
    /* The whole bug in one assertion: this returned '' for every
       editor that did not pass the prop. */
    const w = await editor();

    expect(transformed(w, '<p>hello</p>')).toContain('hello');

    w.unmount();
  });

  it('is still cleaned, not merely let through', async () => {
    /* The default must not turn the cleaner off: a Word paste's
       scaffolding is the reason this transform exists. */
    const w = await editor();

    const out = transformed(w, '<p class="MsoNormal"><span style="font-weight:bold">x</span></p>');

    expect(out).toContain('<strong>x</strong>');
    expect(out).not.toContain('MsoNormal');

    w.unmount();
  });

  it('is emptied only when an application asks for plain text', async () => {
    const w = await editor({ paste: false });

    expect(transformed(w, '<p>hello</p>')).toBe('');

    w.unmount();
  });

  it('and options are honoured as before', async () => {
    const w = await editor({ paste: { plainTextOnly: true } });

    expect(transformed(w, '<p>hello</p>')).toBe('');

    w.unmount();
  });
});

describe('input rules', () => {
  /* The plugin's presence is the behaviour: without it no `# ` becomes
     a heading, and there is nothing else to ask. */
  const hasInputRules = (w: { vm: unknown }) =>
    view(w).state.plugins.some((p) => {
      const props = (p as { props?: Record<string, unknown> }).props;

      return !!props && typeof props.handleTextInput === 'function';
    });

  it('are on when nothing was said about them', async () => {
    const w = await editor();

    expect(hasInputRules(w)).toBe(true);

    w.unmount();
  });

  it('are off when an application turns them off', async () => {
    const w = await editor({ inputRules: false });

    expect(hasInputRules(w)).toBe(false);

    w.unmount();
  });
});
