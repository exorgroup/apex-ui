/**
 * Editor keymap and command helpers.
 *
 * Commands are exported as plain functions over the ProseMirror command
 * signature rather than being bound to a toolbar, so a keyboard shortcut, a
 * toolbar button and a slash menu all invoke exactly the same code. Anything
 * that can be done one way can be done the others.
 */
import type { Schema } from 'prosemirror-model';
import type { Command } from 'prosemirror-state';

interface Deps {
  commands: typeof import('prosemirror-commands');
  history: typeof import('prosemirror-history');
  schemaList: typeof import('prosemirror-schema-list');
}

/* Escaping a code block is its own problem: every key inside it is literal, so
   there is no gesture to get out except one bound explicitly. */
function exitCode(schema: Schema, commands: Deps['commands']): Command {
  return (state, dispatch) => {
    const { $head } = state.selection as { $head: { parent: { type: unknown }; after: () => number } };
    if ($head.parent.type !== schema.nodes.code_block) return false;
    return commands.exitCode(state, dispatch);
  };
}

const mac = typeof navigator !== 'undefined' && /Mac|iP(hone|[oa]d)/.test(navigator.platform);

/**
 * The base keymap.
 *
 * Mod- rather than Ctrl-: ProseMirror resolves it per platform, and hard-coding
 * Ctrl would leave every Mac user without shortcuts.
 */
export function buildKeymap(schema: Schema, deps: Deps): Record<string, Command> {
  const { commands, history, schemaList } = deps;
  const keys: Record<string, Command> = {};
  const bind = (key: string, cmd: Command) => { keys[key] = cmd; };

  bind('Mod-z', history.undo);
  bind('Shift-Mod-z', history.redo);
  /* Ctrl-Shift-z is the Windows convention and Mod-y the other one; both are
     bound so muscle memory from either platform works. */
  if (!mac) bind('Mod-y', history.redo);

  bind('Backspace', commands.chainCommands(
    commands.deleteSelection,
    commands.joinBackward,
    commands.selectNodeBackward,
  ));
  bind('Delete', commands.chainCommands(
    commands.deleteSelection,
    commands.joinForward,
    commands.selectNodeForward,
  ));
  bind('Mod-a', commands.selectAll);

  if (schema.marks.strong) bind('Mod-b', commands.toggleMark(schema.marks.strong));
  if (schema.marks.em) bind('Mod-i', commands.toggleMark(schema.marks.em));
  if (schema.marks.code) bind('Mod-`', commands.toggleMark(schema.marks.code));
  if (schema.marks.underline) bind('Mod-u', commands.toggleMark(schema.marks.underline));
  /* Shift-Mod-x for strike and Shift-Mod-h for highlight: the plain letters are
     taken by the browser (Mod-x is cut), and fighting those loses. */
  if (schema.marks.strike) bind('Shift-Mod-x', commands.toggleMark(schema.marks.strike));
  if (schema.marks.highlight) bind('Shift-Mod-h', commands.toggleMark(schema.marks.highlight));
  if (schema.marks.subscript) bind('Mod-,', commands.toggleMark(schema.marks.subscript));
  if (schema.marks.superscript) bind('Mod-.', commands.toggleMark(schema.marks.superscript));

  if (schema.nodes.hard_break) {
    const br = schema.nodes.hard_break;
    const insertBreak: Command = (state, dispatch) => {
      if (dispatch) dispatch(state.tr.replaceSelectionWith(br.create()).scrollIntoView());
      return true;
    };
    bind('Shift-Enter', insertBreak);
    /* Mod-Enter too, since some editors train that instead and a break is the
       least surprising thing either could mean. */
    bind('Mod-Enter', insertBreak);
  }

  if (schema.nodes.list_item) {
    /* Enter splits the item; Tab and Shift-Tab nest and lift. Chained across
       task_item too, since the two item types share the same gestures and the
       first command that applies wins. */
    const items = [schema.nodes.list_item, schema.nodes.task_item].filter(Boolean);
    bind('Enter', commands.chainCommands(
      ...items.map((t) => schemaList.splitListItem(t)),
      commands.newlineInCode,
      commands.createParagraphNear,
      commands.liftEmptyBlock,
      commands.splitBlock,
    ));
    bind('Tab', commands.chainCommands(...items.map((t) => schemaList.sinkListItem(t))));
    bind('Shift-Tab', commands.chainCommands(...items.map((t) => schemaList.liftListItem(t))));
    bind('Mod-]', keys.Tab);
    bind('Mod-[', keys['Shift-Tab']);
  }
  if (schema.nodes.bullet_list) bind('Shift-Mod-8', schemaList.wrapInList(schema.nodes.bullet_list));
  if (schema.nodes.ordered_list) bind('Shift-Mod-9', schemaList.wrapInList(schema.nodes.ordered_list));
  if (schema.nodes.code_block) bind('Shift-Mod-c', commands.setBlockType(schema.nodes.code_block));
  if (schema.nodes.horizontal_rule) {
    const hr = schema.nodes.horizontal_rule;
    bind('Mod-_', (state, dispatch) => {
      if (dispatch) dispatch(state.tr.replaceSelectionWith(hr.create()).scrollIntoView());
      return true;
    });
  }

  if (schema.nodes.blockquote) bind('Mod->', commands.wrapIn(schema.nodes.blockquote));
  if (schema.nodes.paragraph) bind('Shift-Mod-0', commands.setBlockType(schema.nodes.paragraph));
  if (schema.nodes.heading) {
    for (let level = 1; level <= 6; level += 1) {
      bind(`Shift-Mod-${level}`, commands.setBlockType(schema.nodes.heading, { level }));
    }
  }

  if (schema.nodes.code_block) {
    /* Mod-Enter and the triple-Enter fallback both leave a code block, because a
       reader who does not know the shortcut will try pressing Enter until
       something happens. */
    bind('Shift-Enter', commands.chainCommands(exitCode(schema, commands), keys['Shift-Enter']));
  }

  /* The caption escape that used to lead this chain is gone with the
     thing it escaped FROM: an image is an atom now, its caption an
     attribute, and no node in either schema is an isolating textblock
     any more. A command nothing can reach is worse than no command -
     it reads as a live feature. N/033. */
  bind('Enter', keys.Enter || commands.chainCommands(
    commands.newlineInCode,
    commands.createParagraphNear,
    commands.liftEmptyBlock,
    commands.splitBlock,
  ));

  return keys;
}

/**
 * Which marks and blocks are active at the selection, for a toolbar to reflect.
 *
 * Read from the state on every transaction rather than tracked separately: a
 * toolbar that keeps its own idea of "is bold on" drifts the moment the caret
 * moves, and that drift is invisible until someone notices the wrong button lit.
 */
export function activeState(state: unknown, schema: Schema) {
  const s = state as {
    selection: {
      from: number; to: number; empty: boolean;
      $from: { parent: { type: { name: string }; attrs: Record<string, unknown>; isTextblock: boolean }; marks: () => { type: unknown }[] };
    };
    storedMarks?: unknown[] | null;
    doc: {
      rangeHasMark: (from: number, to: number, type: unknown) => boolean;
      nodesBetween: (from: number, to: number, fn: (node: { isTextblock: boolean; type: { name: string }; attrs: Record<string, unknown> }) => boolean | void) => void;
    };
  };
  const marks: Record<string, boolean> = {};
  const { from, to, empty } = s.selection;

  Object.keys(schema.marks).forEach((name) => {
    const type = schema.marks[name];
    if (empty) {
      /* An empty selection reads storedMarks first: pressing bold with no
         selection sets a pending mark that is not in the document yet, and
         ignoring it would leave the button unlit while the next character
         arrives bold. */
      const stored = (s.storedMarks || s.selection.$from.marks()) as { type: unknown }[];
      marks[name] = !!stored && stored.some((m) => m.type === type);
    } else {
      marks[name] = s.doc.rangeHasMark(from, to, type);
    }
  });

  /**
   * The first text block in the selection, not the common ancestor.
   *
   * A selection spanning a heading and a paragraph resolves its parent to the
   * document, so asking "what block is this" would answer "doc" — true, and
   * useless to a toolbar. `blockMixed` then says the selection covers more than
   * one kind, so a toolbar can show indeterminate rather than pick one and lie.
   */
  let block: { type: { name: string }; attrs: Record<string, unknown> } | null = null;
  let mixed = false;
  if (s.selection.$from.parent.isTextblock) {
    block = s.selection.$from.parent;
  }
  s.doc.nodesBetween(from, to, (node) => {
    if (!node.isTextblock) return true;
    if (!block) block = node;
    else if (node.type.name !== block.type.name) mixed = true;
    return false;
  });

  return {
    marks,
    blockType: block ? block.type.name : 'paragraph',
    blockAttrs: block ? block.attrs : {},
    blockMixed: mixed,
  };
}
