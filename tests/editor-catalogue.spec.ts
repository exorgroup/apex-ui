import { describe as suite, it, expect } from 'vitest';
import { Schema } from 'prosemirror-model';
import * as pmCommands from 'prosemirror-commands';
import * as pmSchemaList from 'prosemirror-schema-list';
import * as pmState from 'prosemirror-state';
import * as pmHistory from 'prosemirror-history';
import * as pmTables from 'prosemirror-tables';
import {
  CATALOGUE, MENUS, DOMAINS, describe as resolve,
  unreachableCommands, uncataloguedCommands,
} from '../src/core/editor/catalogue';
import { DEFAULT_SLASH_ITEMS, filterSlashItems } from '../src/core/editor/slash';
import { commentMark } from '../src/core/editor/comments';
import { suggestionMarks } from '../src/core/editor/suggestions';
import { assistScope } from '../src/core/editor/assist';
import { baseNodes, baseMarks } from '../src/core/editor/schema';
import { tableNodes, buildTableCommands } from '../src/core/editor/tables';
import { buildCommands } from '../src/core/editor/commands';

/**
 * AF2-279's five modules, and the two consistency checks the catalogue
 * already carries.
 *
 * `unreachableCommands` and `uncataloguedCommands` are the interesting part:
 * the module ships both directions of its own invariant and nothing was
 * calling either. A catalogue entry no surface reaches is a command nobody can
 * run; a registry command with no entry is one with no label, no icon and no
 * keyboard hint. Both are silent.
 *
 * `describe` is imported as `resolve` here — vitest's own `describe` is the
 * collision the name invites, and the export list is the reference package's,
 * replicated name for name.
 */

const schema = new Schema({ nodes: { ...baseNodes, ...tableNodes }, marks: baseMarks });
const deps = {
  commands: pmCommands, schemaList: pmSchemaList,
  state: pmState, history: pmHistory, tables: pmTables,
};

suite('the catalogue', () => {
  it('every entry names a domain the catalogue knows', () => {
    const names = Object.keys(CATALOGUE);
    expect(names.length).toBeGreaterThan(40);
    for (const name of names) {
      expect(DOMAINS, `${name} has an unknown domain`).toContain(CATALOGUE[name].domain);
    }
  });

  it('every catalogued command is reachable from a menu', () => {
    /* The module's own invariant, called for the first time. */
    expect(unreachableCommands()).toEqual([]);
  });

  it('every implemented command is in the catalogue', () => {
    /* The other direction. Eighteen commands were missing entries when this
       check was written in the reference tree; the port has to still be
       clean, or a toolbar renders a button with no label. */
    const registry = {
      ...buildCommands(schema, deps),
      ...buildTableCommands(schema, deps),
    };
    expect(uncataloguedCommands(Object.keys(registry))).toEqual([]);
  });

  it('describe resolves a bare command name against the catalogue', () => {
    const item = resolve('strong');
    expect(item.command).toBe('strong');
    expect(item.label).toBe(CATALOGUE.strong.label);
    expect(item.icon).toBe(CATALOGUE.strong.icon);
  });

  it('describe lets a surface override what it resolved', () => {
    const item = resolve({ command: 'strong', label: 'Bold, please' });
    expect(item.label).toBe('Bold, please');
    /* Everything not overridden still comes from the catalogue — that is what
       stops a toolbar and a menu disagreeing about an icon. */
    expect(item.icon).toBe(CATALOGUE.strong.icon);
  });

  it('a separator resolves to a separator and nothing else', () => {
    expect(resolve('separator')).toEqual({ type: 'separator' });
  });

  it('the menus are non-empty and every one is labelled', () => {
    expect(MENUS.length).toBeGreaterThan(3);
    for (const menu of MENUS) {
      expect(menu.label).toBeTruthy();
      expect(menu.items.length).toBeGreaterThan(0);
    }
  });
});

suite('the slash menu', () => {
  it('an empty query returns everything, unreordered', () => {
    expect(filterSlashItems(DEFAULT_SLASH_ITEMS, '')).toEqual(DEFAULT_SLASH_ITEMS);
  });

  it('a label prefix ranks above a keyword match', () => {
    /* 't' is the query that forces a REORDER. "Text" matches by label prefix
       and sits fourth in the source list; "Heading 1" matches only through
       its keyword "title" and sits first. A query like 'head' proves nothing
       — the heading is already first, so ranking and source order agree and
       breaking the ranking leaves the assertion green. */
    const hits = filterSlashItems(DEFAULT_SLASH_ITEMS, 't');
    expect(hits[0].label).toBe('Text');
    expect(hits.findIndex((i) => i.label === 'Heading 1')).toBeGreaterThan(0);
  });

  it('a query nothing matches returns nothing', () => {
    expect(filterSlashItems(DEFAULT_SLASH_ITEMS, 'zzzzz')).toEqual([]);
  });
});

suite('comments, suggestions and assist', () => {
  it('the comment and suggestion marks build into a schema', () => {
    const withMarks = new Schema({
      nodes: baseNodes,
      marks: { ...baseMarks, comment: commentMark, ...suggestionMarks },
    });
    expect(withMarks.marks.comment).toBeTruthy();
    expect(Object.keys(withMarks.marks).length).toBeGreaterThan(Object.keys(baseMarks).length);
  });

  it('assistScope reads the selection, or the whole document when empty', () => {
    const doc = schema.node('doc', null, [
      schema.node('paragraph', null, [schema.text('first')]),
      schema.node('paragraph', null, [schema.text('second')]),
    ]);

    const all = assistScope(doc, { from: 1, to: 1, empty: true });
    expect(all.text).toContain('first');
    expect(all.text).toContain('second');
    expect(all.range.empty).toBe(true);

    const part = assistScope(doc, { from: 1, to: 6, empty: false });
    expect(part.text).toBe('first');
    expect(part.range).toEqual({ from: 1, to: 6, empty: false });
  });
});
