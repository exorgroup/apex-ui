import type { ApexEditorClasses } from '../types';
import { type ToolbarItem } from './ApexEditorToolbar.vue';
type __VLS_Props = {
    /** The live editor view, from the editor's `view()`. */
    view?: unknown;
    active?: {
        marks: Record<string, boolean>;
        blockType: string;
        blockAttrs: Record<string, unknown>;
        blockMixed?: boolean;
    } | null;
    can?: Record<string, boolean>;
    run?: (name: string) => boolean;
    items?: (ToolbarItem | string)[];
    /** Show it for a caret too, not only a range. Off, because a menu that follows
     *  the caret while typing is in the way of the writing. */
    onCaret?: boolean;
    offset?: number;
    disabled?: boolean;
    /** Class map — §4.3. Every part the template draws takes one key. */
    ui?: ApexEditorClasses;
};
declare var __VLS_8: {
    item: import("../core/editor/catalogue").ResolvedItem;
    active: {
        marks: Record<string, boolean>;
        blockType: string;
        blockAttrs: Record<string, unknown>;
        blockMixed?: boolean;
    } | null | undefined;
    can: Record<string, boolean> | undefined;
    run: ((name: string) => boolean) | undefined;
};
type __VLS_Slots = {} & {
    link?: (props: typeof __VLS_8) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    offset: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
