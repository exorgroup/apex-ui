/**
 * ApexCompareItem — one side of the comparison.
 *
 * The `before` side is clipped to the divider; the `after` side simply sits
 * underneath it, so nothing about its layout depends on the position.
 */
import type { ApexMediaProps } from '../types';
type __VLS_Props = ApexMediaProps & {
    position?: 'before' | 'after';
};
declare var __VLS_1: {};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_1) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    position: "before" | "after";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
