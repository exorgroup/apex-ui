type __VLS_Props = {
    /** A number makes it determinate; leave it out for the spin. */
    value?: number;
    max?: number;
    /** Diameter — a number is pixels. */
    size?: number | string;
    /** Ring thickness, in the same units as the diameter. */
    strokeWidth?: number;
    color?: string;
    trackColor?: string;
    /** Hide the track entirely, leaving a bare arc. */
    showTrack?: boolean;
    /** Percentage in the middle, determinate only. */
    showValue?: boolean;
    valueColor?: string;
    valueSize?: string;
    /** One rotation, or one indeterminate cycle. */
    duration?: string;
    /** How much of the ring the spinning arc covers. */
    arc?: number;
    /** Rounded or squared arc ends. */
    linecap?: 'round' | 'butt';
    /** Grow the arc as well as rotate it — the classic two-part spin. */
    pulse?: boolean;
    severity?: 'primary' | 'success' | 'warning' | 'danger' | 'auto';
    label?: string;
};
declare var __VLS_1: {
    value: number | undefined;
    percent: number;
    formatted: string;
};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_1) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    size: number | string;
    max: number;
    strokeWidth: number;
    arc: number;
    severity: "primary" | "success" | "warning" | "danger" | "auto";
    duration: string;
    showTrack: boolean;
    linecap: "round" | "butt";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
