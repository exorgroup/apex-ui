import type { ApexFieldProps } from '../types';
type __VLS_Props = ApexFieldProps & {
    modelValue?: boolean | unknown[];
    /** Given, the control toggles this value inside a modelValue array. */
    value?: unknown;
    /** Mixed state — visual only; clicking still checks. */
    indeterminate?: boolean;
    /** Bordered choice card. */
    card?: boolean;
    icon?: string;
    image?: string;
    /** Second line under the label. */
    hint?: string;
    /**
     * Rendered by ApexCheckboxGroup, which owns the layout and the label. A lone
     * checkbox draws its own field shell; one inside a group must not, or every
     * option would repeat the group's label and message line.
     */
    bare?: boolean;
};
declare var __VLS_10: {}, __VLS_24: {};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_10) => any;
} & {
    default?: (props: typeof __VLS_24) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    change: (v: boolean) => any;
    "update:modelValue": (v: boolean | unknown[]) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onChange?: ((v: boolean) => any) | undefined;
    "onUpdate:modelValue"?: ((v: boolean | unknown[]) => any) | undefined;
}>, {
    labelPlacement: import("../types").ApexLabelPlacement;
    statusIcon: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
