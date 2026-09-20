import type { ApexFieldProps } from '../types';
type __VLS_Props = ApexFieldProps & {
    /** The chosen value, shared with the other radios in the group. */
    modelValue?: unknown;
    /** What this one contributes when chosen. */
    value?: unknown;
    /** Bordered choice card. */
    card?: boolean;
    icon?: string;
    image?: string;
    /** Second line under the label. */
    hint?: string;
    /**
     * Rendered by ApexRadioGroup, which owns the layout and the label. A lone
     * radio draws its own field shell; one inside a group must not, or every
     * option would repeat the group's label and message line.
     */
    bare?: boolean;
};
declare var __VLS_4: {}, __VLS_12: {};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_4) => any;
} & {
    default?: (props: typeof __VLS_12) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    change: (v: unknown) => any;
    "update:modelValue": (v: unknown) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onChange?: ((v: unknown) => any) | undefined;
    "onUpdate:modelValue"?: ((v: unknown) => any) | undefined;
}>, {
    statusIcon: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
