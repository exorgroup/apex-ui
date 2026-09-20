import type { ApexEditorClasses } from '../types';
type __VLS_Props = {
    /**
     * A COUNTER, as with the link and image editors: the menu has to reopen this
     * after the author closed it, and an already-true boolean fires no watcher.
     */
    openRequest?: number;
    /** Called with (rows, cols) when a size is chosen. */
    insert?: ((rows: number, cols: number) => boolean) | null;
    disabled?: boolean;
    /**
     * Rendered as a PANEL rather than a button and popover — for a menu whose
     * submenu IS the grid, which is where an author looks for it after opening
     * Insert ▸ Table.
     */
    inline?: boolean;
    rows?: number;
    cols?: number;
    /** Class map — §4.3. Every part the template draws takes one key. */
    ui?: ApexEditorClasses;
};
declare var __VLS_4: {
    rows: number;
    cols: number;
    text: string;
};
type __VLS_Slots = {} & {
    readout?: (props: typeof __VLS_4) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    insert: (payload: {
        rows: number;
        cols: number;
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onInsert?: ((payload: {
        rows: number;
        cols: number;
    }) => any) | undefined;
}>, {
    rows: number;
    cols: number;
    insert: ((rows: number, cols: number) => boolean) | null;
    openRequest: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
