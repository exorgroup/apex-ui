export declare function canonicalColour(value: unknown): string;
export declare function canonicalStyleValue(value: unknown): string;
export declare function sameStyleValue(a: unknown, b: unknown): boolean;
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
import { Plugin, type Command, type EditorState } from 'prosemirror-state';
/**
 * One declaration merged into a style string, leaving the others alone.
 *
 * At module scope because both the image commands and the row-resize plugin need
 * it, and two copies of a CSS parser would drift.
 */
export declare function mergeStyleDecls(style: unknown, patch: Record<string, string | null>): string;
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
export declare function rowResizing(): Plugin<any>;
import type { Schema } from 'prosemirror-model';
/**
 * The containers an author can reasonably reach for, as labelled options.
 *
 * Labels rather than bare tags, because "header" is the HTML `<header>` element
 * and reads as "heading" to an author — a confusion that makes "change to" look
 * broken when it correctly produces a page banner. Turning a paragraph into a
 * heading is a BLOCK TYPE change and belongs to the toolbar's heading buttons.
 */
export declare const CONTAINER_TAGS: {
    value: string;
    label: string;
}[];
/**
 * Wraps the selected blocks in a new container.
 *
 * `findWrapping` is asked rather than assumed: a wrapping that the schema will
 * not accept has to fail as a disabled button, not as a thrown transaction the
 * author sees as the editor breaking.
 */
export declare function wrapInContainer(schema: Schema, tag?: string, attrs?: Record<string, string>): Command;
/**
 * Removes the container around the selection, leaving its children in place.
 *
 * Distinct from deleting, and the two must both exist: unwrap keeps the content
 * and drops the wrapper, delete drops both. Offering one verb for both would
 * mean an author who wanted to remove a layout div lost the text inside it.
 */
export declare function unwrapContainer(schema: Schema): Command;
/**
 * Changes a container's tag without touching its content.
 *
 * One `setNodeMarkup` with the same node type and new attributes — the whole
 * reason tag is an attribute rather than a node type.
 */
export declare function retagContainer(schema: Schema, tag: string): Command;
/**
 * Inserts an empty container after the current block.
 *
 * It arrives holding a paragraph, because an empty container has nowhere to put
 * a caret — an author would see a box they could not type into and would have to
 * open the source view to fix it.
 */
export declare function insertContainer(schema: Schema, tag?: string, attrs?: Record<string, string>): Command;
/** Removes the container and everything in it. */
export declare function deleteContainer(schema: Schema): Command;
/** Sets or replaces arbitrary attributes on the nearest container. */
export declare function setContainerAttrs(schema: Schema, patch: Record<string, string | null>): Command;
export interface TextStyleState {
    color: string | null;
    fontFamily: string | null;
    fontSize: string | null;
    /** True when a range disagrees, so a control can show indeterminate. */
    mixed: boolean;
}
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
export declare function readTextStyle(state: EditorState, schema: Schema): TextStyleState;
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
export declare function blockStyleCommand(prop: string): (value: string | null) => Command;
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
export declare const BLOCK_TYPE_COMMANDS: string[];
export declare function preserveAttrBag(registry: Record<string, Command>): Record<string, Command>;
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
    border: {
        width: string | null;
        color: string | null;
    };
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
export declare function readCellStyle(state: EditorState): CellState | null;
export declare function buildPageCommands(schema: Schema): Record<string, unknown>;
