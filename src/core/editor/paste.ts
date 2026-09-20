/**
 * Paste and sanitisation.
 *
 * The schema is already the whitelist — ProseMirror's parser drops anything it
 * cannot represent — so this is not a security layer bolted on top. What it does
 * is repair the *shape* of what real editors put on the clipboard, before the
 * parser sees it, because the parser will faithfully preserve nonsense that is
 * technically valid.
 *
 * Every rule here exists because a specific source produces a specific mess:
 * Word wraps everything in mso-styled spans, Google Docs marks bold with
 * `font-weight:700` on a span rather than a tag, and both emit `<b>` wrappers
 * around whole documents that would make every pasted paragraph bold.
 */

export interface PasteOptions {
  /** Strip all formatting and paste as plain text. */
  plainTextOnly?: boolean;
  /** Detect markdown in pasted plain text and parse it. */
  parseMarkdown?: boolean;
  /** Turn a pasted bare URL into a link on the selected text. */
  linkOnPaste?: boolean;
  /** Extra tags to strip outright, beyond the defaults. */
  stripTags?: string[];
  /**
   * Keep `<p></p>` instead of treating it as Word's spacer.
   *
   * On a PASTE an empty paragraph is noise — Word emits one between every
   * block. In a document being LOADED it is a blank line the author typed, and
   * dropping it silently closed up their spacing the next time they opened the
   * record.
   */
  keepEmptyParagraphs?: boolean;
}

/**
 * Tags removed before parsing.
 *
 * The schema would ignore them anyway, but a `<style>` block's *text content*
 * would survive as a paragraph of CSS — the parser drops the element it does not
 * know and keeps the text inside it.
 */
const DROP_TAGS = ['style', 'script', 'meta', 'link', 'title', 'head', 'noscript', 'iframe', 'object', 'embed'];

/** Attributes that carry script, or absolute layout that means nothing here. */
const DROP_ATTR_PREFIX = ['on'];
const DROP_ATTRS = ['class', 'id', 'style', 'width', 'height', 'align', 'valign', 'bgcolor', 'lang', 'dir'];

/* Styles worth reading before the attribute is discarded: they are the only
   record of bold and italic in Google Docs and Word output. */
const KEEP_STYLE_INTENT: { style: RegExp; tag: string }[] = [
  { style: /font-weight:\s*(bold|[6-9]\d{2})/i, tag: 'strong' },
  { style: /font-style:\s*italic/i, tag: 'em' },
  { style: /text-decoration[^;]*:\s*[^;]*underline/i, tag: 'u' },
  { style: /text-decoration[^;]*:\s*[^;]*line-through/i, tag: 's' },
  { style: /vertical-align:\s*super/i, tag: 'sup' },
  { style: /vertical-align:\s*sub/i, tag: 'sub' },
];

function isOfficeWrapper(el: Element): boolean {
  /* Word and Docs wrap a whole selection in <b style="font-weight:normal"> —
     the tag says bold and the style says otherwise, and taking the tag at its
     word makes the entire paste bold. */
  if (el.tagName !== 'B' && el.tagName !== 'STRONG') return false;
  const style = el.getAttribute('style') || '';
  return /font-weight:\s*normal/i.test(style);
}

/**
 * Rewrites style-implied formatting into real tags, then strips the attribute.
 *
 * Done as a rewrite rather than by teaching the schema more `parseDOM` style
 * rules, because the intent has to survive being wrapped: a Docs span carrying
 * both weight and italic becomes `<strong><em>`, where a style rule per mark
 * would each match the same element and only the last would apply.
 */
function preserveStyleIntent(el: Element, doc: Document): Element {
  const style = el.getAttribute('style');
  if (!style) return el;
  const wanted = KEEP_STYLE_INTENT.filter((rule) => rule.style.test(style));
  if (!wanted.length) return el;

  let inner: Element = el;
  wanted.forEach((rule) => {
    const wrap = doc.createElement(rule.tag);
    /* Wrapping the children rather than the element itself, so the original
       element can still be unwrapped or dropped afterwards. */
    while (inner.firstChild) wrap.appendChild(inner.firstChild);
    inner.appendChild(wrap);
    inner = wrap;
  });
  return el;
}

/** Cleans a clipboard HTML fragment in place. */
export function cleanPastedHtml(html: string, options: PasteOptions = {}): string {
  if (typeof document === 'undefined') return html;
  /* Parsed in a detached document, so nothing in it can run, load or match the
     page's own selectors while we work on it. */
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const drop = new Set([...DROP_TAGS, ...(options.stripTags || [])].map((t) => t.toUpperCase()));

  /* Depth-first over a static list: the walk mutates the tree, and a live
     NodeList would skip siblings as elements are removed. */
  const all = Array.from(doc.body.querySelectorAll('*'));

  all.forEach((el) => {
    if (!el.isConnected) return;
    if (drop.has(el.tagName)) { el.remove(); return; }

    /* Word's conditional-comment scaffolding, and Docs' internal wrappers. */
    if (el.tagName === 'O:P' || el.tagName.startsWith('W:') || el.tagName.startsWith('O:')) {
      el.remove();
      return;
    }

    preserveStyleIntent(el, doc);

    if (isOfficeWrapper(el)) {
      /* Unwrap rather than remove: the content is the paste. */
      const parent = el.parentNode;
      while (el.firstChild) parent?.insertBefore(el.firstChild, el);
      el.remove();
      return;
    }

    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (DROP_ATTR_PREFIX.some((p) => name.startsWith(p))) { el.removeAttribute(attr.name); return; }
      if (DROP_ATTRS.includes(name)) { el.removeAttribute(attr.name); return; }
      /* A javascript: or data: href survives the schema, which only checks that
         the attribute exists — so the scheme is checked here. */
      if ((name === 'href' || name === 'src') && /^\s*(javascript|data|vbscript):/i.test(attr.value)) {
        el.removeAttribute(attr.name);
      }
    });

    /* A span with nothing left to say is noise; its children are the content. */
    if (el.tagName === 'SPAN' && !el.attributes.length) {
      const parent = el.parentNode;
      while (el.firstChild) parent?.insertBefore(el.firstChild, el);
      el.remove();
      return;
    }

    /* An empty paragraph from Word is a spacer, not a paragraph: Word emits one
       between every block, and keeping them doubles the length of the document.
       Not so in a stored document, where the author pressed Enter twice on
       purpose — hence the option. */
    if (!options.keepEmptyParagraphs
      && el.tagName === 'P' && !el.textContent?.trim() && !el.querySelector('img,br')) {
      el.remove();
    }
  });

  return doc.body.innerHTML;
}

/* ─── markdown ───────────────────────────────────────────── */

/**
 * Whether pasted plain text is markdown worth parsing.
 *
 * Deliberately strict. A paragraph mentioning "the * character" or a line
 * starting with "- " in prose is not markdown, and converting it silently
 * rewrites what someone pasted. The test is for *structure*: a heading, a fence,
 * or several list items — signals that are hard to produce by accident.
 */
export function looksLikeMarkdown(text: string): boolean {
  if (!text || text.length < 3) return false;
  const lines = text.split('\n');
  const heading = lines.some((l) => /^#{1,6}\s\S/.test(l));
  const fence = /^```/m.test(text);
  const listItems = lines.filter((l) => /^\s*([-*+]|\d+\.)\s\S/.test(l)).length;
  const table = lines.filter((l) => /^\|.*\|\s*$/.test(l)).length >= 2;
  /* Two or more list items, because one is just a sentence with a dash. */
  return heading || fence || table || listItems >= 2;
}

interface MarkdownNode { type: string; attrs?: Record<string, unknown>; content?: MarkdownNode[]; text?: string; marks?: unknown[] }

/**
 * A small block-level markdown parser.
 *
 * Ours rather than a dependency, because the whole point of the JSON schema is
 * that we control what a document can be — and a general markdown library
 * produces nodes we would then have to map, discard or invent schema for. This
 * handles the constructs the schema actually has.
 */
export function parseMarkdown(text: string): MarkdownNode {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const blocks: MarkdownNode[] = [];
  let i = 0;

  const inline = (raw: string): MarkdownNode[] => {
    const out: MarkdownNode[] = [];
    /* One pass, longest delimiters first, so ** is not read as two *. */
    const pattern = /(\*\*|__)(.+?)\1|(\*|_)(.+?)\3|`([^`]+)`|~~(.+?)~~|\[([^\]]+)\]\(([^)]+)\)/;
    let rest = raw;
    let guard = 0;
    while (rest && guard < 500) {
      guard += 1;
      const m = pattern.exec(rest);
      if (!m) { out.push({ type: 'text', text: rest }); break; }
      if (m.index > 0) out.push({ type: 'text', text: rest.slice(0, m.index) });
      if (m[2]) out.push({ type: 'text', text: m[2], marks: [{ type: 'strong' }] });
      else if (m[4]) out.push({ type: 'text', text: m[4], marks: [{ type: 'em' }] });
      else if (m[5]) out.push({ type: 'text', text: m[5], marks: [{ type: 'code' }] });
      else if (m[6]) out.push({ type: 'text', text: m[6], marks: [{ type: 'strike' }] });
      else if (m[7]) {
        out.push({ type: 'text', text: m[7], marks: [{ type: 'link', attrs: { href: m[8] } }] });
      }
      rest = rest.slice(m.index + m[0].length);
    }
    return out.filter((n) => n.text);
  };

  const para = (raw: string): MarkdownNode => {
    const content = inline(raw);
    return content.length ? { type: 'paragraph', content } : { type: 'paragraph' };
  };

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i += 1; continue; }

    const fence = /^```(\w*)/.exec(line);
    if (fence) {
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !/^```/.test(lines[i])) { body.push(lines[i]); i += 1; }
      i += 1;
      blocks.push({
        type: 'code_block',
        attrs: { language: fence[1] || null },
        content: body.length ? [{ type: 'text', text: body.join('\n') }] : undefined,
      });
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      blocks.push({ type: 'heading', attrs: { level: heading[1].length }, content: inline(heading[2]) });
      i += 1;
      continue;
    }

    /* A line that is only an image is a BLOCK image, which is the shape the

       serialiser emits — without this the two are not inverses and an exported

       document re-opens with its pictures as literal text. */

    const onlyImage = /^\s*!\[([^\]]*)\]\(([^)\s]+)\)\s*$/.exec(line);

    if (onlyImage) {

      const caption = onlyImage[1];

      blocks.push({

        type: 'image',

        attrs: { src: onlyImage[2], alt: caption || null, width: null, align: null },

        /* The caption is content, and absent content means an UNCAPTIONED image —

           a different thing from an empty caption. */

        content: caption ? [{ type: 'text', text: caption }] : undefined,

      });

      i += 1;

      continue;

    }

    if (/^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/.test(line)) {
      blocks.push({ type: 'horizontal_rule' });
      i += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const body: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { body.push(lines[i].replace(/^>\s?/, '')); i += 1; }
      blocks.push({ type: 'blockquote', content: [para(body.join(' '))] });
      continue;
    }

    const task = /^\s*[-*+]\s+\[( |x|X)\]\s+(.*)$/.exec(line);
    if (task) {
      const items: MarkdownNode[] = [];
      while (i < lines.length) {
        const t = /^\s*[-*+]\s+\[( |x|X)\]\s+(.*)$/.exec(lines[i]);
        if (!t) break;
        items.push({
          type: 'task_item',
          attrs: { checked: t[1].toLowerCase() === 'x' },
          content: [para(t[2])],
        });
        i += 1;
      }
      blocks.push({ type: 'task_list', content: items });
      continue;
    }

    const bullet = /^\s*[-*+]\s+(.*)$/.exec(line);
    if (bullet) {
      const items: MarkdownNode[] = [];
      while (i < lines.length) {
        const b = /^\s*[-*+]\s+(.*)$/.exec(lines[i]);
        if (!b || /^\s*[-*+]\s+\[( |x|X)\]/.test(lines[i])) break;
        items.push({ type: 'list_item', content: [para(b[1])] });
        i += 1;
      }
      blocks.push({ type: 'bullet_list', attrs: { tight: true }, content: items });
      continue;
    }

    const ordered = /^\s*(\d+)\.\s+(.*)$/.exec(line);
    if (ordered) {
      const items: MarkdownNode[] = [];
      const start = Number(ordered[1]);
      while (i < lines.length) {
        const o = /^\s*(\d+)\.\s+(.*)$/.exec(lines[i]);
        if (!o) break;
        items.push({ type: 'list_item', content: [para(o[2])] });
        i += 1;
      }
      blocks.push({ type: 'ordered_list', attrs: { order: start, tight: true }, content: items });
      continue;
    }

    /* Consecutive non-blank lines are one paragraph, which is what markdown
       means by them — a hard break needs two trailing spaces or a blank line. */
    const body: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|```|>|\s*[-*+]\s|\s*\d+\.\s)/.test(lines[i])) {
      body.push(lines[i].trim());
      i += 1;
    }
    blocks.push(para(body.join(' ')));
  }

  return { type: 'doc', content: blocks.length ? blocks : [{ type: 'paragraph' }] };
}

/* ─── links ──────────────────────────────────────────────── */

const URL_ONLY = /^\s*(https?:\/\/[^\s]+|www\.[^\s]+)\s*$/i;

/** A pasted URL over a selection means "link this", not "replace it". */
export function pastedUrl(text: string): string | null {
  const match = URL_ONLY.exec(text);
  if (!match) return null;
  const url = match[1];
  return /^www\./i.test(url) ? `https://${url}` : url;
}
