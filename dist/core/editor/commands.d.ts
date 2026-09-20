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
    history: typeof import('prosemirror-history');
}
/**
 * Toggling a list has to consider what the selection is ALREADY in: pressing
 * bullets inside an ordered list should convert it, not nest a bullet list
 * inside it, and pressing bullets inside a bullet list should lift out.
 */
export declare function toggleList(listType: NodeType, itemType: NodeType, deps: CommandDeps): Command;
/** Sets, or clears, the alignment of every block in the selection that has one. */
export declare function setAlign(align: Align): Command;
/** Toggles a task item's checkbox at a given position. */
export declare function toggleTask(pos: number): Command;
/**
 * A link is applied to the selection, or to the word under the caret when there
 * is none — otherwise pressing the link button with a caret in a word produces
 * a zero-width link nobody can see or click.
 */
export declare function setLink(markType: MarkType, attrs: {
    href: string;
    title?: string | null;
    target?: string | null;
}): Command;
export declare function unsetLink(markType: MarkType): Command;
/** Strips every mark from the selection — the "clear formatting" action. */
export declare function clearMarks(schema: Schema): Command;
/**
 * Every command the toolbar and the keymap share, keyed by name.
 *
 * A registry rather than scattered construction, so a toolbar can ask "is this
 * action available here" by calling the command with no dispatch — which is how
 * ProseMirror commands report applicability, and means a disabled button is
 * disabled because the document says so rather than because a rule was guessed.
 */
export declare function buildCommands(schema: Schema, deps: CommandDeps): Record<string, Command>;
