import type { ApexFieldProps, ApexOption, ApexOptionsInput } from '../types';
type __VLS_Props = ApexFieldProps & {
    modelValue?: unknown;
    options?: ApexOptionsInput;
    /** Choose more than one; the model becomes an array. */
    multiple?: boolean;
    /** Stretch to full width, equal segments. */
    block?: boolean;
    /** Stack the buttons instead of laying them out in a row. */
    vertical?: boolean;
    /** Separate buttons with a gap instead of one joined bar. */
    detached?: boolean;
    /** Let the single-choice value be cleared by re-clicking it. */
    allowEmpty?: boolean;
    /** Icons only; labels move to the tooltip and the accessible name. */
    iconOnly?: boolean;
    /** Selected button background. Defaults to the accent. */
    color?: string;
    /** Selected button text colour. Defaults to white. */
    textColor?: string;
    /** Unselected label colour. */
    mutedColor?: string;
    barBackground?: string;
    barBorderColor?: string;
    barRadius?: string;
    /** An unselected button under the pointer. */
    hoverBackground?: string;
    hoverColor?: string;
};
declare var __VLS_8: {
    option: ApexOption<unknown>;
};
type __VLS_Slots = {} & {
    option?: (props: typeof __VLS_8) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    change: () => any;
    "update:modelValue": (v: unknown) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onChange?: (() => any) | undefined;
    "onUpdate:modelValue"?: ((v: unknown) => any) | undefined;
}>, {
    statusIcon: boolean;
    allowEmpty: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
