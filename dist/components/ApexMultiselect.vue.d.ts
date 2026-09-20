import type { ApexFieldProps, ApexOptionsInput } from '../types';
type __VLS_Props = ApexFieldProps & {
    modelValue?: unknown[];
    options?: ApexOptionsInput;
    placeholder?: string;
    leadingIcon?: string;
    clearable?: boolean;
    loading?: boolean;
    /** Cap the number of selections. */
    max?: number;
    /** Collapse to "N selected" past this many chips. */
    maxChips?: number;
    /** Search box at the top of the popover. */
    filter?: boolean;
    filterPlaceholder?: string;
    /** Show the filter automatically once there are this many options. */
    filterThreshold?: number;
    /** Select all / clear all row above the list. */
    toggleAll?: boolean;
    /**
     * Offer an "Add new" row at the foot of the list. Activating it emits
     * `add-new` and closes the overlay; it is not an option, so it never
     * toggles and never counts towards `max`.
     */
    addNew?: boolean;
    /** Row text while the filter is empty. With a query it reads Add "…". */
    addNewLabel?: string;
    /** What is being created, passed to the app-level canCreate resolver. */
    resource?: string;
    /** Overrides the resolver. Set it and no resolver is consulted. */
    canAddNew?: boolean;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    change: () => any;
    "update:modelValue": (v: unknown[]) => any;
    "add-new": (payload: {
        query: string;
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onChange?: (() => any) | undefined;
    "onUpdate:modelValue"?: ((v: unknown[]) => any) | undefined;
    "onAdd-new"?: ((payload: {
        query: string;
    }) => any) | undefined;
}>, {
    statusIcon: boolean;
    canAddNew: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
