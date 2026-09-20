/**
 * Editor commands.
 *
 * Every action is a plain ProseMirror command, built from the schema and the
 * engine rather than bound to any UI. That is what lets a keyboard shortcut, a
 * toolbar button and a slash menu produce identical documents — there is one
 * implementation of "make this a heading", not three.
 */
import type { Schema, NodeType, MarkType } from 'prosemirror-model';
import type { Command } from 'prosemirror-state';
import type { Align } from './schema';

export interface CommandDeps {
  commands: typeof import('prosemirror-commands');
  schemaList: typeof import('prosemirror-schema-list');
  state: typeof import('prosemirror-state');
  /* Needed because undo and redo are registry commands, not just keybindings:
     the toolbar names them and looks them up here. */
  history: typeof import('prosemirror-history');
}

/**
 * Toggling a list has to consider what the selection is ALREADY in: pressing
 * bullets inside an ordered list should convert it, not nest a bullet list
 * inside it, and pressing bullets inside a bullet list should lift out.
 */
export function toggleList(listType: NodeType, itemType: NodeType, deps: CommandDeps): Command {
  return (state, dispatch, view) => {
    const { $from, $to } = state.selection;
    const range = $from.blockRange($to);
    if (!range) return false;

    /* Walk up for a list ancestor rather than checking the immediate parent: the
       selection sits in a paragraph inside the item inside the list. */
    let parentList: { node: { type: NodeType }; depth: number } | null = null;
    for (let d = range.depth; d > 0; d -= 1) {
      const node = $from.node(d);
      if (node.type === listType || node.type.name === 'bullet_list'
        || node.type.name === 'ordered_list' || node.type.name === 'task_list') {
        parentList = { node: node as never, depth: d };
        break;
      }
    }

    if (parentList) {
      if (parentList.node.type === listType) {
        /* Already this kind: pressing the button again means "stop being a list". */
        return deps.schemaList.liftListItem(itemType)(state, dispatch, view);
      }
      /* A different kind: change the wrapper in place, so the items and their
         nesting survive the switch. */
      if (dispatch) {
        const tr = state.tr;
        const pos = $from.before(parentList.depth);
        tr.setNodeMarkup(pos, listType, listType.name === 'ordered_list' ? { order: 1 } : null);
        /* Items have to change type too when moving to or from a task list,
           since task_item and list_item are different nodes. */
        const wanted = listType.name === 'task_list'
          ? state.schema.nodes.task_item
          : state.schema.nodes.list_item;
        if (wanted) {
          const listNode = tr.doc.nodeAt(pos);
          if (listNode) {
            let offset = pos + 1;
            listNode.forEach((child) => {
              if (child.type !== wanted) {
                tr.setNodeMarkup(offset, wanted, wanted.name === 'task_item' ? { checked: false } : null);
              }
              offset += child.nodeSize;
            });
          }
        }
        dispatch(tr.scrollIntoView());
      }
      return true;
    }
    return deps.schemaList.wrapInList(listType)(state, dispatch, view);
  };
}

/** Sets, or clears, the alignment of every block in the selection that has one. */
export function setAlign(align: Align): Command {
  return (state, dispatch) => {
    /**
     * A SELECTED node is the subject, not the things containing it.
     *
     * `nodesBetween` walks from the document down, and stops at the
     * first node that takes an alignment. For a picture inside a table
     * cell that is the CELL - which also has an `align` attribute - so
     * the cell's text alignment was set and the image was never
     * reached. Nothing moved, because text alignment does nothing to a
     * block image with automatic margins: reported as "click image,
     * click align right, and the image did not align in the table
     * cell", with the same four buttons working on a paragraph.
     *
     * Read by duck-typing rather than `instanceof NodeSelection`: this
     * file is handed the engine rather than importing it, as the
     * `selectedImage` reader in ApexHTMLEditor does.
     */
    const selected = (state.selection as { node?: import('prosemirror-model').Node }).node;
    if (selected?.type.spec.attrs?.align) {
      const at = state.selection.from;
      const next = selected.attrs.align === align ? null : align;
      if (dispatch) {
        dispatch(state.tr
          .setNodeMarkup(at, undefined, { ...selected.attrs, align: next })
          .scrollIntoView());
      }

      return true;
    }

    const { from, to } = state.selection;
    let touched = false;
    const tr = state.tr;
    state.doc.nodesBetween(from, to, (node, pos) => {
      /* `spec.attrs`, not `type.attrs`. Both exist at runtime and answer the
         same question here, but only the spec is declared on NodeType — the
         resolved one is an internal, so reading it compiles nowhere the engine
         is actually typed. */
      if (!node.type.spec.attrs?.align) return true;
      /* Setting the alignment already in force clears it, so the button reads as
         a toggle rather than as a one-way switch. */
      const next = node.attrs.align === align ? null : align;
      tr.setNodeMarkup(pos, undefined, { ...node.attrs, align: next });
      touched = true;
      return false;
    });
    if (!touched) return false;
    if (dispatch) dispatch(tr.scrollIntoView());
    return true;
  };
}

/** Toggles a task item's checkbox at a given position. */
export function toggleTask(pos: number): Command {
  return (state, dispatch) => {
    const node = state.doc.nodeAt(pos);
    if (!node || node.type.name !== 'task_item') return false;
    if (dispatch) {
      const tr = state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, checked: !node.attrs.checked });
      /* Not added to history as its own step group: ticking a box is a state
         change on the document, and an undo stack full of checkbox flips buries
         the text edits someone actually wants back. */
      tr.setMeta('addToHistory', true);
      dispatch(tr);
    }
    return true;
  };
}

/**
 * A link is applied to the selection, or to the word under the caret when there
 * is none — otherwise pressing the link button with a caret in a word produces
 * a zero-width link nobody can see or click.
 */
export function setLink(markType: MarkType, attrs: { href: string; title?: string | null; target?: string | null }): Command {
  return (state, dispatch) => {
    const { empty, from, to } = state.selection;
    let start = from;
    let end = to;
    if (empty) {
      const $pos = state.doc.resolve(from);
      const text = $pos.parent.textContent;
      const offset = $pos.parentOffset;
      const before = text.slice(0, offset).search(/\S+$/);
      const after = text.slice(offset).search(/\s/);
      if (before < 0) return false;
      start = from - (offset - before);
      end = after < 0 ? from + (text.length - offset) : from + after;
      if (start === end) return false;
    }
    if (dispatch) {
      dispatch(state.tr.addMark(start, end, markType.create(attrs)).scrollIntoView());
    }
    return true;
  };
}

export function unsetLink(markType: MarkType): Command {
  return (state, dispatch) => {
    const { from, to, empty } = state.selection;
    if (empty) {
      /* With no selection, remove the whole link the caret sits inside rather
         than nothing: the author's target is the link, not a position in it. */
      const $pos = state.doc.resolve(from);
      const mark = markType.isInSet($pos.marks());
      if (!mark) return false;
      let start = from - $pos.textOffset;
      let end = start + ($pos.parent.maybeChild($pos.index())?.nodeSize || 0);
      /* Extend across adjacent text nodes carrying the same mark instance. */
      const parentStart = $pos.start();
      $pos.parent.forEach((child, offset) => {
        if (!mark.isInSet(child.marks)) return;
        const childStart = parentStart + offset;
        if (childStart <= from && childStart + child.nodeSize >= from) {
          start = Math.min(start, childStart);
          end = Math.max(end, childStart + child.nodeSize);
        }
      });
      if (dispatch) dispatch(state.tr.removeMark(start, end, markType));
      return true;
    }
    if (dispatch) dispatch(state.tr.removeMark(from, to, markType));
    return true;
  };
}

/** Strips every mark from the selection — the "clear formatting" action. */
export function clearMarks(schema: Schema): Command {
  return (state, dispatch) => {
    const { from, to, empty } = state.selection;
    if (empty) return false;
    if (dispatch) {
      const tr = state.tr;
      Object.keys(schema.marks).forEach((name) => tr.removeMark(from, to, schema.marks[name]));
      dispatch(tr.scrollIntoView());
    }
    return true;
  };
}

/**
 * Every command the toolbar and the keymap share, keyed by name.
 *
 * A registry rather than scattered construction, so a toolbar can ask "is this
 * action available here" by calling the command with no dispatch — which is how
 * ProseMirror commands report applicability, and means a disabled button is
 * disabled because the document says so rather than because a rule was guessed.
 */
export function buildCommands(schema: Schema, deps: CommandDeps): Record<string, Command> {
  const { commands, schemaList } = deps;
  const out: Record<string, Command> = {};
  const mark = (name: string) => schema.marks[name];
  const node = (name: string) => schema.nodes[name];

  ['strong', 'em', 'code', 'underline', 'strike', 'subscript', 'superscript'].forEach((name) => {
    if (mark(name)) out[name] = commands.toggleMark(mark(name));
  });
  if (mark('highlight')) {
    out.highlight = commands.toggleMark(mark('highlight'));
  }

  if (node('paragraph')) out.paragraph = commands.setBlockType(node('paragraph'));
  if (node('heading')) {
    for (let level = 1; level <= 6; level += 1) {
      out[`heading${level}`] = commands.setBlockType(node('heading'), { level });
    }
  }
  if (node('code_block')) out.code_block = commands.setBlockType(node('code_block'));
  if (node('blockquote')) {
    /* Lift out if already quoted, wrap if not — one button, both directions. */
    out.blockquote = (state, dispatch, view) => {
      const lifted = commands.lift(state, undefined);
      const { $from } = state.selection;
      let inQuote = false;
      for (let d = $from.depth; d > 0; d -= 1) {
        if ($from.node(d).type === node('blockquote')) { inQuote = true; break; }
      }
      if (inQuote && lifted) return commands.lift(state, dispatch, view);
      return commands.wrapIn(node('blockquote'))(state, dispatch, view);
    };
  }
  if (node('horizontal_rule')) {
    out.horizontal_rule = (state, dispatch) => {
      if (dispatch) {
        dispatch(state.tr.replaceSelectionWith(node('horizontal_rule').create()).scrollIntoView());
      }
      return true;
    };
  }
  if (node('hard_break')) {
    out.hard_break = (state, dispatch) => {
      if (dispatch) {
        dispatch(state.tr.replaceSelectionWith(node('hard_break').create()).scrollIntoView());
      }
      return true;
    };
  }

  if (node('bullet_list') && node('list_item')) {
    out.bullet_list = toggleList(node('bullet_list'), node('list_item'), deps);
  }
  if (node('ordered_list') && node('list_item')) {
    out.ordered_list = toggleList(node('ordered_list'), node('list_item'), deps);
  }
  if (node('task_list') && node('task_item')) {
    out.task_list = toggleList(node('task_list'), node('task_item'), deps);
  }
  if (node('list_item')) {
    out.indent = schemaList.sinkListItem(node('list_item'));
    out.outdent = schemaList.liftListItem(node('list_item'));
  }

  (['left', 'center', 'right', 'justify'] as Align[]).forEach((align) => {
    out[`align_${align}`] = setAlign(align);
  });

  out.clear_marks = clearMarks(schema);
  /* Declared by the toolbar as commands, so they have to BE commands: the buttons
     named them and run() looked them up in this registry. Availability comes free
     — history.undo returns false on an empty stack, so a disabled button is
     disabled because the document says so. */
  out.undo = deps.history.undo;
  out.redo = deps.history.redo;
  return out;
}
