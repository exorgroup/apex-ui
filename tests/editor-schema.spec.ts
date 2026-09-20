import { describe, it, expect } from 'vitest';
import { Schema, DOMSerializer, DOMParser as PMDOMParser } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import * as pmCommands from 'prosemirror-commands';
import * as pmSchemaList from 'prosemirror-schema-list';
import * as pmState from 'prosemirror-state';
import * as pmHistory from 'prosemirror-history';
import { baseNodes, baseMarks, emptyDoc, sameDoc } from '../src/core/editor/schema';
import { htmlNodes, htmlMarks, withAttrBag, safeUrlValue, VOID_TAGS } from '../src/core/editor/htmlSchema';
import { buildCommands, setAlign } from '../src/core/editor/commands';
import { buildKeymap, activeState } from '../src/core/editor/keymap';

/**
 * The five modules of AF2-277 assemble into a working schema.
 *
 * Not the thorough suite — that is AF2-287. This is the check the project
 * keeps learning it needs (§11.5): a module that typechecks has not been
 * mounted. Building the Schema exercises every NodeSpec and MarkSpec in both
 * files at once, because ProseMirror validates content expressions and mark
 * groups at construction — a typo in `content: 'blokc+'` throws here and is
 * invisible to tsc.
 *
 * The engine modules are passed in REAL, not stubbed. A stub of `commands`
 * with two methods on it was the first draft, and it proved only that
 * buildCommands calls what the stub happens to have: the real module has
 * setBlockType, wrapIn, lift and a dozen more, and the stub reported them as
 * green by never reaching them.
 */

const deps = {
  commands: pmCommands, schemaList: pmSchemaList,
  state: pmState, history: pmHistory,
};

const prose = () => new Schema({ nodes: baseNodes, marks: baseMarks });

describe('the base schema', () => {
  it('constructs, which validates every content expression in it', () => {
    const schema = prose();
    expect(Object.keys(schema.nodes).length).toBeGreaterThan(10);
    expect(Object.keys(schema.marks).length).toBeGreaterThan(5);
    expect(schema.topNodeType.name).toBe('doc');
  });

  it('the empty document is valid against it', () => {
    const schema = prose();
    const doc = schema.nodeFromJSON(emptyDoc);
    expect(() => doc.check()).not.toThrow();
    expect(doc.childCount).toBe(1);
    expect(doc.firstChild?.type.name).toBe('paragraph');
  });

  it('sameDoc compares content, not identity', () => {
    expect(sameDoc(emptyDoc, JSON.parse(JSON.stringify(emptyDoc)))).toBe(true);
    expect(sameDoc(emptyDoc, { type: 'doc', content: [] })).toBe(false);
    /* Worth pinning: a document that has been through the schema is NOT equal
       to the constant it was built from, because serialising resolves every
       attribute default. `sameDoc(doc.toJSON(), emptyDoc)` is false. That is
       correct for what it is used for — telling an external change from the
       echo of one we emitted, where both sides have been through the schema —
       and wrong for anything that compares against the constant. */
    expect(sameDoc(prose().nodeFromJSON(emptyDoc).toJSON(), emptyDoc)).toBe(false);
  });

  it('round-trips through the DOM', () => {
    const schema = prose();
    const doc = schema.node('doc', null, [
      schema.node('paragraph', null, [schema.text('hello', [schema.marks.strong.create()])]),
    ]);

    const holder = document.createElement('div');
    holder.appendChild(DOMSerializer.fromSchema(schema).serializeFragment(doc.content));
    expect(holder.innerHTML).toContain('hello');

    const back = PMDOMParser.fromSchema(schema).parse(holder);
    expect(back.textContent).toBe('hello');
    expect(back.firstChild?.firstChild?.marks.map((m) => m.type.name)).toContain('strong');
  });
});

describe('the html schema', () => {
  /* Composed the way ApexHTMLEditor composes it: the prose nodes gain the
     attribute bag first, then the generic element nodes are added. htmlNodes
     alone has no `doc`, so it is not a schema on its own. */
  const html = () => new Schema({
    nodes: { ...withAttrBag(baseNodes), ...htmlNodes },
    marks: { ...withAttrBag(baseMarks as never), ...htmlMarks },
  } as never);

  it('constructs when composed with the prose nodes', () => {
    const schema = html();
    expect(schema.topNodeType.name).toBe('doc');
    expect(Object.keys(schema.nodes)).toContain('element');
  });

  it('the attribute bag is on the nodes that gained it', () => {
    /* The bag is why `<p class="lead">` survives as a paragraph with its
       class rather than as a paragraph with nothing. */
    expect(html().nodes.paragraph.spec.attrs).toHaveProperty('attrs');
  });

  it('void tags are listed', () => {
    expect(VOID_TAGS).toContain('br');
    expect(VOID_TAGS).toContain('img');
    expect(VOID_TAGS).not.toContain('div');
  });

  it('safeUrlValue admits http and refuses javascript:', () => {
    /* Returns a verdict, not a cleaned value. */
    expect(safeUrlValue('href', 'https://example.com')).toBe(true);
    expect(safeUrlValue('href', 'javascript:alert(1)')).toBe(false);
    /* A data: image is allowed where an image can legitimately be inlined,
       and refused as a navigation target. */
    expect(safeUrlValue('src', 'data:image/png;base64,iVBORw0KGgo=')).toBe(true);
    expect(safeUrlValue('href', 'data:image/png;base64,iVBORw0KGgo=')).toBe(false);
  });
});

describe('commands and keymap build against the schema', () => {
  it('buildCommands names an action per mark and block', () => {
    const registry = buildCommands(prose(), deps);
    for (const name of ['strong', 'em', 'code', 'paragraph']) {
      expect(Object.keys(registry), `no command named ${name}`).toContain(name);
    }
    expect(Object.values(registry).every((c) => typeof c === 'function')).toBe(true);
  });

  it('buildKeymap produces bindings keyed by chord', () => {
    const keys = buildKeymap(prose(), deps as never);
    expect(Object.keys(keys).length).toBeGreaterThan(5);
    expect(Object.keys(keys).some((k) => /^Mod-/.test(k))).toBe(true);
  });

  it('activeState reports the marks and block at the cursor', () => {
    const schema = prose();
    const state = EditorState.create({ schema, doc: schema.nodeFromJSON(emptyDoc) });
    const active = activeState(state, schema);
    expect(active.marks.strong).toBe(false);
    expect(active.blockType).toBe('paragraph');
    expect(active.blockMixed).toBe(false);
  });

  it('setAlign writes the attribute, and toggles it off', () => {
    /* The port changed this command's guard from `node.type.attrs` to
       `node.type.spec.attrs` — the resolved attribute map is a runtime
       internal that NodeType does not declare. Equivalent for a presence
       check, but nothing here covered it: mutating the guard to read a
       misspelled name left all twelve tests green. */
    const schema = prose();
    const doc = schema.node('doc', null, [schema.node('paragraph', null, [schema.text('word')])]);
    let state = EditorState.create({ schema, doc });
    const run = (cmd: ReturnType<typeof setAlign>) =>
      cmd(state, (tr) => { state = state.apply(tr); });

    expect(run(setAlign('center'))).toBe(true);
    expect(state.doc.firstChild?.attrs.align).toBe('center');

    /* Setting the alignment already in force clears it, so the button reads
       as a toggle rather than a one-way switch. */
    expect(run(setAlign('center'))).toBe(true);
    expect(state.doc.firstChild?.attrs.align).toBe(null);
  });

  it('a command actually edits the document', () => {
    /* The one that matters: the registry is not just shaped right, it works.
       Toggling strong over a selection has to leave the mark in the doc. */
    const schema = prose();
    const doc = schema.node('doc', null, [schema.node('paragraph', null, [schema.text('word')])]);
    let state = EditorState.create({ schema, doc });
    state = state.apply(state.tr.setSelection(
      pmState.TextSelection.create(state.doc, 1, 5),
    ));

    const registry = buildCommands(schema, deps);
    const ran = registry.strong(state, (tr) => { state = state.apply(tr); });
    expect(ran).toBe(true);
    expect(state.doc.rangeHasMark(1, 5, schema.marks.strong)).toBe(true);
  });
});
