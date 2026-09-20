/**
 * The styles gallery — the application's classes, applied the way Word's styles
 * are: select, then click.
 *
 * Word distinguishes CHARACTER styles from PARAGRAPH styles, and the distinction
 * is not cosmetic: a character style applies to a run of text and so must be a
 * mark, where a paragraph style belongs to the whole block and so must be an
 * attribute. Offering one control for both would mean guessing, and guessing
 * wrong either paints half a paragraph or restyles a whole one the author only
 * meant to touch a word of.
 */
import type { Command } from 'prosemirror-state';
import type { Schema } from 'prosemirror-model';
export interface HtmlStyle {
    /** What the author sees in the gallery. */
    label: string;
    /** The class the markup carries. */
    className: string;
    /**
     * 'block' sets the class on the enclosing block; 'character' wraps the
     * selection in a span. Defaults to block, since most named styles are.
     */
    scope?: 'block' | 'character';
    /**
     * Change the block's tag as well, the way Word's Heading 1 is both a style and
     * a heading. Block scope only.
     */
    tag?: string;
    /** A short inline style for the gallery button, when the real CSS is not loaded. */
    preview?: string;
    group?: string;
}
/** Every class the gallery owns, so applying one can retire the others. */
export declare function galleryClasses(styles: HtmlStyle[], scope?: 'block' | 'character'): string[];
/**
 * Applies a block style to every block in the selection.
 *
 * Exclusive within the gallery and nowhere else: applying "Lead" retires "Quote"
 * because they are alternatives, but leaves a `grid-item` the template needs
 * alone. A gallery that stripped every class would silently break layouts.
 */
export declare function applyBlockStyle(schema: Schema, style: HtmlStyle | null, all: HtmlStyle[]): Command;
/**
 * Applies a character style over the selection as an inline_element mark.
 *
 * Removing first, then adding: the marks do not exclude one another — nested
 * spans are ordinary HTML — so without the removal, clicking three styles in
 * turn would leave three nested spans rather than replacing the style.
 */
export declare function applyCharacterStyle(schema: Schema, style: HtmlStyle | null, all: HtmlStyle[]): Command;
/** Which gallery style the selection currently carries, for the active state. */
export declare function activeStyle(state: {
    selection: {
        from: number;
        to: number;
        empty: boolean;
        $from: {
            marks: () => unknown[];
            parent: {
                attrs: Record<string, unknown>;
            };
        };
    };
    doc: unknown;
    schema?: Schema;
}, styles: HtmlStyle[], schema: Schema): {
    block: string | null;
    character: string | null;
};
