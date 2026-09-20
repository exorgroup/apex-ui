import type { ApexEditorClasses } from '../types';
import { type SlashItem, type SlashState } from '../core/editor/slash';
type __VLS_Props = {
    state?: SlashState | null;
    items?: SlashItem[];
    /** Where the trigger sits, in the writing area's coordinates. */
    coords?: {
        x: number;
        y: number;
    } | null;
    /** Class map — §4.3. Every part the template draws takes one key. */
    ui?: ApexEditorClasses;
};
/** Handles a key the plugin handed over; returns whether it was used. */
declare function handleKey(key: string): boolean;
declare var __VLS_1: {
    item: SlashItem;
    selected: boolean;
    group: string;
    index: number;
};
type __VLS_Slots = {} & {
    item?: (props: typeof __VLS_1) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    handleKey: typeof handleKey;
    hasItems: () => boolean;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    close: () => any;
    choose: (payload: {
        item: SlashItem;
        state: SlashState;
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onClose?: (() => any) | undefined;
    onChoose?: ((payload: {
        item: SlashItem;
        state: SlashState;
    }) => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
