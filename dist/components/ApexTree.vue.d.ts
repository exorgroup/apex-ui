import type { ApexTreeClasses } from '../types';
import { type CheckState, type TreeNode } from '../core/tree';
export type { TreeNode };
type __VLS_Props = {
    /** Your own class on any part. See ApexTreeClasses. */
    ui?: ApexTreeClasses;
    value?: TreeNode[];
    /** Keys mapped to true are expanded. Bindable. */
    expandedKeys?: Record<string, boolean>;
    selectionMode?: 'single' | 'multiple' | 'checkbox' | null;
    /**
     * single/multiple: `{ [key]: true }`.
     * checkbox: `{ [key]: { checked, partialChecked } }`.
     * Bindable.
     */
    selectionKeys?: Record<string, boolean | CheckState>;
    /** Require Cmd/Ctrl to add to a multiple selection. */
    metaKeySelection?: boolean;
    /** Header checkbox that toggles everything. */
    showSelectAll?: boolean;
    filter?: boolean;
    filterBy?: string;
    filterMode?: 'lenient' | 'strict';
    filterPlaceholder?: string;
    lazy?: boolean;
    loading?: boolean;
    loadingMode?: 'overlay' | 'skeleton';
    skeletonRows?: number;
    draggableNodes?: boolean;
    droppableNodes?: boolean;
    /** Only trees sharing a scope can exchange nodes. */
    draggableScope?: string;
    droppableScope?: string;
    scrollHeight?: number;
    indent?: number;
    bordered?: boolean;
    emptyMessage?: string;
    hoverBackground?: string;
    selectedBackground?: string;
    selectedColor?: string;
    iconColor?: string;
    rowRadius?: string;
};
declare function toggle(node: TreeNode): void;
declare function select(node: TreeNode, e?: MouseEvent | KeyboardEvent): void;
declare function focusRow(i: number): void;
declare var __VLS_1: {}, __VLS_15: {
    node: TreeNode;
    expanded: boolean;
}, __VLS_29: {
    node: TreeNode;
    expanded: boolean;
    hasChildren: boolean;
}, __VLS_34: {
    node: TreeNode;
    expanded: boolean;
    index: number;
}, __VLS_36: {
    node: TreeNode;
    index: number;
}, __VLS_38: {}, __VLS_43: {}, __VLS_48: {};
type __VLS_Slots = {} & {
    header?: (props: typeof __VLS_1) => any;
} & {
    nodetoggleicon?: (props: typeof __VLS_15) => any;
} & {
    nodeicon?: (props: typeof __VLS_29) => any;
} & {
    node?: (props: typeof __VLS_34) => any;
} & {
    default?: (props: typeof __VLS_36) => any;
} & {
    empty?: (props: typeof __VLS_38) => any;
} & {
    loading?: (props: typeof __VLS_43) => any;
} & {
    footer?: (props: typeof __VLS_48) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    focusRow: typeof focusRow;
    toggle: typeof toggle;
    select: typeof select;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:value": (v: TreeNode[]) => void;
    "update:expandedKeys": (v: Record<string, boolean>) => void;
    "update:selectionKeys": (v: Record<string, boolean | CheckState>) => void;
    "node-expand": (node: TreeNode) => void;
    "node-collapse": (node: TreeNode) => void;
    "node-select": (node: TreeNode) => void;
    "node-unselect": (node: TreeNode) => void;
    "node-drop": (payload: {
        dragNode: TreeNode;
        dropNode?: TreeNode;
        position: string;
        value: TreeNode[];
    }) => void;
    filter: (payload: {
        value: string;
    }) => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onFilter?: ((payload: {
        value: string;
    }) => any) | undefined;
    "onNode-expand"?: ((node: TreeNode) => any) | undefined;
    "onNode-collapse"?: ((node: TreeNode) => any) | undefined;
    "onUpdate:selectionKeys"?: ((v: Record<string, boolean | CheckState>) => any) | undefined;
    "onNode-select"?: ((node: TreeNode) => any) | undefined;
    "onNode-unselect"?: ((node: TreeNode) => any) | undefined;
    "onUpdate:value"?: ((v: TreeNode[]) => any) | undefined;
    "onUpdate:expandedKeys"?: ((v: Record<string, boolean>) => any) | undefined;
    "onNode-drop"?: ((payload: {
        dragNode: TreeNode;
        dropNode?: TreeNode;
        position: string;
        value: TreeNode[];
    }) => any) | undefined;
}>, {
    selectionMode: "single" | "multiple" | "checkbox" | null;
    indent: number;
    bordered: boolean;
    loadingMode: "overlay" | "skeleton";
    skeletonRows: number;
    filterBy: string;
    filterMode: "lenient" | "strict";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
