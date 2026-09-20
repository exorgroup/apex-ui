import { type OrgNode } from './ApexOrgNode.vue';
import type { ApexOrgChartClasses } from '../types';
export type { OrgNode };
type __VLS_Props = {
    /** Your own class on any part. See ApexOrgChartClasses. */
    ui?: ApexOrgChartClasses;
    /** One root, or several. */
    value?: OrgNode | OrgNode[];
    /** Show a collapse control on every node with children. */
    collapsible?: boolean;
    /** Keys mapped to true are collapsed. Bindable. */
    collapsedKeys?: Record<string, boolean>;
    selectionMode?: 'single' | 'multiple' | 'checkbox' | null;
    /** Keys mapped to true are selected. Bindable. */
    selectionKeys?: Record<string, boolean>;
    /** Lay the chart out left-to-right instead of top-down. */
    orientation?: 'vertical' | 'horizontal';
    /** Connector colour and thickness. */
    lineColor?: string;
    lineWidth?: number;
    nodeBackground?: string;
    nodeColor?: string;
    nodeBorderColor?: string;
    nodeBorderWidth?: number;
    nodeRadius?: string;
    /** The selected and partially-selected states. */
    selectedBackground?: string;
    selectedColor?: string;
    selectedBorderColor?: string;
    partialBorderColor?: string;
    /**
     * Gap between siblings, and between levels. Left unset, each orientation uses
     * its own default — a horizontal chart needs a wider level gap, because that gap
     * has to hold the connector AND the collapse control side by side.
     */
    nodeGap?: string;
    levelGap?: string;
};
declare var __VLS_9: any, __VLS_11: any;
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_9) => any;
} & {
    toggleicon?: (props: typeof __VLS_11) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:collapsedKeys": (v: Record<string, boolean>) => void;
    "update:selectionKeys": (v: Record<string, boolean>) => void;
    "node-expand": (node: OrgNode) => void;
    "node-collapse": (node: OrgNode) => void;
    "node-select": (node: OrgNode) => void;
    "node-unselect": (node: OrgNode) => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onNode-expand"?: ((node: OrgNode) => any) | undefined;
    "onNode-collapse"?: ((node: OrgNode) => any) | undefined;
    "onUpdate:collapsedKeys"?: ((v: Record<string, boolean>) => any) | undefined;
    "onUpdate:selectionKeys"?: ((v: Record<string, boolean>) => any) | undefined;
    "onNode-select"?: ((node: OrgNode) => any) | undefined;
    "onNode-unselect"?: ((node: OrgNode) => any) | undefined;
}>, {
    selectionMode: "single" | "multiple" | "checkbox" | null;
    orientation: "vertical" | "horizontal";
    collapsible: boolean;
    lineWidth: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
