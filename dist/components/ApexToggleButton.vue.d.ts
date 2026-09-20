import type { ApexFieldProps } from '../types';
type __VLS_Props = ApexFieldProps & {
    modelValue?: boolean;
    /** Label while on / off. Falls back to `label`. */
    onLabel?: string;
    offLabel?: string;
    /** Icon while on / off. */
    onIcon?: string;
    offIcon?: string;
    /** Full width. */
    block?: boolean;
    /** Separate on-state colours. */
    onColor?: string;
    onTextColor?: string;
    /** Outlined while off instead of tinted. */
    variant?: 'solid' | 'outline';
    offBackground?: string;
    offColor?: string;
    offBorderColor?: string;
    offRadius?: string;
    /** Under the pointer while off. */
    hoverColor?: string;
    hoverBorderColor?: string;
};
declare var __VLS_8: {
    on: boolean;
};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_8) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    change: (v: boolean) => any;
    "update:modelValue": (v: boolean) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onChange?: ((v: boolean) => any) | undefined;
    "onUpdate:modelValue"?: ((v: boolean) => any) | undefined;
}>, {
    statusIcon: boolean;
    variant: "solid" | "outline";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
