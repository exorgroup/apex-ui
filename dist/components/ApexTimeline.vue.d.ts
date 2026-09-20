import type { ApexTimelineClasses } from '../types';
type Event = Record<string, unknown>;
type __VLS_Props = {
    /** Your own class on any part. See ApexTimelineClasses. */
    ui?: ApexTimelineClasses;
    value?: Event[];
    /** Which side the content sits on. `alternate` zig-zags. */
    align?: 'start' | 'end' | 'alternate';
    layout?: 'vertical' | 'horizontal';
    dataKey?: string;
    lineColor?: string;
    lineWidth?: number;
    lineStyle?: 'solid' | 'dashed' | 'dotted';
    markerSize?: number;
    markerColor?: string;
    markerBorderColor?: string;
    markerBorderWidth?: number;
    markerRadius?: string;
    /** Field on each event holding an icon name, drawn inside its marker. */
    iconField?: string;
    /** Field holding a marker colour, so an event can tint its own. */
    colorField?: string;
    gap?: string;
    eventGap?: string;
};
declare var __VLS_1: {
    item: Event;
    index: number;
}, __VLS_3: {
    item: Event;
    index: number;
}, __VLS_8: {
    item: Event;
    index: number;
}, __VLS_10: {
    item: Event;
    index: number;
}, __VLS_12: {
    item: Event;
    index: number;
};
type __VLS_Slots = {} & {
    opposite?: (props: typeof __VLS_1) => any;
} & {
    marker?: (props: typeof __VLS_3) => any;
} & {
    connector?: (props: typeof __VLS_8) => any;
} & {
    content?: (props: typeof __VLS_10) => any;
} & {
    default?: (props: typeof __VLS_12) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    align: "start" | "end" | "alternate";
    layout: "vertical" | "horizontal";
    lineWidth: number;
    lineStyle: "solid" | "dashed" | "dotted";
    markerSize: number;
    markerBorderWidth: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
