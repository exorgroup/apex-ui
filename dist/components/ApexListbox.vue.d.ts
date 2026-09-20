import type { ApexFieldProps, ApexOption, ApexOptionsInput } from '../types';
export interface ListboxGroup {
    label: string;
    icon?: string;
    items: ApexOptionsInput;
}
type __VLS_Props = ApexFieldProps & {
    modelValue?: unknown;
    /** Flat options, or groups of { label, items }. */
    options?: ApexOptionsInput | ListboxGroup[];
    /** Choose more than one; the model becomes an array. */
    multiple?: boolean;
    /** A checkbox per option. Implies multiple. */
    checkbox?: boolean;
    /** Search box pinned to the top of the list. */
    filter?: boolean;
    filterPlaceholder?: string;
    /** Cap the list height in pixels. */
    scrollHeight?: number;
    /** Row above the list with a running count. */
    toggleAll?: boolean;
    /** Cap the number of selections. */
    max?: number;
    emptyMessage?: string;
    /**
     * Offer an "Add new" row at the foot of the list. Activating it emits
     * `add-new` with whatever was typed in the filter; the list stays where it
     * is, since there is no overlay to dismiss.
     */
    addNew?: boolean;
    /** Row text while the filter is empty. With a query it reads Add "…". */
    addNewLabel?: string;
    /** What is being created, passed to the app-level canCreate resolver. */
    resource?: string;
    /** Overrides the resolver. Set it and no resolver is consulted. */
    canAddNew?: boolean;
};
declare var __VLS_20: {
    option: ApexOption<unknown>;
};
type __VLS_Slots = {} & {
    option?: (props: typeof __VLS_20) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    change: () => any;
    "update:modelValue": (v: unknown) => any;
    "add-new": (payload: {
        query: string;
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onChange?: (() => any) | undefined;
    "onUpdate:modelValue"?: ((v: unknown) => any) | undefined;
    "onAdd-new"?: ((payload: {
        query: string;
    }) => any) | undefined;
}>, {
    statusIcon: boolean;
    canAddNew: boolean;
    scrollHeight: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
