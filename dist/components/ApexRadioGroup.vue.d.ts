import type { ApexFieldProps, ApexOptionsInput } from '../types';
type __VLS_Props = ApexFieldProps & {
    modelValue?: unknown;
    options?: ApexOptionsInput;
    card?: boolean;
    inline?: boolean;
    /** Fixed column count instead of one per row. */
    columns?: number;
};
declare var __VLS_12: {
    option: import("../types").ApexOption<unknown>;
};
type __VLS_Slots = {} & {
    option?: (props: typeof __VLS_12) => any;
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
