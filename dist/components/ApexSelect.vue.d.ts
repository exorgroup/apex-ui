import type { ApexFieldProps, ApexOptionsInput } from '../types';
type __VLS_Props = ApexFieldProps & {
    modelValue?: string | number | null;
    options?: ApexOptionsInput;
    placeholder?: string;
    leadingIcon?: string;
    clearable?: boolean;
    loading?: boolean;
    /** Use the browser's own <select> instead of the popover listbox. */
    native?: boolean;
    /** Search box at the top of the popover. */
    filter?: boolean;
    filterPlaceholder?: string;
    /** Show the filter automatically once there are this many options. */
    filterThreshold?: number;
    /**
     * Offer an "Add new" row at the foot of the list, for when the record the
     * user wants does not exist yet. Activating it emits `add-new` and closes
     * the overlay; what happens next — a route, a dialog, an inline form — is
     * entirely the caller's.
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
    "update:modelValue": (v: string | number | null) => any;
    "add-new": (payload: {
        query: string;
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onChange?: (() => any) | undefined;
    "onUpdate:modelValue"?: ((v: string | number | null) => any) | undefined;
    "onAdd-new"?: ((payload: {
        query: string;
    }) => any) | undefined;
}>, {
    statusIcon: boolean;
    canAddNew: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
