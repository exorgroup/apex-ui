import { type TreeNode } from './ApexTreeNode';
import type { ApexFieldProps } from '../types';
export type { TreeNode };
type __VLS_Props = ApexFieldProps & {
    /** A node key, or an array of keys once multiple/checkbox is on. */
    modelValue?: string | string[] | null;
    nodes?: TreeNode[];
    placeholder?: string;
    leadingIcon?: string;
    multiple?: boolean;
    /** A checkbox per node; implies multiple and propagates to children. */
    checkbox?: boolean;
    /** Only leaves may be chosen; clicking a branch expands it. */
    leafOnly?: boolean;
    filter?: boolean;
    filterPlaceholder?: string;
    expandAll?: boolean;
    clearable?: boolean;
    /** Show the whole branch in the field. */
    showPath?: boolean;
    pathSeparator?: string;
    scrollHeight?: number;
    maxChips?: number;
    /**
     * Offer an "Add new" row. A tree has no single place to put one, so there is
     * one under each expanded branch and one at the foot for the root — the row
     * sits at its branch's depth, beside the children it would join. The emitted
     * `path` says which branch it came from, so the handler knows where to
     * insert; an empty path means the root.
     */
    addNew?: boolean;
    /** Row text. With a filter query it reads Add "…" instead. */
    addNewLabel?: string;
    /** What is being created, passed to the app-level canCreate resolver. */
    resource?: string;
    /** Overrides the resolver. Set it and no resolver is consulted. */
    canAddNew?: boolean;
    /** A node's row: its text, corner, and the tint under the pointer. */
    nodeColor?: string;
    nodeRadius?: string;
    nodeHoverBackground?: string;
    /** The selected node. Set both — the default foreground is the accent, which
        a strongly coloured background leaves unreadable. */
    nodeSelectedBackground?: string;
    nodeSelectedColor?: string;
    /** The expand/collapse chevron. */
    twistyColor?: string;
    /** How far each level steps in. Any CSS length. */
    indent?: string;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:modelValue": (v: string | string[] | null) => void;
    change: () => void;
    "node-expand": (node: TreeNode) => void;
    "node-collapse": (node: TreeNode) => void;
    "add-new": (payload: {
        query: string;
        path: TreeNode[];
    }) => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onChange?: (() => any) | undefined;
    "onUpdate:modelValue"?: ((v: string | string[] | null) => any) | undefined;
    "onAdd-new"?: ((payload: {
        query: string;
        path: TreeNode[];
    }) => any) | undefined;
    "onNode-expand"?: ((node: TreeNode) => any) | undefined;
    "onNode-collapse"?: ((node: TreeNode) => any) | undefined;
}>, {
    statusIcon: boolean;
    canAddNew: boolean;
    pathSeparator: string;
    scrollHeight: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
