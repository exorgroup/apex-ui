export interface MeterItem {
    label?: string;
    value: number;
    color?: string;
    icon?: string;
}
type __VLS_Props = {
    value?: MeterItem[];
    min?: number;
    max?: number;
    orientation?: 'horizontal' | 'vertical';
    /** Where the labels sit relative to the track. */
    labelPosition?: 'start' | 'end';
    labelOrientation?: 'horizontal' | 'vertical';
    /** Hide the labels entirely. */
    showLabels?: boolean;
    /** Show each item's percentage after its label. */
    showValues?: boolean;
    /** Icons next to the labels instead of the default marker. */
    showMarkers?: boolean;
    size?: string;
    length?: string;
    radius?: string;
    /** Round each segment separately, so the meters read as separate quantities. */
    segmentRadius?: string;
    gap?: string;
    trackBackground?: string;
    labelColor?: string;
    labelSize?: string;
    /** Lift a segment and dim the rest on hover. */
    hoverable?: boolean;
    /** Animate segments from zero on mount. */
    animated?: boolean;
};
type __VLS_Slots = {
    start?: (props: {
        total: number;
    }) => unknown;
    end?: (props: {
        total: number;
    }) => unknown;
    label?: (props: {
        items: MeterItem[];
        total: number;
    }) => unknown;
    meter?: (props: {
        item: MeterItem;
        index: number;
        percent: number;
        color: string;
    }) => unknown;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    "item-click": (payload: {
        item: MeterItem;
        index: number;
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onItem-click"?: ((payload: {
        item: MeterItem;
        index: number;
    }) => any) | undefined;
}>, {
    min: number;
    max: number;
    orientation: "horizontal" | "vertical";
    labelPosition: "start" | "end";
    labelOrientation: "horizontal" | "vertical";
    showLabels: boolean;
    showValues: boolean;
    showMarkers: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
