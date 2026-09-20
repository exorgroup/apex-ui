/**
 * Paste and sanitisation.
 *
 * The schema is already the whitelist — ProseMirror's parser drops anything it
 * cannot represent — so this is not a security layer bolted on top. What it does
 * is repair the *shape* of what real editors put on the clipboard, before the
 * parser sees it, because the parser will faithfully preserve nonsense that is
 * technically valid.
 *
 * Every rule here exists because a specific source produces a specific mess:
 * Word wraps everything in mso-styled spans, Google Docs marks bold with
 * `font-weight:700` on a span rather than a tag, and both emit `<b>` wrappers
 * around whole documents that would make every pasted paragraph bold.
 */
export interface PasteOptions {
    /** Strip all formatting and paste as plain text. */
    plainTextOnly?: boolean;
    /** Detect markdown in pasted plain text and parse it. */
    parseMarkdown?: boolean;
    /** Turn a pasted bare URL into a link on the selected text. */
    linkOnPaste?: boolean;
    /** Extra tags to strip outright, beyond the defaults. */
    stripTags?: string[];
    /**
     * Keep `<p></p>` instead of treating it as Word's spacer.
     *
     * On a PASTE an empty paragraph is noise — Word emits one between every
     * block. In a document being LOADED it is a blank line the author typed, and
     * dropping it silently closed up their spacing the next time they opened the
     * record.
     */
    keepEmptyParagraphs?: boolean;
}
/** Cleans a clipboard HTML fragment in place. */
export declare function cleanPastedHtml(html: string, options?: PasteOptions): string;
/**
 * Whether pasted plain text is markdown worth parsing.
 *
 * Deliberately strict. A paragraph mentioning "the * character" or a line
 * starting with "- " in prose is not markdown, and converting it silently
 * rewrites what someone pasted. The test is for *structure*: a heading, a fence,
 * or several list items — signals that are hard to produce by accident.
 */
export declare function looksLikeMarkdown(text: string): boolean;
interface MarkdownNode {
    type: string;
    attrs?: Record<string, unknown>;
    content?: MarkdownNode[];
    text?: string;
    marks?: unknown[];
}
/**
 * A small block-level markdown parser.
 *
 * Ours rather than a dependency, because the whole point of the JSON schema is
 * that we control what a document can be — and a general markdown library
 * produces nodes we would then have to map, discard or invent schema for. This
 * handles the constructs the schema actually has.
 */
export declare function parseMarkdown(text: string): MarkdownNode;
/** A pasted URL over a selection means "link this", not "replace it". */
export declare function pastedUrl(text: string): string | null;
export {};
