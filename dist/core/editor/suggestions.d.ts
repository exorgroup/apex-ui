/**
 * Suggestions — track changes.
 *
 * Both an insertion and a deletion are MARKS, which is the whole design. An
 * insertion could be a mark or a node, but a deletion has no choice: the text has
 * to stay in the document and stay visible until someone accepts it, so
 * "deleting" in suggestion mode means marking, never removing. Accepting a
 * deletion is what finally removes the text.
 *
 * That symmetry is what makes accept and reject inverses of each other:
 *   accept  insertion → drop the mark, keep the text
 *   reject  insertion → remove the text
 *   accept  deletion  → remove the text
 *   reject  deletion  → drop the mark, keep the text
 */
import type { MarkSpec } from 'prosemirror-model';
import type { Command } from 'prosemirror-state';
/** Who made a suggestion, carried on the mark so a reviewer can filter by author. */
export interface SuggestionAuthor {
    id: string;
    name?: string;
}
export declare const suggestionMarks: Record<string, MarkSpec>;
export interface SuggestionRange {
    kind: 'insertion' | 'deletion';
    authorId: string;
    authorName: string | null;
    at: string | null;
    from: number;
    to: number;
    text: string;
}
/** Every suggestion in the document, merged into contiguous runs. */
export declare function readSuggestions(doc: unknown, schema: unknown): SuggestionRange[];
/**
 * Rewrites a transaction so deletions become marks.
 *
 * Applied to the transaction before it is dispatched rather than as a plugin
 * filter, because a filter can only veto: to turn a deletion INTO something else
 * the replacement has to be built, and only the dispatcher has both the original
 * transaction and the state it came from.
 *
 * Returns null when the transaction needs no rewriting, so the ordinary path
 * stays untouched — most transactions are selection changes.
 */
export declare function asSuggestion(state: unknown, tr: unknown, schema: unknown, author: SuggestionAuthor): unknown | null;
/**
 * Accepts or rejects one suggestion range.
 *
 * The two verbs share one function because they differ only in which side of the
 * pair keeps the text — writing them separately invites the two to drift, and a
 * track-changes feature whose accept and reject are not exact inverses corrupts
 * documents quietly.
 */
export declare function resolveSuggestion(schema: {
    marks: Record<string, unknown>;
}, range: {
    kind: 'insertion' | 'deletion';
    from: number;
    to: number;
}, verb: 'accept' | 'reject'): Command;
/** Accepts or rejects everything, optionally from one author only. */
export declare function resolveAll(schema: {
    marks: Record<string, unknown>;
}, verb: 'accept' | 'reject', authorId?: string): Command;
