/**
 * The styles gallery — the application's classes, applied the way Word's styles
 * are: select, then click.
 *
 * Word distinguishes CHARACTER styles from PARAGRAPH styles, and the distinction
 * is not cosmetic: a character style applies to a run of text and so must be a
 * mark, where a paragraph style belongs to the whole block and so must be an
 * attribute. Offering one control for both would mean guessing, and guessing
 * wrong either paints half a paragraph or restyles a whole one the author only
 * meant to touch a word of.
 */
import type { Command } from 'prosemirror-state';
import type { Schema } from 'prosemirror-model';
import { withClass } from './htmlSchema';

export interface HtmlStyle {
  /** What the author sees in the gallery. */
  label: string;
  /** The class the markup carries. */
  className: string;
  /**
   * 'block' sets the class on the enclosing block; 'character' wraps the
   * selection in a span. Defaults to block, since most named styles are.
   */
  scope?: 'block' | 'character';
  /**
   * Change the block's tag as well, the way Word's Heading 1 is both a style and
   * a heading. Block scope only.
   */
  tag?: string;
  /** A short inline style for the gallery button, when the real CSS is not loaded. */
  preview?: string;
  group?: string;
}

/** Every class the gallery owns, so applying one can retire the others. */
export function galleryClasses(styles: HtmlStyle[], scope?: 'block' | 'character') {
  return styles
    .filter((s) => !scope || (s.scope || 'block') === scope)
    .map((s) => s.className);
}

/**
 * Applies a block style to every block in the selection.
 *
 * Exclusive within the gallery and nowhere else: applying "Lead" retires "Quote"
 * because they are alternatives, but leaves a `grid-item` the template needs
 * alone. A gallery that stripped every class would silently break layouts.
 */
export function applyBlockStyle(
  schema: Schema,
  style: HtmlStyle | null,
  all: HtmlStyle[],
): Command {
  return (state, dispatch) => {
    const { from, to } = state.selection;
    const retire = galleryClasses(all, 'block');
    const edits: { pos: number; attrs: Record<string, unknown>; type?: unknown }[] = [];

    state.doc.nodesBetween(from, to, (node, pos) => {
      if (!node.isBlock || node.isTextblock === false && !node.attrs) return;
      if (!node.type.isBlock) return;
      /* Only blocks that can carry a class: a list wrapper can, a bare text node
         cannot, and a table row's class belongs to the row not the cell. */
      const canClass = node.type.spec.attrs && 'attrs' in node.type.spec.attrs;
      const nextAttrs = canClass
        ? { ...node.attrs, attrs: withClass((node.attrs.attrs || {}) as Record<string, string>, style?.className || null, retire) }
        : null;
      if (nextAttrs) edits.push({ pos, attrs: nextAttrs });
    });

    if (!edits.length) return false;
    if (dispatch) {
      const tr = state.tr;
      /* Back to front, so an earlier edit cannot shift a later position. */
      edits.reverse().forEach((edit) => {
        tr.setNodeMarkup(edit.pos, undefined, edit.attrs);
      });
      dispatch(tr);
    }
    return true;
  };
}

/**
 * Applies a character style over the selection as an inline_element mark.
 *
 * Removing first, then adding: the marks do not exclude one another — nested
 * spans are ordinary HTML — so without the removal, clicking three styles in
 * turn would leave three nested spans rather than replacing the style.
 */
export function applyCharacterStyle(
  schema: Schema,
  style: HtmlStyle | null,
  all: HtmlStyle[],
): Command {
  return (state, dispatch) => {
    const markType = schema.marks.inline_element;
    if (!markType) return false;
    const { from, to, empty } = state.selection;
    if (empty) return false;
    const retire = galleryClasses(all, 'character');

    if (dispatch) {
      const tr = state.tr;
      /* Only the gallery's own spans are removed, and only when their class is one
         the gallery owns — an <abbr title="…"> in the selection is content, not
         styling, and must survive. */
      state.doc.nodesBetween(from, to, (node, pos) => {
        if (!node.isText) return;
        node.marks.forEach((mark) => {
          if (mark.type !== markType) return;
          const classes = String((mark.attrs.attrs as Record<string, string>)?.class || '').split(/\s+/);
          if (!classes.some((c) => retire.includes(c))) return;
          tr.removeMark(Math.max(from, pos), Math.min(to, pos + node.nodeSize), mark);
        });
      });
      if (style) {
        tr.addMark(from, to, markType.create({
          tag: 'span',
          attrs: { class: style.className },
        }));
      }
      dispatch(tr);
    }
    return true;
  };
}

/** Which gallery style the selection currently carries, for the active state. */
export function activeStyle(
  state: { selection: { from: number; to: number; empty: boolean; $from: { marks: () => unknown[]; parent: { attrs: Record<string, unknown> } } }; doc: unknown; schema?: Schema },
  styles: HtmlStyle[],
  schema: Schema,
): { block: string | null; character: string | null } {
  const markType = schema.marks.inline_element;
  const blockClasses = String(
    ((state.selection.$from.parent.attrs?.attrs || {}) as Record<string, string>).class || '',
  ).split(/\s+/);
  const block = styles.find((s) => (s.scope || 'block') === 'block'
    && blockClasses.includes(s.className))?.className || null;

  let character: string | null = null;
  if (markType) {
    (state.selection.$from.marks() as { type: unknown; attrs: Record<string, unknown> }[]).forEach((mark) => {
      if (mark.type !== markType) return;
      const classes = String(((mark.attrs.attrs || {}) as Record<string, string>).class || '').split(/\s+/);
      const hit = styles.find((s) => s.scope === 'character' && classes.includes(s.className));
      if (hit) character = hit.className;
    });
  }
  return { block, character };
}
