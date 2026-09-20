import { describe, it, expect } from 'vitest';
import { Schema } from 'prosemirror-model';
import { baseNodes, baseMarks } from '../src/core/editor/schema';
import { tableNodes, createTable, inTable } from '../src/core/editor/tables';
import { mediaNodes, matchEmbed, embedSrc, isImageFile } from '../src/core/editor/media';
import { cleanPastedHtml, looksLikeMarkdown, pastedUrl } from '../src/core/editor/paste';
import { toHtml, fromHtml, toMarkdown, toText, wordCount } from '../src/core/editor/serialise';
import { EditorState } from 'prosemirror-state';

/**
 * AF2-278's six modules, exercised where they are pure.
 *
 * The thorough suite is 287. What this covers is the part of the port that a
 * typecheck cannot reach: a content expression only fails when a Schema is
 * built, a serialiser only disagrees with its parser when something
 * round-trips, and the paste cleaner is entirely string in, string out.
 */

const full = () => new Schema({
  nodes: { ...baseNodes, ...tableNodes, ...mediaNodes },
  marks: baseMarks,
});

describe('tables', () => {
  it('the table nodes make a schema, and a table', () => {
    const schema = full();
    const table = createTable(schema, 3, 4, true);
    expect(table.type.name).toBe('table');
    expect(table.childCount).toBe(3);
    /* Header row asked for, so the first row's cells are header cells. */
    expect(table.firstChild?.firstChild?.type.name).toBe('table_header');
    expect(table.firstChild?.childCount).toBe(4);
    expect(table.lastChild?.firstChild?.type.name).toBe('table_cell');
  });

  it('inTable answers for a selection outside one', () => {
    const schema = full();
    const doc = schema.node('doc', null, [schema.node('paragraph', null, [schema.text('x')])]);
    const state = EditorState.create({ schema, doc });
    expect(inTable(state, schema)).toBe(false);
  });
});

describe('media', () => {
  it('recognises the embed providers it claims to', () => {
    const yt = matchEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(yt?.provider).toBe('youtube');
    expect(yt?.videoId).toBe('dQw4w9WgXcQ');
    expect(embedSrc('youtube', 'dQw4w9WgXcQ')).toContain('dQw4w9WgXcQ');
    expect(matchEmbed('https://example.com/not-a-video')).toBe(null);
  });

  it('isImageFile reads the type, not the name', () => {
    expect(isImageFile({ type: 'image/png', name: 'a.png' } as File)).toBe(true);
    expect(isImageFile({ type: 'application/pdf', name: 'a.png' } as File)).toBe(false);
  });
});

describe('paste', () => {
  it('strips what a word processor adds', () => {
    const word = '<p class="MsoNormal">Real text</p><p class="MsoNormal">&nbsp;</p>'
      + '<o:p></o:p><span style="mso-spacerun:yes">   </span>';
    const out = cleanPastedHtml(word);
    expect(out).toContain('Real text');
    expect(out).not.toContain('o:p');
    expect(out).not.toContain('mso-spacerun');
  });

  it('removes a script rather than escaping it', () => {
    /* The body is inert on purpose. `cleanPastedHtml` parses into a detached
       document via DOMParser, which in a BROWSER cannot run anything — and
       happy-dom runs it anyway. A fixture of `<script>alert(1)</script>`
       fails here with "alert is not a function", from the fixture executing,
       not from the cleaner letting it through. One more entry for the
       happy-dom limits: what this environment can prove is that the element
       is stripped, not that it never ran. */
    const out = cleanPastedHtml('<p>ok</p><script>globalThis.__pasted = 1;</script>');
    expect(out).toContain('ok');
    expect(out.toLowerCase()).not.toContain('<script');
    expect(out).not.toContain('__pasted');
  });

  it('looksLikeMarkdown is conservative', () => {
    expect(looksLikeMarkdown('# A heading\n\nsome text')).toBe(true);
    expect(looksLikeMarkdown('Just a sentence with a * in it')).toBe(false);
  });

  it('pastedUrl recognises a bare url and nothing else', () => {
    expect(pastedUrl('https://example.com')).toBe('https://example.com');
    expect(pastedUrl('  https://example.com  ')).toBe('https://example.com');
    expect(pastedUrl('see https://example.com for more')).toBe(null);
  });
});

describe('serialise', () => {
  const schema = full();
  const doc = () => schema.node('doc', null, [
    schema.node('heading', { level: 2 }, [schema.text('Title')]),
    schema.node('paragraph', null, [
      schema.text('plain '),
      schema.text('bold', [schema.marks.strong.create()]),
    ]),
  ]);

  it('toHtml writes the schema\u2019s own markup', () => {
    const html = toHtml(doc(), schema);
    expect(html).toContain('<h2');
    expect(html).toContain('Title');
    expect(html).toMatch(/<(strong|b)[^>]*>bold</);
  });

  it('html round-trips back to the same text', () => {
    const back = fromHtml(toHtml(doc(), schema), schema);
    expect(back.textContent).toBe('Titleplain bold');
    expect(back.firstChild?.type.name).toBe('heading');
    expect(back.firstChild?.attrs.level).toBe(2);
  });

  it('markdown is the inverse of the parser, not a second opinion', () => {
    const md = toMarkdown(doc(), schema);
    /* Anchored, and the depth asserted exactly. `toContain('## Title')` was
       the first draft and it is satisfied by '### Title' too — a mutation
       that emitted one # too many left it green. */
    expect(md).toMatch(/^## Title$/m);
    expect(md).not.toMatch(/^###/m);
    expect(md).toContain('**bold**');
  });

  it('toText drops the markup and wordCount counts words', () => {
    expect(toText(doc(), schema)).toContain('Title');
    expect(toText(doc(), schema)).not.toContain('<');
    expect(wordCount(doc(), schema)).toBe(3);
  });
});
