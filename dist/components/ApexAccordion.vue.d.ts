import type { ApexContainerProps } from '../types';
export interface AccordionPanel {
    value: string | number;
    header?: string;
    /** Plain text content, when a `content` slot would be overkill. */
    content?: string;
    icon?: string;
    badge?: string | number;
    disabled?: boolean;
    data?: unknown;
}
type __VLS_Props = ApexContainerProps & {
    items?: AccordionPanel[];
    /** The open panel, or panels when `multiple`. Bindable. */
    value?: string | number | Array<string | number> | null;
    multiple?: boolean;
    /** Allow closing the only open panel. */
    collapsible?: boolean;
    /** Render a panel's content only once it has been opened. */
    lazy?: boolean;
    togglePosition?: 'start' | 'end';
    expandIcon?: string;
    collapseIcon?: string;
    /** Separated cards rather than one joined stack. */
    gap?: string;
    bordered?: boolean;
    size?: 'sm' | 'md' | 'lg';
    headerBackground?: string;
    headerColor?: string;
    activeBackground?: string;
    activeColor?: string;
    contentBackground?: string;
    borderColor?: string;
    radius?: string;
};
declare function toggle(panel: AccordionPanel): void;
declare var __VLS_1: {
    panel: AccordionPanel;
    active: boolean;
}, __VLS_9: {
    panel: AccordionPanel;
    active: boolean;
    index: number;
}, __VLS_11: {
    panel: AccordionPanel;
    active: boolean;
    index: number;
}, __VLS_13: {
    panel: AccordionPanel;
    index: number;
};
type __VLS_Slots = {} & {
    toggleicon?: (props: typeof __VLS_1) => any;
} & {
    header?: (props: typeof __VLS_9) => any;
} & {
    content?: (props: typeof __VLS_11) => any;
} & {
    default?: (props: typeof __VLS_13) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    toggle: typeof toggle;
    isOpen: (panel: AccordionPanel) => boolean;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:value": (v: string | number | (string | number)[] | null) => void;
    "panel-open": (panel: AccordionPanel) => void;
    "panel-close": (panel: AccordionPanel) => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onUpdate:value"?: ((v: string | number | (string | number)[] | null) => any) | undefined;
    "onPanel-open"?: ((panel: AccordionPanel) => any) | undefined;
    "onPanel-close"?: ((panel: AccordionPanel) => any) | undefined;
}>, {
    size: "sm" | "md" | "lg";
    bordered: boolean;
    expandIcon: string;
    collapseIcon: string;
    collapsible: boolean;
    togglePosition: "start" | "end";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
