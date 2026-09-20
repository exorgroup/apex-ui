import type { ApexProgressBarClasses } from '../types';
type __VLS_Props = {
    /** Your own class on any part. See ApexProgressBarClasses. */
    ui?: ApexProgressBarClasses;
    value?: number;
    max?: number;
    /** `indeterminate` sweeps for work of unknown length; `value` is ignored. */
    mode?: 'determinate' | 'indeterminate';
    /** Kept for existing callers; the same as mode="indeterminate". */
    indeterminate?: boolean;
    /** Named stages. The percentage comes from `step`, not from `value`. */
    steps?: string[];
    /** Which step is current, zero-based. */
    step?: number;
    /** Show the current step's name above the bar. */
    showStepLabel?: boolean;
    /** Percentage readout inside or beside the bar. */
    showValue?: boolean;
    valuePosition?: 'inside' | 'end';
    /** Below this percentage the inside readout moves out, where it stays legible. */
    insideThreshold?: number;
    /** Bar thickness — a number is pixels. */
    height?: number | string;
    color?: string;
    trackColor?: string;
    radius?: string;
    /** Round the fill separately from the track. */
    fillRadius?: string;
    valueColor?: string;
    valueSize?: string;
    /** Diagonal stripes over the fill, optionally travelling. */
    striped?: boolean;
    animatedStripes?: boolean;
    /** How long one indeterminate sweep takes. */
    sweepDuration?: string;
    /** Tint by threshold: danger under 34%, warning under 67%, success above. */
    severity?: 'primary' | 'success' | 'warning' | 'danger' | 'auto';
    label?: string;
};
type __VLS_Slots = {
    label?: (props: {
        value: number;
        percent: number;
        formatted: string;
        step: string;
    }) => unknown;
    value?: (props: {
        value: number;
        percent: number;
        formatted: string;
    }) => unknown;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    value: number;
    max: number;
    step: number;
    height: number | string;
    severity: "primary" | "success" | "warning" | "danger" | "auto";
    showStepLabel: boolean;
    valuePosition: "inside" | "end";
    insideThreshold: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
