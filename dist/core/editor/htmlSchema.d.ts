/**
 * The HTML editor's schema.
 *
 * Not a replacement for the prose schema — a SUPERSET of it. Everything the
 * editor has affordances for keeps a real node, so Enter still splits a
 * paragraph and the list button still makes a list. Everything else is carried
 * by a generic element node holding its tag and attributes, so it round-trips
 * byte-for-byte without the editor pretending to understand it.
 *
 * That is what makes the two components share almost everything above the
 * schema: toHtml and fromHtml go through DOMSerializer and DOMParser FROM the
 * schema, so they work on this one by construction, and the toolbars, comments,
 * suggestions and assist seam never look at node types they do not own.
 */
import type { MarkSpec, NodeSpec } from 'prosemirror-model';
export declare function safeUrlValue(name: string, value: string): boolean;
export declare function sanitiseAttrs(el: Element): Record<string, string>;
/**
 * Gives the prose nodes an attribute bag.
 *
 * A paragraph in a page still has to be a paragraph — Enter splits it, the list
 * button wraps it, alignment applies to it — but it also has to carry the class
 * the page put on it, because a block style IS a class and the gallery sets it.
 * So each spec is wrapped rather than replaced: its own parseDOM and toDOM keep
 * working, with the surviving attributes threaded through them.
 */
export declare function withAttrBag(nodes: Record<string, NodeSpec>): Record<string, NodeSpec>;
/** Elements that hold nothing, so they must be atoms rather than containers. */
export declare const VOID_TAGS: string[];
/**
 * The void elements that are PHRASING content — they belong inside a paragraph.
 *
 * The distinction is not cosmetic. A `<p>` holds `inline*`, so a block-group
 * node cannot live in one: `<p><img></p>` parsed to `<p></p><img>`, the image
 * hoisted out of its own paragraph. For an editor whose source of truth is HTML
 * that is simply wrong output, and it also makes an inline image and
 * alignment-in-flow impossible to express.
 *
 * `br` is absent because hard_break already owns it — a line break carries
 * meaning the generic void node would flatten.
 */
export declare const INLINE_VOID_TAGS: string[];
/** Never carried, whatever the mode: these are executable or page-scoped. */
export declare const FORBIDDEN_TAGS: string[];
/**
 * Elements the prose schema already owns. The catch-all must not claim these, or
 * a paragraph would parse as a generic element and lose its affordances.
 */
export declare const KNOWN_TAGS: string[];
/**
 * Two generic containers rather than one.
 *
 * A div holding paragraphs and a div holding bare text are different content
 * models, and ProseMirror cannot mix block and inline in one node. Collapsing
 * them would mean wrapping `<div>text</div>` into `<div><p>text</p></div>` and
 * losing fidelity on the most common hand-written case, so the parser chooses by
 * looking at what the element actually contains.
 */
export declare const htmlNodes: Record<string, NodeSpec>;
/**
 * Arbitrary inline elements as a MARK, because `<span class="lead">` applies to a
 * range of text rather than owning a block — the same reason a comment is a mark.
 */
export declare const htmlMarks: Record<string, MarkSpec>;
/** Adds or replaces one class on an attribute bag, leaving the others alone. */
export declare function withClass(attrs: Record<string, string>, add: string | null, removeSet?: string[]): Record<string, string>;
