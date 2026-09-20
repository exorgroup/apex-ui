/**
 * Input rules — the markdown shorthands.
 *
 * These are conveniences over the same commands a toolbar calls, not a second
 * way to build a document: typing "## " runs exactly the command the H2 button
 * runs, so a document is identical whichever route produced it.
 *
 * Deliberately conservative. A rule that fires when the author did not mean it
 * is worse than one that never fires, because undoing it costs a keystroke and
 * noticing it costs attention — so quote conversion and dash replacement are
 * opt-in rather than on.
 */
import type { Schema } from 'prosemirror-model';
interface Deps {
    inputrules: typeof import('prosemirror-inputrules');
}
export interface InputRuleOptions {
    /** Markdown block shorthands: "# ", "> ", "- ", "1. ", "```". */
    markdown?: boolean;
    /** Inline marks from `code`, **bold**, *italic*. */
    inlineMarks?: boolean;
    /** Curly quotes and apostrophes. Off by default: it rewrites code and
     *  measurements ("6\" pipe") that the author typed deliberately. */
    smartQuotes?: boolean;
    /** En and em dashes, and an ellipsis from three dots. */
    dashes?: boolean;
}
export declare function buildInputRules(schema: Schema, deps: Deps, options?: InputRuleOptions): import("prosemirror-state").Plugin<{
    transform: import("prosemirror-state").Transaction;
    from: number;
    to: number;
    text: string;
} | null>;
export {};
