import { type MenuItem } from './ApexMenuItem';
import type { ApexSeverity, ApexButtonVariant } from './ApexButton.vue';
import type { ApexSize, ApexButtonAppearance } from '../types';
export type { MenuItem };
type __VLS_Props = ApexButtonAppearance & {
    /** Default action label. */
    label?: string;
    /** Default action icon. */
    icon?: string;
    /** The overlay commands. */
    model?: MenuItem[];
    severity?: ApexSeverity;
    variant?: ApexButtonVariant;
    size?: ApexSize;
    raised?: boolean;
    rounded?: boolean;
    loading?: boolean;
    disabled?: boolean;
    /** Chevron glyph. */
    menuIcon?: string;
    /** Open the overlay to the start edge instead of the end. */
    menuAlign?: 'start' | 'end';
    /** Accessible name for the chevron. */
    menuLabel?: string;
    /** Overlay background, border and corner. */
    menuBackground?: string;
    menuBorderColor?: string;
    menuRadius?: string;
    /** Row text, and the row under the pointer. */
    menuColor?: string;
    menuHoverBackground?: string;
    menuHoverColor?: string;
    /** A row's leading icon, a section header, a trailing hint, a separator. */
    menuIconColor?: string;
    menuHeaderColor?: string;
    menuHintColor?: string;
    menuSeparatorColor?: string;
};
declare var __VLS_7: {};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_7) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    click: (event: MouseEvent) => void;
    "item-click": (payload: {
        item: MenuItem;
        event: MouseEvent;
    }) => void;
    show: () => void;
    hide: () => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onClick?: ((event: MouseEvent) => any) | undefined;
    "onItem-click"?: ((payload: {
        item: MenuItem;
        event: MouseEvent;
    }) => any) | undefined;
    onShow?: (() => any) | undefined;
    onHide?: (() => any) | undefined;
}>, {
    size: ApexSize;
    variant: ApexButtonVariant;
    severity: ApexSeverity;
    menuIcon: string;
    menuAlign: "start" | "end";
    menuLabel: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
