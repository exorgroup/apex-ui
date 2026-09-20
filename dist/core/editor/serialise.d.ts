/**
 * Serialisation — HTML, markdown and plain text out of the document JSON.
 *
 * HTML goes through ProseMirror's own DOMSerializer, driven by the schema's
 * `toDOM`, rather than a hand-written walker. `toDOM` is already the single
 * definition of how each node renders, and a second walker would be a second
 * definition — one that drifts the first time a node gains an attribute.
 *
 * Markdown has no such definition to borrow, so it is written here. It is
 * deliberately the inverse of our own markdown PARSER rather than of any
 * general dialect: those two have to round-trip, and a serialiser aimed at a
 * dialect we do not read would produce documents we cannot re-open.
 */
import { type Node as PMNode, type Schema } from 'prosemirror-model';
export interface ExportOptions {
    /**
     * What to do with tracked changes.
     *
     * A published document should carry neither `<ins>` nor `<del>`: those are
     * editorial state, not content. So the default resolves them — an insertion
     * becomes ordinary text and a deletion disappears, which is what "accept all"
     * means. 'keep' is for a diff view or an audit trail.
     */
    suggestions?: 'accept' | 'reject' | 'keep';
    /** Comment anchors are editorial too, and are dropped by default. */
    comments?: boolean;
    /** Pretty-print the HTML. Off by default — a byte-exact string is easier to diff. */
    pretty?: boolean;
}
/**
 * Strips editorial marks before serialising.
 *
 * Done on a COPY of the document rather than by filtering during the walk,
 * because a deletion has to remove its text entirely and a text node cannot be
 * skipped mid-serialise without corrupting the surrounding structure.
 */
export declare function forExport(doc: PMNode, schema: Schema, options?: ExportOptions): PMNode;
export declare function toHtml(doc: PMNode, schema: Schema, options?: ExportOptions): string;
/**
 * Parses an HTML string into a document.
 *
 * The inverse of `toHtml`, and the path an application takes when its own
 * storage is an HTML column rather than JSON. It goes through the same cleaner
 * as a paste, because HTML from a database is no more trustworthy than HTML from
 * a clipboard: it may have been written by an older version of the app, by a
 * different editor, or by hand.
 *
 * The schema is still the whitelist — markup it cannot represent is dropped
 * rather than preserved, which is the point of having a schema at all.
 */
export declare function fromHtml(html: string, schema: Schema, clean?: (html: string) => string): PMNode;
export declare function toMarkdown(doc: PMNode, schema: Schema, options?: ExportOptions): string;
/**
 * Block-aware, unlike `doc.textContent`, which concatenates every block into one
 * run — "Heading" and the paragraph under it would become "Headingthe paragraph".
 */
export declare function toText(doc: PMNode, schema: Schema, options?: ExportOptions): string;
/** Rough word count, for a footer. Ignores editorial text by default. */
export declare function wordCount(doc: PMNode, schema: Schema, options?: ExportOptions): number;
