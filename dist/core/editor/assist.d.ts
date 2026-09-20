/**
 * AI seams.
 *
 * No provider is bundled and no prompt is written here. The editor emits a
 * request and the application answers it — endpoints, model choice, auth,
 * rate limits, cost control and prompt wording all belong to whoever owns the
 * account. What the editor owns is the part an application should not have to
 * solve twice: where the result lands, and what the document looks like while
 * the request is in flight.
 *
 * The result lands as a SUGGESTION rather than a replacement. An assistant that
 * silently rewrites a paragraph gives the author no way to see what changed or
 * to refuse it — so slice 8's insertion and deletion marks are reused, and an AI
 * edit arrives exactly as a colleague's would. That reuse is the reason this
 * slice comes after suggestions rather than before.
 */
import { Plugin, PluginKey, type EditorState } from 'prosemirror-state';
import { DecorationSet } from 'prosemirror-view';
import type { Node as PMNode, Schema } from 'prosemirror-model';
export type AssistAction = 'rewrite' | 'shorten' | 'expand' | 'proofread' | 'translate' | 'summarise' | 'continue' | string;
export interface AssistRequest {
    action: AssistAction;
    /** The selected text, or the whole document when nothing is selected. */
    text: string;
    /** The document as JSON, for an action that needs surrounding context. */
    doc: unknown;
    /** Where the text came from, so a caller can reason about scope. */
    range: {
        from: number;
        to: number;
        empty: boolean;
    };
    /** Anything the caller's own UI collected — a target language, a tone. */
    options?: Record<string, unknown>;
    /** Answer with the replacement text. */
    resolve: (text: string) => void;
    reject: (reason?: unknown) => void;
    /**
     * Push a partial result. Optional: an application without streaming simply
     * resolves once, and the editor behaves identically either way.
     */
    push?: (chunk: string) => void;
}
export type AssistHandler = (request: AssistRequest) => void;
export declare const assistKey: PluginKey<DecorationSet>;
/**
 * Marks the range a request is working on.
 *
 * A decoration rather than a node or a mark, for the same reason the upload
 * placeholder is: it is never part of the document, so a save mid-request cannot
 * persist it and an undo cannot resurrect one whose request already finished.
 * And a decoration set is mapped through every transaction, so the range follows
 * edits made elsewhere while the request is out.
 */
export declare function assistPlugin(): Plugin<DecorationSet>;
/** Where a request's range currently sits, or null if it has been edited away. */
export declare function assistRange(state: EditorState, id: string): {
    from: number;
    to: number;
} | null;
/**
 * Turns a result into a suggestion over the original range.
 *
 * The old text is marked deleted and the new text inserted beside it, which is
 * precisely what a human suggesting an edit produces — so accept and reject work
 * on it with no code of their own, and a reviewer cannot tell whether a person or
 * a model proposed it. That is the point.
 */
export declare function applyAssistResult(schema: Schema, range: {
    from: number;
    to: number;
}, text: string, author: {
    id: string;
    name?: string;
}): (state: EditorState, dispatch?: (tr: unknown) => void) => boolean;
/** The text an action should work on: the selection, or the whole document. */
export declare function assistScope(doc: PMNode, selection: {
    from: number;
    to: number;
    empty: boolean;
}): {
    text: string;
    range: {
        from: number;
        to: number;
        empty: boolean;
    };
};
