/**
 * Editor schema.
 *
 * The schema is the document's grammar, and it is deliberately declared here
 * rather than assembled from toolbar configuration: what a document may contain
 * has to be decidable without knowing which buttons a particular editor shows.
 * A toolbar can be missing its bold button while the document still holds bold
 * text from a paste, and both must remain valid.
 *
 * Slice 1 carries the nodes and marks a document cannot do without. Later slices
 * add to this object rather than replacing it.
 */
import type { NodeSpec, MarkSpec } from 'prosemirror-model';

/**
 * Alignment round-trips through a data attribute rather than an inline style, so
 * the document carries the author's intent and the stylesheet owns how it looks.
 * The style is still READ on the way in, because pasted HTML uses it.
 */
export type Align = 'left' | 'center' | 'right' | 'justify' | null;

function alignFrom(node: HTMLElement): Align {
  const attr = node.getAttribute('data-align') || node.style.textAlign;
  return (attr === 'center' || attr === 'right' || attr === 'justify' || attr === 'left')
    ? attr : null;
}
/* Returns an empty object rather than null when there is no alignment: a
   DOMOutputSpec treats a null second slot as a CHILD node, and the renderer then
   reads nodeType off it. */
function alignAttrs(align: Align): Record<string, string> {
  return align ? { 'data-align': align } : {};
}

/* Blocks are ordered by how a document reads: the paragraph first, since it is
   what everything degrades to. */
export const baseNodes: Record<string, NodeSpec> = {
  doc: { content: 'block+' },

  paragraph: {
    content: 'inline*',
    group: 'block',
    /* Alignment is an attribute of the block, not a mark: half a paragraph
       cannot be centred, so expressing it as a mark would allow a document that
       cannot be rendered. */
    attrs: { align: { default: null } },
    parseDOM: [{
      tag: 'p',
      getAttrs: (node) => ({ align: alignFrom(node as HTMLElement) }),
    }],
    toDOM: (node) => ['p', alignAttrs(node.attrs.align), 0],
  },

  heading: {
    attrs: { level: { default: 1 }, align: { default: null } },
    content: 'inline*',
    group: 'block',
    /* A heading holds no marks of its own: bold inside a heading is invisible,
       and allowing it means round-tripping styling nobody can see. */
    marks: 'link',
    defining: true,
    parseDOM: [1, 2, 3, 4, 5, 6].map((level) => ({
      tag: `h${level}`,
      getAttrs: (node) => ({ level, align: alignFrom(node as HTMLElement) }),
    })),
    toDOM: (node) => [`h${node.attrs.level}`, alignAttrs(node.attrs.align), 0],
  },

  blockquote: {
    content: 'block+',
    group: 'block',
    defining: true,
    parseDOM: [{ tag: 'blockquote' }],
    toDOM: () => ['blockquote', 0],
  },

  horizontal_rule: {
    group: 'block',
    parseDOM: [{ tag: 'hr' }],
    toDOM: () => ['hr'],
  },

  /* Lists are three nodes, not one: the list is the container, the item is the
     row, and the item holds BLOCKS rather than inline content — which is what
     lets a list item contain a paragraph and a nested list at once. */
  bullet_list: {
    content: 'list_item+',
    group: 'block',
    attrs: { tight: { default: true } },
    parseDOM: [{ tag: 'ul', getAttrs: (node) => ({ tight: (node as HTMLElement).hasAttribute('data-tight') }) }],
    toDOM: (node) => ['ul', { 'data-tight': node.attrs.tight ? '' : null }, 0],
  },

  ordered_list: {
    content: 'list_item+',
    group: 'block',
    attrs: { order: { default: 1 }, tight: { default: true } },
    parseDOM: [{
      tag: 'ol',
      getAttrs: (node) => ({
        /* A list starting at 5 is a continuation of an earlier one, and losing
           that renumbers someone's document. */
        order: (node as HTMLElement).hasAttribute('start')
          ? Number((node as HTMLElement).getAttribute('start')) : 1,
        tight: (node as HTMLElement).hasAttribute('data-tight'),
      }),
    }],
    toDOM: (node) => ['ol', {
      start: node.attrs.order === 1 ? null : node.attrs.order,
      'data-tight': node.attrs.tight ? '' : null,
    }, 0],
  },

  list_item: {
    content: 'block+',
    defining: true,
    parseDOM: [{ tag: 'li' }],
    toDOM: () => ['li', 0],
  },

  /* A task list is its own node rather than a bullet list with a checkbox mark:
     the checked state belongs to the item, and a mark would let it apply to
     half a row. */
  task_list: {
    content: 'task_item+',
    group: 'block',
    /* PRIORITY, or a saved task list comes back a bullet list. The parser
       takes rules in schema order and `bullet_list`'s plain `ul` is declared
       first, so it claimed `<ul data-task-list>` before this rule was ever
       tried: the editor WROTE task lists it could not READ, and reopening a
       document quietly demoted every one of them. The same trap as the empty
       paragraph — a round trip nobody had measured. */
    parseDOM: [{ tag: 'ul[data-task-list]', priority: 60 }],
    toDOM: () => ['ul', { 'data-task-list': '' }, 0],
  },

  task_item: {
    content: 'block+',
    attrs: { checked: { default: false } },
    defining: true,
    parseDOM: [{
      /* Above `list_item`'s plain `li`, for the reason `task_list` gives. */
      tag: 'li[data-checked]',
      priority: 60,
      getAttrs: (node) => ({ checked: (node as HTMLElement).getAttribute('data-checked') === 'true' }),
    }],
    toDOM: (node) => ['li', { 'data-checked': String(!!node.attrs.checked) }, 0],
  },

  code_block: {
    content: 'text*',
    marks: '',
    group: 'block',
    code: true,
    defining: true,
    attrs: { language: { default: null } },
    /* preserveWhitespace full, because indentation IS the content of code and
       collapsing it would break every pasted snippet. */
    parseDOM: [{
      tag: 'pre',
      preserveWhitespace: 'full',
      getAttrs: (node) => ({
        language: (node as HTMLElement).getAttribute('data-language')
          || ((node as HTMLElement).querySelector('code')?.className.match(/language-(\S+)/) || [])[1]
          || null,
      }),
    }],
    toDOM: (node) => ['pre', { 'data-language': node.attrs.language },
      ['code', { class: node.attrs.language ? `language-${node.attrs.language}` : null }, 0]],
  },

  text: { group: 'inline' },

  /* Inline, not a block: a line break inside a paragraph is a different thing
     from a new paragraph, and conflating them loses the author's intent. */
  hard_break: {
    inline: true,
    group: 'inline',
    selectable: false,
    parseDOM: [{ tag: 'br' }],
    toDOM: () => ['br'],
  },
};

export const baseMarks: Record<string, MarkSpec> = {
  strong: {
    /* Both the tag and the computed weight, because pasted HTML uses either and
       a document that only understood <strong> would silently drop half of it. */
    parseDOM: [
      { tag: 'strong' },
      { tag: 'b', getAttrs: (node) => (node as HTMLElement).style.fontWeight !== 'normal' && null },
      { style: 'font-weight', getAttrs: (value) => /^(bold(er)?|[5-9]\d{2,})$/.test(value as string) && null },
    ],
    toDOM: () => ['strong', 0],
  },

  em: {
    parseDOM: [
      { tag: 'i' },
      { tag: 'em' },
      { style: 'font-style=italic' },
    ],
    toDOM: () => ['em', 0],
  },

  code: {
    /* Excludes everything: code is a statement that the text is literal, so
       bold or italic inside it would contradict the mark. */
    excludes: '_',
    code: true,
    parseDOM: [{ tag: 'code' }],
    toDOM: () => ['code', 0],
  },

  underline: {
    /* Its own mark rather than reusing em: underline means something different
       from emphasis, and a document that conflated them could not export either
       faithfully. */
    parseDOM: [{ tag: 'u' }, { style: 'text-decoration=underline' }],
    toDOM: () => ['u', 0],
  },

  strike: {
    parseDOM: [
      { tag: 's' }, { tag: 'del' }, { tag: 'strike' },
      { style: 'text-decoration=line-through' },
    ],
    toDOM: () => ['s', 0],
  },

  highlight: {
    /* The colour is a NAME, not a hex value: a document storing #FFF3A0 cannot
       follow a theme into dark mode, where a named tone can. */
    attrs: { color: { default: 'yellow' } },
    parseDOM: [{
      tag: 'mark',
      getAttrs: (node) => ({ color: (node as HTMLElement).getAttribute('data-color') || 'yellow' }),
    }],
    toDOM: (mark) => ['mark', { 'data-color': mark.attrs.color }, 0],
  },

  /* Sub and sup exclude each other: text cannot be both, and allowing the pair
     would render as whichever the stylesheet happened to apply last. */
  subscript: {
    excludes: 'subscript superscript',
    parseDOM: [{ tag: 'sub' }, { style: 'vertical-align=sub' }],
    toDOM: () => ['sub', 0],
  },

  superscript: {
    excludes: 'subscript superscript',
    parseDOM: [{ tag: 'sup' }, { style: 'vertical-align=super' }],
    toDOM: () => ['sup', 0],
  },

  link: {
    attrs: {
      href: {},
      title: { default: null },
      target: { default: null },
    },
    inclusive: false,
    parseDOM: [{
      tag: 'a[href]',
      getAttrs: (node) => ({
        href: (node as HTMLElement).getAttribute('href'),
        title: (node as HTMLElement).getAttribute('title'),
        target: (node as HTMLElement).getAttribute('target'),
      }),
    }],
    toDOM: (mark) => ['a', {
      href: mark.attrs.href,
      title: mark.attrs.title,
      target: mark.attrs.target,
      /* Set on the way out rather than stored on the mark: it is a property of
         rendering a link safely, not of the author's document. */
      rel: mark.attrs.target === '_blank' ? 'noopener noreferrer' : null,
    }, 0],
  },
};

/** An empty document, for when a caller has nothing to load. */
export const emptyDoc = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
};

/**
 * True when two documents are the same. Used to tell an external change from the
 * echo of one we just emitted — without it, every keystroke round-trips through
 * the caller's model and resets the editor, losing the selection and the undo
 * stack on each character.
 */
export function sameDoc(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}
