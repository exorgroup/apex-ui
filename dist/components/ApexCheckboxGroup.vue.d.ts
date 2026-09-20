import type { ApexFieldProps, ApexOptionsInput } from '../types';
type __VLS_Props = ApexFieldProps & {
    modelValue?: unknown[];
    options?: ApexOptionsInput;
    /** Lay the boxes out in a row. */
    inline?: boolean;
    /** Fixed column count instead of one per row. */
    columns?: number;
    /** Bordered choice cards. */
    card?: boolean;
    /** Select all / clear all link above the list. */
    toggleAll?: boolean;
    /** Cap the number of selections. */
    max?: number;
};
declare var __VLS_15: {
    option: import("../types").ApexOption<unknown>;
};
type __VLS_Slots = {} & {
    option?: (props: typeof __VLS_15) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    change: () => any;
    "update:modelValue": (v: unknown[]) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onChange?: (() => any) | undefined;
    "onUpdate:modelValue"?: ((v: unknown[]) => any) | undefined;
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
