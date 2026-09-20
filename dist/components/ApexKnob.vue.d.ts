import type { ApexFieldProps } from '../types';
type __VLS_Props = ApexFieldProps & {
    modelValue?: number | null;
    min?: number;
    max?: number;
    /** Size of each movement. */
    step?: number;
    /** Diameter in pixels. */
    diameter?: number;
    /** Arc thickness in pixels. */
    strokeWidth?: number;
    /**
     * How far the dial sweeps, in degrees. 270 leaves a gap at the bottom; 180 is
     * a half dial across the top; 360 is a closed ring. The gap is always centred
     * at the bottom, so the sweep stays symmetrical about the vertical.
     */
    arc?: number;
    /** Thickness of the unfilled arc. Follows strokeWidth unless set. */
    railWidth?: number;
    /** Centre text size in pixels. */
    textSize?: number;
    /** Filled arc colour. Defaults to the accent. */
    valueColor?: string;
    /** Track colour. */
    rangeColor?: string;
    /** Centre text colour. */
    textColor?: string;
    /** Hide the number in the middle. */
    hideValue?: boolean;
    /** Formats the centre text, e.g. (v) => v + '%'. */
    valueTemplate?: (v: number) => string;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    change: (v: number) => any;
    "update:modelValue": (v: number) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onChange?: ((v: number) => any) | undefined;
    "onUpdate:modelValue"?: ((v: number) => any) | undefined;
}>, {
    statusIcon: boolean;
    min: number;
    max: number;
    step: number;
    diameter: number;
    strokeWidth: number;
    arc: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
