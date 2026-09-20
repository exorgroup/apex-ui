/**
 * Tables.
 *
 * Built on prosemirror-tables rather than hand-rolled nodes. A table's hard part
 * is not the markup — it is keeping colspan and rowspan consistent through every
 * edit, so that deleting a column that a merged cell spans does the right thing.
 * That bookkeeping is what the library is, and reimplementing it would be
 * reimplementing the only difficult part.
 *
 * What we own here: the schema's attributes, the commands the toolbars call, and
 * the decision about what a table in *this* document is allowed to be.
 */
import type { Schema, NodeSpec, Node as PMNode } from 'prosemirror-model';
import type { Command } from 'prosemirror-state';
interface Deps {
    tables: typeof import('prosemirror-tables');
    state: typeof import('prosemirror-state');
}
export declare const tableNodes: Record<string, NodeSpec>;
/**
 * Builds a table node.
 *
 * A header row by default, because a table without one is a grid of unlabelled
 * numbers — and someone who wants that can turn it off, where someone who
 * wanted headers and did not get them has to build them by hand.
 */
export declare function createTable(schema: Schema, rows: number, cols: number, withHeaderRow?: boolean): PMNode | null;
/** Sets the alignment of every selected cell. */
export declare function setCellAlign(align: string | null, deps: Deps): Command;
/**
 * The table commands, keyed by name into the same registry the toolbars read.
 *
 * Every one is guarded by prosemirror-tables' own applicability, so a toolbar
 * asking `can('table_delete_row')` outside a table gets false from the library
 * rather than from a rule we guessed.
 */
export declare function buildTableCommands(schema: Schema, deps: Deps): Record<string, Command>;
/**
 * The table commands that need a VALUE — the border, for now.
 *
 * Kept apart from `buildTableCommands` for the reason the media ones are: a
 * registry of `Command` and a registry of `(value) => Command` are different
 * shapes, and a toolbar that cannot tell them apart runs the factory as a
 * command and silently does nothing.
 */
export declare function buildTableValueCommands(schema: Schema): Record<string, (value: string | null) => Command>;
/** The border the selected table is wearing, for the bar to show. */
export declare function tableBorder(state: unknown, schema: Schema): {
    width: string | null;
    color: string | null;
} | null;
/**
 * The border, painted through a DECORATION — N/048.
 *
 * `toDOM` is not enough inside the editor: with `columnResizing` on, a table
 * has prosemirror-tables' own node view, which BUILDS the table element itself
 * and writes `min-width` and `--default-cell-min-width` onto its style. The
 * attributes this schema emits never reach that element, so a table with a
 * border looked bordered everywhere except the place it was being set.
 *
 * A node decoration is the seam the library leaves for exactly this: its
 * attributes are merged onto whatever DOM the node view produced, so the two
 * are no longer competing for the same attribute.
 *
 * `toDOM` keeps writing the style as well, and must: that copy is what makes
 * stored markup render on a page with no editor in it.
 */
export declare function tableBorderDecorations(schema: Schema, deps: {
    state: typeof import('prosemirror-state');
    view: typeof import('prosemirror-view');
}): import("prosemirror-state").Plugin<any>;
/** Whether the selection is inside a table, for a toolbar to show its controls. */
export declare function inTable(state: unknown, schema: Schema): boolean;
/**
 * Table keymap.
 *
 * Tab moves between cells rather than indenting, because inside a table that is
 * what Tab means everywhere else — and a table is the one place where the list
 * binding would be actively wrong.
 */
export declare function tableKeymap(deps: Deps): Record<string, Command>;
export {};
