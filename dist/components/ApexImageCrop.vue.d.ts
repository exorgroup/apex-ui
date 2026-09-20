type Rect = {
    x: number;
    y: number;
    w: number;
    h: number;
};
type WarningCode = 'below-target' | 'source-below-target';
type __VLS_Props = {
    /** The image to crop: a File from an input, a Blob, or a URL. */
    src?: File | Blob | string | null;
    /** Output size in pixels. Omit for "resize only, keep the whole image". */
    target?: {
        width: number;
        height: number;
    } | null;
    /** `auto` centres the box; `manual` leaves the operator to place it. */
    mode?: 'auto' | 'manual';
    /** Fix the box to the target's ratio. Meaningless without a target. */
    lockRatio?: boolean;
    /** Encoder. WebP unless a caller has a reason. */
    type?: string;
    quality?: number;
    /** Longest edge when there is no target, so "no crop" still means "not 6500px". */
    maxDim?: number | null;
    /** Hide the built-in bar when a host draws its own controls. */
    showControls?: boolean;
    /** How tall the working area may grow. */
    maxHeight?: number;
    background?: string;
    /** The dimmed area outside the box. */
    scrimColor?: string;
    handleColor?: string;
};
declare function reset(): void;
declare function auto(): void;
declare function render(): Promise<{
    blob: Blob;
    rect: Rect;
    width: number;
    height: number;
}>;
declare const _default: import("vue").DefineComponent<__VLS_Props, {
    render: typeof render;
    auto: typeof auto;
    reset: typeof reset;
    rect: import("vue").Ref<{
        x: number;
        y: number;
        w: number;
        h: number;
    }, Rect | {
        x: number;
        y: number;
        w: number;
        h: number;
    }>;
    natural: import("vue").Ref<{
        width: number;
        height: number;
    }, {
        width: number;
        height: number;
    } | {
        width: number;
        height: number;
    }>;
    output: import("vue").ComputedRef<{
        width: number;
        height: number;
    }>;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    warning: (v: {
        code: WarningCode;
        message: string;
    }) => any;
    error: (v: {
        message: string;
    }) => any;
    ready: (v: {
        width: number;
        height: number;
    }) => any;
    "update:rect": (v: Rect) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onWarning?: ((v: {
        code: WarningCode;
        message: string;
    }) => any) | undefined;
    onError?: ((v: {
        message: string;
    }) => any) | undefined;
    onReady?: ((v: {
        width: number;
        height: number;
    }) => any) | undefined;
    "onUpdate:rect"?: ((v: Rect) => any) | undefined;
}>, {
    type: string;
    target: {
        width: number;
        height: number;
    } | null;
    src: File | Blob | string | null;
    maxHeight: number;
    mode: "auto" | "manual";
    showControls: boolean;
    lockRatio: boolean;
    quality: number;
    maxDim: number | null;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
