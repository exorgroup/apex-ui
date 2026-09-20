import type { ApexFieldProps } from '../types';
type __VLS_Props = ApexFieldProps & {
    modelValue?: number | number[] | null;
    min?: number;
    max?: number;
    /** Size of each movement. */
    step?: number;
    /** Two handles; the value becomes an array. */
    range?: boolean;
    /** Minimum number of steps between the handles in range mode. */
    minStepsBetweenHandles?: number;
    orientation?: 'horizontal' | 'vertical';
    /** Track length in pixels: the vertical track's length, and the horizontal track's minimum width. */
    length?: number;
    /** Diameter of a handle, in pixels. */
    handleSize?: number;
    /** The value bubble, which otherwise sits on the sidebar surface. */
    tooltipBackground?: string;
    tooltipColor?: string;
    /** Bubble showing the value while dragging. */
    showTooltip?: boolean;
    /** Track thickness in pixels. */
    trackSize?: number;
    /** Filled range colour. */
    color?: string;
    /** Empty track colour. */
    trackColor?: string;
    /** Handle fill. */
    handleColor?: string;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    change: (v: number | number[]) => any;
    "update:modelValue": (v: number | number[]) => any;
    slideend: (v: number | number[]) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onChange?: ((v: number | number[]) => any) | undefined;
    "onUpdate:modelValue"?: ((v: number | number[]) => any) | undefined;
    onSlideend?: ((v: number | number[]) => any) | undefined;
}>, {
    length: number;
    statusIcon: boolean;
    min: number;
    max: number;
    step: number;
    orientation: "horizontal" | "vertical";
    minStepsBetweenHandles: number;
    trackSize: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
