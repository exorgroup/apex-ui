import { type SpeedDialDirection, type SpeedDialItem, type SpeedDialType } from '../core/speedDial';
import type { ApexSize, ApexButtonAppearance } from '../types';
export type { SpeedDialItem };
type __VLS_Props = Omit<ApexButtonAppearance, 'radius'> & {
    items?: SpeedDialItem[];
    type?: SpeedDialType;
    direction?: SpeedDialDirection;
    /** Arc radius in pixels — circle, semi-circle and quarter-circle. */
    radius?: number;
    /** Spacing between linear items, in pixels. */
    gap?: number;
    /** Delay between each item's appearance, in milliseconds. */
    transitionDelay?: number;
    /** Trigger icon while closed / open. */
    icon?: string;
    activeIcon?: string;
    severity?: string;
    size?: ApexSize;
    /** Dim the page behind the open items. */
    mask?: boolean;
    /** Mask colour. Any CSS colour. */
    maskColor?: string;
    /** Mask opacity, 0–1. */
    maskOpacity?: number;
    /** Show a label beside each item on hover. */
    tooltip?: boolean;
    /** Open on hover instead of click. */
    hover?: boolean;
    disabled?: boolean;
    /** Accessible name for the trigger. */
    label?: string;
    /** Pin to a viewport corner instead of flowing inline. */
    position?: 'inline' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    /** Action background, text/icon colour, border and corner. */
    actionBackground?: string;
    actionColor?: string;
    actionBorderColor?: string;
    actionRadius?: string;
    /** The action under the pointer. */
    actionHoverColor?: string;
    actionHoverBorderColor?: string;
    /** Diameter of the trigger and, less six pixels, of each action. */
    actionSize?: string;
};
declare function setOpen(v: boolean): void;
declare const _default: import("vue").DefineComponent<__VLS_Props, {
    open: import("vue").Ref<boolean, boolean>;
    setOpen: typeof setOpen;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:open": (v: boolean) => void;
    "item-click": (payload: {
        item: SpeedDialItem;
        index: number;
        event: MouseEvent;
    }) => void;
    show: () => void;
    hide: () => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onUpdate:open"?: ((v: boolean) => any) | undefined;
    "onItem-click"?: ((payload: {
        item: SpeedDialItem;
        index: number;
        event: MouseEvent;
    }) => any) | undefined;
    onShow?: (() => any) | undefined;
    onHide?: (() => any) | undefined;
}>, {
    size: ApexSize;
    type: SpeedDialType;
    radius: number;
    position: "inline" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
    icon: string;
    gap: number;
    severity: string;
    direction: SpeedDialDirection;
    transitionDelay: number;
    activeIcon: string;
    maskColor: string;
    maskOpacity: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
