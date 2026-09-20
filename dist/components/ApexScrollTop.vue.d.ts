type __VLS_Props = {
    /** 'window', 'parent', or a selector for any scroller. */
    target?: 'window' | 'parent' | string;
    /** Scroll distance before it appears. */
    threshold?: number;
    icon?: string;
    /** Text beside the icon, which turns it into a pill. */
    label?: string;
    ariaLabel?: string;
    behavior?: 'smooth' | 'auto';
    position?: 'bottom-end' | 'bottom-start' | 'bottom-center';
    offset?: string;
    size?: string;
    radius?: string;
    background?: string;
    color?: string;
    borderColor?: string;
    shadow?: string;
    hoverBackground?: string;
    hoverColor?: string;
    /** Lift the button on hover. Off for a button that should sit still. */
    hoverLift?: boolean;
    /** Ring showing how far down the scroller you are. */
    showProgress?: boolean;
    progressColor?: string;
    zIndex?: number;
};
declare var __VLS_1: {};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_1) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    click: () => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onClick?: (() => any) | undefined;
}>, {
    size: string;
    position: "bottom-end" | "bottom-start" | "bottom-center";
    zIndex: number;
    target: "window" | "parent" | string;
    icon: string;
    offset: string;
    behavior: "smooth" | "auto";
    threshold: number;
    hoverLift: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
