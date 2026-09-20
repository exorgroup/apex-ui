type __VLS_Props = {
    /** v-model:active — two-way, so a caller can open and close it too. */
    active?: boolean;
    /** Text for the closed state when the display slot is not used. */
    display?: string;
    displayIcon?: string;
    disabled?: boolean;
    /** Keep the content mounted after the first open. */
    keepAlive?: boolean;
    /** Built-in close control at the content's trailing edge. */
    closable?: boolean;
    closeIcon?: string;
    /** Focus the first field in the content when it opens. */
    autoFocus?: boolean;
    width?: string;
    padding?: string;
    radius?: string;
    background?: string;
    color?: string;
    borderColor?: string;
    /** Hover feedback on the closed state. Off for a display that should look static. */
    hoverable?: boolean;
    hoverBackground?: string;
    hoverColor?: string;
    /** Dashed outline hinting that the closed value is editable. */
    outlined?: boolean;
    contentBackground?: string;
    contentPadding?: string;
};
declare function open(): void;
declare function close(): void;
declare var __VLS_1: {
    open: typeof open;
}, __VLS_6: {
    close: typeof close;
    active: true;
};
type __VLS_Slots = {} & {
    display?: (props: typeof __VLS_1) => any;
} & {
    content?: (props: typeof __VLS_6) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    open: typeof open;
    close: typeof close;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:active": (v: boolean) => void;
    close: () => void;
    open: () => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onClose?: (() => any) | undefined;
    onOpen?: (() => any) | undefined;
    "onUpdate:active"?: ((v: boolean) => any) | undefined;
}>, {
    active: boolean;
    hoverable: boolean;
    closeIcon: string;
    autoFocus: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
