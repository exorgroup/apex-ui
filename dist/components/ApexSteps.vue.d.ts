import type { ApexContainerProps } from '../types';
export interface StepsStep {
    /** Stable identifier. Falls back to the 1-based index. */
    value?: string | number;
    label?: string;
    subtitle?: string;
    icon?: string;
    disabled?: boolean;
    /** Marks a step done regardless of position — for a resumed wizard. */
    completed?: boolean;
    /** Blocks a linear stepper from advancing past this step. */
    incomplete?: boolean;
}
type __VLS_Props = ApexContainerProps & {
    steps?: StepsStep[];
    /** The active step's `value`. Bindable. */
    modelValue?: string | number;
    orientation?: 'horizontal' | 'vertical';
    /** Each step must be completed before the next becomes reachable. */
    linear?: boolean;
    /** Header only — no panels. */
    stepsOnly?: boolean;
    /** What a header renders as. A button is focusable and clickable. */
    as?: 'button' | 'div';
    /** Show a tick on steps behind the active one. */
    showComplete?: boolean;
    completeIcon?: string;
    /** Built-in Back / Next controls under each panel. */
    showNav?: boolean;
    backLabel?: string;
    nextLabel?: string;
    finishLabel?: string;
    size?: 'sm' | 'md' | 'lg';
    activeColor?: string;
    completeColor?: string;
    connectorColor?: string;
    /** Marker diameter in pixels. */
    markerSize?: number;
    /** Hide the connector line between markers. */
    hideConnector?: boolean;
    disabled?: boolean;
};
declare function goTo(i: number): void;
declare function back(): void;
declare function next(): void;
declare var __VLS_13: `step-${number}`, __VLS_14: {
    step: StepsStep;
    index: number;
    active: boolean;
    complete: boolean;
    goTo: () => void;
}, __VLS_23: `panel-${number}`, __VLS_24: {
    step: StepsStep;
    index: number;
    back: typeof back;
    next: typeof next;
}, __VLS_52: `step-${number}`, __VLS_53: {
    step: StepsStep;
    index: number;
    active: boolean;
    complete: boolean;
    goTo: () => void;
}, __VLS_62: `panel-${number}`, __VLS_63: {
    step: StepsStep;
    index: number;
    back: typeof back;
    next: typeof next;
};
type __VLS_Slots = {} & {
    [K in NonNullable<typeof __VLS_13>]?: (props: typeof __VLS_14) => any;
} & {
    [K in NonNullable<typeof __VLS_23>]?: (props: typeof __VLS_24) => any;
} & {
    [K in NonNullable<typeof __VLS_52>]?: (props: typeof __VLS_53) => any;
} & {
    [K in NonNullable<typeof __VLS_62>]?: (props: typeof __VLS_63) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    goTo: typeof goTo;
    back: typeof back;
    next: typeof next;
    activeIndex: import("vue").ComputedRef<number>;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    "update:modelValue": (v: string | number) => any;
    "step-change": (payload: {
        value: string | number;
        index: number;
        previous: string | number;
    }) => any;
    finish: (payload: {
        value: string | number;
        index: number;
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onUpdate:modelValue"?: ((v: string | number) => any) | undefined;
    "onStep-change"?: ((payload: {
        value: string | number;
        index: number;
        previous: string | number;
    }) => any) | undefined;
    onFinish?: ((payload: {
        value: string | number;
        index: number;
    }) => any) | undefined;
}>, {
    size: "sm" | "md" | "lg";
    orientation: "horizontal" | "vertical";
    as: "button" | "div";
    showComplete: boolean;
    completeIcon: string;
    backLabel: string;
    nextLabel: string;
    finishLabel: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
