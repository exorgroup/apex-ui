export type ChipSeverity = 'neutral' | 'primary' | 'secondary' | 'success' | 'warn' | 'danger' | 'info' | 'contrast';
type __VLS_Props = {
    label?: string;
    icon?: string;
    /** Trailing icon, after the label and before the remove control. */
    trailingIcon?: string;
    /** An image at the leading edge, sized and clipped like an avatar. */
    image?: string;
    imageAlt?: string;
    severity?: ChipSeverity;
    variant?: 'solid' | 'subtle' | 'outlined';
    size?: 'sm' | 'md' | 'lg';
    /** Pill by default; square corners with a radius of your own. */
    radius?: string;
    /** Adds the remove control. */
    removable?: boolean;
    removeIcon?: string;
    /** Makes the chip itself a control — hover and press states, keyboard reachable. */
    clickable?: boolean;
    /** Selected state, for a chip acting as a filter or a multi-choice option. */
    selected?: boolean;
    /** Icon shown at the leading edge while selected, replacing `icon`. */
    selectedIcon?: string;
    disabled?: boolean;
    background?: string;
    color?: string;
    borderColor?: string;
    hoverBackground?: string;
    selectedBackground?: string;
    selectedColor?: string;
    width?: string;
    padding?: string;
    gap?: string;
};
declare var __VLS_10: {}, __VLS_15: {};
type __VLS_Slots = {} & {
    leading?: (props: typeof __VLS_10) => any;
} & {
    default?: (props: typeof __VLS_15) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    click: (ev: MouseEvent) => any;
    remove: (ev: KeyboardEvent | MouseEvent) => any;
    "update:selected": (v: boolean) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onClick?: ((ev: MouseEvent) => any) | undefined;
    onRemove?: ((ev: KeyboardEvent | MouseEvent) => any) | undefined;
    "onUpdate:selected"?: ((v: boolean) => any) | undefined;
}>, {
    size: "sm" | "md" | "lg";
    variant: "solid" | "subtle" | "outlined";
    severity: ChipSeverity;
    removeIcon: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
