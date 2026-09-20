import type { ApexFieldProps } from '../types';
export interface CascadeOption {
    value?: unknown;
    label: string;
    icon?: string;
    image?: string;
    help?: string;
    disabled?: boolean;
    children?: CascadeOption[];
}
type __VLS_Props = ApexFieldProps & {
    modelValue?: unknown;
    options?: CascadeOption[];
    placeholder?: string;
    leadingIcon?: string;
    clearable?: boolean;
    loading?: boolean;
    /** Heading above the first panel. */
    heading?: string;
    /** Show the whole branch in the field, not just the leaf. */
    showPath?: boolean;
    pathSeparator?: string;
    /** Button under the first panel; emits @action. */
    footerAction?: {
        label: string;
        icon?: string;
    };
    /**
     * Offer an "Add new" row at the foot of every open column. Unlike the flat
     * choosers, a cascade has levels, so the event carries the branch the row
     * sits under: `path` is the chain of options above it, empty at the first
     * column. That is what lets a handler create in the right place.
     *
     * Distinct from `footerAction`, which is a general button on the first
     * column. Both can be shown at once.
     */
    addNew?: boolean;
    /** Row text. This control has no filter, so it never carries a query. */
    addNewLabel?: string;
    /** What is being created, passed to the app-level canCreate resolver. */
    resource?: string;
    /** Overrides the resolver. Set it and no resolver is consulted. */
    canAddNew?: boolean;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    change: () => any;
    "update:modelValue": (v: unknown) => any;
    action: () => any;
    "add-new": (payload: {
        query: string;
        path: CascadeOption[];
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onChange?: (() => any) | undefined;
    "onUpdate:modelValue"?: ((v: unknown) => any) | undefined;
    onAction?: (() => any) | undefined;
    "onAdd-new"?: ((payload: {
        query: string;
        path: CascadeOption[];
    }) => any) | undefined;
}>, {
    statusIcon: boolean;
    canAddNew: boolean;
    pathSeparator: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
