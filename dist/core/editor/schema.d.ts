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
export declare const baseNodes: Record<string, NodeSpec>;
export declare const baseMarks: Record<string, MarkSpec>;
/** An empty document, for when a caller has nothing to load. */
export declare const emptyDoc: {
    type: string;
    content: {
        type: string;
    }[];
};
/**
 * True when two documents are the same. Used to tell an external change from the
 * echo of one we just emitted — without it, every keystroke round-trips through
 * the caller's model and resets the editor, losing the selection and the undo
 * stack on each character.
 */
export declare function sameDoc(a: unknown, b: unknown): boolean;
