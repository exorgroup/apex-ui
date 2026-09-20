import type { ApexMediaProps } from '../types';
export interface GalleryImage {
    src?: string;
    thumbnail?: string;
    alt?: string;
    /** Overrides the filename the download is saved under. */
    filename?: string;
    /** A CSS background, for a placeholder standing in for artwork. */
    background?: string;
    caption?: string;
}
export type GalleryAction = 'rotate-left' | 'rotate-right' | 'zoom-in' | 'zoom-out' | 'zoom-reset' | 'flip-h' | 'flip-v' | 'download' | 'fullscreen' | 'close';
type __VLS_Props = ApexMediaProps & {
    images?: GalleryImage[];
    /** v-model — the active index. */
    modelValue?: number;
    /** v-model:open — only meaningful with overlay. */
    open?: boolean;
    /** Render as a full-screen overlay instead of in the page. */
    overlay?: boolean;
    /** Which toolbar buttons appear, in this order. */
    actions?: GalleryAction[];
    /**
     * Per-button switches. Each overrides `actions` for that one button —
     * undefined leaves the array in charge, so the two can be mixed.
     */
    rotateLeft?: boolean;
    rotateRight?: boolean;
    zoomIn?: boolean;
    zoomOut?: boolean;
    zoomReset?: boolean;
    flipHorizontal?: boolean;
    flipVertical?: boolean;
    downloadable?: boolean;
    fullscreen?: boolean;
    closable?: boolean;
    /** Reveal the toolbar only while the stage is hovered. */
    hoverToolbar?: boolean;
    showNav?: boolean;
    /** Show the arrows only on hover. */
    hoverNav?: boolean;
    showThumbnails?: boolean;
    thumbnailsPosition?: 'bottom' | 'top';
    showCounter?: boolean;
    /** Wrap past the ends. */
    loop?: boolean;
    zoomStep?: number;
    maxZoom?: number;
    width?: string;
    height?: string;
    aspectRatio?: string;
    radius?: string;
    stageBackground?: string;
    padding?: string;
    toolbarBackground?: string;
    toolbarColor?: string;
    toolbarRadius?: string;
    toolbarPosition?: 'top' | 'bottom';
    navBackground?: string;
    navColor?: string;
    navSize?: string;
    navRadius?: string;
    thumbSize?: string;
    thumbGap?: string;
    thumbRadius?: string;
    thumbActiveColor?: string;
    thumbInactiveOpacity?: number;
};
declare function reset(): void;
declare function go(i: number): void;
declare function act(a: GalleryAction): void;
declare var __VLS_10: {
    act: typeof act;
}, __VLS_15: {
    style: {
        transform: string;
    };
    image: GalleryImage;
    index: number;
};
type __VLS_Slots = {} & {
    toolbar?: (props: typeof __VLS_10) => any;
} & {
    image?: (props: typeof __VLS_15) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    act: typeof act;
    go: typeof go;
    reset: typeof reset;
    zoom: import("vue").Ref<number, number>;
    rotation: import("vue").Ref<number, number>;
    fullscreen: import("vue").Ref<boolean, boolean>;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    change: (v: number) => any;
    "update:modelValue": (v: number) => any;
    "update:open": (v: boolean) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onChange?: ((v: number) => any) | undefined;
    "onUpdate:modelValue"?: ((v: number) => any) | undefined;
    "onUpdate:open"?: ((v: boolean) => any) | undefined;
}>, {
    radius: string;
    modelValue: number;
    open: boolean;
    fullscreen: boolean;
    actions: GalleryAction[];
    closable: boolean;
    showNav: boolean;
    zoomIn: boolean;
    zoomOut: boolean;
    rotateLeft: boolean;
    rotateRight: boolean;
    zoomReset: boolean;
    flipHorizontal: boolean;
    flipVertical: boolean;
    downloadable: boolean;
    showThumbnails: boolean;
    thumbnailsPosition: "bottom" | "top";
    showCounter: boolean;
    zoomStep: number;
    maxZoom: number;
    toolbarPosition: "top" | "bottom";
    thumbSize: string;
    thumbGap: string;
    thumbInactiveOpacity: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
