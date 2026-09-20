/**
 * Comments.
 *
 * The document stores an ANCHOR — a thread id on a range of text — and nothing
 * else. The thread itself, its replies, authors and timestamps live in the
 * application's database, because that is where they can be queried, paginated,
 * searched and permissioned. Embedding them in the document would make it grow
 * without bound, and would mean migrating comment schema every time the comment
 * feature changed.
 *
 * A mark rather than a node, because a comment applies to a RANGE of text and has
 * to survive editing inside that range. A node wrapper breaks the moment an edit
 * crosses its boundary; a mark is mapped through every step for free.
 */
import type { MarkSpec } from 'prosemirror-model';
import type { Command } from 'prosemirror-state';
export declare const commentMark: Record<string, MarkSpec>;
export interface CommentAnchor {
    threadId: string;
    from: number;
    to: number;
    /** The commented text, so a thread card can quote what it is about. */
    text: string;
    /** Distance from the top of the writing area, for aligning a gutter. */
    top: number;
    height: number;
}
/**
 * Reads every anchor in the document, with its on-screen position.
 *
 * The positions are measured from the view rather than computed, because line
 * wrapping, images and tables all affect where a range actually sits — and a
 * gutter that guessed would drift further down the document with every block.
 */
export declare function readAnchors(view: {
    state: {
        doc: {
            descendants: (fn: (node: unknown, pos: number) => void) => void;
        };
    };
    coordsAtPos: (pos: number) => {
        top: number;
        bottom: number;
    };
    dom: HTMLElement;
}): CommentAnchor[];
/**
 * Marks the selection as a comment anchor.
 *
 * The id comes from the CALLER, not from here: the thread has to exist in the
 * application's store before the document points at it, or a saved document
 * would reference a thread that was never created.
 */
export declare function addComment(markType: import('prosemirror-model').MarkType, threadId: string): Command;
/** Removes one thread's anchor, wherever it sits in the document. */
export declare function removeComment(markType: import('prosemirror-model').MarkType, threadId: string): Command;
/** The thread ids under the caret, so a caller can open the right thread. */
export declare function threadsAtSelection(state: unknown, markType: unknown): string[];
/**
 * The plugin that paints the active thread.
 *
 * A decoration rather than a class on the mark's own span, because "active"
 * belongs to the reader's current focus rather than to the document — two people
 * reading the same document have different active threads, and writing it into
 * the mark would make the document differ per reader.
 */
export declare function commentPlugin(deps: {
    state: typeof import('prosemirror-state');
    view: typeof import('prosemirror-view');
}, options: {
    activeThread: () => string | null;
    resolvedThreads: () => string[];
}): import("prosemirror-state").Plugin<any>;
