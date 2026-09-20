import type { ApexOrgChartClasses } from '../types';
export interface OrgNode {
    key: string;
    label?: string;
    subtitle?: string;
    icon?: string;
    image?: string;
    /** Marks a node for your own styling, e.g. 'department'. */
    type?: string;
    /** Colours for this node alone, overriding the chart's. */
    background?: string;
    color?: string;
    borderColor?: string;
    styleClass?: string;
    selectable?: boolean;
    data?: Record<string, unknown>;
    children?: OrgNode[];
}
type __VLS_Props = {
    /** Your own class on any part. See ApexOrgChartClasses. */
    ui?: ApexOrgChartClasses;
    node: OrgNode;
    collapsible: boolean;
    isCollapsed: (key: string) => boolean;
    selectionMode: 'single' | 'multiple' | 'checkbox' | null;
    selectState: (node: OrgNode) => 'on' | 'off' | 'partial';
};
declare var __VLS_1: {
    node: OrgNode;
    selected: boolean;
    partialSelected: boolean;
    collapsed: boolean;
}, __VLS_12: {
    collapsed: boolean;
}, __VLS_26: any, __VLS_28: any;
type __VLS_Slots = {} & {
    node?: (props: typeof __VLS_1) => any;
} & {
    toggleicon?: (props: typeof __VLS_12) => any;
} & {
    node?: (props: typeof __VLS_26) => any;
} & {
    toggleicon?: (props: typeof __VLS_28) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    select: (node: OrgNode) => void;
    toggle: (node: OrgNode) => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onSelect?: ((node: OrgNode) => any) | undefined;
    onToggle?: ((node: OrgNode) => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
