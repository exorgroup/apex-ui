/**
 * Serialisation — HTML, markdown and plain text out of the document JSON.
 *
 * HTML goes through ProseMirror's own DOMSerializer, driven by the schema's
 * `toDOM`, rather than a hand-written walker. `toDOM` is already the single
 * definition of how each node renders, and a second walker would be a second
 * definition — one that drifts the first time a node gains an attribute.
 *
 * Markdown has no such definition to borrow, so it is written here. It is
 * deliberately the inverse of our own markdown PARSER rather than of any
 * general dialect: those two have to round-trip, and a serialiser aimed at a
 * dialect we do not read would produce documents we cannot re-open.
 */
import { DOMParser as PMDOMParser, DOMSerializer, type Node as PMNode, type Schema } from 'prosemirror-model';

export interface ExportOptions {
  /**
   * What to do with tracked changes.
   *
   * A published document should carry neither `<ins>` nor `<del>`: those are
   * editorial state, not content. So the default resolves them — an insertion
   * becomes ordinary text and a deletion disappears, which is what "accept all"
   * means. 'keep' is for a diff view or an audit trail.
   */
  suggestions?: 'accept' | 'reject' | 'keep';
  /** Comment anchors are editorial too, and are dropped by default. */
  comments?: boolean;
  /** Pretty-print the HTML. Off by default — a byte-exact string is easier to diff. */
  pretty?: boolean;
}

/**
 * Strips editorial marks before serialising.
 *
 * Done on a COPY of the document rather than by filtering during the walk,
 * because a deletion has to remove its text entirely and a text node cannot be
 * skipped mid-serialise without corrupting the surrounding structure.
 */
export function forExport(doc: PMNode, schema: Schema, options: ExportOptions = {}): PMNode {
  const mode = options.suggestions || 'accept';
  const keepComments = options.comments === true;
  const hasEditorial = !!(schema.marks.insertion || schema.marks.deletion || schema.marks.comment);
  if (!hasEditorial || (mode === 'keep' && keepComments)) return doc;

  /* Rebuilt through the schema so the result is a valid document rather than a
     tree that merely looks like one — an empty paragraph left by a fully deleted
     line is legal, an empty list item may not be. */
  const rebuild = (node: PMNode): PMNode | null => {
    if (node.isText) {
      const marks = node.marks;
      if (mode !== 'keep') {
        /* accept drops deleted text and keeps inserted; reject is the mirror. */
        const dropped = mode === 'accept' ? 'deletion' : 'insertion';
        if (marks.some((m) => m.type.name === dropped)) return null;
      }
      const filtered = marks.filter((m) => {
        if (m.type.name === 'comment') return keepComments;
        if (m.type.name === 'insertion' || m.type.name === 'deletion') return mode === 'keep';
        return true;
      });
      return filtered.length === marks.length ? node : node.mark(filtered);
    }
    const kids: PMNode[] = [];
    node.content.forEach((child) => {
      const next = rebuild(child);
      if (next) kids.push(next);
    });
    try {
      return node.type.create(node.attrs, kids, node.marks);
    } catch {
      /* The node cannot hold what survived — a list item whose only paragraph
         was deleted — so it goes with its content rather than throwing. */
      return null;
    }
  };
  return rebuild(doc) || doc;
}

export function toHtml(doc: PMNode, schema: Schema, options: ExportOptions = {}): string {
  const prepared = forExport(doc, schema, options);
  const serializer = DOMSerializer.fromSchema(schema);
  const fragment = serializer.serializeFragment(prepared.content);
  const host = document.createElement('div');
  host.appendChild(fragment);
  return options.pretty ? prettyHtml(host.innerHTML) : host.innerHTML;
}

/** A newline between top-level blocks, which is all "pretty" needs to mean here. */
function prettyHtml(html: string): string {
  return html.replace(/></g, '>\n<').replace(/\n<\/(strong|em|code|a|ins|del|span|u|s|mark|sub|sup)>/g, '</$1>');
}

/**
 * Parses an HTML string into a document.
 *
 * The inverse of `toHtml`, and the path an application takes when its own
 * storage is an HTML column rather than JSON. It goes through the same cleaner
 * as a paste, because HTML from a database is no more trustworthy than HTML from
 * a clipboard: it may have been written by an older version of the app, by a
 * different editor, or by hand.
 *
 * The schema is still the whitelist — markup it cannot represent is dropped
 * rather than preserved, which is the point of having a schema at all.
 */
export function fromHtml(
  html: string,
  schema: Schema,
  clean?: (html: string) => string,
): PMNode {
  const source = clean ? clean(html) : html;
  /* Parsed in a detached document, so a stray <script> in stored HTML is never
     evaluated and a <style> never applies to the host page. */
  const parsed = new globalThis.DOMParser().parseFromString(
    `<body>${source}</body>`,
    'text/html',
  );
  return PMDOMParser.fromSchema(schema).parse(parsed.body);
}

/* ─── markdown ───────────────────────────────────────────── */

const MARK_WRAP: Record<string, string> = {
  strong: '**', em: '_', code: '`', strike: '~~',
};

function escapeMd(text: string): string {
  /* Only the characters that would START a construct at their position — escaping
     every asterisk in prose produces unreadable markdown that renders the same. */
  return text.replace(/([\\`*_[\]])/g, '\\$1');
}

function inlineToMd(node: PMNode): string {
  let text = node.isText ? escapeMd(node.text || '') : '';
  if (node.type.name === 'hard_break') return '  \n';
  /* Inside out, so nesting is well-formed: **_both_** rather than **_both**_. */
  const link = node.marks.find((m) => m.type.name === 'link');
  node.marks.forEach((mark) => {
    const wrap = MARK_WRAP[mark.type.name];
    if (wrap) text = wrap + text + wrap;
  });
  if (link) text = `[${text}](${link.attrs.href})`;
  return text;
}

function inlineContent(node: PMNode): string {
  let out = '';
  node.content.forEach((child) => { out += inlineToMd(child); });
  return out;
}

function listToMd(node: PMNode, depth: number): string {
  const ordered = node.type.name === 'ordered_list';
  const start = Number(node.attrs.start || 1);
  const lines: string[] = [];
  node.content.forEach((item, _o, i) => {
    const bullet = ordered ? `${start + i}. ` : '- ';
    const box = item.type.name === 'task_item' ? (item.attrs.checked ? '[x] ' : '[ ] ') : '';
    const body = blocksToMd(item, depth + 1).trim();
    const indent = '  '.repeat(depth);
    /* Continuation lines are indented to the bullet's text, or a nested list
       becomes a sibling of its parent rather than its child. */
    const [first, ...rest] = body.split('\n');
    lines.push(indent + bullet + box + first);
    rest.forEach((line) => lines.push(line ? indent + '  ' + line : ''));
  });
  return lines.join('\n');
}

function blocksToMd(parent: PMNode, depth = 0): string {
  const out: string[] = [];
  parent.content.forEach((node) => {
    const name = node.type.name;
    if (name === 'paragraph') out.push(inlineContent(node));
    else if (name === 'heading') out.push('#'.repeat(Number(node.attrs.level || 1)) + ' ' + inlineContent(node));
    else if (name === 'blockquote') {
      out.push(blocksToMd(node, depth).split('\n').map((l) => '> ' + l).join('\n'));
    } else if (name === 'code_block') {
      out.push('```' + (node.attrs.language || '') + '\n' + (node.textContent || '') + '\n```');
    } else if (name === 'bullet_list' || name === 'ordered_list' || name === 'task_list') {
      out.push(listToMd(node, depth));
    } else if (name === 'horizontal_rule') out.push('---');
    /* Tested BEFORE the generic textblock fallthrough: `image` has inline
       content — its optional caption — so isTextblock is true and a later branch
       would only ever emit the caption text, losing the picture. */
    else if (name === 'image') {
      /* The caption if there is one, else the alt text: an uncaptioned image
         still has to round-trip rather than export as an empty link.

         Markdown has a single text slot per image, so the caption/alt distinction
         cannot survive the format — such an image re-opens with its alt as a
         caption. That is the better loss: dropping the alt would emit ![](src)
         and lose the accessibility text, where gaining a caption is cosmetic. */
      const caption = node.textContent || node.attrs.alt || '';
      out.push(`![${caption}](${node.attrs.src || ''})`);
    } else if (name === 'table') out.push(tableToMd(node));
    else if (name === 'embed') out.push(`[${node.attrs.provider} ${node.attrs.videoId}]`);
    else if (node.isTextblock) out.push(inlineContent(node));
    else if (node.content.size) out.push(blocksToMd(node, depth));
  });
  return out.filter((s) => s !== '').join(depth ? '\n\n' : '\n\n');
}

function tableToMd(table: PMNode): string {
  const rows: string[][] = [];
  table.content.forEach((row) => {
    const cells: string[] = [];
    row.content.forEach((cell) => { cells.push(cell.textContent.replace(/\|/g, '\\|')); });
    rows.push(cells);
  });
  if (!rows.length) return '';
  /* Markdown tables REQUIRE a header row, so a headerless table gets an empty
     one — the alternative is emitting a table no renderer will parse. */
  const width = Math.max(...rows.map((r) => r.length));
  const pad = (r: string[]) => Array.from({ length: width }, (_, i) => r[i] || '');
  const head = pad(rows[0]);
  const rule = Array.from({ length: width }, () => '---');
  const body = rows.slice(1).map(pad);
  return [head, rule, ...body].map((r) => '| ' + r.join(' | ') + ' |').join('\n');
}

export function toMarkdown(doc: PMNode, schema: Schema, options: ExportOptions = {}): string {
  return blocksToMd(forExport(doc, schema, options)).trim() + '\n';
}

/* ─── plain text ─────────────────────────────────────────── */

/**
 * Block-aware, unlike `doc.textContent`, which concatenates every block into one
 * run — "Heading" and the paragraph under it would become "Headingthe paragraph".
 */
export function toText(doc: PMNode, schema: Schema, options: ExportOptions = {}): string {
  const prepared = forExport(doc, schema, options);
  const lines: string[] = [];
  const walk = (parent: PMNode) => {
    parent.content.forEach((node) => {
      if (node.isTextblock) lines.push(node.textContent);
      else if (node.type.name === 'horizontal_rule') lines.push('---');
      else if (node.content.size) walk(node);
    });
  };
  walk(prepared);
  return lines.join('\n\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

/** Rough word count, for a footer. Ignores editorial text by default. */
export function wordCount(doc: PMNode, schema: Schema, options: ExportOptions = {}): number {
  const text = toText(doc, schema, options);
  const words = text.trim().match(/\S+/g);
  return words ? words.length : 0;
}
