import type { ApexMediaProps } from '../types';
type __VLS_Props = ApexMediaProps & {
    /** v-model — the divider position as a percentage. */
    modelValue?: number;
    orientation?: 'horizontal' | 'vertical';
    /** Follow the pointer without a press. */
    slideOnHover?: boolean;
    disabled?: boolean;
    /** Keyboard step, and the larger PageUp/PageDown step. */
    step?: number;
    pageStep?: number;
    width?: string;
    height?: string;
    aspectRatio?: string;
    radius?: string;
    background?: string;
    dividerWidth?: string;
    dividerColor?: string;
    handle?: boolean;
    handleSize?: string;
    handleColor?: string;
    handleBackground?: string;
    handleBorderColor?: string;
    handleRadius?: string;
    handleShadow?: string;
    icon?: string;
};
declare var __VLS_1: {}, __VLS_3: {
    value: number;
};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_1) => any;
} & {
    handle?: (props: typeof __VLS_3) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:modelValue": (v: number) => void;
    "slide-start": () => void;
    "slide-end": () => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onUpdate:modelValue"?: ((v: number) => any) | undefined;
    "onSlide-start"?: (() => any) | undefined;
    "onSlide-end"?: (() => any) | undefined;
}>, {
    radius: string;
    modelValue: number;
    step: number;
    orientation: "horizontal" | "vertical";
    handleSize: string;
    handle: boolean;
    pageStep: number;
    dividerWidth: string;
    handleRadius: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
