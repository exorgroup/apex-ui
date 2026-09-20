/**
 * ApexSidebarLayout — the shell a sidebar lives in: a row of panels and one
 * content region. Exists so the panels can push the content by ordinary layout
 * rather than by margins the consumer has to keep in step.
 */
type __VLS_Props = {
    /** inset gives the whole shell padding and rounds both panel and content. */
    variant?: 'plain' | 'inset';
    /** Fixed height, for a demo or a fixed app shell; omit to fill the parent. */
    height?: string;
    background?: string;
    radius?: string;
};
declare var __VLS_1: {};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_1) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    variant: "plain" | "inset";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
