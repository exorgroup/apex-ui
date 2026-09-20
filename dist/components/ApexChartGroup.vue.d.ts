import { type ZoomWindow } from '../core/chart/viewport';
type __VLS_Props = {
    /** Share the visible x window across the group. */
    zoom?: boolean;
    /** Share the crosshair, so every chart reads the same moment. */
    crosshair?: boolean;
    /** Share legend visibility, so one legend drives every chart. */
    legend?: boolean;
    syncY?: boolean;
};
declare var __VLS_1: {};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_1) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    state: import("..").ChartGroupState;
    zoomTo: (range: ZoomWindow | null) => void;
    resetZoom: () => void;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    "zoom-change": (payload: {
        range: ZoomWindow | null;
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onZoom-change"?: ((payload: {
        range: ZoomWindow | null;
    }) => any) | undefined;
}>, {
    legend: boolean;
    zoom: boolean;
    crosshair: boolean;
    syncY: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
