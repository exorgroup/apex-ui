/**
 * The HTML editor's schema.
 *
 * Not a replacement for the prose schema — a SUPERSET of it. Everything the
 * editor has affordances for keeps a real node, so Enter still splits a
 * paragraph and the list button still makes a list. Everything else is carried
 * by a generic element node holding its tag and attributes, so it round-trips
 * byte-for-byte without the editor pretending to understand it.
 *
 * That is what makes the two components share almost everything above the
 * schema: toHtml and fromHtml go through DOMSerializer and DOMParser FROM the
 * schema, so they work on this one by construction, and the toolbars, comments,
 * suggestions and assist seam never look at node types they do not own.
 */
import type { MarkSpec, NodeSpec } from 'prosemirror-model';

/* ─── attribute policy ───────────────────────────────────── */

/**
 * Elements are permissive; attributes are not.
 *
 * Carrying <div class="grid"> is harmless. Carrying onclick makes the editor an
 * injection vector for everyone who can edit a page, which in a CMS is usually
 * many people — so the whitelist does not disappear, it moves from elements to
 * attributes.
 */
const ATTR_ALLOW = /^(?:class|id|style|title|lang|dir|role|hidden|tabindex|colspan|rowspan|headers|scope|abbr|datetime|cite|value|start|reversed|type|width|height|alt|src|srcset|sizes|loading|decoding|href|target|rel|download|name|content|charset|for|placeholder|disabled|readonly|checked|selected|multiple|rows|cols|maxlength|min|max|step|pattern|autocomplete|open|controls|autoplay|loop|muted|poster|preload|allow|allowfullscreen|frameborder|referrerpolicy)$|^(?:data|aria)-/i;

const URL_ATTRS = /^(?:href|src|srcset|action|poster|cite|formaction)$/i;
const SAFE_SCHEME = /^(?:https?:|mailto:|tel:|#|\/|\.\/|\.\.\/|[^:]*$)/i;

/**
 * Inline image data, allow-listed by MEDIA TYPE rather than by scheme.
 *
 * `data:` is how an uploaded file survives with no backend — the documented
 * fallback when the host supplies no upload handler — so it has to be permitted
 * deliberately rather than by widening SAFE_SCHEME, which would also admit
 * `data:text/html` and hand an attacker a same-origin document.
 *
 * `svg+xml` is excluded on purpose: an SVG can carry script, so a data URL of
 * one is an execution vector wearing an image's clothes.
 */
const SAFE_DATA_IMAGE = /^data:image\/(?:png|jpeg|jpg|gif|webp|avif|bmp|x-icon)\s*;/i;
export function safeUrlValue(name: string, value: string) {
  const raw = value.trim();
  if (SAFE_SCHEME.test(raw)) return true;
  /* Only where an image can legitimately be inlined. A data: href is a
     navigation target and stays refused. */
  return /^(?:src|poster)$/i.test(name) && SAFE_DATA_IMAGE.test(raw);
}

/** A style value that a browser could still be talked into fetching from. */
const STYLE_DANGER = /(?:expression\s*\(|javascript\s*:|vbscript\s*:|url\s*\(\s*['"]?\s*(?:javascript|vbscript|data:text\/html))/i;

/* An ALLOW-list, chosen over a deny-list even though it costs fidelity: an
   unknown attribute is dropped rather than trusted, so a custom element's
   flavour="totem" is lost. A deny-list would preserve it and would also have to
   anticipate every future dangerous attribute — and being wrong there is an XSS
   hole, where being wrong here is a missing attribute. The security failure is
   not recoverable; the fidelity one is visible and reportable. */
export function sanitiseAttrs(el: Element): Record<string, string> {
  const out: Record<string, string> = {};
  Array.from(el.attributes).forEach((attr) => {
    const name = attr.name.toLowerCase();
    /* Every on* handler goes, without exception — there is no safe subset. */
    if (name.startsWith('on')) return;
    if (!ATTR_ALLOW.test(name)) return;
    let value = attr.value;
    if (URL_ATTRS.test(name) && !safeUrlValue(name, value)) return;
    if (name === 'style' && STYLE_DANGER.test(value)) {
      /* The declarations are kept and the dangerous ones dropped, rather than the
         whole attribute: a page builder needs its inline styles, and losing all
         of them because one was suspect would break the layout. */
      value = value.split(';')
        .filter((decl) => !STYLE_DANGER.test(decl))
        .join(';');
      if (!value.trim()) return;
    }
    out[name] = value;
  });
  return out;
}

/* The enumerated specs read their OWN attributes — a link mark takes its href
   from its own getAttrs — so sanitiseAttrs, which only builds the extra
   attribute bag, never saw them. That let javascript: through on a real link.
   Guarding here covers every enumerated spec at once rather than patching the
   link, which is the same two-paths-one-guarded shape as the bag itself.

   The RULE is rejected rather than the value blanked: a link with no href is
   not a link, and rejecting leaves the text content intact while discarding
   only the mark. */
function ownAttrsSafe(own: Record<string, unknown>) {
  return Object.keys(own).every((key) => {
    if (!URL_ATTRS.test(key)) return true;
    const value = own[key];
    if (typeof value !== 'string') return true;
    return safeUrlValue(key, value);
  });
}

/**
 * Gives the prose nodes an attribute bag.
 *
 * A paragraph in a page still has to be a paragraph — Enter splits it, the list
 * button wraps it, alignment applies to it — but it also has to carry the class
 * the page put on it, because a block style IS a class and the gallery sets it.
 * So each spec is wrapped rather than replaced: its own parseDOM and toDOM keep
 * working, with the surviving attributes threaded through them.
 */
export function withAttrBag(nodes: Record<string, NodeSpec>): Record<string, NodeSpec> {
  const out: Record<string, NodeSpec> = {};
  Object.entries(nodes).forEach(([name, spec]) => {
    /* doc and text hold no attributes of their own, and text cannot carry a
       class at all — that is what the inline_element mark is for. */
    if (name === 'doc' || name === 'text' || !spec.toDOM) { out[name] = spec; return; }
    /* A PAGE element may carry inline markup even where a DOCUMENT element
       should not. The prose schema restricts a heading to `marks: 'link'` on
       purpose — bold inside a heading is invisible in a document — but here HTML
       is the record: `<h2><span style="color:red">` is legitimate markup an
       author will paste and expect to keep, and that restriction greyed out the
       colour, font and size controls on every heading.

       Widened HERE rather than in schema.ts, so ApexEditor's decision stands and
       only the page editor differs.

       code_block keeps its own `marks: ''`. A `<pre>` holding spans is legal
       HTML, but this node serialises text only, so admitting marks it cannot
       write back would lose them on the round trip — that needs its own slice. */
    const marks = !spec.code && spec.content === 'inline*' ? '_' : spec.marks;
    out[name] = {
      ...spec,
      ...(marks === undefined ? {} : { marks }),
      attrs: { ...(spec.attrs || {}), attrs: { default: {} } },
      parseDOM: (spec.parseDOM || []).map((rule) => ({
        ...rule,
        getAttrs(dom: HTMLElement | string) {
          const own = rule.getAttrs ? rule.getAttrs(dom as never) : {};
          if (own === false) return false;
          if (own && typeof own === 'object' && !ownAttrsSafe(own as Record<string, unknown>)) {
            return false;
          }
          if (typeof dom === 'string') return own || {};
          return { ...(own || {}), attrs: sanitiseAttrs(dom) };
        },
      })),
      toDOM(node: import("prosemirror-model").Node, inline?: boolean) {
        /* Forwarded, because a MARK's toDOM is called with (mark, inline) and
           dropping the second argument would change how it renders. */
        const render = spec.toDOM as unknown as (n: unknown, i?: boolean) => unknown[];
        const base = render(node, inline);
        /* The tag stays whatever the node renders as; only the attributes are
           merged, so a heading is still an h2 and not a div with a class. */
        const bag = (node.attrs.attrs || {}) as Record<string, string>;
        if (!Array.isArray(base)) return base as never;
        const own = (base[1] && typeof base[1] === 'object' && !Array.isArray(base[1]))
          ? base[1] as Record<string, string> : null;
        const merged = { ...bag, ...(own || {}) };
        const rest = own ? base.slice(2) : base.slice(1);
        return [base[0], merged, ...rest] as never;
      },
    };
  });
  return out;
}

/* ─── generic elements ───────────────────────────────────── */

/** Elements that hold nothing, so they must be atoms rather than containers. */
export const VOID_TAGS = [
  'br', 'hr', 'img', 'input', 'source', 'track', 'wbr', 'col', 'embed', 'area', 'base', 'meta', 'link',
];

/**
 * The void elements that are PHRASING content — they belong inside a paragraph.
 *
 * The distinction is not cosmetic. A `<p>` holds `inline*`, so a block-group
 * node cannot live in one: `<p><img></p>` parsed to `<p></p><img>`, the image
 * hoisted out of its own paragraph. For an editor whose source of truth is HTML
 * that is simply wrong output, and it also makes an inline image and
 * alignment-in-flow impossible to express.
 *
 * `br` is absent because hard_break already owns it — a line break carries
 * meaning the generic void node would flatten.
 */
export const INLINE_VOID_TAGS = ['img', 'input', 'wbr', 'embed'];

/** Never carried, whatever the mode: these are executable or page-scoped. */
export const FORBIDDEN_TAGS = ['script', 'noscript', 'style', 'title', 'head', 'html', 'body', 'object', 'applet'];

/**
 * Elements the prose schema already owns. The catch-all must not claim these, or
 * a paragraph would parse as a generic element and lose its affordances.
 */
export const KNOWN_TAGS = [
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'figure', 'figcaption',
  'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'ins', 'a', 'span', 'mark', 'sub', 'sup',
];

function tagAttrs(dom: HTMLElement) {
  return { tag: dom.tagName.toLowerCase(), attrs: sanitiseAttrs(dom) };
}

/**
 * Two generic containers rather than one.
 *
 * A div holding paragraphs and a div holding bare text are different content
 * models, and ProseMirror cannot mix block and inline in one node. Collapsing
 * them would mean wrapping `<div>text</div>` into `<div><p>text</p></div>` and
 * losing fidelity on the most common hand-written case, so the parser chooses by
 * looking at what the element actually contains.
 */
export const htmlNodes: Record<string, NodeSpec> = {
  element: {
    group: 'block',
    content: 'block+',
    attrs: { tag: { default: 'div' }, attrs: { default: {} } },
    defining: true,
    parseDOM: [{
      tag: '*',
      /* Below every specific rule, so it only sees what nothing else claimed. */
      priority: 5,
      getAttrs(dom) {
        const el = dom as HTMLElement;
        const tag = el.tagName.toLowerCase();
        if (KNOWN_TAGS.includes(tag) || VOID_TAGS.includes(tag) || FORBIDDEN_TAGS.includes(tag)) return false;
        /* A container only if it holds block-level children; otherwise the
           textblock variant claims it. */
        const hasBlockChild = Array.from(el.children).some((child) => {
          const t = child.tagName.toLowerCase();
          return !VOID_TAGS.includes(t) && getComputedDisplay(child) !== 'inline';
        });
        return hasBlockChild ? tagAttrs(el) : false;
      },
    }],
    toDOM: (node) => [node.attrs.tag as string, node.attrs.attrs as Record<string, string>, 0],
  },

  element_text: {
    group: 'block',
    content: 'inline*',
    attrs: { tag: { default: 'div' }, attrs: { default: {} } },
    parseDOM: [{
      tag: '*',
      priority: 4,
      getAttrs(dom) {
        const el = dom as HTMLElement;
        const tag = el.tagName.toLowerCase();
        if (KNOWN_TAGS.includes(tag) || VOID_TAGS.includes(tag) || FORBIDDEN_TAGS.includes(tag)) return false;
        return tagAttrs(el);
      },
    }],
    toDOM: (node) => [node.attrs.tag as string, node.attrs.attrs as Record<string, string>, 0],
  },

  void_element: {
    group: 'block',
    atom: true,
    attrs: { tag: { default: 'hr' }, attrs: { default: {} } },
    /* The inline void tags are handed to void_inline below instead. Excluded
       here rather than left to rule priority: two rules matching `img` at
       different priorities is a coin flip to read, and one of them producing a
       block node is the bug this split exists to fix. */
    parseDOM: VOID_TAGS
      .filter((t) => t !== 'br' && !INLINE_VOID_TAGS.includes(t))
      .map((tag) => ({
        tag,
        priority: 6,
        getAttrs: (dom: HTMLElement) => tagAttrs(dom),
      })),
    toDOM: (node) => [node.attrs.tag as string, node.attrs.attrs as Record<string, string>],
  },

  /* The same node, inline. Declared separately rather than by making
     void_element's group conditional, because a node's group is fixed at schema
     build time and the two genuinely differ in where they may appear. */
  void_inline: {
    inline: true,
    group: 'inline',
    atom: true,
    draggable: true,
    attrs: { tag: { default: 'img' }, attrs: { default: {} } },
    parseDOM: INLINE_VOID_TAGS.map((tag) => ({
      tag,
      priority: 6,
      getAttrs: (dom: HTMLElement) => tagAttrs(dom),
    })),
    toDOM: (node) => [node.attrs.tag as string, node.attrs.attrs as Record<string, string>],
  },
};

/* A display lookup that works during parse, when the element is detached and
   getComputedStyle would report nothing useful. */
/* Block-level for the purpose of choosing a content model. It has to include p,
   headings, lists and tables, not only the container tags: the question is whether
   the element holds anything BLOCK-level, and a div holding a heading and a
   paragraph is a container — classifying it as text-only leaves its own children
   unable to fit inside it. */
const BLOCK_ISH = new Set([
  'div', 'section', 'article', 'header', 'footer', 'aside', 'nav', 'main', 'form',
  'fieldset', 'address', 'details', 'summary', 'dialog', 'dl', 'dt', 'dd',
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'figure', 'figcaption', 'hr',
]);
function getComputedDisplay(el: Element): string {
  return BLOCK_ISH.has(el.tagName.toLowerCase()) ? 'block' : 'inline';
}

/**
 * Arbitrary inline elements as a MARK, because `<span class="lead">` applies to a
 * range of text rather than owning a block — the same reason a comment is a mark.
 */
export const htmlMarks: Record<string, MarkSpec> = {
  inline_element: {
    attrs: { tag: { default: 'span' }, attrs: { default: {} } },
    /* Excludes nothing: nested spans with different classes are ordinary. */
    excludes: '',
    parseDOM: [{
      tag: 'span, abbr, cite, dfn, kbd, samp, var, time, small, big, q, bdi, bdo, ruby, rt, rp',
      priority: 3,
      getAttrs: (dom) => tagAttrs(dom as HTMLElement),
    }],
    toDOM: (mark) => [mark.attrs.tag as string, mark.attrs.attrs as Record<string, string>, 0],
  },
};

/** Adds or replaces one class on an attribute bag, leaving the others alone. */
export function withClass(
  attrs: Record<string, string>,
  add: string | null,
  removeSet: string[] = [],
): Record<string, string> {
  const current = (attrs.class || '').split(/\s+/).filter(Boolean);
  /* Only the gallery's OWN classes are swapped out. A class the author put there
     by hand, or one the template needs, is none of the gallery's business. */
  const kept = current.filter((c) => !removeSet.includes(c) && c !== add);
  const next = add ? [...kept, add] : kept;
  const out = { ...attrs };
  if (next.length) out.class = next.join(' ');
  else delete out.class;
  return out;
}
