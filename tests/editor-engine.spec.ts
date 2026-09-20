import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * The editor engine resolves, and resolves to ONE copy of itself.
 *
 * AF2-276 made prosemirror a dependency of this library — the first runtime
 * dependency it has ever had. Ten packages, declared as optional peers so an
 * app that never mounts an editor is not made to install them.
 *
 * The failure this guards is not "the import throws". It is the quiet one the
 * reference tree's own vendoring notes call out: if two packages each resolve
 * their own copy of `prosemirror-model`, there are two `Node` classes, and
 * every `instanceof` across a package boundary silently returns false. Nothing
 * errors. Documents just stop round-tripping, in ways that look like schema
 * bugs.
 *
 * Cheap to assert, and it fails the moment a version range drifts far enough
 * for npm to deduplicate differently.
 */

const PACKAGES = [
  'prosemirror-model', 'prosemirror-state', 'prosemirror-view',
  'prosemirror-transform', 'prosemirror-keymap', 'prosemirror-commands',
  'prosemirror-history', 'prosemirror-inputrules', 'prosemirror-schema-list',
  'prosemirror-tables',
];

describe('the editor engine', () => {
  it('every package resolves', async () => {
    for (const name of PACKAGES) {
      const mod = await import(/* @vite-ignore */ name);
      expect(Object.keys(mod).length, `${name} imported but exported nothing`).toBeGreaterThan(0);
    }
  });

  it('there is one prosemirror-model, not several', async () => {
    /* Three packages that each depend on it. If any resolved its own copy the
       Node they build would not be an instance of the Node we check against. */
    const { Schema, Node } = await import('prosemirror-model');
    const { EditorState } = await import('prosemirror-state');
    const { addListNodes } = await import('prosemirror-schema-list');
    const OrderedMap = (await import('orderedmap')).default;

    /* addListNodes takes an OrderedMap, not a plain object — it calls
       .append on what it is given. Passing the literal fails with
       "nodes.append is not a function", which reads like a resolution
       problem and is not one. */
    const schema = new Schema({
      nodes: addListNodes(
        OrderedMap.from({
          doc: { content: 'block+' },
          paragraph: { content: 'inline*', group: 'block', toDOM: () => ['p', 0] },
          /* `inline*` matches a GROUP. Text is inline by nature but belongs to
             no group until it is put in one, so without this the content
             expression resolves to nothing. */
          text: { group: 'inline' },
        } as never),
        'paragraph block*',
        'block',
      ),
      marks: {},
    });

    const doc = schema.node('doc', null, [schema.node('paragraph', null, [schema.text('hi')])]);
    expect(doc).toBeInstanceOf(Node);

    /* The boundary that matters: state builds a doc, model has to recognise it. */
    const state = EditorState.create({ schema, doc });
    expect(state.doc).toBeInstanceOf(Node);
    expect(state.doc.textContent).toBe('hi');
  });

  it('a transform produces a document model still recognises', async () => {
    const { Schema, Node } = await import('prosemirror-model');
    const { EditorState } = await import('prosemirror-state');

    const schema = new Schema({
      nodes: {
        doc: { content: 'paragraph+' },
        paragraph: { content: 'inline*', toDOM: () => ['p', 0] },
        text: { group: 'inline' },
      },
      marks: {},
    });
    const state = EditorState.create({
      schema,
      doc: schema.node('doc', null, [schema.node('paragraph', null, [schema.text('one')])]),
    });

    const next = state.apply(state.tr.insertText(' two', state.doc.content.size - 1));
    expect(next.doc).toBeInstanceOf(Node);
    expect(next.doc.textContent).toBe('one two');
  });

  it('no package brought its own copy of another', () => {
    /* The instanceof checks above pass with duplicates present, as long as the
       duplicate is not on the path they happen to exercise. This reads the
       installed tree directly: a nested node_modules under any prosemirror
       package IS the second copy, before any code has a chance to hide it.
       `fs`, and not Vite's glob: the glob form of this was written first and was
       INERT. `import.meta.glob` does not look inside node_modules, so it
       matched nothing, and a planted duplicate left the guard green while
       breaking the three tests around it. The same false all-clear
       zz-hidden-reset and zz-docs-classes were caught by. Reading the
       directory costs this file its place in the typecheck — that is why the
       other fs-based guards are in tsconfig's exclude list, and why this one
       joins them. */
    const root = path.join(__dirname, '..', 'node_modules');
    const nested: string[] = [];
    for (const name of fs.readdirSync(root)) {
      if (!name.startsWith('prosemirror-')) continue;
      const inner = path.join(root, name, 'node_modules');
      if (!fs.existsSync(inner)) continue;
      for (const dup of fs.readdirSync(inner)) nested.push(`${name}/node_modules/${dup}`);
    }
    expect(nested, 'a duplicated engine package — every instanceof across that boundary is false').toEqual([]);
  });

  it('the built bundle does not carry its own copy of the engine', () => {
    /* AF2-279 exported the editor core and dist grew 216KB overnight:
       `rollupOptions.external` named only `vue`, so ten declared peers were
       inlined anyway. Nothing failed. A consumer that also installs
       prosemirror then holds two copies, and the instanceof checks above —
       which pass in this repo, against one copy — are false in their app.
       The externals are derived from peerDependencies now; this is what
       notices if that stops being true.

       Skipped rather than failed when dist is absent: a fresh clone has not
       built yet, and a guard that fails on a clean checkout gets deleted. */
    const bundle = path.join(__dirname, '..', 'dist', 'apex-ui.js');
    if (!fs.existsSync(bundle)) return;
    const src = fs.readFileSync(bundle, 'utf8');

    /* A string from prosemirror-model's own source, not from ours. */
    expect(
      src.includes('looks like multiple versions of prosemirror-model'),
      'prosemirror-model is inlined in dist/apex-ui.js — check rollupOptions.external',
    ).toBe(false);

    /* And the positive: it is imported, so a consumer supplies it. */
    expect(src).toMatch(/from\s*["']prosemirror-model["']/);
  });
});
