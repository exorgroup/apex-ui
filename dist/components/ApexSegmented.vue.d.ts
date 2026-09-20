import type { ApexFieldProps, ApexOptionsInput } from '../types';
type __VLS_Props = ApexFieldProps & {
    modelValue?: unknown;
    options?: ApexOptionsInput;
    /** Stretch to full width, equal segments. */
    block?: boolean;
    barBackground?: string;
    barBorderColor?: string;
    barRadius?: string;
    /** An unselected segment, and one under the pointer. */
    optionColor?: string;
    hoverColor?: string;
    /** The selected segment. Set both, or the text may not read on the fill. */
    selectedBackground?: string;
    selectedColor?: string;
};
declare var __VLS_8: {
    option: import("../types").ApexOption<unknown>;
};
type __VLS_Slots = {} & {
    option?: (props: typeof __VLS_8) => any;
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
