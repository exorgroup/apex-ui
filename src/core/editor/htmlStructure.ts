/* A canvas context resolves any CSS colour to one form. A detached element's
   style.color returns the SPECIFIED value, so reading that back gives the
   literal "green" rather than a number — the context is what normalises. */
let colourCtx: CanvasRenderingContext2D | null = null;
export function canonicalColour(value: unknown) {
  const raw = String(value == null ? '' : value).trim();
  if (!raw) return '';
  if (!colourCtx) {
    const canvas = document.createElement('canvas');
    colourCtx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  }
  if (!colourCtx) return raw.toLowerCase();
  /* Seeded first, because a value the context rejects leaves fillStyle
     untouched — without the sentinel an invalid colour would report whatever
     was set last. */
  colourCtx.fillStyle = '#000000';
  colourCtx.fillStyle = raw;
  const got = colourCtx.fillStyle;
  return (typeof got === 'string' && got !== '#000000') || /^(#0{6}|black|rgba?\(0,\s*0,\s*0)/i.test(raw)
    ? String(got).toLowerCase()
    : raw.toLowerCase();
}

/* Every colour inside a value, not the value as a whole: a border shorthand is
   "1px solid <colour>", so only the colour part needs normalising and the rest
   must be preserved exactly as the author wrote it. */
const COLOUR_TOKEN = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?)\([^)]*\)|\b(?:transparent|currentcolor|[a-z]{3,20})\b/gi;
const NOT_COLOUR = /^(?:px|em|rem|solid|dashed|dotted|double|none|hidden|groove|ridge|inset|outset|thin|medium|thick|auto|initial|inherit|unset)$/i;
export function canonicalStyleValue(value: unknown) {
  const raw = String(value == null ? '' : value).trim();
  if (!raw) return '';
  return raw.replace(COLOUR_TOKEN, (token) => {
    if (NOT_COLOUR.test(token)) return token.toLowerCase();
    const canonical = canonicalColour(token);
    return canonical || token.toLowerCase();
  }).replace(/\s+/g, ' ').toLowerCase();
}

/* The comparison a control actually needs: does the document already carry
   this value, whichever notation each side happens to use. */
export function sameStyleValue(a: unknown, b: unknown) {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  return canonicalStyleValue(a) === canonicalStyleValue(b);
}


/**
 * Structure actions — wrap, unwrap, retag, insert and delete a container.
 *
 * These are the affordances that separate "edits HTML" from "edits HTML
 * usefully". Without them an author can style text but cannot build a page:
 * every container has to arrive from the source view.
 *
 * The payoff of the generic element design shows up here. Because a container's
 * tag is an ATTRIBUTE rather than a node type, changing a div into a section is
 * a single `setNodeMarkup` that touches nothing inside it — where a schema with
 * one node type per tag would have to rebuild the subtree and hope the content
 * still validated.
 */
import { Plugin, TextSelection, type Command, type EditorState, type Transaction } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';
import { findWrapping } from 'prosemirror-transform';

/**
 * One declaration merged into a style string, leaving the others alone.
 *
 * At module scope because both the image commands and the row-resize plugin need
 * it, and two copies of a CSS parser would drift.
 */
export function mergeStyleDecls(style: unknown, patch: Record<string, string | null>) {
  const held: Record<string, string> = {};
  String(style || '').split(';').forEach((part) => {
    const i = part.indexOf(':');
    if (i < 0) return;
    const k = part.slice(0, i).trim().toLowerCase();
    if (k) held[k] = part.slice(i + 1).trim();
  });
  Object.keys(patch).forEach((k) => {
    const v = patch[k];
    if (v == null || v === '') delete held[k];
    else held[k] = v;
  });
  return Object.keys(held).map((k) => `${k}: ${held[k]}`).join('; ');
}

/**
 * Row height, which prosemirror-tables does not provide.
 *
 * It resizes COLUMNS because a column width is a cell attribute its table map
 * understands, where a row's height is only a style. So this one is ours.
 *
 * The drag writes to the DOM live and commits ONE transaction on release. A
 * transaction per mousemove would fill the history with a hundred steps an
 * author would then have to undo one at a time.
 */
export function rowResizing() {
  const EDGE = 5;
  const MIN = 20;
  let drag: { el: HTMLElement; startY: number; startH: number; before: number } | null = null;

  const rowEdgeAt = (view: EditorView, event: MouseEvent) => {
    let el = event.target as HTMLElement | null;
    while (el && el.nodeName !== 'TR' && el !== view.dom) el = el.parentNode as HTMLElement | null;
    if (!el || el.nodeName !== 'TR') return null;
    const box = el.getBoundingClientRect();
    return Math.abs(event.clientY - box.bottom) <= EDGE ? { el, box } : null;
  };

  const rowNodeAt = (view: EditorView, pos: number) => {
    const $pos = view.state.doc.resolve(pos);
    for (let d = $pos.depth; d >= 0; d -= 1) {
      const node = $pos.node(d);
      if (node.type.spec?.tableRole === 'row') {
        return { node, before: d === 0 ? 0 : $pos.before(d) };
      }
    }
    return null;
  };

  const commit = (view: EditorView, before: number, height: number) => {
    const found = rowNodeAt(view, before + 1);
    if (!found) return false;
    const own = found.node.attrs as { attrs?: Record<string, string> };
    const bag: Record<string, string> = { ...(own.attrs || {}) };
    const style = mergeStyleDecls(bag.style, { height: `${height}px` });
    if (style) bag.style = style; else delete bag.style;
    view.dispatch(view.state.tr.setNodeMarkup(found.before, null,
      { ...found.node.attrs, attrs: bag }));
    return true;
  };

  return new Plugin({
    props: {
      handleDOMEvents: {
        /* The cursor is the only affordance an author gets for an invisible hit
           area, so it has to change BEFORE they press. */
        mousemove(view, event) {
          if (!drag) {
            (view.dom as HTMLElement).style.cursor =
              rowEdgeAt(view, event as MouseEvent) ? 'row-resize' : '';
          }
          return false;
        },
        mouseleave(view) {
          if (!drag) (view.dom as HTMLElement).style.cursor = '';
          return false;
        },
        mousedown(view, event) {
          const found = rowEdgeAt(view, event as MouseEvent);
          if (!found) return false;
          event.preventDefault();
          const doc = view.dom.ownerDocument;
          /* The row's POSITION is taken now, not the element. Any transaction
             during the drag re-renders the table and detaches the <tr> we
             started from, and a detached node has no document position — which
             is how the first version silently committed nothing. */
          const at = rowNodeAt(view, view.posAtDOM(found.el, 0));
          if (!at) return false;
          drag = {
            el: found.el, startY: (event as MouseEvent).clientY,
            startH: found.box.height, before: at.before,
          };
          const move = (e: MouseEvent) => {
            if (!drag) return;
            const h = Math.max(MIN, Math.round(drag.startH + (e.clientY - drag.startY)));
            drag.el.style.height = `${h}px`;
          };
          const up = () => {
            doc.removeEventListener('mousemove', move, true);
            doc.removeEventListener('mouseup', up, true);
            if (!drag) return;
            const h = parseInt(drag.el.style.height, 10);
            const { before } = drag;
            drag = null;
            (view.dom as HTMLElement).style.cursor = '';
            /* The DOM already shows it; the transaction is what makes it part of
               the DOCUMENT, so the height survives a serialise and a reload
               rather than being a trick of the editing surface. */
            if (h) commit(view, before, h);
          };
          doc.addEventListener('mousemove', move, true);
          doc.addEventListener('mouseup', up, true);
          return true;
        },
      },
    },
  });
}
import type { Mark, Node as PMNode, NodeType, Schema } from 'prosemirror-model';

/**
 * The containers an author can reasonably reach for, as labelled options.
 *
 * Labels rather than bare tags, because "header" is the HTML `<header>` element
 * and reads as "heading" to an author — a confusion that makes "change to" look
 * broken when it correctly produces a page banner. Turning a paragraph into a
 * heading is a BLOCK TYPE change and belongs to the toolbar's heading buttons.
 */
export const CONTAINER_TAGS: { value: string; label: string }[] = [
  { value: 'div', label: 'div' },
  { value: 'section', label: 'section' },
  { value: 'article', label: 'article' },
  { value: 'header', label: 'header (page banner)' },
  { value: 'footer', label: 'footer' },
  { value: 'aside', label: 'aside' },
  { value: 'nav', label: 'nav' },
  { value: 'main', label: 'main' },
  { value: 'figure', label: 'figure' },
];

/**
 * Wraps the selected blocks in a new container.
 *
 * `findWrapping` is asked rather than assumed: a wrapping that the schema will
 * not accept has to fail as a disabled button, not as a thrown transaction the
 * author sees as the editor breaking.
 */
export function wrapInContainer(
  schema: Schema,
  tag = 'div',
  attrs: Record<string, string> = {},
): Command {
  return (state, dispatch) => {
    const type = schema.nodes.element as NodeType | undefined;
    if (!type) return false;
    const range = state.selection.$from.blockRange(state.selection.$to);
    if (!range) return false;
    const wrapping = findWrapping(range, type, { tag, attrs });
    if (!wrapping) return false;
    if (dispatch) dispatch(state.tr.wrap(range, wrapping).scrollIntoView());
    return true;
  };
}

/**
 * Removes the container around the selection, leaving its children in place.
 *
 * Distinct from deleting, and the two must both exist: unwrap keeps the content
 * and drops the wrapper, delete drops both. Offering one verb for both would
 * mean an author who wanted to remove a layout div lost the text inside it.
 */
export function unwrapContainer(schema: Schema): Command {
  return (state, dispatch) => {
    const $from = state.selection.$from;
    /* The nearest generic container, not the nearest block: unwrapping a
       paragraph would be meaningless, and unwrapping the doc impossible. */
    for (let d = $from.depth; d > 0; d -= 1) {
      const node = $from.node(d);
      if (node.type !== schema.nodes.element && node.type !== schema.nodes.element_text) continue;
      const start = $from.before(d);
      const end = $from.after(d);
      if (dispatch) {
        /* Replaced with its own content rather than lifted, because lift needs a
           valid parent for a single range and a container may hold several
           blocks the parent will take individually. */
        dispatch(state.tr.replaceWith(start, end, node.content).scrollIntoView());
      }
      return true;
    }
    return false;
  };
}

/**
 * Changes a container's tag without touching its content.
 *
 * One `setNodeMarkup` with the same node type and new attributes — the whole
 * reason tag is an attribute rather than a node type.
 */
export function retagContainer(schema: Schema, tag: string): Command {
  return (state, dispatch) => {
    const $from = state.selection.$from;
    for (let d = $from.depth; d > 0; d -= 1) {
      const node = $from.node(d);
      if (node.type !== schema.nodes.element && node.type !== schema.nodes.element_text) continue;
      if (node.attrs.tag === tag) return false;
      if (dispatch) {
        dispatch(state.tr.setNodeMarkup($from.before(d), undefined, { ...node.attrs, tag }));
      }
      return true;
    }
    return false;
  };
}

/**
 * Inserts an empty container after the current block.
 *
 * It arrives holding a paragraph, because an empty container has nowhere to put
 * a caret — an author would see a box they could not type into and would have to
 * open the source view to fix it.
 */
export function insertContainer(
  schema: Schema,
  tag = 'div',
  attrs: Record<string, string> = {},
): Command {
  return (state, dispatch) => {
    const type = schema.nodes.element;
    const para = schema.nodes.paragraph;
    if (!type || !para) return false;
    const $from = state.selection.$from;
    const pos = $from.depth ? $from.after(1) : state.doc.content.size;
    if (dispatch) {
      const node = type.create({ tag, attrs }, para.create());
      const tr = state.tr.insert(pos, node);
      /* The caret is put inside it, so the author can type straight away rather
         than hunting for the new box. */
      tr.setSelection(TextSelection.near(tr.doc.resolve(pos + 2)));
      dispatch(tr.scrollIntoView());
    }
    return true;
  };
}

/** Removes the container and everything in it. */
export function deleteContainer(schema: Schema): Command {
  return (state, dispatch) => {
    const $from = state.selection.$from;
    for (let d = $from.depth; d > 0; d -= 1) {
      const node = $from.node(d);
      if (node.type !== schema.nodes.element && node.type !== schema.nodes.element_text) continue;
      if (dispatch) dispatch(state.tr.delete($from.before(d), $from.after(d)).scrollIntoView());
      return true;
    }
    return false;
  };
}

/** Sets or replaces arbitrary attributes on the nearest container. */
export function setContainerAttrs(
  schema: Schema,
  patch: Record<string, string | null>,
): Command {
  return (state, dispatch) => {
    const $from = state.selection.$from;
    for (let d = $from.depth; d > 0; d -= 1) {
      const node = $from.node(d);
      if (!node.type.spec.attrs || !('attrs' in node.type.spec.attrs)) continue;
      if (dispatch) {
        const bag = { ...(node.attrs.attrs as Record<string, string>) };
        /* A null value REMOVES the attribute, so one call can both set and clear
           — otherwise a caller needs two commands to swap an id for nothing. */
        Object.entries(patch).forEach(([k, v]) => {
          if (v === null) delete bag[k];
          else bag[k] = v;
        });
        dispatch(state.tr.setNodeMarkup($from.before(d), undefined, { ...node.attrs, attrs: bag }));
      }
      return true;
    }
    return false;
  };
}

/* ─── page-editor command layer ──────────────────────────────
   The commands a PAGE needs that a prose document does not, and the repairs a
   prose command needs before it can be trusted on a permissive schema.

   Shared with the gallery mirror, which carries the same logic in plain JS. */

type StyleKey = 'color' | 'fontFamily' | 'fontSize';

export interface TextStyleState {
  color: string | null;
  fontFamily: string | null;
  fontSize: string | null;
  /** True when a range disagrees, so a control can show indeterminate. */
  mixed: boolean;
}

const STYLE_PROPS: { prop: string; key: StyleKey }[] = [
  { prop: 'color', key: 'color' },
  { prop: 'font-family', key: 'fontFamily' },
  { prop: 'font-size', key: 'fontSize' },
];

/**
 * The text styles actually in force at the selection.
 *
 * Read from the document rather than remembered from the last pick, because a
 * control bound to what you last chose is stale the moment the caret moves — it
 * claims green text while sitting on black. This is the same contract the bold
 * button already honours: a toolbar reports the document.
 *
 * Properties are collected across every `inline_element` mark at the position,
 * since each span carries one property and they nest. A range where the text
 * disagrees reports null rather than the first value found.
 */
export function readTextStyle(state: EditorState, schema: Schema): TextStyleState {
  const inline = schema.marks.inline_element;
  const out: TextStyleState = { color: null, fontFamily: null, fontSize: null, mixed: false };
  if (!inline) return out;

  const fromMarks = (marks: readonly Mark[]): Partial<Record<StyleKey, string>> => {
    const found: Partial<Record<StyleKey, string>> = {};
    marks.forEach((mark) => {
      if (mark.type !== inline) return;
      const bag = mark.attrs.attrs as Record<string, unknown> | null;
      const style = String((bag && bag.style) || '');
      STYLE_PROPS.forEach(({ prop, key }) => {
        const match = new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`).exec(style);
        /* The innermost span wins, which is the one the browser paints. */
        if (match) found[key] = match[1].trim();
      });
    });
    return found;
  };

  const sel = state.selection;
  if (sel.empty) return { ...out, ...fromMarks(sel.$from.marks()) };

  let first: Partial<Record<StyleKey, string | null>> | null = null;
  state.doc.nodesBetween(sel.from, sel.to, (node: PMNode) => {
    if (!node.isText) return;
    const here = fromMarks(node.marks);
    if (first === null) { first = { ...here }; return; }
    const agreed = first;
    STYLE_PROPS.forEach(({ key }) => {
      if ((agreed[key] ?? null) !== (here[key] ?? null)) {
        agreed[key] = null;
        out.mixed = true;
      }
    });
  });
  return { ...out, ...(first || {}) };
}

/**
 * Block-level style, written into the generic attribute bag.
 *
 * ApexEditor's own `align_*` commands store alignment as a node attribute that
 * serialises to `data-align`, and a host stylesheet rule turns that into
 * `text-align`. That rule cannot exist here: this component renders into an
 * iframe carrying the page's own CSS, precisely so the stored markup is what a
 * real page renders. So `data-align` would be inert — an attribute nothing
 * honours, inside the editor or out.
 *
 * Writing real CSS into the bag instead means the alignment renders wherever the
 * markup lands, which is the whole promise of the component.
 */
export function blockStyleCommand(prop: string) {
  return (value: string | null): Command => (state, dispatch) => {
    const { from, to } = state.selection;
    const targets: { pos: number; node: PMNode }[] = [];
    state.doc.nodesBetween(from, to, (node: PMNode, pos: number) => {
      if (!node.isTextblock) return;
      if (!node.type.spec.attrs || !('attrs' in node.type.spec.attrs)) return;
      targets.push({ pos, node });
    });
    if (!targets.length) return false;
    if (dispatch) {
      const tr = state.tr;
      targets.forEach(({ pos, node }) => {
        const bag: Record<string, unknown> = { ...(node.attrs.attrs as object || {}) };
        /* The property is replaced rather than appended, so three alignment
           changes leave one declaration rather than three with the last winning
           by accident. */
        const kept = String(bag.style || '')
          .split(';')
          .map((d) => d.trim())
          .filter((d) => d && !new RegExp(`^${prop}\\s*:`).test(d));
        if (value) kept.push(`${prop}: ${value}`);
        const style = kept.join('; ');
        if (style) bag.style = style;
        else delete bag.style;
        tr.setNodeMarkup(tr.mapping.map(pos), undefined, { ...node.attrs, attrs: bag });
      });
      dispatch(tr);
    }
    return true;
  };
}

/**
 * Commands `setBlockType` would otherwise strip.
 *
 * `setBlockType` builds the target node from only the attrs handed to it, so the
 * generic attribute bag falls back to its `{}` default and an author's class and
 * inline style vanish when they turn a paragraph into a heading. That is silent
 * data loss in the stored markup, not just the view.
 *
 * Wrapped HERE rather than in `buildCommands`, because ApexEditor's own schema
 * has no bag and is unaffected — putting the fix there would make the prose
 * editor pay for a problem it does not have.
 */
export const BLOCK_TYPE_COMMANDS = [
  'paragraph', 'code_block',
  'heading1', 'heading2', 'heading3', 'heading4', 'heading5', 'heading6',
];

export function preserveAttrBag(registry: Record<string, Command>): Record<string, Command> {
  const out: Record<string, Command> = { ...registry };
  BLOCK_TYPE_COMMANDS.forEach((name) => {
    const original = registry[name];
    if (!original) return;
    out[name] = (state, dispatch, view) => {
      /* The bag is read BEFORE the command runs, because afterwards the node it
         belonged to no longer exists. */
      const $from = state.selection.$from;
      const depth = $from.depth;
      const bag = ($from.parent.attrs.attrs as Record<string, unknown> | null) || null;
      if (!dispatch) return original(state, undefined, view);
      let applied = false;
      const ok = original(state, (tr: Transaction) => {
        if (bag && Object.keys(bag).length) {
          /* Restored by position rather than by identity: the node is a new one,
             so only where it sits can identify it. */
          const pos = tr.selection.$from.before(Math.min(depth, tr.selection.$from.depth));
          const node = tr.doc.nodeAt(pos);
          if (node && node.type.spec.attrs && 'attrs' in node.type.spec.attrs) {
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, attrs: bag });
          }
        }
        applied = true;
        dispatch(tr);
      }, view);
      return ok || applied;
    };
  });
  return out;
}

/**
 * The page-specific commands: alignment, text colour, font family, font size and
 * an image.
 *
 * The three text styles are expressed as `inline_element` spans carrying a
 * style, rather than as new marks. A page's colour IS a span with a colour on it
 * — inventing a `textColor` mark would serialise to something the site's own CSS
 * never sees, and the whole promise of this component is that what you store is
 * what renders.
 */
export interface CellState {
  cellPos: number;
  tablePos: number;
  isHeader: boolean;
  colspan: number;
  rowspan: number;
  rows: number;
  /** How many cells a dragged block covers, so a toolbar can say so. */
  selectedCells: number;
  style: Record<string, string>;
  /**
   * The TABLE's border, not the cell's — N/048.
   *
   * It comes back with the cell state because that is what the contextual bar
   * is handed: the bar shows a border box and a colour, and both belong to the
   * table the caret happens to be in.
   */
  border: { width: string | null; color: string | null };
}

/**
 * Where the selection sits in a table, and what the cell already carries.
 *
 * Reported from the document rather than remembered, the same contract
 * `readTextStyle` follows. Returns null when the selection is not in a table,
 * which is what tells a contextual toolbar to stay hidden — table controls are
 * meaningless outside a table, and a permanently visible set of them would be
 * dead weight on every document that has none.
 */
export function readCellStyle(state: EditorState): CellState | null {
  const sel = state.selection as typeof state.selection & {
    forEachCell?: (fn: (node: PMNode, pos: number) => void) => void;
  };
  let cell: PMNode | null = null;
  let cellPos = -1;
  let table: PMNode | null = null;
  let tablePos = -1;
  for (let d = sel.$from.depth; d > 0; d -= 1) {
    const node = sel.$from.node(d);
    const role = node.type.spec.tableRole;
    if (!cell && (role === 'cell' || role === 'header_cell')) {
      cell = node;
      cellPos = sel.$from.before(d);
    }
    if (!table && role === 'table') { table = node; tablePos = sel.$from.before(d); }
  }
  if (!cell) return null;

  const style: Record<string, string> = {};
  String(cell.attrs.style || '').split(';').forEach((part) => {
    const i = part.indexOf(':');
    if (i < 0) return;
    style[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  });

  let selectedCells = 1;
  if (typeof sel.forEachCell === 'function') {
    selectedCells = 0;
    sel.forEachCell(() => { selectedCells += 1; });
  }
  return {
    cellPos,
    tablePos,
    isHeader: cell.type.spec.tableRole === 'header_cell',
    colspan: Number(cell.attrs.colspan) || 1,
    rowspan: Number(cell.attrs.rowspan) || 1,
    rows: table ? table.childCount : 0,
    selectedCells,
    style,
    border: {
      width: (table?.attrs.borderWidth as string | null) ?? null,
      color: (table?.attrs.borderColor as string | null) ?? null,
    },
  };
}

export function buildPageCommands(schema: Schema): Record<string, unknown> {
  const inline = schema.marks.inline_element;
  const out: Record<string, unknown> = {};
  if (!inline) return out;

  /* One declaration per style property, so adding another is a line rather than
     a new command. Each REPLACES its own property and leaves the others alone —
     setting a colour must not clear the font size. */
  const styleSpan = (prop: string) => (value: string | null): Command => (state, dispatch) => {
    const { from, to, empty } = state.selection;
    if (empty) return false;
    /* A heading declares marks: 'link', so a styling span cannot live in one.
       Reported rather than silently ignored: returning true left the menu entry
       enabled and clicking it did nothing, which reads as a broken editor rather
       than a restriction. */
    let applicable = false;
    state.doc.nodesBetween(from, to, (node: PMNode) => {
      if (node.isTextblock && node.type.allowsMarkType(inline)) applicable = true;
    });
    if (!applicable) return false;
    if (dispatch) {
      const tr = state.tr;
      /* Existing spans carrying this property are removed first: the marks do
         not exclude each other, so three colour changes would otherwise leave
         three nested spans and the innermost would win by accident. */
      state.doc.nodesBetween(from, to, (node: PMNode, pos: number) => {
        if (!node.isText) return;
        node.marks.forEach((mark) => {
          if (mark.type !== inline) return;
          const bag = mark.attrs.attrs as Record<string, unknown> | null;
          const style = String((bag && bag.style) || '');
          if (!new RegExp(`(^|;)\\s*${prop}\\s*:`).test(style)) return;
          tr.removeMark(Math.max(from, pos), Math.min(to, pos + node.nodeSize), mark);
        });
      });
      if (value) {
        tr.addMark(from, to, inline.create({ tag: 'span', attrs: { style: `${prop}: ${value}` } }));
      }
      dispatch(tr);
    }
    return true;
  };

  /* Same names as the prose editor's, so the toolbar calls one command and does
     not need to know which editor it is driving. */
  const align = blockStyleCommand('text-align');
  out.align_left = () => align('left');
  out.align_center = () => align('center');
  out.align_right = () => align('right');
  out.align_justify = () => align('justify');
  out.align_clear = () => align(null);

  /* Indent on a page is margin, not list nesting: the inherited `indent` is
     `sinkListItem`, which is list-only by construction and does nothing to a
     paragraph. Inside a list the inherited one is still right, so the component
     CHAINS them — list nesting first, margin only when that does not apply. */
  const INDENT_STEP = 40;
  const shiftIndent = (by: number): Command => (state, dispatch) => {
    const { from, to } = state.selection;
    const targets: { pos: number; node: PMNode }[] = [];
    state.doc.nodesBetween(from, to, (node: PMNode, pos: number) => {
      if (!node.isTextblock) return;
      if (!node.type.spec.attrs || !('attrs' in node.type.spec.attrs)) return;
      targets.push({ pos, node });
    });
    if (!targets.length) return false;
    /* Nothing to give back at zero, so the button reports unavailable rather
       than silently doing nothing. */
    if (by < 0) {
      const indented = targets.some(({ node }) => {
        const bag = node.attrs.attrs as Record<string, unknown> | null;
        const match = /margin-left\s*:\s*(-?[\d.]+)px/.exec(String((bag && bag.style) || ''));
        return !!match && Number(match[1]) > 0;
      });
      if (!indented) return false;
    }
    if (dispatch) {
      const tr = state.tr;
      targets.forEach(({ pos, node }) => {
        const bag: Record<string, unknown> = { ...(node.attrs.attrs as object || {}) };
        const style = String(bag.style || '');
        const current = /margin-left\s*:\s*(-?[\d.]+)px/.exec(style);
        const next = Math.max(0, (current ? Number(current[1]) : 0) + by * INDENT_STEP);
        const kept = style.split(';').map((d) => d.trim())
          .filter((d) => d && !/^margin-left\s*:/.test(d));
        if (next > 0) kept.push(`margin-left: ${next}px`);
        const joined = kept.join('; ');
        if (joined) bag.style = joined;
        else delete bag.style;
        tr.setNodeMarkup(tr.mapping.map(pos), undefined, { ...node.attrs, attrs: bag });
      });
      dispatch(tr);
    }
    return true;
  };
  out.page_indent = shiftIndent(1);
  out.page_outdent = shiftIndent(-1);

  /* Cell appearance as real declarations on the cell, applied across the whole
     cell SELECTION rather than the caret's cell — a table selection is the unit
     an author works in, and colouring one cell of a dragged block would read as
     the command failing. One property replaced at a time, so setting a fill does
     not clear the border. */
  const setCellStyle = (prop: string) => (value: string | null): Command => (state, dispatch) => {
    const sel = state.selection as typeof state.selection & {
      forEachCell?: (fn: (node: PMNode, pos: number) => void) => void;
    };
    const cells: { node: PMNode; pos: number }[] = [];
    if (typeof sel.forEachCell === 'function') {
      sel.forEachCell((node, pos) => cells.push({ node, pos }));
    } else {
      for (let d = sel.$from.depth; d > 0; d -= 1) {
        const node = sel.$from.node(d);
        const role = node.type.spec.tableRole;
        if (role === 'cell' || role === 'header_cell') {
          cells.push({ node, pos: sel.$from.before(d) });
          break;
        }
      }
    }
    if (!cells.length) return false;
    if (dispatch) {
      const tr = state.tr;
      cells.forEach(({ node, pos }) => {
        const kept = String(node.attrs.style || '')
          .split(';')
          .map((d) => d.trim())
          .filter((d) => d && !new RegExp(`^${prop}\\s*:`).test(d));
        if (value) kept.push(`${prop}: ${value}`);
        const joined = kept.join('; ');
        tr.setNodeMarkup(tr.mapping.map(pos), undefined, { ...node.attrs, style: joined || null });
      });
      dispatch(tr);
    }
    return true;
  };
  out.cell_background = setCellStyle('background');
  out.cell_border = setCellStyle('border');
  out.cell_padding = setCellStyle('padding');
  out.cell_text_align = setCellStyle('text-align');
  out.cell_vertical_align = setCellStyle('vertical-align');

  out.text_color = styleSpan('color');
  out.font_family = styleSpan('font-family');
  out.font_size = styleSpan('font-size');

  /* An image is a real element rather than a mark, and void, so it is inserted
     through the schema's own void node — the same one that carries a pasted
     <img> — and round-trips identically either way.

     The INLINE void node, so the image lands inside the paragraph the caret is
     in. Inserting the block one split the paragraph around it, which is not what
     <p><img></p> means. */
  out.insert_image = (attrs: Record<string, unknown>): Command => (state, dispatch) => {
    const type = schema.nodes.void_inline || schema.nodes.void_element;
    if (!type || !attrs || !attrs.src) return false;
    if (dispatch) {
      dispatch(state.tr.replaceSelectionWith(type.create({ tag: 'img', attrs })).scrollIntoView());
    }
    return true;
  };

  /* ── image, at the MARKUP level ──

     Alignment and width are attributes of the element, which is what this
     component edits. Crop, rotate and filters are deliberately absent: they
     change pixels, which needs canvas re-encoding and somewhere to put the
     result, and doing them with CSS transforms instead produces markup that does
     not travel. */
  const imageAt = (state: EditorState) => {
    const node = (state.selection as { node?: PMNode }).node;
    const own = node?.attrs as { tag?: string; attrs?: Record<string, string> } | undefined;
    if (!node || !own || own.tag !== 'img') return null;
    if (node.type.name !== 'void_inline' && node.type.name !== 'void_element') return null;
    return { node, pos: state.selection.from };
  };

  const mergeStyle = mergeStyleDecls;

  const patchImage = (patch: Record<string, string | null>): Command => (state, dispatch) => {
    const found = imageAt(state);
    if (!found) return false;
    if (dispatch) {
      const own = found.node.attrs as { attrs?: Record<string, string> };
      const bag: Record<string, string> = { ...(own.attrs || {}) };
      const style = mergeStyle(bag.style, patch);
      if (style) bag.style = style; else delete bag.style;
      const tr = state.tr.setNodeMarkup(found.pos, null, { tag: 'img', attrs: bag });
      /* The node stays SELECTED. setNodeMarkup maps the NodeSelection to a text
         selection, so without this the first click on an alignment button
         worked, the bar vanished, and the second click did nothing. Taken from
         the current selection's own constructor — it is a NodeSelection here by
         definition, so this needs no import. */
      const Ctor = state.selection.constructor as unknown as {
        create: (doc: unknown, pos: number) => typeof state.selection;
      };
      tr.setSelection(Ctor.create(tr.doc, found.pos));
      dispatch(tr);
    }
    return true;
  };

  /* float for left and right because text should wrap around them; a centred
     image is a block with auto margins, since floating cannot centre. */
  out.image_align_left = patchImage({ float: 'left', display: null, 'margin-inline': null });
  out.image_align_right = patchImage({ float: 'right', display: null, 'margin-inline': null });
  out.image_align_center = patchImage({ float: null, display: 'block', 'margin-inline': 'auto' });
  out.image_align_none = patchImage({ float: null, display: null, 'margin-inline': null });

  /* A style width rather than the width ATTRIBUTE: the attribute takes only
     integers, so a percentage could not be expressed, and CSS wins over it —
     which leaves the attributes intact as the intrinsic size hint. */
  out.image_width = (value: string | null) => patchImage({ width: value, height: value ? 'auto' : null });

  out.image_delete = ((state, dispatch) => {
    const found = imageAt(state);
    if (!found) return false;
    if (dispatch) dispatch(state.tr.delete(found.pos, found.pos + found.node.nodeSize));
    return true;
  }) as Command;

  return out;
}
