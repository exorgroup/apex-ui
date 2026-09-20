import type { ApexSize, ApexButtonAppearance } from '../types';
type __VLS_Props = ApexButtonAppearance & {
    orientation?: 'horizontal' | 'vertical';
    /** Full width, with equal-width buttons. */
    block?: boolean;
    /** Group name. Rendered on the frame unless `hideLabel` is set. */
    label?: string;
    /** Keep `label` as the accessible name without drawing the frame. */
    hideLabel?: boolean;
    /** Sizes every button in the group, overriding each button's own `size`. */
    size?: ApexSize;
    /** Help text under the frame. */
    help?: string;
};
declare var __VLS_1: {}, __VLS_3: {};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_1) => any;
} & {
    default?: (props: typeof __VLS_3) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    orientation: "horizontal" | "vertical";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
