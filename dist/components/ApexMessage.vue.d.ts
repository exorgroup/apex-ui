export type MessageSeverity = 'info' | 'success' | 'warn' | 'error' | 'secondary' | 'contrast';
type __VLS_Props = {
    /** Bindable, so a closed message can be brought back. */
    visible?: boolean;
    severity?: MessageSeverity;
    variant?: 'filled' | 'outlined' | 'simple';
    size?: 'sm' | 'md' | 'lg';
    /** Overrides the severity's icon; empty string removes it. */
    icon?: string;
    closable?: boolean;
    /** Dismiss automatically after this many milliseconds. */
    life?: number;
    /** Show a bar counting the life down. */
    showTimer?: boolean;
    /** Frost what sits behind the message; a number or CSS length sets the radius. */
    blur?: boolean | number | string;
    /** Make the surface translucent, so a blur has something to show through. */
    translucent?: boolean;
    background?: string;
    textColor?: string;
    borderColor?: string;
    iconColor?: string;
    radius?: string;
    padding?: string;
    /** Stretch to the container, or hug its content. */
    block?: boolean;
};
declare var __VLS_5: {}, __VLS_10: {}, __VLS_12: {};
type __VLS_Slots = {} & {
    icon?: (props: typeof __VLS_5) => any;
} & {
    default?: (props: typeof __VLS_10) => any;
} & {
    actions?: (props: typeof __VLS_12) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:visible": (v: boolean) => void;
    close: () => void;
    "life-end": () => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onClose?: (() => any) | undefined;
    "onUpdate:visible"?: ((v: boolean) => any) | undefined;
    "onLife-end"?: (() => any) | undefined;
}>, {
    size: "sm" | "md" | "lg";
    visible: boolean;
    variant: "filled" | "outlined" | "simple";
    block: boolean;
    severity: MessageSeverity;
    closable: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
