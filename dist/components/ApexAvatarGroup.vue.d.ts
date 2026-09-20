export interface AvatarPerson {
    label?: string;
    image?: string;
    initials?: string;
    icon?: string;
    status?: string;
}
type __VLS_Props = {
    people?: AvatarPerson[];
    /** Show at most this many, then a +N counter. */
    max?: number;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    shape?: 'circle' | 'rounded' | 'square';
    /** How much each avatar overlaps the one before it. Defaults to a share of the size. */
    overlap?: string;
    autoColor?: boolean;
    ring?: boolean;
    ringColor?: string;
};
declare var __VLS_1: {};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_1) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    size: "xs" | "sm" | "md" | "lg" | "xl" | number;
    shape: "circle" | "rounded" | "square";
    ring: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
