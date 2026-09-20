/**
 * ApexOverlayBadge — pins a badge to the corner of whatever it wraps.
 *
 * A wrapper rather than a prop on every component: any element can carry a
 * badge this way, and the badge keeps its own props instead of each host
 * re-declaring them.
 */
import { type BadgeSeverity } from './ApexBadge.vue';
type __VLS_Props = {
    value?: string | number;
    severity?: BadgeSeverity;
    size?: 'sm' | 'md' | 'lg' | 'xl' | number;
    dot?: boolean;
    variant?: 'solid' | 'outlined' | 'subtle';
    position?: 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start';
    background?: string;
    color?: string;
    borderColor?: string;
    radius?: string;
    /** Ring separating the badge from a busy host. */
    ring?: boolean;
    ringColor?: string;
};
declare var __VLS_1: {}, __VLS_6: {};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_1) => any;
} & {
    badge?: (props: typeof __VLS_6) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    size: "sm" | "md" | "lg" | "xl" | number;
    position: "top-end" | "top-start" | "bottom-end" | "bottom-start";
    variant: "solid" | "outlined" | "subtle";
    severity: BadgeSeverity;
    ring: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
