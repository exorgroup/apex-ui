import type { ApexFieldProps, ApexOption, ApexOptionsInput } from '../types';
type __VLS_Props = ApexFieldProps & {
    /** The collection, in order. */
    modelValue?: ApexOptionsInput;
    /** Chosen values. */
    selection?: unknown[];
    /** A checkbox per row. */
    checkbox?: boolean;
    /** Allow more than one row to be selected. Implied by `checkbox`. */
    multiple?: boolean;
    /** Search box above the list. */
    filter?: boolean;
    filterPlaceholder?: string;
    /** List height cap in pixels. */
    scrollHeight?: number;
    /** Which side the move controls sit on. */
    controls?: 'start' | 'end' | 'top' | 'none';
    /** How the controls align along the list — top, centre or bottom. */
    controlsAlign?: 'start' | 'center' | 'end';
    /** Include the jump-to-top and jump-to-bottom buttons. */
    extremes?: boolean;
    /** Turn off drag-and-drop, leaving only the buttons. */
    noDrag?: boolean;
    emptyMessage?: string;
    /**
     * Offer an "Add new" row at the foot of the list, for when the record the
     * user wants to place in the order does not exist yet. Activating it emits
     * `add-new`; the list stays put, since there is no overlay to dismiss.
     */
    addNew?: boolean;
    /** Row text while the filter is empty. With a query it reads Add "…". */
    addNewLabel?: string;
    /** What is being created, passed to the app-level canCreate resolver. */
    resource?: string;
    /** Overrides the resolver. Set it and no resolver is consulted. */
    canAddNew?: boolean;
    /** The framed panel around the filter and the list. */
    panelBackground?: string;
    panelBorderColor?: string;
    panelRadius?: string;
    /** A row: its text, corner, and the tint under the pointer. */
    rowColor?: string;
    rowRadius?: string;
    rowHoverBackground?: string;
    /** A chosen row. Set both — the default foreground is the accent. */
    rowSelectedBackground?: string;
    rowSelectedColor?: string;
    /** The move buttons beside the list, and the drag handle on a row. */
    moveButtonColor?: string;
    moveButtonSize?: string;
    gripColor?: string;
};
declare var __VLS_32: {
    item: ApexOption<unknown>;
    index: number;
};
type __VLS_Slots = {} & {
    item?: (props: typeof __VLS_32) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    change: () => any;
    "update:modelValue": (v: unknown[]) => any;
    "add-new": (payload: {
        query: string;
    }) => any;
    "update:selection": (v: unknown[]) => any;
    reorder: (payload: {
        from: number;
        to: number;
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onChange?: (() => any) | undefined;
    "onUpdate:modelValue"?: ((v: unknown[]) => any) | undefined;
    "onAdd-new"?: ((payload: {
        query: string;
    }) => any) | undefined;
    "onUpdate:selection"?: ((v: unknown[]) => any) | undefined;
    onReorder?: ((payload: {
        from: number;
        to: number;
    }) => any) | undefined;
}>, {
    statusIcon: boolean;
    canAddNew: boolean;
    scrollHeight: number;
    controls: "start" | "end" | "top" | "none";
    controlsAlign: "start" | "center" | "end";
    extremes: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
