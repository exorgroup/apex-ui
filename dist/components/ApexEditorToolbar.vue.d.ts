import type { ApexEditorClasses } from '../types';
import { type ResolvedItem } from '../core/editor/catalogue';
/**
 * A resolved toolbar item.
 *
 * DERIVED from the catalogue's item type rather than declared alongside it. Two
 * hand-written copies had already diverged on two fields — `type` carried
 * 'group' and 'button' the template never branches on, and `options` required
 * properties the shared type left optional — which made neither comparable to
 * the other. The catalogue removed that duplication for commands; this removes
 * it for their container, so the divergence cannot recur.
 */
export type ToolbarItem = ResolvedItem;
export type ToolbarPreset = 'minimal' | 'standard' | 'full';
type __VLS_Props = {
    /** What the editor reports at the selection. */
    active?: {
        marks: Record<string, boolean>;
        blockType: string;
        blockAttrs: Record<string, unknown>;
        blockMixed?: boolean;
    } | null;
    /** Which commands apply here, from the editor. */
    can?: Record<string, boolean>;
    /** Runs a command by name. */
    run?: (name: string) => boolean;
    /** A named set, or your own items. */
    items?: (ToolbarItem | string)[];
    /**
     * Names to leave OUT of whichever set resolves - the preset, `items`, and
     * the overflow alike.
     *
     * "standard, without the source view" is a common request, and the honest
     * answer to it is not a hand-copied sixteen-entry `items` list: that copy
     * stops tracking the preset the day anything is added to it. A command
     * name, a custom slot name (`link`, `table`) or an option of the block
     * select all match.
     *
     * Separators around what goes are tidied away, because a divider with
     * nothing left on one side of it is a stray line.
     */
    exclude?: string[];
    /**
     * Names, like `items`. Null takes the preset's own overflow; an explicit []
     * is how a caller says "no overflow button".
     */
    overflowItems?: (ToolbarItem | string)[] | null;
    preset?: ToolbarPreset;
    size?: 'sm' | 'md';
    /** Sticks to the top of the scroll container as the document runs past. */
    sticky?: boolean;
    /** Wrap onto more rows, or keep one row and overflow into a menu. */
    wrap?: boolean;
    disabled?: boolean;
    /** Class map — §4.3. Every part the template draws takes one key. */
    ui?: ApexEditorClasses;
};
declare var __VLS_10: string | undefined, __VLS_11: {
    item: ResolvedItem;
    active: {
        marks: Record<string, boolean>;
        blockType: string;
        blockAttrs: Record<string, unknown>;
        blockMixed?: boolean;
    } | null | undefined;
    can: Record<string, boolean> | undefined;
    run: ((name: string) => boolean) | undefined;
}, __VLS_24: {};
type __VLS_Slots = {} & {
    [K in NonNullable<typeof __VLS_10>]?: (props: typeof __VLS_11) => any;
} & {
    end?: (props: typeof __VLS_24) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    command: (payload: {
        command: string;
        applied: boolean;
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onCommand?: ((payload: {
        command: string;
        applied: boolean;
    }) => any) | undefined;
}>, {
    size: "sm" | "md";
    wrap: boolean;
    overflowItems: (ToolbarItem | string)[] | null;
    preset: ToolbarPreset;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
