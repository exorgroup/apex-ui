import type { ApexPickListClasses } from '../types';
type Item = Record<string, unknown>;
type Side = 0 | 1;
type __VLS_Props = {
    /** Your own class on any part. See ApexPickListClasses. */
    ui?: ApexPickListClasses;
    /** [source, target] */
    modelValue?: [Item[], Item[]] | Item[][];
    dataKey?: string;
    sourceHeader?: string;
    targetHeader?: string;
    /** A checkbox per row plus a select-all in each header. */
    checkbox?: boolean;
    /** Search box under each header. */
    filter?: boolean;
    filterPlaceholder?: string;
    /** Which reorder controls to show. */
    showSourceControls?: boolean;
    showTargetControls?: boolean;
    /**
     * Where each list's reorder stack sits. 'outside' keeps them clear of the centre —
     * source on the left, target on the right; 'start' or 'end' puts both on one side.
     */
    controlsPosition?: 'outside' | 'start' | 'end';
    /** Where the transfer controls sit. */
    transferPosition?: 'middle' | 'end';
    /** Stack the two lists vertically. */
    stacked?: boolean;
    scrollHeight?: number;
    noDrag?: boolean;
    emptyMessage?: string;
    disabled?: boolean;
    borderColor?: string;
    borderWidth?: number;
    radius?: string;
    headerBackground?: string;
    headerColor?: string;
    listBackground?: string;
    itemColor?: string;
    selectedBackground?: string;
    selectedColor?: string;
    selectedBorderColor?: string;
    gap?: string;
};
declare var __VLS_14: "sourceheader" | "targetheader", __VLS_15: {}, __VLS_32: {
    item: Item;
    index: number;
    side: Side;
};
type __VLS_Slots = {} & {
    [K in NonNullable<typeof __VLS_14>]?: (props: typeof __VLS_15) => any;
} & {
    option?: (props: typeof __VLS_32) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:modelValue": (v: Item[][]) => void;
    reorder: (payload: {
        side: Side;
        from: number;
        to: number;
    }) => void;
    "move-to-target": (payload: {
        items: Item[];
    }) => void;
    "move-to-source": (payload: {
        items: Item[];
    }) => void;
    "move-all-to-target": (payload: {
        items: Item[];
    }) => void;
    "move-all-to-source": (payload: {
        items: Item[];
    }) => void;
    "selection-change": (payload: {
        side: Side;
        items: Item[];
    }) => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onUpdate:modelValue"?: ((v: Item[][]) => any) | undefined;
    onReorder?: ((payload: {
        side: Side;
        from: number;
        to: number;
    }) => any) | undefined;
    "onMove-to-target"?: ((payload: {
        items: Item[];
    }) => any) | undefined;
    "onMove-to-source"?: ((payload: {
        items: Item[];
    }) => any) | undefined;
    "onMove-all-to-target"?: ((payload: {
        items: Item[];
    }) => any) | undefined;
    "onMove-all-to-source"?: ((payload: {
        items: Item[];
    }) => any) | undefined;
    "onSelection-change"?: ((payload: {
        side: Side;
        items: Item[];
    }) => any) | undefined;
}>, {
    scrollHeight: number;
    sourceHeader: string;
    targetHeader: string;
    showSourceControls: boolean;
    showTargetControls: boolean;
    controlsPosition: "outside" | "start" | "end";
    transferPosition: "middle" | "end";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
