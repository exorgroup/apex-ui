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
/**
 * The base keymap.
 *
 * Mod- rather than Ctrl-: ProseMirror resolves it per platform, and hard-coding
 * Ctrl would leave every Mac user without shortcuts.
 */
export declare function buildKeymap(schema: Schema, deps: Deps): Record<string, Command>;
/**
 * Which marks and blocks are active at the selection, for a toolbar to reflect.
 *
 * Read from the state on every transaction rather than tracked separately: a
 * toolbar that keeps its own idea of "is bold on" drifts the moment the caret
 * moves, and that drift is invisible until someone notices the wrong button lit.
 */
export declare function activeState(state: unknown, schema: Schema): {
    marks: Record<string, boolean>;
    blockType: string;
    blockAttrs: Record<string, unknown>;
    blockMixed: boolean;
};
export {};
