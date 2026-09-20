import type { ApexFieldProps } from '../types';
type __VLS_Props = ApexFieldProps & {
    modelValue?: number | null;
    /** Number of stars. */
    stars?: number;
    /** Allow half-star selection. */
    allowHalf?: boolean;
    /** Stack the stars instead of laying them out in a row. */
    orientation?: 'horizontal' | 'vertical';
    /** Star size in pixels. Defaults to the field size. */
    starSize?: number;
    /** Preset shape. Ignored when `icon` is given. */
    shape?: 'star' | 'triangle' | 'dot' | 'square';
    /** Outlined glyphs, or solid ones. */
    variant?: 'filled' | 'outline';
    /** Glyphs for the filled and empty states, overriding `shape`. */
    icon?: string;
    emptyIcon?: string;
    /** Filled colour. Defaults to the warning accent. */
    color?: string;
    /** A × button that clears the value. */
    cancel?: boolean;
    /** Text beside the stars, e.g. "3.5 of 5". */
    showValue?: boolean;
    /** An unfilled star. Worth setting whenever you set `color`. */
    emptyColor?: string;
    /** Space between stars. */
    gap?: string;
    /** The × button, at rest and under the pointer. */
    cancelColor?: string;
    cancelHoverColor?: string;
    /** The "3 / 5" text beside the stars. */
    valueColor?: string;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    change: (v: number | null) => any;
    "update:modelValue": (v: number | null) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onChange?: ((v: number | null) => any) | undefined;
    "onUpdate:modelValue"?: ((v: number | null) => any) | undefined;
}>, {
    statusIcon: boolean;
    orientation: "horizontal" | "vertical";
    variant: "filled" | "outline";
    stars: number;
    shape: "star" | "triangle" | "dot" | "square";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
