type __VLS_Props = {
    /** Image source; falls back to `label` initials, then `icon`. */
    image?: string;
    /** Full name or short text. Initials are derived from it unless `initials` is set. */
    label?: string;
    initials?: string;
    icon?: string;
    shape?: 'circle' | 'rounded' | 'square';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    background?: string;
    color?: string;
    /** Ring around the avatar, for stacking on busy backgrounds. */
    ring?: boolean;
    ringColor?: string;
    /** Status dot: a tone name or any CSS colour. */
    status?: 'online' | 'busy' | 'away' | 'offline' | string;
    /** Where the dot sits. */
    statusPosition?: 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start';
    /** A count or short text pinned to a corner. */
    badge?: string | number;
    badgeSeverity?: 'primary' | 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast';
    badgePosition?: 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start';
    badgeBackground?: string;
    badgeColor?: string;
    /** Tint the initials from the label instead of the neutral default. */
    autoColor?: boolean;
    alt?: string;
};
declare var __VLS_7: {};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_7) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    size: "xs" | "sm" | "md" | "lg" | "xl" | number;
    shape: "circle" | "rounded" | "square";
    badgeSeverity: "primary" | "success" | "warn" | "danger" | "info" | "secondary" | "contrast";
    statusPosition: "bottom-end" | "bottom-start" | "top-end" | "top-start";
    badgePosition: "top-end" | "top-start" | "bottom-end" | "bottom-start";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
